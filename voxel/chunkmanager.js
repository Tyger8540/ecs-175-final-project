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

        this.shading = [0.5, 0.5, 0.5, 0.8, 0.8, 1.0]
    }

    getChunkIndex(globalX, globalZ) {
        return Math.floor(globalZ / CHUNK_SIZE) * this.size + Math.floor(globalX / CHUNK_SIZE)
    }

    setVoxel(globalX, globalY, globalZ, color) {
        const localX = globalX % CHUNK_SIZE
        const localY = globalY % CHUNK_SIZE
        const localZ = globalZ % CHUNK_SIZE
        this.chunks[this.getChunkIndex(globalX, globalZ)].setVoxel(localX, localY, localZ, color)
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
                chunk.render(gl, globalX, 1, globalZ, this.shading)
            }
        }
    }
}

export default ChunkManager
