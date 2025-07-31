import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface CollegeCourse {
    id: number;
    name: string;
    code: string;
    description: string;
    degree_type: string;
    years_duration: number;
    department: string;
    is_active: boolean;
    created_at: string;
    subjects_count?: number;
    student_profiles_count?: number;
}

interface Props {
    courses: CollegeCourse[];
    degreeTypes: Record<string, string>;
}

const CollegeCourses: React.FC<Props> = ({ courses, degreeTypes }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CollegeCourse | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        degree_type: 'bachelor',
        years_duration: 4,
        department: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingCourse) {
            put(`/admin/academic/college-courses/${editingCourse.id}`, {
                onSuccess: () => {
                    setEditingCourse(null);
                    reset();
                }
            });
        } else {
            post('/admin/academic/college-courses', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (course: CollegeCourse) => {
        setData('name', course.name);
        setData('code', course.code);
        setData('description', course.description);
        setData('degree_type', course.degree_type);
        setData('years_duration', course.years_duration);
        setData('department', course.department);
        setData('is_active', course.is_active);
        setEditingCourse(course);
    };

    const handleDelete = (course: CollegeCourse) => {
        if (confirm(`Are you sure you want to delete ${course.name}? This action cannot be undone.`)) {
            router.delete(`/admin/academic/college-courses/${course.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingCourse(null);
        reset();
    };

    const getDegreeTypeColor = (degreeType: string) => {
        switch (degreeType) {
            case 'bachelor': return 'bg-blue-100 text-blue-800';
            case 'master': return 'bg-purple-100 text-purple-800';
            case 'doctorate': return 'bg-red-100 text-red-800';
            case 'diploma': return 'bg-green-100 text-green-800';
            case 'certificate': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Course Programs</h1>
                        <p className="text-gray-600">Manage course programs and degree offerings</p>
                    </div>

                    {/* Create Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <span className="mr-2">➕</span>
                            Add College Course
                        </button>
                    </div>

                    {/* Courses List */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">College Courses List</h2>
                        </div>
                        
                        {courses.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No college courses found. Create your first college course to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Data</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {courses.map((course) => (
                                            <tr key={course.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{course.name}</div>
                                                    <div className="text-xs text-gray-500">{course.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {course.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDegreeTypeColor(course.degree_type)}`}>
                                                        {degreeTypes[course.degree_type]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{course.years_duration} years</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{course.department || 'Not specified'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>Subjects: {course.subjects_count || 0}</div>
                                                    <div>Students: {course.student_profiles_count || 0}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        course.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {course.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(course)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(course)}
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
                    {(showCreateModal || editingCourse) && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingCourse ? 'Edit College Course' : 'Create College Course'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Course Name
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Bachelor of Science in Computer Science"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Course Code
                                            </label>
                                            <input
                                                type="text"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., BSCS, BSIT, BSBA"
                                                maxLength={20}
                                                required
                                            />
                                            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Degree Type
                                            </label>
                                            <select
                                                value={data.degree_type}
                                                onChange={(e) => setData('degree_type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                {Object.entries(degreeTypes).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.degree_type && <p className="text-red-500 text-xs mt-1">{errors.degree_type}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duration (Years)
                                            </label>
                                            <input
                                                type="number"
                                                value={data.years_duration}
                                                onChange={(e) => setData('years_duration', parseInt(e.target.value) || 4)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min={1}
                                                max={10}
                                                required
                                            />
                                            {errors.years_duration && <p className="text-red-500 text-xs mt-1">{errors.years_duration}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Department (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.department}
                                                onChange={(e) => setData('department', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., College of Engineering, College of Business"
                                            />
                                            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
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
                                                placeholder="Brief description of this course"
                                            />
                                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                        </div>

                                        {editingCourse && (
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
                                                {processing ? 'Saving...' : (editingCourse ? 'Update' : 'Create')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminLayout>
    );
};

export default CollegeCourses; 