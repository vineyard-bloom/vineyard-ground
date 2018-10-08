"use strict";
require('source-map-support').install();
var generateDocs = require('vineyard-docs').generateDocs;
generateDocs({
    paths: {
        src: ['source'],
        content: 'source/doc',
        output: 'doc',
        tsconfig: './tsconfig.json',
    }
});
//# sourceMappingURL=generate-docs.js.map