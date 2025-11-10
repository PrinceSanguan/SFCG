import React, { useState, useEffect, useMemo } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import {
    FileText,
    Award,
    Archive,
    Download,
    GraduationCap,
    Users,
    FileSpreadsheet,
    FileX,
    Loader2
} from 'lucide-react';
import { Sidebar } from '@/components/registrar/sidebar';
import { Header } from '@/components/registrar/header';

interface User { 
    name: string; 
    email: string; 
    user_role: string; 
}

interface AcademicLevel { 
    id: number; 
    name: string; 
    key: string; 
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
    sort_order: number;
    parent_id?: number | null;
    type: 'quarter' | 'semester';
    period_type?: 'quarter' | 'midterm' | 'prefinal' | 'final';
    semester_number?: number | null;
    is_calculated?: boolean;
    parent?: GradingPeriod;
    children?: GradingPeriod[];
}

interface HonorType {
    id: number;
    name: string;
    scope: string;
}

interface Track {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
}

interface Strand {
    id: number;
    name: string;
    code: string;
    track_id: number;
    track?: Track;
}

interface Department {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
}

interface Course {
    id: number;
    name: string;
    code: string;
    department_id: number;
    is_active: boolean;
    department?: Department;
}

interface Section {
    id: number;
    name: string;
    academic_level_id: number;
    specific_year_level: string;
    track_id?: number;
    strand_id?: number;
    department_id?: number;
    course_id?: number;
    track?: Track;
    strand?: Strand;
    department?: Department;
    course?: Course;
}

interface Props {
    user: User;
    academicLevels: AcademicLevel[];
    schoolYears: string[];
    currentSchoolYear: string;
    gradingPeriods: GradingPeriod[];
    honorTypes: HonorType[];
    sections: Section[];
    tracks: Track[];
    strands: Strand[];
    departments: Department[];
    courses: Course[];
    stats: {
        total_students: number;
        total_certificates: number;
        total_honors: number;
        active_periods: number;
    };
}

