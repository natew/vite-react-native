import { defineConfig } from 'vitest/config'

// because we build things and need to use "dist" dir
// cant be parallel, we'd need to support custom out dir

export default defineConfig({
  test: {
    globalSetup: '@vxrn/test/setup',
    // reporters: ['hanging-process'],
    teardownTimeout: 500,
    poolOptions: {
      forks: {
        maxForks: 1,
        minForks: 1,
      },
      threads: {
        maxThreads: 1,
        minThreads: 1,
      },
    },
  },
})
