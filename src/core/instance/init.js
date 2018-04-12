
let uid = 0;
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        vm._uid = uid++;

        vm._isVue = true;

        vm.$options = {};

        // TODO: 环境不同代理不同
        // initProxy

        vm._self = vm;

        //vm._name = formatComponentName(vm, false);
    
        if(vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }

}