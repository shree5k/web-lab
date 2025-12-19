import { projects } from './projectData.js';
import { setupHoverEffect } from './hoverEffect.js';

const nav = document.querySelector('.linksList');
const grid = document.querySelector('.gridView');
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 1. Initialize Masonry Wrapper & Columns
const masonryWrapper = document.createElement('div');
masonryWrapper.className = 'masonry-stack';
grid.appendChild(masonryWrapper);

const col1 = document.createElement('div');
col1.className = 'masonry-col';
const col2 = document.createElement('div');
col2.className = 'masonry-col';

masonryWrapper.appendChild(col1);
masonryWrapper.appendChild(col2);

// 2. Build List View
projects.forEach((link, index) => {
  const a = document.createElement('a');
  a.href = link.href;
  a.textContent = link.label;
  a.classList.add('list-item');
  a.dataset.index = index;
  nav.appendChild(a);
});

// 3. Initialize Hover Effect
const { moveBackground, hideBackground } = setupHoverEffect(nav);

// Helper: List -> Grid (With Hover Intent Delay)
const bindListToGridEvents = (listItem, gridCard) => {
  let hoverTimeout; // Variable to store the timer

  // The actual action to perform (Scroll + Dim)
  const activateGrid = () => {
    masonryWrapper.classList.add('dim-mode');
    gridCard.classList.add('highlighted');
    gridCard.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  };

  const deactivateGrid = () => {
    masonryWrapper.classList.remove('dim-mode');
    gridCard.classList.remove('highlighted');
  };

  // 1. MOUSE ENTER: Wait 250ms before acting
  const onMouseEnter = () => {
    // Clear any existing timer just in case
    clearTimeout(hoverTimeout);
    
    // Start a new timer
    hoverTimeout = setTimeout(() => {
      activateGrid();
    }, 250); // <--- THE DELAY (adjust this number if you want it faster/slower)
  };

  // 2. MOUSE LEAVE: Cancel timer if we leave too fast
  const onMouseLeave = () => {
    clearTimeout(hoverTimeout); // Stop the scroll from happening!
    deactivateGrid();           // Turn off effects if they were active
  };

  // 3. KEYBOARD (Focus): Immediate action (no delay needed)
  const onFocus = () => activateGrid();
  const onBlur = () => deactivateGrid();

  listItem.addEventListener('mouseenter', onMouseEnter);
  listItem.addEventListener('mouseleave', onMouseLeave);
  listItem.addEventListener('focus', onFocus);
  listItem.addEventListener('blur', onBlur);
};

// Helper: Grid -> List
const bindGridToListEvents = (gridCard, listItem) => {
  const onGridHover = () => {
    gridCard.classList.add('highlighted');
    moveBackground(listItem);
    listItem.classList.add('manual-hover');
  };

  const onGridLeave = () => {
    gridCard.classList.remove('highlighted');
    hideBackground();
    listItem.classList.remove('manual-hover');
  };

  gridCard.addEventListener('mouseenter', onGridHover);
  gridCard.addEventListener('mouseleave', onGridLeave);
};

// 4. Build Grid View (Distribute Even/Odd)
projects.forEach((link, index) => {
  const card = document.createElement('a');
  card.href = link.href;
  card.className = 'grid-card';
  card.dataset.index = index;

  const video = document.createElement('video');
  video.classList.add('grid-video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;
  
  const projectName = link.label.split(' ')[1];
  video.src = `assets/video/${projectName}.mp4`;

  if (isMobile && video.readyState === 0) {
    video.load();
  }

  card.appendChild(video);

  if (index % 2 === 0) {
    col1.appendChild(card);
  } else {
    col2.appendChild(card);
  }

  const listItem = nav.querySelector(`[data-index="${index}"]`);
  if (listItem) {
    bindListToGridEvents(listItem, card);
    bindGridToListEvents(card, listItem);
  }

  video.addEventListener('loadeddata', async () => {
    try { await video.play(); } catch (e) {}
  });
});