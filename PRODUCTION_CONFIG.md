# 🎯 إعدادات الإنتاج النهائية

## 📍 معلومات المشروع:

- **Domain التطبيق**: `http://wa.n8nmarketation.online`
- **Evolution API**: `https://api.n8nmarketation.online`
- **Webhook URL**: `http://wa.n8nmarketation.online/api/webhooks/evolution`

---

## ⚙️ إعدادات Evolution API (.env):

```env
# غيّر هذه الأسطر الثلاثة فقط:
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=http://wa.n8nmarketation.online/api/webhooks/evolution
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true
```

**ملاحظة**: استخدمنا `http` (مش `https`) لأن الـ domain بتاعك على `http`.

---

## 🚀 خطوات النشر:

### 1. ارفع الكود
```bash
# على جهازك
git add .
git commit -m "Added webhook support"
git push origin main
```

### 2. على السيرفر
```bash
# اسحب التحديثات
cd /path/to/wapulse-saas-dashboard
git pull origin main

# ثبت المكتبات (إذا لزم)
npm install

# أعد تشغيل السيرفر
pm2 restart wapulse-server

# أو إذا أول مرة:
pm2 start server.js --name wapulse-server
pm2 save
```

### 3. عدّل Evolution .env
```bash
# على سيرفر Evolution
nano .env

# غيّر الأسطر الثلاثة:
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=http://wa.n8nmarketation.online/api/webhooks/evolution
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true

# احفظ واخرج (Ctrl+X, Y, Enter)
```

### 4. أعد تشغيل Evolution
```bash
docker-compose restart
```

---

## 🧪 اختبار الـ Webhook:

### اختبار 1: من Terminal
```bash
curl -X POST http://wa.n8nmarketation.online/api/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "test",
    "data": {"message": {"conversation": "Test"}}
  }'

# المفروض يرد:
# {"success":true,"received":true}
```

### اختبار 2: شوف Logs
```bash
# على سيرفر التطبيق
pm2 logs wapulse-server

# المفروض تشوف:
# ============================================================
# 📩 Evolution Webhook Received
# Event: messages.upsert
# ...
```

### اختبار 3: رسالة حقيقية
1. افتح WhatsApp على هاتفك
2. ابعت رسالة لنفسك
3. شوف logs السيرفر - المفروض تظهر فوراً!

---

## ✅ Checklist:

- [ ] رفع الكود على `http://wa.n8nmarketation.online`
- [ ] تشغيل السيرفر بـ PM2
- [ ] تعديل Evolution `.env` بالـ URL الصحيح
- [ ] إعادة تشغيل Evolution
- [ ] اختبار curl - يرد `{"success":true}`
- [ ] اختبار رسالة حقيقية - تظهر في logs
- [ ] تأكيد وصول البيانات كاملة

---

## 🔍 استكشاف الأخطاء:

### المشكلة: Connection Refused
```bash
# تأكد من السيرفر شغال
pm2 status

# تأكد من البورت مفتوح
curl http://wa.n8nmarketation.online
```

### المشكلة: 404 Not Found
```bash
# تأكد من الكود الجديد موجود
grep -n "webhooks/evolution" server.js

# أعد تشغيل السيرفر
pm2 restart wapulse-server
```

### المشكلة: Webhook مش بيوصل
```bash
# شوف logs Evolution
docker-compose logs -f evolution-api

# ابحث عن errors في إرسال الـ webhook
```

---

## 📝 ملاحظات مهمة:

1. **HTTP vs HTTPS**: 
   - حالياً استخدمنا `http`
   - إذا أضفت SSL certificate لاحقاً، غيّر لـ `https`

2. **Firewall**:
   - تأكد إن Evolution يقدر يوصل للـ domain
   - قد تحتاج فتح البورت في الـ firewall

3. **Logs**:
   - راقب logs السيرفر باستمرار في البداية
   - استخدم `pm2 logs wapulse-server --lines 100`

---

## 🎉 النتيجة المتوقعة:

بعد النشر الناجح:
- ✅ كل رسالة WhatsApp جديدة تظهر في logs فوراً
- ✅ استجابة في أقل من ثانية
- ✅ لا حاجة للـ polling المستمر
- ✅ توفير موارد السيرفر

**جاهز للنشر! 🚀**
