# CSV Upload Testing Instructions for Registrar

This guide provides step-by-step instructions for testing the CSV upload functionality for SHS (Senior High School) and College students on the registrar side.

## Overview

The registrar CSV upload functionality is **identical** to the admin side. Both support:
- Simplified CSV format (pre-selected track/strand/department/course)
- Automatic email notifications to new students
- Duplicate detection (both internal and database-level)
- Detailed error reporting with line numbers
- Activity logging

## Prerequisites

Before testing, ensure you have:
1. Registrar account credentials
2. Test CSV files located in `/test_data/` directory:
   - `test_shs_students.csv` - 5 SHS students
   - `test_college_students.csv` - 5 College students
3. Database has been seeded with:
   - Tracks and Strands (run `TrackStrandSeeder`)
   - Departments and Courses (run `StrandCourseDepartmentSeeder`)
   - Sections for SHS and College

## Test Data Overview

### SHS Test Students (5 students)

| Name | Email | Student Number | Year Level Suggestion |
|------|-------|----------------|----------------------|
| Maria Clara Santos | maria.santos2025@sfc.edu.ph | SHS-2025-001 | Grade 11 |
| Juan Miguel Reyes | juan.reyes2025@sfc.edu.ph | SHS-2025-002 | Grade 11 |
| Angela Marie Cruz | angela.cruz2025@sfc.edu.ph | SHS-2025-003 | Grade 12 |
| Rafael Antonio Gomez | rafael.gomez2025@sfc.edu.ph | SHS-2025-004 | Grade 12 |
| Sofia Gabriela Fernandez | sofia.fernandez2025@sfc.edu.ph | SHS-2025-005 | Grade 11 |

**Available SHS Tracks:**
- Academic Track (ACAD)
  - STEM - Science, Technology, Engineering, and Mathematics
  - ABM - Accountancy, Business, and Management
  - HUMSS - Humanities and Social Sciences
  - GAS - General Academic Strand
- TVL Track
  - ICT - Information and Communications Technology
  - HE - Home Economics
  - IA - Industrial Arts
  - AFA - Agri-Fishery Arts

### College Test Students (5 students)

| Name | Email | Student Number | Year Level Suggestion |
|------|-------|----------------|----------------------|
| Carlos Miguel Torres | carlos.torres2025@sfc.edu.ph | COL-2025-001 | 1st Year |
| Isabela Rose Mendoza | isabela.mendoza2025@sfc.edu.ph | COL-2025-002 | 2nd Year |
| Diego Lorenzo Rivera | diego.rivera2025@sfc.edu.ph | COL-2025-003 | 3rd Year |
| Valentina Sofia Ramos | valentina.ramos2025@sfc.edu.ph | COL-2025-004 | 1st Year |
| Gabriel Alexander Diaz | gabriel.diaz2025@sfc.edu.ph | COL-2025-005 | 2nd Year |

**Available College Departments:**
- Computer Department (COMP)
  - Computer Engineering Technology
  - Computer Engineering
  - Computer Science
- Mathematics Department (MATH)
- Science Department (SCI)
- English Department (ENG)
- Business Department (BUS)

## CSV File Format

### SHS Simplified Format
```csv
name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship
```

### College Simplified Format
```csv
name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship
```

**Note:** Track, Strand, Section (SHS) or Department, Course, Section (College) are pre-selected in the UI before upload.

## Testing Steps

### Test 1: Senior High School CSV Upload

1. **Login as Registrar**
   - Navigate to the registrar login page
   - Use your registrar credentials

2. **Navigate to SHS Students**
   - Go to: `/registrar/students/senior-highschool`
   - You should see the student list page

3. **Open CSV Upload Manager**
   - Look for "CSV Upload Manager" button
   - Click to open the modal

4. **Select SHS Parameters**
   - **Track:** Select "Academic Track"
   - **Strand:** Select "STEM" (or any available strand)
   - **Year Level:** Select "grade_11"
   - **Section:** Select any available Grade 11 section

