import config from './config.js';

const API_KEY = config.TMDB_API_KEY;
const BASE_URL = config.BASE_URL;
const IMAGE_BASE_URL = config.IMAGE_BASE_URL;

document.addEventListener('DOMContentLoaded', (event) => {
    const cardContainer = document.querySelector('.card-container');
    const actionsContainer = document.querySelector('.actions'); 
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const gameOverScreen = document.getElementById('game-over-results');
    const gameOverHeading = document.getElementById('game-over-heading');
    const matchedList = document.querySelector('#game-over-results .matches-wrapper');

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
            if(loadingIndicator) loadingIndicator.textContent = 'Loading local images...';
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
                await new Promise(resolve => setTimeout(resolve, 50));
                return localMovies;
            } catch (error) {
                if(loadingIndicator) loadingIndicator.textContent = `Failed to load local movies: ${error.message}.`;
                return [];
            }

        } else {
            if (!API_KEY || API_KEY === '__TMDB_API_KEY__' || API_KEY === 'YOUR_LOCAL_DEVELOPMENT_API_KEY' || API_KEY.length < 10) {
                if(loadingIndicator) loadingIndicator.textContent = 'Error: Invalid or Missing TMDb API Key for API mode.';
                return [];
            }
            try {
                if(loadingIndicator) loadingIndicator.textContent = 'Fetching movies...';
                const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
                if (!response.ok) {
                    const errorText = await response.text();
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
                return validMovies;
            } catch (error) {
                if(loadingIndicator) loadingIndicator.textContent = `Failed to load movies: ${error.message}.`;
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
                img.onerror = () => {
                    img.remove();
                    const fallbackText = document.createElement('p');
                    fallbackText.textContent = movie.title + "\n(Image unavailable)";
                    fallbackText.classList.add('movie-title'); 
                    fallbackText.style.whiteSpace = 'pre-wrap';
                    fallbackText.style.textAlign = 'center';
                    fallbackText.style.padding = '50% 15px 15px 15px'; 
                    card.appendChild(fallbackText);
                };
            }
        }
        img.alt = `Poster for ${movie.title}`;
        img.loading = 'lazy';
        card.appendChild(img);
        card.addEventListener('mousedown', startDrag);
        card.addEventListener('touchstart', startDrag, { passive: true });
        return card;
    }

    function renderInitialDeck() {
        if (!cardContainer) { 
            console.error("Card container not found!");
            if(loadingIndicator) loadingIndicator.textContent = "Error: UI setup incomplete.";
            return;
        }
        const existingCards = cardContainer.querySelectorAll('.card');
        existingCards.forEach(card => card.remove());
        deckCards = [];

        if (!currentCardsData || currentCardsData.length === 0) {
            if (loadingIndicator && !loadingIndicator.textContent.includes('Failed') && !loadingIndicator.textContent.includes('Error')) {
                 loadingIndicator.textContent = 'No movies to display.';
            }
            if(loadingIndicator) loadingIndicator.style.display = 'block';
            disableAndHideButtons(); 
            return;
        } else {
            if(loadingIndicator) loadingIndicator.style.display = 'none'; 
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
            enableAndShowButtons();
        } else {
            disableAndHideButtons();
            if (currentCardsData.length > 0 && loadingIndicator) { 
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
                    if (positionFromTop === 1) { 
                        rotate = STACK_TILT_ANGLE;
                    }
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
                e.preventDefault(); 
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
         if (delta > 10) { 
             activeCardElement.classList.add('show-like');
             activeCardElement.classList.remove('show-dislike');
         } else if (delta < -10) {
             activeCardElement.classList.add('show-dislike');
             activeCardElement.classList.remove('show-like');
         } else {
             activeCardElement.classList.remove('show-like', 'show-dislike');
         }
    }
    function updateBackgroundGlow(delta) {
         const swipeRatio = Math.min(Math.abs(delta) / (SWIPE_THRESHOLD * 1.5), 1); 
         const glowOpacity = swipeRatio * 0.6; 
         let glowHue = 0; 
         if (delta > 10) { 
            glowHue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glow-color-like-hue')) || 120;
         } else if (delta < -10) { 
            glowHue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glow-color-dislike-hue')) || 0;
         }
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
        const movieData = currentCardsData.find(m => String(m.id) === String(movieId));
        if (movieData) {
            if (choice === 'like') {
                likedMovies.push(movieData);
            } else {
                dislikedMovies.push(movieData);
            }
        } else {
            console.warn("Could not find movie data for swiped card ID:", movieId);
        }
        deckCards = deckCards.filter(card => card !== cardToRemove);
        activeCardElement = deckCards[0] || null;
        cardToRemove.classList.remove('dragging'); 
        cardToRemove.classList.add(direction === 'right' ? 'gone-right' : 'gone-left');
        updateStackTransforms(); 
        if (!activeCardElement) {
            disableAndHideButtons(); 
        } else {
            enableAndShowButtons(); 
        }
        cardToRemove.addEventListener('transitionend', () => {
            if (cardToRemove.parentNode) {
                cardToRemove.remove();
            }
            const isLoadingError = loadingIndicator && loadingIndicator.style.display === 'block' && loadingIndicator.textContent.includes('Failed');
            if (deckCards.length === 0 && !isLoadingError) {
                 displayEndMessage();
             }
        }, { once: true }); 
         if (deckCards.length === 0) {
             setTimeout(() => {
                const isLoadingError = loadingIndicator && loadingIndicator.style.display === 'block' && loadingIndicator.textContent.includes('Failed');
                if (cardContainer && cardContainer.querySelectorAll('.card').length <= 1 && !isLoadingError) { 
                    if (!gameOverScreen || gameOverScreen.style.display === 'none' || gameOverScreen.style.display === '') {
                         displayEndMessage();
                    }
                }
             }, 550); 
         }
    }

    function displayEndMessage() {
         if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
            loadingIndicator.textContent = ''; 
         }
         
         if (cardContainer) {
            cardContainer.style.display = 'none';
            const existingCards = cardContainer.querySelectorAll('.card');
            existingCards.forEach(card => card.remove());
         }
         disableAndHideButtons(); 

         if (gameOverHeading && likedMovies) {
            gameOverHeading.textContent = `Popcorn ready? You got ${likedMovies.length} match${likedMovies.length === 1 ? '' : 'es'}!`;
         }

         if (matchedList) { 
            matchedList.innerHTML = ''; 
            if (likedMovies.length > 0) {
                likedMovies.forEach(movie => {
                    appendMovieToMatchedList(movie);
                });
            } else {
                matchedList.innerHTML = '<p class="no-matches-message">No film flings this time. Try again!</p>';
            }
         } else {
            console.error("Matched list container not found for game over screen.");
         }
         
         if (gameOverScreen) {
            gameOverScreen.style.display = 'flex'; 
            setTimeout(() => {
                gameOverScreen.classList.add('visible');
            }, 20); 
         } else {
            console.error("Game over screen element not found.");
         }
    }

    function disableAndHideButtons() {
        if(likeBtn) likeBtn.disabled = true; 
        if(dislikeBtn) dislikeBtn.disabled = true;
        if (actionsContainer) {
            actionsContainer.style.display = 'none';
        }
    }
    function enableAndShowButtons() {
        if(likeBtn) likeBtn.disabled = false; 
        if(dislikeBtn) dislikeBtn.disabled = false;
        if (actionsContainer) {
            actionsContainer.style.display = 'flex'; 
        }
    }

    if(likeBtn) {
        likeBtn.addEventListener('click', () => {
            if (!activeCardElement || isDragging) return;
            animateAndRemoveCard('right');
        });
    }
    if(dislikeBtn) {
        dislikeBtn.addEventListener('click', () => {
            if (!activeCardElement || isDragging) return;
            animateAndRemoveCard('left');
        });
    }

    function appendMovieToMatchedList(movie) {
        if (!matchedList) return; 
        const matchElement = document.createElement('img');
        matchElement.src = config.USE_LOCAL_DATA 
            ? `${config.LOCAL_IMAGE_PATH}${movie.poster_path}`
            : `${IMAGE_BASE_URL}${movie.poster_path}`;
        matchElement.alt = movie.title;
        matchedList.appendChild(matchElement);
    }

    const playAgainButton = document.getElementById('play-again-btn');
    if(playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            location.reload(); 
        });
    }

    async function initializeApp() {
        console.log("Initializing app (after DOMContentLoaded)...");
        
        if (cardContainer) {
            cardContainer.style.display = 'block'; 
        }
        
        if (loadingIndicator) {
            loadingIndicator.textContent = 'Loading setup...';
            loadingIndicator.style.display = 'block';
        }
        
        if (gameOverScreen) {
            gameOverScreen.classList.remove('visible');
            gameOverScreen.style.display = 'none'; 
        }
        if (matchedList) {
            matchedList.innerHTML = '';
        }
        if (gameOverHeading) {
            gameOverHeading.textContent = ''; 
        }
        
        if (cardContainer) {
            const existingCardsOnInit = cardContainer.querySelectorAll('.card');
            existingCardsOnInit.forEach(card => card.remove());
        }
        
        likedMovies = [];
        dislikedMovies = [];
        currentCardsData = [];
        deckCards = [];
        activeCardElement = null;

        if (actionsContainer) {
             actionsContainer.style.display = 'flex'; 
        }
        if(likeBtn) likeBtn.disabled = true;
        if(dislikeBtn) dislikeBtn.disabled = true;

        currentCardsData = await fetchMovies();
        renderInitialDeck(); 
    }

    initializeApp();
});