document.addEventListener('DOMContentLoaded', () => {
    const MATH_R = 260; 
    let activeLeft = "";
    let activeRight = "";
    const resultText = document.getElementById('venn-result-text');
    let vennInitialized = false;

    const posterContainer = document.getElementById('generated-poster-container');
    const generateBtn = document.querySelector('.tray-action');
    
    const posters = [
        'https://drive.google.com/thumbnail?id=107Kai87ekNV-Svd578OTLVsIaU2QB_Gp&sz=w500',
        'https://drive.google.com/thumbnail?id=10JlIuMQe8nLh9ZssmI-d5huAikPNIDTs&sz=w500',
        'https://drive.google.com/thumbnail?id=10mNpf9KsaoLV0_yPQWJ4SCQlCTATp-AB&sz=w500',
        'https://drive.google.com/thumbnail?id=11IHb7P-pVZe0qQ9_Te3ujoYmae8Fxdvh&sz=w500',
        'https://drive.google.com/thumbnail?id=12H3L2Vx-sSt6tvAQQaRyjXzP_es47qKW&sz=w500',
        'https://drive.google.com/thumbnail?id=137h3EF1IdwqaQBT1F6cYJTwvQCMmA93S&sz=w500',
        'https://drive.google.com/thumbnail?id=143iK41S3q5-yR1USUR8ZbSqEZ7rAAqFc&sz=w500',
        'https://drive.google.com/thumbnail?id=14lMAxidbShs82vCLKVSHGia4MjL7cPN4&sz=w500',
        'https://drive.google.com/thumbnail?id=14y2lML3LeVUo5XjD93MEC-G4qsBTNeEi&sz=w500',
        'https://drive.google.com/thumbnail?id=16YS7CKgetklh6NsYVXZ0MWSQTnj_X8p5&sz=w500',
        'https://drive.google.com/thumbnail?id=178zaXM6K4WkOf9nFvV6p_-TxhuqTjd7x&sz=w500',
        'https://drive.google.com/thumbnail?id=18O4pAx2qAj9AK4NeQfcV81RqMzUjj3ln&sz=w500',
        'https://drive.google.com/thumbnail?id=1BCxYlBxlhmYezz_ybBN3VFt1e7j_HCpq&sz=w500',
        'https://drive.google.com/thumbnail?id=1DAzYbwMZfeoxKrJty8-xlnvRSILLXFMo&sz=w500',
        'https://drive.google.com/thumbnail?id=1G7A7qSwg24_qGMVrNLJRjTXy0pebHwA6&sz=w500',
        'https://drive.google.com/thumbnail?id=1Gl7aPb15whzU5KGRAvEoO5gctFqlSl0V&sz=w500'
    ];

    generateBtn.addEventListener('click', () => {
        // Visual feedback for button click
        generateBtn.style.transform = 'scale(0.95)';
        setTimeout(() => generateBtn.style.transform = 'scale(1)', 100);

        // 1. Immediately hide current posters (Trigger Fade Out)
        posterContainer.classList.remove('visible');

        // Select 3 random posters
        const shuffled = posters.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        // 2. Preload images to ensure no flickering during animation
        let loadedCount = 0;
        const tempImages = [];
        
        const finishLoading = () => {
            const poster1 = document.querySelector('.poster-1');
            const poster2 = document.querySelector('.poster-2');
            const poster3 = document.querySelector('.poster-3');

            // Swap sources now that they are loaded
            poster1.src = selected[0];
            poster2.src = selected[1];
            poster3.src = selected[2];

            // Trigger Entry Animation
            posterContainer.classList.add('visible');
        };

        // Create temporary images to force browser cache load
        selected.forEach(src => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === 3) {
                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, 300 - elapsedTime);
                    setTimeout(finishLoading, remainingTime);
                }
            };
            img.src = src;
            tempImages.push(img);
        });

        const startTime = Date.now();
    });

    function updateTray() {
        if(activeLeft && activeRight) {
            resultText.textContent = `${activeLeft} ${activeRight}`;
            resultText.classList.add('glow');
            setTimeout(() => resultText.classList.remove('glow'), 300);
        }
    }

    function updateCurve(elementId, side) {
        // Hide posters if user interacts with wheels
        if(posterContainer.classList.contains('visible')) {
            posterContainer.classList.remove('visible');
        }

        const list = document.getElementById(elementId);
        const items = list.querySelectorAll('.scroll-item');
        
        const listCenter = list.scrollTop + (list.clientHeight / 2);

        items.forEach(item => {
            const itemCenter = item.offsetTop + (item.clientHeight / 2);
            const dy = Math.abs(listCenter - itemCenter);
            
            let curveDepth = 0;
            if (dy < MATH_R) {
                curveDepth = MATH_R - Math.sqrt(Math.pow(MATH_R, 2) - Math.pow(dy, 2));
            } else {
                curveDepth = MATH_R; 
            }

            let translateX = 0;
            if (side === 'left') {
                translateX = curveDepth;
            } else {
                translateX = -curveDepth;
            }

            item.style.transform = `translateX(${translateX}px)`;

            if (dy < 30) { 
                item.classList.add('active');
                const text = item.querySelector('span').innerText;
                if(side === 'left') activeLeft = text;
                else activeRight = text;
                requestAnimationFrame(updateTray);
            } else {
                item.classList.remove('active');
            }
        });
    }

    function initScroll(id, side) {
        const el = document.getElementById(id);
        let ticking = false;
        
        const onScroll = () => {
            if(!ticking) {
                window.requestAnimationFrame(() => {
                    updateCurve(id, side);
                    ticking = false;
                });
                ticking = true;
            }
        };

        el.addEventListener('scroll', onScroll);
    }

    initScroll('list-left', 'left');
    initScroll('list-right', 'right');

    const mainContainer = document.getElementById('main-container');
    const dashboardContent = document.getElementById('dashboard-content');
    const vennView = document.getElementById('venn-view');
    const vennScaler = document.getElementById('venn-scaler');
    const contentViewport = document.querySelector('.content-viewport');
    
    const navHome = document.getElementById('nav-home');
    const navCategories = document.getElementById('nav-categories');
    const navItems = document.querySelectorAll('.sidebar .nav img');

    function activateNav(activeItem) {
        navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

    function scaleVennToFit() {
        const targetWidth = mainContainer.clientWidth;
        const targetHeight = mainContainer.clientHeight;
        const designWidth = 1100;
        const designHeight = 700;

        const scale = Math.min(targetWidth / designWidth, targetHeight / designHeight) * 0.8;
        
        vennScaler.style.transform = `scale(${scale})`;
        
        const scaledWidth = designWidth * scale;
        const scaledHeight = designHeight * scale;
        
        const offsetX = (targetWidth - scaledWidth) / 2 - 60;
        const offsetY = (targetHeight - scaledHeight) / 3;

        vennScaler.style.transformOrigin = '0 0';
        vennScaler.style.position = 'absolute';
        vennScaler.style.left = `${Math.max(0, offsetX)}px`;
        vennScaler.style.top = `${Math.max(0, offsetY)}px`;
    }

    navCategories.addEventListener('click', () => {
        activateNav(navCategories);
        dashboardContent.style.display = 'none';
        vennView.classList.remove('venn-view-hidden');
        vennView.style.display = 'block';
        mainContainer.classList.add('no-padding'); 
        
        contentViewport.classList.add('flip-bg');
        
        scaleVennToFit();
        
        setTimeout(() => {
            const lLeft = document.getElementById('list-left');
            const lRight = document.getElementById('list-right');
            
            if(!vennInitialized || lLeft.scrollTop === 0) {
                lLeft.scrollTop = 280; 
                lRight.scrollTop = 350; 
                vennInitialized = true;
            }
            
            updateCurve('list-left', 'left');
            updateCurve('list-right', 'right');
        }, 50);
    });

    navHome.addEventListener('click', () => {
        activateNav(navHome);
        vennView.classList.add('venn-view-hidden');
        vennView.style.display = 'none';
        mainContainer.classList.remove('no-padding');
        dashboardContent.style.display = 'block';
        
        contentViewport.classList.remove('flip-bg');
    });

    window.addEventListener('resize', () => {
        if (!vennView.classList.contains('venn-view-hidden') && vennView.style.display !== 'none') {
            scaleVennToFit();
        }
    });

    // --- INITIALIZATION ON LOAD ---
    contentViewport.classList.add('flip-bg');
    
    scaleVennToFit();
    
    setTimeout(() => {
        const lLeft = document.getElementById('list-left');
        const lRight = document.getElementById('list-right');
        lLeft.scrollTop = 280; 
        lRight.scrollTop = 350; 
        vennInitialized = true;
        updateCurve('list-left', 'left');
        updateCurve('list-right', 'right');
    }, 50);

});