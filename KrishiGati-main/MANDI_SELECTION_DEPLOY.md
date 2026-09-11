# Mandi Selection Implementation Checklist

## ✅ Files Updated

- [x] **frontend/FarmerLogin.tsx**
  - Added mandi loading via useEffect
  - Added mandi selection dropdown
  - Added validation for mandi selection
  - Saves selectedMandiId to localStorage

- [x] **APP_NEW.tsx**
  - Updated FarmerProfile type with selectedMandiId
  - Updated login handler to load mandis for both roles
  - Updated routing to use selectedMandiId
  - Both pages now receive the selected mandi

- [x] **frontend/FarmerPage.tsx**
  - Updated props to accept optional mandi parameter
  - Added useEffect to set selectedMandi when mandi prop changes
  - Now auto-selects the pre-selected mandi

- [x] **frontend/ProcurementPage.tsx**
  - Already correctly configured
  - No changes needed

- [x] **frontend/i18n.ts**
  - Translation for "mandi" already exists in all 7 languages
  - No changes needed

- [x] **frontend/types.ts**
  - CrowdStatus, CrowdUpdate types already exist
  - No changes needed

- [x] **frontend/api.ts**
  - getAllMandis() function already exists
  - No changes needed

---

## 🚀 Quick Start Steps

### Step 1: Copy APP_NEW.tsx to App.tsx
```bash
# Copy the enhanced APP_NEW.tsx to replace App.tsx
cp APP_NEW.tsx frontend/App.tsx

# Or manually:
# 1. Open APP_NEW.tsx
# 2. Copy all content
# 3. Open frontend/App.tsx
# 4. Replace all content
# 5. Save
```

### Step 2: Verify File Changes
```bash
# Check that these files have been updated:
# ✓ frontend/FarmerLogin.tsx (has mandi dropdown)
# ✓ APP_NEW.tsx (has selectedMandiId)
# ✓ frontend/FarmerPage.tsx (accepts mandi prop)
# ✓ frontend/ProcurementPage.tsx (already good)
```

### Step 3: Clear Browser Cache
```
DevTools → Application → Storage → Clear site data
```

### Step 4: Start the Application
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:backend
```

### Step 5: Test Login Flow
```
1. Open http://localhost:5173
2. Select Language: English (or any)
3. Select Role: Farmer
4. Check: Mandi dropdown appears with options
5. Select: Any mandi
6. Fill credentials and submit
7. Verify: Routed to FarmerPage with that mandi
```

---

## 🧪 Testing Scenarios

### Scenario 1: Farmer at Different Mandis ✅
```
Login as Farmer with Mandi A
  ↓
Book slot at Mandi A
  ↓
Logout
  ↓
Login as Farmer with Mandi B (different mandi)
  ↓
Verify: See Mandi B's page (not A)
```

### Scenario 2: Procurement Staff ✅
```
Login as Procurement with Mandi A
  ↓
Check: See incoming bookings for Mandi A
  ↓
Logout and Login with Mandi B
  ↓
Verify: See Mandi B bookings only
```

### Scenario 3: Real-Time Broadcast ✅
```
Tab A: Open ProcurementPage for Mandi A
  ↓
Tab B: Login as Farmer for Mandi A
  ↓
Tab B: Book a slot
  ↓
Tab A: Verify booking appears instantly
```

### Scenario 4: Language + Mandi ✅
```
Select Language: हिंदी
  ↓
Select Mandi: मुंबई मंडी
  ↓
Login and Verify: UI in Hindi, Mandi selected
```

### Scenario 5: localStorage Persistence ✅
```
Login with Mandi A
  ↓
Open DevTools → Application → localStorage
  ↓
Find 'krishigati_farmer' 
  ↓
Verify: Has "selectedMandiId": "mandi_xxx"
  ↓
Reload page
  ↓
