import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

if (!content.includes('const [isHoveringConnection, setIsHoveringConnection]')) {
  content = content.replace(
    'const [isReporting, setIsReporting] = useState(false);',
    'const [isReporting, setIsReporting] = useState(false);\n  const [isHoveringConnection, setIsHoveringConnection] = useState(false);'
  );
}

const oldButton = `<button onClick={() => toggleFollowMutation.mutate()} disabled={toggleFollowMutation.isPending} className={\`flex h-10 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-colors \${isFollowingProfile ? 'border border-white/10 bg-white/5 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-white text-black hover:bg-white/90'}\`}>
                    {isFollowingProfile ? (
                      <>Connected</>
                    ) : (
                      <><UserPlus size={16} /> Connect</>
                    )}
                  </button>`;

const newButton = `<button 
                    onClick={() => toggleFollowMutation.mutate()} 
                    disabled={toggleFollowMutation.isPending} 
                    onMouseEnter={() => setIsHoveringConnection(true)}
                    onMouseLeave={() => setIsHoveringConnection(false)}
                    className={\`flex h-10 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-colors \${isFollowingProfile ? 'border border-white/10 bg-white/5 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-white text-black hover:bg-white/90'}\`}>
                    {isFollowingProfile ? (
                      isHoveringConnection ? <>Disconnect</> : <>Connected</>
                    ) : (
                      <><UserPlus size={16} /> Connect</>
                    )}
                  </button>`;

content = content.replace(oldButton, newButton);

fs.writeFileSync('frontend/pages/Profile.jsx', content);
console.log('Profile connection hover patched');
