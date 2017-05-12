'use strict'

const Metalsmith = require('metalsmith')
const chai = require('chai')
const chaiDatetime = require('chai-datetime')
const { name } = require('../package.json')
const plugin = require('../lib/')
const collections = require('metalsmith-collections')

const { expect } = chai
chai.use(chaiDatetime)

describe(name, () => {

  describe('Standard date format', () => {
    let metalsmith

    beforeEach(() => {
      metalsmith = Metalsmith('test/fixtures/standard/')
    })

    it('should export a function', () => {
      expect(plugin).to.be.a('function')
    })

    it('should pull date from filenames', done => {
      const assertions = [
        { filename: '2017-01-10-a-title.md', date: new Date(2017, 0, 10) },
        { filename: '2017-02-10-some-other-title.md', date: new Date(2017, 1, 10) },
        { filename: '2017-03-10-kebab-case.md', date: new Date(2017, 2, 10) }
      ]

      metalsmith
        .use(plugin())
        .build((err, files) => {
          if (err) return done(err)
          assertions.forEach(({ filename, date }) => {
            expect(files[filename]).to.include.key('date')
            expect(files[filename].date).to.equalDate(date)
          })
          done()
        })
    })

    it('should pull slug from filenames', done => {
      const assertions = [
        { filename: '2017-01-10-a-title.md', slug: 'a-title' },
        { filename: '2017-02-10-some-other-title.md', slug: 'some-other-title' },
        { filename: '2017-03-10-kebab-case.md', slug: 'kebab-case' }
      ]

      metalsmith
        .use(plugin())
        .build((err, files) => {
          if (err) return done(err)
          assertions.forEach(({ filename, slug }) => {
            expect(files[filename]).to.include.key('slug')
            expect(files[filename].slug).to.equal(slug)
          })
          done()
        })
    })

    it('should pull and format title from filenames', done => {
      const assertions = [
        { filename: '2017-01-10-a-title.md', title: 'A Title' },
        { filename: '2017-02-10-some-other-title.md', title: 'Some Other Title' },
        { filename: '2017-03-10-kebab-case.md', title: 'Kebab Case' }
      ]

      metalsmith
        .use(plugin())
        .build((err, files) => {
          if (err) return done(err)
          assertions.forEach(({ filename, title }) => {
            expect(files[filename]).to.include.key('title')
            expect(files[filename].title).to.equal(title)
          })
          done()
        })
    })

    it('should pull only slug if date does not exist', done => {

      const filename = 'no-date.md'
      const title = 'no-date'

      metalsmith
        .use(plugin())
        .build((err, files) => {
          if (err) return done(err)
          expect(files[filename]).to.not.include.key('date')
          expect(files[filename]).to.include.key('slug')
          expect(files[filename].slug).to.equal(title)
          done()
        })
    })

  })

  describe('Override metadata', () => {
    let metalsmith

    beforeEach(() => {
      metalsmith = Metalsmith('test/fixtures/overrides/')
    })

    it('should override existing metadata when force option is set to true', done => {
      const filename = '2017-03-03-to-force-or-not-to-force.md'
      const title = 'To Force Or Not To Force'

      metalsmith
        .use(plugin({ force: true }))
        .build((err, files) => {
          if (err) return done(err)
          expect(files[filename]).to.include.key('title')
          expect(files[filename].title).to.equal(title)
          done()
        })
    })

    it('should not override metadata by default', done => {
      const filename = '2017-03-03-to-force-or-not-to-force.md'
      const title = 'That is the Question'

      metalsmith
        .use(plugin())
        .build((err, files) => {
          if (err) return done(err)
          expect(files[filename]).to.include.key('title')
          expect(files[filename].title).to.equal(title)
          done()
        })
    })

  })

  describe('Custom date format', () => {
    let metalsmith

    beforeEach(() => {
      metalsmith = Metalsmith('test/fixtures/custom-format/')
    })

    it('should accept custom date format', done => {
      const filename = '20170101-a-post-on-different-date-formats.md'
      const date = new Date(2017, 0, 1)

      metalsmith
        .use(plugin({ format: 'YYYYMMDD' }))
        .build((err, files) => {
          if (err) return done(err)
          expect(files[filename]).to.include.key('date')
          expect(files[filename].date).to.equalDate(date)
          done()
        })
    })

  })

  describe('Mixed files', () => {
    let metalsmith

    beforeEach(() => {
      metalsmith = Metalsmith('test/fixtures/mixed/')
    })

    it('should match and limit to files using glob pattern', done => {
      const filename = '2017-04-01-post.md'
      const date = new Date(2017, 3, 1)

      metalsmith
        .use(plugin({ match: '*.md' }))
        .build((err, files) => {
          if (err) return done(err)

          expect(files['index.html']).not.to.include.keys(['title', 'date'])
          expect(files['robots.txt']).not.to.include.keys(['title', 'date'])

          expect(files[filename]).to.include.keys(['title', 'date'])
          expect(files[filename].title).to.equal('Post')
          expect(files[filename].date).to.equalDate(date)

          done()
        })
    })
  })

  describe('Collections', () => {
    let metalsmith

    beforeEach(() => {
      metalsmith = Metalsmith('test/fixtures/collections/')
    })

    it('should pull date and slug from filename', done => {

      const filename = "collection/2017-01-10-a-title.md"
      const slug = "a-title"
      const date = new Date(2017, 0, 10)

      metalsmith
        .use(plugin())
        .use(collections({
          collection: 'collection/*.md'
        }))
        .build((err, files) => {
          if (err) return done(err)
          expect(files[filename]).to.include.key('slug')
          expect(files[filename].slug).to.equal(slug)
          expect(files[filename]).to.include.key('date')
          expect(files[filename].date).to.equalDate(date)
          done()
        })
    })
  })

})
