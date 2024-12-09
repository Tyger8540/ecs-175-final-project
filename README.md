# ECS 175 - Final Project

**Group 21**: Ty Matson | Ben Nelson | Jason Zhou

## Controls
**Mouse** -- To look around.

**WASD** -- To move the camera.

**Space** and **C** -- To move the camera up and down.

**F** -- To destroy a block the camera is looking at.

## Procedural Generation & Particle Systems
Our project combines procedural generation and particle systems to generate a chunk of a voxel-based world. There are various sliders to control the properties of terrain generation,
including:
- **Frequency** - The frequency of noise used to generate terrain. Higher frequency will generate sharp terrain.
- **Tree Density** - The density of tree generation in grassy areas.
- **Campfire Density** - The density of campfire generation.
- **Terrain Width** - The length and width of the chunk.
- **Terrain Height** - The maximum height of the chunk. If height is 2, then taller trees and taller mountain peaks will be generated.
- **Weather** - Controls weather effects.



## Hosting and running the project
The project is a simple HTML+JS website with minimal dependencies. To run it we recommend using one of the following methods. You are free to use alternative means to host the site.

### Using Python
If you have python installed on your system you can use the built-in HTTP Server that ships with it to host the project.

*Windows & Linux*
```bash
cd /path/to/the/project
python -m http.server
```

*macOS*
```bash
cd /path/to/the/project
python3 -m http.server
```

## Using VSCode Plugin
There is a convenient plugin for VSCode that lets you host the current working directory as a website. Download and install the plugin from the VSCode marketplace:
[https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
