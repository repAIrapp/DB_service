function parisDateKey(d = new Date()) {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const [dd, mm, yyyy] = fmt.split('/');
  return `${yyyy}-${mm}-${dd}`; 
}
module.exports = { parisDateKey };
