import fs from 'fs';

const files = [
  'frontend/pages/Messages.jsx',
  'frontend/pages/Notifications.jsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace glass-panel with v2 style
  code = code.replace(/glass-panel/g, 'bg-white/[0.02] border border-white/5');
  code = code.replace(/rc-surface-strong/g, 'bg-[#111113] border border-white/5');
  code = code.replace(/rc-surface/g, 'bg-white/[0.02] border border-white/5');
  code = code.replace(/rounded-none sm:rounded-2xl/g, 'rounded-2xl');
  code = code.replace(/rounded-none md:rounded-2xl/g, 'rounded-2xl');
  
  fs.writeFileSync(file, code);
  console.log(`Patched ${file}`);
}
