# Registrar Reports - Testing Guide

**Date**: October 26, 2025
**Status**: ✅ Implementation Complete - Ready for Testing
**Controller**: `App\Http\Controllers\Registrar\ReportsController`

---

## ✅ Verification Status

**Routes Registered**:
- ✅ `POST registrar/reports/grade-report` → `generateGradeReport()`
- ✅ `POST registrar/reports/honor-statistics` → `generateHonorStatistics()`
- ✅ `POST registrar/reports/archive-records` → `archiveAcademicRecords()`
- ✅ `POST registrar/reports/class-section-report` → `generateClassSectionReport()`

**Controller Methods**:
- ✅ All 4 report methods present
- ✅ 658 lines of code
- ✅ Comprehensive `[REGISTRAR]` logging
- ✅ No syntax errors

---

## 🚀 Quick Test (5 minutes)

### Start Server & Monitor Logs
```bash
# Terminal 1: Start server
composer dev

# Terminal 2: Watch Registrar logs
tail -f storage/logs/laravel.log | grep "\[REGISTRAR\]"
```

### Test Grade Report
1. **Navigate**: `http://127.0.0.1:8000/registrar/reports`
2. **Login**: As Registrar user
3. **Click**: "Grade Reports" tab
4. **Fill Form**:
   - Academic Level: All Levels
   - Grading Period: All Periods
   - School Year: 2025-2026
   - Format: PDF
   - ✅ Include statistical analysis
5. **Click**: "Generate Grade Report"

**Expected Result**:
- ✅ PDF downloads: `grade_report_2025-2026_YYYY-MM-DD.pdf`
- ✅ Browser console: No errors
- ✅ Logs show:
  ```
  [REGISTRAR] === GRADE REPORT REQUEST RECEIVED ===
  [REGISTRAR] Raw request data: {...}
  [REGISTRAR] Validation passed - Generating grade report
  [REGISTRAR] Found X grade records
  [REGISTRAR] Generating pdf format with filename: grade_report_2025-2026_...
  ```

---

## 📋 Comprehensive Testing

### Test 1: Grade Report - PDF with Statistics ✅

**Steps**:
1. Login as Registrar
2. Navigate to `/registrar/reports`
3. Click "Grade Reports" tab
4. Fill form:
   - Academic Level: `All Levels`
   - Grading Period: `All Periods`
   - School Year: `2025-2026`
   - Format: `PDF`
   - ✅ Include statistical analysis
5. Click "Generate Grade Report"

**Expected**:
- ✅ PDF downloads successfully
- ✅ PDF contains grade data
- ✅ PDF includes statistics section
- ✅ Filename: `grade_report_2025-2026_YYYY-MM-DD.pdf`

**Logs to Verify**:
```
[REGISTRAR] === GRADE REPORT REQUEST RECEIVED ===
[REGISTRAR] Validation passed - Generating grade report
[REGISTRAR] Found X grade records
```

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 2: Grade Report - Excel without Statistics ✅

**Steps**:
1. Same as Test 1, but:
   - Format: `Excel Spreadsheet`
   - ❌ Include statistical analysis (unchecked)

**Expected**:
- ✅ Excel file downloads
- ✅ Filename: `grade_report_2025-2026_YYYY-MM-DD.xlsx`
- ✅ Excel contains grade data in structured format

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 3: Grade Report - CSV Format ✅

**Steps**:
1. Same as Test 1, but:
   - Format: `CSV Export`

**Expected**:
- ✅ CSV file downloads
- ✅ Filename: `grade_report_2025-2026_YYYY-MM-DD.csv`
- ✅ CSV contains grade data

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 4: Grade Report - Specific Academic Level ✅

**Steps**:
1. Fill form:
   - Academic Level: `Elementary` (or any specific level)
   - Grading Period: `All Periods`
   - School Year: `2025-2026`
   - Format: `PDF`

**Expected**:
- ✅ PDF contains ONLY grades for selected academic level
- ✅ Logs show filter applied:
  ```
  [REGISTRAR] Applied academic level filter: {...}
  ```

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 5: Grade Report - Specific Grading Period ✅

**Steps**:
1. Fill form:
   - Academic Level: `All Levels`
   - Grading Period: `First Semester Midterm` (or any specific period)
   - School Year: `2025-2026`
   - Format: `PDF`

**Expected**:
- ✅ PDF contains ONLY grades for selected grading period
- ✅ Logs show filter applied

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 6: Honor Statistics - PDF ✅

**Steps**:
1. Click "Honor Statistics" tab
2. Fill form:
   - Academic Level: `All Levels`
   - School Year: `2025-2026`
   - Honor Type: `All Types`
   - Format: `PDF`
