const fs = require('fs');

// 1. Update Models
let modelsContent = fs.readFileSync('backend/src/models.js', 'utf8');
if (!modelsContent.includes('needs_audit')) {
  modelsContent = modelsContent.replace(
    /rejection_reason: \{ type: String, default: null \},/,
    `rejection_reason: { type: String, default: null },
    needs_audit: { type: Boolean, default: false },
    ai_confidence_score: { type: Number, default: null },`
  );
  fs.writeFileSync('backend/src/models.js', modelsContent);
}

// 2. Update Admin Routes (Fetch & Resolve)
let adminContent = fs.readFileSync('backend/src/routes/admin.js', 'utf8');
adminContent = adminContent.replace(
  /const identities = await StudentIdentity\.find\(\{ status: 'PENDING' \}\)\.sort\(\{ created_at: -1 \}\);/,
  `const identities = await StudentIdentity.find({ 
      $or: [{ status: 'PENDING' }, { status: 'VERIFIED', needs_audit: true }] 
    }).sort({ created_at: -1 });`
);
adminContent = adminContent.replace(
  /identity\.status = 'VERIFIED';\n\s*identity\.verified_at = new Date\(\);/,
  `identity.status = 'VERIFIED';
      identity.needs_audit = false;
      identity.verified_at = new Date();`
);
adminContent = adminContent.replace(
  /identity\.status = 'REJECTED';\n\s*identity\.rejection_reason = req\.body\.reason/,
  `identity.status = 'REJECTED';
      identity.needs_audit = false;
      identity.rejection_reason = req.body.reason`
);
fs.writeFileSync('backend/src/routes/admin.js', adminContent);

// 3. Update Identities Router (Auto-Approve Logic)
let identitiesContent = fs.readFileSync('backend/src/routes/identities.js', 'utf8');
// Replace the creation logic
const oldCreate = `const identity = await StudentIdentity.create({
      user_id: req.user.id,
      institution_id,
      identifier: identifier ? identifier.trim().toLowerCase() : null,
      method,
      status: 'PENDING',
      verification_data: verification_data || {},
    });`;

const newCreate = `
    let initialStatus = 'PENDING';
    let needsAudit = false;
    let aiScore = null;

    if (method === 'email' && identifier) {
      if (identifier.trim().toLowerCase().endsWith('.edu.ng')) {
        // Option 1: .edu.ng Golden Ticket (100% Automated)
        initialStatus = 'VERIFIED';
        needsAudit = false; 
        aiScore = 100; // Perfect trust
      }
    } else if (method === 'id_card' || method === 'admission_letter') {
      // Option 2 & 3: ID Upload Auto-Approve with Admin Audit (and future AI hook)
      initialStatus = 'VERIFIED';
      needsAudit = true;
      // In the future, we will call: const aiResult = await DojahAPI.verifyID(verification_data.fileUrl);
      // aiScore = aiResult.confidence;
    }

    const identity = await StudentIdentity.create({
      user_id: req.user.id,
      institution_id,
      identifier: identifier ? identifier.trim().toLowerCase() : null,
      method,
      status: initialStatus,
      needs_audit: needsAudit,
      ai_confidence_score: aiScore,
      verification_data: verification_data || {},
    });
`;

identitiesContent = identitiesContent.replace(oldCreate, newCreate);
fs.writeFileSync('backend/src/routes/identities.js', identitiesContent);

console.log('Backend Auto-Approve & Audit Queue implemented');
