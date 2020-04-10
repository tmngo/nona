import PromiseWorker from 'promise-worker'
import Worker from 'worker-loader!./worker'

const promiseWorker = new PromiseWorker(new Worker())

const send = message => promiseWorker.postMessage(message)

export default {
  send
}