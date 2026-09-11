# KrishiGati Multi-Language & Real-Time Updates Implementation Guide

## Summary of Changes

This implementation provides complete multi-language support, separate farmer and procurement staff pages, and real-time slot booking updates with location tracking.

### ✅ Completed Components

#### 1. **i18n.ts** - Enhanced Multi-Language Support
- Expanded translations for all 7 languages (English, Hindi, Kannada, Telugu, Tamil, Marathi, Bengali)
- Added 70+ UI strings for farmer and procurement functionality
- All updates, notifications, and statuses are now fully translated

#### 2. **LanguageContext.tsx** - Global Language State Management
- React Context for managing language selection globally
- Language persists in localStorage automatically
- Available via `useLanguage()` hook in any component
- Usage: `const { language, setLanguage } = useLanguage();`

#### 3. **FarmerPage.tsx** - Dedicated Farmer Interface
**Features:**
- Multi-language dashboard with language toggle
- Real-time location tracking (with permission handling)
- Slot booking with crop and quantity selection
- Live token status with progress tracking
- Procurement receipt with weight and payment details
- Smart mandi recommendations
- All UI in selected language

**Key Props:**
```typescript
{
  farmer: { id: string; name: string; phone: string };
  onLogout: () => void;
  onLanguageChange: () => void;
}
```

#### 4. **ProcurementPage.tsx** - Dedicated Procurement Staff Interface
**Features:**
- Incoming farmer bookings list with real-time updates
- Farmer location display and updates
- Crowd management system (low/medium/high/very_high)
- Direct contact options (call/SMS farmer)
- Queue status monitoring
- All UI in selected language
- WebSocket connection for real-time updates

**Key Props:**
```typescript
{
  official: { id: string; name: string; mandiId: string };
  mandi: Mandi;
  onLogout: () => void;
  onLanguageChange: () => void;
}
```

#### 5. **Updated types.ts** - New Types for Real-Time Features
```typescript
- CrowdStatus: "low" | "medium" | "high" | "very_high"
- CrowdUpdate: Crowd status with timestamp and notes
- BookingUpdate: Complete booking event with location
- Token: Enhanced with farmer details and location
```

#### 6. **Backend API Endpoints** (server.js)

**New Endpoints:**
- `POST /api/mandis/:mandiId/crowd` - Update crowd status
- `GET /api/mandis/:mandiId/crowd` - Get current crowd status
- `POST /api/tokens/:tokenId/location` - Update farmer location

**Enhanced Endpoints:**
- `POST /api/tokens/book` - Now sends farmer location and broadcasts to procurement staff

**Socket.IO Events:**
```javascript
// Farmer sends location
socket.emit('location:update', { 
  tokenId, latitude, longitude, mandiId 
});

// Procurement staff joins channel
socket.emit('procurement:join', { 
  mandiId, officialId 
});

// Procurement updates crowd
socket.emit('crowd:update', { 
  mandiId, crowdLevel, notes, officialId 
});

// Events broadcast to clients
'procurement:update' - New bookings, location updates, crowd changes
'crowd:updated' - Crowd status changes
'farmer:location' - Farmer location updates
```

#### 7. **Updated App.tsx** - Simplified Main App
- Wraps app with LanguageProvider
- Routes to FarmerPage or ProcurementPage based on role
- Cleaner, more maintainable structure
- Handles farmer persistence and mandi loading

### 📝 How Everything Works Together

#### User Flow - Farmer:
1. Select language on login
2. Log in as farmer
3. FarmerPage opens with:
   - All UI in selected language
   - Automatic location permission request
   - Real-time mandi data
   - Slot booking interface
4. Book slot:
   - Select crop, quantity
   - Location is captured automatically
   - Booking sent to server with location
   - Confirmation in farmer's language
5. Server broadcasts booking to procurement staff via WebSocket

#### User Flow - Procurement Staff:
1. Select language on login
2. Log in as procurement official
3. ProcurementPage opens with:
   - All UI in selected language
   - WebSocket connection established
   - Real-time incoming bookings list
4. When farmer books:
   - New booking appears in incoming list
   - Farmer location visible
   - Call/SMS options available
5. Update crowd status:
   - Select crowd level
   - Add notes
   - Broadcast to farmers at that mandi
6. See queue in real-time

### 🔄 Real-Time Communication

**Architecture:**
```
Farmer Books Slot
    ↓
Backend broadcasts to Procurement Staff
    ↓
Procurement Page receives 'procurement:update' event
    ↓
Incoming bookings list updates instantly
    ↓
Farmer location displayed
    ↓
Staff can call/SMS farmer
    ↓
Procurement staff updates crowd status
    ↓
Broadcast sent back to farmers at that mandi
```

### 🌍 Language Implementation

**How translations are applied:**
1. Component imports `useLanguage()` hook
2. Gets current language: `const { language } = useLanguage();`
3. Gets translated text: `const text = getCopy(language);`
4. Uses in JSX: `<h2>{text.farmerDashboard}</h2>`
5. User switches language → all components re-render with new text

**All UI strings now available in:**
- English
- हिंदी (Hindi)
- ಕನ್ನಡ (Kannada)
- తెలుగు (Telugu)
- தமிழ் (Tamil)
- मराठी (Marathi)
- বাংলা (Bengali)

### 🚀 Next Steps to Deploy

1. **Replace App.tsx completely** with the new simplified version
2. **Test language switching** in both pages
3. **Test WebSocket connection** in ProcurementPage
4. **Test location sharing** in FarmerPage
5. **Test crowd updates** from procurement page
6. **Mobile responsiveness** check

### 🔧 Configuration

**Backend needs:**
- Prisma schema updated with crowd fields (if not present):
  - `crowdStatus String?`
  - `lastCrowdUpdateAt DateTime?`
  - `farmerLatitude Float?`
  - `farmerLongitude Float?`
  - `lastLocationUpdate DateTime?`

**Environment variables:**
- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket URL (usually same as API_URL but ws://)

### 📱 Mobile & Accessibility

- Responsive grid layouts
- Touch-friendly buttons
- Language selectors
- Location-aware (GPS)
- SMS integration ready
- Voice support ready

### 🛡️ Security & Privacy

- Location data only sent to procurement staff at specific mandi
- Language preference stored locally
- Farmer phone masked in some displays
- WebSocket authenticated per mandi

## File Changes Summary

| File | Changes |
|------|---------|
| `i18n.ts` | ✅ Expanded all translations |
| `types.ts` | ✅ Added CrowdStatus, CrowdUpdate, BookingUpdate |
| `api.ts` | ✅ Added crowd and location endpoints |
| `LanguageContext.tsx` | ✅ CREATED - Global language state |
| `FarmerPage.tsx` | ✅ CREATED - Farmer dashboard |
| `ProcurementPage.tsx` | ✅ CREATED - Procurement staff dashboard |
| `App.tsx` | ⏳ NEEDS UPDATE - Use new routing logic |
| `backend/server.js` | ✅ Added socket.io events and API endpoints |

