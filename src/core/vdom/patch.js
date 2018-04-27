import VNode, { cloneVNode } from './vnode'

import {
    isDef,
    isUndef,
    isTrue,
    makeMap,
    isRegExp,
    isPrimitive
} from '../util/index'

export function createPatchFunction(backend) {
    let i, j;
    const cbs = {};

    const { nodeOps } = backend;

    function emptyNodeAt(elm) {
        return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
    }

    let creatingElmInVPre = 0;
    function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
        const data = vnode.data;
        const children = vnode.children;
        const tag = vnode.tag;

        if (isDef(tag)) {
            // NOTE: 未考虑SVG元素
            vnode.elm = nodeOps.createElement(tag, vnode);

            createChildren(vnode, children, insertedVnodeQueue);
            if (isDef(data)) {
                //TODO: 钩子函数
            }
            insert(parentElm, vnode.elm, refElm);
        } else if (isTrue(vnode.isComment)) {
            //
        } else {
            //直接当文本节点处理
            vnode.elm = nodeOps.createTextNode(vnode.text);
            insert(parentElm, vnode.elm, refElm);
        }

    }

    function insert(parent, elm, ref) {
        if (isDef(parent)) {
            if (isDef(ref)) {
                if (ref.parentNode === parent) {
                    nodeOps.insertBefore(parent, elm, ref);
                }
            } else {
                nodeOps.appendChild(parent, elm);
            }
        }
    }

    function createChildren(vnode, children, insertedVnodeQueue) {
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; ++i) {
                createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
            }
        } else if (isPrimitive(vnode.text)) {
            nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
        }
    }

    function removeNode(el) {
        const parent = nodeOps.parentNode(el);
        if (isDef(parent)) {
            nodeOps.removeChild(parent, el);
        }
    }

    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            if (isDef(ch)) {
                if (isDef(ch.tag)) {
                    removeNode(ch.elm);
                } else { // Text node
                    removeNode(ch.elm);
                }
            }
        }
    }

    return function patch(oldVnode, vnode, hydrating, removeOnly) {
        let isInitialPatch = false;
        const insertedVnodeQueue = [];

        if (isUndef(oldVnode)) {
            //暂无
        } else {
            const isRealElement = isDef(oldVnode.nodeType);
            if (!isRealElement) {

            } else {
                if (isRealElement) {
                    //挂载一个真正的DOM节点
                    //NOTE:忽略服务端渲染

                    //创建一个VNode来取代真是节点
                    oldVnode = emptyNodeAt(oldVnode);
                }
                //取代已经存在的元素
                const oldElm = oldVnode.elm;
                const parentElm = nodeOps.parentNode(oldElm);

                // 创建新的节点
                createElm(vnode, insertedVnodeQueue, parentElm, nodeOps.nextSibling(oldElm));

                if (isDef(parentElm)) {
                    removeVnodes(parentElm, [oldVnode], 0, 0);
                } else {

                }
            }
        }

        return vnode.elm
    }
}