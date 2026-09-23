const fs = require('fs');

let content = fs.readFileSync('frontend/pages/Onboarding.jsx', 'utf8');

content = content.replace(
  /<span className="block font-bold text-white">Manual Verification<\/span>/,
  `<span className="block font-bold text-white">Upload ID Document</span>`
);

content = content.replace(
  /<span className="block text-xs text-white\/50 mt-1">Provide your matriculation number or student ID for admin review\.<\/span>/,
  `<span className="block text-xs text-white/50 mt-1">Upload a photo of your Student ID or Admission Letter for instant access.</span>`
);

fs.writeFileSync('frontend/pages/Onboarding.jsx', content);
console.log('Fixed Onboarding UI text');
