import fs from "fs-extra";
import path, { basename, join } from 'node:path';
import { fileURLToPath } from "node:url";

import React from "react";
import ReactDOMServer from "react-dom/server";

import { One } from "@vxrn/one/src/vite/types";
import { AsyncLocalStorage } from "node:async_hooks";
import { routeInfo } from "@vxrn/one/src/router/router";
// import { toAbsolute } from "@vxrn/one/src/utils/toAbsolute";
// import { RenderAppProps } from "@vxrn/one/src/types";
// import { getServerEntry } from 'vxrn/serve'

const dirname =  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// const getServerEntry = (options: any) => {
//   return path.resolve(
//     process.cwd(),
//     `${options.root}/dist/server/_virtual_one-entry.${getServerCJSSetting(options) ? 'c' : ''}js`
//   )
// }


// async handlePage({ route, url, loaderProps }) {
//       const buildInfo = routeToBuildInfo[route.file]

//       if (route.type === 'ssr') {
//         if (!buildInfo) {
//           throw new Error(
//             `No buildinfo found for ${url}, route: ${route.page}, in keys: ${Object.keys(routeToBuildInfo)}`
//           )
//         }

//         try {
//           const exported = await import(toAbsolute(buildInfo.serverJsPath))
//           const loaderData = await exported.loader?.(loaderProps)
//           const preloads = buildInfo.preloads

//           const headers = new Headers()
//           headers.set('content-type', 'text/html')

//           const rendered = await render({
//             mode: route.type,
//             loaderData,
//             loaderProps,
//             path: loaderProps?.path || '/',
//             preloads,
//           })

//           return new Response(rendered, {
//             headers,
//             status: route.isNotFound ? 404 : 200,
//           })
//         } catch (err) {
//           console.error(`[one] Error rendering SSR route ${route.page}

// ${err?.['stack'] ?? err}

// url: ${url}`)
//         }

