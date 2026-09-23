import fs from 'fs';
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Add notificationsMuted state
const stateTarget = 'const [isChatListMenuOpen, setIsChatListMenuOpen] = useState(false);';
if (c.includes(stateTarget)) {
    c = c.replace(stateTarget, stateTarget + '\n    const [notificationsMuted, setNotificationsMuted] = useState(false);');
}

// Ensure Bell icon is imported
const lucideMatch = c.match(/import \{([^}]+)\} from "lucide-react";/);
if (lucideMatch && !lucideMatch[1].includes('Bell,')) {
    c = c.replace(lucideMatch[0], `import {${lucideMatch[1]}, Bell} from "lucide-react";`);
}

// Update the Mute/Unmute button in the dropdown
const muteTarget = `<button onClick={() => { setIsChatListMenuOpen(false); toast("Notifications muted", "success"); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-full text-left transition-colors">
                                            <BellOff size={15} /> Mute Notifications
                                        </button>`;

const newMuteBtn = `<button onClick={() => { setIsChatListMenuOpen(false); setNotificationsMuted(!notificationsMuted); toast(notificationsMuted ? "Notifications unmuted" : "Notifications muted", "success"); }} className={\`flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg w-full text-left transition-colors \${notificationsMuted ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}\`}>
                                            {notificationsMuted ? <Bell size={15} /> : <BellOff size={15} />} {notificationsMuted ? "Unmute Notifications" : "Mute Notifications"}
                                        </button>`;

if (c.includes(muteTarget)) {
    c = c.replace(muteTarget, newMuteBtn);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Patched Mute toggle!");
} else {
    console.log("Mute button target not found!");
}
