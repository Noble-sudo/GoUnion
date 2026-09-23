import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

const newSplash = `const AppStartupSplash = () => {
    return _jsx("div", {
        className: "min-h-screen w-full bg-[#030303] text-white flex flex-col items-center justify-center",
        children: _jsxs("div", {
            className: "flex flex-col items-center",
            children: [
                _jsx("div", {
                    className: "w-16 h-16 rounded-2xl bg-white text-[#030303] flex items-center justify-center text-4xl font-black font-serif",
                    children: "R"
                }),
                _jsx("h1", {
                    className: "mt-6 font-serif text-3xl tracking-[0.2em]",
                    children: "RECONNECTED"
                }),
                _jsx("div", {
                    className: "mt-8 flex gap-2",
                    children: [0, 1, 2].map((i) =>
                        _jsx("div", {
                            key: i,
                            className: "w-2 h-2 rounded-full bg-white animate-pulse",
                            style: { animationDelay: i * 0.15 + 's' }
                        })
                    )
                })
            ]
        })
    });
};`;

c = c.replace(/const AppStartupSplash = \(\) => \{[\s\S]*?\};\nconst PageLoadingDots/, newSplash + '\nconst PageLoadingDots');

fs.writeFileSync('frontend/App.jsx', c);
console.log('Fixed Splash Screen');
