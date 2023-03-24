export const mergeArrayWithObject = (arr, obj) => arr && arr.map((t) => (t.id === obj.id ? obj : t))
