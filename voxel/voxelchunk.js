const CHUNK_SIZE = 16

// chunk is a 3d array of voxelIds. voxel ids are defined in voxeltypes.js
class VoxelChunk extends Object3D {
    constructor() {
        this.voxels = [CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE].fill(VOXEL_AIR.id)
    }

    getIndex(x, y, z) {
        return z * CHUNK_SIZE * CHUNK_SIZE + y * CHUNK_SIZE + x
    }

    setVoxel(localX, localY, localZ, voxelId) {
        this.voxels[getIndex(localX, localY, localZ)] = voxelId
        this.regenerateVertices()
    }

    regenerateVertices() {
        // TODO: update vbo, ibo, vao
    }

    // TODO: make func to render

    // TODO: call render func in chunk manager
}
