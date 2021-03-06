
import VNode, { createEmptyVNode } from './vnode'
import { traverse } from '../observer/traverse'
import { createComponent } from './create-component'

import {
    isPrimitive,
    isTrue,
    isDef,
    isObject,
    resolveAsset
} from '../util/index'
import config from '../config';

import {
    normalizeChildren,
    simpleNormalizeChildren
} from './helpers/index'


const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

export function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
    console.log('createElement: >> ', tag, data, children, normalizationType, 'alwaysNormalize: ', alwaysNormalize)
    //兼容参数差异
    if (Array.isArray(data) || isPrimitive(data)) {
        normalizationType = children;
        children = data;
        data = undefined;
    }

    if (isTrue(alwaysNormalize)) {
        normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType)
}

/**
 * 
 * @param {Component} context 
 * @param {String| Component | Function | Object } string -> tag ?
 * @param {data} VNodeData ? 
 * @param {*} children 
 * @param {Number} normalizationType 
 */
export function _createElement(context, tag, data, children, normalizationType) {
    // 检测data是否为 observed data
    if (isDef(data) && isDef(data.__ob__)) {
        console.warn(`Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
            'Always create fresh vnode data objects in each render!', )
        return createEmptyVNode();
    }


    if (!tag) {
        return createEmptyVNode;
    }

    if (Array.isArray(children) && typeof children[0] === 'function') {
    }

    if (normalizationType === ALWAYS_NORMALIZE) {
        children = normalizeChildren(children);
    } else if(normalizationType === SIMPLE_NORMALIZE){
        children = simpleNormalizeChildren(children);
    }

    let vnode, ns;
    if (typeof tag === 'string') {
        let Ctor;
        ns = config.getTagNamespace(tag);
        if (config.isReservedTag(tag)) {
            // vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
            //只针对web平台
            vnode = new VNode(tag, data, children, undefined, undefined, context);
        } else if(isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
            // component
            // Ctor为注册过的组件, 有局部注册和全局注册两种情况
            vnode = createComponent(Ctor, data, context, children, tag)
        }
    } else {
        // direct component options / constructor
        vnode = createComponent(tag, data, context, children)
    }
    if (Array.isArray(vnode)) {
        return vnode;
    } else if (isDef(vnode)) {
        if (isDef(data)) {
            // registerDeepBindings(data)
        }
        return vnode;
    } else {
        return createEmptyVNode();
    }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings(data) {
    if (isObject(data.style)) {
        traverse(data.style);
    }
    if (isObject(data.class)) {
        traverse(data.class);
    }
}