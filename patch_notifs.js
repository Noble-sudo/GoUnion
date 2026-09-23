import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(
    /toast\(`\$\{actorName\} \$\{actionText\}`,\s*"info"\);/,
    `toast(\`\${actorName} \${actionText}\`, "info");
                    if ('Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification("GoUnion", {
                                body: \`\${actorName} \${actionText}\`,
                                icon: '/pwa-192x192.png',
                                tag: \`gounion-notif-\${Date.now()}\`,
                            });
                        } catch (err) {}
                    }`
);

fs.writeFileSync('frontend/App.jsx', c);
console.log("Patched notifications!");
