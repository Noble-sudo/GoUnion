import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const { Schema, model, models } = mongoose;
const makeId = () => nanoid(12);

const profileSchema = new Schema(
  {
    id: { type: String, default: makeId },
    user_id: String,
    full_name: String,
    bio: { type: String, default: '' },
    university: { type: String, default: 'University Student' },
    profile_picture: { type: String, default: '' },
    cover_photo: { type: String, default: '' },
    course: { type: String, default: '' },
    hometown: { type: String, default: '' },
  },
  { _id: false },
);

const baseOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
};

const studentIdentitySchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    institution_id: { type: String, required: true, index: true },
    identifier: { type: String, default: null }, // e.g. email or matric number
    method: { type: String, required: true, enum: ['institutional_email', 'manual', 'legacy', 'student_portal'] },
    status: { type: String, required: true, enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'REVOKED', 'LEGACY_UNVERIFIED'] },
    verification_data: { type: Schema.Types.Mixed, default: {} },
    verified_at: { type: Date, default: null },
    rejection_reason: { type: String, default: null },
    needs_audit: { type: Boolean, default: false },
    ai_confidence_score: { type: Number, default: null },
  },
  baseOptions,
);
// Ensure we don't have multiple people claiming the same exact verified identifier at the same institution
studentIdentitySchema.index(
  { institution_id: 1, identifier: 1 },
  { unique: true, partialFilterExpression: { identifier: { $type: "string" } } }
);

const userSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    username: { type: String, unique: true, required: true, trim: true, index: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true },
    
    is_active: { type: Boolean, default: true },
    suspension_reason: { type: String, default: null },
    appeal_status: { type: String, enum: ['none', 'pending', 'resolved', 'rejected'], default: 'none' },
    appeal_text: { type: String, default: null },

    is_online: { type: Boolean, default: false },
    last_seen: { type: Date, default: null },
    email_verified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    active_identity_id: { type: String, default: null, index: true },
    institution_id: { type: String, default: null, index: true },
      profile: { type: profileSchema, default: () => ({}) },
      settings: {
        email_notifications: { type: Boolean, default: true },
        push_notifications: { type: Boolean, default: true },
        marketing_emails: { type: Boolean, default: false },
        dark_mode: { type: Boolean, default: true },
        private_account: { type: Boolean, default: false },
        read_receipts: { type: Boolean, default: true },
        show_online_status: { type: Boolean, default: true },
        show_last_seen: { type: Boolean, default: true },
        allow_messages_anyone: { type: Boolean, default: true },
        show_in_suggestions: { type: Boolean, default: true },
        new_followers: { type: Boolean, default: true },
        direct_messages: { type: Boolean, default: true },
        post_likes: { type: Boolean, default: true },
        post_comments: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true }
      },
      blocked_users: [{ type: String, ref: 'User' }],
      muted_conversations: [{ type: String, ref: 'Conversation' }],
      is_banned: { type: Boolean, default: false },
      ban_reason: { type: String, default: null },
  },
  baseOptions,
);
userSchema.index({ created_at: -1 });


const institutionSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    slug: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    verification_enabled: { type: Boolean, default: true },
    verification_methods: { type: [String], default: ['institutional_email', 'manual'] },
    email_domains: { type: [String], default: [] },
  },
  baseOptions,
);

const campusXPSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    xp: { type: Number, default: 0 },
  },
  baseOptions,
);

const campusStreakSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    streak: { type: Number, default: 0 },
  },
  baseOptions,
);

const followSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId },
    follower_id: { type: String, required: true, index: true },
    following_id: { type: String, required: true, index: true },
  },
  baseOptions,
);
followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });

const postSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    group_id: { type: String, default: null, index: true },
    caption: { type: String, default: '' },
    image: { type: String, default: null },
    video: { type: String, default: null },
    likes: { type: [String], default: [] },
    is_system: { type: Boolean, default: false },
    is_taken_down: { type: Boolean, default: false },
    take_down_reason: { type: String, default: null },
  },
  baseOptions,
);
postSchema.index({ created_at: -1 });
postSchema.index({ user_id: 1, created_at: -1 });
postSchema.index({ group_id: 1, created_at: -1 });

const commentSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    post_id: { type: String, required: true, index: true },
    content: { type: String, required: true },
    likes: { type: [String], default: [] },
  },
  baseOptions,
);
commentSchema.index({ post_id: 1, created_at: 1 });

const postViewSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId },
    post_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    viewed_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
postViewSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

const groupSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    cover_image: { type: String, default: null },
    privacy: { type: String, enum: ['public', 'private', 'secret'], default: 'public' },
      category: { type: String, default: 'Other' },
    creator_id: { type: String, required: true, index: true },
    institution_id: { type: String, default: null, index: true },
    is_active: { type: Boolean, default: true },
    admins_only_chat: { type: Boolean, default: false },
  },
  baseOptions,
);
groupSchema.index({ is_active: 1, created_at: -1 });

const groupMemberSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId },
    group_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
    joined_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
groupMemberSchema.index({ group_id: 1, user_id: 1 }, { unique: true });

const groupRequestSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId },
    group_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    message: { type: String, default: '' },
  },
  baseOptions,
);

const conversationSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    name: { type: String, default: null },
    participant_ids: { type: [String], default: [], index: true },
    group_id: { type: String, default: null, index: true },
    participant_key: { type: String, unique: true, sparse: true, index: true },
  },
  baseOptions,
);
conversationSchema.index({ participant_ids: 1, updated_at: -1 });

const messageSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    conversation_id: { type: String, required: true, index: true },
    sender_id: { type: String, default: null, index: true },
    content: { type: String, default: '' },
    image_url: { type: String, default: null },
    video_url: { type: String, default: null },
    audio_url: { type: String, default: null },
    sticker_url: { type: String, default: null },
    sticker_id: { type: String, default: null },
    is_read: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    is_forwarded: { type: Boolean, default: false },
    reply_to_id: { type: String, default: null },
    seen_by: { type: [{ user_id: { type: String, required: true }, seen_at: { type: Date, default: Date.now } }], default: [] },
  },
  baseOptions,
);
messageSchema.index({ conversation_id: 1, created_at: 1 });

const notificationSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    sender_id: { type: String, required: true, index: true },
    type: { type: String, required: true },
    post_id: { type: String, default: null },
    comment_id: { type: String, default: null },
    group_id: { type: String, default: null },
    message: { type: String, default: null },
    is_read: { type: Boolean, default: false },
  },
  baseOptions,
);
notificationSchema.index({ user_id: 1, created_at: -1 });

const reportSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    post_id: { type: String, default: null },
    comment_id: { type: String, default: null },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  },
  baseOptions,
);
reportSchema.index({ created_at: -1 });

const storySchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    content: { type: String, default: '' },
    image_url: { type: String, default: null },
    expires_at: { type: Date, required: true },
  },
  baseOptions,
);
storySchema.index({ created_at: -1 });

const storyViewSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId },
    story_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    viewed_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
storyViewSchema.index({ story_id: 1, user_id: 1 }, { unique: true });

const storyLikeSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId },
    story_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
  },
  baseOptions,
);
storyLikeSchema.index({ story_id: 1, user_id: 1 }, { unique: true });

const refreshTokenSchema = new Schema(
  {
    token: { type: String, unique: true, required: true },
    user_id: { type: String, required: true, index: true },
  },
  baseOptions,
);

const passwordResetTokenSchema = new Schema(
  {
    token_hash: { type: String, unique: true, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    expires_at: { type: Date, required: true, index: { expires: 0 } },
    used_at: { type: Date, default: null },
  },
  baseOptions,
);

const emailVerificationTokenSchema = new Schema(
  {
    token_hash: { type: String, unique: true, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    expires_at: { type: Date, required: true, index: { expires: 0 } },
    used_at: { type: Date, default: null },
  },
  baseOptions,
);

const otpTokenSchema = new Schema(
  {
    otp_hash: { type: String, unique: true, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    expires_at: { type: Date, required: true, index: { expires: 0 } },
    used_at: { type: Date, default: null },
  },
  baseOptions,
);

const pendingSignupSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true, index: true },
    username: { type: String, required: true, trim: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, default: '' },
    otp_hash: { type: String, required: true },
    expires_at: { type: Date, required: true, index: { expires: 0 } },
  },
  baseOptions,
);
export const PendingSignup = models.PendingSignup || model('PendingSignup', pendingSignupSchema);

export const OtpToken = models.OtpToken || model('OtpToken', otpTokenSchema);
export const Institution = models.Institution || model('Institution', institutionSchema);
export const CampusXP = models.CampusXP || model('CampusXP', campusXPSchema);
export const CampusStreak = models.CampusStreak || model('CampusStreak', campusStreakSchema);

const groupEventSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    group_id: { type: String, required: true, index: true },
    creator_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    start_time: { type: Date, required: true },
    end_time: { type: Date, default: null },
    cover_image: { type: String, default: null },
    attendees: [{ type: String }],
  },
  { versionKey: false }
);

export const StudentIdentity = models.StudentIdentity || model('StudentIdentity', studentIdentitySchema);
export const User = models.User || model('User', userSchema);
export const Follow = models.Follow || model('Follow', followSchema);
export const Post = models.Post || model('Post', postSchema);
export const Comment = models.Comment || model('Comment', commentSchema);
export const PostView = models.PostView || model('PostView', postViewSchema);
export const Group = models.Group || model('Group', groupSchema);
export const GroupMember = models.GroupMember || model('GroupMember', groupMemberSchema);
export const GroupEvent = models.GroupEvent || model('GroupEvent', groupEventSchema);
export const GroupRequest = models.GroupRequest || model('GroupRequest', groupRequestSchema);
export const Conversation = models.Conversation || model('Conversation', conversationSchema);
export const Message = models.Message || model('Message', messageSchema);
export const Notification = models.Notification || model('Notification', notificationSchema);
export const Report = models.Report || model('Report', reportSchema);
export const Story = models.Story || model('Story', storySchema);
export const StoryView = models.StoryView || model('StoryView', storyViewSchema);
export const StoryLike = models.StoryLike || model('StoryLike', storyLikeSchema);
export const RefreshToken = models.RefreshToken || model('RefreshToken', refreshTokenSchema);
export const PasswordResetToken = models.PasswordResetToken || model('PasswordResetToken', passwordResetTokenSchema);
export const EmailVerificationToken = models.EmailVerificationToken || model('EmailVerificationToken', emailVerificationTokenSchema);

const pushSubscriptionSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  baseOptions,
);
export const PushSubscription = models.PushSubscription || model('PushSubscription', pushSubscriptionSchema);
