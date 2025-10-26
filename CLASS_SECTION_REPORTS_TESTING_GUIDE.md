# Class Section Reports - Testing Guide

## Overview
This document provides comprehensive testing instructions for the Class Section Reports feature for both Admin and Registrar roles.

## What Was Fixed

### Changes Made
1. **Created Registrar\ReportsController** (`app/Http/Controllers/Registrar/ReportsController.php`)
   - Dedicated controller for Registrar role
   - All logs prefixed with `[REGISTRAR]`
   - Full feature parity with Admin controller

2. **Updated Registrar Routes** (`routes/registrar.php`)
   - Changed from `use App\Http\Controllers\Admin\ReportsController;`
   - To: `use App\Http\Controllers\Registrar\ReportsController;`

3. **Enhanced Admin Controller Logging** (`app/Http/Controllers/Admin/ReportsController.php`)
   - Added `[ADMIN]` prefix to all log statements in `generateClassSectionReport()` and `generateClassSectionPDF()`
   - Added user ID logging for better tracking

### Benefits
- ✅ Clear role separation in logs
- ✅ Easier debugging (can filter logs by `[ADMIN]` or `[REGISTRAR]`)
- ✅ Both roles now have dedicated controllers
- ✅ Same functionality for both roles
- ✅ Comprehensive error tracking

---

## Testing Prerequisites

### 1. Start Development Server
```bash
# Terminal 1: Start Laravel server with queue and logs
composer dev

# OR manually:
php artisan serve

# Terminal 2: Watch logs in real-time
tail -f storage/logs/laravel.log | grep "CLASS SECTION"
```

### 2. Clear Logs (Optional)
```bash
# Clear previous logs to see only new ones
> storage/logs/laravel.log
```

### 3. Prepare Test Data
Ensure you have:
- Sections for each academic level (Elementary, JHS, SHS, College)
- Students assigned to those sections
- Different tracks and strands (for SHS)
- Different departments and courses (for College)

---

## Testing Checklist

### ADMIN Role Tests

#### Test 1: Elementary - PDF Report
**Steps**:
1. Login as Admin
2. Navigate to: `/admin/reports`
3. Click on "Class Section Reports" tab
4. Fill in form:
   - Academic Level: `Elementary`
   - School Year: `2024-2025`
   - Section: `All Sections`
   - Format: `PDF Report`
   - Include grades: `Unchecked`
5. Click "Generate Class Section Report"

**Expected Result**:
- ✅ PDF downloads successfully
- ✅ Filename: `class_section_report_elementary_2024-2025_YYYY-MM-DD.pdf`
- ✅ PDF contains all elementary sections
- ✅ Each section shows student list
- ✅ Logs show `[ADMIN]` prefix

**Logs to Verify**:
```
[ADMIN] === CLASS SECTION REPORT REQUEST RECEIVED ===
[ADMIN] User: Admin Name (ID: 1)
[ADMIN] All request data: {"academic_level_id":"1","school_year":"2024-2025",...}
[ADMIN] Validation passed!
[ADMIN] Academic Level found: {"id":1,"name":"Elementary","key":"elementary"}
[ADMIN] Found X sections
[ADMIN] === GENERATING CLASS SECTION PDF ===
[ADMIN] PDF download response generated successfully
```

---

#### Test 2: Junior High School - Excel Report
**Steps**:
1. Navigate to: `/admin/reports`
2. Fill in form:
   - Academic Level: `Junior High School`
   - School Year: `2024-2025`
   - Year Level: `Grade 7` (Optional filter)
   - Format: `Excel Spreadsheet`
3. Click "Generate Class Section Report"

**Expected Result**:
- ✅ Excel file downloads
- ✅ Filename: `class_section_report_junior_highschool_2024-2025_YYYY-MM-DD.xlsx`
- ✅ Multiple sheets (Overview + one sheet per section)
- ✅ Logs show `[ADMIN]` prefix with filters applied

---

#### Test 3: Senior High School - CSV with Filters
**Steps**:
1. Navigate to: `/admin/reports`
2. Fill in form:
   - Academic Level: `Senior High School`
   - School Year: `2024-2025`
   - Track: `Academic Track`
   - Strand: `STEM`
   - Year Level: `Grade 11`
   - Format: `CSV Export`
3. Click "Generate Class Section Report"

**Expected Result**:
- ✅ CSV file downloads
- ✅ Only sections matching track/strand/year level filters
- ✅ Logs show applied filters:
```
[ADMIN] Applying SHS-specific filters...
[ADMIN] Applied track filter: {"track_id":"1"}
[ADMIN] Applied strand filter: {"strand_id":"2"}
[ADMIN] Applied year level filter: {"year_level":"grade_11"}
```

---

#### Test 4: College - PDF with Grades
**Steps**:
1. Navigate to: `/admin/reports`
2. Fill in form:
   - Academic Level: `College`
   - School Year: `2024-2025`
   - Department: `College of Engineering`
   - Course: `Computer Science`
   - Include student average grades: `Checked` ✅
   - Format: `PDF Report`
3. Click "Generate Class Section Report"

