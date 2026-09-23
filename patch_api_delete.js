const fs = require('fs');
let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const apiDelete = `
        deleteEvent: async (eventId) => {
            const res = await apiClient.delete(\`/groups/events/\${eventId}\`);
            return res.data;
        },`;

if (!c.includes('deleteEvent:')) {
  c = c.replace(/rsvpEvent: async \(eventId, status\) => \{[\s\S]*?return res\.data;\s*\},\n/, match => match + apiDelete + '\n');
  fs.writeFileSync('frontend/services/api.js', c);
  console.log('Added deleteEvent API');
}
