import { hslToHex, normalizeHueAngle } from "../Color.js";
export class ColorPickerModel {
    isDarkTheme;
    static PALETTE_SIZE = 8;
    paletteSchema;
    variantIndexBySL = new Map();
    constructor(isDarkTheme) {
        this.isDarkTheme = isDarkTheme;
        const { hueShift: hueWindowH, saturation: hueWindowS, lightness: hueWindowL } = this.getHueWindowSchema();
        this.paletteSchema = Object.freeze({
            hueShift: [hueWindowH, 0, 0, -1, -1, 0, 0, 0],
            saturation: [hueWindowS, 100, 54, 36, 27, 25, 28, 31],
            lightness: [hueWindowL, 87, 77, 66, 55, 46, 41, 36],
        });
    }
    getHueWindowColor(hue) {
        const { saturation, lightness } = this.getHueWindowSchema();
        return hslToHex({ h: hue, s: saturation, l: lightness });
    }
    getHueWindowSchema() {
        return {
            hueShift: 0,
            saturation: this.isDarkTheme ? 50 : 100,
            lightness: this.isDarkTheme ? 50 : 40,
        };
    }
    getColor(hue, variant) {
        const h = normalizeHueAngle(hue + this.paletteSchema.hueShift[variant]);
        const s = this.paletteSchema.saturation[variant];
        const l = this.paletteSchema.lightness[variant];
        return { h, s, l };
    }
    getVariantIndexBySL(saturation, lightness) {
        if (this.variantIndexBySL.size === 0) {
            for (let i = 0; i < ColorPickerModel.PALETTE_SIZE; i++) {
                this.variantIndexBySL.set(this.slKey(this.paletteSchema.saturation[i], this.paletteSchema.lightness[i]), i);
            }
        }
        return this.variantIndexBySL.get(this.slKey(saturation, lightness));
    }
    slKey(s, l) {
        return `${s}_${l}`;
    }
}
//# sourceMappingURL=ColorPickerModel.js.map