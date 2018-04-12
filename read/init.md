## `new Vue()`执行流程

### _init方法

```
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