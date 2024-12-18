import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

let userNotes = '';
let gptOutput = '';
let showingGptOutput = false;

document.getElementById('file-button').addEventListener('click', function() {
  const editor = document.getElementById('editor');
  const outputPage = document.getElementById('outputPage');
  
  if (!showingGptOutput) {
    // Save current notes and switch to GPT output
    userNotes = editor.innerHTML;
    editor.innerHTML = gptOutput || outputPage.innerHTML;
    showingGptOutput = true;
  } else {
    // Save GPT output and switch back to notes
    gptOutput = editor.innerHTML;
    editor.innerHTML = userNotes;
    showingGptOutput = false;
  }
});

// Insert button functionality
document.getElementById('insert-button').addEventListener('click', function() {
  document.getElementById('imageUpload').click();
});

// Handle file upload
document.getElementById('imageUpload').addEventListener('change', async function(event) {
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.answer) {
        // Store GPT's response
        gptOutput = data.answer;
        document.getElementById('outputPage').innerHTML = data.answer;
        
        // If we're currently showing output, update the editor content
        if (showingGptOutput) {
          editor.innerHTML = data.answer;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
});

// Profile dropdown functionality
const profileContainer = document.querySelector('.profile-container');
const profileDropdown = document.querySelector('.profile-dropdown');

profileContainer.addEventListener('click', function(e) {
    e.stopPropagation();
    profileDropdown.classList.toggle('show');
});

document.addEventListener('click', function() {
    profileDropdown.classList.remove('show');
});

// Stripe checkout handler
document.getElementById('upgrade-button').addEventListener('click', async function() {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
            window.location.href = '/signin.html';
            return;
        }

        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.uid
            })
        });
        
        const { url } = await response.json();
        window.location.href = url;
    } catch (error) {
        console.error('Error:', error);
    }
});

// Add this function at the top level
function showToast(message) {
    const toast = document.getElementById('successToast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// Check for payment success parameter
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('payment') === 'success') {
    showToast('Successfully upgraded to pro! 🎉');
    // Remove the query parameter
    window.history.replaceState({}, '', '/main.html');
}

// Add this after the upgrade-button event listener
document.getElementById('settings-button').addEventListener('click', function() {
    window.location.href = '/settings.html';
});

// Add this after the upgrade-button event listener
document.getElementById('manage-subscription').addEventListener('click', async function() {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
            window.location.href = '/signin.html';
            return;
        }

        const response = await fetch('/api/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.uid
            })
        });
        
        const { url } = await response.json();
        window.location.href = url;
    } catch (error) {
        console.error('Error:', error);
    }
});

// Add this after the upgrade-button event listener
document.getElementById('manage-subscription-button').addEventListener('click', async function() {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
            window.location.href = '/signin.html';
            return;
        }

        const response = await fetch('/api/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.uid
            })
        });
        
        const { url } = await response.json();
        if (url) {
            window.location.href = url;
        }
    } catch (error) {
        console.error('Error:', error);
    }
});