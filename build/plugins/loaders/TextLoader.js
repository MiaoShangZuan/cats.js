import FileLoader from './FileLoader.js';

/**
 * 文本文件加载器
 * 当前版本 0.1
 * 于2025年7月7日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
class TextLoader extends FileLoader {
    constructor() {
        super();
        this.type = 'TextLoader';
        this.textDecoder = new TextDecoder('utf-8');
    }
    loadAsync( url ) {
        return new Promise(
            (resolve) => {
                this.loadFile(
                    url,
                    (response) => {
                        const binary = new Uint8Array(response);
                        resolve( this.textDecoder.decode(binary) );
                    }
                );
            }
        );
    }
}

export default TextLoader;