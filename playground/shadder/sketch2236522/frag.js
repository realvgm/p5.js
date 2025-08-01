//By me
// noprotect

const frag = `
	#ifdef GL_ES
	precision mediump float;
	#endif
	
	int particleCount = 10;
	uniform vec2 u_resolution;
	uniform float u_time;

	${frag_functions_default}

	void main(){
		vec2 coord = 5.0 * gl_FragCoord.xy /u_resolution.xy;
		
		for(int i=0;i<3;i++){
			float index = float(i);
			coord += vec2(sin(u_time + coord.y) * index, 1.0 - cos(u_time + coord.x * index));
		}
		
		vec3 color = vec3(
			sin(coord.x*0.5 + u_time*2.0),
			cos(coord.y*0.6 + u_time*3.0),
			0.1 * 0.1 + cos((coord.y + coord.x)*0.8 + u_time*4.5));
		gl_FragColor = vec4(color, 1.0);
	}
`



