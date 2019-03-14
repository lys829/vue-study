/* @flow */

import he from 'he'
import {parseHTML} from './html-parser'
import {parseText} from './text-parser'
import {parseFilters} from './filter-parser'
import {genAssignmentCode} from '../directives/model'
import {extend, cached, no, camelize} from 'shared/util'
import {isIE, isEdge, isServerRendering} from 'core/util/env'

import {
    addProp,
    addAttr,
    baseWarn,
    addHandler,
    addDirective,
    getBindingAttr,
    getAndRemoveAttr,
    pluckModuleFunction
} from '../helpers'

export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:/

// 第一个分组([^]*?)匹配任意字符
export const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/
// 捕获上面捕获到的字符串
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
// 去掉(obj, index)左右括号
const stripParensRE = /^\(|\)$/g

const argRE = /:(.*)$/
export const bindRE = /^:|^v-bind:/
//匹配修饰符
const modifierRE = /\.[^.]+/g
// console.log(he.decode('&#x26;'))  // &#x26; -> '&'
const decodeHTMLCached = cached(he.decode)

// configurable state  平台化的选项变量
export let warn: any
let delimiters
let transforms
let preTransforms
let postTransforms
let platformIsPreTag
let platformMustUseProp
let platformGetTagNamespace

// type Attr = { name: string; value: string };

export function createASTElement(tag: string,
                                 attrs: Array<Attr>,
                                 parent: ASTElement | void): ASTElement {
    return {
        type     : 1,
        tag,
        attrsList: attrs,
        attrsMap : makeAttrsMap(attrs),
        parent,
        children : []
    }
}

/**
 * Convert HTML string to AST.
 */
