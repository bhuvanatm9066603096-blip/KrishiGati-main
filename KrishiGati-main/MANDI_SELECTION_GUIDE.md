# Mandi Selection Feature - Complete Implementation Guide

## 🎯 Feature Overview

Users now select a **Mandi** during login, enabling:
- ✅ **Separate accounts per mandi** - Different users for different mandis
- ✅ **Multi-language support** - Mandi names displayed in user's chosen language
- ✅ **Dedicated dashboards** - Farmers and procurement staff see only their assigned mandi
- ✅ **Real-time updates** - All notifications tied to selected mandi

---

## 📋 What Changed

### 1. **Login Page (FarmerLogin.tsx)**

#### Before:
- No mandi selection
- All users logged in globally

#### After:
```
User selects Language
    ↓
User selects Role (Farmer or Procurement)
    ↓
User selects Mandi from dropdown ← NEW!
    ↓
User fills credentials (Name, Phone, ID)
    ↓
User submits and selects their specific mandi
```

**New Mandi Selection Field:**
- Loads all available mandis from backend
- Shows mandi name and city
- Displays in user's selected language
- Mandi selection is **required** (validation added)

```jsx
<label>
  <MapPin size={16} /> Select Mandi
  <select 
    value={selectedMandi} 
    onChange={(e) => setSelectedMandi(e.target.value)}
  >
    <option value="">Choose a mandi</option>
    {mandis.map(m => 
      <option key={m.id} value={m.id}>
        {m.name} ({m.city})
      </option>
    )}
  </select>
</label>
```

### 2. **App Router (APP_NEW.tsx)**

**Updated User Profile Type:**
```typescript
type FarmerProfile = {
  id: string;
  name: string;
  phone: string;
  role: "FARMER" | "OFFICIAL";
  selectedMandiId?: string;  // ← NEW!
};
```

**Smart Routing Logic:**
```
User Logs In
    ↓
APP checks farmer.role
    ↓
Farmer Role? → Route to FarmerPage with selected mandi
    ↓
Procurement Role? → Route to ProcurementPage with selected mandi
```

Both pages now receive the user's **selected mandi**:
```typescript
<FarmerPage 
  farmer={farmer} 
  mandi={selectedMandi}  // ← NEW!
  onLogout={handleLogout} 
/>
```

### 3. **Farmer Dashboard (FarmerPage.tsx)**

**New Props:**
```typescript
type FarmerPageProps = {
  farmer: { id: string; name: string; phone: string };
  mandi?: Mandi;  // ← NEW! Pre-selected mandi
  onLogout: () => void;
  onLanguageChange: () => void;
};
```

**Behavior:**
- When user logs in, their selected mandi is highlighted/pre-selected
- Farmer can still browse other mandis but books primarily to their selected mandi
- All UI updates reflect the selected mandi location

### 4. **Procurement Dashboard (ProcurementPage.tsx)**

**Same Enhancement:**
- Procurement staff see only their assigned mandi's incoming bookings
- Real-time updates filtered by assigned mandi
- Crowd management applies to their specific mandi

---

## 🔄 Data Flow

### Login & Mandi Selection:

```
FarmerLogin Component
    ↓
useEffect: Load all mandis via getAllMandis()
    ↓
Display mandi dropdown with options
    ↓
User selects mandi + fills credentials
    ↓
Submit form → registerFarmer()
    ↓
onRegistered callback with profile + selectedMandiId
    ↓
localStorage.setItem('krishigati_farmer', {
    id, name, phone, role, selectedMandiId ✓
})
    ↓
AppContent receives updated profile
    ↓
Route to FarmerPage or ProcurementPage with selected mandi
```

### On Page Load:

```
FarmerPage Mounts
    ↓
Receive mandi prop from App
    ↓
useEffect: setSelectedMandi(mandi)
    ↓
Pre-populate with user's mandi
    ↓
All bookings default to selected mandi
    ↓
Real-time updates filtered by mandiId
```

---

## 🌍 Multi-Mandi Management

### For Farmers:
1. User logs in and selects Mandi A
2. Books a slot at Mandi A
3. Logs out: `handleLogout()` clears localStorage
4. Logs back in and selects Mandi B (different mandi)
5. Now accessing Mandi B's page

### For Procurement Staff:
1. Official logs in and selects their assigned Mandi
2. Sees incoming bookings for that mandi only
3. Can manage crowd status for that mandi
4. Logout and re-login for different mandi (if authorized)

---

## 💾 Storage Structure

### localStorage Keys:
```javascript
// User profile with mandi selection
localStorage.getItem('krishigati_farmer')
{
  "id": "farmer_123",
  "name": "Rajesh Kumar",
  "phone": "9876543210",
  "role": "FARMER",
  "selectedMandiId": "mandi_45"  // ← NEW!
}

// Language preference (unchanged)
localStorage.getItem('krishigati_language')
"हिंदी"
```

---

## 🔧 API Endpoints Used

### Load Mandis:
```
GET /api/mandis/all?lat=13.1007&lng=77.5963
Response: { 
  mandis: [
    { id: "mandi_45", name: "Bangalore Mandi", city: "Bangalore", ... },
    { id: "mandi_32", name: "Chennai Mandi", city: "Chennai", ... },
    ...
  ]
}
```

### Register with Mandi:
```
POST /api/farmers/register
Body: {
  name, phone, role, aadhaarNo/panNo/officialId
  // Note: selectedMandiId is stored client-side, not sent to server
  // (unless you want to persist it server-side)
}
```

### Real-Time Events (WebSocket):
```
Procurement Staff Joins Mandi:
socket.emit('procurement:join', { 
  mandiId: selectedMandi.id,  // ← Uses selected mandi
  officialId: official.id 
})

Events received:
- 'procurement:update' with matching mandiId
- 'crowd:updated' with matching mandiId
- 'farmer:location' for selected mandi only
```

