import Mesh from './Mesh.js';
import BufferGeometry from './Geometry.js';
import { RawTexture, BasicMaterial, VertexMaterial, ArrayMaterial } from './Material.js';
import { Matrix4, Vector2 } from '../math/matrix.js';
import { Bone, Skeleton, SkinnedMesh } from './SkinnedMesh.js';
import { extract } from '../Functions.js';

/**
 * CatsJS-Object2D
 * 当前版本 0.1.35
 * 于2025年3月17日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const PI = Math.PI;
const sin = Math.sin;
const cos = Math.cos;
const round = Math.round;

class Group extends Mesh {
    constructor() {
        super();
        this.type = 'Group';
        this.element = [];
        this.ADD_MODEL_FUNC = undefined;
        this.typeAddModelEvent = false;
    }
    setAddModelEvent( func ) {
        this.ADD_MODEL_FUNC = func;
        this.typeAddModelEvent = true;
    }
    add( Object2D ) {
        if( this.element.indexOf(Object2D) == -1 ) {
            this.element.push(Object2D);
            this.ADD_MODEL_FUNC?.();
        }
    }
    remove( Object2D ) {
        const index = this.element.indexOf(Object2D);
        if( index != -1 ) this.element.splice( index, 1 );
    }
    draw( gl, program, vs_mat, mat ) {
        if(mat == undefined) mat = new Matrix4();
        const g_mat = this.matrix();
        g_mat.multiply(mat);
        
        const gvs_mat = new Matrix4();
        gvs_mat.copy(vs_mat);
        gvs_mat.multiply(g_mat);
        
        this.element.forEach(
            Object2D => {
                if( Object2D.type == 'Mesh' ) {
                    Object2D.draw(gl, program, gvs_mat);
                }
                else if( Object2D.type == 'Group' ) {
                    Object2D.draw(gl, program, vs_mat, g_mat);
                }
            }
        );
    }
    preprocess( func ) {
        func(this);
        this.element.forEach(
            Object2D => {
                Object2D.preprocess(func);
            }
        );
    }
}

class RectGeometry extends BufferGeometry {
    constructor( width=1, height=1 ) {
        const _w = width * 0.5, _h = height * 0.5,
        vertices = [
            -_w, _h, 0,
            -_w, -_h, 0,
            _w, -_h, 0,
            
            -_w, _h, 0,
            _w, -_h, 0,
            _w, _h, 0
        ],
        uvs = [
            0, 1, 0,
            0, 0, 0,
            1, 0, 0,
            
            0, 1, 0,
            1, 0, 0,
            1, 1, 0
        ];
        super( vertices, uvs, 3 );
    }
}

class CircleGeometry extends BufferGeometry {
    constructor( radius=0.5, sub=64 ) {
        const vertices =[], uvs = [], rad = 2 * PI / sub;
        let x0, y0, x1, y1;
        for(let i=0; i<sub; i++) {
            x0 = sin(i*rad);
            y0 = cos(i*rad);
            x1 = sin((i+1)*rad);
            y1 = cos((i+1)*rad);
            vertices.push(
                0, 0, 0,
                radius*x0, radius*y0, 0,
                radius*x1, radius*y1, 0
            );
            uvs.push(
                0.5, 0.5, 0,
                0.5*(x0+1), 0.5*(y0+1), 0,
                0.5*(x1+1), 0.5*(y1+1), 0
            );
        }
        super( vertices, uvs, 3 );
    }
}

class MergeGeometry extends BufferGeometry {
    constructor( geometry1, geometry2 ) {
        const vertices = [...geometry1.vertices, ...geometry2.vertices], uvs = new Array(geometry1.vertices.length + geometry2.vertices.length).fill(0);
        super( vertices, uvs, geometry1.connect );
    }
}

class MeshHelper extends Mesh {
    constructor( geometry, color='#ffffff' ) {
        if( geometry.type == 'Mesh' && geometry.geometry.connect == 3 ) {
            geometry = geometry.geometry;
        }
        const vertices = [], uvs = [], count = geometry.vertices.length;
        for(let i=0; i<count; i+=9) {
            vertices.push(
                geometry.vertices[i], geometry.vertices[i+1], geometry.vertices[i+2], geometry.vertices[i+3], geometry.vertices[i+4], geometry.vertices[i+5],
                geometry.vertices[i+3], geometry.vertices[i+4], geometry.vertices[i+5], geometry.vertices[i+6], geometry.vertices[i+7], geometry.vertices[i+8],
                geometry.vertices[i+6], geometry.vertices[i+7], geometry.vertices[i+8], geometry.vertices[i], geometry.vertices[i+1], geometry.vertices[i+2]
            );
            uvs.push(
                0, 0, -1, 0, 0, -1,
                0, 0, -1, 0, 0, -1,
                0, 0, -1, 0, 0, -1
            );
        }
        super(
            new BufferGeometry(vertices, uvs, 2),
            new BasicMaterial({ color })
        );
    }
}

class GridHelper extends Mesh {
    constructor( width=10, height=10, color='#ffffff' ) {
        width = round(width);
        height = round(height);
        const _w = width * 0.5, _h = height * 0.5, vertices = [], uvs = new Array((width + height + 2) * 6).fill(-1);
        for(let i=-_h; i<=_h; i++) vertices.push( -_w, i, 0, _w, i, 0 );
        for(let j=-_w; j<=_w; j++) vertices.push( j, _h, 0, j, -_h, 0 );
        const geometry = new BufferGeometry(vertices, uvs, 2), material = new BasicMaterial({ color });
        super( geometry, material );
    }
}

class BezierHelper extends Mesh {
    constructor( data ) {
        const attribute = {
            points: [
                new Vector2(-2, 0),
                new Vector2(2, 0),
                new Vector2(-2, 2),
                new Vector2(2, 2)
            ],
            sub: 40,
            color: '#7b68ee',
            opacity: 1
        };
        extract( data, attribute, [ 'points' ] );
        const geometry = new BufferGeometry([], [], 2), material = new BasicMaterial({ opacity: attribute.opacity, color: attribute.color });
        super( geometry, material );
        this.points = attribute.points;
        this.sub = attribute.sub;
    }
    vertices() {
        const vertices = [], pointCount = this.points.length;
        if(pointCount == 2) {
            // 一次贝塞尔曲线
            const color1 = this.material.getColor( 0, 2 ), color2 = this.material.getColor( 1, 2 );
            vertices.push(
                this.points[0].x, this.points[0].y, 0,
                color1.r, color1.g, color1.b, color1.a,
                0, 0, -1,
                this.points[1].x, this.points[1].y, 0,
                color2.r, color2.g, color2.b, color2.a,
                0, 0, -1
            );
        }
        else if(pointCount == 3) {
            // 二次贝塞尔曲线
            const vec1 = { x: this.points[2].x-this.points[0].x, y: this.points[2].y-this.points[0].y },
            vec2 = { x: this.points[1].x-this.points[2].x, y: this.points[1].y-this.points[2].y },
            point1 = { x: 0, y: 0 },
            point2 = { x: 0, y: 0 },
            point3 = { x: 0, y: 0 };
            let t, index, color;
            for( let i = 0; i < this.sub; i++ ) {
                for( let j = 0; j < 2; j++ ) {
                    index = i + j;
                    t = index / this.sub;
                    color = this.material.getColor( index, 2 );
                    point1.x = this.points[0].x + vec1.x * t;
                    point1.y = this.points[0].y + vec1.y * t;
                    point2.x = this.points[2].x + vec2.x * t;
                    point2.y = this.points[2].y + vec2.y * t;

                    point3.x = point1.x + (point2.x - point1.x) * t;
                    point3.y = point1.y + (point2.y - point1.y) * t;

                    vertices.push(
                        point3.x, point3.y, 0,
                        color.r, color.g, color.b, color.a,
                        0, 0, -1
                    );
                }
            }
        }
        else if(pointCount == 4) {
            // 三次贝塞尔曲线
            const vec1 = { x: this.points[2].x-this.points[0].x, y: this.points[2].y-this.points[0].y },
            vec2 = { x: this.points[3].x-this.points[2].x, y: this.points[3].y-this.points[2].y },
            vec3 = { x: this.points[1].x-this.points[3].x, y: this.points[1].y-this.points[3].y },
            point1 = { x: 0, y: 0 },
            point2 = { x: 0, y: 0 },
            point3 = { x: 0, y: 0 },
            vec4 = { x: 0, y: 0 }, vec5 = { x: 0, y: 0 },
            point4 = { x: 0, y: 0 },
            point5 = { x: 0, y: 0 },
            point6 = { x: 0, y: 0 };
            let t, index, color;
            for( let i = 0; i < this.sub; i++ ) {
                for( let j = 0; j < 2; j++ ) {
                    index = i + j;
                    t = index / this.sub;
                    color = this.material.getColor( index, 2 );
                    point1.x = this.points[0].x + vec1.x * t;
                    point1.y = this.points[0].y + vec1.y * t;
                    point2.x = this.points[2].x + vec2.x * t;
                    point2.y = this.points[2].y + vec2.y * t;
                    point3.x = this.points[3].x + vec3.x * t;
                    point3.y = this.points[3].y + vec3.y * t;

                    vec4.x = point2.x - point1.x;
                    vec4.y = point2.y - point1.y;
                    vec5.x = point3.x - point2.x;
                    vec5.y = point3.y - point2.y;

                    point4.x = point1.x + vec4.x * t;
                    point4.y = point1.y + vec4.y * t;
                    point5.x = point2.x + vec5.x * t;
                    point5.y = point2.y + vec5.y * t;

                    point6.x = point4.x + (point5.x - point4.x) * t;
                    point6.y = point4.y + (point5.y - point4.y) * t;

                    vertices.push(
                        point6.x, point6.y, 0,
                        color.r, color.g, color.b, color.a,
                        0, 0, -1
                    );
                }
            }
        }
        return new Float32Array(vertices);
    }
    getPoints() {
        const arr = [];
        this.points.forEach(vec => arr.push(vec.x, vec.y));
        return arr;
    }
}

class RectHelper extends Mesh {
    constructor( width=1, height=1, color='#7b68ee' ) {
        const _w = width * 0.5, _h = height * 0.5,
        vertices = [
            -_w, _h, 0,
            -_w, -_h, 0,
            
            -_w, -_h, 0,
            _w, -_h, 0,
            
            _w, -_h, 0,
            _w, _h, 0,
            
            _w, _h, 0,
            -_w, _h, 0
        ],
        uvs = new Array(18).fill(-1),
        geometry = new BufferGeometry(vertices, uvs, 2),
        material = new BasicMaterial({ color });
        super( geometry, material );
    }
}

class CircleHelper extends Mesh {
    constructor( radius=0.5, color='#7b68ee', sub=64 ) {
        const vertices =[], uvs = [], rad = 2 * PI / sub;
        let x0, y0, x1, y1;
        for(let i=0; i<sub; i++) {
            x0 = sin(i*rad);
            y0 = cos(i*rad);
            x1 = sin((i+1)*rad);
            y1 = cos((i+1)*rad);
            vertices.push(
                radius*x0, radius*y0, 0,
                radius*x1, radius*y1, 0
            );
            uvs.push(
                0, 0, -1,
                0, 0, -1
            );
        }
        const geometry = new BufferGeometry(vertices, uvs, 2),
        material = new BasicMaterial({ color });
        super( geometry, material );
    }
}

class SkeletonHelper extends Mesh {
    constructor( skeleton, color1='#1e3a8a', color2='#00ced1' ) {
        if( skeleton.type == 'Mesh' ) {
            skeleton = skeleton.skeleton;
        }
        
        const geometry = new BufferGeometry([], [], 2),
        material = new VertexMaterial(1, [color1, color2]);
        super( geometry, material );
        this.skeleton = skeleton;
    }
    loadVertices( fbone, fposition, vertices ) {
        let position;
        fbone.element.forEach(
            bone => {
                position = bone.tcoord();
                vertices.push(
                    fposition.x, fposition.y, 0,
                    position.x, position.y, 0
                );
                this.loadVertices( bone, position, vertices );
            }
        );
    }
    vertices() {
        const geometry_vertices = [];
        this.loadVertices( this.skeleton.mainBone, this.skeleton.mainBone.tcoord(), geometry_vertices );
        
        const vertices = [], count = geometry_vertices.length;
        let index = 0, color;
        for(let i=0; i<count; i+=3) {
            color = this.material.getColor( index, this.geometry.connect );
            vertices.push(
                geometry_vertices[i], geometry_vertices[i+1], geometry_vertices[i+2],
                color.r, color.g, color.b, color.a,
                0, 0, -1
            );
            index++;
        }
        return new Float32Array(vertices);
    }
}

export {
    Mesh, BufferGeometry, BasicMaterial, VertexMaterial, ArrayMaterial, RawTexture,
    Bone, Skeleton, SkinnedMesh,
    RectGeometry, CircleGeometry, MergeGeometry,
    Group, MeshHelper, GridHelper, BezierHelper, RectHelper, CircleHelper, SkeletonHelper
};