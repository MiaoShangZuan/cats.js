/**
 * JS矩阵模块，可用于矩阵运算
 * 当前版本 0.18
 * 于2024年9月2日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const Version = '0.18';
// const PI = Math.PI;
const abs = Math.abs;
const sqrt = Math.sqrt;

/**
 * 符号因子
 * @param {number} num 次方数
 * @returns 返回-1＾num的值
 */
function signFactor( num=0 ) {
    if( num%2 == 0 ) return 1;
    else return -1;
}

/**
 * 矩阵加法
 * @param {object} matrixA 矩阵A
 * @param {object} matrixB 矩阵B
 * @param {object} type 模式，1为加法，-1为减法
 * @returns 返回矩阵A与矩阵B相加后的矩阵
 */
function matrixAdd( matrixA, matrixB, type ) {
    if( matrixA.line == matrixB.line && matrixA.column == matrixB.column ) {
        const element = [], count = matrixA.line*matrixA.column;
        let value;
        for( let i = 0; i < count; i++ ) {
            value = matrixA.element[i]+type*matrixB.element[i];
            element.push(value);
        }
        return element;
    }
}

/**
* 矩阵乘法
* @param {object} matrixA 矩阵A
* @param {object|number} matrixB 矩阵B或实数
* @returns 返回矩阵A与矩阵B相乘后的矩阵
*/
function matrixMultiply( matrixA, matrixB ) {
    const element = [];
    let value;
    if( typeof matrixB == 'number' ) {
        // 若第二个参数为实数，则相乘
        matrixA.element.forEach(
            number =>{
                value = number*matrixB;
                element.push(value);
            }
        );
    }
    else if( matrixA.column == matrixB.line ) {
        // 若矩阵A的列等于矩阵B的行，则相乘
        for( let j = 0; j < matrixA.line; j++ ) {
            for( let i = 0; i < matrixB.column; i++ ) {
                value = 0;
                for( let k = 0; k < matrixA.column; k++ ) {
                    value += matrixA.element[j*matrixA.column+k]*matrixB.element[k*matrixB.column+i];
                }
                element.push(value);
            }
        }
    }
    return element;
}

/**
 * 计算矩阵的行列式
 * @param {object} element 要计算的矩阵
 * @param {number} step 矩阵阶数
 * @returns 返回矩阵的行列式
 */
function getMatrixDet( element, step ) {
    // 若为方阵，则计算行列式
    let det = 0;
    if( step == 1 ) {
        det = element[0];
    }
    else if( step == 2 ) {
        // 二阶行列式求解公式
        det = element[0]*element[3]-element[1]*element[2];
    }
    else if( step == 3 ) {
        //  三阶行列式求解公式
        const index11 = element[0],
        index21 = element[1],
        index31 = element[2],
        index12 = element[3],
        index22 = element[4],
        index32 = element[5],
        index13 = element[6],
        index23 = element[7],
        index33 = element[8];
        det = index11*index22*index33
        -index11*index32*index23
        +index31*index12*index23
        -index21*index12*index33
        +index21*index32*index13
        -index31*index22*index13;
    }
    else if( step == 4 ) {
        // 四阶行列式求解公式
        const index11 = element[0],
        index21 = element[1],
        index31 = element[2],
        index41 = element[3],
        index12 = element[4],
        index22 = element[5],
        index32 = element[6],
        index42 = element[7],
        index13 = element[8],
        index23 = element[9],
        index33 = element[10],
        index43 = element[11],
        index14 = element[12],
        index24 = element[13],
        index34 = element[14],
        index44 = element[15];
        det = index11*index22*index33*index44
        -index11*index22*index43*index34
        -index11*index32*index23*index44
        +index11*index42*index23*index34
        +index11*index32*index43*index24
        -index11*index42*index33*index24
        -index21*index12*index33*index44
        +index21*index12*index43*index34
        +index31*index12*index23*index44
        -index41*index12*index23*index34
        -index31*index12*index43*index24
        +index41*index12*index33*index24
        +index21*index32*index13*index44
        -index21*index42*index13*index34
        -index31*index22*index13*index44
        +index41*index22*index13*index34;
    }
    else {
        let value;
        for( let j = 0; j < step; j++ ) {
            value = element[j] * getAlgebraicCofactor(element, step, 0, j);
            det += value;
        }
    }
    return det;
}

