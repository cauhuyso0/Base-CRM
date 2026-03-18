import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { OrderNotification, restaurantApi } from '../../api/restaurant.api';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const data = await restaurantApi.getNotifications();
        if (mounted) {
          const list = Array.isArray(data) ? data : [];
          setNotifications(list);
          setNotificationCount(list.length);
        }
      } catch {
        if (mounted) {
          setNotifications([]);
          setNotificationCount(0);
        }
      }
    };

    void fetchNotifications();
    const timer = window.setInterval(() => {
      void fetchNotifications();
    }, 60000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/companies', label: 'Công ty', icon: '🏢' },
    { path: '/branches', label: 'Chi nhánh', icon: '🏬' },
    { path: '/restaurant/orders', label: 'Nhận order', icon: '🛎️' },
    { path: '/restaurant/menu', label: 'Quản lý menu', icon: '📋' },
    { path: '/finance/business-settings', label: 'Business Settings', icon: '⚙️' },
    { path: '/finance/cashflow', label: 'Sổ thu chi', icon: '💸' },
    { path: '/finance/tax-summary', label: 'Tổng hợp thuế', icon: '🧾' },
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
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className={`relative rounded-full p-2 transition-colors ${
                    isDarkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Thông báo đơn mới"
                  aria-label="Thông báo đơn mới"
                >
                  <span className="text-lg">🔔</span>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-80 rounded-lg border shadow-lg z-50 ${
                      isDarkMode
                        ? 'bg-gray-900 border-gray-800 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <p className="font-semibold">Thông báo</p>
                      <span className="text-xs opacity-70">{notificationCount} mới</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-4 text-sm opacity-70">Không có thông báo mới</p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={async () => {
                              try {
                                await restaurantApi.markNotificationRead(n.id);
                                const data = await restaurantApi.getNotifications();
                                const list = Array.isArray(data) ? data : [];
                                setNotifications(list);
                                setNotificationCount(list.length);
                              } finally {
                                setNotificationOpen(false);
                              }
                            }}
                            className={`w-full text-left px-4 py-3 border-b last:border-b-0 ${
                              isDarkMode
                                ? 'border-gray-800 hover:bg-gray-800/60'
                                : 'border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(n.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate('/restaurant/orders');
                        }}
                        className="w-full px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        Xem trang nhận order
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
