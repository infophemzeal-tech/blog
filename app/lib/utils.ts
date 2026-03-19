export function formatGistDate(dateString: string) {
  const date = new Date(dateString);
  
  // Get components
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  const day = date.getDate();

  // Logic for ordinal suffix (1st, 2nd, 3rd, 4th...)
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `Posted on ${dayName} ${getOrdinal(day)} ${monthName}, ${year} - gistpadi.ng`;
}