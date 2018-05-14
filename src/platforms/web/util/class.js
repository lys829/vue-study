import { isDef, isObject } from 'shared/util'

export function genClassForVnode(vnode) {
    let data = vnode.data;
    let parentNode = vnode;
    let childNode = vnode;

    //TODO: 考虑父级
    return renderClass(data.staticClass, data.class);
}


function renderClass(staticClass, dynamicClass) {
    if(isDef(staticClass) || isDef(dynamicClass)) {
        return concat(staticClass, stringifyClass(dynamicClass))
    }
}

export function concat(a, b) {
    return a ? b ? ( a + ' ' + b) : a : (b || '');
}

export function stringifyClass(value) {
    if(Array.isArray(value)) {
        return stringifyClass(value);
    }
    if(isObject(value)) {
        return stringObject(value)
    }
    if(typeof value === 'string') {
        return value;
    }
    return '';
}

function stringifyArray(value) {
    let res = '';
    let stringified;
    for(let i = 0, l = value.length; i < l; i++) {
        if(isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
            if(res) {
                res += ' '
            }
            res += stringified;
        }
    }
    return res;
}

function stringifyObject(value) {
    let res = '';
    for(const key in value) {
        if(value[key]) {
            if(res) {
                res += ' ';
            }
            res += key;
        }
    }
    return res;
}