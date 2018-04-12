export function renderMixin(Vue) {

    
    Vue.prototype.$nextTick = function(fn) {}
    Vue.prototype._render = function() {}
}