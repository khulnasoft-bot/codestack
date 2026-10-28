const esbuild = require('esbuild');
const esbuildSvelte = require('esbuild-svelte');
const sveltePreprocess = require('svelte-preprocess');
const { aliasPath } = require('esbuild-plugin-alias-path');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const outdir = path.join(root, 'public');
const isWatch = process.argv.includes('--watch');

fs.mkdirSync(outdir, { recursive: true });
for (const file of ['index.html', 'preview.css']) {
    fs.copyFileSync(path.join(root, file), path.join(outdir, file));
}

const options = {
    entryPoints: {
        portsview: path.join(root, '../../packages/gitpod-shared/portsview/src/main.ts'),
        codicon: require.resolve('@vscode/codicons/dist/codicon.css'),
    },
    mainFields: ['svelte', 'browser', 'module', 'main'],
    bundle: true,
    outdir,
    loader: {
        '.ttf': 'dataurl',
    },
    minify: !isWatch,
    sourcemap: isWatch,
    platform: 'browser',
    target: ['es2020'],
    plugins: [
        aliasPath({
            alias: { 'package.nls.json': path.join(root, 'package.nls.json') },
        }),
        esbuildSvelte({
            preprocess: sveltePreprocess(),
        }),
    ],
    logLevel: 'info',
};

async function run() {
    const context = await esbuild.context(options);
    if (isWatch) {
        await context.watch();
        console.log('watching packages/gitpod-shared/portsview for changes...');
    } else {
        await context.rebuild();
        await context.dispose();
    }
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
