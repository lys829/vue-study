
import Watcher from '../observer/watcher'
import { pushTarget, popTarget } from '../observer/dep'

import { observe } from '../observer/index'

import {
    noop,
    isReserved,
    nativeWatch,
    isPlainObject
} from '../util/index'

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

export function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key];
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val;
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
}

export function stateMixin(Vue) {
    // Vue项目中用的flow检测会存在问题，这里按照原先写法
    const dataDef = {};
    dataDef.get = function () {
        return this._data;
    }
    const propsDef = {};
    propsDef.get = function () {
        return this._props;
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', dataDef);

    Vue.prototype.$watch = function(expOrFn, cb, options={}) {
        const vm = this;
        options.user = true;
        const watcher = new Watcher(vm, expOrFn, cb, options);
        if(options.immediate) {
            cb.call(vm, watcher.value);
        }
        //TODO:未知
        return function unwatchFn() {
            watcher.teardown();
        }
    }
}


export function initState(vm) {
    vm._watchers = [];
    const opts = vm.$options;
    //TODO: props methods
    if(opts.data) {
        initData(vm);
    } else {
        observe(vm._data = {}, true);
    }

    if(opts.computed) {
        initComputed(vm, opts.computed);
    }
    if(opts.watch && opts.watch !== nativeWatch) {
        initWatch(vm, opts.watch);
    }
}

function initData(vm) {
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? getData(data, vm) : data ||{};

    // proxy data on instance
    const keys = Object.keys(data);
    //TODO: props methods
    let i = keys.length;
    while(i--) {
        const key = keys[i];
        if(!isReserved(key)) {
            proxy(vm, '_data', key)
        }
    }
    
    // observe data
    observe(data, true /* asRootData */)
}

/**
 * 
 * @param {Function} data 
 * @param {Component} vm 
 */
export function getData(data, vm) {
    // #7573 disable dep collection when invoking data getters
    // 清理Dep.target
    pushTarget()
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, `data()`)
      return {}
    } finally {
      popTarget()
    }
}

const computedWatcherOptions = { computed: true }

function initComputed(vm, computed) {
    const watchers = vm._computedWatchers = Object.create(null);

    for(let key in computed) {
        const userDef = computed[key];
        const getter = typeof userDef === 'function' ? userDef : userDef.get;

        //为计算属性绑定内部watcher
        watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions);

        if(!(key in vm)) {
            defineComputed(vm, key, userDef);
        }
    }

}

/**
 * 
 * @param {*} target 
 * @param {String} key 
 * @param {Object|Function} userDef 
 */
export function defineComputed(target, key, userDef) {
    //NOTE: 去掉了服务端渲染的逻辑判断
    
    if(typeof userDef === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key);
        sharedPropertyDefinition.set = noop;
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
}


function createComputedGetter(key) {
    return function computedGetter() {
        const watcher = this._computedWatchers && this._computedWatchers[key];
        if(watcher) {
            watcher.depend();
            return watcher.evaluate();
        }
    }
}

function initWatch(vm, watch) {
    for(let key in watch) {
        const handler = watch[key];
        if(Array.isArray(handler)) {

        } else {
            createWatcher(vm, key, handler);
        }
    }
}

function createWatcher(vm, expOrFn, handler, options) {
    if(isPlainObject(handler)) {
        options = handler;
        handler = handler.handler;
    }

    return vm.$watch(expOrFn, handler, options)
}