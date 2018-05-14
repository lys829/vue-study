
export default class VNode {
    constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
        this.tag = tag;
        this.data = data; //data 属性包含了最后渲染成真实dom节点后，节点上的class,attribute,style以及绑定的事件
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.ns = undefined;
        this.context = context;
        this.fnContext = undefined;
        this.fnOptions = undefined;
        this.fnScopeId = undefined;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
        this.componentInstance = undefined;
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false;
        this.isRootInsert = true;
        this.isComment = false;
        this.isCloned = false;
        this.isOnce = false;
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined;
        this.isAsyncPlaceholder = false;
    }
}

export const createEmptyVNode = (text='')=> {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
}

export function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val));
}