// import { createNoise2D } from 'simplex-noise';
import {createNoise2D} from "https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js";


class ProcGen
{

    createNoise() {
        let gen = createNoise2D();
        function noise(nx, ny) {
            // Rescale from -1.0:+1.0 to 0.0:1.0
            return gen(nx, ny) / 2 + 0.5;
        }
          
        let value = [];
        let height = 2;
        let width = 2;
        for (let y = 0; y < height; y++) {
            value[y] = [];
            for (let x = 0; x < width; x++) {      
                let nx = x/width - 0.5, ny = y/height - 0.5;
                value[y][x] = noise(nx, ny);
            }
        }
        console.log(value)
    }
    
}


// JS Module Export -- No need to modify this
export
{
    ProcGen
}