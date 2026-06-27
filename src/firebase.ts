import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDvk6ncfaXMQHgg-WvJiEEm4RWAXARLP18",
  authDomain: "onkan-web.firebaseapp.com",
  projectId: "onkan-web",
  storageBucket: "onkan-web.firebasestorage.app",
  messagingSenderId: "1080704990552",
  appId: "1:1080704990552:web:2f16c22bc5d9a43d07f92d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface RankingEntry {
  name: string;
  streak: number;
  maxLevel: number;
  createdAt: Date;
}

const rankingRef = collection(db, 'rankings');

export async function submitScore(name: string, streak: number, maxLevel: number): Promise<void> {
  await addDoc(rankingRef, {
    name,
    streak,
    maxLevel,
    createdAt: serverTimestamp(),
  });
}

export async function fetchRanking(topN = 20): Promise<RankingEntry[]> {
  const q = query(rankingRef, orderBy('streak', 'desc'), limit(topN));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      name: d.name,
      streak: d.streak,
      maxLevel: d.maxLevel,
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
    };
  });
}
