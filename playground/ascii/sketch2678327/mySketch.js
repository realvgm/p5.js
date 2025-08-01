/**
 * @name 03_custom2D
 * @description Advanced example applying a custom 2D renderer to a p5.js canvas with p5.asciify utilizing custom shaders.
 * @author humanbydefinition
 * @link https://github.com/humanbydefinition/p5.asciify
 * 
 * This example demonstrates how to apply the pre-defined `'custom2D'` renderer to a p5.js canvas.
 * A custom 2D renderer is used to apply custom logic to the ascii grid using custom shaders.
 * 
 * Simplified version of 'ASCIISHIFT8'.
 * Minted via fx(hash): https://www.fxhash.xyz/generative/slug/asciishift8
 */

let asciifier; // Define the `asciifier` variable to store the `P5Asciifier` instance

// Define a color palette to be used in the ascii renderer
// If there is a mismatch between the charset length and the color palette length, the colors will be repeated or not used
let colorPalette = [ // Color palette
	'#FF0000', '#FF8800', '#DDDD00', '#EEBB00', '#88DD00', 
	"#00DD77", "#00DDDD", "#00AAFF", "#AA66FF", "#FF00FF"
];

let seed = "p5.asciify"; // Seed for random number generation

// The 'custom2D' ascii renderer's framebuffers we'll fetch in `setupAsciify()`
let primaryColorSampleFramebuffer;
let secondaryColorSampleFramebuffer;
let asciiCharacterFramebuffer;

let rectangleManager;
let charsetColorPalette = [];
let charsetColorPaletteFramebuffer;
let colorPaletteFramebuffer;

// Shader variables
let noiseShader, shiftShader, pushShader;
let asciiCharacterShader, asciiColorPaletteShader;
let noiseFramebuffer, shiftFramebuffer;
let previousPushFramebuffer, nextPushFramebuffer;

function preload() {
	// Relevant to the sketch, independent of p5.asciify
	noiseShader = createShader(vertexShader, noiseFragShader);
	shiftShader = createShader(vertexShader, shiftFragShader);
	pushShader = createShader(vertexShader, pushFragShader);

	// Relevant to p5.asciify, translating the pushShader's pixels
	asciiCharacterShader = createShader(vertexShader, asciiCharacterFragShader);
	asciiColorPaletteShader = createShader(vertexShader, asciiColorFragShader);
}

function setup() {
	randomSeed(seed);
	noiseSeed(seed);

	setAttributes('antialias', false);
	createCanvas(windowWidth, windowHeight, WEBGL);
}

