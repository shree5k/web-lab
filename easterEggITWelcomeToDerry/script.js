document.addEventListener('DOMContentLoaded', function() { 
    function triggerBalloonEasterEgg() {
        const balloon = document.getElementById('red-balloon');
        const watchNowBtn = document.querySelector('.brand-button');
        if (!balloon || !watchNowBtn) return;

        const appearDelay = 2000;

        setTimeout(() => {
            balloon.classList.add('visible');

            watchNowBtn.classList.add('watch-now-red');

            const balloonAnimationDuration = 10000;

            setTimeout(() => {
                watchNowBtn.classList.remove('watch-now-red');
            }, balloonAnimationDuration);

            setTimeout(() => {
                balloon.classList.remove('visible');
            }, balloonAnimationDuration);

        }, appearDelay);
    }
    triggerBalloonEasterEgg();
});