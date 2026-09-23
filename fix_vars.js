const fs = require('fs');
let c = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');
c = c.replace(/const \[institutionFilter, setInstitutionFilter\] = useState\('All'\);\n/g, '');
c = c.replace(/const \[statusFilter, setStatusFilter\] = useState\('All'\);/g, "const [statusFilter, setStatusFilter] = useState('All');\n  const [institutionFilter, setInstitutionFilter] = useState('All');");
fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', c);
console.log('Fixed variables');
