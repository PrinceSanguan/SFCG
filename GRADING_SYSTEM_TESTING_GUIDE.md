# Grading System Implementation - Testing Guide

## Overview
This guide covers testing the new college (1.0-5.0) and Senior High School (75-100) grading systems.

---

## 🎯 What Was Changed

### College (Instructors) - 1.0-5.0 Scale
- **Valid Grades**: 1.1-3.5 (0.1 increments) or 5.0
- **Percentage Equivalents**:
  - 1.1 = 97-98% (Excellent)
  - 1.5 = 90% (Superior)
  - 2.0 = 85% (Good)
  - 3.0 = 75% (Fair - Passing)
  - 5.0 = Below 70% (Failing)
- **Real-time Feedback**: Forms show percentage and quality as you type

### Senior High School (Teachers) - 75-100 Scale
- **Valid Grades**: 75-100 (percentage)
- **Honor Thresholds**:
  - 98-100 = With Highest Honors
  - 95-97 = With High Honors
  - 90-94 = With Honors
  - 85+ = All grades must be 85 or above for honors

---

## 📋 Testing Checklist

### Phase 1: Backend Validation Testing

#### Test 1: College Grade Entry (Instructor)
**Location**: Instructor > Grades > Create New Grade

**Test Cases**:
```
✅ Valid Grades to Test:
- 1.1 (Should accept - 97-98%)
- 1.5 (Should accept - 90%)
- 2.0 (Should accept - 85%)
- 2.5 (Should accept - 80%)
- 3.0 (Should accept - 75%)
- 3.5 (Should accept - 70%)
- 5.0 (Should accept - Failing)

❌ Invalid Grades to Test:
- 1.0 (Should REJECT - not in valid range)
- 1.45 (Should REJECT - not 0.1 increment)
- 1.15 (Should REJECT - not 0.1 increment)
- 3.6 (Should REJECT - outside range)
- 4.0 (Should REJECT - not valid)
- 4.5 (Should REJECT - not valid)
```

**Expected Behavior**:
1. Valid grades save successfully
2. Invalid grades show validation error
3. Real-time feedback shows percentage and quality
4. Browser console shows: `[COLLEGE_GRADE_CREATE]` logs

**Check Laravel Logs** (`storage/logs/laravel.log`):
```
Look for:
[COLLEGE_GRADE_CREATE] Grade validation passed
[COLLEGE_GRADE_CREATE] Valid college grade
```

#### Test 2: SHS Grade Entry (Teacher)
**Location**: Teacher > Grades > Create New Grade

**Test Cases**:
```
✅ Valid Grades to Test:
- 75 (Should accept - Passing)
- 85 (Should accept - Good)
- 90 (Should accept - Honors threshold)
- 95 (Should accept - High Honors threshold)
- 98 (Should accept - Highest Honors threshold)
- 100 (Should accept - Perfect)

❌ Invalid Grades to Test:
- 74 (Should REJECT - below passing)
- 101 (Should REJECT - above maximum)
- 0 (Should REJECT - invalid)
```

**Expected Behavior**:
1. Valid grades save successfully
2. Invalid grades show validation error
3. Browser console shows: `[SHS_GRADE_INPUT]` logs

**Check Laravel Logs**:
```
Look for:
[SHS_GRADE_VALIDATION] Applied Senior High School grade validation (75-100 scale)
[SHS_GRADE_CREATE] Grade created successfully
```

---

### Phase 2: CSV Upload Testing

#### Test 3: College CSV Upload (Instructor)
**Location**: Instructor > Grades > Upload CSV

**Steps**:
1. Download the template (Multi-Subject or Subject-Specific)
2. Fill in grades using college scale (1.1-3.5 or 5.0)
3. Upload the CSV

**Sample CSV Content**:
```csv
Student ID,Student Name,Subject Code,Grade,Grading Period,Notes
CO-2024-001,John Doe,DBMS01,1.5,COL_S1_M,Good performance
CO-2024-002,Jane Smith,DBMS01,2.0,COL_S1_M,Satisfactory
CO-2024-003,Bob Johnson,DBMS01,3.0,COL_S1_M,Passing
```

**Expected Behavior**:
1. Valid grades upload successfully
2. Invalid grades show row-specific errors
3. Success message shows grades created

**Check Laravel Logs**:
```
Look for:
[COLLEGE_CSV_GRADE_VALIDATION] Valid college grade from CSV
[COLLEGE_CSV_VALIDATION] Grade validation passed for row X
```

#### Test 4: SHS CSV Upload (Teacher)
**Location**: Teacher > Grades > Upload CSV

**Steps**:
1. Download the template
2. Fill in grades using 75-100 scale
3. Upload the CSV

**Sample CSV Content**:
```csv
Student ID,Student Name,Grade,Notes
SHS-2024-001,John Doe,92,Good performance
SHS-2024-002,Jane Smith,85,Satisfactory
SHS-2024-003,Bob Johnson,98,Excellent
```

**Expected Behavior**:
1. Valid grades upload successfully
2. Invalid grades (e.g., 74 or 101) show errors

