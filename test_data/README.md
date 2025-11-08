# Test Data for CSV Upload Functionality

This directory contains test files for verifying the CSV upload functionality for student enrollment.

## Files in this Directory

### 1. `test_shs_students.csv`
- **Purpose:** Test CSV file for Senior High School student uploads
- **Student Count:** 5 students
- **Format:** Simplified CSV format (requires pre-selection of Track, Strand, Year Level, and Section)
- **Use Case:** Upload via Registrar or Admin SHS student management page

**Students Included:**
- Maria Clara Santos (SHS-2025-001)
- Juan Miguel Reyes (SHS-2025-002)
- Angela Marie Cruz (SHS-2025-003)
- Rafael Antonio Gomez (SHS-2025-004)
- Sofia Gabriela Fernandez (SHS-2025-005)

**Suggested Test Configuration:**
- Track: Academic Track
- Strand: STEM
- Year Level: Grade 11
- Section: Any available Grade 11 section

---

### 2. `test_college_students.csv`
- **Purpose:** Test CSV file for College student uploads
- **Student Count:** 5 students
- **Format:** Simplified CSV format (requires pre-selection of Department, Course, Year Level, and Section)
- **Use Case:** Upload via Registrar or Admin College student management page

**Students Included:**
- Carlos Miguel Torres (COL-2025-001)
- Isabela Rose Mendoza (COL-2025-002)
- Diego Lorenzo Rivera (COL-2025-003)
- Valentina Sofia Ramos (COL-2025-004)
- Gabriel Alexander Diaz (COL-2025-005)

**Suggested Test Configuration:**
- Department: Computer Department
- Course: Computer Science
- Year Level: 1st Year
- Section: Any available 1st year section

---

### 3. `CSV_UPLOAD_TEST_INSTRUCTIONS.md`
- **Purpose:** Comprehensive testing guide for CSV upload functionality
- **Content:** Step-by-step instructions, troubleshooting, validation rules, and success criteria

## How to Use

1. **Read the Instructions First**
   ```bash
   cat test_data/CSV_UPLOAD_TEST_INSTRUCTIONS.md
   ```

2. **Login as Registrar or Admin**
   - Ensure you have proper credentials

3. **Navigate to Student Management**
   - For SHS: `/registrar/students/senior-highschool` or `/admin/students/senior-highschool`
   - For College: `/registrar/students/college` or `/admin/students/college`

4. **Open CSV Upload Manager**
   - Click the "CSV Upload Manager" button

5. **Select Required Parameters**
   - Choose Track/Strand/Department/Course
   - Choose Year Level
   - Choose Section

6. **Upload CSV File**
   - Select `test_shs_students.csv` or `test_college_students.csv`
   - Click "Upload and Process"

7. **Verify Results**
   - Check for success message
   - Verify students appear in list
   - Check email notifications (if configured)

## Data Characteristics

### Realistic Filipino Data
All test data uses:
- **Filipino names:** Common Filipino first and last names
- **Local addresses:** Philippine street addresses with barangay names
- **Manila metro area:** Locations in Manila, Quezon City, Makati, and Pasig
- **Philippine phone numbers:** Format `09XXXXXXXXX`
- **School email format:** `firstname.lastname2025@sfc.edu.ph`
- **Student number format:** `SHS-2025-XXX` or `COL-2025-XXX`

### Personal Information Included
- Birth dates (2005-2008 range, age-appropriate for SHS/College)
- Gender (male/female)
- Phone numbers
- Complete addresses with barangay
- Emergency contact details

### Security Notes
- All passwords in test files: `Password123!`
- These are **test accounts only** - never use in production
- Remember to delete test students after testing

## Database Requirements

Before testing, ensure these seeders have been run:

```bash
php artisan db:seed --class=TrackStrandSeeder
php artisan db:seed --class=StrandCourseDepartmentSeeder
```

Required database records:
- ✓ Tracks (Academic Track, TVL Track, etc.)
- ✓ Strands (STEM, ABM, HUMSS, GAS, ICT, etc.)
- ✓ Departments (Computer, Mathematics, Science, English, Business)
- ✓ Courses (Computer Science, Engineering, etc.)
- ✓ Sections for SHS and College year levels

## Testing Scenarios

### Positive Tests
1. ✓ Upload valid SHS students
2. ✓ Upload valid College students
3. ✓ Verify email notifications
4. ✓ Check activity logging

### Negative Tests
1. ✓ Upload duplicate students (should fail)
2. ✓ Upload with invalid email format
3. ✓ Upload with missing required fields
4. ✓ Upload with invalid date formats

### Comparison Tests
1. ✓ Compare Admin vs Registrar upload behavior
2. ✓ Verify both produce identical results
3. ✓ Check both have same validation rules

## Cleanup

After testing, remove test students:

```sql
DELETE FROM users
WHERE student_number IN (
    'SHS-2025-001', 'SHS-2025-002', 'SHS-2025-003', 'SHS-2025-004', 'SHS-2025-005',
    'COL-2025-001', 'COL-2025-002', 'COL-2025-003', 'COL-2025-004', 'COL-2025-005'
);
```

Or delete via UI by searching for student numbers and manually removing.

## Support

For issues or questions:
1. Check `CSV_UPLOAD_TEST_INSTRUCTIONS.md` for detailed troubleshooting
2. Review Laravel logs: `storage/logs/laravel.log`
3. Verify database seeders ran successfully
4. Ensure CSV files are UTF-8 encoded

## File Structure

```
test_data/
├── README.md                           # This file
├── CSV_UPLOAD_TEST_INSTRUCTIONS.md     # Comprehensive testing guide
├── test_shs_students.csv               # 5 SHS test students
└── test_college_students.csv           # 5 College test students
```

---

**Last Updated:** 2025-11-08
**Test Data Version:** 1.0
**Compatible With:** Registrar and Admin CSV upload features
