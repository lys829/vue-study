import {
    nextTick
} from '../util/index'

const queue = [];
const activatedChildren = [];
let has = {};
let waiting = false;
let flushing = false;
let index = 0;

function resetSchedulerState() {
    index = queue.length = activatedChildren.length = 0;
    has = {};
    waiting = flushing = false;
}

function flushSchedulerQueue() {
    flushing = true;
    let watcher, id;

    queue.sort((a, b) => a.id - b.id);
    for(index = 0; index < queue.length; index++) {
        watcher = queue[index];
        id = watcher.id;
        has[id] = null;
        watcher.run();

    }

    const activatedQueue = activatedChildren.slice()
    const updatedQueue = queue.slice()

    resetSchedulerState();
}

export function queueWatcher(watcher) {
    const id = watcher.id;
    if(has[id] == null) { //没有被flush的watcher
        has[id] = true;
        if(!flushing) {
            queue.push(watcher);
        }else {
            // 计算属性观察者可能在队列开始更新的时候加入
            let i = queue.length - 1;
            while( i > index && queue[i].id > watcher.id) {
                i--;
            }
            queue.splice(i+1, 0, watcher);
        }
    }
    if(!waiting) {
        waiting = true;
        nextTick(flushSchedulerQueue)
    }
}