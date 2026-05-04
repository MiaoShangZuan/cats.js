import GLRenderer from './GLRenderer.js';
import SpriteGenerator from './SpriteGenerator.js';
import sort from '../sort.js';
import { Matrix4 } from '../math/matrix.js';

const {min, max} = Math;

const mainVertexShaderSource = `
void main() {
    gl_Position = vertTransform();
}
`;
const mainFragmentShaderSource = `
void main() {
    o_texture = fragOutput();
    o_depthtex = gl_FragCoord.z;
    //colorShade(o_texture, o_depthtex);
}
`;
const defaultVertexSource = `#version 300 es
void main() {
    float x = mod(floor(float(gl_VertexID+1) / 3.0), 2.0) * 2.0 - 1.0;
    float y = mod(floor(float(gl_VertexID+5) / 3.0), 2.0) * 2.0 - 1.0;
    gl_Position = vec4(x, y, 0.999999, 1.0);
}`;
const defaultColorBlendFunc = `
/*
 * bcol 背景色
 * fcol 前景色
 */
vec4 colorBlend(vec4 bcol, vec4 fcol) {
	float a = bcol.a * (1. - fcol.a), alpha = fcol.a + a;
	return vec4(
    	(bcol.r * a + fcol.r * fcol.a) / alpha,
        (bcol.g * a + fcol.g * fcol.a) / alpha,
        (bcol.b * a + fcol.b * fcol.a) / alpha,
        alpha
    );
}`;
const postfxSource = `
void PostFX(out vec4 fragColor, in vec2 fragCoord) {
    // 芝士后处理函数~
    // 在这里写后处理代码
}
`;

