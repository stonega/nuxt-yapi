import { existsSync, mkdirSync } from 'node:fs'
import { defineNuxtModule, createResolver, useLogger, addPluginTemplate, addImportsDir } from '@nuxt/kit'
import { green, bold, red } from 'colorette'
import { name, version } from '../package.json'
import { generate } from './api'

export interface ModuleOptions {
  service: string
  apis: {
    name?: string
    baseUrl: string
    token?: string
  }[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'yapi',
  },
  // Default configuration options of the Nuxt module

  defaults: {},
  async setup(_options, _nuxt) {
    const logger = useLogger(name)
    _nuxt.options.runtimeConfig.public.openApi = _options

    if (!_options || !_options.apis || _options.apis.length === 0) {
      logger.info(red('No yapi config found.'))
      return
    }
    const resolver = createResolver(import.meta.url)

    addImportsDir(resolver.resolve('./runtime/api'))
    const rootDir = _nuxt.options.rootDir
    const targetDir = `${rootDir}/yapi`

    // Ensure the directory exists
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir)
    }

    for (const api of _options.apis) {
      const apiDir = `${targetDir}/${api.name ?? 'default'}`
      addImportsDir(apiDir)
      // Ensure the directory exists
      if (!existsSync(apiDir)) {
        mkdirSync(apiDir)
      }
      // Sync api chema json
      if (!api.token) {
        logger.warn('Yapi token not found!')
        return
      }
      // Generate shema type
      await generate({ name: api.name ?? '', apiDir, token: api.token, url: _options.service })
      addPluginTemplate({
        src: resolver.resolve('./runtime/plugin.ejs'),
        filename: `${api.name ?? 'default'}-api.mjs`,
        write: true,
        options: { name: api.name, baseUrl: api.baseUrl },
      })
      logger.info(`Yapi ${api.name ?? 'default'} added`)
    }

    const apis = _options.apis.map(api => api.name)
    logger.info(`${bold('Yapi inited:')} ${green(apis.join(' '))}`)
  },
})
