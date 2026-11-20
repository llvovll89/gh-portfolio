/** decodeURIComponent 가 리터럴 '%' 등으로 throw 하는 경우 원문을 그대로 돌려줌 */
export function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}