export function parse(template: string,
                      options: CompilerOptions): ASTElement | void {
    warn = options.warn || baseWarn
    //使用约web平台的编译器选项初始化

    //pre 标签
    platformIsPreTag = options.isPreTag || no
    platformMustUseProp = options.mustUseProp || no
    platformGetTagNamespace = options.getTagNamespace || no

    //搜集transformNode, preTransformNode, postTransformNode函数
    // 其中postTransformNode为空
    transforms = pluckModuleFunction(options.modules, 'transformNode')
    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')
    postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')

    delimiters = options.delimiters
    const stack = []
    const preserveWhitespace = options.preserveWhitespace !== false
    let root
    let currentParent
    // 用来标识当前解析的标签是否在拥有 v-pre 的标签之内
    let inVPre = false
    // 当前正在解析的标签是否在 <pre></pre> 标签之内
    let inPre = false
    let warned = false

    function warnOnce(msg) {
        if (!warned) {
            warned = true
            warn(msg)
        }
    }

    function closeElement(element) {
        // check pre state
        if (element.pre) {
            inVPre = false
        }
        if (platformIsPreTag(element.tag)) {
            inPre = false
        }
        // apply post-transforms
        for (let i = 0; i < postTransforms.length; i++) {
            postTransforms[i](element, options)
        }
    }

    parseHTML(template, {
        warn,
        expectHTML                 : options.expectHTML,
        isUnaryTag                 : options.isUnaryTag,
        canBeLeftOpenTag           : options.canBeLeftOpenTag,
        shouldDecodeNewlines       : options.shouldDecodeNewlines,
        shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
        shouldKeepComment          : options.comments,
        start(tag, attrs, unary) {
            //v-for="obj of list"　=> attrs:　[{name: 'v-for', value: 'obj of list']
            // check namespace.
            // inherit parent ns if there is one
            // 只针对svg　math两个标签获取命名空间
            const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

            // handle IE svg bug
            /* istanbul ignore if */
            if (isIE && ns === 'svg') {
                attrs = guardIESVGBug(attrs)
            }
            //ASTElement 元素描述对象
            let element = createASTElement(tag, attrs, currentParent)
            if (ns) {
                element.ns = ns
            }

            if (isForbiddenTag(element) && !isServerRendering()) {
                element.forbidden = true
                process.env.NODE_ENV !== 'production' && warn(
                    'Templates should only be responsible for mapping the state to the ' +
                    'UI. Avoid placing tags with side-effects in your templates, such as ' +
                    `<${tag}>` + ', as they will not be parsed.'
                )
            }

            // apply pre-transforms
            // web端预处理使用了v-model 属性的 input 标签
            for (let i = 0; i < preTransforms.length; i++) {
                element = preTransforms[i](element, options) || element
            }

            if (!inVPre) {
                processPre(element)
                if (element.pre) {
                    //如果成立，续的所有解析工作都处于 v-pre 环境下
                    inVPre = true
                }
            }
            if (platformIsPreTag(element.tag)) {
                inPre = true
            }
            if (inVPre) {
                //跳过这个元素和它的子元素的编译过程
                //element添加attrs属性，结构与attrsList相同
                //attrs数组中的每个对象的value会经过JSON.stringify()处理
                processRawAttrs(element)
            } else if (!element.processed) { //input标签描述对象的processed为true
                // structural directives
                // element添加for, alias [, iterator1, iterator2]属性
                processFor(element)
                //标记if|else|elseif, 如果存在v-if，则设置ifConditions为数组,并且作为本身作为数组的第一个值
                processIf(element)
                //标记once为true
                processOnce(element)
                // element-scope stuff
                processElement(element, options)
            }

            function checkRootConstraints(el) {
                if (process.env.NODE_ENV !== 'production') {
                    if (el.tag === 'slot' || el.tag === 'template') {
                        warnOnce(
                            `Cannot use <${el.tag}> as component root element because it may ` +
                            'contain multiple nodes.'
                        )
                    }
                    if (el.attrsMap.hasOwnProperty('v-for')) {
                        warnOnce(
                            'Cannot use v-for on stateful component root element because ' +
                            'it renders multiple elements.'
                        )
                    }
                }
            }

            // tree management
            if (!root) {
                root = element
                checkRootConstraints(root)
            } else if (!stack.length) {
                //当stack被清空后依然还能运行到这说明存在多个root

                // allow root elements with v-if, v-else-if and v-else
                if (root.if && (element.elseif || element.else)) {
                    checkRootConstraints(element)
                    addIfCondition(root, {
                        exp  : element.elseif,
                        block: element
                    })
                } else if (process.env.NODE_ENV !== 'production') {
                    warnOnce(
                        `Component template should contain exactly one root element. ` +
                        `If you are using v-if on multiple elements, ` +
                        `use v-else-if to chain them instead.`
                    )
                }
            }
            if (currentParent && !element.forbidden) {
                if (element.elseif || element.else) {
                    //不会添加到父节点的子节点中，而是调价到使用了v-if指令描述对象ifConditions
                    // 命名 element.if -> processIf, element.elseif || element.else -> processIfConditions
                    processIfConditions(element, currentParent)
                } else if (element.slotScope) { // scoped slot
                    currentParent.plain = false
                    const name = element.slotTarget || '"default"'
                    ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
                } else {
                    currentParent.children.push(element)
                    element.parent = currentParent
                }
            }
            if (!unary) {
                currentParent = element
                stack.push(element)
            } else {
                closeElement(element)
            }
        },

        end() {
            // remove trailing whitespace
            const element = stack[stack.length - 1]
            const lastNode = element.children[element.children.length - 1]
            if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
                element.children.pop()
            }
            // pop stack
            stack.length -= 1
            currentParent = stack[stack.length - 1]
            closeElement(element)
        },

        chars(text: string) {
            if (!currentParent) {
                if (process.env.NODE_ENV !== 'production') {
                    if (text === template) {
                        warnOnce(
                            'Component template requires a root element, rather than just text.'
                        )
                    } else if ((text = text.trim())) {
                        warnOnce(
                            `text "${text}" outside root element will be ignored.`
                        )
                    }
                }
                return
            }
            // IE textarea placeholder bug
            /* istanbul ignore if */
            if (isIE &&
                currentParent.tag === 'textarea' &&
                currentParent.attrsMap.placeholder === text
            ) {
                return
            }
            const children = currentParent.children
            text = inPre || text.trim()
                ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
                // only preserve whitespace if its not right after a starting tag
                : preserveWhitespace && children.length ? ' ' : ''
            if (text) {
                let res
                if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
                    children.push({
                        type      : 2,
                        expression: res.expression,
                        tokens    : res.tokens, //weex使用
                        text
                    })
                } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
                    children.push({
                        type: 3,
                        text
                    })
                }
            }
        },
        comment(text) {
            currentParent.children.push({
                type     : 3,
                text,
                isComment: true
            })
        }
    })
    return root
}

