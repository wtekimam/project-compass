import { expect, test } from 'claude-code/testing'

import { guess, parseRegistry } from './match'

const registry = `- metrics [no-mistakes] - Marketing analytics dashboard (Python) (added 2026-01-01)
- acme-portal [no-mistakes] - Acme staff portal and app launcher (TypeScript, Vite) (added 2026-01-01)
- acme-website [no-mistakes] - Acme marketing website, static HTML published by Netlify (added 2026-01-01)
- acme-notes [no-mistakes] - Acme desktop app for meeting transcription (JavaScript) (added 2026-01-01)
- inbox-bot [no-mistakes] - Order email processor: Mailgun webhooks and PDF parsing (Python) (added 2026-01-01)`

const projects = parseRegistry(registry)

test('a named project wins', () => {
  expect(guess(projects, 'fix the login on acme-portal')).toEqual({ projects: ['acme-portal'] })
})
test('a distinctive word points at its project', () => {
  expect(guess(projects, 'the netlify deploy is broken')).toEqual({ projects: ['acme-website'] })
  expect(guess(projects, 'mailgun webhook keeps failing')).toEqual({ projects: ['inbox-bot'] })
})
test('a shared word is ambiguous or silent', () => {
  expect(guess(projects, 'update the marketing copy')).toEqual({ projects: ['metrics', 'acme-website'] })
  expect(guess(projects, 'acme needs a change')).toEqual({ projects: ['acme-portal', 'acme-website', 'acme-notes'] })
  expect(guess(projects, 'acme website footer')).toEqual({ projects: ['acme-website'] })
  expect(guess(projects, 'refresh the readme please')).toEqual({ projects: [] })
})
test('a draft with no project match says so', () => {
  expect(guess(projects, 'what time is it')).toEqual({ projects: [] })
})
test('slash commands and single words stay silent', () => {
  expect(guess(projects, '/stow now')).toBeNull()
  expect(guess(projects, 'metrics')).toBeNull()
})
