require('source-map-support').install()
const {generateDocs} = require('vineyard-docs')

generateDocs({
  paths: {
    src: ['source'],
    content: 'source/doc',
    output: 'doc',
    tsconfig: './tsconfig.json',
  }
})