// After `p5.asciify` is set up in the background after `setup()`,
// we can call `setupAsciify()` to configure `p5asciify` and it's `P5Asciifier` instances and rendering pipelines
function setupAsciify() {
	// Fetch the default `P5Asciifier` instance provided by the library
	asciifier = p5asciify.asciifier();

	// Initialize and fill the color palette framebuffer
	colorPaletteFramebuffer = createFramebuffer({
		density: 1,
		width: colorPalette.length,
		height: 1,
		depthFormat: UNSIGNED_INT,
		textureFiltering: NEAREST
	});
	colorPaletteFramebuffer.loadPixels();
	for (let i = 0; i < colorPalette.length; i++) {
		let c = color(colorPalette[i]);
		colorPaletteFramebuffer.pixels[i * 4] = red(c);
		colorPaletteFramebuffer.pixels[i * 4 + 1] = green(c);
		colorPaletteFramebuffer.pixels[i * 4 + 2] = blue(c);
		colorPaletteFramebuffer.pixels[i * 4 + 3] = alpha(c);
	}
	colorPaletteFramebuffer.updatePixels();

	// Initialize and fill the charset color palette framebuffer
	charsetColorPaletteFramebuffer = createFramebuffer({
		density: 1,
		width: asciifier.fontManager.characters.length,
		height: 1,
		depthFormat: UNSIGNED_INT,
		textureFiltering: NEAREST
	});

	// Fetch the colors that correspond to each character in the font and fill the framebuffer
	charsetColorPalette = asciifier.fontManager.glyphColors(asciifier.fontManager.charactersString);
	charsetColorPaletteFramebuffer.loadPixels();
	for (let i = 0; i < asciifier.fontManager.characters.length; i++) {
		let c = charsetColorPalette[i];
		charsetColorPaletteFramebuffer.pixels[i * 4] = red(c);
		charsetColorPaletteFramebuffer.pixels[i * 4 + 1] = green(c);
		charsetColorPaletteFramebuffer.pixels[i * 4 + 2] = blue(c);
		charsetColorPaletteFramebuffer.pixels[i * 4 + 3] = alpha(c);
	}
	charsetColorPaletteFramebuffer.updatePixels();

	asciifier.fontSize(16); // Set the font size to 16 for the `P5Asciifier` instance

	// Fetch the framebuffers from the custom ascii renderer to apply custom logic on.
	// Each pixel within these framebuffers represents a property within the ascii grid at a given position.
	primaryColorSampleFramebuffer = asciifier.renderers().get("custom2D").primaryColorFramebuffer;
	secondaryColorSampleFramebuffer = asciifier.renderers().get("custom2D").secondaryColorFramebuffer;
	asciiCharacterFramebuffer = asciifier.renderers().get("custom2D").characterFramebuffer;

	asciifier.renderers().disable(); // Disable the default renderers and enable the pre-defined 'custom2D' one
	asciifier.renderers().get("custom2D").enable();

	// Initialize sketch framebuffers with the same dimensions as the ascii grid
	noiseFramebuffer = createFramebuffer({
		density: 1,
		width: asciifier.grid.cols,
		height: asciifier.grid.rows,
		depthFormat: UNSIGNED_INT,
		textureFiltering: NEAREST
	});

	shiftFramebuffer = createFramebuffer({
		density: 1,
		width: asciifier.grid.cols,
		height: asciifier.grid.rows,
		depthFormat: UNSIGNED_INT,
		textureFiltering: NEAREST
	});

	previousPushFramebuffer = createFramebuffer({
		density: 1,
		width: asciifier.grid.cols,
		height: asciifier.grid.rows,
		depthFormat: UNSIGNED_INT,
		textureFiltering: NEAREST
	});

	nextPushFramebuffer = createFramebuffer({
		density: 1,
		width: asciifier.grid.cols,
		height: asciifier.grid.rows,
		depthFormat: UNSIGNED_INT,
		textureFiltering: NEAREST
	});

	rectangleManager = new RectangleManager(asciifier.grid.cols, asciifier.grid.rows, 3, 1, 16);
	rectangleManager.initializeRectangles();

	runNoiseShader(0);
}

function runNoiseShader(frameCount) {
	noiseFramebuffer.begin();
	clear();
	shader(noiseShader);
	noiseShader.setUniform('u_bins', asciifier.fontManager.characters.length);
	noiseShader.setUniform('u_dimensions', [asciifier.grid.cols, asciifier.grid.rows]);
	noiseShader.setUniform('u_frameCount', frameCount);
	rect(0, 0, width, height);
	noiseFramebuffer.end();
}

