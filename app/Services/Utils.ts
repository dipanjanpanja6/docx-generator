export function FormatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + offset).toLocaleString();
}