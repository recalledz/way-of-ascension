export function formatDuration(seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(seconds / 3600);
  seconds -= h * 3600;
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  let out = '';
  if (h > 0) out += h + 'h ';
  if (m > 0 || h > 0) out += m + 'm ';
  out += s + 's';
  return out.trim();
}
