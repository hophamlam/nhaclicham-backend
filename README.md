# 🌙 Nhạc Lịch Âm (Lunar Calendar) - Backend API

**Simplified hybrid architecture using Supabase REST API + Edge Functions**

## 🏗️ **Architecture Overview**

### **90% REST API + 10% Edge Functions**

- **Supabase REST API**: All CRUD operations (profiles, events, notifications)
- **Edge Functions**: Only custom logic (lunar calendar conversion)
- **Result**: 90% less code, better performance, easier maintenance

## 🚀 **Quick Start**

### **Database**

```bash
# Setup database
supabase start
supabase db reset

# Deploy
supabase functions deploy lunar-api
```

### **API Endpoints**

#### **🌙 Lunar Conversion (Edge Function)**

```bash
# Solar to Lunar
GET /functions/v1/lunar-api/lunar-convert?date=2024-12-25

# Lunar to Solar
GET /functions/v1/lunar-api/solar-convert?lunar_day=15&lunar_month=8&lunar_year=2024
```

#### **📊 CRUD Operations (REST API)**

```typescript
// Profiles
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId);
const { data } = await supabase
  .from("profiles")
  .update({ display_name: "New Name" })
  .eq("id", userId);

// Events
const { data: events } = await supabase
  .from("events")
  .select("*")
  .eq("user_id", userId);
const { data } = await supabase
  .from("events")
  .insert({ user_id: userId, note: "Event", is_lunar: true });

// Notifications
const { data: settings } = await supabase
  .from("notification_settings")
  .select("*")
  .eq("user_id", userId);
```

## 🧪 **Testing with Postman**

### **Step 1: Import Collection**

1. Import `nhaclicham_api.postman_collection.json` into Postman
2. Collection includes authentication workflow and API testing

### **Step 2: Authentication Workflow**

```
🔐 Authentication
├── 1. Sign Up         (Creates new user + auto-saves JWT)
├── 2. Sign In         (Login existing user + auto-saves JWT)
├── 3. Get User Info   (Verify current user)
├── 4. Refresh Token   (Renew expired JWT)
└── 5. Sign Out        (Logout user)
```

### **Step 3: Test Your Own Data**

After signing up/in, the collection automatically:

- ✅ Saves JWT token to global variables
- ✅ Saves User ID for authenticated requests
- ✅ All subsequent requests use your user data

### **Step 4: API Testing Flow**

```
1. 🔐 Sign Up/Sign In first
   └── JWT + User ID auto-saved

2. 👤 Create/Update Profile
   └── Uses your User ID

3. 📅 Manage Your Events
   └── CRUD operations on your events

4. 🔔 Setup Notifications
   └── Configure your notification preferences

5. 🌙 Test Lunar Conversion
   └── Convert dates (no user data needed)
```

### **Authentication Details**

- **Sign Up**: Creates account + returns JWT
- **Sign In**: Login + returns fresh JWT
- **Auto Token Management**: JWT automatically saved to globals
- **User Isolation**: Each user only sees their own data
- **Token Expiry**: Use "Refresh Token" if JWT expires

## 📁 **Project Structure**

```
nhaclicham-backend/
├── supabase/
│   ├── functions/
│   │   ├── lunar-api/           # 🌙 Lunar conversion only
│   │   │   └── index.ts
│   │   └── _shared/
│   │       ├── supabase.ts      # Client setup
│   │       ├── types.ts         # TypeScript types
│   │       └── lunar-service.ts # Backward compatibility
│   ├── migrations/
│   │   └── 20250618000000_initial_schema.sql
│   └── config.toml
├── README.md
├── REFACTOR_SUMMARY.md          # 📊 Detailed comparison
└── nhaclicham_api.postman_collection.json  # 🧪 API testing
```

## 🎯 **Key Benefits**

### **Simplified Codebase**

- ✅ **90% Less Code**: Removed redundant CRUD functions
- ✅ **Single Purpose**: Edge Functions only for complex logic
- ✅ **Standard Patterns**: REST API follows conventions

### **Better Performance**

- ✅ **Direct DB Access**: No unnecessary Edge Function overhead
- ✅ **Built-in Caching**: Supabase REST API optimization
- ✅ **Real-time Support**: WebSocket subscriptions available

### **Developer Experience**

- ✅ **Auto-generated Types**: TypeScript types from schema
- ✅ **RLS Security**: Row Level Security built-in
- ✅ **Easier Testing**: Standard REST endpoints
- ✅ **Less Maintenance**: Fewer custom functions to maintain

## 🔧 **Development**

### **Environment Setup**

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login and link project
supabase login
supabase link --project-ref aekfivlrnrdzolsiipdf
```

### **Testing API**

1. Import `nhaclicham_api.postman_collection.json` into Postman
2. Set JWT token for authenticated requests
3. Test REST endpoints and lunar conversion

### **Database Schema**

- **auth.users**: Supabase Auth integration
- **profiles**: User profile information
- **events**: Calendar events (lunar/solar)
- **notification_settings**: User notification preferences
- **notification_logs**: Sent notification history

## 🌐 **Live API**

**Base URL**: `https://aekfivlrnrdzolsiipdf.supabase.co`

- **REST API**: `/rest/v1/`
- **Edge Functions**: `/functions/v1/lunar-api/`
- **Auth**: `/auth/v1/`

## 📊 **Before vs After**

| Aspect            | Before (Complex Edge Functions) | After (Hybrid Approach) |
| ----------------- | ------------------------------- | ----------------------- |
| **Lines of Code** | ~1000+ lines                    | ~200 lines              |
| **Complexity**    | High (custom CRUD)              | Low (standard REST)     |
| **Performance**   | Function overhead               | Direct DB access        |
| **Maintenance**   | Complex debugging               | Standard patterns       |
| **Real-time**     | Custom implementation           | Built-in WebSockets     |
| **Types**         | Manual typing                   | Auto-generated          |

## 🎉 **Result**

**Perfect balance between simplicity and functionality:**

- 🌙 **Preserved**: Complex lunar calendar logic in Edge Functions
- 📊 **Simplified**: CRUD operations via standard REST API
- 🚀 **Optimized**: Better performance and developer experience
- 🔧 **Maintainable**: Less custom code, more conventions

---

_Built with [Supabase](https://supabase.com) | Powered by [lunar-calendar-ts-vi](https://www.npmjs.com/package/lunar-calendar-ts-vi)_
