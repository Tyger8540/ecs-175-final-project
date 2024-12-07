import { Object3D } from '../assignment3.object3d.js'
import * as mat4 from '../js/lib/glmatrix/mat4.js'

const CHUNK_SIZE = 16

// chunk is a 3d array of voxel colors. null means voxel is air
class VoxelChunk {
    constructor(gl, shader) {
        // webgl
        this.gl = gl
        this.shader = shader
        this.vertices_buffer = gl.createBuffer();
        this.index_buffer = gl.createBuffer();
        this.vertex_array_object = gl.createVertexArray();

        // voxel
        this.voxels = Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE).fill(null)

        this.regenerateBuffers(this.gl, this.shader)
    }

    getIndex(x, y, z) {
        return z * CHUNK_SIZE * CHUNK_SIZE + y * CHUNK_SIZE + x
    }

    getVoxel(localX, localY, localZ) {
        return this.voxels[this.getIndex(localX, localY, localZ)]
    }

    setVoxel(localX, localY, localZ, color) {
        this.voxels[this.getIndex(localX, localY, localZ)] = color
    }

    regenerateBuffers(gl, shader) {
        // create vertex and index arrays
        this.vertices = []
        this.indices = []
        for (let z = 0; z < CHUNK_SIZE; z++) {
            for (let y = 0; y < CHUNK_SIZE; y++) {
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    // return if voxel at (x, y, z) is air
                    const color = this.getVoxel(x, y, z)
                    if (color === null) {
                        continue
                    }

                    // instantiate a cube relative to coords
                    const newVertices = [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]]
                    const newIndices = [
                        [0, 1, 2], [0, 2, 3], // bottom
                        [0, 1, 5], [0, 5, 4], // front
                        [1, 2, 6], [1, 6, 5], // right
                        [3, 2, 6], [3, 6, 7], // back
                        [0, 3, 7], [0, 7, 4], // left
                        [4, 5, 6], [4, 6, 7], // top
                    ]

                    // push newIndices flattened, relative to indexOffset
                    const indexOffset = this.vertices.length / 6
                    newIndices.forEach(arr => {
                        const toPush = [arr[0] + indexOffset, arr[1] + indexOffset, arr[2] + indexOffset]
                        this.indices.push(...toPush)
                    })

                    // push newVertices flattened, relative to (x, y, z)
                    newVertices.forEach(arr => {
                        const positionPush = [arr[0] + x, arr[1] + y, arr[2] + z]
                        this.vertices.push(...positionPush)

                        // push color
                        this.vertices.push(...color)
                    })
                }
            }
        }

        // Creates vertex buffer object for vertex data
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertices_buffer )
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW )
        gl.bindBuffer( gl.ARRAY_BUFFER, null );

        // Creates index buffer object for vertex data
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.index_buffer )
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW )
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null )

        // Sets up a vertex attribute object that is used during rendering to automatically tell WebGL how to access our buffers
        gl.bindVertexArray(this.vertex_array_object);
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertices_buffer )

        let a_position = shader.getAttributeLocation( 'a_position' )
        if (a_position >= 0) {
            gl.enableVertexAttribArray(a_position)
            gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 4 * 6, 0)
        }

        let a_color = shader.getAttributeLocation( 'a_color' )
        if (a_color >= 0) {
            gl.enableVertexAttribArray(a_color)
            gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 4 * 6, 4 * 3)
        }

        gl.bindVertexArray( null )
        gl.bindBuffer( gl.ARRAY_BUFFER, null )
    }

    render(gl, xPos, zPos)
    {
        // Bind vertex array object
        gl.bindVertexArray( this.vertex_array_object )

        // Bind index buffer
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.index_buffer )

        // set up model matrix
        const model_matrix = mat4.identity(mat4.create())
        mat4.translate(model_matrix, model_matrix, [xPos, 0, zPos])

        // Set up shader
        this.shader.use( )
        this.shader.setUniform4x4f('u_m', model_matrix)

        // Draw the element
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0 )

        // Clean Up
        gl.bindVertexArray( null )
        gl.bindBuffer( gl.ARRAY_BUFFER, null )
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null )
        this.shader.unuse( )
    }

}

export { VoxelChunk, CHUNK_SIZE }
