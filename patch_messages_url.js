import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// We need to import useLocation and parse the URL parameter
if (!content.includes('useLocation')) {
    content = content.replace('import { useNavigate } from "react-router-dom";', 'import { useNavigate, useLocation } from "react-router-dom";');
}

const urlEffect = `  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatParam = params.get("chat");
    if (chatParam) {
      setSelectedChatId(chatParam);
    }
  }, [location.search]);

  useEffect(() => {
      if (chats.length > 0 && !selectedChatId && window.innerWidth >= 768 && !location.search.includes("chat=")) {
          setSelectedChatId(chats[0].id);
      }
  }, [chats, selectedChatId, location.search]);`;

// Replace the old useEffect for selecting the first chat
content = content.replace(/useEffect\(\(\) => \{\n      if \(chats\.length > 0 && !selectedChatId && window\.innerWidth >= 768\) \{\n          setSelectedChatId\(chats\[0\]\.id\);\n      \}\n  \}, \[chats, selectedChatId\]\);/m, urlEffect);

fs.writeFileSync('frontend/pages/Messages.jsx', content);
console.log('Patched Messages.jsx for url parameter');
