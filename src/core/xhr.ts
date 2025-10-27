import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { transformResponse } from '../helpers/data'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import { isFormData } from '../helpers/util'
import cookie from '../helpers/cookie'
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      url,
      data = null,
      method = 'GET',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validataStatues
    } = config

    const request = new XMLHttpRequest()

    request.open(method.toUpperCase(), url!)

    configureRequest()

    addEvents()

    processHeaders()

    processCancel()

    request.send(data)

    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }

    //为XMLHttpRequest对象添加事件监听器
    function addEvents(): void {
      //readyState变化事件：处理请求完成后的响应
      request.onreadystatechange = function() {
        if (request.readyState !== 4) {
          return
        }

        if (request.status === 0) {
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
        //处理响应结果
        handleResponse(response)
      }

      // error事件：处理网络错误
      request.onerror = function handleError() {
        reject(createError('Network Error', config, null, request))
      }

      //timeout事件：处理请求超时
      request.ontimeout = function handleTimeout() {
        reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
      }

      //progress事件：处理下载和上传进度
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.onprogress = onUploadProgress
      }
    }
    function processHeaders() {
      //当请求数据为FormData类型时，删除Content-Type请求头，让浏览器自动设置
      if (isFormData(data)) {
        delete headers['Content-Type']
      }
      //处理XSRF防护，读取指定的cookie并将其值设置到相应的请求头中
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xrfValue = cookie.read(xsrfCookieName)
        if (xrfValue && xsrfHeaderName) {
          headers[xsrfHeaderName] = xrfValue
        }
      }
      //处理HTTP Basic认证，将用户名和密码编码后添加到Authorization请求头
      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }
      //设置所有请求头到XMLHttpRequest对象，并在数据为空时删除Content-Type头
      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
    }
    function processCancel(): void {
      //CancelToken的实例，含pedding状态的promise
      if (cancelToken) {
        cancelToken.promise
          .then(reason => {
            request.abort()
            reject(reason)
          })
          .catch(
            /* istanbul ignore next */
            () => {
              //do nothing
            }
          )
      }
    }

    //处理HTTP响应
    function handleResponse(response: AxiosResponse): void {
      if (!validataStatues || validataStatues(response.status)) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
