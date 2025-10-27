import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { buildURL, combineURL, isAbsoluteURL } from '../helpers/url'
import { transformRequest, transformResponse } from '../helpers/data'
import { flattenHeaders, processHeaders } from '../helpers/headers'
import transfrom from './transform'
import xhr from './xhr'
export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)
  processConfig(config)
  return xhr(config).then(
    res => {
      return transformResponseData(res)
    },
    e => {
      if (e && e.response) {
        e.response = transformResponseData(e.response)
      }
      return Promise.reject(e)
    }
  )
}
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.data = transfrom(config.data, config.Headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!)
}
//处理URL 拼接params
export function transformURL(config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } = config
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }
  return buildURL(url!, params, paramsSerializer)
}
//通过transform函数执行transformrequest

// //处理data
// function transformRequestData(config: AxiosRequestConfig): any {
//   return transformRequest(config.data)
// }
// //处理headers
// function transfomHeaders(config: AxiosRequestConfig): any {
//   const { headers = {}, data } = config
//   return processHeaders(headers, data)
// }

//通过transform函数执行transformresponse
function transformResponseData(res: AxiosResponse) {
  res.data = transfrom(res.data, res.headers, res.config.transformResponse)
  return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
