import {inBrowser} from '../../../core/util/index'

/**
 * <div id="link-box">
     <!-- 注意 href 属性值，链接后面加了一个换行 -->
     <a href="http://hcysun.me
     ">aaaa</a>
     <!-- 注意 href 属性值，链接后面加了一个Tab -->
     <a href="http://hcysun.me	">bbbb</a>
 </div>

 console.log(document.getElementById('link-box').innerHTML)会出现奇怪问题
 */

// check whether current browser encodes a char inside attribute values
let div;
function getShouldDecode(href) {
    div = div || document.createElement('div');
    div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`;
    return div.innerHTML.indexOf('&#10;') > 0
}

// #3663: IE encodes newlines inside attribute values while other browsers don't
export const shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false
// #6828: chrome encodes content in a[href]
export const shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false


