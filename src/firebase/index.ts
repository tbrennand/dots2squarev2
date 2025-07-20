// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, collection, addDoc, getDoc, increment } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Type definition for a match document
interface Match {
  players: string[];
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
interface UserStats {
  wins: number;
  losses: number;
  ties: number;
}

// The initial state for a new match document in Firestore
const getInitialMatchState = (gridSize: number = 6): Match => ({
  players: [],
  playerColors: {},
  scores: {},
  lines: {},
  squares: {},
  currentPlayer: null,
  state: 'lobby',
  winner: null,
  gridSize,
});


export const createMatch = async (creatorId: string, size: number = 6) => {
  console.log(`Creating new match for user ${creatorId}...`);
  const initialData = getInitialMatchState(size);
  // Set the creator as the first player
  initialData.players = [creatorId];

  const matchCollection = collection(db, 'matches');
  const newMatchRef = await addDoc(matchCollection, initialData);

  console.log(`Created match with ID: ${newMatchRef.id}`);
  return newMatchRef.id;
};

export const updateMatch = async (matchId: string, updates: Record<string, any>) => {
  const matchRef = doc(db, 'matches', matchId);
  // Use updateDoc to modify specific fields without overwriting the entire document
  await updateDoc(matchRef, updates);
};

export const subscribeToMatch = (matchId: string, callback: (data: Match | null) => void) => {
  console.log(`Subscribing to match ${matchId}...`);
  const unsub = onSnapshot(doc(db, 'matches', matchId), (doc) => {
    if (doc.exists()) {
        callback(doc.data() as Match);
    } else {
        console.error(`Match with ID ${matchId} does not exist.`);
        callback(null);
    }
  });
  return unsub; // Return the unsubscribe function
};

export const updateUserStats = async (userId: string, result: 'win' | 'loss' | 'tie') => {
  if (userId === 'AI-Player') return; // Do not track stats for the AI

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
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  if (userId === 'AI-Player') return null;
  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  return statsSnap.exists() ? statsSnap.data() as UserStats : null;
};

export { db };
