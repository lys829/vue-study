
import Watcher from '../observer/watcher'
import { createEmptyVNode } from '../vdom/vnode'

import {
    noop,
} from '../util/index'
import { pushTarget, popTarget } from '../observer/dep';


export let activeInstance = null;

/**
 * 
 * @param {Component} vm 
 * @param {Element} el 
 * @param {Boolean} hydrating 
 * @returns {component}
 */
export function mountComponent(vm, el, hydrating) {
    vm.$el = el;

    if(!vm.$options.render) {
        vm.$options.render = createEmptyVNode()
    }
    callHook(vm, 'beforeMount')

    let updateComponent = ()=> {
        // vm._render()通过render函数得到一个vnode, vm.update会在将template转化为node节点并绑定到vm.$el
        vm._update(vm._render(), hydrating);
    }

    // isRenderWatcher 参数会在Watcher构造函数中将watcher实例绑定到vm的_watcher属性上
    // watcher的初始化补丁会调用$forceUpdate(e.g 子组件的mounted钩子函数), 这依赖于vm._watcher
    new Watcher(vm, updateComponent, noop, {},  true); // true >> isRenderWatcher
    hydrating = false;

    //TODO: 为何判断vm.$vnode
    if(vm.$vnode == null) {
        //编辑已经挂载节点完成,这里会触发mouted钩子
        vm._isMounted = true;
        callHook(vm, 'mounted')
    }

    return vm;
}

/**
 * 
 * @param {Component} vm 
 */
export function initLifecycle(vm) {
    const options = vm.$options;

    vm.$parent = null;
    vm.$root = parent ? parent.$root : vm;

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null
    vm._inactive = null
    vm._directInactive = false
    vm._isMounted = false
    vm._isDestroyed = false
    vm._isBeingDestroyed = false
}


export function lifecycleMixin(Vue) {
    Vue.prototype._update = function(vnode, hydrating) {
        const vm = this;
        const prevEl = vm.$el;
        const prevVnode = vm._vnode;
        const prevActiveInstance = activeInstance;

        activeInstance = vm;
        vm._vnode = vnode;
        
        if(!prevVnode) {
            //初始化渲染 替换$el
            vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false); //false >> removeOnly
        } else {
            //用于更新变更
            vm.$el = vm.__patch__(prevVnode, vnode);
        }
        activeInstance = prevActiveInstance;

        if(prevEl) {
            prevEl.__vue__ = null;
        }
        if(vm.$el) {
            vm.$el.__vue__ = vm;
        }

    }
    Vue.prototype.$forceUpdate = function() {}
    Vue.prototype.$destroy = function() {}
}



export function callHook(vm, hook) {
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget();
    const handlers = vm.$options[hook];
    if(handlers) {
        for(let i = 0, j = handlers.length; i < j; i++) {
            try {
                handlers[i].call(vm);
            } catch(e) {
                // handerError(e, vm, `${hook} hook`)
                console.error(e, vm, `${hook} hook`)
            }
        }
    }
    if(vm._hasHookEvent) {
        vm.$emit('hook:' + hook);
    }
    popTarget()
}