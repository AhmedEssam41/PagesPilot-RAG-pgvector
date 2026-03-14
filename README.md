# 🧠 PagesPilot RAG Engine

نظام RAG مبني على pgvector + HuggingFace + Gemini Flash 2.5.
يخليك تحفظ أي بيانات وتسأل عنها بالذكاء الاصطناعي.

---

## ⚙️ قبل ما تبدأ — جهّز الأدوات دي

### 1. Node.js
- روح [nodejs.org](https://nodejs.org) وحمّل نسخة **LTS**
- ثبّتها عادي
- تأكد بـ: `node --version`

### 2. Git
- روح [git-scm.com](https://git-scm.com) وحمّل
- تأكد بـ: `git --version`

### 3. Gemini API Key
- روح [aistudio.google.com](https://aistudio.google.com)
- سجّل دخول بحساب Google
- اضغط **Get API Key** ← **Create API Key**
- انسخ المفتاح واحفظه

### 4. HuggingFace Token
- روح [huggingface.co](https://huggingface.co) واعمل حساب مجاني
- اضغط على صورتك ← **Settings** ← **Access Tokens**
- اضغط **New Token** ← اختار **Read** ← انسخ الـ Token

### 5. Neon Database
- روح [neon.tech](https://neon.tech) واعمل حساب مجاني
- اضغط **New Project** واعمل project جديد
- من الـ Dashboard افتح **SQL Editor** وشغّل الأوامر دي **واحدة واحدة**:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
```sql
CREATE TABLE IF NOT EXISTS rag_documents (
  id          SERIAL PRIMARY KEY,
  collection  TEXT NOT NULL,
  source_type TEXT NOT NULL,
  title       TEXT,
  content     TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  embedding   vector(384),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
```sql
CREATE INDEX rag_embedding_idx ON rag_documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```
```sql
CREATE INDEX rag_collection_idx ON rag_documents (collection);
```
```sql
CREATE INDEX rag_metadata_idx ON rag_documents USING gin (metadata);
```

- بعدين روح **Dashboard** ← **Connection Details**
- غيّر من **Pooler** لـ **Direct**
- انسخ الـ **Connection String**

---

## 🚀 تشغيل المشروع

### 1. تنزيل المشروع
```bash
git clone https://github.com/AhmedEssam41/PagesPilot-RAG-pgvector.git
cd PagesPilot-RAG-pgvector
npm install
```

### 2. إنشاء ملف `.env`
اعمل ملف جديد اسمه `.env` في الـ root بتاع المشروع وحط فيه:

```
DATABASE_URL=رابط Neon بتاعك (Direct Connection String)
GEMINI_API_KEY=مفتاح Gemini بتاعك
HF_TOKEN=توكن HuggingFace بتاعك
GOOGLE_CLOUD_PROJECT_ID=placeholder
GOOGLE_APPLICATION_CREDENTIALS=placeholder
CLOUDINARY_CLOUD_NAME=placeholder
CLOUDINARY_API_KEY=placeholder
CLOUDINARY_API_SECRET=placeholder
```

> ⚠️ ملف `.env` شخصي لكل واحد — ماتشاركوش مع حد

### 3. تشغيل السيرفر
```bash
npx prisma generate
npm run dev
```

لو ظهر:
```
Server running on http://0.0.0.0:8080
```
يبقى شغال ✅

---

## 🧪 الاختبار عن طريق Postman

- نزّل Postman من [postman.com](https://postman.com)
- الـ Base URL: `http://localhost:8080`

---

## 📥 إدخال البيانات

### إدخال JSON
```
POST /v1/rag/ingest/json
```
```json
{
  "collection": "products",
  "data": [
    {
      "name": "iPhone 15 Pro",
      "description": "هاتف Apple الجديد بكاميرا 48MP",
      "price": 999,
      "category": "phones"
    }
  ],
  "contentFields": ["name", "description", "category", "price"],
  "titleField": "name",
  "metadataFields": ["price", "category"]
}
```

**Response ناجح:**
```json
{ "success": true, "inserted": 1, "collection": "products" }
```

---

### رفع ملف CSV
```
POST /v1/rag/ingest/file
```
نوع الـ Body: **form-data**

| Key | Type | Value |
|-----|------|-------|
| `file` | File | ملف `.csv` بتاعك |
| `collection` | Text | اسم المجموعة مثلاً `products` |
| `contentFields` | Text | أسماء الأعمدة مثلاً `name,description,price` |
| `titleField` | Text | العمود العنوان مثلاً `name` |

**شكل الـ CSV:**
```
name,description,price
iPhone 15,هاتف Apple,999
Dell XPS,لابتوب احترافي,1299
```

---

### إدخال نص
```
POST /v1/rag/ingest/text
```
```json
{
  "collection": "policies",
  "title": "سياسة الإرجاع",
  "text": "يمكن إرجاع المنتجات خلال 30 يوم من تاريخ الشراء."
}
```

---

## 🔍 البحث في البيانات

```
POST /v1/rag/search
```
```json
{
  "query": "سماعات لاسلكية",
  "collection": "products",
  "limit": 5
}
```

---

## 🤖 سؤال وجواب بالـ AI

```
POST /v1/rag/ask
```
```json
{
  "question": "عندكم سماعات؟ وكام سعرها؟",
  "collection": "products",
  "language": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "نعم، لدينا سماعة Sony WH-1000XM5 بسعر 350$...",
  "sources": [...],
  "hasContext": true
}
```

> 💡 لو عايز تسأل في كل البيانات، احذف `"collection"` من الـ request

---

## 📊 عرض البيانات المحفوظة

### كل المجموعات
```
GET /v1/rag/collections
```

### البيانات داخل مجموعة
```
GET /v1/rag/collections/products/documents?page=1&limit=20
```

---

## 🗑️ حذف البيانات

### حذف مجموعة كاملة
```
DELETE /v1/rag/collections/products
```

### حذف document واحد
```
DELETE /v1/rag/documents/1
```

---

## 📋 ملخص كل الـ Endpoints

| Method | Endpoint | الوظيفة |
|--------|----------|---------|
| POST | `/v1/rag/ingest/json` | إدخال JSON |
| POST | `/v1/rag/ingest/file` | رفع ملف CSV/TXT |
| POST | `/v1/rag/ingest/text` | إدخال نص |
| POST | `/v1/rag/ingest/sql` | إدخال SQL rows |
| POST | `/v1/rag/search` | Semantic Search |
| POST | `/v1/rag/ask` | سؤال وجواب بالـ AI |
| GET | `/v1/rag/collections` | عرض كل المجموعات |
| GET | `/v1/rag/collections/:name/documents` | عرض البيانات |
| DELETE | `/v1/rag/collections/:name` | حذف مجموعة |
| DELETE | `/v1/rag/documents/:id` | حذف document |