function processPre(el) {
    if (getAndRemoveAttr(el, 'v-pre') != null) {
        el.pre = true
    }
}

function processRawAttrs(el) {
    const l = el.attrsList.length
    if (l) {
        const attrs = el.attrs = new Array(l)
        for (let i = 0; i < l; i++) {
            attrs[i] = {
                name : el.attrsList[i].name,
                value: JSON.stringify(el.attrsList[i].value)
            }
        }
    } else if (!el.pre) {
        // non root node in pre blocks with no attributes
        el.plain = true
    }
}

export function processElement(element: ASTElement, options: CompilerOptions) {
    //标记key
    processKey(element)

    // determine whether this is a plain element after
    // removing structural attributes
    // structural attributes为v-for、v-if/v-else-if/v-else、v-once
    element.plain = !element.key && !element.attrsList.length

    // 一个标签使用了 ref 属性
    // 签的元素描述对象会被添加 el.ref 属性，该属性为解析后生成的表达式字符串，与 el.key 类似
    // 该标签的元素描述对象会被添加 el.refInFor 属性，它是一个布尔值，用来标识当前元素的 ref 属性是否在 v-for 指令之内使用
    processRef(element)
    processSlot(element)
    processComponent(element)
    for (let i = 0; i < transforms.length; i++) {
        element = transforms[i](element, options) || element
    }
    processAttrs(element)
}

function processKey(el) {
    const exp = getBindingAttr(el, 'key')
    if (exp) {
        if (process.env.NODE_ENV !== 'production' && el.tag === 'template') {
            warn(`<template> cannot be keyed. Place the key on real elements instead.`)
        }
        el.key = exp
    }
}

function processRef(el) {
    const ref = getBindingAttr(el, 'ref')
    if (ref) {
        el.ref = ref
        el.refInFor = checkInFor(el)
    }
}

export function processFor(el: ASTElement) {
    let exp
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {
        const res = parseFor(exp)
        if (res) {
            extend(el, res)
        } else if (process.env.NODE_ENV !== 'production') {
            warn(
                `Invalid v-for expression: ${exp}`
            )
        }
    }
}
//
// type
// ForParseResult = {
// for: string;
// alias: string;
// iterator1 ? : string;
// iterator2 ? : string;
// }

/**
 *
 * @param exp '(item, index) in list'
 * @returns {
 *      for: 'list',
 *      alias: 'item',
 *      iterator1: 'index'
 * }
 */
export function parseFor(exp: string): ?ForParseResult {
    const inMatch = exp.match(forAliasRE)
    if (!inMatch) return
    const res = {}
    res.for = inMatch[2].trim()
    const alias = inMatch[1].trim().replace(stripParensRE, '')
    const iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
        res.alias = alias.replace(forIteratorRE, '')
        res.iterator1 = iteratorMatch[1].trim()
        if (iteratorMatch[2]) {
            //迭代对象时，对应的key
            res.iterator2 = iteratorMatch[2].trim()
        }
    } else {
        res.alias = alias
    }
    return res
}