function draw() {
	if (frameCount % (Math.max(asciifier.grid.cols, asciifier.grid.rows)) === 0) {
		rectangleManager.initializeRectangles();
		runNoiseShader(frameCount);
	}
	
	//if (frameCount%200==0) save("img_" + month() + '-' + day() + '_' + hour() + '-' + minute() + '-' + second() + ".jpg"); 

	// Create the texture based on the given rectangles, defining the direction each pixel should move
	shiftFramebuffer.begin();
	clear();
	shader(shiftShader);
	shiftShader.setUniform('u_resolution', [asciifier.grid.cols, asciifier.grid.rows]);
	shiftShader.setUniform('u_frameCount', frameCount);

	// 8 random rectangles have a position and size, the others are passed as [0, 0, 0, 0] to the shader
	// Each rectangle defines a pattern of movement for the pixels in the given area
	rectangleManager.rectangles.forEach((rect, index) => {
		shiftShader.setUniform(`u_rect${index}`, [rect.x, rect.y, rect.width, rect.height]);
	});

	rect(0, 0, width, height);
	shiftFramebuffer.end();

	// Swap the previous and next push framebuffers
	[previousPushFramebuffer, nextPushFramebuffer] = [nextPushFramebuffer, previousPushFramebuffer];

	nextPushFramebuffer.begin(); // Push the pixels based on the shiftFramebuffer's output
	clear();
	shader(pushShader);
	pushShader.setUniform('u_resolution', [asciifier.grid.cols, asciifier.grid.rows]);
	pushShader.setUniform('u_shiftMapTexture', shiftFramebuffer); // Shift map texture is used to determine the direction of the push
	pushShader.setUniform('u_noiseTexture', noiseFramebuffer); // Noise texture is used on the boundary
	pushShader.setUniform('u_previousFrameTexture', previousPushFramebuffer); // Previous frame texture is used on the rest
	rect(0, 0, width, height);
	nextPushFramebuffer.end();

	// Translate the pushShader's pixels into our ascii character colors for p5.asciify to render
	asciiCharacterFramebuffer.begin();
	clear();
	shader(asciiCharacterShader);
	asciiCharacterShader.setUniform('u_textureSize', [asciifier.grid.cols, asciifier.grid.rows]);
	asciiCharacterShader.setUniform('u_pushFramebuffer', nextPushFramebuffer);
	asciiCharacterShader.setUniform('u_charPaletteTexture', charsetColorPaletteFramebuffer);
	asciiCharacterShader.setUniform('u_charPaletteSize', [charsetColorPaletteFramebuffer.width, charsetColorPaletteFramebuffer.height]);
	rect(0, 0, width, height);
	asciiCharacterFramebuffer.end();

	// Translate the pushShader's pixels into our color palette for p5.asciify to render
	primaryColorSampleFramebuffer.begin();
	clear();
	shader(asciiColorPaletteShader);
	asciiColorPaletteShader.setUniform('u_textureSize', [asciifier.grid.cols, asciifier.grid.rows]);
	asciiColorPaletteShader.setUniform('u_pushFramebuffer', nextPushFramebuffer);
	asciiColorPaletteShader.setUniform('u_colorPaletteTexture', colorPaletteFramebuffer);
	asciiColorPaletteShader.setUniform('u_paletteSize', [colorPalette.length, 1]);
	rect(0, 0, width, height);
	primaryColorSampleFramebuffer.end();

	// Simply make all the grid cell background colors black.
	secondaryColorSampleFramebuffer.begin();
	background(0);
	secondaryColorSampleFramebuffer.end();
}

// After the asciified content is drawn to the canvas, use `drawAsciify()` to draw on top of it
function drawAsciify() {
	const fpsText = "" //+ Math.min(Math.ceil(frameRate()), 60);

	noStroke();
	fill(0);
	rect(-width / 2, height / 2 - textAscent() - 4, textWidth(fpsText), textAscent());

	textFont(asciifier.fontManager.font);
	textSize(64);
	fill(255, 255, 0);
	text(fpsText, -width / 2, height / 2);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);

	noiseFramebuffer.resize(asciifier.grid.cols, asciifier.grid.rows);
	shiftFramebuffer.resize(asciifier.grid.cols, asciifier.grid.rows);
	previousPushFramebuffer.resize(asciifier.grid.cols, asciifier.grid.rows);
	nextPushFramebuffer.resize(asciifier.grid.cols, asciifier.grid.rows);

	randomSeed(seed);
	noiseSeed(seed);

	rectangleManager.updateGridDimensions(asciifier.grid.cols, asciifier.grid.rows);
	rectangleManager.initializeRectangles();

	runNoiseShader(0);
}

