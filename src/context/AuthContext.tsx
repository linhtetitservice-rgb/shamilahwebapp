import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  db, 
  handleFirestoreError, 
  OperationType,
  saveBookToCloud,
  deleteBookFromCloud,
  saveCategoryToCloud,
  deleteCategoryFromCloud
} from '../services/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { ShamelaBook, BookCategory } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<User | null>;
  logout: () => Promise<void>;
  isCloudConnected: boolean;
  syncLocalToCloud: (books: ShamelaBook[], categories: BookCategory[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Firebase Auth State Notice:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Watchdog timer: Guarantee loading resolves within 2 seconds
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const login = async () => {
    return await signInWithGoogle();
  };

  const logout = async () => {
    await logOut();
    setUser(null);
  };

  const syncLocalToCloud = async (books: ShamelaBook[], categories: BookCategory[]) => {
    if (!user) return;
    try {
      // Push categories
      for (const cat of categories) {
        await saveCategoryToCloud(user.uid, cat);
      }
      // Push books
      for (const b of books) {
        await saveBookToCloud(user.uid, b);
      }
    } catch (e) {
      console.error('Failed to sync to cloud', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isCloudConnected: !!user,
        syncLocalToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
