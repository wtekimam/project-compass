import type { Guess, Project } from '../types'

const STOP = new Set([
  'about', 'after', 'agent', 'based', 'between', 'build', 'digital', 'every', 'firstmate',
  'investigation', 'local', 'other', 'their', 'there', 'under', 'which', 'while', 'worker',
])

const words = (text: string): string[] =>
  text.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !STOP.has(w))

// Registry lines look like `- <name> [<mode>] - <description> (added <date>)`.
export const parseRegistry = (text: string): Project[] => {
  const rows: { name: string; nameWords: string[]; descWords: string[] }[] = []
  for (const line of text.split('\n')) {
    const m = /^- (\S+)(?: \[[^\]]*\])? - (.*?)(?: \(added [^)]*\))?\s*$/.exec(line)
    if (!m) continue
    const name = m[1]
    rows.push({ name, nameWords: words(name.replace(/([a-z])([A-Z])/g, '$1 $2')), descWords: words(m[2]) })
  }
  // A word unique to one project is a clear hint; one shared by a few is a weak hint
  // that can only make a request ambiguous; one shared more widely means nothing.
  const owners = new Map<string, Set<string>>()
  for (const r of rows) {
    for (const w of new Set([...r.nameWords, ...r.descWords])) {
      owners.set(w, (owners.get(w) ?? new Set()).add(r.name))
    }
  }
  return rows.map(r => ({
    name: r.name,
    words: [...new Set([...r.nameWords, ...r.descWords])]
      .filter(w => (owners.get(w)?.size ?? 0) <= 3)
      .map(w => ({ word: w, weight: owners.get(w)?.size === 1 ? 2 : 1 })),
  }))
}

export const guess = (projects: Project[], draft: string): Guess | null => {
  const text = draft.trim()
  if (text.startsWith('/') || text.split(/\s+/).length < 2) return null
  const lower = text.toLowerCase()
  const tokens = new Set(words(text))
  let best = 0
  let hits: string[] = []
  for (const p of projects) {
    // The full project name is the strongest signal; a distinctive word is a hint.
    let score = new RegExp(`(^|[^a-z0-9-])${p.name.toLowerCase()}($|[^a-z0-9-])`).test(lower) ? 20 : 0
    for (const w of p.words) if (tokens.has(w.word)) score += w.weight
    if (score === 0) continue
    if (score > best) {
      best = score
      hits = [p.name]
    } else if (score === best) {
      hits.push(p.name)
    }
  }
  return hits.length ? { projects: hits } : null
}
