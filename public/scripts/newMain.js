// Initialize Firebase and get auth state
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Initialize Firestore
const db = getFirestore(app);

// Add this function to check and update usage
async function checkUsageLimit(userId) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
        // First time user, create document
        await setDoc(userRef, {
            freeCount: 1,
            isUpgraded: false
        });
        return;
    }

    const userData = userDoc.data();
    
    // If not upgraded, check and update free count
    if (!userData.isUpgraded) {
        if (userData.freeCount >= 5) {
            throw new Error('Free usage limit reached. Press the profile icon and upgrade to premium for unlimited uses.');
        }
        
        // Increment usage count
        await updateDoc(userRef, {
            freeCount: userData.freeCount + 1
        });
    }
}

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // If not authenticated, redirect to signin page
        window.location.href = '/signin.html';
    }
});

// Initialize editor functionality
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const insertButton = document.getElementById('insert-button');
    const imageUpload = document.getElementById('imageUpload');
    const titleInput = document.querySelector('.docs-title-input');

    // Handle Insert button click
    insertButton.addEventListener('click', (e) => {
        imageUpload.click();
    });

    // Handle image upload
    imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                // Check usage limit before processing
                await checkUsageLimit(auth.currentUser.uid);

                const response = await fetch('/api/analyze-image', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.error) {
                    alert(data.error);
                    return;
                }

                if (data.answer) {
                    titleInput.value = `${data.answer}`;
                    const event = new Event('change');
                    titleInput.dispatchEvent(event);
                }
            } catch (error) {
                alert(error.message);
                console.error('Error:', error);
            }
        }
    });
});

// Handle profile dropdown
const profileIcon = document.getElementById('profileIcon');
const profileDropdown = document.getElementById('profileDropdown');
const signOutButton = document.getElementById('signOutButton');

// Toggle dropdown on profile icon click
profileIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!profileDropdown.contains(e.target) && !profileIcon.contains(e.target)) {
        profileDropdown.classList.remove('show');
    }
});

// Handle sign out
signOutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '/signin.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Add this after your existing dropdown handlers
const upgradeButton = document.querySelector('.dropdown-item:first-child');
upgradeButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }
        
        const { url } = await response.json();
        if (url) {
            window.location.href = url;
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
    }
});