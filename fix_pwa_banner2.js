const fs = require('fs');
let c = fs.readFileSync('frontend/components/layout/PwaInstallBanner.jsx', 'utf8');

c = c.replace(
    'if (!deferredPrompt || isDismissed) return null;',
    'const forceShow = window.location.search.includes("show_pwa=true");\n  if ((!deferredPrompt && !forceShow) || isDismissed) return null;'
);

c = c.replace(
    'if (!deferredPrompt) return;',
    'if (forceShow) {\n      alert("This is a preview! On an actual Android device, this button will open the native App Install prompt.");\n      return;\n    }\n    if (!deferredPrompt) return;'
);

fs.writeFileSync('frontend/components/layout/PwaInstallBanner.jsx', c);
console.log('Added force show param for PWA banner');
