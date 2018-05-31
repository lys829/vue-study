### 宏任务(macrotask)

setTimeout setInterval setImmediate MessageChannel postMessage

### 微任务(microtask)

promise MutationObserver

#### 任务以及渲染执行

macrotask -> microtask -> 渲染 -> macrotask -> microtask -> 渲染

### Vue.js实现说明
* Vue.js在下一个微任务和宏任务才更新DOM
* DOM事件默认会包裹一层函数将数据更新任务推入macrotask队列


```
const vm = new Vue({
        el: el,
        data: {
            counter: 0,
            visible: false
        },
        template: `<div @click="handle">{{counter}}</div>`,
        methods: {
            handle() {
                console.log('click callback')
                this.counter += 1
            }
        }
    })
```
### 解析
触发handle方法后, 会标记`useMacroTask`为true, 此时执行`this.counter+=1`,
会触发watcher的update方法,执行nextTick时，由于`useMacroTask`被标记为true,此时watcher的`run`方法
会在macroTask队列中执行

### 不适用withMacroTask封装引起的bug
```
const vm = new Vue({
        el: el,
        data: {
            expand: true,
            countA: 0,
            countB: 0,
        },
        template: `<header>
            <div class="A" v-if="expand"><i @click="test1">Expand is True</i></div>
            <div class="B" v-if="!expand" @click="test2"><i>Expand is False</i></div>
            <p>
                countA: {{countA}}
              </p>
              <p>
                countB: {{countB}}
              </p>
        </header>`,
        methods: {
            test1() {
                this.expand = false;
                this.countA++;
            },
            test2() {
                this.expand = true;
                this.countB++
            }
        }
    })
```

触发test1 -> 改变expand与countA -> watcher执行update -> 此时A(class为A)节点消失, B出现(class为B), 当patchVnode时, A和B为相同Vnode, 所以真实节点依然为A
-> 事件冒泡到A节点 -> 执行对应的test2

原文:
>
* The inner click event on <i> fires, triggering a 1st update on nextTick (microtask)
* The microtask is processed before the event bubbles to the outer div. During the update, a click listener is added to the outer div.
* Because the DOM structure is the same, both the outer div and the inner element are reused.
* The event finally reaches outer div, triggers the listener added by the 1st update, in turn triggering a 2nd update.
[](https://github.com/vuejs/vue/issues/6566)

