import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

if (!content.includes('const [isHoveringConnection, setIsHoveringConnection]')) {
  content = content.replace(
    'const [isEditModalOpen, setIsEditModalOpen] = useState(false);',
    'const [isEditModalOpen, setIsEditModalOpen] = useState(false);\n  const [isHoveringConnection, setIsHoveringConnection] = useState(false);'
  );
}

fs.writeFileSync('frontend/pages/Profile.jsx', content);
console.log('Added isHoveringConnection state to Profile.jsx');
