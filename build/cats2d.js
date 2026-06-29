import { MatrixNxM, Matrix2, Matrix3, Matrix4, VectorN, Vector2, Vector3, Vector4 } from './math/matrix.js';
import WebGLRenderer from './renderer/WebGLRenderer.js';
import Scene from './scene/Scene.js';
import Camera2D from './camera/Camera2D.js';
import {
    Mesh, BufferGeometry, BasicMaterial, VertexMaterial, ArrayMaterial, RawTexture,
    Bone, Skeleton, SkinnedMesh,
    RectGeometry, CircleGeometry, MergeGeometry,
    Group, MeshHelper, GridHelper, BezierHelper, RectHelper, CircleHelper, SkeletonHelper
} from './model/Object2D.js';
import {
    BezierToCure, CureToShape, Extrusion,
    EllipseGeometry, IsoscelesGeometry, StarGeometry, HeartGeometry,
    MeshHelperX, EllipseHelper, StarHelper, HeartHelper
} from './plugins/moreObject2D.js';
import { AnBezier, AnFunc, AnLerp, AnCureController, Animation, AnGetBezierFunc } from './plugins/animation.js';
import * as MathUtils from './math/utils.js';
import PerlinNoise from './math/PerlinNoise.js';
import FileLoader from './plugins/loaders/FileLoader.js';
import TextLoader from './plugins/loaders/TextLoader.js';
import TextureLoader from './plugins/loaders/TextureLoader.js';
import StringLoader from './plugins/loaders/StringLoader.js';
// import ChainConstraint from './plugins/controllers/ChainConstraint.js';

/**
 * CatsJS
 * beta_0.1.29
 * 于2023年1月25日开始开发
 * 于2023年4月9日发布第一个版本（下载地址已失效）
 * @author MiaoShangZuan <3268208143@qq.com>
 * 
 * 
 *      /\_/\                  
 *     ( o.o )                           
 *      > ^ <
 *     /    /\       
 * // 真 的 猫 //
 * // 保 佑 代 码 //
 * // 永 无 BUG //
 */
const Version = 'beta 0.1.29';

export {
    Version,
    MatrixNxM, Matrix2, Matrix3, Matrix4, VectorN, Vector2, Vector3, Vector4,
    WebGLRenderer, Scene, Camera2D, Mesh,
    BufferGeometry, BasicMaterial, VertexMaterial, ArrayMaterial, RawTexture,
    Bone, Skeleton, SkinnedMesh,
    RectGeometry, CircleGeometry, MergeGeometry,
    Group, MeshHelper, GridHelper, BezierHelper, RectHelper, CircleHelper, SkeletonHelper,
    BezierToCure, CureToShape, Extrusion,
    EllipseGeometry, IsoscelesGeometry, StarGeometry, HeartGeometry,
    MeshHelperX, EllipseHelper, StarHelper, HeartHelper,
    AnBezier, AnFunc, AnLerp, AnCureController, Animation, AnGetBezierFunc,
    MathUtils, PerlinNoise,
    FileLoader, TextLoader, TextureLoader, StringLoader
};