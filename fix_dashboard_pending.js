const fs = require('fs');
let content = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');

const banner = `
        {user?.verification_status === 'PENDING' && (
          <div className="mx-5 sm:mx-0 mb-6 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-blue-400 font-bold text-lg mb-1">Identity Under Review</h3>
              <p className="text-blue-400/80 text-sm leading-relaxed">
                Your campus network is temporarily locked. An admin is currently reviewing your identity documentation. Once approved, your campus feed, groups, and network will automatically unlock!
              </p>
            </div>
          </div>
        )}
        <FollowBackUrge className="mt-4 block lg:hidden mx-5" />`;

content = content.replace(
  /<FollowBackUrge className="mt-4 block lg:hidden mx-5" \/>/,
  banner
);

fs.writeFileSync('frontend/pages/Dashboard.jsx', content);
console.log('Injected PENDING banner into Dashboard');
