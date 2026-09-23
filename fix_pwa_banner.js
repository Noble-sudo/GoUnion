const fs = require('fs');
let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(
    '<div className="flex min-h-screen bg-[var(--rc-bg)] text-white selection:bg-[var(--rc-go)] selection:text-black">\n        <PwaInstallBanner />',
    '<div className="flex min-h-screen bg-[var(--rc-bg)] text-white selection:bg-[var(--rc-go)] selection:text-black">'
);

c = c.replace(
    '<AppRoutes />',
    '<PwaInstallBanner />\n              <AppRoutes />'
);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Moved PwaInstallBanner to root App component');