**Check Laravel Logs**:
```
Look for:
[SHS_CSV_GRADE_VALIDATION] Valid SHS grade from CSV
[SHS_CSV_VALIDATION] Processing row X
```

---

### Phase 3: Honor Calculation Testing

#### Test 5: College Honor Calculation
**Location**: Admin > Honors > Calculate Honors > College

**Test Data Setup**:
Create test students with these GPAs:
- Student A: GPA 2.0 or below → Should qualify for Cum Laude
- Student B: GPA 1.75 or below → Should qualify for Magna Cum Laude
- Student C: GPA 1.5 or below → Should qualify for Summa Cum Laude
- Student D: GPA above 2.0 → Should not qualify

**Expected Behavior**:
1. Correct honor type assigned based on GPA
2. Percentage equivalents logged in Laravel logs

**Check Laravel Logs**:
```
Look for:
[COLLEGE_HONOR_CALC] GPA Calculation Complete
[COLLEGE_HONOR_CALC] ✅ STUDENT QUALIFIED FOR HONOR
Check that gpa_percentage and gpa_quality are shown
```

#### Test 6: SHS Honor Calculation
**Location**: Admin > Honors > Calculate Honors > Senior High School

**Test Data Setup**:
Create test students with these averages:
- Student A: Average 92 → Should qualify for With Honors (90-94)
- Student B: Average 96 → Should qualify for With High Honors (95-97)
- Student C: Average 99 → Should qualify for With Highest Honors (98-100)
- Student D: Average 84 → Should not qualify (but check min_grade_all=85 rule)

**Expected Behavior**:
1. Correct honor level assigned based on period average
2. All individual grades must be 85+ for honors

**Check Laravel Logs**:
```
Look for:
[SHS_HONOR_CALC] === PERIOD AVERAGE CALCULATED ===
[SHS_HONOR_CALC] ✅ STUDENT QUALIFIED FOR HONOR
Check honor_level and honor_range values
```

---

### Phase 4: Frontend UI Testing

#### Test 7: Real-time Grade Feedback (College)
**Location**: Instructor > Grades > Create/Edit Grade

**Steps**:
1. Start typing a grade (e.g., "1.5")
2. Observe the blue feedback box appear
3. Check it shows: "90% - Superior"

**Test Different Grades**:
- Type 1.1 → Should show "97-98% - Excellent"
- Type 2.0 → Should show "85% - Good"
- Type 3.0 → Should show "75% - Fair"
- Type 4.0 → Should show "Invalid grade (use 1.1-3.5 or 5.0)" in red

**Check Browser Console**:
```javascript
Look for:
[GRADE_INPUT] Grade changed: { grade: 1.5, percentage: "90%", quality: "Superior" }
[GRADE_EDIT] Grade changed: { ... }
```

#### Test 8: CSV Upload Instructions
**Location**: Instructor/Teacher > Grades > Upload CSV

**Verify Instructor Page Shows**:
- "Valid grades: 1.1-3.5 (0.1 increments) or 5.0"
- Detailed breakdown with percentages and quality descriptions
- Grade System alert shows college scale details

**Verify Teacher Page Shows**:
- "Senior High School uses 75-100 percentage scale"
- Sample grades: 75, 80, 85, 90, 92, 95, 98, 100
- Honor thresholds: 90-94, 95-97, 98-100

---

### Phase 5: Database Verification

#### Test 9: Verify Honor Criteria in Database
**Run this SQL**:
```sql
-- Check SHS Honor Criteria
SELECT
    ht.name as honor_type,
    hc.min_gpa,
    hc.max_gpa,
    hc.min_grade_all,
    hc.additional_rules
FROM honor_criteria hc
JOIN honor_types ht ON hc.honor_type_id = ht.id
JOIN academic_levels al ON hc.academic_level_id = al.id
WHERE al.key = 'senior_highschool'
ORDER BY hc.min_gpa DESC;

-- Expected Results:
-- With Highest Honors: min_gpa=98.00, max_gpa=100.00, min_grade_all=85
-- With High Honors: min_gpa=95.00, max_gpa=97.99, min_grade_all=85
-- With Honors: min_gpa=90.00, max_gpa=94.99, min_grade_all=85
```

```sql
-- Check College Honor Criteria
SELECT
    ht.name as honor_type,
    hc.min_gpa,
    hc.max_gpa,
    hc.min_grade_all,
    hc.additional_rules
FROM honor_criteria hc
JOIN honor_types ht ON hc.honor_type_id = ht.id
JOIN academic_levels al ON hc.academic_level_id = al.id
WHERE al.key = 'college'
ORDER BY hc.max_gpa ASC;

-- Expected Results:
-- Summa Cum Laude: max_gpa=1.5, min_grade_all=1.75
-- Magna Cum Laude: max_gpa=1.75, min_grade_all=2.0
-- Cum Laude: max_gpa=2.0
```

