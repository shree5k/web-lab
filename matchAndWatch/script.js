import config from './config.js';

const API_KEY = config.TMDB_API_KEY;
const BASE_URL = config.BASE_URL;
const IMAGE_BASE_URL = config.IMAGE_BASE_URL;

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded and parsed");

    const cardContainer = document.querySelector('.card-container');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const matchedList = document.getElementById('matched-list');
    const matchesSection = document.querySelector('.matches-section');

    let currentCardsData = [];
    let deckCards = [];
    let activeCardElement = null;
    let likedMovies = [];
    let dislikedMovies = [];
    const MAX_VISIBLE_STACK_CARDS = 3;
    const STACK_TILT_ANGLE = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-tilt-angle')) || 3;
    let isDragging = false;
    let startX, startY, currentX, currentY, deltaX = 0;
    const SWIPE_THRESHOLD = 80;

    async function fetchMovies() {
        if (config.USE_LOCAL_DATA) {
            console.log("fetchMovies called (local mode).");
            loadingIndicator.textContent = 'Loading local images...';
            try {
                const localMovies = [];
                for (let i = 1; i <= config.LOCAL_IMAGE_COUNT; i++) {
                    const paddedIndex = String(i).padStart(2, '0');
                    const filename = `${config.LOCAL_IMAGE_PREFIX}${paddedIndex}${config.LOCAL_IMAGE_EXTENSION}`;
                    localMovies.push({
                        id: `local_${i}`,
                        title: `Local Movie ${i}`,
                        poster_path: filename
                    });
                }
                console.log("Generated local movie data:", localMovies);
                await new Promise(resolve => setTimeout(resolve, 50));
                loadingIndicator.style.display = 'none';
                return localMovies;
            } catch (error) {
                console.error("Error generating local movie data:", error);
                loadingIndicator.textContent = `Failed to load local movies: ${error.message}.`;
                return [];
            }

        } else {
            console.log("fetchMovies called (API mode).");
            if (!API_KEY || API_KEY === '__TMDB_API_KEY__' || API_KEY === 'YOUR_LOCAL_DEVELOPMENT_API_KEY' || API_KEY.length < 10) {
                loadingIndicator.textContent = 'Error: Invalid or Missing TMDb API Key for API mode.';
                console.error("TMDb API Key invalid or missing!");
                return [];
            }
            try {
                loadingIndicator.textContent = 'Fetching movies...';
                const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("TMDb API Error:", response.status, errorText);
                    let userMessage = `HTTP error! Status: ${response.status}`;
                    if (response.status === 401) {
                        userMessage = "Error: Invalid TMDb API Key provided.";
                    } else if (response.status === 404) {
                        userMessage = "Error: Movie resource not found (404).";
                    }
                    throw new Error(userMessage);
                }
                const data = await response.json();
                const validMovies = data.results
                    .filter(movie => movie.poster_path)
                    .slice(0, 10)
                    .map(movie => ({ id: movie.id, title: movie.title, poster_path: movie.poster_path }));
                if (validMovies.length === 0) console.warn("No valid movies with posters found from API.");
                return validMovies;
            } catch (error) {
                console.error("Error fetching movies:", error);
                loadingIndicator.textContent = `Failed to load movies: ${error.message}.`;
                return [];
            }
        }
    }

    function createCardElement(movie) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.movieId = movie.id;

        const img = document.createElement('img');

        if (config.USE_LOCAL_DATA) {
            img.src = `${config.LOCAL_IMAGE_PATH}${movie.poster_path}`;
        } else {
            if (movie.poster_path) {
                 img.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
            } else {
                img.src = '';
                console.warn(`Movie "${movie.title}" (ID: ${movie.id}) has no poster_path.`);
            }
        }

        img.alt = `Poster for ${movie.title}`;
        img.loading = 'lazy';
        img.onerror = () => {
            console.warn(`Failed to load image: ${img.src}`);
            img.remove();
            const fallbackText = document.createElement('p');
            fallbackText.textContent = movie.title + "\n(Image unavailable)";
            fallbackText.classList.add('movie-title');
            fallbackText.style.whiteSpace = 'pre-wrap';
             fallbackText.style.textAlign = 'center';
             fallbackText.style.padding = '50% 15px 15px 15px';
            card.appendChild(fallbackText);
        };

        card.appendChild(img);
        card.addEventListener('mousedown', startDrag);
        card.addEventListener('touchstart', startDrag, { passive: true });

        return card;
    }

    function renderInitialDeck() {
        const existingCards = cardContainer.querySelectorAll('.card');
        existingCards.forEach(card => card.remove());
        deckCards = [];

        if (!currentCardsData || currentCardsData.length === 0) {
            const modeMsg = config.USE_LOCAL_DATA ? "(local mode)" : "(API mode)";
            if (!loadingIndicator.textContent.includes('Failed') && !loadingIndicator.textContent.includes('Error')) {
                 loadingIndicator.textContent = `No movies to display ${modeMsg}.`;
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
        deckCards.reverse();

        deckCards.forEach(card => {
            cardContainer.appendChild(card);
        });

        activeCardElement = deckCards[0] || null;

        updateStackTransforms();

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

    function updateStackTransforms() {
        const opacityDecrement = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-opacity-decrement')) || 0.15;
        deckCards.forEach((card, index) => {
            const positionFromTop = index;
            let translateY = 0, scale = 1, rotate = 0, opacity = 1;
            let zIndex = deckCards.length - positionFromTop;
            if (positionFromTop > 0) {
                if (positionFromTop <= MAX_VISIBLE_STACK_CARDS) {
                    const offsetY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-offset-y')) || 4;
                    const scaleDecrement = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-scale-decrement')) || 0.04;
                    translateY = positionFromTop * offsetY;
                    scale = 1 - (positionFromTop * scaleDecrement);
                    if (positionFromTop === 1) { rotate = STACK_TILT_ANGLE; }
                    opacity = Math.max(0, 1 - (positionFromTop * opacityDecrement));
                } else {
                     opacity = 0;
                     const offsetY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-offset-y')) || 4;
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
         if (e.type === 'touchmove') {
             if (Math.abs(currentX - startX) > Math.abs(currentY - startY) + 10) {
             } else {
                 return;
             }
         }
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
         const glowOpacity = swipeRatio * 0.6;
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

    function animateAndRemoveCard(direction) {
        if (!activeCardElement) return;
        const cardToRemove = activeCardElement;
        const movieId = cardToRemove.dataset.movieId;
        const choice = direction === 'right' ? 'like' : 'dislike';

        const movieData = currentCardsData.find(m => m.id == movieId);
        if (movieData) {
            if (choice === 'like') {
                likedMovies.push(movieData);
                // displayMatch(movieData);
            } else {
                dislikedMovies.push(movieData); // Store disliked movie data
            }
            currentCardsData = currentCardsData.filter(m => m.id != movieId);
        } else {
            console.warn("Could not find movie data for swiped card ID:", movieId);
        }

        deckCards = deckCards.filter(card => card !== cardToRemove);
        activeCardElement = deckCards[0] || null;

        cardToRemove.classList.remove('dragging');
        cardToRemove.classList.add(direction === 'right' ? 'gone-right' : 'gone-left');

        updateStackTransforms();

        if (!activeCardElement) disableButtons(); else enableButtons();

        cardToRemove.addEventListener('transitionend', () => {
            if (cardToRemove.parentNode) cardToRemove.remove();
            if (deckCards.length === 0 && !loadingIndicator.textContent.includes('Failed') && !loadingIndicator.textContent.includes('Error') ) {
                 displayEndMessage();
             }
        }, { once: true });
         if (deckCards.length === 0) {
             setTimeout(() => {
                if (cardContainer && cardContainer.querySelectorAll('.card').length === 0 && !loadingIndicator.textContent.includes('Failed') && !loadingIndicator.textContent.includes('Error') ) {
                    displayEndMessage();
                }
             }, 600); // Adjust timeout as needed
         }
    }

    function displayEndMessage() {
         loadingIndicator.textContent = 'All movies swiped!';
         loadingIndicator.style.display = 'block';
         const existingCards = cardContainer.querySelectorAll('.card');
         existingCards.forEach(card => card.remove());
         disableButtons();
    }

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

    function displayMatch(movie) {
        if (!movie || !movie.title) return;
        matchesSection.style.display = 'block';
        const li = document.createElement('li');
        li.textContent = `✨ ${movie.title} ✨`;
        matchedList.appendChild(li);
        li.classList.add('highlight-match');
        setTimeout(() => li.classList.remove('highlight-match'), 1500);
    }

    // Optional: Function to display all liked movies at the end
    // function showFinalMatches() {
    //     if (likedMovies.length > 0) {
    //         matchesSection.style.display = 'block';
    //         matchedList.innerHTML = ''; // Clear previous list items
    //         likedMovies.forEach(movie => {
    //             const li = document.createElement('li');
    //             li.textContent = `✅ ${movie.title}`; // Different indicator for final list
    //             matchedList.appendChild(li);
    //         });
    //     } else {
    //          matchesSection.style.display = 'none'; // Hide if no matches
    //     }
    // }


    // Initialization (No changes needed)
    async function initializeApp() {
        console.log("Initializing app (after DOMContentLoaded)...");
        disableButtons();
        loadingIndicator.textContent = 'Loading setup...';
        loadingIndicator.style.display = 'block';
        const existingCardsOnInit = cardContainer.querySelectorAll('.card');
        existingCardsOnInit.forEach(card => card.remove());
        matchedList.innerHTML = '';
        matchesSection.style.display = 'none';
        likedMovies = [];
        dislikedMovies = [];
        currentCardsData = await fetchMovies();
        renderInitialDeck();
    }

    initializeApp();

});