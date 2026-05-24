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
          // Register Flow: Firebase create user -> Store user profile -> Redirect
          try {
            creds = await createUserWithEmailAndPassword(auth, email, password);
          } catch (fbErr) {
            if (fbErr.code === 'auth/email-already-in-use') {
              throw new Error("An account already exists with this email address.");
            } else if (fbErr.code === 'auth/weak-password') {
              throw new Error("Password is too weak. Please use at least 6 characters.");
            } else if (fbErr.code === 'auth/invalid-email') {
              throw new Error("Please enter a valid email address.");
            }
            throw fbErr;
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
          // Login Flow: Firebase authentication -> Fetch user profile -> Redirect
          try {
            creds = await signInWithEmailAndPassword(auth, email, password);
          } catch (fbErr) {
            if (fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/user-not-found') {
              throw new Error("Invalid email address or password.");
            } else if (fbErr.code === 'auth/invalid-email') {
              throw new Error("Please enter a valid email address.");
            }
            throw fbErr;
          }
          const firebaseUser = creds.user;
          const profile = await apiService.auth.login(firebaseUser.uid);
          setUser(profile);
          router.push('/dashboard');
          return profile;
        }
      } else {
        // Local Mock Login/Register Bypass
        const mockUid = `local_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        let profile;
        if (isSignUp) {
          profile = await apiService.auth.register(
            mockUid,
            email.split('@')[0],
            email
          );
        } else {
          try {
            profile = await apiService.auth.login(mockUid);
          } catch (e) {
            // Auto register on local bypass login to keep experience smooth
            profile = await apiService.auth.register(
              mockUid,
              email.split('@')[0],
              email
            );
          }
        }
        setUser(profile);
        localStorage.setItem('intelliview_user', JSON.stringify(profile));
        router.push('/dashboard');
        return profile;
      }
    } catch (err) {
      console.error("[useAuth] Authentication error:", err);
      setError(err.message || 'Authentication failed. Please verify your details.');
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isConfigured && auth && googleProvider) {
        // Google login flow: Google provider -> Firebase auth -> Create profile if missing -> Redirect
        let creds;
        try {
          creds = await signInWithPopup(auth, googleProvider);
        } catch (fbErr) {
          if (fbErr.code === 'auth/popup-closed-by-user') {
            throw new Error("Google sign-in popup was closed before completion.");
          }
          throw fbErr;
        }
        const firebaseUser = creds.user;
        const profile = await apiService.auth.google(
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
        const mockProfile = await apiService.auth.google(
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
      try {
        await apiService.auth.logout();
      } catch (e) {}
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
