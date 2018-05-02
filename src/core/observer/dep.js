import Watch from './watcher'
import { remove } from '../util/index'

let uid = 0;

export default class Dep {
    constructor() {
        this.id = uid++;
        this.subs = [];
    }

    addSub(sub) {
        console.log('add sub id: ', this.id, sub)
        this.subs.push(sub);
    }

    removeSub(sub) {
        remove(this.subs, sub);
    }

    depend() {
        if(Dep.target) {
            //watcher收集完成后,再调用addSub
            Dep.target.addDep(this);
        }
    }

    notify() {
        const subs = this.subs.slice();
        for(let i = 0, l = subs.length; i < l; i++) {
            console.log('开始更新(subs)')
            subs[i].update();
        }
    }
}

Dep.target = null;
const targetStack = []

/**
 * @param {Watcher} _target?
 */
export function pushTarget(_target) {
    if(Dep.target) {
        console.log('已经存在 Dep.target', Dep.target)
        targetStack.push(Dep.target);
    }
    Dep.target = _target;
}
export function popTarget() {
    Dep.target = targetStack.pop();
}