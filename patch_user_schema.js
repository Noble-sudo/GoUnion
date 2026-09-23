import fs from 'fs';

let c = fs.readFileSync('backend/src/models.js', 'utf8');

const additionalFields = `
    is_active: { type: Boolean, default: true },
    suspension_reason: { type: String, default: null },
    appeal_status: { type: String, enum: ['none', 'pending', 'resolved', 'rejected'], default: 'none' },
    appeal_text: { type: String, default: null },
`;

c = c.replace(/is_active: \{ type: Boolean, default: true \},/, additionalFields);

fs.writeFileSync('backend/src/models.js', c);
console.log('Added suspension fields to User schema');
