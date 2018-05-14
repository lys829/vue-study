import { toNumber, toString, looseEqual, looseIndexOf } from 'shared/util'
import { createTextVNode, createEmptyVNode} from 'core/vdom/vnode'
import { renderList } from './render-list'

export function installRenderHelpers(target) {
    target._s = toString;
    target._v = createTextVNode;
    target._l = renderList;
    target._e = createEmptyVNode
}