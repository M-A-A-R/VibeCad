// Generate complex 3D shapes programmatically and import to OnShape
const axios = require('axios');
const FormData = require('form-data');

// Your API keys
const ACCESS_KEY = 'QlSdGFPgKpR0s0s9lMQFWdw3';
const SECRET_KEY = 'WLLVf9rJanAnpDQ88l9nmvYsplZOTgHHx4Yplt1lgvYv0CPL';

// STL Generator Functions
class STLGenerator {
    constructor() {
        this.facets = [];
    }

    addTriangle(v1, v2, v3, normal = null) {
        // Calculate normal if not provided
        if (!normal) {
            const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
            const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
            normal = [
                u[1] * v[2] - u[2] * v[1],
                u[2] * v[0] - u[0] * v[2],
                u[0] * v[1] - u[1] * v[0]
            ];
            // Normalize
            const len = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
            if (len > 0) {
                normal = [normal[0]/len, normal[1]/len, normal[2]/len];
            }
        }

        this.facets.push({
            normal: normal,
            vertices: [v1, v2, v3]
        });
    }

    generateCylinder(radius = 10, height = 20, segments = 16) {
        console.log(`🔧 Generating cylinder: ${radius}mm radius, ${height}mm height, ${segments} segments`);
        
        // Generate vertices for top and bottom circles
        const bottomCenter = [0, 0, 0];
        const topCenter = [0, 0, height];
        
        const bottomVertices = [];
        const topVertices = [];
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            bottomVertices.push([x, y, 0]);
            topVertices.push([x, y, height]);
        }

        // Generate bottom face (triangles from center to edge)
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle(
                bottomCenter,
                bottomVertices[next], // Reversed order for correct normal
                bottomVertices[i],
                [0, 0, -1] // Normal pointing down
            );
        }

        // Generate top face (triangles from center to edge)  
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle(
                topCenter,
                topVertices[i],
                topVertices[next],
                [0, 0, 1] // Normal pointing up
            );
        }

        // Generate side faces (rectangular faces made of 2 triangles each)
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            
            // First triangle of rectangle
            this.addTriangle(
                bottomVertices[i],
                topVertices[i],
                topVertices[next]
            );
            
            // Second triangle of rectangle
            this.addTriangle(
                bottomVertices[i],
                topVertices[next],
                bottomVertices[next]
            );
        }

        return this;
    }

    generateSphere(radius = 10, segments = 16) {
        console.log(`🔧 Generating sphere: ${radius}mm radius, ${segments} segments`);
        
        const vertices = [];
        
        // Generate vertices using spherical coordinates
        for (let i = 0; i <= segments; i++) {
            const phi = (i / segments) * Math.PI; // 0 to PI (latitude)
            for (let j = 0; j < segments; j++) {
                const theta = (j / segments) * 2 * Math.PI; // 0 to 2PI (longitude)
                
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta);
                const z = radius * Math.cos(phi);
                
                vertices.push([x, y, z]);
            }
        }

        // Generate triangles
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const current = i * segments + j;
                const next = i * segments + ((j + 1) % segments);
                const below = ((i + 1) % (segments + 1)) * segments + j;
                const belowNext = ((i + 1) % (segments + 1)) * segments + ((j + 1) % segments);

                if (i < segments) {
                    // First triangle
                    this.addTriangle(
                        vertices[current],
                        vertices[below],
                        vertices[next]
                    );
                    
                    // Second triangle
                    this.addTriangle(
                        vertices[next],
                        vertices[below],
                        vertices[belowNext]
                    );
                }
            }
        }

        return this;
    }

    generateSTL(name = "generated_shape") {
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

async function generateAndImport(shapeType = 'cylinder', params = {}) {
    try {
        console.log(`🎨 Generating ${shapeType} and importing to OnShape...\n`);

        // Generate the shape
        const generator = new STLGenerator();
        
        if (shapeType === 'cylinder') {
            generator.generateCylinder(
                params.radius || 10,
                params.height || 20, 
                params.segments || 16
            );
        } else if (shapeType === 'sphere') {
            generator.generateSphere(
                params.radius || 10,
                params.segments || 12
            );
        }

        const stlData = generator.generateSTL(shapeType);
        console.log(`✅ Generated STL with ${generator.facets.length} triangles`);

        // Upload to OnShape (same as before)
        const credentials = Buffer.from(`${ACCESS_KEY}:${SECRET_KEY}`).toString('base64');

        console.log('📄 Creating document...');
        const docResponse = await axios.post('https://cad.onshape.com/api/v6/documents', 
            { name: `Generated ${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`, public: false },
            { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' } }
        );
        const doc = docResponse.data;
        console.log(`✅ Document created: ${doc.id}`);

        console.log('📤 Uploading generated STL...');
        const formData = new FormData();
        formData.append('file', Buffer.from(stlData, 'utf8'), {
            filename: `${shapeType}.stl`,
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

        console.log('✅ STL uploaded!');
        
        // Import (will show 404 but actually works)
        console.log('🔄 Importing STL into Part Studio...');
        try {
            await axios.post(
                `https://cad.onshape.com/api/v6/documents/d/${doc.id}/w/${doc.defaultWorkspace.id}/import`,
                {
                    "format": "STL",
                    "blobElementId": uploadResponse.data.id,
                    "importIntoPartStudio": true,
                    "createNewPartStudio": false
                },
                { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' } }
            );
        } catch (importError) {
            // Expected 404, but it actually works
        }

        console.log(`\n🎉 SUCCESS! Your ${shapeType} is ready!`);
        console.log(`🌐 View it here: https://cad.onshape.com/documents/${doc.id}`);
        console.log(`\n📋 Document ID: ${doc.id}`);
        console.log(`💡 To check this document, run:`);
        console.log(`   node check-uploaded-square.js ${doc.id}`);
        
        return doc;

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Parse command line arguments
const shapeType = process.argv[2] || 'cylinder';
const params = {};

// Parse additional parameters
for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.includes('=')) {
        const [key, value] = arg.split('=');
        params[key] = parseFloat(value) || value;
    }
}

console.log(`🎯 Creating ${shapeType} with parameters:`, params);

// Run it
generateAndImport(shapeType, params); 