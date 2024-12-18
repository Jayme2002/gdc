import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Check authentication state when page loads
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/signin.html';
        return;
    }
});

document.getElementById('manage-subscription-button').addEventListener('click', () => {
    window.location.href = '/cancel-subscription.html';
});

// Check for cancellation success
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('cancelled') === 'true') {
    const message = document.getElementById('cancellation-message');
    message.style.display = 'block';
    // Remove the query parameter
    window.history.replaceState({}, '', '/settings.html');
} 