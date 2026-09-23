import fs from 'fs';

let c = fs.readFileSync('frontend/components/admin/BroadcastCenter.jsx', 'utf8');

if (!c.includes("import { api } from '../../services/api';")) {
    c = c.replace(
        "import { useToast } from '../../components/ui/Toast';",
        "import { useToast } from '../../components/ui/Toast';\nimport { api } from '../../services/api';"
    );
}

const sendFunctionRegex = /const handleSend = async \(\) => \{([\s\S]*?)\};/;
const newSendFunction = `const handleSend = async () => {
        if (!title.trim() || !message.trim()) return;
        setIsSending(true);
        try {
            const payload = {
                title,
                message,
                audience,
                institution_id: audience === 'campus' ? document.querySelector('select[name="campus_select"]').value : null
            };
            if (audience === 'campus' && !payload.institution_id) {
                toast("Please select a campus.", "error");
                setIsSending(false);
                return;
            }
            await api.admin.broadcast(payload);
            toast('Broadcast sent successfully!', 'success');
            setTitle('');
            setMessage('');
        } catch (error) {
            toast('Failed to send broadcast.', 'error');
        } finally {
            setIsSending(false);
        }
    };`;

c = c.replace(sendFunctionRegex, newSendFunction);

// Fix the select box for campus to have name="campus_select"
c = c.replace(/<select className="w-full/g, '<select name="campus_select" className="w-full');

fs.writeFileSync('frontend/components/admin/BroadcastCenter.jsx', c);
console.log('Wired BroadcastCenter to API!');
