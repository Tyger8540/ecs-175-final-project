'use strict'

import { hex2rgb, deg2rad, loadExternalFile } from '../utils/utils.js'
// import Box from './box3d.js'
import Plane from './plane3d.js'
import Input from '../input/input.js'
import * as mat4 from '../lib/glmatrix/mat4.js'
import * as vec3 from '../lib/glmatrix/vec3.js'
import * as quat from '../lib/glmatrix/quat.js'

import { OBJLoader } from '../../assignment3.objloader.js'
import { Scene, SceneNode } from './scene.js'
import { ProcGen } from '../../procgen.js'
import ChunkManager from '../../voxel/chunkmanager.js'

import Emitter from "../../particles/emitter.js"


/**
 * @Class
 * WebGlApp that will call basic GL functions, manage a list of shapes, and take care of rendering them
 * 
 * This class will use the Shapes that you have implemented to store and render them
 */
class WebGlApp 
{
    /**
     * Initializes the app with a box, and the model, view, and projection matrices
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Map<String,Shader>} shader The shaders to be used to draw the object
     * @param {AppState} app_state The state of the UI
     */
    constructor( gl, shaders, app_state )
    {
        // Set GL flags
        this.setGlFlags( gl )

        // Store the shader(s)
        this.shaders = shaders // Collection of all shaders
        // this.box_shader = this.shaders[0]
        this.plane_shader = this.shaders[5]
        this.light_shader = this.shaders[this.shaders.length - 1]
        this.active_shader = 1
        
        // Create a box instance and create a variable to track its rotation
        // this.box = new Box( gl, this.box_shader )
        this.plane = new Plane( gl, this.plane_shader )
        this.animation_step = 0

        // Declare a variable to hold a Scene
        // Scene files can be loaded through the UI (see below)
        this.scene = null

        // Bind a callback to the file dialog in the UI that loads a scene file
        app_state.onOpen3DScene((filename) => {
            let scene_config = JSON.parse(loadExternalFile(`./scenes/${filename}`))
            this.scene = new Scene(scene_config, gl, this.shaders[this.active_shader], this.light_shader)
            return this.scene
        })

        // Create the view matrix
        this.eye     =   [2.0, 0.5, -2.0]
        this.center  =   [0, 0, 0]
       
        this.forward =   null
        this.right   =   null
        this.up      =   null
        // Forward, Right, and Up are initialized based on Eye and Center
        this.updateViewSpaceVectors()
        this.view = mat4.lookAt(mat4.create(), this.eye, this.center, this.up)

        // Create the projection matrix
        this.fovy = 60
        this.aspect = 16/9
        this.near = 0.001
        this.far = 1000.0
        this.projection = mat4.perspective(mat4.create(), deg2rad(this.fovy), this.aspect, this.near, this.far)

        // Use the shader's setUniform4x4f function to pass the matrices
        for (let shader of this.shaders) {
            shader.use()
            shader.setUniform3f('u_eye', this.eye);
            shader.setUniform4x4f('u_v', this.view)
            shader.setUniform4x4f('u_p', this.projection)
            shader.unuse()
        }
        
        this.gl = gl

        this.numChunks = 10

        this.chunkManager = new ChunkManager(this.gl, this.shaders[4], this.numChunks)        
        this.chunkManager.regenerateAllBuffers()

        this.procGen = new ProcGen()




        var zero = vec3.create()
        this.emitter = new Emitter(zero, 1, vec3.fromValues(2, 0, 0), zero, 0.5, vec3.fromValues(1, 0, 0), 0, 500, 0.2, 0, 1, 5, 0, this.shaders[6], gl)





        let width = 16
        let height = 16
        let values = this.procGen.createNoiseMap(width, height)
        this.generateTerrain()

        this.movementX = 0
        this.movementY = 0
    }

    /**
     * Generates Terrain
     */
    generateTerrain() {
        this.chunkManager = new ChunkManager(this.gl, this.shaders[4], this.numChunks)
        let width = 16 * this.numChunks
        let depth = 16 * this.numChunks
        let values = this.procGen.createNoiseMap(width, depth)

        for (let z = 0; z < depth; z++) {
            for (let x = 0; x < width; x++) {
                if (values[x + z * width] < 0.2) {
                    this.chunkManager.setVoxel(x, 0, z, null)
                } else {
                    for (let y = 0.2; y <= values[x + z * width]; y += 0.05) {
                        this.chunkManager.setVoxel(x, Math.ceil((y - 0.2) * 18.75), z, [0, 255, 0])
                    }
                    this.chunkManager.setVoxel(x, 0, z, [0, 255, 0])
                }
            }
        }
        this.chunkManager.regenerateAllBuffers()
    }