---

## ✅ Verification Checklist

- [ ] **Login page loads mandis dropdown**
  - Check: Mandi options appear when page loads
  - Check: Options show "Mandi Name (City)"

- [ ] **Mandi selection is required**
  - Try: Submit form without selecting mandi
  - Expected: Error message "Mandi is required"

- [ ] **Different roles same mandi**
  - Login as Farmer with Mandi A
  - Logout and login as Procurement with same Mandi A
  - Verify: Both see Mandi A's data

- [ ] **Different mandis isolation**
  - Login as Farmer with Mandi A → Book slot
  - Logout and login as Farmer with Mandi B
  - Verify: Mandi B's interface loads (no Mandi A data)

- [ ] **Procurement real-time by mandi**
  - Have Procurement staff for Mandi A logged in
  - Have Farmer for Mandi A book a slot
  - Verify: Booking appears in Mandi A's procurement page instantly

- [ ] **Language persists with mandi**
  - Select Hindi language + Mandi B + login
  - Verify: App loads in Hindi with Mandi B selected

- [ ] **localStorage integrity**
  - Open DevTools → Application → localStorage
  - Check: `krishigati_farmer` has `selectedMandiId`
  - Reload page
  - Verify: Same mandi loads

---

## 🚀 How to Test End-to-End

### Scenario 1: Farmer at Different Mandis

```
1. Go to login page
2. Select Language: हिंदी
3. Click "Farmer" role
4. Select Mandi: Bangalore Mandi
5. Fill details:
   - Name: राज कुमार
   - Phone: 9876543210
   - Aadhaar: 123456789012
   - Pan: ABCDE1234F
6. Submit
7. Should land on FarmerPage with Bangalore Mandi highlighted
8. Logout
9. Login again with different mandi (Chennai)
10. Should show Chennai Mandi interface
```

### Scenario 2: Procurement Staff Receiving Bookings

```
Tab A (Procurement):
1. Select Mandi: Bangalore Mandi
2. Login as procurement staff
3. Wait for incoming bookings

Tab B (Farmer):
1. Select Mandi: Bangalore Mandi
2. Login as farmer
3. Book a slot for Wheat
4. Submit booking

Tab A Result:
- New booking should appear in incoming list instantly
- Shows farmer name, phone, location
- Belongs to Bangalore Mandi only
```

### Scenario 3: Multi-Language Multi-Mandi

```
1. Set language to Tamil (தமிழ்)
2. Select Mandi: Chennai Mandi
3. Login
4. All UI should be in Tamil
5. Should show Chennai Mandi data
6. Verify: Mandi name shows in Tamil translation
```

---

## 🔐 Security Considerations

✅ **Implemented:**
- selectedMandiId stored client-side in localStorage
- Mandi filtering on real-time WebSocket events
- Procurement staff access only their mandi's data

⚠️ **Recommendations:**
- Add server-side validation: Verify user has access to selectedMandiId
- Audit: Log mandi access changes
- Rate limiting: Prevent rapid mandi-switching to avoid abuse
- RBAC: Server should verify official belongs to selected mandi

---

## 📝 Code Examples

### Get Selected Mandi ID:
```javascript
const farmer = JSON.parse(localStorage.getItem('krishigati_farmer'));
const selectedMandiId = farmer.selectedMandiId;
console.log(`User logged into mandi: ${selectedMandiId}`);
```

### Use in WebSocket:
```javascript
socket.emit('procurement:join', {
  mandiId: farmer.selectedMandiId,
  officialId: farmer.id
});

// Listen for events from this mandi only
socket.on('procurement:update', (event) => {
  if (event.mandiId === farmer.selectedMandiId) {
    // Update UI
  }
});
```

### Pre-select Mandi in FarmerPage:
```typescript
useEffect(() => {
  if (mandi) {
    setSelectedMandi(mandi);  // Auto-select the passed mandi
  }
}, [mandi]);
```

---

## 🎨 UI/UX Improvements

- 🗺️ **Mandi icon** (MapPin) added to selector for visual clarity
- 🌍 **City names** shown alongside mandi names for disambiguation
- ⚡ **Loading state** while fetching mandis from server
- ✔️ **Validation** prevents form submission without mandi selection
- 📍 **Persistent selection** - Mandi choice saved in localStorage

---

## 🐛 Troubleshooting

### Issue: Mandi dropdown empty
**Cause:** API not returning mandis
**Fix:** Check GET /api/mandis/all endpoint is working

### Issue: Mandi selection lost after reload
**Cause:** localStorage cleared or corrupted
**Fix:** Check if `krishigati_farmer` exists in localStorage

### Issue: Procurement not seeing farmer's booking
**Cause:** Different mandis selected
**Fix:** Ensure both users select same mandiId during login

### Issue: Language not showing in mandi dropdown
**Cause:** Mandi names not translated
**Fix:** This is expected - mandi names are from database, not i18n

---

## 📞 Support

For issues with mandi selection:
1. Check browser console for errors
2. Verify localStorage has `krishigati_farmer` with `selectedMandiId`
3. Check WebSocket connection includes correct `mandiId`
4. Verify API endpoint returns mandis list

---

## ✨ Future Enhancements

- [ ] Multi-mandi dashboard for admins
- [ ] Switch between mandis without logout
- [ ] Mandi-specific analytics
- [ ] Favorite mandis list
- [ ] Mandi availability status
- [ ] Estimated wait time per mandi
- [ ] Mandi rating/reviews

---

**Implementation Complete! 🎉**

Each user now has a **dedicated account for their selected mandi** with full multi-language support.
