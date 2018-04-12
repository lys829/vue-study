
export function mergeOptions(parent, child, vm) {
    //TODO: checkComponents(child)
    
    if(typeof child === 'function') {
        child = child.options;
    }

    const options = {};

    return options;
}