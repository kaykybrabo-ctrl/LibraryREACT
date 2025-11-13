export const formatDateWithoutTimezone = (dateString: string): string => {
  if (!dateString) return '';
  
  const cleanDate = dateString.replace('T', ' ').replace('Z', '').replace(/\.\d{3}$/, '');
  const [datePart, timePart] = cleanDate.split(' ');
  const [year, month, day] = datePart.split('-');
  const [hour, minute, second] = (timePart || '00:00:00').split(':');
  
  const date = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
  
  return date.toLocaleString('pt-BR');
};
