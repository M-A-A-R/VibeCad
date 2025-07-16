/**
 * OnShape Document Explorer
 * Professional tool for inspecting OnShape documents and their contents
 */

require('dotenv').config();
const OnShapeClient = require('../core/onshape-client');

const ACCESS_KEY = process.env.ONSHAPE_ACCESS_KEY;
const SECRET_KEY = process.env.ONSHAPE_SECRET_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
    console.error(' Missing OnShape API credentials!');
    console.error('Please set ONSHAPE_ACCESS_KEY and ONSHAPE_SECRET_KEY in your .env file');
    process.exit(1);
}

async function exploreDocument(documentId) {
    console.log(` Exploring Document: ${documentId}\n`);

    try {
        const client = new OnShapeClient(ACCESS_KEY, SECRET_KEY);
        
        const document = await client.getDocument(documentId);
        console.log(` "${document.name}" by ${document.owner.name}`);
        console.log(` Modified: ${new Date(document.modifiedAt).toLocaleDateString()}`);
        
        const workspaceId = document.defaultWorkspace.id;
        const elements = await client.getElements(documentId, workspaceId);
        
        if (elements.length === 0) {
            console.log(' No elements found in this document');
            return;
        }
        
        console.log(`\n Found ${elements.length} element(s):\n`);
        
        for (const [index, element] of elements.entries()) {
            console.log(`${index + 1}. ${element.name || 'Unnamed Element'} (${element.type})`);
            
            if (element.type === 'PARTSTUDIO') {
                try {
                    const parts = await client.getParts(documentId, workspaceId, element.id);
                    if (parts.length > 0) {
                        console.log(`   🔧 ${parts.length} parts:`);
                        parts.forEach((part, partIndex) => {
                            console.log(`      ${partIndex + 1}. ${part.name || 'Unnamed Part'}`);
                        });
                    }
                } catch (partError) {
                    console.log(`    Could not fetch parts`);
                }
            }
            
            if (index < elements.length - 1) console.log('');
        }
        
        const viewUrl = client.getViewUrl(documentId);
        console.log(`\n View: ${viewUrl}`);
        
    } catch (error) {
        console.error('\n Error:', error.message);
        
        if (error.response?.status === 404) {
            console.error('Document not found. Check the document ID.');
        } else if (error.response?.status === 403) {
            console.error('Access denied. Check your API permissions.');
        } else if (error.message.includes('credentials')) {
            console.error('Check your API keys in .env file');
        }
        
        process.exit(1);
    }
}

if (require.main === module) {
    const documentId = process.argv[2];
    
    if (!documentId) {
        console.log(' OnShape Document Explorer');
        console.log('Usage: npm run explore [DOCUMENT_ID]');
        console.log('Example: npm run explore abc123def456');
        process.exit(0);
    }
    
    exploreDocument(documentId);
}

module.exports = { exploreDocument }; 