import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { 
  Trophy, 
  Calendar, 
  ChevronRight, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  FileWarning, 
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  FileText,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

// Lazy load Recharts modules to minimize bundles and optimize page loading performance
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    averageScore: 0.0,
    strongTopics: [],
    weakTopics: [],
    historyChartData: [],
    skillChartData: []
  });

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const historyPromise = apiService.interview.getHistory(user.id)
      .then((sessions) => {
        setHistory(sessions);
        processDashboardStats(sessions);
      })
      .catch((err) => {
        console.error("[Dashboard] Error loading session history:", err);
      });

    const analysisPromise = apiService.resume.getAnalysis(user.id)
      .then((analysisData) => {
        setAnalysis(analysisData);
        setHasResume(true);
      })
      .catch((err) => {
        console.log("[Dashboard] No resume analysis found or backend offline:", err);
        setHasResume(false);
      });

    Promise.allSettled([historyPromise, analysisPromise])
      .finally(() => setLoading(false));
  }, [user]);

  const processDashboardStats = (sessions) => {
    const completed = sessions.filter(s => s.status === 'completed');
    const totalCompleted = completed.length;
    
    if (totalCompleted === 0) {
      setStats({
        totalCompleted: 0,
        averageScore: 0.0,
        strongTopics: ['Resume Core'],
        weakTopics: ['Practice Interviews'],
        historyChartData: [],
        skillChartData: []
      });
      return;
    }

    const averageScore = completed.reduce((sum, s) => sum + s.score, 0) / totalCompleted;

    // Process category metrics for skills chart
    const catScores = {};
    const catCounts = {};
    
    completed.forEach(session => {
      session.answers.forEach(ans => {
        const qId = ans.question_id;
        const qInfo = session.questions.find(q => q.id === qId);
        const cat = qInfo ? qInfo.category : 'General';
        
        catScores[cat] = (catScores[cat] || 0) + ans.score;
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
    });

    const skillChartData = Object.keys(catScores).map(cat => ({
      name: cat,
      score: Math.round((catScores[cat] / catCounts[cat]) * 10) / 10
    }));

    const sortedCats = [...skillChartData].sort((a, b) => b.score - a.score);
    const strongTopics = sortedCats.slice(0, 2).map(c => c.name);
    const weakTopics = sortedCats.length > 2 
      ? sortedCats.slice(-2).map(c => c.name) 
      : (sortedCats.length === 2 ? [sortedCats[1].name] : ['System Design']);

    const historyChartData = [...completed]
      .reverse()
      .map((s, index) => {
        const dateObj = new Date(s.created_at);
        return {
          sessionNum: `Session ${index + 1}`,
          score: s.score,
          date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        };
      });

    setStats({
      totalCompleted,
      averageScore: Math.round(averageScore * 10) / 10,
      strongTopics,
      weakTopics,
      historyChartData,
      skillChartData
    });
  };

  const skillColors = ['#7c3aed', '#a78bfa', '#4c1d95', '#312e81'];

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-zinc-900 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[70px] pointer-events-none"></div>
          <div>
            <h1 className="text-3xl font-black text-white">Welcome back, {user?.name}!</h1>
            <p className="text-sm text-dark-muted font-medium mt-1">
              Analyze your resume, identify skill deficiencies, and prep with Llama 3.3.
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/analysis"
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 text-xs uppercase tracking-wider transition-all"
            >
              {hasResume ? "Re-upload Resume" : "Upload Resume"}
            </Link>
            <Link 
              href="/interview/setup"
              className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs uppercase tracking-wider shadow-lg purple-glow-sm transition-all hover:scale-105 active:scale-95"
            >
              Start Session
            </Link>
          </div>
        </div>

        {loading ? (
          /* Premium Loading skeletons */
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/5"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-80 md:col-span-2 rounded-2xl bg-white/5 border border-white/5"></div>
              <div className="h-80 rounded-2xl bg-white/5 border border-white/5"></div>
            </div>
          </div>
        ) : (
          /* Stats Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass rounded-2xl p-6 border border-white/5 relative group">
              <Trophy className="absolute right-6 top-6 text-yellow-500/80" size={24} />
              <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Total Completed</span>
              <h3 className="text-3xl font-black text-white mt-2">{stats.totalCompleted}</h3>
              <p className="text-[10px] text-dark-muted mt-1 font-semibold">Practice sessions ended</p>
            </div>
            
            <div className="glass rounded-2xl p-6 border border-white/5 relative">
              <TrendingUp className="absolute right-6 top-6 text-primary-light" size={24} />
              <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Average Score</span>
              <h3 className="text-3xl font-black text-white mt-2">{stats.averageScore} <span className="text-xs text-dark-muted font-bold">/ 10</span></h3>
              <p className="text-[10px] text-dark-muted mt-1 font-semibold">Across all mock evaluations</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/5 relative">
              <Award className="absolute right-6 top-6 text-green-500/80" size={24} />
              <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Latest ATS Score</span>
              <h3 className="text-3xl font-black text-white mt-2">{hasResume && analysis ? analysis.ats_score : "--"} <span className="text-xs text-dark-muted font-bold">/ 100</span></h3>
              <p className="text-[10px] text-dark-muted mt-1 font-semibold">{hasResume ? "Parsed from your resume" : "Upload resume to score"}</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/5 relative">
              <FileWarning className="absolute right-6 top-6 text-red-500/80" size={24} />
              <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Key Weak Areas</span>
              <h3 className="text-sm font-bold text-white mt-3.5 leading-tight truncate">
                {stats.weakTopics.join(' & ') || 'Practice Sessions'}
              </h3>
              <p className="text-[10px] text-red-400 mt-1.5 font-bold">Identified career gaps</p>
            </div>
          </div>
        )}

        {/* Dynamic Dual-Layout ATS Resume Dashboard Section */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left: ATS Resume Analysis & Gaps Card */}
            <div className="glass rounded-2xl p-6 border border-white/5 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <FileText className="text-primary-light" size={20} />
                    <h4 className="text-base font-extrabold text-white">ATS Resume Diagnostics</h4>
                  </div>
                  <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">PROFILE INSIGHTS</span>
                </div>

                {!hasResume ? (
                  /* Empty state for Resume */
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="text-dark-muted mb-3 animate-pulse" size={40} />
                    <h5 className="text-sm font-bold text-white">No Resume Analysis Data</h5>
                    <p className="text-xs text-dark-muted max-w-sm mt-1 mb-5">
                      Upload your PDF/DOCX resume first to calculate ATS metrics, detect skills, and generate key summaries.
                    </p>
                    <Link 
                      href="/analysis"
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 text-xs rounded-xl uppercase tracking-wider transition-all"
                    >
                      Upload Resume Now
                    </Link>
                  </div>
                ) : (
                  /* Filled Resume Stats */
                  <div className="flex flex-col gap-6">
                    {/* Skills DETECTED */}
                    <div>
                      <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest block mb-2">Detected Skills ({analysis.skills.length})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary-light uppercase tracking-wide hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Strong vs Weak lists */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-green-500/[0.02] border border-green-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 text-green-400 font-bold text-xs mb-3 uppercase tracking-wider">
                          <CheckCircle size={14} />
                          <span>Core Strengths</span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {analysis.strengths.slice(0, 3).map((st, i) => (
                            <li key={i} className="text-xs text-dark-muted leading-relaxed flex items-start gap-2">
                              <span className="text-green-400 font-extrabold flex-shrink-0 mt-0.5">•</span>
                              <span>{st}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-500/[0.02] border border-red-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs mb-3 uppercase tracking-wider">
                          <FileWarning size={14} />
                          <span>Identified Gaps</span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {analysis.weakness.slice(0, 3).map((wk, i) => (
                            <li key={i} className="text-xs text-dark-muted leading-relaxed flex items-start gap-2">
                              <span className="text-red-400 font-extrabold flex-shrink-0 mt-0.5">•</span>
                              <span>{wk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {hasResume && (
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-dark-muted font-medium">ATS Score computed dynamically.</span>
                  <Link 
                    href="/analysis"
                    className="flex items-center gap-1 text-xs font-bold text-primary-light hover:text-white transition-all group"
                  >
                    <span>View Full ATS Diagnosis</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Career Optimization CTA Card */}
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-black/20">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/20 rounded-full blur-[40px] pointer-events-none"></div>
              <div>
                <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-6">
                  <Briefcase className="text-primary-light" size={20} />
                  <h4 className="text-base font-extrabold text-white">Career Optimizer</h4>
                </div>
                <h5 className="font-extrabold text-sm text-white mb-2 flex items-center gap-1.5">
                  <Sparkles className="text-yellow-500" size={14} />
                  <span>Job-Ready Recommendations</span>
                </h5>
                <p className="text-xs text-dark-muted leading-relaxed mb-6 font-medium">
                  Unlock recruiter-optimized LinkedIn headlines, structured about bios, resume profile summaries, matched internships, and interactive weekly roadmaps!
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] text-dark-muted font-bold">
                    <CheckCircle size={12} className="text-primary-light" />
                    <span>LinkedIn Copywriter</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-dark-muted font-bold">
                    <CheckCircle size={12} className="text-primary-light" />
                    <span>Internship Recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-dark-muted font-bold">
                    <CheckCircle size={12} className="text-primary-light" />
                    <span>Actionable Learning Roadmap</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/career"
                className="w-full text-center py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] active:scale-95 mt-6"
              >
                Go to Career Suite
              </Link>
            </div>

          </div>
        )}

        {/* Charts & Analytics Visuals */}
        {!loading && stats.totalCompleted > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chart 1: History */}
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-base font-extrabold text-white">Score Progression</h4>
                  <p className="text-xs text-dark-muted font-medium">Tracking ratings across sessions</p>
                </div>
                <BookOpen size={18} className="text-dark-muted" />
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.historyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Skill Category scores */}
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-base font-extrabold text-white">Category Breakdown</h4>
                  <p className="text-xs text-dark-muted font-medium">Comparison of response ratings by type</p>
                </div>
                <HelpCircle size={18} className="text-dark-muted" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.skillChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} layout="vertical">
                    <XAxis type="number" domain={[0, 10]} stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                      {stats.skillChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={skillColors[index % skillColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Recent sessions log */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h4 className="text-base font-extrabold text-white mb-5">Recent Practice Sessions</h4>
          
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5"></div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="text-dark-muted mb-3" size={32} />
              <p className="text-sm font-semibold text-white">No sessions found</p>
              <p className="text-xs text-dark-muted max-w-sm mt-1">
                You haven't completed any interview sessions yet. Start your first session to capture performance logs!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-light font-black text-xs">
                      {session.category.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white leading-snug">{session.category} Session</span>
                      <div className="flex items-center gap-2 text-xs text-dark-muted font-semibold mt-0.5">
                        <span>Difficulty: {session.difficulty}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(session.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-black text-white">{session.score.toFixed(1)} / 10</span>
                      <span className="text-[10px] text-dark-muted font-bold block leading-none">Overall Score</span>
                    </div>
                    <Link 
                      href={session.status === 'in_progress' ? '/interview/session' : `/interview/summary?session_id=${session.id}`}
                      className="p-2 bg-white/5 hover:bg-primary hover:text-white rounded-lg text-dark-muted transition-all border border-white/10 group-hover:border-primary-light"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
