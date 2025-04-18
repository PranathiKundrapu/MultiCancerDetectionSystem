document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Force a repaint to ensure theme changes are applied
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger a reflow
        document.body.style.display = '';
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // File upload functionality
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewSection = document.getElementById('previewSection');
    const resultSection = document.getElementById('resultSection');
    const errorMessage = document.getElementById('errorMessage');
    const analyzeButton = document.getElementById('analyzeButton');
    const resetButton = document.getElementById('resetButton');
    const cancerTypeElement = document.getElementById('cancerType');
    const confidenceElement = document.getElementById('confidence');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    // Handle file input change
    fileInput.addEventListener('change', handleFileSelect, false);

    // Handle analyze button click
    analyzeButton.addEventListener('click', analyzeImage);

    // Handle reset button click
    resetButton.addEventListener('click', resetAll);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('highlight');
    }

    function unhighlight(e) {
        dropZone.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    previewSection.style.display = 'block';
                    resultSection.style.display = 'none';
                    errorMessage.style.display = 'none';
                };
                reader.readAsDataURL(file);
            } else {
                showError('Please upload an image file.');
            }
        }
    }

    async function analyzeImage() {
        try {
            analyzeButton.disabled = true;
            analyzeButton.textContent = 'Analyzing...';

            const formData = new FormData();
            const response = await fetch(imagePreview.src);
            const blob = await response.blob();
            formData.append('file', blob, 'image.jpg');

            const result = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await result.json();

            if (data.status === 'success') {
                cancerTypeElement.textContent = data.cancer_type;
                confidenceElement.textContent = data.confidence;
                resultSection.style.display = 'block';
                errorMessage.style.display = 'none';
            } else {
                showError(data.message || 'Error analyzing image');
            }
        } catch (error) {
            showError('Error analyzing image: ' + error.message);
        } finally {
            analyzeButton.disabled = false;
            analyzeButton.textContent = 'Analyze Scan';
        }
    }

    function showError(message) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.style.display = 'flex';
        resultSection.style.display = 'none';
    }

    function resetAll() {
        imagePreview.src = '';
        previewSection.style.display = 'none';
        resultSection.style.display = 'none';
        errorMessage.style.display = 'none';
        fileInput.value = '';
        cancerTypeElement.textContent = '-';
        confidenceElement.textContent = '-';
    }
}); 