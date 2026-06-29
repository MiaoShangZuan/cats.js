import { cross, containTriangle, polygonArea2, arrDel } from '../Functions.js';
import { Mesh, BufferGeometry, BasicMaterial } from '../model/Object2D.js';
import { extract } from '../Functions.js';

/**
 * 更多 Object2D
 * 当前版本 0.1.5
 * 于2025年5月1日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const PI = Math.PI;
const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;

function getPath( cure ) {
    const vertices = [], _vertices = cure.vertices(), count = _vertices.length;
    for(let i=0; i<count; i+=10) {
        vertices.push(_vertices[i], _vertices[i+1], _vertices[i+2]);
    }
    return vertices;
}

function rotateVec2( vec2, rad=0 ) {
    const x0 = vec2.x, y0 = vec2.y,
    sino = sin(rad), coso = cos(rad);
    return {
        x: x0 * coso - y0 * sino,
        y: y0 * coso + x0 * sino
    };
}

function getNorm2( vec2 ) {
    return sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
}

function filteringVertices( vertices ) {
    const new_vertices = [ vertices[0], vertices[1] ], count = vertices.length;
    let norm, x0 = vertices[0], y0 = vertices[1], x1, y1;
    for(let i=3; i<count; i+=3) {
        x1 = vertices[i];
        y1 = vertices[i+1];
        norm = getNorm2({ x: x1-x0, y: y1-y0 });
        if(norm > 0.001) new_vertices.push(x1, y1);
        x0 = x1;
        y0 = y1;
    }
    norm = getNorm2({ x: x0-vertices[0], y: y0-vertices[1] });
    if(norm < 0.001) new_vertices.splice(count-2, 2);
    return new_vertices;
}

function getVertex( vertices, index ) {
    const point_count = vertices.length * 0.5;
    if(index >= point_count) index %= point_count;
    return { x: vertices[index*2], y: vertices[index*2+1], index };
}

function concatArrays( arrays ) {
    const arr = [];
    for(let i=0; i<arrays.length; i++) {
        arr.push(...arrays[i]);
    }
    return arr;
}

function getheart( t ) {
    const sint = sin(t), cost = cos(t),
    _17 = 1 / 17,
    x = 16 * sint * sint * sint * _17,
    y = (13 * cost - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t)) * _17;
    return { x, y };
}

class BezierToCure extends Mesh {
    constructor( cure, color='#7b68ee' ) {
        let path;
        if(cure.type == 'Group') {
            const arrays = [];
            let Object2D, pathi;
            for(let i=0; i<cure.element.length; i++) {
                Object2D = cure.element[i];
                if(Object2D.geometry.connect == 2) {
                    pathi = Object2D.geometry.vertices;
                    if(pathi.length == 0) pathi = getPath(Object2D);
                    arrays.push(pathi);
                }
            }
            path = concatArrays(arrays);
        }
        else if(cure.geometry.connect == 2) {
            path = cure.geometry.vertices;
            if(path.length == 0) path = getPath(cure);
        }

        const uvs = new Array(path.length).fill(-1),
        geometry = new BufferGeometry(path, uvs, 2),
        material = new BasicMaterial({ color });
        super(geometry, material);
    }
}

class CureToShape extends Mesh {
    constructor( cure, width=0.4, color='#7b68ee', sub=8 ) {
        let path;
        if(cure.type == 'Group') {
            const arrays = [];
            let Object2D, pathi;
            for(let i=0; i<cure.element.length; i++) {
                Object2D = cure.element[i];
                if(Object2D.geometry.connect == 2) {
                    pathi = Object2D.geometry.vertices;
                    if(pathi.length == 0) pathi = getPath(Object2D);
                    arrays.push(pathi);
                }
            }
            path = concatArrays(arrays);
        }
        else if(cure.geometry.connect == 2) {
            path = cure.geometry.vertices;
            if(path.length == 0) path = getPath(cure);
        }
        
        const vertices = [], uvs = [],
        point1 = { x: 0, y: 0 },
        point2 = { x: 0, y: 0 },
        vec = { x: 0, y: 0 };
        let norm, _n, vecA, vecB, vecC, vecD, radA, radB;
        for(let i=0; i<path.length; i+=6) {
            point1.x = path[i];
            point1.y = path[i+1];
            point2.x = path[i+3];
            point2.y = path[i+4];
            vec.x = point2.x - point1.x;
            vec.y = point2.y - point1.y;
            norm = sqrt(vec.x * vec.x + vec.y * vec.y);
            if(norm > 0) {
                _n = width * 0.5 / norm;
                vec.x *= _n;
                vec.y *= _n;
            }
            vecA = rotateVec2( vec, PI * 0.5 );
            vecB = rotateVec2( vec, -PI * 0.5 );

            vertices.push(
                point1.x + vecA.x, point1.y + vecA.y, 0,
                point1.x + vecB.x, point1.y + vecB.y, 0,
                point2.x + vecB.x, point2.y + vecB.y, 0,

                point1.x + vecA.x, point1.y + vecA.y, 0,
                point2.x + vecB.x, point2.y + vecB.y, 0,
                point2.x + vecA.x, point2.y + vecA.y, 0
            );
            
            uvs.push(
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                
                0, 0, -1,
                0, 0, -1,
                0, 0, -1
            );

            for(let j=0; j<sub; j++) {
                radA = PI * (j+1) / sub;
                radB = PI * j / sub;
                vecC = rotateVec2( vecA, radA );
                vecD = rotateVec2( vecA, radB );
                vertices.push(
                    point1.x + vecC.x, point1.y + vecC.y, 0,
                    point1.x, point1.y, 0,
                    point1.x + vecD.x, point1.y + vecD.y, 0
                );
            }

            for(let k=0; k<sub; k++) {
                radA = PI * (k+1) / sub;
                radB = PI * k / sub;
                vecC = rotateVec2( vecB, radA );
                vecD = rotateVec2( vecB, radB );
                vertices.push(
                    point2.x + vecC.x, point2.y + vecC.y, 0,
                    point2.x, point2.y, 0,
                    point2.x + vecD.x, point2.y + vecD.y, 0
                );
            }
        }
        const geometry = new BufferGeometry(vertices, uvs, 3),
        material = new BasicMaterial({ color });
        super(geometry, material);
    }
}

class Extrusion extends Mesh {
    constructor( Object2D, color='#7b68ee' ) {
        let vertices;
        if(Object2D.type == 'Group') {
            const arrays = [];
            let path;
            for(let i=0; i<Object2D.element.length; i++) {
                path = Object2D.element[i].geometry.vertices;
                if(path.length == 0) path = getPath(Object2D.element[i]);
                arrays.push(path);
            }
            vertices = concatArrays(arrays);
        }
        else if(Object2D.geometry.connect == 2) {
            vertices = Object2D.geometry.vertices;
            if(vertices.length == 0) vertices = getPath(Object2D);
        }

        // 过滤 vertices
        let curePath = filteringVertices(vertices);
        const rotationDirection = polygonArea2(curePath);
        if(rotationDirection < 0) {
            // 曲线路径为顺时针
            const arri = [];
            for(let j=curePath.length-1; j>0; j-=2) {
                arri.push(curePath[j-1], curePath[j]);
            }
            curePath = arri; // 反转路径
        }

        // 切耳法将路径转为形状
        vertices = [];
        let k = curePath.length * 0.5,
        n = 0, dir, arr, sti = false,
        p1, p2, p3;
        while(k > 3) {
            p1 = getVertex(curePath, n);
            p2 = getVertex(curePath, n+1);
            p3 = getVertex(curePath, n+2);
            dir = cross(p2.x-p1.x, p2.y-p1.y, p2.x-p3.x, p2.y-p3.y);
            if(dir < 0) {
                // p1, p2, p3 三个点组成的拐角为凸角（也就是角p1-p2-p3为凸角）
                arr = [...curePath];
                // arr.splice(n*2, 6);
                arrDel(arr, n*2, 6);
                for(let s=0; s<arr.length; s+=2) {
                    sti = containTriangle(arr[s], arr[s+1], p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                    if(sti) {
                        // 路径中有顶点在三角形p1-p2-p3内，因此该三角形不是耳尖
                        // 进行下一次循环
                        n++;
                        break;
                    }
                }

                if(!sti) {
                    // 路径中没有顶点在三角形p1-p2-p3内，因此该三角形是耳尖
                    // 将耳尖添加至 vertices
                    vertices.push(
                        p1.x, p1.y, 0,
                        p2.x, p2.y, 0,
                        p3.x, p3.y, 0
                    );
                    // curePath.splice(n*2+2, 2); // 移除凸点
                    arrDel(curePath, n*2+2, 2);
                    k--;
                }
            }
            else {
                // p1, p2, p3 三个点组成的拐角为凹角，不是耳尖
                // 进行下一次循环
                n++;
            }
        }
        // 此时 curePath 内还剩三个顶点
        // 将最后的三个顶点添加至 vertices 中
        vertices.push(
            curePath[0], curePath[1], 0,
            curePath[2], curePath[3], 0,
            curePath[4], curePath[5], 0
        );
        // 切耳法 end
        const uvs = new Array(vertices.length).fill(-1),
        geometry = new BufferGeometry(vertices, uvs, 3),
        material = new BasicMaterial({ color });
        super(geometry, material);
    }
}

class EllipseGeometry extends BufferGeometry {
    constructor( data ) {
        const attribute = {
            a: 1,
            b: 0.5,
            thickness: 1,
            start: 0,
            end: 360,
            sub: 64
        };
        extract( data, attribute );
        const vertices = [], uvs = [],
        srad = attribute.start / 180 * PI, erad = attribute.end / 180 * PI,
        rad = erad - srad, angle = rad / attribute.sub,
        radius = 1 - attribute.thickness;
        let x1, y1, x2, y2, rad1, rad2;
        for(let i=0; i<attribute.sub; i++) {
            rad1 = srad + i * angle;
            rad2 = srad + (i + 1) * angle;
            x1 = sin(rad1);
            y1 = cos(rad1);
            x2 = sin(rad2);
            y2 = cos(rad2);
            if(attribute.thickness > 0) {
                vertices.push(
                    attribute.a * x1, attribute.b * y1, 0,
                    radius * attribute.a * x1, radius * attribute.b * y1, 0,
                    radius * attribute.a * x2, radius * attribute.b * y2, 0,
                    
                    attribute.a * x1, attribute.b * y1, 0,
                    radius * attribute.a * x2, radius * attribute.b * y2, 0,
                    attribute.a * x2, attribute.b * y2, 0
                );
                uvs.push(
                    0.5 * x1 + 0.5, 0.5 * y1 + 0.5, 0,
                    radius * 0.5 * x1 + 0.5, radius * 0.5 * y1 + 0.5, 0,
                    radius * 0.5 * x2 + 0.5, radius * 0.5 * y2 + 0.5, 0,
                    
                    0.5 * x1 + 0.5, 0.5 * y1 + 0.5, 0,
                    radius * 0.5 * x2 + 0.5, radius * 0.5 * y2 + 0.5, 0,
                    0.5 * x2 + 0.5, 0.5 * y2 + 0.5, 0
                );
            }
            else {
                vertices.push(
                    attribute.a * x1, attribute.b * y1, 0,
                    0, 0, 0,
                    attribute.a * x2, attribute.b * y2, 0
                );
                uvs.push(
                    0.5 * x1 + 0.5, 0.5 * y1 + 0.5, 0,
                    radius * 0.5 * x2 + 0.5, radius * 0.5 * y2 + 0.5, 0,
                    0.5 * x2 + 0.5, 0.5 * y2 + 0.5, 0
                );
            }
        }
        super(vertices, uvs, 3);
    }
}

class IsoscelesGeometry extends BufferGeometry {
    constructor( topBase=1, bottomBase=1, height=1, seg=0 ) {
        const vertices = [], uvs = [],
        _w1 = topBase * 0.5, _w2 = bottomBase * 0.5, _h = height * 0.5,
        v1 = { x: _w1 - _w2, y: -height }, v2 = { x: _w2 - _w1, y: -height },
        count = seg + 1, _cou = 1 / count;
        
        let x1, y1, x2, y2, x3, y3, x4, y4,
        ux, uy, vx, vy, sx, sy, tx, ty,
        ia, ib;
        for(let i=0; i<count; i++) {
            ia = i * _cou;
            ib = (i + 1) * _cou;
            
            ux = v1.x * ia;
            uy = v1.y * ia;
            vx = v1.x * ib;
            vy = v1.y * ib;
            
            sx = v2.x * ia;
            // sy = v2.y * ia;
            tx = v2.x * ib;
            // ty = v2.y * ib;
            
            x1 = ux - _w1;
            y1 = uy + _h;
            
            x2 = vx - _w1;
            y2 = vy + _h;
            
            x3 = tx + _w1;
            x4 = sx + _w1;
            
            vertices.push(
                x1, y1, 0,
                x2, y2, 0,
                x3, y2, 0,
                
                x1, y1, 0,
                x3, y2, 0,
                x4, y1, 0
            );
            
            y3 = 1 - ia;
            y4 = 1 - ib;
            
            uvs.push(
                0, y3, 0,
                0, y4, 0,
                1, y4, 0,
                
                0, y3, 0,
                1, y4, 0,
                1, y3, 0
            );
        }
        
        super(vertices, uvs, 3);
    }
}

class StarGeometry extends BufferGeometry {
    constructor( radius1=1, radius2=0.38196601125, seg=5 ) {
        const vertices = [], uvs = [],
        uvradius = 0.5 * radius2 / radius1,
        count = seg * 2, angle = 2 * PI / count;
        let x1, y1, x2, y2, x3, y3, rad1, rad2, rad3;
        for(let i=0; i<count; i+=2) {
            rad1 = i * angle;
            rad2 = (i + 1) * angle;
            rad3 = (i + 2) * angle;
            x1 = sin(rad1);
            y1 = cos(rad1);
            x2 = sin(rad2);
            y2 = cos(rad2);
            x3 = sin(rad3);
            y3 = cos(rad3);
            vertices.push(
                radius1 * x1, radius1 * y1, 0,
                0, 0, 0,
                radius2 * x2, radius2 * y2, 0,
                
                radius2 * x2, radius2 * y2, 0,
                0, 0, 0,
                radius1 * x3, radius1 * y3, 0
            );
            uvs.push(
                0.5 * x1 + 0.5, 0.5 * y1 + 0.5, 0,
                0.5, 0.5, 0,
                uvradius * x2 + 0.5, uvradius * y2 + 0.5, 0,
                
                uvradius * x2 + 0.5, uvradius * y2 + 0.5, 0,
                0.5, 0.5, 0,
                0.5 * x3 + 0.5, 0.5 * y3 + 0.5, 0
            );
        }
        super(vertices, uvs, 3);
    }
}

class HeartGeometry extends BufferGeometry {
    constructor( radius=1, sub=64 ) {
        const vertices = [], uvs = [],
        angle = 2 * PI / sub;
        let p1, p2, rad1, rad2;
        for(let i=0; i<sub; i++) {
            rad1 = i * angle;
            rad2 = (i + 1) * angle;
            p1 = getheart(rad1);
            p2 = getheart(rad2);
            vertices.push(
                radius * p1.x, radius * p1.y, 0,
                0, 0, 0,
                radius * p2.x, radius * p2.y, 0
            );
            uvs.push(
                0.5 * p1.x + 0.5, 0.5 * p1.y + 0.5, 0,
                0.5, 0.5, 0,
                0.5 * p2.x + 0.5, 0.5 * p2.y + 0.5, 0
            );
        }
        super(vertices, uvs, 3);
    }
}

class MeshHelperX extends Mesh {
    constructor( mesh, color='#ffffff' ) {
        super(
            new BufferGeometry([], [], 2),
            new BasicMaterial({ color })
        );
        this.bind = mesh;
    }
    vertices() {
        const vertices = [], _vertices = this.bind.vertices(), count = _vertices.length;
        let index = 0, color1, color2, color3, color4, color5, color6;
        
        for(let i=0; i<count; i+=30) {
            color1 = this.material.getColor( index, this.geometry.connect );
            color2 = this.material.getColor( index+1, this.geometry.connect );
            color3 = this.material.getColor( index+2, this.geometry.connect );
            color4 = this.material.getColor( index+3, this.geometry.connect );
            color5 = this.material.getColor( index+4, this.geometry.connect );
            color6 = this.material.getColor( index+5, this.geometry.connect );
            vertices.push(
                _vertices[i], _vertices[i+1], _vertices[i+2],
                color1.r, color1.g, color1.b, color1.a,
                0, 0, -1,
                _vertices[i+10], _vertices[i+11], _vertices[i+12],
                color2.r, color2.g, color2.b, color2.a,
                0, 0, -1,
                
                _vertices[i+10], _vertices[i+11], _vertices[i+12],
                color3.r, color3.g, color3.b, color3.a,
                0, 0, -1,
                _vertices[i+20], _vertices[i+21], _vertices[i+22],
                color4.r, color4.g, color4.b, color4.a,
                0, 0, -1,
                
                _vertices[i+20], _vertices[i+21], _vertices[i+22],
                color5.r, color5.g, color5.b, color5.a,
                0, 0, -1,
                _vertices[i], _vertices[i+1], _vertices[i+2],
                color6.r, color6.g, color6.b, color6.a,
                0, 0, -1
            );
            index += 6;
        }
        
        return new Float32Array(vertices);
    }
}

class EllipseHelper extends Mesh {
    constructor( a=1, b=0.5, color='#7b68ee', sub=64 ) {
        const vertices = [], uvs = [], angle = 2 * PI / sub;
        let x1, y1, x2, y2, rad1, rad2;
        for(let i=0; i<sub; i++) {
            rad1 = i * angle;
            rad2 = (i + 1) * angle;
            x1 = a * sin(rad1);
            y1 = b * cos(rad1);
            x2 = a * sin(rad2);
            y2 = b * cos(rad2);
            vertices.push(
                x1, y1, 0,
                x2, y2, 0
            );
            uvs.push(
                0, 0, -1,
                0, 0, -1
            );
        }
        super(
            new BufferGeometry(vertices, uvs, 2),
            new BasicMaterial({ color })
        );
    }
}

class StarHelper extends Mesh {
    constructor( radius1=1, radius2=0.38196601125, seg=5, color='#ffff00' ) {
        const vertices = [], uvs = [],
        count = seg * 2, angle = 2 * PI / count;
        let x1, y1, x2, y2, x3, y3, rad1, rad2, rad3;
        for(let i=0; i<count; i+=2) {
            rad1 = i * angle;
            rad2 = (i + 1) * angle;
            rad3 = (i + 2) * angle;
            x1 = radius1 * sin(rad1);
            y1 = radius1 * cos(rad1);
            x2 = radius2 * sin(rad2);
            y2 = radius2 * cos(rad2);
            x3 = radius1 * sin(rad3);
            y3 = radius1 * cos(rad3);
            vertices.push(
                x1, y1, 0,
                x2, y2, 0,
                x2, y2, 0,
                x3, y3, 0
            );
            uvs.push(
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, -1
            );
        }
        super(
            new BufferGeometry(vertices, uvs, 2),
            new BasicMaterial({ color })
        );
    }
}

class HeartHelper extends Mesh {
    constructor( radius=1, color='#ff0000', sub=64 ) {
        const vertices = [], uvs = [], angle = 2 * PI / sub;
        let p1, p2, rad1, rad2;
        for(let i=0; i<sub; i++) {
            rad1 = i * angle;
            rad2 = (i + 1) * angle;
            p1 = getheart(rad1);
            p2 = getheart(rad2);
            vertices.push(
                radius * p1.x, radius * p1.y, 0,
                radius * p2.x, radius * p2.y, 0
            );
            uvs.push(
                0, 0, -1,
                0, 0, -1
            );
        }
        super(
            new BufferGeometry(vertices, uvs, 2),
            new BasicMaterial({ color })
        );
    }
}

export {
    BezierToCure, CureToShape, Extrusion,
    EllipseGeometry, IsoscelesGeometry, StarGeometry, HeartGeometry,
    MeshHelperX, EllipseHelper, StarHelper, HeartHelper
};