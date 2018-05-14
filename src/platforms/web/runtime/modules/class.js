import {
    isDef,
    isUndef
} from 'shared/util'

import {
    concat,
    stringifyClass,
    genClassForVnode
} from 'web/util/index'

//TODO: 未处理staticClass
function updateClass(oldVnode, vnode) {
    const el = vnode.elm;
    const data = vnode.data;
    const oldData = oldVnode.data;

    if(
        isUndef(data.class) && (
            isUndef(oldData) || isUndef(oldData.class)
        )
    ) {
        return;
    }
    let cls = genClassForVnode(vnode);

    //TODO: transition
    if(cls !== el._prevClass) {
        el.setAttribute('class', cls);
        el._prevClass  = cls;
    }
}

export default {
    create: updateClass,
    update: updateClass
}