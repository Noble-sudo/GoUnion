const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Landing.jsx', 'utf8');

const mockupSection = `
        {/* 📱 App Preview Section */}
        <section className="px-5 md:px-8 pb-32 pt-10 relative z-20 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-5xl font-black tracking-tight mb-4 text-white">Inside Reconnected</h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">Upload your own screenshots to public/screenshots to display them here.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative">
              {/* Decorative background glow behind phones */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[300px] bg-[var(--rc-go)]/10 blur-[120px] rounded-full z-0 pointer-events-none" />

              {/* Phone Mockup 1: Feed */}
              <motion.div 
                initial={{ opacity: 0, y: 50, rotate: -5 }}
                whileInView={{ opacity: 1, y: 0, rotate: -5 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-[280px] h-[580px] rounded-[3rem] border-4 border-zinc-800 bg-black overflow-hidden shadow-2xl shadow-[var(--rc-go)]/10"
              >
                {/* Status Bar */}
                <div className="absolute top-0 w-full h-7 bg-black z-20 flex justify-center pt-2">
                  <div className="w-20 h-4 bg-zinc-900 rounded-full" />
                </div>
                {/* Mockup Content - Replace with actual image */}
                <div className="w-full h-full bg-[#111114] flex flex-col items-center justify-center p-6 text-center border border-white/5">
                    <Activity size={32} className="text-[var(--rc-go)] mb-4" />
                    <h3 className="font-bold text-white mb-2">Campus Feed</h3>
                    <p className="text-xs text-white/40">Replace this with your feed screenshot (/public/screenshot-feed.png)</p>
                    
                    {/* Placeholder content if no image */}
                    <div className="w-full mt-8 space-y-4">
                      <div className="h-24 bg-white/5 rounded-2xl w-full" />
                      <div className="h-32 bg-white/5 rounded-2xl w-full" />
                      <div className="h-24 bg-white/5 rounded-2xl w-full" />
                    </div>
                </div>
              </motion.div>

              {/* Phone Mockup 2: Messages (Center, floating slightly higher) */}
              <motion.div 
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: -20 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-20 w-[300px] h-[620px] rounded-[3.5rem] border-[6px] border-zinc-700 bg-black overflow-hidden shadow-2xl shadow-black/50 hidden md:block"
              >
                <div className="absolute top-0 w-full h-8 bg-black z-20 flex justify-center pt-2">
                  <div className="w-24 h-5 bg-zinc-800 rounded-full" />
                </div>
                <div className="w-full h-full bg-[#111114] flex flex-col items-center justify-center p-6 text-center border border-white/5">
                    <MessageSquare size={40} className="text-[var(--rc-go)] mb-4" />
                    <h3 className="font-bold text-lg text-white mb-2">Real-time Chat</h3>
                    <p className="text-xs text-white/40">Replace this with your messages screenshot (/public/screenshot-chat.png)</p>
                    
                    <div className="w-full mt-8 space-y-3">
                      <div className="h-12 bg-white/10 rounded-2xl w-3/4 self-start" />
                      <div className="h-16 bg-[var(--rc-go)]/20 rounded-2xl w-3/4 ml-auto" />
                      <div className="h-12 bg-white/10 rounded-2xl w-1/2 self-start" />
                      <div className="h-12 bg-[var(--rc-go)]/20 rounded-2xl w-2/3 ml-auto" />
                    </div>
                </div>
              </motion.div>

              {/* Phone Mockup 3: Konnect/Groups */}
              <motion.div 
                initial={{ opacity: 0, y: 50, rotate: 5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 5 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative z-10 w-[280px] h-[580px] rounded-[3rem] border-4 border-zinc-800 bg-black overflow-hidden shadow-2xl shadow-[var(--rc-teaky)]/10"
              >
                <div className="absolute top-0 w-full h-7 bg-black z-20 flex justify-center pt-2">
                  <div className="w-20 h-4 bg-zinc-900 rounded-full" />
                </div>
                <div className="w-full h-full bg-[#111114] flex flex-col items-center justify-center p-6 text-center border border-white/5">
                    <Globe size={32} className="text-[var(--rc-teaky)] mb-4" />
                    <h3 className="font-bold text-white mb-2">Konnect Network</h3>
                    <p className="text-xs text-white/40">Replace this with your network screenshot (/public/screenshot-konnect.png)</p>
                    
                    <div className="w-full mt-8 grid grid-cols-2 gap-3">
                      <div className="h-24 bg-white/5 rounded-2xl w-full" />
                      <div className="h-24 bg-white/5 rounded-2xl w-full" />
                      <div className="h-24 bg-white/5 rounded-2xl w-full" />
                      <div className="h-24 bg-white/5 rounded-2xl w-full" />
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
`;

c = c.replace(
    '</section>\n\n        {/* ⚡ Ecosystem Section */}',
    '</section>\n' + mockupSection + '\n        {/* ⚡ Ecosystem Section */}'
);

fs.writeFileSync('frontend/pages/Landing.jsx', c);
console.log('Injected app preview section');
