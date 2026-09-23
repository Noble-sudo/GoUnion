const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const mentionState = `
  const [mentionQuery, setMentionQuery] = React.useState(null);
  const handleMessageChange = (val) => {
      setMessageText(val);
      const words = val.split(' ');
      const lastWord = words[words.length - 1];
      if (lastWord.startsWith('@')) {
          setMentionQuery(lastWord.substring(1).toLowerCase());
      } else {
          setMentionQuery(null);
      }
      if (val && typeof handleTyping === 'function') handleTyping();
  };
`;

c = c.replace(
    /return \(\s*<div className=\{\`\$\{embeddedChatId \? "h-\[600px\]"/,
    mentionState + '\n    return (\n        <div className={`\\${embeddedChatId ? "h-[600px]"'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched mention state into Messages.jsx');
