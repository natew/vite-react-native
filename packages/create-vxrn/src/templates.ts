// import * as FullstackSteps from './steps/fullstack'
import * as BasicTemplateSteps from './steps/one'

export const templates = [
  {
    title: `One + Zero`,
    value: 'one-zero',
    type: 'included-in-monorepo',
    hidden: false,
    repo: {
      url: `https://github.com/onejs/one.git`,
      sshFallback: `git@github.com:onejs/one.git`,
      dir: [`examples`, `one-zero`],
      branch: 'main',
    },
    ...BasicTemplateSteps,
  },

  {
    title: `Minimal`,
    value: 'Minimal',
    type: 'included-in-monorepo',
    hidden: false,
    repo: {
      url: `https://github.com/onejs/one.git`,
      sshFallback: `git@github.com:onejs/one.git`,
      dir: [`examples`, `one-basic`],
      branch: 'main',
    },
    ...BasicTemplateSteps,
  },

  {
    title: `Minimal Tamagui`,
    value: 'Tamagui',
    type: 'included-in-monorepo',
    hidden: false,
    repo: {
      url: `https://github.com/onejs/one.git`,
      sshFallback: `git@github.com:onejs/one.git`,
      dir: [`examples`, `one-tamagui`],
      branch: 'main',
    },
    ...BasicTemplateSteps,
  },

  {
    title: `Fullstack Traditional - Drizzle, Postgres, Tamagui`,
    value: 'Recommended',
    type: 'included-in-monorepo',
    hidden: false,
    repo: {
      url: `https://github.com/onejs/one.git`,
      sshFallback: `git@github.com:onejs/one.git`,
      dir: [`examples`, `one-recommended`],
      branch: 'main',
    },
    ...BasicTemplateSteps,
  },

  // {
  //   title: `Fullstack - Recommended + Supabase Auth flows`,
  //   value: 'Fullstack',
  //   type: 'included-in-monorepo',
  //   hidden: false,
  //   repo: {
  //     url: `https://github.com/onejs/one.git`,
  //     sshFallback: `git@github.com:onejs/one.git`,
  //     dir: [`examples`, `one-basic`],
  //     branch: 'main',
  //   },
  //   ...FullstackSteps,
  // },

  // {
  //   title: `Bare`,
  //   value: 'bare',
  //   type: 'included-in-monorepo',
  //   hidden: false,
  //   repo: {
  //     url: `https://github.com/onejs/one.git`,
  //     sshFallback: `git@github.com:onejs/one.git`,
  //     dir: [`examples`, `bare`],
  //     branch: 'main',
  //   },
  //   extraSteps: stepsBare,
  // },
] as const
