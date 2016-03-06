export default function ensureArray(A) {
    return Array.isArray(A) ? A : [A];
}