/**
 * 求矩阵第i行j列的代数余子式
 * @param {object} element 矩阵
 * @param {object} step 阶数
 * @param {number} i 行
 * @param {number} j 列
 * @returns 返回此矩阵第i行j列的代数余子式
 */
function getAlgebraicCofactor( element, step, i, j ) {
    // 若为方阵，则有代数余子式
    const matrix_ij = [];
    let k;
    for( let y = 0; y < step; y++ ) {
        if( y != i ) {
            for( let x = 0; x < step; x++ ) {
                if( x != j ) {
                    k = x + step * y;
                    matrix_ij.push(element[k]);
                }
            }
        }
    }
    const det = getMatrixDet(matrix_ij, step-1),
    cofactor = det * signFactor(i + j);
    return cofactor;
}

/**
 * 求伴随矩阵
 * @param {object} matrix 原矩阵
 * @returns 返回此矩阵的伴随矩阵
 */
function getAdjointMatrix( matrix ) {
    // 若为方阵，则有伴随矩阵
    if( matrix.line == matrix.column && matrix.line > 1 && matrix.column > 1 ) {
        const element = [];
        let cofactor;
        for( let i = 0; i < matrix.line; i++ ) {
            for( let j = 0; j < matrix.column; j++ ) {
                cofactor = getAlgebraicCofactor( matrix.element, matrix.line, i, j ); // 获取i行j列的代数余子式
                element.push(cofactor);
            }
        }
        return element;
    }
}

/**
 * 求逆矩阵
 * @param {object} matrix 原矩阵
 * @returns 返回此矩阵的逆矩阵
 */
function getInverseMatrix( matrix ) {
    // 若为方阵，则计算逆矩阵
    if( matrix.line == matrix.column ) {
        let det = getMatrixDet(matrix.element, matrix.line);
        // 若此矩阵的行列式不为0，则说明此矩阵可逆
        if( abs(det) > 1e-9 ) {
            det = 1/det;
            const element = [],
            // 获取此矩阵的伴随矩阵
            adjointMatrix = getAdjointMatrix(matrix);
            let value;
            adjointMatrix.forEach(
                (number)=>{
                    value = number*det;
                    element.push(value);
                }
            );
            return element;
        }
        else console.error('此矩阵无逆矩阵');
    }
}

// 矩阵分解

/**
 * 矩阵降维
 * @param {object} matrix 矩阵
 * @returns 返回降维后的矩阵
 */
function matrixReduction( matrix ) {
    // 若为列阵，则返回降维后的矩阵
    if( matrix.line > 1 && matrix.column == 1 ) {
        const element = [], count = matrix.line-1;
        let value;
        for( let i = 0; i < count; i++ ) {
            value = matrix.element[i]/matrix.element[count];
            element.push(value);
        }
        return element;
    }
}

/**
 * 矩阵反转
 * @param {object} matrix 原矩阵
 * @returns 返回反转后的矩阵
 */
function matrixReverse( matrix ) {
    const element = [];
    let value;
    for( let j = 0; j < matrix.column; j++ ) {
        for( let i = 0; i < matrix.line; i++ ) {
            value = matrix.element[i*matrix.column+j];
            element.push(value);
        }
    }
    return element;
}

/**
 * 向量乘法
 * @param {object} vectorA 向量A
 * @param {object} vectorB 向量B
 * @returns 返回向量A与向量B的乘积
 */
function vectorMultiply( vectorA, vectorB ) {
    let product = 0, value;
    if( vectorA.line == vectorB.line && vectorA.column == 1 && vectorB.column == 1 ) {
        for( let i = 0; i < vectorA.element.length; i++ ) {
            value = vectorA.element[i]*vectorB.element[i];
            product += value;
        }
    }
    return product;
}

// 向量叉乘

/**
 * 求向量夹角
 * @param {object} vectorA 向量A
 * @param {object} vectorB 向量B
 * @returns 返回向量A与向量B的夹角
 */
