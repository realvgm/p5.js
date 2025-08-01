import * as Shox from "https://cdn.jsdelivr.net/npm/shox@1.2.0/src/Shox.js"

export const BLUR = `#version 300 es
	precision highp float;

	uniform sampler2D tex0;
	uniform vec2 texelSize;
	uniform vec2 direction;

	${Shox.blur(3)}

	in vec2 vTexCoord;
	out vec4 fragColor;
	void main() { 
		fragColor = blur(vTexCoord, tex0, texelSize, direction); 
	}
`

export const UNSHARP = `#version 300 es
	precision mediump float;

	uniform sampler2D tex0;
	uniform vec2 texelSize;

	${Shox.unsharp}

	in vec2 vTexCoord;
	out vec4 fragColor;
	void main() { 
		fragColor = unsharp(vTexCoord, tex0, texelSize *8.0, 128.0);
	}
`

export const VERT = `#version 300 es

	in vec4 aPosition;
	in vec2 aTexCoord;

	out vec2 vTexCoord;

	void main() {
		vTexCoord = aTexCoord;
		gl_Position = aPosition;
	}
`
