nice for demo:

- react navigation 7 has animations between tabs

1.0 ordered from most work to least:

  - native
    - large test suite + supports 1000 most popular dependencies
    - better hmr
    - better rebuild module caching
    - complete website / docs
    - build to production
    - android
    - assets
    - symbolicator

- get type generation working for routes

pokai:

  - log error on loading native: called `Option::unwrap()` on a `None` value
  - on load warning: Each child in a list should have a unique "key" prop.
    - i disabled the log via logbox.ignore for now
    - seems like it comes from lucide icons SVG, maybe from react-native-svg
  - +ssr routes
  - hmr adding route

jon:
  - lets add postgres + drizzle + real scheme/data for the basic demo app
  - improve errors, RootErrorBoundary, etc
  - test cli, improve cli visuals
  - design polish

---

should have some sprints with "challenges":

- "never needing to restart the server challenge"
- "use any dependency without config challenge"
- "make error messages as clear as possible challenge"
- "hot reload any file challenge"

---

# backlog

- `Error building React Native bundle: Error ... EISDIR: illegal operation on a directory, read`
  - Happens with react-native-svg 15.6.0 where it has `elements.js` and `elements` directory at the same time
  - happens on `qrcode@1.5.1`
    - qrcode/lib/renderer/terminal (imported by qrcode/lib/server.js
  - Might be related to bug [40E4] in the VXRN Takeout Issue List

- if they choose yarn we create-vxrn should copy in the .yarnrc.yml + .yarn/releases so it doesnt use old yarn 1

- document @vxrn/color-scheme and @vxrn/universal-color-scheme

- uniswap repo has to use commonjs plugin but its very tricky to configure
  - ideally we get a lot better at automating this, documenting, and maybe make it just a configuration key in vxs plugin

- support export ending in `Page` instead of just `export default` for routes (hot reload friendly)
  - support export default hot reloads (would require react-refresh changes)

- platform-specific route files

- use dom

- prebuild react native shouldn't have hardcoded exports list

- add test to weird-deps so we know no regressions

- turn this back off VXRN_ENABLE_SOURCE_MAP:
  - https://github.com/swc-project/swc/issues/9416

- for some reason rollup newer versions have syntax error on trying to load native bundle on basic starter

  - bring back some form of useMetroSymbolication
- safe-area-context should be configurable to leave it out entirely if you want

- vxs should have more than just patches, but also config that is set per-node_module
  - eg, react 19 sets: 'process.env.TAMAGUI_REACT_19': '"1"'
  - another cool idea: node_modules package.json sets "vite" field that can add these custom configs, so `tamagui` package can define that *for* react 19

- docs section for tamagui, note one-theme

- changing vite.config seems to not close old server and so starts on new port, seeing "Port 5173 is in use, trying another one... Server running on http://127.0.0.1:8082"

- an easy way to disable swc transform for a node_module using `deps`

- @ethersproject/hash property "atob" doesnt exist

- TODO this would probably want to support their configured extensions

- useLoader new useEffect to fetch new loader loader data
  - hits /_vxrn/load/pathname.js for ssg at least
  - in dev mode handleRequest just runs handleLoader
  - in build mode generates the json

- Better SWC config in vite-native-swc to fit Hermes better. Maybe we can see what's included in [`@react-native/babel-preset`](https://github.com/facebook/react-native/tree/main/packages/react-native-babel-preset) and try to match that.
