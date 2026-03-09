import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });
  const navigate = useNavigate();
  const location = useLocation();

  const applyTheme = (isDark: boolean) => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  };

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    applyTheme(isDarkMode);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/customers', label: 'Khách hàng', icon: '👥' },
    { path: '/opportunities', label: 'Cơ hội', icon: '🎯' },
    { path: '/sales-orders', label: 'Đơn hàng', icon: '🛒' },
    { path: '/cases', label: 'Cases', icon: '📋' },
    { path: '/tickets', label: 'Tickets', icon: '🎫' },
  ];

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
    >
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <h1 className="text-xl font-bold">Base CRM</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <span className="mr-3">🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        {/* Top navbar */}
        <header
          className={`shadow-sm sticky top-0 z-30 ${isDarkMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className={isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
            >
              ☰
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  const nextTheme = !isDarkMode;
                  setIsDarkMode(nextTheme);
                  applyTheme(nextTheme);
                  localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
                }}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'bg-blue-900' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white text-sm shadow-md transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-9' : 'translate-x-1'
                  }`}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </span>
              </button>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Welcome</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
