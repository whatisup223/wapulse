# 🚀 دليل الرفع على EasyPanel - خطوة بخطوة

## 📋 المتطلبات قبل البدء:

- ✅ حساب على EasyPanel
- ✅ Git repository (GitHub/GitLab/Bitbucket)
- ✅ Domain: `http://wa.n8nmarketation.online`

---

## 🎯 الخطوة 1: رفع الكود على Git

### 1.1 - إنشاء Git Repository (إذا لم يكن موجود):

```bash
# في مجلد المشروع
cd c:\Users\Marketation\Desktop\wapulse-saas-dashboard

# تهيئة Git
git init

# إضافة remote (استبدل بـ URL الخاص بك)
git remote add origin https://github.com/YOUR_USERNAME/wapulse-saas-dashboard.git
```

### 1.2 - رفع الكود:

```bash
# إضافة كل الملفات
git add .

# Commit
git commit -m "Initial commit - Ready for production"

# Push
git push -u origin main
```

**✅ تأكد**: الكود موجود على GitHub/GitLab

---

## 🎯 الخطوة 2: إنشاء App على EasyPanel

### 2.1 - تسجيل الدخول:
1. افتح EasyPanel: `https://your-easypanel-url.com`
2. سجل دخول بحسابك

### 2.2 - إنشاء Project جديد:
1. اضغط **"New Project"**
2. اسم Project: `wapulse`
3. اضغط **"Create"**

### 2.3 - إضافة Service:
1. داخل Project، اضغط **"Add Service"**
2. اختر **"App"**
3. اختر **"From Git"**

### 2.4 - ربط Git Repository:
1. اختر **GitHub** (أو GitLab/Bitbucket)
2. اختر Repository: `wapulse-saas-dashboard`
3. Branch: `main`
4. اضغط **"Continue"**

---

## 🎯 الخطوة 3: إعداد Build Settings

### 3.1 - General Settings:
```
App Name: wapulse-app
```

### 3.2 - Build Settings:
```
Build Command: npm install && npm run build
Start Command: npm start
Port: 5000
```

### 3.3 - Environment Variables:
اضغط **"Add Environment Variable"** وأضف:

```
VITE_EVOLUTION_URL=https://api.n8nmarketation.online
VITE_EVOLUTION_API_KEY=429683C4C977415CAAFCCE10F7D57E11
NODE_ENV=production
PORT=5000
```

**⚠️ مهم**: تأكد من كتابة المتغيرات بالضبط!

---

## 🎯 الخطوة 4: إعداد Domain

### 4.1 - إضافة Domain:
1. في صفحة App، اذهب لـ **"Domains"**
2. اضغط **"Add Domain"**
3. أدخل: `wa.n8nmarketation.online`
4. اضغط **"Add"**

### 4.2 - إعداد DNS (في لوحة الـ Domain):
1. اذهب لإعدادات DNS للـ domain
2. أضف A Record:
   ```
   Type: A
   Name: wa
   Value: [IP Address من EasyPanel]
   TTL: 3600
   ```

**💡 للحصول على IP**: EasyPanel سيعرضه في صفحة Domain

---

## 🎯 الخطوة 5: Deploy!

### 5.1 - ابدأ Deploy:
1. اضغط **"Deploy"**
2. انتظر... (قد يستغرق 2-5 دقائق)

### 5.2 - راقب Logs:
1. اضغط **"Logs"** لمشاهدة التقدم
2. ابحث عن:
   ```
   ✓ built in X.XXs
   Server running on port 5000
   ```

### 5.3 - تحقق من الحالة:
- Status: **Running** ✅
- Health: **Healthy** ✅

---

## 🎯 الخطوة 6: اختبار التطبيق

### 6.1 - افتح المتصفح:
```
http://wa.n8nmarketation.online
```

**المتوقع**: صفحة تسجيل الدخول تظهر ✅

### 6.2 - اختبر تسجيل الدخول:
```
Email: admin@marketation.sa
Password: password123
```

**المتوقع**: تدخل للـ Dashboard ✅

### 6.3 - اختبر Webhook:
```bash
curl -X POST http://wa.n8nmarketation.online/api/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{"event":"test","instance":"test","data":{}}'
```

**المتوقع**: `{"success":true,"received":true}` ✅

---

## 🎯 الخطوة 7: إعداد Evolution API

### 7.1 - على سيرفر Evolution:
```bash
# عدّل .env
nano .env
```

### 7.2 - غيّر هذه الأسطر:
```env
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=http://wa.n8nmarketation.online/api/webhooks/evolution
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true
```

### 7.3 - احفظ وأعد التشغيل:
```bash
# احفظ (Ctrl+X, Y, Enter)

# أعد تشغيل Evolution
docker-compose restart
```

---

## 🎯 الخطوة 8: اختبار نهائي

### 8.1 - شوف Logs في EasyPanel:
1. في صفحة App، اضغط **"Logs"**
2. اختر **"Live Logs"**

### 8.2 - ابعت رسالة WhatsApp:
1. افتح WhatsApp على هاتفك
2. ابعت رسالة لنفسك

### 8.3 - راقب Logs:
**المتوقع**:
```
============================================================
📩 Evolution Webhook Received
Event: messages.upsert
Instance: your_instance
Data: { ... }
============================================================
✉️ New message received
```

**إذا ظهر ده → كل حاجة شغالة! 🎉**

---

## 🔧 استكشاف الأخطاء:

### المشكلة: Build Failed
**الحل**:
1. شوف Logs في EasyPanel
2. تأكد من `package.json` صحيح
3. تأكد من Environment Variables موجودة

### المشكلة: App Crashed
**الحل**:
1. شوف Logs: ابحث عن errors
2. تأكد من PORT=5000 في Environment Variables
3. أعد Deploy

### المشكلة: Domain مش شغال
**الحل**:
1. تأكد من DNS settings صحيحة
2. انتظر 5-10 دقائق (DNS propagation)
3. جرب `ping wa.n8nmarketation.online`

### المشكلة: Webhook مش بيوصل
**الحل**:
1. تأكد من Evolution `.env` صحيح
2. تأكد من URL: `http://wa.n8nmarketation.online/api/webhooks/evolution`
3. جرب curl test من فوق

---

## ✅ Checklist النهائي:

- [ ] الكود مرفوع على Git
- [ ] App مُنشأ على EasyPanel
- [ ] Build Settings صحيحة
- [ ] Environment Variables موجودة
- [ ] Domain مضاف ومربوط
- [ ] DNS settings صحيحة
- [ ] Deploy نجح
- [ ] التطبيق يفتح في المتصفح
- [ ] تسجيل الدخول يعمل
- [ ] Webhook endpoint يرد
- [ ] Evolution `.env` محدّث
- [ ] Evolution تم إعادة تشغيله
- [ ] Webhook test نجح
- [ ] رسالة WhatsApp حقيقية وصلت في Logs

---

## 🎉 تهانينا!

التطبيق الآن شغال على الإنتاج! 🚀

**الخطوات التالية**:
- راقب Logs بانتظام
- اختبر كل الميزات
- أضف SSL Certificate (HTTPS) لاحقاً
- فعّل Auto Deploy من Git

**بالتوفيق! 💪**
