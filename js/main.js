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

const bindListToGridEvents = (listItem, gridCard) => {
  let hoverTimeout; 

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
    if (hasBeenClicked) return;
    clearTimeout(hoverTimeout);
    
    hoverTimeout = setTimeout(() => {
      activateGrid();
    }, 250); 
  };

  // 2. MOUSE LEAVE: Cancel timer if we leave too fast
  const onMouseLeave = () => {
    clearTimeout(hoverTimeout);
    hasBeenClicked = false;
    deactivateGrid();           
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
    
    video.preload = 'metadata'; 
    
    const projectName = link.label.split(' ')[1];
    video.src = `assets/video/${projectName}.mp4`;
  
    video.addEventListener('loadeddata', () => {
      video.classList.add('loaded'); 
      video.play().catch(() => {});  
    });
  
    if (isMobile) {
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
});

let hasBeenClicked = false;
let hoverCount = 0;
document.addEventListener('DOMContentLoaded', () => {
  const easterEggPlant = document.querySelector('.easter-egg-container');
  const clickTooltip = document.querySelector('.easter-egg-click-tooltip');
  const hoverTooltip = document.querySelector('.easter-egg-tooltip');

  const updateTooltipText = () => {
    if (hoverCount === 2) {
      hoverTooltip.textContent = "is it just me, or does that plant look like a github commit? i need a nap";
    } else {
      hoverTooltip.textContent = "another human. great. tap me!? i'll follow you";
    }
  };

  updateTooltipText();

  if (easterEggPlant && clickTooltip && hoverTooltip) {
    easterEggPlant.addEventListener('mouseenter', () => {
      hoverCount++;
      updateTooltipText();
    });

    easterEggPlant.addEventListener('mouseleave', () => {
      hoverTooltip.style.opacity = '';
      hoverTooltip.style.animation = '';
      hoverTooltip.style.transition = '';
    });

    const handleInteraction = async () => {
      hasBeenClicked = true;
      try {
        hoverTooltip.style.animation = 'none';
        hoverTooltip.style.transition = 'none';
        hoverTooltip.style.opacity = '0';
        hoverTooltip.style.transform = 'translateX(-50%) translateY(0)';

        hoverTooltip.offsetHeight;

        setTimeout(() => {
          clickTooltip.style.opacity = '1';
          clickTooltip.style.transform = 'translateX(-50%) translateY(-4px)';
        }, 150);

        const response = await fetch('assets/easter-eggs/art.svg');
        const svgText = await response.text();
        await navigator.clipboard.writeText(svgText);

        easterEggPlant.style.transform = 'scale(0.95)';
        setTimeout(() => {
          easterEggPlant.style.transform = 'scale(1)';
        }, 150);

        setTimeout(() => {
          clickTooltip.style.opacity = '0';
          clickTooltip.style.transform = 'translateX(-50%) translateY(0)';
        }, 2000);

      } catch (err) {
        console.error('Failed to copy SVG:', err);
        setTimeout(() => {
          clickTooltip.style.opacity = '0';
          clickTooltip.style.transform = 'translateX(-50%) translateY(0)';
        }, 1000);
      }
    };

    easterEggPlant.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleInteraction();
    });

    easterEggPlant.addEventListener('click', handleInteraction);
  }
});