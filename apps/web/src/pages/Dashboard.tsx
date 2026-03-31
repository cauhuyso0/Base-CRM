import { useEffect, useMemo, useState } from 'react';
import {
  dashboardApi,
  DashboardPeriod,
  DashboardStatsResponse,
} from '../api/dashboard.api';
import Layout from '../components/layout/Layout';

function Dashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(value || 0));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStats(period);
        setStats(data);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  const chartData: Array<{ label: string; value: number }> = stats?.revenueSeries ?? [];
  const chartWidth = 820;
  const chartHeight = 300;
  const padding = 36;
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);
  const minValue = Math.min(...chartData.map((item) => item.value), 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;
  const peakPoint =
    chartData.length > 0
      ? chartData.reduce((best, item) => (item.value > best.value ? item : best), chartData[0])
      : null;
  const lowPoint =
    chartData.length > 0
      ? chartData.reduce((best, item) => (item.value < best.value ? item : best), chartData[0])
      : null;

  const chartPoints = useMemo(
    () =>
      chartData.map((item, index) => {
        const x =
          chartData.length > 1
            ? padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1)
            : chartWidth / 2;
        const y =
          chartHeight -
          padding -
          ((item.value - minValue) / Math.max(maxValue - minValue, 1)) *
          (chartHeight - padding * 2);
        return { ...item, x, y };
      }),
    [chartData, maxValue, minValue],
  );

  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints =
    chartPoints.length > 0
      ? `${padding},${chartHeight - padding} ${linePoints} ${chartWidth - padding},${chartHeight - padding
      }`
      : '';
  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const value = maxValue - ratio * (maxValue - minValue);
    const y = padding + ratio * (chartHeight - padding * 2);
    return { value, y };
  });

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
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="dark:text-gray-100">Chưa có dữ liệu thống kê.</div>
        </div>
      </Layout>
    );
  }

  const periodOptions: { value: DashboardPeriod; label: string }[] = [
    { value: '7d', label: '7 ngày' },
    { value: '30d', label: '30 ngày' },
    { value: '90d', label: '90 ngày' },
    { value: '12m', label: '12 tháng' },
    { value: 'all', label: 'Tất cả' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-gray-100">Dashboard</h1>
            <p className="mt-2 dark:text-gray-100">
              Tổng quan về hoạt động của hệ thống
            </p>
          </div>
          <div>
            <label
              htmlFor="dashboard-period"
              className="block text-sm font-medium mb-2 dark:text-gray-100"
            >
              Thời gian
            </label>
            <select
              id="dashboard-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng đơn"
            value={stats.operations.totalOrders}
            subtitle={`${stats.operations.paidOrders} đã thanh toán`}
            icon="🧾"
            color="blue"
          />
          <StatCard
            title="Đơn mới"
            value={stats.operations.newOrders}
            subtitle={`${stats.operations.preparingOrders} đang chuẩn bị`}
            icon="🛎️"
            color="green"
          />
          <StatCard
            title="Doanh thu"
            value={formatCurrency(stats.finance.income)}
            subtitle={`Lợi nhuận: ${formatCurrency(stats.finance.profit)}`}
            icon="💸"
            color="purple"
          />
          <StatCard
            title="Thuế phải nộp"
            value={formatCurrency(stats.tax.payable)}
            subtitle={`Đầu ra: ${new Intl.NumberFormat('vi-VN').format(Number(stats.tax.output))} | Đầu vào: ${new Intl.NumberFormat('vi-VN').format(Number(stats.tax.input))}`}
            icon="🧾"
            color="yellow"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Tổng bàn"
            value={stats.operations.totalTables}
            subtitle={`${stats.operations.totalMenuItems} món`}
            icon="🍽️"
            color="red"
          />
          <StatCard
            title="Đã phục vụ"
            value={stats.operations.servedOrders}
            subtitle="Đơn ở trạng thái SERVED"
            icon="✅"
            color="green"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold dark:text-gray-100">
              Biểu đồ doanh thu
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Theo kỳ đã chọn
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">Tổng kỳ</p>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="rounded-md bg-indigo-50 px-3 py-2 dark:bg-indigo-900/20">
              <p className="text-xs text-indigo-700 dark:text-indigo-300">Trung bình/điểm</p>
              <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                {formatCurrency(avgRevenue)}
              </p>
            </div>
            <div className="rounded-md bg-green-50 px-3 py-2 dark:bg-green-900/20">
              <p className="text-xs text-green-700 dark:text-green-300">Đỉnh cao nhất</p>
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                {peakPoint ? `${peakPoint.label}: ${formatCurrency(peakPoint.value)}` : '-'}
              </p>
            </div>
            <div className="rounded-md bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
              <p className="text-xs text-amber-700 dark:text-amber-300">Thấp nhất</p>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {lowPoint ? `${lowPoint.label}: ${formatCurrency(lowPoint.value)}` : '-'}
              </p>
            </div>
          </div>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Chưa có dữ liệu doanh thu trong kỳ này.
            </p>
          ) : (
            <div className="overflow-x-auto relative">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full min-w-[720px]"
                role="img"
                aria-label="Biểu đồ doanh thu theo thời gian"
              >
                {yTicks.map((tick, index) => (
                  <g key={`grid-${index}`}>
                    <line
                      x1={padding}
                      y1={tick.y}
                      x2={chartWidth - padding}
                      y2={tick.y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                    <text
                      x={padding - 8}
                      y={tick.y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748B"
                    >
                      {new Intl.NumberFormat('vi-VN', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(tick.value)}
                    </text>
                  </g>
                ))}
                <polyline fill="#DBEAFE" points={areaPoints} />
                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  points={linePoints}
                />
                {chartPoints.map((item, index) => {
                  return (
                    <g key={`${item.label}-${index}`}>
                      <circle
                        cx={item.x}
                        cy={item.y}
                        r={hoveredIndex === index ? '6' : '4'}
                        fill="#1D4ED8"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                      <circle
                        cx={item.x}
                        cy={item.y}
                        r="14"
                        fill="transparent"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                      <text
                        x={item.x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#475569"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {hoveredIndex !== null && chartPoints[hoveredIndex] && (
                <div className="absolute top-2 right-2 rounded-md border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <p className="font-semibold">{chartPoints[hoveredIndex].label}</p>
                  <p>{formatCurrency(chartPoints[hoveredIndex].value)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
