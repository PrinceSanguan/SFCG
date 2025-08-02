import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Header from '@/pages/Registrar/Header';
import Sidebar from '@/pages/Registrar/Sidebar';

interface AcademicPeriod {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
}

interface Props {
    periods: AcademicPeriod[];
}

const ReportsIndex: React.FC<Props> = ({ periods }) => {
    const [selectedReport, setSelectedReport] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('pdf');

    const { post, processing } = useForm({
        report_type: '',
        academic_period_id: '',
        format: 'pdf',
    });

    const handleGenerateReport = () => {
        post('/registrar/reports/generate', {
            data: {
                report_type: selectedReport,
                academic_period_id: selectedPeriod,
                format: selectedFormat,
            }
        });
    };

    const reportTypes = [
        { value: 'grade_report', label: 'Grade Reports', description: 'Generate comprehensive grade reports for all students' },
        { value: 'honor_statistics', label: 'Honor Statistics', description: 'Generate honor roll statistics and rankings' },
        { value: 'academic_performance', label: 'Academic Performance', description: 'Generate academic performance trends and analysis' },
        { value: 'certificate_issuance', label: 'Certificate Issuance', description: 'Generate certificate issuance tracking reports' },
        { value: 'student_enrollment', label: 'Student Enrollment', description: 'Generate student enrollment statistics' },
    ];

    const exportFormats = [
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel' },
        { value: 'csv', label: 'CSV' },
    ];

    return (
        <>
            <Head title="Reports - Registrar" />
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                                <p className="text-gray-600 mt-2">Generate and export various academic reports</p>
                            </div>

                            {/* Report Generation Form */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Report</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Report Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Report Type
                                        </label>
                                        <select
                                            value={selectedReport}
                                            onChange={(e) => setSelectedReport(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Select a report type</option>
                                            {reportTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedReport && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {reportTypes.find(t => t.value === selectedReport)?.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Academic Period Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Academic Period
                                        </label>
                                        <select
                                            value={selectedPeriod}
                                            onChange={(e) => setSelectedPeriod(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Select an academic period</option>
                                            {periods.map((period) => (
                                                <option key={period.id} value={period.id}>
                                                    {period.name} ({new Date(period.start_date).getFullYear()})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Export Format Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Export Format
                                        </label>
                                        <select
                                            value={selectedFormat}
                                            onChange={(e) => setSelectedFormat(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {exportFormats.map((format) => (
                                                <option key={format.value} value={format.value}>
                                                    {format.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Generate Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleGenerateReport}
                                            disabled={!selectedReport || !selectedPeriod || processing}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? 'Generating...' : 'Generate Report'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Report Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reportTypes.map((type) => (
                                    <div key={type.value} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">{type.label}</h4>
                                        <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                                        <button
                                            onClick={() => {
                                                setSelectedReport(type.value);
                                                setSelectedFormat('pdf');
                                            }}
                                            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                            Quick Generate (PDF)
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default ReportsIndex; 