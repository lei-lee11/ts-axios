import axios, { Canceler } from '../../src/index'
const CancelToken = axios.CancelToken
const source = CancelToken.source()

axios
  .get('/cancel/get', {
    cancelToken: source.token
  })
  .catch(function(thrown) {
    if (axios.isCancel(thrown)) {
      console.log('Request canceled', thrown.message)
    } 
  })

setTimeout(() => {
  source.cancel('Operation canceled by the user.')
  axios.post(
    '/cancel/post',
    {
      name: 'new name'
    },
    {
      cancelToken: source.token
    }
  ).catch(function(e) {
    if (axios.isCancel(e)) {
      console.log('Request canceled', e.message)
    } 
  })
  },100)

let cancel:Canceler;

axios.get('/cancel/get', {
  cancelToken: new CancelToken(function executor(c) {
    // executor 函数接收一个 cancel 函数作为参数
    cancel = c;
  })
}).catch(function(e) {
    if (axios.isCancel(e)) {
      console.log('Request canceled', e.message)
    } 
  });
setTimeout(() => {
  cancel()
}, 200);



