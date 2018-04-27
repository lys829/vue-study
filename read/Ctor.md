## Vue创建过程

4. Vue挂载compile函数,并且重写$mount方法 `entry-runtime-with-compipler.js`

###  创建Vue构造函数 `instance/index.js`
* 声明`Vue`构造函数, 分别执行 `initMixin`,`stateMixin`,`eventsMixin`,`lifecycleMixin`,`renderMixin`,为`Vue`构造函数绑定属性和方法
```
//initMixin(Vue)
Vue.prototype._init = function(options?:Object);

//stateMixin(Vue)
Vue.prototype.$data
Vue.prototype.$props
Vue.prototype.$set = (target: Array<any> | Object, key: any, val: any)=> {}
Vue.prototype.$delete = (target: Array<any> | Object, key: any)=> {}
Vue.prototype.$watch = (expOrFn: string | Function, cb: any, options?: Object)=> {}

//eventsMixin(Vue)
Vue.prototype.$on = (event: string | Array<string>, fn: Function)=> {}
Vue.prototype.$once = (event: string, fn: Function)=> {}
Vue.prototype.$off = (event?: string | Array<string>, fn?: Function)=> {}
Vue.prototype.$emit = (event: string)=> {}

//lifecycleMixin(Vue)
Vue.prototype._update = (vnode: VNode, hydrating?: boolean)=> {}
Vue.prototype.$forceUpdate = ()=> {}
Vue.prototype.$destroy = ()=> {}

renderMixin(Vue)
//在Vue.prototype绑定helpers

Vue.prototype.$nextTick = (fn: Function)=> {}
Vue.prototype._render = ()=> {}
```

### 在Vue构造函数上挂载全局API  `core/index.js`
* 全局API,　服务器渲染相关API(暂不关注), FunctionalRenderContext(暂不关注)，版本信息
* 主要是静态方法和静态属性
``` javascript
//初始化config,只读对象
Vue.config

// 不作为public api
Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
}

Vue.set
Vue.delete
Vue.nextTick
Vue.options = {
    components: {
        KeepAlive
    },
    directives: {},
    filters: {},
    _base: Vue
}
Vue.use = (plugin: Function | Object)=> {}
Vue.mixin = (mixin: Object)=> {}
Vue.extend = (extendOptions: Object)=> {}

Vue.component = (){}
Vue.directive = (){}
Vue.filter = (){}

Vue.version
```

### 针对web平台继续完善构造函数 `runtime/index.js` 
1. 增加Vue.config属性
2. 针对web平台安装指令和组件
3. 定义 `__patch__` 和 `$mount` 方法
``` javascript
Vue.config = {
    mustUseProp,
    isReservedTag,
    isReservedAttr,
    getTagNamespace,
    isUnknownElement
}

Vue.options = {
    components: {
        KeepAlive,
        Transition,
        TransitionGroup,
    },
    directives: {
        show,
        model
    },
    filters: {},
    _base: Vue
}

Vue.prototype.__patch
Vue.prototype.$mount
```


### 重写Vue`$mount`方法　`entry-runtime-with-compipler.js`
``` javascript
Vue.compile
Vue.options = {
    components: {
        KeepAlive,
        Transition,
        TransitionGroup,
    },
    directives: {
        show,
        model
    },
    filters: {},
    _base: Vue,
    render: ()=> {},
    staticRenderFns: ()=> {}
}
```






