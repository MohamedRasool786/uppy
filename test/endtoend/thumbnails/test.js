/* global browser, expect, $, $$ */
const path = require('path')
const fs = require('fs')
const { selectFakeFile, supportsChooseFile } = require('../utils')

const testURL = 'http://localhost:4567/thumbnails'

const images = [
  path.join(__dirname, '../../resources/image.jpg'),
  path.join(__dirname, '../../resources/baboon.png'),
  path.join(__dirname, '../../resources/kodim23.png')
]

describe.only('ThumbnailGenerator', () => {
  beforeEach(() => {
    browser.url(testURL)
  })

  it('should generate thumbnails for images', () => {
    $('#uppyThumbnails .uppy-FileInput-input').waitForExist()

    if (supportsChooseFile()) {
      for (const img of images) {
        browser.chooseFile('#uppyThumbnails .uppy-FileInput-input', img)
      }
    } else {
      for (const img of images) {
        browser.execute(
          selectFakeFile,
          'uppyThumbnails',
          path.basename(img), // name
          `image/${path.extname(img).slice(1)}`, // type
          fs.readFileSync(img, 'base64') // b64
        )
      }
    }

    browser.executeAsync((cb) => {
      window.uppyThumbnails.on('thumbnail:ready', () => cb())
    })

    // const names = $$('p.file-name')
    const previews = $$('img.file-preview')

    // Names should all be listed before previews--indicates that previews were generated asynchronously.
    /* Nevermind this, chooseFile() doesn't accept multiple files so they are added one by one and the thumbnails
     * have finished generating by the time we add the next.
    const nys = names.map((el) => el.getLocation('y'))
    const pys = previews.map((el) => el.getLocation('y'))
    for (const ny of nys) {
      for (const py of pys) {
        expect(ny).to.be.below(py, 'names should be listed before previews')
      }
    }
    */

    expect(previews).to.have.lengthOf(3)
    for (const p of previews) {
      expect(p.getAttribute('src')).to.match(/^blob:/)
      expect(p.getElementSize('width')).to.equal(200)
    }
  })
})
