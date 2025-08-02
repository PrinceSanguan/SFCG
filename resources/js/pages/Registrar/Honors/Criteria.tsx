import React from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/pages/Registrar/Header';
import Sidebar from '@/pages/Registrar/Sidebar';

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface HonorCriterion {
    id: number;
    honor_type: string;
    academic_level: AcademicLevel;
    minimum_gpa: number;
    maximum_gpa: number;
    description?: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    criteria: HonorCriterion[];
    levels: AcademicLevel[];
}

const HonorCriteria: React.FC<Props> = ({ criteria, levels }) => {
    const getHonorTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'president': 'bg-yellow-100 text-yellow-800',
            'dean': 'bg-blue-100 text-blue-800',
            'academic': 'bg-green-100 text-green-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title="Honor Criteria - Registrar" />
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Honor Criteria</h1>
                                <p className="text-gray-600 mt-2">View honor criteria for different academic levels</p>
                            </div>

                            {/* Honor Criteria Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Honor Criteria ({criteria.length})
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Honor Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Academic Level
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    GPA Range
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {criteria.map((criterion) => (
                                                <tr key={criterion.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHonorTypeColor(criterion.honor_type)}`}>
                                                            {criterion.honor_type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {criterion.academic_level.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {criterion.minimum_gpa.toFixed(2)} - {criterion.maximum_gpa.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {criterion.description || 'No description'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            criterion.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {criterion.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(criterion.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Total Criteria</h4>
                                    <p className="text-3xl font-bold text-blue-600">{criteria.length}</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Active Criteria</h4>
                                    <p className="text-3xl font-bold text-green-600">
                                        {criteria.filter(c => c.is_active).length}
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Academic Levels</h4>
                                    <p className="text-3xl font-bold text-purple-600">{levels.length}</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default HonorCriteria; 