import {isDef, isObject, isUndef} from "shared/util";
import {resolveConstructorOptions} from "core/instance/init";
import VNode from "core/vdom/vnode";

import {
    activeInstance,
    updateChildComponent
} from '../instance/lifecycle'
import {callHook} from "core/instance/lifecycle";

import {
    resolveAsyncComponent,
} from './helpers/index'
import {extractPropsFromVNodeData} from "core/vdom/helpers";

// inline hooks to be invoked on component VNodes during patch
const componentVNodeHooks = {
    init(vnode, hydrating) {
        if(
            vnode.componentInstance &&
            !vnode.componentInstance._isDestroyed &&
            vnode.data.keepalive
        ) {
            // TODO: keeplive
        } else {
            const child = vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance);
            // child.$mount(hydrating ? vnode.elm : undefined, hydrating)
            child.$mount(undefined, hydrating)
        }
    },

    prepatch(oldVnode, vnode) {
        const options = vnode.componentOptions;
        const child = vnode.componentInstance = oldVnode.componentInstance;
        updateChildComponent(
            child,
            options.propsData, // updated props
            options.listeners,  // updated listeners
            vnode,  // new parent vnode
            options.children   // new children
        )
    },

    insert(vnode) {
        const {context, componentInstance} = vnode;
        if(!componentInstance._isMounted) {
            componentInstance._isMounted = true;
            callHook(componentInstance, 'mounted');
        }
    },

    destroy() {

    }
};

const hooksToMerge = Object.keys(componentVNodeHooks);

export function createComponent(Ctor, data, context, children, tag) {
    if(isUndef(Ctor)) {
        return;
    }

    //Vue构造函数
    const baseCtor = context.$options._base;

    // plain options object: turn it into a constructor
    // 普通对象需要转化为 VueComponent构造函数
    if(isObject(Ctor)) {
        Ctor = baseCtor.extend(Ctor);
    }

    if(typeof Ctor !== 'function') {
        return;
    }

    // TODO: async component
    data = data || {};

    resolveConstructorOptions(Ctor)

    //TODO: transform component v-model data into props & events

    // extract props
    const propsData = extractPropsFromVNodeData(data, Ctor, tag);
    //TODO: functional component


    const listeners = data.on;
    data.on = data.nativeOn;

    //TODO: slot

    installComponentHooks(data)

    // return a placeholder vnode
    const name = Ctor.options.name || tag;
    //TODO: vnode参数完整
    const vnode = new VNode(
        `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
        data, undefined, undefined, undefined, context,
        { Ctor, propsData, listeners, tag, children })

    return vnode;
}


/**
 *
 * @param vnode MountedComponentVNode
 * @param parent
 * @returns {*}
 */
function createComponentInstanceForVnode(vnode, parent) {
    const options = {
        _isComponent: true,
        _parentVnode: vnode,
        parent
    };
    //TODO: inline-template
    return new vnode.componentOptions.Ctor(options);
}


function installComponentHooks(data) {
    const hooks= data.hook || (data.hook = {});
    for(let i = 0; i < hooksToMerge.length; i++) {
        const key = hooksToMerge[i];
        const existing = hooks[key];
        const toMerge = componentVNodeHooks[key];
        if(existing !== toMerge && !(existing && existing._merged)) {
            hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge;
        }
    }
}

function mergeHook(f1, f2) {
    const merged = (a, b)=> {
        f1(a, b);
        f2(a, b);
    };
    merged._merged = true;
    return merged;
}