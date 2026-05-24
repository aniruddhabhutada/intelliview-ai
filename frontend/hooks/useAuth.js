import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, isConfigured } from '../services/firebase';
import { apiService } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Load user session on mount
  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            // Register/Fetch user profile in FastAPI database
            const profile = await apiService.auth.register(
              firebaseUser.uid,
              firebaseUser.displayName || firebaseUser.email.split('@')[0],
              firebaseUser.email
            );
            setUser(profile);
          } catch (err) {
            console.error("[useAuth] Failed to sync Firebase user with backend:", err);
            // Standalone profile in case backend is offline
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Candidate',
              email: firebaseUser.email,
              resume_url: null,
              skills: []
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local Bypass Mode
      const localSession = localStorage.getItem('intelliview_user');
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          // Sync with backend database
          apiService.auth.getProfile(parsed.id)
            .then(profile => {
              setUser(profile);
              localStorage.setItem('intelliview_user', JSON.stringify(profile));
            })
            .catch(() => {
              setUser(parsed);
            })
            .finally(() => setLoading(false));
        } catch (e) {
          localStorage.removeItem('intelliview_user');
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    }
  }, []);

  const loginWithEmail = async (email, password, isSignUp = false) => {
    setLoading(true);
    setError(null);
    try {
      if (isConfigured && auth) {
        let creds;
        if (isSignUp) {
          creds = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          creds = await signInWithEmailAndPassword(auth, email, password);
        }
        const firebaseUser = creds.user;
        const profile = await apiService.auth.register(
          firebaseUser.uid,
          email.split('@')[0],
          email
        );
        setUser(profile);
        router.push('/dashboard');
        return profile;
      } else {
        // Local Mock Login/Register
        const mockUid = `local_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const mockProfile = await apiService.auth.register(
          mockUid,
          email.split('@')[0],
          email
        );
        setUser(mockProfile);
        localStorage.setItem('intelliview_user', JSON.stringify(mockProfile));
        router.push('/dashboard');
        return mockProfile;
      }
    } catch (err) {
      console.error("[useAuth] Login error:", err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isConfigured && auth && googleProvider) {
        const creds = await signInWithPopup(auth, googleProvider);
        const firebaseUser = creds.user;
        const profile = await apiService.auth.register(
          firebaseUser.uid,
          firebaseUser.displayName || 'Candidate',
          firebaseUser.email
        );
        setUser(profile);
        router.push('/dashboard');
        return profile;
      } else {
        // Local Mock Google Login
        const mockUid = "mock_google_candidate_100";
        const mockProfile = await apiService.auth.register(
          mockUid,
          "Alex Candidate",
          "alex.candidate@gmail.com"
        );
        setUser(mockProfile);
        localStorage.setItem('intelliview_user', JSON.stringify(mockProfile));
        router.push('/dashboard');
        return mockProfile;
      }
    } catch (err) {
      console.error("[useAuth] Google Auth error:", err);
      setError(err.message || 'Google Authentication failed.');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isConfigured && auth) {
        await signOut(auth);
      }
      localStorage.removeItem('intelliview_user');
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error("[useAuth] Signout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const updated = await apiService.auth.getProfile(user.id);
      setUser(updated);
      if (!isConfigured) {
        localStorage.setItem('intelliview_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.error("[useAuth] Failed to refresh profile:", e);
    }
  };

  return {
    user,
    loading,
    error,
    isFirebase: isConfigured,
    loginWithEmail,
    loginWithGoogle,
    logout,
    refreshProfile
  };
}
export default useAuth;
