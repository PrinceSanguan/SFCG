import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    type: 'quarter' | 'semester';
    academic_level_id: number;
    parent_id?: number | null;
    period_type: 'quarter' | 'midterm' | 'prefinal' | 'final';
    semester_number?: number | null;
    weight: number;
    is_calculated: boolean;
    include_midterm?: boolean;
    include_prefinal?: boolean;
    start_date: string;
    end_date: string;
    sort_order: number;
    is_active: boolean;
    academic_level?: AcademicLevel;
    parent?: GradingPeriod | null;
    children?: GradingPeriod[];
}

export interface Grade {
    id: number;
    student_id: number;
    subject_id: number;
    academic_level_id: number;
    grading_period_id: number;
    school_year: string;
    year_of_study: number | null;
    grade: number;
    is_submitted_for_validation: boolean;
    submitted_at: string | null;
    validated_at: string | null;
    validated_by: number | null;
    created_at: string;
    updated_at: string;
    gradingPeriod: GradingPeriod | null;
}

export interface Track {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