function vectorAngle( vectorA, vectorB ) {
    if( vectorA.line == vectorB.line && vectorA.column == 1 && vectorB.column == 1 ) {
        return vectorMultiply(vectorA,vectorB)/(getVectorNorm(vectorA)*getVectorNorm(vectorB));
    }
}

/**
 * 向量投影
 * @param {object} vectorA 向量A
 * @param {object} vectorB 向量B
 * @returns 返回向量A在向量B上的投影长度
 */
function vectorProjection( vectorA, vectorB ) {
    if( vectorA.line == vectorB.line && vectorA.column == 1 && vectorB.column == 1 ) {
        const projectionVector = getVectorScale( vectorB, 1 );
        let value = 0;
        for(let i=0; i<projectionVector.length; i++) {
            value += vectorA.element[i] * projectionVector[i];
        }
        return value;
    }
}

// 求法向量

/**
 * 向量模
 * @param {object} vector 向量
 * @returns 返回向量的模
 */
function getVectorNorm( vector ) {
    if( vector.line > 0 && vector.column == 1 ) {
        let value = 0;
        vector.element.forEach(
            ( number )=>{
                value += number*number;
            }
        );
        return sqrt(value);
    }
}

/**
 * 更改向量长度
 * @param {object} vector 向量
 * @param {number} length 要变化的长度
 * @returns 返回改变长度后的向量
 */
function getVectorScale( vector, length=1 ) {
    if( vector.line > 0 && vector.column == 1 ) {
        const norm_1 = 1/getVectorNorm(vector),
        element = [];
        let value;
        vector.element.forEach(
            ( number )=>{
                value = number*norm_1*length;
                element.push(value);
            }
        );
        return element;
    }
}

class MatrixNxM {
    constructor( n=2, m=2, element=[1,0,0,1] ) {
        this.type = 'Matrix';
        this.line = n;
        this.column = m;
        const count = n*m;
        if( element.length == count ) this.element = element;
        else {
            this.element = [];
            for( let i = 0; i < count; i++ ) this.element.push(0);
        }
    }
    step( n=2, m=2 ) {
        const count = n*m;
        this.line = n;
        this.column = m;
        if( this.element.length != count ) {
            this.element = [];
            for( let i = 0; i < count; i++ ) this.element.push(0);
        }
    }
    set( element=[1,0,0,1] ) {
        const count = this.line*this.column;
        if( element.length == count ) this.element = element;
        else console.error('参数错误！');
    }
    copy( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) {
            const element = [];
            matrix.element.forEach(
                ( number )=>{
                    element.push(number);
                }
            );
            this.element = element;
        }
    }
    addition( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, 1 );
        else console.error('参数错误！');
    }
    subtract( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, -1 );
        else console.error('参数错误！');
    }
    multiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( this.column == matrix.line ) {
            this.element = matrixMultiply( this, matrix );
            this.column = matrix.column;
        }
        else console.error('参数错误！');
    }
    premultiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
            this.line = matrix.line;
        }
        else console.error('参数错误！');
    }
    det() {
        if( this.line == this.column && this.line > 1 ) return getMatrixDet(this.element, this.line);
        else console.error('参数错误！');
    }
    cofactor( i=1, j=1 ) {
        if( this.line == this.column && this.line > 1 ) return getAlgebraicCofactor(this.element, this.line, i-1, j-1);
        else console.error('参数错误！');
    }
    adjoint() {
        if( this.line == this.column && this.line > 1 ) return new MatrixNxM( this.line, this.column, getAdjointMatrix(this) );
        else console.error('参数错误！');
    }
    inverse() {
        if( this.line == this.column && this.line > 1 ) return new MatrixNxM( this.line, this.column, getInverseMatrix(this) );
        else console.error('参数错误！');
    }
    reduction() {
        if( this.line > 1 && this.column == 1 ) {
            this.element = matrixReduction( this );
            this.line -= 1;
        }
        else console.error('参数错误！');
    }
    reverse() {
        const n = this.line, m = this.column;
        this.element = matrixReverse(this);
        this.line = m;
        this.column = n;
    }
}

class Matrix2 extends MatrixNxM {
    constructor( element=[1,0,0,1] ) {
        super( 2, 2, element );
    }
}

