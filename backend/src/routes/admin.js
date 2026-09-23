import { Router } from 'express';
import { Comment, Group, Institution, Post, Report, User } from '../models.js';
import { publicUser, serializeComment, serializePost, addNotification } from '../store.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forbidden, notFound } from '../utils/httpError.js';
import { nigerianInstitutions } from '../data/nigerianInstitutions.js';
import { isAdminEmail } from '../config/admins.js';
import { resolveInstitutionSelection } from '../utils/institutionScope.js';

export const adminRouter = Router();

adminRouter.get('/identities', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { StudentIdentity, User, Institution } = await import('../models.js');
  const identities = await StudentIdentity.find({ $or: [{ status: 'PENDING' }, { status: 'VERIFIED', needs_audit: true }] }).sort({ created_at: -1 }).lean();
  
  const userIds = identities.map(i => i.user_id);
  const instIds = identities.map(i => i.institution_id);
  
  const [users, institutions] = await Promise.all([
    User.find({ id: { $in: userIds } }).lean(),
    Institution.find({ id: { $in: instIds } }).lean()
  ]);
  
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const instMap = Object.fromEntries(institutions.map(i => [i.id, i.name]));
  
  res.json(identities.map(i => ({
    ...i,
    user: userMap[i.user_id] ? { id: userMap[i.user_id].id, username: userMap[i.user_id].username, email: userMap[i.user_id].email, full_name: userMap[i.user_id].profile?.full_name } : null,
    institution_name: instMap[i.institution_id] || 'Unknown'
  })));
}));

adminRouter.post('/identities/:id/:action', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { StudentIdentity, User } = await import('../models.js');
  const { id, action } = req.params;
  
  if (!['approve', 'reject'].includes(action)) {
    throw new (await import('../utils/httpError.js')).HttpError(400, 'Invalid action.');
  }
  
  const identity = await StudentIdentity.findOne({ id });
  if (!identity) throw new (await import('../utils/httpError.js')).HttpError(404, 'Identity not found.');
  
  if (action === 'approve') {
    identity.status = 'VERIFIED';
      identity.needs_audit = false;
      identity.verified_at = new Date();
    await identity.save();
    
    // Also update the user's active campus if they don't have one
    const user = await User.findOne({ id: identity.user_id });
    if (user && !user.active_identity_id) {
      user.active_identity_id = identity.id;
      user.institution_id = identity.institution_id;
      await user.save();
    }
  } else {
      identity.status = 'REJECTED';
      identity.needs_audit = false;
      identity.rejection_reason = req.body.reason || 'Your identity verification was rejected. Please submit valid documentation.';
      await identity.save();
    }
  
  res.json({ status: 'ok', identity });
}));


adminRouter.get('/appeals', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { User } = await import('../models.js');
    const appeals = await User.find({ appeal_status: { $in: ['pending', 'resolved', 'rejected'] } }).sort({ updated_at: -1 });
    
    res.json(appeals.map(u => ({
        id: u.id,
        user: {
            username: u.username,
            full_name: u.profile?.full_name,
            email: u.email,
            profile_picture: u.profile?.avatar_url
        },
        created_at: u.updated_at || u.created_at,
        status: u.appeal_status,
        suspension_reason: u.suspension_reason,
        appeal_text: u.appeal_text
    })));
}));

adminRouter.post('/appeals/:id/resolve', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { User } = await import('../models.js');
    const { status } = req.body;
    const user = await User.findOne({ id: req.params.id });
    if (!user) throw new Error('User not found');
    
    if (status === 'resolved' || status === 'approved') {
        user.is_active = true;
        user.appeal_status = 'resolved';
    } else {
        user.appeal_status = 'rejected';
    }
    
    await user.save();
    res.json({ success: true });
}));


adminRouter.use(requireAuth, requireAdmin);

