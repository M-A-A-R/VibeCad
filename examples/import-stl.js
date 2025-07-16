require('dotenv').config();
const OnShapeClient = require('../src/core/onshape-client');

const ACCESS_KEY = process.env.ONSHAPE_ACCESS_KEY;
const SECRET_KEY = process.env.ONSHAPE_SECRET_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
    console.error(' Missing OnShape API credentials!');
    console.error('Please set ONSHAPE_ACCESS_KEY and ONSHAPE_SECRET_KEY in your .env file');
    process.exit(1);
}

async function importSquare() {
    try {
        console.log('📦 Importing 20mm square to OnShape...');

        const squareSTL = `solid square
facet normal 0.000000 0.000000 -1.000000
  outer loop
    vertex 0.000000 0.000000 0.000000
    vertex 20.000000 0.000000 0.000000
    vertex 20.000000 20.000000 0.000000
  endloop
endfacet
facet normal 0.000000 0.000000 -1.000000
  outer loop
    vertex 0.000000 0.000000 0.000000
    vertex 20.000000 20.000000 0.000000
    vertex 0.000000 20.000000 0.000000
  endloop
endfacet
facet normal 0.000000 0.000000 1.000000
  outer loop
    vertex 0.000000 0.000000 2.000000
    vertex 20.000000 20.000000 2.000000
    vertex 20.000000 0.000000 2.000000
  endloop
endfacet
facet normal 0.000000 0.000000 1.000000
  outer loop
    vertex 0.000000 0.000000 2.000000
    vertex 0.000000 20.000000 2.000000
    vertex 20.000000 20.000000 2.000000
  endloop
endfacet
facet normal 0.000000 -1.000000 0.000000
  outer loop
    vertex 0.000000 0.000000 0.000000
    vertex 0.000000 0.000000 2.000000
    vertex 20.000000 0.000000 2.000000
  endloop
endfacet
facet normal 0.000000 -1.000000 0.000000
  outer loop
    vertex 0.000000 0.000000 0.000000
    vertex 20.000000 0.000000 2.000000
    vertex 20.000000 0.000000 0.000000
  endloop
endfacet
facet normal 1.000000 0.000000 0.000000
  outer loop
    vertex 20.000000 0.000000 0.000000
    vertex 20.000000 0.000000 2.000000
    vertex 20.000000 20.000000 2.000000
  endloop
endfacet
facet normal 1.000000 0.000000 0.000000
  outer loop
    vertex 20.000000 0.000000 0.000000
    vertex 20.000000 20.000000 2.000000
    vertex 20.000000 20.000000 0.000000
  endloop
endfacet
facet normal 0.000000 1.000000 0.000000
  outer loop
    vertex 20.000000 20.000000 0.000000
    vertex 20.000000 20.000000 2.000000
    vertex 0.000000 20.000000 2.000000
  endloop
endfacet
facet normal 0.000000 1.000000 0.000000
  outer loop
    vertex 20.000000 20.000000 0.000000
    vertex 0.000000 20.000000 2.000000
    vertex 0.000000 20.000000 0.000000
  endloop
endfacet
facet normal -1.000000 0.000000 0.000000
  outer loop
    vertex 0.000000 20.000000 0.000000
    vertex 0.000000 20.000000 2.000000
    vertex 0.000000 0.000000 2.000000
  endloop
endfacet
facet normal -1.000000 0.000000 0.000000
  outer loop
    vertex 0.000000 20.000000 0.000000
    vertex 0.000000 0.000000 2.000000
    vertex 0.000000 0.000000 0.000000
  endloop
endfacet
endsolid square`;

        const client = new OnShapeClient(ACCESS_KEY, SECRET_KEY);
        const result = await client.uploadSTL(squareSTL, 'square.stl', 'Imported Square');

        console.log('✅ Square imported successfully!');
        console.log(`📄 Document ID: ${result.document.id}`);
        console.log(`🌐 View: ${result.url}`);
        
        return result.document.id;
    } catch (error) {
        console.error(' Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    importSquare();
}

module.exports = { importSquare }; 