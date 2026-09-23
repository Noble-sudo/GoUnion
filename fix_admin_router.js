const fs = require('fs');
let content = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');

// 1. Add import
if (!content.includes("import VerificationQueue")) {
    content = content.replace(
        /import SuspensionAppeals from '\.\.\/components\/admin\/SuspensionAppeals';/,
        `import SuspensionAppeals from '../components/admin/SuspensionAppeals';\nimport VerificationQueue from '../components/admin/VerificationQueue';`
    );
}

// 2. Add case to switch
if (!content.includes("case 'verifications':")) {
    content = content.replace(
        /case 'moderation': return <ModerationQueue \/>;/,
        `case 'moderation': return <ModerationQueue />;\n            case 'verifications': return <VerificationQueue />;`
    );
}

fs.writeFileSync('frontend/pages/AdminPanel.jsx', content);
console.log('Added VerificationQueue to AdminPanel');
