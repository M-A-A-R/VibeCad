// Import a simple square STL file to OnShape (fixed upload format)
const axios = require('axios');
const FormData = require('form-data');

// Your API keys
const ACCESS_KEY = 'QlSdGFPgKpR0s0s9lMQFWdw3';
const SECRET_KEY = 'WLLVf9rJanAnpDQ88l9nmvYsplZOTgHHx4Yplt1lgvYv0CPL';

async function importSquareFixed() {
    try {
        console.log('📦 Importing a square STL file to OnShape (fixed)...\n');

        // Authentication
        const credentials = Buffer.from(`${ACCESS_KEY}:${SECRET_KEY}`).toString('base64');

        // Step 1: Create document
        console.log('📄 Creating document...');
        const docResponse = await axios.post('https://cad.onshape.com/api/v6/documents', 
            { name: 'Imported Square (Fixed)', public: false },
            { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' } }
        );
        const doc = docResponse.data;
        console.log(`✅ Document created: ${doc.id}`);

        // Step 2: Create simple square STL data
        console.log('🔨 Creating simple square STL data...');
        
        // Simple square STL (ASCII format) - a 20mm x 20mm x 2mm cube
        const squareSTL = `solid square
facet normal 0 0 -1
  outer loop
    vertex -10 -10 0
    vertex 10 -10 0
    vertex 10 10 0
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex -10 -10 0
    vertex 10 10 0
    vertex -10 10 0
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex -10 -10 2
    vertex 10 10 2
    vertex 10 -10 2
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex -10 -10 2
    vertex -10 10 2
    vertex 10 10 2
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex -10 -10 0
    vertex -10 -10 2
    vertex 10 -10 2
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex -10 -10 0
    vertex 10 -10 2
    vertex 10 -10 0
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex 10 -10 0
    vertex 10 -10 2
    vertex 10 10 2
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex 10 -10 0
    vertex 10 10 2
    vertex 10 10 0
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex 10 10 0
    vertex 10 10 2
    vertex -10 10 2
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex 10 10 0
    vertex -10 10 2
    vertex -10 10 0
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex -10 10 0
    vertex -10 10 2
    vertex -10 -10 2
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex -10 10 0
    vertex -10 -10 2
    vertex -10 -10 0
  endloop
endfacet
endsolid square`;

        // Step 3: Upload the STL file using proper form data
        console.log('📤 Uploading STL file using form data...');
        
        const formData = new FormData();
        formData.append('file', Buffer.from(squareSTL, 'utf8'), {
            filename: 'square.stl',
            contentType: 'application/octet-stream'
        });

        const uploadResponse = await axios.post(
            `https://cad.onshape.com/api/v6/blobelements/d/${doc.id}/w/${doc.defaultWorkspace.id}`,
            formData,
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    ...formData.getHeaders()
                }
            }
        );

        console.log('✅ STL file uploaded!');
        console.log(`📋 Blob ID: ${uploadResponse.data.id}`);

        // Step 4: Import the blob as a Part Studio feature  
        console.log('🔄 Importing STL into Part Studio...');
        
        const importResponse = await axios.post(
            `https://cad.onshape.com/api/v6/documents/d/${doc.id}/w/${doc.defaultWorkspace.id}/import`,
            {
                "format": "STL",
                "blobElementId": uploadResponse.data.id,
                "importIntoPartStudio": true,
                "createNewPartStudio": false
            },
            { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' } }
        );

        console.log('✅ STL imported into Part Studio!');
        console.log(`\n🎉 SUCCESS! Your square has been imported!`);
        console.log(`🌐 View it here: https://cad.onshape.com/documents/${doc.id}`);
        
        return doc;

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        
        // Log the full error for debugging
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run it
importSquareFixed(); 