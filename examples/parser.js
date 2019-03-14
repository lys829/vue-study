import Vue from 'vue'

window.__WEEX__ =false

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            val: 'test',
            color: '#f00',
            list: [{val: 1}, {val: 2}]
        },
        template: '<div :style="{color: color}"><input type="text" v-model="val"><span v-for="(item, index) in list">{{item.val}}</span></div>'
    });


}


/**
 * src/compiler/parser/index.js
 *
 * start钩子
 *      1.start 钩子函数是当解析 html 字符串遇到开始标签时被调用的
 *
 *      2.在 start 钩子函数中会调用前置处理函数，这些前置处理函数都放在 preTransforms 数组中，
 *      这么做的目的是为不同平台提供对应平台下的解析工作
 *
 *      3.前置处理函数执行完之后会调用一系列 process* 函数继续对元素描述对象进行加工
 *
 *      4.通过判断 root 是否存在来判断当前解析的元素是否为根元素
 *
 *      5.slot 标签和 template 标签不能作为根元素，并且根元素不能使用 v-for 指令
 *
 *      6.可以定义多个根元素，但必须使用 v-if、v-else-if 以及 v-else 保证有且仅有一个根元素被渲染
 *
 *      7.构建 AST 并建立父子级关系是在 start 钩子函数中完成的，每当遇到非一元标签，
 *      会把它存到 currentParent 变量中，当解析该标签的子节点时通过访问 currentParent 变量获取父级元素
 *
 *      8.如果一个元素使用了 v-else-if 或 v-else 指令，则该元素不会作为子节点，
 *      而是会被添加到相符的使用了 v-if 指令的元素描述对象的 ifConditions 数组中
 *
 *      9.如果一个元素使用了 slot-scope 特性，则该元素也不会作为子节点，它会被添加到父级元素描述对象的 scopedSlots 属性中
 *
 *      10.对于没有使用条件指令或 slot-scope 特性的元素，会正常建立父子级关系
 *
 */

