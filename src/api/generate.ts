import { existsSync, writeFileSync } from 'node:fs'
import { ofetch } from 'ofetch'
import openapiTS from 'openapi-typescript'
import type { InterfaceDeclaration } from 'ts-morph'
import { Project, ScriptTarget } from 'ts-morph'

function joinPath(...input: string[]) {
  const paths = input
    .filter(path => !!path) // Remove undefined | null | empty
    .join('/') // Join to string
    .replaceAll('\\', '/') // Replace from \ to /
    .split('/')
    .filter(path => !!path && path !== '.') // Remove empty in case a//b///c or ./a ./b
    .reduce((items: string[], item: string) => {
      if (item === '..') {
        items.pop()
      }
      else { items.push(item) }
      return items
    }, []) // Jump one levep if ../

  if (input[0] && input[0].startsWith('/')) {
    paths.unshift('')
  }

  return paths.join('/') || (paths.length ? '/' : '.')
}

function parsePath(path: string, upperFirstCase: boolean | undefined = false) {
  let pathList = path.replace(/"/g, '').split('/')
  pathList = pathList.reduce(
    (p: string[], c: string) => [...p, ...c.split(':')],
    [],
  )
  pathList = pathList.reduce(
    (p: string[], c: string) => [...p, ...c.split('-')],
    [],
  )
  if (upperFirstCase) {
    return pathList
      .slice(1)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join('')
  }
  return (
    pathList[1]
    + pathList
      .slice(2)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join('')
  )
}

function createApis(node: InterfaceDeclaration, sourceFile, targetFile, name) {
  const allKeys = node.getProperties().map(p => p.getName())

  targetFile.addStatements(`
/**
    * This file was auto-generated by openapi-typescript.
    * Do not make direct changes to the file.
*/

import type { paths } from './schema'
import { Provider } from 'nuxt-yapi/provider'
`)

  const classDeclaration = targetFile.addClass({
    name: `${name}Yapi`,
    extends: 'Provider',
    isExported: true,
  })

  classDeclaration.addGetAccessor({
    name: 'ft',
    statements: ['return this.fetcher<paths>();'],
  })
  for (const [index, path] of allKeys.entries()) {
    const typeName = parsePath(path)
    const paramName = parsePath(path, true)
    const methods = node!
      .getProperties()
    // eslint-disable-next-line no-unexpected-multiline
      [index]!.getType()
      .getProperties()
      .map(p => p.getName())

    const content = node.getProperties()[index]!.getType().getText()
    for (const method of methods) {
      let typNameWithMethod = typeName
      if (method !== 'get') {
        typNameWithMethod
          = typeName + method.charAt(0).toUpperCase() + method.slice(1)
      }
      classDeclaration.addGetAccessor({
        name: typNameWithMethod,
        statements: `return this.ft.path(${path}).method("${method}").create()!`,
      })

      switch (method) {
        case 'get':
          if (content.includes('query')) {
            sourceFile.addTypeAlias({
              name: paramName + 'GetParams',
              type: `paths[${path}]['get']['parameters']['query']`,
              isExported: true,
            })
          }
          else {
            sourceFile.addTypeAlias({
              name: paramName + 'GetParams',
              type: `paths[${path}]['get']['parameters']`,
              isExported: true,
            })
          }
          sourceFile.addTypeAlias({
            name: paramName,
            type: `paths[${path}]['get']['responses'][200]['schema']['data']`,
            isExported: true,
          })
          break
        case 'post':
          if (content.includes('formData')) {
            sourceFile.addTypeAlias({
              name: paramName + 'PostParams',
              type: 'FormData',
              isExported: true,
            })
          }
          else {
            sourceFile.addTypeAlias({
              name: paramName + 'PostParams',
              type: `paths[${path}]['post']['parameters']['body']['root']`,
              isExported: true,
            })
            sourceFile.addTypeAlias({
              name: paramName + 'Post',
              type: `paths[${path}]['post']['responses'][200]['schema']['data']`,
              isExported: true,
            })
          }
          break
        case 'put':
          sourceFile.addTypeAlias({
            name: paramName + 'PutParams',
            type: `paths[${path}]['put']['parameters']['body']['root']`,
            isExported: true,
          })
          break
        case 'delete':
          sourceFile.addTypeAlias({
            name: paramName + 'DeleteParams',
            type: `paths[${path}]['delete']['parameters']['body']['root']`,
            isExported: true,
          })
          break
        default:
          break
      }
    }
  }
}

export async function generate({ apiDir, name, url, token }: { apiDir: string, name: string, url: string, token: string }) {
  const dstPath = `${apiDir}/schema.ts`
  if (existsSync(dstPath)) {
    return
  }
  const baseUrl = `${url}/api/plugin/exportSwagger?type=OpenAPIV2&pid=96&status=all&isWiki=false&token=`
  const api = await ofetch(baseUrl + token, { parseResponse: JSON.parse })
  const contents = await openapiTS(api)
  writeFileSync(dstPath, contents)

  const targetFilePath = joinPath(apiDir, `./api.ts`)
  const sourceFilePath = joinPath(apiDir, `./schema.ts`)
  // replace query pageNo pageSize type

  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ESNext,
    },
  })

  const sourceFile = project.addSourceFileAtPath(sourceFilePath)
  const targetFile = project.createSourceFile(targetFilePath, '', {
    overwrite: true,
  })
  createApis(sourceFile.getInterface('paths')!, sourceFile, targetFile, name)
  targetFile.formatText()
  targetFile.saveSync()
  sourceFile.formatText()
  sourceFile.saveSync()
}