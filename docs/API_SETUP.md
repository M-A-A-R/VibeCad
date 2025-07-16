# API Setup Guide


### 1. OnShape API Keys 
**Get from:** https://cad.onshape.com/appstore/dev-portal

1. Log into OnShape
2. Go to Developer Portal → API Keys  
3. Click "Create new API key"
4. Check permissions: `OAuth2Read` and `OAuth2Write`
5. Copy your **Access Key** and **Secret Key**

### 2. Anthropic Claude API Key

```bash
# OnShape API Credentials
ONSHAPE_ACCESS_KEY=your_actual_access_key_here
ONSHAPE_SECRET_KEY=your_actual_secret_key_here

# Anthropic Claude API Key
ANTHROPIC_API_KEY=your_actual_anthropic_key_here
```

### Step 3: Verify Setup
```bash

npm start

npm run anything "design a simple cube"
```

 

##  Start Commands

```bash
# Install dependencies
npm install

# Create your .env file
cp .env.example .env


npm start                           
npm run square                      
npm run anything "design a robot"  


npm run check [DOCUMENT_ID]
```

