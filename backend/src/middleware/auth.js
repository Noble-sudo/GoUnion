import { User, StudentIdentity } from '../models.js';
import { forbidden, unauthorized } from '../utils/httpError.js';
import { verifyAccessToken } from '../utils/tokens.js';

// Everyone shares the one Konnect network, so no one is locked out for lacking a campus or student verification.
const LAUNCH_INSTITUTION_ID = 'ng-godfrey-okoye-university-enugu';

export const requireAuth = async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(unauthorized());

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findOne({ id: payload.sub });
    if (!user) return next(unauthorized('User no longer exists.'));
    if (!user.is_active) return next(forbidden('Your account has been suspended.'));
    
    // Attach user to req
    req.user = user;

    // Put every non-admin account into the shared network.
    if (!['admin', 'moderator'].includes(user.role)) {
      let institutionId = null;
      if (user.active_identity_id) {
        const identity = await StudentIdentity.findOne({ id: user.active_identity_id }).lean();
        if (identity && ['VERIFIED', 'LEGACY_UNVERIFIED'].includes(identity.status)) institutionId = identity.institution_id;
      }
      req.user.institution_id = institutionId || (!user.active_identity_id && user.institution_id) || LAUNCH_INSTITUTION_ID;
    }

    return next();
  } catch (err) {
    return next(unauthorized('Invalid or expired token.'));
  }
};

export const requireAdmin = (req, _res, next) => {
  if (!['admin', 'moderator'].includes(req.user?.role)) return next(forbidden('Admin access required.'));
  return next();
};
