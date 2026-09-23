const fs = require('fs');
let c = fs.readFileSync('frontend/App.jsx', 'utf8');

if (!c.includes('PwaInstallBanner')) {
    c = c.replace(
        'import { MobileNav } from "./components/layout/MobileNav";',
        'import { MobileNav } from "./components/layout/MobileNav";\nimport { PwaInstallBanner } from "./components/layout/PwaInstallBanner";'
    );
    
    c = c.replace(
        '<div className="flex min-h-screen bg-[var(--rc-bg)] text-white selection:bg-[var(--rc-go)] selection:text-black">',
        '<div className="flex min-h-screen bg-[var(--rc-bg)] text-white selection:bg-[var(--rc-go)] selection:text-black">\n        <PwaInstallBanner />'
    );
    
    fs.writeFileSync('frontend/App.jsx', c);
    console.log('Injected PwaInstallBanner');
}
