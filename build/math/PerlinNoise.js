/**
 * 柏林噪声
 * 当前版本 0.2
 * 于2024年7月7日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const PI = Math.PI;
const sin = Math.sin;
const cos = Math.cos;
const floor = Math.floor;
const ceil = Math.ceil;
const trunc = Math.trunc;
const random = Math.random;
const _J2 = 1 / 1.414214;
const _J3 = 1 / 1.7321;

class PerlinNoise {
    constructor( structure=()=>{return random()} ) {
        this.data = [{}, {}, {}];
        this.argument = 0;
        this.structure = structure;
    }
    fade( t ) {
        return 6 * t * t * t * t * t - 15 * t * t * t * t + 10 * t * t * t;
    }
    lerp( a, b, x ) {
        return a + this.fade(x) * (b - a);
    }
    get1d( x=0 ) {
        const x1 = floor(x), x2 = ceil(x);
        
        if(this.data[0][`s${x1}`] == undefined) {
            this.data[0][`s${x1}`] = this.structure(this.argument);
            this.argument++;
        }
        if(this.data[0][`s${x2}`] == undefined) {
            this.data[0][`s${x2}`] = this.structure(this.argument);
            this.argument++;
        }
        
        const y1 = this.data[0][`s${x1}`], y2 = this.data[0][`s${x2}`],
        t = x - trunc(x);
        
        return this.lerp( y1, y2, t );
    }
    get2d( x=0, y=0 ) {
        const x1 = floor(x), x2 = ceil(x),
        y1 = floor(y), y2 = ceil(y);
        
        if(this.data[1][`s${x1}_${y1}`] == undefined) {
            const rad = this.structure(this.argument) * 2 * PI;
            this.data[1][`s${x1}_${y1}`] = { x: cos(rad), y: sin(rad) };
            this.argument++;
        }
        if(this.data[1][`s${x1}_${y2}`] == undefined) {
            const rad = this.structure(this.argument) * 2 * PI;
            this.data[1][`s${x1}_${y2}`] = { x: cos(rad), y: sin(rad) };
            this.argument++;
        }
        if(this.data[1][`s${x2}_${y2}`] == undefined) {
            const rad = this.structure(this.argument) * 2 * PI;
            this.data[1][`s${x2}_${y2}`] = { x: cos(rad), y: sin(rad) };
            this.argument++;
        }
        if(this.data[1][`s${x2}_${y1}`] == undefined) {
            const rad = this.structure(this.argument) * 2 * PI;
            this.data[1][`s${x2}_${y1}`] = { x: cos(rad), y: sin(rad) };
            this.argument++;
        }
        
        /*
        * dot1 -- upper left
        * dot2 -- lower left
        * dot3 -- lower right
        * dot4 -- upper right
        */
        const p1 = this.data[1][`s${x1}_${y1}`],
        p2 = this.data[1][`s${x1}_${y2}`],
        p3 = this.data[1][`s${x2}_${y2}`],
        p4 = this.data[1][`s${x2}_${y1}`],
        v1 = { x: x1-x, y: y1-y },
        v2 = { x: x1-x, y: y2-y },
        v3 = { x: x2-x, y: y2-y },
        v4 = { x: x2-x, y: y1-y },
        dot1 = v1.x * p1.x + v1.y * p1.y,
        dot2 = v2.x * p2.x + v2.y * p2.y,
        dot3 = v3.x * p3.x + v3.y * p3.y,
        dot4 = v4.x * p4.x + v4.y * p4.y,
        g1 = (dot1 * _J2 + 1) * 0.5,
        g2 = (dot2 * _J2 + 1) * 0.5,
        g3 = (dot3 * _J2 + 1) * 0.5,
        g4 = (dot4 * _J2 + 1) * 0.5,
        u = x - trunc(x), v = y - trunc(y),
        lerp1 = this.lerp( g1, g4, u ),
        lerp2 = this.lerp( g2, g3, u );
        
        return this.lerp( lerp1, lerp2, v );
    }
    get3d( x=0, y=0, z=0 ) {
        const x1 = floor(x), x2 = ceil(x),
        y1 = floor(y), y2 = ceil(y),
        z1 = floor(z), z2 = ceil(z);
        
        if(this.data[2][`s${x1}_${y1}_${z1}`] == undefined) {
            const u = this.structure(this.argument) * 2 * PI, v = this.structure(this.argument+1) * 2 * PI,
            sinu = sin(u);
            this.data[2][`s${x1}_${y1}_${z1}`] = { x: sinu*cos(v), y: sinu*sin(v), z: cos(u) };
            this.argument+=2;
        }
        if(this.data[2][`s${x1}_${y2}_${z1}`] == undefined) {
            const u = this.structure(this.argument) * 2 * PI, v = this.structure(this.argument+1) * 2 * PI,
            sinu = sin(u);
            this.data[2][`s${x1}_${y2}_${z1}`] = { x: sinu*cos(v), y: sinu*sin(v), z: cos(u) };
            this.argument+=2;
        }
        if(this.data[2][`s${x2}_${y2}_${z1}`] == undefined) {
            const u = this.structure(this.argument) * 2 * PI, v = this.structure(this.argument+1) * 2 * PI,
            sinu = sin(u);
            this.data[2][`s${x2}_${y2}_${z1}`] = { x: sinu*cos(v), y: sinu*sin(v), z: cos(u) };
            this.argument+=2;
        }
        if(this.data[2][`s${x2}_${y1}_${z1}`] == undefined) {
            const u = this.structure(this.argument) * 2 * PI, v = this.structure(this.argument+1) * 2 * PI,
            sinu = sin(u);
            this.data[2][`s${x2}_${y1}_${z1}`] = { x: sinu*cos(v), y: sinu*sin(v), z: cos(u) };
            this.argument+=2;
        }
        if(this.data[2][`s${x1}_${y1}_${z2}`] == undefined) {
            const u = this.structure(this.argument) * 2 * PI, v = this.structure(this.argument+1) * 2 * PI,
            sinu = sin(u);
            this.data[2][`s${x1}_${y1}_${z2}`] = { x: sinu*cos(v), y: sinu*sin(v), z: cos(u) };
            this.argument+=2;
        }
        if(this.data[2][`s${x1}_${y2}_${z2}`] == undefined) {
            const u = this.structure(this.argument) * 2 * PI, v = this.structure(this.argument+1) * 2 * PI,
            sinu = sin(u);
            this.data[2][`s${x1}_${y2}_${z2}`] = { x: sinu*cos(v), y: sinu*sin(v), z: cos(u) };
            this.argument+=2;
        }
        if(this.data[2][`s${x2}_${y2}_${z2}`] == undefined) {
            const u = this.structure(this.argument) * 2 * PI, v = this.structure(this.argument+1) * 2 * PI,
            sinu = sin(u);
            this.data[2][`s${x2}_${y2}_${z2}`] = { x: sinu*cos(v), y: sinu*sin(v), z: cos(u) };
            this.argument+=2;
        }
        if(this.data[2][`s${x2}_${y1}_${z2}`] == undefined) {
            const u = this.structure(this.argument) * 2 * PI, v = this.structure(this.argument+1) * 2 * PI,
            sinu = sin(u);
            this.data[2][`s${x2}_${y1}_${z2}`] = { x: sinu*cos(v), y: sinu*sin(v), z: cos(u) };
            this.argument+=2;
        }
        
        const p1 = this.data[2][`s${x1}_${y1}_${z1}`],
        p2 = this.data[2][`s${x1}_${y2}_${z1}`],
        p3 = this.data[2][`s${x2}_${y2}_${z1}`],
        p4 = this.data[2][`s${x2}_${y1}_${z1}`],
        p5 = this.data[2][`s${x1}_${y1}_${z2}`],
        p6 = this.data[2][`s${x1}_${y2}_${z2}`],
        p7 = this.data[2][`s${x2}_${y2}_${z2}`],
        p8 = this.data[2][`s${x2}_${y1}_${z2}`],
        v1 = { x: x1-x, y: y1-y, z: z1-z },
        v2 = { x: x1-x, y: y2-y, z: z1-z },
        v3 = { x: x2-x, y: y2-y, z: z1-z },
        v4 = { x: x2-x, y: y1-y, z: z1-z },
        v5 = { x: x1-x, y: y1-y, z: z2-z },
        v6 = { x: x1-x, y: y2-y, z: z2-z },
        v7 = { x: x2-x, y: y2-y, z: z2-z },
        v8 = { x: x2-x, y: y1-y, z: z2-z },
        dot1 = v1.x * p1.x + v1.y * p1.y + v1.z * p1.z,
        dot2 = v2.x * p2.x + v2.y * p2.y + v2.z * p2.z,
        dot3 = v3.x * p3.x + v3.y * p3.y + v3.z * p3.z,
        dot4 = v4.x * p4.x + v4.y * p4.y + v4.z * p4.z,
        dot5 = v5.x * p5.x + v5.y * p5.y + v5.z * p5.z,
        dot6 = v6.x * p6.x + v6.y * p6.y + v6.z * p6.z,
        dot7 = v7.x * p7.x + v7.y * p7.y + v7.z * p7.z,
        dot8 = v8.x * p8.x + v8.y * p8.y + v8.z * p8.z,
        g1 = (dot1 * _J3 + 1) * 0.5,
        g2 = (dot2 * _J3 + 1) * 0.5,
        g3 = (dot3 * _J3 + 1) * 0.5,
        g4 = (dot4 * _J3 + 1) * 0.5,
        g5 = (dot5 * _J3 + 1) * 0.5,
        g6 = (dot6 * _J3 + 1) * 0.5,
        g7 = (dot7 * _J3 + 1) * 0.5,
        g8 = (dot8 * _J3 + 1) * 0.5,
        r = x - trunc(x),
        g = y - trunc(y),
        b = z - trunc(z),
        lerp1 = this.lerp( g1, g4, r ),
        lerp2 = this.lerp( g2, g3, r ),
        lerp3 = this.lerp( g5, g8, r ),
        lerp4 = this.lerp( g6, g7, r ),
        lerp5 = this.lerp( lerp1, lerp2, g ),
        lerp6 = this.lerp( lerp3, lerp4, g );
        
        return this.lerp( lerp5, lerp6, b );
    }
}

export default PerlinNoise;