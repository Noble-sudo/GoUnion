const fs = require('fs');
let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const deleteApi = `
        deleteEvent: async (eventId) => {
            const res = await apiClient.delete(\`/groups/events/\${eventId}\`);
            return res.data;
        },`;

c = c.replace(/        deleteEvent: async \(eventId\) => \{[\s\S]*?return res\.data;\s*\},\n/g, '');

c = c.replace(/groups: \{/, 'groups: {' + deleteApi);

fs.writeFileSync('frontend/services/api.js', c);
console.log('Fixed deleteEvent location');
