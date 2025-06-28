# OnShape API Scripts

Simple Node.js scripts for OnShape CAD operations using the OnShape REST API.

## 🚀 What Works

✅ **Create documents** - `simple-start.js`  
✅ **Import 3D shapes** - `import-square-fixed.js` (creates a 20mm×20mm×2mm square)  
✅ **Check documents** - `check-uploaded-square.js` (explore what's inside)

## 📦 Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get API keys from OnShape:**
   - Go to https://cad.onshape.com/appstore/dev-portal
   - Click "API keys" → "Create new API key"  
   - Check: `OAuth2Read` and `OAuth2Write`
   - Add your keys to the scripts (replace the placeholder values)

## 🎯 Usage

```bash
# Create a simple document
npm start

# Import a 3D square
npm run square

# Check what's in a document
npm run check
```

## 🎉 Success!

The **square import** creates a real 3D part in OnShape that you can view, modify, and use in assemblies!

## 🔑 Next Steps

- Create other shapes (circles, triangles, etc.)
- Explore assemblies and drawings
- Add parametric features 