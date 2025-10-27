import { isPlainObject } from '../helpers/util'
import { AxiosRequestConfig } from '../types'
import { deepMerge } from '../helpers/util'
const strats = Object.create(null)

//策略1：默认合并策略：优先取congif2中的值
function defaultStrat(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}
//策略2：只取config2中的值
function fromVal2Strat(val1: any, val2: any): any {
  if (typeof val2 != 'undefined') {
    return val2
  }
}
//策略3：深度合并
function deepMergeStrat(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else if (typeof val1 !== 'undefined') {
    return val1
  }
}
//如下字段采用策略2
const stratKeysFromVal2 = ['url', 'params', 'data']
stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})
//如下字段采用策略3：深度合并
const stratKeysDeepMerge = ['headers', 'auth']
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})
/**
 * 合并两个配置对象，生成最终的请求配置
 * @param config1 基础配置对象
 * @param config2 覆盖配置对象，具有更高优先级
 * @returns 合并后的配置对象
 */
export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) {
    config2 = {}
  }
  const config = Object.create(null)

  // 先处理config2中存在的字段
  for (let key in config2) {
    mergeField(key)
  }

  // 处理config1中存在但config2中不存在的字段
  for (let key in config1) {
    if (!config2[key]) {
      mergeField(key)
    }
  }

  /**
   * 根据字段名使用相应的策略合并配置字段
   * @param key 配置字段名
   */
  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat
    config[key] = strat(config1[key], config2[key])
  }

  return config
}
