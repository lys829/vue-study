import {
    hasOwn,
    isObject,
    toRawType,
    hyphenate,
    capitalize,
    isPlainObject
} from 'shared/util'

export function validateProp(key, propOptions, propsData, vm) {
    const prop = propOptions[key];
    // 数据源中是否存在
    const absent = !hasOwn(propsData, key)
    let value = propsData[key];

    const booleanIndex = getTypeIndex(Boolean, prop.type);
    if(booleanIndex > -1) {
        if(absent && !hasOwn(prop, 'default')) {
            value = false
        } else if (value === '' || value === hyphenate(key)) {
            const stringIndex = getTypeIndex(String, prop.type);
            if (stringIndex < 0 || booleanIndex < stringIndex) {
                value = true
            }
        }
    }
    if(value === undefined) {
        //TODO: prop
    }

    return value
}


function getType(fn) {
    const match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : '';
}
function isSameType(a, b) {
    return getType(a) === getType(b)
}

function getTypeIndex(type, expectedTypes) {
    if(!Array.isArray(expectedTypes)) {
        return isSameType(expectedTypes, type) ? 0 : -1
    }
    for(let i = 0, len = expectedTypes.length; i < len; i++) {
        if(isSameType(expectedTypes[i]), type) {
            return i
        }
    }
    return -1;
}