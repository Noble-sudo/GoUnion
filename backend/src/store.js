import bcrypt from 'bcryptjs';
import { getIo } from './socket.js';
import {
  Comment,
  Conversation,
  Follow,
  Group,
  GroupMember,
  GroupRequest,
  Message,
  Notification,
  Post,
  PostView,
  StoryLike,
  StoryView,
  User,
  PushSubscription,
} from './models.js';
import webpush from 'web-push';
import { env } from './config/env.js';
import { resolveInstitutionSelection } from './utils/institutionScope.js';

export const toPlain = (doc) => {
  if (!doc) return null;
  const value = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  delete value._id;
  return value;
};

export const makeTimestamp = () => new Date().toISOString();

export const ensureSeedAdmin = async () => { return null; };


export const publicUser = async (userOrId, viewerId = null) => {
  if (userOrId === 'system' || userOrId === 'reconnected_admin') {
    return {
      id: 'system',
      username: 'reconnected_admin',
      email: 'admin@reconnected.com',
      role: 'admin',
      is_online: true,
      profile: {
        full_name: 'Reconnected Broadcast',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=R&backgroundColor=ffffff&textColor=000000',
        bio: 'Official Reconnected Communications',
        university: 'Reconnected Platform',
      },
      followers: 0,
      following: 0,
      total_likes: 0,
      is_following: false
    };
  }
  const user = typeof userOrId === 'string' ? await User.findOne({ id: userOrId }) : userOrId;

  if (!user) return null;
  const plain = toPlain(user);
  const [followers, following, posts, isFollowing, activeIdentity] = await Promise.all([
    Follow.countDocuments({ following_id: plain.id }),
    Follow.countDocuments({ follower_id: plain.id }),
    Post.find({ user_id: plain.id }).select('likes').lean(),
    viewerId ? Follow.exists({ follower_id: viewerId, following_id: plain.id }) : null,
    plain.active_identity_id ? (await import('./models.js')).StudentIdentity.findOne({ id: plain.active_identity_id }).lean() : Promise.resolve(null)
  ]);
  const institutionId = activeIdentity?.institution_id || plain.institution_id || null;
  const institution = institutionId ? await resolveInstitutionSelection({ institutionId }) : null;
  const profile = {
    ...(plain.profile || {}),
    university: institution?.name || plain.profile?.university || 'University Student',
  };

  return {
    id: plain.id,
    institution_id: institutionId,
    institution_name: institution?.name || null,
    university: institution?.name || profile.university,
    verification_status: activeIdentity?.status || 'UNVERIFIED',
      rejection_reason: activeIdentity?.rejection_reason || null,
    active_identity_id: plain.active_identity_id || null,
    username: plain.username,
    email: plain.email,
    is_active: plain.is_active,
    is_online: plain.settings?.show_online_status === false ? false : plain.is_online,
    last_seen: plain.settings?.show_last_seen === false ? null : plain.last_seen,
    email_verified: plain.email_verified,
    role: plain.role,
    created_at: plain.created_at,
    profile,
    followers_count: followers,
    following_count: following,
    total_likes: posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0),
    is_following: Boolean(isFollowing),
    ...(viewerId === plain.id ? {
      settings: plain.settings || {},
      blocked_users: plain.blocked_users || [],
      muted_conversations: plain.muted_conversations || [],
      is_banned: plain.is_banned || false,
      ban_reason: plain.ban_reason || null
    } : {
      is_banned: plain.is_banned || false
    })
  };
};

export const serializeComment = async (commentOrDoc, viewerId = null) => {
  const comment = toPlain(commentOrDoc);
  if (!comment) return null;
  return {
    ...comment,
    user: await publicUser(comment.user_id, viewerId),
    likes_count: comment.likes?.length || 0,
    is_liked: viewerId ? (comment.likes || []).includes(viewerId) : false,
  };
};


