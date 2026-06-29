/**
 * 加载文件模块
 * 当前版本 0.1
 * 于2025年5月10日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
class FileLoader {
    constructor() {
        this.type = 'FileLoader';
    }
    loadFile( path, resolve ) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
            if(xhr.status === 200) {
                const binary = xhr.response;
                resolve(binary);
            }
        }
        xhr.send();
    }
    loadFileAsync( path ) {
        return new Promise(
            (resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', path, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = () => {
                    if(xhr.status === 200) {
                        const binary = xhr.response;
                        resolve(binary);
                    }
                }
                xhr.send();
            }
        );
    }
}

export default FileLoader;