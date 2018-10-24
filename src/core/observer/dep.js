import Watch from './watcher'
import { remove } from '../util/index'

let uid = 0;

export default class Dep {
    constructor(name) {
        //临时加name,方便调试
        this.name = name;
        
        this.id = uid++;
        this.subs = [];
    }

    addSub(sub) {
        console.log(`dep(${this.name}) add sub id: ${this.id}`, sub)
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
        console.log('%c 开始更新, 监听者个数: '+subs.length, 'color: red')     
        for(let i = 0, l = subs.length; i < l; i++) {
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
        // console.log('已经存在 Dep.target', Dep.target, '参数：', _target)
        targetStack.push(Dep.target);
    }
    Dep.target = _target;
}
export function popTarget() {
    Dep.target = targetStack.pop();
}