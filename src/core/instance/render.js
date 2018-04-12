
/**
 * 
 * @param {Component} vm 
 */
export function initRender(vm) {
    vm._vnode = null; // the root of the child tree
    vm._staticTress = null; // v-once cached trees
    const options = vm.$options;
    //此时options._parentVnode为undefined

    //TODO: $slots处理

    /**
     * 在实例上绑定createElement函数
     * 这样就能获取正确的渲染上下文
     * 参数依次为:  tag, data, children, normalizationType, alwaysNormalize
     * 内部版本由模板编译的渲染函数使用
     */
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);

    //规范化(alwaysNormalize)适用于发行版本, 在用户提供的render functions 中使用
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);

    //TODO:在vm上定义响应属性 $attrs, $listeners
}

export function renderMixin(Vue) {
    Vue.prototype.$nextTick = function(fn) {}
    Vue.prototype._render = function() {}
}