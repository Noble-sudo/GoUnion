const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/CampusManager.jsx', 'utf8');

const regex = /\/\/ Get a Set of all institution IDs that have at least one user[\s\S]*?return instRes\.filter\(inst => activeInstIds\.has\(String\(inst\.id\)\)\);/;

const newQuery = `// Calculate user counts per campus
            const userCounts = {};
            usersRes.forEach(u => {
                if (u.institution_id) {
                    userCounts[u.institution_id] = (userCounts[u.institution_id] || 0) + 1;
                }
            });
            const activeInstIds = new Set(Object.keys(userCounts));
            
            return instRes
                .filter(inst => activeInstIds.has(String(inst.id)))
                .map(inst => ({ ...inst, userCount: userCounts[inst.id] || 0 }))
                .sort((a, b) => b.userCount - a.userCount);`;

content = content.replace(regex, newQuery);

const oldCardMetaRegex = /<div className="flex items-center gap-1\.5 text-white\/40 text-xs mt-2">[\s\S]*?<div className="mt-5 pt-4 border-t border-white\/5 flex items-center justify-between">/;

const newCardMeta = `<div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                            <MapPin size={12} />
                                            <span>{campus.location || "Nigeria"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                                            <Users size={12} />
                                            <span>{campus.userCount} Students</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">`;

content = content.replace(oldCardMetaRegex, newCardMeta);
fs.writeFileSync('frontend/components/admin/CampusManager.jsx', content);
console.log('Successfully added user counts to CampusManager!');
