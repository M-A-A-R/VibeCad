// Natural Language CAD Generator - "Please CAD a chair"
const axios = require('axios');
const FormData = require('form-data');

// Your API keys
const ACCESS_KEY = 'QlSdGFPgKpR0s0s9lMQFWdw3';
const SECRET_KEY = 'WLLVf9rJanAnpDQ88l9nmvYsplZOTgHHx4Yplt1lgvYv0CPL';

// STL Generator (same as before)
class STLGenerator {
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

    addBox(x1, y1, z1, x2, y2, z2) {
        // Generate a rectangular box from (x1,y1,z1) to (x2,y2,z2)
        const vertices = [
            [x1, y1, z1], [x2, y1, z1], [x2, y2, z1], [x1, y2, z1], // Bottom face
            [x1, y1, z2], [x2, y1, z2], [x2, y2, z2], [x1, y2, z2]  // Top face
        ];

        // Define faces (each face = 2 triangles)
        const faces = [
            // Bottom face (z1)
            [[0,1,2], [0,2,3]],
            // Top face (z2)  
            [[4,6,5], [4,7,6]],
            // Front face (y1)
            [[0,4,5], [0,5,1]],
            // Back face (y2)
            [[2,6,7], [2,7,3]], 
            // Left face (x1)
            [[0,3,7], [0,7,4]],
            // Right face (x2)
            [[1,5,6], [1,6,2]]
        ];

        for (const face of faces) {
            for (const triangle of face) {
                this.addTriangle(
                    vertices[triangle[0]],
                    vertices[triangle[1]], 
                    vertices[triangle[2]]
                );
            }
        }
    }

