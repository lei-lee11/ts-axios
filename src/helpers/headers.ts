import { deepMerge, isPlainObject } from './util'
import { Method } from '../types'
export function normalizeHeadersName(headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}
export function processHeaders(headers: any, data: any): any {
  normalizeHeadersName(headers, 'Content-Type')
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

/**
 * 解析HTTP响应头字符串为键值对对象
 * @param headers HTTP响应头字符串，包含多个以\r\n分隔的"键:值"对
 * @returns 解析后的响应头对象，键为小写的header名称，值为对应的header值
 */
export function parseHeaders(headers: string): any {
  let parsed = Object.create(null)
  if (!headers) {
    return parsed
  }
  headers.split('\r\n').forEach(line => {
    let [key, ...vals] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      return
    }
    const val = vals.join(':').trim()
    parsed[key] = val
  })
  return parsed
}

/**
 * 将请求头对象扁平化，合并通用配置和方法特定配置，并删除方法相关属性
 * @param headers 请求头配置对象，可能包含通用配置和各HTTP方法的特定配置
 * @param method HTTP请求方法
 * @returns 扁平化后的请求头对象，只保留该HTTP方法需要的配置
 */
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) return headers

  headers = deepMerge(headers.common, headers[method], headers)

  // 删除HTTP方法相关的属性，因为它们已经被合并到最终的headers对象中
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']
  methodsToDelete.forEach(method => {
    delete headers[method]
  })
  return headers
}
