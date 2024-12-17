let userNotes = '';
let gptOutput = '';
let showingGptOutput = false;

document.getElementById('file-button').addEventListener('click', function() {
  const editor = document.getElementById('editor');
  const outputPage = document.getElementById('outputPage');
  
  if (!showingGptOutput) {
    // Save current notes and switch to GPT output
    userNotes = editor.textContent;
    editor.textContent = gptOutput || outputPage.textContent;
    showingGptOutput = true;
  } else {
    // Save GPT output and switch back to notes
    gptOutput = editor.textContent;
    editor.textContent = userNotes;
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
        document.getElementById('outputPage').textContent = data.answer;
        
        // If we're currently showing output, update the editor content
        if (showingGptOutput) {
          editor.textContent = data.answer;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
});