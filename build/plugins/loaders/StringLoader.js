import { extract } from '../../Functions.js';
import { RawTexture } from '../../model/Object2D.js';

/**
 * 字符串加载器
 * 当前版本 0.1
 * 于2025年5月1日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const CANVAS_SYSTEM = document.createElement('canvas');
const DRAW_SYSTEM = CANVAS_SYSTEM.getContext( '2d', { willReadFrequently: true } );
const round = Math.round;

class StringLoader {
    constructor() {
        this.type = 'StringLoader';
        this.fonts = [
            'sans-serif',
            'Arial',
            'Helvetica',
            'Verdana',
            'Tahoma',
            'Trebuchet MS',

            'serif',
            'Times New Roman',
            'Georgia',
            'Palatino',

            'monospace',
            'Courier New',
            'Lucida Console',
            'Monaco',
            'Consolas',

            'cursive',
            'Comic Sans MS',
            'Brush Script MT', //部分系统可能无此字体

            'fantasy',
            'Impact',
            'Papyrus', // 较少跨平台支持

            'FangSong', // "FangSong", "SimSun", serif
            '仿宋', // "仿宋", "宋体", serif
            'Microsoft YaHei',
            '微软雅黑' // "Microsoft YaHei", "微软雅黑", sans-serif

            //'system-ui',
            //'emoji',
            //'math'
        ];
    }
    getFont( fontName ) {
        const str = fontName.toLowerCase();
        let finalFont = undefined;
        for(let item of this.fonts) {
            if( item.toLowerCase() == str ) {
                switch(item) {
                    case 'Airal':
                        finalFont = 'Airal, sans-serif';
                        break;
                    case 'Helvetica':
                        finalFont = 'Helvetica, sans-serif';
                        break;
                    case 'Verdana':
                        finalFont = 'Verdana, sans-serif';
                        break;
                    case 'Tahoma':
                        finalFont = 'Tahoma, sans-serif';
                        break;
                    case 'Trebuchet MS':
                        finalFont = '"Trebuchet MS", sans-serif';
                        break;
                    
                    case 'Times New Roman':
                        finalFont = '"Times New Roman", serif';
                        break;
                    case 'Georgia':
                        finalFont = 'Georgia, serif';
                        break;
                    case 'Palatino':
                        finalFont = 'Palatino, serif';
                        break;
                    
                    case 'Courier New':
                        finalFont = '"Courier New", monospace';
                        break;
                    case 'Lucida Console':
                        finalFont = '"Lucida Console", monospace';
                        break;
                    case 'Monaco':
                        finalFont = 'Monaco, monospace';
                        break;
                    case 'Consolas':
                        finalFont = 'Consolas, monospace';
                        break;
                    
                    case 'Comic Sans MS':
                        finalFont = '"Comic Sans MS", cursive';
                        break;
                    case 'Brush Script MT':
                        finalFont = '"Brush Script MT", cursive';
                        break;
                    
                    case 'Impact':
                        finalFont = 'Impact, fantasy';
                        break;
                    case 'Papyrus':
                        finalFont = 'Papyrus, fantasy';
                        break;

                    case 'FangSong':
                        // "FangSong", "SimSun", serif
                        finalFont = '"FangSong"';
                        break;
                    case '仿宋':
                        // "仿宋", "宋体", serif
                        finalFont = '"仿宋"';
                        break;
                    case 'Microsoft YaHei':
                        finalFont = '"Microsoft YaHei"';
                        break;
                    case '微软雅黑':
                        finalFont = '"微软雅黑"';
                        break;
                    
                    default:
                        finalFont = item;
                }
                break;
            }
        }
        return finalFont;
    }
    queryFont( fontName ) {
        const str = fontName.toLowerCase();
        let state = false;
        for(let item of this.fonts) {
            if( item.toLowerCase() == str ) {
                state = true;
                break;
            }
        }
        return state;
    }
    addFont( fontName, fontPath ) {
        if(!this.queryFont(fontName)) {
            // 创建 FontFace 对象
            const mFontFace = new FontFace(fontName, `url(${fontPath})`);

            // 加载字体
            mFontFace.load()
            .then(
                font => {
                    // 将字体添加到 document.fonts
                    document.fonts.add(font);

                    // 已加载字体文件
                    this.fonts.push(fontName);
                }
            )
            .catch(error => console.error('字体加载失败：', error));
        }
    }
    fontReady( resolve ) {
        document.fonts.ready.then(
            () => {
                resolve?.();
            }
        );
    }
    createAsync( data ) {
        const attribute = {
            text: 'Hello LiaoJS!',
            size: 40,
            style: 'normal', // normal or italic or oblique
            weight: 'normal', // normal or bold or bolder or lighter or 100-900
            variant: 'normal', // normal or small-caps
            font: 'sans-serif',
            color: '#7b68ee',
            paddingW: 0,
            paddingH: 0,
            shadow: false,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffsetX: 6,
            shadowOffsetY: 6,
            shadowBlur: 8,
            outline: false,
            outlines: []
        };
        extract( data, attribute, [ 'outlines' ] );
        if(!this.queryFont(attribute.font)) attribute.font = 'sans-serif';
        else attribute.font = this.getFont(attribute.font);

        DRAW_SYSTEM.font = `${attribute.variant} ${attribute.style} ${attribute.weight} ${attribute.size}px ${attribute.font}`;

        const metrics = DRAW_SYSTEM.measureText(attribute.text),
        font_w = round(metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) + attribute.paddingW * 2,
        font_h = round(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + attribute.paddingH * 2;

        CANVAS_SYSTEM.width = font_w;
        CANVAS_SYSTEM.height = font_h;
        DRAW_SYSTEM.clearRect(0, 0, font_w, font_h);

        DRAW_SYSTEM.textAlign = 'start';
        DRAW_SYSTEM.textBaseline = 'top';

        DRAW_SYSTEM.font = `${attribute.variant} ${attribute.style} ${attribute.weight} ${attribute.size}px ${attribute.font}`;

        if(attribute.shadow) {
            DRAW_SYSTEM.shadowColor = attribute.shadowColor;
            DRAW_SYSTEM.shadowOffsetX = attribute.shadowOffsetX;
            DRAW_SYSTEM.shadowOffsetY = attribute.shadowOffsetY;
            DRAW_SYSTEM.shadowBlur = attribute.shadowBlur;
        }

        const font_x = attribute.paddingW, font_y = attribute.paddingH;

        DRAW_SYSTEM.fillStyle = attribute.color;
        DRAW_SYSTEM.fillText(attribute.text, font_x, font_y);
        
        if(attribute.outline) {
            attribute.outlines.forEach(
                outline => {
                    const outline_data = { spacing: [2,2], width: 1, color: '#868686' };
                    if(outline.spacing == undefined) outline.spacing = outline_data.spacing;
                    if(outline.width == undefined) outline.width = outline_data.width;
                    if(outline.color == undefined) outline.color = outline_data.color;

                    DRAW_SYSTEM.setLineDash(outline.spacing);

                    DRAW_SYSTEM.strokeStyle = outline.color;
                    DRAW_SYSTEM.lineWidth = outline.width;
                    DRAW_SYSTEM.strokeText(attribute.text, font_x, font_y);

                    DRAW_SYSTEM.setLineDash([]);
                }
            );
        }

        const url = CANVAS_SYSTEM.toDataURL('image/png');

        return new Promise(
            (resolve) => {
                const new_image = new Image();
                new_image.src = url;
                new_image.onload = () => resolve(new RawTexture(new_image));
            }
        );
    }
}

export default StringLoader;