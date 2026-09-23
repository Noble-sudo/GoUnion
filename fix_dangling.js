import fs from 'fs';

let content = fs.readFileSync('frontend/components/groups/EditGroupModal.jsx', 'utf8');

const regex = /  \n        queryClient\.invalidateQueries\(\{ queryKey: \["groups"\] \}\);\n        toast\("Circle updated successfully", "success"\);\n        onClose\(\);\n      \},\n      onError: \(err\) => \{\n        toast\(err\.message \|\| "Failed to update circle", "error"\);\n      \}\n    \}\);/m;

// wait, let me just match it more loosely to be safe.
const looseRegex = /queryClient\.invalidateQueries\(\{ queryKey: \["groups"\] \}\);\s*toast\("Circle updated successfully", "success"\);\s*onClose\(\);\s*\},\s*onError: \(err\) => \{\s*toast\(err\.message \|\| "Failed to update circle", "error"\);\s*\}\s*\}\);/m;

content = content.replace(looseRegex, "");

fs.writeFileSync('frontend/components/groups/EditGroupModal.jsx', content);
console.log("Fixed dangling code in EditGroupModal");
