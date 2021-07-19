import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import vite from 'vite';
import { createPageRender } from 'vite-plugin-ssr';

import dothething from './dothething.module.js';
console.log('');
console.log('      /* -------------------------------------------------------------------------------- *\\');
console.log(`==== { ${ dothething() }`);
console.log('      \\* -------------------------------------------------------------------------------- */');
console.log('');

const isProduction = process.env.NODE_ENV === "production";

startServer();

async function startServer() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const root = `${__dirname}/..`;

  const app = express();

  let viteDevServer;
  if (isProduction) {
    app.use(express.static(`${root}/dist/client`, { index: false }));
  } else {
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: true },
    });
    app.use(viteDevServer.middlewares);
  }

  const renderPage = createPageRender({ viteDevServer, isProduction, root });
  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;
    const pageContext = {
      url,
    };
    const result = await renderPage(pageContext);
    if (result.nothingRendered) return next();
    res.status(result.statusCode).send(result.renderResult);
  });

  const port = process.env.PORT || 3000;
  app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}
