# Gitpod VS Code extensions

Monorepo for the Gitpod VS Code extensions and their shared library.

## Structure

```
apps/
  gitpod-web/      Gitpod VS Code Browser integration (extension + ports webview)
  gitpod-remote/   Gitpod Classic Remote SSH extension
  preview/         Static preview of the ports webview, deployed to Vercel
packages/
  gitpod-shared/   Shared extension runtime and the ports webview Svelte app
```

Dependencies are managed with Yarn 1 workspaces and a single root `yarn.lock`.

## Setup

```bash
yarn install --frozen-lockfile
```

## Build

```bash
yarn compile:gitpod-shared   # compile the shared package
yarn build:gitpod-web        # package the web extension
yarn build:gitpod-remote     # package the remote extension
yarn build:preview           # build the static webview preview
```

Development watches:

```bash
yarn workspace gitpod-shared watch
yarn workspace gitpod-web watch
yarn workspace gitpod-remote-ssh watch
yarn dev:preview             # rebuild the preview on change
yarn workspace @gitpod/portsview-preview serve
```

## Vercel

`vercel.json` builds `apps/preview` and serves `apps/preview/public`. The preview
mounts the real ports webview Svelte app from `packages/gitpod-shared/portsview`
against mock port data, so it can be deployed as a normal static site.
