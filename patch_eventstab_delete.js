const fs = require('fs');
let c = fs.readFileSync('frontend/components/groups/EventsTab.jsx', 'utf8');

if (!c.includes('deleteMutation')) {
  c = c.replace(/const rsvpMutation = useMutation\(\{/, `const deleteMutation = useMutation({
    mutationFn: (eventId) => api.groups.deleteEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries(['group_events', groupId])
  });\n\n  const rsvpMutation = useMutation({`);

  c = c.replace(/<h4 className="font-serif text-xl font-bold text-white mb-2">\{ev\.title\}<\/h4>/, `<div className="flex items-start justify-between mb-2">
                <h4 className="font-serif text-xl font-bold text-white">{ev.title}</h4>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this event?")) {
                        deleteMutation.mutate(ev.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-white/30 hover:text-red-400 transition"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>`);

  fs.writeFileSync('frontend/components/groups/EventsTab.jsx', c);
  console.log('Added delete button to EventsTab');
}
