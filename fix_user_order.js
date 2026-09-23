const fs = require('fs');
let c = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

const regex = /const activeInstitutions = useMemo\(\(\) => \{[\s\S]*?\}, \[users, institutions\]\);/;
const match = c.match(regex);

if (match) {
    c = c.replace(match[0], '');
    c = c.replace("const groupedUsers = useMemo(() => {", match[0] + "\n\n  const groupedUsers = useMemo(() => {");
    fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', c);
    console.log('Moved activeInstitutions below users');
}
