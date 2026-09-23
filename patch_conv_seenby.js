import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

const target = '{ is_read: true }\r\n    );\r\n\r\n    // Notify other participants';
const replacement = `{ is_read: true }
    );

    // Also update seen_by array for read receipts
    await Message.updateMany(
      { 
        conversation_id: conversation.id, 
        sender_id: { $ne: req.user.id },
        'seen_by.user_id': { $ne: req.user.id }
      },
      { 
        $push: { seen_by: { user_id: req.user.id, seen_at: new Date() } }
      }
    );

    // Notify other participants`;

if (c.includes(target)) {
    c = c.replace(target, replacement);
    fs.writeFileSync('backend/src/routes/conversations.js', c);
    console.log("SUCCESS");
} else {
    // Try without \r
    const target2 = '{ is_read: true }\n    );\n\n    // Notify other participants';
    if (c.includes(target2)) {
        c = c.replace(target2, replacement);
        fs.writeFileSync('backend/src/routes/conversations.js', c);
        console.log("SUCCESS (LF)");
    } else {
        // Brute force: find index
        const idx = c.indexOf('{ is_read: true }');
        const nextComment = c.indexOf('// Notify other participants', idx);
        if (idx > -1 && nextComment > -1) {
            c = c.substring(0, nextComment) + `// Also update seen_by array for read receipts
    await Message.updateMany(
      { 
        conversation_id: conversation.id, 
        sender_id: { $ne: req.user.id },
        'seen_by.user_id': { $ne: req.user.id }
      },
      { 
        $push: { seen_by: { user_id: req.user.id, seen_at: new Date() } }
      }
    );

    ` + c.substring(nextComment);
            fs.writeFileSync('backend/src/routes/conversations.js', c);
            console.log("SUCCESS (brute force)");
        } else {
            console.log("FAILED completely");
        }
    }
}

console.log('seen_by in file:', c.includes('seen_by'));
