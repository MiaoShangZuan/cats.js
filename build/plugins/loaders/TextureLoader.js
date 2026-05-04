import { RawTexture } from '../../model/Object2D.js';

/**
 * 贴图加载器
 * 当前版本 0.1.3
 * 于2025年3月19日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
class TextureLoader {
    constructor() {
        this.type = 'TextureLoader';
    }
    loadAsync( url ) {
        const arr = JSON.parse(`["${url.replace(/\./g,'","')}"]`), extension = arr[arr.length-1].toLowerCase();
        return new Promise(
            resolve => {
                if(extension=='jpeg' || extension=='jpg' || extension=='png' || extension=='gif' || extension=='webp' || extension=='bmp') {
                    const image = new Image();
                    image.crossOrigin = 'anonymous';
                    image.src = url;
                    image.onload = ()=>resolve(new RawTexture(image));
                }
                else if(extension=='mp4' || extension=='m4v' || extension=='webm') {
                    const video = document.createElement('video');
                    video.crossOrigin = 'anonymous';
                    video.muted = true;
                    video.src = url;
                    video.onloadeddata = ()=>{
                        video.width = video.videoWidth;
                        video.height = video.videoHeight;
                        resolve(new RawTexture(video));
                    };
                }
            }
        );
    }
    /*
    load( url ) {
        const image = new Image();
        image.src = url;
        return new RawTexture(image);
    }*/
}

export default TextureLoader;