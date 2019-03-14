/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

import {makeMap, no} from 'shared/util'
import {isNonPhrasingTag} from 'web/compiler/util'

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being pased as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

let IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function (m, g) {
    IS_REGEX_CAPTURING_BROKEN = g === ''
})

// Special Elements (can contain anything)
export const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

const decodingMap = {
    '&lt;'  : '<',
    '&gt;'  : '>',
    '&quot;': '"',
    '&amp;' : '&',
    '&#10;' : '\n',
    '&#9;'  : '\t'
}
const encodedAttr = /&(?:lt|gt|quot|amp);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
//是否应该忽略元素内容的第一个换行符
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

//将 html 实体转为对应的字符
function decodeAttr(value, shouldDecodeNewlines) {
    const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
    return value.replace(re, match => decodingMap[match])
}

export function parseHTML(html, options) {
    const stack = []
    const expectHTML = options.expectHTML
    const isUnaryTag = options.isUnaryTag || no
    //检测一个标签是否是可以省略闭合标签的非一元标签
    const canBeLeftOpenTag = options.canBeLeftOpenTag || no
    let index = 0
    //last 存储剩余还未 parse 的 html 字符串, lastTag存储stack顶的标签
    let last, lastTag

    while (html) {　//html为''解析完成
        last = html

        // Make sure we're not in a plaintext content element like script/style
        if (!lastTag || !isPlainTextElement(lastTag)) {
            let textEnd = html.indexOf('<')
            if (textEnd === 0) {
                /**
                 * 可能是注释节点：<!-- -->
                 * 可能是条件注释节点：<![ ]>
                 * 可能是 doctype：<!DOCTYPE >
                 * 可能是结束标签：</xxx>
                 * 可能是开始标签：<xxx>
                 * 可能只是一个单纯的字符串：<abcdefg
                 */
                // Comment:
                if (comment.test(html)) {
                    const commentEnd = html.indexOf('-->')

                    if (commentEnd >= 0) {
                        // 确定是注释节点
                        if (options.shouldKeepComment) {
                            // <!-- this is a comment --> 通过substring窃取为' this is a comment '
                            options.comment(html.substring(4, commentEnd))
                        }
                        // 将parse部分的字符剔除, index索引更新
                        advance(commentEnd + 3)
                        continue
                    }
                }

                // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                if (conditionalComment.test(html)) {
                    const conditionalEnd = html.indexOf(']>')

                    if (conditionalEnd >= 0) {
                        advance(conditionalEnd + 2)
                        continue
                    }
                }

                // Doctype:
                const doctypeMatch = html.match(doctype)
                if (doctypeMatch) {
                    advance(doctypeMatch[0].length)
                    continue
                }

                // End tag:
                const endTagMatch = html.match(endTag)
                if (endTagMatch) {
                    const curIndex = index
                    advance(endTagMatch[0].length)
                    // 标签名 结束标签在 html 字符串中起始和结束的位置
                    parseEndTag(endTagMatch[1], curIndex, index)
                    continue
                }

                // Start tag:
                const startTagMatch = parseStartTag()
                if (startTagMatch) {
                    handleStartTag(startTagMatch)
                    if (shouldIgnoreFirstNewline(lastTag, html)) {
                        advance(1)
                    }
                    continue
                }
            }

            let text, rest, next
            // 第一个字符是 < 但没有成功匹配标签(如'< 2')，或第一个字符不是 < 的字符串
            if (textEnd >= 0) {
                rest = html.slice(textEnd)
                //匹配到 < 则不断更新textEnd,知道匹配到标签的<
                while (
                    !endTag.test(rest) &&
                    !startTagOpen.test(rest) &&
                    !comment.test(rest) &&
                    !conditionalComment.test(rest)
                    ) {
                    // < in plain text, be forgiving and treat it as text
                    next = rest.indexOf('<', 1)
                    if (next < 0) break
                    textEnd += next
                    rest = html.slice(textEnd)
                }
                text = html.substring(0, textEnd)
                advance(textEnd)
            }

            if (textEnd < 0) {
                text = html
                html = ''
            }

            if (options.chars && text) {
                options.chars(text)
            }
        } else {
            // 保存纯文本标签闭合标签的字符长度
            let endTagLength = 0
            const stackedTag = lastTag.toLowerCase()
            // 匹配纯文本标签的内容以及结束标签的
            const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
            // aaaabbbb</textarea>ddd => ddd 此时rest = ddd
            const rest = html.replace(reStackedTag, function (all, text, endTag) {
                endTagLength = endTag.length
                if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
                    text = text
                        .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
                        .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
                }
                if (shouldIgnoreFirstNewline(stackedTag, text)) {
                    //忽略 <pre> 标签和 <textarea> 标签的内容中的第一个换行符
                    text = text.slice(1)
                }
                if (options.chars) {
                    options.chars(text)
                }
                return ''
            })
            index += html.length - rest.length
            html = rest
            parseEndTag(stackedTag, index - endTagLength, index)
        }

        if (html === last) {
            //把 html 字符串作为纯文本对待
            options.chars && options.chars(html)
            if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
                options.warn(`Mal-formatted tag at end of template: "${html}"`)
            }
            break
        }
    }

    // Clean up any remaining tags
    parseEndTag()

    function advance(n) {
        index += n
        html = html.substring(n)
    }

    /**
     * <div v-if="isSucceed" v-for="v in map"></div>
     * return: {tagName: 'div',
          attrs: [　[' v-if="isSucceed"','v-if','=','isSucceed',undefined,undefined],
            [' v-for="v in map"','v-for','=','v in map',undefined,undefined]　],
          start: index1,
          end: index2,
          unarySlash: ''}
     */
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1], //标签名称
                attrs  : [],    //匹配到的属性
                start  : index  //在整个html中的相对位置
            }
            advance(start[0].length)
            let end, attr
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push(attr)
            }
            if (end) {
                match.unarySlash = end[1]
                advance(end[0].length)
                match.end = index
                return match
            }
        }
    }
    //处理 parseStartTag 的结果, 过程为: 处理attributes, stack更新, 调用options.start
    function handleStartTag(match) {
        const tagName = match.tagName
        const unarySlash = match.unarySlash

        if (expectHTML) {
            //上一次标签是p标签时,正在解析的开始标签必须不能是 段落式内容(Phrasing content) 模型
            if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                // 强行插入了 </p> 标签
                parseEndTag(lastTag)
            }
            if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
                parseEndTag(tagName)
            }
        }
        //unarySlash是通过反斜杠"/" 去判断是否为一元标签, 如<my-component />非标准中定义的一元标签
        const unary = isUnaryTag(tagName) || !!unarySlash

        const l = match.attrs.length
        const attrs = new Array(l)
        // <div v-if="visible">12</div> -> [{name: 'v-if', value: visible}]
        for (let i = 0; i < l; i++) {
            const args = match.attrs[i]
            // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
            if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                if (args[3] === '') {
                    delete args[3]
                }
                if (args[4] === '') {
                    delete args[4]
                }
                if (args[5] === '') {
                    delete args[5]
                }
            }
            const value = args[3] || args[4] || args[5] || ''
            const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
                ? options.shouldDecodeNewlinesForHref
                : options.shouldDecodeNewlines
            attrs[i] = {
                name : args[1],
                value: decodeAttr(value, shouldDecodeNewlines)
            }
        }

        if (!unary) {
            stack.push({tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs})
            lastTag = tagName
        }

        if (options.start) {
            options.start(tagName, attrs, unary, match.start, match.end)
        }
    }

    //作用: 检测是否缺少闭合标签  处理 stack 栈中剩余的标签  解析 </br> 与 </p> 标签，与浏览器的行为相同
    function parseEndTag(tagName, start, end) {
        let pos, lowerCasedTagName
        if (start == null) start = index
        if (end == null) end = index

        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase()
        }

        // Find the closest opened tag of the same type
        if (tagName) {
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                    break
                }
            }
        } else {
            // If no tag name is provided, clean shop
            pos = 0
        }
        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (let i = stack.length - 1; i >= pos; i--) {
                if (process.env.NODE_ENV !== 'production' &&
                    (i > pos || !tagName) &&
                    options.warn
                ) {
                    options.warn(
                        `tag <${stack[i].tag}> has no matching end tag.`
                    )
                }
                if (options.end) {
                    options.end(stack[i].tag, start, end)
                }
            }

            // Remove the open elements from the stack
            stack.length = pos
            lastTag = pos && stack[pos - 1].tag
        } else if (lowerCasedTagName === 'br') {
            if (options.start) {
                options.start(tagName, [], true, start, end)
            }
        } else if (lowerCasedTagName === 'p') {
            if (options.start) {
                options.start(tagName, [], false, start, end)
            }
            if (options.end) {
                options.end(tagName, start, end)
            }
        }
    }
}
