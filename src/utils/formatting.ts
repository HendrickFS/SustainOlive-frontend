export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatName(thingId: string) {
  const [, idPart] = thingId.split(":");
  const match = idPart.match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) return idPart;
  let name = `${match[1]} ${match[2]}`;
  return capitalize(name);
}

export function formatFeatureName(feature: string): string {
  return feature
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  
  const pad = (n: number) => n.toString().padStart(2, '0');

  const day = pad(date.getUTCDate());
  const month = pad(date.getUTCMonth() + 1); // meses começam do zero
  const year = date.getUTCFullYear();

  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}