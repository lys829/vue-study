// Create a cached version of a pure function
// cached result

function cached(fn)　{
    const cache = Object.create(null)
    return function cachedFn (str) {
      const hit = cache[str]
      return hit || (cache[str] = fn(str))
    }
}

const camelizeRE = /-(\w)/g
const camelize = cached((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})


