import * as vec3 from "../js/lib/glmatrix/vec3.js"
import Texture from "../assignment3.texture.js"
import Shader from "../js/utils/shader.js"
import Particle from "./particle.js"
import * as mat4 from "../js/lib/glmatrix/mat4.js"


class Emitter {
    /**
     * An emitter that instantiates particles with constructed properties.
     * @param {vec3} position 
     * @param {vec3} initial_velocity 
     * @param {vec3} linear_acceleration 
     * 
     * @param {float} rotation_speed
     * @param {vec3} rotation_axis
     * 
     * @param {float} gravity 
     * 
     * @param {int} max_particles 
     * @param {float} period 
     * 
     * @param {*} color 
     * @param {float} size
     * 
     * @param {Texture} texture 
     * @param {Shader} shader 
     * @param {WebGL2RenderingContext} gl 
     */
    constructor( position, speed, initial_direction, linear_acceleration, rotation_speed, rotation_axis, gravity, max_particles, period, color, size, lifetime, texture, shader ) {
        this.list_particles = []
        this.timer = 0.0

        this.position = vec3.clone(position)
        this.speed = speed
        this.initial_direction = vec3.normalize(vec3.create(), initial_direction)
        this.linear_acceleration = vec3.clone(linear_acceleration)
        this.gravity = gravity

        this.velocity_spread = 0.3
        this.rotation_spread = 1
        this.speed_variance = 0.5
        this.rotation_speed_variance = 0.5

        this.rotation_speed = rotation_speed
        this.rotation_axis = vec3.clone(rotation_axis)

        this.max_particles = max_particles
        this.period = period
        this.size = size
        this.lifetime = lifetime

        this.texture = texture
        this.shader = shader
    }

    update ( delta, gl ) {
        //console.log("asdfasdfasdf")
        if ( this.list_particles.length < this.max_particles ){
            this.timer += delta
            if ( this.timer >= this.period ) {
                this.timer -= this.period
                this.instantiate_particle( gl )
            }
        }

        for ( let i = 0; i < this.list_particles.length; i++ ) {
            this.list_particles[i].update( delta )
            if (this.list_particles[i].isDead()) {
                this.list_particles.splice(i, 1)
            }
        }
    }

    render( gl ) {
        for ( let i = 0; i < this.list_particles.length; i++ ) {
            this.list_particles[i].render( gl )
        }
    }


    instantiate_particle( gl ) {

        let random_vector = vec3.fromValues(
            Math.sin(this.generate_random_range(-this.velocity_spread, this.velocity_spread)),
            Math.sin(this.generate_random_range(-this.velocity_spread, this.velocity_spread)),
            Math.cos(this.generate_random_range(-this.velocity_spread, this.velocity_spread))
        )

        let angle_diff = vec3.angle(vec3.fromValues(0, 0, 1), this.initial_direction)
        let rot_axis = vec3.cross(vec3.create(), vec3.fromValues(0, 0, 1), this.initial_direction)
        let rot_m = mat4.fromRotation(mat4.create(), angle_diff, rot_axis)

        let variant_speed = this.generate_random_range(this.speed * (1 - this.speed_variance), this.speed)
        let velocity = vec3.scale(vec3.create(), vec3.transformMat4(vec3.create(), random_vector, rot_m), variant_speed)

        random_vector = vec3.fromValues(
            Math.sin(this.generate_random_range(-this.rotation_spread, this.rotation_spread)),
            Math.sin(this.generate_random_range(-this.rotation_spread, this.rotation_spread)),
            Math.cos(this.generate_random_range(-this.rotation_spread, this.rotation_spread))
        )

        angle_diff = vec3.angle(vec3.fromValues(0, 0, 1), this.rotation_axis)
        rot_axis = vec3.cross(vec3.create(), vec3.fromValues(0, 0, 1), this.rotation_axis)
        rot_m = mat4.fromRotation(mat4.create(), angle_diff, rot_axis)

        let variant_rotation_speed = this.generate_random_range(this.rotation_speed * (1 - this.rotation_speed_variance), this.rotation_speed)
        let new_rotation_axis = vec3.scale(vec3.create(), vec3.transformMat4(vec3.create(), random_vector, rot_m), variant_rotation_speed)

        
        this.list_particles.push( new Particle(this.position, velocity, this.linear_acceleration, this.rotation_speed, new_rotation_axis,
            this.gravity, 0, this.size, this.lifetime, this.texture, this.shader, gl))
    }


    generate_random_range(min, max) {
        return (max - min) * Math.random() + min
    }
        
}

export default Emitter