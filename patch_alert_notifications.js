const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

const modalScript = `e.preventDefault(); 
const title = notif.message.split(':')[0] || 'Broadcast';
const body = notif.message.substring(notif.message.indexOf(':') + 1).trim() || notif.message;
const overlay = document.createElement('div');
overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
const modal = document.createElement('div');
modal.className = 'w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden';
modal.innerHTML = \`
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#0a0a0c] font-black text-xl font-serif">R</div>
    <div>
      <h2 class="text-white font-bold text-lg leading-tight">\${title}</h2>
      <p class="text-white/50 text-xs">Reconnected Broadcast</p>
    </div>
  </div>
  <div class="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">\${body}</div>
  <button id="close-broadcast-btn" class="mt-8 w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors">Close</button>
\`;
overlay.appendChild(modal);
document.body.appendChild(overlay);
document.getElementById('close-broadcast-btn').onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); overlay.remove(); };
overlay.onclick = (ev) => { if (ev.target === overlay) { ev.preventDefault(); ev.stopPropagation(); overlay.remove(); } };
`;

c = c.replace(
    /alert\("Admin Broadcast:\\n\\n" \+ notif\.message\);/,
    modalScript.replace(/\n/g, ' ')
);

fs.writeFileSync('frontend/pages/Notifications.jsx', c);
console.log('Fixed the alert in Notifications.jsx');
