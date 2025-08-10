import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type LeafItem = { title: string; href: string; icon?: string };
type NodeItem = { title: string; icon?: string; key: string; submenu: Array<LeafItem | NodeItem> };
type MenuItem = ({ href: string; title: string; icon?: string; key?: string } | NodeItem);

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { url } = usePage();
  const isMobile = useIsMobile();
  const [expandedSections, setExpandedSections] = useState<string[]>(['academic']);

  const isActive = (href: string) => url.startsWith(href);

  useEffect(() => {
    const currentSections: string[] = [];
    if (url.startsWith('/admin/users')) currentSections.push('users');
    if (url.startsWith('/admin/users/students')) currentSections.push('users.students');
    if (url.startsWith('/admin/academic')) currentSections.push('academic');
    if (url.startsWith('/admin/assignments')) currentSections.push('assignments');
    if (url.startsWith('/admin/honors') || url.startsWith('/admin/certificates')) currentSections.push('honors');
    if (url.startsWith('/admin/reports')) currentSections.push('reports');
    if (url.startsWith('/admin/system')) currentSections.push('system');
    setExpandedSections(prev => [...new Set([...prev, ...currentSections])]);
  }, [url]);

  const toggleSection = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) onClose();
  };

  const isSectionActive = (submenu: Array<LeafItem | NodeItem>) => {
    return submenu.some(item => {
      if ('href' in item) return isActive(item.href);
      if ('submenu' in item) return item.submenu.some(leaf => 'href' in leaf && isActive(leaf.href));
      return false;
    });
  };

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: '🏠', key: 'dashboard' },
    {
      title: 'User Management', icon: '👥', key: 'users', submenu: [
        { title: 'Instructors', href: '/admin/users/instructors', icon: '👨‍🏫' },
        { title: 'Teachers', href: '/admin/users/teachers', icon: '👩‍🏫' },
        { title: 'Advisers', href: '/admin/users/advisers', icon: '🧑‍🏫' },
        { title: 'Chairpersons', href: '/admin/users/chairpersons', icon: '👔' },
        { title: 'Principals', href: '/admin/users/principals', icon: '🏫' },
        { title: 'Registrars', href: '/admin/users/registrars', icon: '📋' },
        {
          title: 'All Students', icon: '👨‍🎓', key: 'users.students', submenu: [
            { title: 'All Students', href: '/admin/users/students', icon: '📋' },
            { title: 'Elementary', href: '/admin/users/students/elementary?add=1', icon: '🎒' },
            { title: 'Junior High School', href: '/admin/users/students/junior-high?add=1', icon: '📚' },
            { title: 'Senior High School', href: '/admin/users/students/senior-high?add=1', icon: '🎓' },
            { title: 'College', href: '/admin/users/students/college?add=1', icon: '🎓' },
          ]
        },
        { title: 'Parents', href: '/admin/users/parents', icon: '👨‍👩‍👧' },
        { title: 'Upload CSV', href: '/admin/users/upload', icon: '📤' },
      ]
    },
    {
      title: 'Academic Setup', icon: '🏫', key: 'academic', submenu: [
        { title: 'Academic Levels', href: '/admin/academic/levels', icon: '📊' },
        { title: 'Academic Periods', href: '/admin/academic/periods', icon: '📅' },
        { title: 'Academic Strands', href: '/admin/academic/strands', icon: '🎯' },
        { title: 'Course Programs', href: '/admin/academic/college-courses', icon: '🎓' },
        { title: 'Higher Education Subjects', href: '/admin/academic/college-subjects', icon: '📖' },
        { title: 'All Subjects', href: '/admin/academic/subjects', icon: '📚' },
      ]
    },
    { title: 'Assignments', icon: '📋', key: 'assignments', submenu: [
      { title: 'Assign Teachers (SHS)', href: '/admin/assignments/teachers', icon: '👩‍🏫' },
      { title: 'Assign Instructors (College)', href: '/admin/assignments/instructors', icon: '👨‍🏫' },
      { title: 'Adviser Assignments', href: '/admin/assignments/advisers', icon: '🧑‍🏫' },
    ]},
    { title: 'Grading', href: '/admin/grading', icon: '📊', key: 'grading' },
    { title: 'Honors & Certificates', icon: '🏆', key: 'honors', submenu: [
      { title: 'Honors Management', href: '/admin/honors', icon: '🏆' },
      { title: 'Certificates', href: '/admin/certificates', icon: '📜' },
      { title: 'Certificate Uploads', href: '/certificate-images', icon: '📤' },
    ]},
    { title: 'Notifications', href: '/admin/notifications', icon: '📧', key: 'notifications' },
    { title: 'Reports', icon: '📈', key: 'reports', submenu: [
      { title: 'Generate Reports', href: '/admin/reports', icon: '📊' },
      { title: 'Export Data', href: '/admin/reports/export', icon: '📤' },
    ]},
    { title: 'System', icon: '⚙️', key: 'system', submenu: [
      { title: 'Audit Logs', href: '/admin/system/logs', icon: '📝' },
      { title: 'Backup', href: '/admin/system/backup', icon: '💾' },
      { title: 'Restore', href: '/admin/system/restore', icon: '🔄' },
    ]},
  ];

  const sidebarClasses = `${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen flex-shrink-0 ${isMobile && !isOpen ? '-translate-x-full' : ''} transition-transform duration-300 ease-in-out`;

  const renderLeaf = (leaf: LeafItem) => (
    <Link
      key={leaf.href}
      href={leaf.href}
      onClick={handleLinkClick}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive(leaf.href) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {leaf.icon && <span className="mr-3 text-sm">{leaf.icon}</span>}
      <span className="truncate">{leaf.title}</span>
    </Link>
  );

  const renderNode = (node: NodeItem) => (
    <div className="sidebar-dropdown" key={node.key}>
      <button
        onClick={(e) => toggleSection(node.key, e)}
        className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
          isSectionActive(node.submenu) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center min-w-0">
          {node.icon && <span className="mr-3 text-base">{node.icon}</span>}
          <span className="truncate">{node.title}</span>
        </div>
        <svg className={`ml-2 h-4 w-4 flex-shrink-0 transform transition-transform ${expandedSections.includes(node.key) ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {expandedSections.includes(node.key) && (
        <div className="ml-6 space-y-1 mt-1">
          {node.submenu.map((sub) => {
            const possibleNode = sub as NodeItem;
            if ((possibleNode as NodeItem).submenu) {
              return renderNode(possibleNode);
            }
            return renderLeaf(sub as LeafItem);
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile && isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg font-bold text-sm">A</div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900">Admin Panel</span>
          </div>
        </div>
        <nav className="mt-5 px-2 pb-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {'href' in item ? (
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon && <span className="mr-3 text-base">{item.icon}</span>}
                    <span className="truncate">{item.title}</span>
                  </Link>
                ) : (
                  renderNode(item as NodeItem)
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

