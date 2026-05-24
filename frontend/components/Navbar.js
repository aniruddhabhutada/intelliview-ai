import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Menu, X, LayoutDashboard, FileText, Play, ShieldAlert, Briefcase } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => router.pathname === path;

  const isAdmin = (u) => {
    if (!u) return false;
    const email = u.email.toLowerCase();
    return email === 'admin@example.com' || 
           email === 'anirudhabhutada@gmail.com' ||
           email.endsWith('@intelliview.ai');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Analysis', path: '/analysis', icon: FileText },
    { label: 'Interview Coach', path: '/interview/setup', icon: Play },
    { label: 'Career Optimizer', path: '/career', icon: Briefcase },
    ...(user && isAdmin(user) ? [{ label: 'Admin Panel', path: '/admin', icon: ShieldAlert }] : [])
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-purple-800 flex items-center justify-center font-bold text-lg text-white shadow-lg purple-glow-sm transition-transform duration-300 group-hover:scale-105">
          IV
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Intelliview AI
        </span>
      </Link>

      {/* Desktop Links */}
      {user && (
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const LinkIcon = link.icon;
            const active = isActive(link.path);
            return (
              <Link 
                key={link.path}
                href={link.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active 
                    ? 'bg-primary text-white purple-glow-sm shadow-md' 
                    : 'text-dark-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <LinkIcon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Action Buttons / Profiles */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3.5 pl-4 border-l border-white/10">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold leading-tight text-white">{user.name}</span>
              <span className="text-xs text-dark-muted font-medium">{user.email}</span>
            </div>
            
            <div className="group relative">
              <button className="h-10 w-10 rounded-full bg-white/10 border border-white/20 hover:border-primary flex items-center justify-center text-white transition-all">
                <User size={18} />
              </button>
              
              {/* Tooltip profile dropdown */}
              <div className="absolute right-0 top-12 mt-2 w-48 rounded-xl glass border border-white/10 p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all font-semibold"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link 
            href="/auth"
            className="px-5 py-2 rounded-xl bg-white text-black hover:bg-slate-200 font-extrabold text-sm shadow-lg transition-transform duration-200 active:scale-95"
          >
            Get Started
          </Link>
        )}
      </div>

      {/* Mobile Toggle Buttons */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-all"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full glass p-5 flex flex-col gap-4 shadow-2xl animate-fade-in border-b border-white/10 md:hidden">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                  {user.name.slice(0,2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{user.name}</span>
                  <span className="text-xs text-dark-muted">{user.email}</span>
                </div>
              </div>

              {navLinks.map((link) => {
                const LinkIcon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link 
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      active 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-dark-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LinkIcon size={18} />
                    {link.label}
                  </Link>
                );
              })}

              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-semibold"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          ) : (
            <Link 
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center bg-white text-black font-extrabold rounded-xl hover:bg-slate-200 transition-all text-sm block"
            >
              Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
