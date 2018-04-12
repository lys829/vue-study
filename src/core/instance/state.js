
export function stateMixin(Vue) {
    // Vue项目中用的flow检测会存在问题，这里按照原先写法
    const dataDef = {};
    dataDef.get = function () {
        return this._data;
    }
    const propsDef = {};
    propsDef.get = function () {
        return this._props;
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', dataDef);

    
}