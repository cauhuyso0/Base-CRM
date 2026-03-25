/** Đầu–cuối ngày theo giờ local (trình duyệt), dùng lọc order “trong ngày”. */
export function getLocalTodayRangeISO(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}
