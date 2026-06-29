/**
 * 获取Object2D模型的属性值
 * @param {object} Object2D 参数模型 
 * @param {string} attribute 属性值对应的属性路径
 * @returns 返回 attribute 路径对应的属性值
 */
function getAttributeValue( Object2D, attribute ) {
    const key_data = JSON.parse( '["'+attribute.replace( /\./g, '","' )+'"]' );
    let current = Object2D;
    for( let i = 0; i < key_data.length; i++ ) {
        current = current[key_data[i]];
    }
    return current;
}

/**
 * 排序
 * @param {object} element 原数组
 * @param {string} attribute 排序规则
 * @param {number} type 排序顺序，1为从小到大，-1为从大到小
 * @returns 返回排序后的数组
 */
function sort( element, attribute, type=1 ) {
    const key_array = new Array(),
    key_assemble = new Object(),
    new_element = new Array();
    let key_value = 0, key;
    element.forEach(
        ( Object2D )=>{
            key_value = getAttributeValue( Object2D, attribute );
            key_array.push(key_value);
            if( key_assemble['key_'+key_value] == undefined ) key_assemble['key_'+key_value] = [Object2D];
            else key_assemble['key_'+key_value].push(Object2D);
        }
    );
    key_array.sort((a,b)=>{return type*(a-b)}).forEach(
        ( value )=>{
            if( value != key ) {
                key_assemble['key_'+value].forEach(
                    ( Object2D )=>{
                        new_element.push(Object2D);
                    }
                );
                key = value;
            }
        }
    );
    return new_element;
}

export default sort;