const path = require("path");

const apiPath = path.resolve(__dirname, "apps/api");
const webPath = path.resolve(__dirname, "apps/web");

const ciApiPath = path.resolve(__dirname, "out/apps/api");
const ciWebPath = path.resolve(__dirname, "out/apps/web");

module.exports = {
  scripts: {
    prepare: {
      default: `nps prepare.web prepare.api`,
      web: `pnpm`,
      api: `nps prepare.docker`,
      docker: "docker compose -f docker-compose.proxy.yml up -d",
      ci: {
        web: `npx turbo prune --scope=web && cd out && pnpm install --frozen-lockfile`,
        api: `npx turbo prune --scope=api && cd out && pnpm install --frozen-lockfile`,
      },
    },
    test: {
      default: `nps test.web test.api`,
      web: `cd ${webPath} && pnpm test`,
      api: `cd ${apiPath} && pnpm test`,
      ci: {
        default: `nps test.ci.web test.ci.api`,
        web: `cd ${ciWebPath} && pnpm test:ci`,
        api: `cd ${ciApiPath} && pnpm test:ci`,
      },
      watch: {
        default: `nps test.watch.web test.watch.api`,
        web: `cd ${webPath} && pnpm test:watch`,
        api: `cd ${apiPath} && pnpm test:watch`,
      },
    },
    build: {
      default: "npx turbo run build",
      ci: {
        web: "cd out && npm run build",
        api: "cd out && npm run build",
      },
    },
    docker: {
      build: {
        default: "nps docker.build.web docker.build.api",
        web: `docker build -t web . -f ${webPath}/Dockerfile`,
        api: `docker build -t api . -f ${apiPath}/Dockerfile`,
      },
    },
    start: {
      web: "docker compose -f docker-compose.web.yml up --build",
      proxy: "nps prepare.docker",
      api: "nps prepare.docker && docker compose -f docker-compose.api.yml up --build",
    },
    dev: "npx turbo run dev",
  },
};