5. **Download Template (Optional)**
   - Click "Download Template" button
   - Verify the CSV template has correct headers
   - Compare with `test_shs_students.csv`

6. **Upload CSV File**
   - Click "Upload CSV" button
   - Select `/test_data/test_shs_students.csv`
   - Click "Upload and Process"

7. **Verify Upload Results**
   - Check for success message
   - Should show "5 students created successfully"
   - Check for any errors (there should be none)

8. **Verify Students in Database**
   - Refresh the student list page
   - Search for uploaded students by name or student number
   - Verify all 5 students appear with correct:
     - Student Number
     - Email
     - Strand (STEM or selected strand)
     - Year Level (Grade 11 or selected level)
     - Section

9. **Check Email Notifications**
   - If email is configured, check that welcome emails were sent to:
     - maria.santos2025@sfc.edu.ph
     - juan.reyes2025@sfc.edu.ph
     - angela.cruz2025@sfc.edu.ph
     - rafael.gomez2025@sfc.edu.ph
     - sofia.fernandez2025@sfc.edu.ph

10. **Check Activity Logs**
    - Navigate to activity logs (if available)
    - Verify CSV upload activity was logged

### Test 2: College CSV Upload

1. **Navigate to College Students**
   - Go to: `/registrar/students/college`
   - You should see the college student list page

2. **Open CSV Upload Manager**
   - Click "CSV Upload Manager" button

3. **Select College Parameters**
   - **Department:** Select "Computer Department"
   - **Course:** Select "Computer Science" (or any available course)
   - **Year Level:** Select "first_year"
   - **Section:** Select any available 1st year section

4. **Download Template (Optional)**
   - Click "Download Template" button
   - Verify the CSV template has correct headers
   - Compare with `test_college_students.csv`

5. **Upload CSV File**
   - Click "Upload CSV" button
   - Select `/test_data/test_college_students.csv`
   - Click "Upload and Process"

6. **Verify Upload Results**
   - Check for success message
   - Should show "5 students created successfully"
   - Check for any errors (there should be none)

7. **Verify Students in Database**
   - Refresh the college student list page
   - Search for uploaded students
   - Verify all 5 students appear with correct:
     - Student Number
     - Email
     - Department (Computer Department or selected)
     - Course (Computer Science or selected)
     - Year Level (1st Year or selected level)
     - Section

8. **Check Email Notifications**
   - Verify welcome emails were sent to:
     - carlos.torres2025@sfc.edu.ph
     - isabela.mendoza2025@sfc.edu.ph
     - diego.rivera2025@sfc.edu.ph
     - valentina.ramos2025@sfc.edu.ph
     - gabriel.diaz2025@sfc.edu.ph

9. **Check Activity Logs**
   - Verify CSV upload activity was logged

### Test 3: Duplicate Detection Test

1. **Try to Upload Same CSV Again**
   - For SHS: Try uploading `test_shs_students.csv` again
   - For College: Try uploading `test_college_students.csv` again

2. **Expected Results**
   - Should show validation errors
   - Errors should mention "Email already exists" or "Student number already exists"
   - Should list the specific line numbers with conflicts
   - No students should be created (all or nothing approach)

### Test 4: Invalid Data Test

Create a test CSV with invalid data to test error handling:

**Example invalid SHS CSV:**
```csv
name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship
,invalidemail,short,SHS-TEST-001,invalid-date,invalid-gender,123,Address,Contact,456,relation
```

**Expected Results:**
- Should show validation errors for:
  - Missing name
  - Invalid email format
  - Password too short (min 8 characters)
  - Invalid birth date format
  - Invalid gender (must be: male, female, or other)

## Comparison: Admin vs Registrar

Both implementations should behave **identically**. Test both to verify:

### Admin Side Testing
1. Login as Admin
2. Go to `/admin/students/senior-highschool` or `/admin/students/college`
3. Follow the same upload steps
4. Results should be identical to registrar side

