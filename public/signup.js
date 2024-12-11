import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// DOM elements
const submitAuth = document.getElementById('submitAuth');
const errorText = document.getElementById('errorText');

submitAuth.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Hide any previous error messages
    errorText.classList.add('hidden');

    // Validate passwords match
    if (password !== confirmPassword) {
        errorText.textContent = 'Passwords do not match';
        errorText.classList.remove('hidden');
        return;
    }

    try {
        submitAuth.disabled = true;
        submitAuth.textContent = 'Creating account...';
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up:', userCredential.user);
        
        // Redirect to main page
        window.location.href = '/main.html';
    } catch (error) {
        console.error('Error:', error);
        errorText.textContent = error.message;
        errorText.classList.remove('hidden');
    } finally {
        submitAuth.disabled = false;
        submitAuth.textContent = 'Sign Up';
    }
});