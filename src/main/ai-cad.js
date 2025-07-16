require('dotenv').config();
const STLGenerator = require('../core/stl-generator');
const OnShapeClient = require('../core/onshape-client');
const AIClient = require('../core/ai-client');

const ACCESS_KEY = process.env.ONSHAPE_ACCESS_KEY;
const SECRET_KEY = process.env.ONSHAPE_SECRET_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
    console.error(' Missing OnShape API credentials!');
    console.error('Please set ONSHAPE_ACCESS_KEY and ONSHAPE_SECRET_KEY in your .env file');
    process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
    console.error(' Missing Anthropic API key!');
    console.error('Please set ANTHROPIC_API_KEY in your .env file');
    process.exit(1);
}

function generateSTLFromDesign(designSpec) {
    const generator = new STLGenerator();
    
    for (const component of designSpec.components) {
        const { name, shape, position, dimensions } = component;
        const [offsetX, offsetY, offsetZ] = position;
        
        switch (shape) {
            case 'sphere':
                const sphereGen = new STLGenerator();
                sphereGen.addSphere(dimensions.radius, 16);
                
                for (const facet of sphereGen.facets) {
                    for (const vertex of facet.vertices) {
                        vertex[0] += offsetX;
                        vertex[1] += offsetY;
                        vertex[2] += offsetZ;
                    }
                }
                generator.facets.push(...sphereGen.facets);
                break;
                
            case 'cylinder':
                const cylinderGen = new STLGenerator();
                cylinderGen.addCylinder(dimensions.radius, dimensions.height, 16);
                
                for (const facet of cylinderGen.facets) {
                    for (const vertex of facet.vertices) {
                        vertex[0] += offsetX;
                        vertex[1] += offsetY;
                        vertex[2] += offsetZ;
                    }
                }
                generator.facets.push(...cylinderGen.facets);
                break;
                
            case 'box':
                const boxGen = new STLGenerator();
                boxGen.addBox(dimensions.width, dimensions.depth, dimensions.height);
                
                for (const facet of boxGen.facets) {
                    for (const vertex of facet.vertices) {
                        vertex[0] += offsetX;
                        vertex[1] += offsetY;
                        vertex[2] += offsetZ;
                    }
                }
                generator.facets.push(...boxGen.facets);
                break;
                
            case 'cone':
                const coneGen = new STLGenerator();
                coneGen.addCone(dimensions.radius, dimensions.height, 16);
                
                for (const facet of coneGen.facets) {
                    for (const vertex of facet.vertices) {
                        vertex[0] += offsetX;
                        vertex[1] += offsetY;
                        vertex[2] += offsetZ;
                    }
                }
                generator.facets.push(...coneGen.facets);
                break;
        }
    }
    
    return generator.generateSTL(designSpec.name);
}

async function generateAICAD(userRequest) {
    console.log(` Generating: "${userRequest}"`);

    try {
        const aiClient = new AIClient(ANTHROPIC_API_KEY);
        const onshapeClient = new OnShapeClient(ACCESS_KEY, SECRET_KEY);
        
        let designSpec;
        try {
            designSpec = await aiClient.generateCADDesign(userRequest);
            console.log(` AI Design: ${designSpec.name} (${designSpec.components.length} components)`);
        } catch (aiError) {
            console.log('  AI failed, using fallback design');
            designSpec = aiClient.generateFallbackDesign(userRequest);
        }
        
        const stlData = generateSTLFromDesign(designSpec);
        const result = await onshapeClient.uploadSTL(
            stlData,
            `${designSpec.name}.stl`,
            `AI Generated: ${designSpec.name}`
        );
        
        console.log('\n worked!');
        console.log(` Document ID: ${result.document.id}`);
        console.log(` View: ${result.url}`);
        console.log(` ${designSpec.components.length} components, ${stlData.split('facet normal').length - 1} faces`);
        
        return result.document.id;
        
    } catch (error) {
        console.error('\n Error:', error.message);
        if (error.message.includes('API key')) {
            console.error(' Check your API keys in .env file');
        }
        process.exit(1);
    }
}

if (require.main === module) {
    const userRequest = process.argv.slice(2).join(' ');
    
    if (!userRequest) {
        
        console.log('Usage: npm run ai "your design request"');
        console.log('Examples:');
        console.log('  npm run ai "design a robot"');
        console.log('  npm run ai "create a coffee mug"');
        console.log('  npm run ai "make a spaceship"');
        process.exit(0);
    }
    
    generateAICAD(userRequest);
}

module.exports = { generateAICAD }; 