const fs = require('fs');

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const apiAdditions = `
        getEvents: async (groupId) => {
            const res = await apiClient.get(\`/groups/\${groupId}/events\`);
            return res.data;
        },
        createEvent: async (groupId, data) => {
            const res = await apiClient.post(\`/groups/\${groupId}/events\`, data);
            return res.data;
        },
        rsvpEvent: async (eventId, status) => {
            const res = await apiClient.post(\`/groups/events/\${eventId}/rsvp\`, { status });
            return res.data;
        },
`;

if (!c.includes('getEvents: async')) {
  c = c.replace(/getRequests: async \(id\) => \{[\s\S]*?return res\.data;\s*\},\n/, match => match + apiAdditions);
  fs.writeFileSync('frontend/services/api.js', c);
  console.log('Added event API methods');
}
