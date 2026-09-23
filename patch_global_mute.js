import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'queryClient.setQueryData(["currentUser"], data);',
    'updateUser(data);\n            queryClient.setQueryData(["currentUser"], data);'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Fixed toggleGlobalMuteMutation!");
