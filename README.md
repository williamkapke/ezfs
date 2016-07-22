d!
===

ES6 Proxies enable us to do fun wacky things.

This module lets you access the file system as if it were JavaScript objects!

**Dear Windows person:** I'm sorry. I did not make this so it works on Windows. I wanted to keep it
simple as a proof-of-concept. `rimraf` and `mkdirp` could probably be used to make it compatible.
PR welcome ;)

```bash
npm install d!
```

How do you use this?

```javascript
const disk = require('d!')
const root = disk(__dirname)
root.foo.bar.baz.qux = 'ES6 is freakin neeto!'
// go check your disk- You'll find the full directory tree and a file named `qux`

console.log(root.foo.bar.baz.qux)
// <Buffer 45 53 36 20 69 73 20 66 72 65 61 6b 69 6e 20 6e 65 65 74 6f 21>
// (it read the file, and returned the buffer)

console.log(root.foo.bar.baz.qux.toString())
// ES6 is freakin neeto!

// an alternative way for reading / writing deep files...
console.log(root['foo/bar/baz/qux'].toString())


delete root.foo
// go check your disk again- the foo folder is gone!

// Files without extensions are weird, you'll need to use `[]` notation..
root['data.json'] = { a:1, b:2 }

console.log(root['data.json'].toString())
// {"a":1,"b":2}
// (anything thats not a Buffer, string, boolean, or number is `JSON.stringify`ed)
// (but reading it back is not JSON.parsed!)

// directories are arrays... let's list your files..
console.log(root)
// or
root.forEach((item) => console.log(item))
// or
for(let item of root)
  console.log(item)

// want to get the resolved path? Use the `fs2.path` Symbol...
console.log(root['foo/bar/baz/qux'][disk.path])
// /Users/williamkapke/Desktop/node/fs!/data/foo/bar/baz/qux

// Directory lists and files contents are cached.
// This can be a really bad thing :/ Look at our cache:
console.log('\nbefore clear:')
console.log(disk.cache)

// Certainly problematic to keep references like this. Let's clear it...
disk.clearCache()
console.log('\nafter clear:')
console.log(disk.cache)
// {}

```

