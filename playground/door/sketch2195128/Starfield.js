setTimeout(() => { // Wait for last tab to load
	Layers.create(() => {
		new Layer({
			id: 'starfield',

			menu: {
				numStars: {min: 800, max: 1600, onChange () {this.setup()}},
				size: {min: () => minSize*.03, max: () => minSize*.05},
				speed: {min: 2, max: 40, default: random(2, 10)},
			},

			$: {
				stars: [],
				width: 2.5,
				height: 4
			},

			setup () {
				// Seed universe
				$stars = []
				for (let i = 0; i < $numStars; i++) {
					$stars.push(new Star())
				}
			},

			draw () {
				background(0, 20, 5, 50)
				push()
				translate(width*$width/3/2, height/2)
				$stars.forEach((star, n) => {
					star.update()
					star.draw()
				})
				pop()
			}
		})

		/**
		 * Star class
		 */
		const Star = class {
			constructor () {
				this.x = random(-width*$width/2, width*$width/2)
				this.y = random(-height, height)
				this.z = random(width*$width/2*.1, width*$width/2 * 1)
				this.life = 0
				this.lastZ = this.z
			}

			update () {
				this.z -= $speed
				if (this.z < 1) {
					this.x = random(-width*$width/2/2, width*$width/2/2)
					this.y = random(-height/2, height/2)
					this.z = random(width*$width/2*.2, width*$width/2 * 1)
					this.lastZ = this.z
					this.life = 0
				}
			}

			draw () {
				noStroke()
				const sx = map(this.x / this.z, 0, 1, 0, width*$width/2)
				const sy = map(this.y / this.z, 0, 1, 0, height)
				const r = map(this.z, 0, width*$width/2, $size, 0)

				// Fade in
				// @todo make range further
				this.life += 10
				fill(255, 255, 255, min(this.life, 255))
				ellipse(sx, sy, r, r)

				const px = map(this.x / this.lastZ, 0, 1, 0, width*$width/2)
				const py = map(this.y / this.lastZ, 0, 1, 0, height)
				this.lastZ = this.z

				stroke(255, 255, 255, min(255, this.life))
			}
		}  
})
}, 0)