### What to Compare
- [ ] UI is identical (same modal, same fields)
- [ ] Template download produces same CSV format
- [ ] Upload validates same rules
- [ ] Success messages are similar
- [ ] Error messages are similar
- [ ] Email notifications sent for both
- [ ] Activity logging works for both
- [ ] Duplicate detection works the same

## Expected CSV Format After Template Download

When you click "Download Template", the file should contain:

**SHS Template:**
```csv
name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship
Pedro Garcia,pedro.garcia@example.com,password123,SHS-2025-000003,2008-03-10,male,09123456792,789 Pine Road Barangay 3,Ana Garcia,09123456793,mother
```

**College Template:**
```csv
name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship
Ana Rodriguez,ana.rodriguez@example.com,password123,CO-2025-000004,2005-12-25,female,09123456794,321 Elm Street Barangay 4,Carlos Rodriguez,09123456795,father
```

## Troubleshooting

### Issue: "No sections available"
**Solution:** Ensure sections exist for the selected year level. Run section seeders or create sections manually.

### Issue: "Track/Strand/Department/Course not found"
**Solution:** Run the database seeders:
```bash
php artisan db:seed --class=TrackStrandSeeder
php artisan db:seed --class=StrandCourseDepartmentSeeder
```

### Issue: "Email already exists" on first upload
**Solution:** The test emails might already exist in database. Either:
- Delete existing users with those emails
- Modify the test CSV to use different emails

### Issue: No email notifications sent
**Solution:** Check mail configuration in `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
```

### Issue: CSV file encoding errors
**Solution:** Ensure CSV is saved as UTF-8. Excel users: Save as "CSV UTF-8 (Comma delimited) (*.csv)"

## Validation Rules Reference

All fields validation:
- **name:** Required, max 255 characters
- **email:** Required, valid email format, unique, max 255 characters
- **password:** Required, minimum 8 characters
- **student_number:** Optional, max 40 characters, unique
- **birth_date:** Optional, valid date format (YYYY-MM-DD), must be before today
- **gender:** Optional, must be: male, female, or other (case-insensitive)
- **phone_number:** Optional, max 20 characters
- **address:** Optional, max 500 characters
- **emergency_contact_name:** Optional, max 255 characters
- **emergency_contact_phone:** Optional, max 20 characters
- **emergency_contact_relationship:** Optional, max 50 characters

## Success Criteria

The test is successful if:
- [ ] All 5 SHS students uploaded without errors
- [ ] All 5 College students uploaded without errors
- [ ] Students appear in respective student lists
- [ ] All student data is correct (name, email, student number, etc.)
- [ ] Strand/Department assignments are correct
- [ ] Year level assignments are correct
- [ ] Section assignments are correct
- [ ] Email notifications sent (if email configured)
- [ ] Activity logs show upload events
- [ ] Duplicate upload attempt is properly rejected
- [ ] Invalid data shows appropriate error messages
- [ ] Admin and Registrar sides behave identically

## Cleanup After Testing

To remove test students:
1. Navigate to the student list
2. Search for student numbers starting with "SHS-2025-" or "COL-2025-"
3. Delete the test students
4. Or use database query:
```sql
DELETE FROM users WHERE student_number IN ('SHS-2025-001', 'SHS-2025-002', 'SHS-2025-003', 'SHS-2025-004', 'SHS-2025-005', 'COL-2025-001', 'COL-2025-002', 'COL-2025-003', 'COL-2025-004', 'COL-2025-005');
```

## Notes

- The CSV upload uses a two-pass processing system:
  - Pass 1: Detects duplicates within the CSV file itself
  - Pass 2: Validates against database and creates users

- If ANY row has errors, NO students will be created (all-or-nothing approach)

- Password field in CSV will be hashed before storage

- Email notifications are queued and sent asynchronously

- The system automatically trims whitespace from CSV values

- UTF-8 BOM (Byte Order Mark) from Excel is automatically removed

## Questions or Issues?

If you encounter any issues during testing:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for JavaScript errors
3. Verify database seeders have been run
4. Ensure all required fields are selected before upload
5. Check CSV file encoding (should be UTF-8)
