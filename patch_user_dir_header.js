import fs from 'fs';

let c = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

const regex = /<th className="px-6 py-4 text-right">Actions<\/th>\s*<\/motion\.tr>/;
c = c.replace(regex, '<th className="px-6 py-4 text-right">Actions</th>\n              </tr>');

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', c);
console.log('Fixed UserDirectory header syntax error!');
