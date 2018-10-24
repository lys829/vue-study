## Vue.component(id, options)

``` javascript
Vue.component('button-counter', {
        props: ['test'],
        data: function () {
            return {
                count: 0
            }
        },
        template: '<button v-on:click="count++">You clicked me {{ count }} times {{test}}.</button>'
    });

    const vm = new Vue({
        el: el,
        data: {
            a: 1
        },
        template: '<div><button-counter :test="a"></button-counter></div>'
    });
```

### 组件创建
1. Vue.extend(id, options), 返回一个VueComponent, 该component注册在全局

2. vm的render函数为`with(this){return _c('div',[_c('button-counter')],1)}`,　返回一个根vnode,
同时会调用`createComponent`函数并返回一个componentVnode(为vm对应的vnode的子节点),
同时该函数会安装组件对应钩子(componentVNodeHooks)
    * 说明: `_c('button-counter')`表达式中, 'button-counter'已经作为组件名注册到全局
    (参考global-api/assets.js中`initAssetRegisters`函数)


3. patch vm对应的vnode以及根节点, 并且找到vm的vnode的子节点, 由于子节点为componentVnode, 会调用
`createComponent`, 此时会触发componentVnode绑定的组件钩子`init`

4. 执行组件钩子`init`, 实例化子组件(参考:`createComponentInstanceForVnode`),
并绑定到componentVnode的`componentInstance`属性

5. 在DOM中插入子组件对应的子节点

### props传递
1. 改变vm的属性`a`,会触发vm对应的`render`函数重新渲染, 生成新的vnode
2. patch vnode, 调用vnode上绑定的钩子函数`prepatch`(参考函数`patchVnode`中i.prepatch)
    * `prepatch`存在create-component.js中定义的`componentVNodeHooks`
3. `updateChildComponent`(lifecycle)更新组件, propsData为中保存的为改变后的值
    * propsData参看`extractPropsFromVNodeData`(create-component.js)函数