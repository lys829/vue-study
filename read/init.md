## `new Vue()`执行流程

### _init方法

``` javascript
//执行_init后，实例绑定的属性
vm._uid
vm.isVue
vm.$options

//生产环境和开发环境有差别
vm._renderProxy

vm._self

//_init中执行的函数绑定的属性
//initLifecycle

```

### `mergeOptions`合并参数选项
* `mergeOptions`传入的参数依次为 Vue构造函数的options(不存在父级的情况下),用户是传入的options,以及实例vm


### 实例对象this绑定情况
``` javascript
// Vue.prototype._init中添加的属性
this._uid
this.isVue
this.options = {
    components,
    directives,
    filters,
    _base,
    render: ()=> {},
    staticRenderFns: ()=> {},
    el,
    data: mergedInstanceDataFn,
}
this._renderProxy = this
this._self = this

//initLifecycle添加的属性
vm.$parent = null;
vm.$root = parent ? parent.$root : vm;

vm.$children = [];
vm.$refs = {};

vm._watcher = null
vm._inactive = null
vm._directInactive = false
vm._isMounted = false
vm._isDestroyed = false
vm._isBeingDestroyed = false

// mountComponent中添加的属性
vm.$el

//initRender中添加的属性
vm._vnode = null
vm._staticTress = null

vm._c
vm.$createElement

//initState中添加的属性
vm._watchers = []

//initComputed中添加的属性
vm._computedWatchers

```

### initState 
* options.data
* initComputed

    作用: 获取getter -> 绑定watcher -> 将计算对象的属性代理到vm,同时定义属性的getter和setter(defineComputed)
    意义: 用户访问vm定义的属性(attr),会触发getter,执行computedGetter

    说明: computedGetter执行时,其中的watcher是通过evaluate方法触发求值(this.get),从而收集watcher(pushTarget)


#### initData
* `proxy(vm, '_data', key)`将访问vm的属性代理到this._data上
* observe将`vm.options.data`转为可观察对象
