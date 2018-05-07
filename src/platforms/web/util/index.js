// import * as all from './element'
// console.log(all)
export * from './element.js'

/**
 * 
 * @param {String|Element} el 
 */
export function query(el) {
    if(typeof el === 'string') {
        const selected = document.querySelector(el);
        if(!selected) {
            //TODO: warn提示
            return document.createElement('div');
        }
        return selected;
    } else {
        return el
    }
}