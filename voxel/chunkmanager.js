import VoxelChunk from './voxelchunk.js'

class ChunkManager {
    /**
     *
     * @param {Number} size How many chunks long the world should be
     */
    constructor(gl, shader, size) {
        this.gl = gl
        this.shader = shader
        this.size = size
        this.chunks = Array(size * size).fill(new VoxelChunk(gl))
    }

    setVoxel(globalX, globalY, globalZ, voxelId) {
        const chunkIndex = Math.floor(globalY / CHUNK_SIZE) * size + Math.floor(globalX / CHUNK_SIZE)

        const localX = globalX % size
        const localY = globalY % size
        const localZ = globalZ % size
        this.chunks[chunkIndex].setVoxel(localX, localY, localZ, voxelId)
    }

    regenerateAllBuffers() {
        for (let chunk of this.chunks) {
            chunk.regenerateBuffers(this.gl, this.shader)
        }
    }

    render(gl) {
        
    }
}

export default ChunkManager
