require('dotenv').config();
const STLGenerator = require('../src/core/stl-generator');
const OnShapeClient = require('../src/core/onshape-client');

const ACCESS_KEY = process.env.ONSHAPE_ACCESS_KEY;
const SECRET_KEY = process.env.ONSHAPE_SECRET_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
    console.error(' Missing OnShape API credentials!');
    console.error('Please set ONSHAPE_ACCESS_KEY and ONSHAPE_SECRET_KEY in your .env file');
    process.exit(1);
}

async function generateShape(shapeType = 'cylinder') {
    console.log(`🔧 Generating ${shapeType}...`);

    try {
        const generator = new STLGenerator();
        let shapeName = '';
        
        switch (shapeType.toLowerCase()) {
            case 'cylinder':
                generator.addCylinder(15, 30, 20);
                shapeName = 'Generated_Cylinder';
                break;
                
            case 'sphere':
                generator.addSphere(20, 16);
                shapeName = 'Generated_Sphere';
                break;
                
            case 'box':
                generator.addBox(40, 30, 20);
                shapeName = 'Generated_Box';
                break;
                
            case 'cone':
                generator.addCone(20, 35, 16);
                shapeName = 'Generated_Cone';
                break;
                
            case 'multi':
                generator.addBox(30, 30, 10);
                
                const positions = [[10, 10, 10], [-10, 10, 10], [10, -10, 10], [-10, -10, 10]];
                positions.forEach(([x, y, z]) => {
                    const cornerGen = new STLGenerator();
                    cornerGen.addCylinder(5, 25, 12);
                    for (const facet of cornerGen.facets) {
                        for (const vertex of facet.vertices) {
                            vertex[0] += x;
                            vertex[1] += y;
                            vertex[2] += z;
                        }
                    }
                    generator.facets.push(...cornerGen.facets);
                });
                
                shapeName = 'Multi_Shape_Assembly';
                break;
                
            default:
                throw new Error(`Unknown shape type: ${shapeType}`);
        }
        
        const stats = generator.getStats();
        const stlData = generator.generateSTL(shapeName);
        
        const client = new OnShapeClient(ACCESS_KEY, SECRET_KEY);
        const result = await client.uploadSTL(stlData, `${shapeName}.stl`, `Example: ${shapeName}`);
        
        console.log('✅ Shape generated successfully!');
        console.log(`📄 Document ID: ${result.document.id}`);
        console.log(`🌐 View: ${result.url}`);
        console.log(`📊 ${stats.triangles} triangles, ${stats.vertices} vertices`);
        
        return result.document.id;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    const shapeType = process.argv[2] || 'cylinder';
    
    if (shapeType === '--help' || shapeType === '-h') {
        
        console.log('Usage: npm run example:shapes [SHAPE_TYPE]');
        console.log('Available shapes: cylinder, sphere, box, cone, multi');
        console.log('Examples:');
        console.log('  npm run example:shapes');
        console.log('  npm run example:shapes sphere');
        console.log('  npm run example:shapes multi');
        process.exit(0);
    }
    
    generateShape(shapeType);
}

module.exports = { generateShape }; 