function processIf(el) {
    const exp = getAndRemoveAttr(el, 'v-if')
    if (exp) {
        el.if = exp
        addIfCondition(el, {
            exp  : exp,
            block: el
        })
    } else {
        if (getAndRemoveAttr(el, 'v-else') != null) {
            el.else = true
        }
        const elseif = getAndRemoveAttr(el, 'v-else-if')
        if (elseif) {
            el.elseif = elseif
        }
    }
}

function processIfConditions(el, parent) {
    const prev = findPrevElement(parent.children)
    if (prev && prev.if) {
        addIfCondition(prev, {
            exp  : el.elseif,
            block: el
        })
    } else if (process.env.NODE_ENV !== 'production') {
        warn(
            `v-${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} ` +
            `used on element <${el.tag}> without corresponding v-if.`
        )
    }
}

function findPrevElement(children: Array<any>): ASTElement | void {
    let i = children.length
    while (i--) {
        if (children[i].type === 1) {
            return children[i]
        } else {
            if (process.env.NODE_ENV !== 'production' && children[i].text !== ' ') {
                warn(
                    `text "${children[i].text.trim()}" between v-if and v-else(-if) ` +
                    `will be ignored.`
                )
            }
            children.pop()
        }
    }
}

export function addIfCondition(el: ASTElement, condition: ASTIfCondition) {
    if (!el.ifConditions) {
        el.ifConditions = []
    }
    el.ifConditions.push(condition)
}

function processOnce(el) {
    const once = getAndRemoveAttr(el, 'v-once')
    if (once != null) {
        el.once = true
    }
}

function processSlot(el) {
    if (el.tag === 'slot') {
        el.slotName = getBindingAttr(el, 'name')
        if (process.env.NODE_ENV !== 'production' && el.key) {
            warn(
                `\`key\` does not work on <slot> because slots are abstract outlets ` +
                `and can possibly expand into multiple elements. ` +
                `Use the key on a wrapping element instead.`
            )
        }
    } else {
        let slotScope
        if (el.tag === 'template') {
            slotScope = getAndRemoveAttr(el, 'scope')
            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && slotScope) {
                warn(
                    `the "scope" attribute for scoped slots have been deprecated and ` +
                    `replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
                    `can also be used on plain elements in addition to <template> to ` +
                    `denote scoped slots.`,
                    true
                )
            }
            el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
        } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
                warn(
                    `Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
                    `(v-for takes higher priority). Use a wrapper <template> for the ` +
                    `scoped slot to make it clearer.`,
                    true
                )
            }
            el.slotScope = slotScope
        }
        const slotTarget = getBindingAttr(el, 'slot')
        if (slotTarget) {
            el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
            // preserve slot as an attribute for native shadow DOM compat
            // only for non-scoped slots.
            if (el.tag !== 'template' && !el.slotScope) {
                addAttr(el, 'slot', slotTarget)
            }
        }
    }
}

function processComponent(el) {
    let binding
    if ((binding = getBindingAttr(el, 'is'))) {
        el.component = binding
    }
    if (getAndRemoveAttr(el, 'inline-template') != null) {
        el.inlineTemplate = true
    }
}

