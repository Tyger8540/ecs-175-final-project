'use strict'

import { Object3D } from '../../assignment3.object3d.js'

class Plane extends Object3D {

    /**
     * Creates a 3D plane from 4 vertices and draws it as a line mesh
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     */
    constructor( gl, shader, box_scale = [1,1,1] ) 
    {
        let vertices = [
            100.000000, -1.000000, -100.000000,
            100.000000, -1.000000, 100.000000,
            -100.000000, -1.000000, -100.000000,
            -100.000000, -1.000000, 100.000000
        ]

        for (let i = 0; i < vertices.length; i++) {
            vertices[i] = vertices[i] * box_scale[i%3]
        }

        let indices = [
            0, 1, 2,
            1, 2, 3
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
}

export default Plane
