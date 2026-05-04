const degToRadRatio = 0.017453292519943295;
const radToDegRatio = 57.29577951308232;

/**
 * 
 * 2026.05.02
 */



function degToRad( deg ) {
    return deg * degToRadRatio;
}

function radToDeg( rad ) {
    return rad * radToDegRatio;
}

export { degToRad, radToDeg };