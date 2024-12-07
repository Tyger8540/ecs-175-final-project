// import { createNoise2D } from 'simplex-noise';
import {createNoise2D} from "https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js";
import ChunkManager from '/voxel/chunkmanager.js'
import * as VoxelType from '/voxel/voxeltypes.js'

class ProcGen
{
    createNoise(canvasId) {
        let gen = createNoise2D();
        function noise(nx, ny) {
            // Rescale from -1.0:+1.0 to 0.0:1.0
            return gen(nx, ny) / 2 + 0.5;
        }
          
        let height = 250;
        let width = 250;
        let canvas = document.getElementById(canvasId);
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext("2d");
        let imageData = ctx.createImageData(width, height);

        var frequencySlider = document.getElementById("frequencySlider")
        let frequency = frequencySlider.value

        let total = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {      
                let nx = x/width - 0.5, ny = y/height - 0.5;
                let e = 1 * noise(1 * frequency * nx, 1 * ny) + 0.5 * noise(2 * frequency * nx, 2 * ny) + 0.25 * noise(4 * frequency * nx, 4 * ny);
                e = e / (1 + 0.5 + 0.25);
                let value = Math.pow(e, 2);
                // let value = Math.round(e * 32) / 32;
                total += value;


                let r, g, b;
                // Convert noise value to water if below threshold
                if (value < 0.1) {
                    // water
                    r = 0;
                    g = 0;
                    b = 255;
                }
                else if (value < 0.2) {
                    // sand
                    r = 247;
                    g = 226;
                    b = 151;
                }
                else if (value < 0.4) {
                    // grass
                    r = 0;
                    g = 255;
                    b = 0;
                }
                else if (value < 0.6) {
                    // stone
                    r = 169;
                    g = 183;
                    b = 199;
                }
                else {
                    // snow
                    r = 255;
                    g = 255;
                    b = 255;
                }

                // Convert noise value to grayscale (0-255)
                // color = Math.floor(value * 255);

                // // Apply threshold to make color either black or white
                // let color;
                // if (value > 0.25) {
                //     color = 255;
                // } else {
                //     color = 0;
                // }


                let index = (y * width + x) * 4; // RGBA index
                imageData.data[index] = r;       // Red
                imageData.data[index + 1] = g;   // Green
                imageData.data[index + 2] = b;   // Blue
                imageData.data[index + 3] = 255;     // Alpha
            }
        }
        // console.log("Avg Value: " + total / (width * height));
        ctx.putImageData(imageData, 0, 0);
    }

    createNoiseMap(width, height) {
        let gen = createNoise2D();
        function noise(nx, ny) {
            // Rescale from -1.0:+1.0 to 0.0:1.0
            return gen(nx, ny) / 2 + 0.5;
        }
          
        var frequencySlider = document.getElementById("frequencySlider")
        let frequency = frequencySlider.value

        let values = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {      
                let nx = x/width - 0.5, ny = y/height - 0.5;
                let e = 1 * noise(1 * frequency * nx, 1 * ny) + 0.5 * noise(2 * frequency * nx, 2 * ny) + 0.25 * noise(4 * frequency * nx, 4 * ny);
                e = e / (1 + 0.5 + 0.25);
                values.push(Math.pow(e, 2));
                // let value = Math.round(e * 32) / 32;


                // let r, g, b;
                // // Convert noise value to water if below threshold
                // if (value < 0.1) {
                //     // water
                //     r = 0;
                //     g = 0;
                //     b = 255;
                // }
                // else if (value < 0.2) {
                //     // sand
                //     r = 247;
                //     g = 226;
                //     b = 151;
                // }
                // else if (value < 0.4) {
                //     // grass
                //     r = 0;
                //     g = 255;
                //     b = 0;
                // }
                // else if (value < 0.6) {
                //     // stone
                //     r = 169;
                //     g = 183;
                //     b = 199;
                // }
                // else {
                //     // snow
                //     r = 255;
                //     g = 255;
                //     b = 255;
                // }

                // Convert noise value to grayscale (0-255)
                // color = Math.floor(value * 255);

                // // Apply threshold to make color either black or white
                // let color;
                // if (value > 0.25) {
                //     color = 255;
                // } else {
                //     color = 0;
                // }


                // let index = (y * width + x) * 4; // RGBA index
                // imageData.data[index] = r;       // Red
                // imageData.data[index + 1] = g;   // Green
                // imageData.data[index + 2] = b;   // Blue
                // imageData.data[index + 3] = 255;     // Alpha
            }
        }
        return values;
    }
    
}


// JS Module Export -- No need to modify this
export
{
    ProcGen
}