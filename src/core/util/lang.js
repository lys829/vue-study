/**
 * 检测Vue的保留名
 * @param {String} str 
 */
export function isReserved (str) {
    const c = (str + '').charCodeAt(0)
    return c === 0x24 || c === 0x5F
}


/**
 * 定义对象的属性
 * @param {Object} obj 
 * @param {String} key 
 * @param {*} val 
 * @param {Boolean} enumerable?
 */
export function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}


const bailRE = /[^\w.$]/
/**
 * 
 * @param {String} path 
 */
export function parsePath (path) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}