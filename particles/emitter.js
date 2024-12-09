import * as vec3 from "../js/lib/glmatrix/vec3.js"
import Texture from "../assignment3.texture.js"
import Shader from "../js/utils/shader.js"
import Particle from "./particle.js"
import * as mat4 from "../js/lib/glmatrix/mat4.js"


class Emitter {
    /**
     * Emitter that creates particles.
     * @param {vec3} offset Center point of particle spawn area.
     * @param {vec3} spawn_radius Defines a vec3 rectangular volume of possible spawns.
     * @param {float} speed Initial speed of the particle.
     * @param {float} speed_variance Minimum variance of speed. Defined from 0 to 1.
     * @param {vec3} initial_direction Initial velocity direction as a vector.
     * @param {float} velocity_spread Defines the maximum angle at which the velocity direction will be altered.
     * @param {vec3} linear_acceleration Acceleration of the particle.
     * @param {float} gravity Added -y acceleration of the particle.
     * @param {bool} rotate_to_velocity If enabled, ignores all rotation parameters, rotates (0, 0, 1) to velocity.
     * @param {float} rotation_speed Initial rotation speed of the particle.
     * @param {float} rotation_speed_variance Minimum variance of rotation speed. Defined from 0 to 1.
     * @param {vec3} rotation_axis Rotation axis as a vector.
     * @param {float} rotation_spread Defines the maximum angle at which the rotation axis will be altered.
     * @param {int} max_particles The maximum number of particles that can exist at a time.
     * @param {float} period The time between each instantiation of a particle.
     * @param {vec3} color The color of a particle as a vec3.
     * @param {vec3} size The dimensions of the particle.
     * @param {float} lifetime The time that the particle will exist in the world.
     * @param {Shader} shader The shaders that the particle will use.
     */
    constructor( offset, spawn_radius, speed, speed_variance, initial_direction, velocity_spread, linear_acceleration, gravity,
        rotate_to_velocity, rotation_speed, rotation_speed_variance, rotation_axis, rotation_spread, 
        max_particles, period, color, size, lifetime, shader ) {

        this.list_particles = []
        this.active = false
        this.timer = 0.0

        this.emitter_position = vec3.create()
        this.offset = vec3.clone(offset)
        this.spawn_radius = vec3.clone(spawn_radius)
        this.speed = speed
        this.initial_direction = vec3.normalize(vec3.create(), initial_direction)
        this.linear_acceleration = vec3.clone(linear_acceleration)
        this.gravity = gravity

        this.velocity_spread = velocity_spread
        this.rotation_spread = rotation_spread
        this.speed_variance = speed_variance
        this.rotation_speed_variance = rotation_speed_variance

        this.rotate_to_velocity = rotate_to_velocity
        this.rotation_speed = rotation_speed
        this.rotation_axis = vec3.clone(rotation_axis)

        this.max_particles = max_particles
        this.period = period

        this.color = color

        this.size = size
        this.lifetime = lifetime

        this.shader = shader
    }

    update ( delta, gl ) {
        //console.log("asdfasdfasdf")
        if ( this.list_particles.length < this.max_particles && this.active ){
            this.timer += Math.min(delta, 0.1)
            while ( this.timer >= this.period ) {
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

        let velocity
        if (this.velocity_spread != 0) {
            let random_vector = vec3.fromValues(
                Math.sin(this.generate_random_range(-this.velocity_spread, this.velocity_spread)),
                Math.sin(this.generate_random_range(-this.velocity_spread, this.velocity_spread)),
                Math.cos(this.generate_random_range(-this.velocity_spread, this.velocity_spread))
            )
    
            let angle_diff = vec3.angle(vec3.fromValues(0, 0, 1), this.initial_direction)
            let rot_axis = vec3.cross(vec3.create(), vec3.fromValues(0, 0, 1), this.initial_direction)
            let rot_m = mat4.fromRotation(mat4.create(), angle_diff, rot_axis)
    
            let variant_speed = this.generate_random_range(this.speed * (1 - this.speed_variance), this.speed)
            velocity = vec3.scale(vec3.create(), vec3.transformMat4(vec3.create(), random_vector, rot_m), variant_speed)
        } else {
            let variant_speed = this.generate_random_range(this.speed * (1 - this.speed_variance), this.speed)
            velocity = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), this.initial_direction), variant_speed)
        }
        

