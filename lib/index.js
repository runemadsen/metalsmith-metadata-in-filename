'use strict'

const minimatch = require('minimatch')
const moment = require('moment')
const { each, lastIndexOf, words, capitalize } = require('lodash')
const path = require('path')

module.exports = (options = {}) => ((files, metalsmith, done) => {
  const force = !!options.force
  const format = options.format || 'YYYY-MM-DD'
  const match = options.match

  each(files, (fileMeta, filePath) => {

    let fileName = path.basename(filePath)

    // Check file matches glob pattern if defined
    if (match && !minimatch(fileName, match)) {
      return
    }

    // Extract date string from filename
    let dateString = fileName.substr(0, format.length)
    let date = moment.utc(dateString, format)
    if(!date._isValid) return
    date = date.toDate()

    // Extract slug from remainder of filename
    // +1 to format length to skip the separator (-)
    let slug = fileName.substring(format.length + 1, lastIndexOf(fileName, '.'))
    let title = words(slug).map(capitalize).join(' ')

    // Conditionally set new metadata
    if (force || !fileMeta.date) {
      fileMeta.date = date
    }

    if (force || !fileMeta.slug) {
      fileMeta.slug = slug
    }

    if (force || !fileMeta.title) {
      fileMeta.title = title
    }

  })

  done()
})
