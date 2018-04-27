import Vue from './runtime/index'

import { query } from './util/index'

import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el, hydrating) {
    el = el && query(el);

    //TODO:排除 body或者html作为挂载元素

    const options = this.$options;

    // 将template/el转化为render函数
    if (!options.render) {
        let template = options.template;
        //NOTE:此处省略到了其他template形式
        if(template) {
            const { render, staticRenderFns} = compileToFunctions(template, {
                shouldDecodeNewlines,
                shouldDecodeNewlinesForHref,
                delimiters: options.delimiters,
                comments: options.comments
            }, this);
            options.render = render;
            options.staticRenderFns = staticRenderFns;
        }
    }
    return mount.call(this, el, hydrating);
}

function getOuterHTML(el) {
    if (el.outerHTML) {
        return el.outerHTML
    } else {
        const container = document.createElement('div')
        container.appendChild(el.cloneNode(true))
        return container.innerHTML
    }
}

Vue.compile = compileToFunctions;

export default Vue