    setMovement(moveX, moveY) {
        this.movementX = moveX
        this.movementY = moveY
    }

    /**
     * Sets up GL flags
     * In this assignment we are drawing 3D data, so we need to enable the flag 
     * for depth testing. This will prevent from geometry that is occluded by other 
     * geometry from 'shining through' (i.e. being wrongly drawn on top of closer geomentry)
     * 
     * Look into gl.enable() and gl.DEPTH_TEST to learn about this topic
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     */
    setGlFlags( gl ) {

        // Enable depth test
        gl.enable(gl.DEPTH_TEST)

    }

    /**
     * Sets the viewport of the canvas to fill the whole available space so we draw to the whole canvas
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Number} width 
     * @param {Number} height 
     */
    setViewport( gl, width, height )
    {
        gl.viewport( 0, 0, width, height )
    }

    /**
     * Clears the canvas color
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     */
    clearCanvas( gl )
    {
        gl.clearColor(...hex2rgb('#000000'), 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }
    
    /**
     * Updates components of this app
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {AppState} app_state The state of the UI
     * @param {Number} delta_time The time in fractional seconds since the last frame
     */
    update( gl, app_state, delta_time ) 
    {
        // Shader
        if (this.scene != null) {
            let old_active_shader = this.active_shader
            switch(app_state.getState('Shading')) {
                case 'Phong':
                    this.active_shader = 1
                    break
                case 'Textured':
                    this.active_shader = 2
                    break
            }
            if (old_active_shader != this.active_shader) {
                this.scene.resetLights( this.shaders[this.active_shader] )
                for (let node of this.scene.getNodes()) {
                    if (node.type == 'model')
                        node.setShader(gl, this.shaders[this.active_shader])
                    if (node.type == 'light') 
                        node.setTargetShader(this.shaders[this.active_shader])
                }
            }
        }

        // Shader Debug
        switch(app_state.getState('Shading Debug')) {
            case 'Normals':
                this.shaders[this.active_shader].use()
                this.shaders[this.active_shader].setUniform1i('u_show_normals', 1)
                this.shaders[this.active_shader].unuse()
                break
            default:
                this.shaders[this.active_shader].use()
                this.shaders[this.active_shader].setUniform1i('u_show_normals', 0)
                this.shaders[this.active_shader].unuse()
                break
        }

        // Control
        switch(app_state.getState('Control')) {
            case 'Camera':
                this.updateCamera( delta_time )
                break
            case 'Scene Node':
                // Only do this if a scene is loaded
                if (this.scene == null)
                    break
                
                // Get the currently selected scene node from the UI
                let scene_node = this.scene.getNode( app_state.getState('Select Scene Node') )
                this.updateSceneNode( scene_node, delta_time )
                break
        }

        this.emitter.update(delta_time, gl)
        console.log(1/delta_time)
    }

    /**
     * Update the Forward, Right, and Up vector according to changes in the 
     * camera position (Eye) or the center of focus (Center)
     */
     updateViewSpaceVectors( ) {
        this.forward = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), this.eye, this.center))
        this.right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), [0,1,0], this.forward))
        this.up = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.forward, this.right))
    }

    /**
     * Update the camera view based on user input and the arcball viewing model
     * 
     * Supports the following interactions:
     * 1) Left Mouse Button - Rotate the view's center
     * 2) Middle Mouse Button or Space+Left Mouse Button - Pan the view relative view-space
     * 3) Right Mouse Button - Zoom towards or away from the view's center
     * 
     * @param {Number} delta_time The time in seconds since the last frame (floating point number)
     */
    updateCamera( delta_time ) {
        let view_dirty = false

        // Control - Zoom
        // if (Input.isMouseDown(2)) {
        //     // Scale camera position
        //     let translation = vec3.scale(vec3.create(), this.forward, -Input.getMouseDy() * delta_time)
        //     this.eye = vec3.add(vec3.create(), this.eye, translation)

        //     // Set dirty flag to trigger view matrix updates
        //     view_dirty = true
        // }

        // Control - Rotate
        // if (Input.isMouseDown(0) && !Input.isKeyDown(' ')) {
        //     // Rotate around xz plane around y
        //     this.eye = vec3.rotateY(vec3.create(), this.eye, this.center, deg2rad(-10 * Input.getMouseDx() * delta_time ))
            
        //     // Rotate around view-aligned rotation axis
        //     let rotation = mat4.fromRotation(mat4.create(), deg2rad(-10 * Input.getMouseDy() * delta_time ), this.right)
        //     this.eye = vec3.transformMat4(vec3.create(), this.eye, rotation)

        //     // Set dirty flag to trigger view matrix updates
        //     view_dirty = true
        // }

        // Control - Pan
        // if (Input.isMouseDown(1) || (Input.isMouseDown(0) && Input.isKeyDown(' '))) {
        //     // Create translation on two view-aligned axes
        //     let translation = vec3.add(vec3.create(), 
        //         vec3.scale(vec3.create(), this.right, -0.75 * Input.getMouseDx() * delta_time),
        //         vec3.scale(vec3.create(), this.up, 0.75 * Input.getMouseDy() * delta_time)
        //     )

        //     // Translate both eye and center in parallel
        //     this.eye = vec3.add(vec3.create(), this.eye, translation)
        //     this.center = vec3.add(vec3.create(), this.center, translation)

        //     view_dirty = true
        // }

        var movementSpeedSlider = document.getElementById("movementSpeedSlider")
        let move_speed = movementSpeedSlider.value

        var sensitivitySlider = document.getElementById("sensitivitySlider")
        let sensitivity = sensitivitySlider.value


        // Control - FPS-style Camera Rotation
        if (this.movementX != 0 || this.movementY != 0) {
            // Rotate around xz plane around y
            this.eye = vec3.rotateY(vec3.create(), this.eye, this.center, deg2rad(-sensitivity * this.movementX * delta_time ))

            // Rotate around view-aligned rotation axis
            let rotation = mat4.fromRotation(mat4.create(), deg2rad(-sensitivity * this.movementY * delta_time ), this.right)
            this.eye = vec3.transformMat4(vec3.create(), this.eye, rotation)

            // reset movementX and movementY
            this.movementX = 0
            this.movementY = 0

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - FPS-style Camera Rotation
        if (this.movementX != 0 || this.movementY != 0) {
            // Rotate around xz plane around y
            this.eye = vec3.rotateY(vec3.create(), this.eye, this.center, deg2rad(-10 * this.movementX * delta_time ))

            // Rotate around view-aligned rotation axis
            let rotation = mat4.fromRotation(mat4.create(), deg2rad(-10 * this.movementY * delta_time ), this.right)
            this.eye = vec3.transformMat4(vec3.create(), this.eye, rotation)

            // reset movementX and movementY
            this.movementX = 0
            this.movementY = 0

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Move Forward with W
        if (Input.isKeyDown('w')) {
            // Create translation forward
            let translation = vec3.scale(vec3.create(), this.forward, -move_speed * delta_time)

            // Translate the eye
            this.eye = vec3.add(vec3.create(), this.eye, translation)
            this.center = vec3.add(vec3.create(), this.center, translation)

            // let procGen = new(ProcGen)
            // procGen.createNoise()

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Move Backward with S
        if (Input.isKeyDown('s')) {
            // Create translation forward
            let translation = vec3.scale(vec3.create(), this.forward, move_speed * delta_time)

            // Translate the eye
            this.eye = vec3.add(vec3.create(), this.eye, translation)
            this.center = vec3.add(vec3.create(), this.center, translation)

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Move Left with A
        if (Input.isKeyDown('a')) {
            // Create translation forward
            let translation = vec3.scale(vec3.create(), this.right, -move_speed * delta_time)

            // Translate both eye and center in parallel
            this.eye = vec3.add(vec3.create(), this.eye, translation)
            this.center = vec3.add(vec3.create(), this.center, translation)

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Move Right with D
        if (Input.isKeyDown('d')) {
            // Create translation forward
            let translation = vec3.scale(vec3.create(), this.right, move_speed * delta_time)

            // Translate both eye and center in parallel
            this.eye = vec3.add(vec3.create(), this.eye, translation)
            this.center = vec3.add(vec3.create(), this.center, translation)

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Move Up with Space
        if (Input.isKeyDown(' ')) {
            // Create translation forward
            let translation = vec3.scale(vec3.create(), this.up, move_speed * delta_time)

            // Translate both eye and center in parallel
            this.eye = vec3.add(vec3.create(), this.eye, translation)
            this.center = vec3.add(vec3.create(), this.center, translation)

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Move Down with C
        if (Input.isKeyDown('c')) {
            // Create translation forward
            let translation = vec3.scale(vec3.create(), this.up, -move_speed * delta_time)

            // Translate both eye and center in parallel
            this.eye = vec3.add(vec3.create(), this.eye, translation)
            this.center = vec3.add(vec3.create(), this.center, translation)

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Update view matrix if needed
        if (view_dirty) {
            // Update Forward, Right, and Up vectors
            this.updateViewSpaceVectors()

            this.view = mat4.lookAt(mat4.create(), this.eye, this.center, this.up)

            for (let shader of this.shaders) {
                shader.use()
                shader.setUniform3f('u_eye', this.eye)
                shader.setUniform4x4f('u_v', this.view)
                shader.unuse()
            }
        }
    }

    /**
     * Update a SceneNode's local transformation
     * 
     * Supports the following interactions:
     * 1) Left Mouse Button - Rotate the node relative to the view along the Up and Right axes
     * 2) Middle Mouse Button or Space+Left Mouse Button - Translate the node relative to the view along the Up and Right axes
     * 3) Right Mouse Button - Scales the node around it's local center
     * 
     * @param {SceneNode} node The SceneNode to manipulate
     * @param {Number} delta_time The time in seconds since the last frame (floating point number)
     */
    updateSceneNode( node, delta_time ) {
        let node_dirty = false

        let translation = mat4.create()
        let rotation = mat4.create()
        let scale = mat4.create()

        // Control - Scale
        if (Input.isMouseDown(2)) {
            let factor = 1.0 + Input.getMouseDy() * delta_time
            scale = mat4.fromScaling(mat4.create(), [factor, factor, factor])

            node_dirty = true
        }

        // Control - Rotate
        if (Input.isMouseDown(0) && !Input.isKeyDown(' ')) {

            let rotation_up = mat4.fromRotation(mat4.create(), deg2rad(10 * Input.getMouseDx() * delta_time), this.up)
            let rotation_right = mat4.fromRotation(mat4.create(), deg2rad(10 * Input.getMouseDy() * delta_time), this.right)

            rotation = mat4.multiply(mat4.create(), rotation_right, rotation_up)

            node_dirty = true
        }

        // Control - Translate
        if (Input.isMouseDown(1) || (Input.isMouseDown(0) && Input.isKeyDown(' '))) {

            translation = mat4.fromTranslation(mat4.create(),
                vec3.add(vec3.create(), 
                    vec3.scale(vec3.create(), this.right, 0.75 * Input.getMouseDx() * delta_time),
                    vec3.scale(vec3.create(), this.up, -0.75 * Input.getMouseDy() * delta_time)
                ))

            node_dirty = true
        }


        // Update node transformation if needed
        if (node_dirty) {

            // Get the world rotation and scale of the node
            // Construct the inverse transformation of that matrix
            // We isolate the rotation and scale by setting the right column of the matrix to 0,0,0,1
            // If this is the root node, we set both matrices to identity
            let world_rotation_scale = mat4.clone(node.getWorldTransformation())
            let world_rotation_scale_inverse = null
            if (world_rotation_scale != null) {
                world_rotation_scale[12] = 0, world_rotation_scale[13] = 0, world_rotation_scale[14] = 0
                world_rotation_scale_inverse = mat4.invert(mat4.create(), world_rotation_scale)
            } else {
                world_rotation_scale = mat4.create()
                world_rotation_scale_inverse = mat4.create()
            }

            // Get the node's local transformation that we modify
            let transformation = node.getTransformation()

            // It's best to read this block from the bottom up
            // This is the order in which the transformations will take effect
            // Fourth, apply the scaling
            transformation = mat4.multiply(mat4.create(), transformation, scale)
            // Third, remove the full world rotation and scale to turn this back into a local matrix
            transformation = mat4.multiply(mat4.create(), transformation, world_rotation_scale_inverse)
            // Second, apply rotation and translation in world space alignment
            transformation = mat4.multiply(mat4.create(), transformation, translation)
            transformation = mat4.multiply(mat4.create(), transformation, rotation)
            // First, temporarily apply the full world rotation and scale to align the object in world space
            transformation = mat4.multiply(mat4.create(), transformation, world_rotation_scale)        

            // Update the node's transformation
            node.setTransformation(transformation)
        }
    }

    /**
     * Main render loop which sets up the active viewport (i.e. the area of the canvas we draw to)
     * clears the canvas with a background color and draws the scene
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Number} canvas_width The canvas width. Needed to set the viewport
     * @param {Number} canvas_height The canvas height. Needed to set the viewport
     */
    render( gl, canvas_width, canvas_height )
    {
        // Set viewport and clear canvas
        this.setViewport( gl, canvas_width, canvas_height )
        this.clearCanvas( gl )

        // Render the box
        // This will use the MVP that was passed to the shader
        // this.box.render( gl )
        this.plane.render( gl )

        // render chunk manager
        this.chunkManager.render(gl)

        this.emitter.render( gl )

        // Render the scene
        if (this.scene) this.scene.render( gl )

    }

}

export default WebGlApp