class RectangleManager {
    /**
     * Initializes the RectangleManager with grid dimensions, split depth, spacing, and maximum rectangle count.
     * Creates a set of non-overlapping rectangles filling the grid space based on the split depth.
     * @param {Object} p5Instance - The p5 instance or "this" in global mode
     * @param {number} gridCols - Number of columns in the grid.
     * @param {number} gridRows - Number of rows in the grid.
     * @param {number} [splitDepth=3] - Maximum depth for recursive splitting. A depth of 3 generates 8 rectangles.
     * @param {number} [spacing=1] - Spacing between rectangles.
     * @param {number} [maxRectangleCount=64] - Maximum number of rectangles to generate. Extra rectangles are filled with zero dimensions.
     */
    constructor(gridCols, gridRows, splitDepth = 3, spacing = 1, maxRectangleCount = 16) {
        this.gridCols = gridCols;
        this.gridRows = gridRows;
        this.maxRectangleCount = maxRectangleCount;
        this.splitDepth = splitDepth;
        this.spacing = spacing;
        this.rectangles = [];
        this.maxRectangleDimension = 0;
    }

    /**
     * Updates the grid dimensions.
     * @param {number} gridCols - New number of columns in the grid.
     * @param {number} gridRows - New number of rows in the grid.
     */
    updateGridDimensions(gridCols, gridRows) {
        this.gridCols = gridCols;
        this.gridRows = gridRows;
    }

    /**
     * Initializes and generates the rectangles based on current grid dimensions and split depth.
     */
    initializeRectangles() {
        this.maxRectangleDimension = 0;
        this.rectangles = [];

        const container = {
            x: 0,
            y: 0,
            width: this.gridCols,
            height: this.gridRows
        };
        this.splitSpace(container, 0);

        // Calculate the maximum rectangle dimension
        this.rectangles.forEach(rect => {
            if (rect.width > 0 && rect.height > 0) {
                const maxDimension = Math.max(rect.width, rect.height);
                if (maxDimension > this.maxRectangleDimension) {
                    this.maxRectangleDimension = maxDimension;
                }
            }
        });

        // Ensure rectangles has exactly maxRectangleCount elements
        while (this.rectangles.length < this.maxRectangleCount) {
            this.rectangles.push({ x: 0, y: 0, width: 0, height: 0 });
        }

        this.rectangles = shuffle(this.rectangles); // Shuffle the rectangles
    }

    /**
     * Recursively splits the container space to generate rectangles.
     * Spacing is reserved between child containers to ensure no spacing at grid edges.
     * @param {Object} container - The current container with x, y, width, and height.
     * @param {number} depth - Current depth of recursion.
     */
    splitSpace(container, depth) {
        if (depth >= this.splitDepth) {
            // Base case: create rectangle without adding spacing to edges
            this.rectangles.push({
                x: container.x,
                y: container.y,
                width: container.width,
                height: container.height
            });
            return;
        }

        // Decide split direction randomly
        const splitHorizontal = random() > 0.5;

        if (splitHorizontal) {
            // Ensure there is enough height to split and apply spacing
            if (container.height <= this.spacing + 1) {
                this.rectangles.push({
                    x: container.x,
                    y: container.y,
                    width: container.width,
                    height: container.height
                });
                return;
            }

            // Choose a split point ensuring spacing is reserved between the two child containers
            const minSplit = Math.min(1, container.height - this.spacing - 1);
            const splitPoint = Math.floor(random() * (container.height - this.spacing)) + minSplit;

            // Define first child container
            const firstChild = {
                x: container.x,
                y: container.y,
                width: container.width,
                height: splitPoint
            };

            // Define second child container with spacing reserved
            const secondChild = {
                x: container.x,
                y: container.y + splitPoint + this.spacing,
                width: container.width,
                height: container.height - splitPoint - this.spacing
            };

            // Recursively split the child containers
            this.splitSpace(firstChild, depth + 1);
            this.splitSpace(secondChild, depth + 1);
        } else {
            // Ensure there is enough width to split and apply spacing
            if (container.width <= this.spacing + 1) {
                this.rectangles.push({
                    x: container.x,
                    y: container.y,
                    width: container.width,
                    height: container.height
                });
                return;
            }

            // Choose a split point ensuring spacing is reserved between the two child containers
            const minSplit = Math.min(1, container.width - this.spacing - 1);
            const splitPoint = Math.floor(random() * (container.width - this.spacing)) + minSplit;

            // Define first child container
            const firstChild = {
                x: container.x,
                y: container.y,
                width: splitPoint,
                height: container.height
            };

            // Define second child container with spacing reserved
            const secondChild = {
                x: container.x + splitPoint + this.spacing,
                y: container.y,
                width: container.width - splitPoint - this.spacing,
                height: container.height
            };

            // Recursively split the child containers
            this.splitSpace(firstChild, depth + 1);
            this.splitSpace(secondChild, depth + 1);
        }
    }
}


