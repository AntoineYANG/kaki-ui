const NULLS = [false, null, undefined];

export const firstExisted = function firstExisted<T>(arr: Array<T>): T | null {
    for (const e of arr) {
        if (NULLS.every(n => n !== e)) {
            return e;
        }
    }
    return null;
}
