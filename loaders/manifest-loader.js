/**
 * loaders to output manifest.json
 */

function manifestLoader (source) {
  if (this.cacheable) this.cacheable()
  this.emitFile(
    'manifest.json',
    source
  )
  return '{}'
}

module.exports = manifestLoader
