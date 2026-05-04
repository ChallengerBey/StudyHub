import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export const useAuthUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Initialize user document if not exists
        const userRef = doc(db, 'users', user.uid);
        try {
          const uDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
          if (uDoc.empty) {
            await setDoc(userRef, {
              xp: 0,
              level: 1,
              dailyStreak: 0,
              totalStudyTime: 0,
              pomodorosCompleted: 0,
              email: user.email || ''
            });
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, 'users');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
};

export const useUserData = (uid: string | undefined) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!uid) {
      setUserData(null);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'users', uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    }, (e) => {
      handleFirestoreError(e, OperationType.GET, 'users');
    });

    return () => unsubscribe();
  }, [uid]);

  const addXp = async (amount: number) => {
    if (!uid || !userData) return;
    let newXp = userData.xp + amount;
    let newLevel = userData.level;
    const xpNeededForNextLevel = newLevel * 500;
    if (newXp >= xpNeededForNextLevel) {
      newLevel += 1;
      newXp -= xpNeededForNextLevel;
    }
    await updateDoc(doc(db, 'users', uid), {
      xp: newXp,
      level: newLevel,
      pomodorosCompleted: userData.pomodorosCompleted + 1,
      totalStudyTime: userData.totalStudyTime + 5 // +5 minutes? or add study time separated?
    });
  };

  return { userData, addXp };
};

export const useTasks = (uid: string | undefined) => {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, `users/${uid}/tasks`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [uid]);

  return { tasks };
};

export const useSubjectProgress = (uid: string | undefined) => {
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, `users/${uid}/subjectProgress`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProgress(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [uid]);

  return { progress };
};
