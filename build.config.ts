import { defineBuildConfig } from 'unbuild'
import { dependencies } from './package.json'

export default defineBuildConfig([
  {
    name: 'Nuxt yapi provider',
    entries: ['./src/api/provider.ts'],
    outDir: './dist',
    clean: false,
    declaration: true,
    rollup: {
      emitCJS: true,
    },
    externals: [
      ...Object.keys(dependencies),
    ],
  },
])
