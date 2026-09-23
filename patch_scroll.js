const fs = require('fs');

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Replace the combined useEffect with two separate ones
const oldEffect = /useEffect\(\(\) => \{\s*const timer = setTimeout\(\(\) => \{\s*if \(highlightedMsgId\) \{\s*const el = document\.getElementById\(\`msg-\$\{highlightedMsgId\}\`\);\s*if \(el\) \{\s*el\.scrollIntoView\(\{ behavior: "smooth", block: "center" \}\);\s*setTimeout\(\(\) => setHighlightedMsgId\(null\), 3000\);\s*\} else \{\s*bottomRef\.current\?\.scrollIntoView\(\{ behavior: "smooth", block: "end" \}\);\s*\}\s*\} else \{\s*bottomRef\.current\?\.scrollIntoView\(\{ behavior: "smooth", block: "end" \}\);\s*\}\s*\}, 100\);\s*return \(\) => clearTimeout\(timer\);\s*\}, \[messages, selectedChatId, highlightedMsgId\]\);/g;

const newEffect = `      // Highlight scrolling
      useEffect(() => {
          if (highlightedMsgId) {
              const timer = setTimeout(() => {
                  const el = document.getElementById(\`msg-\${highlightedMsgId}\`);
                  if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
              }, 100);
              return () => clearTimeout(timer);
          }
      }, [highlightedMsgId]);

      // Message arrival / chat open scrolling
      useEffect(() => {
          // Only scroll to bottom on new messages if we aren't currently viewing a highlighted message
          if (!highlightedMsgId) {
              const timer = setTimeout(() => {
                  bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
              }, 100);
              return () => clearTimeout(timer);
          }
      }, [messages, selectedChatId]);`;

if (oldEffect.test(c)) {
    c = c.replace(oldEffect, newEffect);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log('Patched scrolling effects');
} else {
    console.log('Failed to find old effect. Dumping snippet to manually verify.');
}