// Documentation - Vercel Build Output v3
// https://vercel.com/docs/build-output-api/v3#build-output-api-v3
export async function createSsrServerlessFunction(
  pageName: string,
  buildInfo: One.BuildInfo,
  oneOptions: any,
  postBuildLogs: string[],
) {
  postBuildLogs.push(`[createSsrServerlessFunction] pageName: ${pageName}`);

  try {
    // postBuildLogs.push(`[createSsrServerlessFunction] copy shared assets to ${join(funcFolder, 'assets')}`);
    // await fs.copy(join(options.root, 'dist', 'api', 'assets'), join(funcFolder, 'assets'));

    const buildInfoAsString = JSON.stringify(buildInfo)

    const funcFolder = join(oneOptions.root, 'dist', `.vercel/output/functions/${pageName}.func`);
    await fs.ensureDir(funcFolder);

    const distServerFrom = path.resolve(join(oneOptions.root, 'dist', 'server'));
    const distServerTo = path.resolve(join(funcFolder, 'server'));
    await fs.ensureDir(distServerTo);
    postBuildLogs.push(`[createSsrServerlessFunction] copy server from ${distServerFrom} to ${distServerTo}`);
    await fs.copy(distServerFrom, distServerTo);
    
    postBuildLogs.push(`[createSsrServerlessFunction] writing buildInfo.json`);
    await fs.writeFile(join(funcFolder, 'buildInfo.js'), `export default ${buildInfoAsString}`);

    await fs.ensureDir(join(funcFolder, 'entrypoint'));
    postBuildLogs.push(`[createSsrServerlessFunction] writing entrypoint to ${join(funcFolder, 'entrypoint', 'index.js')}`);
    await fs.writeFile(
        join(funcFolder, 'entrypoint', 'index.js'),
  `
  process.env.ONE_DEFAULT_RENDER_MODE = 'ssr';
  const buildInfoConfig = await import('../buildInfo.js');
  const entry = await import('../server/_virtual_one-entry.js');
  
  const handler = async (req, res) => {
    console.log("req.url", req.url);

    const url = new URL(req.url, \`https://\${process.env.VERCEL_URL}\`);
    const loaderProps = { 
      path: url.pathname,
      params: Object.fromEntries(url.searchParams.entries())
    }
    console.log("loaderProps", loaderProps)
    const postfix = url.pathname.endsWith('/') ? 'index.tsx' : '+ssr.tsx';
    const routeFile = \`.\${url.pathname}\${postfix}\`;
    console.log("routeFile", routeFile)
    //console.log("buildInfoConfig", Object.keys(buildInfoConfig.default));
    //console.log("buildInfoConfig.routeToBuildInfo", Object.keys(buildInfoConfig.default.routeToBuildInfo));
    const route = buildInfoConfig.default.routeToBuildInfo[routeFile];
    console.log("buildInfo route", route)

    const render = entry.default.render;
    const exported = await import(route.serverJsPath.replace('dist/','../'))
    const loaderData = await exported.loader?.(loaderProps)
    const preloads = route.preloads

    //const headers = new Headers()
    //headers.set('content-type', 'text/html')

    const rendered = await render({
      mode: route.type,
      loaderData,
      loaderProps,
      path: loaderProps?.path || '/',
      preloads,
    })
    // const rendered = "<!DOCTYPE html><html><head><title>My blog</title></head><body><h1>hello world</h1></body></html>"
    // return new Response(rendered, {
    //   headers,
    //   status: route.isNotFound ? 404 : 200,
    // })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(rendered)
  }

  export default handler;  
  `
  // module.exports = (req, res) => {
  //   console.log("req.url", req.url)
  //   res.setHeader('Content-Type', 'text/html; charset=utf-8')
  //   res.end(\`${rendered}\`)
  // }`
  //       `const { parse } = require('querystring')

  // module.exports = (req, res) => {
  //   const matches = parse(req.headers['x-now-route-matches'])
  //   let { slug } = matches
    
  //   // if slug isn't present in x-now-route-matches it 
  //   // matched at the filesystem level and can be parsed
  //   // from the URL
  //   if (!slug) {
  //     const matches = req.url.match(/\/blog\/([^/]+)(?:\/)?/)
  //     slug = matches[1]
  //   }
    
  //   res.setHeader('Content-Type', 'text/html; charset=utf-8')
  //   res.end(\`
  // <!DOCTYPE html>
  // <html>
  // <head>
  //   <title>My blog | \${slug}</title>
  // </head>
  // <body>
  //   <h1>Post: \${slug}</h1>
  //   <p>Generated time: \${new Date().toISOString()}</p>
    
  //   <p>This demonstrates a SSG blog that restricts generating new paths via On-Demand ISR instead of allowing any visited paths to generate a new path.</p>
    
  //   <p>It works by leveraging \`expiration: false\` on a prerender to only allow generating new paths when the revalidate token is provided.</p>
    
  //   <!-- Authentication example is for demo purposes only. In a production system, use better authentication strategies. -->
  //   <p><a href="/revalidate?path=/blog/\${slug}&authToken=a13f94f6-a441-47ca-95fc-9f44f3450295">Revalidate this path via On-Demand ISR</a></p>
  // </body>
  // </html>
  //   \`)
  // }`
      )

    postBuildLogs.push(`[createSsrServerlessFunction] writing package.json to ${join(funcFolder, 'package.json')}`);
    await fs.writeJSON(
      join(funcFolder, 'package.json'),
      { "type": "module" }
    )
    
    postBuildLogs.push(`[createSsrServerlessFunction] writing .vc-config.json to ${join(funcFolder, '.vc-config.json')}`);
    // Documentation - Vercel Build Output v3 Node.js Config
    //   https://vercel.com/docs/build-output-api/v3/primitives#node.js-config
    return fs.writeJson(join(funcFolder, '.vc-config.json'), {
      runtime: "nodejs20.x",
      handler: "entrypoint/index.js",
      launcherType: "Nodejs",
      shouldAddHelpers: true,
      shouldAddSourceMapSupport: true,
      environment: {
        ONE_DEFAULT_RENDER_MODE: 'ssr',
      }
    });
  } catch (e) {
    console.error('[createSsrServerlessFunction]', e);
  }
}

const getHydrationScript = (filePath: string) => `
  import React from "react";
  import ReactDOM from "react-dom/client";
  import Component from "${filePath}";

  ReactDOM.hydrateRoot(document.getElementById("root"), React.createElement(Component))
`;


const getHandlerCode = (html: string, pageName: string) => `
  import { createElement } from 'react';
  import { renderToString } from 'react-dom/server';

  export default (req, res) => {  
    res.setHeader('Content-type', 'text/html');

    res.end(\`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="styles.css" rel="stylesheet">
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="${pageName}.bundle.js" defer></script>
      </body>
    </html>\`)
  }
`;
