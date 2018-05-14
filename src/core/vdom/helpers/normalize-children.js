import { isFalse, isTrue, isDef, isUndef, isPrimitive } from 'shared/util'
import VNode, { createTextVNode } from 'core/vdom/vnode'


//TODO:未知
export function simpleNormalizeChildren (children) {
    for (let i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)
      }
    }
    return children
  }


export function normalizeChildren(children) {
    return isPrimitive(children)
        ? [createTextVNode(children)]
        : Array.isArray(children)
            ? normalizeArrayChildren(children)
            : undefined
}

function isTextNode(node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment);
}


// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeArrayChildren(children, nestedIndex) { 
    const res = [];
    let i, c, lastIndex, last;

    for( i = 0; i < children.length; i++) {
        c = children[i];
        if(isUndef(c) || typeof c === 'boolean') {
            continue;
        }
        lastIndex = res.length - 1;
        last = res[lastIndex];
        // nested(嵌套数组)
        if(Array.isArray(c)) {
            if(c.length > 0) {
                c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`);
                // merge adjacent text nodes(合并相邻的文本节点<div{aaaa}{cccc}></div>)
                /* if(isTextNode(c[0]) && isTextNode(last)) {
                    res[lastIndex] = createTextVNode(last.text + (c[0].text))
                    c.shift();
                } */
                res.push.apply(res, c);
            }
        } else if(isPrimitive(c)){
            /* if(isTextNode(last)) {
                res[lastIndex] = createTextVNode(last.text + c)
            } else if( c !== '') {
                res.push(createTextVNode(c))
            } */
        } else {
            if(isTextNode(c) && isTextNode(last)) {
                // res[lastIndex] = createTextVNode(last.text + c.text)
            } else {
                if(isTrue(children._isVList) &&
                    isDef(c.tag) && 
                    isUndef(c.key) &&
                    isDef(nestedIndex)
                ) {
                    //标记嵌套的元素
                    c.key = `__vlist${nestedIndex}_${i}__`
                }
                
                res.push(c);
            }
        }
    }
    return res;
}