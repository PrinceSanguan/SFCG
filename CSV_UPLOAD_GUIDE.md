# CSV Upload Guide for Student Management

## Overview

The system now supports CSV upload functionality for adding students at different academic levels (Elementary, Junior High School, and College). Each level has its own specific form and CSV upload section with appropriate fields.

## Features

### 🎯 Level-Specific CSV Upload
- **Elementary Students**: Simple form with grade levels (1-6)
- **Junior High Students**: Includes academic strands (STEM, ABM, etc.)
- **College Students**: Includes college courses and semesters

### 📁 CSV Template Download
- Download pre-formatted CSV templates for each level
- Templates include sample data and correct headers
- Ensures proper formatting for successful uploads

### 🔄 Bulk Student Creation
- Upload multiple students at once
- Automatic validation and error reporting
- Transaction-based processing for data integrity

### 🎨 Integrated Form Upload
- CSV upload directly from create student forms
- Automatic level detection based on form settings
- Seamless integration with existing workflows

## How to Use

### Method 1: Level Card CSV Upload

#### For Administrators:
- Navigate to **Admin Dashboard** → **Users** → **Students**
- Click the **📁** button on any level card (Elementary, Junior High, College)

#### For Registrars:
- Navigate to **Registrar Dashboard** → **Students**
- Click the **📁** button on any level card

### Method 2: Create Student Form CSV Upload (NEW!)

#### Step-by-Step Process:
1. **Open Create Student Form**
   - Click "Add [Level] Student" button on any level card
   - Or use the main "Add Student" functionality

2. **Configure Form Settings**
   - Select student type (K-12 or College)
   - Choose academic level (Elementary, Junior High, etc.)
   - Set other form preferences

3. **Use CSV Upload Section**
   - Scroll down to the "📁 Bulk Upload Students" section
   - Click "📥 Download Template" to get the correct format
   - Upload your CSV file using the file input
   - Click "Upload CSV" to process

4. **Students Created with Form Settings**
   - All uploaded students inherit the form's academic level
   - Form settings are automatically applied to CSV data
   - Consistent data across all uploaded students

### 2. Download Template

1. Click **📥 Download Template** button (either from level card or form)
2. Open the downloaded CSV file in Excel or Google Sheets
3. Review the sample data and headers
4. Replace sample data with your actual student information

### 3. Prepare Your CSV File

#### Required Fields (All Levels):
- `name` - Full name of the student
- `email` - Student's email address (must be unique)

#### Optional Fields (All Levels):
- `password` - Student's password (default: password123)
- `student_id` - Custom student ID (auto-generated if not provided)
- `first_name` - Student's first name
- `middle_name` - Student's middle name
- `last_name` - Student's last name
- `birth_date` - Date of birth (YYYY-MM-DD format)
- `gender` - Male/Female
- `address` - Student's address
- `contact_number` - Contact phone number
- `section` - Class section (A, B, C, etc.)

#### Level-Specific Fields:

##### Elementary Students:
- `grade_level` - Grade level (Grade 1, Grade 2, etc.)
- `year_level` - Numeric year level (1, 2, 3, 4, 5, 6)

##### Junior High Students:
- `grade_level` - Grade level (Grade 7, Grade 8, etc.)
- `year_level` - Numeric year level (7, 8, 9, 10)
- `academic_strand` - Academic strand (STEM, ABM, HUMSS, GAS, etc.)

##### College Students:
- `year_level` - Year level (1, 2, 3, 4, 5)
- `semester` - Semester (1st, 2nd, summer)
- `college_course` - College course name or code

### 4. Upload CSV File

1. Click **Choose File** and select your prepared CSV file
2. Review the file requirements in the blue info box
3. Click **Upload CSV** to process the file
4. Wait for the upload to complete
5. Review success/error messages

## CSV Format Examples

### Elementary Students Template:
```csv
name,email,password,student_id,first_name,middle_name,last_name,birth_date,gender,address,contact_number,section,grade_level,year_level
John Doe,john.doe@example.com,password123,STU-001,John,M,Doe,2000-01-01,Male,123 Main St City,09123456789,A,Grade 1,1
Jane Smith,jane.smith@example.com,password123,STU-002,Jane,A,Smith,2000-02-15,Female,456 Oak Ave Town,09187654321,B,Grade 2,2
```

