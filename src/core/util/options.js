import config from '../config'

import { test } from 'core/observer/test'

import {
    extend,
    hasOwn,
    camelize,
    toRawType,
    capitalize,
    isBuiltInTag,
    isPlainObject
  } from 'shared/util'


/**
 * 覆盖策略，处理如何合并父组件选项和子组件选项以及参数选项
 */
const strats = config.optionMergeStrategies


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


const defaultStrat = function(parentVal, childVal) {
    return childVal === undefined ? parentVal : childVal
}

//TODO: 策略合并的限制

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

    //TODO: normalize

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
        //先使用默认start
        const strat = defaultStrat;
        options[key] = strat(parent[key], child[key], vm, key);
    }

    return options;
}