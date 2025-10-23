import { AxiosRequestConfig,AxiosPromise } from "./types"
import { buildURL } from "./helpers/url"
import { transformRequest } from "./helpers/data"
import { processHeaders } from "./helpers/headers"
import xhr from "./xhr"
function axios(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config)
  return xhr(config)
}
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.headers = transfomHeaders(config)
  config.data = transformRequestData(config)
}
//处理URL 拼接params
function transformURL(config: AxiosRequestConfig):string {
  const { url, params } = config
  return buildURL(url, params)
}
//处理data
function transformRequestData(config: AxiosRequestConfig):any {
  return transformRequest(config.data)
}
//处理headers
function transfomHeaders(config: AxiosRequestConfig): any{
  const { headers={}, data } = config
  return processHeaders(headers, data)
}
export default axios