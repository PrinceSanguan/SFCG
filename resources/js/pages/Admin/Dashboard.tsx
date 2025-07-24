import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type UserRole = 'instructor' | 'teacher' | 'class_adviser' | 'chairperson' | 'principal' | 'student' | 'parent';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  level?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface AcademicSettings {
  levels: string[];
  periods: string[];
  strands: string[];
}

interface AuditLog {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showAcademicSettings, setShowAcademicSettings] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Sample data
  const [users] = useState<User[]>([
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@school.edu', role: 'instructor', level: 'College', status: 'active', created_at: '2024-01-15' },
    { id: 2, name: 'Mark Wilson', email: 'mark.wilson@school.edu', role: 'teacher', level: 'SHS', status: 'active', created_at: '2024-01-20' },
    { id: 3, name: 'Emily Davis', email: 'emily.davis@school.edu', role: 'class_adviser', level: 'Elementary', status: 'active', created_at: '2024-02-01' },
    { id: 4, name: 'John Smith', email: 'john.smith@school.edu', role: 'chairperson', status: 'active', created_at: '2024-01-10' },
    { id: 5, name: 'Maria Garcia', email: 'maria.garcia@school.edu', role: 'principal', status: 'active', created_at: '2024-01-05' },
  ]);

  const [academicSettings] = useState<AcademicSettings>({
    levels: ['Elementary', 'Junior High School', 'Senior High School', 'College'],
    periods: ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'],
    strands: ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL-ICT', 'TVL-HE', 'TVL-IA', 'Arts & Design']
  });

  const [auditLogs] = useState<AuditLog[]>([
    { id: 1, user: 'Admin User', action: 'Created new instructor', timestamp: '2024-01-15 10:30:00', details: 'Created Dr. Sarah Johnson as instructor' },
    { id: 2, user: 'Admin User', action: 'Updated academic settings', timestamp: '2024-01-14 14:20:00', details: 'Added new strand: Arts & Design' },
    { id: 3, user: 'Admin User', action: 'Sent announcement', timestamp: '2024-01-13 09:15:00', details: 'Sent announcement to all faculty' },
    { id: 4, user: 'Admin User', action: 'Generated report', timestamp: '2024-01-12 16:45:00', details: 'Generated quarterly performance report' },
  ]);

  const roleDefinitions = {
    instructor: { title: 'Instructor', canCreate: true, notes: 'College level only', color: 'bg-blue-100 text-blue-800' },
    teacher: { title: 'Teacher', canCreate: true, notes: 'SHS only (same function as Instructor)', color: 'bg-green-100 text-green-800' },
    class_adviser: { title: 'Class Adviser', canCreate: true, notes: 'Elementary to SHS', color: 'bg-purple-100 text-purple-800' },
    chairperson: { title: 'Chairperson', canCreate: true, notes: 'Academic oversight role', color: 'bg-yellow-100 text-yellow-800' },
    principal: { title: 'Principal', canCreate: true, notes: 'School-level oversight', color: 'bg-red-100 text-red-800' },
    student: { title: 'Student', canCreate: true, notes: 'Upload via CSV also supported', color: 'bg-indigo-100 text-indigo-800' },
    parent: { title: 'Parent', canCreate: true, notes: 'Can be linked to students', color: 'bg-pink-100 text-pink-800' },
  };

  const stats = [
    { title: 'Total Users', value: '1,247', change: '+12%', changeType: 'positive' },
    { title: 'Active Instructors', value: '48', change: '+3%', changeType: 'positive' },
    { title: 'Enrolled Students', value: '1,156', change: '+8%', changeType: 'positive' },
    { title: 'System Uptime', value: '99.9%', change: '+0.1%', changeType: 'positive' },
  ];

  const recentActivities = [
    { user: 'Dr. Sarah Johnson', action: 'Uploaded new course materials', time: '2 hours ago' },
    { user: 'Mark Wilson', action: 'Submitted grade report for SHS-12A', time: '4 hours ago' },
    { user: 'Emily Davis', action: 'Updated class schedule', time: '6 hours ago' },
    { user: 'System', action: 'Automated backup completed', time: '8 hours ago' },
  ];

  return (
    <AppLayout>
      <Head title="Admin Dashboard" />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your educational institution with comprehensive controls</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add User</span>
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v1a1 1 0 01-1 1h-1v9a2 2 0 01-2 2H7a2 2 0 01-2-2V10H4a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                  </svg>
                  <span>Backup Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'users', name: 'User Management', icon: '👥' },
                { id: 'academic', name: 'Academic Settings', icon: '🎓' },
                { id: 'reports', name: 'Reports', icon: '📈' },
                { id: 'announcements', name: 'Announcements', icon: '📢' },
                { id: 'system', name: 'System Logs', icon: '🔧' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Create Instructor', desc: 'Add new college instructor', icon: '👨‍🏫', color: 'bg-blue-50 hover:bg-blue-100' },
                    { title: 'Assign Adviser', desc: 'Assign class advisers', icon: '📋', color: 'bg-green-50 hover:bg-green-100' },
                    { title: 'Send Announcement', desc: 'Broadcast to all users', icon: '📢', color: 'bg-purple-50 hover:bg-purple-100' },
                    { title: 'Generate Report', desc: 'Create system reports', icon: '📊', color: 'bg-yellow-50 hover:bg-yellow-100' },
                  ].map((action, index) => (
                    <button key={index} className={`${action.color} p-4 rounded-lg border border-gray-200 transition-colors duration-200 text-left`}>
                      <div className="text-2xl mb-2">{action.icon}</div>
                      <h4 className="font-semibold text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{action.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{activity.user.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              {/* Role Definitions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Types & Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(roleDefinitions).map(([key, role]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                          {role.title}
                        </span>
                        {role.canCreate && (
                          <span className="text-green-600 text-sm">✅ Can Create</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{role.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* User List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Current Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleDefinitions[user.role].color}`}>
                              {roleDefinitions[user.role].title}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.level || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.created_at}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CSV Upload Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk User Import</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload CSV file for bulk student import
                      </span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" />
                    </label>
                    <p className="mt-1 text-sm text-gray-500">CSV files up to 10MB</p>
                  </div>
                  <div className="mt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                      Choose File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Settings Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Academic Levels */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Levels</h3>
                  <div className="space-y-3">
                    {academicSettings.levels.map((level, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{level}</span>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200">
                      + Add New Level
                    </button>
                  </div>
                </div>

                {/* Academic Periods */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Periods</h3>
                  <div className="space-y-3">
                    {academicSettings.periods.map((period, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{period}</span>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200">
                      + Add New Period
                    </button>
                  </div>
                </div>

                {/* SHS Strands */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">SHS Strands</h3>
                  <div className="space-y-3">
                    {academicSettings.strands.map((strand, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{strand}</span>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200">
                      + Add New Strand
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructor Assignment */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Instructors & Advisers</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Instructor/Adviser</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Select a faculty member...</option>
                        <option>Dr. Sarah Johnson (Instructor)</option>
                        <option>Mark Wilson (Teacher)</option>
                        <option>Emily Davis (Class Adviser)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Subject Assignment</option>
                        <option>Class Adviser</option>
                        <option>Department Head</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Class/Subject</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Select class or subject...</option>
                        <option>Mathematics - Grade 12 STEM</option>
                        <option>English - Grade 11 ABM</option>
                        <option>Science - Grade 10</option>
                      </select>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Assign
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Current Assignments</h4>
                    <div className="space-y-2">
                      {[
                        { teacher: 'Dr. Sarah Johnson', assignment: 'Advanced Mathematics - College' },
                        { teacher: 'Mark Wilson', assignment: 'Physics - Grade 12 STEM' },
                        { teacher: 'Emily Davis', assignment: 'Class Adviser - Grade 6A' },
                      ].map((assignment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{assignment.teacher}</p>
                            <p className="text-xs text-gray-500">{assignment.assignment}</p>
                          </div>
                          <button className="text-red-600 hover:text-red-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Student Performance Report', desc: 'Comprehensive academic performance analysis', icon: '📊', color: 'bg-blue-50' },
                  { title: 'Faculty Activity Report', desc: 'Teaching loads and performance metrics', icon: '👨‍🏫', color: 'bg-green-50' },
                  { title: 'Enrollment Statistics', desc: 'Student enrollment trends and demographics', icon: '📈', color: 'bg-purple-50' },
                  { title: 'Financial Report', desc: 'Budget allocation and expense tracking', icon: '💰', color: 'bg-yellow-50' },
                  { title: 'Attendance Report', desc: 'Student and faculty attendance patterns', icon: '📅', color: 'bg-red-50' },
                  { title: 'System Usage Report', desc: 'Platform usage analytics and insights', icon: '💻', color: 'bg-indigo-50' },
                ].map((report, index) => (
                  <div key={index} className={`${report.color} rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer`}>
                    <div className="text-3xl mb-3">{report.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
                    <button className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg font-medium border border-gray-200 transition-colors duration-200">
                      Generate Report
                    </button>
                  </div>
                ))}
              </div>

              {/* Report History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { type: 'Student Performance Report', user: 'Admin User', date: '2024-01-15', status: 'Completed' },
                        { type: 'Faculty Activity Report', user: 'Principal', date: '2024-01-14', status: 'Completed' },
                        { type: 'Enrollment Statistics', user: 'Admin User', date: '2024-01-13', status: 'Processing' },
                      ].map((report, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.user}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              report.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {report.status === 'Completed' && (
                              <button className="text-blue-600 hover:text-blue-900">Download</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-8">
              {/* Create Announcement */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send New Announcement</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>All Users</option>
                        <option>Faculty Only</option>
                        <option>Students Only</option>
                        <option>Parents Only</option>
                        <option>Specific Grade Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Normal</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter announcement subject..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Type your announcement message here..."></textarea>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                      Send Announcement
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                      Save as Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Announcement History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Announcement History</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {[
                    { subject: 'School Reopening Guidelines', audience: 'All Users', date: '2024-01-15', priority: 'High', status: 'Sent' },
                    { subject: 'Faculty Meeting Schedule', audience: 'Faculty Only', date: '2024-01-14', priority: 'Normal', status: 'Sent' },
                    { subject: 'New Assessment Policy', audience: 'Students & Parents', date: '2024-01-13', priority: 'Normal', status: 'Draft' },
                  ].map((announcement, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{announcement.subject}</h4>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>To: {announcement.audience}</span>
                            <span>•</span>
                            <span>{announcement.date}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              announcement.priority === 'High' ? 'bg-red-100 text-red-800' :
                              announcement.priority === 'Urgent' ? 'bg-red-200 text-red-900' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {announcement.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            announcement.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {announcement.status}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Templates */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate & Award Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Honor Roll Certificate', type: 'Academic Achievement', preview: '🎓' },
                    { name: 'Perfect Attendance Award', type: 'Attendance Recognition', preview: '📅' },
                    { name: 'Graduation Certificate', type: 'Completion Certificate', preview: '🎉' },
                    { name: 'Dean\'s List Certificate', type: 'Academic Honor', preview: '🏆' },
                    { name: 'Leadership Award', type: 'Special Recognition', preview: '⭐' },
                    { name: 'Community Service Award', type: 'Service Recognition', preview: '🤝' },
                  ].map((template, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="text-center mb-3">
                        <div className="text-4xl mb-2">{template.preview}</div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500">{template.type}</p>
                      </div>
                      <div className="space-y-2">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200">
                          Edit Template
                        </button>
                        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors duration-200">
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* System Logs Tab */}
          {activeTab === 'system' && (
            <div className="space-y-8">
              {/* System Health */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Status</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">Healthy</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Backup</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">2 hours ago</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">847</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">System Audit Logs</h3>
                  <div className="flex space-x-3">
                    <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                      <option>All Actions</option>
                      <option>User Management</option>
                      <option>Settings Changes</option>
                      <option>Data Access</option>
                    </select>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium">
                      Export Logs
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">192.168.1.1</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Backup & Restore */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Backup</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Automatic Backup</p>
                        <p className="text-sm text-gray-500">Daily at 2:00 AM</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Recent Backups</h4>
                      {[
                        { date: '2024-01-15 02:00', size: '2.4 GB', status: 'Completed' },
                        { date: '2024-01-14 02:00', size: '2.3 GB', status: 'Completed' },
                        { date: '2024-01-13 02:00', size: '2.3 GB', status: 'Completed' },
                      ].map((backup, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{backup.date}</p>
                            <p className="text-xs text-gray-500">{backup.size}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600">{backup.status}</span>
                            <button className="text-blue-600 hover:text-blue-800 text-xs">Download</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Create Manual Backup
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Restore</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900">Upload backup file to restore</p>
                        <p className="text-xs text-gray-500 mt-1">Supports .sql, .zip backup files</p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-yellow-800">Caution</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Restoring data will overwrite current database. Ensure you have a recent backup before proceeding.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Select Backup File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                     <select 
                     value={selectedRole}
                     onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                    <option value="">Select a role...</option>
                    {Object.entries(roleDefinitions).map(([key, role]) => (
                      <option key={key} value={key}>{role.title}</option>
                    ))}
                  </select>
                </div>
                {selectedRole && roleDefinitions[selectedRole].notes && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> {roleDefinitions[selectedRole].notes}
                    </p>
                  </div>
                )}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateUserModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                    Create User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
