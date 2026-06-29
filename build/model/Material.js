import ARGBtoColor from '../ARGBtoColor.js';
import { Matrix3 } from '../math/matrix.js';

/**
 * CatsJS-材质
 * 当前版本 0.1.5
 * 于2025年3月16日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const round = Math.round;
const trunc = Math.trunc;
const sqrt = Math.sqrt;
const log = Math.log;
const max = Math.max;
const _LN4 = 1 / log(4);
let rawtexture_count = 1;

class RawTexture {
    constructor( media ) {
        this.media = media;
        this.mediaType = media instanceof HTMLImageElement ? 'image' : media instanceof HTMLVideoElement ? 'video' : 'null';
        this.ratio = media.height / media.width;
        this.activate = false;
        this.mapUnit = 0;
        this.uvmat = new Matrix3();
        this._kh = sqrt( media.width / media.height );
        this._kw = 1 / this._kh;
        this.glTexture = undefined;
        this.id = rawtexture_count;
        rawtexture_count++;

        /*
        if(this.mediaType == 'video') {
            this.media.addEventListener('timeupdate', ()=>{
                if(this.gl && this.glTextureState) {
                    this.gl.texImage2D(
                        this.gl.TEXTURE_2D,
                        0,
                        this.gl.RGBA,
                        this.gl.RGBA,
                        this.gl.UNSIGNED_BYTE,
                        this.glTexture.media
                    );
                    console.log('texture update');
                }
            });
        }
        */
    }
    uvRatio( u0=0, v0=0, u1=1, v1=1 ) {
        return this.ratio * (v1 - v0) / (u1 - u0);
    }
    getSizeValue( pixel_unit ) {
        // const x = round( this.image.width * this.image.height / (pixel_unit*pixel_unit) );
        // return round( log(x) * _LN4 + 1 );
        const x = this.media.width * this.media.height / (pixel_unit*pixel_unit),
        y = log(x) * _LN4 + 1;
        return round(max(y, 1));
    }
}

class BasicMaterial {
    constructor(data={ opacity: 1, color: '#7b68ee', maps: undefined }) {
        if(data.opacity == undefined) data.opacity = 1;
        if(data.color == undefined) data.color = '#7b68ee';
        this.type = 'Material';
        this.opacity = data.opacity;
        this.color = ARGBtoColor(data.color);
        this.maps = data.maps;
    }
    getColor() {
        return {
            r: this.color.r,
            g: this.color.g,
            b: this.color.b,
            a: this.color.a * this.opacity,
            value: this.color.value
        };
    }
}

class VertexMaterial {
    constructor( opacity=1, colors=['#7b68ee', '#7b68ee', '#7b68ee'] ) {
        this.type = 'Material';
        this.opacity = opacity;
        this.color = [];
        colors.forEach(
            color => {
                this.color.push(ARGBtoColor(color));
            }
        );
    }
    getColor( index=0, connect=3 ) {
        index %= connect;
        const color = this.color[index];
        return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a * this.opacity,
            value: color.value
        };
    }
}

class ArrayMaterial {
    constructor( opacity=1, content=[] ) {
        this.type = 'Material';
        this.opacity = opacity;
        this.content = content;
    }
    add( material ) {
        if( this.content.indexOf(material) == -1 ) this.content.push(material);
    }
    remove( material ) {
        const index = this.content.indexOf(material);
        if( index != -1 ) this.content.splice( index, 1 );
    }
    getColor( index=0, connect=3 ) {
        const count = trunc(index / connect) % this.content.length;
        index %= connect;
        const color = this.content[count].getColor( index, connect );
        return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a * this.opacity,
            value: color.value
        };
    }
}

export { RawTexture, BasicMaterial, VertexMaterial, ArrayMaterial };