# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- **Start development server**: `composer dev` (runs Laravel server, queue, logs, and Vite concurrently)
- **Frontend development**: `npm run dev` (Vite development server)
- **Build for production**: `npm run build`
- **Run tests**: `php artisan test` (Laravel tests), PHPUnit configuration in `phpunit.xml`
- **Linting**: `npm run lint` (ESLint with auto-fix)
- **Type checking**: `npm run types` (TypeScript type checking)
- **Code formatting**: `npm run format` (Prettier formatting)

### Laravel Commands
- **Install PHP dependencies**: `composer install`
- **Run migrations**: `php artisan migrate`
- **Generate application key**: `php artisan key:generate`
- **Clear caches**: `php artisan optimize:clear`
- **Queue processing**: `php artisan queue:listen --tries=1`

### Node/Frontend Commands
- **Install dependencies**: `npm install`
- **Format check**: `npm run format:check`
- **Build SSR**: `npm run build:ssr`

## Architecture Overview

### Technology Stack
- **Backend**: Laravel 12 (PHP 8.2+) with Inertia.js
- **Frontend**: React 19 with TypeScript, Tailwind CSS 4, shadcn/ui components
- **Build Tool**: Vite with Laravel plugin
- **Database**: MySQL with Eloquent ORM
- **Authentication**: Laravel Socialite (Google OAuth)
- **Mail**: Laravel Mail with various notification templates
- **File Processing**: Excel/CSV import/export with PhpSpreadsheet, PDF generation with DomPDF

### Role-Based System Architecture
The application is built around multiple user roles with dedicated controllers, routes, and frontend pages:

#### User Roles:
- **Admin**: System administration and global settings
- **Principal**: Academic oversight, grade/honor approvals for all levels
- **Chairperson**: Grade/honor management for College level only
- **Registrar**: Student enrollment, academic records management
- **Instructor/Teacher**: Grade management and course instruction
- **Adviser**: Class management and student guidance
- **Student**: Grade viewing and academic progress
- **Parent**: Children's academic progress monitoring

#### Route Structure:
Each role has its own route file (e.g., `routes/principal.php`, `routes/chairperson.php`) with middleware protection. Routes follow the pattern:
```
/{role}/{feature}/{action}
```

### Key Architectural Patterns

#### Backend Organization:
- **Controllers**: Organized by role in subdirectories (`app/Http/Controllers/{Role}/`)
- **Middleware**: Role-based access control with dedicated middleware for each role
- **Models**: Rich Eloquent models with relationships and business logic
- **Services**: Business logic separated into service classes (e.g., honor calculation services)
- **Mail**: Comprehensive notification system with role-specific email templates

#### Frontend Organization:
- **Pages**: Organized by role (`resources/js/pages/{Role}/`)
- **Components**: Shared UI components using shadcn/ui (`resources/js/components/ui/`)
- **Layouts**: Role-specific layouts with navigation (`resources/js/layouts/{role}/`)
- **Types**: TypeScript interfaces in `resources/js/types/`

#### Inertia.js Integration:
- Server-side rendering support configured
- Shared data passed from Laravel to React components
- Route helpers available via Ziggy package
- TypeScript path aliases: `@/*` maps to `resources/js/*`

### Academic System Features

#### Grade Management:
- Multi-level approval workflow (Instructor → Chairperson/Principal → Final)
- Academic level restrictions (Chairpersons handle College only, Principals handle Elementary/JHS/SHS)
- Grading period support with final average calculations
- CSV upload capabilities for bulk grade entry

#### Honor System:
- Automated honor calculation services for different academic levels
- GPA-based honor classifications (Dean's List, President's List, etc.)
- Approval workflow with notifications to students and parents
- Honor tracking and certificate generation

#### Reporting System:
- Academic performance analytics
- Grade trend analysis
- Honor statistics and distributions
- Export capabilities (PDF, Excel) for various reports

### Database Relationships:
Key model relationships include:
- User-Student-Parent relationships for family linking
- Grade assignments with subjects, courses, and academic levels
- Honor results tied to students with approval workflows
- Certificate management with template systems

### Development Conventions

#### Code Style:
- **PHP**: Laravel conventions, PSR-12 standards
- **TypeScript**: Strict mode enabled, React functional components preferred
- **CSS**: Tailwind CSS utility classes, custom components in shadcn/ui style
- **Prettier**: 4-space tabs, single quotes, 150 character line width, Tailwind class sorting

#### File Organization:
- Controllers grouped by role with clear naming conventions
- React components use PascalCase, organized by feature/role
- TypeScript interfaces defined inline or in dedicated type files
- API routes separated from web routes, following RESTful patterns

#### Testing:
- Laravel Feature and Unit tests
- PHPUnit configuration for Laravel testing
- Test database configuration separate from development

### Security Considerations:
- Role-based middleware protection on all routes
- Data isolation between user roles (e.g., Chairpersons can't access elementary data)
- Parent-child relationship validation for data access
- CSRF protection enabled, secure password handling

### Performance Features:
- Laravel caching configured
- Vite for optimized frontend bundling
- Database indexing on frequently queried fields
- Eager loading used to prevent N+1 query problems

## Important Notes:
- The system enforces strict academic level restrictions based on user roles
- All academic operations include comprehensive logging and notifications
- The frontend is forced to light mode (dark mode disabled in app.tsx)
- Email notifications are sent for major academic events (grade approvals, honor qualifications)