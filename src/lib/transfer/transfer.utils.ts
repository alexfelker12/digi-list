export function resolveListName(name: string, existingNames: string[]): string {
  if (!existingNames.includes(name)) return name

  const base = name.replace(/\s\(\d+\)$/, '')
  const numbers = existingNames
    .map((n) => n.match(new RegExp(`^${base}\\s\\((\\d+)\\)$`))?.[1])
    .filter(Boolean)
    .map(Number)

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 2
  return `${base} (${next})`
}
