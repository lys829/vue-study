
import { cached, isUndef, isPlainObject } from 'shared/util'

const normalizeEvent = cached((name)=> {
    const passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    const once = name.charAt(0) === '~' // Prefixed last, checked first
    name = once ? name.slice(1) : name;
    const capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
        name,
        once,
        capture,
        passive
    }
});

export function updateListeners(on, oldOn, add, remove, vm) {
    let name, def, cur, old, event;
    for(name in on) {
        def = cur = on[name];
        old = oldOn[name];
        event = normalizeEvent(name);
        if(isUndef(old)) {
            add(event.name, cur, event.once, event.capture, event.passive)
        }
    }

    //移除事件
    for(name in oldOn) {
        if(isUndef(on[name])) {
            event = normalizeEvent(name);
            remove(event.name, oldOn[name], event.capture);
        }
    }
}