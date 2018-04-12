
export function initGlobalAPI(Vue) {
    const configDef = {};
    configDef.get = ()=> {};
    // configDef.set = ()=> {} 只读属性

    Object.defineProperty(Vue, 'config', configDef)
}