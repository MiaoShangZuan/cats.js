import { Matrix4, Vector2, Vector4 } from '../math/matrix.js';
import Mesh from './Mesh.js';

/**
 * 蒙皮网格
 * 当前版本 0.1
 * 于2025年11月12日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const sin = Math.sin;
const cos = Math.cos;

class Bone {
    constructor() {
        this.type = 'Bone';
        this.element = [];
        this.position = new Vector2();
        this.bind = undefined;
        this._frotate_ = 0;
        this._rotate_ = 0;
    }
    set rotate( value ) {
        this._rotate_ = value;
        this.element.forEach(
            bone => {
                bone._frotate_ = this._frotate_ + this._rotate_;
                bone.update();
            }
        );
    }
    get rotate() {
        return this._rotate_;
    }
    update() {
        this.element.forEach(
            bone => {
                bone._frotate_ = this._frotate_ + this._rotate_;
                bone.update();
            }
        );
    }
    add( bone ) {
        if( this.element.indexOf(bone) == -1 ) {
            this.element.push(bone);
            bone.bind = this;
            bone._frotate_ = this._frotate_ + this._rotate_;
            bone.update();
        }
    }
    remove( bone ) {
        const index = this.element.indexOf(bone);
        if( index != -1 ) {
            this.element.splice( index, 1 );
            bone.bind = undefined;
            bone._frotate_ = 0;
            bone.update();
        }
    }
    trotate() {
        return this._frotate_ + this._rotate_;
    }
    tcoord() {
        const p = { x: this.position.x, y: this.position.y };
        if(this.bind != undefined) {
            const p0 = this.bind.tcoord(),
            sina = sin(this._frotate_), cosa = cos(this._frotate_),
            x = p.x, y = p.y;
            p.x = x * cosa + y * sina + p0.x;
            p.y = y * cosa - x * sina + p0.y;
        }
        return p;
    }
    coord() {
        let x = this.position.x, y = this.position.y;
        if(this.bind != undefined) {
            const p0 = this.bind.coord();
            x += p0.x;
            y += p0.y;
        }
        return { x, y };
    }
    matrix( factor=1 ) {
        const rz = this._frotate_ + factor * this._rotate_,
        p0 = this.coord(),
        p1 = this.tcoord(),
        sinz = sin(rz),
        cosz = cos(rz);
        return new Matrix4([
            cosz, sinz, 0, p1.x - p0.x * cosz - p0.y * sinz,
            -sinz, cosz, 0, p1.y + p0.x * sinz - p0.y * cosz,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
}

class Skeleton {
    constructor( bones, mainBone ) {
        this.type = 'Skeleton';
        this.mainBone = mainBone;
        this.bones = bones;
        this.vector = new Vector4();
    }
    vertices( geometry ) {
        const geometry_vertices = [], count_i = geometry.vertices.length / 3;
        let count_j, bone, factor, matrix;
        for(let i=0; i<count_i; i++) {
            this.vector.set(geometry.vertices[i*3], geometry.vertices[i*3+1], geometry.vertices[i*3+2], 1);
            bone = this.bones[geometry.skinIndices[i][0]];
            factor = geometry.skinWeights[i][0];
            matrix = bone.matrix(factor);
            
            count_j = geometry.skinIndices[i].length;
            for(let j=1; j<count_j; j++) {
                bone = this.bones[geometry.skinIndices[i][j]];
                factor = geometry.skinWeights[i][j];
                matrix.multiply(bone.matrix(factor));
            }
            this.vector.transform(matrix);
            geometry_vertices.push(this.vector.x, this.vector.y, this.vector.z);
        }
        return geometry_vertices;
    }
}

class SkinnedMesh extends Mesh {
    constructor( geometry, material ) {
        super(geometry, material);
        this.skeleton = undefined;
    }
    bind( skeleton ) {
        this.skeleton = skeleton;
    }
    vertices() {
        const vertices = [],
        geometry_vertices = this.skeleton.vertices(this.geometry),
        count = geometry_vertices.length;
        let s = 0, index = 0, color;
        if( this.geometry.connect == 3 && this.material.maps != undefined ) s = 1;
        for(let i=0; i<count; i+=3) {
            color = this.material.getColor( index, this.geometry.connect );
            vertices.push(
                geometry_vertices[i], geometry_vertices[i+1], geometry_vertices[i+2],
                color.r, color.g, color.b, color.a,
                this.geometry.uvs[i], this.geometry.uvs[i+1], s
            );
            index++;
        }
        return new Float32Array(vertices);
    }
}

export { Bone, Skeleton, SkinnedMesh };