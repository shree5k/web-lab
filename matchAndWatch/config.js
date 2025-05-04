const config = {
    TMDB_API_KEY: window.location.hostname === 'localhost' 
        ? 'YOUR_LOCAL_API_KEY' // This will be empty in production
        : window.location.hostname === 'github.io' 
            ? 'YOUR_GITHUB_PAGES_API_KEY' // Add your GitHub Pages API key here
            : 'YOUR_OTHER_ENV_API_KEY', // Fallback for other environments
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
};

export default config;