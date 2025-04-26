function runSaltAnimation(element, animationClass, duration) {
    return new Promise((resolve) => {
        console.log(`Animating ${element.id}: Starting.`);
        element.style.display = 'block';

        setTimeout(() => {
            console.log(`Animating ${element.id}: Adding class ${animationClass}.`);
            element.classList.add(animationClass);

            setTimeout(() => {
                console.log(`Animating ${element.id}: Animation timer finished.`);
                resolve();
            }, duration);
        }, 10);
    });
}

function runTickAnimation(element, animationClass, duration) {
    return new Promise((resolve) => {
        console.log(`Animating ${element.id}: Starting tick sequence.`);
        element.classList.remove(animationClass);
        element.style.display = 'block';
        element.style.pointerEvents = 'auto';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                console.log(`Animating ${element.id}: Adding class ${animationClass} (after double rAF).`);
                element.classList.add(animationClass);

                setTimeout(() => {
                    console.log(`Animating ${element.id}: Tick animation timer finished.`);
                    resolve();
                }, duration);
            });
        });
    });
}

function showToast(message, duration = 1900) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function createSprinkles(container, count, shakeDuration, minDelay = 0, spreadFactor = 0.8) {
    if (!container) return;
    container.innerHTML = '';
    const fallBaseDuration = 600;

    for (let i = 0; i < count; i++) {
        const sprinkle = document.createElement('span');
        sprinkle.className = 'sprinkle';

        const randomXStart = Math.random();
        const randomXDrift = Math.random();
        const fallDuration = fallBaseDuration + Math.random() * 300;
        const minDelay = 50;
        const delay = minDelay + Math.random() * (shakeDuration * spreadFactor);

        sprinkle.style.left = `${randomXStart * 100}%`;
        sprinkle.style.animationDelay = `${delay}ms`;
        sprinkle.style.animationDuration = `${fallDuration}ms`;
        sprinkle.style.setProperty('--random-x', randomXDrift);

        container.appendChild(sprinkle);
    }
    container.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    const plusBtn = document.getElementById('plus-btn');
    const saltImg = document.getElementById('salt-img');
    const tickImg = document.getElementById('tick-img');
    const sprinkleContainer = document.getElementById('salt-sprinkles');

    const saltAnimDuration = 800;
    const tickAnimDuration = 500;
    const dissolveDuration = 300;
    const sprinkleCount = 25;

    let currentState = 'plus';
    let isAnimating = false;

    function showTick() {
        if (isAnimating || currentState === 'tick') return;
        isAnimating = true;
        currentState = 'tick';
        console.log("Button clicked -> Starting Salt");

        plusBtn.style.pointerEvents = 'none';

        createSprinkles(sprinkleContainer, sprinkleCount, saltAnimDuration);

        runSaltAnimation(saltImg, 'shake', saltAnimDuration)
            .then(() => {
                console.log("Salt animation finished -> Hiding salt & sprinkles, hiding plus");

                saltImg.style.display = 'none';
                saltImg.classList.remove('shake');
                if (sprinkleContainer) {
                    sprinkleContainer.style.display = 'none';
                }
                plusBtn.classList.add('hidden');

                setTimeout(() => {
                    console.log("Plus hidden -> Running Tick Animation");
                    runTickAnimation(tickImg, 'tick-pop', tickAnimDuration)
                        .then(() => {
                            console.log("Tick animation finished (promise).");
                            isAnimating = false;
                            showToast('added, let it rip 🐻');
                        });

                }, dissolveDuration);

            })
            .catch(error => {
                console.error("Error during plus->tick animation:", error);
                if (sprinkleContainer) {
                    sprinkleContainer.style.display = 'none';
                }
                isAnimating = false;
                currentState = 'plus';
            });
    }

    function showPlus() {
        if (isAnimating || currentState === 'plus') return;
        isAnimating = true;
        currentState = 'plus';
        console.log("Tick clicked -> Reverting to Plus");

        tickImg.style.pointerEvents = 'none';
        if (sprinkleContainer) {
            sprinkleContainer.style.display = 'none';
        }

        tickImg.classList.remove('tick-pop');
        tickImg.style.display = 'none';

        plusBtn.classList.remove('hidden');
        plusBtn.style.pointerEvents = 'auto';

        setTimeout(() => {
            console.log("Reverted to Plus state.");
            isAnimating = false;
        }, dissolveDuration);
    }

    plusBtn.addEventListener('click', showTick);
    tickImg.addEventListener('click', showPlus);

});