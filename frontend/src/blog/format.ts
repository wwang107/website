export function formatDate(date: string) {
  const d = new Date(date + 'T00:00:00');
  return isNaN(d.getTime())
    ? date
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
