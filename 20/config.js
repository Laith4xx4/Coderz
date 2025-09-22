// API Configuration
const API_CONFIG = {
    // API Base URL - يمكن تغييرها حسب البيئة
    BASE_URL: 'http://localhost:5086/api',
    LOGIN_URL: '/Auth/login',
    REGISTER_URL: '/Auth/register',
    PRODUCTS_URL: '/Products',
    
    // CORS Proxy URLs (للحالات التي تحتاج إلى حل CORS)
    CORS_PROXY_URLS: [
        'https://cors-anywhere.herokuapp.com/',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/'
    ],
    
    // إعدادات CORS
    USE_CORS_PROXY: false, // تغيير إلى true لحل CORS
    CORS_PROXY_INDEX: 0,   // أي CORS Proxy تريد استخدامه
    
    // Timeout settings
    TIMEOUT: 10000, // 10 seconds
    
    // Retry settings
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    
    // Headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Environment detection
export const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const isProduction = !isDevelopment;

// API URL based on environment and CORS settings
export const getApiUrl = (endpointKey = 'BASE_URL') => {
    let baseUrl = API_CONFIG[endpointKey];
    
    if (isDevelopment) {
        // في التطوير، يمكن استخدام CORS Proxy إذا كان مطلوباً
        if (API_CONFIG.USE_CORS_PROXY) {
            const proxyUrl = API_CONFIG.CORS_PROXY_URLS[API_CONFIG.CORS_PROXY_INDEX];
            if (proxyUrl.includes('allorigins.win') || proxyUrl.includes('corsproxy.io')) {
                return proxyUrl + encodeURIComponent(baseUrl);
            }
            return proxyUrl + baseUrl;
        }
        return baseUrl;
    } else {
        // في الإنتاج، يمكن استخدام URL مختلف
        return baseUrl.replace('localhost:5285', window.location.hostname);
    }
};

// دالة لتبديل CORS Proxy
export const switchCorsProxy = (index) => {
    if (index >= 0 && index < API_CONFIG.CORS_PROXY_URLS.length) {
        API_CONFIG.CORS_PROXY_INDEX = index;
        console.log(`تم تبديل CORS Proxy إلى: ${API_CONFIG.CORS_PROXY_URLS[index]}`);
        return true;
    }
    return false;
};

// دالة لتفعيل/إلغاء CORS Proxy
export const toggleCorsProxy = (enable = true) => {
    API_CONFIG.USE_CORS_PROXY = enable;
    console.log(`تم ${enable ? 'تفعيل' : 'إلغاء'} CORS Proxy`);
    return enable;
};

// Export configuration
export { API_CONFIG };
