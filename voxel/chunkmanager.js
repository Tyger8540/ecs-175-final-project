class ChunkManager {
    /**
     *
     * @param {Number} size How many chunks long the world should be
     */
    constructor(size) {
        this.size = size
        this.chunks = Array(size * size).fill(new VoxelChunk())
    }

    setVoxel(globalX, globalY, globalZ, voxelId) {
        const chunkIndex = Math.floor(globalY / CHUNK_SIZE) * size + Math.floor(globalX / CHUNK_SIZE)

        const localX = globalX % size
        const localY = globalY % size
        const localZ = globalZ % size
        this.chunks[chunkIndex].setVoxel(localX, localY, localZ, voxelId)
    }
}