adminRouter.post(
  '/switch-campus',
  asyncHandler(async (req, res) => {
    const { institution_id } = req.body;
    if (!institution_id) throw notFound('Institution ID is required.');
    const resolved = await resolveInstitutionSelection({ institutionId: institution_id });
    if (!resolved) throw notFound('Institution not found.');
    req.user.institution_id = resolved.id;
    req.user.profile.university = resolved.name;
    await req.user.save();
    res.json({ status: 'ok', institution: resolved });
  }),
);

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [users, total_posts, total_groups, pending_reports, postsByInstitution, groupsByInstitution, institutions] = await Promise.all([
      User.find().select('institution_id profile.university').lean(),
      Post.countDocuments({ group_id: null, is_taken_down: { $ne: true } }),
      Group.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Post.aggregate([{ $match: { group_id: null, is_taken_down: { $ne: true } } }, { $group: { _id: '$institution_id', count: { $sum: 1 } } }]),
      Group.aggregate([{ $group: { _id: '$institution_id', count: { $sum: 1 } } }]),
      Institution.find().lean(),
    ]);
    const institutionNames = new Map([
      ...nigerianInstitutions.map((institution) => [institution.id, institution.name]),
      ...institutions.map((institution) => [institution.id, institution.name]),
    ]);
    const rows = new Map();
    const ensureRow = (institutionId, fallbackName = '') => {
      const key = institutionId || 'unassigned';
      if (!rows.has(key)) {
        rows.set(key, {
          institution_id: institutionId || null,
          name: institutionId ? institutionNames.get(institutionId) || fallbackName || institutionId : 'Unassigned / legacy accounts',
          selected: Boolean(institutionId),
          users: 0,
          posts: 0,
          groups: 0,
        });
      }
      return rows.get(key);
    };
    const legacyNames = Array.from(new Set(users
      .filter((user) => !user.institution_id && user.profile?.university)
      .map((user) => user.profile.university)));
    const resolvedLegacyNames = new Map();
    await Promise.all(legacyNames.map(async (name) => {
      const resolved = await resolveInstitutionSelection({ institutionName: name });
      if (resolved) resolvedLegacyNames.set(name, resolved);
    }));
    users.forEach((user) => {
      const resolved = user.institution_id
        ? { id: user.institution_id, name: institutionNames.get(user.institution_id) }
        : resolvedLegacyNames.get(user.profile?.university);
      ensureRow(resolved?.id || null, resolved?.name).users += 1;
    });
    postsByInstitution.forEach((item) => { ensureRow(item._id).posts = item.count; });
    groupsByInstitution.forEach((item) => { ensureRow(item._id).groups = item.count; });
    const by_institution = Array.from(rows.values()).sort((a, b) => b.users - a.users || a.name.localeCompare(b.name));
    res.json({
      total_users: users.length,
      total_posts,
      total_groups,
      pending_reports,
      by_institution,
      selected_institutions: by_institution.filter((row) => row.selected),
      legacy_institutions: by_institution.filter((row) => !row.selected),
    });
  }),
);

adminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ created_at: -1 }).skip(Number(req.query.skip || 0)).limit(Number(req.query.limit || 100));
    res.json(await Promise.all(users.map((user) => publicUser(user, req.user.id))));
  }),
);

adminRouter.put(
  '/users/:id/role',
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if (!user) throw notFound('User not found.');
    
    const SUPER_ADMIN = 'ezeilodavid292@gmail.com';
    const newRole = req.query.role || req.body.role || user.role;

    // ── ABSOLUTE SUPER ADMIN PROTECTION ──
    // The Super Admin account is immutable. No one — not even themselves — can
    // downgrade, revoke, or modify the Super Admin role. Period.
    if (user.email === SUPER_ADMIN) {
      if (newRole !== 'admin') {
        throw forbidden('The Super Admin role is permanently locked and cannot be changed.');
      }
      // Even if they're setting it to 'admin' (no-op), just return early
      return res.json(await publicUser(user, req.user.id));
    }

    // Only Super Admin can revoke or modify other admins
    if (user.role === 'admin' && req.user.email !== SUPER_ADMIN && user.email !== req.user.email) {
      throw forbidden('Only the Super Admin can revoke or modify other admins.');
    }

    // Only Super Admin can promote users to Admin
    if (newRole === 'admin' && req.user.email !== SUPER_ADMIN) {
      throw forbidden('Only the Super Admin can promote users to Admin.');
    }
    
    user.role = newRole;
    await user.save();
    res.json(await publicUser(user, req.user.id));
  }),
);


