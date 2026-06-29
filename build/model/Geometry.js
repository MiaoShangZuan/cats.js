/**
 * CatsJS-几何体
 * 当前版本 0.1
 * 于2025年3月16日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
class BufferGeometry {
    constructor( vertices, uvs, connect=3 ) {
        let indices = [], weights = [];
        if(arguments.length == 5) {
            indices = arguments[2];
            weights = arguments[3];
            connect = arguments[4];
        }
        this.type = 'Geometry';
        this.connect = connect; // Triangles or Lines
        this.vertices = vertices;
        this.uvs = uvs;
        this.skinIndices = indices;
        this.skinWeights = weights;
    }
}

export default BufferGeometry;