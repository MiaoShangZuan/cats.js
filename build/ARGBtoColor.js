/**
 * 颜色处理
 * 当前版本 0.1.3
 * 于2025年4月2日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */



/**
 * 颜色处理
 * @param {number|string} value 颜色参数
 * @returns 返回颜色分量
 */
function ARGBtoColor( value='#000000' ) {
    let a, r, g, b;
    if(typeof value == 'number') {
        a = 0xFF;
        r = (value >> 16) & 0xFF;
        g = (value >> 8) & 0xFF;
        b = value & 0xFF;
    }
    else {
        const hex = value.replace(/^#/, '');
        if(hex.length === 6) {
            a = 'FF';
            r = hex.slice(0, 2);
            g = hex.slice(2, 4);
            b = hex.slice(4, 6);
        }
        else if(hex.length === 8) {
            a = hex.slice(0, 2);
            r = hex.slice(2, 4);
            g = hex.slice(4, 6);
            b = hex.slice(6, 8);
        }
        else {
            a = 'FF';
            r = g = b = '00';
        }
        a = parseInt(a, 16);
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);
    }
    return {
        r: r / 255,
        g: g / 255,
        b: b / 255,
        a: a / 255,
        value
    };
}

export default ARGBtoColor;