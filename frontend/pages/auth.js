import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  
  const { loginWithEmail, loginWithGoogle, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) {
      setAuthError('Please fill out all fields.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    try {
      await loginWithEmail(email, password, isSignUp);
    } catch (err) {
      // Handled by hook
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text grid-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Radial glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none purple-glow"></div>

      {/* Main panel card */}
      <div className="w-full max-w-4xl bg-zinc-950/70 border border-white/5 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl glass">
        
        {/* Left Side: Brand Promo Panel */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-purple-950/40 via-[#0c0c0e]/80 to-black/80 relative">
          <div className="absolute inset-0 bg-grid-bg opacity-10"></div>
          
          <Link href="/" className="flex items-center gap-2 z-10">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-lg">
              IV
            </div>
            <span className="font-extrabold text-lg text-white">Intelliview AI</span>
          </Link>

          <div className="z-10">
            <h3 className="font-black text-3xl text-white mb-4 leading-tight">
              Unlock Your <br />
              True Potential.
            </h3>
            <p className="text-dark-muted text-sm leading-relaxed mb-6 font-medium">
              Join thousands of job seekers who practice, analyze, and master technical coding and behavioral interview concepts.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 border border-white/10 px-3 py-2 rounded-lg w-max">
                <ShieldCheck size={14} className="text-primary-light" />
                <span>Dual-Mode Firestore & Local fallback</span>
              </div>
            </div>
          </div>

          <span className="text-xs text-dark-muted z-10 font-bold tracking-widest uppercase">
            © 2026 INTELLIVIEW AI
          </span>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5 bg-black/40">
          <div className="w-full max-w-md mx-auto">
            {/* Tab switch header */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-xl mb-8">
              <button
                onClick={() => { setIsSignUp(false); setAuthError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${!isSignUp ? 'bg-primary text-white purple-glow-sm shadow-md' : 'text-dark-muted hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsSignUp(true); setAuthError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${isSignUp ? 'bg-primary text-white purple-glow-sm shadow-md' : 'text-dark-muted hover:text-white'}`}
              >
                Register
              </button>
            </div>

            {/* Error alerts */}
            {(authError || error) && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 animate-fade-in font-medium">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{authError || error}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-dark-muted uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-input hover:bg-zinc-900 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-dark-muted transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-dark-muted uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-input hover:bg-zinc-900 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-dark-muted transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-slate-200 shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{isSignUp ? "Create Account" : "Sign In with Email"}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-dark-muted uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Google Authentication */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2.5 mb-4 disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.77-6.19-6.18 0-3.41 2.78-6.18 6.19-6.18 1.455 0 2.8.502 3.868 1.348l3.18-3.18C18.847 2.012 15.753 1 12.24 1A10.237 10.237 0 0 0 2 11.24a10.237 10.237 0 0 0 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.69-.08-1.36-.22-1.955H12.24Z"/>
              </svg>
              <span>Continue with Google</span>
            </button>



          </div>
        </div>

      </div>
    </div>
  );
}
