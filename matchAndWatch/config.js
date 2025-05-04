const config = {
    USE_LOCAL_DATA: true,

    TMDB_API_KEY: '__TMDB_API_KEY__',
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    LOCAL_IMAGE_PATH: './assets/',
    LOCAL_IMAGE_COUNT: 9,
    LOCAL_IMAGE_PREFIX: 'poster_',
    LOCAL_IMAGE_EXTENSION: '.png'
};

if (!config.USE_LOCAL_DATA && (config.TMDB_API_KEY === '__TMDB_API_KEY__' || config.TMDB_API_KEY === 'YOUR_LOCAL_DEVELOPMENT_API_KEY' || !config.TMDB_API_KEY || config.TMDB_API_KEY.length < 10 )) {
    console.warn("TMDB API Key placeholder not replaced or invalid. API calls will likely fail.");
} else if (config.USE_LOCAL_DATA) {
    console.log("Using local data mode. Ensure './assets/' folder exists with images.");
} else {
    console.log("Using TMDB API mode.");
}

export default config;