class Observer {
    constructor(data) {
        this.walk(data);
    }
    walk(data) {
        let keys = Object.keys(data);
        for(let key of keys) {
            defineReactive(data, key, data[key]);
        }
    }
}

class Dep {
    constructor() {
        this.subs = [];
    }
    depend() {
        this.subs.push(Dep.target)
    }
    notify(val, newVal) {
        for(let item of this.subs) {
            item.fn(val, newVal);
        }
    }
}

Dep.target = null;
function pushTarget(watch) {
    Dep.target = watch
}


class Watch {
    constructor(exp, fn) {
        this.exp = exp;
        this.fn = fn;
        pushTarget(this)
        data[exp];
    }
}

function defineReactive(data, key, val) {
    observer(val);
    const dep = new Dep();
    console.log(val)
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            dep.depend();
            return val;
        },
        set: function(newVal) {
            if(val === newVal) {
                return;
            }
            observer(newVal);
            dep.notify(val, newVal);
        }
    })
}

function observer(data) {
    if(Object.prototype.toString.call(data) !== '[object Object]') {
        return;
    }
    new Observer(data);
}


const data = {
    a: 1
}

observer(data);

new Watch('a', (val, newVal)=> {
    console.log(val, newVal)
})

data.a = 3