const config = {
    TMDB_API_KEY: typeof window !== 'undefined' && window.TMDB_API_KEY ? 
                  window.TMDB_API_KEY : 
                  'YOUR_LOCAL_DEVELOPMENT_API_KEY', // Fallback for local development
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
};

export default config;