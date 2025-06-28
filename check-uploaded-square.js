// Check what's in any OnShape document (pass docId as argument)
const axios = require('axios');

// Your API keys
const ACCESS_KEY = 'QlSdGFPgKpR0s0s9lMQFWdw3';
const SECRET_KEY = 'WLLVf9rJanAnpDQ88l9nmvYsplZOTgHHx4Yplt1lgvYv0CPL';

async function checkDocument(docId) {
    try {
        console.log(`🔍 Checking document: ${docId}\n`);

        // Authentication
        const credentials = Buffer.from(`${ACCESS_KEY}:${SECRET_KEY}`).toString('base64');
        const authHeader = { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' };

        console.log('📋 Getting document info...');
        const docResponse = await axios.get(
            `https://cad.onshape.com/api/v6/documents/${docId}`,
            { headers: authHeader }
        );
        console.log(`✅ Document: "${docResponse.data.name}"`);
        console.log(`🔑 Default workspace: ${docResponse.data.defaultWorkspace.id}`);

        console.log('\n📑 What elements are in this document?');
        const elementsResponse = await axios.get(
            `https://cad.onshape.com/api/v6/documents/d/${docId}/w/${docResponse.data.defaultWorkspace.id}/elements`,
            { headers: authHeader }
        );

        console.log(`Found ${elementsResponse.data.length} elements:`);
        elementsResponse.data.forEach((element, index) => {
            console.log(`  ${index + 1}. ${element.name} (Type: ${element.elementType}, ID: ${element.id})`);
        });

        // Check each Part Studio
        const partStudios = elementsResponse.data.filter(el => el.elementType === 'PARTSTUDIO');
        
        for (const partStudio of partStudios) {
            console.log(`\n🔧 Exploring Part Studio: "${partStudio.name}"`);
            
            const featuresResponse = await axios.get(
                `https://cad.onshape.com/api/v6/partstudios/d/${docId}/w/${docResponse.data.defaultWorkspace.id}/e/${partStudio.id}/features`,
                { headers: authHeader }
            );

            console.log(`📋 Found ${featuresResponse.data.features?.length || 0} features:`);
            if (featuresResponse.data.features && featuresResponse.data.features.length > 0) {
                featuresResponse.data.features.forEach((feature, index) => {
                    console.log(`  ${index + 1}. ${feature.name || feature.featureType} (Type: ${feature.featureType})`);
                });
            } else {
                console.log('  (No features yet)');
            }

            const partsResponse = await axios.get(
                `https://cad.onshape.com/api/v6/parts/d/${docId}/w/${docResponse.data.defaultWorkspace.id}`,
                { headers: authHeader }
            );

            console.log(`🔩 Found ${partsResponse.data.length || 0} parts:`);
            if (partsResponse.data && partsResponse.data.length > 0) {
                partsResponse.data.forEach((part, index) => {
                    console.log(`  ${index + 1}. ${part.name} (ID: ${part.partId})`);
                });
            } else {
                console.log('  (No parts yet)');
            }
        }

        console.log(`\n🌐 View document: https://cad.onshape.com/documents/${docId}`);
        console.log('✨ Check complete!');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

// Get document ID from command line argument
const docId = process.argv[2];

if (!docId) {
    console.log('❌ Please provide a document ID!');
    console.log('');
    console.log('Usage:');
    console.log('  node check-uploaded-square.js [DOCUMENT_ID]');
    console.log('');
    console.log('Example:');
    console.log('  node check-uploaded-square.js b72189afce5b8394d5628b93');
    console.log('');
    console.log('💡 Run "npm run square" first to create a document, then use that ID here.');
    process.exit(1);
}

// Run it
checkDocument(docId); 