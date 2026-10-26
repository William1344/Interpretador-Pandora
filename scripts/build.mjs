import { build } from 'esbuild';

await build({
  entryPoints: {
    index: './index.js',
    node: './src/node.js'
  },
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  outdir: './dist',
  packages: 'external',
  sourcemap: true,
  legalComments: 'none'
});
