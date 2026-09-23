import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(
    /if \(window\.socket === socket\) \{\s*window\.socket = null;\s*\}\s*\}\s*catch \(e\) \{ \}\s*\};\s*\}, \[\]\);/g,
    'if (window.socket === socket) {\n                    window.socket = null;\n                }\n            }\n            catch (e) { }\n        };\n    }, [isAuthenticated, user?.id]);'
);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Fixed useWebSocket dependencies');
