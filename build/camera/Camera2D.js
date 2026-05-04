import { Vector3, Matrix4 } from '../math/matrix.js';

const { sin, cos } = Math;

/**
 * CatsJS-2D相机
 * 当前版本 0.3
 * 于2025年3月16日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
class Camera2D {
    constructor( near=0.1, far=20 ) {
        this.type = 'Camera';
        this.rotate = 0;
        this.position = new Vector3( 0, 0, 10 );
        this.near = near;
        this.far = far;
        this.unitX = 70;
        this.unitY = 70;
        this.model = undefined;
    }
    matrix() {
        const _m = 1 / (this.near-this.far),
        sinz = sin(this.rotate), cosz = cos(this.rotate);
        let zoom = 1;
        if(this.position.z > 0) zoom = 10/this.position.z;
        if(this.model) {
            this.position.x = this.model.position.x;
            this.position.y = this.model.position.y;
        }
        return new Matrix4([
            zoom*cosz, -zoom*sinz, 0, -this.position.x*zoom,
            zoom*sinz, zoom*cosz, 0, -this.position.y*zoom,
            0, 0, 2*_m, (this.near+this.far-2*this.position.z)*_m,
            0, 0, 0, 1
        ]);
    }
}

export default Camera2D;