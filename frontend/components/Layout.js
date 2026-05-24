import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Identify public routes that do not require auth guards
  const isPublicRoute = router.pathname === '/' || router.pathname === '/auth';

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.push('/auth');
    }
  }, [user, loading, isPublicRoute, router]);

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text grid-bg flex flex-col items-center justify-center gap-4">
        {/* Pulsating glowing spinner */}
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-t-2 border-r-2 border-primary animate-spin"></div>
          <div className="absolute h-10 w-10 rounded-full bg-primary/20 animate-ping"></div>
        </div>
        <p className="text-sm font-semibold tracking-wide text-dark-muted animate-pulse">
          Securing authentication state...
        </p>
      </div>
    );
  }

  // Guard blocks content display to prevent flickering on private paths
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text grid-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col grid-bg">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
        {children}
      </main>

      <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-dark-muted font-medium bg-black/20">
        © 2026 Intelliview AI. Powered by Llama 3.3.
      </footer>
    </div>
  );
}
