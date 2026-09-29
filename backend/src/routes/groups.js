import { Router } from 'express';
import { Group, GroupMember, GroupRequest, Post, User, Conversation, Message } from '../models.js';
import { addNotification, publicUser, serializeGroup, serializePost } from '../store.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forbidden, notFound } from '../utils/httpError.js';
import { institutionScopedQuery, userInstitutionId, assertSameInstitution } from '../utils/institutionScope.js';

async function createGroupSystemMessage(groupId, caption) {
  try {
    let conv = await Conversation.findOne({ group_id: groupId });
    if (!conv) {
      const grp = await Group.findOne({ id: groupId });
      if (!grp) return;
      const members = await GroupMember.find({ group_id: grp.id });
      conv = await Conversation.create({
        name: grp.name,
        group_id: grp.id,
        participant_ids: members.map(m => m.user_id),
        participant_key: 'group_' + grp.id
      });
    }
    await Message.create({
      conversation_id: conv.id,
      sender_id: 'system',
      content: caption
    });
  } catch (e) {
    console.error("Failed to create system message:", e);
  }
}

export const groupsRouter = Router();

groupsRouter.delete(
  '/events/:eventId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { GroupEvent } = await import('../models.js');
    const event = await GroupEvent.findOne({ id: req.params.eventId });
    if (!event) throw notFound('Event not found');
    
    if (!(await canManage(event.group_id, req.user))) {
      throw forbidden('Only admins can delete events.');
    }
    
    await GroupEvent.deleteOne({ id: req.params.eventId });
    res.json({ success: true });
  })
);


groupsRouter.get(
  '/:id/events',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { GroupEvent } = await import('../models.js');
    const events = await GroupEvent.find({ group_id: req.params.id }).sort({ start_time: 1 });
    res.json(events.map(e => {
      const obj = e.toObject();
      return {
        id: obj.id,
        groupId: obj.group_id,
        creatorId: obj.creator_id,
        title: obj.title,
        description: obj.description,
        location: obj.location,
        startTime: obj.start_time,
        endTime: obj.end_time,
        coverImage: obj.cover_image,
        attendees: obj.attendees || [],
        isAttending: (obj.attendees || []).includes(req.user.id)
      };
    }));
  })
);

groupsRouter.post(
  '/:id/events',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { GroupEvent } = await import('../models.js');
    if (!(await canManage(req.params.id, req.user))) {
      throw forbidden('Only admins can create events.');
    }
    const event = await GroupEvent.create({
      group_id: req.params.id,
      creator_id: req.user.id,
      title: req.body.title,
      description: req.body.description || '',
      location: req.body.location || '',
      start_time: req.body.startTime,
      end_time: req.body.endTime || null,
      attendees: [req.user.id]
    });

      // Notify all group members about the new event
      try {
        const members = await GroupMember.find({ group_id: req.params.id });
        await Promise.all(members.filter(m => String(m.user_id) !== String(req.user.id)).map(m => 
          addNotification({
            user_id: m.user_id,
            sender_id: req.user.id,
            type: 'group_event',
            group_id: req.params.id,
            message: `created a new event: "${event.title}"`
          })
        ));
      } catch (err) {
        console.error('Error sending event notifications', err);
      }

    res.status(201).json({ id: event.id });
  })
);

groupsRouter.post(
  '/events/:eventId/rsvp',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { GroupEvent } = await import('../models.js');
    const event = await GroupEvent.findOne({ id: req.params.eventId });
    if (!event) throw notFound('Event not found');
    
    let attendees = event.attendees || [];
    if (req.body.status === 'going') {
      if (!attendees.includes(req.user.id)) attendees.push(req.user.id);
    } else {
      attendees = attendees.filter(id => String(id) !== String(req.user.id));
    }
    event.attendees = attendees;
    await event.save();

    // Notify the creator if someone RSVP'd going
    if (req.body.status === 'going' && String(event.creator_id) !== String(req.user.id)) {
      try {
        const goingCount = event.attendees.length;
        await addNotification({
          user_id: event.creator_id,
          sender_id: req.user.id,
          type: 'group_event_rsvp',
          group_id: event.group_id,
          message: `RSVP'd going to "${event.title}". ${goingCount} people are now attending!`
        });
      } catch (err) {
        // ignore notification errors
      }
    }

    res.json({ success: true, attendees: event.attendees });
  })
);


const member = (groupId, userId) => GroupMember.findOne({ group_id: groupId, user_id: userId });
const canManage = async (groupId, user) => ['admin', 'moderator'].includes(user.role) || ['admin', 'moderator'].includes((await member(groupId, user.id))?.role);

groupsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = req.query.scope === 'global' 
      ? { is_active: true }
      : institutionScopedQuery(req.user, { is_active: true });
    const groups = await Group.find(query).sort({ created_at: -1 });
    res.json(await Promise.all(groups.map((group) => serializeGroup(group, req.user.id))));
  }),
);

groupsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.create({
      name: req.body.name,
      description: req.body.description || '',
      privacy: req.body.privacy || 'public',
      category: req.body.category || 'Other',
      cover_image: req.body.cover_image || null,
      creator_id: req.user.id,
      institution_id: userInstitutionId(req.user),
    });
    await GroupMember.create({ group_id: group.id, user_id: req.user.id, role: 'admin' });
    res.status(201).json(await serializeGroup(group, req.user.id));
  }),
);

groupsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Group not found.');
    assertSameInstitution(group, req.user, 'Circle');
    res.json(await serializeGroup(group, req.user.id));
  }),
);

groupsRouter.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Group not found.');
    assertSameInstitution(group, req.user, 'Circle');
    if (!(await canManage(group.id, req.user))) throw forbidden('You cannot update this group.');
    
    const prevName = group.name;
    const prevCover = group.cover_image;

    group.name = req.body.name ?? group.name;
    group.description = req.body.description ?? group.description;
    group.privacy = req.body.privacy ?? group.privacy;
    group.category = req.body.category ?? group.category;
    if (req.body.admins_only_chat !== undefined) {
      group.admins_only_chat = req.body.admins_only_chat;
    }
    group.cover_image = req.query.cover_image || req.body.cover_image || group.cover_image;
    await group.save();

    const actorName = req.user.profile?.full_name || req.user.username;
    
    if (group.name !== prevName) {
      await createGroupSystemMessage(group.id, `${actorName} changed the group subject to "${group.name}"`);
    }

    if (group.cover_image !== prevCover) {
      await createGroupSystemMessage(group.id, `${actorName} changed this group's icon`);
    }

    res.json(await serializeGroup(group, req.user.id));
  }),
);

groupsRouter.post(
  '/:id/join',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Group not found.');
    assertSameInstitution(group, req.user, 'Circle');
    if (await member(group.id, req.user.id)) return res.json({ status: 'joined' });
    if (group.privacy === 'private') {
      const request = await GroupRequest.create({ group_id: group.id, user_id: req.user.id, status: 'pending', message: req.body.message || '' });
      await addNotification({ user_id: group.creator_id, sender_id: req.user.id, type: 'group_request', group_id: group.id, message: req.body.message || null });
      return res.json({ status: 'requested', request: request.toObject() });
    }
    await GroupMember.create({ group_id: group.id, user_id: req.user.id, role: 'member' });
    
    const userName = req.user.profile?.full_name || req.user.username;
    await createGroupSystemMessage(group.id, `${userName} joined the circle`);

    // Also add user to group conversation participants
    const conv = await Conversation.findOne({ group_id: group.id });
    if (conv && !conv.participant_ids.includes(req.user.id)) {
      conv.participant_ids.push(req.user.id);
      await conv.save();
    }

    return res.json({ status: 'joined' });
  }),
);

groupsRouter.get(
  '/:id/chat',
  requireAuth,
  asyncHandler(async (req, res) => {
    let conv = await Conversation.findOne({ group_id: req.params.id });
    if (!conv) {
      const group = await Group.findOne({ id: req.params.id });
      if (!group) throw notFound('Group not found');
      const members = await GroupMember.find({ group_id: group.id });
      const participantIds = members.map(m => m.user_id);
      conv = await Conversation.create({
        name: group.name,
        group_id: group.id,
        participant_ids: participantIds,
        participant_key: 'group_' + group.id
      });
    } else {
      const isMember = await GroupMember.exists({ group_id: req.params.id, user_id: req.user.id });
      if (isMember && !conv.participant_ids.includes(req.user.id)) {
        conv.participant_ids.push(req.user.id);
        await conv.save();
      }
    }
    res.json({ conversation_id: conv.id });
  })
);

groupsRouter.get(
  '/:id/members/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const members = await GroupMember.find({ group_id: req.params.id });
    res.json(await Promise.all(members.map(async (item) => ({ ...item.toObject(), user: await publicUser(item.user_id, req.user.id) }))));
  }),
);

groupsRouter.get(
  '/:id/requests/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!(await canManage(req.params.id, req.user))) return res.json([]);
    const requests = await GroupRequest.find({ group_id: req.params.id, status: 'pending' });
    res.json(await Promise.all(requests.map(async (item) => ({ ...item.toObject(), user: await publicUser(item.user_id, req.user.id) }))));
  }),
);

groupsRouter.post(
  '/requests/:requestId/approve',
  requireAuth,
  asyncHandler(async (req, res) => {
    const request = await GroupRequest.findOne({ id: req.params.requestId });
    if (!request) throw notFound('Request not found.');
    if (!(await canManage(request.group_id, req.user))) throw forbidden('You cannot approve this request.');
    request.status = req.query.status || 'accepted';
    await request.save();
    if (request.status === 'accepted') {
      await GroupMember.updateOne({ group_id: request.group_id, user_id: request.user_id }, { $setOnInsert: { group_id: request.group_id, user_id: request.user_id, role: 'member' } }, { upsert: true });
      
      const targetUser = await User.findOne({ id: request.user_id });
      if (targetUser) {
        const userName = targetUser.profile?.full_name || targetUser.username;
        await createGroupSystemMessage(request.group_id, `${userName} joined the circle`);
      }

      // Add accepted user to group conversation
      const conv = await Conversation.findOne({ group_id: request.group_id });
      if (conv && !conv.participant_ids.includes(request.user_id)) {
        conv.participant_ids.push(request.user_id);
        await conv.save();
      }
    }
    res.json(request.toObject());
  }),
);

