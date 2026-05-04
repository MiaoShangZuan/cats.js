/**
 * 精灵图生成器
 * 当前版本 0.1.3
 * system texture unit 0~21
 * 于2025年7月15日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const { trunc, pow } = Math;

async function handleImages( images ) {
    const arr = [];
    for await(let image of images) {
        arr.push(image);
    }
    return arr;
}

class SpriteGenerator {
    constructor() {
        this._texture_pixel_unit_ = 450;
        this._texture_size_max_ = 9;
        this._texture_canvas_ = document.createElement('canvas');
        this._texture_canvas_.width = this._texture_canvas_.height = this._texture_pixel_unit_;
        this._texture_ctx_ = this._texture_canvas_.getContext('2d');
    }
    setTexturePixelUnit( value ) {
        this._texture_pixel_unit_ = value;
    }
    getMaps( element ) {
        const maps = [], videos = [];
        let s, video_i = 0;
        for(let texture of element) {
            s = texture.getSizeValue(this._texture_pixel_unit_);
            if(texture.mediaType == 'video') {
                texture.mapUnit = video_i + 16;
                video_i++;
                videos.push(texture);
            }
            else if(s <= this._texture_size_max_) {
                if(!maps[s-1]) maps[s-1] = [texture];
                else if(maps[s-1].indexOf(texture) == -1) maps[s-1].push(texture);
            }
        }
        for(let i=0; i<maps.length; i++) {
            if(!maps[i]) maps[i] = [];
        }
        return {maps, videos};
    }
    processingMaps( arr, n=0, s=0 ) {
        if(s+1 < this._texture_size_max_) {
            const maps = arr[n];
            if(maps.length > 0) {
                const count = trunc(maps[s].length*0.25);
                if(count > 0) {
                    let tex_obj;
                    for(let i=0; i<count; i++) {
                        tex_obj = { pixel_unit: s+2, element: [] };
                        for(let j=0; j<4; j++) {
                            tex_obj.element.push(maps[s][0]);
                            maps[s].splice(0, 1); // 消除原maps中的texture
                        }
                        if(!maps[s+1]) maps[s+1] = [tex_obj];
                        else maps[s+1].push(tex_obj);
                    }
                }
                s++;
                if(maps[s]) this.processingMaps(arr, n, s);
            }
        }
        else {
            const maps = arr[n], count = maps[s].length;
            let countK = 4;
            for(let i=0; i<=s; i++) {
                if(maps[i].length > 0) {
                    countK = 3;
                    break;
                }
            }
            if(count > countK) {
                const new_maps = [];
                for(let j=0; j<=s; j++) new_maps.push([]);
                for(let k=countK; k<count; k++) new_maps[s].push(maps[s][k]);
                maps[s].splice(countK, count-countK);
                arr.push(new_maps);
                n++;
                this.processingMaps(arr, n, s);
            }
        }
    }
    setSpriteSize( maps ) {
        const s = maps.length, count = maps[s-1].length, w = pow(2, s-1);
        let width = this._texture_pixel_unit_, height = this._texture_pixel_unit_, state = false, i = 0;
        while(i<s-1) {
            if(maps[i].length > 0) {
                state = true;
                i = s;
            }
            i++;
        }
        if(state) {
            if(count < 3) {
                width *= (count+1) * w;
                height *= w;
            }
            else {
                width *= 2 * w;
                height *= 2 * w;
            }
        }
        else {
            if(count < 4) {
                width *= count * w;
                height *= w;
            }
            else {
                width *= 2 * w;
                height *= 2 * w;
            }
        }
        
        // set texture canvas size
        this._texture_canvas_.width = width;
        this._texture_canvas_.height = height;
        this._texture_ctx_.imageSmoothingEnabled = false; // 关闭平滑
        // this._texture_ctx_.fillRect(0, 0, width, height); // 设置纯黑色画布背景
    }
    drawMap( index, texture, x0, y0 ) {
        if(texture.pixel_unit) {
            // 该图片由多张子图片拼接而成
            const w = pow(2, texture.pixel_unit-2) * this._texture_pixel_unit_;
            let x, y;
            for(let j=0; j<4; j++) {
                x = x0 + j % 2 * w;
                y = y0 + trunc(j/2) * w;
                this.drawMap(index, texture.element[j], x, y);
            }
        }
        else {
            const width = this._texture_canvas_.width,
            height = this._texture_canvas_.height,
            size = this._texture_pixel_unit_ * pow(2, texture.getSizeValue(this._texture_pixel_unit_)-1),
            w2 = size / width, h2 = size / height,
            x2 = x0 / width, y2 = (height-y0) / height;
            
            this._texture_ctx_.beginPath();
            this._texture_ctx_.drawImage(texture.media, x0, y0, size, size);
            this._texture_ctx_.closePath();
            texture.activate = true;
            texture.mapUnit = index+10;
            texture.uvmat.set([
                w2, 0, x2,
                0, h2, y2-h2,
                0, 0, 1
            ]);
        }
    }
    drawingMaps( index, maps, s, x0, y0 ) {
        if(s > 0) {
            const count = maps[s-1].length, w = pow(2, s-1) * this._texture_pixel_unit_;
            if(count > 0) {
                let x, y;
                for(let i=0; i<count; i++) {
                    x = x0 + i % 2 * w;
                    y = y0 + trunc(i/2) * w;
                    this.drawMap( index, maps[s-1][i], x, y );
                }
                x0 += count % 2 * w;
                y0 += trunc(count / 2) * w;
            }
            this.drawingMaps(index, maps, s-1, x0, y0);
        }
    }
    render( index, maps ) {
        this.setSpriteSize(maps);
        this._texture_ctx_.clearRect(0, 0, this._texture_canvas_.width, this._texture_canvas_.height);
        
        // 绘制最大层的纹理
        const s = maps.length, count = maps[s-1].length, w = pow(2, s-1) * this._texture_pixel_unit_;
        let x, y;
        if(this._texture_canvas_.width == this._texture_canvas_.height) {
            for(let i=0; i<count; i++) {
                x = i % 2 * w;
                y = trunc(i/2) * w;
                this.drawMap( index, maps[s-1][i], x, y );
            }
        }
        else {
            for(let i=0; i<count; i++) {
                x = i * w;
                y = 0;
                this.drawMap( index, maps[s-1][i], x, y );
            }
        }
        // 按从大到小绘制其他层的纹理
        x += w;
        this.drawingMaps(index, maps, s-1, x, y);
        // draw end
        
        return new Promise(
            resolve => {
                // 获取图片
                const image = new Image();
                image.src = this._texture_canvas_.toDataURL('image/png');
                image.onload = ()=>{resolve(image)};
            }
        );
    }
    createSprite( element ) {
        const data = this.getMaps(element);
        const arr = [data.maps];
        this.processingMaps(arr); // 整理maps
        
        const images = [];
        for(let i=0; i<arr.length; i++) {
            if(arr[i].length > 0) images.push(this.render(i, arr[i]));
        }
        return new Promise(
            resolve => {
                handleImages(images).then(response => resolve({images: response, videos: data.videos}));
                //console.log(resolve);
            }
        );
    }
}

export default SpriteGenerator;