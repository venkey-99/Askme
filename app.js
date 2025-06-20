// Initialize jsPDF
const { jsPDF } = window.jspdf;

// Auto-update copyright year
document.querySelectorAll('#current-year, .current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
});

// Current state
let currentSharedAnswer = null;
let allAnswers = [];

// DOM Elements
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const loadingElement = document.querySelector('.loading');
const errorElement = document.getElementById('error-message');
const topicChips = document.querySelectorAll('.topic-chip');
const globalActions = document.getElementById('global-actions');

// Event Listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

topicChips.forEach(chip => {
    chip.addEventListener('click', function() {
        searchInput.value = this.getAttribute('data-topic');
        performSearch();
    });
});

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-production-url.com';

// Main search function - UPDATED TO USE SERVER
async function performSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showError('Please enter a question or topic');
        return;
    }
    
    try {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        document.getElementById('search-results').style.display = 'none';
        globalActions.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const answers = await response.json();
        allAnswers = answers;
        displayAnswers(searchTerm, answers);
        globalActions.style.display = 'flex';
        
    } catch (error) {
        showError(error.message || 'Failed to get answers. Please try again later.');
    } finally {
        loadingElement.style.display = 'none';
    }
}

// FIXED: Answer expansion functionality
function toggleAnswerExpansion(button) {
    const answerContent = button.closest('.action-bar').previousElementSibling;
    answerContent.classList.toggle('expanded');
    button.classList.toggle('expanded');
    
    // Update button text dynamically
    button.innerHTML = button.classList.contains('expanded') 
        ? 'Less Info <span>▲</span>' 
        : 'More Info <span>▼</span>';
}

// [Include all other existing functions:
// - displayAnswers()
// - copyAnswer()
// - shareAnswer()
// - downloadAllAnswers()
// - exportToPDF()
// - generatePDF()
// - printAllAnswers()
// ... exactly as in previous versions but ensure they reference the correct DOM elements]