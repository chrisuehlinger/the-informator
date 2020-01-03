/* global define, require */
(function (root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['seriously'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		factory(require('seriously'));
	} else {
		if (!root.Seriously) {
			root.Seriously = { plugin: function (name, opt) { this[name] = opt; } };
		}
		factory(root.Seriously);
	}
}(window, function (Seriously) {
	'use strict';

	Seriously.plugin('fisheye', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
      shaderSource.fragment = `
      precision mediump float;

      varying vec2 vTexCoord;
      uniform sampler2D source;
      uniform float aperture;

      void main()
      {
        float resX = 1280.0;
        float resY = 720.0;
        float PI = 3.1415926535;

        //normalized coords with some cheat
        vec2 p = gl_FragCoord.xy / resX;

        //screen proportion
        float prop = resX / resY;
        //center coords
        vec2 m = vec2(0.5, 0.5 / prop);
        //vector from center to current fragment
        vec2 d = p - m;
        // distance of pixel from center
        float r = sqrt(dot(d, d));
        //amount of effect
        float power = ( 2.0 * 3.141592 / (2.0 * sqrt(dot(m, m))) ) * (aperture/360.0 - 0.5);
        //radius of 1:1 effect
        float bind;
        if (power > 0.0) bind = sqrt(dot(m, m));//stick to corners
        else {if (prop < 1.0) bind = m.x; else bind = m.y;}//stick to borders

        //Weird formulas
        vec2 uv;
        if (power > 0.0)//fisheye
          uv = m + normalize(d) * tan(r * power) * bind / tan( bind * power);
        else if (power < 0.0)//antifisheye
         uv = m + normalize(d) * atan(r * -power * 10.0) * bind / atan(-power * bind * 10.0);
        else
          uv = p;//no effect for power = 1.0

        //Second part of cheat
        //for round effect, not elliptical
        vec3 col = texture2D(source, vec2(uv.x, -uv.y * prop)).xyz;

        gl_FragColor = vec4(col, 1.0);
      }

      `;
			return shaderSource;
		},
		inPlace: false,
		inputs: {
			source: {
				type: 'image',
				uniform: 'source'
			},
			amount: {
				type: 'number',
				uniform: 'aperture',
				defaultValue: 270,
        min: 0,
        max: 360
			}
		},
		title: 'Fisheye',
		description: 'Fisheye'
	});
}));