### Junior High Students Template:
```csv
name,email,password,student_id,first_name,middle_name,last_name,birth_date,gender,address,contact_number,section,grade_level,year_level,academic_strand
Mike Johnson,mike.johnson@example.com,password123,STU-003,Mike,B,Johnson,2005-03-20,Male,789 Pine Rd Village,09111222333,A,Grade 7,7,STEM
Sarah Wilson,sarah.wilson@example.com,password123,STU-004,Sarah,C,Wilson,2005-04-10,Female,321 Elm St District,09444555666,B,Grade 8,8,ABM
```

### College Students Template:
```csv
name,email,password,student_id,first_name,middle_name,last_name,birth_date,gender,address,contact_number,section,year_level,semester,college_course
Alex Brown,alex.brown@example.com,password123,STU-005,Alex,D,Brown,2002-05-25,Male,654 Maple Dr Campus,09777888999,A,1,1st,Bachelor of Science in Computer Science
Emma Davis,emma.davis@example.com,password123,STU-006,Emma,E,Davis,2002-06-30,Female,987 Cedar Ln University,09000111222,B,2,2nd,Bachelor of Science in Information Technology
```

## Form Integration Benefits

### 🎯 Contextual Upload
- **Automatic Level Detection**: Form settings determine the correct template
- **Consistent Data**: All uploaded students share the same academic settings
- **Reduced Errors**: No need to manually specify level in CSV

### 🔄 Workflow Integration
- **Seamless Process**: Upload while creating individual students
- **Flexible Approach**: Choose between individual or bulk creation
- **Time Saving**: Configure once, upload many

### 📊 Smart Template Generation
- **Dynamic Templates**: Templates adapt to form settings
- **Level-Specific Fields**: Only relevant fields included
- **Sample Data**: Realistic examples for each level

## Validation Rules

### File Requirements:
- File format: CSV or TXT
- Maximum file size: 2MB
- First row must contain headers
- All required fields must be filled

### Data Validation:
- Email addresses must be unique
- Email format must be valid
- Birth dates must be in YYYY-MM-DD format
- Year levels must be appropriate for the academic level
- Academic strands must exist in the system
- College courses must exist in the system

## Error Handling

### Common Errors:
1. **Duplicate Email**: Email already exists in the system
2. **Invalid Format**: CSV format doesn't match template
3. **Missing Required Fields**: Name or email is missing
4. **Invalid Data**: Invalid date format, year level, etc.
5. **File Too Large**: File exceeds 2MB limit

### Error Reporting:
- Errors are displayed after upload completion
- Each error shows the row number and specific issue
- Successful uploads are counted separately
- Partial uploads are supported (valid rows are processed)

## Best Practices

### Before Upload:
1. **Download and use the template** for the correct format
2. **Validate your data** in Excel/Google Sheets first
3. **Check for duplicate emails** in your CSV file
4. **Ensure all required fields** are filled
5. **Test with a small file** before uploading large datasets

### During Upload:
1. **Don't close the browser** during upload
2. **Wait for completion** before navigating away
3. **Review error messages** carefully
4. **Fix errors** and re-upload if needed

### After Upload:
1. **Verify student accounts** were created correctly
2. **Check student profiles** for accuracy
3. **Assign class advisers** if needed
4. **Set up parent accounts** if required

## Troubleshooting

### Upload Fails:
- Check file format (must be CSV)
- Verify file size (under 2MB)
- Ensure headers match template exactly
- Check for special characters in data

### Students Not Created:
- Review error messages for specific issues
- Check email uniqueness
- Verify academic level data exists
- Ensure proper date formats

### Partial Upload:
- Fix errors in CSV file
- Re-upload only the failed rows
- Check system logs for detailed errors

### Form Integration Issues:
- Ensure form is properly configured before upload
- Check that academic level is selected
- Verify student type (K-12 vs College) is correct
- Download template after form configuration

## Support

For technical support or questions about CSV upload functionality:
- Check the error messages for specific guidance
- Review this documentation
- Contact system administrator for assistance

---

**Note**: Always backup your data before performing bulk uploads, and test with a small dataset first to ensure everything works as expected. The new form integration feature makes it easier than ever to upload students with consistent settings! 