/**********
 * SHADERS
 **********/

const noiseFragShader = `
precision mediump float;

varying vec2 v_texCoord;

// Uniforms
uniform int u_bins;                // Number of bins for quantization (e.g., 8)
uniform vec2 u_dimensions;         // Dimensions of the texture (width, height)
uniform float u_frameCount;        // Frame count for time-based movement

// Hash function using a deterministic pseudo-random approach
float rand(vec2 co, float seed) {
    return fract(sin(dot(co, vec2(127.1, 311.7)) + seed) * 43758.5453);
}

void main() {
    // Convert normalized texture coordinates to absolute pixel coordinates
    vec2 pixelCoord = v_texCoord * u_dimensions;
    ivec2 ipixelCoord = ivec2(floor(pixelCoord));

    // Determine if the current pixel is on the single outermost boundary
    bool isBoundary = (ipixelCoord.x == 0) ||
                      (ipixelCoord.x == int(u_dimensions.x) - 1) ||
                      (ipixelCoord.y == 0) ||
                      (ipixelCoord.y == int(u_dimensions.y) - 1);

    if (isBoundary) {
        // Incorporate time-based variation to animate noise over frames
        float timeSeed = u_frameCount * 0.01;

        // Generate a unique seed for each boundary pixel by combining coordinates and time
        vec2 seedCoord = vec2(float(ipixelCoord.x), float(ipixelCoord.y)) + vec2(timeSeed);

        // Generate a pseudo-random value for the red channel based on the seed
        float redRandom = rand(seedCoord, timeSeed);

        // Quantize the random value into discrete bins
        float redIndex = floor(redRandom * float(u_bins));

        // Encode the index as a normalized value by dividing by 255.0
        float redValue = redIndex / 255.0;

        // Assign the quantized red value with full opacity
        gl_FragColor = vec4(redValue, redValue, redValue, 1.0);
    } else {
        // Non-boundary pixels are rendered as black
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
`;

