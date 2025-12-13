document.addEventListener('DOMContentLoaded', () => {
    function renderAdBoard(containerId, items, themeConfig = 'gold') {
        const container = document.getElementById(containerId);
        if (!container) return;

        let themeClass = '';
        let customStyle = '';

        if (typeof themeConfig === 'string') {
            themeClass = `theme-${themeConfig}`;
        } else if (typeof themeConfig === 'object' && themeConfig.type === 'brand') {
            themeClass = 'theme-brand';
            if (themeConfig.bgColor) {
                customStyle = `background: radial-gradient(circle at 50% 0%, ${themeConfig.bgColor}, #000 120%);`;
            }
        }

        const wrapper = document.createElement('div');
        wrapper.className = `stadium-ad-wrapper ${themeClass}`;

        const board = document.createElement('div');
        board.className = 'stadium-ad-board';
        if (customStyle) board.style.cssText = customStyle;

        const overlay = document.createElement('div');
        overlay.className = 'led-overlay';

        const tickerWrap = document.createElement('div');
        tickerWrap.className = 'ticker-wrap';

        const tickerMove = document.createElement('div');
        tickerMove.className = 'ticker-move';

        const fullList = [...items, ...items, ...items, ...items];

        let itemsHtml = '';
        fullList.forEach((item, index) => {
            let content = '';
            
            if (item.logo) {
                content += `<img src="${item.logo}" class="ticker-logo" alt="Brand Logo">`;
            }
            
            if (item.text) {
                content += `<span>${item.text}</span>`;
            }

            const highlightClass = (index % 2 === 0) ? 'highlight' : '';
            
            itemsHtml += `<div class="ticker-item ${highlightClass}">${content}</div>`;
        });

        tickerMove.innerHTML = itemsHtml;

        tickerWrap.appendChild(tickerMove);
        board.appendChild(overlay);
        board.appendChild(tickerWrap);
        wrapper.appendChild(board);
        container.appendChild(wrapper);
    }

    // Ad Board 1 (Gold Theme)
    const ad1Items = [
        { text: "GET PREMIUM FOR ₹499" },
        { text: "HOOOOOWZAAT!!" },
        { text: "4K STREAMING" },
        { text: "AD FREE EXPERIENCE" },
        { text: "UPTO 4 DEVICES" }
    ];
    renderAdBoard('ad-container-1', ad1Items, 'gold');

    // Ad Board 2 (Blue-Pink Theme)
    const ad2Items = [
        { text: "MAN CITY 3-2 QPR 🏆" },
        { text: "AGUEROOOOOOO! ⚽" },
        { text: "93:20 THE MOMENT" },
        { text: "WATCH THE REPLAY" },
        { text: "PREMIER LEAGUE CLASSICS" } 
    ];
    renderAdBoard('ad-container-2', ad2Items, 'blue-pink');

    // Ad Board 3 (BRAND THEME EXAMPLE)
    const ad3Items = [
        { logo: "assets/nike.png"}, 
        { logo: "assets/moto.png"},
        { logo: "assets/nike.png"}, 
        { logo: "assets/moto.png"}
    ];
    // Pass object configuration
    renderAdBoard('ad-container-3', ad3Items, { 
        type: 'brand', 
        bgColor: '#E60000' // Nike Red
    });


    // News Data & Tray Logic
    const newsItems = [
        { 
            title: "MI to Target Local Talent in Tight Budget?", 
            image: "assets/horizontal-tile1.png", 
            duration: "2m" 
        },
        { 
            title: "Rohit Sharma's Captaincy Era: A Look Back", 
            image: "assets/horizontal-tile2.png", 
            duration: "4m" 
        },
        { 
            title: "Top 5 Auction Strategies for Mumbai Indians", 
            image: "assets/horizontal-tile3.png", 
            duration: "3m" 
        },
        { 
            title: "Hardik Pandya Returns: What it Means for the Squad", 
            image: "assets/horizontal-tile4.png", 
            duration: "1m" 
        },
        { 
            title: "Scouting Report: Uncapped Players to Watch", 
            image: "assets/horizontal-tile5.png", 
            duration: "5m" 
        }
    ];

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function renderTray(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        data.forEach(item => {
            const tile = document.createElement('div');
            tile.classList.add('news-tile');

            const thumbnail = document.createElement('div');
            thumbnail.classList.add('news-thumbnail');
            thumbnail.style.backgroundImage = `url('${item.image}')`;

            const playIcon = document.createElement('div');
            playIcon.classList.add('play-icon-overlay');
            thumbnail.appendChild(playIcon);

            const duration = document.createElement('span');
            duration.classList.add('duration-badge');
            duration.textContent = item.duration;
            thumbnail.appendChild(duration);

            const titleDiv = document.createElement('div');
            titleDiv.classList.add('news-title');
            titleDiv.textContent = item.title;

            tile.appendChild(thumbnail);
            tile.appendChild(titleDiv);
            container.appendChild(tile);
        });
    }

    const trayIds = ['news-tray-1', 'news-tray-2', 'news-tray-3', 'news-tray-4', 'news-tray-5', 'news-tray-6'];
    trayIds.forEach(id => {
        const randomizedItems = shuffleArray(newsItems);
        renderTray(id, randomizedItems);
    });
});