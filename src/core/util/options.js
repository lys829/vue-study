import config from '../config'

import {
    extend,
    hasOwn,
    camelize,
    toRawType,
    capitalize,
    isBuiltInTag,
    isPlainObject
} from 'shared/util'

import {
    ASSET_TYPES,
    LIFECYCLE_HOOKS
} from 'shared/constants'


/**
 * 覆盖策略，处理如何合并父组件选项和子组件选项以及参数选项
 */
const strats = config.optionMergeStrategies



/**
 * Hooks and props are merged as arrays.
 * @param {Array<Function>} parentVal ?
 * @param {Function|Array<Function>} childVal ?
 */
function mergeHook(parentVal, childVal) {
    return childVal
        ? parentVal
            ? parentVal.concat(childVal)
            : Array.isArray(childVal)
                ? childVal
                : [childVal]
        : parentVal;
}

LIFECYCLE_HOOKS.forEach( (hook)=> {
    strats[hook] = mergeHook;
})



function mergeData(to, from) {
    if(!from) {
        return to;
    }
    let key, toVal, fromVal
    const keys = Object.keys(from);
    for(let i = 0; i < keys.length; i++) {
        key = keys[i];
        toVal = to[key];
        fromVal = from[key];
        if(!hasOwn(to, key)) {
            set(to, key, fromVal);
        } else if(isPlainObject(toVal) && isPlainObject(fromVal)) {
            mergeData(toVal, fromVal)
        }
    }
    return to;
}

/**
 * 
 * @param {*} parentVal 
 * @param {*} childVal 
 * @param {Component} vm 
 */
export function mergeDataOrFn(parentVal, childVal, vm) {
    if(!vm) {
        //in a Vue.extend merge, both should be functions
        // Vue.extend 子组件选项
        if(!childVal) {
            return parentVal;
        }
        if(!parentVal) {
            return childVal;
        }

        return function mergedDataFn() {
            return mergeData(
                typeof childVal === 'function' ? childVal.call(this, this) : childVal,
                typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
            )
        }
    } else {
        return function mergedInstanceDataFn() {
            const instanceData = typeof childVal === 'function' ? childVal.call(vm, vm) : childVal;
            const defaultData = typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal;
            if(instanceData) {
                return mergeData(instanceData, defaultData)
            } else {
                return defaultData;
            }
        }
    }
}


/**
 * 合并选项中data属性
 * @param {*} parentVal 
 * @param {*} childVal 
 * @param {Component} vm 
 */
strats.data = function(parentVal, childVal, vm) {
    if(!vm) {
        if(childVal && typeof childVal !== 'function') {
            return parentVal;
        }
        return mergeDataOrFn(parentVal, childVal);
    }

    return mergeDataOrFn(parentVal, childVal, vm);
}

strats.methods = function (parentVal, childVal, vm, key) { 
    if(!parentVal) {
        return childVal;
    }
    const ret = Object.create(null);
    extend(ret, parentVal);
    if(childVal) {
        extend(ret, childVal);
    }
    return ret;
}

const defaultStrat = function(parentVal, childVal) {
    return childVal === undefined ? parentVal : childVal
};

/**
 * 如果存在childVal, childVal会覆盖parentVal的属性访问
 * @param parentVal
 * @param childVal
 * @param vm
 * @param key
 * @returns {*}
 */
function mergeAssets(parentVal, childVal, vm, key) {
    const res = Object.create(parentVal);
    if(childVal) {
        console.log('merge', res, childVal)
        return extend(res, childVal);
    } else {
        return res;
    }
}

ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = mergeAssets;
});

//TODO: 策略合并的限制

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps(options, vm) {
    const props = options.props;
    if(!props) {
        return;
    }
    const res = {};
    let i, val, name;
    if(Array.isArray(props)) {
        i = props.length
        while(i--) {
            val = props[i];
            if(typeof val === 'string') {
                name = camelize(val)
                res[name] = {type: null};
            }
        }
    }
    options.props = res;
}

function normalizeDirectives(options) {
    const dirs = options.directives;
    if(dirs) {
        for(const key in dirs) {
            const def = dirs[key];
            if(typeof def === 'function') {
                dirs[key] = {bind: def, update: def};
            }
        }
    }
}

/**
 * vm没有parent时, parent为构造函数Vue的options选项
 * @param {Objetc} parent 
 * @param {Objetc} child 
 * @param {Component} vm 
 */
export function mergeOptions(parent, child, vm) {
    //TODO: checkComponents(child)
    
    if(typeof child === 'function') {
        child = child.options;
    }

    normalizeProps(child, vm);

    //规范化参数
    //TODO: normalize
    normalizeDirectives(child);

    //TODO: extend

    //TODO: mixins

    const options = {};
    let key;
    for(key in parent) {
        mergeField(key);
    }
    for(key in child ) {
        if(!hasOwn(parent, key)) {
            mergeField(key);
        }
    }

    function mergeField(key) {
        //每一个选项都有对应的合并策略
        const strat = strats[key] || defaultStrat;
        options[key] = strat(parent[key], child[key], vm, key);
    }

    return options;
}


export function resolveAsset(options, type, id, warnMissing) {
    if(typeof id !== 'string') {
        return;
    }

    const assets = options[type];
    if(hasOwn(assets, id)) {
        return assets[id];
    }

    const camelizedId = camelize(id);
    if(hasOwn(assets, camelizedId)) {
        return assets[camelizedId];
    }

    const PascalCaseId = capitalize(camelizedId);
    if(hasOwn(assets, PascalCaseId)) {
        return assets[PascalCaseId]
    }
    const res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    return res;
}