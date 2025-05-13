document.addEventListener('DOMContentLoaded', () => {
    const cdIcon = document.getElementById('cd-icon');
    const modalPage = document.getElementById('modal-page');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalContentContainer = modalPage.querySelector('.modal-content-container');

    const targetModalWidth = 400;
    const targetModalHeight = 450;
    let cdIconRect;
    let markdownContentLoaded = false;

    function updateCdIconRect() { cdIconRect = cdIcon.getBoundingClientRect(); }
    function setModalCssVariables(top, left, width, height) {
        modalPage.style.setProperty('--modal-top', `${top}px`);
        modalPage.style.setProperty('--modal-left', `${left}px`);
        modalPage.style.setProperty('--modal-width', `${width}px`);
        modalPage.style.setProperty('--modal-height', `${height}px`);
    }
    function setInitialModalState() {
        updateCdIconRect();
        if (!cdIconRect) return;
        setModalCssVariables(cdIconRect.top, cdIconRect.left, cdIconRect.width, cdIconRect.height);
        modalPage.classList.remove('visible');
    }

    async function loadAndRenderMarkdown() {
        if (markdownContentLoaded) return;
        modalContentContainer.innerHTML = '<p>Loading notes...</p>';
        try {
            const response = await fetch('thoughtNote.md'); 
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const markdownText = await response.text();
            if (typeof marked === 'undefined') {
                modalContentContainer.innerHTML = '<p>Error: Markdown parser not loaded.</p>'; return;
            }
            const htmlContent = marked.parse(markdownText);
            modalContentContainer.innerHTML = htmlContent;
            markdownContentLoaded = true;
        } catch (error) {
            modalContentContainer.innerHTML = `<p>Error loading notes: ${error.message}</p>`;
        }
    }

    function openModal() {
        if (modalPage.classList.contains('visible')) return;
        updateCdIconRect(); if (!cdIconRect) return;
        if (!markdownContentLoaded) { loadAndRenderMarkdown(); }
        setModalCssVariables(cdIconRect.top, cdIconRect.left, cdIconRect.width, cdIconRect.height);
        void modalPage.offsetWidth; 
        const finalTop = cdIconRect.top - targetModalHeight + cdIconRect.height;
        const constrainedFinalTop = Math.max(20, Math.min(finalTop, window.innerHeight - targetModalHeight - 20));
        const constrainedFinalLeft = Math.max(20, Math.min(cdIconRect.left, window.innerWidth - targetModalWidth - 20));
        setModalCssVariables(constrainedFinalTop, constrainedFinalLeft, targetModalWidth, targetModalHeight);
        modalPage.classList.add('visible');
    }

    function closeModal() {
        if (!modalPage.classList.contains('visible')) return;
        updateCdIconRect(); if (!cdIconRect) return;
        setModalCssVariables(cdIconRect.top, cdIconRect.left, cdIconRect.width, cdIconRect.height);
        modalPage.classList.remove('visible');
    }

    cdIcon.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    document.addEventListener('click', (event) => {
        if (modalPage.classList.contains('visible') && !modalPage.contains(event.target) && event.target !== cdIcon) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalPage.classList.contains('visible')) { closeModal(); }
    });
    setInitialModalState();
    window.addEventListener('resize', setInitialModalState);
});