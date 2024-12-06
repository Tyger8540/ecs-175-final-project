class VoxelType {
    constructor(id, color) {
        this.id = id
        this.color = color
    }
}

const VOXEL_AIR = new VoxelType(0, [0, 0, 0])
const VOXEL_GRASS = new VoxelType(1, [0, 255, 0])

export { VoxelType, VOXEL_AIR, VOXEL_GRASS }
