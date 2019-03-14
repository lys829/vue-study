import { isObject } from "../util/index";
import VNode from '../vdom/vnode'

const seenObjects = new Set()

export function traverse(val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
}

/**
 * 递归遍历一个对象来执行转化的getter, 这样对象内部的每个嵌套属性都会被收集成一个深度依赖关系
 * @param {*} val 
 * @param {Set} seen 
 */
function _traverse(val, seen) {
    let i, keys;
    const isA = Array.isArray(val);
    if((!isA && !isObject) || Object.isFrozen(val) || val instanceof VNode) {
        return;
    }
    if(val.__ob__) {
        const depId = val.__ob__.dep.id;
        if(seen.has(depId)) {
            return;
        }
        seen.add(depId);
    }

    if(isA) {
        i = val.length;
        while(i--) {
            //val[i]读取子属性
            _traverse(val[i], seen);
        }
    } else {
        keys = Object.keys(val);
        i = keys.length;
        while(i--) {
            //val[keys[i]]读取子属性
            _traverse(val[keys[i]], seen);
        }
    }
}