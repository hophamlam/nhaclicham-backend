# Nhắc Lịch Âm API

Backend API để nhắc lịch âm hàng ngày, sử dụng **Supabase Edge Functions** và **Deno runtime**.

## 🚀 Live API

**Base URL:** `https://aekfivlrnrdzolsiipdf.supabase.co/functions/v1/api`

**Auth Header:**

```
Authorization: Bearer ***REMOVED***
```

## 📋 API Endpoints

### Lunar Calendar

```bash
# Ngày âm lịch hôm nay
GET /api/lunar/today

# Chuyển đổi dương lịch sang âm lịch
POST /api/lunar/convert
Body: {"day": 17, "month": 6, "year": 2025}
```

### Reminders

```bash
# Tạo reminder mới
POST /api/reminders
Body: {
  "user_id": "user123",
  "note": "Ngày giỗ tổ tiên",
  "lunar_day": 10,
  "lunar_month": 3,
  "repeat_every_year": true
}

# Lấy reminders hôm nay
GET /api/reminders/today

# Lấy reminders của user
GET /api/reminders/user/{userId}

# Lấy reminder theo ID
GET /api/reminders/{id}

# Cập nhật reminder
PUT /api/reminders/{id}

# Xóa reminder
DELETE /api/reminders/{id}
```

### Health Check

```bash
GET /health
```

## 💻 Example Usage

```bash
# Test API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://aekfivlrnrdzolsiipdf.supabase.co/functions/v1/api/lunar/today

# Tạo reminder
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user123","note":"Test","lunar_day":10,"lunar_month":3,"repeat_every_year":true}' \
  https://aekfivlrnrdzolsiipdf.supabase.co/functions/v1/api/reminders
```

## 🛠️ Development

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/) (optional, for local testing)

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd nhaclicham-backend

# Login to Supabase
supabase login

# Link to existing project
supabase link --project-ref aekfivlrnrdzolsiipdf

# Serve functions locally
supabase functions serve

# Deploy functions
supabase functions deploy
```

## 📁 Project Structure

```
├── supabase/
│   ├── functions/
│   │   ├── _shared/           # Shared utilities
│   │   │   ├── types.ts       # TypeScript interfaces
│   │   │   ├── supabase.ts    # Database client
│   │   │   ├── utils.ts       # HTTP utilities
│   │   │   ├── lunar-service.ts  # Lunar calendar logic
│   │   │   └── reminder-service.ts # Business logic
│   │   ├── api/               # Main API endpoint
│   │   ├── health/            # Health check
│   │   └── import_map.json    # Dependencies
│   └── migrations/            # Database migrations
└── README.md
```

## 🎯 Features

- ✅ **Lunar Calendar**: Chuyển đổi dương lịch ↔ âm lịch
- ✅ **Reminders**: CRUD operations cho lời nhắc
- ✅ **Today's Reminders**: Tự động lấy reminders theo ngày âm lịch
- ✅ **Global Edge**: Deploy trên global CDN
- ✅ **Auto-scaling**: Serverless với Deno runtime
- ✅ **TypeScript**: Full type safety

## 📊 Database Schema

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  note TEXT NOT NULL,
  lunar_day INTEGER NOT NULL CHECK (lunar_day >= 1 AND lunar_day <= 30),
  lunar_month INTEGER NOT NULL CHECK (lunar_month >= 1 AND lunar_month <= 12),
  repeat_every_year BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deployment

Functions được deploy tự động trên **Supabase Edge Functions** - global serverless platform.

**Benefits:**

- 🌍 Global edge locations
- ⚡ Low latency worldwide
- 📈 Auto-scaling
- 💰 Pay-per-use pricing
- 🔒 Built-in auth & security

---

Built with ❤️ using Supabase Edge Functions & Deno
