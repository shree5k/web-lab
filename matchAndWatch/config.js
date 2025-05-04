const config = {
    TMDB_API_KEY: process.env.REACT_APP_TMDB_API_KEY || 
                  process.env.TMDB_API_KEY || 
                  (typeof window !== 'undefined' && window.TMDB_API_KEY),
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
};

export default config;