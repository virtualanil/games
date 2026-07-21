import { db } from './firebase.js';
import { currentUser } from './auth.js';
import { collection, serverTimestamp, getDocs, query, orderBy, limit, doc, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function saveScore(score, wpm, difficulty) {
    if (!currentUser) return false;
    const collectionName = `leaderboard_${difficulty}`;
    const userDocRef = doc(db, collectionName, currentUser.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(userDocRef);
            let shouldSave = false;

            if (!sfDoc.exists()) {
                shouldSave = true;
            } else if (wpm > sfDoc.data().wpm) {
                shouldSave = true;
            }

            if (shouldSave) {
                transaction.set(userDocRef, {
                    name: currentUser.displayName,
                    email: currentUser.email,
                    score: score,
                    wpm: wpm,
                    difficulty: difficulty,
                    time: serverTimestamp()
                });
            }
        });
        return true;
    } catch (e) {
        console.error("Score transaction failed", e);
        return false;
    }
}

export async function loadLeaderboard(listId, difficulty) {
    const listEl = document.getElementById(listId);
    if (!listEl) return;
    listEl.innerHTML = '<li>Loading...</li>';
    
    try {
        const q = query(collection(db, `leaderboard_${difficulty}`), orderBy("wpm", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        listEl.innerHTML = ''; 
        if (querySnapshot.empty) {
            listEl.innerHTML = '<li>No scores yet. Be the first!</li>';
            return;
        }
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            listEl.innerHTML += `<li>
                <span class="lb-name">${data.name || 'Anonymous'}</span>
                <span class="lb-stats">SCORE: ${data.score}</span>
                <span class="lb-score">WPM: ${data.wpm}</span>
            </li>`;
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        listEl.innerHTML = '<li>Error loading scores. Check Firestore rules.</li>';
    }
}