const shiftFragShader = `
precision mediump float;

// === Uniforms ===
uniform vec2 u_resolution;

// Define 16 rectangle uniforms
uniform vec4 u_rect0;
uniform vec4 u_rect1;
uniform vec4 u_rect2;
uniform vec4 u_rect3;
uniform vec4 u_rect4;
uniform vec4 u_rect5;
uniform vec4 u_rect6;
uniform vec4 u_rect7;
uniform vec4 u_rect8;
uniform vec4 u_rect9;
uniform vec4 u_rect10;
uniform vec4 u_rect11;
uniform vec4 u_rect12;
uniform vec4 u_rect13;
uniform vec4 u_rect14;
uniform vec4 u_rect15;

// === Varying ===
varying vec2 v_texCoord;

// === Helper Function ===
// Checks if a point is inside a rectangle defined by bottom-left and top-right corners
bool insideBox(vec2 point, vec2 bottomLeft, vec2 topRight) {
    return all(greaterThanEqual(point, bottomLeft)) && all(lessThan(point, topRight));
}

void main() {
    // === Precomputations ===
    
    // Calculate texel size
    vec2 texelSize = 1.0 / u_resolution;
    vec2 offset = vec2(0.0);
    
    // Array to hold all rectangle uniforms
    vec4 rects[16];
    rects[0]  = u_rect0;
    rects[1]  = u_rect1;
    rects[2]  = u_rect2;
    rects[3]  = u_rect3;
    rects[4]  = u_rect4;
    rects[5]  = u_rect5;
    rects[6]  = u_rect6;
    rects[7]  = u_rect7;
    rects[8]  = u_rect8;
    rects[9]  = u_rect9;
    rects[10] = u_rect10;
    rects[11] = u_rect11;
    rects[12] = u_rect12;
    rects[13] = u_rect13;
    rects[14] = u_rect14;
    rects[15] = u_rect15;
    
    // Arrays to store normalized bottom-left and top-right coordinates of rectangles
    vec2 rectBottomLeft[16];
    vec2 rectTopRight[16];
    
    for(int i = 0; i < 16; i++) {
        rectBottomLeft[i] = rects[i].xy / u_resolution;
        rectTopRight[i]   = (rects[i].xy + rects[i].zw) / u_resolution;
    }
    
    // Convert texture coordinates to pixel space
    float texCoordX_px = v_texCoord.x * u_resolution.x;
    float texCoordY_px = v_texCoord.y * u_resolution.y;
    
    // === Offset Determination ===
    
    // Check each rectangle and assign corresponding offset
    if (insideBox(v_texCoord, rectBottomLeft[0], rectTopRight[0])) {
        // Rectangle 0: Shift diagonally up-left
        offset = texelSize;
    }
    else if (insideBox(v_texCoord, rectBottomLeft[1], rectTopRight[1])) {
        // Rectangle 1: Shift diagonally down-left
        offset = vec2(texelSize.x, -texelSize.y);
    }
    else if (insideBox(v_texCoord, rectBottomLeft[2], rectTopRight[2])) {
        // Rectangle 2: Shift diagonally up-right
        offset = vec2(-texelSize.x, texelSize.y);
    }
    else if (insideBox(v_texCoord, rectBottomLeft[3], rectTopRight[3])) {
        // Rectangle 3: Shift diagonally down-right
        offset = -texelSize;
    }
    else if (insideBox(v_texCoord, rectBottomLeft[4], rectTopRight[4])) {
        // Rectangle 4: Shift left
        offset = vec2(texelSize.x, 0.0);
    }
    else if (insideBox(v_texCoord, rectBottomLeft[5], rectTopRight[5])) {
        // Rectangle 5: Shift right
        offset = vec2(-texelSize.x, 0.0);
    }
    else if (insideBox(v_texCoord, rectBottomLeft[6], rectTopRight[6])) {
        // Rectangle 6: Shift up
        offset = vec2(0.0, texelSize.y);
    }
    else if (insideBox(v_texCoord, rectBottomLeft[7], rectTopRight[7])) {
        // Rectangle 7: Shift down
        offset = vec2(0.0, -texelSize.y);
    }
    else if (insideBox(v_texCoord, rectBottomLeft[8], rectTopRight[8])) {
        // Rectangle 8: Horizontal zig-zag
        float adjustedY = texCoordY_px - rects[8].y;
        float row = mod(floor(adjustedY), 2.0);
        offset = (row < 1.0) ? vec2(texelSize.x, 0.0) : vec2(-texelSize.x, 0.0);
    }
    else if (insideBox(v_texCoord, rectBottomLeft[9], rectTopRight[9])) {
        // Rectangle 9: Vertical zig-zag
        float adjustedX = texCoordX_px - rects[9].x;
        float column = mod(floor(adjustedX), 2.0);
        offset = (column < 1.0) ? vec2(0.0, texelSize.y) : vec2(0.0, -texelSize.y);
    }
    else if (insideBox(v_texCoord, rectBottomLeft[10], rectTopRight[10])) {
        // Rectangle 10: Horizontal split based on Y position
        float centerY = rects[10].y + rects[10].w * 0.5;
        offset.x += (texCoordY_px > centerY) ? texelSize.x : -texelSize.x;
    }
    else if (insideBox(v_texCoord, rectBottomLeft[11], rectTopRight[11])) {
        // Rectangle 11: Vertical split based on X position
        float centerX = rects[11].x + rects[11].z * 0.5;
        offset.y += (texCoordX_px > centerX) ? texelSize.y : -texelSize.y;
    }
    else if (insideBox(v_texCoord, rectBottomLeft[12], rectTopRight[12])) {
        // Rectangle 12: Horizontal shear to the left
        float shearFactor = 0.5; // Adjust for more or less shear
        float offsetX = mod(floor(texCoordY_px * shearFactor), 2.0) * texelSize.x;
        offset.x += offsetX;
    }
    else if (insideBox(v_texCoord, rectBottomLeft[13], rectTopRight[13])) {
        // Rectangle 13: Vertical shear upwards
        float shearFactor = 0.5; // Adjust for more or less shear
        float offsetY = mod(floor(texCoordX_px * shearFactor), 2.0) * texelSize.y;
        offset.y += offsetY;
    }
    else if (insideBox(v_texCoord, rectBottomLeft[14], rectTopRight[14])) {
        // Rectangle 14: Horizontal shear to the right
        float shearFactor = 0.5; // Adjust for more or less shear
        float offsetX = mod(floor(texCoordY_px * shearFactor), 2.0) * texelSize.x;
        offset.x -= offsetX;
    }
    else if (insideBox(v_texCoord, rectBottomLeft[15], rectTopRight[15])) {
        // Rectangle 15: Vertical shear downwards
        float shearFactor = 0.5; // Adjust for more or less shear
        float offsetY = mod(floor(texCoordX_px * shearFactor), 2.0) * texelSize.y;
        offset.y -= offsetY;
    }
    else {
        // Default case: No offset
        offset = vec2(0.0);
    }
    
    // === Final Calculations ===
    
    // Convert offset to pixel space and round to nearest integer
    vec2 offsetInPixels = floor(offset * u_resolution + 0.5);
    
    // Clamp the offset to be within [-1, 1]
    offsetInPixels = clamp(offsetInPixels, -1.0, 1.0);
    
    // Map the clamped offset to color values to decode later for applying the pixel shift/push
    float shiftXColor = (offsetInPixels.x + 1.0) * 0.5;
    float shiftYColor = (offsetInPixels.y + 1.0) * 0.5;
    
    // Set the fragment color
    gl_FragColor = vec4(shiftXColor, shiftYColor, 0.0, 1.0);
}
`;

