import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Groups.jsx', 'utf8');

content = content.replace(
  'setActiveTab("my_circles");\n    },',
  'setActiveTab("my_circles");\n    },\n    onError: (err) => {\n      console.error(err);\n      alert("Error creating circle: " + err.message);\n    },'
);

// wait, let's also check if they are clicking the main button on mobile? 
// The button has `onClick={() => setIsModalOpen(true)}`. This should work perfectly.

fs.writeFileSync('frontend/pages/Groups.jsx', content);
console.log('Added error handling to createGroupMutation');
