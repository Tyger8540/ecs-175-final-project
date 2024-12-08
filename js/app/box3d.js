'use strict'

import { Object3D } from '../../assignment3.object3d.js'

class Box extends Object3D {

    /**
     * Creates a 3D box from 8 vertices and draws it as a line mesh
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     */
    constructor( gl, shader, box_scale = [1,1,1] ) 
    {
        let vertices = [
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0
        ]

        for (let i = 0; i < vertices.length; i++) {
            vertices[i] = vertices[i] * box_scale[i%3]
        }

        let indices = [
            0, 1, 2, 0, 2, 3, // bottom
            0, 1, 5, 0, 5, 4, // front
            1, 2, 6, 1, 6, 5, // right
            3, 2, 6, 3, 6, 7, // back
            0, 3, 7, 0, 7, 4, // left
            4, 5, 6, 4, 6, 7, // top
        ]

        super( gl, shader, vertices, indices, gl.TRIANGLES )
    }

    /**
     * Perform any necessary updates. 
     * Children can override this.
     * 
     */
    udpate( ) 
    {
        return
    }


    update_position(position) {
        this.shader.use( )
        this.shader.setUniform3f("u_displacement", position)
        this.shader.unuse( )
    }
}

export default Box  
