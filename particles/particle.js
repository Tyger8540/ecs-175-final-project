import * as vec3 from "../js/lib/glmatrix/vec3.js"
import * as mat4 from "../js/lib/glmatrix/mat4.js"
import Texture from "../assignment3.texture.js"
import Shader from "../js/utils/shader.js"


class Particle {
    /**
     * An instance of a particle as a quad.
     * @param {vec3} position
     * @param {vec3} velocity
     * @param {vec3} acceleration
     * 
     * @param {float} rotation_speed
     * @param {vec3} rotation_axis
     * 
     * @param {float} gravity
     *  
     * @param {vec3} color
     * @param {float} size
     * @param {float} lifetime
     * 
     * 
     * @param {Texture} texture
     * @param {Shader} shader
     * @param {WebGL2RenderingContext} gl
     */
    constructor( position, velocity, acceleration, rotation_speed, rotation_axis, gravity, color, size, lifetime, texture, shader, gl ) {
        this.position = vec3.clone(position)
        this.velocity = vec3.clone(velocity)
        this.acceleration = vec3.clone(acceleration)

        this.rotation_speed = rotation_speed
        this.rotation_axis = vec3.clone(rotation_axis)
        this.rotation = 0.0
        this.rotation_matrix = mat4.create()
        
        this.gravity = gravity
        this.gravity_vector = vec3.scale( vec3.create(), vec3.fromValues(0, -1, 0), this.gravity )

        this.color = color

        this.size = size

        this.vertices = this.calculateVertices( size )
        this.vertices_buffer = null

        this.indices = [
            0, 1, 2,
            2, 3, 0
        ]
        this.index_buffer = null

        this.vertex_array_object = null

        this.lifetime = lifetime
        this.age = 0.0

        this.texture = texture
        this.shader = shader

        //console.log(gl)

        this.createVBO( gl )
        this.createIBO( gl )
        this.createVAO( gl )
    }


    /**
     * Updates the properties of the particle with respect to delta time.
     * @param {float} delta 
     */
    update( delta ) {

        vec3.add( this.position, this.position, vec3.scale(vec3.create(), this.velocity, delta) )
        vec3.add( this.velocity, this.velocity, vec3.scale(vec3.create(), this.acceleration, delta) )
        //console.log(this.acceleration)
        vec3.add( this.velocity, this.velocity, vec3.scale(vec3.create(), this.gravity_vector, delta) )

        this.rotation += this.rotation_speed * delta
        mat4.fromRotation( this.rotation_matrix, this.rotation, this.rotation_axis )

        this.age += delta

    }


    /**
     * Renders the particle.
     * @param {WebGL2RenderingContext} gl 
     */
    render( gl ) {

        
        this.shader.use()

        gl.bindVertexArray( this.vertex_array_object )
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.index_buffer)

        this.shader.setUniform3f( "u_normal", vec3.fromValues(1, 0, 0) )
        this.shader.setUniform3f( "u_displacement", this.position )
        this.shader.setUniform4x4f( "u_r", this.rotation_matrix )

        gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0 )

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null)
        gl.bindVertexArray( null )

        this.shader.unuse()
    }


    /**
     * Calculates the vertices given size.
     * @param {float} s 
     * @returns {Array}
     */
    calculateVertices( s ) {
        
        let verts = [
            vec3.fromValues(0, 0.5, 0.5),
            vec3.fromValues(0, -0.5, 0.5),
            vec3.fromValues(0, -0.5, -0.5),
            vec3.fromValues(0, 0.5, -0.5)
        ]

        let result = []

        for (let i = 0; i < verts.length; i++) {
            result.push(...vec3.scale(vec3.create(), verts[i], s))
        }

        return result
    }


    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    createVBO( gl ) {
        this.vertices_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }


    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    createIBO( gl ) {
        this.index_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    }


    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    createVAO( gl ) {
        this.vertex_array_object = gl.createVertexArray()

        let location = null;
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices_buffer)
        gl.bindVertexArray(this.vertex_array_object)

        location = this.shader.getAttributeLocation( "a_position" )
        if (location >= 0) {
            gl.enableVertexAttribArray( location )
            gl.vertexAttribPointer( location, 3, gl.FLOAT, false, 0, 0)
        }
        
        gl.bindVertexArray(null)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }
}

export default Particle