function processAttrs(el) {
    const list = el.attrsList
    let i, l, name, rawName, value, modifiers, isProp
    for (i = 0, l = list.length; i < l; i++) {
        name = rawName = list[i].name
        value = list[i].value
        if (dirRE.test(name)) {
            // mark element as dynamic
            el.hasBindings = true
            // modifiers
            // 'v-bind:some-prop.sync' -> {sync: true}
            modifiers = parseModifiers(name)
            if (modifiers) {
                name = name.replace(modifierRE, '')
            }
            if (bindRE.test(name)) { // v-bind
                name = name.replace(bindRE, '')
                value = parseFilters(value)
                isProp = false
                if (modifiers) {
                    if (modifiers.prop) {
                        isProp = true
                        name = camelize(name)
                        if (name === 'innerHtml') name = 'innerHTML'
                    }
                    if (modifiers.camel) {
                        name = camelize(name)
                    }
                    if (modifiers.sync) {
                        // :some-prop.sync <==等价于==> :some-prop + @update:someProp
                        //第三个参数为回调
                        addHandler(
                            el,
                            `update:${camelize(name)}`,
                            genAssignmentCode(value, `$event`)
                        )
                    }
                }

                //isProp为true 该绑定的属性是原生DOM对象的属性
                if (isProp || (
                        !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
                    )) {
                    addProp(el, name, value)
                } else {
                    addAttr(el, name, value)
                }
            } else if (onRE.test(name)) { // v-on
                name = name.replace(onRE, '')
                addHandler(el, name, value, modifiers, false, warn)
            } else { // normal directives
                // v-text, v-html, v-show, v-cloak, v-model,还包括自定义指令
                name = name.replace(dirRE, '')
                // parse arg
                const argMatch = name.match(argRE)
                const arg = argMatch && argMatch[1]
                if (arg) {
                    name = name.slice(0, -(arg.length + 1))
                }
                //v-custom:arg.modif="myMethod"
                //addDirective(el, 'custom', 'v-custom:arg.modif', 'myMethod', 'arg', { modif: true })
                addDirective(el, name, rawName, value, arg, modifiers)
                if (process.env.NODE_ENV !== 'production' && name === 'model') {
                    checkForAliasModel(el, value)
                }
            }
        } else {
            // literal attribute
            if (process.env.NODE_ENV !== 'production') {
                // 解析字面量表达式
                const res = parseText(value, delimiters)
                if (res) {
                    warn(
                        `${name}="${value}": ` +
                        'Interpolation inside attributes has been removed. ' +
                        'Use v-bind or the colon shorthand instead. For example, ' +
                        'instead of <div id="{{ val }}">, use <div :id="val">.'
                    )
                }
            }
            addAttr(el, name, JSON.stringify(value))
            // #6887 firefox doesn't update muted state if set via attribute
            // even immediately after element creation
            if (!el.component &&
                name === 'muted' &&
                platformMustUseProp(el.tag, el.attrsMap.type, name)) {
                addProp(el, name, 'true')
            }
        }
    }
}

function checkInFor(el: ASTElement): boolean {
    let parent = el
    while (parent) {
        if (parent.for !== undefined) {
            return true
        }
        parent = parent.parent
    }
    return false
}

function parseModifiers(name: string): Object | void {
    const match = name.match(modifierRE)
    if (match) {
        const ret = {}
        match.forEach(m => {
            ret[m.slice(1)] = true
        })
        return ret
    }
}

function makeAttrsMap(attrs: Array<Object>): Object {
    const map = {}
    for (let i = 0, l = attrs.length; i < l; i++) {
        if (
            process.env.NODE_ENV !== 'production' &&
            map[attrs[i].name] && !isIE && !isEdge
        ) {
            warn('duplicate attribute: ' + attrs[i].name)
        }
        map[attrs[i].name] = attrs[i].value
    }
    return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag(el): boolean {
    return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag(el): boolean {
    return (
        el.tag === 'style' ||
        (el.tag === 'script' && (
            !el.attrsMap.type ||
            el.attrsMap.type === 'text/javascript'
        ))
    )
}

const ieNSBug = /^xmlns:NS\d+/
const ieNSPrefix = /^NS\d+:/

/* istanbul ignore next */
function guardIESVGBug(attrs) {
    const res = []
    for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]
        if (!ieNSBug.test(attr.name)) {
            attr.name = attr.name.replace(ieNSPrefix, '')
            res.push(attr)
        }
    }
    return res
}

function checkForAliasModel(el, value) {
    let _el = el
    while (_el) {
        if (_el.for && _el.alias === value) {
            warn(
                `<${el.tag} v-model="${value}">: ` +
                `You are binding v-model directly to a v-for iteration alias. ` +
                `This will not be able to modify the v-for source array because ` +
                `writing to the alias is like modifying a function local variable. ` +
                `Consider using an array of objects and use v-model on an object property instead.`
            )
        }
        _el = _el.parent
    }
}
