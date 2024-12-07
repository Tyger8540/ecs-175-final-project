import * as vec3 from "../js/lib/glmatrix/vec3.js"
import Texture from "../assignment3.texture.js"
import Shader from "../js/utils/shader.js"
import Particle from "./particle.js"


class Emitter {
    /**
     * An emitter that instantiates particles with constructed properties.
     * @param {vec3} position 
     * @param {vec3} initial_velocity 
     * @param {vec3} linear_acceleration 
     * @param {float} gravity 
     * @param {int} max_particles 
     * @param {float} period 
     * @param {*} color 
     * @param {float} size
     * @param {Texture} texture 
     * @param {Shader} shader 
     * @param {WebGL2RenderingContext} gl 
     */
    constructor( position, initial_velocity, linear_acceleration, gravity, max_particles, period, color, size, lifetime, texture, shader, gl ) {
        this.list_particles = []
        this.timer = 0.0

        this.position = position
        this.initial_velocity = initial_velocity
        this.linear_acceleration = linear_acceleration
        this.gravity = gravity

        this.max_particles = max_particles
        this.period = period
        this.size = size
        this.lifetime = lifetime

        this.texture = texture
        this.shader = shader
        this.gl = gl
    }

    update ( delta ) {
        //console.log("asdfasdfasdf")
        if ( this.list_particles.length < this.max_particles ){
            this.timer += delta
            if ( this.timer >= this.period ) {
                this.timer -= this.period
                    this.list_particles.push( new Particle(this.position, this.initial_velocity, this.linear_acceleration, this.gravity, 0, this.size,
                        this.lifetime, this.texture, this.shader, this.gl))
            }
        }

        for ( let i = 0; i < this.list_particles.length; i++ ) {
            this.list_particles[i].update( delta, this.gl )
            console.log(this.list_particles[i].acceleration)
        }
    }

    render( gl ) {
        for ( let i = 0; i < this.list_particles.length; i++ ) {
            this.list_particles[i].render( gl )
        }
    }
        
}

export default Emitter