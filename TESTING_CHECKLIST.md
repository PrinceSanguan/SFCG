# Class Section Reports - Testing Checklist

**Date**: ___________
**Tester**: ___________
**Environment**: ___________

---

## ✅ PRE-TESTING SETUP

- [ ] Development server started (`composer dev`)
- [ ] Logs being monitored (`tail -f storage/logs/laravel.log | grep "CLASS SECTION"`)
- [ ] Browser opened and ready
- [ ] Admin credentials ready
- [ ] Registrar credentials ready

---

## 🔧 VERIFICATION (Run Once)

```bash
php verify_class_section_reports.php
```

- [ ] All 8 tests passed
- [ ] No errors reported

---

## 👨‍💼 ADMIN ROLE TESTING

### Test 1: Elementary PDF
- [ ] Navigate to: `http://127.0.0.1:8000/admin/reports`
- [ ] Click "Class Section Reports" tab
- [ ] Select: Elementary, 2024-2025, PDF Report
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: PDF downloads successfully
- [ ] **Logs**: Show `[ADMIN]` prefix
- [ ] **Logs**: Show user ID

**Notes**: _________________________________

---

### Test 2: Junior High School Excel
- [ ] Select: Junior High School, 2024-2025, Excel
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: Excel file downloads
- [ ] **Logs**: Show `[ADMIN]` prefix
- [ ] **Excel**: Has multiple sheets (Overview + sections)

**Notes**: _________________________________

---

### Test 3: Senior High School CSV (with filters)
- [ ] Select: Senior High School, 2024-2025
- [ ] Select Track: (choose one)
- [ ] Select Strand: (choose one)
- [ ] Format: CSV Export
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: CSV file downloads
- [ ] **Logs**: Show filters applied
- [ ] **CSV**: Contains only filtered sections

**Notes**: _________________________________

---

### Test 4: College PDF (with grades)
- [ ] Select: College, 2024-2025
- [ ] Select Department: (choose one)
- [ ] Check "Include student average grades" ✅
- [ ] Format: PDF Report
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: PDF downloads
- [ ] **PDF**: Shows grade column
- [ ] **Logs**: Show "Include Grades: Yes"

**Notes**: _________________________________

---

### Test 5: Specific Section
- [ ] Select: College, 2024-2025
- [ ] Section: Select a specific section (not "All")
- [ ] Format: PDF Report
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: PDF contains only selected section
- [ ] **Logs**: Show section ID filter

**Notes**: _________________________________

---

## 👩‍💼 REGISTRAR ROLE TESTING

### Test 6: Logout and Login as Registrar
- [ ] Logout from Admin
- [ ] Login as Registrar
- [ ] Navigate to: `http://127.0.0.1:8000/registrar/reports`

---

### Test 7: Elementary PDF
- [ ] Click "Class Section Reports" tab
- [ ] Select: Elementary, 2024-2025, PDF Report
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: PDF downloads successfully
- [ ] **Logs**: Show `[REGISTRAR]` prefix (NOT [ADMIN])
- [ ] **Logs**: Show registrar user ID

**Notes**: _________________________________

---

### Test 8: College Excel
- [ ] Select: College, 2024-2025, Excel Spreadsheet
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: Excel file downloads
- [ ] **Logs**: Show `[REGISTRAR]` prefix
- [ ] **Excel**: Has multiple sheets

**Notes**: _________________________________

---

### Test 9: All Other Levels (Quick Test)
- [ ] Junior High School - PDF: ✅ / ❌
- [ ] Senior High School - CSV: ✅ / ❌

**Notes**: _________________________________

---

## ⚠️ ERROR HANDLING TESTS

### Test 10: Missing Academic Level
- [ ] Leave Academic Level blank
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: Error message shown
- [ ] **Message**: "Academic level is required"

**Notes**: _________________________________

---

### Test 11: Missing School Year
- [ ] Select Academic Level but leave School Year blank
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: Error message shown

**Notes**: _________________________________

---

### Test 12: No Sections Found
- [ ] Select filters that match no sections
- [ ] Example: Use a very old school year (1999-2000)
- [ ] Click "Generate Class Section Report"
- [ ] **Result**: Error "No sections found for the selected filters"
- [ ] **Logs**: Show "Found 0 sections"

**Notes**: _________________________________

---

## 📊 LOG VERIFICATION

### Check Admin Logs
```bash
grep "\[ADMIN\]" storage/logs/laravel.log | tail -20
```

- [ ] Logs show `[ADMIN]` prefix
- [ ] Logs show user ID
- [ ] Logs show request data
- [ ] Logs show section count
- [ ] Logs show success/error messages

**Sample log found**: _________________________________

---

### Check Registrar Logs
```bash
grep "\[REGISTRAR\]" storage/logs/laravel.log | tail -20
```

- [ ] Logs show `[REGISTRAR]` prefix
- [ ] Logs show user ID
- [ ] Logs show request data
- [ ] Logs show section count
- [ ] Logs show success/error messages

**Sample log found**: _________________________________

---

## 📋 FINAL VERIFICATION

### Functionality
- [ ] All academic levels work
- [ ] All export formats work (PDF, Excel, CSV)
- [ ] All filters work correctly
- [ ] "Include grades" checkbox works
- [ ] Error messages are clear and helpful

### Role Separation
- [ ] Admin logs clearly marked with `[ADMIN]`
- [ ] Registrar logs clearly marked with `[REGISTRAR]`
- [ ] User IDs are logged correctly
- [ ] Both roles have identical functionality

### Documentation
- [ ] Testing guide was helpful
- [ ] Fix summary answered questions
- [ ] Verification script worked
- [ ] Log examples were accurate

---

## 🎯 TEST RESULTS SUMMARY

**Total Tests**: 12+
**Passed**: _____ / 12
**Failed**: _____ / 12
**Skipped**: _____ / 12

**Overall Status**: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## 💬 ISSUES ENCOUNTERED

**Issue 1**: _________________________________

**Resolution**: _________________________________

---

**Issue 2**: _________________________________

**Resolution**: _________________________________

---

**Issue 3**: _________________________________

**Resolution**: _________________________________

---

## ✅ FINAL SIGN-OFF

**Tested By**: ___________
**Date**: ___________
**Time Spent**: ___________
**Status**: ___________

**Ready for Production**: ✅ YES / ❌ NO

**Additional Notes**:
_________________________________
_________________________________
_________________________________
_________________________________

---

## 📞 SUPPORT

If issues were encountered:
1. Check: `CLASS_SECTION_REPORTS_TESTING_GUIDE.md`
2. Review: `CLASS_SECTION_REPORTS_FIX_SUMMARY.md`
3. Run: `php verify_class_section_reports.php`
4. Check logs: `tail -100 storage/logs/laravel.log`

---

**Checklist Version**: 1.0
**Last Updated**: October 26, 2025
