import fs from 'fs';

let c = fs.readFileSync('backend/src/store.js', 'utf8');

const targetStr = `export const addNotification = async ({ user_id, sender_id, type, post_id = null, comment_id = null, group_id = null, message = null }) => {
  if (!user_id || !sender_id || user_id === sender_id) return null;`;

const enforcementLogic = `export const addNotification = async ({ user_id, sender_id, type, post_id = null, comment_id = null, group_id = null, message = null, conversation_id = null }) => {
  if (!user_id || !sender_id || user_id === sender_id) return null;
  
  const recipient = await User.findOne({ id: user_id });
  if (!recipient) return null;
  
  if (conversation_id && recipient.muted_conversations && recipient.muted_conversations.includes(conversation_id)) {
      return null;
  }
  
  if (recipient.blocked_users && recipient.blocked_users.includes(sender_id)) {
      return null;
  }`;

c = c.replace(targetStr, enforcementLogic);

const pushTargetStr = `  // Send Web Push Notification
  try {
    const subscriptions = await PushSubscription.find({ user_id });`;

const pushEnforcementLogic = `  // Send Web Push Notification
  try {
    if (recipient && recipient.settings && recipient.settings.push_notifications === false) {
        return doc; // Skip push
    }
    const subscriptions = await PushSubscription.find({ user_id });`;

c = c.replace(pushTargetStr, pushEnforcementLogic);

fs.writeFileSync('backend/src/store.js', c);
console.log("Patched addNotification with settings enforcement!");
