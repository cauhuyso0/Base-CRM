import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import { DashboardStats } from '@base-crm/shared';
import Layout from '../components/layout/Layout';

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = 'blue',
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-900">
        <div className="flex items-center justify-between dark:text-gray-100">
          <div>
            <p className="text-sm font-medium dark:text-gray-100">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm mt-1 dark:text-gray-100">{subtitle}</p>
            )}
          </div>
          <div
            className={`${colorClasses[color]} rounded-full p-4 text-white text-2xl dark:text-gray-100`}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="dark:text-gray-100">Đang tải...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 dark:text-gray-100">
          {error}
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-gray-100">Dashboard</h1>
          <p className="mt-2 dark:text-gray-100">
            Tổng quan về hoạt động của hệ thống
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng khách hàng"
            value={stats.customers.total}
            subtitle={`${stats.customers.active} đang hoạt động`}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Cơ hội bán hàng"
            value={stats.opportunities.total}
            subtitle={`${stats.opportunities.active} đang mở, ${stats.opportunities.won} đã thắng`}
            icon="🎯"
            color="green"
          />
          <StatCard
            title="Đơn hàng"
            value={stats.salesOrders.total}
            subtitle={`Doanh thu: ${new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(Number(stats.salesOrders.revenue))}`}
            icon="🛒"
            color="purple"
          />
          <StatCard
            title="Cases"
            value={stats.cases.total}
            subtitle={`${stats.cases.open} đang mở`}
            icon="📋"
            color="yellow"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Tickets"
            value={stats.tickets.total}
            subtitle={`${stats.tickets.open} đang mở`}
            icon="🎫"
            color="red"
          />
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
