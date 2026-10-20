import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Project } from '../types'
import { guess, parseRegistry } from './match'

const current = atom({ plugin: 'project-compass', key: 'guess' } as const, null)

let projects: Project[] = []

async function load($: EngineInterface) {
  const path = `${await $.session.cwd()}/data/projects.md`
  projects = (await $.fs.exists(path)) ? parseRegistry(await $.fs.read(path)) : []
}

async function show($: EngineInterface, draft: string) {
  await update($, current, () => (projects.length ? guess(projects, draft) : null))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await load($)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await load($)
    return next(e)
  })

  on('prompt.edit', async ($, e, next) => {
    const box = await next(e)
    await show($, box.text)
    return box
  })

  on('prompt.change', async ($, e, next) => {
    await show($, e.text)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, current, () => null)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const g = await read($, current)
    if (e.props.hasSurvey || g === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        {g.projects.length === 1 ? (
          <Text color="cyan">→ {g.projects[0]}</Text>
        ) : (
          <Text color="yellow">? ambiguous: {g.projects.join(' / ')}</Text>
        )}
      </Box>
    )
  })
}
