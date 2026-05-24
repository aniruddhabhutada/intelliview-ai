import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { useSpeechSynthesis, useAudioRecorder } from '../../hooks/useSpeech';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  Square, 
  Keyboard, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function InterviewSession() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores locally: { qId: { text, score, feedback, submitted } }
  const [inputTab, setInputTab] = useState('voice'); // 'voice' | 'text'
  const [textInput, setTextInput] = useState('');
  
  // Stopwatch states
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Hooks
  const { speak, stop: stopTTS, speaking, supported: ttsSupported } = useSpeechSynthesis();
  const { 
    startRecording, 
    stopRecording, 
    recording, 
    audioBlob, 
    recordingTime, 
    supported: micSupported 
  } = useAudioRecorder();

  // Load Session
  useEffect(() => {
    if (authLoading) return;

    const sessionId = localStorage.getItem('active_interview_session_id');
    if (!sessionId || !user) {
      router.push('/interview/setup');
      return;
    }

    // Load active session from history list
    apiService.interview.getHistory(user.id)
      .then((sessions) => {
        const active = sessions.find(s => s.id === sessionId);
        if (!active) {
          router.push('/interview/setup');
          return;
        }
        
        // If session was already completed, skip to summary
        if (active.status === 'completed') {
          router.push(`/interview/summary?session_id=${sessionId}`);
          return;
        }

        setSession(active);

        // Prepopulate already answered questions
        const savedAnswers = {};
        active.answers.forEach(a => {
          savedAnswers[a.question_id] = {
            text: a.user_answer,
            score: a.score,
            feedback: a.feedback,
            submitted: true
          };
        });
        setAnswers(savedAnswers);

        // Start Stopwatch
        timerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      })
      .catch((err) => {
        console.error("[Session] Error fetching active session details:", err);
        router.push('/interview/setup');
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopTTS();
    };
  }, [user]);

  // Transcribe audio once blob becomes available
  useEffect(() => {
    if (audioBlob) {
      handleTranscribe(audioBlob);
    }
  }, [audioBlob]);

  // Read question aloud when index changes
  useEffect(() => {
    if (session && session.questions && session.questions[currentIdx]) {
      const q = session.questions[currentIdx];
      // Speak the question text automatically to build premium immersion
      speak(q.question_text);
      
      // Load current index answer if any
      const existing = answers[q.id];
      setTextInput(existing ? existing.text : '');
    }
  }, [currentIdx, session]);

  const handleTranscribe = async (blob) => {
    setTranscribing(true);
    setSubmitError(null);
    try {
      const result = await apiService.interview.transcribeAudio(user.id, blob);
      setTextInput(prev => prev ? `${prev} ${result.transcript}` : result.transcript);
    } catch (err) {
      console.error("[Transcription] Error:", err);
      setSubmitError('Failed to transcribe audio automatically. Please type in your answer or try recording again.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!textInput.trim()) {
      setSubmitError('Please record or type your answer before submitting.');
      return;
    }

    setLoading(true);
    setSubmitError(null);
    stopTTS();

    const q = session.questions[currentIdx];

    try {
      const evaluation = await apiService.interview.submitAnswer(
        session.id,
        q.id,
        textInput
      );

      setAnswers(prev => ({
        ...prev,
        [q.id]: {
          text: textInput,
          score: evaluation.score,
          feedback: evaluation.feedback,
          submitted: true
        }
      }));

    } catch (err) {
      console.error("[Submit Answer] Failed:", err);
      setSubmitError(err.message || 'Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    // End session, compile final scorecard summary
    setLoading(true);
    stopTTS();
    try {
      await apiService.interview.endSession(session.id);
      router.push(`/interview/summary?session_id=${session.id}`);
    } catch (err) {
      console.error("[End Session] Failed:", err);
      setSubmitError('Failed to finalize session. Please try again.');
      setLoading(false);
    }
  };

  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <Layout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const currentQuestion = session.questions[currentIdx];
  const totalQuestions = session.questions.length;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        
        {/* TOP STATUS BAR: Progress dots & Stopwatch */}
        <div className="flex items-center justify-between p-4 rounded-xl glass border border-white/5 bg-zinc-950/40">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest leading-none">
              Interview Progress
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {session.questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = answers[q.id]?.submitted;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-2.5 rounded-full transition-all outline-none ${
                      isCurrent 
                        ? 'bg-primary w-8' 
                        : (isAnswered ? 'bg-green-500 w-2.5' : 'bg-white/10 w-2.5 hover:bg-white/20')
                    }`}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-2 pl-4 border-l border-white/10 text-right">
            <Clock size={16} className="text-primary-light" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-white font-mono leading-none">{formatTime(elapsedTime)}</span>
              <span className="text-[8px] font-black uppercase text-dark-muted tracking-wider mt-0.5">ELAPSED</span>
            </div>
          </div>
        </div>

        {/* MAIN BODY: Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT PANEL: Question Card */}
          <div className="lg:col-span-5 glass rounded-2xl p-6 md:p-8 border border-white/5 flex flex-col justify-between relative bg-zinc-950/20">
            <div className="flex flex-col">
              {/* Question Number & Category */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <span className="text-[10px] font-black text-primary-light uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-md">
                  {currentQuestion.category}
                </span>
                <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-lg md:text-xl font-bold leading-relaxed text-white">
                {currentQuestion.question_text}
              </h2>
            </div>

            {/* Audio synthesizing action */}
            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-dark-muted uppercase">Difficulty:</span>
                <span className="text-[10px] font-black text-white uppercase tracking-wider bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md">
                  {currentQuestion.difficulty}
                </span>
              </div>
              
              {ttsSupported && (
                <button
                  onClick={() => speaking ? stopTTS() : speak(currentQuestion.question_text)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border outline-none ${
                    speaking 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {speaking ? <VolumeX size={14} className="animate-pulse" /> : <Volume2 size={14} />}
                  <span>{speaking ? "Stop Speech" : "Read Aloud"}</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: User Answer and Evaluation Feedback */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Input Options Header Tabs */}
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Answer Workspace</h3>
                
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => setInputTab('voice')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all outline-none ${
                      inputTab === 'voice' ? 'bg-primary text-white shadow-md' : 'text-dark-muted hover:text-white'
                    }`}
                  >
                    <Mic size={12} />
                    <span>Voice</span>
                  </button>
                  <button
                    onClick={() => setInputTab('text')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all outline-none ${
                      inputTab === 'text' ? 'bg-primary text-white shadow-md' : 'text-dark-muted hover:text-white'
                    }`}
                  >
                    <Keyboard size={12} />
                    <span>Keyboard</span>
                  </button>
                </div>
              </div>

              {/* Submitting error alerts */}
              {submitError && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 font-semibold animate-fade-in">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Tab 1: Voice recording triggers */}
              {inputTab === 'voice' && (
                <div className="flex flex-col gap-4">
                  {/* Recording buttons board */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      disabled={loading || transcribing}
                      className={`flex flex-col items-center justify-center p-6 border rounded-2xl transition-all relative overflow-hidden group outline-none ${
                        recording 
                          ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse-glow' 
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-full border flex items-center justify-center mb-3 ${
                        recording ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-dark-muted'
                      }`}>
                        {recording ? <Square size={20} /> : <Mic size={20} />}
                      </div>
                      <span className="text-xs font-extrabold tracking-wide uppercase leading-none">
                        {recording ? "Stop Recording" : "Record with Mic"}
                      </span>
                      {recording && (
                        <span className="text-[10px] font-black tracking-widest text-red-400 mt-2 font-mono">
                          RECORDING: {recordingTime}s
                        </span>
                      )}
                    </button>

                    <div className="glass border-dashed border-white/10 rounded-2xl p-6 flex flex-col justify-center text-center">
                      <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5">Whisper Transcription State</span>
                      {transcribing ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                          <span className="text-[10px] text-primary-light font-bold animate-pulse">Groq Whisper API transcribing...</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-dark-muted font-semibold leading-relaxed">
                          Mic recordings are uploaded, transcribed at milliseconds speeds via Groq Whisper API, and loaded inside the workspace below.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Central Textarea Workspace for typed/transcribed text */}
              <div className="flex flex-col gap-1.5 mt-4">
                <label className="text-[10px] font-black text-dark-muted uppercase tracking-wider">Answer Draft Workspace</label>
                <textarea
                  placeholder="Record vocally or type out your response in full depth here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={loading || transcribing}
                  rows={6}
                  className="w-full bg-dark-input hover:bg-zinc-900 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-xs text-white placeholder-dark-muted transition-all outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Submit answer button */}
              <button
                onClick={handleSubmitAnswer}
                disabled={loading || transcribing || !textInput.trim() || currentAnswer?.submitted}
                className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-slate-200 shadow-xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>{currentAnswer?.submitted ? "Answer Submitted" : "Submit Answer"}</span>
                  </>
                )}
              </button>
            </div>

            {/* INSTANT EVALUATION FEEDBACK BOARD (displayed once submitted) */}
            {currentAnswer?.submitted && (
              <div className="glass rounded-2xl p-6 border border-green-500/20 bg-green-500/[0.02] flex flex-col gap-4 animate-fade-in">
                {/* Score Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2 font-bold text-xs text-green-400 uppercase tracking-wider">
                    <Award size={16} />
                    <span>Llama 3.3 Evaluation Summary</span>
                  </div>
                  <span className="text-sm font-black text-white bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-md">
                    Score: {currentAnswer.score} / 10
                  </span>
                </div>
                
                {/* Summary points */}
                <div className="flex flex-col gap-3 text-xs text-dark-muted font-semibold leading-relaxed">
                  <p>
                    <span className="text-white font-bold block mb-0.5">Technical Accuracy:</span>
                    {currentAnswer.feedback.technical_accuracy}
                  </p>
                  <p>
                    <span className="text-white font-bold block mb-0.5">Clarity & Communication:</span>
                    {currentAnswer.feedback.clarity}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 border-t border-white/5 pt-3">
                    <div>
                      <span className="text-green-400 font-bold block mb-1">Strengths:</span>
                      {currentAnswer.feedback.strengths.map((str, idx) => (
                        <span key={idx} className="block">• {str}</span>
                      ))}
                    </div>
                    <div>
                      <span className="text-yellow-400 font-bold block mb-1">Gaps/Improvements:</span>
                      {currentAnswer.feedback.improvements.map((imp, idx) => (
                        <span key={idx} className="block">• {imp}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM NAVIGATION ACTIONS CONTROL ROW */}
        <div className="flex items-center justify-between p-4 rounded-xl glass border border-white/5 bg-zinc-950/20">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentIdx === totalQuestions - 1}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleEndInterview}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg border border-red-500/30"
          >
            End Interview Session
          </button>
        </div>

      </div>
    </Layout>
  );
}
export async function getStaticProps() {
  return { props: {} };
}
