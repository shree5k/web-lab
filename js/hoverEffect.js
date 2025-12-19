export function setupHoverEffect(container) {
    const items = container.querySelectorAll('.list-item');
    let hoverBackground = container.querySelector('.hover-bg');
  
    if (!hoverBackground) {
      hoverBackground = document.createElement('div');
      hoverBackground.className = 'hover-bg';
      container.appendChild(hoverBackground);
    }
  
    function moveBackground(item) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const top = itemRect.top - containerRect.top + container.scrollTop;
      const left = itemRect.left - containerRect.left;
  
      hoverBackground.style.top = `${top}px`;
      hoverBackground.style.left = `${left}px`;
      hoverBackground.style.width = `${itemRect.width}px`;
      hoverBackground.style.height = `${itemRect.height}px`;
      hoverBackground.style.opacity = '1';
    }
  
    function hideBackground() {
      hoverBackground.style.opacity = '0';
    }

    items.forEach(item => {
      item.addEventListener('mouseenter', () => moveBackground(item));
      item.addEventListener('mouseleave', hideBackground);
    });

    return { moveBackground, hideBackground };
  }