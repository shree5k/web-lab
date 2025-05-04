import config from './config.js';
const API_KEY = config.TMDB_API_KEY;
const BASE_URL = config.BASE_URL;
const IMAGE_BASE_URL = config.IMAGE_BASE_URL;

// --- Use DOMContentLoaded wrapper for safety ---
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded and parsed");

    // --- Query for DOM elements ---
    const cardContainer = document.querySelector('.card-container');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const matchedList = document.getElementById('matched-list');
    const matchesSection = document.querySelector('.matches-section');

    // --- Declare other variables ---
    let currentCardsData = [];
    let deckCards = [];
    let activeCardElement = null;
    let likedMovies = [];
    let dislikedMovies = [];
    const MAX_VISIBLE_STACK_CARDS = 3;
    const STACK_TILT_ANGLE = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-tilt-angle')) || 3; // Use updated value from CSS
    let isDragging = false;
    let startX, startY, currentX, currentY, deltaX = 0;
    const SWIPE_THRESHOLD = 80;


    // --- FUNCTIONS ---

    // API Fetching
    async function fetchMovies() {
        console.log("fetchMovies called.");
        if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY' || API_KEY.length < 10) {
            loadingIndicator.textContent = 'Error: Invalid or Missing TMDb API Key in script.js';
            console.error("TMDb API Key invalid or missing!");
            return [];
        }
        try {
            loadingIndicator.textContent = 'Fetching movies...';
            const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("TMDb API Error:", errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const validMovies = data.results
                .filter(movie => movie.poster_path)
                .slice(0, 10)
                 .map(movie => ({ id: movie.id, title: movie.title, poster_path: movie.poster_path }));
            if (validMovies.length === 0) console.warn("No valid movies found.");
            return validMovies;
        } catch (error) {
            console.error("Error fetching movies:", error);
            loadingIndicator.textContent = `Failed to load movies: ${error.message}.`;
            return [];
        }
    }

    // Card Creation (Title commented out)
    function createCardElement(movie) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.movieId = movie.id;

        const img = document.createElement('img');
        img.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
        img.alt = `Poster for ${movie.title}`; // Alt text still useful
        img.loading = 'lazy';
        img.onerror = () => {
            console.warn(`Failed to load image: ${img.src}`);
            // No title element to update text on
            img.remove();
        };

        // --- Title Creation/Appending Commented Out ---
        /*
        const title = document.createElement('div');
        title.classList.add('movie-title');
        title.textContent = movie.title;
        */
       // --- End Comment Out ---

        card.appendChild(img);
        // --- Comment Out Appending Title ---
        // card.appendChild(title);
        // --- End Comment Out ---


        card.addEventListener('mousedown', startDrag);
        card.addEventListener('touchstart', startDrag, { passive: true });

        return card;
    }

    // Card Rendering & Stacking
    function renderInitialDeck() {
        const existingCards = cardContainer.querySelectorAll('.card');
        existingCards.forEach(card => card.remove());
        deckCards = [];

        if (!currentCardsData || currentCardsData.length === 0) {
            if (!loadingIndicator.textContent.includes('Failed') && !loadingIndicator.textContent.includes('Error')) {
                 loadingIndicator.textContent = 'No movies to display.';
            }
            loadingIndicator.style.display = 'block';
            disableButtons();
            return;
        } else {
            loadingIndicator.style.display = 'none';
        }

        currentCardsData.forEach(movie => {
            const cardElement = createCardElement(movie);
            deckCards.push(cardElement);
        });
        deckCards.reverse(); // Top card at index 0

        deckCards.forEach(card => {
            cardContainer.appendChild(card);
        });

        activeCardElement = deckCards[0] || null;

        updateStackTransforms(); // Apply initial stack visuals

        if (activeCardElement) {
            enableButtons();
        } else {
            disableButtons();
            if (currentCardsData.length > 0) {
                 loadingIndicator.textContent = 'Error rendering cards.';
                 loadingIndicator.style.display = 'block';
            }
        }
    }

    // Update Visual Stack (with Tilt and Opacity)
    function updateStackTransforms() {
        // Get opacity decrement value from CSS, with a fallback
        const opacityDecrement = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-opacity-decrement')) || 0.15; // Use updated value

        deckCards.forEach((card, index) => {
            const positionFromTop = index;
            let translateY = 0;
            let scale = 1;
            let rotate = 0;
            let opacity = 1; // Start with full opacity
            let zIndex = deckCards.length - positionFromTop;

            if (positionFromTop > 0) {
                if (positionFromTop <= MAX_VISIBLE_STACK_CARDS) {
                    const offsetY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-offset-y')) || 4; // Use updated value
                    const scaleDecrement = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-scale-decrement')) || 0.04;
                    translateY = positionFromTop * offsetY;
                    scale = 1 - (positionFromTop * scaleDecrement);
                    if (positionFromTop === 1) { rotate = STACK_TILT_ANGLE; }

                    // Calculate Opacity
                    opacity = 1 - (positionFromTop * opacityDecrement);
                    opacity = Math.max(0, opacity); // Don't go below 0

                } else { // Hide cards too deep
                     opacity = 0;
                     const offsetY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-offset-y')) || 4; // Use updated value
                     const scaleDecrement = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-scale-decrement')) || 0.04;
                     translateY = MAX_VISIBLE_STACK_CARDS * offsetY;
                     scale = 1 - (MAX_VISIBLE_STACK_CARDS * scaleDecrement);
                     zIndex = 0;
                }
            }
            card.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
            card.style.opacity = opacity;
            card.style.zIndex = zIndex;
        });
    }

    // --- Swipe Logic --- (No changes needed in startDrag, drag, updateIndicatorOpacity, updateBackgroundGlow, endDrag)
    function startDrag(e) {
        if (!activeCardElement || !activeCardElement.contains(e.target) || isDragging) return;
        isDragging = true;
        activeCardElement.classList.add('dragging');
        startX = e.pageX || e.touches[0].pageX;
        startY = e.pageY || e.touches[0].pageY;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('mouseleave', endDrag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
        document.addEventListener('touchcancel', endDrag);
        if (e.type === 'mousedown') e.preventDefault();
    }
    function drag(e) {
        if (!isDragging || !activeCardElement) return;
        currentX = e.pageX || e.touches[0].pageX;
        currentY = e.pageY || e.touches[0].pageY;
        if (e.type === 'touchmove') { if (Math.abs(currentX - startX) > Math.abs(currentY - startY) + 10) e.preventDefault(); }
        deltaX = currentX - startX;
        const rotateDeg = deltaX * 0.1;
        activeCardElement.style.transform = `translateX(${deltaX}px) rotate(${rotateDeg}deg)`;
        updateIndicatorOpacity(deltaX);
        updateBackgroundGlow(deltaX);
    }
    function updateIndicatorOpacity(delta) {
        if (!activeCardElement) return;
        if (delta > 10) { activeCardElement.classList.add('show-like'); activeCardElement.classList.remove('show-dislike'); }
        else if (delta < -10) { activeCardElement.classList.add('show-dislike'); activeCardElement.classList.remove('show-like'); }
        else { activeCardElement.classList.remove('show-like', 'show-dislike'); }
    }
    function updateBackgroundGlow(delta) {
        const swipeRatio = Math.min(Math.abs(delta) / (SWIPE_THRESHOLD * 1.5), 1);
        const glowOpacity = swipeRatio * 0.6; // Keep max opacity adjustment here
        let glowHue = 0;
        if (delta > 10) glowHue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glow-color-like-hue')) || 120;
        else if (delta < -10) glowHue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glow-color-dislike-hue')) || 0;
        document.documentElement.style.setProperty('--current-glow-hue', glowHue);
        document.documentElement.style.setProperty('--glow-opacity', glowOpacity);
    }
    function endDrag(e) {
        if (!isDragging || !activeCardElement) return;
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('mouseleave', endDrag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', endDrag);
        document.removeEventListener('touchcancel', endDrag);
        document.documentElement.style.setProperty('--glow-opacity', 0);
        activeCardElement.classList.remove('show-like', 'show-dislike');
        const decisionMade = Math.abs(deltaX) > SWIPE_THRESHOLD;
        if (decisionMade) {
            const direction = deltaX > 0 ? 'right' : 'left';
            animateAndRemoveCard(direction);
        } else {
            activeCardElement.classList.remove('dragging');
            updateStackTransforms();
        }
        deltaX = 0;
    }


    // Animate Card Removal & Update State
    function animateAndRemoveCard(direction) {
        if (!activeCardElement) return;
        const cardToRemove = activeCardElement;
        const movieId = cardToRemove.dataset.movieId;
        const choice = direction === 'right' ? 'like' : 'dislike';
        const movieData = currentCardsData.find(m => m.id == movieId);
        if (movieData) {
            if (choice === 'like') likedMovies.push(movieData); else dislikedMovies.push(movieData);
            currentCardsData = currentCardsData.filter(m => m.id != movieId);
        }
        deckCards = deckCards.filter(card => card !== cardToRemove);
        activeCardElement = deckCards[0] || null;
        cardToRemove.classList.remove('dragging');
        cardToRemove.classList.add(direction === 'right' ? 'gone-right' : 'gone-left');
        updateStackTransforms();
        if (!activeCardElement) disableButtons(); else enableButtons();
        cardToRemove.addEventListener('transitionend', () => {
            if (cardToRemove.parentNode) cardToRemove.remove();
            if (deckCards.length === 0) displayEndMessage();
        }, { once: true });
        if (deckCards.length === 0) {
            setTimeout(() => { if (cardContainer && cardContainer.querySelectorAll('.card').length === 0) displayEndMessage(); }, 600);
        }
    }

    // Display End Message
    function displayEndMessage() {
         loadingIndicator.textContent = 'All movies swiped! Check your matches.';
         loadingIndicator.style.display = 'block';
         const existingCards = cardContainer.querySelectorAll('.card');
         existingCards.forEach(card => card.remove());
         disableButtons();
    }

    // Button Controls
    function disableButtons() {
        likeBtn.disabled = true; dislikeBtn.disabled = true;
    }
    function enableButtons() {
        likeBtn.disabled = false; dislikeBtn.disabled = false;
    }
    likeBtn.addEventListener('click', () => {
        if (!activeCardElement || isDragging) return;
        animateAndRemoveCard('right');
    });
    dislikeBtn.addEventListener('click', () => {
        if (!activeCardElement || isDragging) return;
        animateAndRemoveCard('left');
    });

    // Displaying Matches
    function displayMatch(movie) {
        if (!movie || !movie.title) return;
        matchesSection.style.display = 'block';
        const li = document.createElement('li');
        li.textContent = `✨ ${movie.title} ✨`;
        matchedList.appendChild(li);
        li.classList.add('highlight-match');
        setTimeout(() => li.classList.remove('highlight-match'), 1500);
    }

    // Initialization
    async function initializeApp() {
        console.log("Initializing app (after DOMContentLoaded)...");
        disableButtons();
        loadingIndicator.textContent = 'Loading setup...';
        loadingIndicator.style.display = 'block';
        const existingCardsOnInit = cardContainer.querySelectorAll('.card');
        existingCardsOnInit.forEach(card => card.remove());
        matchedList.innerHTML = '';
        matchesSection.style.display = 'none';

        // Single Player Path:
        currentCardsData = await fetchMovies();
        renderInitialDeck();
    }

    // --- Start the application ---
    initializeApp();

});