Same mandi should load automatically
```

---

## 🔍 Verification Tests

### Check 1: Mandi Dropdown Renders
```javascript
// In browser console:
const dropdown = document.querySelector('select[name="mandi"]');
console.log(dropdown); // Should not be null
console.log(dropdown.options.length); // Should have mandis
```

### Check 2: Mandi Selection Saved
```javascript
// In browser console after login:
const farmer = JSON.parse(localStorage.getItem('krishigati_farmer'));
console.log(farmer.selectedMandiId); // Should show mandi ID
```

### Check 3: Correct Mandi Loaded
```javascript
// On FarmerPage after login:
const pageTitle = document.querySelector('h1');
console.log(pageTitle.textContent); // Should mention your mandi
```

### Check 4: WebSocket Connected
```javascript
// In Network tab of DevTools:
// Look for socket.io connection
// Should see events with correct mandiId
```

---

## 📋 Deployment Checklist

- [ ] APP_NEW.tsx copied to frontend/App.tsx
- [ ] All 4 files compiled without TypeScript errors
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Mandi dropdown appears on login
- [ ] Can select different mandi for different logins
- [ ] Selected mandi persists in localStorage
- [ ] Both Farmer and Procurement work with mandi selection
- [ ] Real-time updates work per selected mandi
- [ ] Language + Mandi work together
- [ ] Mobile responsive (test on DevTools mobile view)
- [ ] No console errors

---

## 🐛 Troubleshooting

### Issue: Mandi dropdown not showing
**Check:**
1. FarmerLogin.tsx has mandi loading useEffect
2. getAllMandis() API call succeeds
3. Browser console has no errors
**Fix:** Verify API endpoint `/api/mandis/all` returns mandis

### Issue: Mandi selection lost after reload
**Check:**
1. localStorage has 'krishigati_farmer' with selectedMandiId
2. JSON is valid (check DevTools)
**Fix:** Check if localStorage is being cleared by cache clear

### Issue: Wrong mandi loading
**Check:**
1. selectedMandiId matches the mandi loaded
2. FarmerPage receives mandi prop correctly
**Fix:** Add console.log(farmer, mandi) to debug

### Issue: Procurement not receiving bookings
**Check:**
1. Both Farmer and Procurement select SAME mandi
2. WebSocket connected to correct mandiId
**Fix:** Verify selectedMandiId is same in both browser tabs

### Issue: Multi-language not working with mandi
**Check:**
1. Language is set correctly
2. Mandi names come from database (not translated)
**Fix:** This is expected - mandi names stay in English

---

## 📝 Code Snippets for Reference

### Check Selected Mandi ID:
```javascript
const farmer = JSON.parse(localStorage.getItem('krishigati_farmer'));
const selectedMandiId = farmer?.selectedMandiId;
console.log(`User selected mandi: ${selectedMandiId}`);
```

### Use Selected Mandi in WebSocket:
```javascript
socket.emit('procurement:join', {
  mandiId: farmer.selectedMandiId,  // Use selected mandi
  officialId: farmer.id
});
```

### Route Based on Mandi:
```typescript
const assignedMandi = mandis.find(m => m.id === farmer.selectedMandiId);
if (!assignedMandi) {
  return <div>Mandi not found</div>;
}
return <ProcurementPage mandi={assignedMandi} {...props} />;
```

---

## 🎯 Features Enabled

After completing these steps, you'll have:

✅ **Mandi selection on login** - Users choose their mandi during registration
✅ **Separate accounts per mandi** - Different logins for different mandis
✅ **Multi-mandi support** - Platform supports unlimited mandis
✅ **Mandi persistence** - Selection saved and restored automatically
✅ **Role + Mandi routing** - Correct page shown based on both role and mandi
✅ **Real-time per-mandi** - WebSocket events filtered by mandi
✅ **Multi-language mandis** - Works with all 7 languages
✅ **Procurement per-mandi** - Staff see only their assigned mandi's bookings
✅ **Farmer per-mandi** - Farmers pre-selected to their mandi

---

## 📞 Support

If you encounter issues:

1. **Check console errors:** Open DevTools (F12) → Console
2. **Verify localStorage:** DevTools → Application → localStorage → krishigati_farmer
3. **Check API calls:** Network tab → filter "mandis" → should return mandi list
4. **Check WebSocket:** Network tab → filter "socket.io" → should show connection
5. **Compare code:** Cross-check your files against the changes listed above

---

## ✨ What's Next?

After mandi selection is working:

1. **Optional: Multi-mandi dashboard for admins**
   - Admin sees all mandis in one view
   - Can manage all mandis from single interface

2. **Optional: Mandi switching without logout**
   - Add "Switch Mandi" button in pages
   - Quick toggle between mandis user has access to

3. **Optional: Mandi-specific analytics**
   - Queue times per mandi
   - Farmer satisfaction per mandi
   - Procurement efficiency per mandi

4. **Optional: Mandi capacity management**
   - Real-time capacity display
   - Notifications when capacity full
   - Redirect to nearby mandis

---

## 🎉 Success Indicators

You've successfully implemented mandi selection when:

✅ Mandi dropdown appears on login page
✅ Different users can select different mandis
✅ Selected mandi appears in localStorage
✅ Farmer page shows selected mandi
✅ Procurement page shows selected mandi only
✅ Real-time updates work per mandi
✅ No console errors or warnings
✅ All 7 language options work
✅ Mobile view is responsive

---

**Ready to deploy! 🚀**

Copy APP_NEW.tsx to App.tsx and start the app.
