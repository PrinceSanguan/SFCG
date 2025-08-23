# Registrar System - SFCG School Management System

## Overview

The Registrar System is a comprehensive role-based access control system that provides registrars with the ability to manage student records, academic information, and user accounts without the ability to create new accounts. This system is designed to maintain data integrity while providing registrars with the tools they need to perform their duties effectively.

## Key Features

### ✅ What Registrars CAN Do

1. **User Management (View & Edit Only)**
   - View all users in the system
   - Edit existing user information
   - Reset user passwords
   - Manage user profiles
   - View user activity logs

2. **Academic Management**
   - Access academic levels and curriculum
   - View and manage grading periods
   - Handle subjects and courses
   - Manage honor systems and criteria
   - Handle instructor, teacher, and adviser assignments

3. **Student Records**
   - View all student information
   - Edit student details
   - Manage student grades
   - Handle honor roll calculations
   - Generate academic reports

4. **Certificate Management**
   - View certificate templates
   - Generate certificates for students
   - Download and print certificates
   - Search certificate records

5. **Reports & Archiving**
   - Generate grade reports
   - Create honor statistics
   - Archive academic records
   - Export data for analysis

6. **Notifications (Limited)**
   - View notification history
   - Access recipient lists
   - Resend failed notifications
   - **Note: Cannot send Gmail announcements**

7. **Activity Logs**
   - View system activity logs
   - Monitor user actions
   - Track changes to records

### ❌ What Registrars CANNOT Do

1. **Account Creation**
   - Cannot create new staff accounts
   - Cannot create new student accounts
   - Cannot create new parent accounts
   - Cannot create new administrator accounts

2. **System Administration**
   - Cannot access system audit logs
   - Cannot manage security settings
   - Cannot create system backups
   - Cannot terminate user sessions

3. **Gmail Announcements**
   - Cannot send general announcements via Gmail
   - Cannot broadcast system-wide notifications

## System Architecture

### Middleware
- **RegistrarMiddleware**: Ensures only users with 'registrar' role can access registrar routes
- **EnsureRole**: Provides role-based access control for shared functionality

### Controllers
- **RegistrarController**: Handles registrar-specific dashboard and settings
- **Admin Controllers**: Reused for user management and academic functions

### Routes
- **`/registrar/*`**: All registrar-specific routes
- **`/registrar/academic/*`**: Academic management routes
- **`/registrar/reports/*`**: Reporting and archiving routes
- **`/registrar/notifications/*`**: Limited notification routes

### Frontend Components
- **Registrar Sidebar**: Navigation with all available functions
- **Registrar Header**: User profile and settings access
- **Registrar Dashboard**: Overview of system statistics
- **Registrar Settings**: Profile and password management

## Installation & Setup

### 1. Middleware Registration
The registrar middleware is automatically registered in `bootstrap/app.php`:

```php
$middleware->alias([
    'admin' => EnsureAdmin::class,
    'role' => EnsureRole::class,
    'registrar' => RegistrarMiddleware::class,
]);
```

### 2. Route Loading
Registrar routes are loaded in `bootstrap/app.php`:

```php
Route::middleware('web')
    ->group(base_path('routes/registrar.php'));
```

### 3. Database Seeding
Registrar accounts are created via the UserSeeder:

```php
User::create([
    'name' => 'Maria Registrar',
    'email' => 'registrar@school.edu',
    'password' => bcrypt('registrar123'),
    'user_role' => 'registrar',
]);
```

## Usage

### Accessing the Registrar Dashboard

1. **Login**: Use registrar credentials (e.g., `registrar@school.edu` / `registrar123`)
2. **Navigate**: Access `/registrar/dashboard`
3. **Use Sidebar**: Navigate through available functions

### Key Navigation Paths

- **Dashboard**: `/registrar/dashboard`
- **User Management**: `/registrar/users`
- **Academic Management**: `/registrar/academic`
- **Reports**: `/registrar/reports`
- **Settings**: `/registrar/settings`

## Security Features

### Role-Based Access Control
- Only users with 'registrar' role can access registrar routes
- Middleware validates user permissions on every request
- Automatic redirect for unauthorized access

### Data Protection
- Registrars cannot create new accounts (prevents privilege escalation)
- Limited access to system administration functions
- Audit trail for all user actions

## Customization

### Adding New Functions
1. **Controller**: Add methods to `RegistrarController`
2. **Routes**: Define in `routes/registrar.php`
3. **Frontend**: Create React components in `resources/js/pages/Registrar/`
4. **Sidebar**: Update `resources/js/components/Registrar/sidebar.tsx`

### Modifying Permissions
1. **Middleware**: Update `RegistrarMiddleware` for role changes
2. **Routes**: Modify middleware groups in route files
3. **Frontend**: Update component access controls

## Testing

### Test Accounts
- **Email**: `registrar@school.edu`
- **Password**: `registrar123`
- **Role**: `registrar`

### Route Testing
```bash
php artisan route:list --name=registrar
```

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Verify user has 'registrar' role
   - Check middleware registration
   - Ensure routes are properly loaded

2. **Missing Routes**
   - Verify `routes/registrar.php` exists
   - Check `bootstrap/app.php` route loading
   - Clear route cache: `php artisan route:clear`

3. **Component Errors**
   - Verify React components exist
   - Check import paths
   - Ensure TypeScript compilation

### Debug Commands
```bash
# Clear all caches
php artisan optimize:clear

# List registrar routes
php artisan route:list --name=registrar

# Check middleware
php artisan route:list --middleware=registrar
```

## Future Enhancements

### Planned Features
- Advanced reporting tools
- Bulk data import/export
- Enhanced certificate management
- Mobile-responsive interface

### Integration Points
- Student Information System (SIS)
- Learning Management System (LMS)
- Financial Management System
- Parent Portal

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Compatibility**: Laravel 12, React 18, TypeScript 5