3. Click "Generate Honor Statistics"

**Expected**:
- ✅ PDF downloads: `honor_statistics_2025-2026_YYYY-MM-DD.pdf`
- ✅ PDF contains honor data
- ✅ Logs show `[REGISTRAR]` prefix

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 7: Honor Statistics - Excel ✅

**Steps**:
1. Same as Test 6, but Format: `Excel Spreadsheet`

**Expected**:
- ✅ Excel file downloads
- ✅ Contains honor data

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 8: Archive Records - Excel ✅

**Steps**:
1. Click "Archiving" tab
2. Fill form:
   - Academic Level: `Elementary`
   - School Year: `2025-2026`
   - ✅ Include Grades
   - ✅ Include Honors
   - ✅ Include Certificates
   - Format: `Excel Spreadsheet`
3. Click "Create Archive"

**Expected**:
- ✅ Excel file downloads: `academic_records_elementary_2025-2026_YYYY-MM-DD.xlsx`
- ✅ Excel has multiple sheets (Grades, Honors, Certificates)
- ✅ Logs show:
  ```
  [REGISTRAR] === ARCHIVE ACADEMIC RECORDS REQUEST RECEIVED ===
  [REGISTRAR] Included X grades
  [REGISTRAR] Included X honors
  [REGISTRAR] Included X certificates
  ```

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 9: Class Section Report - PDF ✅

**Steps**:
1. Click "Class Section Reports" tab
2. Fill form:
   - Academic Level: `College`
   - School Year: `2025-2026`
   - Section: `All Sections`
   - Format: `PDF Report`
3. Click "Generate Class Section Report"

**Expected**:
- ✅ PDF downloads: `class_section_report_college_2025-2026_YYYY-MM-DD.pdf`
- ✅ PDF contains section rosters
- ✅ Logs show `[REGISTRAR]` prefix

**Result**: PASS / FAIL
**Notes**: _______________________________

---

## ⚠️ Error Handling Tests

### Test 10: Missing Required Field - School Year ❌

**Steps**:
1. Click "Grade Reports" tab
2. Leave School Year blank
3. Click "Generate Grade Report"

**Expected**:
- ✅ Validation error: "Please select a school year."
- ✅ Alert appears
- ✅ Form does NOT submit

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 11: Invalid Academic Level ID ❌

**Steps**:
1. Use browser dev tools to change academic_level_id to "99999"
2. Submit form

**Expected**:
- ✅ Error: "Invalid academic level selected."
- ✅ Logs show:
  ```
  [REGISTRAR] Invalid academic level ID: 99999
  ```

**Result**: PASS / FAIL
**Notes**: _______________________________

---

### Test 12: No Data Found ❌

**Steps**:
1. Select a school year with no data (e.g., "1999-2000")
2. Generate report

**Expected**:
- ✅ Report generates (may be empty)
- ✅ Logs show: `[REGISTRAR] Found 0 grade records`

**Result**: PASS / FAIL
**Notes**: _______________________________

---

## 📊 Log Monitoring

### View Registrar Logs Only
```bash
tail -f storage/logs/laravel.log | grep "\[REGISTRAR\]"
```

### View Grade Report Logs
```bash
grep "\[REGISTRAR\].*GRADE REPORT" storage/logs/laravel.log | tail -50
```

### View All Report Types
```bash
grep -E "\[REGISTRAR\].*(GRADE REPORT|HONOR STATISTICS|ARCHIVE|CLASS SECTION)" storage/logs/laravel.log | tail -100
```

### Clear Logs Before Testing
```bash
> storage/logs/laravel.log
```

---

## 📈 Expected Log Flow

### Successful Grade Report:
```
[2025-10-26 14:55:00] [REGISTRAR] === GRADE REPORT REQUEST RECEIVED ===
[2025-10-26 14:55:00] [REGISTRAR] Raw request data: {
    "academic_level_id": "all",
    "grading_period_id": "all",
    "school_year": "2025-2026",
    "format": "pdf",
    "include_statistics": "1"
}
[2025-10-26 14:55:00] [REGISTRAR] Validation passed - Generating grade report
[2025-10-26 14:55:01] [REGISTRAR] Found 50 grade records
[2025-10-26 14:55:01] [REGISTRAR] Generating pdf format with filename: grade_report_2025-2026_2025-10-26
[2025-10-26 14:55:02] [REGISTRAR] Starting PDF generation for grade report
[2025-10-26 14:55:02] [REGISTRAR] HTML generated successfully
[2025-10-26 14:55:03] [REGISTRAR] PDF options set, generating output
```

