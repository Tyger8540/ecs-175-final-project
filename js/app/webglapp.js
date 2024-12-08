'use strict'

import { hex2rgb, deg2rad, loadExternalFile } from '../utils/utils.js'
import Box from './box3d.js'
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
        this.box_shader = this.shaders[7]
        console.log(this.shaders[7])
        this.plane_shader = this.shaders[5]
        this.light_shader = this.shaders[this.shaders.length - 1]
        this.active_shader = 1
        
        // Create a box instance and create a variable to track its rotation
        this.box = new Box( gl, this.box_shader )

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

        this.numChunks = 5

        this.procGen = new ProcGen()




        var zero = vec3.create()
        this.emitter = new Emitter(vec3.fromValues(0, 20, 0), vec3.fromValues(50, 0, 50), 200, 0.8, vec3.fromValues(-0.2, -1, 0), 0.1, vec3.fromValues(0, -20, 0), 0.5, true, 0, 0, vec3.fromValues(0, 1, 0),
            0, 600, 0.002, vec3.fromValues(0.2, 0.2, 1.0), vec3.fromValues(0.05, 0.05, 1), 1, this.shaders[6]
            )





        let width = 16
        let height = 16
        let values = this.procGen.createNoiseMap(width, height)
        this.generateTerrain()

        this.movementX = 0
        this.movementY = 0
        this.yaw
        this.pitch
    }


    generateTerrain3D() {
        var heightSlider = document.getElementById("heightSlider")
        let height = heightSlider.value
        this.chunkManager = new ChunkManager(this.gl, this.shaders[4], this.numChunks, height)
        height = height * 16
        let width = 16 * this.numChunks
        let depth = 16 * this.numChunks
        let values = this.procGen.createNoiseMap3D(width, height, depth)

        let value

        for (let z = 0; z < depth; z++) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    value = values[x + y * width + z * height * width]
                    if (y == 0) {
                        this.chunkManager.setVoxel(x, y, z, [0, 0, 255])  // set the water voxel at y=0
                    } else if (value < 0.5) {
                        this.chunkManager.setVoxel(x, y, z, [Math.random(), Math.random(), Math.random()])  // set the rest of the voxels
                    }
                }
            }
        }
        this.chunkManager.regenerateAllBuffers()
    }

    /**
     * Generates Terrain
     */
    generateTerrain() {
        var heightSlider = document.getElementById("heightSlider")
        let height = heightSlider.value
        let widthSlider = document.getElementById("widthSlider")
        this.numChunks = widthSlider.value
        this.chunkManager = new ChunkManager(this.gl, this.shaders[4], this.numChunks, height)

        let width = 16 * this.numChunks
        let depth = 16 * this.numChunks
        let values = this.procGen.createNoiseMap(width, depth)
        let treeValues = this.procGen.createNoiseMapTrees(width, depth)

        let value
        // let isMountain = false;
        let isVerySmallPeak = false;
        let isSmallPeak = false;
        let isMediumPeak = false;
        let isLargePeak = false;
        for (let z = 0; z < depth; z++) {
            for (let x = 0; x < width; x++) {
                this.chunkManager.setVoxel(x, 0, z, [0, 0, 255])  // set the water voxel at y=0
                value = values[x + z * width]
                // if (value < 0.2) {
                //     this.chunkManager.setVoxel(x, 1, z, null)  // set the voxel to air
                // } else {
                //     for (let y = 0.2; y <= values[x + z * width]; y += 0.05) {
                //         this.chunkManager.setVoxel(x, Math.round(Math.ceil((y - 0.2) * 18.75) + 1), z, [0, 255, 0])
                //     }
                //     // this.chunkManager.setVoxel(x, 0, z, [0, 255, 0])
                // }

                let r, g, b;
                let waterValue = 0.2
                // let verySmallPeakValue = 0.95
                // let smallPeakValue = 0.97
                // let mediumPeakValue = 0.985
                // let largePeakValue = 0.995
                let verySmallPeakValue = 0.9
                let smallPeakValue = 0.92
                let mediumPeakValue = 0.935
                let largePeakValue = 0.945
                let surfaceY = 0
                let surfaceColor
                // Convert noise value to water if below threshold
                if (value <= waterValue) {
                    // water
                    r = 0;
                    g = 0;
                    b = 255;
                }
                else if (value <= 0.35) {
                    // sand
                    r = 247;
                    g = 226;
                    b = 151;
                }
                else if (value <= 0.6) {
                    // grass
                    r = 0;
                    g = 255;
                    b = 0;
                }
                else if (value <= 0.85) {
                    // stone
                    r = 122;
                    g = 122;
                    b = 122;
                    // r = 169;
                    // g = 183;
                    // b = 199;
                }
                else if (value <= verySmallPeakValue) {
                    // snow
                    if (height == 1) {
                        r = 255;
                        g = 255;
                        b = 255;
                    } else {
                        r = 155;
                        g = 155;
                        b = 155;
                    }
                   
                }
                else if (value <= smallPeakValue) {
                    if (height == 1) {
                        r = 255;
                        g = 255;
                        b = 255;
                    } else {
                        r = 188;
                        g = 188;
                        b = 188;
                    }
                    // r = 255;
                    // g = 255;
                    // b = 0;
                    isVerySmallPeak = true;
                }
                else if (value <= mediumPeakValue) {
                    if (height == 1) {
                        r = 255;
                        g = 255;
                        b = 255;
                    } else {
                        r = 222;
                        g = 222;
                        b = 222;
                    }
                    // r = 255;
                    // g = 122;
                    // b = 0;
                    isSmallPeak = true;
                }
                else if (value <= largePeakValue) {
                    if (height == 1) {
                        r = 255;
                        g = 255;
                        b = 255;
                    } else {
                        r = 238;
                        g = 238;
                        b = 238;
                    }
                    // r = 255;
                    // g = 0;
                    // b = 0;
                    isMediumPeak = true;
                }
                else {
                    if (height == 1) {
                        r = 255;
                        g = 255;
                        b = 255;
                    } else {
                        r = 255;
                        g = 255;
                        b = 255;
                    }
                    // r = 255;
                    // g = 0;
                    // b = 255;
                    isLargePeak = true;
                }

                // EVERYTHING FITS IN ONE CHUNK EXCEPT FOR RARE MOUNTAINS, WHICH ARE LESS RARE WITH HIGHER FREQUENCY
                // if (isMountain) {
                //     console.log(value)
                //     for (let y = 0.95; y <= value; y += (1 - mountainValue) / 32) {
                //         // console.log(y)
                //         this.chunkManager.setVoxel(x, Math.ceil((y - mountainValue) * ((32 - 1) / (1 - mountainValue))) + 1, z, [r/255, g/255, b/255])
                //     }
                // } else {
                //     for (let y = 0.2; y <= value; y += (1 - waterValue) / 16) {
                //         this.chunkManager.setVoxel(x, Math.ceil((y - waterValue) * ((16 - 1) / (1 - waterValue))) + 1, z, [r/255, g/255, b/255])
                //     }
                //     if (isMountain) {
                //         for (let y = 0.95; y <= value; y += (1 - mountainValue) / 16) {
                //             // console.log(y)
                //             this.chunkManager.setVoxel(x, Math.ceil((y - mountainValue) * ((16 - 1) / (1 - mountainValue))) + 1 + 16, z, [r/255, g/255, b/255])
                //         }
                //     }
                // }

                for (let y = 0.2; y <= value; y += (1 - waterValue) / 16) {
                    if (y > waterValue) {
                        this.chunkManager.setVoxel(x, Math.ceil((y - waterValue) * ((16 - 1) / (1 - waterValue))), z, [r/255, g/255, b/255])
                        surfaceY = surfaceY + 1
                        // console.log(15 == Math.ceil((y - waterValue) * ((16 - 1) / (1 - waterValue))))
                    }
                }

                if (height == 2) {
                    // GENERATE TALLER MOUNTAINS
                    if (isVerySmallPeak) {
                        for (let y = verySmallPeakValue; y <= value; y += (smallPeakValue - verySmallPeakValue) / 4) {
                            this.chunkManager.setVoxel(x, Math.ceil((y - verySmallPeakValue) * ((4 - 1) / (1 - verySmallPeakValue))) + 15, z, [r/255, g/255, b/255])
                            surfaceY = surfaceY + 1
                        }
                        isVerySmallPeak = false;
                    }
                    else if (isSmallPeak) {
                        for (let i = 15; i < 19; i++) {
                            this.chunkManager.setVoxel(x, i, z, [r/255, g/255, b/255])
                            surfaceY = surfaceY + 1
                        }
                        for (let y = smallPeakValue; y <= value; y += (mediumPeakValue - smallPeakValue) / 4) {
                            this.chunkManager.setVoxel(x, Math.ceil((y - smallPeakValue) * ((4 - 1) / (1 - smallPeakValue))) + 19, z, [r/255, g/255, b/255])
                            surfaceY = surfaceY + 1
                        }
                        isSmallPeak = false;
                    } else if (isMediumPeak) {
                        for (let i = 15; i < 23; i++) {
                            this.chunkManager.setVoxel(x, i, z, [r/255, g/255, b/255])
                            surfaceY = surfaceY + 1
                        }
                        for (let y = mediumPeakValue; y <= value; y += (largePeakValue - mediumPeakValue) / 4) {
                            this.chunkManager.setVoxel(x, Math.ceil((y - mediumPeakValue) * ((4 - 1) / (1 - mediumPeakValue))) + 23, z, [r/255, g/255, b/255])
                            surfaceY = surfaceY + 1
                        }
                        isMediumPeak = false;
                    } else if (isLargePeak) {
                        for (let i = 15; i < 27; i++) {
                            this.chunkManager.setVoxel(x, i, z, [r/255, g/255, b/255])
                            surfaceY = surfaceY + 1
                        }
                        for (let y = largePeakValue; y <= value; y += (1 - largePeakValue) / 4) {
                            this.chunkManager.setVoxel(x, Math.ceil((y - largePeakValue) * ((4 - 1) / (1 - largePeakValue))) + 27, z, [r/255, g/255, b/255])
                            surfaceY = surfaceY + 1
                        }
                        isLargePeak = false;
                    }
                    // for (let y = verySmallPeakValue; y <= value; y += (1 - verySmallPeakValue) / 16) {
                    //     this.chunkManager.setVoxel(x, Math.ceil((y - verySmallPeakValue) * ((16 - 1) / (1 - verySmallPeakValue))) + 16, z, [r/255, g/255, b/255])
                    // }
                }

                surfaceColor = [r/255, g/255, b/255]

                if (x + 1 < width && z + 1 < depth && x - 1 >= 0 && z - 1 >= 0) {
                    let treeValue = treeValues[x + z * width]
                    if (treeValue > treeValues[x + z * width + 1] &&
                        treeValue > treeValues[x + z * width - 1] &&
                        treeValue > treeValues[x + (z + 1) * width] &&
                        treeValue > treeValues[x + (z - 1) * width]) {

                        // Make tree if on grass
                        let grassColor = [0/255, 255/255, 0/255]
                        if (this.colorsEqual(surfaceColor, grassColor)) {
                            let buildHeight = height * 16 - 1
                            this.createTree(x, z, surfaceY, buildHeight)
                        }
                    }
                }


                // EVERYTHING FITS IN THE 2 CHUNK HEIGHT
                // for (let y = 0.4; y <= values[x + z * width]; y += 0.0125) {
                //     this.chunkManager.setVoxel(x, Math.ceil((y - 0.4) * 53.33) + 1, z, [r/255, g/255, b/255])
                // }
            }
        }
        this.chunkManager.regenerateAllBuffers()
    }

    createTree(x, z, surfaceY, buildHeight) {
        let brown = [110/255, 63/255, 44/255]
        let green = [44/255, 110/255, 48/255]
        if (surfaceY + 4 <= buildHeight) {
            // Wood
            this.chunkManager.setVoxel(x, surfaceY + 1, z, brown)
            this.chunkManager.setVoxel(x, surfaceY + 2, z, brown)
            this.chunkManager.setVoxel(x, surfaceY + 3, z, brown)

            // Leaves
            this.chunkManager.setVoxel(x, surfaceY + 4, z, green)
            this.chunkManager.setVoxel(x + 1, surfaceY + 2, z, green)
            this.chunkManager.setVoxel(x + 1, surfaceY + 3, z, green)
            this.chunkManager.setVoxel(x, surfaceY + 2, z + 1, green)
            this.chunkManager.setVoxel(x, surfaceY + 3, z + 1, green)
            this.chunkManager.setVoxel(x - 1, surfaceY + 2, z, green)
            this.chunkManager.setVoxel(x - 1, surfaceY + 3, z, green)
            this.chunkManager.setVoxel(x, surfaceY + 2, z - 1, green)
            this.chunkManager.setVoxel(x, surfaceY + 3, z - 1, green)
        }
    }

    colorsEqual(color1, color2) {
        if (color1.length != color2.length) {
            return false;
        }
        for (let i = 0; i < color1.length; i++) {
            if (color1[i] != color2[i]) {
                return false;
            }
        }
        return true
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
        //console.log(1/delta_time)
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

        // Yaw (horizontal angle) and pitch (vertical angle) state
        if (this.yaw === undefined) this.yaw = 0;
        if (this.pitch === undefined) this.pitch = 0;

        // Control - FPS-style Camera Rotation
        if (this.movementX != 0 || this.movementY != 0) {
            // Rotate around xz plane around y
            // this.eye = vec3.rotateY(vec3.create(), this.eye, this.center, deg2rad(-sensitivity * this.movementX * delta_time ))

            // // Rotate around view-aligned rotation axis
            // let rotation = mat4.fromRotation(mat4.create(), deg2rad(-sensitivity * this.movementY * delta_time ), this.right)
            // this.eye = vec3.transformMat4(vec3.create(), this.eye, rotation)

            this.yaw -= sensitivity * this.movementX * delta_time;
            this.pitch -= sensitivity * this.movementY * delta_time;

            // Clamp pitch to prevent flipping
            const maxPitch = Math.PI / 2 - 0.01;
            if (this.pitch > maxPitch) this.pitch = maxPitch;
            if (this.pitch < -maxPitch) this.pitch = -maxPitch;

            // reset movementX and movementY
            this.movementX = 0
            this.movementY = 0

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Recompute forward, right, and up vectors based on yaw and pitch
        if (view_dirty) {
            const cosPitch = Math.cos(this.pitch);
            this.forward = vec3.normalize(
                vec3.create(),
                vec3.fromValues(
                    Math.sin(this.yaw) * cosPitch,
                    Math.sin(this.pitch),
                    Math.cos(this.yaw) * cosPitch
                )
            );

            this.right = vec3.normalize(
                vec3.create(),
                vec3.cross(vec3.create(), this.forward, [0, 1, 0])
            );

            this.up = vec3.normalize(
                vec3.create(),
                vec3.cross(vec3.create(), this.right, this.forward)
            );

            // Update camera center
            this.center = vec3.add(vec3.create(), this.eye, this.forward);
        }

        /*
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
        */

        // // Control - Move Forward with W
        // if (Input.isKeyDown('w')) {
        //     // Create translation forward
        //     let translation = vec3.scale(vec3.create(), this.forward, -move_speed * delta_time)

        //     // Translate the eye
        //     this.eye = vec3.add(vec3.create(), this.eye, translation)
        //     this.center = vec3.add(vec3.create(), this.center, translation)

        //     // let procGen = new(ProcGen)
        //     // procGen.createNoise()

        //     // Set dirty flag to trigger view matrix updates
        //     view_dirty = true
        // }

        // // Control - Move Backward with S
        // if (Input.isKeyDown('s')) {
        //     // Create translation forward
        //     let translation = vec3.scale(vec3.create(), this.forward, move_speed * delta_time)

        //     // Translate the eye
        //     this.eye = vec3.add(vec3.create(), this.eye, translation)
        //     this.center = vec3.add(vec3.create(), this.center, translation)

        //     // Set dirty flag to trigger view matrix updates
        //     view_dirty = true
        // }

        // // Control - Move Left with A
        // if (Input.isKeyDown('a')) {
        //     // Create translation forward
        //     let translation = vec3.scale(vec3.create(), this.right, -move_speed * delta_time)

        //     // Translate both eye and center in parallel
        //     this.eye = vec3.add(vec3.create(), this.eye, translation)
        //     this.center = vec3.add(vec3.create(), this.center, translation)

        //     // Set dirty flag to trigger view matrix updates
        //     view_dirty = true
        // }

        // // Control - Move Right with D
        // if (Input.isKeyDown('d')) {
        //     // Create translation forward
        //     let translation = vec3.scale(vec3.create(), this.right, move_speed * delta_time)

        //     // Translate both eye and center in parallel
        //     this.eye = vec3.add(vec3.create(), this.eye, translation)
        //     this.center = vec3.add(vec3.create(), this.center, translation)

        //     // Set dirty flag to trigger view matrix updates
        //     view_dirty = true
        // }

        // // Control - Move Up with Space
        // if (Input.isKeyDown(' ')) {
        //     // Create translation forward
        //     let translation = vec3.scale(vec3.create(), this.up, move_speed * delta_time)

        //     // Translate both eye and center in parallel
        //     this.eye = vec3.add(vec3.create(), this.eye, translation)
        //     this.center = vec3.add(vec3.create(), this.center, translation)

        //     // Set dirty flag to trigger view matrix updates
        //     view_dirty = true
        // }

        // // Control - Move Down with C
        // if (Input.isKeyDown('c')) {
        //     // Create translation forward
        //     let translation = vec3.scale(vec3.create(), this.up, -move_speed * delta_time)

        //     // Translate both eye and center in parallel
        //     this.eye = vec3.add(vec3.create(), this.eye, translation)
        //     this.center = vec3.add(vec3.create(), this.center, translation)

        //     // Set dirty flag to trigger view matrix updates
        //     view_dirty = true
        // }

        const translation = vec3.create();

        if (Input.isKeyDown('w')) vec3.scaleAndAdd(translation, translation, this.forward, move_speed * delta_time);
        if (Input.isKeyDown('s')) vec3.scaleAndAdd(translation, translation, this.forward, -move_speed * delta_time);
        if (Input.isKeyDown('a')) vec3.scaleAndAdd(translation, translation, this.right, -move_speed * delta_time);
        if (Input.isKeyDown('d')) vec3.scaleAndAdd(translation, translation, this.right, move_speed * delta_time);
        if (Input.isKeyDown(' ')) vec3.scaleAndAdd(translation, translation, this.up, move_speed * delta_time);
        if (Input.isKeyDown('c')) vec3.scaleAndAdd(translation, translation, this.up, -move_speed * delta_time);

        if (!vec3.exactEquals(translation, vec3.create())) {
            vec3.add(this.eye, this.eye, translation);
            vec3.add(this.center, this.eye, this.forward);
            view_dirty = true;
        }

        // Update view matrix if needed
        if (view_dirty) {
            // Update Forward, Right, and Up vectors
            // this.updateViewSpaceVectors()

            this.view = mat4.lookAt(mat4.create(), this.eye, this.center, this.up)
            this.emitter.update_position(this.eye)

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
        this.box.render( gl )
        // this.plane.render( gl )

        // render chunk manager
        this.chunkManager.render(gl)

        this.emitter.render( gl )

        // Render the scene
        if (this.scene) this.scene.render( gl )

    }

}

export default WebGlApp