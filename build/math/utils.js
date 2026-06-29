const degToRadRatio = 0.017453292519943295;
const radToDegRatio = 57.29577951308232;

/**
 * 一些数学工具类函数
 * 当前版本 0.1.1
 * 于2026年5月2日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */

function degToRad( deg ) {
    return deg * degToRadRatio;
}

function radToDeg( rad ) {
    return rad * radToDegRatio;
}

function hexToRGB( value ) {
    if(typeof value == 'string') value = parseInt(value.replace('#', ''), 16);

    let r = value >> 16,
    g = (value & 0xff00) >> 8,
    b = value & 0xff;

    r /= 255;
    g /= 255;
    b /= 255;
    
    return { r, g, b };
}

function clipFrames( divisionX=1, divisionY=1, sprite=[] ) {
    const arr = [],
    w = 1 / divisionX,
    h = 1 / divisionY;

    for(let animate of sprite) {
        const animateArr = [],
              count = animate.length;
        let j, x, y;
        for(let i=0; i<count; i+=2) {
            j = i + 1;
            x = animate[i] * w;
            y = animate[j] * h;
            animateArr.push([
                x, y + h,
                x, y,
                x + w, y,

                x, y + h,
                x + w, y,
                x + w, y + h
            ]);
        }
        arr.push(animateArr);
    }

    return arr;
}

export { degToRad, radToDeg, hexToRGB, clipFrames };