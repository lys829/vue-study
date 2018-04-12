/**
 * 
 * @param {Component} vm 
 * @param {Element} el 
 * @param {Boolean} hydrating 
 * @returns {component}
 */
export function mountComponent(vm, el, hydrating) {
    vm.$el = el;

    //TODO: beforeMount钩子
    let updateComponent;

    updateComponent = ()=> {
        vm._update(vm._render(), hydrating);
    }

    if(vm.$node == null) {
        vm._isMounted = true;
    
    }
}


export function lifecycleMixin(Vue) {
    Vue.prototype._update = function(vnode, hydrating) {}
    Vue.prototype.$forceUpdate = function() {}
    Vue.prototype.$destroy = function() {}
}