const pushFragShader = `
precision mediump float;

uniform sampler2D u_shiftMapTexture; // Texture containing the shift values
uniform sampler2D u_noiseTexture;   // Texture containing the noise values
uniform sampler2D u_previousFrameTexture; // Texture containing the previous frame to apply the pixel shift/push on
uniform vec2 u_resolution;         // Resolution of the texture

varying vec2 v_texCoord;

vec2 getShift(ivec2 coord) {
    vec2 texCoord = (vec2(coord) + 0.5) / u_resolution;
    vec4 shiftColor = texture2D(u_shiftMapTexture, texCoord);

    // Decode shifts: -1, 0, or 1
    float shiftX = (shiftColor.r * 2.0) - 1.0;
    float shiftY = (shiftColor.g * 2.0) - 1.0;

    // Round to nearest integer
    float shiftXRounded = floor(shiftX + 0.5);
    float shiftYRounded = floor(shiftY + 0.5);

    return vec2(clamp(shiftXRounded, -1.0, 1.0), clamp(shiftYRounded, -1.0, 1.0));
}

void main() {
    ivec2 pixelCoord = ivec2(floor(v_texCoord * u_resolution));

    vec2 shift = getShift(pixelCoord);
    ivec2 shiftInt = ivec2(shift);
    ivec2 shiftedCoord = pixelCoord + shiftInt;

    // Bounds checking for shifted coordinates
    if(shiftedCoord.x < 0 || shiftedCoord.x >= int(u_resolution.x) ||
        shiftedCoord.y < 0 || shiftedCoord.y >= int(u_resolution.y)) {
        gl_FragColor = texture2D(u_noiseTexture, v_texCoord);
    } else {
        vec2 shiftedTexCoord = (vec2(shiftedCoord) + 0.5) / u_resolution;
        vec4 color = texture2D(u_previousFrameTexture, shiftedTexCoord);
        gl_FragColor = color;
    }
}
`;

