const fs = require('fs');
let c = fs.readFileSync('frontend/components/layout/PwaInstallBanner.jsx', 'utf8');

// Change animations from y: -100 to y: 100
c = c.replace(/y: -100/g, 'y: 100');

// Change classes from fixed top-0 to floating bottom
c = c.replace(
    'className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 bg-[var(--rc-go)] text-black shadow-lg flex items-center justify-between"',
    'className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] z-[100] px-4 py-3 bg-[var(--rc-go)] text-black shadow-2xl rounded-2xl flex items-center justify-between border border-black/10"'
);

fs.writeFileSync('frontend/components/layout/PwaInstallBanner.jsx', c);
console.log('Moved banner to bottom floating card');