adminRouter.post(
  '/users/:id/toggle-active',
  asyncHandler(async (req, res) => {
    const user = (await import('../models.js')).User;
    const target = await user.findOne({ id: req.params.id });
    if (!target) throw notFound('User not found.');
    
    const SUPER_ADMIN = 'ezeilodavid292@gmail.com';
    if (target.email === SUPER_ADMIN) { throw forbidden('The Super Admin cannot be suspended.'); }
    if (target.role === 'admin' && req.user.email !== SUPER_ADMIN) {
      throw forbidden('Only the Super Admin can suspend other admins.');
    }
    
    target.is_active = !target.is_active;
    if (!target.is_active) {
        target.suspension_reason = req.body.reason || 'Violation of community guidelines.';
    } else {
        target.suspension_reason = null;
        target.appeal_status = 'none';
        target.appeal_text = null;
    }
    
    await target.save();
    res.json({ status: 'ok', is_active: target.is_active });
  }),
);


adminRouter.get(
  '/reports/',
  asyncHandler(async (req, res) => {
    const reports = await Report.find().sort({ created_at: -1 });
    res.json(
      await Promise.all(
        reports.map(async (reportDoc) => {
          const report = reportDoc.toObject();
          delete report._id;
          const [post, comment] = await Promise.all([
            report.post_id ? Post.findOne({ id: report.post_id }) : null,
            report.comment_id ? Comment.findOne({ id: report.comment_id }) : null,
          ]);
          return {
            ...report,
            user: await publicUser(report.user_id, req.user.id),
            post: post ? await serializePost(post, req.user.id) : null,
            comment: comment ? await serializeComment(comment, req.user.id) : null,
          };
        }),
      ),
    );
  }),
);

adminRouter.post(
  '/reports/:id/resolve',
  asyncHandler(async (req, res) => {
    const report = await Report.findOne({ id: req.params.id });
    if (!report) throw notFound('Report not found.');
    report.status = req.query.status || req.body.status || 'resolved';
    
    if (report.status === 'resolved' && report.post_id) {
        const post = await Post.findOne({ id: report.post_id });
        if (post) {
            post.is_taken_down = true;
            post.take_down_reason = req.body.take_down_reason || 'Violation of community guidelines.';
            await post.save();
            
            // Notify the creator
            await addNotification({
                user_id: post.user_id,
                type: 'post_takedown',
                message: `Your post was taken down by an admin. Reason: ${post.take_down_reason}`,
                sender_id: req.user.id
            });
        }
    }
    
    await report.save();
    res.json(report.toObject());
  }),
);



adminRouter.post(
  '/institutions',
  asyncHandler(async (req, res) => {
    const { name, slug, location, status } = req.body;
    if (!name || !slug) throw notFound('Name and slug are required.');
    const Institution = (await import('../models.js')).Institution;
    const existing = await Institution.findOne({ slug });
    if (existing) {
        return res.status(400).json({ error: 'Campus with this slug already exists.' });
    }
    const inst = new Institution({ name, slug, location, status });
    await inst.save();
    res.json(inst);
  }),
);

adminRouter.put(
  '/institutions/:id',
  asyncHandler(async (req, res) => {
    const { name, slug, location, status } = req.body;
    const Institution = (await import('../models.js')).Institution;
    const inst = await Institution.findOne({ id: req.params.id }) || await Institution.findOne({ slug: req.params.id });
    if (!inst) throw notFound('Institution not found.');
    if (name) inst.name = name;
    if (slug) inst.slug = slug;
    if (location) inst.location = location;
    if (status) inst.status = status;
    await inst.save();
    res.json(inst);
  }),
);

adminRouter.post(
  '/broadcast',
  asyncHandler(async (req, res) => {
    const { title, message, audience, institution_id } = req.body;
    if (!title || !message) throw notFound('Title and message are required.');

    let query = {};
    if (audience === 'campus' && institution_id) {
      query = { institution_id };
    }

    const users = await User.find(query).select('id').lean();

    await Promise.all(users.map((user) => addNotification({
      user_id: user.id,
      sender_id: 'system',
      type: 'broadcast',
      message: `${title}: ${message}`,
    })));

    res.json({ status: 'ok', sent_count: users.length });
  })
);
