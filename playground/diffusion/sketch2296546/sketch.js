import { mountFlex } from "https://cdn.jsdelivr.net/npm/p5.flex@0.2.0/src/p5.flex.mjs"
import { BLUR, UNSHARP, VERT } from "./shader.js"

p5.disableFriendlyErrors = true
mountFlex(p5)

new p5((p) => {
    const [WIDTH, HEIGHT] = [1000, 1000]
    const PIXEL_DENSITY = 1
    const TEXEL_SIZE = [1 / (WIDTH * PIXEL_DENSITY), 1 / (HEIGHT * PIXEL_DENSITY)]
    const RENDERER = p.WEBGL
    const MIN_SIDE = p.min(WIDTH, HEIGHT)
    const CHARACTER = "OV"  // The character to be drawn
    
    let boldFont

    p.preload = () => {
        boldFont = p.loadFont("https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf") // Load a bold font
    }

    let cnv, gfx, charBuffer
    let BlurPass, UnsharpPass
    let CURSOR_COLOR = 255

    p.setup = () => {
        cnv = p.createCanvas(WIDTH, HEIGHT, RENDERER)
        p.flex({ container: { padding: "20px" }, canvas: { fit: p.SCALE_DOWN } })
        p.pixelDensity(PIXEL_DENSITY)

        gfx = p.createGraphics(WIDTH, HEIGHT, p.WEBGL)
        charBuffer = p.createGraphics(WIDTH, HEIGHT)

        BlurPass = p.createShader(VERT, BLUR)
        UnsharpPass = p.createShader(VERT, UNSHARP)

        RENDERER === p.WEBGL && p.rectMode(p.CENTER)
        RENDERER === p.WEBGL && p.imageMode(p.CENTER)

        p.background(0)
        p.noStroke()
        gfx.noStroke()

        // Draw the character with gradient background onto the buffer
        drawCharacterWithGradientBackground()

        // Use the buffer as the initial image
        p.image(charBuffer, 0, 0, WIDTH, HEIGHT)

        for (let _ = 0; _ < 3; _++) p.draw()
    }

    p.draw = () => {
        Cursor()
        // Border()
        ReactionDiffusion()
    }

    p.keyPressed = () => p.key === " " && (CURSOR_COLOR = CURSOR_COLOR ? 0 : 255)

    const Cursor = () => {
        p.push()
        RENDERER === p.WEBGL && p.translate(-WIDTH / 2, -HEIGHT / 2)
        p.fill(CURSOR_COLOR)
        p.mouseIsPressed && p.circle(p.mouseX, p.mouseY, MIN_SIDE / 6)
        p.pop()
    }

    const Border = () => {
        p.push()
        p.noFill()
        p.stroke(0)
        p.strokeWeight(MIN_SIDE / 6)
        p.rect(0, 0, WIDTH, HEIGHT)
        p.pop()
    }

    const ReactionDiffusion = () => {
        gfx.shader(BlurPass)
        BlurPass.setUniform("texelSize", TEXEL_SIZE)
        BlurPass.setUniform("tex0", cnv)
        BlurPass.setUniform("direction", [1, 0])
        gfx.quad(-1, 1, 1, 1, 1, -1, -1, -1)

        gfx.shader(BlurPass)
        BlurPass.setUniform("texelSize", TEXEL_SIZE)
        BlurPass.setUniform("tex0", gfx)
        BlurPass.setUniform("direction", [0, 1])
        gfx.quad(-1, 1, 1, 1, 1, -1, -1, -1)

        gfx.shader(UnsharpPass)
        UnsharpPass.setUniform("texelSize", TEXEL_SIZE)
        UnsharpPass.setUniform("tex0", gfx)
        gfx.quad(-1, 1, 1, 1, 1, -1, -1, -1)

        p.image(gfx, 0, 0)
    }

    const drawCharacterWithGradientBackground = () => {
        charBuffer.loadPixels()
        for (let x = 0; x < WIDTH; x++) {
            for (let y = 0; y < HEIGHT; y++) {
                let distToCenter = p.dist(x, y, WIDTH / 2, HEIGHT / 2)
                let maxDist = p.dist(0, 0, WIDTH / 2, HEIGHT / 2)
                let gradient = p.map(distToCenter, 0, maxDist, 1, 0)
                charBuffer.set(x, y, p.color(255 * (1 - gradient), 255 * (gradient), 255 * ( gradient)))
            }
        }
        charBuffer.updatePixels()
        
        // Draw the character onto the buffer
        charBuffer.fill(0)
        charBuffer.textAlign(p.CENTER, p.CENTER)
        charBuffer.textSize(MIN_SIDE * 0.6)
        charBuffer.textFont(boldFont) // Use the bold font
        charBuffer.text(CHARACTER, WIDTH / 2, HEIGHT / 2 - 110)
    }
})
