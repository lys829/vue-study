import VNode, { cloneVNode } from './vnode'

import {
    isDef,
    isUndef,
    isTrue,
    makeMap,
    isRegExp,
    isPrimitive
} from '../util/index'
import { WSAVERNOTSUPPORTED } from 'constants';

/**
 * 判断连个VNode是否相同
 * @param {VNode} a 
 * @param {VNode} b 
 */
function sameVnode(a, b) {
    return (
        a.key === b.key && (
            (
                a.tag === b.tag &&
                a.isComment === b.isComment && 
                isDef(a.data) === isDef(b.data) //TODO:未加上input的判断
            ) || (
                isTrue(a.isAsyncPlaceholder) && 
                a.asyncFactory === b.asyncFactory &&
                isUndef(b.asyncFactory.error)
            )
        )
    )
}

/* function sameInpuType(a, b) {
    if(a.tag !== 'input') return true;
    let i
    const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type
    const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
} */


function createKeyToOldIdx(children, beginIdx, endIdx) {
    let i, key;
    const map = {};
    for(i = beginIdx; i <= endIdx; ++i) {
        key = children[i].key;
        if(isDef(key)) {
            map[key] = i
        }
    }
    return map;
}



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
            //注释
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

    /**
     * 
     * @param {Node} parentElm 
     * @param {Array} vnodes 
     * @param {Number} startIdx 
     * @param {Number} endIdx 
     */
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            if (isDef(ch)) {
                if (isDef(ch.tag)) {
                    //TODO: remove hook
                    removeNode(ch.elm);
                } else { // Text node
                    removeNode(ch.elm);
                }
            }
        }
    }

    function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx)
        }
    }

    /**
     * 根节点的是否有tag属性
     * @param {Vnode} 
     * @returns {Boolean}
     */
    function isPatchable(vnode) {
        while(vnode.componentInstance) {
            vnode = vnode.componentInstance._vnode;
        }
        return isDef(vnode.tag);
    }

    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
        let oldStartIdx = 0;
        let newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;        
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

        /**
         * removeOnly只是<transition-group>使用的一个特殊标识
         */
        const canMove = !removeOnly
        while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if(isUndef(oldStartVnode)) {
                oldStartVnode = oldCh[++oldStartIdx];
            } else if(isUndef(oldEndVnode)) {
                oldEndVnode = oldCh[--oldEndIdx];
            } else if(sameVnode(oldStartVnode, newStartVnode)) {
                console.log('1.oldStartVnode === newStartVnode', oldStartIdx, newStartIdx, oldEndIdx, newEndIdx)
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if(sameVnode(oldEndVnode, newEndVnode)) {
                console.log('2.oldEndVnode === newEndVnode')
            } else if(sameVnode(oldStartVnode, newEndVnode)) {
                console.log('3.oldStartVnode === newEndVnode')
            } else if(sameVnode(oldEndVnode, newStartVnode)) {
                console.log('4.oldEndVnode === newStartVnode')
            } else {
                console.log('5. .....')
                if(isUndef(oldKeyToIdx)) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = isDef(newStartVnode.key) 
                    ? oldKeyToIdx[newStartVnode.key] 
                    : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);

                if(isUndef(idxInOld)) { //new Element
                    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                } else {
                    vnodeToMove = oldCh[idxInOld];
                    if(sameVnode(vnodeToMove, newStartVnode)) {
                        patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined
                        canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
                    } else {
                        // same key but different element. treat as new element
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
                    }
                    newStartVnode = newCh[++newStartIdx]
                }
            }
            if(oldStartIdx > oldEndIdx) {
                refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            } else if(newStartIdx > newEndIdx){ //移除旧节点
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
            }
        }

    }

    function findIdxInOld(node, oldCh, start, end) {
        for (let i = start; i < end; i++) {
            const c = oldCh[i];
            if(isDef(c) && sameVnode(node, c)) {
                return i;
            }
        }
    }

    function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
        if(oldVnode === vnode) {
            return;
        }
        const elm = vnode.elm = oldVnode.elm;

        const data = vnode.data;

        const oldCh = oldVnode.children;
        const ch = vnode.children;
    
        if(isUndef(vnode.text)) {
            if(isDef(oldCh) && isDef(ch)) { 
                //如果oldVNode与vnode的children属性存在                
                if(oldCh !== ch ) {
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
                }
            } else if(isDef(ch)) {

            } else if(isDef(oldCh)) {

            } else if(isDef(oldVnode.text)) {
                // oldVnode有文本节点，而vnode没有，那么就清空这个节点
                nodeOps.setTextContent(elm, '');
            }
        } else if(oldVnode.text !== vnode.text) {
            nodeOps.setTextContent(elm, vnode.text);
        }

    }

    return function patch(oldVnode, vnode, hydrating, removeOnly) {
        if(isUndef(vnode)) {
            return;
        }

        let isInitialPatch = false;
        const insertedVnodeQueue = [];
        if (isUndef(oldVnode)) {
            //暂无
        } else {
            const isRealElement = isDef(oldVnode.nodeType);
            if (!isRealElement && sameVnode(oldVnode, vnode)) {
                //patch 已经存在的根节点
                patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
            } else {
                if (isRealElement) {
                    //挂载一个真正的DOM节点
                    //NOTE:忽略服务端渲染

                    //创建一个VNode来取代真实节点
                    oldVnode = emptyNodeAt(oldVnode);
                }
                //取代已经存在的元素
                const oldElm = oldVnode.elm;
                const parentElm = nodeOps.parentNode(oldElm);
                // 创建新的节点
                createElm(vnode, insertedVnodeQueue, parentElm, nodeOps.nextSibling(oldElm));

                if (isDef(parentElm)) {
                    //移除原来的根节点
                    removeVnodes(parentElm, [oldVnode], 0, 0);
                } else {

                }
            }
        }

        return vnode.elm
    }
}