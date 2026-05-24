import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Play, 
  TrendingUp, 
  AlertCircle, 
  Sparkles,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'resumes'
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = (u) => {
    if (!u) return false;
    const email = u.email.toLowerCase();
    return email === 'admin@example.com' || 
           email === 'anirudhabhutada@gmail.com' ||
           email.endsWith('@intelliview.ai');
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin(user)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Call all admin statistic APIs in parallel
    Promise.all([
      apiService.admin.getStats(user.id),
      apiService.admin.listUsers(user.id),
      apiService.admin.listResumes(user.id)
    ])
      .then(([statsData, usersData, resumesData]) => {
        setStats(statsData);
        setUsers(usersData);
        setResumes(resumesData);
      })
      .catch((err) => {
        console.error("[Admin stats] Failed loading stats:", err);
        setError('Failed to collect administration platform statistics. Verify backend is running.');
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const getFilteredUsers = () => {
    if (!searchQuery) return users;
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredResumes = () => {
    if (!searchQuery) return resumes;
    return resumes.filter(r => 
      r.user_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Process skills charts data
  const getSkillsChartData = () => {
    if (!stats || !stats.common_skills) return [];
    return Object.keys(stats.common_skills).map(skill => ({
      name: skill,
      count: stats.common_skills[skill]
    })).sort((a,b) => b.count - a.count);
  };

  const skillsChartData = getSkillsChartData();
  const colors = ['#7c3aed', '#a78bfa', '#4c1d95', '#4f46e5', '#6366f1'];

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin(user)) {
    return (
      <Layout>
        <div className="glass rounded-3xl p-12 border border-red-500/20 bg-red-500/[0.02] text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden max-w-2xl mx-auto my-12">
          <AlertCircle className="text-red-400 mb-4 animate-pulse" size={48} />
          <h3 className="text-lg font-black text-white mb-2">403 Unauthorized Access</h3>
          <p className="text-xs text-dark-muted max-w-md leading-relaxed mb-8">
            You must be an authorized administrator to view this platform stats panel. If you are developing locally, please sign in with the <code className="text-primary-light font-bold font-mono">admin@example.com</code> developer profile.
          </p>
          <Link 
            href="/dashboard"
            className="px-6 py-3 bg-white text-black hover:bg-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-tr from-purple-950/20 to-zinc-950 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[70px] pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 font-black text-xs text-primary-light uppercase tracking-wider mb-1">
              <ShieldCheck size={16} />
              <span>Administration Command Center</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-none mt-1">Platform Stats Dashboard</h1>
          </div>
          <span className="text-[9px] font-black uppercase text-dark-muted bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg w-max">
            SYSTEM ROOT ACCESS
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/5"></div>
            ))}
          </div>
        ) : stats && (
          /* System aggregates cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass rounded-2xl p-6 border border-white/5 relative">
              <Users className="absolute right-6 top-6 text-primary-light" size={24} />
              <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Platform Users</span>
              <h3 className="text-3xl font-black text-white mt-2">{stats.total_users}</h3>
              <p className="text-[10px] text-dark-muted mt-1 font-semibold">Registered candidate profiles</p>
            </div>
            
            <div className="glass rounded-2xl p-6 border border-white/5 relative">
              <FileText className="absolute right-6 top-6 text-primary-light" size={24} />
              <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Resumes Indexed</span>
              <h3 className="text-3xl font-black text-white mt-2">{stats.total_resumes}</h3>
              <p className="text-[10px] text-dark-muted mt-1 font-semibold">Parsed ATS databases</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/5 relative">
              <Play className="absolute right-6 top-6 text-primary-light" size={24} />
              <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Interviews Ended</span>
              <h3 className="text-3xl font-black text-white mt-2">{stats.total_interviews}</h3>
              <p className="text-[10px] text-dark-muted mt-1 font-semibold">Aggregate practice sessions</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/5 relative">
              <TrendingUp className="absolute right-6 top-6 text-primary-light" size={24} />
              <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">System Avg Score</span>
              <h3 className="text-3xl font-black text-white mt-2">{stats.average_score.toFixed(1)} <span className="text-xs text-dark-muted font-black">/ 10</span></h3>
              <p className="text-[10px] text-dark-muted mt-1 font-semibold">Global average response rating</p>
            </div>
          </div>
        )}

        {/* Dynamic skills chart */}
        {!loading && skillsChartData.length > 0 && (
          <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col">
            <div className="flex items-center gap-2 font-black text-xs text-primary-light uppercase tracking-wider mb-6">
              <Sparkles size={16} />
              <span>Skill Keyword Frequencies Across Resumes</span>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <YAxis type="number" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={35}>
                    {skillsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Data list searcher & tables */}
        <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col">
          {/* Header tabs row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl w-max">
              <button
                onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all outline-none ${
                  activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-dark-muted hover:text-white'
                }`}
              >
                Candidates List ({getFilteredUsers().length})
              </button>
              <button
                onClick={() => { setActiveTab('resumes'); setSearchQuery(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all outline-none ${
                  activeTab === 'resumes' ? 'bg-primary text-white shadow-md' : 'text-dark-muted hover:text-white'
                }`}
              >
                Analyzed Resumes ({getFilteredResumes().length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" />
              <input
                type="text"
                placeholder={activeTab === 'users' ? "Search candidates..." : "Search resume analyses..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-input hover:bg-zinc-900 border border-white/10 focus:border-primary rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-dark-muted transition-all outline-none"
              />
            </div>
          </div>

          {/* Table display */}
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5"></div>
              ))}
            </div>
          ) : activeTab === 'users' ? (
            /* Users Table */
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black text-dark-muted uppercase tracking-widest">
                    <th className="pb-3 pl-3">Candidate</th>
                    <th className="pb-3">Contact Email</th>
                    <th className="pb-3">Detected Skills</th>
                    <th className="pb-3 text-right pr-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-semibold text-white/90">
                  {getFilteredUsers().map((u, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pl-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light font-black uppercase text-[10px]">
                          {u.name.slice(0, 2)}
                        </div>
                        <span className="font-extrabold text-white">{u.name}</span>
                      </td>
                      <td className="py-4 font-mono text-dark-muted">{u.email}</td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {u.skills && u.skills.slice(0,3).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-dark-muted font-extrabold">
                              {s}
                            </span>
                          ))}
                          {u.skills && u.skills.length > 3 && (
                            <span className="text-[9px] text-primary-light font-black pl-1">
                              +{u.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-right pr-3 text-dark-muted font-bold font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Resumes Table */
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black text-dark-muted uppercase tracking-widest">
                    <th className="pb-3 pl-3">Record ID</th>
                    <th className="pb-3">Candidate UID</th>
                    <th className="pb-3">ATS Rating</th>
                    <th className="pb-3">Primary Strength</th>
                    <th className="pb-3 text-right pr-3">Analyzed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-semibold text-white/90">
                  {getFilteredResumes().map((r, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pl-3 font-mono text-dark-muted">{r.id.slice(0,8)}...</td>
                      <td className="py-4 font-mono text-white/70">{r.user_id}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md font-black font-mono text-[10px] ${
                          r.ats_score >= 85 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {r.ats_score} / 100
                        </span>
                      </td>
                      <td className="py-4 text-white/70 truncate max-w-xs">{r.strengths[0] || 'Acceptable skill base'}</td>
                      <td className="py-4 text-right pr-3 text-dark-muted font-bold font-mono">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
