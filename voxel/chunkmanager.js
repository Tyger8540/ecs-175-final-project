import { VoxelChunk, CHUNK_SIZE } from './voxelchunk.js'

class ChunkManager {
    /**
     *
     * @param {Number} size How many chunks long the world should be
     */
    constructor(gl, shader, size) {
        this.size = size
        this.chunks = Array(size * size)
        for (let chunkJ = 0; chunkJ < this.size; chunkJ++) {
            for (let chunkI = 0; chunkI < this.size; chunkI++) {
                this.chunks[chunkJ * size + chunkI] = new VoxelChunk(gl, shader)
            }
        }
    }

    getChunkIndex(globalX, globalZ) {
        return Math.floor(globalZ / CHUNK_SIZE) * this.size + Math.floor(globalX / CHUNK_SIZE)
    }

    setVoxel(globalX, globalY, globalZ, voxelId) {
        const localX = globalX % CHUNK_SIZE
        const localY = globalY % CHUNK_SIZE
        const localZ = globalZ % CHUNK_SIZE
        this.chunks[this.getChunkIndex(globalX, globalZ)].setVoxel(localX, localY, localZ, voxelId)
    }

    regenerateAllBuffers() {
        for (let chunk of this.chunks) {
            chunk.regenerateBuffers(chunk.gl, chunk.shader)
        }
    }

    render(gl) {
        for (let chunkJ = 0; chunkJ < this.size; chunkJ++) {
            for (let chunkI = 0; chunkI < this.size; chunkI++) {
                const globalX = chunkI * CHUNK_SIZE
                const globalZ = chunkJ * CHUNK_SIZE
                const chunkIndex = this.getChunkIndex(globalX, globalZ)
                const chunk = this.chunks[chunkIndex]
                chunk.render(gl, globalX, globalZ)
            }
        }
    }
}

export default ChunkManager