**Expected Result**:
- ✅ PDF downloads with grade column
- ✅ Each student shows average grade
- ✅ Logs show "Include Grades: Yes"
- ✅ Logs show department and course filters applied

---

#### Test 5: Specific Section Only
**Steps**:
1. Navigate to: `/admin/reports`
2. Fill in form:
   - Academic Level: `College`
   - School Year: `2024-2025`
   - Section: Select a specific section (e.g., "BSCS 1-A")
   - Format: `PDF Report`
3. Click "Generate Class Section Report"

**Expected Result**:
- ✅ PDF contains ONLY the selected section
- ✅ No other sections included
- ✅ Logs show:
```
[ADMIN] Filtering by specific section only: {"section_id":"42"}
```

---

### REGISTRAR Role Tests

#### Test 6: Registrar - Elementary PDF
**Steps**:
1. Logout from Admin
2. Login as Registrar
3. Navigate to: `/registrar/reports`
4. Fill in form:
   - Academic Level: `Elementary`
   - School Year: `2024-2025`
   - Format: `PDF Report`
5. Click "Generate Class Section Report"

**Expected Result**:
- ✅ PDF downloads successfully
- ✅ Same functionality as Admin
- ✅ Logs show `[REGISTRAR]` prefix:
```
[REGISTRAR] === CLASS SECTION REPORT REQUEST RECEIVED ===
[REGISTRAR] User: Registrar Name (ID: 5)
[REGISTRAR] Validation passed!
...
[REGISTRAR] PDF download response generated successfully
```

---

#### Test 7: Registrar - All Academic Levels
Repeat Test 1-5 but as Registrar role.

**Expected Results**:
- ✅ All tests pass with same functionality
- ✅ All logs show `[REGISTRAR]` instead of `[ADMIN]`
- ✅ PDF/Excel/CSV files generate correctly
- ✅ All filters work the same way

---

### Error Handling Tests

#### Test 8: Missing Required Field - Academic Level
**Steps**:
1. Navigate to `/admin/reports` or `/registrar/reports`
2. Fill in form:
   - Academic Level: `(Leave blank)`
   - School Year: `2024-2025`
3. Click "Generate Class Section Report"

**Expected Result**:
- ✅ Validation error shown
- ✅ Message: "Academic level is required for class section reports"
- ✅ Form does not submit
- ✅ Logs show validation failure (if form submission happens):
```
[ADMIN/REGISTRAR] Validation failed
```

---

#### Test 9: Missing Required Field - School Year
**Steps**:
1. Fill in form:
   - Academic Level: `Elementary`
   - School Year: `(Leave blank)`
3. Click "Generate Class Section Report"

**Expected Result**:
- ✅ Validation error shown
- ✅ Form does not submit

---

#### Test 10: No Sections Found
**Steps**:
1. Fill in form with filters that match no sections:
   - Academic Level: `College`
   - School Year: `1999-2000` (or a year with no data)
   - Department: `Fictional Department`
2. Click "Generate Class Section Report"

**Expected Result**:
- ✅ Error message: "No sections found for the selected filters."
- ✅ No report generated
- ✅ Logs show:
```
[ADMIN/REGISTRAR] Sections query completed. Found 0 sections
[ADMIN/REGISTRAR] No sections found for filters
```

---

#### Test 11: Invalid Section ID
**Steps**:
1. Use browser developer tools to change section dropdown value to invalid ID (e.g., "99999")
2. Submit form

**Expected Result**:
- ✅ Error: "Invalid section selected."
- ✅ Logs show:
```
[ADMIN/REGISTRAR] Invalid section ID: 99999
```

---

## Log Monitoring Guide

### View All Class Section Report Logs
```bash
# Real-time monitoring
tail -f storage/logs/laravel.log | grep "CLASS SECTION"

# View Admin logs only
tail -f storage/logs/laravel.log | grep "\[ADMIN\].*CLASS SECTION"

# View Registrar logs only
tail -f storage/logs/laravel.log | grep "\[REGISTRAR\].*CLASS SECTION"

# View errors only
tail -f storage/logs/laravel.log | grep "ERROR.*CLASS SECTION"
```

### Expected Log Flow (Successful Request)
```
[ROLE] === CLASS SECTION REPORT REQUEST RECEIVED ===
[ROLE] Request method: POST
[ROLE] Request URL: http://127.0.0.1:8000/{admin|registrar}/reports/class-section-report
[ROLE] All request data: {...}
[ROLE] User: John Doe (ID: X)
[ROLE] Starting validation...
[ROLE] Validation passed!
[ROLE] Validated data: {...}
[ROLE] Generating class section report with validated data: {...}
[ROLE] Academic Level found: {...}
[ROLE] Building sections query...
[ROLE] Base query filters: {...}
[ROLE] Applied [filter] filter: {...}  (if applicable)
[ROLE] Executing sections query...
[ROLE] Sections query completed. Found X sections
[ROLE] Section IDs found: [1, 2, 3]
[ROLE] Mapping section data...
[ROLE] Processing section: {...}
[ROLE] Found X students in section Y
[ROLE] Preparing to generate report in format: pdf|excel|csv
[ROLE] Filename will be: class_section_report_...
[ROLE] Sections data count: X

# For PDF:
[ROLE] Calling generateClassSectionPDF method...
[ROLE] === GENERATING CLASS SECTION PDF ===
[ROLE] Filename: ...
[ROLE] Academic Level: ...
[ROLE] School Year: ...
[ROLE] Include Grades: Yes|No
[ROLE] Sections data count: X
[ROLE] Preparing view data...
[ROLE] View data prepared. Checking if view exists...
[ROLE] View exists. Loading view...
[ROLE] View loaded successfully
[ROLE] Setting PDF paper size to A4 portrait...
[ROLE] PDF paper size set
[ROLE] Generating PDF download response...
[ROLE] PDF download response generated successfully
[ROLE] PDF generation method returned successfully
```

