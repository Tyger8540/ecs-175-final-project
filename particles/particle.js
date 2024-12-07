import * as vec3 from "../js/lib/glmatrix/vec3.js"
import * as Texture from "../assignment3.texture.js"

class Particle {
    /**
     * An instance of a particle.
     * @param {vec3} position
     * @param {vec3} normal
     * @param {vec3} velocity
     * @param {vec3} acceleration
     * @param {float} gravity
     *  
     * @param {vec3} color
     * @param {float} lifetime
     * 
     * @param {Texture} texture
     */
    constructor( position, normal, velocity, acceleration, gravity, color, lifetime, texture) {
        this.position = position
        this.velocity = velocity
        this.acceleration = acceleration
        this.gravity = gravity

        this.color = color
        this.lifetime = lifetime
        
        this.age = 0.0
        this.texture = Texture
    }

    /**
     * Updates the properties of the particle with respect to delta time.
     * @param {float} delta 
     */
    update(delta) {
        let gravity_vector = vec3.scale( vec3.create(), vec3.fromValues(0, 1, 0), this.gravity )

        vec3.add( this.position, this.position, vec3.scale(vec3.create(), this.velocity, delta) )
        vec3.add( this.velocity, this.velocity, vec3.scale(vec3.create(), this.acceleration, delta) )
        vec3.add( this.velocity, this.velocity, vec3.scale(vec3.create(), this.gravity, delta) )

        this.age += delta

    }
}