#### Test 10: Verify Grades Stored Correctly
**Run this SQL**:
```sql
-- Check recent college grades
SELECT
    sg.id,
    s.name as student_name,
    sub.name as subject_name,
    sg.grade,
    sg.created_at
FROM student_grades sg
JOIN students s ON sg.student_id = s.id
JOIN subjects sub ON sg.subject_id = sub.id
JOIN academic_levels al ON sg.academic_level_id = al.id
WHERE al.key = 'college'
ORDER BY sg.created_at DESC
LIMIT 10;

-- Verify grades are in valid range (1.1-3.5 or 5.0)
```

```sql
-- Check recent SHS grades
SELECT
    sg.id,
    s.name as student_name,
    sub.name as subject_name,
    sg.grade,
    sg.created_at
FROM student_grades sg
JOIN students s ON sg.student_id = s.id
JOIN subjects sub ON sg.subject_id = sub.id
JOIN academic_levels al ON sg.academic_level_id = al.id
WHERE al.key = 'senior_highschool'
ORDER BY sg.created_at DESC
LIMIT 10;

-- Verify grades are in valid range (75-100)
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid grade" error for valid college grade
**Cause**: Grade not in 0.1 increments (e.g., 1.15 instead of 1.2)
**Solution**: Use only: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, etc.

### Issue 2: CSV upload fails silently
**Check Laravel Logs**: Look for validation errors per row
**Common Causes**:
- Missing required columns
- Invalid grade values
- Subject code doesn't exist
- Student ID not found

### Issue 3: Real-time feedback not showing
**Check**:
1. Browser console for JavaScript errors
2. Grade input is for college level (not elementary/SHS on instructor side)
3. Clear browser cache and reload

### Issue 4: Honor calculation doesn't assign correct honor
**Check**:
1. Run the database verification SQL above
2. Check Laravel logs for honor calculation details
3. Verify honor_criteria table has correct thresholds
4. Re-run seeder: `php artisan db:seed --class=HonorCriteriaSeeder`

---

## 📊 Success Criteria

### ✅ All Tests Pass When:

**Backend**:
- [ ] Valid college grades (1.1-3.5, 5.0) save successfully
- [ ] Invalid college grades (1.0, 4.0, etc.) are rejected
- [ ] Valid SHS grades (75-100) save successfully
- [ ] Invalid SHS grades (<75, >100) are rejected
- [ ] CSV uploads work for both college and SHS
- [ ] Honor calculations assign correct honor levels

**Frontend**:
- [ ] Real-time feedback shows on college grade entry
- [ ] Percentage and quality descriptions display correctly
- [ ] SHS forms use 75-100 scale (not 1.0-5.0)
- [ ] CSV upload instructions are accurate
- [ ] No console errors in browser

**Database**:
- [ ] honor_criteria table has correct thresholds
- [ ] Grades stored match input values
- [ ] Honor results have correct honor_type_id

**Logs**:
- [ ] Laravel logs show validation messages
- [ ] Browser console shows frontend logging
- [ ] No unexpected errors in logs

---

## 🚀 Quick Test Script

Run this to quickly test basic functionality:

```bash
# 1. Check database seeder ran correctly
php artisan tinker
>>> \DB::table('honor_criteria')->where('academic_level_id', 3)->get(['min_gpa', 'max_gpa', 'min_grade_all']);
# Should show SHS criteria with 90, 95, 98 thresholds

# 2. Test college grade validation
>>> $validator = \Illuminate\Support\Facades\Validator::make(
    ['grade' => 1.5, 'academic_level_key' => 'college'],
    ['grade' => 'required|numeric']
);
# Should pass

>>> $validator = \Illuminate\Support\Facades\Validator::make(
    ['grade' => 1.0, 'academic_level_key' => 'college'],
    ['grade' => 'required|numeric']
);
# Should pass Laravel validation but fail in controller logic

# 3. Check recent grades
>>> \App\Models\StudentGrade::with('academicLevel')->latest()->take(5)->get(['grade', 'academic_level_id', 'created_at']);

# 4. Tail logs while testing
tail -f storage/logs/laravel.log | grep -E "\[COLLEGE_GRADE|\[SHS_GRADE|\[HONOR_CALC\]"
```

---

## 📝 Test Report Template

After testing, fill this out:

```
# Grading System Test Report
Date: ___________
Tester: ___________

## Backend Tests
[ ] College grade validation: PASS / FAIL
[ ] SHS grade validation: PASS / FAIL
[ ] College CSV upload: PASS / FAIL
[ ] SHS CSV upload: PASS / FAIL
[ ] College honor calculation: PASS / FAIL
[ ] SHS honor calculation: PASS / FAIL

## Frontend Tests
[ ] Real-time feedback (college): PASS / FAIL
[ ] SHS forms use 75-100: PASS / FAIL
[ ] CSV upload instructions: PASS / FAIL

## Issues Found:
1. _____________________
2. _____________________

## Notes:
_____________________
_____________________
```

---

## 📞 Need Help?

If you encounter issues:
1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Check browser console for frontend errors
3. Verify database with SQL queries above
4. Re-run seeder if honor criteria is wrong: `php artisan db:seed --class=HonorCriteriaSeeder`
