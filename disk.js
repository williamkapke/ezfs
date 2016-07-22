const _fs = require('fs')
const cp = require('child_process')
const path = require('path')
const constants = _fs.constants

const mkdirp = (path) => cp.execSync('mkdir -p ' + path)
const rimrf = (path) => cp.execSync('rm -rf ' + path)
const stat = (path) => {
  try {
    return _fs.statSync(path)
  } catch (e) {}
}
const types = {
  [constants.S_IFDIR]: 'directory',
  [constants.S_IFREG]: 'file'
  // [constants.S_IFBLK]: 'block',
  // [constants.S_IFCHR]: 'character',
  // [constants.S_IFLNK]: 'link',
  // [constants.S_IFIFO]: 'fifo',
  // [constants.S_IFSOCK]: 'socket'
}

var cache = {}

const handler = {

  get: function (target, key) {
    // console.log(target.path, key, typeof key)
    if (key === disk.path) return target.path

    // special cases
    if (key === 'inspect') return () => target.value
    if (key === 'toJSON') return () => target.value
    if (key === Symbol.toPrimitive) return () => String(target.value)

    if (!target.type) {
      return disk(target.path, key)
    }

    // handle things like toString, valueOf, forEach...etc
    if (typeof target.value[key] === 'function') {
      return (...args) => target.value[key](...args)
    }
    // accessing by index
    if (target.value[key] && /^\d+$/.test(key)) {
      return disk(target.path, target.value[key])
    }
    return disk(target.path, key)
  },

  set: function (target, key, value) {
    var fullPath = path.resolve(target.path, key)
    var parsed = path.parse(fullPath)
    mkdirp(parsed.dir)

    if (!/number|string|boolean/.test(typeof value) && !Buffer.isBuffer(value)) {
      value = JSON.stringify(value)
    }
    _fs.writeFileSync(fullPath, value)
  },

  deleteProperty: (target, key) => rimrf(path.resolve(target.path, key)),

  ownKeys: (target) => target.value ? Object.keys(target.value) : [],

  has: (target, key) => target.value && target.value.hasOwnProperty(key)
}

const disk = (...segments) => {
  const p = path.resolve(...segments)
  const _stat = stat(p)
  const _type = _stat && (types[_stat.mode & constants.S_IFMT] || 'unknown')
  const target = {
    path: p,
    type: _type,
    [_type]: true,
    get value () {
      if (cache[p]) return cache[p]
      if (!_type) return

      if (this.file) return (cache[p] = _fs.readFileSync(this.path))
      if (this.directory) return (cache[p] = _fs.readdirSync(this.path).map(i => path.resolve(this.path, i)))

      throw new Error(`Cannot get value of '${String(_type)}'`)
    }
  }

  return new Proxy(target, handler)
}
Object.defineProperty(disk, 'cache', {
  get: () => cache
})
Object.defineProperty(disk, 'clearCache', {
  value: () => cache = {}
})

disk.path = Symbol('path')

module.exports = disk
