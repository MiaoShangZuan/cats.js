import ARGBtoColor from'../ARGBtoColor.js';

/**
 * CatsJS-场景容器
 * 当前版本 0.3
 * 于2025年3月16日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
class Scene {
    constructor( color='#000000' ) {
        this.type = 'Scene';
        this.color = ARGBtoColor(color);
        this.element = [];
        this.ADD_MODEL_FUNC = undefined;
        this.SPRITE_TEXTURE_ARRAY = [];
        this.typeAddModelEvent = false;
        this.SPRITE_TEXTURE_LOAD_FUNC = undefined;
    }
    setColor( color='#000000' ) {
        this.color = ARGBtoColor(color);
    }
    setAddModelEvent( func ) {
        this.ADD_MODEL_FUNC = func;
        this.typeAddModelEvent = true;
    }
    setSpriteTexture( image ) {
        this.SPRITE_TEXTURE_ARRAY.push(image);
        this.SPRITE_TEXTURE_LOAD_FUNC?.(image);
    }
    getSpriteTexture( func ) {
        this.SPRITE_TEXTURE_LOAD_FUNC = func;
    }
    add( Object2D ) {
        if( this.element.indexOf(Object2D) == -1 ) {
            this.element.push(Object2D);
            this.ADD_MODEL_FUNC?.();
        }
    }
    remove( Object2D ) {
        const index = this.element.indexOf(Object2D);
        if( index != -1 ) this.element.splice( index, 1 );
    }
}

export default Scene;