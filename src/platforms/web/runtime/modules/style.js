import { getStyle, normalizeStyleBinding } from 'web/util/style'
import { cached, camelize, extend, isDef, isUndef } from 'shared/util'

const cssVarRE = /^--/;
const importantRE = /\s!important$/;
const setProp = (el, name, val)=> {
    if(cssVarRE.test(name)) {
        el.style.setProperty(name, val);
    } else if(importantRE.test(val)) {
        el.style.setProperty(name, val.replace(importantRE, ''), 'important')
    } else {
        const normalizedName = normalize(name);
        if(Array.isArray(val)) {
            // Support values array created by autoprefixer, e.g.
            // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
            // Set them one by one, and the browser will only set those it can recognize
            for (let i = 0, len = val.length; i < len; i++) {
                el.style[normalizedName] = val[i]
            }
        } else {
            el.style[normalizedName] = val;
        }
    }
}

const vendorNames = ['Webkit', 'Moz', 'ms'];
let emptyStyle;
const normalize = cached(function(prop) {
    emptyStyle = emptyStyle || document.createElement('div').style;
    prop = camelize(prop)
    if(prop !== 'filter' && (prop in emptyStyle)) {
        return prop;
    }
    const capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for(let i = 0; i < vendorNames.length; i++) {
        const name = vendorNames[i] + capName;
        if(name in emptyStyle) {
            return name;
        }
    }
});


//NOTE: staticStyle 直接写入节点的style
function updateStyle(oldVnode, vnode) {
    const data = vnode.data;
    const oldData = oldVnode.data;
   
    if(isUndef(data.staticStyle) && isUndef(data.style) && 
        isUndef(oldData.style) && isUndef(oldData.staticStyle)) {
        return;
    }

    let cur, name;
    const el = vnode.elm;
    const oldStaticStyle = oldData.staticStyle;
    const oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

    //存在oldStaticStyle, stylebinding在normalizeStyleData时已经合并进去
    const oldStyle = oldStaticStyle || oldStyleBinding;

    //normalizeStyleBinding只是转化String和Arrray两种类型
    const style = normalizeStyleBinding(vnode.data.style) || {};
    
    // 存储 normalized的style
    vnode.data.normalizedStyle = isDef(style.__ob__)
        ? extend({}, style)
        : style;

    const newStyle = getStyle(vnode, true);
    
    for(name in oldStyle) {
        if(isUndef(newStyle[name])) {
            setProp(el, name, '')
        }
    }

    for(name in newStyle) {
        cur = newStyle[name];
        if(cur !== oldStyle[name]) {
            // ie9 setting to null has no effect, must use empty string
            setProp(el, name, cur == null ? '' : cur);
        }
    }
}


export default {
    create: updateStyle,
    update: updateStyle
}