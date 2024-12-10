document.addEventListener('DOMContentLoaded', () => {
    const insertButton = document.getElementById('insert-button');
    const imageUpload = document.getElementById('imageUpload');
    
    // Define the format buttons with their corresponding answers
    const formatButtons = {
        A: document.getElementById('answer-a'),
        B: document.getElementById('answer-b'),
        C: document.getElementById('answer-c'),
        D: document.getElementById('answer-d'),
        E: document.getElementById('answer-e')
    };

    // Reset highlights function
    const resetHighlights = () => {
        Object.values(formatButtons).forEach(button => {
            if (button) button.style.backgroundColor = '';
        });
    };

    // Handle Insert button click
    insertButton.addEventListener('click', () => {
        imageUpload.click();
    });

    // Handle image upload
    imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://localhost:3000/api/analyze-image', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            // Update the document title with GPT's answer
            const titleInput = document.querySelector('.docs-title-input');
            titleInput.value = data.answer;
            
        } catch (error) {
            console.error('Error:', error);
            const titleInput = document.querySelector('.docs-title-input');
            titleInput.value = 'Error processing image';
        }
    });
});