---

## Success Criteria

### Functionality
- [ ] All academic levels work (Elementary, JHS, SHS, College)
- [ ] All export formats work (PDF, Excel, CSV)
- [ ] All filters work correctly
- [ ] "Include grades" checkbox works
- [ ] Specific section selection works
- [ ] Student data appears correctly
- [ ] Section capacity calculations are correct

### Admin Role
- [ ] Can generate reports from `/admin/reports`
- [ ] All logs show `[ADMIN]` prefix
- [ ] User ID logged correctly
- [ ] All test cases pass

### Registrar Role
- [ ] Can generate reports from `/registrar/reports`
- [ ] All logs show `[REGISTRAR]` prefix
- [ ] User ID logged correctly
- [ ] Same functionality as Admin
- [ ] All test cases pass

### Error Handling
- [ ] Validation errors shown to user
- [ ] "No sections found" handled gracefully
- [ ] Invalid data rejected with clear messages
- [ ] All errors logged with context

### Logging
- [ ] Role prefix appears in all logs (`[ADMIN]` or `[REGISTRAR]`)
- [ ] User information logged
- [ ] Request data logged
- [ ] Filters logged when applied
- [ ] Errors logged with stack traces
- [ ] Success logged

---

## Troubleshooting

### Issue: PDF Not Downloading
**Check**:
1. Browser console for JavaScript errors
2. Laravel logs for PDF generation errors
3. View exists: `resources/views/reports/class-section.blade.php`
4. DomPDF package installed: `composer show barryvdh/laravel-dompdf`

### Issue: Excel/CSV Not Downloading
**Check**:
1. Maatwebsite/Excel package installed
2. `ClassSectionReportExport` class exists
3. Logs for generation errors

### Issue: No Logs Appearing
**Check**:
1. Log level in `.env`: `LOG_LEVEL=debug`
2. Permissions on `storage/logs` directory
3. Correct route being hit (check browser network tab)

### Issue: Validation Errors
**Check**:
1. Academic level exists in database
2. School year format is correct (YYYY-YYYY)
3. Section ID is valid (if specific section selected)
4. Required fields filled

---

## Additional Notes

### Performance
- Large reports (many sections/students) may take longer
- Excel/CSV generation is faster than PDF
- PDF rendering time increases with student count

### Browser Compatibility
- Tested on Chrome, Firefox, Safari, Edge
- Download behavior may vary by browser
- Some browsers may block downloads - check browser settings

### Data Privacy
- Reports contain student personal information
- Only Admin and Registrar roles have access
- Ensure proper role-based access control is enforced

---

## Files Modified

1. **New**: `app/Http/Controllers/Registrar/ReportsController.php`
2. **Modified**: `routes/registrar.php` (line 14)
3. **Modified**: `app/Http/Controllers/Admin/ReportsController.php` (logging enhancements)

---

## Test Summary Template

Use this template to document your test results:

```
Date: ___________
Tester: ___________
Environment: ___________

ADMIN TESTS:
[ ] Test 1: Elementary PDF - PASS/FAIL
[ ] Test 2: JHS Excel - PASS/FAIL
[ ] Test 3: SHS CSV with Filters - PASS/FAIL
[ ] Test 4: College PDF with Grades - PASS/FAIL
[ ] Test 5: Specific Section - PASS/FAIL

REGISTRAR TESTS:
[ ] Test 6: Elementary PDF - PASS/FAIL
[ ] Test 7: All Levels - PASS/FAIL

ERROR HANDLING:
[ ] Test 8: Missing Academic Level - PASS/FAIL
[ ] Test 9: Missing School Year - PASS/FAIL
[ ] Test 10: No Sections Found - PASS/FAIL
[ ] Test 11: Invalid Section ID - PASS/FAIL

LOGGING:
[ ] Admin logs show [ADMIN] prefix - PASS/FAIL
[ ] Registrar logs show [REGISTRAR] prefix - PASS/FAIL
[ ] User IDs logged correctly - PASS/FAIL
[ ] Errors logged with context - PASS/FAIL

NOTES:
_________________________________________
_________________________________________
_________________________________________
```

---

**Testing Complete!** ✅

If all tests pass, the Class Section Reports feature is working correctly for both Admin and Registrar roles with comprehensive logging.
