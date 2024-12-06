import { VoxelChunk, CHUNK_SIZE } from './voxelchunk.js'

class ChunkManager {
    /**
     *
     * @param {Number} size How many chunks long the world should be
     */
    constructor(gl, shader, size) {
        this.gl = gl
        this.shader = shader
        this.size = size
        this.chunks = Array(size * size).fill(new VoxelChunk(gl, shader))
    }

    getChunkIndex(globalX, globalY) {
        return Math.floor(globalY / CHUNK_SIZE) * this.size + Math.floor(globalX / CHUNK_SIZE)
    }

    setVoxel(globalX, globalY, globalZ, voxelId) {
        const localX = globalX % CHUNK_SIZE
        const localY = globalY % CHUNK_SIZE
        const localZ = globalZ % CHUNK_SIZE
        this.chunks[this.getChunkIndex(globalX, globalY)].setVoxel(localX, localY, localZ, voxelId)
    }

    regenerateAllBuffers() {
        for (let chunk of this.chunks) {
            chunk.regenerateBuffers(this.gl, this.shader)
        }
    }

    render(gl) {
        for (let chunkJ = 0; chunkJ < this.size; chunkJ++) {
            for (let chunkI = 0; chunkI < this.size; chunkI++) {
                const globalX = chunkI * CHUNK_SIZE
                const globalY = chunkJ * CHUNK_SIZE
                const chunkIndex = this.getChunkIndex(globalX, globalY)
                const chunk = this.chunks[chunkIndex]
                chunk.render(gl, globalX, globalY)
            }
        }
    }
}

export default ChunkManager
