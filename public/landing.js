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
const modal = document.getElementById('authModal');
const signupBtn = document.getElementById('signupBtn');
const closeBtn = document.querySelector('.close');
const submitAuth = document.getElementById('submitAuth');
const errorText = document.getElementById('errorText');

// Show/hide modal functions
const showModal = () => modal.style.display = 'flex';
const hideModal = () => {
    modal.style.display = 'none';
    errorText.classList.add('hidden');
};

// Event listeners
signupBtn.addEventListener('click', showModal);
closeBtn.addEventListener('click', hideModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});

submitAuth.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        submitAuth.disabled = true;
        submitAuth.textContent = 'Creating account...';
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up:', userCredential.user);
        
        // Redirect to app page
        window.location.href = '/app.html';
    } catch (error) {
        console.error('Error:', error);
        errorText.textContent = error.message;
        errorText.classList.remove('hidden');
    } finally {
        submitAuth.disabled = false;
        submitAuth.textContent = 'Sign Up';
    }
});