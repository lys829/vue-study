import {
    remove,
    isObject,
    parsePath,
    // _Set as Set, 可用原生Set
    handleError
} from '../util/index'

import {queueWatcher} from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

let uid = 0;

export default class Watch {
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
            this.user = !!options.user;
        } else {
            this.deep = this.user = this.computed = this.sync = false;
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
            // watch属性监听
            this.getter = parsePath(expOrFn);
            
        }

        if(this.computed) {
            this.value = undefined;
            this.dep = new Dep('computed');
        } else {
            /**
             * 1. 赋值value
             * 2. watcher添加到依赖对象的subs列表
             */
            this.value = this.get();  
        }
    }

    /**
     * 1.computed第一次求值和依赖的值改变时触发
     * 2.data 两种情况: 初始化时触发, 改变data的属性时触发
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
        if(this.computed) {
            // 计算属性有两种模式: lazy和activated
            // 初始化默认是lazy,当只是一个订阅者依赖时才会被激活,这个订阅者通常是另一个计算属性或组件的render函数中
            if(this.dep.subs.length === 0) {
                // 在lazy模式下, 通过dirty来实现只要在必要的时候才重新计算值
                //当访问计算属性时, 是通过this.evaluate()方法来计算
                
                // 当依赖属性改变时,设置this.dirty为true,下次访问computed属性时,会重新计算
                this.dirty = true;
            } else {
                // activated模式下, 会主动计算, 当然只会在值发生了真正改变的时候才通知订阅者
                this.getAndInvoke(()=> {
                    // TODO: 暂不知作用
                    this.dep.notify();
                })
            }
        } else {
            console.log('加入任务队列');
            queueWatcher(this)
        }
    }

    // 调度任务中用到的接口
    run() {
        if(this.active) {
            console.log('%c 从任务队列里面调用', 'color: green');
            this.getAndInvoke(this.cb);
        }
    }

    getAndInvoke(cb) {
        const value = this.get();
        console.log('running watcher value >>', this.computed, value, this.value);
        /**
         * 1. 当computed属性(b)依赖的值(a)改变时, 再次求值时, 会触发条件value !== this.value
         */
        if(value !== this.value || isObject(value) || this.deep) { //this.deep暂不考虑
            //设置新的值
            const oldValue = this.value;
            this.value = value;
            this.dirty = false;
            
            if(this.user) {
                try {
                    cb.call(this.vm, value, oldValue);
                } catch (e) {
                    //TODO:error处理
                }
            } else {
                cb.call(this.vm, value, oldValue);
            }
        }
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
     * 
     */
    depend() {
        if(this.dep && Dep.target) {
            this.dep.depend();
        }
    }

    /**
     * 移除依赖对象的订阅列表
     */
    teardown() {
        if(this.active) {
            //TODO: destroyed

            let i = this.deps.length;
            while(i--) {
                this.deps[i].removeSub(this);
            }
            this.active = false;
        }
    }
}