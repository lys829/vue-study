import { isDef, isUndef } from 'shared/util'
import { updateListeners } from 'core/vdom/helpers/index'
import {withMacroTask, supportsPassive} from "core/util/index";


/**
 * v-model
 */
function normalizeEvents(on) {

}

//HTMLElement
let target;

function createOnceHandler(handler, event, capture) {
    const _target = target;
    return function onceHandler() {
        const res = handler.apply(null, arguments);
        if(res !== null) {
            remove(event, onceHandler, capture, _target);
        }
    }
}

function add(event, handler, once, capture, passive) {
    // handler = withMacroTask(handler);
    if(once) {
        handler = createOnceHandler(handler, event, capture)
    }
    target.addEventListener(event, handler, supportsPassive ? {capture, passive} : capture);
}

function remove(event, hanlder, capture, _target) {
    (_target || target).removeEventListener(event, hanlder._withTask || hanlder, capture);
}

function updateDOMListeners(oldVnode, vnode) {
    if(isUndef(oldVnode.data.on) && isUndef(vnode.data.on)){
        return;
    }
    const on = vnode.data.on || {};
    const oldOn = oldVnode.data.on || {};
    target = vnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add, remove, vnode.context)
    target = undefined;
}


export default {
    create: updateDOMListeners,
    update: updateDOMListeners
}