class Matrix3 extends MatrixNxM {
    constructor( element=[1,0,0,0,1,0,0,0,1] ) {
        super( 3, 3, element );
    }
}

class Matrix4 extends MatrixNxM {
    constructor( element=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] ) {
        super( 4, 4, element );
    }
}

class VectorN {
    constructor( element=[0,0] ) {
        this.type = 'Vector';
        this.line = element.length;
        this.column = 1;
        this.element = element;
    }
    set( element=[0,0] ) {
        this.line = element.length;
        this.element = element;
    }
    copy( vector ) {
        if( this.line == vector.line ) {
            for(let i=0; i<this.line; i++) {
                this.element[i] = vector.element[i];
            }
        }
        else console.error('参数错误！');
    }
    addition( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            this.element = matrixAdd( this, vector, 1 );
        }
        else console.error('参数错误！');
    }
    subtract( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            this.element = matrixAdd( this, vector, -1 );
        }
        else console.error('参数错误！');
    }
    multiply( vector ) {
        if( typeof vector == 'number' ) {
            this.element = matrixMultiply( this, vector );
        }
        else if( this.line == vector.line && vector.column == 1 ) {
            return vectorMultiply( this, vector );
        }
        else console.error('参数错误！');
    }
    transform( matrix ) {
        if( matrix.type == 'Matrix' && matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
        }
        else console.error('参数错误！');
    }
    angle( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            return vectorAngle( this, vector );
        }
        else console.error('参数错误！');
    }
    projection( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            return vectorProjection( vector, this );
        }
        else console.error('参数错误！');
    }
    norm() {
        return getVectorNorm(this);
    }
    scale( length=1 ) {
        this.element = getVectorScale( this, length );
    }
    unit() {
        const element = getVectorScale( this, 1 );
        return new VectorN( element );
    }
    reverse() {
        const n = this.line, m = this.column;
        this.line = m;
        this.column = n;
    }
}

class Vector2 extends VectorN {
    constructor( x=0, y=0 ) {
        super([x, y]);
    }
    get x() {
        return this.element[0];
    }
    set x( value=0 ) {
        this.element[0] = value;
    }
    get y() {
        return this.element[1];
    }
    set y( value=0 ) {
        this.element[1] = value;
    }
    set( x=0, y=0 ) {
        this.element[0] = x;
        this.element[1] = y;
    }
    unit() {
        const element = getVectorScale( this, 1 );
        return new Vector2( element[0], element[1] );
    }
}

class Vector3 extends VectorN {
    constructor( x=0, y=0, z=0 ) {
        super([x, y, z]);
    }
    get x() {
        return this.element[0];
    }
    set x( value=0 ) {
        this.element[0] = value;
    }
    get y() {
        return this.element[1];
    }
    set y( value=0 ) {
        this.element[1] = value;
    }
    get z() {
        return this.element[2];
    }
    set z( value=0 ) {
        this.element[2] = value;
    }
    set( x=0, y=0, z=0 ) {
        this.element[0] = x;
        this.element[1] = y;
        this.element[2] = z;
    }
    unit() {
        const element = getVectorScale( this, 1 );
        return new Vector3( element[0], element[1], element[2] );
    }
}

class Vector4 extends VectorN {
    constructor( x=0, y=0, z=0, w=0 ) {
        super([x, y, z, w]);
    }
    get x() {
        return this.element[0];
    }
    set x( value=0 ) {
        this.element[0] = value;
    }
    get y() {
        return this.element[1];
    }
    set y( value=0 ) {
        this.element[1] = value;
    }
    get z() {
        return this.element[2];
    }
    set z( value=0 ) {
        this.element[2] = value;
    }
    get w() {
        return this.element[3];
    }
    set w( value=0 ) {
        this.element[3] = value;
    }
    set( x=0, y=0, z=0, w=0 ) {
        this.element[0] = x;
        this.element[1] = y;
        this.element[2] = z;
        this.element[3] = w;
    }
    unit() {
        const element = getVectorScale( this, 1 );
        return new Vector4( element[0], element[1], element[2], element[3] );
    }
}

export { Version, MatrixNxM, Matrix2, Matrix3, Matrix4, VectorN, Vector2, Vector3, Vector4 };