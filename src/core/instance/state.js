
import Watcher from '../observer/watcher'
import Dep, { pushTarget, popTarget } from '../observer/dep'

import {
    set,
    // del,
    observe,
    defineReactive,
    toggleObserving
} from '../observer/index'

import {
    bind,
    noop,
    isReserved,
    nativeWatch,
    isPlainObject,
    validateProp
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
    };
    const propsDef = {};
    propsDef.get = function () {
        return this._props;
    };
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', dataDef);

    //TODO: set del
    Vue.prototype.$set = set;

    Vue.prototype.$watch = function(expOrFn, cb, options={}) {
        const vm = this;
        options.user = true;
        const watcher = new Watcher(vm, expOrFn, cb, options);
        if(options.immediate) {
            cb.call(vm, watcher.value);
        }
        //解除观察者与属性之间的关系
        return function unwatchFn() {
            watcher.teardown();
        }
    }
}


export function initState(vm) {
    // 存储所有该组件实例的 watcher对象
    vm._watchers = [];
    const opts = vm.$options;
    if(opts.props) {
        initProps(vm, opts.props);
    }

    if(opts.methods) {
        initMethods(vm, opts.methods);
    }

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

function initProps(vm, propsOptions) {
    const propsData = vm.$options.propsData || {};
    const props = vm._props = {};

    const keys = vm.$options._propKeys = [];
    const isRoot = !vm.$parent

    if(!isRoot) {

    }
    for(const key in propsOptions) {
        keys.push(key)
        const value = validateProp(key, propsOptions, propsData, vm);

        defineReactive(props, key, value);

        // 创建的组件实例, key已经绑定到组件的原型属性_props上, 参考extends.js initProps
        if(!(key in vm)) {
            // 代理props的属性访问
            proxy(vm, `_props`, key);
        }
    }
}

function initData(vm) {
    let data = vm.$options.data;
    // beforeCreate 生命周期钩子函数是在 mergeOptions 函数之后 initData 之前被调用的,
    // 可能在beforeCreate 生命周期钩子函数中修改了 vm.$options.data 的值
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

const computedWatcherOptions = { lazy: true }

function initComputed(vm, computed) {
    const watchers = vm._computedWatchers = Object.create(null);

    for(let key in computed) {
        const userDef = computed[key];
        const getter = typeof userDef === 'function' ? userDef : userDef.get;

        //为计算属性绑定内部watcher
        watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);

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
    } else {
        sharedPropertyDefinition.get = userDef.cache !== false ? createComputedGetter(key) : userDef.get;
        sharedPropertyDefinition.set = userDef.set ? userDef.set : noop;
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
}


function createComputedGetter(key) {
    return function computedGetter() {
        console.log('computedGetter')
        const watcher = this._computedWatchers && this._computedWatchers[key];
        if(watcher) {
            if(watcher.dirty) {
                watcher.evaluate();
            }
            if(Dep.target) {
                watcher.depend();
            }
            return watcher.value;
        }
    }
}

function initMethods(vm, methods) {
    // const props = vm.$options;
    for(const key in methods) {
        vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
    }
}

function initWatch(vm, watch) {
    for(let key in watch) {
        const handler = watch[key];
        if(Array.isArray(handler)) {
            //子组件父组件存在相同的key(watcher),则合并为数组
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
    if(typeof handler === 'string') {
        handler = vm[handler]
    }
    return vm.$watch(expOrFn, handler, options)
}