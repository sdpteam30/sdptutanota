export function cloneInlineImages(inlineImages) {
    const newMap = new Map();
    for (const [k, v] of inlineImages.entries()) {
        const blob = new Blob([v.blob]);
        const objectUrl = URL.createObjectURL(blob);
        newMap.set(k, {
            cid: v.cid,
            objectUrl,
            blob,
        });
    }
    return newMap;
}
export function revokeInlineImages(inlineImages) {
    for (const v of inlineImages.values()) {
        URL.revokeObjectURL(v.objectUrl);
    }
}
//# sourceMappingURL=inlineImagesUtils.js.map