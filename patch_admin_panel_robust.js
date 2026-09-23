import fs from 'fs';

let panelCode = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');

// Find activeTab === "users" &&
const usersIdx = panelCode.indexOf('activeTab === "users" &&');
const reportsIdx = panelCode.indexOf('activeTab === "reports" &&');

if (usersIdx !== -1 && reportsIdx !== -1 && usersIdx < reportsIdx) {
  // We want to replace everything between usersIdx and reportsIdx
  // But keep activeTab === "users" &&
  const replacement = 'activeTab === "users" && React.createElement(GroupedUsersList, { users, loading: loadingUsers }),\n            ';
  panelCode = panelCode.slice(0, usersIdx) + replacement + panelCode.slice(reportsIdx);
  fs.writeFileSync('frontend/pages/AdminPanel.jsx', panelCode);
  console.log('Successfully patched AdminPanel.jsx using robust index replacement');
} else {
  console.log('Failed to find markers');
}
