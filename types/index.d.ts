export type Project = { name: string; words: { word: string; weight: number }[] }
export type Guess = { projects: string[] }

declare module 'claude-code' {
  interface PluginState {
    'project-compass': { guess: Guess | null }
  }
}
