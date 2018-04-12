import { mergeOptions } from '../util/index'

import { initLifecycle } from './lifecycle'
import { initRender } from './render'

let uid = 0;
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        vm._uid = uid++;

        vm._isVue = true;

        vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);

        // TODO: 环境不同,实现的代理方式不同
        // initProxy

        vm._renderProxy = vm;

        vm._self = vm;

        initLifecycle(vm);

        initRender(vm);
        

        //vm._name = formatComponentName(vm, false);
    
        if(vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }

}

export function resolveConstructorOptions(Ctor) {
    let options = Ctor.options
    if(Ctor.super) {

    }
    return options;
}