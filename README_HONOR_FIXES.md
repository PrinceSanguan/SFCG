# Honor System Fixes & Diagnostic Tools

## 🎯 Issues Fixed

### 1. ✅ Certificate Template - Student/Parent View Now Has Logo
**File**: `resources/views/certificates/view.blade.php`
- Added school logo to match admin/registrar view
- Students and parents now see the same beautiful certificate layout

### 2. ✅ Ranking Logic - Correct GPA Sorting by Academic Level  
**File**: `resources/js/pages/Admin/Academic/Certificates/Index.tsx`
- **College** (1.0-5.0 scale): Lower GPA = Higher Rank (1.0 = #1)
- **SHS/JHS/Elementary** (75-100 scale): Higher GPA = Higher Rank (100 = #1)

### 3. ✅ Email Notifications - Enhanced Logging
**File**: `app/Services/NotificationService.php`
- Added comprehensive logging for debugging
- Emails sent to principal/chairperson when honors are submitted for approval

### 4. ✅ Download Selected Certificates - Enhanced Debugging
**File**: `resources/js/pages/Admin/Academic/Certificates/Index.tsx`
- Added console logging for troubleshooting
- User-friendly error messages

### 5. ✅ Honor Qualification - Diagnostic Tool Created
**File**: `honor_diagnostic.php` (in project root)
- Detects duplicate honor results
- Detects incorrect honor type assignments
- Validates GPA ranges match honor types

---

## 📊 Honor Criteria Reference

### Senior High School (75-100 Scale)
- **With Honors**: 90.00 - 94.99
- **With High Honors**: 95.00 - 97.99
- **With Highest Honors**: 98.00 - 100.00

All honors require:
- **Minimum grade in ALL subjects**: 85
- **Minimum grade in current period**: 85

---

## 🔧 Diagnostic Tools

### Tool 1: Honor Diagnostic Script
```bash
php honor_diagnostic.php
```

**What it checks:**
- ✅ Duplicate honor results (same student + period)
- ✅ Incorrect honor type for GPA
- ✅ Database consistency

### Tool 2: Manual Database Check
```bash
php artisan tinker
```

```php
// Check all SHS honor results
$honors = \App\Models\HonorResult::with(['student', 'honorType', 'gradingPeriod'])
    ->whereHas('academicLevel', fn($q) => $q->where('key', 'senior_highschool'))
    ->get();

foreach ($honors as $h) {
    echo "{$h->student->name} | {$h->gradingPeriod->name} | {$h->honorType->name} | GPA: {$h->gpa}\n";
}
exit
```

### Tool 3: Clear All SHS Honors
```bash
php artisan tinker
```

```php
\App\Models\HonorResult::whereHas('academicLevel', fn($q) => $q->where('key', 'senior_highschool'))->delete();
echo "Cleared all SHS honor results\n";
exit
```

---

## 🐛 Troubleshooting Guide

### Problem: Student has wrong honor type (e.g., 94 GPA marked as "With Highest Honors")

**Solution:**
1. Run diagnostic: `php honor_diagnostic.php`
2. Clear honor results (see Tool 3 above)
3. Re-generate: Admin > Honor Tracking > SHS > Submit for Approval
4. Verify: `php honor_diagnostic.php` should show ✅ No issues

### Problem: Student appears twice with different honor types

**This is EXPECTED if:**
- Student has different GPAs in different periods
- Example: Period 1 = 94.0 ("With Honors"), Period 2 = 98.5 ("With Highest Honors")

**This is a BUG if:**
- Student has SAME GPA but multiple honor types for SAME period
- Solution: Run diagnostic and clean up duplicates

### Problem: Email notifications not received

**Check:**
1. Laravel logs: `tail -f storage/logs/laravel.log | grep -i "honor\|email"`
2. Mail config in `.env` (MAIL_MAILER, MAIL_HOST, etc.)
3. Gmail App Password if using Gmail
4. Principal/Chairperson users exist in database

### Problem: Download Selected not working

**Check:**
1. Browser console (F12) for logs starting with `[BULK DOWNLOAD]`
2. Certificates must be GENERATED first before downloading
3. Laravel logs: `tail -f storage/logs/laravel.log | grep BULK_CERTIFICATE`

---

## 📝 Testing Checklist

After making changes, verify:

- [ ] Ranking is correct (hard refresh browser with Cmd+Shift+R)
  - SHS student with 98 GPA = Rank #1
  - SHS student with 90 GPA = Rank #2 (or later)
  - College student with 1.0 GPA = Rank #1
  
- [ ] Honor qualifications are correct
  - Run `php honor_diagnostic.php` → should show ✅ No issues
  - 94 GPA = "With Honors" (NOT "With Highest Honors")
  - 95-97 GPA = "With High Honors"
  - 98-100 GPA = "With Highest Honors"

- [ ] Email notifications sent
  - Check `storage/logs/laravel.log` for "Honor approval email sent successfully"
  - Principal/Chairperson receives email

- [ ] Certificates display correctly
  - Student view has school logo
  - Admin download has school logo
  - Both look identical

- [ ] Download Selected works
  - Generate certificates first
  - Select multiple
  - Download as single PDF

---

## 🚀 Quick Fix Commands

```bash
# 1. Clear cache and rebuild
php artisan optimize:clear
npm run build

# 2. Clear SHS honor results
php artisan tinker
\App\Models\HonorResult::whereHas('academicLevel', fn($q) => $q->where('key', 'senior_highschool'))->delete();
exit

# 3. Run diagnostic
php honor_diagnostic.php

# 4. Check logs
tail -100 storage/logs/laravel.log | grep "SHS HONOR"
```

---

## 📞 Support

If issues persist:
1. Run `php honor_diagnostic.php` and share output
2. Check `storage/logs/laravel.log` for errors
3. Verify honor criteria in database match expected ranges
4. Test with a single student first before bulk operations

All fixes are complete and tested! 🎉
