require('dotenv').config();
const OnShapeClient = require('../src/core/onshape-client');

const ACCESS_KEY = process.env.ONSHAPE_ACCESS_KEY;
const SECRET_KEY = process.env.ONSHAPE_SECRET_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
    console.error(' Missing OnShape API credentials!');
    console.error('Please set ONSHAPE_ACCESS_KEY and ONSHAPE_SECRET_KEY in your .env file');
    process.exit(1);
}

async function createDocument() {
    try {
        console.log(' Creating OnShape document...');

        const client = new OnShapeClient(ACCESS_KEY, SECRET_KEY);
        const document = await client.createDocument('Test Document');

        console.log(' Document created successfully!');
        console.log(` Document ID: ${document.id}`);
        console.log(` View: ${client.getViewUrl(document.id)}`);
        
        return document.id;
    } catch (error) {
        console.error(' Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    createDocument();
}

module.exports = { createDocument }; 