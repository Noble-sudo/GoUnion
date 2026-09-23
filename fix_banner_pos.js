const fs = require('fs');
let c = fs.readFileSync('frontend/components/layout/PwaInstallBanner.jsx', 'utf8');

c = c.replace(
    'className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] z-[100] px-4 py-3 bg-[var(--rc-go)] text-black shadow-2xl rounded-2xl flex items-center justify-between border border-black/10"',
    'className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-[420px] z-[9999] px-5 py-4 bg-[var(--rc-go)] text-black shadow-[0_10px_40px_rgba(199,249,79,0.3)] rounded-2xl flex items-center justify-between border border-black/20"'
);

fs.writeFileSync('frontend/components/layout/PwaInstallBanner.jsx', c);
console.log('Fixed banner positioning');
