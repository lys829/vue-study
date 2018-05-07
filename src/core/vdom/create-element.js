
import VNode, { createEmptyVNode } from './vnode'

import {
    isPrimitive,
    isTrue,
    isDef
} from '../util/index'
import config from '../config';

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

export function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
    // console.log('createElement: >> ', context, tag, data, children, normalizationType, alwaysNormalize)
    //TODO: 未判断原始值
    if(Array.isArray(data)) {
        normalizationType = children;
        children = data;
        data = undefined;
    }

    if(isTrue(alwaysNormalize)) {
        normalizationType = ALWAYS_NORMALIZE;
    }

    return _createElement(context, tag, data, children, normalizationType)
}

/**
 * 
 * @param {Component} context 
 * @param {Stirng} tag ?
 * @param {data} VNodeData ? 
 * @param {*} children 
 * @param {Number} normalizationType 
 */
export function _createElement(context, tag, data, children, normalizationType) {
    //TODO: 判断data是否为 observed data
    
    if(!tag) {
        return createEmptyVNode;
    }

    /* if(normalizationType === ALWAYS_NORMALIZE) {
        children = normalizeChildren(children);
    } else {
        children = simpleNormalizeChildren(children);
    } */
    let vnode, ns;
    if(typeof tag === 'string') {
        let Ctor
        ns = config.getTagNamespace(tag);
        if(config.isReservedTag(tag)) {
            // vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
            //只针对web平台
            vnode = new VNode(tag, data, children, undefined, undefined, context);
        }
    } else {

    }
    
    if(Array.isArray(vnode)) {
        return vnode;
    } else if(isDef(vnode)) {
        return vnode;
    } else {
        return createEmptyVNode();
    }
}