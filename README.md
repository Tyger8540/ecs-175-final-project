# ECS 175 - Final Project

**Group 21**: Ty Matson | Ben Nelson | Jason Zhou

## Controls
**Mouse** -- To look around.

**WASD** -- To move the camera.

**Space** and **C** -- To move the camera up and down.

**F** -- To destroy a block the camera is looking at.

## Procedural Generation & Particle Systems
Our project combines procedural generation and particle systems to generate and simulate a chunk of a voxel-based world. There are various sliders to control the properties of terrain generation,
including:
- **Frequency** - The frequency of noise used to generate terrain. Higher frequency will generate sharp terrain.
- **Tree Density** - The density of tree generation in grassy areas.
- **Campfire Density** - The density of campfire generation.
- **Terrain Width** - The length and width of the chunk.
- **Terrain Height** - The maximum height of the chunk. If height is 2, then taller trees and taller mountain peaks will be generated.
- **Weather** - Controls weather effects.


## References
For our project, we used various resources to help implement our systems.

“Making maps with noise functions” from Red Blob Games: https://www.redblobgames.com/maps/terrain-from-noise/
HTML Range Slider: https://www.w3schools.com/howto/howto_js_rangeslider.asp
HTML Buttons: https://www.w3schools.com/tags/tag_button.asp
HTML onClick Event: https://www.w3schools.com/jsref/event_onclick.asp
Pointer Lock System: https://developer.mozilla.org/en-US/docs/Web/API/Element/requestPointerLock
simplex-noise API: https://www.npmjs.com/package/simplex-noise
JavaScript Key Codes: https://www.toptal.com/developers/keycode

Particle system: 
- Daniel Shiffman. “Chapter 4: Particle Systems”.  The Nature of Code. https://natureofcode.com/particles/
