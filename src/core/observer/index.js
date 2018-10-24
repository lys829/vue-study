
import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'

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

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

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
        this.dep = new Dep(`observer keys: ${Object.keys(value).join(',').toString()}`);
        this.vmCount = 0;
        //将Observer实例绑定到data到__ob__,在observer函数中会检测data对象是否包含Observer实例
        //__ob__不可枚举
        def(value, '__ob__', this);
        if(Array.isArray(value)) {
            // const augment = hasProto ? protoAugment : copyAugment;
            // 劫持数组的原生方法
            protoAugment(value, arrayMethods, arrayKeys)
            this.observeArray(value);
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

    /**
     * Observer a list of Array items
     * @param {*} items 
     */
    observeArray(items) {
        for(let i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    }
}

/**
 * 覆盖原型的方法
 * @param {*} target 
 * @param {Object} src 
 * @param {*} keys 
 */
function protoAugment(target, src, keys) { 
    target.__proto__ = src;
}


export function observe(value, asRootData) {
    if(!isObject(value) || value instanceof VNode) {
        return;
    }
    let ob = null;
    if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else if(
        shouldObserve &&
        (Array.isArray(value) || isPlainObject(value)) && 
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
    const dep = new Dep(key);
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
    //NOTE: 多层结构 childOb如果存在，为Observe实例
    // val是undefined 不会深度观测
    let childOb = !shallow && observe(val);

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            const value = getter ? getter.call(obj) : val;
            if(Dep.target){
                dep.depend();
                if(childOb) {
                    //这里收集的依赖会在Vue.set()时释放
                    childOb.dep.depend();
                    //TODO: 未知作用，先注释, 可能和Vue.set方法有关
                    /* if(Array.isArray(value)) {
                        dependArray(value);
                    } */
                }
            }
            return value;
        },

        set: function reactiveSetter(newVal) {
            const value = getter ? getter.call(obj) : val;
            if(newVal === value || (newVal !== newVal && value !== value)) { // NaN !== NaN
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


function dependArray(value) {
    for(let e, i = 0, l = value.length; i < l; i++) {
        e = value[i];
        e && e.__ob__ && e.__ob__.dep.depend();
        if(Array.isArray(e)){
            dependArray(e);
        }
    }
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 * @param target {Object}
 * @param key {}
 * @param val {}
 */
export function set(target, key, val) {
    //TODO: 判断条件

    const ob = target.__ob__;
    if(target._isVue || (ob && ob.vmCount)) {
        console.warn('Avoid adding reactive properties to a Vue instance or its root $data ' +
            'at runtime - declare it upfront in the data option.');
        return val;
    }

    if(Array.isArray(target) && isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key);
        target.splice(key, 1, val);
        return;
    }

    if(!ob) {
        target[key] = val;
        return val;
    }

    defineReactive(ob.value, key, val);
    ob.dep.notify();
    return val;
}