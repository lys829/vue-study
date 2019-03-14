import {
    remove,
    isObject,
    parsePath,
    // _Set as Set, 可用原生Set
    handleError
} from '../util/index'

import { traverse } from './traverse'
import {queueWatcher} from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

let uid = 0;

export default class Watch {
    constructor(vm, expOrFn, cb, options, isRenderWatcher) {
        this.vm = vm; 
        if(isRenderWatcher) {
            // 渲染函数的观察者,则将该watcher绑定到vm的_watcher属性上
            vm._watcher = this;
        }
        //收集watcher
        vm._watchers.push(this);
        if(options) {
            this.deep = !!options.deep; //当前观察者实例对象是否是深度观测
            this.user = !!options.user; //标识当前观察者实例对象是 开发者定义的 还是 内部定义的
            this.lazy = !!options.lazy;
            this.sync = !!options.sync; //告诉观察者当数据变化时是否同步求值并执行回调
        } else {
            this.deep = this.user = this.lazy = this.sync = false;
        }

        this.cb = cb;
        this.id = ++uid;
        this.active = true;
        //针对计算属性的watcher,如果为false，直接返回this.value,避免再次调用this.get()
        this.dirty = this.lazy;
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();
        this.expression = expOrFn.toString();
   
        if(typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            // watch属性监听
            this.getter = parsePath(expOrFn);
            
        }
        this.value = this.lazy ? undefined : this.get();
    }

    /**
     * 1.computed第一次求值和依赖的值改变时触发
     * 2.初始化时触发  改变data的属性时触发
     */
    get() {
        pushTarget(this);
        let value;
        const vm = this.vm;
        try {
            value = this.getter.call(vm, vm);
        } catch(e) {
            console.error(e);
        } finally {
            if (this.deep) {
                traverse(value)
            }
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
        // 在某一次求值过程中, 触发了多次get拦截器,从而观察者被收集多次
        if(!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            // 避免值改变时(数据变化)搜集重复依赖
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
        if(this.lazy) {
            this.dirty = true;
        } else if (this.sync) {
            this.run()
        } else {
            console.log('加入任务队列');
            queueWatcher(this)
        }
    }

    // 调度任务中用到的接口
    run() {
        if(this.active) {
            const value = this.get();
            if(
                value !== this.value ||
                    isObject(value) ||
                    this.deep
            ) {
                //set new value
                const oldValue = this.value;
                this.value = value;
                if(this.user) {
                    try {
                        this.cb.call(this.vm, value, oldValue)
                    }catch (e) {

                    }
                } else {
                    this.cb.call(this.vm, value, oldValue);
                }
            }
        }
    }

    /**
     * 此求值方法值针对计算属性
     */
    evaluate() {
        this.value = this.get();
        this.dirty = false;
    }

    /**
     * 此方法值针对计算属性 
     * 
     */
    depend() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend();
        }
    }


    /**
     * Remove self from all dependencies' subscriber list.
     */
    teardown () {
        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this)
            }
            let i = this.deps.length
            while (i--) {
                this.deps[i].removeSub(this)
            }
            this.active = false
        }
    }
}