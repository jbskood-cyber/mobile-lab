const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatWeekLabel(start: number, end: number) {
  const first = new Date(start);
  const last = new Date(end - 1);
  const firstMonth = monthNames[first.getMonth()] ?? '';
  const lastMonth = monthNames[last.getMonth()] ?? '';

  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return `${first.getDate()} – ${last.getDate()} ${lastMonth} ${last.getFullYear()}`;
  }

  return `${first.getDate()} ${firstMonth} – ${last.getDate()} ${lastMonth} ${last.getFullYear()}`;
}
