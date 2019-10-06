export class PromiseQuery<T> {
    private _isResolved = false
    private _isRejected = false
    private _promise: Promise<T>

    constructor(promise: Promise<T>) {
        this._promise = promise.then(
            v => {
                this._isResolved = true
                return v
            },
            e => {
                this._isRejected = true
                throw e
            })
    }

    promise = () => this._promise
    isFulfilled = () => this._isResolved || this._isRejected
    isResolved = () => this._isResolved
    isRejected = () => this._isRejected
}

export interface CancelablePromise<T> {
    promise: Promise<T>
    cancel: () => void
    isCanceled: () => boolean
}

export interface CancelablePromiseRejection {
    isCanceled: boolean
    error?: any
}

export type CancelablePromiseRejectionType = (params: CancelablePromiseRejection) => void

//https://github.com/facebook/react/issues/5465#issuecomment-157888325
export const makePromiseCancelable = <T>(promise: Promise<T>): CancelablePromise<T> => {
    let _hasCanceled = false

    const wrappedPromise = new Promise<T>((resolve, reject: CancelablePromiseRejectionType) => {
        promise.then((val) =>
            _hasCanceled ? reject({ isCanceled: true }) : resolve(val)
        )
        promise.catch((error) =>
            _hasCanceled ? reject({ isCanceled: true }) : reject({ isCanceled: false, error })
        )
    })

    return {
        promise: wrappedPromise,
        cancel() { _hasCanceled = true },
        isCanceled() {return _hasCanceled}
    }
}

  //How to use
  /* const somePromise = new Promise(r => setTimeout(r, 1000))
  
  const cancelable = makeCancelable(somePromise)
  
  cancelable
    .promise
    .then(() => console.log('resolved'))
    .catch(({isCanceled, ...error}) => console.log('isCanceled', isCanceled))
  
  // Cancel promise
  cancelable.cancel() */