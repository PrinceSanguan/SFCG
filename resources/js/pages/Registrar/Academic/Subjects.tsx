import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Header from '@/pages/Registrar/Header';
import Sidebar from '@/pages/Registrar/Sidebar';

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface AcademicStrand {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
}

interface CollegeCourse {
    id: number;
    name: string;
    code: string;
    years_duration: number;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    academic_level_id?: number;
    academic_strand_id?: number;
    college_course_id?: number;
    year_level?: number;
    semester?: string;
    is_active: boolean;
    created_at: string;
    academic_level?: AcademicLevel;
    academic_strand?: AcademicStrand;
    college_course?: CollegeCourse;
}

interface Props {
    subjects: Subject[];
    levels: AcademicLevel[];
    strands: AcademicStrand[];
    collegeCourses: CollegeCourse[];
    semesters: Record<string, string>;
}

const AcademicSubjects: React.FC<Props> = ({ subjects, levels, strands, collegeCourses, semesters }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [subjectType, setSubjectType] = useState<'k12' | 'college'>('k12');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [filteredStrands, setFilteredStrands] = useState<AcademicStrand[]>([]);
    const [availableYearLevels, setAvailableYearLevels] = useState<Record<number, string>>({});

    const { data, setData, post, put, processing, errors, reset } = useForm({
        subject_type: 'k12',
        name: '',
        code: '',
        description: '',
        units: 1,
        academic_level_id: '',
        academic_strand_id: '',
        college_course_id: '',
        year_level: '',
        semester: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingSubject) {
            put(`/registrar/academic/subjects/${editingSubject.id}`, {
                onSuccess: () => {
                    setEditingSubject(null);
                    reset();
                    resetFilters();
                }
            });
        } else {
            post('/registrar/academic/subjects', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    resetFilters();
                }
            });
        }
    };

    const handleEdit = (subject: Subject) => {
        const isCollege = subject.college_course_id ? true : false;
        const type = isCollege ? 'college' : 'k12';
        
        setData('subject_type', type);
        setData('name', subject.name);
        setData('code', subject.code);
        setData('description', subject.description);
        setData('units', subject.units);
        setData('academic_level_id', subject.academic_level_id?.toString() || '');
        setData('academic_strand_id', subject.academic_strand_id?.toString() || '');
        setData('college_course_id', subject.college_course_id?.toString() || '');
        setData('year_level', subject.year_level?.toString() || '');
        setData('semester', subject.semester || '');
        setData('is_active', subject.is_active);
        
        setSubjectType(type);
        setSelectedLevel(subject.academic_level_id?.toString() || '');
        setSelectedCourse(subject.college_course_id?.toString() || '');
        
        if (type === 'k12' && subject.academic_level_id) {
            handleLevelChange(subject.academic_level_id.toString());
        } else if (type === 'college' && subject.college_course_id) {
            handleCourseChange(subject.college_course_id.toString());
        }
        
        setEditingSubject(subject);
    };

    const handleDelete = (subject: Subject) => {
        if (confirm(`Are you sure you want to delete ${subject.name}? This action cannot be undone.`)) {
            router.delete(`/registrar/academic/subjects/${subject.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingSubject(null);
        reset();
        resetFilters();
    };

    const resetFilters = () => {
        setSubjectType('k12');
        setSelectedLevel('');
        setSelectedCourse('');
        setFilteredStrands([]);
        setAvailableYearLevels({});
    };

    const handleLevelChange = (levelId: string) => {
        setSelectedLevel(levelId);
        setData('academic_level_id', levelId);
        setData('academic_strand_id', '');
        
        if (levelId) {
            const levelStrands = strands.filter(strand => strand.academic_level_id.toString() === levelId);
            setFilteredStrands(levelStrands);
        } else {
            setFilteredStrands([]);
        }
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourse(courseId);
        setData('college_course_id', courseId);
        setData('year_level', '');
        setData('semester', '');
        
        if (courseId) {
            const course = collegeCourses.find(c => c.id.toString() === courseId);
            if (course) {
                const yearLevels: Record<number, string> = {};
                for (let i = 1; i <= course.years_duration; i++) {
                    yearLevels[i] = `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Year`;
                }
                setAvailableYearLevels(yearLevels);
            }
        } else {
            setAvailableYearLevels({});
        }
    };

    const handleSubjectTypeChange = (type: 'k12' | 'college') => {
        setSubjectType(type);
        setData('subject_type', type);
        setData('academic_level_id', '');
        setData('academic_strand_id', '');
        setData('college_course_id', '');
        setData('year_level', '');
        setData('semester', '');
        
        resetFilters();
    };

    return (
        <>
            <Head title="All Subjects - Registrar" />
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">All Subjects</h1>
                                <p className="text-gray-600 mt-2">Configure academic subjects for all educational programs</p>
                            </div>

                            {/* Create Button */}
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <span className="mr-2">➕</span>
                                    Add Subject
                                </button>
                            </div>

                            {/* Subjects List */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Subjects List ({subjects.length})
                                    </h3>
                                </div>
                                
                                {subjects.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        No subjects found. Create your first subject to get started.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program/Level</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {subjects.map((subject) => (
                                                    <tr key={subject.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {subject.code}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                subject.college_course_id ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {subject.college_course_id ? 'Higher Education' : 'Basic Education'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{subject.units}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {subject.college_course_id ? (
                                                                <div>
                                                                    <div className="text-sm text-gray-900">{subject.college_course?.name}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {subject.year_level && `Year ${subject.year_level}`}
                                                                        {subject.semester && ` - ${semesters[subject.semester]}`}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <div className="text-sm text-gray-900">{subject.academic_level?.name}</div>
                                                                    {subject.academic_strand && (
                                                                        <div className="text-xs text-gray-500">{subject.academic_strand.name}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">{subject.description || 'No description'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                subject.is_active 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {subject.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleEdit(subject)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(subject)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Create/Edit Modal */}
                            {(showCreateModal || editingSubject) && (
                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                    <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                                        <div className="mt-3">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                {editingSubject ? 'Edit Subject' : 'Create Subject'}
                                            </h3>
                                            
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Subject Type
                                                    </label>
                                                    <div className="flex space-x-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                value="k12"
                                                                checked={subjectType === 'k12'}
                                                                onChange={(e) => handleSubjectTypeChange(e.target.value as 'k12' | 'college')}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-900">Basic Education (K-12)</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                value="college"
                                                                checked={subjectType === 'college'}
                                                                onChange={(e) => handleSubjectTypeChange(e.target.value as 'k12' | 'college')}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-900">Higher Education</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {subjectType === 'k12' ? (
                                                    <>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Academic Level
                                                            </label>
                                                            <select
                                                                value={selectedLevel}
                                                                onChange={(e) => handleLevelChange(e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            >
                                                                <option value="">Select Academic Level</option>
                                                                {levels.map((level) => (
                                                                    <option key={level.id} value={level.id}>
                                                                        {level.name} ({level.code})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.academic_level_id && <p className="text-red-500 text-xs mt-1">{errors.academic_level_id}</p>}
                                                        </div>

                                                        {filteredStrands.length > 0 && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Academic Strand (Optional)
                                                                </label>
                                                                <select
                                                                    value={data.academic_strand_id}
                                                                    onChange={(e) => setData('academic_strand_id', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                >
                                                                    <option value="">Select Strand (Optional)</option>
                                                                    {filteredStrands.map((strand) => (
                                                                        <option key={strand.id} value={strand.id}>
                                                                            {strand.name} ({strand.code})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.academic_strand_id && <p className="text-red-500 text-xs mt-1">{errors.academic_strand_id}</p>}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                College Course
                                                            </label>
                                                            <select
                                                                value={selectedCourse}
                                                                onChange={(e) => handleCourseChange(e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            >
                                                                <option value="">Select College Course</option>
                                                                {collegeCourses.map((course) => (
                                                                    <option key={course.id} value={course.id}>
                                                                        {course.name} ({course.code})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.college_course_id && <p className="text-red-500 text-xs mt-1">{errors.college_course_id}</p>}
                                                        </div>

                                                        {Object.keys(availableYearLevels).length > 0 && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Year Level
                                                                    </label>
                                                                    <select
                                                                        value={data.year_level}
                                                                        onChange={(e) => setData('year_level', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        required
                                                                    >
                                                                        <option value="">Select Year Level</option>
                                                                        {Object.entries(availableYearLevels).map(([year, label]) => (
                                                                            <option key={year} value={year}>
                                                                                {label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {errors.year_level && <p className="text-red-500 text-xs mt-1">{errors.year_level}</p>}
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Semester
                                                                    </label>
                                                                    <select
                                                                        value={data.semester}
                                                                        onChange={(e) => setData('semester', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        required
                                                                    >
                                                                        <option value="">Select Semester</option>
                                                                        {Object.entries(semesters).map(([key, value]) => (
                                                                            <option key={key} value={key}>
                                                                                {value}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Subject Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="e.g., Mathematics, English, Science"
                                                        required
                                                    />
                                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Subject Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.code}
                                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="e.g., MATH101, ENG101"
                                                        maxLength={20}
                                                        required
                                                    />
                                                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Units
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.units}
                                                        onChange={(e) => setData('units', parseInt(e.target.value) || 1)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        min="1"
                                                        max="10"
                                                        required
                                                    />
                                                    {errors.units && <p className="text-red-500 text-xs mt-1">{errors.units}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={data.description}
                                                        onChange={(e) => setData('description', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        rows={3}
                                                        placeholder="Brief description of this subject"
                                                    />
                                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                                </div>

                                                {editingSubject && (
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="is_active"
                                                            checked={data.is_active}
                                                            onChange={(e) => setData('is_active', e.target.checked)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                                            Active
                                                        </label>
                                                    </div>
                                                )}

                                                <div className="flex justify-end space-x-3 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={closeModal}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                                    >
                                                        {processing ? 'Saving...' : (editingSubject ? 'Update' : 'Create')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default AcademicSubjects; 