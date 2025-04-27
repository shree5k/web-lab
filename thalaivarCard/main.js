const gridContainer = document.querySelector('.switchboard-grid');
const cardElement = document.querySelector('.features-card');
const computedRootStyle = getComputedStyle(document.documentElement);

const columns = parseInt(computedRootStyle.getPropertyValue('--switchboard-columns')) || 18;
const rows = 6;
const totalDots = columns * rows;
const dots = [];

const pixelFont = {
    A: ['01110','10001','10001','11111','10001','10001'],
    B: ['11110','10001','11110','10001','10001','11110'],
    C: ['01111','10000','10000','10000','10000','01111'],
    D: ['11110','10001','10001','10001','10001','11110'],
    E: ['11111','10000','11110','10000','10000','11111'],
    F: ['11111','10000','11110','10000','10000','10000'],
    G: ['01111','10000','10111','10001','10001','01111'],
    H: ['10001','10001','11111','10001','10001','10001'],
    I: ['01110','00100','00100','00100','00100','01110'],
    J: ['00111','00010','00010','00010','10010','01100'],
    K: ['10001','10010','10100','11000','10100','10010'],
    L: ['10000','10000','10000','10000','10000','11111'],
    M: ['10001','11011','10101','10101','10001','10001'],
    N: ['10001','11001','10101','10011','10001','10001'],
    O: ['01110','10001','10001','10001','10001','01110'],
    P: ['11110','10001','10001','11110','10000','10000'],
    Q: ['01110','10001','10001','10001','10010','01101'],
    R: ['11110','10001','10001','11110','10100','10010'],
    S: ['01111','10000','01110','00001','00001','11110'],
    T: ['11111','00100','00100','00100','00100','00100'],
    U: ['10001','10001','10001','10001','10001','01110'],
    V: ['10001','10001','10001','10001','01010','00100'],
    W: ['10001','10001','10001','10101','10101','11011'],
    X: ['10001','01010','00100','00100','01010','10001'],
    Y: ['10001','10001','01010','00100','00100','00100'],
    Z: ['11111','00010','00100','01000','10000','11111'],
    ' ': ['00000','00000','00000','00000','00000','00000'],
};

for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('div');
    dot.classList.add('light-dot');
    dot.dataset.index = i;
    dot.dataset.state = 'off';
    dot.dataset.isText = false;
    gridContainer.appendChild(dot);
    dots.push(dot);
}

const maxLetters = Math.min(6, 'HELLO'.length);
const letterWidth = 5;
const letterSpacing = 1;
const totalPatternWidth = maxLetters * letterWidth + (maxLetters - 1) * letterSpacing;
const startCol = Math.floor((columns - totalPatternWidth) / 2);
let indices = [];
for (let l = 0; l < maxLetters; l++) {
    const char = 'HELLO'[l].toUpperCase();
    const grid = pixelFont[char] || pixelFont[' '];
    for (let r = 0; r < Math.min(rows, grid.length); r++) {
        for (let c = 0; c < letterWidth; c++) {
            if (grid[r][c] === '1') {
                indices.push(r * columns + startCol + l * (letterWidth + letterSpacing) + c);
            }
        }
    }
}
const nextPatternIndices = new Set(indices);

for (let i = 0; i < totalDots; i++) {
    const dot = dots[i];
    dot.dataset.isText = nextPatternIndices.has(i) ? 'true' : 'false';
}

const input = document.getElementById('patternTextInput');
const display = document.getElementById('patternTextDisplay');

function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

let dynamicPatternIndices = getPatternIndicesForText('HELLO', columns, rows);
input.value = 'HELLO';
display.textContent = 'HELLO';

input.addEventListener('input', () => {
    const rawVal = input.value;
    const titleCaseVal = toTitleCase(rawVal);
    input.value = titleCaseVal;
    display.textContent = titleCaseVal;
    dynamicPatternIndices = getPatternIndicesForText(titleCaseVal.toUpperCase(), columns, rows);
});

input.value = toTitleCase(input.value.trim());
display.textContent = input.value;

const idleStatesToActivate = ['medium', 'high'];
const transitionDuration = parseInt(computedRootStyle.getPropertyValue('--transition-duration')) || 600;
const idleAnimationInterval = 200;
const idleDotsToChange = 2;
let idleIntervalId = null;
let isHovering = false;
let patternTimeouts = [];

function stopIdleAnimation() {
    if (idleIntervalId !== null) {
        clearInterval(idleIntervalId);
        idleIntervalId = null;
    }
    dots.forEach(dot => {
            if (dot.resetTimeout) {
            clearTimeout(dot.resetTimeout);
            dot.resetTimeout = null;
            }
    });
    patternTimeouts.forEach(timeout => clearTimeout(timeout));
    patternTimeouts = [];
}

function startIdleAnimation() {
        stopIdleAnimation();
        idleIntervalId = setInterval(runIdleAnimation, idleAnimationInterval);
}

function runIdleAnimation() {
    if (isHovering) return;

    for (let i = 0; i < idleDotsToChange; i++) {
        const randomIndex = Math.floor(Math.random() * totalDots);
        const randomStateName = idleStatesToActivate[Math.floor(Math.random() * idleStatesToActivate.length)];
        const dot = dots[randomIndex];

        if (!dot || dot.dataset.state !== 'off' || dot.resetTimeout) {
            continue;
        }

        dot.dataset.state = randomStateName;

        const resetDelay = transitionDuration + (Math.random() * 150);

        dot.resetTimeout = setTimeout(() => {
            if (!isHovering && dot.dataset.state === randomStateName) {
                dot.dataset.state = 'off';
            }
            dot.resetTimeout = null;
        }, resetDelay);
    }
}

cardElement.addEventListener('mouseenter', () => {
    isHovering = true;
    stopIdleAnimation();
    dots.forEach(dot => {
        dot.dataset.state = 'off';
        if (dot.resetTimeout) {
            clearTimeout(dot.resetTimeout);
            dot.resetTimeout = null;
        }
    });
    Array.from(dynamicPatternIndices).forEach((idx, i) => {
        const timeout = setTimeout(() => {
            dots[idx].dataset.state = 'medium';
        }, i * 20);
        patternTimeouts.push(timeout);
    });
});

cardElement.addEventListener('mouseleave', () => {
    isHovering = false;
    patternTimeouts.forEach(timeout => clearTimeout(timeout));
    patternTimeouts = [];
    dots.forEach(dot => {
        dot.dataset.state = 'off';
    });
    startIdleAnimation();
});

startIdleAnimation();

function getPatternIndicesForText(text, columns, rows) {
    const maxLetters = Math.min(6, text.length);
    const letterWidth = 5;
    const letterSpacing = 1;
    const totalPatternWidth = maxLetters * letterWidth + (maxLetters - 1) * letterSpacing;
    const startCol = Math.floor((columns - totalPatternWidth) / 2);
    let indices = [];
    for (let l = 0; l < maxLetters; l++) {
        const char = text[l].toUpperCase();
        const grid = pixelFont[char] || pixelFont[' '];
        for (let r = 0; r < Math.min(rows, grid.length); r++) {
            for (let c = 0; c < letterWidth; c++) {
                if (grid[r][c] === '1') {
                    indices.push(r * columns + startCol + l * (letterWidth + letterSpacing) + c);
                }
            }
        }
    }
    return new Set(indices);
}