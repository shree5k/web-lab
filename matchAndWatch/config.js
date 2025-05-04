const config = {
    TMDB_API_KEY: window.location.hostname === 'localhost' 
        ? 'YOUR_LOCAL_API_KEY' // This will be empty in production
        : window.env.TMDB_API_KEY, // GitHub Pages uses window.env
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
};

export default config;