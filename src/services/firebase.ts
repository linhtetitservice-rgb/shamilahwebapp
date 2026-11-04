import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BookCategory, ShamelaBook } from '../types';

// 1. Initialize Firebase safely
let app: any;
let dbInstance: any;
let authInstance: any;
let googleProviderInstance: any;

try {
  app = initializeApp(firebaseConfig);
  // CRITICAL: The app will break without passing firestoreDatabaseId
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  authInstance = getAuth(app);
  googleProviderInstance = new GoogleAuthProvider();
} catch (err) {
  console.error('Firebase initialization warning:', err);
}

export const db = dbInstance;
export const auth = authInstance;
export const googleProvider = googleProviderInstance;

// 2. Error handling per skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is slow.');
      return false;
    }
    // permission-denied is expected on /test/connection since it is not matched in rules
    return true;
  }
}
if (typeof window !== 'undefined' && db) {
  testConnection().catch((e) => console.warn('testConnection failed gracefully', e));
}

// 4. Auth Methods
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Create / update user profile doc
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    return null;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out failed:', error);
  }
}

// 5. Firestore sync helpers for Books and Categories
export async function saveBookToCloud(userId: string, book: ShamelaBook): Promise<void> {
  const path = `users/${userId}/books/${book.id}`;
  try {
    const bookRef = doc(db, 'users', userId, 'books', book.id);
    await setDoc(bookRef, {
      id: book.id,
      titleAr: book.titleAr,
      titleMm: book.titleMm,
      authorAr: book.authorAr || '',
      authorMm: book.authorMm || '',
      categoryId: book.categoryId,
      shamelaId: book.shamelaId || '',
      url: book.url,
      volumes: book.volumes || '',
      pages: book.pages || '',
      notes: book.notes || '',
      isFavorite: book.isFavorite || false,
      userId: userId,
      createdAt: book.createdAt || Date.now(),
      lastOpenedAt: book.lastOpenedAt || Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBookFromCloud(userId: string, bookId: string): Promise<void> {
  const path = `users/${userId}/books/${bookId}`;
  try {
    const bookRef = doc(db, 'users', userId, 'books', bookId);
    await deleteDoc(bookRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCategoryToCloud(userId: string, category: BookCategory): Promise<void> {
  const path = `users/${userId}/categories/${category.id}`;
  try {
    const catRef = doc(db, 'users', userId, 'categories', category.id);
    await setDoc(catRef, {
      id: category.id,
      nameMm: category.nameMm,
      nameAr: category.nameAr || '',
      description: category.description || '',
      iconName: category.iconName || 'BookOpen',
      colorTheme: category.colorTheme || 'emerald',
      order: category.order || 1,
      userId: userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategoryFromCloud(userId: string, categoryId: string): Promise<void> {
  const path = `users/${userId}/categories/${categoryId}`;
  try {
    const catRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(catRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