/**
 * CatsJS-渲染器
 * 当前版本 0.1.4
 * system texture unit 0~21
 * 于2025年3月16日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
class WebGLRenderer extends GLRenderer {
    constructor() {
        super();
        this.type = 'Renderer';
        this.SpriteGenerator = new SpriteGenerator();
        this._sprite_state_ = false;
        this._multi_pass_state_ = false;
        this.DRAW_ATTRIBUTES = {
            scene: undefined,
            camera: undefined,
            INIT_TEXTUREUNITS_STATE: false,
            INIT_TEXTUREUNITS_ONLOAD: undefined,
            INIT_TEXTUREUNITS_ONLOAD2: undefined,
            INIT_TEXTUREUNITS_ONLOAD_STATE: false
        };
        this.MAIN_VERTEX_SHADER_SOURCE = mainVertexShaderSource;
        this.MAIN_FRAGMENT_SHADER_SOURCE = mainFragmentShaderSource;
        this.FRAG_1_SHADER_SOURCE = undefined;
        this.FRAG_2_SHADER_SOURCE = undefined;
        this.FRAG_3_SHADER_SOURCE = undefined;
        this.POST_FX_SOURCE = postfxSource;
        this.MAIN_PASS_DRAW_START = undefined;
        this.MAIN_PASS_DRAW_END = undefined;
        this.FRAG_1_PASS_DRAW_START = undefined;
        this.FRAG_1_PASS_DRAW_END = undefined;
        this.FRAG_2_PASS_DRAW_START = undefined;
        this.FRAG_2_PASS_DRAW_END = undefined;
        this.FRAG_3_PASS_DRAW_START = undefined;
        this.FRAG_3_PASS_DRAW_END = undefined;
        this.FINAL_PASS_DRAW_START = undefined;
        this.FINAL_PASS_DRAW_END = undefined;
        //this.FRAG_1_ACTIVATE = false;
        //this.FRAG_2_ACTIVATE = false;
        //this.FRAG_3_ACTIVATE = false;
        this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA = { 
            index: -1,
            mapUnit: 0,
            mapUnit1: -1,
            mapUnit2: -1,
            mapUnit3: -1,
            //mapUnit4Type: undefined,
            //mapUnit5Type: undefined,
            //mapUnit6Type: undefined
        };
        this.FRAMEBUFFER0 = undefined;
        this.FRAMEBUFFER2 = undefined;
        this.FRAMEBUFFER3 = undefined;
        this.FRAMEBUFFER4 = undefined;
        this.TEXTURE_UNIT_0_MIPMAP = false;
        this.TEXTURE_UNIT_4_MIPMAP = false;
        this.TEXTURE_UNIT_5_MIPMAP = false;
        this.TEXTURE_UNIT_6_MIPMAP = false;
        this.TEXTURE_UNIT_7_MIPMAP = false;
        this.TEXTURE_UNIT_8_MIPMAP = false;
        this.TEXTURE_UNIT_9_MIPMAP = false;
        this.fragmentShaderExtension = false;
        this.updateDrawFunc = (state, images, videos)=>{
            const scene = this.DRAW_ATTRIBUTES.scene;
            if(state) {
                // 纹理已更新
                // console.log('纹理已更新');
                const image_count = min(6, images.length);
                for(let i=0; i<image_count; i++) {
                    const index = i + 10;
                    if(this.existsTextureUnit(index)) this.deleteTextureUnit(index);
                    this.inTextureUnit(images[i], index); // 将图片传入至片元着色器
                    scene.setSpriteTexture(images[i]);
                }

                const video_count = min(6, videos.length);
                for(let j=0; j<video_count; j++) {
                    const index = j + 16;
                    if(this.existsTextureUnit(index)) this.deleteTextureUnit(index);
                    this.inTextureUnit(videos[j].media, index); // 将图片传入至片元着色器
                    //scene.setSpriteTexture(images[i]);
                }

                for(let Model of scene.element) {
                    if(Model.material && Model.material.maps && Model.material.maps.length>0) {
                        for(let texture of Model.material.maps) {
                            texture.glTexture = this.getTextureUnit(texture.mapUnit);
                        }
                    }
                }
            }
            this.DRAW_ATTRIBUTES.INIT_TEXTUREUNITS_ONLOAD?.();
            if(!this.DRAW_ATTRIBUTES.INIT_TEXTUREUNITS_STATE) {
                this.DRAW_ATTRIBUTES.INIT_TEXTUREUNITS_STATE = true;
                this.DRAW_ATTRIBUTES.INIT_TEXTUREUNITS_ONLOAD2?.();
            }
        };
    }
    getFragsShaderSource( index=1 ) {
        let source = this[`FRAG_${index}_SHADER_SOURCE`];
        if(!source) {
            const readtex = index==1 ? 'u_texture' : `u_colortex${this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA[`mapUnit${index-1}`]}`;
            source = `
uniform sampler2D ${readtex};
uniform vec2 u_resolution;
out vec4 fragColor;
void main() {
    vec2 texcoord = gl_FragCoord.xy / u_resolution;
    fragColor = texture(${readtex}, texcoord);
}`;
        }
        return source;
    }
    setMainDrawStart( func ) {
        this.MAIN_PASS_DRAW_START = func;
    }
    setMainDrawEnd( func ) {
        this.MAIN_PASS_DRAW_END = func;
    }
    setFragsDrawStart( index=1, func ) {
        this[`FRAG_${index}_PASS_DRAW_START`] = func;
    }
    setFragsDrawEnd( index=1, func ) {
        this[`FRAG_${index}_PASS_DRAW_END`] = func;
    }
    setFinalDrawStart( func ) {
        this.FINAL_PASS_DRAW_START = func;
    }
    setFinalDrawEnd( func ) {
        this.FINAL_PASS_DRAW_END = func;
    }
    setVertSource( source ) {
        this.MAIN_VERTEX_SHADER_SOURCE = source;
    }
    setFragSource( source ) {
        this.MAIN_FRAGMENT_SHADER_SOURCE = source;
    }
    setFragsSource( index=1, source ) {
        this[`FRAG_${index}_SHADER_SOURCE`] = source;
    }
    setPostFXSource( source ) {
        this.POST_FX_SOURCE = source;
    }
    setTextureUnitMipmap( mapUnit=0, state=false ) {
        this[`TEXTURE_UNIT_${mapUnit}_MIPMAP`] = state;
        if(!state) {
            const gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.getTextureUnit(mapUnit));
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
    activateFragShader( mapUnit=4 ) {
        if(mapUnit<4 || this.existsTextureUnit(mapUnit)) {
            console.error(`第${mapUnit}号纹理单元已被占用！`);
        }
        else if(this.fragmentShaderExtension) {
            const gl = this.gl, index = max(1, this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA.index+1);

            this.inBlankTextureUnit(this.naturalWidth, this.naturalHeight, mapUnit, {filterMin: gl.LINEAR, filterMag: gl.LINEAR});
            const texture = this.getTextureUnit(mapUnit);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this[`FRAMEBUFFER${index+1}`] = fbo;
            //this[`FRAG_${index}_ACTIVATE`] = true;
            this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA[`mapUnit${index}`] = mapUnit;
            
            this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA.index = index;
            this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA.mapUnit = mapUnit;
            //this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA[`mapUnit${mapUnit}Type`] = true;
        }
    }
    setAssetPreloading( scene, camera, func ) {
        this.DRAW_ATTRIBUTES.scene = scene;
        this.DRAW_ATTRIBUTES.camera = camera;
        this.DRAW_ATTRIBUTES.INIT_TEXTUREUNITS_ONLOAD2 = func;
    }
    assetPreloading() {
        this.updateMaps(this.DRAW_ATTRIBUTES.scene.element, this.updateDrawFunc);
    }
    initMultiPass() {
        if(!this._multi_pass_state_) {
            this.addPass({
                vertexSource: `#version 300 es
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color;
layout(location = 2) in vec3 a_uv;

uniform mat4 u_mvsmat;
uniform int u_id;

out vec4 v_color;
out vec3 v_uv;

vec4 vertTransform() {
    v_color = a_color;
    v_uv = a_uv;
    return u_mvsmat * vec4( a_position, 1.0 );
}

${this.MAIN_VERTEX_SHADER_SOURCE}`,
                fragmentSource: `#version 300 es
precision highp float;
precision highp int;

layout(location = 0) out vec4 o_texture;
layout(location = 1) out float o_depthtex;

uniform sampler2D u_imagetex;
uniform vec2 u_resolution;
uniform mat3 u_uvmat;
uniform int u_id;

in vec4 v_color;
in vec3 v_uv;

vec4 fragOutput() {
    vec4 color = v_color;
    if( v_uv.p > 0.0 ) {
        vec3 uv = u_uvmat * v_uv;
        vec4 pixel = texture( u_imagetex, uv.st );
        color.rgb = pixel.rgb;
        color.a *= pixel.a;
    }
    return color;
}

${this.MAIN_FRAGMENT_SHADER_SOURCE}`,
                drawFunc: (gl, program)=>{
                    gl.useProgram(program);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

                    const camera = this.DRAW_ATTRIBUTES.camera;

                    // u_imagetex
                    gl.uniform1i(
                        gl.getUniformLocation(program, 'u_imagetex'),
                        10
                    );
                    // Scale Matrix
                    const vs_mat = new Matrix4([
                        camera.unitX / this.width * 2, 0, 0, 0,
                        0, camera.unitY / this.height * 2, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ]);
                    vs_mat.multiply(camera.matrix()); // View Matrix

                    this.MAIN_PASS_DRAW_START?.(gl, program);

                    if(!this.DRAW_ATTRIBUTES.INIT_TEXTUREUNITS_ONLOAD_STATE) {
                        this.DRAW_ATTRIBUTES.INIT_TEXTUREUNITS_ONLOAD = ()=>{
                            const element = sort(this.DRAW_ATTRIBUTES.scene.element, 'position.z');
                            // 绘制模型
                            const texunit0 = this.getTextureUnit(0);
                            if(this.TEXTURE_UNIT_0_MIPMAP) {
                                gl.bindTexture(gl.TEXTURE_2D, texunit0);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                gl.bindTexture(gl.TEXTURE_2D, null);
                            }
                            gl.bindFramebuffer(gl.FRAMEBUFFER, this.FRAMEBUFFER0);
                            // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            gl.clearBufferfv(gl.COLOR, 0, [0,0,0,0]);
                            gl.clearBufferfv(gl.COLOR, 1, [0,0,0,0]);
                            element.forEach(Model => Model.draw(gl, program, vs_mat));
                            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                            if(this.TEXTURE_UNIT_0_MIPMAP) {
                                gl.bindTexture(gl.TEXTURE_2D, texunit0);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                                gl.generateMipmap(gl.TEXTURE_2D);
                                gl.bindTexture(gl.TEXTURE_2D, null);
                            }
                            this.MAIN_PASS_DRAW_END?.(gl, program);
                            //console.log('pass0绘制完成');
                            if(this.fragmentShaderExtension) {
                                // 中间层
                                for(let k=2; k<this.PROGRAMS.length; k++) {
                                    //if(this[`FRAG_${k-1}_ACTIVATE`]) {
                                        const passk = this.PROGRAMS[k];
                                        passk.drawFunc(gl, passk.program);
                                    //}
                                }
                            }
                            const pass1 = this.PROGRAMS[1];
                            pass1.drawFunc(gl, pass1.program);
                        };
                        this.DRAW_ATTRIBUTES.INIT_TEXTUREUNITS_ONLOAD_STATE = true;
                    }

                    this.assetPreloading();
                }
            });
            this.addPass({
                vertexSource: defaultVertexSource,
                fragmentSource: `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform sampler2D u_texture;
uniform sampler2D u_depthtex;
uniform vec2 u_resolution;
uniform vec4 u_background;

${defaultColorBlendFunc}

${this.POST_FX_SOURCE}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec4 color = u_background;
    vec4 map = texture(u_texture, uv);
    //map.rgb /= map.a;

    if(map.a > 1e-4) color = colorBlend(color, map);
    
    fragColor = color;
    PostFX(fragColor, gl_FragCoord.xy);
}`,
                drawFunc: (gl, program)=>{
                    gl.useProgram(program);
                    gl.blendFunc(gl.ONE, gl.ZERO);

                    const scene = this.DRAW_ATTRIBUTES.scene;

                    // u_background
                    gl.uniform4f(
                        gl.getUniformLocation(program, 'u_background'),
                        scene.color.r,
                        scene.color.g,
                        scene.color.b,
                        scene.color.a
                    );
                    this.FINAL_PASS_DRAW_START?.(gl, program);
                    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                    this.FINAL_PASS_DRAW_END?.(gl, program);
                }
            });
            // fragment shader extension
            if(this.fragmentShaderExtension) {
                for(let i=1; i<=this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA.index; i++) {
                    this.addPass({
                        vertexSource: defaultVertexSource,
                        fragmentSource: `#version 300 es
precision highp float;
precision highp int;

${defaultColorBlendFunc}

${this.getFragsShaderSource(i)}`,
                        drawFunc: (gl, program)=>{
                            gl.useProgram(program);
                            if(i==1) gl.blendFunc(gl.ONE, gl.ZERO);

                            this[`FRAG_${i}_PASS_DRAW_START`]?.(gl, program);
                            gl.bindFramebuffer(gl.FRAMEBUFFER, this[`FRAMEBUFFER${i+1}`]);
                            // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            gl.clearBufferfv(gl.COLOR, 0, [0,0,0,0]);
                            gl.drawArrays(gl.TRIANGLES, 0, 6);
                            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                            const mapUnit = this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA[`mapUnit${i}`];
                            if(this[`TEXTURE_UNIT_${mapUnit}_MIPMAP`]) {
                                //console.log('第'+mapUnit+'号纹理单元已生成mipmap');
                                gl.bindTexture(gl.TEXTURE_2D, this.getTextureUnit(mapUnit));
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                                gl.generateMipmap(gl.TEXTURE_2D);
                                gl.bindTexture(gl.TEXTURE_2D, null);
                            }
                            this[`FRAG_${i}_PASS_DRAW_END`]?.(gl, program);
                        }
                    });
                }
            }

            const gl = this.gl;
            gl.enable(gl.DEPTH_TEST); // 启用深度测试
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.BLEND); // 启用颜色混合
            //gl.blendFunc(gl.ONE, gl.ZERO);
            gl.depthMask(false);

            this.inBlankTextureUnit(this.naturalWidth, this.naturalHeight, 0, {filterMin: gl.LINEAR, filterMag: gl.LINEAR});
            this.inBlankTextureUnit(this.naturalWidth, this.naturalHeight, 1, {internalformat: gl.R8, format: gl.RED});
            const texture = this.getTextureUnit(0), depthtex = this.getTextureUnit(1);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, depthtex, 0);
            gl.drawBuffers([
                gl.COLOR_ATTACHMENT0,
                gl.COLOR_ATTACHMENT1
            ]);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.FRAMEBUFFER0 = fbo;

            // setting uniform location
            // setting texture unit 0
            const program0 = this.PROGRAMS[0].program;
            gl.useProgram(program0);
            // u_resolution
            gl.uniform2f(
                gl.getUniformLocation(program0, 'u_resolution'),
                this.naturalWidth,
                this.naturalHeight
            );
            // setting texture unit 2
            const program2 = this.PROGRAMS[1].program;
            gl.useProgram(program2);
            // u_texture
            gl.uniform1i(
                gl.getUniformLocation(program2, 'u_texture'),
                this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA.mapUnit
            );
            // u_depthtex
            gl.uniform1i(
                gl.getUniformLocation(program2, 'u_depthtex'),
                1
            );
            // u_resolution
            gl.uniform2f(
                gl.getUniformLocation(program2, 'u_resolution'),
                this.naturalWidth,
                this.naturalHeight
            );
            // setting frags texture unit...
            if(this.fragmentShaderExtension) {
                // 中间层
                for(let i=2; i<this.PROGRAMS.length; i++) {
                    const programi = this.PROGRAMS[i].program;
                    gl.useProgram(programi);
                    // u_texture
                    gl.uniform1i(
                        gl.getUniformLocation(programi, 'u_texture'),
                        0
                    );
                    // u_depthtex
                    gl.uniform1i(
                        gl.getUniformLocation(programi, 'u_depthtex'),
                        1
                    );
                    // u_resolution
                    gl.uniform2f(
                        gl.getUniformLocation(programi, 'u_resolution'),
                        this.naturalWidth,
                        this.naturalHeight
                    );
                    // u_colortex4~9
                    for(let j=1; j<i; j++) {
                        const colortex_mapUnit = this.FRAGS_TEXTURE_UNIT_OUTPUT_DATA[`mapUnit${j}`];
                        gl.uniform1i(
                            gl.getUniformLocation(programi, `u_colortex${colortex_mapUnit}`),
                            colortex_mapUnit
                        );
                    }
                }
            }
            
            this._multi_pass_state_ = true;
        }
    }
    updateMaps( element, resolve ) {
        if(!this._sprite_state_) {
            this._sprite_state_ = true;
            let state = false;
            const textures = [];
            for(let Model of element) {
                Model.preprocess(model => {
                    if( model.type == 'Group' && !model.typeAddModelEvent ) {
                        model.setAddModelEvent(()=>{
                            this._sprite_state_ = false;
                        });
                    }
                    if( model.material && model.material.maps ) {
                        for(let texture of model.material.maps) {
                            if( textures.indexOf(texture) == -1 ) textures.push(texture);
                        }
                    }
                });
            }
            for(let texture of textures) {
                if(!texture.activate) {
                    state = true;
                    this.SpriteGenerator.createSprite(textures).then(response => {
                        // console.log(response);
                        resolve(true, response.images, response.videos);
                    });
                    break;
                }
            }
            if(!state) resolve(false);
        }
        else resolve(false);
    }
    render( scene, camera ) {
        this.DRAW_ATTRIBUTES.scene = scene;
        this.DRAW_ATTRIBUTES.camera = camera;

        if(!this._multi_pass_state_) {
            this.initMultiPass();
            scene.setAddModelEvent(()=>{
                this._sprite_state_ = false;
            });
            console.log('webgl渲染上下文已启用');
        }

        const gl = this.gl;

        // 绘制背景色
        //gl.clearColor(0, 0, 0, 1);
        //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        
        const pass = this.PROGRAMS[0];
        pass.drawFunc(gl, pass.program);

        const e = gl.getError();
        if(e!=0) console.error('来自gl.getError：', e);
    }
}

export default WebGLRenderer;