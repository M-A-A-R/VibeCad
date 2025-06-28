// Truly AI-Powered CAD - Can create ANYTHING by querying AI models
const axios = require('axios');
const FormData = require('form-data');

// Your API keys
const ACCESS_KEY = 'QlSdGFPgKpR0s0s9lMQFWdw3';
const SECRET_KEY = 'WLLVf9rJanAnpDQ88l9nmvYsplZOTgHHx4Yplt1lgvYv0CPL';

// Advanced STL Generator - Can make any geometric shape
class UniversalSTLGenerator {
    constructor() {
        this.facets = [];
    }

    addTriangle(v1, v2, v3, normal = null) {
        if (!normal) {
            const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
            const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
            normal = [
                u[1] * v[2] - u[2] * v[1],
                u[2] * v[0] - u[0] * v[2],
                u[0] * v[1] - u[1] * v[0]
            ];
            const len = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
            if (len > 0) {
                normal = [normal[0]/len, normal[1]/len, normal[2]/len];
            }
        }
        this.facets.push({ normal: normal, vertices: [v1, v2, v3] });
    }

    // Universal shape generators based on AI specifications
    addSphere(centerX, centerY, centerZ, radius, segments = 12) {
        const vertices = [];
        
        for (let i = 0; i <= segments; i++) {
            const phi = (i / segments) * Math.PI;
            for (let j = 0; j < segments; j++) {
                const theta = (j / segments) * 2 * Math.PI;
                const x = centerX + radius * Math.sin(phi) * Math.cos(theta);
                const y = centerY + radius * Math.sin(phi) * Math.sin(theta);
                const z = centerZ + radius * Math.cos(phi);
                vertices.push([x, y, z]);
            }
        }

        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const current = i * segments + j;
                const next = i * segments + ((j + 1) % segments);
                const below = ((i + 1) % (segments + 1)) * segments + j;
                const belowNext = ((i + 1) % (segments + 1)) * segments + ((j + 1) % segments);

                if (i < segments) {
                    this.addTriangle(vertices[current], vertices[below], vertices[next]);
                    this.addTriangle(vertices[next], vertices[below], vertices[belowNext]);
                }
            }
        }
    }

    addCylinder(centerX, centerY, bottomZ, topZ, radius, segments = 12) {
        const bottomVertices = [];
        const topVertices = [];
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            bottomVertices.push([x, y, bottomZ]);
            topVertices.push([x, y, topZ]);
        }

        // Caps
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle([centerX, centerY, bottomZ], bottomVertices[next], bottomVertices[i]);
            this.addTriangle([centerX, centerY, topZ], topVertices[i], topVertices[next]);
        }

        // Sides
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle(bottomVertices[i], topVertices[i], topVertices[next]);
            this.addTriangle(bottomVertices[i], topVertices[next], bottomVertices[next]);
        }
    }

    addBox(centerX, centerY, centerZ, width, height, depth) {
        const x1 = centerX - width/2, x2 = centerX + width/2;
        const y1 = centerY - depth/2, y2 = centerY + depth/2;
        const z1 = centerZ - height/2, z2 = centerZ + height/2;

        const vertices = [
            [x1, y1, z1], [x2, y1, z1], [x2, y2, z1], [x1, y2, z1],
            [x1, y1, z2], [x2, y1, z2], [x2, y2, z2], [x1, y2, z2]
        ];
        const faces = [
            [[0,1,2], [0,2,3]], [[4,6,5], [4,7,6]], [[0,4,5], [0,5,1]],
            [[2,6,7], [2,7,3]], [[0,3,7], [0,7,4]], [[1,5,6], [1,6,2]]
        ];
        for (const face of faces) {
            for (const triangle of face) {
                this.addTriangle(vertices[triangle[0]], vertices[triangle[1]], vertices[triangle[2]]);
            }
        }
    }

    addCone(centerX, centerY, bottomZ, topZ, bottomRadius, topRadius = 0, segments = 12) {
        const bottomVertices = [];
        const topVertices = [];
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            bottomVertices.push([
                centerX + bottomRadius * Math.cos(angle),
                centerY + bottomRadius * Math.sin(angle),
                bottomZ
            ]);
            if (topRadius > 0) {
                topVertices.push([
                    centerX + topRadius * Math.cos(angle),
                    centerY + topRadius * Math.sin(angle),
                    topZ
                ]);
            }
        }

        // Bottom cap
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle([centerX, centerY, bottomZ], bottomVertices[next], bottomVertices[i]);
        }

        // Sides
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            if (topRadius > 0) {
                this.addTriangle(bottomVertices[i], topVertices[i], topVertices[next]);
                this.addTriangle(bottomVertices[i], topVertices[next], bottomVertices[next]);
            } else {
                // Cone to point
                this.addTriangle(bottomVertices[i], [centerX, centerY, topZ], bottomVertices[next]);
            }
        }
    }

    generateSTL(name = "ai_generated_object") {
        let stl = `solid ${name}\n`;
        for (const facet of this.facets) {
            const [nx, ny, nz] = facet.normal;
            stl += `facet normal ${nx.toFixed(6)} ${ny.toFixed(6)} ${nz.toFixed(6)}\n`;
            stl += `  outer loop\n`;
            for (const vertex of facet.vertices) {
                const [x, y, z] = vertex;
                stl += `    vertex ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
            }
            stl += `  endloop\n`;
            stl += `endfacet\n`;
        }
        stl += `endsolid ${name}`;
        return stl;
    }
}

// AI Model Interface - This queries REAL AI models for ANY object
class AIGeometryDesigner {
    
    async queryAIForGeometry(userRequest) {
        console.log(`🤖 Querying AI model about: "${userRequest}"`);
        
        // REAL AI INTEGRATION - Query Anthropic Claude for geometric specifications
        try {
            const aiResponse = await this.queryAnthropicClaude(userRequest);
            return JSON.parse(aiResponse);
        } catch (error) {
            console.log(`⚠️  AI service error: ${error.message}`);
            console.log('🔄 Using fallback reasoning...');
            return this.fallbackAIResponse(userRequest);
        }
    }

    async queryAnthropicClaude(userRequest) {
        const prompt = `You are a 3D CAD expert designing: "${userRequest}"

CRITICAL DESIGN RULES:
1. Parts must be CONNECTED and TOUCHING - no floating pieces
2. Use realistic proportions and human-scale dimensions  
3. Think like an engineer - how would this actually be built?
4. Position parts so they form a single cohesive object
5. Use the origin (0,0,0) as the base/center of your design

RESPOND ONLY with valid JSON in this exact format:
{
  "name": "ObjectName",
  "description": "Detailed description of your design decisions and how parts connect",
  "components": [
    {"type": "sphere", "name": "descriptive_name", "x": 0, "y": 0, "z": 15, "radius": 8},
    {"type": "cylinder", "name": "descriptive_name", "x": 0, "y": 0, "z": 25, "radius": 5, "height": 20},
    {"type": "box", "name": "descriptive_name", "x": 0, "y": 0, "z": 35, "width": 16, "height": 12, "depth": 10},
    {"type": "cone", "name": "descriptive_name", "x": 0, "y": 0, "z": 45, "bottomRadius": 6, "topRadius": 2, "height": 10}
  ]
}

DESIGN GUIDELINES:
- For humanoid robots: torso at center, head above, limbs attached to sides
- For furniture: legs supporting surfaces, proper sitting/table heights
- For vehicles: wheels touching ground, body above wheels
- For animals: body as main structure, head/limbs properly positioned
- Use Z-axis as vertical (up), X/Y for horizontal positioning
- Make sure parts OVERLAP slightly so they appear connected
- Use realistic millimeter dimensions (chair seat ~450mm high, etc.)

AVAILABLE SHAPES: sphere, cylinder, box, cone
Think step-by-step: What's the main structure? What attaches where? How do parts connect?

Design: "${userRequest}"`;

        // Hardcoded API key to fix environment variable issues
        const apiKey = "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";
        
        if (!apiKey) {
            throw new Error('API key not available');
        }

        console.log('🧠 Claude is analyzing design requirements with improved engineering guidance...');
        
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            }
        });

        const claudeResponse = response.data.content[0].text;
        console.log('✅ Claude has designed your object with better engineering!');
        
        return claudeResponse;
    }

    fallbackAIResponse(request) {
        // Emergency fallback if AI service fails
        console.log('🚨 Using basic geometric fallback...');
        return {
            name: `Fallback Design: ${request}`,
            description: `Basic geometric interpretation of ${request} (AI service unavailable)`,
            components: [
                {type: "box", name: "main_body", x: 0, y: 0, z: 10, width: 20, height: 15, depth: 20},
                {type: "sphere", name: "detail_sphere", x: 0, y: 0, z: 25, radius: 8}
            ]
        };
    }

    buildFromAISpec(generator, aiSpec) {
        console.log(`🔧 Building "${aiSpec.name}" from AI specifications...`);
        console.log(`📝 ${aiSpec.description}`);
        console.log(`🧩 Components: ${aiSpec.components.length}`);

        for (const component of aiSpec.components) {
            console.log(`   🔹 Adding ${component.name} (${component.type})`);
            
            switch (component.type) {
                case 'sphere':
                    generator.addSphere(component.x, component.y, component.z, component.radius);
                    break;
                case 'cylinder':
                    generator.addCylinder(component.x, component.y, component.z - component.height/2, 
                                        component.z + component.height/2, component.radius);
                    break;
                case 'box':
                    generator.addBox(component.x, component.y, component.z, 
                                   component.width, component.height, component.depth);
                    break;
                case 'cone':
                    generator.addCone(component.x, component.y, component.z - component.height/2,
                                    component.z + component.height/2, component.bottomRadius, component.topRadius || 0);
                    break;
            }
        }

        return aiSpec.name;
    }
}

// Main function - Truly AI-powered CAD
async function createAnything(userRequest) {
    try {
        console.log(`🎨 TRULY AI-POWERED CAD DESIGNER`);
        console.log(`📝 User Request: "${userRequest}"\n`);

        // Step 1: Query AI for geometric specifications
        const aiDesigner = new AIGeometryDesigner();
        const aiSpec = await aiDesigner.queryAIForGeometry(userRequest);
        
        console.log(`\n✅ AI designed: ${aiSpec.name}`);
        console.log(`💭 AI says: "${aiSpec.description}"`);

        // Step 2: Generate 3D geometry from AI specifications
        const generator = new UniversalSTLGenerator();
        const objectName = aiDesigner.buildFromAISpec(generator, aiSpec);
        const stlData = generator.generateSTL(objectName.toLowerCase().replace(/\s+/g, '_'));
        
        console.log(`\n🎯 Generated ${generator.facets.length} triangular faces`);

        // Step 3: Upload to OnShape
        const credentials = Buffer.from(`${ACCESS_KEY}:${SECRET_KEY}`).toString('base64');

        console.log('\n📄 Creating OnShape document...');
        const docResponse = await axios.post('https://cad.onshape.com/api/v6/documents', 
            { name: `AI-Generated: ${aiSpec.name}`, public: false },
            { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' } }
        );
        const doc = docResponse.data;

        console.log('📤 Uploading AI creation to OnShape...');
        const formData = new FormData();
        formData.append('file', Buffer.from(stlData, 'utf8'), {
            filename: `${objectName.toLowerCase()}.stl`,
            contentType: 'application/octet-stream'
        });

        await axios.post(
            `https://cad.onshape.com/api/v6/blobelements/d/${doc.id}/w/${doc.defaultWorkspace.id}`,
            formData,
            { headers: { 'Authorization': `Basic ${credentials}`, ...formData.getHeaders() } }
        );

        console.log(`\n🎉 AI CREATION COMPLETE!`);
        console.log(`🤖 AI analyzed "${userRequest}" and designed a custom ${aiSpec.name}`);
        console.log(`🌐 View your AI creation: https://cad.onshape.com/documents/${doc.id}`);
        console.log(`📋 Document ID: ${doc.id}`);
        
        return doc;

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Get user input from command line
const userRequest = process.argv.slice(2).join(' ') || 'make a dragon';

console.log(`🚀 Starting Universal AI CAD Designer...`);
createAnything(userRequest); 