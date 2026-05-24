import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { 
  Terminal, 
  Users, 
  Layers, 
  Shuffle, 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default function InterviewSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'Technical', title: 'Technical', desc: 'Focuses on Python, APIs, ML, Databases, and architecture fundamentals.', icon: Terminal },
    { id: 'Project-based', title: 'Project-based', desc: 'Drills down into your uploaded projects, architectural choices, and tech stacks.', icon: Layers },
    { id: 'Behavioral', title: 'Behavioral', desc: 'Evaluates conflict resolution, teamwork, leadership, and soft skills.', icon: Users },
    { id: 'Mixed', title: 'Mixed Session', desc: 'A blended, comprehensive mock interview testing all domains.', icon: Shuffle }
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await apiService.interview.startSession(
        user.id,
        category,
        difficulty,
        questionCount
      );
      // Cache session in state or local storage for the live page to load
      localStorage.setItem('active_interview_session_id', session.id);
      router.push('/interview/session');
    } catch (err) {
      console.error("[Setup Session] Failed:", err);
      setError(err.message || 'Failed to start interview session. Please try again.');
      setLoading(false);
    }
  };

  const hasResume = user && user.resume_url;

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white">Setup Interview Session</h1>
          <p className="text-sm text-dark-muted font-medium mt-1">
            Customize your mock parameters, focus goals, and complexity levels.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resume warning */}
        {!hasResume && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 text-yellow-400">
            <div className="flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <div className="flex flex-col text-xs font-semibold">
                <span className="text-white font-bold mb-0.5">Resume Not Detected</span>
                <span>We highly recommend uploading a resume PDF first so our RAG system can customize technical and project queries. Proceeding will trigger general software industry questions.</span>
              </div>
            </div>
            <Link 
              href="/analysis"
              className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider hover:bg-yellow-500/20 text-center"
            >
              Upload Now
            </Link>
          </div>
        )}

        {loading ? (
          /* High-end loading dashboard visualizer */
          <div className="glass rounded-2xl p-10 border border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-t-2 border-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase size={24} className="text-primary-light animate-pulse" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-black text-white animate-pulse">Assembling Your Coach...</h4>
              <p className="text-xs text-dark-muted font-bold tracking-wide mt-2">
                RETRIEVING RAG EMBEDDINGS • FORMATTING {category.toUpperCase()} SCENARIOS • LAUNCHING LLAMA 3.3
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Category selection */}
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">1. Focus Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const CatIcon = cat.icon;
                  const selected = category === cat.id;
                  
                  // Block project-based setup if no resume is parsed
                  const isDisabled = cat.id === 'Project-based' && !hasResume;
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => !isDisabled && setCategory(cat.id)}
                      disabled={isDisabled}
                      className={`glass rounded-2xl p-5 border text-left flex items-start gap-4 transition-all outline-none ${
                        selected 
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                          : (isDisabled ? 'opacity-40 cursor-not-allowed border-white/5 bg-transparent' : 'border-white/5 bg-transparent hover:bg-white/[0.02] hover:border-white/10')
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                        selected ? 'bg-primary/10 border-primary/30 text-primary-light' : 'bg-white/5 border-white/10 text-dark-muted'
                      }`}>
                        <CatIcon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white leading-snug">{cat.title}</h4>
                        <p className="text-xs text-dark-muted font-semibold leading-relaxed mt-1">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty selection */}
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">2. Experience / Complexity</h3>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 rounded-2xl max-w-md">
                {difficulties.map((diff) => {
                  const selected = difficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider outline-none ${
                        selected 
                          ? 'bg-primary text-white purple-glow-sm shadow-md' 
                          : 'text-dark-muted hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question count selector */}
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">3. Question Count</h3>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex justify-between text-[10px] text-dark-muted font-bold tracking-wide mt-2">
                    <span>3 QUESTIONS</span>
                    <span>10 QUESTIONS</span>
                    <span>15 QUESTIONS</span>
                  </div>
                </div>
                <div className="h-14 w-20 rounded-2xl glass border border-white/10 flex flex-col items-center justify-center font-black">
                  <span className="text-lg leading-none text-white">{questionCount}</span>
                  <span className="text-[8px] font-black uppercase text-dark-muted tracking-wider mt-0.5">COUNT</span>
                </div>
              </div>
            </div>

            {/* Begin Button */}
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-slate-200 shadow-2xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              <span>Initiate Mock Practice Session</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
export async function getStaticProps() {
  return { props: {} };
}