        let new_rotation_axis
        if (this.rotation_spread != 0) {
            let random_vector = vec3.fromValues(
                Math.sin(this.generate_random_range(-this.rotation_spread, this.rotation_spread)),
                Math.sin(this.generate_random_range(-this.rotation_spread, this.rotation_spread)),
                Math.cos(this.generate_random_range(-this.rotation_spread, this.rotation_spread))
            )
    
            let angle_diff = vec3.angle(vec3.fromValues(0, 0, 1), this.rotation_axis)
            let rot_axis = vec3.cross(vec3.create(), vec3.fromValues(0, 0, 1), this.rotation_axis)
            let rot_m = mat4.fromRotation(mat4.create(), angle_diff, rot_axis)
            new_rotation_axis = vec3.transformMat4(vec3.create(), random_vector, rot_m)
        } else {
            new_rotation_axis = this.rotation_axis
        }

        let variant_rotation_speed = this.generate_random_range(this.rotation_speed * (1 - this.rotation_speed_variance), this.rotation_speed)
        
    
        


        let rand_box_position = []
        for (let component of this.spawn_radius) {
            rand_box_position.push(this.generate_random_range(-component/2, component/2))
        }

        let spawn_position = vec3.fromValues(rand_box_position[0], rand_box_position[1], rand_box_position[2])
        vec3.add(spawn_position, spawn_position, this.offset)
        vec3.add(spawn_position, spawn_position, this.emitter_position)


        this.list_particles.push( new Particle(spawn_position, velocity, this.linear_acceleration, this.rotate_to_velocity, variant_rotation_speed, new_rotation_axis,
            this.gravity, this.color, this.size, this.lifetime, this.shader, gl))
    }


    generate_random_range(min, max) {
        return (max - min) * Math.random() + min
    }
        

    /**
     * 
     * @param {vec3} posiion 
     */
    update_position(posiion) {
        this.emitter_position = posiion
    }


    disable() {
        this.active = false
    }

    
    enable() {
        this.active = true
    }
}

class OneShotEmitter extends Emitter {
    constructor( offset, spawn_radius, speed, speed_variance, initial_direction, velocity_spread, linear_acceleration, gravity,
        rotate_to_velocity, rotation_speed, rotation_speed_variance, rotation_axis, rotation_spread, 
        max_particles, num_particles, period, color, size, lifetime, shader ) {

        super( offset, spawn_radius, speed, speed_variance, initial_direction, velocity_spread, linear_acceleration, gravity,
                rotate_to_velocity, rotation_speed, rotation_speed_variance, rotation_axis, rotation_spread, 
                max_particles, period, color, size, lifetime, shader )
            
        this.num_particles = num_particles

    }
    
    update ( delta, gl ) {
        if ( this.list_particles.length < this.max_particles && this.active && this.num_particles > 0){
            this.timer += Math.min(delta, 0.1)
            while ( this.timer >= this.period ) {
                this.timer -= this.period
                this.instantiate_particle( gl )
                this.num_particles -= 1
            }
        }

        for ( let i = 0; i < this.list_particles.length; i++ ) {
            this.list_particles[i].update( delta )
            if (this.list_particles[i].isDead()) {
                this.list_particles.splice(i, 1)
            }
        }
    }
    
    isDone() {
        if ( this.num_particles <= 0 && this.list_particles.length <= 0 && this.timer > 0 ) {
            return true
        } else {
            return false
        }
    }

    enable() {
        this.active = true
        this.timer = this.period
    }

}

export {
    Emitter,
    OneShotEmitter
}

