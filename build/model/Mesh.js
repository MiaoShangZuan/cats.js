import { Matrix4, Vector3 } from '../math/matrix.js';

/**
 * CatsJS-2D网格对象
 * 当前版本 0.1.6
 * 于2025年3月16日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const sin = Math.sin;
const cos = Math.cos;
const trunc = Math.trunc;
const _9 = 1 / 9;
const _3 = 1 / 3;

let id_count = 1;

class Mesh {
    constructor( geometry, material ) {
        this.type = 'Mesh';
        this.geometry = geometry;
        this.material = material;
        this.scale = new Vector3(1,1,1);
        this.rotation = new Vector3();
        this.position = new Vector3();
        this.id = id_count;
        id_count++;
    }
    getFaceTexture( index=0 ) {
        let texture;
        if(this.material && this.material.maps && this.material.maps.length>0) {
            const index_map = this.geometry.uvs[index*9+2];
            if(index_map >=0) texture = this.material.maps[index_map];
        }
        return texture;
    }
    matrix() {
        const sinz = sin(this.rotation.z),
        cosz = cos(this.rotation.z),
        cosx = cos(this.rotation.x),
        cosy = cos(this.rotation.y);
        return new Matrix4([
            cosy*cosz*this.scale.x*this.scale.z, cosx*sinz*this.scale.y*this.scale.z, 0, this.position.x,
            -cosy*sinz*this.scale.x*this.scale.z, cosx*cosz*this.scale.y*this.scale.z, 0, this.position.y,
            0, 0, 1, this.position.z,
            0, 0, 0, 1
        ]);
    }
    vertices() {
        const vertices = [],
        count = this.geometry.vertices.length;
        let s = 0, index = 0, color;
        if( this.geometry.connect == 3 && this.material.maps && this.material.maps.length > 0 ) s = 1;
        for(let i=0; i<count; i+=3) {
            color = this.material.getColor( index, this.geometry.connect );
            vertices.push(
                this.geometry.vertices[i], this.geometry.vertices[i+1], this.geometry.vertices[i+2],
                color.r, color.g, color.b, color.a,
                this.geometry.uvs[i], this.geometry.uvs[i+1], s
            );
            index++;
        }
        return new Float32Array(vertices);
    }
    draw( gl, program, vs_mat ) {
        const vertices = this.vertices(),
        VFSIZE = vertices.BYTES_PER_ELEMENT,
        VCOUNT = 10;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        const a_position = 0;
        gl.vertexAttribPointer(
            a_position,
            3,
            gl.FLOAT,
            false,
            VCOUNT * VFSIZE,
            0
        );
        gl.enableVertexAttribArray(a_position);

        const a_color = 1;
        gl.vertexAttribPointer(
            a_color,
            4,
            gl.FLOAT,
            false,
            VCOUNT * VFSIZE,
            3 * VFSIZE
        );
        gl.enableVertexAttribArray(a_color);

        const a_uv = 2;
        gl.vertexAttribPointer(
            a_uv,
            3,
            gl.FLOAT,
            false,
            VCOUNT * VFSIZE,
            7 * VFSIZE
        );
        gl.enableVertexAttribArray(a_uv);

        const VERTEXCOUNT = vertices.length / VCOUNT;
        
        const mvs_mat = this.matrix(); // model matrix
        mvs_mat.premultiply(vs_mat);
        mvs_mat.reverse();
        
        // mvs matrix
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_mvsmat'), false, mvs_mat.element);
        
        // id
        gl.uniform1i(gl.getUniformLocation(program, 'u_id'), this.id);
        
        if( this.geometry.connect == 3 ) {
            let texture, texture_media_currentTime = 0;
            for(let i=0; i<VERTEXCOUNT; i+=3) {
                const texturex = this.getFaceTexture(trunc(i*_3));
                //texture = this.getFaceTexture(0);
                if(texturex) {
                    if(!texture || texture.id != texturex.id) {
                        // update texture
                        texture = texturex;
                        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
                        if(texture.mediaType == 'video' && !texture.media.paused && !texture.media.ended) {
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.glTexture.media);
                            texture_media_currentTime = texture.media.currentTime;
                        }
                        // texture
                        gl.uniform1i( gl.getUniformLocation( program, 'u_imagetex' ), texture.mapUnit );
                        // uv matrix
                        gl.uniformMatrix3fv(
                            gl.getUniformLocation( program, 'u_uvmat' ),
                            false,
                            [
                                texture.uvmat.element[0], texture.uvmat.element[3], texture.uvmat.element[6],
                                texture.uvmat.element[1], texture.uvmat.element[4], texture.uvmat.element[7],
                                texture.uvmat.element[2], texture.uvmat.element[5], texture.uvmat.element[8]
                            ]
                        );
                    }
                    else if(texture.mediaType == 'video' && !texture.media.paused && !texture.media.ended && texture.media.currentTime-texture_media_currentTime>1e-4) {
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.glTexture.media);
                        texture_media_currentTime = texture.media.currentTime;
                    }
                }
                gl.drawArrays( gl.TRIANGLES, i, 3 );
                //gl.drawArrays( gl.TRIANGLES, 0, 6 );
            }
        }
        else if( this.geometry.connect == 2 ) gl.drawArrays( gl.LINES, 0, VERTEXCOUNT );
        
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.deleteVertexArray(vao); // 清除 vao
        gl.deleteBuffer(vbo); // 清除顶点缓存
    }
    preprocess( func ) {
        func(this);
    }
}

export default Mesh;