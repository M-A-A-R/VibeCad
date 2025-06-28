// Super simple OnShape API test
// Just creates a document to prove it works

const axios = require('axios');

// 🔑 PUT YOUR API KEYS HERE (get them from https://cad.onshape.com/appstore/dev-portal)
const ACCESS_KEY = 'QlSdGFPgKpR0s0s9lMQFWdw3';
const SECRET_KEY = 'WLLVf9rJanAnpDQ88l9nmvYsplZOTgHHx4Yplt1lgvYv0CPL';

async function createDocument() {
    try {
        console.log('🚀 Creating OnShape document...');

        // Simple base64 authentication (easiest method)
        const credentials = Buffer.from(`${ACCESS_KEY}:${SECRET_KEY}`).toString('base64');

        const response = await axios.post('https://cad.onshape.com/api/v6/documents', 
            {
                name: 'My Test Document ',
                public: false
            },
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const document = response.data;
        console.log('✅ Success!');
        console.log(`🌐 Open your document: https://cad.onshape.com/documents/${document.id}`);
        
        return document;

    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
        
        if (error.response?.status === 401) {
            console.error('🔑 Check your API keys! Get them from: https://cad.onshape.com/appstore/dev-portal');
        }
    }
}

// Run it
createDocument(); 