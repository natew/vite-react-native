// @vitest-environment native

import { afterEach, beforeAll, expect, test, inject } from 'vitest'
import { remote } from 'webdriverio'
import path from 'node:path'
import {
  editComponentFile,
  editFile,
  editLayoutFile,
  editRouteFile,
  editTestComponentContainingRelativeImportFile,
  revertEditedFiles,
  root,
} from './utils'
import { getWebDriverConfig } from '../vitest-environment-native'

beforeAll(async () => {
  revertEditedFiles()
})

afterEach(async () => {
  revertEditedFiles()
})

async function testHMR(
  testId: string,
  originalText: string,
  editFn: () => void,
  editedText: string
) {
  const driver = await remote(getWebDriverConfig())

  const textInput = driver.$('~text-input')
  await textInput.waitForDisplayed({ timeout: 2 * 60 * 1000 })
  await textInput.setValue('app did not reload')
  expect((await textInput.getValue()).endsWith('did not reload')).toBe(true)

  const textElementInComponent = await driver.$(`~${testId}`)
  expect(await textElementInComponent.getText()).toBe(originalText)

  editFn()

  try {
    const result = await driver.waitUntil(
      async () => {
        const element = await driver.$(`~${testId}`)
        return element && (await element.getText()) === editedText
      },
      { timeout: 10 * 1000, timeoutMsg: 'Changes did not seem to HMR (timeout)' }
    )
    expect(result).toBe(true)
  } catch (e) {
    if (e instanceof Error) {
      e.message = `Changes did not seem to HMR: ${e.message}`
    }

    throw e
  }

  expect(
    (await textInput.getValue()).endsWith('did not reload'),
    'the app should not fully reload'
  ).toBe(true)
}

test('component HMR', { timeout: 5 * 60 * 1000, retry: 3 }, async () => {
  await testHMR(
    'component-text-content',
    'Some text',
    editComponentFile,
    'Some edited text in component file'
  )
})

test('route HMR', { timeout: 5 * 60 * 1000, retry: 3 }, async () => {
  await testHMR('route-text-content', 'Some text', editRouteFile, 'Some edited text in route file')
})

test('component containing relative import HMR', { timeout: 5 * 60 * 1000, retry: 3 }, async () => {
  await testHMR(
    'TestComponentContainingRelativeImport-text-content',
    'Some text in TestComponentContainingRelativeImport',
    editTestComponentContainingRelativeImportFile,
    'Some edited text in TestComponentContainingRelativeImport'
  )
})

test(
  'component using hook that have native version HMR',
  { timeout: 5 * 60 * 1000, retry: 3 },
  async () => {
    await testHMR(
      'TestComponentUsingHookThatHasNativeVersion-text-content',
      'Some text in TestComponentUsingHookThatHasNativeVersion',
      () => {
        editFile(
          path.join(root, 'components', 'TestComponentUsingHookThatHasNativeVersion.tsx'),
          "const text = 'Some text in TestComponentUsingHookThatHasNativeVersion'",
          "const text = 'Some edited text in TestComponentUsingHookThatHasNativeVersion'"
        )
      },
      'Some edited text in TestComponentUsingHookThatHasNativeVersion'
    )
  }
)

test('component importing barrel file HMR', { timeout: 5 * 60 * 1000, retry: 3 }, async () => {
  await testHMR(
    'TestComponentImportingBarrelFile-text-content',
    'Some text in TestComponentImportingBarrelFile',
    () => {
      editFile(
        path.join(root, 'components', 'TestComponentImportingBarrelFile.tsx'),
        `
        import { Rocket } from '@tamagui/lucide-icons'
        const IconComponent = Rocket
        const text = 'Some text in TestComponentImportingBarrelFile'
              `.trim(),
        `
        import { Heart } from '@tamagui/lucide-icons' // import another icon, this is part of the test
        const IconComponent = Heart
        const text = 'Some edited text in TestComponentImportingBarrelFile'
              `.trim()
      )
    },
    'Some edited text in TestComponentImportingBarrelFile'
  )
})

// TODO: make this pass
test.skip('layout HMR', { timeout: 5 * 60 * 1000, retry: 3 }, async () => {
  await testHMR(
    'layout-text-content',
    'Some text',
    editLayoutFile,
    'Some edited text in layout file'
  )
})
