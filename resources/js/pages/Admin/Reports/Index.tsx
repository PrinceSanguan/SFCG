import React, { useState, useEffect } from 'react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Link, usePage } from '@inertiajs/react';
import { useToast } from '@/components/ui/toast';
import {
  FileText,
  Award,
  Archive,
  Download,
  BarChart3,
  GraduationCap,
  Calendar,
  Users,
  TrendingUp,
  FileSpreadsheet,
  FileX,
  Loader2
} from 'lucide-react';

interface User { name: string; email: string; user_role: string; }
interface AcademicLevel { id: number; name: string; key: string; }
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
interface HonorType { id: number; name: string; }
interface Track { id: number; name: string; code: string; is_active: boolean; }
interface Strand { id: number; name: string; code: string; track_id: number; track?: Track; }
interface Department { id: number; name: string; code: string; is_active: boolean; }
interface Course { id: number; name: string; code: string; department_id: number; is_active: boolean; department?: Department; }
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
    active_sections: number;
  };
}

export default function ReportsIndex({ user, academicLevels, schoolYears, currentSchoolYear, gradingPeriods, honorTypes, sections, tracks, strands, departments, courses, stats }: Props) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('honor-statistics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [filteredGradingPeriods, setFilteredGradingPeriods] = useState<GradingPeriod[]>([]);

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

  // Archive filtering state (separate to avoid conflicts)
  const [filteredSectionsArchive, setFilteredSectionsArchive] = useState<Section[]>([]);
  const [filteredTracksArchive, setFilteredTracksArchive] = useState<Track[]>([]);
  const [filteredStrandsArchive, setFilteredStrandsArchive] = useState<Strand[]>([]);
  const [filteredDepartmentsArchive, setFilteredDepartmentsArchive] = useState<Department[]>([]);
  const [filteredCoursesArchive, setFilteredCoursesArchive] = useState<Course[]>([]);

  // Get CSRF token from Inertia page props
  const { props } = usePage();
  const csrfToken = (props as any).csrf_token || document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';

  // Grade Report Form
  const { data: gradeData, setData: setGradeData, post: postGrade, processing: gradeProcessing } = useForm({
    academic_level_id: 'all',
    semester_id: '',
    grading_period_id: 'all',
    school_year: currentSchoolYear || schoolYears[0] || '',
    format: 'pdf',
    include_statistics: true,
  });

  // Honor Statistics Form
  const { data: honorData, setData: setHonorData, post: postHonor, processing: honorProcessing } = useForm({
    academic_level_id: 'all',
    school_year: currentSchoolYear || schoolYears[0] || '',
    honor_type_id: 'all',
    year_level: '',
    track_id: '',
    strand_id: '',
    department_id: '',
    course_id: '',
    section_id: '',
    format: 'pdf',
  });

  // Archive Records Form
  const { data: archiveData, setData: setArchiveData, post: postArchive, processing: archiveProcessing } = useForm({
    academic_level_id: '',
    school_year: currentSchoolYear || schoolYears[0] || '',
    year_level: 'all',
    track_id: 'all',
    strand_id: 'all',
    department_id: 'all',
    course_id: '',
    section_id: '',
    include_grades: true,
    include_honors: true,
    include_certificates: true,
    format: 'excel',
  });

  // Class Section Report Form
  const { data: sectionData, setData: setSectionData, post: postSection, processing: sectionProcessing } = useForm({
    academic_level_id: '',
    year_level: 'all',
    track_id: 'all',
    strand_id: 'all',
    department_id: 'all',
    course_id: '',
    section_id: '',
    school_year: currentSchoolYear || schoolYears[0] || '',
    include_grades: false,
    format: 'pdf',
  });

  // Filter grading periods based on selected academic level and semester
  useEffect(() => {
    if (gradeData.academic_level_id && gradeData.academic_level_id !== 'all') {
      const levelId = parseInt(gradeData.academic_level_id);
      let filtered = gradingPeriods.filter(period => period.academic_level_id === levelId);

      // If semester is selected, filter by semester
      if (selectedSemester) {
        const semesterId = parseInt(selectedSemester);
        // Get main semester periods and their children
        filtered = filtered.filter(period =>
          period.id === semesterId || period.parent_id === semesterId
        );
      }

      setFilteredGradingPeriods(filtered);
    } else {
      setFilteredGradingPeriods([]);
    }
  }, [gradeData.academic_level_id, selectedSemester, gradingPeriods]);

  // Log initial data on mount for Class Section Report
  useEffect(() => {
    console.log('=== CLASS SECTION REPORT - PAGE LOADED ===');
    console.log('Available Academic Levels:', academicLevels);
    console.log('Available School Years:', schoolYears);
    console.log('Current School Year:', currentSchoolYear);
    console.log('Initial Section Data:', sectionData);
    console.log('Available Sections:', sections);
    console.log('Available Tracks:', tracks);
    console.log('Available Strands:', strands);
    console.log('Available Departments:', departments);
    console.log('Available Courses:', courses);
  }, []);

  // Filter sections based on academic level and cascading filters
  useEffect(() => {
    console.log('=== CLASS SECTION FILTER TRIGGERED ===');
    console.log('Academic Level ID:', sectionData.academic_level_id);
    console.log('Year Level:', sectionData.year_level);
    console.log('Track ID:', sectionData.track_id);
    console.log('Strand ID:', sectionData.strand_id);
    console.log('Department ID:', sectionData.department_id);
    console.log('Course ID:', sectionData.course_id);

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

    console.log('Selected Level:', selectedLevel);

    if (!selectedLevel) {
      setFilteredSections([]);
      return;
    }

    // Filter sections based on academic level type
    let filtered = sections.filter(section => section.academic_level_id === levelId);

    console.log('Sections for level:', filtered);

    // Apply year level filter for all levels
    if (sectionData.year_level) {
      filtered = filtered.filter(section => section.specific_year_level === sectionData.year_level);
      console.log('After year level filter:', filtered);
    }

    // SHS-specific filtering
    if (selectedLevel.key === 'senior_highschool') {
      if (sectionData.track_id) {
        filtered = filtered.filter(section => section.track_id?.toString() === sectionData.track_id);
        console.log('After track filter:', filtered);
      }
      if (sectionData.strand_id) {
        filtered = filtered.filter(section => section.strand_id?.toString() === sectionData.strand_id);
        console.log('After strand filter:', filtered);
      }
    }

    // College-specific filtering
    if (selectedLevel.key === 'college') {
      if (sectionData.department_id) {
        filtered = filtered.filter(section => section.department_id?.toString() === sectionData.department_id);
        console.log('After department filter:', filtered);
      }
      if (sectionData.course_id) {
        filtered = filtered.filter(section => section.course_id?.toString() === sectionData.course_id);
        console.log('After course filter:', filtered);
      }
    }

    console.log('Final filtered sections:', filtered);
    setFilteredSections(filtered);
  }, [sectionData.academic_level_id, sectionData.year_level, sectionData.track_id, sectionData.strand_id, sectionData.department_id, sectionData.course_id, sections, academicLevels]);

  // Filter strands based on selected track (for SHS)
  useEffect(() => {
    if (sectionData.track_id) {
      const trackId = parseInt(sectionData.track_id);
      const filtered = strands.filter(strand => strand.track_id === trackId);
      console.log('Filtered Strands for Track:', filtered);
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
      console.log('Filtered Courses for Department:', filtered);
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [sectionData.department_id, courses]);

  // ========== Honor Statistics Filtering useEffect Hooks ==========

  // Filter sections for Honor Statistics based on academic level and cascading filters
  useEffect(() => {
    console.log('=== HONOR STATISTICS FILTER TRIGGERED ===');
    console.log('[HONOR] Academic Level ID:', honorData.academic_level_id);
    console.log('[HONOR] Year Level:', honorData.year_level);
    console.log('[HONOR] Track ID:', honorData.track_id);
    console.log('[HONOR] Strand ID:', honorData.strand_id);
    console.log('[HONOR] Department ID:', honorData.department_id);
    console.log('[HONOR] Course ID:', honorData.course_id);

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

    console.log('[HONOR] Selected Level:', selectedLevel);

    if (!selectedLevel) {
      setFilteredSectionsHonor([]);
      return;
    }

    // Filter sections based on academic level type
    let filtered = sections.filter(section => section.academic_level_id === levelId);

    console.log('[HONOR] Sections for level:', filtered);

    // Apply year level filter for all levels
    if (honorData.year_level) {
      filtered = filtered.filter(section => section.specific_year_level === honorData.year_level);
      console.log('[HONOR] After year level filter:', filtered);
    }

    // SHS-specific filtering
    if (selectedLevel.key === 'senior_highschool') {
      if (honorData.track_id) {
        filtered = filtered.filter(section => section.track_id?.toString() === honorData.track_id);
        console.log('[HONOR] After track filter:', filtered);
      }
      if (honorData.strand_id) {
        filtered = filtered.filter(section => section.strand_id?.toString() === honorData.strand_id);
        console.log('[HONOR] After strand filter:', filtered);
      }
    }

    // College-specific filtering
    if (selectedLevel.key === 'college') {
      if (honorData.department_id) {
        filtered = filtered.filter(section => section.department_id?.toString() === honorData.department_id);
        console.log('[HONOR] After department filter:', filtered);
      }
      if (honorData.course_id) {
        filtered = filtered.filter(section => section.course_id?.toString() === honorData.course_id);
        console.log('[HONOR] After course filter:', filtered);
      }
    }

    console.log('[HONOR] Final filtered sections:', filtered);
    setFilteredSectionsHonor(filtered);
  }, [honorData.academic_level_id, honorData.year_level, honorData.track_id, honorData.strand_id, honorData.department_id, honorData.course_id, sections, academicLevels]);

  // Filter strands based on selected track (for Honor Statistics SHS)
  useEffect(() => {
    if (honorData.track_id) {
      const trackId = parseInt(honorData.track_id);
      const filtered = strands.filter(strand => strand.track_id === trackId);
      console.log('[HONOR] Filtered Strands for Track:', filtered);
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
      console.log('[HONOR] Filtered Courses for Department:', filtered);
      setFilteredCoursesHonor(filtered);
    } else {
      setFilteredCoursesHonor([]);
    }
  }, [honorData.department_id, courses]);

  // Filter departments based on year level (for Honor Statistics College) - Progressive filtering
  useEffect(() => {
    console.log('[ADMIN HONOR] Filtering departments by year level');

    if (honorData.academic_level_id && honorData.academic_level_id !== 'all') {
      const levelId = parseInt(honorData.academic_level_id);
      const selectedLevel = academicLevels.find(level => level.id === levelId);

      if (selectedLevel?.key === 'college') {
        // Start with sections at this academic level
        let relevantSections = sections.filter(s => s.academic_level_id === levelId);

        // Filter by year level if selected
        if (honorData.year_level && honorData.year_level !== '') {
          relevantSections = relevantSections.filter(
            s => s.specific_year_level === honorData.year_level
          );
        }

        // Extract unique department IDs from relevant sections
        const departmentIds = new Set(
          relevantSections
            .map(s => s.department_id)
            .filter(id => id !== undefined && id !== null) as number[]
        );

        // Filter departments to only those with matching sections
        const filtered = departments.filter(dept => departmentIds.has(dept.id));
        console.log('[ADMIN HONOR] Filtered departments count:', filtered.length);
        setFilteredDepartmentsHonor(filtered);
      } else {
        setFilteredDepartmentsHonor([]);
      }
    } else {
      setFilteredDepartmentsHonor([]);
    }
  }, [honorData.academic_level_id, honorData.year_level, sections, academicLevels, departments]);

  // Filter tracks based on year level (for Honor Statistics SHS) - Progressive filtering
  useEffect(() => {
    console.log('[ADMIN HONOR] Filtering tracks by year level');

    if (honorData.academic_level_id && honorData.academic_level_id !== 'all') {
      const levelId = parseInt(honorData.academic_level_id);
      const selectedLevel = academicLevels.find(level => level.id === levelId);

      if (selectedLevel?.key === 'senior_highschool') {
        // Start with sections at this academic level
        let relevantSections = sections.filter(s => s.academic_level_id === levelId);

        // Filter by year level if selected
        if (honorData.year_level && honorData.year_level !== '') {
          relevantSections = relevantSections.filter(
            s => s.specific_year_level === honorData.year_level
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
        console.log('[ADMIN HONOR] Filtered tracks count:', filtered.length, 'Track IDs:', Array.from(trackIds));
        setFilteredTracksHonor(filtered);
      } else {
        setFilteredTracksHonor([]);
      }
    } else {
      setFilteredTracksHonor([]);
    }
  }, [honorData.academic_level_id, honorData.year_level, sections, academicLevels, tracks]);

  // ===== Archive Records Filtering =====

  // Filter sections, tracks, departments for Archive based on academic level
  useEffect(() => {
    console.log('=== [ADMIN] ARCHIVE FILTER TRIGGERED ===');
    console.log('[ADMIN ARCHIVE] Academic Level ID:', archiveData.academic_level_id);

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
      console.log('[ADMIN ARCHIVE] Selected level not found');
      return;
    }

    console.log('[ADMIN ARCHIVE] Selected Level:', selectedLevel.name, selectedLevel.key);

    // Filter sections by academic level first
    let filtered = sections.filter(section => section.academic_level_id === levelId);
    console.log('[ADMIN ARCHIVE] Sections for level:', filtered.length);

    // Apply cascading filters based on academic level type
    if (selectedLevel.key === 'senior_highschool') {
      console.log('[ADMIN ARCHIVE] Processing SHS filters');
      setFilteredTracksArchive(tracks);

      if (archiveData.track_id && archiveData.track_id !== 'all') {
        console.log('[ADMIN ARCHIVE] Filtering by Track ID:', archiveData.track_id);
        filtered = filtered.filter(section => section.track_id?.toString() === archiveData.track_id);
      }

      if (archiveData.strand_id && archiveData.strand_id !== 'all') {
        console.log('[ADMIN ARCHIVE] Filtering by Strand ID:', archiveData.strand_id);
        filtered = filtered.filter(section => section.strand_id?.toString() === archiveData.strand_id);
      }

      if (archiveData.year_level && archiveData.year_level !== 'all') {
        console.log('[ADMIN ARCHIVE] Filtering by Year Level:', archiveData.year_level);
        filtered = filtered.filter(section => section.specific_year_level === archiveData.year_level);
      }
    }

    if (selectedLevel.key === 'college') {
      console.log('[ADMIN ARCHIVE] Processing College filters');
      setFilteredDepartmentsArchive(departments);

      if (archiveData.department_id && archiveData.department_id !== 'all') {
        console.log('[ADMIN ARCHIVE] Filtering by Department ID:', archiveData.department_id);
        filtered = filtered.filter(section => section.department_id?.toString() === archiveData.department_id);
      }

      if (archiveData.course_id && archiveData.course_id !== 'all') {
        console.log('[ADMIN ARCHIVE] Filtering by Course ID:', archiveData.course_id);
        filtered = filtered.filter(section => section.course_id?.toString() === archiveData.course_id);
      }

      if (archiveData.year_level && archiveData.year_level !== 'all') {
        console.log('[ADMIN ARCHIVE] Filtering by Year Level:', archiveData.year_level);
        filtered = filtered.filter(section => section.specific_year_level === archiveData.year_level);
      }
    }

    if (selectedLevel.key === 'elementary' || selectedLevel.key === 'junior_highschool') {
      console.log('[ADMIN ARCHIVE] Processing Elementary/JHS filters');

      if (archiveData.year_level && archiveData.year_level !== 'all') {
        console.log('[ADMIN ARCHIVE] Filtering by Year Level:', archiveData.year_level);
        filtered = filtered.filter(section => section.specific_year_level === archiveData.year_level);
      }
    }

    console.log('[ADMIN ARCHIVE] Final filtered sections:', filtered.length);
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
    e.preventDefault();

    if (!csrfToken) {
      console.error('CSRF token not found');
      alert('Session expired. Please refresh the page and try again.');
      return;
    }

    setIsGenerating(true);

    // Create a hidden iframe for download
    let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'download-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // Create a temporary form for file download
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.reports.grade-report');
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
      // Handle boolean values properly for backend validation
      if (typeof value === 'boolean') {
        input.value = value ? '1' : '0';
      } else {
        input.value = value?.toString() || '';
      }
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Reset loading state after a delay
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleHonorStatistics = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== [ADMIN] HONOR STATISTICS FORM SUBMISSION ===');
    console.log('[ADMIN] Button clicked at:', new Date().toISOString());
    console.log('[ADMIN] Honor Data:', honorData);
    console.log('[ADMIN] Active Tab:', activeTab);

    if (!csrfToken) {
      console.error('[ADMIN] CSRF token not found');
      addToast('Session expired. Please refresh the page and try again.', 'error');
      return;
    }

    console.log('[ADMIN] CSRF Token:', csrfToken);

    // Validate required fields
    if (!honorData.school_year) {
      console.error('[ADMIN] School year is required');
      addToast('Please select a school year before generating the report.', 'warning');
      return;
    }

    console.log('[ADMIN] All validations passed, starting report generation...');
    addToast('Generating Honor Statistics Report...', 'info', { duration: 2000 });
    setIsGenerating(true);

    // Create a hidden iframe for download
    let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'download-iframe';
      iframe.name = 'download-iframe'; // IMPORTANT: name attribute must match form target
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      console.log('[ADMIN] Created download iframe with name:', iframe.name);
    } else {
      // Ensure name is set even if iframe already exists
      iframe.name = 'download-iframe';
      console.log('[ADMIN] Using existing download iframe, name set to:', iframe.name);
    }

    // Create a temporary form for file download
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.reports.honor-statistics');
    form.target = 'download-iframe';

    console.log('[ADMIN] Form action URL:', form.action);
    console.log('[ADMIN] Form target:', form.target);

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

    console.log('[ADMIN] Form data being submitted:', formDataEntries);

    // Add iframe load listener BEFORE submitting form
    iframe.onload = () => {
      console.log('[ADMIN] Iframe loaded at:', new Date().toISOString());
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const body = iframeDoc.body;
          const bodyText = body?.textContent || '';
          console.log('[ADMIN] Iframe body content length:', bodyText.length);
          console.log('[ADMIN] Iframe body preview:', bodyText.substring(0, 500));

          // Check for no-data error page
          const errorContainer = body?.querySelector('[data-error-type="no-data"]');
          if (errorContainer) {
            const errorTitle = body?.querySelector('.error-title')?.textContent?.trim() || 'No data found';
            const errorMessage = body?.querySelector('.error-message')?.textContent?.trim() || 'Please adjust your filters and try again.';
            console.warn('[ADMIN] No data found:', errorTitle);
            addToast(`${errorTitle} ${errorMessage}`, 'warning', { duration: 5000 });
            // Clean up form after error is detected
            setTimeout(() => {
              if (form.parentNode) {
                document.body.removeChild(form);
                console.log('[ADMIN] Form removed after error detection');
              }
            }, 100);
            return;
          }

          // Check for generic error messages
          if (bodyText.includes('error') || bodyText.includes('Error') || bodyText.includes('Exception')) {
            console.error('[ADMIN] Error detected in response:', bodyText.substring(0, 1000));
            addToast('An error occurred while generating the report. Please check the Laravel logs.', 'error', { duration: 7000 });
          } else if (bodyText.length > 0 && bodyText.length < 200) {
            // Likely an error message (successful downloads don't have accessible content)
            console.error('[ADMIN] Possible error response:', bodyText);
            addToast('Report generation may have failed. Please check the Laravel logs.', 'warning', { duration: 5000 });
          } else {
            console.log('[ADMIN] Report likely generated successfully');
            addToast('Report generated successfully! Download should start automatically.', 'success', { duration: 3000 });
          }
        }
      } catch (e) {
        console.log('[ADMIN] Could not access iframe content (this is normal for successful downloads):', e);
        addToast('Report generated! Check your downloads folder.', 'success', { duration: 3000 });
      }

      // Clean up form after processing (delay to ensure submission completes)
      setTimeout(() => {
        if (form.parentNode) {
          document.body.removeChild(form);
          console.log('[ADMIN] Form removed from body after iframe load');
        }
      }, 100);
    };

    document.body.appendChild(form);
    console.log('[ADMIN] Form appended to body');

    // Small delay to ensure iframe is registered as a valid target
    setTimeout(() => {
      console.log('[ADMIN] Submitting form to iframe:', form.target);
      form.submit();
      console.log('[ADMIN] Form submitted at:', new Date().toISOString());
    }, 50);

    // Reset loading state after a delay
    setTimeout(() => {
      console.log('[ADMIN] Resetting loading state at:', new Date().toISOString());
      setIsGenerating(false);
    }, 3000);
  };

  const handleArchiveRecords = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== [ADMIN] ARCHIVE RECORDS FORM SUBMISSION ===');
    console.log('[ADMIN] Button clicked at:', new Date().toISOString());
    console.log('[ADMIN] Archive Data:', archiveData);
    console.log('[ADMIN] Active Tab:', activeTab);

    if (!csrfToken) {
      console.error('[ADMIN] CSRF token not found');
      addToast('Session expired. Please refresh the page and try again.', 'error');
      return;
    }

    console.log('[ADMIN] CSRF Token:', csrfToken);

    // Validate required fields
    if (!archiveData.academic_level_id) {
      console.error('[ADMIN] Academic level is required');
      addToast('Please select an academic level before creating the archive.', 'warning');
      return;
    }

    if (!archiveData.school_year) {
      console.error('[ADMIN] School year is required');
      addToast('Please select a school year before creating the archive.', 'warning');
      return;
    }

    // Validate at least one data type is selected
    if (!archiveData.include_grades && !archiveData.include_honors && !archiveData.include_certificates) {
      console.error('[ADMIN] No data types selected');
      addToast('Please select at least one data type to include in the archive (grades, honors, or certificates).', 'warning');
      return;
    }

    console.log('[ADMIN] All validations passed, starting archive creation...');
    addToast('Creating Academic Records Archive...', 'info', { duration: 2000 });
    setIsGenerating(true);

    // Create a hidden iframe for download
    let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'download-iframe';
      iframe.name = 'download-iframe'; // IMPORTANT: name attribute must match form target
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      console.log('[ADMIN] Created download iframe with name:', iframe.name);
    } else {
      // Ensure name is set even if iframe already exists
      iframe.name = 'download-iframe';
      console.log('[ADMIN] Using existing download iframe, name set to:', iframe.name);
    }

    // Create a temporary form for file download
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.reports.archive-records');
    form.target = 'download-iframe';

    console.log('[ADMIN] Form action URL:', form.action);

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

    console.log('[ADMIN] Form data being submitted:', formDataEntries);

    // Add iframe load listener BEFORE submitting form
    iframe.onload = () => {
      console.log('[ADMIN] Iframe loaded at:', new Date().toISOString());
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const body = iframeDoc.body;
          const bodyText = body?.textContent || '';
          console.log('[ADMIN] Iframe body content length:', bodyText.length);
          console.log('[ADMIN] Iframe body preview:', bodyText.substring(0, 500));

          // Check for no-data error page
          const errorContainer = body?.querySelector('[data-error-type="no-data"]');
          if (errorContainer) {
            const errorTitle = body?.querySelector('.error-title')?.textContent?.trim() || 'No data found';
            const errorMessage = body?.querySelector('.error-message')?.textContent?.trim() || 'Please adjust your filters and try again.';
            console.warn('[ADMIN] No data found:', errorTitle);
            addToast(`${errorTitle} ${errorMessage}`, 'warning', { duration: 5000 });
            // Clean up form after error is detected
            setTimeout(() => {
              if (form.parentNode) {
                document.body.removeChild(form);
                console.log('[ADMIN] Form removed after error detection');
              }
            }, 100);
            return;
          }

          // Check for generic error messages
          if (bodyText.includes('error') || bodyText.includes('Error') || bodyText.includes('Exception')) {
            console.error('[ADMIN] Error detected in response:', bodyText.substring(0, 1000));
            addToast('An error occurred while creating the archive. Please check the Laravel logs.', 'error', { duration: 7000 });
          } else if (bodyText.length > 0 && bodyText.length < 200) {
            console.error('[ADMIN] Possible error response:', bodyText);
            addToast('Archive creation may have failed. Please check the Laravel logs.', 'warning', { duration: 5000 });
          } else {
            console.log('[ADMIN] Archive likely created successfully');
            addToast('Archive created successfully! Download should start automatically.', 'success', { duration: 3000 });
          }
        }
      } catch (e) {
        console.log('[ADMIN] Could not access iframe content (this is normal for successful downloads):', e);
        addToast('Archive created! Check your downloads folder.', 'success', { duration: 3000 });
      }

      // Clean up form after processing (delay to ensure submission completes)
      setTimeout(() => {
        if (form.parentNode) {
          document.body.removeChild(form);
          console.log('[ADMIN] Form removed from body after iframe load');
        }
      }, 100);
    };

    document.body.appendChild(form);
    console.log('[ADMIN] Form appended to body');

    // Small delay to ensure iframe is registered as a valid target
    setTimeout(() => {
      console.log('[ADMIN] Submitting form to iframe:', form.target);
      form.submit();
      console.log('[ADMIN] Form submitted at:', new Date().toISOString());
    }, 50);

    // Reset loading state after a delay
    setTimeout(() => {
      console.log('[ADMIN] Resetting loading state at:', new Date().toISOString());
      setIsGenerating(false);
    }, 3000);
  };

  // Get available year levels that have sections with data
  const getAvailableYearLevels = (academicLevelId: string) => {
    if (!academicLevelId) return [];

    const levelId = parseInt(academicLevelId);
    const levelSections = sections.filter(s => s.academic_level_id === levelId);

    // Get unique year levels from sections
    const uniqueYearLevels = [...new Set(levelSections.map(s => s.specific_year_level))].filter(Boolean);

    console.log('Available year levels for academic level', academicLevelId, ':', uniqueYearLevels);

    return uniqueYearLevels;
  };

  const handleClassSectionReport = (e: React.FormEvent) => {
    console.log('=== handleClassSectionReport CALLED ===');
    console.log('[ADMIN] Button clicked at:', new Date().toISOString());
    e.preventDefault();
    e.stopPropagation();

    console.log('=== [ADMIN] CLASS SECTION REPORT FORM SUBMISSION ===');
    console.log('[ADMIN] Section Data:', sectionData);
    console.log('[ADMIN] Active Tab:', activeTab);

    if (!csrfToken) {
      console.error('[ADMIN] CSRF token not found');
      addToast('Session expired. Please refresh the page and try again.', 'error');
      return;
    }

    // Validate required fields
    if (!sectionData.academic_level_id) {
      console.error('[ADMIN] Academic level is required');
      addToast('Please select an academic level before generating the report.', 'warning');
      return;
    }

    if (!sectionData.school_year) {
      console.error('[ADMIN] School year is required');
      addToast('Please select a school year before generating the report.', 'warning');
      return;
    }

    console.log('[ADMIN] CSRF Token:', csrfToken);
    console.log('[ADMIN] All validations passed, starting report generation...');
    addToast('Generating Class Section Report...', 'info', { duration: 2000 });

    setIsGenerating(true);

    // Create a hidden iframe for download
    let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'download-iframe';
      iframe.name = 'download-iframe'; // IMPORTANT: name attribute must match form target
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      console.log('[ADMIN] Created download iframe with name:', iframe.name);
    } else {
      // Ensure name is set even if iframe already exists
      iframe.name = 'download-iframe';
      console.log('[ADMIN] Using existing download iframe, name set to:', iframe.name);
    }

    // Create a temporary form for file download
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.reports.class-section-report');
    form.target = 'download-iframe';

    console.log('[ADMIN] Form action URL:', form.action);
    console.log('[ADMIN] Form target:', form.target);

    // Add CSRF token
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Add form data
    const formDataEntries: Record<string, string> = {};
    Object.entries(sectionData).forEach(([key, value]) => {
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

    console.log('[ADMIN] Form data being submitted:', formDataEntries);

    // Add iframe load listener BEFORE submitting form
    iframe.onload = () => {
      console.log('[ADMIN] Iframe loaded at:', new Date().toISOString());
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const body = iframeDoc.body;
          const bodyText = body?.textContent || '';
          console.log('[ADMIN] Iframe body content length:', bodyText.length);
          console.log('[ADMIN] Iframe body preview:', bodyText.substring(0, 500));

          // Check for no-data error page
          const errorContainer = body?.querySelector('[data-error-type="no-data"]');
          if (errorContainer) {
            const errorTitle = body?.querySelector('.error-title')?.textContent?.trim() || 'No data found';
            const errorMessage = body?.querySelector('.error-message')?.textContent?.trim() || 'Please adjust your filters and try again.';
            console.warn('[ADMIN] No data found:', errorTitle);
            addToast(`${errorTitle} ${errorMessage}`, 'warning', { duration: 5000 });
            // Clean up form after error is detected
            setTimeout(() => {
              if (form.parentNode) {
                document.body.removeChild(form);
                console.log('[ADMIN] Form removed after error detection');
              }
            }, 100);
            return;
          }

          // Check for generic error messages
          if (bodyText.includes('error') || bodyText.includes('Error') || bodyText.includes('Exception')) {
            console.error('[ADMIN] Error detected in response:', bodyText.substring(0, 1000));
            addToast('An error occurred while generating the report. Please check the Laravel logs.', 'error', { duration: 7000 });
          } else if (bodyText.length > 0 && bodyText.length < 200) {
            console.error('[ADMIN] Possible error response:', bodyText);
            addToast('Report generation may have failed. Please check the Laravel logs.', 'warning', { duration: 5000 });
          } else {
            console.log('[ADMIN] Report likely generated successfully');
            addToast('Report generated successfully! Download should start automatically.', 'success', { duration: 3000 });
          }
        }
      } catch (e) {
        console.log('[ADMIN] Could not access iframe content (this is normal for successful downloads):', e);
        addToast('Report generated! Check your downloads folder.', 'success', { duration: 3000 });
      }

      // Clean up form after processing (delay to ensure submission completes)
      setTimeout(() => {
        if (form.parentNode) {
          document.body.removeChild(form);
          console.log('[ADMIN] Form removed from body after iframe load');
        }
      }, 100);
    };

    document.body.appendChild(form);
    console.log('[ADMIN] Form appended to body');

    // Small delay to ensure iframe is registered as a valid target
    setTimeout(() => {
      console.log('[ADMIN] Submitting form to iframe:', form.target);
      form.submit();
      console.log('[ADMIN] Form submitted at:', new Date().toISOString());
    }, 50);

    // Reset loading state after a delay
    setTimeout(() => {
      console.log('[ADMIN] Resetting loading state at:', new Date().toISOString());
      setIsGenerating(false);
    }, 2000);
  };

  // Get semester options for College/SHS
  const getSemesterOptions = () => {
    if (gradeData.academic_level_id && gradeData.academic_level_id !== 'all') {
      const levelId = parseInt(gradeData.academic_level_id);
      const selectedLevel = academicLevels.find(level => level.id === levelId);

      // Only show semester selector for College and SHS
      if (selectedLevel && (selectedLevel.key === 'college' || selectedLevel.key === 'senior_highschool')) {
        return gradingPeriods.filter(period =>
          period.academic_level_id === levelId &&
          period.parent_id === null &&
          period.type === 'semester'
        );
      }
    }
    return [];
  };

  const semesterOptions = getSemesterOptions();

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
              <Link href={route('admin.dashboard')}>
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Certificates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_certificates}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Honor Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_honors}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Periods</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_periods}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Sections</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_sections}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="honor-statistics">Honor Statistics</TabsTrigger>
                <TabsTrigger value="archive-records">Archive Records</TabsTrigger>
                <TabsTrigger value="class-section-reports">Class Section Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="honor-statistics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Generate Honor Statistics
                    </CardTitle>
                    <p className="text-sm text-gray-600">Generate comprehensive honor roll statistics and distribution analysis.</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleHonorStatistics} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Academic Level</Label>
                          <Select value={honorData.academic_level_id} onValueChange={(v) => {
                            console.log('[HONOR] Academic Level Changed:', v);
                            setHonorData({
                              ...honorData,
                              academic_level_id: v,
                              year_level: '',
                              track_id: '',
                              strand_id: '',
                              department_id: '',
                              course_id: '',
                              section_id: '',
                            });
                          }}>
                            <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Levels</SelectItem>
                              {academicLevels.map(level => (
                                <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Honor Type</Label>
                          <Select value={honorData.honor_type_id} onValueChange={(v) => setHonorData('honor_type_id', v)}>
                            <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              {honorTypes.map(type => (
                                <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Cascading Filters based on Academic Level */}
                      {(() => {
                        if (!honorData.academic_level_id || honorData.academic_level_id === 'all') return null;

                        const selectedLevel = academicLevels.find(l => l.id.toString() === honorData.academic_level_id);
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <Label>Year Level</Label>
                                <Select
                                  value={honorData.year_level}
                                  onValueChange={(v) => setHonorData({ ...honorData, year_level: v, section_id: '' })}
                                >
                                  <SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger>
                                  <SelectContent>
                                    {yearLevelOptions.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Section</Label>
                                <Select
                                  value={honorData.section_id}
                                  onValueChange={(v) => setHonorData({ ...honorData, section_id: v })}
                                >
                                  <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Sections</SelectItem>
                                    {filteredSectionsHonor.map(section => (
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
                          const shsYearOptions = [
                            { value: 'grade_11', label: 'Grade 11' },
                            { value: 'grade_12', label: 'Grade 12' },
                          ];

                          return (
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Year Level</Label>
                                  <Select
                                    value={honorData.year_level}
                                    onValueChange={(v) => setHonorData({ ...honorData, year_level: v, track_id: '', strand_id: '', section_id: '' })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger>
                                    <SelectContent>
                                      {shsYearOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label>Track</Label>
                                  <Select
                                    value={honorData.track_id}
                                    onValueChange={(v) => setHonorData({ ...honorData, track_id: v, strand_id: '', section_id: '' })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="All tracks" /></SelectTrigger>
                                    <SelectContent>
                                      {(filteredTracksHonor.length > 0 ? filteredTracksHonor : tracks).map(track => (
                                        <SelectItem key={track.id} value={track.id.toString()}>
                                          {track.name} ({track.code})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Strand</Label>
                                  <Select
                                    value={honorData.strand_id}
                                    onValueChange={(v) => setHonorData({ ...honorData, strand_id: v, section_id: '' })}
                                    disabled={!honorData.track_id}
                                  >
                                    <SelectTrigger><SelectValue placeholder={honorData.track_id ? "All strands" : "Select track first"} /></SelectTrigger>
                                    <SelectContent>
                                      {filteredStrandsHonor.map(strand => (
                                        <SelectItem key={strand.id} value={strand.id.toString()}>
                                          {strand.name} ({strand.code})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label>Section</Label>
                                  <Select
                                    value={honorData.section_id}
                                    onValueChange={(v) => setHonorData({ ...honorData, section_id: v })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Sections</SelectItem>
                                      {filteredSectionsHonor.map(section => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                          {section.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Year Level</Label>
                                  <Select
                                    value={honorData.year_level}
                                    onValueChange={(v) => setHonorData({ ...honorData, year_level: v, department_id: '', course_id: '', section_id: '' })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger>
                                    <SelectContent>
                                      {collegeYearOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label>Department</Label>
                                  <Select
                                    value={honorData.department_id}
                                    onValueChange={(v) => setHonorData({ ...honorData, department_id: v, course_id: '', section_id: '' })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                                    <SelectContent>
                                      {(filteredDepartmentsHonor.length > 0 ? filteredDepartmentsHonor : departments).map(dept => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                          {dept.name} ({dept.code})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Course</Label>
                                  <Select
                                    value={honorData.course_id}
                                    onValueChange={(v) => setHonorData({ ...honorData, course_id: v, section_id: '' })}
                                    disabled={!honorData.department_id}
                                  >
                                    <SelectTrigger><SelectValue placeholder={honorData.department_id ? "All courses" : "Select department first"} /></SelectTrigger>
                                    <SelectContent>
                                      {filteredCoursesHonor.map(course => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                          {course.name} ({course.code})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label>Section</Label>
                                  <Select
                                    value={honorData.section_id}
                                    onValueChange={(v) => setHonorData({ ...honorData, section_id: v })}
                                  >
                                    <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Sections</SelectItem>
                                      {filteredSectionsHonor.map(section => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                          {section.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })()}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>School Year</Label>
                          <Select value={honorData.school_year} onValueChange={(v) => setHonorData('school_year', v)}>
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
                          <Select value={honorData.format} onValueChange={(v) => setHonorData('format', v)}>
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

                      <Button type="submit" disabled={honorProcessing || isGenerating} className="flex items-center gap-2">
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
                            Generate Honor Statistics
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="archive-records" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="h-5 w-5" />
                      Archive Academic Records
                    </CardTitle>
                    <p className="text-sm text-gray-600">Create comprehensive archives of academic records for specific levels and years.</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleArchiveRecords} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Academic Level *</Label>
                          <Select
                            value={archiveData.academic_level_id}
                            onValueChange={(v) => {
                              console.log('[ADMIN ARCHIVE] Academic Level Changed:', v);
                              setArchiveData({
                                ...archiveData,
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
                          <p className="text-xs text-gray-500 mt-1">Academic level is required for archiving</p>
                        </div>
                        <div>
                          <Label>School Year *</Label>
                          <Select value={archiveData.school_year} onValueChange={(v) => setArchiveData('school_year', v)}>
                            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                            <SelectContent>
                              {schoolYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
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

                        console.log('[ADMIN ARCHIVE] Rendering cascading filters for:', selectedLevel.key);

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
                              <div>
                                <Label>Year Level</Label>
                                <Select
                                  value={archiveData.year_level}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Year Level Changed:', v);
                                    setArchiveData({ ...archiveData, year_level: v, section_id: '' });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Year Levels</SelectItem>
                                    {yearLevelOptions.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Section</Label>
                                <Select
                                  value={archiveData.section_id}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Section Changed:', v);
                                    setArchiveData({ ...archiveData, section_id: v });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
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
                              <div>
                                <Label>Year Level</Label>
                                <Select
                                  value={archiveData.year_level}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Year Level Changed:', v);
                                    setArchiveData({ ...archiveData, year_level: v, track_id: 'all', strand_id: 'all', section_id: '' });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Year Levels</SelectItem>
                                    <SelectItem value="grade_11">Grade 11</SelectItem>
                                    <SelectItem value="grade_12">Grade 12</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Track</Label>
                                <Select
                                  value={archiveData.track_id}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Track Changed:', v);
                                    setArchiveData({ ...archiveData, track_id: v, strand_id: 'all', section_id: '' });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All tracks" /></SelectTrigger>
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

                              <div>
                                <Label>Strand</Label>
                                <Select
                                  value={archiveData.strand_id}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Strand Changed:', v);
                                    setArchiveData({ ...archiveData, strand_id: v, section_id: '' });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All strands" /></SelectTrigger>
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

                              <div>
                                <Label>Section</Label>
                                <Select
                                  value={archiveData.section_id}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Section Changed:', v);
                                    setArchiveData({ ...archiveData, section_id: v });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
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
                              <div>
                                <Label>Year Level</Label>
                                <Select
                                  value={archiveData.year_level}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Year Level Changed:', v);
                                    setArchiveData({ ...archiveData, year_level: v, department_id: 'all', course_id: '', section_id: '' });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Year Levels</SelectItem>
                                    <SelectItem value="first_year">1st Year</SelectItem>
                                    <SelectItem value="second_year">2nd Year</SelectItem>
                                    <SelectItem value="third_year">3rd Year</SelectItem>
                                    <SelectItem value="fourth_year">4th Year</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Department</Label>
                                <Select
                                  value={archiveData.department_id}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Department Changed:', v);
                                    setArchiveData({ ...archiveData, department_id: v, course_id: '', section_id: '' });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
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

                              <div>
                                <Label>Course</Label>
                                <Select
                                  value={archiveData.course_id}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Course Changed:', v);
                                    setArchiveData({ ...archiveData, course_id: v, section_id: '' });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All courses" /></SelectTrigger>
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

                              <div>
                                <Label>Section</Label>
                                <Select
                                  value={archiveData.section_id}
                                  onValueChange={(v) => {
                                    console.log('[ADMIN ARCHIVE] Section Changed:', v);
                                    setArchiveData({ ...archiveData, section_id: v });
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
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

                      <div>
                        <Label>Include in Archive</Label>
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include_grades"
                              checked={archiveData.include_grades}
                              onCheckedChange={(checked) => {
                                const value = checked === true;
                                console.log('[ADMIN] Archive include_grades changed to:', value);
                                setArchiveData('include_grades', value as any);
                              }}
                            />
                            <Label htmlFor="include_grades" className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              Student grades and academic records
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include_honors"
                              checked={archiveData.include_honors}
                              onCheckedChange={(checked) => {
                                const value = checked === true;
                                console.log('[ADMIN] Archive include_honors changed to:', value);
                                setArchiveData('include_honors', value as any);
                              }}
                            />
                            <Label htmlFor="include_honors" className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Honor roll and academic achievements
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include_certificates"
                              checked={archiveData.include_certificates}
                              onCheckedChange={(checked) => {
                                const value = checked === true;
                                console.log('[ADMIN] Archive include_certificates changed to:', value);
                                setArchiveData('include_certificates', value as any);
                              }}
                            />
                            <Label htmlFor="include_certificates" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Certificates and recognitions
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Export Format</Label>
                        <Select value={archiveData.format} onValueChange={(v) => setArchiveData('format', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excel">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel Workbook (Multiple Sheets)
                              </div>
                            </SelectItem>
                            <SelectItem value="csv">
                              <div className="flex items-center gap-2">
                                <FileX className="h-4 w-4" />
                                CSV Files (Zip Archive)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={archiveProcessing || !archiveData.academic_level_id || !archiveData.school_year} 
                        className="flex items-center gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Archive...
                          </>
                        ) : (
                          'Create Academic Archive'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

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
                            console.log('Academic Level Changed:', v);
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
                                    console.log('Year Level Changed:', v);
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
                                      console.log('Year Level Changed:', v);
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
                                      console.log('Track Changed:', v);
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
                                      console.log('Strand Changed:', v);
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
                                      console.log('Year Level Changed:', v);
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
                                      console.log('Department Changed:', v);
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
                                      console.log('Course Changed:', v);
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
                          <Select value={sectionData.school_year} onValueChange={(v) => setSectionData('school_year', v)}>
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
                          <Select value={sectionData.format} onValueChange={(v) => setSectionData('format', v)}>
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
                            const value = checked === true;
                            console.log('[ADMIN] Section include_grades changed to:', value);
                            setSectionData('include_grades', value as any);
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
