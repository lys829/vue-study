import {
    remove,
    isObject,
    parsePath,
    // _Set as Set, 可用原生Set
    handleError
} from '../util/index'

import Dep, { pushTarget, popTarget } from './dep'

let uid = 0;

export default class watch {
    constructor(vm, expOrFn, cb, options, isRenderWatcher) {
        this.vm = vm; 
        if(isRenderWatcher) {
            // 如果是是挂载节点是绑定的watcher,则将该watcher绑定到vm的_watcher属性上
            vm._watcher = this;
        }
        //收集watcher
        vm._watchers.push(this);
        if(options) {
            this.computed = !!options.computed;
        }

        //TODO: 完善
        this.cb = cb;
        this.id = ++uid;
        this.active = true;
        //针对计算属性的watcher,如果为false，直接返回this.value,避免再次调用this.get()
        this.dirty = this.computed; 
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();
        this.expression = '';
        
        if(typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            
        }

        if(this.computed) {
            this.value = undefined;
            this.dep = new Dep();
        } else {
            this.value = this.get();            
        }
    }

    get() {
        pushTarget(this);
        let value;
        const vm = this.vm;
        try {
            value = this.getter.call(vm, vm);
        } catch(e) {
            console.error(e);
        } finally {
            popTarget();
            this.cleanupDeps();
        }
        return value;
    }

    /**
     * 添加一个依赖关系到newDeps中
     * 添加watch到依赖对象的订阅列表
     * @param {Dep} dep 
     */
    addDep(dep) {
        const id = dep.id;
        if(!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if(!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    }

    cleanupDeps() {
        let i = this.deps.length;
        while(i--) { 
            const dep = this.deps[i];
            if(!this.newDepIds.has(dep.id)) {
                dep.removeSub(this);
            }
        }
        let tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;
    }

    update() {
        
    }

    /**
     * 此求值方法值针对计算属性
     */
    evaluate() {
        if(this.dirty) {
            this.value = this.get();
            this.dirty = false;
        }
        return this.value;
    }

    /**
     * 此方法值针对计算属性
     */
    depend() {
        if(this.dep && Dep.target) {
            this.dep.depend();
        }
    }


}