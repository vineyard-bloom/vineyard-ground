"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
var vineyard_docs_1 = require("vineyard-docs");
vineyard_docs_1.generateDocs({
    project: {
        name: 'Vineyard Lawn Documentation'
    },
    paths: {
        src: ['source'],
        content: 'source/doc',
        output: 'doc',
        tsconfig: './tsconfig.json',
    }
});
//# sourceMappingURL=generate-docs.js.map