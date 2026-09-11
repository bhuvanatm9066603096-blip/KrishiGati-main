# 🧪 KrishiGati Quick Test Guide

## ✅ Verify Everything is Working

### Step 1: Application Running ✅
Terminal shows:
```
✓ KrishiGati Engine active on port 5000
✓ VITE v7.3.6 ready in 1522 ms
✓ Local: http://localhost:5173/
```

---

## 🎯 Test 1: Basic Page Load (2 min)

### Actions:
1. Open: http://localhost:5173
2. Wait for page to load (should see login form)
3. Look for:
   - [ ] Language dropdown (top of form)
   - [ ] "Farmer" button
   - [ ] "Procurement" button
   - [ ] KrishiGati logo/header

### ✅ Success Indicators:
- Page loads within 3 seconds
- No red errors in browser console (F12)
- All buttons visible
- No 404 errors

---

## 🌍 Test 2: Multi-Language (3 min)

### Actions:
1. Click **Language dropdown**
2. Select **हिंदी (Hindi)**
3. Verify:
   - [ ] "किसान" appears (Farmer button)
   - [ ] "खरीद कर्मचारी" appears (Procurement button)
   - [ ] All text is in Hindi

4. Change to **తెలుగు (Telugu)**
5. Verify all text updates to Telugu

6. Change to **English** (back to English)

### ✅ Success Indicators:
- UI updates immediately when language changes
- No page reload needed
- All strings translate correctly
- No text remains in English when other language selected

---

## 🏪 Test 3: Mandi Selection (5 min)

### Actions:
**Tab A - Farmer:**
1. Language: **English**
2. Click **Farmer**
3. Enter:
   - Name: `Test Farmer A`
   - Phone: `9876543210`
   - Aadhaar: `123456789012`
   - Pan: `ABCDE1234F`
4. Mandi dropdown appears
5. Select: **Bangalore Mandi** (or any)
6. Click **Continue**
7. Allow location permission
8. Note the displayed mandi name

**Tab B - Same Farmer, Different Mandi:**
1. Open: http://localhost:5173 (in new tab)
2. Language: **English**
3. Click **Farmer**
4. Same credentials as Tab A
5. Mandi dropdown appears
6. Select: **Chennai Mandi** (different from Tab A)
7. Click **Continue**
8. Allow location
9. Note the displayed mandi name

### ✅ Success Indicators:
- Tab A shows: Bangalore Mandi
- Tab B shows: Chennai Mandi
- Both stay logged in independently
- Real-time updates only affect same mandi
- Each has separate token/booking

---

## 📍 Test 4: Farmer Location Tracking (3 min)

### Actions:
1. Login as Farmer
2. On FarmerPage, look for location indicator
3. Should see:
   - [ ] "Allow location" prompt
   - [ ] GPS coordinates displayed
   - [ ] "Last updated" timestamp
   - [ ] Map showing location

4. Click location button again
5. Verify coordinates update

### ✅ Success Indicators:
- Location permission prompt appears
- GPS coordinates shown (format: 12.9716, 77.5946)
- Location sent with booking

---

## 🎫 Test 5: Farmer Booking (5 min)

### Actions:
1. Login as **Farmer** 
2. Mandi: **Bangalore Mandi**
3. On FarmerPage:
   - [ ] See "Token Dashboard"
   - [ ] See "Token Status" (if any active)
   - [ ] See crop options
   - [ ] See quantity field

4. Select Crop: **Rice**
5. Enter Quantity: **500** kg
6. Click **Book Slot**
7. Verify:
   - [ ] Token number generated
   - [ ] Status shows "Gate Entry"
   - [ ] Procurement receipt displayed
   - [ ] Location included in receipt

### ✅ Success Indicators:
- Token appears with unique ID
- Status progresses through: Gate Entry → Quality Check → IoT Weighing → Payment
- Farmer name, phone, location in receipt
- No errors in console

---

## 👔 Test 6: Procurement Real-Time Updates (8 min)

### Setup:
- **Tab A:** Farmer logged in, ready to book
- **Tab B:** Procurement staff, same mandi

### Actions:

**Tab B - Procurement:**
1. Language: **English**
2. Click **Procurement**
3. Employee ID: `PROC-KA-001`
4. Mandi: **Bangalore Mandi**
5. Click **Login**
6. Wait for page to load
7. Should show:
   - [ ] "Incoming Bookings" list (empty)
   - [ ] Farmer map display area
   - [ ] Crowd management section

**Tab A - Farmer Books:**
1. Select Crop: **Wheat**
2. Quantity: **300** kg
3. Click **Book Slot**
4. Token appears

**Tab B - Procurement:**
1. **IMMEDIATELY** new booking appears in "Incoming Bookings"
2. Booking shows:
   - [ ] Token number
   - [ ] Farmer name
   - [ ] Phone number
   - [ ] Crop & quantity
   - [ ] Timestamp

### ✅ Success Indicators:
- Booking appears in Procurement within 1-2 seconds
- No page refresh needed
- Shows real farmer details from Tab A
- Console shows WebSocket message received

---

## 📞 Test 7: Procurement Features (5 min)

