export function eventsMixin(Vue) {
    const hookRE = /^hook:/
    Vue.prototype.$on = function(event, fn) {

    }

    Vue.prototype.$once = function(event, fn) {

    }

    Vue.prototype.$off = function(event, fn) {

    }

    Vue.prototype.$emit = function(event) {
        
    }
}