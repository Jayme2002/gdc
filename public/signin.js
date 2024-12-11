import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBr4NT9Dp2UrvTvoaeBr02HkFe-t9IYsPo",
    authDomain: "gdclone-8fc16.firebaseapp.com",
    projectId: "gdclone-8fc16",
    storageBucket: "gdclone-8fc16.firebasestorage.app",
    messagingSenderId: "944013008902",
    appId: "1:944013008902:web:66d378e0e125897a0e6387",
    measurementId: "G-523K7DY9SW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submitAuth = document.getElementById('submitAuth');
const errorText = document.getElementById('errorText');

submitAuth.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        submitAuth.disabled = true;
        submitAuth.textContent = 'Signing in...';
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in:', userCredential.user);
        
        // Redirect to main page
        window.location.href = '/main.html';
    } catch (error) {
        console.error('Error:', error);
        errorText.textContent = error.message;
        errorText.classList.remove('hidden');
    } finally {
        submitAuth.disabled = false;
        submitAuth.textContent = 'Sign In';
    }
});