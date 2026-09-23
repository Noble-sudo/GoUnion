import fs from 'fs';

let dashboard = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');

const buttonStr = `
        <button 
          onClick={() => {
            if (window.caches) {
              caches.keys().then(function(names) {
                for (let name of names) caches.delete(name);
              });
            }
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload(true);
          }}
          className="mx-5 mt-2 px-3 py-1 bg-red-600 text-white font-bold rounded-lg text-xs"
        >
          FORCE CLEAR CACHE
        </button>
`;

if (!dashboard.includes('FORCE CLEAR CACHE')) {
    dashboard = dashboard.replace('<div className="max-w-2xl mx-auto w-full">', '<div className="max-w-2xl mx-auto w-full">' + buttonStr);
    fs.writeFileSync('frontend/pages/Dashboard.jsx', dashboard);
}
