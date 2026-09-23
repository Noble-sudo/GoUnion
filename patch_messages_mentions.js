const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const mentionState = `
  const [mentionQuery, setMentionQuery] = useState(null);
  const handleMessageChange = (val) => {
      setMessageText(val);
      const words = val.split(' ');
      const lastWord = words[words.length - 1];
      if (lastWord.startsWith('@')) {
          setMentionQuery(lastWord.substring(1).toLowerCase());
      } else {
          setMentionQuery(null);
      }
      if (val) handleTyping();
  };
`;

c = c.replace(
    /return \(\n\s*<div className=\{\`\$\{embeddedChatId \? "h-\[600px\]" : "h-\[100dvh\]"\} w-full bg-\[\#030303\] text-white/,
    mentionState + '\n    return (\n          <div className={`${embeddedChatId ? "h-[600px]" : "h-[100dvh]"} w-full bg-[#030303] text-white'
);

c = c.replace(
    /onChange=\{\(e\) => \{\s*setMessageText\(e\.target\.value\);\s*if \(e\.target\.value\) handleTyping\(\);\s*\}\}/,
    'onChange={(e) => handleMessageChange(e.target.value)}'
);

// Inject the mentions popup right before the textarea
// Let's find where the textarea is:
// <textarea ref={inputRef} value={messageText}
const mentionsPopup = `
    {mentionQuery !== null && activeChat?.participants && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-[#111114] border border-white/10 rounded-xl shadow-2xl p-2 z-50 max-h-48 overflow-y-auto">
            {activeChat.participants.filter(p => p.username.toLowerCase().includes(mentionQuery) || p?.fullName?.toLowerCase().includes(mentionQuery)).map(p => (
                <button key={p.id} onClick={(e) => {
                    e.preventDefault();
                    const words = messageText.split(' ');
                    words[words.length - 1] = \`@\${p.username} \`;
                    handleMessageChange(words.join(' '));
                    inputRef.current?.focus();
                }} className="flex items-center gap-2 w-full p-2 text-left hover:bg-white/5 rounded-lg transition-colors">
                    <Avatar src={p.avatarUrl} className="w-6 h-6 rounded-full bg-white/10" />
                    <span className="text-white text-sm font-semibold">{p.fullName}</span>
                    <span className="text-white/40 text-xs">@{p.username}</span>
                </button>
            ))}
        </div>
    )}
`;

c = c.replace(
    /<textarea/g,
    mentionsPopup + '\n<textarea'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched mentions logic into Messages.jsx');