### Actions:
1. In Procurement page, click on a booking
2. Farmer details appear on right side:
   - [ ] Name & phone
   - [ ] Crop & quantity
   - [ ] GPS location (if farmer shared)
   - [ ] Booking time

3. Click **Call Farmer** button
4. Verify: Phone app opens (or tel: link triggers)

5. Click **Send SMS** button
6. Verify: SMS app opens (or sms: link triggers)

7. Set **Crowd Level**: "Medium"
8. Add note: "Queue moving fast"
9. Click **Update Crowd**
10. Verify: Broadcast sent to all farmers with same mandi

### ✅ Success Indicators:
- Details load correctly
- Call/SMS buttons functional
- Crowd update succeeds
- No errors in console

---

## 👥 Test 8: Crowd Management & Broadcast (5 min)

### Setup:
- **Tab A:** Procurement staff logged in
- **Tab B:** Farmer logged in (same mandi)

### Actions:

**Tab A - Procurement:**
1. In Crowd Management section
2. Set Level: **High**
3. Add Note: `"Crowd is high, expected delay"`
4. Click **Update Crowd Status**

**Tab B - Farmer:**
1. Should see notification (if implemented)
2. Or manually check farmer dashboard
3. Crowd status should update to "High"

### ✅ Success Indicators:
- Crowd update sent successfully
- Farmers in same mandi see update
- Status persists on page refresh
- No errors in backend logs

---

## 🗺️ Test 9: Mandi Isolation (5 min)

### Actions:

**Tab A - Bangalore Mandi:**
1. Farmer 1: Book at Bangalore Mandi

**Tab B - Chennai Mandi:**
1. Farmer 2: Book at Chennai Mandi
2. Procurement Chennai: Monitor bookings

**Tab C - Bangalore Procurement:**
1. Should see: Bangalore booking
2. Should NOT see: Chennai booking

**Tab D - Chennai Procurement:**
1. Should see: Chennai booking
2. Should NOT see: Bangalore booking

### ✅ Success Indicators:
- Each mandi isolated
- No cross-mandi data leakage
- Procurement sees only their mandi
- WebSocket rooms properly segmented

---

## 🔄 Test 10: Multi-Language in Live App (3 min)

### Actions:
1. Login as Farmer
2. On FarmerPage, click language dropdown (if visible)
3. Change to **मराठी (Marathi)**
4. Verify all labels update:
   - [ ] "बुक वेळ" (Book Slot)
   - [ ] "फसल" (Crop)
   - [ ] "बंद" (Logout)

5. Change to **Tamil**
6. Verify UI in Tamil
7. Logout
8. Language preference persists on reload (test by refresh F5)

### ✅ Success Indicators:
- All UI strings translate
- Language switch instant
- Preference saved
- No page reload needed
- All 7 languages functional

---

## 🛠️ Troubleshooting During Tests

### Issue: Page blank
**Fix:** 
- F5 refresh
- Ctrl+Shift+Delete (clear cache)
- Check console (F12 → Console tab)

### Issue: Mandi dropdown empty
**Fix:**
- Check console for API errors
- Verify backend running (terminal shows "active on port 5000")
- Reload page

### Issue: Location not working
**Fix:**
- Check browser privacy settings
- Allow location permission
- Try in incognito/private mode

### Issue: Real-time not working
**Fix:**
- Check Network tab → WS (WebSocket)
- Verify both users same mandi
- Check backend socket events in terminal

### Issue: Language not changing
**Fix:**
- Clear localStorage (F12 → Application → Storage → Clear)
- Refresh page
- Try different language

---

## 📊 Test Summary Checklist

Print this section and check off as you complete:

```
[ ] Page loads without errors
[ ] Language selector works (7 languages)
[ ] Mandi selector appears at login
[ ] Farmer booking works
[ ] Procurement receives real-time updates
[ ] Farmer location sent & displayed
[ ] Crowd management works
[ ] Call/SMS buttons functional
[ ] Mandi isolation working
[ ] Multi-language on live page
[ ] No console errors
[ ] Backend logs show events
```

---

## 🎯 Expected Results

### All Tests Pass = ✅
```
✅ Multi-language: WORKING
✅ Mandi selection: WORKING
✅ Farmer booking: WORKING
✅ Real-time updates: WORKING
✅ Location tracking: WORKING
✅ Procurement features: WORKING
✅ Mandi isolation: WORKING
✅ No errors: CLEAN CONSOLE
```

### Ready for Production = ✅
- All features tested
- No TypeScript errors
- No console errors
- All 7 languages verified
- Multi-mandi isolation verified
- Real-time communication verified

---

## 🚀 Next Steps After Testing

1. ✅ If all tests pass → Application ready for deployment
2. 📸 Take screenshots for documentation
3. 📝 Document any issues found
4. 🔧 Report findings to development team
5. 🎉 Celebrate the successful implementation!

---

## 📞 Quick Access Links

```
Frontend:     http://localhost:5173
Backend API:  http://localhost:5000
Network IP:   Check terminal output
Test Guide:   APPLICATION_RUNNING.md
```

**Good luck with testing! 🌾✅**
