
import Dep from './dep'

import {
    def,
    warn,
    hasOwn,
    hasProto,
    isObject,
    isPlainObject,
    isPrimitive,
    isUndef,
    isValidArrayIndex,
    isServerRendering
} from '../util/index'


/**
 * 处理某些情况下,停用对对象属性的观察
 */
export let shouldObserve = true;
export function toggleObserving(value) { 
    shouldObserve = value;
}

export class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();
        this.vmCount = 0;
        //将Observer实例绑定到data到__ob__,在observer函数中会检测data对象是否包含Observer实例
        def(value, '__ob__', this);
        if(Array.isArray(value)) {
            console.log('no')
        } else {
            this.walk(value);
        }
    }

    walk(obj) {
        const keys = Object.keys(obj);
        for(let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i]);
        }
    }
}


export function observe(value, asRootData) {
    if(!isObject(value)) {
        return;
    }
    let ob = null;
    if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else if(
        shouldObserve &&
        isPlainObject(value) && 
        Object.isExtensible(value) && 
        !value.isVue
    ) {
        ob = new Observer(value);
    }

    if(asRootData && ob) {
        //对与observe的根数据计数
        ob.vmCount++;
    }
    return ob;
}

/**
 * 在传入的对象上定义可响应的属性
 * @param {Object} obj 
 * @param {String} key 
 * @param {*} val 
 * @param {Function} customSetter？
 * @param {Boolean} shallow？
 */
export function defineReactive(obj, key, val, customSetter, shallow) {
    const dep = new Dep();
    
    const property = Object.getOwnPropertyDescriptor(obj, key);
    if(property && property.configurable === false) {
        return;
    }

    // 考虑之前定义的getter与setter
    const getter = property && property.get;
    const setter = property && property.set;
    if((!getter || setter) && arguments.length === 2) {
        // Observe构造函数中的walk方法中调用defineReactive没有这个val参数
        val = obj[key];
    }

    let childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            const value = getter ? getter.call(obj) : val;
            if(Dep.target){ 
                dep.depend();
                if(childOb) {
                    
                }
            }
            return value;
        },

        set: function(newVal) {
            const value = getter ? getter.call(obj) : val;
            if(newVal === value || (newVal !== newVal && value !== value)) {
                return;
            }
            if(setter) {
                setter.call(obj, newVal);
            } else {
                val = newVal;
            }
            childOb = !shallow && observe(newVal)
            dep.notify()
        }
    })
}