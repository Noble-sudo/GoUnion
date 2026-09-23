const fs = require('fs');

let c = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

c = c.replace(
  /\{members\.map\(member => \(/,
  `{[...members].sort((a, b) => {
                  const roleScore = { admin: 3, moderator: 2, member: 1 };
                  const scoreA = roleScore[a.role] || 0;
                  const scoreB = roleScore[b.role] || 0;
                  return scoreB - scoreA;
                }).map(member => (`
);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', c);
console.log('Fixed GroupDetails members sorting');
