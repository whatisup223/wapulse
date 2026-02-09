# ⚡ خطوات النشر السريعة

## 🎯 الخطوات (5 دقائق):

### 1. ارفع المشروع
```bash
git add .
git commit -m "Added webhooks"
git push
```

### 2. على السيرفر
```bash
git pull
npm install
pm2 restart wapulse-server
# أو
pm2 start server.js --name wapulse-server
```

### 3. عدّل Evolution .env
```env
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=https://YOUR_DOMAIN.com/api/webhooks/evolution
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true
```

**⚠️ غيّر `YOUR_DOMAIN.com` بالـ domain الحقيقي!**

### 4. أعد تشغيل Evolution
```bash
docker-compose restart
```

### 5. اختبر
ابعت رسالة WhatsApp وشوف logs:
```bash
pm2 logs wapulse-server
```

---

## ✅ النتيجة المتوقعة:

```
============================================================
📩 Evolution Webhook Received
Event: messages.upsert
Instance: your_instance
Data: { ... }
============================================================
✉️ New message received
```

---

## 🔧 إذا حصلت مشكلة:

```bash
# شوف logs
pm2 logs wapulse-server

# اختبر الـ endpoint
curl -X POST https://YOUR_DOMAIN.com/api/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{"event":"test","instance":"test","data":{}}'

# المفروض يرد:
# {"success":true,"received":true}
```

---

**للتفاصيل الكاملة: شوف `DEPLOYMENT_GUIDE.md`**
