import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

const statsCode = `        {/* Stats */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">{user.followers_count || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Connections</span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">{user.total_likes || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Likes</span>
          </div>
        </div>

        {/* Bio */}`;

content = content.replace('{/* Bio */}', statsCode);

fs.writeFileSync('frontend/pages/Profile.jsx', content);
console.log('Added stats to Profile.jsx');
