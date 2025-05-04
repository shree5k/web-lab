const config = {
    TMDB_API_KEY: '55eccc0d1d1c5bee35796842dc201ad5', // Placeholder replaced during build
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
};

if (config.TMDB_API_KEY === '55eccc0d1d1c5bee35796842dc201ad5' || !config.TMDB_API_KEY) {
    console.warn("TMDB API Key placeholder not replaced. Using local fallback or expecting failure.");
    config.TMDB_API_KEY = 'YOUR_LOCAL_DEVELOPMENT_API_KEY'; // Keep fallback ONLY for local dev
}

export default config;