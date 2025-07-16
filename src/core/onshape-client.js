const axios = require('axios');
const FormData = require('form-data');

class OnShapeClient {
    constructor(accessKey, secretKey, baseUrl = 'https://cad.onshape.com') {
        if (!accessKey || !secretKey) {
            throw new Error('OnShape API credentials are required');
        }
        
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.baseUrl = baseUrl;
        this.credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64');
    }

    getHeaders(contentType = 'application/json') {
        return {
            'Authorization': `Basic ${this.credentials}`,
            'Content-Type': contentType
        };
    }

    async createDocument(name, isPublic = false) {
        const response = await axios.post(
            `${this.baseUrl}/api/v6/documents`, 
            { name, public: isPublic },
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async uploadBlob(documentId, workspaceId, fileData, filename, contentType = 'application/octet-stream') {
        const formData = new FormData();
        formData.append('file', fileData, { filename, contentType });

        const response = await axios.post(
            `${this.baseUrl}/api/v6/blobelements/d/${documentId}/w/${workspaceId}`,
            formData,
            {
                headers: {
                    'Authorization': `Basic ${this.credentials}`,
                    ...formData.getHeaders()
                }
            }
        );
        return response.data;
    }

    async importBlob(documentId, workspaceId, blobElementId, format = 'STL', createNewPartStudio = false) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/v6/documents/d/${documentId}/w/${workspaceId}/import`,
                {
                    format,
                    blobElementId,
                    importIntoPartStudio: true,
                    createNewPartStudio
                },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return { status: 'imported_with_404', message: 'Import completed (404 expected)' };
            }
            throw error;
        }
    }

    async uploadSTL(stlData, filename = 'model.stl', documentName = 'AI Generated Model') {
        try {
            const document = await this.createDocument(documentName);
            
            const uploadResult = await this.uploadBlob(
                document.id,
                document.defaultWorkspace.id,
                Buffer.from(stlData, 'utf8'),
                filename,
                'application/octet-stream'
            );
            
            const importResult = await this.importBlob(
                document.id,
                document.defaultWorkspace.id,
                uploadResult.id
            );

            return {
                document,
                upload: uploadResult,
                import: importResult,
                url: `${this.baseUrl}/documents/${document.id}`
            };
        } catch (error) {
            throw new Error(`OnShape upload failed: ${error.message}`);
        }
    }

    async getDocument(documentId) {
        const response = await axios.get(
            `${this.baseUrl}/api/v6/documents/${documentId}`,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async getElements(documentId, workspaceId) {
        const response = await axios.get(
            `${this.baseUrl}/api/v6/documents/d/${documentId}/w/${workspaceId}/elements`,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async getParts(documentId, workspaceId, elementId) {
        const response = await axios.get(
            `${this.baseUrl}/api/v6/parts/d/${documentId}/w/${workspaceId}/e/${elementId}`,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    getViewUrl(documentId) {
        return `${this.baseUrl}/documents/${documentId}`;
    }
}

module.exports = OnShapeClient; 