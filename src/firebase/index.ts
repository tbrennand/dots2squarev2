// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';


import { getFirestore, doc, setDoc, onSnapshot, updateDoc, collection, addDoc, getDoc, increment } from 'firebase/firestore';

// Check if Firebase environment variables are properly set
const hasValidFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "placeholder-api-key" &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== "placeholder-project-id";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "placeholder-measurement-id"
};

// Initialize Firebase only if we have valid configuration
let app;
let db;

if (hasValidFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed. Multiplayer features will be disabled.', error);
    app = null;
    db = null;
  }
} else {
  console.warn('Firebase configuration not found. Multiplayer features will be disabled.');
  app = null;
  db = null;
}

// Type definition for a match document
interface Match {
  players: string[];
  playerNames: Record<string, string>; // Maps playerId to username
  playerColors: Record<string, string>; // Maps playerId to color
  scores: Record<string, number>;
  lines: Record<string, string>; // Maps lineId to playerId
  squares: Record<string, string>;
  currentPlayer: string | null;
  state: 'lobby' | 'in-progress' | 'finished';
  winner: string | null;
  gridSize: number;
}

// Type definition for user statistics
export interface UserStats {
  wins: number;
  losses: number;
  ties: number;
}

// The initial state for a new match document in Firestore
const getInitialMatchState = (gridSize: number = 6): Match => ({
  players: [],
  playerNames: {},
  playerColors: {},
  scores: {},
  lines: {},
  squares: {},
  currentPlayer: null,
  state: 'lobby',
  winner: null,
  gridSize,
});


export const createMatch = async (creatorId: string, creatorName: string, size: number = 6) => {
  if (!db) {
    console.warn('Firebase not initialized. Cannot create match.');
    return null;
  }
  
  console.log(`Creating new match for user ${creatorName} (${creatorId})...`);
  const initialData = getInitialMatchState(size);
  // Set the creator as the first player
  initialData.players = [creatorId];
  initialData.playerNames[creatorId] = creatorName;

  try {
    const matchCollection = collection(db, 'matches');
    const newMatchRef = await addDoc(matchCollection, initialData);

    console.log(`Created match with ID: ${newMatchRef.id}`);
    return newMatchRef.id;
  } catch (error) {
    console.error('Failed to create match:', error);
    return null;
  }
};

export const updateMatch = async (matchId: string, updates: Record<string, any>) => {
  if (!db) {
    console.warn('Firebase not initialized. Cannot update match.');
    return;
  }
  
  try {
    const matchRef = doc(db, 'matches', matchId);
    // Use updateDoc to modify specific fields without overwriting the entire document
    await updateDoc(matchRef, updates);
  } catch (error) {
    console.error('Failed to update match:', error);
  }
};

export const subscribeToMatch = (matchId: string, callback: (data: Match | null) => void) => {
  if (!db) {
    console.warn('Firebase not initialized. Cannot subscribe to match.');
    return () => {}; // Return empty unsubscribe function
  }
  
  console.log(`Subscribing to match ${matchId}...`);
  try {
    const unsub = onSnapshot(doc(db, 'matches', matchId), (doc) => {
      if (doc.exists()) {
          callback(doc.data() as Match);
      } else {
          console.error(`Match with ID ${matchId} does not exist.`);
          callback(null);
      }
    });
    return unsub; // Return the unsubscribe function
  } catch (error) {
    console.error('Failed to subscribe to match:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

export const updateUserStats = async (userId: string, result: 'win' | 'loss' | 'tie') => {
  if (userId === 'AI-Player') return; // Do not track stats for the AI
  if (!db) {
    console.warn('Firebase not initialized. Cannot update user stats.');
    return;
  }

  try {
    const statsRef = doc(db, 'userStats', userId);
    const statsSnap = await getDoc(statsRef);

    const updateField = result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'ties';

    if (statsSnap.exists()) {
      await updateDoc(statsRef, {
        [updateField]: increment(1)
      });
    } else {
      // If the user has no stats document, create one
      await setDoc(statsRef, {
        wins: result === 'win' ? 1 : 0,
        losses: result === 'loss' ? 1 : 0,
        ties: result === 'tie' ? 1 : 0,
      });
    }
  } catch (error) {
    console.error('Failed to update user stats:', error);
  }
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  if (userId === 'AI-Player') return null;
  if (!db) {
    console.warn('Firebase not initialized. Cannot get user stats.');
    return null;
  }

  try {
    const statsRef = doc(db, 'userStats', userId);
    const statsSnap = await getDoc(statsRef);
    return statsSnap.exists() ? statsSnap.data() as UserStats : null;
  } catch (error) {
    console.error('Failed to get user stats:', error);
    return null;
  }
};

export { db };
