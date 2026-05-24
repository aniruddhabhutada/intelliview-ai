import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { 
  Trophy, 
  Award, 
  ArrowRight, 
  Download, 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  ClipboardCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function InterviewSummary() {
  const { user } = useAuth();
  const router = useRouter();
  const { session_id } = router.query;
  
  const [summary, setSummary] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expandedQs, setExpandedQs] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!router.isReady || !user) return;
    
    const targetSessionId = session_id || localStorage.getItem('active_interview_session_id');
    if (!targetSessionId) {
      router.push('/interview/setup');
      return;
    }

    setLoading(true);
    
    // Load the final ended session summary from the backend
    apiService.interview.endSession(targetSessionId)
      .then((data) => {
        setSummary(data);
        
        // Grab main session history to extract categories/diff metadata
        return apiService.interview.getHistory(user.id);
      })
      .then((sessions) => {
        const matching = sessions.find(s => s.id === targetSessionId);
        setSession(matching);
        
        // Trigger high-end confetti burst for completed candidate
        import('canvas-confetti').then((module) => {
          const confetti = module.default;
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#7c3aed', '#a78bfa', '#ffffff', '#312e81']
          });
        });
      })
      .catch((err) => {
        console.error("[Summary] Loading failed:", err);
        setError('Failed to fetch interview summary.');
      })
      .finally(() => setLoading(false));
  }, [router.isReady, session_id, user]);

  const toggleQ = (qId) => {
    setExpandedQs(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };
  const handleShare = () => {
    if (!summary) return;
    const shareText = `🚀 I just completed a custom AI Mock Interview on Intelliview AI! I scored a solid ${summary.overall_score.toFixed(1)}/10.0 on ${session?.category || 'Software Engineering'} mock. Prep yours for free!`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const getScoreBg = (score) => {
    if (score >= 8.5) return 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400';
    if (score >= 7.0) return 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/30 text-yellow-400';
    return 'from-red-500/10 to-red-600/5 border-red-500/30 text-red-400';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error || !summary) {
    return (
      <Layout>
        <div className="glass rounded-2xl p-8 border border-white/5 text-center flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="text-red-500" size={32} />
          <h3 className="text-lg font-black text-white">Evaluation Load Failed</h3>
          <p className="text-xs text-dark-muted max-w-sm">We couldn't compile your scorecard summary. Start a new setup mock session to register results.</p>
          <button 
            onClick={() => {
              localStorage.removeItem('active_interview_session_id');
              router.push('/interview/setup');
            }} 
            className="px-5 py-3 rounded-xl bg-primary text-white font-extrabold text-xs uppercase tracking-wider shadow-lg"
          >
            Back to Setup
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-white">Interview Performance Scorecard</h1>
          <p className="text-sm text-dark-muted font-medium mt-1">
            Complete assessment, question analytics, and custom-generated skills roadmap.
          </p>
        </div>

        {/* TOP META PANEL: Score Gauge & Executive Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Circular overall score card */}
          <div className="lg:col-span-4 glass rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center bg-zinc-950/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest leading-none">
              Overall Performance
            </span>
            
            {/* Visual circle rating */}
            <div className="relative flex items-center justify-center mt-6 mb-6">
              <svg className="w-36 h-36">
                <circle className="text-white/5" strokeWidth="10" stroke="currentColor" fill="transparent" r="58" cx="72" cy="72" />
                <circle 
                  className="text-primary" 
                  strokeWidth="10" 
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * summary.overall_score) / 10}
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="58" 
                  cx="72" 
                  cy="72" 
                  transform="rotate(-90 72 72)"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center font-black">
                <span className="text-3xl text-white leading-none">{summary.overall_score.toFixed(1)}</span>
                <span className="text-[8px] font-bold text-dark-muted uppercase mt-1 tracking-widest">RATING / 10</span>
              </div>
            </div>

            <span className="text-xs font-extrabold text-white leading-none bg-primary/15 border border-primary/20 px-3 py-1.5 rounded-lg mb-6">
              Focus: {session?.category || "Mixed"} Session
            </span>

            {/* Scorecard Action links */}
            <div className="flex flex-col gap-2 w-full">
              <a 
                href={apiService.interview.getReportURL(summary.session_id)}
                download
                className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-slate-200 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-102 active:scale-95"
              >
                <Download size={14} />
                <span>Download Report PDF</span>
              </a>
              <button 
                onClick={handleShare}
                className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <ClipboardCheck size={14} className="text-green-400" /> : <Share2 size={14} />}
                <span>{copied ? "Copied scorecard!" : "Share scorecard"}</span>
              </button>
            </div>
          </div>

          {/* Executive Summary paragraph */}
          <div className="lg:col-span-8 glass rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col justify-between bg-zinc-950/10">
            <div>
              <div className="flex items-center gap-2 font-black text-sm text-primary-light uppercase tracking-wider mb-4">
                <Trophy size={16} />
                <span>Executive Assessment Summary</span>
              </div>
              <p className="text-sm md:text-base text-dark-muted font-semibold leading-relaxed">
                {summary.feedback_summary}
              </p>
            </div>
            
            {/* Daily Challenge call to action */}
            <div className="mt-8 border-t border-white/5 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center">
                  <Zap size={16} className="animate-pulse" />
                </div>
                <div className="flex flex-col text-[10px] font-bold">
                  <span className="text-white">Daily Interview Challenge</span>
                  <span className="text-dark-muted font-semibold leading-none mt-0.5">Test consistency to hit the leaderboard!</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('active_interview_session_id');
                  router.push('/interview/setup');
                }}
                className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-extrabold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 w-max"
              >
                <span>Launch Another Mock</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* ROADMAP ACTION TIMELINE AND DETAILED RESPONSE LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Action Roadmap */}
          <div className="lg:col-span-5 glass rounded-3xl p-6 border border-white/5 bg-zinc-950/20">
            <div className="flex items-center gap-2 font-black text-sm text-primary-light uppercase tracking-wider mb-6">
              <Compass size={16} />
              <span>Career Improvement Roadmap</span>
            </div>
            
            <div className="flex flex-col gap-5 relative pl-4 border-l border-white/10">
              {summary.roadmap.map((step, idx) => (
                <div key={idx} className="relative flex flex-col gap-1">
                  {/* Dot bullet indicator */}
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary border-4 border-[#09090b]"></span>
                  <span className="text-[10px] font-black text-primary-light uppercase leading-none">Milestone {idx + 1}</span>
                  <p className="text-xs text-dark-muted font-bold leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Question-Answer expanders */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Detailed Question Assessments</h3>
            
            {summary.details.map((item, idx) => {
              const expanded = expandedQs[idx];
              const qNum = idx + 1;
              const feedback = item.feedback || {};
              
              return (
                <div 
                  key={idx} 
                  className={`glass rounded-2xl border transition-all overflow-hidden ${
                    expanded ? 'border-white/10 bg-zinc-950/40 shadow-xl' : 'border-white/5 bg-[#18181b]/30'
                  }`}
                >
                  {/* Header bar click triggers dropdown */}
                  <button 
                    onClick={() => toggleQ(idx)}
                    className="w-full p-5 flex items-center justify-between text-left outline-none"
                  >
                    <div className="flex flex-col pr-4 flex-1">
                      <span className="text-[9px] font-black text-primary-light uppercase tracking-widest mb-1.5">Question {qNum} • {item.category}</span>
                      <h4 className="text-sm font-bold text-white leading-snug">{item.question_text}</h4>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-md flex-shrink-0">
                        Score: {item.score.toFixed(1)}
                      </span>
                      {expanded ? <ChevronUp size={16} className="text-dark-muted" /> : <ChevronDown size={16} className="text-dark-muted" />}
                    </div>
                  </button>

                  {/* Dropdown panel detail lists */}
                  {expanded && (
                    <div className="px-5 pb-5 border-t border-white/5 flex flex-col gap-4 pt-4 bg-[#09090b]/80 animate-fade-in text-xs font-semibold text-dark-muted">
                      {/* Answer quote block */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Candidate Response</span>
                        <blockquote className="p-3 bg-zinc-900 border border-white/5 rounded-xl font-mono text-[10px] leading-relaxed text-white italic whitespace-pre-wrap">
                          "{item.user_answer}"
                        </blockquote>
                      </div>

                      {/* Technical details evaluation */}
                      {feedback.technical_accuracy && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-white uppercase tracking-wider">Technical Accuracy</span>
                          <p className="leading-relaxed">{feedback.technical_accuracy}</p>
                        </div>
                      )}

                      {/* Clarity details evaluation */}
                      {feedback.clarity && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-white uppercase tracking-wider">Clarity & Communication</span>
                          <p className="leading-relaxed">{feedback.clarity}</p>
                        </div>
                      )}

                      {/* Strengths & gaps bullets */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-3 mt-1">
                        <div>
                          <span className="text-green-400 font-bold flex items-center gap-1 mb-1.5">
                            <CheckCircle size={12} />
                            <span>Correct Metrics</span>
                          </span>
                          {feedback.strengths && feedback.strengths.map((str, i) => (
                            <span key={i} className="block">• {str}</span>
                          ))}
                        </div>
                        <div>
                          <span className="text-yellow-400 font-bold flex items-center gap-1 mb-1.5">
                            <AlertTriangle size={12} />
                            <span>Gaps / Improvements</span>
                          </span>
                          {feedback.improvements && feedback.improvements.map((imp, i) => (
                            <span key={i} className="block">• {imp}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Layout>
  );
}
export async function getStaticProps() {
  return { props: {} };
}

