// Check what's in our document after uploading the STL
const axios = require('axios');

// Your API keys
const ACCESS_KEY = 'QlSdGFPgKpR0s0s9lMQFWdw3';
const SECRET_KEY = 'WLLVf9rJanAnpDQ88l9nmvYsplZOTgHHx4Yplt1lgvYv0CPL';

async function checkUploadedSquare() {
    try {
        console.log('🔍 Checking what\'s in our document after upload...\n');

        // Document ID from our last successful upload
        const docId = 'b72189afce5b8394d5628b93';
        const workspaceId = 'c9dcbe2b1a3ce8b18f6de373'; // This needs to be the actual workspace ID

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

        // Check the Part Studio specifically
        const partStudio = elementsResponse.data.find(el => el.elementType === 'PARTSTUDIO');
        if (partStudio) {
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

// Run it
checkUploadedSquare(); 