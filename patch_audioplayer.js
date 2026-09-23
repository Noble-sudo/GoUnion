import fs from 'fs';

let c = fs.readFileSync('frontend/components/chat/AudioPlayer.jsx', 'utf8');

const target = `            {/* Left: Avatar with mini badge */}
            <div className="relative shrink-0">
                <Avatar 
                    src={senderAvatar} 
                    label={senderName || "User"} 
                    className="w-10 h-10 rounded-full border border-white/10 object-cover" 
                />
                <div className={\`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 \${mine ? 'border-primary bg-black' : 'border-[#151518] bg-primary'}\`}>
                    <Mic size={10} className={mine ? "text-primary" : "text-black"} />
                </div>
            </div>`;

c = c.replace(target, '');

fs.writeFileSync('frontend/components/chat/AudioPlayer.jsx', c);
console.log("Removed Avatar from AudioPlayer");
