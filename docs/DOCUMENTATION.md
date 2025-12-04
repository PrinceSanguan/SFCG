# SFCG Academic Management System - Comprehensive Technical Documentation

> **Version:** 1.0  
> **Last Updated:** 2025  
> **Technology Stack:** Laravel 12, React 19, TypeScript, Inertia.js, PostgreSQL/MySQL

---

## Table of Contents

1. [System Overview](#1-system-overview)
   - [Executive Summary](#11-executive-summary)
   - [Technology Stack](#12-technology-stack)
   - [Architecture Overview](#13-architecture-overview)
   - [User Roles & Responsibilities](#14-user-roles--responsibilities)
   - [Key Features Summary](#15-key-features-summary)

2. [Backend Documentation](#2-backend-documentation)
   - [Controllers](#21-controllers)
   - [Models & Relationships](#22-models--relationships)
   - [Services Layer](#23-services-layer)
   - [Middleware & Security](#24-middleware--security)
   - [Mail & Notifications](#25-mail--notifications)

3. [Frontend Documentation](#3-frontend-documentation)
   - [Page Components](#31-page-components)
   - [Component Library](#32-component-library)
   - [Layouts](#33-layouts)
   - [State Management](#34-state-management)
   - [TypeScript Types & Interfaces](#35-typescript-types--interfaces)

4. [Database Schema](#4-database-schema)
   - [Tables & Relationships](#41-tables--relationships)
   - [ER Diagram Description](#42-er-diagram-description)

5. [API Routes Documentation](#5-api-routes-documentation)
   - [Public Routes](#51-public-routes)
   - [Admin Routes](#52-admin-routes)
   - [Role-Specific Routes](#53-role-specific-routes)

6. [⭐ Grade Management System](#6-grade-management-system)
   - [Multi-Stage Approval Process](#61-multi-stage-approval-process)
   - [Edit Windows & Locks](#62-edit-windows--locks)
   - [CSV Bulk Upload](#63-csv-bulk-upload)
   - [Grade Calculations](#64-grade-calculations)
   - [Controller Methods](#65-controller-methods)
   - [Model Methods](#66-model-methods)

7. [⭐ Honor System](#7-honor-system)
   - [Calculation Workflow](#71-calculation-workflow)
   - [Service Methods](#72-service-methods)
   - [Honor Criteria System](#73-honor-criteria-system)
   - [Approval Workflow](#74-approval-workflow)
   - [Level-Specific Calculations](#75-level-specific-calculations)
   - [Certificate Generation Integration](#76-certificate-generation-integration)

8. [Other Features](#8-other-features)
   - [Student Enrollment & Management](#81-student-enrollment--management)
   - [Certificate Generation](#82-certificate-generation)
   - [Reporting & Analytics](#83-reporting--analytics)
   - [Role-Based Access Control](#84-role-based-access-control)
   - [Notification System](#85-notification-system)

9. [Development Guide](#9-development-guide)
   - [Setup Instructions](#91-setup-instructions)
   - [Development Commands](#92-development-commands)
   - [Code Conventions](#93-code-conventions)
   - [Testing](#94-testing)

10. [Appendix](#10-appendix)
    - [Role File Locations Reference](#101-role-file-locations-reference)
    - [File Path Index](#102-file-path-index)
    - [Method Index](#103-method-index)
    - [Model Relationship Summary](#104-model-relationship-summary)
    - [Configuration Reference](#105-configuration-reference)

---

## 1. System Overview

### 1.1 Executive Summary

The SFCG Academic Management System is a comprehensive web-based platform designed to manage academic operations across multiple education levels: Elementary, Junior High School, Senior High School, and College. The system supports 9 distinct user roles, each with specific permissions and responsibilities, enabling seamless management of student records, grades, honors, certificates, and academic reporting.

The application is built using modern web technologies with a Laravel 12 backend providing robust API endpoints and business logic, while a React 19 frontend delivers a responsive and intuitive user interface. The architecture leverages Inertia.js to bridge the gap between server-side routing and client-side interactivity, creating a seamless single-page application experience.

### 1.2 Technology Stack

#### Backend Stack
- **Framework:** Laravel 12 (PHP 8.2+)
- **Database:** PostgreSQL (Production) / MySQL (Local Development)
- **Authentication:** Laravel Sanctum with Google OAuth integration
- **PDF Generation:** DomPDF (barryvdh/laravel-dompdf)
- **Excel Processing:** Maatwebsite Excel
- **Word Processing:** PHPDocX
- **Queue System:** Laravel Queue (database driver)

#### Frontend Stack
- **Framework:** React 19
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** Inertia.js (server-driven)
- **Routing:** Ziggy (Laravel route binding)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Notifications:** Sonner (toast notifications)

#### Development Tools
- **Build Tool:** Vite 6
- **Package Manager:** npm / Composer
- **Code Quality:** ESLint, Prettier, Laravel Pint
- **Version Control:** Git

### 1.3 Architecture Overview

The application follows a **monolithic architecture** with clear separation between backend and frontend:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│                  (React + TypeScript)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS (Inertia.js)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 Laravel Backend (PHP)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Controllers │  │   Services   │  │    Models    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Middleware  │  │     Mail     │  │   Queues     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ PDO/Query Builder
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Database (PostgreSQL/MySQL)                     │
│         (30+ tables with relationships)                      │
└─────────────────────────────────────────────────────────────┘
```

#### Key Architectural Patterns

1. **Inertia.js Integration**
   - Server-side routing with SPA-like experience
   - Shared props between backend and frontend
   - Form submissions without full page reloads
   - Automatic CSRF protection

2. **Service Layer Pattern**
   - Business logic separated from controllers
   - Reusable service classes for complex operations
   - Honor calculation services per academic level
   - Certificate generation service

3. **Repository Pattern (via Eloquent)**
   - Model-based data access
   - Relationship definitions in models
   - Query scopes for common filters
   - Event-driven hooks (boot methods)

4. **Role-Based Access Control (RBAC)**
   - Middleware-based route protection
   - Role validation at controller level
   - Data isolation by user role
   - Permission checks in models

### 1.4 User Roles & Responsibilities

The system supports **9 distinct user roles**, each with specific permissions and access levels:

| Role | Key Responsibilities | Access Level |
|------|---------------------|--------------|
| **Admin** | Full system administration, user management, system settings, security logs | Full Access |
| **Registrar** | Student records, academic setup, certificates, reports (cannot create accounts) | View/Edit Only |
| **Principal** | Honor approvals, reports, oversight across all levels | School-Wide |
| **Chairperson** | Grade validation (College only), department reports, honors | Department-Level |
| **Instructor** | Grade entry/editing (College), CSV upload, honor tracking | Course-Level |
| **Teacher** | Grade entry/editing (Elementary-HS), CSV upload, honor tracking | Class-Level |
| **Adviser** | Limited grade editing, student monitoring, honor viewing | Section-Level |
| **Student** | View own grades, subjects, honors, certificates | Own Records |
| **Parent** | View children's grades, honors, certificates, notifications | Children's Records |

#### Detailed Role Permissions

**Admin** (`user_role: 'admin'`)
- Create, edit, and delete all user accounts
- Manage academic levels, subjects, sections, courses
- Configure honor types and criteria
- Generate certificates
- Access system settings and maintenance mode
- View activity logs and security audits
- Override honor calculations

**Registrar** (`user_role: 'registrar'`)
- View and edit existing users (no creation)
- Manage academic setup (levels, subjects, sections)
- Handle certificate templates and generation
- Generate reports and exports
- View notifications (cannot send Gmail announcements)
- Limited activity log access

**Principal** (`user_role: 'principal'`)
- Approve/reject pending honors
- View honor statistics and reports
- Access school-wide performance data
- Monitor grade validation status

**Chairperson** (`user_role: 'chairperson'`)
- Validate grades (College only)
- View department-specific reports
- Track honor qualifications in department
- Manage department-level settings

**Instructor** (`user_role: 'instructor'`)
- Enter and edit grades (5-day window)
- Upload grades via CSV
- Submit grades for validation
- View assigned courses and students
- Track honor qualifications

**Teacher** (`user_role: 'teacher'`)
- Enter and edit grades (5-day window)
- Upload grades via CSV
- Submit grades for validation
- View assigned subjects and students
- Track honor qualifications

**Adviser** (`user_role: 'adviser'`)
- Limited grade editing (3-day window)
- View students in assigned sections
- Monitor student performance
- View honor qualifications

**Student** (`user_role: 'student'`)
- View own grades and subjects
- View own honors and certificates
- Download certificates
- View academic progress

**Parent** (`user_role: 'parent'`)
- View children's grades
- View children's honors and certificates
- Receive email notifications
- Monitor academic progress

### 1.5 Key Features Summary

#### Academic Management
- **Multi-Level Support:** Elementary, Junior High, Senior High, College
- **Subject Management:** Course-based (College) and subject-based (Basic Education)
- **Section Management:** Class organization by academic year
- **Grading Periods:** Hierarchical structure (Semester → Period → Term)

#### Grade Management ⭐
- **Multi-Stage Approval:** Entry → Submission → Validation → Approval
- **Edit Windows:** 5 days for instructors/teachers, 3 days for advisers
- **CSV Bulk Upload:** Template-based grade import
- **Lock Mechanism:** Grades locked upon submission
- **Return for Revision:** Validators can return grades with reasons

#### Honor System ⭐
- **Automatic Calculation:** Triggered on grade approval
- **Level-Specific Logic:** Different algorithms per academic level
- **Approval Workflow:** Principal/Chairperson approval required
- **Certificate Integration:** Auto-generate on approval
- **Override Capability:** Admin can manually adjust

#### Certificate Generation
- **Template System:** HTML-based templates per academic level
- **Signatory Management:** Auto-retrieve Program Chair, Dean, Director
- **Serial Numbers:** Unique tracking per certificate
- **Bulk Generation:** Generate multiple certificates at once
- **Status Tracking:** Generated → Downloaded → Printed → Void

#### Reporting & Analytics
- **Principal Reports:** Performance trends, honor statistics
- **Chairperson Reports:** Department analysis
- **Admin Reports:** System-wide comprehensive reports
- **Export Formats:** PDF, Excel, CSV

#### User Management
- **Account Creation:** Admin-only (except student registration)
- **Password Management:** Reset and change functionality
- **Profile Management:** Personal information updates
- **Activity Logging:** Audit trail for all actions

#### Parent-Student Relationships
- **Multi-Parent Support:** Students can have multiple parents
- **Relationship Types:** Father, Mother, Guardian
- **Emergency Contacts:** Link to parent accounts
- **Notification System:** Email alerts to parents

#### Notification System
- **Email Notifications:** All major events
- **Retry Mechanism:** Failed email retry logic
- **Broadcast Support:** Multiple recipients
- **Activity Logs:** Notification history

---

## 2. Backend Documentation

### 2.1 Controllers

Controllers are organized by role in the `app/Http/Controllers/` directory. Each controller handles HTTP requests, validates input, calls services, and returns Inertia responses or JSON.

#### 2.1.1 Admin Controllers

**Location:** `app/Http/Controllers/Admin/`

**UserManagementController** (`UserManagementController.php`)
- **Purpose:** CRUD operations for all user roles
- **Key Methods:**
  - `index()` - List all users with filters
  - `create()` - Show user creation form
  - `store(Request $request)` - Create new user account
  - `show(User $user)` - View user details
  - `edit(User $user)` - Show edit form
  - `update(Request $request, User $user)` - Update user information
  - `destroy(User $user)` - Delete user account
  - `resetPassword(User $user)` - Reset user password
- **Access Control:** Admin only
- **Related Models:** User, ParentStudentRelationship

**AcademicController** (`AcademicController.php`)
- **Purpose:** Academic structure management
- **Key Methods:**
  - Manage academic levels
  - Manage subjects and courses
  - Manage sections
  - Manage grading periods
  - Manage departments, strands, tracks
- **Related Models:** AcademicLevel, Subject, Course, Section, GradingPeriod, Department, Strand, Track

**SectionController** (`SectionController.php`)
- **Purpose:** Section management
- **Key Methods:**
  - `index()` - List sections
  - `store()` - Create section
  - `update()` - Update section
  - `destroy()` - Delete section

**CertificateController** (`CertificateController.php`)
- **Purpose:** Certificate management
- **Key Methods:**
  - `index()` - List certificates
  - `show()` - View certificate
  - `generate()` - Generate certificate
  - `download()` - Download certificate PDF
  - `bulkGenerate()` - Generate multiple certificates

**ParentManagementController** (`ParentManagementController.php`)
- **Purpose:** Parent-student relationship management
- **Key Methods:**
  - `linkParent()` - Link parent to student
  - `unlinkParent()` - Remove parent link
  - `updateRelationship()` - Update relationship details

**NotificationController** (`NotificationController.php`)
- **Purpose:** Notification management
- **Key Methods:**
  - `index()` - List notifications
  - `show()` - View notification details
  - `resend()` - Resend failed notifications

**ReportsController** (`ReportsController.php`)
- **Purpose:** Report generation
- **Key Methods:**
  - `gradeReport()` - Generate grade reports
  - `honorStatistics()` - Honor statistics
  - `systemReport()` - System-wide reports
  - `export()` - Export reports (PDF/Excel/CSV)

**SecurityController** (`SecurityController.php`)
- **Purpose:** Security and system management
- **Key Methods:**
  - `activityLogs()` - View activity logs
  - `backups()` - Backup management
  - `maintenanceMode()` - Enable/disable maintenance mode

#### 2.1.2 Registrar Controllers

**Location:** `app/Http/Controllers/Registrar/`

**RegistrarController** (`RegistrarController.php`)
- Dashboard and overview

**RegistrarUserManagementController** (`RegistrarUserManagementController.php`)
- **Note:** View/edit only, cannot create users
- Similar methods to Admin UserManagementController but restricted

**RegistrarAcademicController** (`RegistrarAcademicController.php`)
- Academic setup management

**RegistrarCertificateController** (`RegistrarCertificateController.php`)
- Certificate generation and management

**RegistrarReportsController** (`RegistrarReportsController.php`)
- Report generation

**RegistrarParentManagementController** (`RegistrarParentManagementController.php`)
- Parent-student relationship management

#### 2.1.3 Instructor Controllers

**Location:** `app/Http/Controllers/Instructor/`

**GradeManagementController** (`GradeManagementController.php`)
- **Purpose:** Grade entry and management for College courses
- **Key Methods:**
  - `index()` - List grades with filters
  - `show()` - View grade details
  - `create()` - Show grade entry form
  - `store()` - Create new grade
  - `edit()` - Show edit form
  - `update()` - Update grade (within edit window)
  - `submitForValidation()` - Submit grades for validation
  - `delete()` - Delete grade (if editable)
- **Access Control:** Instructor only, assigned courses only
- **Related Models:** StudentGrade, InstructorSubjectAssignment

**CSVUploadController** (`CSVUploadController.php`)
- **Purpose:** Bulk grade upload via CSV
- **Key Methods:**
  - `show()` - Display CSV upload form
  - `downloadTemplate()` - Download CSV template
  - `upload()` - Process CSV file and create/update grades
- **Features:**
  - Template validation
  - Batch processing
  - Error reporting
  - Deduplication

**HonorTrackingController** (`HonorTrackingController.php`)
- View honor qualifications for students

**DashboardController** (`DashboardController.php`)
- Instructor dashboard with statistics

**ProfileController** (`ProfileController.php`)
- Profile management

#### 2.1.4 Teacher Controllers

**Location:** `app/Http/Controllers/Teacher/`

Similar structure to Instructor controllers but for basic education levels (Elementary, Junior High, Senior High).

**GradeManagementController** (`GradeManagementController.php`)
- Grade entry for basic education

**CSVUploadController** (`CSVUploadController.php`)
- CSV upload for teachers

**HonorTrackingController** (`HonorTrackingController.php`)
- Honor tracking

#### 2.1.5 Principal Controllers

**Location:** `app/Http/Controllers/Principal/`

**HonorTrackingController** (`HonorTrackingController.php`)
- **Purpose:** Honor approval workflow
- **Key Methods:**
  - `index()` - List pending honors
  - `show()` - View honor details
  - `approve()` - Approve honor
  - `reject()` - Reject honor with reason
- **Related Models:** HonorResult

**ReportsController** (`ReportsController.php`)
- School-wide reports

**DashboardController** (`DashboardController.php`)
- Principal dashboard

#### 2.1.6 Chairperson Controllers

**Location:** `app/Http/Controllers/Chairperson/`

**GradeManagementController** (`GradeManagementController.php`)
- **Purpose:** Grade validation for College courses
- **Key Methods:**
  - `index()` - List submitted grades
  - `validate()` - Validate submitted grades
  - `returnForRevision()` - Return grades with reason
- **Access Control:** College courses only

**HonorTrackingController** (`HonorTrackingController.php`)
- Honor tracking for department

**ReportsController** (`ReportsController.php`)
- Department reports

#### 2.1.7 Student Controllers

**Location:** `app/Http/Controllers/Student/`

**GradesController** (`GradesController.php`)
- View own grades

**HonorsController** (`HonorsController.php`)
- View own honors

**CertificatesController** (`CertificatesController.php`)
- View and download own certificates

**SubjectsController** (`SubjectsController.php`)
- View enrolled subjects

**DashboardController** (`DashboardController.php`)
- Student dashboard

#### 2.1.8 Parent Controllers

**Location:** `app/Http/Controllers/Parent/`

**ParentGradesController** (`ParentGradesController.php`)
- View children's grades

**ParentHonorsController** (`ParentHonorsController.php`)
- View children's honors

**ParentCertificatesController** (`ParentCertificatesController.php`)
- View children's certificates

#### 2.1.9 Authentication Controllers

**Location:** `app/Http/Controllers/Auth/`

**LoginController** (`LoginController.php`)
- Email/password authentication
- Google OAuth integration

**RegisterController** (`RegisterController.php`)
- User registration (students)

**SocialAuthController** (`SocialAuthController.php`)
- Google OAuth callback handling

---

## 6. ⭐ Grade Management System

### 6.1 Multi-Stage Approval Process

The Grade Management System implements a comprehensive multi-stage approval workflow to ensure accuracy and accountability in grade submission. This process involves four distinct stages with clear responsibilities and tracking mechanisms.

#### Stage 1: Entry Stage (Instructor/Teacher)

**Location:** `app/Http/Controllers/Instructor/GradeManagementController.php` (College)  
**Location:** `app/Http/Controllers/Teacher/GradeManagementController.php` (Basic Education)

**Key Features:**
- Individual grade entry via web form
- Bulk grade upload via CSV file
- Real-time validation of grade values
- Assignment verification (instructor/teacher must be assigned to subject)
- Edit window: **5 days from creation date**

**Controller Methods:**

```php
// Create new grade entry
public function store(Request $request): RedirectResponse

// Update existing grade (within edit window)
public function update(Request $request, StudentGrade $grade): RedirectResponse

// Submit grades for validation (locks grades)
public function submitForValidation(Request $request): RedirectResponse

// Delete grade (only if editable)
public function destroy(StudentGrade $grade): RedirectResponse
```

**Grade Entry Form Fields:**
- `student_id` - Student identifier
- `subject_id` - Subject/course identifier
- `academic_level_id` - Academic level
- `grading_period_id` - Grading period (midterm, final, etc.)
- `school_year` - School year (e.g., "2024-2025")
- `year_of_study` - Year level (optional)
- `grade` - Numeric grade value
- `grade_type` - Type of grade (e.g., "final", "midterm")

**Validation Rules:**
- Grade must be within valid range (typically 0-100 for percentage, 1.0-5.0 for college scale)
- Subject must be assigned to instructor/teacher
- Student must be enrolled in the subject
- Grading period must be active

#### Stage 2: Submission Stage

**Trigger:** Instructor/Teacher clicks "Submit for Validation"

**Process:**
1. Grades are marked with `is_submitted_for_validation = true`
2. `submitted_at` timestamp is recorded
3. Grades become **locked** and cannot be edited
4. Notification is sent to validators (Chairperson/Principal)
5. Grades appear in validator's review queue

**Model Changes:**
```php
$grade->is_submitted_for_validation = true;
$grade->submitted_at = now();
$grade->save(); // Locks the grade
```

**Lock Mechanism:**
- `isEditableByInstructor()` returns `false` when `is_submitted_for_validation` is `true`
- Edit status changes from `'editable'` to `'locked'`
- Days remaining counter shows 0

**Notification:**
- Email notification sent to Chairperson (College) or Principal (Basic Education)
- Notification includes:
  - Subject name and code
  - Number of grades submitted
  - School year and grading period
  - Link to validation page

#### Stage 3: Validation Stage (Chairperson/Principal)

**Location:** `app/Http/Controllers/Chairperson/GradeManagementController.php` (College)  
**Location:** `app/Http/Controllers/Principal/GradeManagementController.php` (Basic Education)

**Key Features:**
- Review submitted grades in bulk
- Validate grades (approve for final approval)
- Return grades for revision with reason
- Track validation history

**Controller Methods:**

```php
// List submitted grades for validation
public function index(Request $request): Response

// Validate submitted grades
public function validate(Request $request): RedirectResponse

// Return grades for revision
public function returnForRevision(Request $request): RedirectResponse
```

**Validation Actions:**

1. **Validate (Approve for Final Approval):**
   ```php
   $grade->validated_at = now();
   $grade->validated_by = Auth::id();
   $grade->save();
   ```
   - Grades move to final approval queue
   - Principal reviews validated grades

2. **Return for Revision:**
   ```php
   $grade->is_returned = true;
   $grade->returned_at = now();
   $grade->returned_by = Auth::id();
   $grade->return_reason = $request->return_reason;
   $grade->is_submitted_for_validation = false; // Unlock for editing
   $grade->save();
   ```
   - Grades are unlocked and returned to instructor/teacher
   - Return reason is stored and displayed
   - Instructor/teacher can edit and resubmit

#### Stage 4: Approval Stage

**Location:** `app/Http/Controllers/Principal/HonorTrackingController.php`

**Key Features:**
- Final approval authority
- Triggers honor calculation upon approval
- Permanent record creation

**Approval Process:**

1. **Principal Reviews Grades:**
   - Validated grades appear in approval queue
   - Principal reviews all grade data
   - Can approve or return for further revision

2. **Approval Action:**
   ```php
   $grade->is_approved = true;
   $grade->approved_at = now();
   $grade->approved_by = Auth::id();
   $grade->save();
   ```

3. **Automatic Honor Calculation Trigger:**
   - Model boot event detects approval
   - Only triggers for `grade_type = 'final'`
   - Calls `AutomaticHonorCalculationService::calculateHonorsForStudent()`
   - See [Honor System](#7-honor-system) for details

**Boot Event Code:**
```php:320:342:app/Models/StudentGrade.php
protected static function booted(): void
{
    // Trigger honor calculation when a grade is approved
    static::updated(function (StudentGrade $grade) {
        // Only trigger if grade was just approved (final grades)
        if ($grade->wasChanged('is_approved') && $grade->is_approved && $grade->grade_type === 'final') {
            try {
                $student = $grade->student;
                if ($student) {
                    $honorCalculationService = new AutomaticHonorCalculationService();
                    $honorCalculationService->calculateHonorsForStudent($student, $grade->school_year);
                }
            } catch (\Exception $e) {
                \Log::error('Failed to trigger automatic honor calculation after grade approval', [
                    'grade_id' => $grade->id,
                    'student_id' => $grade->student_id,
                    'subject_id' => $grade->subject_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    });
}
```

### 6.2 Edit Windows & Locks

The system implements time-based edit windows to ensure timely grade submission while allowing corrections during a reasonable period.

#### Edit Window for Instructors/Teachers

**Duration:** 5 days from creation date

**Implementation:**
```php:59:88:app/Models/StudentGrade.php
public function isEditableByInstructor(): bool
{
    // If grade is submitted for validation, it's locked
    if ($this->is_submitted_for_validation) {
        \Log::info('Grade edit check: Grade is locked (submitted for validation)', [
            'grade_id' => $this->id,
            'student_id' => $this->student_id,
            'subject_id' => $this->subject_id,
            'submitted_at' => $this->submitted_at,
        ]);
        return false;
    }

    // Check if within 5-day edit window from created_at
    $createdDate = $this->created_at;
    $fiveDaysAgo = now()->subDays(5);
    $isWithinWindow = $createdDate->isAfter($fiveDaysAgo);

    \Log::info('Grade edit check: Time window validation', [
        'grade_id' => $this->id,
        'student_id' => $this->student_id,
        'subject_id' => $this->subject_id,
        'created_at' => $createdDate->toDateTimeString(),
        'five_days_ago' => $fiveDaysAgo->toDateTimeString(),
        'is_within_window' => $isWithinWindow,
        'days_since_creation' => $createdDate->diffInDays(now()),
    ]);

    return $isWithinWindow;
}
```

**Days Remaining Calculation:**
```php:94:106:app/Models/StudentGrade.php
public function getDaysRemainingForEdit(): int
{
    if ($this->is_submitted_for_validation) {
        return 0;
    }

    $createdDate = $this->created_at;
    $expiryDate = $createdDate->copy()->addDays(5);
    $daysRemaining = now()->diffInDays($expiryDate, false);

    // Return 0 if negative (expired)
    return max(0, (int) ceil($daysRemaining));
}
```

#### Edit Window for Advisers

**Duration:** 3 days from creation date

**Implementation:**
```php:129:163:app/Models/StudentGrade.php
public function isEditableByAdviser(): bool
{
    // If grade is submitted for validation, it's locked
    if ($this->is_submitted_for_validation) {
        \Log::info('[ADVISER GRADE EDIT] Grade is locked (submitted for validation)', [
            'grade_id' => $this->id,
            'student_id' => $this->student_id,
            'subject_id' => $this->subject_id,
            'submitted_at' => $this->submitted_at,
        ]);
        return false;
    }

    // Safety check: if created_at is null, allow editing
    if (!$this->created_at) {
        return true;
    }

    // Check if within 3-day edit window from created_at
    $createdDate = $this->created_at;
    $threeDaysAgo = now()->subDays(3);
    $isWithinWindow = $createdDate->isAfter($threeDaysAgo);

    \Log::info('[ADVISER GRADE EDIT] Time window validation', [
        'grade_id' => $this->id,
        'student_id' => $this->student_id,
        'subject_id' => $this->subject_id,
        'created_at' => $createdDate->toDateTimeString(),
        'three_days_ago' => $threeDaysAgo->toDateTimeString(),
        'is_within_window' => $isWithinWindow,
        'days_since_creation' => $createdDate->diffInDays(now()),
    ]);

    return $isWithinWindow;
}
```

#### Edit Status

**Possible Status Values:**
- `'editable'` - Grade can be edited (within time window and not submitted)
- `'locked'` - Grade has been submitted for validation
- `'expired'` - Edit window has passed

**Implementation:**
```php:112:123:app/Models/StudentGrade.php
public function getEditStatus(): string
{
    if ($this->is_submitted_for_validation) {
        return 'locked';
    }

    if ($this->isEditableByInstructor()) {
        return 'editable';
    }

    return 'expired';
}
```

#### Lock Conditions

A grade becomes locked when:
1. **Submitted for Validation:** `is_submitted_for_validation = true`
2. **Approved:** `is_approved = true` (permanent lock)
3. **Edit Window Expired:** More than 5 days (instructor) or 3 days (adviser) since creation

### 6.3 CSV Bulk Upload

The system supports bulk grade upload via CSV files to streamline grade entry for multiple students.

**Location:** `app/Http/Controllers/Instructor/CSVUploadController.php` (College)  
**Location:** `app/Http/Controllers/Teacher/CSVUploadController.php` (Basic Education)

#### CSV Upload Process

**Step 1: Download Template**
- Instructors/Teachers can download a CSV template
- Template includes required columns:
  - `student_id` or `student_number`
  - `grade` (numeric value)
  - `subject_id` (if using multi-subject template)
  - Optional: `MIDTERM` and `FINAL TERM` columns for subject template format

**Step 2: Fill Template**
- Users fill the CSV with student grades
- Supports multiple grading periods in single upload
- Validates data format before processing

**Step 3: Upload and Validation**
```php
// Validation rules
$request->validate([
    'csv_file' => 'required|file|mimes:csv,txt|max:2048',
    'subject_id' => 'required|exists:subjects,id',
    'academic_level_id' => 'required|exists:academic_levels,id',
    'grading_period_ids' => 'required|array|min:1',
    'grading_period_ids.*' => 'required|exists:grading_periods,id',
    'school_year' => 'required|string|max:20',
]);
```

**Step 4: Processing**
- CSV file is parsed row by row
- Each row is validated:
  - Student exists
  - Grade is valid numeric value
  - Subject is assigned to instructor/teacher
  - Grading period is active
- Grades are created or updated
- Errors are collected and reported

**CSV Parsing:**
- Handles different CSV formats (comma-separated, tab-separated)
- Supports both single-subject and multi-subject templates
- Validates data types and ranges
- Provides detailed error messages for each row

**Error Handling:**
- Continues processing even if some rows fail
- Collects all errors and reports them together
- Provides row numbers for easy identification
- Logs all errors for debugging

**Success/Error Reporting:**
```php
return back()->with('success', "Successfully processed {$results['success']} grades. {$results['errors']} errors occurred.");
```

If errors exist, detailed error messages are included in the response.

#### CSV Template Formats

**Format 1: Single Subject Template**
```csv
student_id,grade
STU001,85.5
STU002,92.0
STU003,78.5
```

**Format 2: Subject Template (Multiple Periods)**
```csv
student_id,MIDTERM,FINAL TERM
STU001,85.5,88.0
STU002,92.0,95.5
STU003,78.5,82.0
```

#### Deduplication

The system prevents duplicate grade entries:
- Checks for existing grade with same:
  - `student_id`
  - `subject_id`
  - `grading_period_id`
  - `school_year`
- Updates existing grade if found
- Creates new grade if not found

### 6.4 Grade Calculations

#### Semester Final Average (College)

For college-level courses, the semester final average is calculated as:

```
Semester Final Average = (Midterm Grade + Prefinal Grade) / 2
```

**Location:** `app/Services/GradeCalculationService.php`

**Implementation:**
- Retrieves midterm and prefinal grades for the semester
- Calculates average
- Stores in `StudentGrade` model if needed

#### College Scale Conversion

College grades use a 1.0-5.0 scale where:
- 1.0 is the highest grade
- 3.0 is passing (75%)
- 5.0 is failing (below 70%)

**Percentage to College Scale Conversion:**
```php:212:242:app/Models/StudentGrade.php
public static function percentageToCollegeScale(float $percentage): float
{
    // Mapping based on standard Philippine college grading scale
    if ($percentage >= 97) return 1.1;
    if ($percentage >= 95) return 1.2;
    if ($percentage >= 93) return 1.3;
    if ($percentage >= 91) return 1.4;
    if ($percentage >= 90) return 1.5;
    if ($percentage >= 89) return 1.6;
    if ($percentage >= 88) return 1.7;
    if ($percentage >= 87) return 1.8;
    if ($percentage >= 86) return 1.9;
    if ($percentage >= 85) return 2.0;
    if ($percentage >= 84) return 2.1;
    if ($percentage >= 83) return 2.2;
    if ($percentage >= 82) return 2.3;
    if ($percentage >= 81) return 2.4;
    if ($percentage >= 80) return 2.5;
    if ($percentage >= 79) return 2.6;
    if ($percentage >= 78) return 2.7;
    if ($percentage >= 77) return 2.8;
    if ($percentage >= 76) return 2.9;
    if ($percentage >= 75) return 3.0; // Passing grade
    if ($percentage >= 74) return 3.1;
    if ($percentage >= 73) return 3.2;
    if ($percentage >= 72) return 3.3;
    if ($percentage >= 71) return 3.4;
    if ($percentage >= 70) return 3.5;

    return 5.0; // Below 70 is failing
}
```

**College Scale to Percentage Conversion:**
```php:250:264:app/Models/StudentGrade.php
public static function collegeScaleToPercentage(float $collegeGrade): float
{
    $scaleMap = [
        1.1 => 97.5, 1.2 => 95.5, 1.3 => 93.5, 1.4 => 91.5,
        1.5 => 90, 1.6 => 89, 1.7 => 88, 1.8 => 87, 1.9 => 86,
        2.0 => 85, 2.1 => 84, 2.2 => 83, 2.3 => 82, 2.4 => 81,
        2.5 => 80, 2.6 => 79, 2.7 => 78, 2.8 => 77, 2.9 => 76,
        3.0 => 75, 3.1 => 74, 3.2 => 73, 3.3 => 72, 3.4 => 71,
        3.5 => 70,
    ];

    if ($collegeGrade >= 5.0) return 65; // Below passing

    return $scaleMap[$collegeGrade] ?? 75; // Default to passing
}
```

**Auto-Conversion for College Grades:**
```php:271:299:app/Models/StudentGrade.php
public function getCollegeScaleGrade(): float
{
    // Load academic level if not already loaded
    if (!$this->relationLoaded('academicLevel')) {
        $this->load('academicLevel');
    }

    // Only convert if college level AND grade is in percentage range
    if ($this->academicLevel &&
        $this->academicLevel->key === 'college' &&
        $this->grade >= 70 &&
        $this->grade <= 100) {

        $converted = self::percentageToCollegeScale($this->grade);

        \Log::info('[COLLEGE SCALE] Grade conversion applied', [
            'grade_id' => $this->id,
            'student_id' => $this->student_id,
            'subject_id' => $this->subject_id,
            'percentage' => $this->grade,
            'college_scale' => $converted,
        ]);

        return $converted;
    }

    // Return as-is for non-college or already converted grades
    return $this->grade;
}
```

### 6.5 Controller Methods (Detailed)

#### Instructor/Teacher GradeManagementController

**Full Path:** `app/Http/Controllers/Instructor/GradeManagementController.php`  
**Full Path:** `app/Http/Controllers/Teacher/GradeManagementController.php`

**index(Request $request)**
- Lists all grades for assigned subjects
- Supports filtering by:
  - Subject
  - Academic level
  - Grading period
  - School year
- Includes editability information
- Paginated results (15 per page)

**show(StudentGrade $grade)**
- Displays grade details
- Shows edit status and days remaining
- Includes student and subject information
- Shows approval workflow status

**create()**
- Shows grade entry form
- Lists assigned subjects
- Lists enrolled students
- Provides grading period selection

**store(Request $request)**
- Validates grade data
- Checks assignment authorization
- Creates new grade record
- Returns success/error message

**edit(StudentGrade $grade)**
- Shows edit form (if editable)
- Pre-fills existing grade data
- Validates edit permissions

**update(Request $request, StudentGrade $grade)**
- Validates editability
- Updates grade value
- Logs changes
- Returns success/error message

**submitForValidation(Request $request)**
- Validates grades exist
- Locks grades for editing
- Sets submission timestamp
- Sends notification to validators

**destroy(StudentGrade $grade)**
- Deletes grade (if editable)
- Validates permissions
- Logs deletion

### 6.6 Model Methods (Detailed)

**Full Path:** `app/Models/StudentGrade.php`

#### Relationships

```php:47:53:app/Models/StudentGrade.php
public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
public function academicLevel(): BelongsTo { return $this->belongsTo(AcademicLevel::class); }
public function gradingPeriod(): BelongsTo { return $this->belongsTo(GradingPeriod::class); }
public function validatedBy(): BelongsTo { return $this->belongsTo(User::class, 'validated_by'); }
public function approvedBy(): BelongsTo { return $this->belongsTo(User::class, 'approved_by'); }
public function returnedBy(): BelongsTo { return $this->belongsTo(User::class, 'returned_by'); }
```

#### Key Attributes

```php:14:33:app/Models/StudentGrade.php
protected $fillable = [
    'student_id',
    'subject_id',
    'academic_level_id',
    'grading_period_id',
    'school_year',
    'year_of_study',
    'grade',
    'is_submitted_for_validation',
    'submitted_at',
    'validated_at',
    'validated_by',
    'is_approved',
    'approved_at',
    'approved_by',
    'is_returned',
    'returned_at',
    'returned_by',
    'return_reason',
];
```

#### All Model Methods

- `isEditableByInstructor(): bool` - Check if editable by instructor (5-day window)
- `isEditableByAdviser(): bool` - Check if editable by adviser (3-day window)
- `getDaysRemainingForEdit(): int` - Get remaining days for instructor edit
- `getDaysRemainingForEditByAdviser(): int` - Get remaining days for adviser edit
- `getEditStatus(): string` - Get edit status ('editable', 'locked', 'expired')
- `getEditStatusForAdviser(): string` - Get edit status for adviser
- `percentageToCollegeScale(float $percentage): float` - Convert percentage to college scale
- `collegeScaleToPercentage(float $collegeGrade): float` - Convert college scale to percentage
- `getCollegeScaleGrade(): float` - Get grade in college scale format
- `getFormattedCollegeGrade(): string` - Format college grade for display

---

## 7. ⭐ Honor System

### 7.1 Calculation Workflow

The Honor System automatically calculates student honors based on approved final grades. The calculation is triggered when grades are approved and follows a multi-step workflow.

#### Trigger Points

1. **Grade Approval (Automatic):**
   - When a final grade (`grade_type = 'final'`) is approved
   - Model boot event triggers calculation
   - Only processes if `is_approved` changed from `false` to `true`

2. **Manual Recalculation:**
   - Admin can manually trigger recalculation
   - Useful for system updates or corrections

3. **Batch Recalculation:**
   - Recalculate honors for entire academic level
   - Used at end of semester/year

#### Workflow Steps

**Step 1: Trigger Detection**
- `StudentGrade::booted()` event fires on grade update
- Checks if grade was just approved and is final grade
- Retrieves student and school year

**Step 2: Validation Phase**
- Checks if student has enough approved final grades
- Minimum requirements:
  - Elementary: 6 subjects
  - Other levels: 5 subjects
- Validates academic level configuration exists

**Step 3: Service Selection**
- Determines appropriate calculation service based on academic level:
  - `elementary` → `ElementaryHonorCalculationService`
  - `junior_highschool` → `JuniorHighSchoolHonorCalculationService`
  - `senior_highschool` → `SeniorHighSchoolHonorCalculationService`
  - `college` → `CollegeHonorCalculationService`

**Step 4: Calculation Execution**
- Delegates to level-specific service
- Each service implements unique calculation algorithm
- Returns qualification results with GPA

**Step 5: Result Creation/Update**
- Creates or updates `HonorResult` records
- Sets `is_pending_approval = true`
- Links to honor type and academic level
- Stores calculated GPA

**Step 6: Notification**
- If new honors created, sends notification to Principal/Chairperson
- Notification includes pending honor count
- Email sent via `NotificationService`

### 7.2 Service Methods

**Location:** `app/Services/AutomaticHonorCalculationService.php`

#### Main Entry Point

**calculateHonorsForStudent(User $student, string $schoolYear = null): array**
```php:26:102:app/Services/AutomaticHonorCalculationService.php
public function calculateHonorsForStudent(User $student, string $schoolYear = null): array
{
    $schoolYear = $schoolYear ?? $this->getCurrentSchoolYear();
    $results = [];

    try {
        // Get the student's academic level
        $academicLevel = AcademicLevel::where('key', $student->year_level)->first();

        if (!$academicLevel) {
            Log::warning('Academic level not found for student', [
                'student_id' => $student->id,
                'year_level' => $student->year_level,
            ]);
            return [];
        }

        // Check if student has enough grades to calculate honors
        if (!$this->hasEnoughGradesForHonorCalculation($student, $academicLevel->id, $schoolYear)) {
            Log::info('Student does not have enough grades for honor calculation yet', [
                'student_id' => $student->id,
                'academic_level' => $student->year_level,
                'school_year' => $schoolYear,
            ]);
            return [];
        }

        // Use the appropriate honor calculation service based on academic level
        $calculationService = $this->getHonorCalculationService($student->year_level);

        if (!$calculationService) {
            Log::warning('Honor calculation service not found for academic level', [
                'academic_level' => $student->year_level,
            ]);
            return [];
        }

        // Calculate honors using the appropriate service
        $honorResults = $this->performHonorCalculation($calculationService, $student->id, $academicLevel->id, $schoolYear);

        // Process each honor result
        $newHonorsCreated = false;
        foreach ($honorResults as $honorData) {
            if ($honorData['qualified']) {
                $result = $this->createOrUpdateHonorResult($student, $academicLevel, $honorData, $schoolYear);
                $results[] = $result;

                // Track if this is a new honor (not an update)
                if ($result->wasRecentlyCreated) {
                    $newHonorsCreated = true;
                }

                Log::info('Student qualified for honor', [
                    'student_id' => $student->id,
                    'honor_type' => $honorData['honor_type'] ?? 'Unknown',
                    'gpa' => $honorData['gpa'] ?? 'N/A',
                    'school_year' => $schoolYear,
                ]);
            }
        }

        // Send notification if new honors were created
        if ($newHonorsCreated && !empty($results)) {
            $this->sendHonorApprovalNotification($academicLevel, $schoolYear);
        }

    } catch (\Exception $e) {
        Log::error('Error calculating honors for student', [
            'student_id' => $student->id,
            'school_year' => $schoolYear,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
    }

    return $results;
}
```

#### Validation Method

**hasEnoughGradesForHonorCalculation(User $student, int $academicLevelId, string $schoolYear): bool**
```php:107:121:app/Services/AutomaticHonorCalculationService.php
private function hasEnoughGradesForHonorCalculation(User $student, int $academicLevelId, string $schoolYear): bool
{
    // Check if student has final grades (approved grades) for this school year
    $gradeCount = StudentGrade::where('student_id', $student->id)
        ->where('school_year', $schoolYear)
        ->where('is_approved', true) // Only approved grades count
        ->where('grade_type', 'final') // Only final grades count for honors
        ->count();

    // For elementary students, they need grades in at least 6 subjects
    // For other levels, they need grades in at least 5 subjects
    $minimumSubjects = ($student->year_level === 'elementary') ? 6 : 5;

    return $gradeCount >= $minimumSubjects;
}
```

#### Service Factory Method

**getHonorCalculationService(string $academicLevel)**
```php:126:140:app/Services/AutomaticHonorCalculationService.php
private function getHonorCalculationService(string $academicLevel)
{
    switch ($academicLevel) {
        case 'elementary':
            return new ElementaryHonorCalculationService();
        case 'junior_highschool':
            return new JuniorHighSchoolHonorCalculationService();
        case 'senior_highschool':
            return new SeniorHighSchoolHonorCalculationService();
        case 'college':
            return new CollegeHonorCalculationService();
        default:
            return null;
    }
}
```

#### Calculation Execution

**performHonorCalculation($calculationService, int $studentId, int $academicLevelId, string $schoolYear): array**
```php:145:176:app/Services/AutomaticHonorCalculationService.php
private function performHonorCalculation($calculationService, int $studentId, int $academicLevelId, string $schoolYear): array
{
    $results = [];

    // Each calculation service has different method names, so we need to call the appropriate one
    if ($calculationService instanceof ElementaryHonorCalculationService) {
        $result = $calculationService->calculateElementaryHonorQualification($studentId, $academicLevelId, $schoolYear);
        if ($result['qualified']) {
            $results = $result['qualifications'] ?? [];
        }
    } elseif ($calculationService instanceof JuniorHighSchoolHonorCalculationService) {
        // Add method call for JHS honor calculation
        $result = $calculationService->calculateJuniorHighSchoolHonorQualification($studentId, $academicLevelId, $schoolYear);
        if ($result['qualified']) {
            $results = $result['qualifications'] ?? [];
        }
    } elseif ($calculationService instanceof SeniorHighSchoolHonorCalculationService) {
        // Add method call for SHS honor calculation
        $result = $calculationService->calculateSeniorHighSchoolHonorQualification($studentId, $academicLevelId, $schoolYear);
        if ($result['qualified']) {
            $results = $result['qualifications'] ?? [];
        }
    } elseif ($calculationService instanceof CollegeHonorCalculationService) {
        // Add method call for College honor calculation
        $result = $calculationService->calculateCollegeHonorQualification($studentId, $academicLevelId, $schoolYear);
        if ($result['qualified']) {
            $results = $result['qualifications'] ?? [];
        }
    }

    return $results;
}
```

#### Result Creation

**createOrUpdateHonorResult(User $student, AcademicLevel $academicLevel, array $honorData, string $schoolYear): HonorResult**
```php:181:236:app/Services/AutomaticHonorCalculationService.php
private function createOrUpdateHonorResult(User $student, AcademicLevel $academicLevel, array $honorData, string $schoolYear): HonorResult
{
    // Find the honor type
    $honorType = HonorType::where('key', $honorData['honor_type']['key'] ?? '')->first();

    if (!$honorType) {
        throw new \Exception('Honor type not found: ' . ($honorData['honor_type']['key'] ?? 'unknown'));
    }

    // Check if honor result already exists
    $existingResult = HonorResult::where([
        'student_id' => $student->id,
        'honor_type_id' => $honorType->id,
        'academic_level_id' => $academicLevel->id,
        'school_year' => $schoolYear,
    ])->first();

    $honorResultData = [
        'student_id' => $student->id,
        'honor_type_id' => $honorType->id,
        'academic_level_id' => $academicLevel->id,
        'school_year' => $schoolYear,
        'gpa' => $honorData['gpa'] ?? 0,
        'is_pending_approval' => true, // Always requires approval
        'is_approved' => false,
        'is_rejected' => false,
    ];

    if ($existingResult) {
        // Update existing result
        $existingResult->update($honorResultData);
        $honorResult = $existingResult;
    } else {
        // Create new result
        $honorResult = HonorResult::create($honorResultData);
    }

    // Log activity
    ActivityLog::create([
        'user_id' => Auth::id() ?? 1, // System user if no auth
        'target_user_id' => $student->id,
        'action' => $existingResult ? 'updated_honor_qualification' : 'created_honor_qualification',
        'entity_type' => 'honor_result',
        'entity_id' => $honorResult->id,
        'details' => [
            'student' => $student->name,
            'honor_type' => $honorType->name,
            'academic_level' => $academicLevel->name,
            'gpa' => $honorData['gpa'] ?? 0,
            'school_year' => $schoolYear,
            'requires_approval' => true,
        ],
    ]);

    return $honorResult;
}
```

#### Batch Recalculation

**recalculateHonorsForAcademicLevel(string $academicLevelKey, string $schoolYear = null): array**
- Processes all students in an academic level
- Useful for end-of-semester calculations
- Returns results for all students

**triggerHonorCalculationForStudent(int $studentId, string $schoolYear = null): array**
- Manual trigger for specific student
- Validates student exists and has student role
- Calls main calculation method

---

### 7.3 Honor Criteria System

**Location:** `app/Models/HonorCriterion.php`

The Honor Criteria System allows administrators to configure specific requirements for each honor type at each academic level. Criteria are evaluated during honor calculation to determine if a student qualifies for a particular honor.

#### HonorCriterion Model Structure

**Key Attributes:**
```php:15:26:app/Models/HonorCriterion.php
protected $fillable = [
    'academic_level_id',
    'honor_type_id',
    'min_gpa',
    'max_gpa',
    'min_grade',
    'min_grade_all',
    'min_year',
    'max_year',
    'require_consistent_honor',
    'additional_rules',
];
```

**Data Types:**
```php:28:37:app/Models/HonorCriterion.php
protected $casts = [
    'min_gpa' => 'float',
    'max_gpa' => 'float',
    'min_grade' => 'float',  // Changed to float to support SHS 1.0-5.0 grading scale
    'min_grade_all' => 'float',  // Changed to float to support SHS 1.0-5.0 grading scale
    'min_year' => 'integer',
    'max_year' => 'integer',
    'require_consistent_honor' => 'boolean',
    'additional_rules' => 'array',
];
```

#### Criteria Fields Explained

1. **min_gpa** (float)
   - Minimum GPA required to qualify
   - Used for range checking: `student_gpa >= min_gpa`
   - Example: 1.5 (for Dean's List in College)

2. **max_gpa** (float)
   - Maximum GPA allowed to qualify
   - Used for range checking: `student_gpa <= max_gpa`
   - Example: 1.0 (for President's List)

3. **min_grade** (float)
   - Minimum grade in any single subject
   - Ensures no failing grades in any subject
   - Example: 75 (passing grade threshold)

4. **min_grade_all** (float)
   - Minimum grade across all subjects
   - Ensures consistent performance
   - For College: Uses worst grade (highest number in 1.0-5.0 scale)
   - Example: 3.0 (no grade worse than 3.0)

5. **min_year** (integer)
   - Minimum year level required
   - Restricts honors to certain year levels
   - Example: 2 (only 2nd year and above)

6. **max_year** (integer)
   - Maximum year level allowed
   - Restricts honors to certain year levels
   - Example: 4 (only up to 4th year)

7. **require_consistent_honor** (boolean)
   - Requires student to maintain honor across multiple periods
   - Used in Senior High School per-quarter tracking
   - Example: true (must have honor in all quarters)

8. **additional_rules** (JSON array)
   - Flexible field for custom rules
   - Can store complex criteria not covered by standard fields
   - Example: `{"require_completion": true, "min_units": 18}`

#### Criteria Matching Logic

During honor calculation, the system evaluates all criteria:

```php
// Example criteria evaluation (pseudocode)
if ($studentGPA >= $criterion->min_gpa && 
    $studentGPA <= $criterion->max_gpa &&
    $worstGrade >= $criterion->min_grade_all &&
    $studentYearLevel >= $criterion->min_year &&
    $studentYearLevel <= $criterion->max_year) {
    // Student qualifies for this honor type
}
```

#### Unique Constraint

Each academic level can have only one criterion per honor type:
- Unique constraint: `['academic_level_id', 'honor_type_id']`
- Prevents duplicate criteria configurations

### 7.4 Level-Specific Calculation Details

Each academic level uses a different calculation algorithm tailored to its grading system and requirements.

#### Elementary Level

**Service:** `ElementaryHonorCalculationService`  
**Location:** `app/Services/ElementaryHonorCalculationService.php`

**Calculation Method:**
- Calculates average of all approved final grades
- Simple average: `Sum of all grades / Number of subjects`
- Minimum requirement: 6 subjects
- No per-period tracking

**Example:**
```
Student has 6 subjects with grades: 90, 92, 88, 95, 91, 89
Average = (90 + 92 + 88 + 95 + 91 + 89) / 6 = 90.83
If criterion requires min_gpa: 90.0, student qualifies
```

#### Junior High School Level

**Service:** `JuniorHighSchoolHonorCalculationService`  
**Location:** `app/Services/JuniorHighSchoolHonorCalculationService.php`

**Calculation Method:**
- Similar to Elementary
- Calculates average of all approved final grades
- Minimum requirement: 5 subjects
- Simple average formula

#### Senior High School Level

**Service:** `SeniorHighSchoolHonorCalculationService`  
**Location:** `app/Services/SeniorHighSchoolHonorCalculationService.php`

**Calculation Method:**
- Per-quarter GPA tracking
- Maintains honor consistency across quarters
- Tracks cumulative performance
- Uses 1.0-5.0 grading scale (1.0 = highest)

**Special Features:**
- Quarter-by-quarter evaluation
- Cumulative GPA calculation
- Requires consistent honor across periods if `require_consistent_honor = true`

#### College Level

**Service:** `CollegeHonorCalculationService`  
**Location:** `app/Services/CollegeHonorCalculationService.php`

**Calculation Method:**
- Uses weighted semester-based calculation
- Converts percentage grades to college scale (1.0-5.0)
- Calculates cumulative GPA
- Uses worst grade for `min_grade_all` criteria

**Key Algorithm:**
```php:20:150:app/Services/CollegeHonorCalculationService.php
public function calculateCollegeHonorQualification(int $studentId, int $academicLevelId, string $schoolYear): array
{
    // Get all grading periods (Midterm, Pre-Final, Final for each semester)
    // Convert all grades to college scale (1.0-5.0)
    // Calculate weighted average across all periods
    // Get worst grade (highest number in 1.0-5.0 scale)
    // Match against honor criteria
    // Return qualification results
}
```

**Grade Conversion:**
- Percentage grades (70-100) are converted to college scale (1.0-5.0)
- Uses `StudentGrade::percentageToCollegeScale()` method
- 1.0 = highest, 5.0 = lowest, 3.0 = passing (75%)

**Semester Weighting:**
- Each period (Midterm, Pre-Final, Final) can have weights
- Weighted average: `Sum(period_average * weight) / Sum(weights)`

**Worst Grade Logic:**
- For `min_grade_all` criteria, uses the highest number (worst grade)
- Example: If student has grades 1.5, 2.0, 1.8, worst = 2.0
- Ensures no grade is below the minimum threshold

### 7.5 Approval Workflow

Once honors are calculated, they enter an approval workflow before being finalized.

#### Honor Status Fields

**Pending Approval:**
- `is_pending_approval = true`
- `is_approved = false`
- `is_rejected = false`
- Default state after calculation

**Approved:**
- `is_approved = true`
- `is_pending_approval = false`
- `approved_at` = timestamp
- `approved_by` = user_id (Principal/Chairperson)

**Rejected:**
- `is_rejected = true`
- `is_pending_approval = false`
- `rejected_at` = timestamp
- `rejected_by` = user_id
- `rejection_reason` = text explanation

#### Approval Process

**Location:** `app/Http/Controllers/Principal/HonorTrackingController.php`

**Step 1: View Pending Honors**

```php:71:92:app/Http/Controllers/Principal/HonorTrackingController.php
public function pendingHonors()
{
    $user = Auth::user();

    // Principal can only handle their assigned academic level
    $allowedAcademicLevels = [$user->year_level];
    
    $honors = HonorResult::where('is_pending_approval', true)
        ->where('is_approved', false)
        ->where('is_rejected', false)
        ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
            $query->whereIn('key', $allowedAcademicLevels);
        })
        ->with(['student', 'honorType', 'academicLevel'])
        ->latest('created_at')
        ->paginate(20);
    
    return Inertia::render('Principal/Honors/Pending', [
        'user' => $user,
        'honors' => $honors,
    ]);
}
```

**Step 2: Approve Honor**

```php:94:144:app/Http/Controllers/Principal/HonorTrackingController.php
public function approveHonor(Request $request, $honorId)
{
    $user = Auth::user();
    $honor = HonorResult::with(['student', 'academicLevel', 'honorType'])->findOrFail($honorId);

    // Verify that principal can only approve honors for their assigned academic level
    $allowedAcademicLevels = [$user->year_level];
    if (!$honor->academicLevel || !in_array($honor->academicLevel->key, $allowedAcademicLevels)) {
        abort(403, 'Principal can only approve honors for their assigned academic level.');
    }
    
    $honor->update([
        'is_approved' => true,
        'is_pending_approval' => false,
        'approved_at' => now(),
        'approved_by' => $user->id,
    ]);

    // Generate certificate automatically
    $certificateService = app(CertificateGenerationService::class);
    $certificate = null;
    $certificateError = null;

    try {
        $certificate = $certificateService->generateHonorCertificate($honor);

        if ($certificate) {
            Log::info('Certificate generated automatically for approved honor', [
                'certificate_id' => $certificate->id,
                'certificate_serial' => $certificate->serial_number,
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'approved_by' => 'principal',
            ]);
        }
    } catch (\Exception $e) {
        $certificateError = $e->getMessage();
        Log::error('Certificate generation FAILED for approved honor', [
            'honor_id' => $honor->id,
            'student_id' => $honor->student_id,
            'academic_level' => $honor->academicLevel->key,
            'error' => $certificateError,
            'approved_by' => 'principal',
        ]);
    }

    // Send parent notification emails with new template
    $this->sendParentNotifications($honor, $certificate);
```

**Step 3: Automatic Certificate Generation**

When honor is approved:
1. Certificate is automatically generated
2. Serial number is assigned
3. Certificate status set to "generated"
4. Student can download certificate

**Step 4: Notification Dispatch**

Notifications sent to:
- **Student:** Email notification about honor qualification
- **Parent(s):** Email notification about child's honor
- **Admin/Principal:** Notification about approval

#### Rejection Process

**Reject Honor Method:**
- Principal/Chairperson can reject honor with reason
- Sets `is_rejected = true`
- Stores `rejection_reason`
- Logs rejection activity
- No certificate generated

#### Access Control

**Principal:**
- Can approve/reject honors for their assigned academic level only
- School-wide oversight

**Chairperson (College only):**
- Can approve/reject honors for their department only
- Department-level oversight
- Restricted to College honors

### 7.6 Certificate Generation Integration

**Location:** `app/Services/CertificateGenerationService.php`

When an honor is approved, the system automatically generates a certificate.

#### Automatic Generation Trigger

```php
// In HonorTrackingController::approveHonor()
$certificateService = app(CertificateGenerationService::class);
$certificate = $certificateService->generateHonorCertificate($honor);
```

#### Certificate Generation Process

1. **Retrieve Certificate Template**
   - Finds template based on academic level
   - Uses HTML template system
   - Includes signatory placeholders

2. **Generate Certificate Data**
   - Student name and details
   - Honor type and description
   - Academic level and school year
   - GPA/achievement details
   - Date of award

3. **Generate Serial Number**
   - Unique serial number per certificate
   - Format: `HON-{year}-{sequential}`
   - Ensures no duplicates

4. **Retrieve Signatory Details**
   - Program Chair (College)
   - College Dean
   - School Director
   - Principal

5. **Generate PDF**
   - Uses DomPDF library
   - Converts HTML template to PDF
   - Stores PDF file in storage

6. **Create Certificate Record**
   - Links to honor result
   - Stores file path
   - Sets status to "generated"
   - Records generation timestamp

#### Certificate Status Tracking

- **generated** - Certificate created, ready for download
- **downloaded** - Student/parent downloaded the certificate
- **printed** - Certificate was printed
- **void** - Certificate invalidated

#### Certificate Model

**Location:** `app/Models/Certificate.php`

**Key Relationships:**
- `belongsTo(HonorResult::class)` - Links to honor
- `belongsTo(CertificateTemplate::class)` - Links to template
- `belongsTo(User::class, 'student_id')` - Links to student

**Key Fields:**
- `serial_number` - Unique identifier
- `certificate_template_id` - Template used
- `honor_result_id` - Associated honor
- `student_id` - Student recipient
- `file_path` - PDF file location
- `status` - Current certificate status
- `generated_at` - Generation timestamp
- `downloaded_at` - Download timestamp

---

## 8. Other Features

### 8.1 Student Enrollment & Management

The system supports comprehensive student enrollment across all academic levels with automatic subject assignment and section management.

#### Enrollment Process

**Automatic Subject Assignment:**
- When student is created, subjects are automatically assigned
- Based on academic level, year level, and section
- Uses `StudentSubjectAssignmentService`
- Handles course-based (College) and subject-based (Basic Education) enrollment

**Section Enrollment:**
- Students are enrolled in sections by academic year
- Section determines class grouping
- Multiple sections per academic level
- Section assignment managed by Admin/Registrar

**Year Level Tracking:**
- Tracks specific year level (Grade 1-6, Grade 7-10, Grade 11-12, Year 1-4)
- Year level determines curriculum/subjects
- Used in honor calculations

#### Bulk CSV Upload

**Student CSV Upload:**
- Supports bulk student registration
- CSV format with required columns:
  - Name, Email, Student Number
  - Academic Level, Year Level
  - Section, Strand/Course
- Validates data before import
- Auto-generates student numbers if not provided

#### Parent-Student Relationships

**Relationship Types:**
- Father
- Mother
- Guardian

**Features:**
- Multiple parents per student
- Multiple students per parent
- Emergency contact linking
- Relationship notes

**Model:** `app/Models/ParentStudentRelationship.php`

### 8.2 Certificate Generation

See [Certificate Generation Integration](#76-certificate-generation-integration) in Honor System section.

**Additional Features:**
- **Bulk Generation:** Generate multiple certificates at once
- **Template Management:** Create/edit certificate templates per academic level
- **Download Tracking:** Monitor certificate downloads
- **Print Status:** Track printed certificates
- **Void Functionality:** Invalidate certificates if needed

**Templates:**
- HTML-based templates
- Dynamic content insertion
- Signatory placeholders
- Logo and branding support

### 8.3 Reporting & Analytics

The system provides comprehensive reporting capabilities for various stakeholders.

#### Principal Reports

**Performance Reports:**
- School-wide performance metrics
- Grade distribution analysis
- Subject performance trends
- Year-over-year comparisons

**Honor Statistics:**
- Honor roll counts by type
- Honor distribution by section/level
- Honor trends over time
- Approval/rejection statistics

**Location:** `app/Http/Controllers/Principal/ReportsController.php`

#### Chairperson Reports

**Department Analysis:**
- Department-specific performance
- Course completion rates
- Grade distribution by course
- Honor qualifications by department

**Location:** `app/Http/Controllers/Chairperson/ReportsController.php`

#### Admin Reports

**System-Wide Reports:**
- Comprehensive system statistics
- User activity reports
- Grade submission reports
- Honor calculation reports
- Certificate generation reports

**Export Formats:**
- PDF reports
- Excel exports
- CSV data exports

**Location:** `app/Http/Controllers/Admin/ReportsController.php`

### 8.4 Role-Based Access Control

The system implements comprehensive RBAC through middleware and controller-level checks.

#### Middleware System

**Role-Specific Middleware:**
- `AdminMiddleware` - Admin only
- `RegistrarMiddleware` - Registrar access
- `PrincipalMiddleware` - Principal access
- `ChairpersonMiddleware` - Chairperson access (College only)
- `InstructorMiddleware` - Instructor access
- `TeacherMiddleware` - Teacher access
- `AdviserMiddleware` - Adviser access
- `StudentMiddleware` - Student access
- `ParentMiddleware` - Parent access

**Generic Middleware:**
- `EnsureRole` - Flexible role checking
- `CheckMaintenanceMode` - System maintenance mode
- `GuestMiddleware` - Guest access only

#### Data Isolation

**By Role:**
- **Instructors/Teachers:** Only see assigned subjects/courses
- **Chairpersons:** Only see their department (College)
- **Principals:** See their assigned academic level
- **Students:** Only see own records
- **Parents:** Only see children's records

**Access Patterns:**
- Controllers filter data based on user role
- Query scopes ensure data isolation
- Relationship checks prevent unauthorized access

### 8.5 Notification System

**Location:** `app/Services/NotificationService.php`

#### Notification Types

1. **Grade Update Notifications**
   - Sent when grades are updated
   - Recipients: Student, Parent

2. **Honor Qualification Notifications**
   - Sent when student qualifies for honor
   - Recipients: Student, Parent

3. **Honor Approval Notifications**
   - Sent when honor is approved
   - Recipients: Student, Parent
   - Includes certificate download link

4. **Pending Approval Notifications**
   - Sent to Principal/Chairperson
   - Alerts about pending honor approvals

5. **Assignment Notifications**
   - Sent when instructor/teacher is assigned to subject
   - Recipients: Instructor/Teacher

6. **Account Creation Notifications**
   - Sent when new account is created
   - Recipients: User, Parent (if applicable)

#### Email Templates

**Location:** `app/Mail/`

**Templates:**
- `UserAccountCreatedEmail`
- `ParentAccountCreatedEmail`
- `GradeUpdateEmail`
- `HonorQualificationEmail`
- `StudentHonorQualificationEmail`
- `ParentHonorNotificationEmail`
- `PendingHonorApprovalEmail`
- `AssignmentNotificationEmail`
- `PasswordResetByAdminEmail`

#### Notification Features

- **Retry Mechanism:** Failed emails are retried
- **Error Tracking:** Failed notifications are logged
- **Queue System:** Uses Laravel queue for async processing
- **Broadcast Support:** Can send to multiple recipients
- **Notification History:** All notifications are logged

#### Notification Model

**Location:** `app/Models/Notification.php`

**Key Fields:**
- `type` - Notification type
- `recipient_id` - User who receives notification
- `entity_type` - Related entity type
- `entity_id` - Related entity ID
- `subject` - Email subject
- `body` - Email body
- `sent_at` - Sent timestamp
- `read_at` - Read timestamp
- `status` - Status (pending, sent, failed)
- `error_message` - Error if failed

---

## 9. Development Guide

### 9.1 Setup Instructions

#### Prerequisites

- **PHP:** 8.2 or higher
- **Composer:** Latest version
- **Node.js:** 18.x or higher
- **npm:** Latest version
- **Database:** PostgreSQL (Production) or MySQL (Local Development)

#### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd SFCG
   ```

2. **Install PHP Dependencies**
   ```bash
   composer install
   ```

3. **Install Node Dependencies**
   ```bash
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   
   Configure `.env` file:
   - Database connection (DB_CONNECTION, DB_HOST, DB_DATABASE, etc.)
   - Mail settings (MAIL_MAILER, MAIL_HOST, etc.)
   - Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
   - App URL (APP_URL)

5. **Database Setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Build Frontend Assets**
   ```bash
   npm run build
   ```

7. **Start Development Server**
   ```bash
   composer dev
   ```
   This runs:
   - Laravel server (http://localhost:8000)
   - Queue worker
   - Vite dev server
   - Log viewer (Pail)

### 9.2 Development Commands

#### Laravel Artisan Commands

**Database:**
```bash
php artisan migrate              # Run migrations
php artisan migrate:fresh        # Drop all tables and re-run migrations
php artisan migrate:refresh      # Rollback and re-run migrations
php artisan db:seed              # Run database seeders
php artisan db:seed --class=UserSeeder  # Run specific seeder
```

**Cache Management:**
```bash
php artisan cache:clear          # Clear application cache
php artisan config:clear         # Clear configuration cache
php artisan route:clear          # Clear route cache
php artisan view:clear           # Clear view cache
php artisan optimize:clear       # Clear all caches
```

**Queue Management:**
```bash
php artisan queue:work           # Process queued jobs
php artisan queue:listen         # Listen for queued jobs
php artisan queue:failed         # List failed jobs
php artisan queue:retry all      # Retry all failed jobs
```

**Other Useful Commands:**
```bash
php artisan tinker               # Laravel REPL
php artisan route:list           # List all routes
php artisan make:controller      # Create new controller
php artisan make:model           # Create new model
php artisan make:migration       # Create new migration
php artisan make:mail            # Create new mail class
```

#### npm Scripts

**Development:**
```bash
npm run dev                      # Start Vite dev server
npm run build                    # Build for production
npm run build:ssr                # Build with SSR support
```

**Code Quality:**
```bash
npm run lint                     # Run ESLint and fix issues
npm run format                   # Format code with Prettier
npm run format:check             # Check code formatting
npm run types                    # Type-check TypeScript
```

### 9.3 Code Conventions

#### PHP Coding Standards

- Follow **PSR-12** coding standard
- Use Laravel Pint for code formatting:
  ```bash
  ./vendor/bin/pint
  ```

**Naming Conventions:**
- Controllers: `PascalCase` (e.g., `UserManagementController`)
- Models: `PascalCase`, singular (e.g., `User`, `StudentGrade`)
- Services: `PascalCase` with `Service` suffix (e.g., `HonorCalculationService`)
- Migrations: `snake_case` with timestamp prefix
- Routes: `kebab-case` with role prefix (e.g., `admin.users.index`)

**Code Organization:**
- One class per file
- Use namespaces properly
- Group related functionality in directories
- Keep controllers thin, move logic to services

#### TypeScript Conventions

**Naming:**
- Components: `PascalCase` (e.g., `UserDashboard.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAuth`)
- Types/Interfaces: `PascalCase` (e.g., `User`, `StudentGrade`)
- Constants: `UPPER_SNAKE_CASE`

**File Organization:**
- One component per file
- Co-locate related files (component + types + styles)
- Use barrel exports (`index.ts`) for clean imports

**Component Structure:**
```typescript
// Imports
import React from 'react';
import { ... } from '@inertiajs/react';

// Types/Interfaces
interface Props { ... }

// Component
export default function Component({ prop1, prop2 }: Props) {
  // Hooks
  // State
  // Handlers
  // Render
  return (...);
}
```

### 9.4 Testing

#### PHPUnit Configuration

**Location:** `phpunit.xml`

**Running Tests:**
```bash
php artisan test                 # Run all tests
php artisan test --filter FeatureTestName
php artisan test --testsuite=Unit
php artisan test --coverage
```

**Test Structure:**
- Feature tests: `tests/Feature/`
- Unit tests: `tests/Unit/`

#### Test Database

- Uses separate test database
- Configured in `phpunit.xml`
- Resets between test runs

### 9.5 Environment Variables Reference

#### Database
```
DB_CONNECTION=mysql              # or pgsql for PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sfcg_db
DB_USERNAME=root
DB_PASSWORD=
```

#### Mail Configuration
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@sfcg.edu
MAIL_FROM_NAME="SFCG Academic System"
```

#### Google OAuth
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

#### Application
```
APP_NAME="SFCG Academic Management System"
APP_ENV=local
APP_KEY=                           # Generated by key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000
```

#### Queue
```
QUEUE_CONNECTION=database          # Use database queue driver
```

### 9.6 Deployment Considerations

#### Production Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate application key
- [ ] Run database migrations
- [ ] Build frontend assets (`npm run build`)
- [ ] Set up queue worker (supervisor/systemd)
- [ ] Configure cron for Laravel scheduler
- [ ] Set up file storage symlink
- [ ] Configure mail settings
- [ ] Set up SSL certificates
- [ ] Configure backup procedures
- [ ] Set up monitoring/logging

#### Queue Worker Setup

**Supervisor Configuration:**
```ini
[program:sfcg-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/worker.log
```

#### Database Migrations in Production

```bash
php artisan migrate --force       # Run migrations without confirmation
```

#### Asset Building

```bash
npm run build                     # Build optimized assets
```

---

## 10. Appendix

### 10.1 Role File Locations Reference

This section provides a comprehensive list of all file locations organized by user role. Use this as a quick reference to find role-specific files.

#### 🔴 Admin Role Files

**Backend Controllers:**
- `app/Http/Controllers/Admin/DashboardController.php`
- `app/Http/Controllers/Admin/UserManagementController.php`
- `app/Http/Controllers/Admin/AcademicController.php`
- `app/Http/Controllers/Admin/SectionController.php`
- `app/Http/Controllers/Admin/CertificateController.php`
- `app/Http/Controllers/Admin/ParentManagementController.php`
- `app/Http/Controllers/Admin/NotificationController.php`
- `app/Http/Controllers/Admin/ReportsController.php`
- `app/Http/Controllers/Admin/SecurityController.php`
- `app/Http/Controllers/Admin/ActivityLogController.php`
- `app/Http/Controllers/Admin/SettingsController.php`
- `app/Http/Controllers/Admin/InstructorSubjectAssignmentController.php`
- `app/Http/Controllers/Admin/StudentSubjectController.php`

**Middleware:**
- `app/Http/Middleware/AdminMiddleware.php`
- `app/Http/Middleware/EnsureAdmin.php`

**Routes:**
- `routes/admin.php` (587+ endpoints)

**Frontend Pages:**
- `resources/js/pages/Admin/Dashboard.tsx`
- `resources/js/pages/Admin/AccountManagement/` (Create, Edit, List, View)
  - `resources/js/pages/Admin/AccountManagement/Administrators/`
  - `resources/js/pages/Admin/AccountManagement/Registrars/`
  - `resources/js/pages/Admin/AccountManagement/Principals/`
  - `resources/js/pages/Admin/AccountManagement/Chairpersons/`
  - `resources/js/pages/Admin/AccountManagement/Instructors/`
  - `resources/js/pages/Admin/AccountManagement/Teachers/`
  - `resources/js/pages/Admin/AccountManagement/Advisers/`
  - `resources/js/pages/Admin/AccountManagement/Students/`
  - `resources/js/pages/Admin/AccountManagement/Parents/`
- `resources/js/pages/Admin/Academic/` (Index, Levels, Sections, Subjects, Programs, Grading, Honors)
  - `resources/js/pages/Admin/Academic/Honors/` (Elementary, JuniorHighSchool, SeniorHighSchool, College)
  - `resources/js/pages/Admin/Academic/Certificates/Index.tsx`
- `resources/js/pages/Admin/Reports/Index.tsx`
- `resources/js/pages/Admin/Notifications/Index.tsx`
- `resources/js/pages/Admin/Security/` (Index, ActivityLogs, LoginSessions)
- `resources/js/pages/Admin/Settings.tsx`

**Frontend Components:**
- `resources/js/components/admin/sidebar.tsx`
- `resources/js/components/admin/header.tsx`
- `resources/js/components/admin/PasswordResetModal.tsx`

---

#### 🔵 Registrar Role Files

**Backend Controllers:**
- `app/Http/Controllers/Registrar/RegistrarController.php`
- `app/Http/Controllers/Registrar/RegistrarUserManagementController.php`
- `app/Http/Controllers/Registrar/RegistrarAcademicController.php`
- `app/Http/Controllers/Registrar/RegistrarCertificateController.php`
- `app/Http/Controllers/Registrar/RegistrarParentManagementController.php`
- `app/Http/Controllers/Registrar/ReportsController.php`
- `app/Http/Controllers/Registrar/TeacherSubjectAssignmentController.php`
- `app/Http/Controllers/Registrar/InstructorSubjectAssignmentController.php`
- `app/Http/Controllers/Registrar/StudentSubjectController.php`

**Middleware:**
- `app/Http/Middleware/RegistrarMiddleware.php`

**Routes:**
- `routes/registrar.php`

**Frontend Pages:**
- `resources/js/pages/Registrar/Dashboard.tsx`
- `resources/js/pages/Registrar/Users/` (Index, Show, Edit)
- `resources/js/pages/Registrar/Parents/` (Index, Show, Edit)
- `resources/js/pages/Registrar/Academic/` (Index, Levels, Sections, Subjects, Programs, Grading)
  - `resources/js/pages/Registrar/Academic/Honors/` (Elementary, JuniorHighSchool, SeniorHighSchool, College)
  - `resources/js/pages/Registrar/Academic/Certificates/Index.tsx`
  - `resources/js/pages/Registrar/Academic/AssignTeachers.tsx`
  - `resources/js/pages/Registrar/Academic/AssignInstructors.tsx`
  - `resources/js/pages/Registrar/Academic/AssignAdvisers.tsx`
- `resources/js/pages/Registrar/Reports/Index.tsx`
- `resources/js/pages/Registrar/Settings.tsx`

**Frontend Components:**
- `resources/js/components/registrar/sidebar.tsx`
- `resources/js/components/registrar/header.tsx`
- `resources/js/components/registrar/PasswordResetModal.tsx`

---

#### 🟣 Principal Role Files

**Backend Controllers:**
- `app/Http/Controllers/Principal/DashboardController.php`
- `app/Http/Controllers/Principal/HonorTrackingController.php`
- `app/Http/Controllers/Principal/ReportsController.php`
- `app/Http/Controllers/Principal/AccountController.php`

**Middleware:**
- `app/Http/Middleware/PrincipalMiddleware.php`

**Routes:**
- `routes/principal.php`

**Frontend Pages:**
- `resources/js/pages/Principal/Dashboard.tsx`
- `resources/js/pages/Principal/Honors/` (Index, Pending, Review)
- `resources/js/pages/Principal/Reports/` (Index, AcademicPerformance, GradeTrends, HonorStatistics)
- `resources/js/pages/Principal/Account/` (Index, Edit)

**Frontend Components:**
- `resources/js/components/principal/sidebar.tsx`
- `resources/js/components/principal/header.tsx`

---

#### 🟡 Chairperson Role Files

**Backend Controllers:**
- `app/Http/Controllers/Chairperson/ChairpersonController.php`
- `app/Http/Controllers/Chairperson/GradeManagementController.php`
- `app/Http/Controllers/Chairperson/HonorTrackingController.php`
- `app/Http/Controllers/Chairperson/ReportsController.php`
- `app/Http/Controllers/Chairperson/AccountController.php`

**Middleware:**
- `app/Http/Middleware/ChairpersonMiddleware.php`

**Routes:**
- `routes/chairperson.php`

**Frontend Pages:**
- `resources/js/pages/Chairperson/Dashboard.tsx`
- `resources/js/pages/Chairperson/Grades/` (Index, Pending, Review, All)
- `resources/js/pages/Chairperson/FinalAverages/` (Index, Pending, Review)
- `resources/js/pages/Chairperson/Honors/` (Index, Pending, Review)
- `resources/js/pages/Chairperson/Reports/` (Index, AcademicPerformance, DepartmentAnalysis)
- `resources/js/pages/Chairperson/Account/` (Index, Edit)

**Frontend Components:**
- `resources/js/components/chairperson/sidebar.tsx`

---

#### 🟢 Instructor Role Files (College)

**Backend Controllers:**
- `app/Http/Controllers/Instructor/DashboardController.php`
- `app/Http/Controllers/Instructor/GradeManagementController.php`
- `app/Http/Controllers/Instructor/CSVUploadController.php`
- `app/Http/Controllers/Instructor/HonorTrackingController.php`
- `app/Http/Controllers/Instructor/ProfileController.php`

**Middleware:**
- `app/Http/Middleware/InstructorMiddleware.php`

**Routes:**
- `routes/instructor.php`

**Frontend Pages:**
- `resources/js/pages/Instructor/Dashboard.tsx`
- `resources/js/pages/Instructor/Grades/` (Index, Create, Edit, Show, Upload)
- `resources/js/pages/Instructor/Honors/` (Index, ShowByLevel)
- `resources/js/pages/Instructor/Profile.tsx`

**Frontend Components:**
- `resources/js/components/instructor/sidebar.tsx`
- `resources/js/components/instructor/header.tsx`

---

#### 🟠 Teacher Role Files (Basic Education)

**Backend Controllers:**
- `app/Http/Controllers/Teacher/DashboardController.php`
- `app/Http/Controllers/Teacher/GradeManagementController.php`
- `app/Http/Controllers/Teacher/CSVUploadController.php`
- `app/Http/Controllers/Teacher/HonorTrackingController.php`
- `app/Http/Controllers/Teacher/ProfileController.php`
- `app/Http/Controllers/Teacher/TeacherController.php`

**Middleware:**
- `app/Http/Middleware/TeacherMiddleware.php`

**Routes:**
- `routes/teacher.php`

**Frontend Pages:**
- `resources/js/pages/Teacher/Dashboard.tsx`
- `resources/js/pages/Teacher/Grades/` (Index, Create, Edit, Show, ShowStudent, Upload)
- `resources/js/pages/Teacher/Honors/` (Index, ShowByLevel)
- `resources/js/pages/Teacher/Profile.tsx`

**Frontend Components:**
- `resources/js/components/teacher/sidebar.tsx`
- `resources/js/components/teacher/header.tsx`

---

#### 🔵 Adviser Role Files

**Backend Controllers:**
- `app/Http/Controllers/Adviser/DashboardController.php`
- `app/Http/Controllers/Adviser/GradeManagementController.php`
- `app/Http/Controllers/Adviser/CSVUploadController.php`
- `app/Http/Controllers/Adviser/HonorTrackingController.php`
- `app/Http/Controllers/Adviser/ProfileController.php`

**Middleware:**
- `app/Http/Middleware/AdviserMiddleware.php`

**Routes:**
- `routes/adviser.php`

**Frontend Pages:**
- `resources/js/pages/Adviser/Dashboard.tsx`
- `resources/js/pages/Adviser/Grades/` (Index, Create, Edit, Show, Upload)
- `resources/js/pages/Adviser/Honors/` (Index, ShowByLevel)
- `resources/js/pages/Adviser/Profile.tsx`

**Frontend Components:**
- `resources/js/components/adviser/sidebar.tsx`
- `resources/js/components/adviser/header.tsx`

---

#### 🟣 Student Role Files

**Backend Controllers:**
- `app/Http/Controllers/Student/DashboardController.php`
- `app/Http/Controllers/Student/GradesController.php`
- `app/Http/Controllers/Student/HonorsController.php`
- `app/Http/Controllers/Student/CertificatesController.php`
- `app/Http/Controllers/Student/CertificateController.php`
- `app/Http/Controllers/Student/SubjectsController.php`
- `app/Http/Controllers/Student/ProfileController.php`

**Middleware:**
- `app/Http/Middleware/StudentMiddleware.php`

**Routes:**
- `routes/student.php`

**Frontend Pages:**
- `resources/js/pages/Student/Dashboard.tsx`
- `resources/js/pages/Student/Grades/` (Index, Show)
- `resources/js/pages/Student/Honors/Index.tsx`
- `resources/js/pages/Student/Certificates/` (Index, Show)
- `resources/js/pages/Student/Subjects/Index.tsx`
- `resources/js/pages/Student/Profile.tsx`

**Frontend Components:**
- `resources/js/components/student/sidebar.tsx`
- `resources/js/components/student/app-header.tsx`
- `resources/js/components/student/app-sidebar.tsx`

---

#### 🟡 Parent Role Files

**Backend Controllers:**
- `app/Http/Controllers/Parent/ParentController.php`
- `app/Http/Controllers/Parent/ParentGradesController.php`
- `app/Http/Controllers/Parent/ParentHonorsController.php`
- `app/Http/Controllers/Parent/ParentCertificatesController.php`
- `app/Http/Controllers/Parent/ParentProfileController.php`
- `app/Http/Controllers/Parent/CertificateController.php`

**Middleware:**
- `app/Http/Middleware/ParentMiddleware.php`

**Routes:**
- `routes/parent.php`

**Frontend Pages:**
- `resources/js/pages/Parent/Dashboard.tsx`
- `resources/js/pages/Parent/Grades/` (Index, Show)
- `resources/js/pages/Parent/Honors/Index.tsx`
- `resources/js/pages/Parent/Certificates/` (Index, Show)
- `resources/js/pages/Parent/Profile/` (Index, Show)
- `resources/js/pages/Parent/Settings.tsx`

**Frontend Components:**
- `resources/js/components/parent/app-sidebar.tsx`
- `resources/js/components/parent/app-header.tsx`

---

#### 🔐 Authentication Files (Shared)

**Backend Controllers:**
- `app/Http/Controllers/Auth/LoginController.php`
- `app/Http/Controllers/Auth/RegisterController.php`
- `app/Http/Controllers/Auth/SocialAuthController.php`
- `app/Http/Controllers/HomeController.php`

**Middleware:**
- `app/Http/Middleware/GuestMiddleware.php`

**Routes:**
- `routes/web.php` (Public routes: home, login, register, OAuth)

**Frontend Pages:**
- `resources/js/pages/Landing.tsx`
- `resources/js/pages/Auth/Login.tsx`
- `resources/js/pages/Auth/Register.tsx`

---

#### 🔧 Shared/Common Files

**Middleware:**
- `app/Http/Middleware/EnsureRole.php` (Generic role checking)
- `app/Http/Middleware/CheckMaintenanceMode.php`
- `app/Http/Middleware/HandleInertiaRequests.php`
- `app/Http/Middleware/HandleAppearance.php`
- `app/Http/Middleware/UserMiddleware.php`

**Layout Components:**
- `resources/js/layouts/app-layout.tsx`
- `resources/js/layouts/auth-layout.tsx`

**Shared Components:**
- `resources/js/components/app-shell.tsx`
- `resources/js/components/app-header.tsx`
- `resources/js/components/app-sidebar.tsx`
- `resources/js/components/ui/` (32 shadcn/ui components)
- `resources/js/components/landing/` (Landing page components)

**Models:**
- `app/Models/User.php`
- `app/Models/StudentGrade.php`
- `app/Models/HonorResult.php`
- `app/Models/HonorCriterion.php`
- `app/Models/AcademicLevel.php`
- `app/Models/Subject.php`
- `app/Models/Section.php`
- `app/Models/Certificate.php`
- `app/Models/CertificateTemplate.php`
- `app/Models/GradingPeriod.php`
- `app/Models/ParentStudentRelationship.php`
- `app/Models/ActivityLog.php`
- `app/Models/Notification.php`
- (See [Model Relationship Summary](#103-model-relationship-summary) for complete list)

**Services:**
- `app/Services/AutomaticHonorCalculationService.php`
- `app/Services/CollegeHonorCalculationService.php`
- `app/Services/ElementaryHonorCalculationService.php`
- `app/Services/JuniorHighSchoolHonorCalculationService.php`
- `app/Services/SeniorHighSchoolHonorCalculationService.php`
- `app/Services/CertificateGenerationService.php`
- `app/Services/NotificationService.php`
- `app/Services/GradeCalculationService.php`
- `app/Services/ActivityLogService.php`
- `app/Services/StudentSubjectAssignmentService.php`
- `app/Services/InstructorStudentAssignmentService.php`
- `app/Services/TeacherStudentAssignmentService.php`

---

### 10.2 File Path Index

#### Backend Core Files

**Controllers:**
- `app/Http/Controllers/Admin/UserManagementController.php`
- `app/Http/Controllers/Instructor/GradeManagementController.php`
- `app/Http/Controllers/Principal/HonorTrackingController.php`
- `app/Http/Controllers/Chairperson/GradeManagementController.php`
- `app/Http/Controllers/Registrar/RegistrarController.php`

**Models:**
- `app/Models/User.php`
- `app/Models/StudentGrade.php`
- `app/Models/HonorResult.php`
- `app/Models/HonorCriterion.php`
- `app/Models/AcademicLevel.php`
- `app/Models/Subject.php`
- `app/Models/Certificate.php`

**Services:**
- `app/Services/AutomaticHonorCalculationService.php`
- `app/Services/CollegeHonorCalculationService.php`
- `app/Services/ElementaryHonorCalculationService.php`
- `app/Services/SeniorHighSchoolHonorCalculationService.php`
- `app/Services/CertificateGenerationService.php`
- `app/Services/NotificationService.php`
- `app/Services/GradeCalculationService.php`

**Middleware:**
- `app/Http/Middleware/AdminMiddleware.php`
- `app/Http/Middleware/InstructorMiddleware.php`
- `app/Http/Middleware/EnsureRole.php`

#### Frontend Core Files

**Pages:**
- `resources/js/pages/Admin/`
- `resources/js/pages/Instructor/`
- `resources/js/pages/Principal/`
- `resources/js/pages/Student/`
- `resources/js/pages/Parent/`

**Components:**
- `resources/js/components/ui/` - shadcn/ui components
- `resources/js/components/` - Custom components

**Layouts:**
- `resources/js/layouts/app-layout.tsx`
- `resources/js/layouts/auth-layout.tsx`

#### Routes

- `routes/web.php` - Public routes
- `routes/admin.php` - Admin routes
- `routes/instructor.php` - Instructor routes
- `routes/principal.php` - Principal routes
- `routes/registrar.php` - Registrar routes

#### Database

- `database/migrations/` - All migration files
- `database/seeders/` - Database seeders

### 10.2 Key Method Index

#### Grade Management

- `StudentGrade::isEditableByInstructor()` - Check edit permissions (5-day window)
- `StudentGrade::isEditableByAdviser()` - Check adviser edit permissions (3-day window)
- `StudentGrade::getEditStatus()` - Get current edit status
- `StudentGrade::percentageToCollegeScale()` - Convert percentage to college scale
- `StudentGrade::getCollegeScaleGrade()` - Get grade in college scale

#### Honor Calculation

- `AutomaticHonorCalculationService::calculateHonorsForStudent()` - Main calculation entry point
- `AutomaticHonorCalculationService::hasEnoughGradesForHonorCalculation()` - Validate grade count
- `AutomaticHonorCalculationService::createOrUpdateHonorResult()` - Persist honor results
- `CollegeHonorCalculationService::calculateCollegeHonorQualification()` - College-specific calculation
- `ElementaryHonorCalculationService::calculateElementaryHonorQualification()` - Elementary calculation

#### Certificate Generation

- `CertificateGenerationService::generateHonorCertificate()` - Generate certificate for honor
- `CertificateGenerationService::generateSerialNumber()` - Create unique serial number
- `CertificateGenerationService::getSignatoryDetails()` - Retrieve signatory information

### 10.3 Model Relationship Summary

#### User Model Relationships

- `hasMany(StudentGrade::class, 'student_id')` - Student's grades
- `hasMany(HonorResult::class, 'student_id')` - Student's honors
- `hasMany(Certificate::class, 'student_id')` - Student's certificates
- `belongsToMany(User::class, 'parent_student_relationships')` - Parent-student relationships
- `belongsTo(Section::class)` - Student's section
- `belongsTo(Course::class)` - College student's course
- `belongsTo(Strand::class)` - SHS student's strand
- `hasMany(TeacherSubjectAssignment::class, 'teacher_id')` - Teacher assignments
- `hasMany(InstructorSubjectAssignment::class, 'instructor_id')` - Instructor assignments

#### StudentGrade Model Relationships

- `belongsTo(User::class, 'student_id')` - Student
- `belongsTo(Subject::class)` - Subject/course
- `belongsTo(AcademicLevel::class)` - Academic level
- `belongsTo(GradingPeriod::class)` - Grading period
- `belongsTo(User::class, 'validated_by')` - Validator
- `belongsTo(User::class, 'approved_by')` - Approver
- `belongsTo(User::class, 'returned_by')` - Returner

#### HonorResult Model Relationships

- `belongsTo(User::class, 'student_id')` - Student
- `belongsTo(HonorType::class)` - Honor type
- `belongsTo(AcademicLevel::class)` - Academic level
- `belongsTo(GradingPeriod::class)` - Grading period (for SHS)
- `belongsTo(User::class, 'approved_by')` - Approver
- `belongsTo(User::class, 'rejected_by')` - Rejecter

### 10.4 Configuration Reference

#### Important Config Files

- `config/app.php` - Application configuration
- `config/database.php` - Database configuration
- `config/mail.php` - Mail configuration
- `config/inertia.php` - Inertia.js configuration
- `config/auth.php` - Authentication configuration

#### Route Files

- `routes/web.php` - Public routes (home, login, register)
- `routes/admin.php` - Admin routes (587+ endpoints)
- `routes/registrar.php` - Registrar routes
- `routes/principal.php` - Principal routes
- `routes/chairperson.php` - Chairperson routes
- `routes/instructor.php` - Instructor routes
- `routes/teacher.php` - Teacher routes
- `routes/adviser.php` - Adviser routes
- `routes/student.php` - Student routes
- `routes/parent.php` - Parent routes

---

## Documentation Summary

This comprehensive technical documentation covers:

✅ **System Overview** - Architecture, technology stack, user roles  
✅ **Backend Controllers** - Organized by role with key methods  
✅ **⭐ Grade Management System** - Detailed workflow, edit windows, CSV upload  
✅ **⭐ Honor System** - Calculation workflow, criteria, approval process  
✅ **Services Layer** - Business logic services with method details  
✅ **Models & Relationships** - Key models and their relationships  
✅ **Other Features** - Enrollment, certificates, reporting, notifications  
✅ **Development Guide** - Setup, commands, conventions, testing  
✅ **Appendix** - File paths, method index, relationships, configuration  

### Documentation Statistics

- **Total Lines:** 2,100+
- **Priority Sections:** Grade Management & Honor System (extra detailed)
- **Coverage:** 300+ files, 1000+ routes, 30+ database tables
- **Sections:** 10 major sections with subsections

### Future Expansion Areas

The following sections can be expanded further as needed:

- **Complete Models Documentation** - All 25 models with full relationship maps
- **Frontend Components** - Detailed component library documentation
- **Complete Database Schema** - Full ER diagram and table documentation
- **API Routes Complete** - All 1000+ routes with request/response formats
- **Testing Guide** - Comprehensive testing strategies and examples
- **Troubleshooting Guide** - Common issues and solutions
- **Performance Optimization** - Query optimization, caching strategies

---

**Document Version:** 1.0  
**Last Updated:** 2025  
**Maintained By:** SFCG Development Team


