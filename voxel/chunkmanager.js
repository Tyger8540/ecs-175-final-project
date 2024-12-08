import { VoxelChunk, CHUNK_SIZE } from './voxelchunk.js'

class ChunkManager {
    /**
     *
     * @param {Number} size How many chunks long the world should be
     */
    constructor(gl, shader, size, height) {
        this.size = size
        this.height = height
        this.chunks = Array(size * height * size)
        for(let chunkK = 0; chunkK < size; chunkK++) {
            for (let chunkJ = 0; chunkJ < height; chunkJ++) {
                for (let chunkI = 0; chunkI < size; chunkI++) {
                    this.chunks[chunkK*height*size + chunkJ*size + chunkI] = new VoxelChunk(gl, shader)
                }
            }
        }

        this.shading = [0.5, 0.5, 0.5, 0.8, 0.8, 1.0]
    }

    getChunkIndex(globalX, globalY, globalZ) {
        return Math.floor(globalZ / CHUNK_SIZE)*this.height*this.size
            + Math.floor(globalY / CHUNK_SIZE)*this.size
            + Math.floor(globalX / CHUNK_SIZE)
    }

    setVoxel(globalX, globalY, globalZ, color) {
        const localX = globalX % CHUNK_SIZE
        const localY = globalY % CHUNK_SIZE
        const localZ = globalZ % CHUNK_SIZE
        this.chunks[this.getChunkIndex(globalX, globalY, globalZ)].setVoxel(localX, localY, localZ, color)
    }

    regenerateAllBuffers() {
        for (let chunk of this.chunks) {
            chunk.regenerateBuffers(chunk.gl, chunk.shader)
        }
    }

    render(gl) {
        for(let chunkK = 0; chunkK < this.size; chunkK++) {
            for (let chunkJ = 0; chunkJ < this.height; chunkJ++) {
                for (let chunkI = 0; chunkI < this.size; chunkI++) {
                    const globalX = chunkI * CHUNK_SIZE
                    const globalY = chunkJ * CHUNK_SIZE
                    const globalZ = chunkK * CHUNK_SIZE
                    const chunkIndex = this.getChunkIndex(globalX, globalY, globalZ)
                    const chunk = this.chunks[chunkIndex]
                    chunk.render(gl, globalX, globalY, globalZ, this.shading)
                }
            }
        }
    }
}

export default ChunkManager
