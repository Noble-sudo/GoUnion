import fs from 'fs';

let apiJs = fs.readFileSync('frontend/services/api.js', 'utf8');

const regex = /timestamp: lastMessageDate[\s\n]*\? lastMessageDate\.toLocaleTimeString\(\[\], \{[\s\n]*hour: '2-digit',[\s\n]*minute: '2-digit',[\s\n]*\}\)[\s\n]*: '',/;

const replacement = `timestamp: (() => {
          if (!lastMessageDate) return '';
          const now = new Date();
          const timeStr = lastMessageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isToday = lastMessageDate.getDate() === now.getDate() && lastMessageDate.getMonth() === now.getMonth() && lastMessageDate.getFullYear() === now.getFullYear();
          if (isToday) return timeStr;
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          const isYesterday = lastMessageDate.getDate() === yesterday.getDate() && lastMessageDate.getMonth() === yesterday.getMonth() && lastMessageDate.getFullYear() === yesterday.getFullYear();
          if (isYesterday) return \`Yesterday, \${timeStr}\`;
          if (now.getTime() - lastMessageDate.getTime() < 6 * 24 * 60 * 60 * 1000) {
              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return \`\${days[lastMessageDate.getDay()]}, \${timeStr}\`;
          }
          return \`\${lastMessageDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, \${timeStr}\`;
      })(),`;

apiJs = apiJs.replace(regex, replacement);

fs.writeFileSync('frontend/services/api.js', apiJs);
