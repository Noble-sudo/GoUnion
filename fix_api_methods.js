const fs = require('fs');
let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const eventMethods = `
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
        },`;

// Remove from admin
c = c.replace(/        getEvents: async \(groupId\) => \{[\s\S]*?\},/g, '');
c = c.replace(/        createEvent: async \(groupId, data\) => \{[\s\S]*?\},/g, '');
c = c.replace(/        rsvpEvent: async \(eventId, status\) => \{[\s\S]*?\},/g, '');

// Add to groups
c = c.replace(/groups: \{/, 'groups: {' + eventMethods);

fs.writeFileSync('frontend/services/api.js', c);
console.log('Fixed api.js');
