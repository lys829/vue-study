import { isDef, isUndef, extend, toNumber } from 'shared/util'

function updateDOMProps(oldVnode, vnode) {
    if(isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
        return;
    }

    let key, cur;
    const elm = vnode.elm;
    const oldProps = oldVnode.data.domProps || {};
    let props = vnode.data.domProps || {};

    // clone observed objects, as the user probably wants to mutate it
    if(isDef(props.__ob__)) {
        props = vnode.data.domProps = extend({}, props);
    }

    for(key in oldProps) {
        if(isUndef(props[key])) {
            elm[key] = '';
        }
    }

    for(key in props) {
        cur = props[key];
        // ignore children if the node has textContent or innerHTML
        // as these will throw away existing DOM nodes and cause removal errors
        // on subsequent patches (#3360)
        //TODO: key === 'textContent' || key === 'innerHTML'

        if(key === 'value') {
            // store value as _value as well since
            // non-string values will be stringified
            elm._value = cur;
            // avoid resetting cursor position when value is the same
            const strCur = isUndef(cur) ? '' : String(cur);
            if(shouldUpdateValue(elm, strCur)) {
                elm.value = strCur
            }
        } else {
            elm[key] = cur;
        }
    }
}

/**
 * 是否更新 dom properties
 *  1.composing 参考v-model
 *  节点为option || 非聚焦状态并且值发生了变化 || 值不相等(装饰器的各种情况)
 * @param elm
 * @param checkVal
 * @returns {boolean|*}
 */
function shouldUpdateValue(elm, checkVal) {
    return (!elm.composing &&
        elm.tagName === 'OPTION' ||
        isNotInFocusAndDirty(elm, checkVal) ||
        isDirtyWithModifiers(elm, checkVal)
    )
}


function isNotInFocusAndDirty(elm, checkVal) {
    // return true when textbox (.number and .trim) loses focus and its value is
    // not equal to the updated value
    let notInFocus = true;
    try {
        notInFocus = document.activeElement !== elm
    } catch (e) {}
    return notInFocus && elm.value !== checkVal
}

function isDirtyWithModifiers(elm, checkVal) {
    const value = elm.value;
    const modifiers = elm._vModifiers //injected by v-model runtime
    if(isDef(modifiers)) {
        if (modifiers.lazy) {
            // inputs with lazy should only be updated when not in focus
            return false
        }
        if (modifiers.number) {
            return toNumber(value) !== toNumber(newVal)
        }
        if (modifiers.trim) {
            return value.trim() !== newVal.trim()
        }
    }
    return value !== newVal
}


export default {
    create: updateDOMProps,
    update: updateDOMProps
}