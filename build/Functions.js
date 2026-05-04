/**
 * 一些辅助函数
 * 于2025年5月1日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */



/**
 * 本人于2024年9月8日拉了一坨代码，如下。
 * 望后期的我来修复。（暂时先用旧版代码吧--调皮脸）
 * @param {object} data 输入Object2D参数
 * @param {object} Object2D 默认Object2D参数
 * @param {object} stipulate 替换规则
 */
function extract( data, Object2D, stipulate=[] ) {
    if( data != undefined ) {
        for( let key in Object2D ) {
            if( data[key] != undefined ) {
                // 判断子属性是否为对象或数组
                // 且是否一个一个遍历
                if( typeof Object2D[key] == 'object' && stipulate == undefined || typeof Object2D[key] == 'object' && stipulate.indexOf(key) == -1 ) {
                    if( ! Array.isArray(Object2D[key]) ) {
                        // 此属性是对象
                        for( let key2 in Object2D[key] ) {
                            if( data[key][key2] != undefined ) Object2D[key][key2] = data[key][key2];
                        }
                    }
                    else {
                        // 此属性是数组
                        for( let i = 0; i < Object2D[key].length; i++ ) {
                            if( data[key][i] != undefined ) Object2D[key][i] = data[key][i];
                        }
                    }
                }
                else {
                    // 正常替换
                    Object2D[key] = data[key];
                }
            }
        }
    }
}

function concatFloat32Arrays( arrays ) {
    const result = [];

    let arr;
    for(let i=0; i<arrays.length; i++) {
        arr = arrays[i];
        for(let j=0; j<arr.length; j++) {
            result.push(arr[j]);
        }
    }

    return new Float32Array(result);
}

function cross( x1, y1, x2, y2 ) {
    return x1 * y2 - x2 * y1;
}

function containTriangle( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    let state = false;

    const AB = { x: x2-x1, y: y2-y1 },
    BC = { x: x3-x2, y: y3-y2 },
    CA = { x: x1-x3, y: y1-y3 },
    AP = { x: x0-x1, y: y0-y1 },
    BP = { x: x0-x2, y: y0-y2 },
    CP = { x: x0-x3, y: y0-y3 },
    CAP = cross(AB.x, AB.y, AP.x, AP.y),
    CBP = cross(BC.x, BC.y, BP.x, BP.y),
    CCP = cross(CA.x, CA.y, CP.x, CP.y);

    if( CAP>0&&CBP>0&&CCP>0 || !CAP&&CBP*CCP!=0 || !CBP&&CAP*CCP!=0 || !CCP&&CAP*CBP!=0 || !CAP&&!CBP || !CBP&&!CCP || !CCP&&!CAP ) {
        state = true;
    }

    return state;
}

function polygonArea2( pathVertices ) {
    const points = [...pathVertices], count = pathVertices.length; // 复制数组
    points.push( pathVertices[0], pathVertices[1] ); // 添加起点
    let area = 0;
    for(let i=0; i<count; i+=2) {
        area += cross(points[i], points[i+1], points[i+2], points[i+3]);
    }
    area *= 0.5;
    return area;
}

function arrDel( arr, start, num ) {
    const count = arr.length;
    if(start >= count) start %= count;

    if(start+num <= count) {
        arr.splice(start, num);
    }
    else {
        const num2 = count-start;
        arr.splice(start, num2);
        arr.splice(0, num-num2);
    }
}

//function arrayAsyncForEach( element, func, index=0 ) {
//    func(element[index]);
//}

export { extract, concatFloat32Arrays, cross, containTriangle, polygonArea2, arrDel };