export const processMentions = async (content, senderId, targetInfo) => {
  if (!content) return;
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
  let match;
  const usernames = new Set();
  while ((match = mentionRegex.exec(content)) !== null) {
    usernames.add(match[1]);
  }
  
  if (usernames.size > 0) {
    const User = (await import('./models.js')).User;
    const usernameMatchers = Array.from(usernames).map((username) => {
      const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^${escaped}$`, 'i');
    });
    const users = await User.find({ username: { $in: usernameMatchers } }).select('id').lean();
    for (const u of users) {
      if (u.id !== senderId) {
        await addNotification({
          user_id: u.id,
          sender_id: senderId,
          type: 'mention',
          ...targetInfo
        });
      }
    }
  }
};

export const serializePost = async (postOrDoc, viewerId = null) => {
  const post = toPlain(postOrDoc);
  if (!post) return null;
  const [commentsCount, viewsCount] = await Promise.all([
    Comment.countDocuments({ post_id: post.id }),
    PostView.countDocuments({ post_id: post.id }),
  ]);
  return {
    ...post,
    user: await publicUser(post.user_id, viewerId),
    comments: [],
    likes: (post.likes || []).map((userId) => ({ id: userId })),
    likes_count: post.likes?.length || 0,
    comments_count: commentsCount,
    views_count: viewsCount,
  };
};

if (env.vapidPublicKey && env.vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      'mailto:support@gounion.app',
      env.vapidPublicKey,
      env.vapidPrivateKey
    );
  } catch (err) {
    console.error('Failed to set VAPID details:', err.message);
  }
}

export const addNotification = async ({ user_id, sender_id, type, post_id = null, comment_id = null, group_id = null, message = null, conversation_id = null }) => {
  if (!user_id || !sender_id || user_id === sender_id) return null;
  
  const recipient = await User.findOne({ id: user_id });
  if (!recipient) return null;
  
  if (conversation_id && recipient.muted_conversations && recipient.muted_conversations.includes(conversation_id)) {
      return null;
  }
  
  if (recipient.blocked_users && recipient.blocked_users.includes(sender_id)) {
      return null;
  }
  const doc = await Notification.create({ user_id, sender_id, type, post_id, comment_id, group_id, message });

  try {
    const io = getIo();
    if (io) {
      const payload = await serializeNotification(doc);
      io.to(`user:${user_id}`).emit('notification', { type: 'new_notification', notification: payload });
    }
  } catch (e) {
    // ignore socket failures
  }

  // Send Web Push Notification
  try {
    if (recipient && recipient.settings && recipient.settings.push_notifications === false) {
        return doc; // Skip push
    }
    const subscriptions = await PushSubscription.find({ user_id });
    if (subscriptions.length > 0) {
      let bodyText = message;
      if (!bodyText) {
        const actor = await User.findOne({ id: sender_id });
        const actorName = actor ? (actor.profile?.full_name || actor.username) : 'Someone';
        switch (type) {
          case 'like': bodyText = `${actorName} liked your post.`; break;
          case 'comment': bodyText = `${actorName} commented on your post.`; break;
          case 'like_comment': bodyText = `${actorName} liked your comment.`; break;
          case 'follow': bodyText = `${actorName} started following you.`; break;
          case 'group_invite': bodyText = `${actorName} invited you to a group.`; break;
          case 'group_request': bodyText = `${actorName} requested to join your group.`; break;
          case 'new_message': bodyText = `${actorName} sent you a new message.`; break;
          default: bodyText = `${actorName} interacted with you.`; break;
        }
      }
      const payload = JSON.stringify({
        title: 'GoUnion Network',
        body: bodyText,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        url: type === 'new_message' ? '/messages' : (post_id ? `/post/${post_id}` : '/notifications'),
      });
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            payload
          );
        } catch (pushErr) {
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await PushSubscription.deleteOne({ endpoint: sub.endpoint });
          }
        }
      }
    }
  } catch (pushErr) {
    // ignore push failures
  }

  return doc;
};

export const serializeNotification = async (notificationOrDoc, viewerId = null) => {
  const notification = toPlain(notificationOrDoc);
  return {
    ...notification,
    actor: await publicUser(notification.sender_id, viewerId),
    sender: await publicUser(notification.sender_id, viewerId),
  };
};

export const serializeGroup = async (groupOrDoc, viewerId = null) => {
  const group = toPlain(groupOrDoc);
  const institution = group.institution_id
    ? await resolveInstitutionSelection({ institutionId: group.institution_id })
    : null;
  return {
    ...group,
    creatorId: String(group.creator_id),
    institution_name: institution?.name || null,
    university: institution?.name || null,
      category: group.category || "Other",
    privacy: group.privacy,
    adminsOnlyChat: group.admins_only_chat || false,
    member_count: await GroupMember.countDocuments({ group_id: group.id }),
    is_joined: viewerId ? Boolean(await GroupMember.exists({ group_id: group.id, user_id: viewerId })) : false,
    has_requested: viewerId ? Boolean(await GroupRequest.exists({ group_id: group.id, user_id: viewerId, status: 'pending' })) : false,
  };
};

export const serializeMessage = async (messageOrDoc) => {
  const message = toPlain(messageOrDoc);
  return {
    ...message,
    sender: message.sender_id ? await publicUser(message.sender_id) : null,
    seen_by_users: await Promise.all((message.seen_by || []).map(async (s) => ({
      user: await publicUser(s.user_id),
      seen_at: s.seen_at
    }))),
  };
};

export const serializeConversation = async (conversationOrDoc, viewerId = null) => {
  const conversation = toPlain(conversationOrDoc);
  const messages = await Message.find({ conversation_id: conversation.id }).sort({ created_at: 1 });
  
  let unreadCount = 0;
  if (viewerId) {
    unreadCount = await Message.countDocuments({
        conversation_id: conversation.id,
        sender_id: { $ne: viewerId },
        'seen_by.user_id': { $ne: viewerId }
      });
  }

    let groupData = null;
    let groupId = conversation.group_id;
    
    // Fallback: extract group ID from participant_key if group_id is missing from schema
    if (!groupId && conversation.participant_key && conversation.participant_key.startsWith('group_')) {
      groupId = conversation.participant_key.replace('group_', '');
    }

    if (groupId) {
      const group = await Group.findOne({ id: groupId });
      if (group) groupData = group.toObject ? group.toObject() : group;
    }

    return {
      ...conversation,
      group: groupData,
      participants: groupData 
        ? await Promise.all(((await (await import('./models.js')).GroupMember.find({ group_id: groupId })).map(m => m.user_id) || []).map(id => publicUser(id, viewerId)))
        : await Promise.all((conversation.participant_ids || []).map((id) => publicUser(id, viewerId))),
    messages: await Promise.all(messages.map(serializeMessage)),
    unread_count: unreadCount,
  };
};

export const serializeStory = async (storyOrDoc, viewerId = null) => {
  const story = toPlain(storyOrDoc);
  const [views, likes] = await Promise.all([
    StoryView.find({ story_id: story.id }).lean(),
    StoryLike.find({ story_id: story.id }).lean(),
  ]);
  return {
    ...story,
    user: await publicUser(story.user_id, viewerId),
    views: views.map(toPlain),
    likes: likes.map(toPlain),
  };
};
