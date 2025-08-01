/*
                    {   { ✨
								  { ✨  {
							   {   {             for   #WCCChallenge
(∩｀-´)⊃━☆ﾟ.*・｡ﾟ{  {  		@SableRaph's   https://www.twitch.tv/sableraph
							   {   {          theme: 	 Nope 🫨
								  { ✨  {                https://discord.gg/S8c7qcjw2b
                      {   { ✨

# Warning:
The last tab may crash your browser
bc all the code gets rendered at once.

# About
I intrepreted "nope" as "exit portal ✋🪞"
If you right click > Toggle Layers > View 3D you can see
  the layers/tabs that compose the final output

# Credits:
I was scrolling Pinterest and found saw this screenshot
and thought it would be fun to animate it:
https://www.pinterest.com/pin/1337074886874246/

For the clouds, I used Bing AI to guide me through
adapting this shader to p5.js:
https://www.shadertoy.com/view/4tdSWr

# Remixes
I used sin() and cos() to oscillate the spots,
and then used that as a texture for
the boardwalk and wall texture.

And the starfield is from an earlier sketch
which I learned from CodingTrain

# @todo:
- [x] Get it to work
- [x] Make it responsive/aspect ratio
- [ ] Water/touch effect on portal

# Layers.p5:
https://github.com/ozramos/layers.p5
https://layersp5.netlify.app/

▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄
*/
setTimeout(() => { // Wait for last tab to load
	Layers.create(() => {
		new Layer({
			id: 'boardwalk',
			menu: {
				spotSize: {
					min: () => minSize*.025,
					max: ()=> minSize*.06,
					onChange () {this.setup()}
				},
			},

			$: {
				width: 2.5,
				height: 4
			},

			draw () {
				background(255)

				// Create black circles based on number of columns
				// extending the full height of the cnavas
				const cols = ~~(width/$spotSize)
				const rows = ~~(height/$spotSize)

				for (let x = -1; x < cols+2; x+=1) {
					for (let y = -1; y < rows+2; y+=1) {
						if (x%2) {
							fill(0)
							if (y%2) {
								circle(
									x*$spotSize + (y%2) * $spotSize,
									y*$spotSize,
									$spotSize * sin(frameCount * 0.05)
								)
							} else {
								circle(
									x*$spotSize + (y%2) * $spotSize,
									y*$spotSize,
									$spotSize * cos(frameCount * 0.05)
								)
							}
						}
					}
				}
			}
		})
	})
}, 0)