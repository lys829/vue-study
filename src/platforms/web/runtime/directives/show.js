
export default {
    bind(el, {value}, vnode) {
        //TODO: transition
        // vnode = locateNode(node);
        const originalDisplay = el.__vOriginalDisplay = 
            el.style.display === 'none' ? '' : el.style.display;
        el.style.display = value ? originalDisplay : 'none';
    },

    update(el, {value, oldValue}, vnode) {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
    },

    unbind(el, binding, vnode, oldVnode, isDestroy) {
        if(!isDestroy) {
            el.style.display = el.__vOriginalDisplay;
        }
    }
}