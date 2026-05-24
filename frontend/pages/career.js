import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { 
  Sparkles, 
  Briefcase, 
  Linkedin, 
  Check, 
  Copy, 
  AlertCircle, 
  Cpu, 
  BookOpen, 
  ListTodo, 
  ChevronDown, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function CareerOptimizer() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'linkedin'
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [recommendations, setRecommendations] = useState(null);
  const [linkedinCopy, setLinkedinCopy] = useState(null);
  
  // Clipboard copy feedback states
  const [copyFeedback, setCopyFeedback] = useState({
    headline: false,
    about: false,
    summary: false
  });

  const [expandedWeek, setExpandedWeek] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    setErrorMsg(null);

    // Fetch resume analysis to verify upload status
    apiService.resume.getAnalysis(user.id)
      .then(() => {
        setHasResume(true);
        // Resume exists, trigger both recommendation and linkedin calls
        const recommendPromise = apiService.career.getRecommendations(user.id)
          .then((data) => setRecommendations(data));
        const linkedinPromise = apiService.career.getLinkedInProfile(user.id)
          .then((data) => setLinkedinCopy(data));
          
        return Promise.all([recommendPromise, linkedinPromise]);
      })
      .catch((err) => {
        console.error("[Career] Failed loading profile context:", err);
        setHasResume(false);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyFeedback(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setCopyFeedback(prev => ({ ...prev, [key]: false }));
        }, 2000);
      })
      .catch(err => {
        console.error("Clipboard copy failed:", err);
      });
  };

  const toggleWeek = (index) => {
    setExpandedWeek(expandedWeek === index ? null : index);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
        {/* Header Title Section */}
        <div className="flex items-center justify-between pb-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Career & Profile Optimizer</h1>
              <p className="text-xs text-dark-muted font-semibold mt-0.5">
                Elevate your online professional persona and align technical skills with recruiter demands.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest bg-white/5 px-3 py-1 rounded">PRODUCTION CORE</span>
        </div>

        {loading ? (
          /* High impact Loading Skeleton */
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-12 w-80 rounded-xl bg-white/5"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="h-80 md:col-span-2 rounded-2xl bg-white/5"></div>
              <div className="h-80 rounded-2xl bg-white/5"></div>
            </div>
          </div>
        ) : !hasResume ? (
          /* Empty state - Upload Resume Warning */
          <div className="glass rounded-3xl p-12 border border-white/5 text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-black/20">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[50px] pointer-events-none"></div>
            <AlertCircle className="text-primary-light mb-4 animate-bounce" size={48} />
            <h3 className="text-lg font-black text-white mb-2">Resume Context Required</h3>
            <p className="text-sm text-dark-muted max-w-md leading-relaxed mb-8">
              To build a tailored weekly roadmap, pinpoint matching internships, and write LinkedIn copy, IntelliView AI needs your resume. Upload your profile to get started!
            </p>
            <Link 
              href="/analysis"
              className="px-6 py-3.5 bg-white text-black hover:bg-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Upload Your Resume</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* Career Optimization Workspaces */
          <div className="flex flex-col gap-6">
            {/* Tab switch header */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-xl w-max">
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${activeTab === 'recommendations' ? 'bg-primary text-white purple-glow-sm shadow-md' : 'text-dark-muted hover:text-white'}`}
              >
                <TrendingUp size={14} />
                <span>Internship & Study Roadmap</span>
              </button>
              <button
                onClick={() => setActiveTab('linkedin')}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${activeTab === 'linkedin' ? 'bg-primary text-white purple-glow-sm shadow-md' : 'text-dark-muted hover:text-white'}`}
              >
                <Linkedin size={14} />
                <span>LinkedIn Copywriter</span>
              </button>
            </div>

            {/* TAB 1: Recommendations Workspace */}
            {activeTab === 'recommendations' && recommendations && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start animate-fade-in">
                
                {/* Left pane: Roadmaps weeks */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={18} className="text-primary-light" />
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Weekly Learning Roadmap</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {recommendations.learning_roadmap.map((weekData, index) => {
                      const isExpanded = expandedWeek === index;
                      return (
                        <div key={index} className="glass rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                          <button
                            onClick={() => toggleWeek(index)}
                            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition-all"
                          >
                            <div>
                              <span className="text-[10px] font-black text-primary-light uppercase tracking-widest block">Roadmap Step</span>
                              <h4 className="font-extrabold text-sm text-white mt-0.5">{weekData.week}</h4>
                            </div>
                            <ChevronDown size={18} className={`text-dark-muted transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`} />
                          </button>
                          
                          <div 
                            className={`transition-all duration-300 ${isExpanded ? 'max-h-[500px] border-t border-white/5' : 'max-h-0'}`}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="p-6 bg-black/10 flex flex-col gap-4">
                              <div>
                                <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Focus Objectives</span>
                                <p className="text-xs text-white leading-relaxed mt-1 font-medium italic">"{weekData.focus}"</p>
                              </div>

                              <div>
                                <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest block mb-2">Action Tasks</span>
                                <ul className="flex flex-col gap-2">
                                  {weekData.tasks.map((task, ti) => (
                                    <li key={ti} className="flex items-start gap-2.5 text-xs text-dark-muted leading-relaxed font-semibold">
                                      <ListTodo size={14} className="text-primary-light mt-0.5 flex-shrink-0" />
                                      <span>{task}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right pane: Roles & Skills Detection */}
                <div className="flex flex-col gap-6">
                  {/* Recommended roles */}
                  <div className="glass rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-primary/5 via-transparent to-black/20">
                    <div className="flex items-center gap-1.5 pb-3 border-b border-white/5 mb-4">
                      <Sparkles className="text-yellow-500" size={14} />
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Recommended Internship Roles</h4>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {recommendations.recommended_roles.map((role, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl">
                          <Check className="text-green-400" size={14} />
                          <span>{role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skill gaps / Missing skills */}
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-1.5 pb-3 border-b border-white/5 mb-4">
                      <AlertCircle className="text-red-400" size={14} />
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Critical Skill Gaps</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendations.missing_skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Technologies */}
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-1.5 pb-3 border-b border-white/5 mb-4">
                      <Cpu className="text-primary-light" size={14} />
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Suggested Technologies</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendations.suggested_technologies.map((tech, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary-light rounded-lg">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: LinkedIn Copywriter Workspace */}
            {activeTab === 'linkedin' && linkedinCopy && (
              <div className="flex flex-col gap-6 animate-fade-in">
                
                {/* LinkedIn Headline */}
                <div className="glass rounded-2xl p-6 border border-white/5 relative group">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                    <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">LinkedIn Headline (Recruiter SEO Optimized)</span>
                    <button
                      onClick={() => copyToClipboard(linkedinCopy.linkedin_headline, 'headline')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all"
                    >
                      {copyFeedback.headline ? <Check className="text-green-400" size={12} /> : <Copy size={12} />}
                      <span>{copyFeedback.headline ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-white bg-black/20 p-4 border border-white/5 rounded-xl leading-relaxed select-all">
                    {linkedinCopy.linkedin_headline}
                  </p>
                </div>

                {/* Resume Summary */}
                <div className="glass rounded-2xl p-6 border border-white/5 relative group">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                    <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">High-Impact CV Profile Summary</span>
                    <button
                      onClick={() => copyToClipboard(linkedinCopy.resume_summary, 'summary')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all"
                    >
                      {copyFeedback.summary ? <Check className="text-green-400" size={12} /> : <Copy size={12} />}
                      <span>{copyFeedback.summary ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-dark-muted font-medium bg-black/20 p-4 border border-white/5 rounded-xl leading-relaxed select-all">
                    {linkedinCopy.resume_summary}
                  </p>
                </div>

                {/* About Bio Section */}
                <div className="glass rounded-2xl p-6 border border-white/5 relative group">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                    <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">LinkedIn "About" Bio Summary</span>
                    <button
                      onClick={() => copyToClipboard(linkedinCopy.about_section, 'about')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all"
                    >
                      {copyFeedback.about ? <Check className="text-green-400" size={12} /> : <Copy size={12} />}
                      <span>{copyFeedback.about ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="text-xs text-dark-muted leading-relaxed font-semibold bg-black/20 p-4 border border-white/5 rounded-xl select-all whitespace-pre-wrap">
                    {linkedinCopy.about_section}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