    generateSTL(name = "generated_object") {
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

// Natural Language Parser
class NaturalLanguageCAD {
    
    parseRequest(userInput) {
        const input = userInput.toLowerCase();
        console.log(`🧠 Parsing: "${userInput}"`);

        // Chair detection and parsing
        if (input.includes('chair')) {
            return this.parseChair(input);
        }
        
        // Table detection
        if (input.includes('table')) {
            return this.parseTable(input);
        }

        // Box/cube detection
        if (input.includes('box') || input.includes('cube')) {
            return this.parseBox(input);
        }

        // Default fallback
        return {
            type: 'box',
            description: 'Simple box (default)',
            parameters: { width: 20, depth: 20, height: 20 }
        };
    }

    parseChair(input) {
        console.log('🪑 Detected: CHAIR');
        
        // Extract dimensions from text (basic pattern matching)
        const widthMatch = input.match(/(\d+)\s*(mm|cm|inch)?\s*(wide|width)/);
        const heightMatch = input.match(/(\d+)\s*(mm|cm|inch)?\s*(tall|high|height)/);
        const styleMatch = input.match(/(office|dining|simple|basic)/);

        const params = {
            seatWidth: widthMatch ? parseInt(widthMatch[1]) : 40,
            seatDepth: 35,
            seatHeight: 45,
            backHeight: 40,
            legThickness: 3,
            style: styleMatch ? styleMatch[1] : 'simple'
        };

        console.log('📐 Chair parameters:', params);
        return {
            type: 'chair',
            description: `${params.style} chair (${params.seatWidth}mm wide)`,
            parameters: params
        };
    }

    parseTable(input) {
        console.log('🪟 Detected: TABLE');
        return {
            type: 'table',
            description: 'Simple table',
            parameters: { width: 60, depth: 40, height: 30, legThickness: 4 }
        };
    }

    parseBox(input) {
        console.log('📦 Detected: BOX');
        
        const sizeMatch = input.match(/(\d+)\s*(mm|cm|inch)?/);
        const size = sizeMatch ? parseInt(sizeMatch[1]) : 20;
        
        return {
            type: 'box',
            description: `${size}mm cube`,
            parameters: { width: size, depth: size, height: size }
        };
    }

    generateGeometry(parsedRequest) {
        const generator = new STLGenerator();
        const { type, parameters } = parsedRequest;

        console.log(`🔧 Generating ${type} geometry...`);

        if (type === 'chair') {
            this.generateChair(generator, parameters);
        } else if (type === 'table') {
            this.generateTable(generator, parameters);
        } else if (type === 'box') {
            this.generateBox(generator, parameters);
        }

        return generator.generateSTL(type);
    }

    generateChair(generator, params) {
        const { seatWidth, seatDepth, seatHeight, backHeight, legThickness } = params;
        
        console.log(`🪑 Building chair: ${seatWidth}×${seatDepth}×${seatHeight}mm`);

        // Seat (rectangular box)
        generator.addBox(
            -seatWidth/2, -seatDepth/2, seatHeight,
            seatWidth/2, seatDepth/2, seatHeight + 3
        );

        // Backrest
        generator.addBox(
            -seatWidth/2, seatDepth/2 - 3, seatHeight,
            seatWidth/2, seatDepth/2, seatHeight + backHeight
        );

        // 4 Legs
        const legPositions = [
            [-seatWidth/2 + legThickness, -seatDepth/2 + legThickness],
            [seatWidth/2 - legThickness, -seatDepth/2 + legThickness], 
            [-seatWidth/2 + legThickness, seatDepth/2 - legThickness],
            [seatWidth/2 - legThickness, seatDepth/2 - legThickness]
        ];

        for (const [x, y] of legPositions) {
            generator.addBox(
                x - legThickness/2, y - legThickness/2, 0,
                x + legThickness/2, y + legThickness/2, seatHeight
            );
        }
    }

    generateTable(generator, params) {
        // Similar to chair but different proportions
        console.log('🪟 Building table...');
        generator.addBox(-params.width/2, -params.depth/2, 0, params.width/2, params.depth/2, params.height);
    }

    generateBox(generator, params) {
        console.log('📦 Building box...');
        generator.addBox(-params.width/2, -params.depth/2, 0, params.width/2, params.depth/2, params.height);
    }
}

// Main function
async function processNaturalLanguageCAD(userInput) {
    try {
        console.log(`🎨 Natural Language CAD: "${userInput}"\n`);

        // Parse the request
        const nlp = new NaturalLanguageCAD();
        const parsed = nlp.parseRequest(userInput);
        
        console.log(`✅ Understood: ${parsed.description}`);

        // Generate geometry
        const stlData = nlp.generateGeometry(parsed);
        console.log(`✅ Generated STL with ${stlData.split('facet').length - 1} triangles`);

        // Upload to OnShape
        const credentials = Buffer.from(`${ACCESS_KEY}:${SECRET_KEY}`).toString('base64');

        console.log('📄 Creating OnShape document...');
        const docResponse = await axios.post('https://cad.onshape.com/api/v6/documents', 
            { name: `NL-CAD: ${parsed.description}`, public: false },
            { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' } }
        );
        const doc = docResponse.data;

        console.log('📤 Uploading to OnShape...');
        const formData = new FormData();
        formData.append('file', Buffer.from(stlData, 'utf8'), {
            filename: `${parsed.type}.stl`,
            contentType: 'application/octet-stream'
        });

        await axios.post(
            `https://cad.onshape.com/api/v6/blobelements/d/${doc.id}/w/${doc.defaultWorkspace.id}`,
            formData,
            { headers: { 'Authorization': `Basic ${credentials}`, ...formData.getHeaders() } }
        );

        console.log(`\n🎉 SUCCESS! Your ${parsed.description} is ready!`);
        console.log(`🌐 View it here: https://cad.onshape.com/documents/${doc.id}`);
        console.log(`📋 Document ID: ${doc.id}`);
        
        return doc;

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Get user input from command line
const userRequest = process.argv.slice(2).join(' ') || 'please cad a chair';

console.log(`🚀 Processing: "${userRequest}"`);
processNaturalLanguageCAD(userRequest); 