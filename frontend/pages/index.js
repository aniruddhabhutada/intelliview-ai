import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Mic, 
  BrainCircuit, 
  Users, 
  Award, 
  BookOpen, 
  Star, 
  HelpCircle, 
  ChevronDown 
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Home() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the ChromaDB RAG integration tailor my questions?",
      a: "When you upload your resume, IntelliView AI parses the text and indexes it in a local Chroma vector database. During session startup, the system queries this database using your selected category, extracting your specific projects, technologies, and achievements. Llama 3.3 then generates highly contextual technical questions tailored strictly to your actual experience, simulating a real project-deep-dive round."
    },
    {
      q: "Can I practice using voice input?",
      a: "Absolutely! The platform captures audio client-side using the browser MediaRecorder API and forwards the recordings to the FastAPI backend. The audio is transcribed instantly using Groq's high-speed Whisper-large-v3 API in milliseconds. You receive a live transcription preview, allowing you to answer naturally just like in a real technical call."
    },
    {
      q: "Is there an offline fallback or local database mode?",
      a: "Yes! IntelliView AI features a dual-mode database engine. If you do not have Firebase credentials populated, the system automatically enables 'Local Mode' out-of-the-box. It logs users in using dynamic cache bypasses, allows full resume uploads, runs AI analysis via Groq, and stores all history persistently in a local, thread-safe JSON datastore (`db.json`) on your machine."
    },
    {
      q: "Who is this platform designed for?",
      a: "IntelliView AI is optimized specifically for college students, freshers, and developers preparing for internships and entry-level jobs. The prompt system acts as a senior recruiter and technical lead, helping candidates identify formatting gaps, keyword deficiencies, and behavioral design conflicts before speaking to a real interviewer."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text grid-bg flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center relative overflow-hidden">
        {/* Giant Purple Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none purple-glow"></div>

        {/* Badge */}
        <div className="animate-fade-in flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-wide text-primary-light mb-8 hover:bg-white/10 transition-all duration-300">
          <Sparkles size={14} className="animate-pulse" />
          <span>MEET THE FUTURE OF INTERVIEW PREP</span>
        </div>

        {/* Hero Headers */}
        <h1 className="animate-slide-up font-black text-5xl md:text-7xl leading-tight tracking-tight max-w-4xl text-white mb-6">
          IntelliView AI
        </h1>
        <p className="animate-slide-up font-bold text-xl md:text-2xl text-primary-light leading-relaxed max-w-3xl mb-4">
          Personalized AI Resume Analysis & Interview Coaching Platform
        </p>

        <p className="animate-slide-up text-base md:text-lg text-dark-muted font-medium max-w-2xl leading-relaxed mb-10 [animation-delay:200ms]">
          Upload your resume to generate hyper-realistic, personalized mock interviews. 
          Speak your answers, receive instant Llama 3.3 evaluations, and download recruiter-grade performance scorecards.
        </p>

        {/* Actions */}
        <div className="animate-slide-up flex flex-col sm:flex-row gap-4 mb-16 [animation-delay:400ms]">
          <Link
            href={user ? "/analysis" : "/auth"}
            className="group px-8 py-4 rounded-xl bg-white text-black font-extrabold flex items-center justify-center gap-2 hover:bg-slate-200 shadow-xl transition-all hover:scale-105 active:scale-95 text-base"
          >
            <span>Upload Resume</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href={user ? "/interview/setup" : "/auth"}
            className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold flex items-center justify-center gap-2 border border-primary/20 shadow-lg purple-glow-sm transition-all hover:scale-105 active:scale-95 text-base"
          >
            <span>Start Interview</span>
          </Link>
        </div>

        {/* Dashboard Visual Mock Preview */}
        <div className="animate-slide-up w-full max-w-4xl rounded-2xl glass p-3.5 border border-white/10 shadow-2xl purple-glow-sm relative group [animation-delay:600ms]">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-purple-800/10 rounded-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-[#0c0c0e] rounded-xl overflow-hidden border border-white/5 aspect-[16/9] flex flex-col p-4 md:p-6 text-left">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              </div>
              <span className="text-xs text-dark-muted font-bold tracking-widest bg-white/5 px-3 py-1 rounded-md">LIVE INTERVIEW SESSION</span>
            </div>
            {/* Split Screen Visual Mock */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 flex flex-col justify-between border border-white/5">
                <div>
                  <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">Question 3 of 10</span>
                  <h4 className="text-sm md:text-base font-bold text-white mt-1">Can you describe how you managed document embeddings and chunk overlapping inside your ChromaDB RAG architecture?</h4>
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-md mt-4">
                  <Cpu size={14} className="text-primary-light animate-pulse" />
                  <span className="text-xs text-dark-muted font-medium">Text-to-Speech active...</span>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4 flex flex-col justify-between border border-primary/20">
                <div className="flex items-center gap-2.5 text-xs text-primary-light font-bold">
                  <Mic size={14} className="animate-bounce" />
                  <span>Real-time voice capture</span>
                </div>
                <p className="text-xs text-white leading-relaxed mt-2 italic">
                  "I chunked our text using recursive character splitters and saved embeddings inside Chroma. When users request questions, we run a meta-filter query to fetch relevant chunks..."
                </p>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-primary w-4/5 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative">
        <h2 className="text-center font-black text-3xl md:text-5xl text-white mb-16">
          Everything You Need to Get <br />
          <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">Interview-Ready</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass rounded-2xl p-8 border border-white/5 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-light mb-6">
              <BrainCircuit size={24} />
            </div>
            <h3 className="font-extrabold text-xl text-white mb-3">ChromaDB RAG System</h3>
            <p className="text-dark-muted text-sm leading-relaxed">
              We extract text chunks from your resume to populate a vector datastore. Questions are generated from actual details of your projects and experience.
            </p>
          </div>
          {/* Card 2 */}
          <div className="glass rounded-2xl p-8 border border-white/5 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-purple-900/10 border border-purple-800/30 flex items-center justify-center text-purple-400 mb-6">
              <Mic size={24} />
            </div>
            <h3 className="font-extrabold text-xl text-white mb-3">Voice Response Transcription</h3>
            <p className="text-dark-muted text-sm leading-relaxed">
              Experience realistic pacing with speech-to-text. Record and submit your answers vocally, transcribed at top speeds using Groq's Whisper API.
            </p>
          </div>
          {/* Card 3 */}
          <div className="glass rounded-2xl p-8 border border-white/5 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-indigo-900/10 border border-indigo-800/30 flex items-center justify-center text-indigo-400 mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-extrabold text-xl text-white mb-3">Llama 3.3 Score Critique</h3>
            <p className="text-dark-muted text-sm leading-relaxed">
              Receive overall scores and detailed evaluations mapping your technical accuracy, clarity, communication, and actionable skill improvements.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative">
        <h2 className="text-center font-black text-3xl md:text-5xl text-white mb-16">
          How <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">IntelliView AI</span> Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="flex flex-col items-center text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary text-primary-light font-extrabold text-sm flex items-center justify-center mb-4">1</div>
            <h4 className="font-extrabold text-base text-white mb-2">Upload Resume</h4>
            <p className="text-xs text-dark-muted leading-relaxed">Drag-and-drop your PDF or DOCX resume to kick off immediate extraction.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary text-primary-light font-extrabold text-sm flex items-center justify-center mb-4">2</div>
            <h4 className="font-extrabold text-base text-white mb-2">ATS Analysis</h4>
            <p className="text-xs text-dark-muted leading-relaxed">AI scans structure, formats, and detects skills to assign an ATS score.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary text-primary-light font-extrabold text-sm flex items-center justify-center mb-4">3</div>
            <h4 className="font-extrabold text-base text-white mb-2">Mock Interview</h4>
            <p className="text-xs text-dark-muted leading-relaxed">Practice tailored Technical and Behavioral questions via voice or text input.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary text-primary-light font-extrabold text-sm flex items-center justify-center mb-4">4</div>
            <h4 className="font-extrabold text-base text-white mb-2">Scorecard Report</h4>
            <p className="text-xs text-dark-muted leading-relaxed">Get granular evaluations, weakness analysis, and downloadable PDF reports.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-black text-3xl md:text-5xl text-white mb-6 leading-tight">
              Unlock the Benefits of Recruiter-Grade Preparation
            </h2>
            <p className="text-dark-muted text-sm leading-relaxed mb-8">
              Prepared candidates stand out by explaining their systems logically, quoting relevant performance impact percentages, and demonstrating technical precision. IntelliView AI is built to bridge this student-to-recruiter gap.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-primary-light mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">Targeted Skill Gaps Discovery</h4>
                  <p className="text-xs text-dark-muted mt-0.5">Find precisely what technologies recruiters in your domain are actively hunting for.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-primary-light mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">LinkedIn Profiling Optimizations</h4>
                  <p className="text-xs text-dark-muted mt-0.5">Convert your parsed resume details into high-impact copy tailored to recruiters.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-primary-light mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">Speech Pace and Confidence Tuning</h4>
                  <p className="text-xs text-dark-muted mt-0.5">Learn to articulate complex backend systems under pacing stopwatch constraints.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center">
              <Award size={36} className="text-yellow-500 mx-auto mb-3" />
              <h3 className="text-2xl font-black text-white">92%</h3>
              <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest mt-1">Average ATS Accuracy</p>
            </div>
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center">
              <BookOpen size={36} className="text-primary-light mx-auto mb-3" />
              <h3 className="text-2xl font-black text-white">100+</h3>
              <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest mt-1">Simulated Topics</p>
            </div>
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center">
              <Users size={36} className="text-purple-400 mx-auto mb-3" />
              <h3 className="text-2xl font-black text-white">3.2s</h3>
              <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest mt-1">Transcription latency</p>
            </div>
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center">
              <ShieldCheck size={36} className="text-green-500 mx-auto mb-3" />
              <h3 className="text-2xl font-black text-white">100%</h3>
              <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest mt-1">Offline Local Sandbox</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative">
        <h2 className="text-center font-black text-3xl md:text-5xl text-white mb-16">
          What Candidates & Recruiters Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass rounded-2xl p-8 border border-white/5 relative">
            <div className="flex items-center gap-1.5 text-yellow-500 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-sm text-dark-muted leading-relaxed italic mb-6">
              "As a fresher seeking a backend role, I struggled to articulate my FastAPI and database choices. Practicing on IntelliView AI challenged me with project-based vector queries and helped me identify exactly what metric-backed keywords to add to my CV. I got my internship in weeks!"
            </p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center font-bold text-white text-xs">AB</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Aniruddha Bhutada</span>
                <span className="text-[10px] text-dark-muted font-medium">BCA (AIML) Student & Developer</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/5 relative">
            <div className="flex items-center gap-1.5 text-yellow-500 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-sm text-dark-muted leading-relaxed italic mb-6">
              "We filter hundreds of fresher resumes weekly. IntelliView AI forces candidates to speak systematically about quantitative impact and architectural trade-offs. The scorecard PDF report is recruiter-grade and highlights true competence."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-purple-900 flex items-center justify-center font-bold text-white text-xs">MS</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Marcus Sterling</span>
                <span className="text-[10px] text-dark-muted font-medium">Senior Tech Recruiter, Fauxi Corp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-t border-white/5 relative w-full">
        <h2 className="text-center font-black text-3xl md:text-5xl text-white mb-16 flex items-center justify-center gap-3">
          <HelpCircle className="text-primary-light" size={32} />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="glass rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left font-bold text-sm text-white flex items-center justify-between hover:bg-white/[0.02] transition-all"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={16} className={`text-dark-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                </button>
                <div 
                  className={`transition-all duration-300 ${isOpen ? 'max-h-60 border-t border-white/5' : 'max-h-0'}`}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="px-6 py-4 text-xs text-dark-muted leading-relaxed bg-black/10">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 px-6 bg-black/40 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-sm text-white">IV</div>
              <span className="font-extrabold text-base text-white">IntelliView AI</span>
            </div>
            <p className="text-xs text-dark-muted leading-relaxed max-w-xs">
              Recruiter-grade, AI-driven preparation workspace optimizing ATS scoring, speech mocks, and learning roadmaps.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-widest mb-4">Core Technology</h4>
            <div className="flex flex-col gap-2 text-xs text-dark-muted">
              <span>Llama 3.3 70B via Groq API</span>
              <span>ChromaDB Vector Datastore</span>
              <span>Groq Whisper Transcription</span>
              <span>ReportLab PDF Scorecards</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-widest mb-4">Platform Mode</h4>
            <div className="flex flex-col gap-2 text-xs text-dark-muted">
              <span>Firebase Firestore Sync</span>
              <span>Local Thread-safe SQLite Sandbox</span>
              <span>Zero-Config Offline Fallback</span>
              <span>Secure local file storage</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-white/5 pt-6 text-center text-[10px] text-dark-muted font-bold uppercase tracking-wider">
          © 2026 IntelliView AI. All rights reserved. Powered by Llama 3.3.
        </div>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
