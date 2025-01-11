import { defineConfig } from 'vite'
import { one } from 'one/vite'
import viteCommonJS from 'vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    one(),
    viteCommonJS({
      filter: (id) => /uniswap-ui\/(src|utilities)/.test(id),
    }),
  ],
})