export default function RegistrarReportsIndex({ user, academicLevels, schoolYears, currentSchoolYear, gradingPeriods, honorTypes, sections, tracks, strands, departments, courses, stats }: Props) {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('grade-reports');

    // Class Section Reports filtering state
    const [filteredSections, setFilteredSections] = useState<Section[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [filteredStrands, setFilteredStrands] = useState<Strand[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

    // Honor Statistics filtering state
    const [filteredSectionsHonor, setFilteredSectionsHonor] = useState<Section[]>([]);
    const [filteredTracksHonor, setFilteredTracksHonor] = useState<Track[]>([]);
    const [filteredStrandsHonor, setFilteredStrandsHonor] = useState<Strand[]>([]);
    const [filteredDepartmentsHonor, setFilteredDepartmentsHonor] = useState<Department[]>([]);
    const [filteredCoursesHonor, setFilteredCoursesHonor] = useState<Course[]>([]);

    // Grade Reports filtering state
    const [filteredSectionsGrade, setFilteredSectionsGrade] = useState<Section[]>([]);
    const [filteredTracksGrade, setFilteredTracksGrade] = useState<Track[]>([]);
    const [filteredStrandsGrade, setFilteredStrandsGrade] = useState<Strand[]>([]);
    const [filteredDepartmentsGrade, setFilteredDepartmentsGrade] = useState<Department[]>([]);
    const [filteredCoursesGrade, setFilteredCoursesGrade] = useState<Course[]>([]);

    // Archive filtering state (separate to avoid conflicts)
    const [filteredSectionsArchive, setFilteredSectionsArchive] = useState<Section[]>([]);
    const [filteredTracksArchive, setFilteredTracksArchive] = useState<Track[]>([]);
    const [filteredStrandsArchive, setFilteredStrandsArchive] = useState<Strand[]>([]);
    const [filteredDepartmentsArchive, setFilteredDepartmentsArchive] = useState<Department[]>([]);
    const [filteredCoursesArchive, setFilteredCoursesArchive] = useState<Course[]>([]);

    // Get CSRF token from Inertia page props
    const { props } = usePage();
    const csrfToken = (props as any).csrf_token || document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
    const [isGenerating, setIsGenerating] = useState(false);

    // Grade Report Form
    const { data: gradeData, setData: setGradeData, processing: gradeProcessing } = useForm({
        academic_level_id: 'all',
        grading_period_id: 'all',
        school_year: currentSchoolYear || schoolYears[0] || '',
        year_level: 'all',
        track_id: 'all',
        strand_id: 'all',
        department_id: 'all',
        course_id: '',
        section_id: '',
        format: 'pdf',
        include_statistics: '1',
    });

    // Honor Statistics Form
    const { data: honorData, setData: setHonorData, processing: honorProcessing } = useForm({
        academic_level_id: 'all',
        school_year: currentSchoolYear || schoolYears[0] || '',
        honor_type_id: 'all',
        year_level: 'all',
        track_id: 'all',
        strand_id: 'all',
        department_id: 'all',
        course_id: 'all',
        section_id: 'all',
        format: 'pdf',
    });

    // Archive Records Form
    const { data: archiveData, setData: setArchiveData, processing: archiveProcessing } = useForm({
        academic_level_id: '',
        school_year: schoolYears[0] || '',
        year_level: 'all',
        track_id: 'all',
        strand_id: 'all',
        department_id: 'all',
        course_id: '',
        section_id: '',
        include_grades: '1',
        include_honors: '1',
        include_certificates: '1',
        format: 'excel',
    });

    // Class Section Report Form
    const { data: sectionData, setData: setSectionData, processing: sectionProcessing } = useForm({
        academic_level_id: '',
        year_level: 'all',
        track_id: 'all',
        strand_id: 'all',
        department_id: 'all',
        course_id: '',
        section_id: '',
        school_year: currentSchoolYear || schoolYears[0] || '',
        include_grades: false as boolean,
        format: 'pdf',
    });

    // Filter honor types based on selected academic level
    const filteredHonorTypes = useMemo(() => {
        if (!honorData.academic_level_id || honorData.academic_level_id === 'all') {
            // If no specific level selected, show all honor types
            return honorTypes;
        }

        const selectedLevel = academicLevels.find(l => l.id.toString() === honorData.academic_level_id);
        if (!selectedLevel) return honorTypes;

        const isCollege = selectedLevel.key === 'college';

        if (isCollege) {
            // For College: show only college-scoped honor types
            return honorTypes.filter(type => type.scope === 'college');
        } else {
            // For Elementary, JHS, SHS: show basic and advanced honor types (exclude college)
            return honorTypes.filter(type => type.scope === 'basic' || type.scope === 'advanced');
        }
    }, [honorData.academic_level_id, honorTypes, academicLevels]);

    // Log initial data on mount for Class Section Report
    useEffect(() => {
        console.log('=== [REGISTRAR] CLASS SECTION REPORT - PAGE LOADED ===');
        console.log('[REGISTRAR] Available Academic Levels:', academicLevels);
        console.log('[REGISTRAR] Available School Years:', schoolYears);
        console.log('[REGISTRAR] Current School Year:', currentSchoolYear);
        console.log('[REGISTRAR] Initial Section Data:', sectionData);
        console.log('[REGISTRAR] Available Sections:', sections);
        console.log('[REGISTRAR] Available Tracks:', tracks);
        console.log('[REGISTRAR] Available Strands:', strands);
        console.log('[REGISTRAR] Available Departments:', departments);
        console.log('[REGISTRAR] Available Courses:', courses);
    }, []);

    // Filter sections based on academic level and cascading filters
    useEffect(() => {
        console.log('=== [REGISTRAR] CLASS SECTION FILTER TRIGGERED ===');
        console.log('[REGISTRAR] Form Data:', {
            academic_level_id: sectionData.academic_level_id,
            year_level: sectionData.year_level,
            track_id: sectionData.track_id,
            strand_id: sectionData.strand_id,
            department_id: sectionData.department_id,
            course_id: sectionData.course_id,
            school_year: sectionData.school_year
        });
        console.log('[REGISTRAR] Total available sections:', sections.length);
        console.log('[REGISTRAR] Sample sections:', sections.slice(0, 3).map(s => ({
            id: s.id,
            name: s.name,
            academic_level_id: s.academic_level_id,
            year_level: s.specific_year_level,
            track_id: s.track_id,
            strand_id: s.strand_id,
            department_id: s.department_id,
            course_id: s.course_id,
            school_year: (s as any).school_year
        })));

        // Show College sections in table format for easy debugging
        const collegeSections = sections.filter(s => {
            const collegeLevel = academicLevels.find(level => level.key === 'college');
            return collegeLevel && s.academic_level_id === collegeLevel.id;
        });
        if (collegeSections.length > 0) {
            console.log('[REGISTRAR] College Sections Table:');
            console.table(collegeSections.map(s => ({
                ID: s.id,
                Name: s.name,
                Year: s.specific_year_level,
                Dept: s.department_id,
                Course: s.course_id,
                'School Year': (s as any).school_year
            })));
        }

        if (!sectionData.academic_level_id) {
            setFilteredSections([]);
            setFilteredTracks([]);
            setFilteredStrands([]);
            setFilteredDepartments([]);
            setFilteredCourses([]);
            return;
        }

        const levelId = parseInt(sectionData.academic_level_id);
        const selectedLevel = academicLevels.find(level => level.id === levelId);

        console.log('[REGISTRAR] Selected Level:', selectedLevel);

        if (!selectedLevel) {
            setFilteredSections([]);
            return;
        }

        // Filter sections based on academic level type
        let filtered = sections.filter(section => section.academic_level_id === levelId);
        console.log('[REGISTRAR] After academic level filter:', filtered.length, 'sections');

        // Apply school year filter if section has school_year property
        if (sectionData.school_year && filtered.length > 0) {
            const beforeCount = filtered.length;
            filtered = filtered.filter(section => {
                const sectionSchoolYear = (section as any).school_year;
                return !sectionSchoolYear || sectionSchoolYear === sectionData.school_year;
            });
            console.log(`[REGISTRAR] After school year filter (${sectionData.school_year}):`, filtered.length, 'sections (removed', beforeCount - filtered.length, 'sections)');
        }

        // Apply year level filter for all levels
        if (sectionData.year_level) {
            const beforeCount = filtered.length;
            filtered = filtered.filter(section => section.specific_year_level === sectionData.year_level);
            console.log(`[REGISTRAR] After year level filter (${sectionData.year_level}):`, filtered.length, 'sections (removed', beforeCount - filtered.length, 'sections)');
        }

        // SHS-specific filtering
        if (selectedLevel.key === 'senior_highschool') {
            if (sectionData.track_id) {
                const beforeCount = filtered.length;
                filtered = filtered.filter(section => section.track_id?.toString() === sectionData.track_id);
                console.log(`[REGISTRAR] After track filter (${sectionData.track_id}):`, filtered.length, 'sections (removed', beforeCount - filtered.length, 'sections)');
            }
            if (sectionData.strand_id) {
                const beforeCount = filtered.length;
                filtered = filtered.filter(section => section.strand_id?.toString() === sectionData.strand_id);
                console.log(`[REGISTRAR] After strand filter (${sectionData.strand_id}):`, filtered.length, 'sections (removed', beforeCount - filtered.length, 'sections)');
            }
        }

        // College-specific filtering
        if (selectedLevel.key === 'college') {
            if (sectionData.department_id) {
                const beforeCount = filtered.length;
                console.log(`[REGISTRAR] === DEPARTMENT FILTER DEBUG ===`);
                console.log(`[REGISTRAR] Looking for department_id:`, sectionData.department_id, `(type: ${typeof sectionData.department_id})`);
                console.log(`[REGISTRAR] Sample sections before department filter:`, filtered.slice(0, 3).map(s => ({
                    id: s.id,
                    name: s.name,
                    department_id: s.department_id,
                    department_id_type: typeof s.department_id,
                    toString: s.department_id?.toString(),
                    matches: s.department_id?.toString() === sectionData.department_id
                })));

                filtered = filtered.filter(section => {
                    const matches = section.department_id?.toString() === sectionData.department_id;
                    if (!matches && section.department_id) {
                        console.log(`[REGISTRAR] Section "${section.name}" filtered out: department_id ${section.department_id} (${typeof section.department_id}) !== ${sectionData.department_id} (${typeof sectionData.department_id})`);
                    }
                    return matches;
                });
                console.log(`[REGISTRAR] After department filter (${sectionData.department_id}):`, filtered.length, 'sections (removed', beforeCount - filtered.length, 'sections)');

                if (filtered.length === 0 && beforeCount > 0) {
                    console.error(`[REGISTRAR] ⚠️ DEPARTMENT FILTER ELIMINATED ALL SECTIONS!`);
                    console.log(`[REGISTRAR] Check if sections have department_id property and if values match`);
                }
            }
            if (sectionData.course_id) {
                const beforeCount = filtered.length;
                console.log(`[REGISTRAR] === COURSE FILTER DEBUG ===`);
                console.log(`[REGISTRAR] Looking for course_id:`, sectionData.course_id, `(type: ${typeof sectionData.course_id})`);
                console.log(`[REGISTRAR] Sample sections before course filter:`, filtered.slice(0, 3).map(s => ({
                    id: s.id,
                    name: s.name,
                    course_id: s.course_id,
                    course_id_type: typeof s.course_id,
                    toString: s.course_id?.toString(),
                    matches: s.course_id?.toString() === sectionData.course_id
                })));

                filtered = filtered.filter(section => {
                    const matches = section.course_id?.toString() === sectionData.course_id;
                    if (!matches && section.course_id) {
                        console.log(`[REGISTRAR] Section "${section.name}" filtered out: course_id ${section.course_id} (${typeof section.course_id}) !== ${sectionData.course_id} (${typeof sectionData.course_id})`);
                    }
                    return matches;
                });
                console.log(`[REGISTRAR] After course filter (${sectionData.course_id}):`, filtered.length, 'sections (removed', beforeCount - filtered.length, 'sections)');

                if (filtered.length === 0 && beforeCount > 0) {
                    console.error(`[REGISTRAR] ⚠️ COURSE FILTER ELIMINATED ALL SECTIONS!`);
                    console.log(`[REGISTRAR] Check if sections have course_id property and if values match`);
                }
            }
        }

        console.log('[REGISTRAR] === FINAL FILTERED SECTIONS ===');
        console.log('[REGISTRAR] Count:', filtered.length);
        if (filtered.length === 0) {
            console.warn('[REGISTRAR] ⚠️ WARNING: No sections matched the filters!');
            console.log('[REGISTRAR] Debugging tips:');
            console.log('[REGISTRAR] 1. Check if sections exist for this academic level');
            console.log('[REGISTRAR] 2. Try removing filters one by one to find which filter eliminates all sections');
            console.log('[REGISTRAR] 3. Check section properties match your filter values');
        } else {
            console.log('[REGISTRAR] Filtered sections:', filtered.map(s => ({
                id: s.id,
                name: s.name,
                year_level: s.specific_year_level,
                track_id: s.track_id,
                strand_id: s.strand_id,
                department_id: s.department_id,
                course_id: s.course_id
            })));
        }
        setFilteredSections(filtered);
    }, [sectionData.academic_level_id, sectionData.year_level, sectionData.track_id, sectionData.strand_id, sectionData.department_id, sectionData.course_id, sectionData.school_year, sections, academicLevels]);

    // Filter strands based on selected track (for SHS)
    useEffect(() => {
        if (sectionData.track_id) {
            const trackId = parseInt(sectionData.track_id);
            const filtered = strands.filter(strand => strand.track_id === trackId);
            console.log('[REGISTRAR] Filtered Strands for Track:', filtered);
            setFilteredStrands(filtered);
        } else {
            setFilteredStrands([]);
        }
    }, [sectionData.track_id, strands]);

    // Filter courses based on selected department (for College)
    useEffect(() => {
        if (sectionData.department_id) {
            const deptId = parseInt(sectionData.department_id);
            const filtered = courses.filter(course => course.department_id === deptId);
            console.log('[REGISTRAR] Filtered Courses for Department:', filtered);
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses([]);
        }
    }, [sectionData.department_id, courses]);

    // ========== Honor Statistics Filtering useEffect Hooks ==========

    // Filter sections for Honor Statistics based on academic level and cascading filters
    useEffect(() => {
        console.log('=== [REGISTRAR] HONOR STATISTICS FILTER TRIGGERED ===');
        console.log('[REGISTRAR HONOR] Academic Level ID:', honorData.academic_level_id);

        if (!honorData.academic_level_id || honorData.academic_level_id === 'all') {
            setFilteredSectionsHonor([]);
            setFilteredTracksHonor([]);
            setFilteredStrandsHonor([]);
            setFilteredDepartmentsHonor([]);
            setFilteredCoursesHonor([]);
            return;
        }

        const levelId = parseInt(honorData.academic_level_id);
        const selectedLevel = academicLevels.find(level => level.id === levelId);

        console.log('[REGISTRAR HONOR] Selected Level:', selectedLevel);

        if (!selectedLevel) {
            setFilteredSectionsHonor([]);
            return;
        }

        let filtered = sections.filter(section => section.academic_level_id === levelId);

        if (honorData.year_level) {
            filtered = filtered.filter(section => section.specific_year_level === honorData.year_level);
        }

        if (selectedLevel.key === 'senior_highschool') {
            if (honorData.track_id) {
                filtered = filtered.filter(section => section.track_id?.toString() === honorData.track_id);
            }
            if (honorData.strand_id) {
                filtered = filtered.filter(section => section.strand_id?.toString() === honorData.strand_id);
            }
        }

        if (selectedLevel.key === 'college') {
            if (honorData.department_id) {
                filtered = filtered.filter(section => section.department_id?.toString() === honorData.department_id);
            }
            if (honorData.course_id) {
                filtered = filtered.filter(section => section.course_id?.toString() === honorData.course_id);
            }
        }

        setFilteredSectionsHonor(filtered);
    }, [honorData.academic_level_id, honorData.year_level, honorData.track_id, honorData.strand_id, honorData.department_id, honorData.course_id, sections, academicLevels]);

    // Filter strands based on selected track (for Honor Statistics SHS)
    useEffect(() => {
        if (honorData.track_id) {
            const trackId = parseInt(honorData.track_id);
            const filtered = strands.filter(strand => strand.track_id === trackId);
            setFilteredStrandsHonor(filtered);
        } else {
            setFilteredStrandsHonor([]);
        }
    }, [honorData.track_id, strands]);

    // Filter courses based on selected department (for Honor Statistics College)
    useEffect(() => {
        if (honorData.department_id) {
            const deptId = parseInt(honorData.department_id);
            const filtered = courses.filter(course => course.department_id === deptId);
            setFilteredCoursesHonor(filtered);
        } else {
            setFilteredCoursesHonor([]);
        }
    }, [honorData.department_id, courses]);

    // ========== Grade Reports Filtering useEffect Hooks ==========

    // Filter sections for Grade Reports based on academic level and cascading filters
    useEffect(() => {
        console.log('=== [REGISTRAR] GRADE REPORTS FILTER TRIGGERED ===');
        console.log('[REGISTRAR GRADE] Academic Level ID:', gradeData.academic_level_id);

        if (!gradeData.academic_level_id || gradeData.academic_level_id === 'all') {
            setFilteredSectionsGrade([]);
            setFilteredTracksGrade([]);
            setFilteredStrandsGrade([]);
            setFilteredDepartmentsGrade([]);
            setFilteredCoursesGrade([]);
            return;
        }

        const levelId = parseInt(gradeData.academic_level_id);
        const selectedLevel = academicLevels.find(level => level.id === levelId);

        console.log('[REGISTRAR GRADE] Selected Level:', selectedLevel);

        if (!selectedLevel) {
            setFilteredSectionsGrade([]);
            return;
        }

        let filtered = sections.filter(section => section.academic_level_id === levelId);

        if (gradeData.year_level && gradeData.year_level !== 'all') {
            filtered = filtered.filter(section => section.specific_year_level === gradeData.year_level);
        }

        if (selectedLevel.key === 'senior_highschool') {
            if (gradeData.track_id && gradeData.track_id !== 'all') {
                filtered = filtered.filter(section => section.track_id?.toString() === gradeData.track_id);
            }
            if (gradeData.strand_id && gradeData.strand_id !== 'all') {
                filtered = filtered.filter(section => section.strand_id?.toString() === gradeData.strand_id);
            }
        }

        if (selectedLevel.key === 'college') {
            if (gradeData.department_id && gradeData.department_id !== 'all') {
                filtered = filtered.filter(section => section.department_id?.toString() === gradeData.department_id);
            }
            if (gradeData.course_id && gradeData.course_id !== '') {
                filtered = filtered.filter(section => section.course_id?.toString() === gradeData.course_id);
            }
        }

        setFilteredSectionsGrade(filtered);
    }, [gradeData.academic_level_id, gradeData.year_level, gradeData.track_id, gradeData.strand_id, gradeData.department_id, gradeData.course_id, sections, academicLevels]);

    // Filter strands based on year level and track (for Grade Reports SHS) - Progressive filtering
    useEffect(() => {
        console.log('[REGISTRAR GRADE] Filtering strands by year level and track');

        if (gradeData.academic_level_id && gradeData.academic_level_id !== 'all') {
            const levelId = parseInt(gradeData.academic_level_id);
            const selectedLevel = academicLevels.find(level => level.id === levelId);

            if (selectedLevel?.key === 'senior_highschool') {
                // Start with sections at this academic level
                let relevantSections = sections.filter(s => s.academic_level_id === levelId);

                // Filter by year level if selected
                if (gradeData.year_level && gradeData.year_level !== 'all') {
                    relevantSections = relevantSections.filter(
                        s => s.specific_year_level === gradeData.year_level
                    );
                }

                // Filter by track if selected
                if (gradeData.track_id && gradeData.track_id !== 'all') {
                    const trackId = parseInt(gradeData.track_id);
                    relevantSections = relevantSections.filter(
                        s => s.track_id === trackId
                    );
                }

                // Extract unique strand IDs from relevant sections
                const strandIds = new Set(
                    relevantSections
                        .map(s => s.strand_id)
                        .filter(id => id !== undefined && id !== null) as number[]
                );

                // Filter strands to only those with matching sections
                const filtered = strands.filter(strand => strandIds.has(strand.id));
                console.log('[REGISTRAR GRADE] Filtered strands count:', filtered.length, 'Strand IDs:', Array.from(strandIds));
                setFilteredStrandsGrade(filtered);
            } else {
                setFilteredStrandsGrade([]);
            }
        } else {
            setFilteredStrandsGrade([]);
        }
    }, [gradeData.academic_level_id, gradeData.year_level, gradeData.track_id, sections, academicLevels, strands]);

    // Filter courses based on department only (for Grade Reports College)
    useEffect(() => {
        console.log('[REGISTRAR GRADE] Filtering courses by department');

        if (gradeData.academic_level_id && gradeData.academic_level_id !== 'all') {
            const levelId = parseInt(gradeData.academic_level_id);
            const selectedLevel = academicLevels.find(level => level.id === levelId);

            if (selectedLevel?.key === 'college') {
                // Filter by department if selected - show ALL courses in that department
                if (gradeData.department_id && gradeData.department_id !== 'all') {
                    const deptId = parseInt(gradeData.department_id);
                    const filtered = courses.filter(course => course.department_id === deptId);
                    console.log('[REGISTRAR GRADE] Filtered courses for department:', filtered.length);
                    setFilteredCoursesGrade(filtered);
                } else {
                    setFilteredCoursesGrade([]);
                }
            } else {
                setFilteredCoursesGrade([]);
            }
        } else {
            setFilteredCoursesGrade([]);
        }
    }, [gradeData.academic_level_id, gradeData.department_id, academicLevels, courses]);

    // Filter departments based on year level (for Grade Reports College) - Progressive filtering
    useEffect(() => {
        console.log('[REGISTRAR GRADE] Filtering departments by year level');

        if (gradeData.academic_level_id && gradeData.academic_level_id !== 'all') {
            const levelId = parseInt(gradeData.academic_level_id);
            const selectedLevel = academicLevels.find(level => level.id === levelId);

            if (selectedLevel?.key === 'college') {
                // Start with sections at this academic level
                let relevantSections = sections.filter(s => s.academic_level_id === levelId);

                console.log('[REGISTRAR GRADE] Total college sections:', relevantSections.length);

                // Filter by year level if selected
                if (gradeData.year_level && gradeData.year_level !== 'all') {
                    relevantSections = relevantSections.filter(
                        s => s.specific_year_level === gradeData.year_level
                    );
                    console.log('[REGISTRAR GRADE] Sections matching year level:', relevantSections.length);
                }

                // Extract unique department IDs from relevant sections
                const departmentIds = new Set(
                    relevantSections
                        .map(s => s.department_id)
                        .filter(id => id !== undefined && id !== null) as number[]
                );

                console.log('[REGISTRAR GRADE] Unique department IDs:', Array.from(departmentIds));

                // Filter departments to only those with matching sections
                const filtered = departments.filter(dept => departmentIds.has(dept.id));
                console.log('[REGISTRAR GRADE] Filtered departments:', filtered.length);

                setFilteredDepartmentsGrade(filtered);
            } else {
                setFilteredDepartmentsGrade([]);
            }
        } else {
            setFilteredDepartmentsGrade([]);
        }
    }, [gradeData.academic_level_id, gradeData.year_level, sections, academicLevels, departments]);

    // Filter tracks based on year level (for Grade Reports SHS) - Progressive filtering
    useEffect(() => {
        console.log('[REGISTRAR GRADE] Filtering tracks by year level');

        if (gradeData.academic_level_id && gradeData.academic_level_id !== 'all') {
            const levelId = parseInt(gradeData.academic_level_id);
            const selectedLevel = academicLevels.find(level => level.id === levelId);

            if (selectedLevel?.key === 'senior_highschool') {
                // Start with sections at this academic level
                let relevantSections = sections.filter(s => s.academic_level_id === levelId);

                // Filter by year level if selected
                if (gradeData.year_level && gradeData.year_level !== 'all') {
                    relevantSections = relevantSections.filter(
                        s => s.specific_year_level === gradeData.year_level
                    );
                }

                // Extract unique track IDs from relevant sections
                const trackIds = new Set(
                    relevantSections
                        .map(s => s.track_id)
                        .filter(id => id !== undefined && id !== null) as number[]
                );

                // Filter tracks to only those with matching sections
                const filtered = tracks.filter(track => trackIds.has(track.id));
                console.log('[REGISTRAR GRADE] Filtered tracks count:', filtered.length, 'Track IDs:', Array.from(trackIds));
                setFilteredTracksGrade(filtered);
            } else {
                setFilteredTracksGrade([]);
            }
        } else {
            setFilteredTracksGrade([]);
        }
    }, [gradeData.academic_level_id, gradeData.year_level, sections, academicLevels, tracks]);

    // ===== Archive Records Filtering =====

    // Filter sections, tracks, departments for Archive based on academic level
    useEffect(() => {
        console.log('=== [REGISTRAR] ARCHIVE FILTER TRIGGERED ===');
        console.log('[REGISTRAR ARCHIVE] Academic Level ID:', archiveData.academic_level_id);

        if (!archiveData.academic_level_id) {
            setFilteredSectionsArchive([]);
            setFilteredTracksArchive([]);
            setFilteredStrandsArchive([]);
            setFilteredDepartmentsArchive([]);
            setFilteredCoursesArchive([]);
            return;
        }

        const levelId = parseInt(archiveData.academic_level_id);
        const selectedLevel = academicLevels.find(level => level.id === levelId);

        if (!selectedLevel) {
            console.log('[REGISTRAR ARCHIVE] Selected level not found');
            return;
        }

        console.log('[REGISTRAR ARCHIVE] Selected Level:', selectedLevel.name, selectedLevel.key);

        // Filter sections by academic level first
        let filtered = sections.filter(section => section.academic_level_id === levelId);
        console.log('[REGISTRAR ARCHIVE] Sections for level:', filtered.length);

        // Apply cascading filters based on academic level type
        if (selectedLevel.key === 'senior_highschool') {
            console.log('[REGISTRAR ARCHIVE] Processing SHS filters');
            setFilteredTracksArchive(tracks);

            if (archiveData.track_id && archiveData.track_id !== 'all') {
                console.log('[REGISTRAR ARCHIVE] Filtering by Track ID:', archiveData.track_id);
                filtered = filtered.filter(section => section.track_id?.toString() === archiveData.track_id);
            }

            if (archiveData.strand_id && archiveData.strand_id !== 'all') {
                console.log('[REGISTRAR ARCHIVE] Filtering by Strand ID:', archiveData.strand_id);
                filtered = filtered.filter(section => section.strand_id?.toString() === archiveData.strand_id);
            }

            if (archiveData.year_level && archiveData.year_level !== 'all') {
                console.log('[REGISTRAR ARCHIVE] Filtering by Year Level:', archiveData.year_level);
                filtered = filtered.filter(section => section.specific_year_level === archiveData.year_level);
            }
        }

        if (selectedLevel.key === 'college') {
            console.log('[REGISTRAR ARCHIVE] Processing College filters');
            setFilteredDepartmentsArchive(departments);

            if (archiveData.department_id && archiveData.department_id !== 'all') {
                console.log('[REGISTRAR ARCHIVE] Filtering by Department ID:', archiveData.department_id);
                filtered = filtered.filter(section => section.department_id?.toString() === archiveData.department_id);
            }

            if (archiveData.course_id && archiveData.course_id !== 'all') {
                console.log('[REGISTRAR ARCHIVE] Filtering by Course ID:', archiveData.course_id);
                filtered = filtered.filter(section => section.course_id?.toString() === archiveData.course_id);
            }

            if (archiveData.year_level && archiveData.year_level !== 'all') {
                console.log('[REGISTRAR ARCHIVE] Filtering by Year Level:', archiveData.year_level);
                filtered = filtered.filter(section => section.specific_year_level === archiveData.year_level);
            }
        }

        if (selectedLevel.key === 'elementary' || selectedLevel.key === 'junior_highschool') {
            console.log('[REGISTRAR ARCHIVE] Processing Elementary/JHS filters');

            if (archiveData.year_level && archiveData.year_level !== 'all') {
                console.log('[REGISTRAR ARCHIVE] Filtering by Year Level:', archiveData.year_level);
                filtered = filtered.filter(section => section.specific_year_level === archiveData.year_level);
            }
        }

        console.log('[REGISTRAR ARCHIVE] Final filtered sections:', filtered.length);
        setFilteredSectionsArchive(filtered);
    }, [archiveData.academic_level_id, archiveData.year_level, archiveData.track_id, archiveData.strand_id, archiveData.department_id, archiveData.course_id, sections, academicLevels, tracks, departments]);

    // Filter strands based on selected track (for Archive SHS)
    useEffect(() => {
        if (archiveData.track_id && archiveData.track_id !== 'all') {
            const trackId = parseInt(archiveData.track_id);
            const filtered = strands.filter(strand => strand.track_id === trackId);
            setFilteredStrandsArchive(filtered);
        } else {
            setFilteredStrandsArchive([]);
        }
    }, [archiveData.track_id, strands]);

    // Filter courses based on selected department (for Archive College)
    useEffect(() => {
        if (archiveData.department_id && archiveData.department_id !== 'all') {
            const deptId = parseInt(archiveData.department_id);
            const filtered = courses.filter(course => course.department_id === deptId);
            setFilteredCoursesArchive(filtered);
        } else {
            setFilteredCoursesArchive([]);
        }
    }, [archiveData.department_id, courses]);

    const handleGradeReport = (e: React.FormEvent) => {
        console.log('[REGISTRAR] === GRADE REPORT SUBMISSION STARTED ===');
        e.preventDefault();

        if (!csrfToken) {
            console.error('[REGISTRAR] CSRF token not found');
            alert('Session expired. Please refresh the page and try again.');
            return;
        }

        // Validate required fields
        if (!gradeData.school_year) {
            console.error('[REGISTRAR] School year not selected');
            alert('Please select a school year.');
            return;
        }

        console.log('[REGISTRAR] Grade report data:', gradeData);
        console.log('[REGISTRAR] Route URL:', route('registrar.reports.grade-report'));
        setIsGenerating(true);

        // Create a hidden iframe for download
        let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'download-iframe';
            iframe.name = 'download-iframe'; // IMPORTANT: name attribute must match form target
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            console.log('[REGISTRAR] Created download iframe with name:', iframe.name);
        } else {
            iframe.name = 'download-iframe';
            console.log('[REGISTRAR] Using existing download iframe, name set to:', iframe.name);
        }

        // Create a temporary form for file download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('registrar.reports.grade-report');
        form.target = 'download-iframe';

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Add form data
        Object.entries(gradeData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value?.toString() || '';
            form.appendChild(input);
        });

        // Add iframe load listener BEFORE submitting form
        iframe.onload = () => {
            console.log('[REGISTRAR] Iframe loaded at:', new Date().toISOString());
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    const body = iframeDoc.body;
                    const errorContainer = body?.querySelector('[data-error-type="no-data"]');
                    if (errorContainer) {
                        const errorTitle = body?.querySelector('.error-title')?.textContent?.trim() || 'No data found';
                        const errorMessage = body?.querySelector('.error-message')?.textContent?.trim() || 'Please adjust your filters and try again.';
                        console.warn('[REGISTRAR] No data found:', errorTitle);
                        addToast(`${errorTitle} ${errorMessage}`, 'warning', { duration: 5000 });
                        setTimeout(() => {
                            if (form.parentNode) {
                                document.body.removeChild(form);
                                console.log('[REGISTRAR] Form removed after error detection');
                            }
                        }, 100);
                        return;
                    }
                    addToast('Report generated successfully! Download should start automatically.', 'success', { duration: 3000 });
                }
            } catch (e) {
                console.log('[REGISTRAR] Could not access iframe content (normal for downloads):', e);
                addToast('Report generated! Check your downloads folder.', 'success', { duration: 3000 });
            }
            setTimeout(() => {
                if (form.parentNode) {
                    document.body.removeChild(form);
                    console.log('[REGISTRAR] Form removed from body after iframe load');
                }
            }, 100);
        };

        document.body.appendChild(form);
        console.log('[REGISTRAR] Form appended to body');

        // Small delay to ensure iframe is registered as a valid target
        setTimeout(() => {
            console.log('[REGISTRAR] Submitting form to iframe:', form.target);
            form.submit();
            console.log('[REGISTRAR] Form submitted at:', new Date().toISOString());
        }, 50);

        // Reset loading state after a delay
        setTimeout(() => {
            setIsGenerating(false);
        }, 2000);
    };

    const handleHonorStatistics = (e: React.FormEvent) => {
        console.log('[REGISTRAR] === HONOR STATISTICS SUBMISSION STARTED ===');
        e.preventDefault();

        if (!csrfToken) {
            console.error('[REGISTRAR] CSRF token not found');
            alert('Session expired. Please refresh the page and try again.');
            return;
        }

        console.log('[REGISTRAR] Honor statistics data:', honorData);
        console.log('[REGISTRAR] Route URL:', route('registrar.reports.honor-statistics'));

        // Validate required fields
        if (!honorData.school_year) {
            console.error('[REGISTRAR] School year is required');
            alert('Please select a school year before generating the report.');
            return;
        }

        setIsGenerating(true);

        // Create a hidden iframe for download
        let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'download-iframe';
            iframe.name = 'download-iframe'; // IMPORTANT: name attribute must match form target
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            console.log('[REGISTRAR] Created download iframe with name:', iframe.name);
        } else {
            iframe.name = 'download-iframe';
            console.log('[REGISTRAR] Using existing download iframe, name set to:', iframe.name);
        }

        // Create a temporary form for file download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('registrar.reports.honor-statistics');
        form.target = 'download-iframe';

        console.log('[REGISTRAR] Form action URL:', form.action);
        console.log('[REGISTRAR] Form target:', form.target);

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Add form data
        const formDataEntries: Record<string, string> = {};
        Object.entries(honorData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            // Handle boolean values properly for backend validation
            if (typeof value === 'boolean') {
                input.value = value ? '1' : '0';
            } else {
                input.value = value?.toString() || '';
            }
            formDataEntries[key] = input.value;
            form.appendChild(input);
        });

        console.log('[REGISTRAR] Form data being submitted:', formDataEntries);

        // Add iframe load listener BEFORE submitting form
        iframe.onload = () => {
            console.log('[REGISTRAR] Iframe loaded at:', new Date().toISOString());
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    const body = iframeDoc.body;
                    const bodyText = body?.textContent || '';
                    console.log('[REGISTRAR] Iframe body content length:', bodyText.length);
                    console.log('[REGISTRAR] Iframe body preview:', bodyText.substring(0, 500));

                    // Check for no-data error page
                    const errorContainer = body?.querySelector('[data-error-type="no-data"]');
                    if (errorContainer) {
                        const errorTitle = body?.querySelector('.error-title')?.textContent?.trim() || 'No data found';
                        const errorMessage = body?.querySelector('.error-message')?.textContent?.trim() || 'Please adjust your filters and try again.';
                        console.warn('[REGISTRAR] No data found:', errorTitle);
                        addToast(`${errorTitle} ${errorMessage}`, 'warning', { duration: 5000 });
                        setTimeout(() => {
                            if (form.parentNode) {
                                document.body.removeChild(form);
                                console.log('[REGISTRAR] Form removed after error detection');
                            }
                        }, 100);
                        return;
                    }

                    // Check for error messages
                    if (bodyText.includes('error') || bodyText.includes('Error') || bodyText.includes('Exception')) {
                        console.error('[REGISTRAR] Error detected in response:', bodyText.substring(0, 1000));
                        addToast('An error occurred while generating the report. Please check the Laravel logs.', 'error', { duration: 7000 });
                    } else {
                        addToast('Report generated successfully! Download should start automatically.', 'success', { duration: 3000 });
                    }
                }
            } catch (e) {
                console.log('[REGISTRAR] Could not access iframe content (this is normal for successful downloads):', e);
                addToast('Report generated! Check your downloads folder.', 'success', { duration: 3000 });
            }

            // Clean up form after processing
            setTimeout(() => {
                if (form.parentNode) {
                    document.body.removeChild(form);
                    console.log('[REGISTRAR] Form removed from body after iframe load');
                }
            }, 100);
        };

        document.body.appendChild(form);
        console.log('[REGISTRAR] Form appended to body');

        // Small delay to ensure iframe is registered as a valid target
        setTimeout(() => {
            console.log('[REGISTRAR] Submitting form to iframe:', form.target);
            form.submit();
            console.log('[REGISTRAR] Form submitted at:', new Date().toISOString());
        }, 50);

        // Reset loading state after a delay
        setTimeout(() => {
            console.log('[REGISTRAR] Resetting loading state at:', new Date().toISOString());
            setIsGenerating(false);
        }, 3000);
    };

    const handleArchiveRecords = (e: React.FormEvent) => {
        console.log('[REGISTRAR] === ARCHIVE RECORDS SUBMISSION STARTED ===');
        e.preventDefault();

        if (!csrfToken) {
            console.error('[REGISTRAR] CSRF token not found');
            alert('Session expired. Please refresh the page and try again.');
            return;
        }

        console.log('[REGISTRAR] Archive data:', archiveData);
        console.log('[REGISTRAR] Route URL:', route('registrar.reports.archive-records'));

        // Validate required fields
        if (!archiveData.academic_level_id) {
            console.error('[REGISTRAR] Academic level is required');
            alert('Please select an academic level before creating the archive.');
            return;
        }

        if (!archiveData.school_year) {
            console.error('[REGISTRAR] School year is required');
            alert('Please select a school year before creating the archive.');
            return;
        }

        // Validate at least one data type is selected
        if (!archiveData.include_grades && !archiveData.include_honors && !archiveData.include_certificates) {
            console.error('[REGISTRAR] No data types selected');
            alert('Please select at least one data type to include in the archive (grades, honors, or certificates).');
            return;
        }

        setIsGenerating(true);

        // Create a hidden iframe for download
        let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'download-iframe';
            iframe.name = 'download-iframe'; // IMPORTANT: name attribute must match form target
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            console.log('[REGISTRAR] Created download iframe with name:', iframe.name);
        } else {
            iframe.name = 'download-iframe';
            console.log('[REGISTRAR] Using existing download iframe, name set to:', iframe.name);
        }

        // Create a temporary form for file download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('registrar.reports.archive-records');
        form.target = 'download-iframe';

        console.log('[REGISTRAR] Form action URL:', form.action);
        console.log('[REGISTRAR] Form target:', form.target);

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Add form data
        const formDataEntries: Record<string, string> = {};
        Object.entries(archiveData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            // Handle boolean values properly for backend validation
            if (typeof value === 'boolean') {
                input.value = value ? '1' : '0';
            } else {
                input.value = value?.toString() || '';
            }
            formDataEntries[key] = input.value;
            form.appendChild(input);
        });

        console.log('[REGISTRAR] Form data being submitted:', formDataEntries);

        // Add iframe load listener BEFORE submitting form
        iframe.onload = () => {
            console.log('[REGISTRAR] Iframe loaded at:', new Date().toISOString());
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    const body = iframeDoc.body;
                    const bodyText = body?.textContent || '';
                    console.log('[REGISTRAR] Iframe body content length:', bodyText.length);
                    console.log('[REGISTRAR] Iframe body preview:', bodyText.substring(0, 500));

                    // Check for no-data error page
                    const errorContainer = body?.querySelector('[data-error-type="no-data"]');
                    if (errorContainer) {
                        const errorTitle = body?.querySelector('.error-title')?.textContent?.trim() || 'No data found';
                        const errorMessage = body?.querySelector('.error-message')?.textContent?.trim() || 'Please adjust your filters and try again.';
                        console.warn('[REGISTRAR] No data found:', errorTitle);
                        addToast(`${errorTitle} ${errorMessage}`, 'warning', { duration: 5000 });
                        setTimeout(() => {
                            if (form.parentNode) {
                                document.body.removeChild(form);
                                console.log('[REGISTRAR] Form removed after error detection');
                            }
                        }, 100);
                        return;
                    }

                    // Check for error messages
                    if (bodyText.includes('error') || bodyText.includes('Error') || bodyText.includes('Exception')) {
                        console.error('[REGISTRAR] Error detected in response:', bodyText.substring(0, 1000));
                        addToast('An error occurred while creating the archive. Please check the Laravel logs.', 'error', { duration: 7000 });
                    } else {
                        addToast('Archive created successfully! Download should start automatically.', 'success', { duration: 3000 });
                    }
                }
            } catch (e) {
                console.log('[REGISTRAR] Could not access iframe content (this is normal for successful downloads):', e);
                addToast('Archive created! Check your downloads folder.', 'success', { duration: 3000 });
            }

            // Clean up form after processing
            setTimeout(() => {
                if (form.parentNode) {
                    document.body.removeChild(form);
                    console.log('[REGISTRAR] Form removed from body after iframe load');
                }
            }, 100);
        };

        document.body.appendChild(form);
        console.log('[REGISTRAR] Form appended to body');

        // Small delay to ensure iframe is registered as a valid target
        setTimeout(() => {
            console.log('[REGISTRAR] Submitting form to iframe:', form.target);
            form.submit();
            console.log('[REGISTRAR] Form submitted at:', new Date().toISOString());
        }, 50);

        // Reset loading state after a delay
        setTimeout(() => {
            console.log('[REGISTRAR] Resetting loading state at:', new Date().toISOString());
            setIsGenerating(false);
        }, 3000);
    };

    const handleClassSectionReport = (e: React.FormEvent) => {
        console.log('=== [REGISTRAR] handleClassSectionReport CALLED ===');
        e.preventDefault();
        e.stopPropagation();

        console.log('=== [REGISTRAR] CLASS SECTION REPORT FORM SUBMISSION ===');
        console.log('[REGISTRAR] Form Data:', sectionData);

        if (!csrfToken) {
            console.error('[REGISTRAR] CSRF token not found');
            alert('Session expired. Please refresh the page and try again.');
            return;
        }

        console.log('[REGISTRAR] CSRF Token:', csrfToken);

        // Validate required fields
        if (!sectionData.academic_level_id) {
            console.error('[REGISTRAR] Validation failed: academic_level_id is required');
            alert('Please select an academic level.');
            return;
        }
        if (!sectionData.school_year) {
            console.error('[REGISTRAR] Validation failed: school_year is required');
            alert('Please select a school year.');
            return;
        }

        console.log('[REGISTRAR] Validation passed!');
        console.log('[REGISTRAR] Route URL:', route('registrar.reports.class-section-report'));

        setIsGenerating(true);

        // Create a hidden iframe for download
        let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'download-iframe';
            iframe.name = 'download-iframe'; // IMPORTANT: name attribute must match form target
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            console.log('[REGISTRAR] Created download iframe with name:', iframe.name);
        } else {
            iframe.name = 'download-iframe';
            console.log('[REGISTRAR] Using existing download iframe, name set to:', iframe.name);
        }

        // Create a temporary form for file download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('registrar.reports.class-section-report');
        form.target = 'download-iframe';

        console.log('[REGISTRAR] Form action URL:', form.action);
        console.log('[REGISTRAR] Form target:', form.target);

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Add form data with proper type conversion
        Object.entries(sectionData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            // Convert boolean to string for include_grades
            if (key === 'include_grades') {
                input.value = value ? '1' : '0';
            } else {
                input.value = value?.toString() || '';
            }
            form.appendChild(input);
        });

        console.log('[REGISTRAR] Form data being submitted');

        // Add iframe load listener BEFORE submitting form
        iframe.onload = () => {
            console.log('[REGISTRAR] Iframe loaded at:', new Date().toISOString());
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    const body = iframeDoc.body;
                    const errorContainer = body?.querySelector('[data-error-type="no-data"]');
                    if (errorContainer) {
                        const errorTitle = body?.querySelector('.error-title')?.textContent?.trim() || 'No data found';
                        const errorMessage = body?.querySelector('.error-message')?.textContent?.trim() || 'Please adjust your filters and try again.';
                        console.warn('[REGISTRAR] No data found:', errorTitle);
                        addToast(`${errorTitle} ${errorMessage}`, 'warning', { duration: 5000 });
                        setTimeout(() => {
                            if (form.parentNode) {
                                document.body.removeChild(form);
                                console.log('[REGISTRAR] Form removed after error detection');
                            }
                        }, 100);
                        return;
                    }
                    addToast('Report generated successfully! Download should start automatically.', 'success', { duration: 3000 });
                }
            } catch (e) {
                console.log('[REGISTRAR] Could not access iframe content (normal for downloads):', e);
                addToast('Report generated! Check your downloads folder.', 'success', { duration: 3000 });
            }
            setTimeout(() => {
                if (form.parentNode) {
                    document.body.removeChild(form);
                    console.log('[REGISTRAR] Form removed from body after iframe load');
                }
            }, 100);
        };

        document.body.appendChild(form);
        console.log('[REGISTRAR] Form appended to body');

        // Small delay to ensure iframe is registered as a valid target
        setTimeout(() => {
            console.log('[REGISTRAR] Submitting form to iframe:', form.target);
            form.submit();
            console.log('[REGISTRAR] Form submitted at:', new Date().toISOString());
        }, 50);

        // Reset loading state after a delay
        setTimeout(() => {
            setIsGenerating(false);
        }, 2000);
    };

    // Filter sections based on selected academic level
    useEffect(() => {
        if (sectionData.academic_level_id) {
            const levelId = parseInt(sectionData.academic_level_id);
            const filtered = sections.filter(section => section.academic_level_id === levelId);
            setFilteredSections(filtered);
        } else {
            setFilteredSections([]);
        }
    }, [sectionData.academic_level_id, sections]);

    // Organize grading periods - filter by academic level and type to eliminate duplicates
    const getOrganizedGradingPeriods = () => {
        console.log('[REGISTRAR GRADE] Organizing grading periods for academic level:', gradeData.academic_level_id);

        // When "All" is selected, show root periods only to avoid confusion
        if (gradeData.academic_level_id === 'all') {
            const rootPeriods = gradingPeriods
                .filter(period => !period.parent_id)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            console.log('[REGISTRAR GRADE] Showing root periods for "All":', rootPeriods.length);
            return rootPeriods;
        }

        const academicLevelId = parseInt(gradeData.academic_level_id);
        const selectedLevel = academicLevels.find(level => level.id === academicLevelId);

        if (!selectedLevel) {
            console.log('[REGISTRAR GRADE] Selected level not found');
            return [];
        }

        console.log('[REGISTRAR GRADE] Selected level:', selectedLevel.name, selectedLevel.key);

        // Filter by academic level
        let periods = gradingPeriods.filter(
            period => period.academic_level_id === academicLevelId
        );

        console.log('[REGISTRAR GRADE] Periods for level:', periods.length);

        // For Elementary, JHS, SHS: Show only quarter-type root periods (no parent_id)
        if (['elementary', 'junior_highschool', 'senior_highschool'].includes(selectedLevel.key)) {
            periods = periods.filter(p => p.type === 'quarter' && !p.parent_id);
            console.log('[REGISTRAR GRADE] Filtered quarter periods:', periods.length);
        }

        // For College: Show only child periods (Midterm, Pre-Final, Final Average) for actual reporting
        // These are the periods that users can actually generate reports for
        if (selectedLevel.key === 'college') {
            periods = periods.filter(p => p.parent_id !== null);
            console.log('[REGISTRAR GRADE] Filtered child periods for college:', periods.length);
        }

        // Sort by sort_order, then by semester_number if available
        return periods.sort((a, b) => {
            // First by sort_order
            if (a.sort_order !== b.sort_order) {
                return (a.sort_order || 0) - (b.sort_order || 0);
            }
            // Then by name
            return a.name.localeCompare(b.name);
        });
    };

    const organizedGradingPeriods = getOrganizedGradingPeriods();

    // Render grading period options with hierarchical grouping for College
    const renderGradingPeriodOptions = () => {
        if (gradeData.academic_level_id === 'all') {
            // Show flat list for "All"
            return organizedGradingPeriods.map(period => (
                <SelectItem key={period.id} value={period.id.toString()}>
                    {period.name}
                </SelectItem>
            ));
        }

        const academicLevelId = parseInt(gradeData.academic_level_id);
        const selectedLevel = academicLevels.find(level => level.id === academicLevelId);

        // For College, group child periods under parent semesters
        if (selectedLevel?.key === 'college') {
            // Get parent semesters (root periods without parent_id)
            const semesters = gradingPeriods
                .filter(p => p.academic_level_id === academicLevelId && !p.parent_id && p.type === 'semester')
                .sort((a, b) => (a.semester_number || 0) - (b.semester_number || 0));

            console.log('[REGISTRAR GRADE] Rendering hierarchical semesters:', semesters.length);

            return semesters.map(semester => {
                // Get children of this semester
                const children = gradingPeriods
                    .filter(p => p.parent_id === semester.id)
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

                console.log(`[REGISTRAR GRADE] Semester "${semester.name}" has ${children.length} children`);

                return (
                    <React.Fragment key={semester.id}>
                        <SelectItem value={semester.id.toString()} disabled className="font-semibold text-gray-700">
                            {semester.name}
                        </SelectItem>
                        {children.map(child => (
                            <SelectItem key={child.id} value={child.id.toString()} className="pl-6">
                                └─ {child.name}
                            </SelectItem>
                        ))}
                    </React.Fragment>
                );
            });
        } else {
            // For Elementary/JHS/SHS, show flat list
            return organizedGradingPeriods.map(period => (
                <SelectItem key={period.id} value={period.id.toString()}>
                    {period.name}
                </SelectItem>
            ));
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
                    <div className="flex flex-col gap-6 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports & Archiving</h1>
                                <p className="text-gray-500 dark:text-gray-400">Generate comprehensive reports and archive academic records.</p>
                            </div>
                            <Link href={route('registrar.dashboard')}>
                                <Button variant="outline">Back to Dashboard</Button>
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_students}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                            <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Periods</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.active_periods}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Honors</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_honors}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Certificates</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_certificates}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Reports Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="grade-reports" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Grade Reports
                                </TabsTrigger>
                                <TabsTrigger value="honor-statistics" className="flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Honor Statistics
                                </TabsTrigger>
                                <TabsTrigger value="archiving" className="flex items-center gap-2">
                                    <Archive className="h-4 w-4" />
                                    Archiving
                                </TabsTrigger>
                                <TabsTrigger value="class-section-reports" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Class Section Reports
                                </TabsTrigger>
                            </TabsList>

                            {/* Grade Reports Tab */}
                            <TabsContent value="grade-reports" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Generate Grade Reports
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleGradeReport} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="academic_level">Academic Level</Label>
                                                    <Select
                                                        value={gradeData.academic_level_id}
                                                        onValueChange={(value) => {
                                                            console.log('[REGISTRAR GRADE] Academic Level Changed:', value);
                                                            setGradeData({
                                                                ...gradeData,
                                                                academic_level_id: value,
                                                                year_level: '',
                                                                track_id: '',
                                                                strand_id: '',
                                                                department_id: '',
                                                                course_id: '',
                                                                section_id: '',
                                                            });
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select academic level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Levels</SelectItem>
                                                            {academicLevels.map((level) => (
                                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="grading_period">Grading Period</Label>
                                                    <Select
                                                        value={gradeData.grading_period_id}
                                                        onValueChange={(value) => setGradeData('grading_period_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select grading period" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Periods</SelectItem>
                                                            {renderGradingPeriodOptions()}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="school_year">School Year</Label>
                                                    <Select
                                                        value={gradeData.school_year}
                                                        onValueChange={(value) => setGradeData('school_year', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select school year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {schoolYears.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="format">Format</Label>
                                                    <Select
                                                        value={gradeData.format}
                                                        onValueChange={(value) => setGradeData('format', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pdf">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    PDF
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="excel">
                                                                <div className="flex items-center gap-2">
                                                                    <FileSpreadsheet className="h-4 w-4" />
                                                                    Excel
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Cascading Filters - Grade Reports */}
                                            {(() => {
                                                if (!gradeData.academic_level_id || gradeData.academic_level_id === 'all') {
                                                    return null;
                                                }

                                                const levelId = parseInt(gradeData.academic_level_id);
                                                const selectedLevel = academicLevels.find(level => level.id === levelId);

                                                if (!selectedLevel) return null;

                                                const isElementary = selectedLevel.key === 'elementary';
                                                const isJHS = selectedLevel.key === 'junior_highschool';
                                                const isSHS = selectedLevel.key === 'senior_highschool';
                                                const isCollege = selectedLevel.key === 'college';

                                                console.log('[REGISTRAR GRADE] Rendering cascading filters for:', selectedLevel.key);

                                                // Elementary & JHS: Year Level → Section
                                                if (isElementary || isJHS) {
                                                    const yearLevelOptions = isElementary
                                                        ? [
                                                            { value: 'grade_1', label: 'Grade 1' },
                                                            { value: 'grade_2', label: 'Grade 2' },
                                                            { value: 'grade_3', label: 'Grade 3' },
                                                            { value: 'grade_4', label: 'Grade 4' },
                                                            { value: 'grade_5', label: 'Grade 5' },
                                                            { value: 'grade_6', label: 'Grade 6' },
                                                        ]
                                                        : [
                                                            { value: 'grade_7', label: 'Grade 7' },
                                                            { value: 'grade_8', label: 'Grade 8' },
                                                            { value: 'grade_9', label: 'Grade 9' },
                                                            { value: 'grade_10', label: 'Grade 10' },
                                                        ];

                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                            <div className="space-y-2">
                                                                <Label>Year Level</Label>
                                                                <Select
                                                                    value={gradeData.year_level}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Year Level Changed:', value);
                                                                        setGradeData({
                                                                            ...gradeData,
                                                                            year_level: value,
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                    disabled={!gradeData.school_year || gradeData.school_year === ''}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All year levels" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Year Levels</SelectItem>
                                                                        {yearLevelOptions.map(opt => (
                                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Section</Label>
                                                                <Select
                                                                    value={gradeData.section_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Section Changed:', value);
                                                                        setGradeData({ ...gradeData, section_id: value });
                                                                    }}
                                                                    disabled={!gradeData.year_level || gradeData.year_level === 'all'}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a section" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredSectionsGrade.map(section => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // SHS: Year Level → Track → Strand → Section
                                                if (isSHS) {
                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                            <div className="space-y-2">
                                                                <Label>Year Level</Label>
                                                                <Select
                                                                    value={gradeData.year_level}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Year Level Changed:', value);
                                                                        setGradeData({
                                                                            ...gradeData,
                                                                            year_level: value,
                                                                            track_id: 'all',
                                                                            strand_id: 'all',
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                    disabled={!gradeData.school_year || gradeData.school_year === ''}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All year levels" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Year Levels</SelectItem>
                                                                        <SelectItem value="grade_11">Grade 11</SelectItem>
                                                                        <SelectItem value="grade_12">Grade 12</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Track</Label>
                                                                <Select
                                                                    value={gradeData.track_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Track Changed:', value);
                                                                        setGradeData({
                                                                            ...gradeData,
                                                                            track_id: value,
                                                                            strand_id: 'all',
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                    disabled={!gradeData.year_level || gradeData.year_level === 'all'}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All tracks" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Tracks</SelectItem>
                                                                        {filteredTracksGrade.map(track => (
                                                                            <SelectItem key={track.id} value={track.id.toString()}>
                                                                                {track.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Strand</Label>
                                                                <Select
                                                                    value={gradeData.strand_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Strand Changed:', value);
                                                                        setGradeData({
                                                                            ...gradeData,
                                                                            strand_id: value,
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                    disabled={!gradeData.track_id || gradeData.track_id === 'all'}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All strands" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Strands</SelectItem>
                                                                        {filteredStrandsGrade.map(strand => (
                                                                            <SelectItem key={strand.id} value={strand.id.toString()}>
                                                                                {strand.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Section</Label>
                                                                <Select
                                                                    value={gradeData.section_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Section Changed:', value);
                                                                        setGradeData({ ...gradeData, section_id: value });
                                                                    }}
                                                                    disabled={!gradeData.strand_id || gradeData.strand_id === 'all'}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a section" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredSectionsGrade.map(section => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // College: Year Level → Department → Course → Section
                                                if (isCollege) {
                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                            <div className="space-y-2">
                                                                <Label>Year Level</Label>
                                                                <Select
                                                                    value={gradeData.year_level}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Year Level Changed:', value);
                                                                        setGradeData({
                                                                            ...gradeData,
                                                                            year_level: value,
                                                                            department_id: 'all',
                                                                            course_id: '',
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                    disabled={!gradeData.school_year || gradeData.school_year === ''}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All year levels" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Year Levels</SelectItem>
                                                                        <SelectItem value="first_year">1st Year</SelectItem>
                                                                        <SelectItem value="second_year">2nd Year</SelectItem>
                                                                        <SelectItem value="third_year">3rd Year</SelectItem>
                                                                        <SelectItem value="fourth_year">4th Year</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Department</Label>
                                                                <Select
                                                                    value={gradeData.department_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Department Changed:', value);
                                                                        setGradeData({
                                                                            ...gradeData,
                                                                            department_id: value,
                                                                            course_id: '',
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                    disabled={!gradeData.year_level || gradeData.year_level === 'all'}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All departments" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Departments</SelectItem>
                                                                        {filteredDepartmentsGrade.map(dept => (
                                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                                {dept.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Course</Label>
                                                                <Select
                                                                    value={gradeData.course_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Course Changed:', value);
                                                                        setGradeData({
                                                                            ...gradeData,
                                                                            course_id: value,
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                    disabled={!gradeData.department_id || gradeData.department_id === 'all'}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a course" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredCoursesGrade.map(course => (
                                                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                                                {course.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Section</Label>
                                                                <Select
                                                                    value={gradeData.section_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR GRADE] Section Changed:', value);
                                                                        setGradeData({ ...gradeData, section_id: value });
                                                                    }}
                                                                    disabled={!gradeData.course_id || gradeData.course_id === 'all'}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a section" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredSectionsGrade.map(section => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })()}

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="include_statistics"
                                                    checked={gradeData.include_statistics === '1'}
                                                    onCheckedChange={(checked) => setGradeData('include_statistics', checked === true ? '1' : '0')}
                                                />
                                                <Label htmlFor="include_statistics">Include statistical analysis</Label>
                                            </div>

                                            <Button 
                                                type="submit" 
                                                disabled={gradeProcessing || isGenerating}
                                                className="w-full md:w-auto"
                                            >
                                                {gradeProcessing || isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Generating Report...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Generate Grade Report
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Honor Statistics Tab */}
                            <TabsContent value="honor-statistics" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Generate Honor Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleHonorStatistics} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="honor_academic_level">Academic Level</Label>
                                                    <Select
                                                        value={honorData.academic_level_id}
                                                        onValueChange={(value) => {
                                                            console.log('[REGISTRAR HONOR] Academic Level Changed:', value);
                                                            setHonorData({
                                                                ...honorData,
                                                                academic_level_id: value,
                                                                year_level: '',
                                                                track_id: '',
                                                                strand_id: '',
                                                                department_id: '',
                                                                course_id: '',
                                                                section_id: 'all',
                                                            });
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select academic level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Levels</SelectItem>
                                                            {academicLevels.map((level) => (
                                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="honor_school_year">School Year</Label>
                                                    <Select
                                                        value={honorData.school_year}
                                                        onValueChange={(value) => setHonorData('school_year', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select school year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {schoolYears.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="honor_type">Honor Type</Label>
                                                    <Select
                                                        value={honorData.honor_type_id}
                                                        onValueChange={(value) => setHonorData('honor_type_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select honor type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Types</SelectItem>
                                                            {filteredHonorTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="honor_format">Format</Label>
                                                    <Select
                                                        value={honorData.format}
                                                        onValueChange={(value) => setHonorData('format', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pdf">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    PDF
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="excel">
                                                                <div className="flex items-center gap-2">
                                                                    <FileSpreadsheet className="h-4 w-4" />
                                                                    Excel
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Cascading Filters based on Academic Level - copied from Admin version */}
                                            {(() => {
                                                if (!honorData.academic_level_id || honorData.academic_level_id === 'all') return null;
                                                const selectedLevel = academicLevels.find(l => l.id.toString() === honorData.academic_level_id);
                                                if (!selectedLevel) return null;
                                                const isElementary = selectedLevel.key === 'elementary';
                                                const isJHS = selectedLevel.key === 'junior_highschool';
                                                const isSHS = selectedLevel.key === 'senior_highschool';
                                                const isCollege = selectedLevel.key === 'college';

                                                if (isElementary || isJHS) {
                                                    const yearLevelOptions = isElementary
                                                        ? [{ value: 'grade_1', label: 'Grade 1' }, { value: 'grade_2', label: 'Grade 2' }, { value: 'grade_3', label: 'Grade 3' }, { value: 'grade_4', label: 'Grade 4' }, { value: 'grade_5', label: 'Grade 5' }, { value: 'grade_6', label: 'Grade 6' }]
                                                        : [{ value: 'grade_7', label: 'Grade 7' }, { value: 'grade_8', label: 'Grade 8' }, { value: 'grade_9', label: 'Grade 9' }, { value: 'grade_10', label: 'Grade 10' }];
                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Year Level</Label>
                                                                <Select value={honorData.year_level} onValueChange={(v) => setHonorData({ ...honorData, year_level: v, section_id: 'all' })}>
                                                                    <SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {yearLevelOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Section</Label>
                                                                <Select value={honorData.section_id} onValueChange={(v) => setHonorData({ ...honorData, section_id: v })}>
                                                                    <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Sections</SelectItem>
                                                                        {filteredSectionsHonor.map(section => <SelectItem key={section.id} value={section.id.toString()}>{section.name}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                if (isSHS) {
                                                    return (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2"><Label>Year Level</Label><Select value={honorData.year_level} onValueChange={(v) => setHonorData({ ...honorData, year_level: v, track_id: '', strand_id: '', section_id: 'all' })}><SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger><SelectContent><SelectItem value="grade_11">Grade 11</SelectItem><SelectItem value="grade_12">Grade 12</SelectItem></SelectContent></Select></div>
                                                                <div className="space-y-2"><Label>Track</Label><Select value={honorData.track_id} onValueChange={(v) => setHonorData({ ...honorData, track_id: v, strand_id: '', section_id: 'all' })}><SelectTrigger><SelectValue placeholder="All tracks" /></SelectTrigger><SelectContent>{tracks.map(track => <SelectItem key={track.id} value={track.id.toString()}>{track.name} ({track.code})</SelectItem>)}</SelectContent></Select></div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2"><Label>Strand</Label><Select value={honorData.strand_id} onValueChange={(v) => setHonorData({ ...honorData, strand_id: v, section_id: 'all' })} disabled={!honorData.track_id}><SelectTrigger><SelectValue placeholder={honorData.track_id ? "All strands" : "Select track first"} /></SelectTrigger><SelectContent>{filteredStrandsHonor.map(strand => <SelectItem key={strand.id} value={strand.id.toString()}>{strand.name} ({strand.code})</SelectItem>)}</SelectContent></Select></div>
                                                                <div className="space-y-2"><Label>Section</Label><Select value={honorData.section_id} onValueChange={(v) => setHonorData({ ...honorData, section_id: v })}><SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger><SelectContent><SelectItem value="all">All Sections</SelectItem>{filteredSectionsHonor.map(section => <SelectItem key={section.id} value={section.id.toString()}>{section.name}</SelectItem>)}</SelectContent></Select></div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                if (isCollege) {
                                                    return (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2"><Label>Year Level</Label><Select value={honorData.year_level} onValueChange={(v) => setHonorData({ ...honorData, year_level: v, department_id: '', course_id: '', section_id: 'all' })}><SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger><SelectContent><SelectItem value="1st_year">1st Year</SelectItem><SelectItem value="2nd_year">2nd Year</SelectItem><SelectItem value="3rd_year">3rd Year</SelectItem><SelectItem value="4th_year">4th Year</SelectItem></SelectContent></Select></div>
                                                                <div className="space-y-2"><Label>Department</Label><Select value={honorData.department_id} onValueChange={(v) => setHonorData({ ...honorData, department_id: v, course_id: '', section_id: 'all' })}><SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger><SelectContent>{departments.map(dept => <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name} ({dept.code})</SelectItem>)}</SelectContent></Select></div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2"><Label>Course</Label><Select value={honorData.course_id} onValueChange={(v) => setHonorData({ ...honorData, course_id: v, section_id: 'all' })} disabled={!honorData.department_id}><SelectTrigger><SelectValue placeholder={honorData.department_id ? "All courses" : "Select department first"} /></SelectTrigger><SelectContent>{filteredCoursesHonor.map(course => <SelectItem key={course.id} value={course.id.toString()}>{course.name} ({course.code})</SelectItem>)}</SelectContent></Select></div>
                                                                <div className="space-y-2"><Label>Section</Label><Select value={honorData.section_id} onValueChange={(v) => setHonorData({ ...honorData, section_id: v })}><SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger><SelectContent><SelectItem value="all">All Sections</SelectItem>{filteredSectionsHonor.map(section => <SelectItem key={section.id} value={section.id.toString()}>{section.name}</SelectItem>)}</SelectContent></Select></div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            <Button 
                                                type="submit" 
                                                disabled={honorProcessing || isGenerating}
                                                className="w-full md:w-auto"
                                            >
                                                {honorProcessing || isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Generating Statistics...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Generate Honor Statistics
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Archiving Tab */}
                            <TabsContent value="archiving" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Archive className="h-5 w-5" />
                                            Archive Academic Records
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                <strong>Note:</strong> Archiving will create a backup of academic records for the specified period. 
                                                This process helps maintain system performance while preserving historical data.
                                            </p>
                                        </div>

                                        <form onSubmit={handleArchiveRecords} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="archive_academic_level">Academic Level</Label>
                                                    <Select
                                                        value={archiveData.academic_level_id}
                                                        onValueChange={(value) => {
                                                            console.log('[REGISTRAR ARCHIVE] Academic Level Changed:', value);
                                                            setArchiveData({
                                                                ...archiveData,
                                                                academic_level_id: value,
                                                                year_level: '',
                                                                track_id: '',
                                                                strand_id: '',
                                                                department_id: '',
                                                                course_id: '',
                                                                section_id: '',
                                                            });
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select academic level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {academicLevels.map((level) => (
                                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="archive_school_year">School Year</Label>
                                                    <Select
                                                        value={archiveData.school_year}
                                                        onValueChange={(value) => setArchiveData('school_year', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select school year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {schoolYears.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Cascading Filters - Archive Records */}
                                            {(() => {
                                                if (!archiveData.academic_level_id) {
                                                    return null;
                                                }

                                                const levelId = parseInt(archiveData.academic_level_id);
                                                const selectedLevel = academicLevels.find(level => level.id === levelId);

                                                if (!selectedLevel) return null;

                                                const isElementary = selectedLevel.key === 'elementary';
                                                const isJHS = selectedLevel.key === 'junior_highschool';
                                                const isSHS = selectedLevel.key === 'senior_highschool';
                                                const isCollege = selectedLevel.key === 'college';

                                                console.log('[REGISTRAR ARCHIVE] Rendering cascading filters for:', selectedLevel.key);

                                                // Elementary & JHS: Year Level → Section
                                                if (isElementary || isJHS) {
                                                    const yearLevelOptions = isElementary
                                                        ? [
                                                            { value: 'grade_1', label: 'Grade 1' },
                                                            { value: 'grade_2', label: 'Grade 2' },
                                                            { value: 'grade_3', label: 'Grade 3' },
                                                            { value: 'grade_4', label: 'Grade 4' },
                                                            { value: 'grade_5', label: 'Grade 5' },
                                                            { value: 'grade_6', label: 'Grade 6' },
                                                        ]
                                                        : [
                                                            { value: 'grade_7', label: 'Grade 7' },
                                                            { value: 'grade_8', label: 'Grade 8' },
                                                            { value: 'grade_9', label: 'Grade 9' },
                                                            { value: 'grade_10', label: 'Grade 10' },
                                                        ];

                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                            <div className="space-y-2">
                                                                <Label>Year Level</Label>
                                                                <Select
                                                                    value={archiveData.year_level}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Year Level Changed:', value);
                                                                        setArchiveData({
                                                                            ...archiveData,
                                                                            year_level: value,
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All year levels" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Year Levels</SelectItem>
                                                                        {yearLevelOptions.map(opt => (
                                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Section</Label>
                                                                <Select
                                                                    value={archiveData.section_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Section Changed:', value);
                                                                        setArchiveData({ ...archiveData, section_id: value });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All sections" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Sections</SelectItem>
                                                                        {filteredSectionsArchive.map(section => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // SHS: Year Level → Track → Strand → Section
                                                if (isSHS) {
                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                            <div className="space-y-2">
                                                                <Label>Year Level</Label>
                                                                <Select
                                                                    value={archiveData.year_level}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Year Level Changed:', value);
                                                                        setArchiveData({
                                                                            ...archiveData,
                                                                            year_level: value,
                                                                            track_id: 'all',
                                                                            strand_id: 'all',
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All year levels" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Year Levels</SelectItem>
                                                                        <SelectItem value="grade_11">Grade 11</SelectItem>
                                                                        <SelectItem value="grade_12">Grade 12</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Track</Label>
                                                                <Select
                                                                    value={archiveData.track_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Track Changed:', value);
                                                                        setArchiveData({
                                                                            ...archiveData,
                                                                            track_id: value,
                                                                            strand_id: 'all',
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All tracks" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Tracks</SelectItem>
                                                                        {filteredTracksArchive.map(track => (
                                                                            <SelectItem key={track.id} value={track.id.toString()}>
                                                                                {track.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Strand</Label>
                                                                <Select
                                                                    value={archiveData.strand_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Strand Changed:', value);
                                                                        setArchiveData({
                                                                            ...archiveData,
                                                                            strand_id: value,
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All strands" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Strands</SelectItem>
                                                                        {filteredStrandsArchive.map(strand => (
                                                                            <SelectItem key={strand.id} value={strand.id.toString()}>
                                                                                {strand.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Section</Label>
                                                                <Select
                                                                    value={archiveData.section_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Section Changed:', value);
                                                                        setArchiveData({ ...archiveData, section_id: value });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All sections" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Sections</SelectItem>
                                                                        {filteredSectionsArchive.map(section => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // College: Year Level → Department → Course → Section
                                                if (isCollege) {
                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                            <div className="space-y-2">
                                                                <Label>Year Level</Label>
                                                                <Select
                                                                    value={archiveData.year_level}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Year Level Changed:', value);
                                                                        setArchiveData({
                                                                            ...archiveData,
                                                                            year_level: value,
                                                                            department_id: 'all',
                                                                            course_id: '',
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All year levels" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Year Levels</SelectItem>
                                                                        <SelectItem value="first_year">1st Year</SelectItem>
                                                                        <SelectItem value="second_year">2nd Year</SelectItem>
                                                                        <SelectItem value="third_year">3rd Year</SelectItem>
                                                                        <SelectItem value="fourth_year">4th Year</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Department</Label>
                                                                <Select
                                                                    value={archiveData.department_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Department Changed:', value);
                                                                        setArchiveData({
                                                                            ...archiveData,
                                                                            department_id: value,
                                                                            course_id: '',
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All departments" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Departments</SelectItem>
                                                                        {filteredDepartmentsArchive.map(dept => (
                                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                                {dept.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Course</Label>
                                                                <Select
                                                                    value={archiveData.course_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Course Changed:', value);
                                                                        setArchiveData({
                                                                            ...archiveData,
                                                                            course_id: value,
                                                                            section_id: ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All courses" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Courses</SelectItem>
                                                                        {filteredCoursesArchive.map(course => (
                                                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                                                {course.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Section</Label>
                                                                <Select
                                                                    value={archiveData.section_id}
                                                                    onValueChange={(value) => {
                                                                        console.log('[REGISTRAR ARCHIVE] Section Changed:', value);
                                                                        setArchiveData({ ...archiveData, section_id: value });
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="All sections" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Sections</SelectItem>
                                                                        {filteredSectionsArchive.map(section => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })()}

                                            <div className="space-y-2">
                                                <Label>Include in Archive</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="include_grades"
                                                            checked={archiveData.include_grades === '1'}
                                                            onCheckedChange={(checked) => setArchiveData('include_grades', checked === true ? '1' : '0')}
                                                        />
                                                        <Label htmlFor="include_grades">Student Grades</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="include_honors"
                                                            checked={archiveData.include_honors === '1'}
                                                            onCheckedChange={(checked) => setArchiveData('include_honors', checked === true ? '1' : '0')}
                                                        />
                                                        <Label htmlFor="include_honors">Honor Records</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="include_certificates"
                                                            checked={archiveData.include_certificates === '1'}
                                                            onCheckedChange={(checked) => setArchiveData('include_certificates', checked === true ? '1' : '0')}
                                                        />
                                                        <Label htmlFor="include_certificates">Certificates</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="archive_format">Archive Format</Label>
                                                <Select
                                                    value={archiveData.format}
                                                    onValueChange={(value) => setArchiveData('format', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="excel">
                                                            <div className="flex items-center gap-2">
                                                                <FileSpreadsheet className="h-4 w-4" />
                                                                Excel
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="csv">
                                                            <div className="flex items-center gap-2">
                                                                <FileX className="h-4 w-4" />
                                                                CSV
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button 
                                                type="submit" 
                                                disabled={archiveProcessing || isGenerating}
                                                className="w-full md:w-auto"
                                            >
                                                {archiveProcessing || isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Archiving Records...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Archive className="h-4 w-4 mr-2" />
                                                        Archive Records
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Class Section Reports Tab */}
                            <TabsContent value="class-section-reports" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Generate Class Section Reports
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">Generate comprehensive class section rosters and student lists by academic level.</p>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleClassSectionReport} className="space-y-4">
                                            {/* Academic Level Selection */}
                                            <div>
                                                <Label>Academic Level *</Label>
                                                <Select
                                                    value={sectionData.academic_level_id}
                                                    onValueChange={(v) => {
                                                        console.log('[REGISTRAR] Academic Level Changed:', v);
                                                        setSectionData({
                                                            ...sectionData,
                                                            academic_level_id: v,
                                                            year_level: '',
                                                            track_id: '',
                                                            strand_id: '',
                                                            department_id: '',
                                                            course_id: '',
                                                            section_id: '',
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                                                    <SelectContent>
                                                        {academicLevels.map(level => (
                                                            <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-gray-500 mt-1">Academic level is required for class section reports</p>
                                            </div>

                                            {/* Conditional Filters based on Academic Level */}
                                            {(() => {
                                                if (!sectionData.academic_level_id) return null;

                                                const selectedLevel = academicLevels.find(l => l.id.toString() === sectionData.academic_level_id);
                                                if (!selectedLevel) return null;

                                                const isElementary = selectedLevel.key === 'elementary';
                                                const isJHS = selectedLevel.key === 'junior_highschool';
                                                const isSHS = selectedLevel.key === 'senior_highschool';
                                                const isCollege = selectedLevel.key === 'college';

                                                // Elementary and JHS: Year Level → Section
                                                if (isElementary || isJHS) {
                                                    const yearLevelOptions = isElementary
                                                        ? [
                                                            { value: 'grade_1', label: 'Grade 1' },
                                                            { value: 'grade_2', label: 'Grade 2' },
                                                            { value: 'grade_3', label: 'Grade 3' },
                                                            { value: 'grade_4', label: 'Grade 4' },
                                                            { value: 'grade_5', label: 'Grade 5' },
                                                            { value: 'grade_6', label: 'Grade 6' },
                                                        ]
                                                        : [
                                                            { value: 'grade_7', label: 'Grade 7' },
                                                            { value: 'grade_8', label: 'Grade 8' },
                                                            { value: 'grade_9', label: 'Grade 9' },
                                                            { value: 'grade_10', label: 'Grade 10' },
                                                        ];

                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <Label>Year Level</Label>
                                                                <Select
                                                                    value={sectionData.year_level}
                                                                    onValueChange={(v) => {
                                                                        console.log('[REGISTRAR] Year Level Changed:', v);
                                                                        setSectionData({ ...sectionData, year_level: v, section_id: '' });
                                                                    }}
                                                                >
                                                                    <SelectTrigger><SelectValue placeholder="Select year level" /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {yearLevelOptions.map(opt => (
                                                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <p className="text-xs text-gray-500 mt-1">Filter by year level</p>
                                                            </div>

                                                            <div>
                                                                <Label>Section</Label>
                                                                <Select
                                                                    value={sectionData.section_id}
                                                                    onValueChange={(v) => setSectionData({ ...sectionData, section_id: v })}
                                                                >
                                                                    <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Sections</SelectItem>
                                                                        {filteredSections.map(section => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <p className="text-xs text-gray-500 mt-1">Leave as "All" for all sections</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // SHS: Year Level → Track → Strand → Section
                                                if (isSHS) {
                                                    const shsYearOptions = [
                                                        { value: 'grade_11', label: 'Grade 11' },
                                                        { value: 'grade_12', label: 'Grade 12' },
                                                    ];

                                                    return (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Year Level</Label>
                                                                    <Select
                                                                        value={sectionData.year_level}
                                                                        onValueChange={(v) => {
                                                                            console.log('[REGISTRAR] Year Level Changed:', v);
                                                                            setSectionData({ ...sectionData, year_level: v, track_id: '', strand_id: '', section_id: '' });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder="Select year level" /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {shsYearOptions.map(opt => (
                                                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-gray-500 mt-1">Select year level</p>
                                                                </div>

                                                                <div>
                                                                    <Label>Track</Label>
                                                                    <Select
                                                                        value={sectionData.track_id}
                                                                        onValueChange={(v) => {
                                                                            console.log('[REGISTRAR] Track Changed:', v);
                                                                            setSectionData({ ...sectionData, track_id: v, strand_id: '', section_id: '' });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {tracks.map(track => (
                                                                                <SelectItem key={track.id} value={track.id.toString()}>
                                                                                    {track.name} ({track.code})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-gray-500 mt-1">Select track</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Strand</Label>
                                                                    <Select
                                                                        value={sectionData.strand_id}
                                                                        onValueChange={(v) => {
                                                                            console.log('[REGISTRAR] Strand Changed:', v);
                                                                            setSectionData({ ...sectionData, strand_id: v, section_id: '' });
                                                                        }}
                                                                        disabled={!sectionData.track_id}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder={sectionData.track_id ? "Select strand" : "Select track first"} /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {filteredStrands.map(strand => (
                                                                                <SelectItem key={strand.id} value={strand.id.toString()}>
                                                                                    {strand.name} ({strand.code})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-gray-500 mt-1">Select strand</p>
                                                                </div>

                                                                <div>
                                                                    <Label>Section</Label>
                                                                    <Select
                                                                        value={sectionData.section_id}
                                                                        onValueChange={(v) => setSectionData({ ...sectionData, section_id: v })}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="all">All Sections</SelectItem>
                                                                            {filteredSections.map(section => (
                                                                                <SelectItem key={section.id} value={section.id.toString()}>
                                                                                    {section.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-gray-500 mt-1">Leave as "All" for all sections</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // College: Year Level → Department → Course → Section
                                                if (isCollege) {
                                                    const collegeYearOptions = [
                                                        { value: 'first_year', label: '1st Year' },
                                                        { value: 'second_year', label: '2nd Year' },
                                                        { value: 'third_year', label: '3rd Year' },
                                                        { value: 'fourth_year', label: '4th Year' },
                                                    ];

                                                    return (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Year Level</Label>
                                                                    <Select
                                                                        value={sectionData.year_level}
                                                                        onValueChange={(v) => {
                                                                            console.log('[REGISTRAR] Year Level Changed:', v);
                                                                            setSectionData({ ...sectionData, year_level: v, department_id: '', course_id: '', section_id: '' });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder="Select year level" /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {collegeYearOptions.map(opt => (
                                                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-gray-500 mt-1">Select year level</p>
                                                                </div>

                                                                <div>
                                                                    <Label>Department</Label>
                                                                    <Select
                                                                        value={sectionData.department_id}
                                                                        onValueChange={(v) => {
                                                                            console.log('[REGISTRAR] Department Changed:', v);
                                                                            setSectionData({ ...sectionData, department_id: v, course_id: '', section_id: '' });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {departments.map(dept => (
                                                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                                    {dept.name} ({dept.code})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-gray-500 mt-1">Select department</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Course</Label>
                                                                    <Select
                                                                        value={sectionData.course_id}
                                                                        onValueChange={(v) => {
                                                                            console.log('[REGISTRAR] Course Changed:', v);
                                                                            setSectionData({ ...sectionData, course_id: v, section_id: '' });
                                                                        }}
                                                                        disabled={!sectionData.department_id}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder={sectionData.department_id ? "Select course" : "Select department first"} /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {filteredCourses.map(course => (
                                                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                                                    {course.name} ({course.code})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-gray-500 mt-1">Select course</p>
                                                                </div>

                                                                <div>
                                                                    <Label>Section</Label>
                                                                    <Select
                                                                        value={sectionData.section_id}
                                                                        onValueChange={(v) => setSectionData({ ...sectionData, section_id: v })}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="all">All Sections</SelectItem>
                                                                            {filteredSections.map(section => (
                                                                                <SelectItem key={section.id} value={section.id.toString()}>
                                                                                    {section.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-gray-500 mt-1">Leave as "All" for all sections</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })()}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>School Year *</Label>
                                                    <Select value={sectionData.school_year} onValueChange={(v) => setSectionData({ ...sectionData, school_year: v })}>
                                                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                                                        <SelectContent>
                                                            {schoolYears.map(year => (
                                                                <SelectItem key={year} value={year}>{year}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Export Format</Label>
                                                    <Select value={sectionData.format} onValueChange={(v) => setSectionData({ ...sectionData, format: v })}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pdf">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    PDF Report
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="excel">
                                                                <div className="flex items-center gap-2">
                                                                    <FileSpreadsheet className="h-4 w-4" />
                                                                    Excel Spreadsheet
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="csv">
                                                                <div className="flex items-center gap-2">
                                                                    <FileX className="h-4 w-4" />
                                                                    CSV File
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="include_grades_section"
                                                    checked={sectionData.include_grades}
                                                    onCheckedChange={(checked) => {
                                                        const value = checked === true ? '1' : '0';
                                                        console.log('[REGISTRAR] Section include_grades changed to:', value);
                                                        setSectionData({ ...sectionData, include_grades: value });
                                                    }}
                                                />
                                                <Label htmlFor="include_grades_section">Include student average grades in the report</Label>
                                            </div>

                                            {/* Show validation message if button is disabled */}
                                            {(!sectionData.academic_level_id || !sectionData.school_year) && (
                                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                    <p className="text-sm text-yellow-800">
                                                        <strong>Required:</strong> Please select Academic Level and School Year to generate the report.
                                                    </p>
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                disabled={sectionProcessing || !sectionData.academic_level_id || !sectionData.school_year || isGenerating}
                                                className="flex items-center gap-2"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4" />
                                                        Generate Class Section Report
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
