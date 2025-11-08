# CSV Download Fix - Testing Guide

## Issue Fixed
**Problem:** CSV template download was returning HTML/error content instead of proper CSV data when department/course/section or track/strand/section were pre-selected.

**Root Cause:** Missing variables in closure's `use` clause on line 1653 of `RegistrarUserManagementController.php`

**Fix Applied:** Updated line 1653 to include all required variables:
```php
// BEFORE (Missing variables):
$callback = function () use ($columns, $academicLevel, $sectionId) {

// AFTER (All variables included):
$callback = function () use ($columns, $academicLevel, $sectionId, $specificYearLevel, $trackId, $strandId, $departmentId, $courseId) {
```

---

## Manual Testing Instructions

### Test 1: College CSV Template (Simplified Format)

**Steps:**
1. Login as Registrar user
2. Navigate to: **Registrar → Students → College**
3. Click **"CSV Upload Manager"** button
4. In the upload modal:
   - Select **Department**: Any department (e.g., "Computer Science")
   - Select **Year Level**: Any year (e.g., "Fourth Year")
   - Select **Course**: Any course (e.g., "BS Computer Science")
   - Select **Section**: Any section (e.g., "4A")
5. Click **"Download Template"** button
6. Open the downloaded CSV file

**Expected Result:**
```csv
name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship
Ana Rodriguez,ana.rodriguez@example.com,password123,CO-2025-000004,2005-12-25,female,09123456794,321 Elm Street Barangay 4,Carlos Rodriguez,09123456795,father
```

**What to Check:**
- ✅ File should be a valid CSV (not HTML error page)
- ✅ Header row has **11 columns** (simplified format)
- ✅ Data row has **11 columns** (matches header)
- ✅ Columns are properly aligned (no shifted data)
- ✅ NO columns for: academic_level, specific_year_level, department_name, course_name, section_name

**❌ FAILURE Signs:**
- File contains `<!DOCTYPE html>` or HTML tags
- File contains error messages like "Undefined variable"
- Data row has more/fewer columns than header
- College level appears in student_number column

---

### Test 2: Senior High School CSV Template (Simplified Format)

**Steps:**
1. Login as Registrar user
2. Navigate to: **Registrar → Students → Senior High School**
3. Click **"CSV Upload Manager"** button
4. In the upload modal:
   - Select **Track**: Any track (e.g., "Academic Track")
   - Select **Year Level**: Any year (e.g., "Grade 11")
   - Select **Strand**: Any strand (e.g., "STEM")
   - Select **Section**: Any section (e.g., "11-STEM-A")
5. Click **"Download Template"** button
6. Open the downloaded CSV file

**Expected Result:**
```csv
name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship
Pedro Garcia,pedro.garcia@example.com,password123,SHS-2025-000003,2008-03-10,male,09123456792,789 Pine Road Barangay 3,Ana Garcia,09123456793,mother
```

**What to Check:**
- ✅ File should be a valid CSV (not HTML error page)
- ✅ Header row has **11 columns** (simplified format)
- ✅ Data row has **11 columns** (matches header)
- ✅ Columns are properly aligned
- ✅ NO columns for: academic_level, specific_year_level, academic_strand, track, section_name

**❌ FAILURE Signs:**
- File contains HTML content
- File contains PHP errors
- Data is misaligned
- SHS level appears in wrong column

---

### Test 3: College CSV Template (Old Format - Backward Compatibility)

**Steps:**
1. Login as Registrar user
2. Navigate directly to URL (or use interface without pre-selecting):
   ```
   /registrar/students/template/csv?academic_level=college
   ```
   (Note: NO department_id, course_id, or section_id parameters)
3. Download the CSV file
4. Open the downloaded CSV file

**Expected Result:**
```csv
name,email,password,academic_level,specific_year_level,department_name,course_name,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship
Ana Rodriguez,ana.rodriguez@example.com,password123,college,first_year,[Department Name],[Course Name],[Section Name],CO-2025-000004,2005-12-25,female,09123456794,321 Elm Street Barangay 4,Carlos Rodriguez,09123456795,father
```

**What to Check:**
- ✅ Header row has **16 columns** (old format)
- ✅ Data row has **16 columns** (matches header)
- ✅ Includes: academic_level, specific_year_level, department_name, course_name, section_name

---

### Test 4: Direct URL Test (The Original Error Case)

**Steps:**
1. Login as Registrar user
2. Navigate directly to:
   ```
   /registrar/students/template/csv?academic_level=college&specific_year_level=fourth_year&department_id=1&course_id=2&section_id=1
   ```
3. File should download automatically
4. Open the downloaded file

**Expected Result:**
- ✅ Valid CSV file with 11 columns (simplified format)
- ✅ NO HTML content
- ✅ NO error messages

**This was the FAILING case in your screenshot - it should now work!**

---

## Verification Checklist

After testing, verify:

- [ ] College CSV with pre-selections: Works, 11 columns, valid CSV
- [ ] SHS CSV with pre-selections: Works, 11 columns, valid CSV
- [ ] College CSV without pre-selections: Works, 16 columns, valid CSV
- [ ] Direct URL test: Works, no HTML errors
- [ ] CSV files open correctly in Excel/LibreOffice
- [ ] No "Undefined variable" errors in Laravel logs
- [ ] Data columns align with headers

---

## Troubleshooting

**If you still see HTML/errors:**
1. Check Laravel logs: `storage/logs/laravel.log`
2. Look for "Undefined variable" errors
3. Verify the fix was applied on line 1653
4. Clear Laravel cache: `php artisan optimize:clear`

**If columns are misaligned:**
1. Count columns in header row
2. Count columns in data row
3. They should match (either 11 or 16)

---

## Technical Details

**Files Modified:**
- `/app/Http/Controllers/Registrar/RegistrarUserManagementController.php` (Line 1653)

**Change Summary:**
Added missing variables to closure scope: `$specificYearLevel`, `$trackId`, `$strandId`, `$departmentId`, `$courseId`

**Why This Fixes the Issue:**
The callback function checks these variables (e.g., `if ($departmentId && $courseId && $sectionId)`) to determine which CSV format to generate. Without them in scope, PHP threw "Undefined variable" errors, which Laravel caught and returned as HTML error pages instead of CSV data.