### Failed Request:
```
[2025-10-26 14:56:00] [REGISTRAR] === GRADE REPORT REQUEST RECEIVED ===
[2025-10-26 14:56:00] [REGISTRAR] Raw request data: {...}
[2025-10-26 14:56:00] [REGISTRAR] Grade report generation failed: [error message]
[2025-10-26 14:56:00] [REGISTRAR] Stack trace: [full trace]
```

---

## ✅ Success Criteria

### Functionality (All Should Work)
- [ ] Grade Reports - PDF format
- [ ] Grade Reports - Excel format
- [ ] Grade Reports - CSV format
- [ ] Honor Statistics - All formats
- [ ] Archive Records - Excel/CSV
- [ ] Class Section Reports - All formats
- [ ] All filters work correctly
- [ ] Include statistics checkbox works

### Logging (All Should Show)
- [ ] `[REGISTRAR]` prefix on all log entries
- [ ] Request data logged
- [ ] Validation results logged
- [ ] Query results logged (count)
- [ ] File generation logged
- [ ] Errors logged with stack traces

### Error Handling (All Should Work)
- [ ] Missing required fields caught
- [ ] Invalid IDs rejected
- [ ] Empty results handled gracefully
- [ ] User sees friendly error messages

---

## 🐛 Troubleshooting

### Issue: PDF Not Downloading

**Check**:
1. Browser console for JavaScript errors
2. Laravel logs for PDF generation errors:
   ```bash
   grep "\[REGISTRAR\].*PDF" storage/logs/laravel.log | tail -20
   ```
3. Verify view exists: `resources/views/reports/grade-report.blade.php`
4. Check DomPDF package: `composer show barryvdh/laravel-dompdf`

**Common Causes**:
- View file missing or has syntax errors
- DomPDF not installed
- Memory limit exceeded (large datasets)

---

### Issue: Excel/CSV Not Downloading

**Check**:
1. Maatwebsite/Excel package installed
2. Export class exists: `app/Exports/GradeReportExport.php`
3. Laravel logs:
   ```bash
   grep "\[REGISTRAR\].*Excel\|CSV" storage/logs/laravel.log | tail -20
   ```

**Common Causes**:
- Export class missing
- Package not installed
- Memory limit exceeded

---

### Issue: No Logs Appearing

**Check**:
1. Log level in `.env`: `LOG_LEVEL=debug`
2. File permissions: `chmod -R 777 storage/logs`
3. Route being hit:
   ```bash
   grep "registrar/reports" storage/logs/laravel.log | tail -10
   ```

**Common Causes**:
- Log level too high (set to `error` instead of `debug`)
- Permission issues
- Wrong route being called

---

### Issue: Validation Errors

**Check**:
1. Required fields filled in frontend
2. Data types match (string vs integer)
3. Browser console:
   ```javascript
   console.log('Form data:', formData);
   ```

**Common Causes**:
- Frontend not sending required fields
- Data type mismatch
- CSRF token missing

---

## 📝 Testing Checklist Summary

**Total Tests**: 12
**Required to Pass**: All 12 (100%)

- [ ] Test 1: Grade Report - PDF with Statistics
- [ ] Test 2: Grade Report - Excel without Statistics
- [ ] Test 3: Grade Report - CSV Format
- [ ] Test 4: Grade Report - Specific Academic Level
- [ ] Test 5: Grade Report - Specific Grading Period
- [ ] Test 6: Honor Statistics - PDF
- [ ] Test 7: Honor Statistics - Excel
- [ ] Test 8: Archive Records - Excel
- [ ] Test 9: Class Section Report - PDF
- [ ] Test 10: Error - Missing School Year
- [ ] Test 11: Error - Invalid Academic Level
- [ ] Test 12: Error - No Data Found

---

## 🎯 Final Verification

After completing all tests:

```bash
# Run verification script
php verify_class_section_reports.php

# Check logs for any errors
grep "\[REGISTRAR\].*ERROR" storage/logs/laravel.log

# Verify all report types worked
grep "\[REGISTRAR\].*Generating" storage/logs/laravel.log | wc -l
# Should see at least 9 successful generations
```

---

## 📞 Support

If issues persist:
1. Check `CLASS_SECTION_REPORTS_FIX_SUMMARY.md` for technical details
2. Review logs with `[REGISTRAR]` filter
3. Verify database has test data
4. Check all dependencies are installed

---

**Last Updated**: October 26, 2025
**Status**: Ready for Manual Testing
**Controller**: Fully Implemented (658 lines)
**Logging**: Comprehensive ([REGISTRAR] prefix on all entries)
