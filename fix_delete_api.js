const fs = require('fs');
let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const deleteApi = `
        deleteEvent: async (eventId) => {
            const res = await apiClient.delete(\`/groups/events/\${eventId}\`);
            return res.data;
        },`;

c = c.replace(/        deleteEvent: async \(eventId\) => \{[\s\S]*?return res\.data;\s*\},\n/g, '');

c = c.replace(/        rsvpEvent: async \(eventId, status\) => \{[\s\S]*?return res\.data;\s*\},\n/, match => match + deleteApi + '\n');

fs.writeFileSync('frontend/services/api.js', c);
console.log('Fixed deleteEvent location');
