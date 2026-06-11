import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, isDemoAuthMode } from './firebase';

export interface AuthenticatedUser {
  displayName: string | null;
  email: string | null;
  provider: 'demo' | 'firebase';
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUser: AuthenticatedUser = {
  displayName: 'Demo User',
  email: 'demo@package-tracker.local',
  provider: 'demo',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoAuthMode || !auth) {
      setUser(demoUser);
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(
        currentUser
          ? {
              displayName: currentUser.displayName,
              email: currentUser.email,
              provider: 'firebase',
            }
          : null,
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (isDemoAuthMode) {
      setUser(demoUser);
      return;
    }
    if (!auth) {
      throw new Error('Firebase auth is not initialized.');
    }

    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const signInWithFacebook = async () => {
    if (isDemoAuthMode) {
      setUser(demoUser);
      return;
    }
    if (!auth) {
      throw new Error('Firebase auth is not initialized.');
    }

    await signInWithPopup(auth, new FacebookAuthProvider());
  };

  const signOut = async () => {
    if (isDemoAuthMode) {
      return;
    }
    if (!auth) {
      throw new Error('Firebase auth is not initialized.');
    }

    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithFacebook, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
