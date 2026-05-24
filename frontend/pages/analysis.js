import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle
} from 'lucide-react';

export default function ResumeAnalysis() {
  const { user, refreshProfile } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showPlaintext, setShowPlaintext] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Load existing analysis on load if they have one
    setLoading(true);
    apiService.resume.getAnalysis(user.id)
      .then((data) => {
        setAnalysis(data);
      })
      .catch(() => {
        // No analysis yet, which is fine
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'doc'].includes(ext)) {
        setError('Only PDF, DOC, and DOCX formats are supported.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5MB limit. Please upload a smaller file.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or DOCX file to upload.');
      return;
    }

    setLoading(true);
    setError(null);

    // Multi-phase dynamic loading simulation to delight user
    const phases = [
      'Uploading resume binary...',
      'Extracting semantic PDF layout text...',
      'Mapping keywords to RAG embeddings...',
      'Invoking Llama 3.3 ATS scoring algorithm...',
      'Saving structural skills metadata...'
    ];

    let currentPhase = 0;
    setLoadingPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      if (currentPhase < phases.length - 1) {
        currentPhase++;
        setLoadingPhase(phases[currentPhase]);
      }
    }, 1200);

    try {
      const data = await apiService.resume.upload(user.id, file);
      setAnalysis(data);
      await refreshProfile(); // Refresh skills and resume url
    } catch (err) {
      console.error("[Resume Upload] Failed:", err);
      setError(err.message || 'Failed to parse resume. Ensure it is a valid, uncorrupted PDF or DOCX file.');
    } finally {
      clearInterval(phaseInterval);
      setLoading(false);
      setFile(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-500 border-green-500/20 bg-green-500/10';
    if (score >= 70) return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
    return 'text-red-500 border-red-500/20 bg-red-500/10';
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-white">Resume Analysis & RAG Ingestion</h1>
          <p className="text-sm text-dark-muted font-medium mt-1">
            Analyze your ATS compatibility, extract skills, and store your resume for context-aware questions.
          </p>
        </div>

        {/* Upload Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 glass rounded-2xl p-6 border border-white/5 flex flex-col">
            <h3 className="text-base font-extrabold text-white mb-4">Upload Resume</h3>
            
            {error && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 font-semibold">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <label className="border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/[0.01] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  disabled={loading}
                />
                <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-dark-muted group-hover:text-primary-light transition-all">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold text-white block group-hover:text-primary-light transition-all">
                    {file ? file.name : "Select Resume File"}
                  </span>
                  <span className="text-xs text-dark-muted font-medium mt-1 block">
                    Supports PDF or DOCX (max 5MB)
                  </span>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-slate-200 shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Cpu size={16} />
                    <span>Upload & Index Resume</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Analysis View Output */}
          <div className="lg:col-span-8">
            {loading ? (
              /* Beautiful dynamic skeleton phases */
              <div className="glass rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center gap-5">
                <div className="relative flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
                  <Sparkles size={28} className="absolute text-primary-light animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white animate-pulse">Analyzing Profile...</h4>
                  <p className="text-sm text-dark-muted font-semibold mt-1">{loadingPhase}</p>
                </div>
              </div>
            ) : !analysis ? (
              /* Empty state prompt */
              <div className="glass rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
                <FileText size={48} className="text-dark-muted" />
                <div>
                  <h4 className="text-lg font-black text-white">No Analysis Registered</h4>
                  <p className="text-sm text-dark-muted max-w-sm font-semibold mt-1">
                    Upload your resume file in the left panel to execute an ATS check and index it into the vector database.
                  </p>
                </div>
              </div>
            ) : (
              /* Complete gorgeous ATS analysis output card */
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* Score bar & Title */}
                <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row items-center gap-6">
                  {/* Gauge visual */}
                  <div className={`h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center font-black ${getScoreColor(analysis.ats_score)}`}>
                    <span className="text-3xl leading-none">{analysis.ats_score}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">ATS Score</span>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-xl font-black text-white">Evaluation Scorecard</h3>
                    <p className="text-xs text-dark-muted font-semibold mt-1">
                      Analysis completed successfully. Your skills have been saved, and resume text chunks are ingested in ChromaDB for custom question context.
                    </p>
                  </div>
                </div>

                {/* Skills cloud */}
                {user?.skills && user.skills.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-3.5">Detected Professional Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary-light">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid for Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 font-black text-sm text-green-400 uppercase tracking-wider mb-4">
                      <CheckCircle size={16} />
                      <span>Key Strengths</span>
                    </div>
                    <ul className="flex flex-col gap-2.5 text-xs text-dark-muted font-semibold">
                      {analysis.strengths.map((str, idx) => (
                        <li key={idx} className="flex gap-2 leading-relaxed">
                          <span className="text-green-500">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 font-black text-sm text-red-400 uppercase tracking-wider mb-4">
                      <XCircle size={16} />
                      <span>Identified Gaps</span>
                    </div>
                    <ul className="flex flex-col gap-2.5 text-xs text-dark-muted font-semibold">
                      {analysis.weakness.map((weak, idx) => (
                        <li key={idx} className="flex gap-2 leading-relaxed">
                          <span className="text-red-500">⚠</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggestions for improvement */}
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 font-black text-sm text-primary-light uppercase tracking-wider mb-4">
                    <Lightbulb size={16} />
                    <span>Suggestions for Improvements</span>
                  </div>
                  <ul className="flex flex-col gap-2.5 text-xs text-dark-muted font-semibold">
                    {analysis.suggestions.map((sug, idx) => (
                      <li key={idx} className="flex gap-2 leading-relaxed">
                        <span className="text-primary-light">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Raw Extracted plain text drawer */}
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <button 
                    onClick={() => setShowPlaintext(!showPlaintext)}
                    className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-white hover:bg-white/[0.02]"
                  >
                    <span>Raw Parsed Text Content</span>
                    {showPlaintext ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showPlaintext && (
                    <div className="px-6 pb-6 border-t border-white/5 bg-[#09090b]/80 p-4">
                      <pre className="text-[10px] text-dark-muted font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                        {analysis.parsed_text}
                      </pre>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
