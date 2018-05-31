import VNode from "../vnode";


export function mergeVNodeHook(def, hookKey, hook) {
    if(def instanceof VNode) {
        def = def.data.hook || (def.data.hook = {});
    }

    let invoker;
    const oldHook = def[hookKey];
}