const asciiCharacterFragShader = `
#version 100
precision mediump float;

uniform sampler2D u_pushFramebuffer;        // Texture containing the push values
uniform sampler2D u_charPaletteTexture;      // Texture containing the character palette
uniform vec2 u_charPaletteSize;              // Number of characters in the palette (e.g., [8, 1])
uniform vec2 u_textureSize;                  // Size of the pushFramebuffer texture (e.g., [64, 64])

void main() {
    // Normalize fragment coordinates
    vec2 pos = (gl_FragCoord.xy) / u_textureSize;

    // Sample the pushFramebuffer texture at the calculated position
    vec4 pushColor = texture2D(u_pushFramebuffer, pos);

    // Decode the integer index from the red channel
    float index = floor(pushColor.r * 255.0 + 0.5);

    // Ensure the index wraps around if it exceeds the palette size
    float wrappedIndex = mod(index, u_charPaletteSize.x);

    // Calculate the normalized x-coordinate in the character palette texture
    // Adding 0.5 to sample at the center of the texel
    float x_coord = (wrappedIndex + 0.5) / u_charPaletteSize.x;

    // Define the character position in the palette (assuming a single row)
    vec2 charPos = vec2(x_coord, 0.5); // y-coordinate centered

    // Sample the character color from the palette texture
    vec4 charColor = texture2D(u_charPaletteTexture, charPos);

    // Output the final color with full opacity
    gl_FragColor = vec4(charColor.rgb, 1.0);
}
`;

const asciiColorFragShader = `
#version 100
precision mediump float;

uniform sampler2D u_pushFramebuffer;        // Texture containing the push values
uniform vec2 u_textureSize;                  // Size of the pushFramebuffer texture (e.g., [64, 64])

uniform sampler2D u_colorPaletteTexture;     // Texture containing the color palette
uniform vec2 u_paletteSize;                  // Dimensions of the color palette (e.g., [8, 1])

void main() {
    // Normalize fragment coordinates
    vec2 pos = (gl_FragCoord.xy) / u_textureSize;

    // Ensure pos is within [0, 1] to prevent out-of-bounds sampling
    pos = clamp(pos, 0.0, 1.0);

    // Retrieve the push color from the framebuffer
    vec4 pushColor = texture2D(u_pushFramebuffer, pos);

    // Decode the integer index from the red channel
    float index = floor(pushColor.r * 255.0 + 0.5);

    // Ensure the index wraps around if it exceeds the palette size
    float wrappedIndex = mod(index, u_paletteSize.x);

    // Calculate the normalized x-coordinate in the color palette texture
    // Adding 0.5 to sample at the center of the texel
    float x_coord = (wrappedIndex + 0.5) / u_paletteSize.x;

    // Define the palette coordinate (assuming a single row)
    vec2 paletteCoord = vec2(x_coord, 0.5); // y-coordinate centered

    // Fetch the color from the palette texture
    vec4 paletteColor = texture2D(u_colorPaletteTexture, paletteCoord);

    // Output the final color with full opacity
    gl_FragColor = vec4(paletteColor.rgb, 1.0);
}
`;

const vertexShader = `
precision lowp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 v_texCoord;

void main() {
    vec4 positionVec4 = vec4(aPosition, 1.0);

    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

    gl_Position = positionVec4;

    v_texCoord = aTexCoord;
}
`;