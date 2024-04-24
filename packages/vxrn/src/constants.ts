import type { SSROptions } from 'vite'

export const DEFAULT_PORT = 8081

export const depsToOptimize = [
  '@react-native/normalize-color',
  // '@react-navigation/core',
  // '@react-navigation/native',
  '@vxrn/expo-router',
  'expo-modules-core',
  'expo-status-bar',
  // 'react',
  // 'react/jsx-dev-runtime',
  // 'react/jsx-runtime',
  // 'react-dom',
  // 'react-dom/server',
  // 'react-dom/client',
  // 'react-dom/server',
  // 'react-native-safe-area-context',
  'react-native-web',
  'react-native',
]

export const needsInterop = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-native-web-internals',
  'react-dom',
  'react-native-web-lite',
  // '@vxrn/expo-router',
  // '@vxrn/expo-router/render',
  'react-dom/server',
  'react-dom/client',
]

export const ssrDepsToOptimize = [...depsToOptimize, ...needsInterop]

export const nativeExtensions = [
  '.native.tsx',
  '.native.jsx',
  '.native.js',
  '.tsx',
  '.ts',
  '.js',
  '.css',
  '.json',
]

export const webExtensions = [
  '.web.tsx',
  '.tsx',
  '.web.ts',
  '.ts',
  '.web.jsx',
  '.jsx',
  '.web.js',
  '.web.mjs',
  '.mjs',
  '.js',
  '.css',
  '.json',
]

export const ssrOptimizeDeps = {
  include: ssrDepsToOptimize,
  extensions: webExtensions,
  needsInterop,
  esbuildOptions: {
    resolveExtensions: webExtensions,
  },
} satisfies SSROptions['optimizeDeps']
