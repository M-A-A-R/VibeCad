# 🚀 Truly AI-Powered CAD Setup

## 🤖 Anthropic Claude Integration

To use the **truly AI-powered CAD system** that can create ANY object, you need an Anthropic API key.

### Step 1: Get Your API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### Step 2: Set Environment Variable

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="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"
```

**Windows (Command Prompt):**
```cmd
set ANTHROPIC_API_KEY=your-api-key-here
```

**Mac/Linux:**
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### Step 3: Test the AI System
```bash
npm run anything "design a dragon"
npm run anything "create a spaceship"  
npm run anything "make a coffee mug"
npm run anything "build a robot"
```

## 🎯 How It Works
1. **🧠 AI Analysis**: Claude analyzes your request and thinks about function, form, and geometry
2. **🔧 Design Generation**: AI creates geometric specifications (spheres, cylinders, boxes, cones) 
3. **📐 STL Creation**: System generates 3D triangular mesh from AI specs
4. **📤 OnShape Upload**: Automatically uploads to OnShape as CAD model

## ✨ Examples
- `"design a medieval castle"` → AI creates towers, walls, gates
- `"make a flower"` → AI designs stem, petals, leaves  
- `"create a car"` → AI builds body, wheels, windows
- `"build a phone"` → AI designs screen, body, buttons

**The AI can create ANYTHING - no more hardcoded templates!** 🎨 