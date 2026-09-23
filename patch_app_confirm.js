const fs = require('fs');
let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(/import \{ ToastProvider, useToast \} from "\.\/components\/ui\/Toast";/, `import { ToastProvider, useToast } from "./components/ui/Toast";\nimport { ConfirmProvider } from "./components/ui/ConfirmProvider";`);

c = c.replace(/_jsx\(ToastProvider, \{ children: _jsx\(BrowserRouter, \{ children: _jsx\(AppRoutes, \{\}\) \}\) \}\)/, `_jsx(ToastProvider, { children: _jsx(ConfirmProvider, { children: _jsx(BrowserRouter, { children: _jsx(AppRoutes, {}) }) }) })`);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Injected ConfirmProvider');
