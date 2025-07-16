1st Place VCNest Hackathon 6/28/25

This is a basic example for one shoting simple designs

# OnShape API Scripts

Simple Node.js scripts for OnShape CAD operations using the OnShape REST API.

##  What Works

 **Create documents** - `simple-start.js`  
 **Import 3D shapes** - `import-square-fixed.js` (creates a 20mm×20mm×2mm square)  
 **Check documents** - `check-uploaded-square.js [DOCUMENT_ID]` (explore any document)

##  Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get API keys from OnShape:**
   - Go to https://cad.onshape.com/appstore/dev-portal
   - Click "API keys" → "Create new API key"  
   - Check: `OAuth2Read` and `OAuth2Write`
   - Add your keys to the scripts (replace the placeholder values)

##  Usage

```bash
# Create a simple document
npm start

# Import a 3D square (returns a document ID)
npm run square

# Check what's in a specific document
node check-uploaded-square.js [DOCUMENT_ID]
```

##  Example Workflow

```bash
# 1. Create a square
npm run square
# Output: Document ID: abc123def456...

# 2. Check what's inside
node check-uploaded-square.js abc123def456
```

##  Working:

The **square import** creates a real 3D part in OnShape that you can view, modify, and use in assemblies

## Example
Prompt: 'Humanoid Robot'
<img width="1775" height="873" alt="Image" src="https://github.com/user-attachments/assets/74964e30-6cc0-4db2-b31b-2fc8708a6805" />
