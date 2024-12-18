import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBr4NT9Dp2UrvTvoaeBr02HkFe-t9IYsPo",
    authDomain: "gdclone-8fc16.firebaseapp.com",
    projectId: "gdclone-8fc16",
    storageBucket: "gdclone-8fc16.firebasestorage.app",
    messagingSenderId: "944013008902",
    appId: "1:944013008902:web:66d378e0e125897a0e6387",
    measurementId: "G-523K7DY9SW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Load subscription details
async function loadSubscriptionDetails(user) {
    try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        const subscriptionInfo = document.getElementById('subscription-info');

        if (!userData || !userData.isUpgraded) {
            subscriptionInfo.innerHTML = `
                <p>No active subscription found. <br>
                You currently don't have an active subscription.</p>
            `;
            return;
        }

        // Calculate remaining days
        const subscriptionDate = new Date(userData.subscriptionDate);
        const currentDate = new Date();
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const endDate = new Date(subscriptionDate.getTime() + thirtyDaysInMs);
        const remainingDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));

        subscriptionInfo.innerHTML = `
            <p><strong>Status:</strong> Active</p>
            <p><strong>Subscription Started:</strong> ${subscriptionDate.toLocaleDateString()}</p>
            <p><strong>Current Period Ends:</strong> ${endDate.toLocaleDateString()}</p>
            <p><strong>Days Remaining:</strong> ${remainingDays} days</p>
            <p><strong>Access to Pro Features Until:</strong> ${endDate.toLocaleDateString()}</p>
        `;
    } catch (error) {
        console.error('Detailed error:', error);
        const subscriptionInfo = document.getElementById('subscription-info');
        subscriptionInfo.innerHTML = `
            <p>Error loading subscription details. Please try again later.</p>
        `;
    }
}

// Check authentication state when page loads
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/signin.html';
        return;
    }
    console.log('User authenticated:', user.uid);
    loadSubscriptionDetails(user);
});

// Event Listeners
document.getElementById('confirm-cancel').addEventListener('click', async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = '/signin.html';
            return;
        }

        // Update user document in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            isUpgraded: false
        });

        window.location.href = '/settings.html?cancelled=true';
    } catch (error) {
        console.error('Error:', error);
    }
});

document.getElementById('keep-subscription').addEventListener('click', () => {
    window.location.href = '/settings.html';
});