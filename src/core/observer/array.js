
import {def} from '../util/index'

const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]

/**
 * 拦截数组的部分方法
 */

methodsToPatch.forEach((method)=>{
    //缓存原先的方法
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
        const result = original.apply(this, args);
        const ob = this.__ob__;
        let inserted;
        switch(method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
        }
        if(inserted) {
            ob.observeArray(inserted)
        }

        // notify change
        ob.dep.notify();
        return result;
    })
})