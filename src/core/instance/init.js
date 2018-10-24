import { mergeOptions } from '../util/index'

import { initLifecycle, callHook } from './lifecycle'
import { initRender } from './render'
import { initState } from './state'

let uid = 0;
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        vm._uid = uid++;

        // a flag to avoid this being observed
        vm._isVue = true;

        //merge options
        if(options && options._isComponent) {
            initInternalComponent(vm, options)
        } else {
            vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
        }

        // TODO: 环境不同,实现的代理方式不同
        // initProxy

        vm._renderProxy = vm;

        vm._self = vm;
        initLifecycle(vm);

        initRender(vm);
        callHook(vm, 'beforeCreate');
        initState(vm);
        callHook(vm, 'created')

        //vm._name = formatComponentName(vm, false);
        if(vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }
}

export function initInternalComponent(vm, options) {
    const opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    //parentVnode 参考 create-component.js中的　createComponentInstanceForVnode
    const parentVnode = options._parentVnode

    opts.parent = options.parent;
    opts._parentVnode = parentVnode

    // componentOptions值参考 create-component.js中的createComponent函数
    const vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if(options.render) {
        opts.render = options.render;
        opts.staticRenderFns = options.staticRenderFns;
    }
}

export function resolveConstructorOptions(Ctor) {
    let options = Ctor.options
    if(Ctor.super) {

    }
    return options;
}