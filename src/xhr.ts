import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types'
import { parseHeaders } from './helpers/headers'
import { transformResponse } from './helpers/data'
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise(resolve => {
    const { url, data = null, method = 'GET', headers, responseType } = config

    const request = new XMLHttpRequest()

    if (responseType) {
      request.responseType = responseType
    }

    request.open(method.toUpperCase(), url)

    request.onreadystatechange = function() {
      if (request.readyState !== 4) {
        return
      }
      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      const responseData =
        responseType && responseType !== 'text'
          ? request.response
          : transformResponse(request.responseText)
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      resolve(response)
    }

    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })
    request.send(data)
  })
}
