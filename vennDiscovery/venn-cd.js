document.addEventListener('DOMContentLoaded', () => {
    const toggleInput = document.getElementById('cd-mode-toggle');
    const contentViewport = document.querySelector('.content-viewport');

    if (toggleInput && contentViewport) {
        if (toggleInput.checked) {
            contentViewport.classList.add('cd-mode-active');
        }

        toggleInput.addEventListener('change', function() {
            if (this.checked) {
                contentViewport.classList.add('cd-mode-active');
            } else {
                contentViewport.classList.remove('cd-mode-active');
            }
        });
    }
});