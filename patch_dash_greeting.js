import fs from 'fs';

let dashboardCode = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');

// The greeting is currently:
// const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
// Let's replace it with a rotating message array.

const greetingLogic = `const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const messages = [
    timeGreeting,
    "Ready to connect",
    "What's on your mind",
    "Stay inspired",
    "Welcome back"
  ];
  // Stable random per session/render
  const [greeting] = React.useState(() => messages[Math.floor(Math.random() * messages.length)]);
`;

dashboardCode = dashboardCode.replace(
  /const hour = new Date\(\)\.getHours\(\);\s*const greeting = hour < 12 \? "Good morning" : hour < 18 \? "Good afternoon" : "Good evening";/,
  greetingLogic
);

fs.writeFileSync('frontend/pages/Dashboard.jsx', dashboardCode);
console.log('Patched Dashboard.jsx greeting');
