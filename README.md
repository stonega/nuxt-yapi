# Nuxt Yapi

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-yapi
```

## Contribution

```bash
export default defineNuxtConfig({
  yapi: {
    service: 'https://yapi.example.com',
    apis: [
      {
        baseUrl: 'https://example.com',
        token: 'xxxx',
      },
    ],
  },
})
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-yapi

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-yapi

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-yapi
