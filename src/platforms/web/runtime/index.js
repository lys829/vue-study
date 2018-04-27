import Vue from '../../../core/index'
import {inBrowser, isChrome} from '../../../core/util/index'
import { mountComponent } from 'core/instance/lifecycle'
import { query } from '../util';
import { patch } from './patch'

//TODO:  install platform specific utils

//TODO: install platform runtime directives & components

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