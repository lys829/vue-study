import Vue from '../../../core/index'
import {inBrowser, isChrome} from '../../../core/util/index'
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { patch } from './patch'

import {
    query,
    isReservedTag,
    getTagNamespace,
    isReservedAttr
} from '../util/index'

import platformDirectives from './directives/index'


//TODO:  install platform specific utils
Vue.config.isReservedTag = isReservedTag;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isReservedAttr = isReservedAttr;

//TODO: install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);

// install platform patch function
Vue.prototype.__patch__ = patch;

/**
 * 
 * @param {String|Element} el 
 * @param {Boolean} hydrating 
 * @returns {Component}
 */
Vue.prototype.$mount = function(el, hydrating) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating);
}

export default Vue;