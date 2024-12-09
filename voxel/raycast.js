import ChunkManager from "./chunkmanager.js";
import { CHUNK_SIZE } from "./voxelchunk.js";

function raycast(chunkManager, start, direction, maxDistance) {
    const stepX = direction[0] > 0 ? 1 : -1;
    const stepY = direction[1] > 0 ? 1 : -1;
    const stepZ = direction[2] > 0 ? 1 : -1;

    const tDeltaX = direction[0] !== 0 ? Math.abs(1 / direction[0]) : Infinity;
    const tDeltaY = direction[1] !== 0 ? Math.abs(1 / direction[1]) : Infinity;
    const tDeltaZ = direction[2] !== 0 ? Math.abs(1 / direction[2]) : Infinity;

    let [x, y, z] = start.map(Math.floor);

     // Compute initial tMax values
    const tMaxX = direction[0] !== 0
        ? (Math.floor(x + (stepX > 0)) - start[0]) / direction[0]
        : Infinity;
    const tMaxY = direction[1] !== 0
        ? (Math.floor(y + (stepY > 0)) - start[1]) / direction[1]
        : Infinity;
    const tMaxZ = direction[2] !== 0
        ? (Math.floor(z + (stepZ > 0)) - start[2]) / direction[2]
        : Infinity;

    // Raycast loop
    let distanceTraveled = 0;
    let currTMaxX = tMaxX, currTMaxY = tMaxY, currTMaxZ = tMaxZ;

    while (distanceTraveled <= maxDistance) {
        // Check if the current voxel is a hit
        if (chunkManager.getVoxel(x, y, z) !== null) {
            return [x, y, z]; // Hit found
        }

        // Determine the next voxel to step into
        if (currTMaxX < currTMaxY && currTMaxX < currTMaxZ) {
            x += stepX;
            distanceTraveled = currTMaxX;
            currTMaxX += tDeltaX;
        } else if (currTMaxY < currTMaxZ) {
            y += stepY;
            distanceTraveled = currTMaxY;
            currTMaxY += tDeltaY;
        } else {
            z += stepZ;
            distanceTraveled = currTMaxZ;
            currTMaxZ += tDeltaZ;
        }
    }

    return null; // No hit within maxDistance
}

export default raycast
