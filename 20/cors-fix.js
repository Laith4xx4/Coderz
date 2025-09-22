// حل سريع لمشكلة CORS
// استخدم هذا الملف لحل مشكلة CORS بسرعة

// الحل الأول: تفعيل CORS Proxy
function enableCorsProxy() {
    if (typeof toggleCorsProxy === 'function') {
        toggleCorsProxy(true);
        console.log('✅ تم تفعيل CORS Proxy');
        return true;
    }
    return false;
}

// الحل الثاني: تبديل CORS Proxy
function switchProxy(index = 0) {
    if (typeof switchCorsProxy === 'function') {
        const success = switchCorsProxy(index);
        if (success) {
            console.log(`✅ تم تبديل CORS Proxy إلى الرقم ${index}`);
        }
        return success;
    }
    return false;
}

// الحل الثالث: إعادة تحميل الصفحة مع إعدادات جديدة
function reloadWithCorsFix() {
    // حفظ الإعدادات في localStorage
    localStorage.setItem('cors_fix_enabled', 'true');
    localStorage.setItem('cors_proxy_index', '0');
    
    // إعادة تحميل الصفحة
    window.location.reload();
}

// الحل الرابع: اختبار الاتصال
async function testConnection() {
    const urls = [
        'http://localhost:5285/api/Products',
        'https://cors-anywhere.herokuapp.com/http://localhost:5285/api/Products',
        'https://api.allorigins.win/raw?url=http://localhost:5285/api/Products'
    ];
    
    console.log('🔍 اختبار الاتصال...');
    
    for (let i = 0; i < urls.length; i++) {
        try {
            console.log(`اختبار ${i + 1}: ${urls[i]}`);
            const response = await fetch(urls[i], {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                console.log(`✅ نجح الاتصال مع: ${urls[i]}`);
                return { success: true, url: urls[i], index: i };
            } else {
                console.log(`❌ فشل الاتصال مع: ${urls[i]} - ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ خطأ في الاتصال مع: ${urls[i]} - ${error.message}`);
        }
    }
    
    console.log('❌ جميع محاولات الاتصال فشلت');
    return { success: false };
}

// الحل الخامس: إعداد تلقائي
async function autoFixCors() {
    console.log('🚀 بدء الإصلاح التلقائي لمشكلة CORS...');
    
    // اختبار الاتصال المباشر أولاً
    const testResult = await testConnection();
    
    if (testResult.success) {
        if (testResult.index === 0) {
            // الاتصال المباشر نجح
            console.log('✅ الاتصال المباشر يعمل، لا حاجة لـ CORS Proxy');
            return true;
        } else {
            // نحتاج CORS Proxy
            enableCorsProxy();
            switchProxy(testResult.index - 1);
            console.log('✅ تم تفعيل CORS Proxy تلقائياً');
            return true;
        }
    } else {
        console.log('❌ فشل الإصلاح التلقائي');
        return false;
    }
}

// دالة مساعدة لعرض الإعدادات الحالية
function showCurrentSettings() {
    console.log('📋 الإعدادات الحالية:');
    console.log('- USE_CORS_PROXY:', API_CONFIG.USE_CORS_PROXY);
    console.log('- CORS_PROXY_INDEX:', API_CONFIG.CORS_PROXY_INDEX);
    console.log('- BASE_URL:', API_CONFIG.BASE_URL);
    console.log('- Current API URL:', getApiUrl());
    console.log('- Environment:', isDevelopment ? 'Development' : 'Production');
}

// دالة مساعدة لاستعادة الإعدادات الافتراضية
function resetSettings() {
    API_CONFIG.USE_CORS_PROXY = false;
    API_CONFIG.CORS_PROXY_INDEX = 0;
    localStorage.removeItem('cors_fix_enabled');
    localStorage.removeItem('cors_proxy_index');
    console.log('🔄 تم استعادة الإعدادات الافتراضية');
}

// تحميل الإعدادات المحفوظة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const corsFixEnabled = localStorage.getItem('cors_fix_enabled');
    const corsProxyIndex = localStorage.getItem('cors_proxy_index');
    
    if (corsFixEnabled === 'true') {
        enableCorsProxy();
        if (corsProxyIndex) {
            switchProxy(parseInt(corsProxyIndex));
        }
        console.log('🔄 تم تحميل إعدادات CORS المحفوظة');
    }
});

// إضافة الأوامر إلى وحدة التحكم
if (typeof window !== 'undefined') {
    window.corsFix = {
        enable: enableCorsProxy,
        switch: switchProxy,
        reload: reloadWithCorsFix,
        test: testConnection,
        auto: autoFixCors,
        show: showCurrentSettings,
        reset: resetSettings
    };
    
    console.log('🔧 أوامر CORS متاحة في وحدة التحكم:');
    console.log('- corsFix.enable() - تفعيل CORS Proxy');
    console.log('- corsFix.switch(0) - تبديل CORS Proxy');
    console.log('- corsFix.reload() - إعادة تحميل مع إصلاح');
    console.log('- corsFix.test() - اختبار الاتصال');
    console.log('- corsFix.auto() - إصلاح تلقائي');
    console.log('- corsFix.show() - عرض الإعدادات');
    console.log('- corsFix.reset() - استعادة الإعدادات');
}

// تصدير الدوال
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        enableCorsProxy,
        switchProxy,
        reloadWithCorsFix,
        testConnection,
        autoFixCors,
        showCurrentSettings,
        resetSettings
    };
}
