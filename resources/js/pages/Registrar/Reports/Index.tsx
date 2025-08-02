import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface AcademicPeriod {
    id: number;
    name: string;
}

interface AcademicLevel {
    id: number;
    name: string;
}

interface Props {
    reportTypes: Record<string, string>;
    academicPeriods: AcademicPeriod[];
    academicLevels: AcademicLevel[];
}

const ReportsIndex: React.FC<Props> = ({ 
    reportTypes = {}, 
    academicPeriods = [], 
    academicLevels = [] 
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const { data, setData, post, processing } = useForm({
        report_type: '',
        academic_period_id: '',
        academic_level_id: '',
        format: 'view',
        date_from: '',
        date_to: '',
    });

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);

        post('/registrar/reports/generate', {
            onSuccess: () => {
                setIsGenerating(false);
            },
            onError: () => {
                setIsGenerating(false);
            }
        });
    };

    const handleQuickReport = (reportType: string, format: string = 'view') => {
        setIsGenerating(true);
        
        router.post('/registrar/reports/generate', {
            report_type: reportType,
            format: format,
        }, {
            onSuccess: () => {
                setIsGenerating(false);
            },
            onError: () => {
                setIsGenerating(false);
            }
        });
    };

    const reportCards = [
        {
            title: 'Student Grades Report',
            description: 'Comprehensive report of all student grades by period and level',
            icon: '📊',
            color: 'bg-blue-500',
            type: 'student_grades',
        },
        {
            title: 'Honor Roll Report',
            description: 'List of students who achieved honor roll status',
            icon: '🏆',
            color: 'bg-yellow-500',
            type: 'honor_roll',
        },
        {
            title: 'Enrollment Report',
            description: 'Student enrollment statistics and demographics',
            icon: '👥',
            color: 'bg-green-500',
            type: 'enrollment',
        },
        {
            title: 'Instructor Performance',
            description: 'Performance metrics for instructors and teachers',
            icon: '👨‍🏫',
            color: 'bg-purple-500',
            type: 'instructor_performance',
        },
        {
            title: 'Academic Summary',
            description: 'Overall academic performance summary',
            icon: '📈',
            color: 'bg-indigo-500',
            type: 'academic_summary',
        },
        {
            title: 'User Activity Report',
            description: 'System usage and user activity logs',
            icon: '📋',
            color: 'bg-gray-500',
            type: 'user_activity',
        },
    ];

    return (
        <>
            <Head title="Reports Management - Registrar" />
            <RegistrarLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
                            <p className="text-gray-600 mt-2">Generate and export academic reports</p>
                        </div>
                        <div className="flex space-x-3">
                            <Link
                                href="/registrar/reports/export"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                📤 Data Export
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {reportCards.map((report) => (
                        <div key={report.type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <div className={`flex items-center justify-center w-12 h-12 ${report.color} rounded-lg`}>
                                    <span className="text-white text-2xl">{report.icon}</span>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-4">{report.description}</p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleQuickReport(report.type, 'view')}
                                    disabled={isGenerating}
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                                >
                                    📄 View
                                </button>
                                <button
                                    onClick={() => handleQuickReport(report.type, 'csv')}
                                    disabled={isGenerating}
                                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                                >
                                    📊 CSV
                                </button>
                                <button
                                    onClick={() => handleQuickReport(report.type, 'pdf')}
                                    disabled={isGenerating}
                                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                                >
                                    📑 PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Custom Report Generator */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Report Generator</h2>
                    
                    <form onSubmit={handleGenerateReport} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report Type
                                </label>
                                <select
                                    value={data.report_type}
                                    onChange={(e) => setData('report_type', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Report Type</option>
                                    {Object.entries(reportTypes).map(([key, value]) => (
                                        <option key={key} value={key}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Period
                                </label>
                                <select
                                    value={data.academic_period_id}
                                    onChange={(e) => setData('academic_period_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Periods</option>
                                    {academicPeriods.map((period) => (
                                        <option key={period.id} value={period.id}>
                                            {period.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Level
                                </label>
                                <select
                                    value={data.academic_level_id}
                                    onChange={(e) => setData('academic_level_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Levels</option>
                                    {academicLevels.map((level) => (
                                        <option key={level.id} value={level.id}>
                                            {level.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Format
                                </label>
                                <select
                                    value={data.format}
                                    onChange={(e) => setData('format', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="view">View Online</option>
                                    <option value="csv">CSV Export</option>
                                    <option value="pdf">PDF Export</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date From
                                </label>
                                <input
                                    type="date"
                                    value={data.date_from}
                                    onChange={(e) => setData('date_from', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date To
                                </label>
                                <input
                                    type="date"
                                    value={data.date_to}
                                    onChange={(e) => setData('date_to', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || isGenerating || !data.report_type}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing || isGenerating ? (
                                    <>
                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                        Generating...
                                    </>
                                ) : (
                                    <>📊 Generate Report</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Report Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Report Instructions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-blue-800 mb-2">Available Report Types:</h4>
                            <ul className="text-blue-700 space-y-1">
                                <li>• <strong>Student Grades:</strong> Complete grade records with statistics</li>
                                <li>• <strong>Honor Roll:</strong> Students who achieved honor status</li>
                                <li>• <strong>Enrollment:</strong> Student demographics and enrollment data</li>
                                <li>• <strong>Instructor Performance:</strong> Teaching metrics and grade distribution</li>
                                <li>• <strong>Academic Summary:</strong> Overall academic performance overview</li>
                                <li>• <strong>User Activity:</strong> System usage and activity logs</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-800 mb-2">Export Formats:</h4>
                            <ul className="text-blue-700 space-y-1">
                                <li>• <strong>View Online:</strong> Interactive report in browser</li>
                                <li>• <strong>CSV Export:</strong> Spreadsheet-compatible format</li>
                                <li>• <strong>PDF Export:</strong> Printable document format</li>
                            </ul>
                            <h4 className="font-medium text-blue-800 mb-2 mt-4">Filter Options:</h4>
                            <ul className="text-blue-700 space-y-1">
                                <li>• Filter by academic period or level</li>
                                <li>• Set custom date ranges</li>
                                <li>• Combine multiple filters for precise results</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </RegistrarLayout>
        </>
    );
};

export default ReportsIndex; 