
import {
    warn,
    nextTick,
    emptyObject,
    // handleError,
} from '../util/index'

import { defineReactive } from '../observer/index'

import { installRenderHelpers } from './render-helpers/index'
import VNode, { createEmptyVNode } from '../vdom/vnode'
import { createElement } from '../vdom/create-element'

/**
 * 
 * @param {Component} vm 
 */
export function initRender(vm) {
    vm._vnode = null; // the root of the child tree
    vm._staticTress = null; // v-once cached trees
    const options = vm.$options;

    const parentVnode = vm.$vnode = options._parentVnode
    const renderContext = parentVnode && parentVnode.context;
    //TODO: $slots处理

    const parentData = parentVnode && parentVnode.data;

    /**
     * 在实例上绑定createElement函数
     * 这样就能获取正确的渲染上下文
     * 参数依次为: vm tag, data, children, normalizationType, alwaysNormalize
     * 内部版本由模板编译的渲染函数使用
     */
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);


    //规范化(alwaysNormalize)适用于发行版本, 在用户提供的render functions 中使用
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);

    //在vm上定义响应属性 $attrs, $listeners
    // defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    // defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)

}

export function renderMixin(Vue) {
    installRenderHelpers(Vue.prototype)

    Vue.prototype.$nextTick = function(fn) {
        return nextTick(fn, this);
    };
    Vue.prototype._render = function() {
        const vm = this;
        //render在web平台入口文件(web/entry-runtime-with-compiler.js)中定义
        const {render} = vm.$options
        let vnode;
        try {
            //_renderProxy的值为vm本身, 如果用户提供render函数,参数为vm.$createElement
            vnode = render.call(vm._renderProxy, vm.$createElement);
        } catch(e) {
            console.error(e);
        }

        if(!(vnode instanceof VNode)) {
            vnode = createEmptyVNode();
        }

        //set parent
        return vnode;
    }
}