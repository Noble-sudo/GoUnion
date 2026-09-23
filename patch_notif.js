import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

const targetStr = `                    toast(\`\${actorName} \${actionText}\`, "info");
                }
            }
            catch (e) {`;

const newStr = `                    toast(\`\${actorName} \${actionText}\`, "info");
                    
                    if ('Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification("GoUnion", {
                                body: \`\${actorName} \${actionText}\`,
                                icon: '/pwa-192x192.png',
                                tag: \`gounion-notif-\${Date.now()}\`,
                            });
                        }
                        catch (err) { }
                    }
                }
            }
            catch (e) {`;

if (c.includes(targetStr)) {
    c = c.replace(targetStr, newStr);
    fs.writeFileSync('frontend/App.jsx', c);
    console.log("Patched App.jsx for global browser notifications");
} else {
    console.log("Target string not found in App.jsx!");
}
