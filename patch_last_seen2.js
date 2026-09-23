import fs from 'fs';

let apiJs = fs.readFileSync('frontend/services/api.js', 'utf8');

const startIdx = apiJs.indexOf('const formatLastSeen = (value) => {');
const endIdx = apiJs.indexOf('};', startIdx) + 2;

const newFormatLastSeen = `const formatLastSeen = (value) => {
    const date = getValidDate(value);
    if (!date) return '';
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return \`at \${timeStr}\`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return \`yesterday at \${timeStr}\`;
    return \`on \${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at \${timeStr}\`;
};`;

apiJs = apiJs.slice(0, startIdx) + newFormatLastSeen + apiJs.slice(endIdx);
apiJs = apiJs.replace(/\|\|\s*'recently'/g, '|| ""');

fs.writeFileSync('frontend/services/api.js', apiJs);
