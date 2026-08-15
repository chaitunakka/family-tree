function formatDateYear(date?: string): string {
  if (!date?.trim()) return '?';
  const year = date.slice(0, 4);
  if (/^\d{4}$/.test(year)) return year;
  return date;
}

export function isDeceased(deathDate?: string): boolean {
  return Boolean(deathDate?.trim());
}

export function formatLifespan(birthDate?: string, deathDate?: string): string | null {
  if (!birthDate?.trim() && !deathDate?.trim()) return null;

  const birth = formatDateYear(birthDate);

  if (isDeceased(deathDate)) {
    return `${birth} – ${formatDateYear(deathDate)}`;
  }

  if (birthDate?.trim()) {
    return `${birth} – Present`;
  }

  return `? – ${formatDateYear(deathDate)}`;
}
