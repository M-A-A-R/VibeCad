const axios = require('axios');

class AIClient {
    constructor(apiKey, baseUrl = 'https://api.anthropic.com') {
        if (!apiKey) {
            throw new Error('Anthropic API key is required');
        }
        
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = 'claude-3-5-sonnet-20241022';
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
        };
    }

    async generateCADDesign(userRequest) {
        const systemPrompt = `You are an expert CAD engineer and 3D designer. Your task is to analyze design requests and create precise geometric specifications using basic 3D primitives.

AVAILABLE SHAPES: sphere, cylinder, box, cone

CRITICAL ENGINEERING REQUIREMENTS:
1. CONNECTED ASSEMBLIES: All parts must be properly connected and touching where they should join
2. REALISTIC PROPORTIONS: Use real-world human scale dimensions in millimeters  
3. ENGINEERING THINKING: Consider how parts actually assemble and connect in reality
4. Z-AXIS VERTICAL: Z=0 is ground level, positive Z goes up
5. OVERLAPPING CONNECTIONS: Parts should overlap slightly to ensure proper connection

COMPONENT POSITIONING GUIDELINES:
- Robot joints: Upper arm connects to torso, forearm connects to upper arm
- Furniture: Legs connect to seat/tabletop, backs connect to seats
- Vehicles: Wheels positioned at vehicle corners, body parts properly aligned
- Architecture: Foundation at Z=0, walls on foundation, roof on walls

OUTPUT FORMAT: Respond with ONLY a JSON object containing:
{
  "name": "descriptive_name", 
  "description": "engineering reasoning for your design choices",
  "components": [
    {
      "name": "component_name",
      "shape": "sphere|cylinder|box|cone", 
      "position": [x, y, z],
      "dimensions": {"radius": N} OR {"width": N, "depth": N, "height": N} OR {"radius": N, "height": N},
      "engineering_note": "why this component and these dimensions"
    }
  ]
}

Think step-by-step: What's the main structure? What attaches where? How do parts connect?

Design: "${userRequest}"`;

        try {
            const response = await axios.post(
                `${this.baseUrl}/v1/messages`,
                {
                    model: this.model,
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: systemPrompt }]
                },
                { headers: this.getHeaders() }
            );

            const content = response.data.content[0].text;
            
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No JSON found in AI response');
                }
                
                const designSpec = JSON.parse(jsonMatch[0]);
                this.validateDesignSpec(designSpec);
                return designSpec;
            } catch (parseError) {
                throw new Error(`Failed to parse AI design specification: ${parseError.message}`);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY environment variable.');
            }
            throw new Error(`AI design generation failed: ${error.message}`);
        }
    }

    validateDesignSpec(designSpec) {
        if (!designSpec.name || typeof designSpec.name !== 'string') {
            throw new Error('Design must have a valid name');
        }
        
        if (!designSpec.components || !Array.isArray(designSpec.components)) {
            throw new Error('Design must have a components array');
        }
        
        if (designSpec.components.length === 0) {
            throw new Error('Design must have at least one component');
        }

        const validShapes = ['sphere', 'cylinder', 'box', 'cone'];
        
        for (const [index, component] of designSpec.components.entries()) {
            if (!component.name || typeof component.name !== 'string') {
                throw new Error(`Component ${index} must have a valid name`);
            }
            
            if (!validShapes.includes(component.shape)) {
                throw new Error(`Component ${index} has invalid shape "${component.shape}". Must be: ${validShapes.join(', ')}`);
            }
            
            if (!Array.isArray(component.position) || component.position.length !== 3) {
                throw new Error(`Component ${index} must have position [x, y, z]`);
            }
            
            if (!component.dimensions || typeof component.dimensions !== 'object') {
                throw new Error(`Component ${index} must have dimensions object`);
            }
            
            this.validateComponentDimensions(component, index);
        }
    }

    validateComponentDimensions(component, index) {
        const { shape, dimensions } = component;
        
        switch (shape) {
            case 'sphere':
                if (typeof dimensions.radius !== 'number' || dimensions.radius <= 0) {
                    throw new Error(`Component ${index} (sphere) must have positive radius`);
                }
                break;
                
            case 'cylinder':
            case 'cone':
                if (typeof dimensions.radius !== 'number' || dimensions.radius <= 0) {
                    throw new Error(`Component ${index} (${shape}) must have positive radius`);
                }
                if (typeof dimensions.height !== 'number' || dimensions.height <= 0) {
                    throw new Error(`Component ${index} (${shape}) must have positive height`);
                }
                break;
                
            case 'box':
                const requiredDims = ['width', 'depth', 'height'];
                for (const dim of requiredDims) {
                    if (typeof dimensions[dim] !== 'number' || dimensions[dim] <= 0) {
                        throw new Error(`Component ${index} (box) must have positive ${dim}`);
                    }
                }
                break;
                
            default:
                throw new Error(`Unknown shape type: ${shape}`);
        }
    }

    generateFallbackDesign(userRequest) {
        const request = userRequest.toLowerCase();
        
        if (request.includes('chair')) {
            return {
                name: "Basic_Chair",
                description: "Simple chair design with seat, back, and legs",
                components: [
                    { name: "seat", shape: "box", position: [0, 0, 400], dimensions: { width: 400, depth: 400, height: 50 } },
                    { name: "back", shape: "box", position: [0, -175, 600], dimensions: { width: 400, depth: 50, height: 400 } },
                    { name: "leg1", shape: "cylinder", position: [150, 150, 200], dimensions: { radius: 25, height: 400 } },
                    { name: "leg2", shape: "cylinder", position: [-150, 150, 200], dimensions: { radius: 25, height: 400 } },
                    { name: "leg3", shape: "cylinder", position: [150, -150, 200], dimensions: { radius: 25, height: 400 } },
                    { name: "leg4", shape: "cylinder", position: [-150, -150, 200], dimensions: { radius: 25, height: 400 } }
                ]
            };
        } else if (request.includes('table')) {
            return {
                name: "Basic_Table", 
                description: "Simple table with rectangular top and four legs",
                components: [
                    { name: "top", shape: "box", position: [0, 0, 700], dimensions: { width: 800, depth: 600, height: 50 } },
                    { name: "leg1", shape: "cylinder", position: [350, 250, 350], dimensions: { radius: 30, height: 700 } },
                    { name: "leg2", shape: "cylinder", position: [-350, 250, 350], dimensions: { radius: 30, height: 700 } },
                    { name: "leg3", shape: "cylinder", position: [350, -250, 350], dimensions: { radius: 30, height: 700 } },
                    { name: "leg4", shape: "cylinder", position: [-350, -250, 350], dimensions: { radius: 30, height: 700 } }
                ]
            };
        } else {
            return {
                name: "Basic_Shape",
                description: "Simple geometric shape for testing",
                components: [
                    { name: "main_body", shape: "box", position: [0, 0, 50], dimensions: { width: 100, depth: 100, height: 100 } }
                ]
            };
        }
    }
}

module.exports = AIClient; 