groupsRouter.post(
  '/:id/leave',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Group not found.');
    assertSameInstitution(group, req.user, 'Circle');
    
    // Remove from GroupMember
    await GroupMember.deleteOne({ group_id: group.id, user_id: req.user.id });
    
    // Remove from Conversation participant_ids
    const conv = await Conversation.findOne({ group_id: group.id });
    if (conv) {
      conv.participant_ids = conv.participant_ids.filter(id => String(id) !== String(req.user.id));
      await conv.save();
    }
    
    const userName = req.user.profile?.full_name || req.user.username;
    await createGroupSystemMessage(group.id, `${userName} left the circle`);
    
    res.json({ status: 'success' });
  })
);

groupsRouter.get(
  '/:id/posts/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Group not found.');
    assertSameInstitution(group, req.user, 'Circle');
    
    if (group.privacy === 'private') {
      const isMem = await member(group.id, req.user.id);
      if (!isMem) {
        throw forbidden('You must be a member to view messages in this private group.');
      }
    }

    const posts = await Post.find({ group_id: req.params.id, is_taken_down: { $ne: true } }).sort({ created_at: -1 });
    res.json(await Promise.all(posts.map((post) => serializePost(post, req.user.id))));
  }),
);

groupsRouter.put(
  '/:groupId/members/:userId/role',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await member(req.params.groupId, req.params.userId);
    if (!item) throw notFound('Member not found.');
    if (!(await canManage(item.group_id, req.user))) throw forbidden('You cannot update this member.');
    item.role = req.query.role || req.body.role || item.role;
    await item.save();
    res.json(item.toObject());
  }),
);

groupsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Group not found.');
    assertSameInstitution(group, req.user, 'Circle');
    if (group.creator_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      throw forbidden('Only the creator can delete this group.');
    }
    
    await GroupMember.deleteMany({ group_id: group.id });
    await GroupRequest.deleteMany({ group_id: group.id });
    await Post.deleteMany({ group_id: group.id });
    await Conversation.deleteMany({ group_id: group.id });
    await Group.deleteOne({ id: group.id });
    
    res.json({ success: true });
  })
);

groupsRouter.delete(
  '/:groupId/members/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.params.userId !== req.user.id && req.params.userId !== 'me' && !(await canManage(req.params.groupId, req.user))) {
      throw forbidden('You cannot remove members.');
    }

    const actualUserId = req.params.userId === 'me' ? req.user.id : req.params.userId;
    const targetUser = await User.findOne({ id: actualUserId });
    const targetName = targetUser ? (targetUser.profile?.full_name || targetUser.username) : 'A member';

    await GroupMember.deleteOne({ group_id: req.params.groupId, user_id: actualUserId });

    // Remove from group conversation participants
    const conv = await Conversation.findOne({ group_id: req.params.groupId });
    if (conv) {
      conv.participant_ids = conv.participant_ids.filter(id => id !== actualUserId);
      await conv.save();
    }

    if (actualUserId === req.user.id) {
      await createGroupSystemMessage(req.params.groupId, `${targetName} left the circle`);
    } else {
      const adminName = req.user.profile?.full_name || req.user.username;
      await createGroupSystemMessage(req.params.groupId, `${targetName} was removed by ${adminName}`);
    }

    res.json({ status: 'removed' });
  }),
);

// Circle admin: add member directly
groupsRouter.post(
  '/:id/members/add',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Circle not found.');
    if (!(await canManage(group.id, req.user))) throw forbidden('Only circle admins can add members.');

    const { user_id } = req.body;
    if (!user_id) throw new (await import('../utils/httpError.js')).HttpError(400, 'user_id is required.');

    const target = await User.findOne({ id: user_id });
    if (!target) throw notFound('User not found.');

    // Check if already a member
    const existing = await GroupMember.findOne({ group_id: group.id, user_id: target.id });
    if (existing) return res.json({ status: 'already_member' });

    // Add as member
    await GroupMember.create({ group_id: group.id, user_id: target.id, role: 'member' });

    // Add to group conversation if it exists
    const conv = await Conversation.findOne({ group_id: group.id });
    if (conv) {
      if (!conv.participant_ids.includes(target.id)) {
        conv.participant_ids.push(target.id);
        await conv.save();
      }
    }

    // Remove any pending request
    await GroupRequest.deleteMany({ group_id: group.id, user_id: target.id });

    // Notify the added user
    const adminName = req.user.profile?.full_name || req.user.username;
    await addNotification({ user_id: target.id, sender_id: req.user.id, type: 'group_invite', group_id: group.id, message: `${adminName} added you to ${group.name}` });

    await createGroupSystemMessage(group.id, `${target.profile?.full_name || target.username} was added by ${adminName}`);

    res.json({ status: 'added' });
  }),
);
