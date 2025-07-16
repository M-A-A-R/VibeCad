/**
 * Professional STL Generator Module
 * Generates 3D geometric shapes and converts them to STL format
 */

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

        this.facets.push({ normal, vertices: [v1, v2, v3] });
    }

    addCylinder(radius = 10, height = 20, segments = 16) {
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

        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle(bottomCenter, bottomVertices[next], bottomVertices[i], [0, 0, -1]);
        }

        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle(topCenter, topVertices[i], topVertices[next], [0, 0, 1]);
        }

        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle(bottomVertices[i], topVertices[i], topVertices[next]);
            this.addTriangle(bottomVertices[i], topVertices[next], bottomVertices[next]);
        }

        return this;
    }

    addSphere(radius = 10, segments = 16) {
        const vertices = [];
        
        for (let i = 0; i <= segments; i++) {
            const phi = (i / segments) * Math.PI;
            for (let j = 0; j < segments; j++) {
                const theta = (j / segments) * 2 * Math.PI;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta);
                const z = radius * Math.cos(phi);
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

        return this;
    }

    addBox(width = 20, depth = 20, height = 20) {
        const w2 = width / 2;
        const d2 = depth / 2;
        const h2 = height / 2;

        const vertices = [
            [-w2, -d2, -h2], [w2, -d2, -h2], [w2, d2, -h2], [-w2, d2, -h2],
            [-w2, -d2, h2],  [w2, -d2, h2],  [w2, d2, h2],  [-w2, d2, h2]
        ];

        const faces = [
            [[0, 2, 1], [0, 3, 2]], [[4, 5, 6], [4, 6, 7]],
            [[0, 1, 5], [0, 5, 4]], [[2, 3, 7], [2, 7, 6]], 
            [[0, 4, 7], [0, 7, 3]], [[1, 2, 6], [1, 6, 5]]
        ];

        for (const face of faces) {
            for (const triangle of face) {
                this.addTriangle(vertices[triangle[0]], vertices[triangle[1]], vertices[triangle[2]]);
            }
        }

        return this;
    }

    addCone(radius = 10, height = 20, segments = 16) {
        const baseCenter = [0, 0, 0];
        const apex = [0, 0, height];
        const baseVertices = [];

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            baseVertices.push([x, y, 0]);
        }

        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle(baseCenter, baseVertices[next], baseVertices[i], [0, 0, -1]);
        }

        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.addTriangle(baseVertices[i], apex, baseVertices[next]);
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

    getStats() {
        return {
            triangles: this.facets.length,
            vertices: this.facets.length * 3
        };
    }

    clear() {
        this.facets = [];
        return this;
    }
}

module.exports = STLGenerator; 