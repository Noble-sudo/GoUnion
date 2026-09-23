const fs = require('fs');

// Patch models.js
let models = fs.readFileSync('backend/src/models.js', 'utf8');
models = models.replace(
  'group_id: { type: String, default: null, index: true },\n      institution_id: { type: String, default: null, index: true },',
  'group_id: { type: String, default: null, index: true },\n      deleted_by: { type: [String], default: [] },\n      institution_id: { type: String, default: null, index: true },'
);
fs.writeFileSync('backend/src/models.js', models);

// Patch conversations.js GET
let convs = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');
convs = convs.replace(
  'const conversations = await Conversation.find({ participant_ids: req.user.id }).sort({ updated_at: -1 });',
  'const conversations = await Conversation.find({ participant_ids: req.user.id, deleted_by: { $ne: req.user.id } }).sort({ updated_at: -1 });'
);

// Add DELETE route
const deleteRoute = `
conversationsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) throw notFound('Conversation not found.');
    if (!hasParticipant(conversation, req.user.id)) throw forbidden('You cannot delete this conversation.');
    
    await Conversation.updateOne({ id: req.params.id }, { $addToSet: { deleted_by: req.user.id } });
    res.json({ status: 'ok' });
  }),
);
`;
convs = convs.replace('export const conversationsRouter = Router();', 'export const conversationsRouter = Router();\n' + deleteRoute);

fs.writeFileSync('backend/src/routes/conversations.js', convs);
console.log('Patched backend for delete conversation');
