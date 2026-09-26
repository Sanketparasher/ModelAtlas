import React, { useState } from 'react';

const IconBrain = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

const IconZap = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconTrophy = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const IconCheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const Navbar = ({ activePage, setActivePage }) => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-neutral-950/80 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActivePage('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-400/40 transition-all duration-300">
              <IconBrain className="h-5 w-5 text-neutral-950" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">ModelAtlas</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {['home', 'assessment', 'leaderboard'].map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                    activePage === page 
                      ? 'bg-amber-500/10 text-amber-400 shadow-[inset_0_1px_0_0_rgba(245,158,11,0.2)]' 
                      : 'text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center md:hidden">
             <div className="flex space-x-2">
                <button onClick={() => setActivePage('home')} className={`text-xs px-2 py-1 rounded ${activePage === 'home' ? 'text-amber-400 bg-amber-950/30' : 'text-neutral-400'}`}>Home</button>
                <button onClick={() => setActivePage('assessment')} className={`text-xs px-2 py-1 rounded ${activePage === 'assessment' ? 'text-amber-400 bg-amber-950/30' : 'text-neutral-400'}`}>Find</button>
                <button onClick={() => setActivePage('leaderboard')} className={`text-xs px-2 py-1 rounded ${activePage === 'leaderboard' ? 'text-amber-400 bg-amber-950/30' : 'text-neutral-400'}`}>Ranks</button>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const HomeView = ({ onNavigate }) => (
  <div className="animate-in fade-in duration-700">
    <div className="text-center max-w-3xl mx-auto mb-16 pt-16 relative">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white relative z-10">
        Find the right AI model for your work in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">under 30 seconds</span>
      </h1>
      <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto relative z-10">
        Benchmark-backed, Cost-aware. Navigate the complex landscape of Large Language Models to find the perfect balance of capabilities, speed, and price.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
        <button 
          onClick={() => onNavigate('assessment')}
          className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-8 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2"
        >
          <IconZap className="h-5 w-5" />
          Start Assessment
        </button>
        <button 
          onClick={() => onNavigate('leaderboard')}
          className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-amber-500/50 px-8 py-3.5 rounded-xl font-medium transition-all"
        >
          View Leaderboard
        </button>
      </div>
    </div>

    { }
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto px-4 relative z-10">
      <div className="bg-neutral-900/80 backdrop-blur-md rounded-2xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors shadow-2xl">
        <div className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Models Tracked</div>
        <div className="text-4xl font-black text-white flex items-baseline gap-2">
          8 <span className="text-lg text-orange-400 font-medium">+2 this week</span>
        </div>
      </div>
      <div className="bg-neutral-900/80 backdrop-blur-md rounded-2xl p-6 border border-neutral-800 hover:border-amber-900/50 transition-colors shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><IconZap className="w-16 h-16 text-amber-400" /></div>
        <div className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2 relative z-10">Best Value</div>
        <div className="text-3xl font-black text-amber-400 relative z-10">O4 Mini</div>
        <div className="text-sm text-neutral-500 mt-1 relative z-10">Leading performance per dollar</div>
      </div>
      <div className="bg-neutral-900/80 backdrop-blur-md rounded-2xl p-6 border border-neutral-800 hover:border-orange-900/50 transition-colors shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><IconTrophy className="w-16 h-16 text-orange-400" /></div>
        <div className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2 relative z-10">Frontier Pick</div>
        <div className="text-3xl font-black text-orange-400 relative z-10">Claude Opus 4</div>
        <div className="text-sm text-neutral-500 mt-1 relative z-10">Top reasoning capabilities</div>
      </div>
    </div>
  </div>
);

const AssessmentView = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [workload, setWorkload] = useState(null);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleWorkloadSelect = (selectedWorkload) => {
    setWorkload(selectedWorkload);
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setRole(null);
    setWorkload(null);
  };

  return (
    <div className="max-w-4xl mx-auto pt-10 px-4 animate-in fade-in duration-500">
      {/* Progress Indicator */}
      <div className="mb-12 flex items-center justify-center space-x-4 text-sm font-medium">
        <div className={`flex items-center gap-2 transition-colors duration-300 ${step >= 1 ? 'text-amber-400' : 'text-neutral-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${step >= 1 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-neutral-900 border border-neutral-800'}`}>1</div>
          <span className="hidden sm:inline">Role</span>
        </div>
        <div className={`h-px w-8 sm:w-16 transition-colors duration-300 ${step >= 2 ? 'bg-amber-500/50' : 'bg-neutral-800'}`}></div>
        <div className={`flex items-center gap-2 transition-colors duration-300 ${step >= 2 ? 'text-amber-400' : 'text-neutral-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${step >= 2 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-neutral-900 border border-neutral-800'}`}>2</div>
          <span className="hidden sm:inline">Workload</span>
        </div>
        <div className={`h-px w-8 sm:w-16 transition-colors duration-300 ${step >= 3 ? 'bg-amber-500/50' : 'bg-neutral-800'}`}></div>
        <div className={`flex items-center gap-2 transition-colors duration-300 ${step >= 3 ? 'text-amber-400' : 'text-neutral-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${step >= 3 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-neutral-900 border border-neutral-800'}`}>3</div>
          <span className="hidden sm:inline">Result</span>
        </div>
      </div>

      { }
      {/* Step 1: Role */}
      {step === 1 && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-2">Select your primary role</h2>
          <p className="text-center text-neutral-400 mb-8">This helps us tailor capabilities to your technical needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['For Builders', 'For Researchers', 'For Teams'].map((r) => (
              <button 
                key={r}
                onClick={() => handleRoleSelect(r)}
                className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-amber-500 hover:bg-neutral-800/80 transition-all text-left group shadow-lg hover:shadow-amber-900/20"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-950 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors text-neutral-500 group-hover:text-amber-400 border border-neutral-800 group-hover:border-amber-500/30">
                  <IconCheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{r}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">Optimize for tools, APIs, integration depth, and specialized task efficiencies.</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Workload */}
      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-2">Define your workload</h2>
          <p className="text-center text-neutral-400 mb-8">What is the primary task the model will handle?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {['Heavy Coding & Logic', 'Creative Writing & Prose', 'Data Extraction & Structuring', 'Fast Chat & Conversational'].map((w) => (
              <button 
                key={w}
                onClick={() => handleWorkloadSelect(w)}
                className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-amber-500 hover:bg-neutral-800 transition-all flex items-center justify-between group shadow-lg"
              >
                <span className="text-lg font-medium text-neutral-300 group-hover:text-white transition-colors">{w}</span>
                <IconZap className="w-5 h-5 text-neutral-600 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button onClick={() => setStep(1)} className="text-neutral-500 hover:text-amber-400 text-sm font-medium transition-colors">← Back to Roles</button>
          </div>
        </div>
      )}

      { }
      {/* Step 3: Result */}
      {step === 3 && (
        <div className="animate-in zoom-in-95 duration-700">
          <div className="bg-gradient-to-b from-amber-900/30 to-neutral-950 border border-amber-500/30 rounded-3xl p-1 shadow-2xl shadow-amber-900/20">
            <div className="bg-neutral-900/90 backdrop-blur-xl rounded-[22px] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                     <IconTrophy className="w-6 h-6 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-300 uppercase tracking-widest text-sm">Top Recommendation</h2>
                </div>
                
                <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300 mb-6 drop-shadow-sm">Claude 3.5 Sonnet</h3>
                
                <p className="text-lg text-neutral-300 mb-10 max-w-2xl leading-relaxed">
                  Based on your selection for <span className="text-amber-400 font-semibold">{workload}</span> as a <span className="text-amber-400 font-semibold">{role.replace('For ', '')}</span>, this model offers the definitive balance of deep reasoning and rapid token generation.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="bg-neutral-950/50 p-5 rounded-xl border border-neutral-800">
                    <div className="text-xs text-neutral-500 uppercase font-semibold mb-2">Quality</div>
                    <div className="text-orange-400 font-bold text-lg">Exceptional</div>
                  </div>
                  <div className="bg-neutral-950/50 p-5 rounded-xl border border-neutral-800">
                    <div className="text-xs text-neutral-500 uppercase font-semibold mb-2">Cost</div>
                    <div className="text-white font-bold text-lg">$3.00 <span className="text-xs text-neutral-500 font-normal">/ 1M in</span></div>
                  </div>
                  <div className="bg-neutral-950/50 p-5 rounded-xl border border-neutral-800">
                    <div className="text-xs text-neutral-500 uppercase font-semibold mb-2">Speed</div>
                    <div className="text-amber-400 font-bold text-lg">Fast</div>
                  </div>
                  <div className="bg-neutral-950/50 p-5 rounded-xl border border-neutral-800">
                    <div className="text-xs text-neutral-500 uppercase font-semibold mb-2">Context</div>
                    <div className="text-white font-bold text-lg">200k <span className="text-xs text-neutral-500 font-normal">tokens</span></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    View Documentation
                  </button>
                  <button onClick={reset} className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3 rounded-xl font-medium transition-all border border-neutral-700">
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeaderboardView = () => {
  const modelsData = [
    { rank: 1, name: 'Claude Opus 4', provider: 'Anthropic', score: 98, quality: 'Exceptional', cost: 'High ($15/M)', speed: 'Moderate' },
    { rank: 2, name: 'GPT-4o', provider: 'OpenAI', score: 96, quality: 'Excellent', cost: 'Medium ($5/M)', speed: 'Fast' },
    { rank: 3, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', score: 94, quality: 'Excellent', cost: 'Medium ($3/M)', speed: 'Fast' },
    { rank: 4, name: 'Llama 3 (70B)', provider: 'Meta', score: 90, quality: 'Great', cost: 'Very Low', speed: 'Fast' },
    { rank: 5, name: 'O4 Mini', provider: 'OpenAI', score: 88, quality: 'Good', cost: 'Low ($0.15/M)', speed: 'Very Fast' },
    { rank: 6, name: 'Gemini 1.5 Pro', provider: 'Google', score: 87, quality: 'Great', cost: 'Medium', speed: 'Moderate' },
  ];

  return (
    <div className="max-w-6xl mx-auto pt-10 px-4 animate-in fade-in duration-500">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Global Leaderboard</h2>
          <p className="text-neutral-400 text-lg">Comprehensive ranking based on verified benchmark aggregates.</p>
        </div>
        <div>
          <span className="inline-block px-3 py-1 bg-amber-950/50 border border-amber-900/50 text-amber-400 text-sm font-medium rounded-full">
            Updated: Today
          </span>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-950/80 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-800">
                <th className="p-5 w-20 text-center">Rank</th>
                <th className="p-5">Model</th>
                <th className="p-5 text-center">Score</th>
                <th className="p-5">Quality</th>
                <th className="p-5">Cost Focus</th>
                <th className="p-5">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {modelsData.map((model) => (
                <tr key={model.name} className="hover:bg-neutral-800/50 transition-colors group">
                  <td className="p-5 text-center font-bold text-neutral-500 group-hover:text-amber-400 transition-colors">
                    #{model.rank}
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-white text-base mb-1">{model.name}</div>
                    <div className="text-xs text-neutral-500 font-medium">{model.provider}</div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-950 border border-orange-500/20 text-orange-400 font-black shadow-inner">
                      {model.score}
                    </div>
                  </td>
                  <td className="p-5 text-neutral-300 font-medium">{model.quality}</td>
                  <td className="p-5 text-neutral-400">{model.cost}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${
                      model.speed.includes('Fast') 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    }`}>
                      {model.speed}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activePage, setActivePage] = useState('home');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-amber-500/30 flex flex-col">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-grow pb-24">
        {activePage === 'home' && <HomeView onNavigate={setActivePage} />}
        {activePage === 'assessment' && <AssessmentView />}
        {activePage === 'leaderboard' && <LeaderboardView />}
      </main>

      <footer className="border-t border-neutral-900 py-8 bg-neutral-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-neutral-600 text-sm font-medium">
            &copy; 2026 ModelAtlas. All rights reserved.
          </div>
          <div className="flex gap-4 text-sm text-neutral-500">
            <a href="#" className="hover:text-amber-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-amber-400 transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}