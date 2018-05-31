
export const hasProto = '__proto__' in {}

export const inBrowser = typeof window !== 'undefined'
export const inWeex = false
export const weexPlatform = false
export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && /msie|trident/.test(UA)
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isEdge = UA && UA.indexOf('edge/') > 0
export const isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android')
export const isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios')
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge

// Firefox has a "watch" function on Object.prototype...
export const nativeWatch = ({}).watch;

export let supportsPassive = false
if (inBrowser) {
    try {
        const opts = {}
        Object.defineProperty(opts, 'passive', {
            get () {
                /* istanbul ignore next */
                supportsPassive = true
            }
        });
        window.addEventListener('test-passive', null, opts)
    } catch (e) {}
}


export function isNative (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }
  