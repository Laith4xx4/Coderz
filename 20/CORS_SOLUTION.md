# حل مشكلة CORS - دليل سريع

## 🚨 المشكلة
```
Access to fetch at 'http://localhost:5285/api/Products' from origin 'http://127.0.0.1:5500' has been blocked by CORS policy
```

## ⚡ الحلول السريعة

### الحل الأول: استخدام CORS Proxy (الأسرع)
1. افتح وحدة تحكم المتصفح (F12)
2. اكتب الأمر التالي:
```javascript
corsFix.auto()
```

### الحل الثاني: تفعيل CORS Proxy يدوياً
1. افتح وحدة تحكم المتصفح (F12)
2. اكتب الأوامر التالية:
```javascript
corsFix.enable()  // تفعيل CORS Proxy
corsFix.switch(0) // استخدام أول CORS Proxy
```

### الحل الثالث: اختبار الاتصال
```javascript
corsFix.test() // اختبار جميع طرق الاتصال
```

## 🔧 الحلول المتقدمة

### الحل الأول: إعدادات الخادم (.NET)
```csharp
// في Program.cs أو Startup.cs
app.UseCors(builder => {
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
});
```

### الحل الثاني: إعدادات الخادم (Express.js)
```javascript
const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### الحل الثالث: تشغيل خادم محلي على نفس المنفذ
```bash
# تشغيل خادم محلي على المنفذ 5285
python -m http.server 5285

# أو باستخدام Node.js
npx http-server -p 5285
```

## 📋 أوامر وحدة التحكم المتاحة

| الأمر | الوصف |
|-------|-------|
| `corsFix.enable()` | تفعيل CORS Proxy |
| `corsFix.switch(0)` | تبديل CORS Proxy |
| `corsFix.reload()` | إعادة تحميل مع إصلاح |
| `corsFix.test()` | اختبار الاتصال |
| `corsFix.auto()` | إصلاح تلقائي |
| `corsFix.show()` | عرض الإعدادات |
| `corsFix.reset()` | استعادة الإعدادات |

## 🌐 CORS Proxy المتاحة

1. **cors-anywhere.herokuapp.com** - الأكثر استقراراً
2. **api.allorigins.win** - سريع وموثوق
3. **corsproxy.io** - بسيط وسهل
4. **thingproxy.freeboard.io** - بديل إضافي

## ⚙️ إعدادات config.js

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:5285/api/Products',
    USE_CORS_PROXY: false, // تغيير إلى true لحل CORS
    CORS_PROXY_INDEX: 0,   // أي CORS Proxy تريد استخدامه
    // ... باقي الإعدادات
};
```

## 🔍 تشخيص المشكلة

### خطوات التشخيص:
1. افتح وحدة تحكم المتصفح (F12)
2. اكتب: `corsFix.show()`
3. تحقق من الإعدادات المعروضة
4. اكتب: `corsFix.test()`
5. راجع نتائج الاختبار

### رسائل الخطأ الشائعة:
- `Failed to fetch` - مشكلة CORS
- `Network Error` - الخادم غير متاح
- `404 Not Found` - نقطة النهاية غير موجودة
- `500 Internal Server Error` - خطأ في الخادم

## 🚀 الحل السريع المفضل

```javascript
// افتح وحدة تحكم المتصفح واكتب:
corsFix.auto()
```

هذا الأمر سيقوم بـ:
1. اختبار الاتصال المباشر
2. إذا فشل، سيفعل CORS Proxy تلقائياً
3. اختبار الاتصال عبر CORS Proxy
4. إعادة تحميل الصفحة إذا نجح

## 📞 الدعم

إذا لم تعمل الحلول أعلاه:
1. تأكد من تشغيل خادم API على المنفذ 5285
2. تحقق من إعدادات الخادم
3. جرب تشغيل الخادم المحلي على نفس المنفذ
4. راجع ملف `cors-proxy.html` للحلول التفصيلية

---

**ملاحظة:** CORS Proxy هو حل مؤقت للتطوير. للإنتاج، يجب إعداد الخادم بشكل صحيح.
