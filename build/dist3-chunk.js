import { arrayEquals, assertNotNull, base64ToBase64Url, base64ToUint8Array, byteArraysToBytes, bytesToByteArrays, callWebAssemblyFunctionWithArguments, concat, hexToUint8Array, int8ArrayToBase64, mutableSecureFree, secureFree, stringToUtf8Uint8Array, uint8ArrayToArrayBuffer, uint8ArrayToBase64, uint8ArrayToHex } from "./dist2-chunk.js";
import { CryptoError } from "./CryptoError-chunk.js";

//#region packages/tutanota-crypto/dist/internal/sjcl.js
/** @fileOverview Javascript cryptography implementation.
*
* Crush to remove comments, shorten variable names and
* generally reduce transmission size.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/**
* The Stanford Javascript Crypto Library, top-level namespace.
* @namespace
* @type any
*/
var sjcl = {
	cipher: {},
	hash: {},
	keyexchange: {},
	mode: {},
	misc: {},
	codec: {},
	exception: {
		corrupt: function(message) {
			this.toString = function() {
				return "CORRUPT: " + this.message;
			};
			this.message = message;
		},
		invalid: function(message) {
			this.toString = function() {
				return "INVALID: " + this.message;
			};
			this.message = message;
		},
		bug: function(message) {
			this.toString = function() {
				return "BUG: " + this.message;
			};
			this.message = message;
		},
		notReady: function(message) {
			this.toString = function() {
				return "NOT READY: " + this.message;
			};
			this.message = message;
		}
	}
};
/** @fileOverview Low-level AES implementation.
*
* This file contains a low-level implementation of AES, optimized for
* size and for efficiency on several browsers.  It is based on
* OpenSSL's aes_core.c, a public-domain implementation by Vincent
* Rijmen, Antoon Bosselaers and Paulo Barreto.
*
* An older version of this implementation is available in the public
* domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
* Stanford University 2008-2010 and BSD-licensed for liability
* reasons.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/**
* Schedule out an AES key for both encryption and decryption.  This
* is a low-level class.  Use a cipher mode to do bulk encryption.
*
* @constructor
* @param {Array} key The key as an array of 4, 6 or 8 words.
*/
sjcl.cipher.aes = function(key) {
	if (!this._tables[0][0][0]) this._precompute();
	var i, j, tmp, encKey, decKey, sbox = this._tables[0][4], decTable = this._tables[1], keyLen = key.length, rcon = 1;
	if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) throw new sjcl.exception.invalid("invalid aes key size");
	this._key = [encKey = key.slice(0), decKey = []];
	for (i = keyLen; i < 4 * keyLen + 28; i++) {
		tmp = encKey[i - 1];
		if (i % keyLen === 0 || keyLen === 8 && i % keyLen === 4) {
			tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];
			if (i % keyLen === 0) {
				tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
				rcon = rcon << 1 ^ (rcon >> 7) * 283;
			}
		}
		encKey[i] = encKey[i - keyLen] ^ tmp;
	}
	for (j = 0; i; j++, i--) {
		tmp = encKey[j & 3 ? i : i - 4];
		if (i <= 4 || j < 4) decKey[j] = tmp;
else decKey[j] = decTable[0][sbox[tmp >>> 24]] ^ decTable[1][sbox[tmp >> 16 & 255]] ^ decTable[2][sbox[tmp >> 8 & 255]] ^ decTable[3][sbox[tmp & 255]];
	}
};
sjcl.cipher.aes.prototype = {
	encrypt: function(data) {
		return this._crypt(data, 0);
	},
	decrypt: function(data) {
		return this._crypt(data, 1);
	},
	_tables: [[
		[],
		[],
		[],
		[],
		[]
	], [
		[],
		[],
		[],
		[],
		[]
	]],
	_precompute: function() {
		var encTable = this._tables[0], decTable = this._tables[1], sbox = encTable[4], sboxInv = decTable[4], i, x, xInv, d = [], th = [], x2, x4, x8, s, tEnc, tDec;
		for (i = 0; i < 256; i++) th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
		for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
			s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
			s = s >> 8 ^ s & 255 ^ 99;
			sbox[x] = s;
			sboxInv[s] = x;
			x8 = d[x4 = d[x2 = d[x]]];
			tDec = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
			tEnc = d[s] * 257 ^ s * 16843008;
			for (i = 0; i < 4; i++) {
				encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
				decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
			}
		}
		for (i = 0; i < 5; i++) {
			encTable[i] = encTable[i].slice(0);
			decTable[i] = decTable[i].slice(0);
		}
	},
	_crypt: function(input, dir) {
		if (input.length !== 4) throw new sjcl.exception.invalid("invalid aes block size");
		var key = this._key[dir], a = input[0] ^ key[0], b = input[dir ? 3 : 1] ^ key[1], c = input[2] ^ key[2], d = input[dir ? 1 : 3] ^ key[3], a2, b2, c2, nInnerRounds = key.length / 4 - 2, i, kIndex = 4, out = [
			0,
			0,
			0,
			0
		], table = this._tables[dir], t0 = table[0], t1 = table[1], t2 = table[2], t3 = table[3], sbox = table[4];
		for (i = 0; i < nInnerRounds; i++) {
			a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
			b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
			c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
			d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
			kIndex += 4;
			a = a2;
			b = b2;
			c = c2;
		}
		for (i = 0; i < 4; i++) {
			out[dir ? 3 & -i : i] = sbox[a >>> 24] << 24 ^ sbox[b >> 16 & 255] << 16 ^ sbox[c >> 8 & 255] << 8 ^ sbox[d & 255] ^ key[kIndex++];
			a2 = a;
			a = b;
			b = c;
			c = d;
			d = a2;
		}
		return out;
	}
};
/** @fileOverview Arrays of bits, encoded as arrays of Numbers.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/**
* Arrays of bits, encoded as arrays of Numbers.
* @namespace
* @description
* <p>
* These objects are the currency accepted by SJCL's crypto functions.
* </p>
*
* <p>
* Most of our crypto primitives operate on arrays of 4-byte words internally,
* but many of them can take arguments that are not a multiple of 4 bytes.
* This library encodes arrays of bits (whose size need not be a multiple of 8
* bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
* array of words, 32 bits at a time.  Since the words are double-precision
* floating point numbers, they fit some extra data.  We use this (in a private,
* possibly-changing manner) to encode the number of bits actually  present
* in the last word of the array.
* </p>
*
* <p>
* Because bitwise ops clear this out-of-band data, these arrays can be passed
* to ciphers like AES which want arrays of words.
* </p>
*/
sjcl.bitArray = {
	bitSlice: function(a, bstart, bend) {
		a = sjcl.bitArray._shiftRight(a.slice(bstart / 32), 32 - (bstart & 31)).slice(1);
		return bend === undefined ? a : sjcl.bitArray.clamp(a, bend - bstart);
	},
	extract: function(a, bstart, blength) {
		var x, sh = Math.floor(-bstart - blength & 31);
		if ((bstart + blength - 1 ^ bstart) & -32) x = a[bstart / 32 | 0] << 32 - sh ^ a[bstart / 32 + 1 | 0] >>> sh;
else x = a[bstart / 32 | 0] >>> sh;
		return x & (1 << blength) - 1;
	},
	concat: function(a1, a2) {
		if (a1.length === 0 || a2.length === 0) return a1.concat(a2);
		var last = a1[a1.length - 1], shift = sjcl.bitArray.getPartial(last);
		if (shift === 32) return a1.concat(a2);
else return sjcl.bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
	},
	bitLength: function(a) {
		var l = a.length, x;
		if (l === 0) return 0;
		x = a[l - 1];
		return (l - 1) * 32 + sjcl.bitArray.getPartial(x);
	},
	clamp: function(a, len) {
		if (a.length * 32 < len) return a;
		a = a.slice(0, Math.ceil(len / 32));
		var l = a.length;
		len = len & 31;
		if (l > 0 && len) a[l - 1] = sjcl.bitArray.partial(len, a[l - 1] & 2147483648 >> len - 1, 1);
		return a;
	},
	partial: function(len, x, _end) {
		if (len === 32) return x;
		return (_end ? x | 0 : x << 32 - len) + len * 1099511627776;
	},
	getPartial: function(x) {
		return Math.round(x / 1099511627776) || 32;
	},
	equal: function(a, b) {
		if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) return false;
		var x = 0, i;
		for (i = 0; i < a.length; i++) x |= a[i] ^ b[i];
		return x === 0;
	},
	_shiftRight: function(a, shift, carry, out) {
		var i, last2 = 0, shift2;
		if (out === undefined) out = [];
		for (; shift >= 32; shift -= 32) {
			out.push(carry);
			carry = 0;
		}
		if (shift === 0) return out.concat(a);
		for (i = 0; i < a.length; i++) {
			out.push(carry | a[i] >>> shift);
			carry = a[i] << 32 - shift;
		}
		last2 = a.length ? a[a.length - 1] : 0;
		shift2 = sjcl.bitArray.getPartial(last2);
		out.push(sjcl.bitArray.partial(shift + shift2 & 31, shift + shift2 > 32 ? carry : out.pop(), 1));
		return out;
	},
	_xor4: function(x, y) {
		return [
			x[0] ^ y[0],
			x[1] ^ y[1],
			x[2] ^ y[2],
			x[3] ^ y[3]
		];
	},
	byteswapM: function(a) {
		var i, v, m = 65280;
		for (i = 0; i < a.length; ++i) {
			v = a[i];
			a[i] = v >>> 24 | v >>> 8 & m | (v & m) << 8 | v << 24;
		}
		return a;
	}
};
/** @fileOverview Bit array codec implementations.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/**
* UTF-8 strings
* @namespace
*/
sjcl.codec.utf8String = {
	fromBits: function(arr) {
		var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
		for (i = 0; i < bl / 8; i++) {
			if ((i & 3) === 0) tmp = arr[i / 4];
			out += String.fromCharCode(tmp >>> 8 >>> 8 >>> 8);
			tmp <<= 8;
		}
		return decodeURIComponent(escape(out));
	},
	toBits: function(str) {
		str = unescape(encodeURIComponent(str));
		var out = [], i, tmp = 0;
		for (i = 0; i < str.length; i++) {
			tmp = tmp << 8 | str.charCodeAt(i);
			if ((i & 3) === 3) {
				out.push(tmp);
				tmp = 0;
			}
		}
		if (i & 3) out.push(sjcl.bitArray.partial(8 * (i & 3), tmp));
		return out;
	}
};
/** @fileOverview Bit array codec implementations.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/** @fileOverview Bit array codec implementations.
*
* @author Nils Kenneweg
*/
/**
* Base32 encoding/decoding
* @namespace
*/
sjcl.codec.base32 = {
	_chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
	_hexChars: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
	BITS: 32,
	BASE: 5,
	REMAINING: 27,
	fromBits: function(arr, _noEquals, _hex) {
		var BITS = sjcl.codec.base32.BITS, BASE = sjcl.codec.base32.BASE, REMAINING = sjcl.codec.base32.REMAINING;
		var out = "", i, bits = 0, c = sjcl.codec.base32._chars, ta = 0, bl = sjcl.bitArray.bitLength(arr);
		if (_hex) c = sjcl.codec.base32._hexChars;
		for (i = 0; out.length * BASE < bl;) {
			out += c.charAt((ta ^ arr[i] >>> bits) >>> REMAINING);
			if (bits < BASE) {
				ta = arr[i] << BASE - bits;
				bits += REMAINING;
				i++;
			} else {
				ta <<= BASE;
				bits -= BASE;
			}
		}
		while (out.length & 7 && !_noEquals) out += "=";
		return out;
	},
	toBits: function(str, _hex) {
		str = str.replace(/\s|=/g, "").toUpperCase();
		var BITS = sjcl.codec.base32.BITS, BASE = sjcl.codec.base32.BASE, REMAINING = sjcl.codec.base32.REMAINING;
		var out = [], i, bits = 0, c = sjcl.codec.base32._chars, ta = 0, x, format = "base32";
		if (_hex) {
			c = sjcl.codec.base32._hexChars;
			format = "base32hex";
		}
		for (i = 0; i < str.length; i++) {
			x = c.indexOf(str.charAt(i));
			if (x < 0) {
				if (!_hex) try {
					return sjcl.codec.base32hex.toBits(str);
				} catch (e) {}
				throw new sjcl.exception.invalid("this isn't " + format + "!");
			}
			if (bits > REMAINING) {
				bits -= REMAINING;
				out.push(ta ^ x >>> bits);
				ta = x << BITS - bits;
			} else {
				bits += BASE;
				ta ^= x << BITS - bits;
			}
		}
		if (bits & 56) out.push(sjcl.bitArray.partial(bits & 56, ta, 1));
		return out;
	}
};
sjcl.codec.base32hex = {
	fromBits: function(arr, _noEquals) {
		return sjcl.codec.base32.fromBits(arr, _noEquals, 1);
	},
	toBits: function(str) {
		return sjcl.codec.base32.toBits(str, 1);
	}
};
/** @fileOverview Bit array codec implementations.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/**
* Base64 encoding/decoding
* @namespace
*/
sjcl.codec.base64 = {
	_chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	fromBits: function(arr, _noEquals, _url) {
		var out = "", i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, bl = sjcl.bitArray.bitLength(arr);
		if (_url) c = c.substring(0, 62) + "-_";
		for (i = 0; out.length * 6 < bl;) {
			out += c.charAt((ta ^ arr[i] >>> bits) >>> 26);
			if (bits < 6) {
				ta = arr[i] << 6 - bits;
				bits += 26;
				i++;
			} else {
				ta <<= 6;
				bits -= 6;
			}
		}
		while (out.length & 3 && !_noEquals) out += "=";
		return out;
	},
	toBits: function(str, _url) {
		str = str.replace(/\s|=/g, "");
		var out = [], i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, x;
		if (_url) c = c.substring(0, 62) + "-_";
		for (i = 0; i < str.length; i++) {
			x = c.indexOf(str.charAt(i));
			if (x < 0) throw new sjcl.exception.invalid("this isn't base64!");
			if (bits > 26) {
				bits -= 26;
				out.push(ta ^ x >>> bits);
				ta = x << 32 - bits;
			} else {
				bits += 6;
				ta ^= x << 32 - bits;
			}
		}
		if (bits & 56) out.push(sjcl.bitArray.partial(bits & 56, ta, 1));
		return out;
	}
};
/** @fileOverview Javascript SHA-256 implementation.
*
* An older version of this implementation is available in the public
* domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
* Stanford University 2008-2010 and BSD-licensed for liability
* reasons.
*
* Special thanks to Aldo Cortesi for pointing out several bugs in
* this code.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/**
* Context for a SHA-256 operation in progress.
* @constructor
*/
sjcl.hash.sha256 = function(hash) {
	if (!this._key[0]) this._precompute();
	if (hash) {
		this._h = hash._h.slice(0);
		this._buffer = hash._buffer.slice(0);
		this._length = hash._length;
	} else this.reset();
};
/**
* Hash a string or an array of words.
* @static
* @param {bitArray|String} data the data to hash.
* @return {bitArray} The hash value, an array of 16 big-endian words.
*/
sjcl.hash.sha256.hash = function(data) {
	return new sjcl.hash.sha256().update(data).finalize();
};
sjcl.hash.sha256.prototype = {
	blockSize: 512,
	reset: function() {
		this._h = this._init.slice(0);
		this._buffer = [];
		this._length = 0;
		return this;
	},
	update: function(data) {
		if (typeof data === "string") data = sjcl.codec.utf8String.toBits(data);
		var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
		if (nl > 9007199254740991) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
		if (typeof Uint32Array !== "undefined") {
			var c = new Uint32Array(b);
			var j = 0;
			for (i = 512 + ol - (512 + ol & 511); i <= nl; i += 512) {
				this._block(c.subarray(16 * j, 16 * (j + 1)));
				j += 1;
			}
			b.splice(0, 16 * j);
		} else for (i = 512 + ol - (512 + ol & 511); i <= nl; i += 512) this._block(b.splice(0, 16));
		return this;
	},
	finalize: function() {
		var i, b = this._buffer, h = this._h;
		b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
		for (i = b.length + 2; i & 15; i++) b.push(0);
		b.push(Math.floor(this._length / 4294967296));
		b.push(this._length | 0);
		while (b.length) this._block(b.splice(0, 16));
		this.reset();
		return h;
	},
	_init: [],
	_key: [],
	_precompute: function() {
		var i = 0, prime = 2, factor, isPrime;
		function frac(x) {
			return (x - Math.floor(x)) * 4294967296 | 0;
		}
		for (; i < 64; prime++) {
			isPrime = true;
			for (factor = 2; factor * factor <= prime; factor++) if (prime % factor === 0) {
				isPrime = false;
				break;
			}
			if (isPrime) {
				if (i < 8) this._init[i] = frac(Math.pow(prime, .5));
				this._key[i] = frac(Math.pow(prime, .3333333333333333));
				i++;
			}
		}
	},
	_block: function(w) {
		var i, tmp, a, b, h = this._h, k = this._key, h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3], h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];
		for (i = 0; i < 64; i++) {
			if (i < 16) tmp = w[i];
else {
				a = w[i + 1 & 15];
				b = w[i + 14 & 15];
				tmp = w[i & 15] = (a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) + (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) + w[i & 15] + w[i + 9 & 15] | 0;
			}
			tmp = tmp + h7 + (h4 >>> 6 ^ h4 >>> 11 ^ h4 >>> 25 ^ h4 << 26 ^ h4 << 21 ^ h4 << 7) + (h6 ^ h4 & (h5 ^ h6)) + k[i];
			h7 = h6;
			h6 = h5;
			h5 = h4;
			h4 = h3 + tmp | 0;
			h3 = h2;
			h2 = h1;
			h1 = h0;
			h0 = tmp + (h1 & h2 ^ h3 & (h1 ^ h2)) + (h1 >>> 2 ^ h1 >>> 13 ^ h1 >>> 22 ^ h1 << 30 ^ h1 << 19 ^ h1 << 10) | 0;
		}
		h[0] = h[0] + h0 | 0;
		h[1] = h[1] + h1 | 0;
		h[2] = h[2] + h2 | 0;
		h[3] = h[3] + h3 | 0;
		h[4] = h[4] + h4 | 0;
		h[5] = h[5] + h5 | 0;
		h[6] = h[6] + h6 | 0;
		h[7] = h[7] + h7 | 0;
	}
};
/** @fileOverview Javascript SHA-512 implementation.
*
* This implementation was written for CryptoJS by Jeff Mott and adapted for
* SJCL by Stefan Thomas.
*
* CryptoJS (c) 2009–2012 by Jeff Mott. All rights reserved.
* Released with New BSD License
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
* @author Jeff Mott
* @author Stefan Thomas
*/
/**
* Context for a SHA-512 operation in progress.
* @constructor
*/
sjcl.hash.sha512 = function(hash) {
	if (!this._key[0]) this._precompute();
	if (hash) {
		this._h = hash._h.slice(0);
		this._buffer = hash._buffer.slice(0);
		this._length = hash._length;
	} else this.reset();
};
/**
* Hash a string or an array of words.
* @static
* @param {bitArray|String} data the data to hash.
* @return {bitArray} The hash value, an array of 16 big-endian words.
*/
sjcl.hash.sha512.hash = function(data) {
	return new sjcl.hash.sha512().update(data).finalize();
};
sjcl.hash.sha512.prototype = {
	blockSize: 1024,
	reset: function() {
		this._h = this._init.slice(0);
		this._buffer = [];
		this._length = 0;
		return this;
	},
	update: function(data) {
		if (typeof data === "string") data = sjcl.codec.utf8String.toBits(data);
		var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
		if (nl > 9007199254740991) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
		if (typeof Uint32Array !== "undefined") {
			var c = new Uint32Array(b);
			var j = 0;
			for (i = 1024 + ol - (1024 + ol & 1023); i <= nl; i += 1024) {
				this._block(c.subarray(32 * j, 32 * (j + 1)));
				j += 1;
			}
			b.splice(0, 32 * j);
		} else for (i = 1024 + ol - (1024 + ol & 1023); i <= nl; i += 1024) this._block(b.splice(0, 32));
		return this;
	},
	finalize: function() {
		var i, b = this._buffer, h = this._h;
		b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
		for (i = b.length + 4; i & 31; i++) b.push(0);
		b.push(0);
		b.push(0);
		b.push(Math.floor(this._length / 4294967296));
		b.push(this._length | 0);
		while (b.length) this._block(b.splice(0, 32));
		this.reset();
		return h;
	},
	_init: [],
	_initr: [
		12372232,
		13281083,
		9762859,
		1914609,
		15106769,
		4090911,
		4308331,
		8266105
	],
	_key: [],
	_keyr: [
		2666018,
		15689165,
		5061423,
		9034684,
		4764984,
		380953,
		1658779,
		7176472,
		197186,
		7368638,
		14987916,
		16757986,
		8096111,
		1480369,
		13046325,
		6891156,
		15813330,
		5187043,
		9229749,
		11312229,
		2818677,
		10937475,
		4324308,
		1135541,
		6741931,
		11809296,
		16458047,
		15666916,
		11046850,
		698149,
		229999,
		945776,
		13774844,
		2541862,
		12856045,
		9810911,
		11494366,
		7844520,
		15576806,
		8533307,
		15795044,
		4337665,
		16291729,
		5553712,
		15684120,
		6662416,
		7413802,
		12308920,
		13816008,
		4303699,
		9366425,
		10176680,
		13195875,
		4295371,
		6546291,
		11712675,
		15708924,
		1519456,
		15772530,
		6568428,
		6495784,
		8568297,
		13007125,
		7492395,
		2515356,
		12632583,
		14740254,
		7262584,
		1535930,
		13146278,
		16321966,
		1853211,
		294276,
		13051027,
		13221564,
		1051980,
		4080310,
		6651434,
		14088940,
		4675607
	],
	_precompute: function() {
		var i = 0, prime = 2, factor, isPrime;
		function frac(x) {
			return (x - Math.floor(x)) * 4294967296 | 0;
		}
		function frac2(x) {
			return (x - Math.floor(x)) * 1099511627776 & 255;
		}
		for (; i < 80; prime++) {
			isPrime = true;
			for (factor = 2; factor * factor <= prime; factor++) if (prime % factor === 0) {
				isPrime = false;
				break;
			}
			if (isPrime) {
				if (i < 8) {
					this._init[i * 2] = frac(Math.pow(prime, .5));
					this._init[i * 2 + 1] = frac2(Math.pow(prime, .5)) << 24 | this._initr[i];
				}
				this._key[i * 2] = frac(Math.pow(prime, .3333333333333333));
				this._key[i * 2 + 1] = frac2(Math.pow(prime, .3333333333333333)) << 24 | this._keyr[i];
				i++;
			}
		}
	},
	_block: function(words) {
		var i, wrh, wrl, h = this._h, k = this._key, h0h = h[0], h0l = h[1], h1h = h[2], h1l = h[3], h2h = h[4], h2l = h[5], h3h = h[6], h3l = h[7], h4h = h[8], h4l = h[9], h5h = h[10], h5l = h[11], h6h = h[12], h6l = h[13], h7h = h[14], h7l = h[15];
		var w;
		if (typeof Uint32Array !== "undefined") {
			w = Array(160);
			for (var j = 0; j < 32; j++) w[j] = words[j];
		} else w = words;
		var ah = h0h, al = h0l, bh = h1h, bl = h1l, ch = h2h, cl = h2l, dh = h3h, dl = h3l, eh = h4h, el = h4l, fh = h5h, fl = h5l, gh = h6h, gl = h6l, hh = h7h, hl = h7l;
		for (i = 0; i < 80; i++) {
			if (i < 16) {
				wrh = w[i * 2];
				wrl = w[i * 2 + 1];
			} else {
				var gamma0xh = w[(i - 15) * 2];
				var gamma0xl = w[(i - 15) * 2 + 1];
				var gamma0h = (gamma0xl << 31 | gamma0xh >>> 1) ^ (gamma0xl << 24 | gamma0xh >>> 8) ^ gamma0xh >>> 7;
				var gamma0l = (gamma0xh << 31 | gamma0xl >>> 1) ^ (gamma0xh << 24 | gamma0xl >>> 8) ^ (gamma0xh << 25 | gamma0xl >>> 7);
				var gamma1xh = w[(i - 2) * 2];
				var gamma1xl = w[(i - 2) * 2 + 1];
				var gamma1h = (gamma1xl << 13 | gamma1xh >>> 19) ^ (gamma1xh << 3 | gamma1xl >>> 29) ^ gamma1xh >>> 6;
				var gamma1l = (gamma1xh << 13 | gamma1xl >>> 19) ^ (gamma1xl << 3 | gamma1xh >>> 29) ^ (gamma1xh << 26 | gamma1xl >>> 6);
				var wr7h = w[(i - 7) * 2];
				var wr7l = w[(i - 7) * 2 + 1];
				var wr16h = w[(i - 16) * 2];
				var wr16l = w[(i - 16) * 2 + 1];
				wrl = gamma0l + wr7l;
				wrh = gamma0h + wr7h + (wrl >>> 0 < gamma0l >>> 0 ? 1 : 0);
				wrl += gamma1l;
				wrh += gamma1h + (wrl >>> 0 < gamma1l >>> 0 ? 1 : 0);
				wrl += wr16l;
				wrh += wr16h + (wrl >>> 0 < wr16l >>> 0 ? 1 : 0);
			}
			w[i * 2] = wrh |= 0;
			w[i * 2 + 1] = wrl |= 0;
			var chh = eh & fh ^ ~eh & gh;
			var chl = el & fl ^ ~el & gl;
			var majh = ah & bh ^ ah & ch ^ bh & ch;
			var majl = al & bl ^ al & cl ^ bl & cl;
			var sigma0h = (al << 4 | ah >>> 28) ^ (ah << 30 | al >>> 2) ^ (ah << 25 | al >>> 7);
			var sigma0l = (ah << 4 | al >>> 28) ^ (al << 30 | ah >>> 2) ^ (al << 25 | ah >>> 7);
			var sigma1h = (el << 18 | eh >>> 14) ^ (el << 14 | eh >>> 18) ^ (eh << 23 | el >>> 9);
			var sigma1l = (eh << 18 | el >>> 14) ^ (eh << 14 | el >>> 18) ^ (el << 23 | eh >>> 9);
			var krh = k[i * 2];
			var krl = k[i * 2 + 1];
			var t1l = hl + sigma1l;
			var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
			t1l += chl;
			t1h += chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
			t1l += krl;
			t1h += krh + (t1l >>> 0 < krl >>> 0 ? 1 : 0);
			t1l = t1l + wrl | 0;
			t1h += wrh + (t1l >>> 0 < wrl >>> 0 ? 1 : 0);
			var t2l = sigma0l + majl;
			var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);
			hh = gh;
			hl = gl;
			gh = fh;
			gl = fl;
			fh = eh;
			fl = el;
			el = dl + t1l | 0;
			eh = dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
			dh = ch;
			dl = cl;
			ch = bh;
			cl = bl;
			bh = ah;
			bl = al;
			al = t1l + t2l | 0;
			ah = t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0) | 0;
		}
		h0l = h[1] = h0l + al | 0;
		h[0] = h0h + ah + (h0l >>> 0 < al >>> 0 ? 1 : 0) | 0;
		h1l = h[3] = h1l + bl | 0;
		h[2] = h1h + bh + (h1l >>> 0 < bl >>> 0 ? 1 : 0) | 0;
		h2l = h[5] = h2l + cl | 0;
		h[4] = h2h + ch + (h2l >>> 0 < cl >>> 0 ? 1 : 0) | 0;
		h3l = h[7] = h3l + dl | 0;
		h[6] = h3h + dh + (h3l >>> 0 < dl >>> 0 ? 1 : 0) | 0;
		h4l = h[9] = h4l + el | 0;
		h[8] = h4h + eh + (h4l >>> 0 < el >>> 0 ? 1 : 0) | 0;
		h5l = h[11] = h5l + fl | 0;
		h[10] = h5h + fh + (h5l >>> 0 < fl >>> 0 ? 1 : 0) | 0;
		h6l = h[13] = h6l + gl | 0;
		h[12] = h6h + gh + (h6l >>> 0 < gl >>> 0 ? 1 : 0) | 0;
		h7l = h[15] = h7l + hl | 0;
		h[14] = h7h + hh + (h7l >>> 0 < hl >>> 0 ? 1 : 0) | 0;
	}
};
/** @fileOverview Javascript SHA-1 implementation.
*
* Based on the implementation in RFC 3174, method 1, and on the SJCL
* SHA-256 implementation.
*
* @author Quinn Slack
*/
/**
* Context for a SHA-1 operation in progress.
* @constructor
*/
sjcl.hash.sha1 = function(hash) {
	if (hash) {
		this._h = hash._h.slice(0);
		this._buffer = hash._buffer.slice(0);
		this._length = hash._length;
	} else this.reset();
};
/**
* Hash a string or an array of words.
* @static
* @param {bitArray|String} data the data to hash.
* @return {bitArray} The hash value, an array of 5 big-endian words.
*/
sjcl.hash.sha1.hash = function(data) {
	return new sjcl.hash.sha1().update(data).finalize();
};
sjcl.hash.sha1.prototype = {
	blockSize: 512,
	reset: function() {
		this._h = this._init.slice(0);
		this._buffer = [];
		this._length = 0;
		return this;
	},
	update: function(data) {
		if (typeof data === "string") data = sjcl.codec.utf8String.toBits(data);
		var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
		if (nl > 9007199254740991) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
		if (typeof Uint32Array !== "undefined") {
			var c = new Uint32Array(b);
			var j = 0;
			for (i = this.blockSize + ol - (this.blockSize + ol & this.blockSize - 1); i <= nl; i += this.blockSize) {
				this._block(c.subarray(16 * j, 16 * (j + 1)));
				j += 1;
			}
			b.splice(0, 16 * j);
		} else for (i = this.blockSize + ol - (this.blockSize + ol & this.blockSize - 1); i <= nl; i += this.blockSize) this._block(b.splice(0, 16));
		return this;
	},
	finalize: function() {
		var i, b = this._buffer, h = this._h;
		b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
		for (i = b.length + 2; i & 15; i++) b.push(0);
		b.push(Math.floor(this._length / 4294967296));
		b.push(this._length | 0);
		while (b.length) this._block(b.splice(0, 16));
		this.reset();
		return h;
	},
	_init: [
		1732584193,
		4023233417,
		2562383102,
		271733878,
		3285377520
	],
	_key: [
		1518500249,
		1859775393,
		2400959708,
		3395469782
	],
	_f: function(t$1, b, c, d) {
		if (t$1 <= 19) return b & c | ~b & d;
else if (t$1 <= 39) return b ^ c ^ d;
else if (t$1 <= 59) return b & c | b & d | c & d;
else if (t$1 <= 79) return b ^ c ^ d;
	},
	_S: function(n, x) {
		return x << n | x >>> 32 - n;
	},
	_block: function(words) {
		var t$1, tmp, a, b, c, d, e, h = this._h;
		var w;
		if (typeof Uint32Array !== "undefined") {
			w = Array(80);
			for (var j = 0; j < 16; j++) w[j] = words[j];
		} else w = words;
		a = h[0];
		b = h[1];
		c = h[2];
		d = h[3];
		e = h[4];
		for (t$1 = 0; t$1 <= 79; t$1++) {
			if (t$1 >= 16) w[t$1] = this._S(1, w[t$1 - 3] ^ w[t$1 - 8] ^ w[t$1 - 14] ^ w[t$1 - 16]);
			tmp = this._S(5, a) + this._f(t$1, b, c, d) + e + w[t$1] + this._key[Math.floor(t$1 / 20)] | 0;
			e = d;
			d = c;
			c = this._S(30, b);
			b = a;
			a = tmp;
		}
		h[0] = h[0] + a | 0;
		h[1] = h[1] + b | 0;
		h[2] = h[2] + c | 0;
		h[3] = h[3] + d | 0;
		h[4] = h[4] + e | 0;
	}
};
/** @fileOverview CBC mode implementation
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/**
* Dangerous: CBC mode with PKCS#5 padding.
* @namespace
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
sjcl.mode.cbc = {
	name: "cbc",
	encrypt: function(prp, plaintext, iv, adata, usePadding) {
		if (adata && adata.length) throw new sjcl.exception.invalid("cbc can't authenticate data");
		if (sjcl.bitArray.bitLength(iv) !== 128) throw new sjcl.exception.invalid("cbc iv must be 128 bits");
		var i, w = sjcl.bitArray, xor = w._xor4, bl = w.bitLength(plaintext), bp = 0, output = [];
		if (bl & 7) throw new sjcl.exception.invalid("pkcs#5 padding only works for multiples of a byte");
		for (i = 0; bp + 128 <= bl; i += 4, bp += 128) {
			iv = prp.encrypt(xor(iv, plaintext.slice(i, i + 4)));
			output.push(iv[0], iv[1], iv[2], iv[3]);
		}
		if (usePadding) {
			bl = (16 - (bl >> 3 & 15)) * 16843009;
			iv = prp.encrypt(xor(iv, w.concat(plaintext, [
				bl,
				bl,
				bl,
				bl
			]).slice(i, i + 4)));
			output.push(iv[0], iv[1], iv[2], iv[3]);
		}
		return output;
	},
	decrypt: function(prp, ciphertext, iv, adata, usePadding) {
		if (adata && adata.length) throw new sjcl.exception.invalid("cbc can't authenticate data");
		if (sjcl.bitArray.bitLength(iv) !== 128) throw new sjcl.exception.invalid("cbc iv must be 128 bits");
		if (sjcl.bitArray.bitLength(ciphertext) & 127 || !ciphertext.length) throw new sjcl.exception.corrupt("cbc ciphertext must be a positive multiple of the block size");
		var i, w = sjcl.bitArray, xor = w._xor4, bi, bo, output = [];
		adata = adata || [];
		for (i = 0; i < ciphertext.length; i += 4) {
			bi = ciphertext.slice(i, i + 4);
			bo = xor(iv, prp.decrypt(bi));
			output.push(bo[0], bo[1], bo[2], bo[3]);
			iv = bi;
		}
		if (usePadding) {
			bi = output[i - 1] & 255;
			if (bi === 0 || bi > 16) throw new sjcl.exception.corrupt("pkcs#5 padding corrupt");
			bo = bi * 16843009;
			if (!w.equal(w.bitSlice([
				bo,
				bo,
				bo,
				bo
			], 0, bi * 8), w.bitSlice(output, output.length * 32 - bi * 8, output.length * 32))) throw new sjcl.exception.corrupt("pkcs#5 padding corrupt");
			return w.bitSlice(output, 0, output.length * 32 - bi * 8);
		} else return output;
	}
};
/** @fileOverview GCM mode implementation.
*
* @author Juho Vähä-Herttua
*/
/**
* Galois/Counter mode.
* @namespace
*/
sjcl.mode.gcm = {
	name: "gcm",
	encrypt: function(prf, plaintext, iv, adata, tlen) {
		var out, data = plaintext.slice(0), w = sjcl.bitArray;
		tlen = tlen || 128;
		adata = adata || [];
		out = sjcl.mode.gcm._ctrMode(true, prf, data, adata, iv, tlen);
		return w.concat(out.data, out.tag);
	},
	decrypt: function(prf, ciphertext, iv, adata, tlen) {
		var out, data = ciphertext.slice(0), tag, w = sjcl.bitArray, l = w.bitLength(data);
		tlen = tlen || 128;
		adata = adata || [];
		if (tlen <= l) {
			tag = w.bitSlice(data, l - tlen);
			data = w.bitSlice(data, 0, l - tlen);
		} else {
			tag = data;
			data = [];
		}
		out = sjcl.mode.gcm._ctrMode(false, prf, data, adata, iv, tlen);
		if (!w.equal(out.tag, tag)) throw new sjcl.exception.corrupt("gcm: tag doesn't match");
		return out.data;
	},
	_galoisMultiply: function(x, y) {
		var i, j, xi, Zi, Vi, lsb_Vi, w = sjcl.bitArray, xor = w._xor4;
		Zi = [
			0,
			0,
			0,
			0
		];
		Vi = y.slice(0);
		for (i = 0; i < 128; i++) {
			xi = (x[Math.floor(i / 32)] & 1 << 31 - i % 32) !== 0;
			if (xi) Zi = xor(Zi, Vi);
			lsb_Vi = (Vi[3] & 1) !== 0;
			for (j = 3; j > 0; j--) Vi[j] = Vi[j] >>> 1 | (Vi[j - 1] & 1) << 31;
			Vi[0] = Vi[0] >>> 1;
			if (lsb_Vi) Vi[0] = Vi[0] ^ -520093696;
		}
		return Zi;
	},
	_ghash: function(H, Y0, data) {
		var Yi, i, l = data.length;
		Yi = Y0.slice(0);
		for (i = 0; i < l; i += 4) {
			Yi[0] ^= 4294967295 & data[i];
			Yi[1] ^= 4294967295 & data[i + 1];
			Yi[2] ^= 4294967295 & data[i + 2];
			Yi[3] ^= 4294967295 & data[i + 3];
			Yi = sjcl.mode.gcm._galoisMultiply(Yi, H);
		}
		return Yi;
	},
	_ctrMode: function(encrypt, prf, data, adata, iv, tlen) {
		var H, J0, S0, enc, i, ctr, tag, last, l, bl, abl, ivbl, w = sjcl.bitArray;
		l = data.length;
		bl = w.bitLength(data);
		abl = w.bitLength(adata);
		ivbl = w.bitLength(iv);
		H = prf.encrypt([
			0,
			0,
			0,
			0
		]);
		if (ivbl === 96) {
			J0 = iv.slice(0);
			J0 = w.concat(J0, [1]);
		} else {
			J0 = sjcl.mode.gcm._ghash(H, [
				0,
				0,
				0,
				0
			], iv);
			J0 = sjcl.mode.gcm._ghash(H, J0, [
				0,
				0,
				Math.floor(ivbl / 4294967296),
				ivbl & 4294967295
			]);
		}
		S0 = sjcl.mode.gcm._ghash(H, [
			0,
			0,
			0,
			0
		], adata);
		ctr = J0.slice(0);
		tag = S0.slice(0);
		if (!encrypt) tag = sjcl.mode.gcm._ghash(H, S0, data);
		for (i = 0; i < l; i += 4) {
			ctr[3]++;
			enc = prf.encrypt(ctr);
			data[i] ^= enc[0];
			data[i + 1] ^= enc[1];
			data[i + 2] ^= enc[2];
			data[i + 3] ^= enc[3];
		}
		data = w.clamp(data, bl);
		if (encrypt) tag = sjcl.mode.gcm._ghash(H, S0, data);
		last = [
			Math.floor(abl / 4294967296),
			abl & 4294967295,
			Math.floor(bl / 4294967296),
			bl & 4294967295
		];
		tag = sjcl.mode.gcm._ghash(H, tag, last);
		enc = prf.encrypt(J0);
		tag[0] ^= enc[0];
		tag[1] ^= enc[1];
		tag[2] ^= enc[2];
		tag[3] ^= enc[3];
		return {
			tag: w.bitSlice(tag, 0, tlen),
			data
		};
	}
};
/** @fileOverview HMAC implementation.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
*/
/** HMAC with the specified hash function.
* @constructor
* @param {bitArray} key the key for HMAC.
* @param {Object} [Hash=sjcl.hash.sha256] The hash function to use.
*/
sjcl.misc.hmac = function(key, Hash) {
	this._hash = Hash = Hash || sjcl.hash.sha256;
	var exKey = [[], []], i, bs = Hash.prototype.blockSize / 32;
	this._baseHash = [new Hash(), new Hash()];
	if (key.length > bs) key = Hash.hash(key);
	for (i = 0; i < bs; i++) {
		exKey[0][i] = key[i] ^ 909522486;
		exKey[1][i] = key[i] ^ 1549556828;
	}
	this._baseHash[0].update(exKey[0]);
	this._baseHash[1].update(exKey[1]);
	this._resultHash = new Hash(this._baseHash[0]);
};
/** HMAC with the specified hash function.  Also called encrypt since it's a prf.
* @param {bitArray|String} data The data to mac.
*/
sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function(data) {
	if (!this._updated) {
		this.update(data);
		return this.digest(data);
	} else throw new sjcl.exception.invalid("encrypt on already updated hmac called!");
};
sjcl.misc.hmac.prototype.reset = function() {
	this._resultHash = new this._hash(this._baseHash[0]);
	this._updated = false;
};
sjcl.misc.hmac.prototype.update = function(data) {
	this._updated = true;
	this._resultHash.update(data);
};
sjcl.misc.hmac.prototype.digest = function() {
	var w = this._resultHash.finalize(), result = new this._hash(this._baseHash[1]).update(w).finalize();
	this.reset();
	return result;
};
/** @fileOverview Random number generator.
*
* @author Emily Stark
* @author Mike Hamburg
* @author Dan Boneh
* @author Michael Brooks
* @author Steve Thomas
*/
/**
* @class Random number generator
* @description
* <b>Use sjcl.random as a singleton for this class!</b>
* <p>
* This random number generator is a derivative of Ferguson and Schneier's
* generator Fortuna.  It collects entropy from various events into several
* pools, implemented by streaming SHA-256 instances.  It differs from
* ordinary Fortuna in a few ways, though.
* </p>
*
* <p>
* Most importantly, it has an entropy estimator.  This is present because
* there is a strong conflict here between making the generator available
* as soon as possible, and making sure that it doesn't "run on empty".
* In Fortuna, there is a saved state file, and the system is likely to have
* time to warm up.
* </p>
*
* <p>
* Second, because users are unlikely to stay on the page for very long,
* and to speed startup time, the number of pools increases logarithmically:
* a new pool is created when the previous one is actually used for a reseed.
* This gives the same asymptotic guarantees as Fortuna, but gives more
* entropy to early reseeds.
* </p>
*
* <p>
* The entire mechanism here feels pretty klunky.  Furthermore, there are
* several improvements that should be made, including support for
* dedicated cryptographic functions that may be present in some browsers;
* state files in local storage; cookies containing randomness; etc.  So
* look for improvements in future versions.
* </p>
* @constructor
*/
sjcl.prng = function(defaultParanoia) {
	this._pools = [new sjcl.hash.sha256()];
	this._poolEntropy = [0];
	this._reseedCount = 0;
	this._robins = {};
	this._eventId = 0;
	this._collectorIds = {};
	this._collectorIdNext = 0;
	this._strength = 0;
	this._poolStrength = 0;
	this._nextReseed = 0;
	this._key = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	];
	this._counter = [
		0,
		0,
		0,
		0
	];
	this._defaultParanoia = defaultParanoia;
	this._NOT_READY = 0;
	this._READY = 1;
	this._REQUIRES_RESEED = 2;
	this._MAX_WORDS_PER_BURST = 65536;
	this._PARANOIA_LEVELS = [
		0,
		48,
		64,
		96,
		128,
		192,
		256,
		384,
		512,
		768,
		1024
	];
	this._MILLISECONDS_PER_RESEED = 3e4;
	this._BITS_PER_RESEED = 80;
};
sjcl.prng.prototype = {
	randomWords: function(nwords, paranoia) {
		var out = [], i, readiness = this.isReady(paranoia), g;
		if (readiness === this._NOT_READY) throw new sjcl.exception.notReady("generator isn't seeded");
else if (readiness & this._REQUIRES_RESEED) this._reseedFromPools(!(readiness & this._READY));
		for (i = 0; i < nwords; i += 4) {
			if ((i + 1) % this._MAX_WORDS_PER_BURST === 0) this._gate();
			g = this._gen4words();
			out.push(g[0], g[1], g[2], g[3]);
		}
		this._gate();
		return out.slice(0, nwords);
	},
	addEntropy: function(data, estimatedEntropy, source) {
		source = source || "user";
		var id, i, tmp, t$1 = new Date().valueOf(), robin = this._robins[source], oldReady = this.isReady(), err = 0, objName;
		id = this._collectorIds[source];
		if (id === undefined) id = this._collectorIds[source] = this._collectorIdNext++;
		if (robin === undefined) robin = this._robins[source] = 0;
		this._robins[source] = (this._robins[source] + 1) % this._pools.length;
		switch (typeof data) {
			case "number":
				if (estimatedEntropy === undefined) estimatedEntropy = 1;
				this._pools[robin].update([
					id,
					this._eventId++,
					1,
					estimatedEntropy,
					t$1,
					1,
					data | 0
				]);
				break;
			case "object":
				objName = Object.prototype.toString.call(data);
				if (objName === "[object Uint32Array]") {
					tmp = [];
					for (i = 0; i < data.length; i++) tmp.push(data[i]);
					data = tmp;
				} else {
					if (objName !== "[object Array]") err = 1;
					for (i = 0; i < data.length && !err; i++) if (typeof data[i] !== "number") err = 1;
				}
				if (!err) {
					if (estimatedEntropy === undefined) {
						estimatedEntropy = 0;
						for (i = 0; i < data.length; i++) {
							tmp = data[i];
							while (tmp > 0) {
								estimatedEntropy++;
								tmp = tmp >>> 1;
							}
						}
					}
					this._pools[robin].update([
						id,
						this._eventId++,
						2,
						estimatedEntropy,
						t$1,
						data.length
					].concat(data));
				}
				break;
			case "string":
				if (estimatedEntropy === undefined) estimatedEntropy = data.length;
				this._pools[robin].update([
					id,
					this._eventId++,
					3,
					estimatedEntropy,
					t$1,
					data.length
				]);
				this._pools[robin].update(data);
				break;
			default: err = 1;
		}
		if (err) throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
		this._poolEntropy[robin] += estimatedEntropy;
		this._poolStrength += estimatedEntropy;
	},
	isReady: function(paranoia) {
		var entropyRequired = this._PARANOIA_LEVELS[paranoia !== undefined ? paranoia : this._defaultParanoia];
		if (this._strength && this._strength >= entropyRequired) return this._poolEntropy[0] > this._BITS_PER_RESEED && new Date().valueOf() > this._nextReseed ? this._REQUIRES_RESEED | this._READY : this._READY;
else return this._poolStrength >= entropyRequired ? this._REQUIRES_RESEED | this._NOT_READY : this._NOT_READY;
	},
	_gen4words: function() {
		for (var i = 0; i < 4; i++) {
			this._counter[i] = this._counter[i] + 1 | 0;
			if (this._counter[i]) break;
		}
		return this._cipher.encrypt(this._counter);
	},
	_gate: function() {
		this._key = this._gen4words().concat(this._gen4words());
		this._cipher = new sjcl.cipher.aes(this._key);
	},
	_reseed: function(seedWords) {
		this._key = sjcl.hash.sha256.hash(this._key.concat(seedWords));
		this._cipher = new sjcl.cipher.aes(this._key);
		for (var i = 0; i < 4; i++) {
			this._counter[i] = this._counter[i] + 1 | 0;
			if (this._counter[i]) break;
		}
	},
	_reseedFromPools: function(full) {
		var reseedData = [], strength = 0, i;
		this._nextReseed = reseedData[0] = new Date().valueOf() + this._MILLISECONDS_PER_RESEED;
		for (i = 0; i < 16; i++) reseedData.push(Math.random() * 4294967296 | 0);
		for (i = 0; i < this._pools.length; i++) {
			reseedData = reseedData.concat(this._pools[i].finalize());
			strength += this._poolEntropy[i];
			this._poolEntropy[i] = 0;
			if (!full && this._reseedCount & 1 << i) break;
		}
		if (this._reseedCount >= 1 << this._pools.length) {
			this._pools.push(new sjcl.hash.sha256());
			this._poolEntropy.push(0);
		}
		this._poolStrength -= strength;
		if (strength > this._strength) this._strength = strength;
		this._reseedCount++;
		this._reseed(reseedData);
	}
};
/** an instance for the prng.
* @see sjcl.prng
*/
/**
* ArrayBuffer
* @namespace
*/
sjcl.codec.arrayBuffer = {
	fromBits: function(arr, padding, padding_count) {
		var out, i, ol, tmp, smallest;
		padding = padding == undefined ? true : padding;
		padding_count = padding_count || 8;
		if (arr.length === 0) return new ArrayBuffer(0);
		ol = sjcl.bitArray.bitLength(arr) / 8;
		if (sjcl.bitArray.bitLength(arr) % 8 !== 0) throw new sjcl.exception.invalid("Invalid bit size, must be divisble by 8 to fit in an arraybuffer correctly");
		if (padding && ol % padding_count !== 0) ol += padding_count - ol % padding_count;
		tmp = new DataView(new ArrayBuffer(arr.length * 4));
		for (i = 0; i < arr.length; i++) tmp.setUint32(i * 4, arr[i] << 32);
		out = new DataView(new ArrayBuffer(ol));
		if (out.byteLength === tmp.byteLength) return tmp.buffer;
		smallest = tmp.byteLength < out.byteLength ? tmp.byteLength : out.byteLength;
		for (i = 0; i < smallest; i++) out.setUint8(i, tmp.getUint8(i));
		return out.buffer;
	},
	toBits: function(buffer, byteOffset, byteLength) {
		var i, out = [], len, inView, tmp;
		if (buffer.byteLength === 0) return [];
		inView = new DataView(buffer, byteOffset, byteLength);
		len = inView.byteLength - inView.byteLength % 4;
		for (var i = 0; i < len; i += 4) out.push(inView.getUint32(i));
		if (inView.byteLength % 4 != 0) {
			tmp = new DataView(new ArrayBuffer(4));
			for (var i = 0, l = inView.byteLength % 4; i < l; i++) tmp.setUint8(i + 4 - l, inView.getUint8(len + i));
			out.push(sjcl.bitArray.partial(inView.byteLength % 4 * 8, tmp.getUint32(0)));
		}
		return out;
	}
};
var sjcl_default = sjcl;

//#endregion
//#region packages/tutanota-crypto/dist/random/Randomizer.js
var Randomizer = class {
	random;
	constructor() {
		this.random = new sjcl_default.prng(6);
	}
	/**
	* Adds entropy to the random number generator algorithm
	* @param entropyCache with: number Any number value, entropy The amount of entropy in the number in bit,
	* source The source of the number.
	*/
	addEntropy(entropyCache) {
		for (const entry of entropyCache) this.random.addEntropy(entry.data, entry.entropy, entry.source);
		return Promise.resolve();
	}
	addStaticEntropy(bytes) {
		for (const byte of bytes) this.random.addEntropy(byte, 8, "static");
	}
	/**
	* Not used currently because we always have enough entropy using getRandomValues()
	*/
	isReady() {
		return this.random.isReady() !== 0;
	}
	/**
	* Generates random data. The function initRandomDataGenerator must have been called prior to the first call to this function.
	* @param nbrOfBytes The number of bytes the random data shall have.
	* @return A hex coded string of random data.
	* @throws {CryptoError} if the randomizer is not seeded (isReady == false)
	*/
	generateRandomData(nbrOfBytes) {
		try {
			let nbrOfWords = Math.floor((nbrOfBytes + 3) / 4);
			let words = this.random.randomWords(nbrOfWords);
			let arrayBuffer = sjcl_default.codec.arrayBuffer.fromBits(words, false);
			return new Uint8Array(arrayBuffer, 0, nbrOfBytes);
		} catch (e) {
			throw new CryptoError("error during random number generation", e);
		}
	}
	/**
	* Generate a number that fits in the range of an n-byte integer
	*/
	generateRandomNumber(nbrOfBytes) {
		const bytes = this.generateRandomData(nbrOfBytes);
		let result = 0;
		for (let i = 0; i < bytes.length; ++i) result += bytes[i] << i * 8;
		return result;
	}
};
const random = new Randomizer();

//#endregion
//#region packages/tutanota-crypto/dist/hashes/Sha256.js
const sha256 = new sjcl_default.hash.sha256();
function sha256Hash(uint8Array) {
	try {
		sha256.update(sjcl_default.codec.arrayBuffer.toBits(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength));
		return new Uint8Array(sjcl_default.codec.arrayBuffer.fromBits(sha256.finalize(), false));
	} finally {
		sha256.reset();
	}
}

//#endregion
//#region packages/tutanota-crypto/dist/misc/Utils.js
function createAuthVerifier(passwordKey) {
	return sha256Hash(bitArrayToUint8Array(passwordKey));
}
function createAuthVerifierAsBase64Url(passwordKey) {
	return base64ToBase64Url(uint8ArrayToBase64(createAuthVerifier(passwordKey)));
}
function bitArrayToUint8Array(bits) {
	return new Uint8Array(sjcl_default.codec.arrayBuffer.fromBits(bits, false));
}
function uint8ArrayToBitArray(uint8Array) {
	return sjcl_default.codec.arrayBuffer.toBits(uint8ArrayToArrayBuffer(uint8Array));
}
function keyToBase64(key) {
	return sjcl_default.codec.base64.fromBits(key);
}
function base64ToKey(base64) {
	try {
		return sjcl_default.codec.base64.toBits(base64);
	} catch (e) {
		throw new CryptoError("hex to aes key failed", e);
	}
}
function uint8ArrayToKey(array) {
	return base64ToKey(uint8ArrayToBase64(array));
}
function keyToUint8Array(key) {
	return base64ToUint8Array(keyToBase64(key));
}
const fixedIv = hexToUint8Array("88888888888888888888888888888888");

//#endregion
//#region packages/tutanota-crypto/dist/hashes/Sha512.js
const sha512 = new sjcl_default.hash.sha512();
function sha512Hash(uint8Array) {
	try {
		sha512.update(sjcl_default.codec.arrayBuffer.toBits(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength));
		return new Uint8Array(sjcl_default.codec.arrayBuffer.fromBits(sha512.finalize(), false));
	} finally {
		sha512.reset();
	}
}

//#endregion
//#region packages/tutanota-crypto/dist/encryption/Hmac.js
function hmacSha256(key, data) {
	const hmac = new sjcl_default.misc.hmac(key, sjcl_default.hash.sha256);
	return bitArrayToUint8Array(hmac.encrypt(uint8ArrayToBitArray(data)));
}
function verifyHmacSha256(key, data, tag) {
	const computedTag = hmacSha256(key, data);
	if (!arrayEquals(computedTag, tag)) throw new CryptoError("invalid mac");
}

//#endregion
//#region packages/tutanota-crypto/dist/encryption/Aes.js
const ENABLE_MAC = true;
const IV_BYTE_LENGTH = 16;
const KEY_LENGTH_BYTES_AES_256 = 32;
const KEY_LENGTH_BITS_AES_256 = KEY_LENGTH_BYTES_AES_256 * 8;
const KEY_LENGTH_BYTES_AES_128 = 16;
const KEY_LENGTH_BITS_AES_128 = KEY_LENGTH_BYTES_AES_128 * 8;
const MAC_ENABLED_PREFIX = 1;
const MAC_LENGTH_BYTES = 32;
function getKeyLengthBytes(key) {
	return key.length * 4;
}
function aes256RandomKey() {
	return uint8ArrayToBitArray(random.generateRandomData(KEY_LENGTH_BYTES_AES_256));
}
function generateIV() {
	return random.generateRandomData(IV_BYTE_LENGTH);
}
function aesEncrypt(key, bytes, iv = generateIV(), usePadding = true, useMac = true) {
	verifyKeySize(key, [KEY_LENGTH_BITS_AES_128, KEY_LENGTH_BITS_AES_256]);
	if (iv.length !== IV_BYTE_LENGTH) throw new CryptoError(`Illegal IV length: ${iv.length} (expected: ${IV_BYTE_LENGTH}): ${uint8ArrayToBase64(iv)} `);
	if (!useMac && getKeyLengthBytes(key) === KEY_LENGTH_BYTES_AES_256) throw new CryptoError(`Can't use AES-256 without MAC`);
	let subKeys = getAesSubKeys(key, useMac);
	let encryptedBits = sjcl_default.mode.cbc.encrypt(new sjcl_default.cipher.aes(subKeys.cKey), uint8ArrayToBitArray(bytes), uint8ArrayToBitArray(iv), [], usePadding);
	let data = concat(iv, bitArrayToUint8Array(encryptedBits));
	if (useMac) {
		const macBytes = hmacSha256(assertNotNull(subKeys.mKey), data);
		data = concat(new Uint8Array([MAC_ENABLED_PREFIX]), data, macBytes);
	}
	return data;
}
function aes256EncryptSearchIndexEntry(key, bytes, iv = generateIV(), usePadding = true) {
	verifyKeySize(key, [KEY_LENGTH_BITS_AES_256]);
	if (iv.length !== IV_BYTE_LENGTH) throw new CryptoError(`Illegal IV length: ${iv.length} (expected: ${IV_BYTE_LENGTH}): ${uint8ArrayToBase64(iv)} `);
	let subKeys = getAesSubKeys(key, false);
	let encryptedBits = sjcl_default.mode.cbc.encrypt(new sjcl_default.cipher.aes(subKeys.cKey), uint8ArrayToBitArray(bytes), uint8ArrayToBitArray(iv), [], usePadding);
	let data = concat(iv, bitArrayToUint8Array(encryptedBits));
	return data;
}
function aesDecrypt(key, encryptedBytes, usePadding = true) {
	const keyLength = getKeyLengthBytes(key);
	if (keyLength === KEY_LENGTH_BYTES_AES_128) return aesDecryptImpl(key, encryptedBytes, usePadding, false);
else return aesDecryptImpl(key, encryptedBytes, usePadding, true);
}
function authenticatedAesDecrypt(key, encryptedBytes, usePadding = true) {
	return aesDecryptImpl(key, encryptedBytes, usePadding, true);
}
function unauthenticatedAesDecrypt(key, encryptedBytes, usePadding = true) {
	return aesDecryptImpl(key, encryptedBytes, usePadding, false);
}
/**
* Decrypts the given words with AES-128/256 in CBC mode.
* @param key The key to use for the decryption.
* @param encryptedBytes The ciphertext encoded as bytes.
* @param usePadding If true, padding is used, otherwise no padding is used and the encrypted data must have the key size.
* @param enforceMac if true decryption will fail if there is no valid mac. we only support false for backward compatibility.
* 				 it must not be used with new cryto anymore.
* @return The decrypted bytes.
*/
function aesDecryptImpl(key, encryptedBytes, usePadding, enforceMac) {
	verifyKeySize(key, [KEY_LENGTH_BITS_AES_128, KEY_LENGTH_BITS_AES_256]);
	const hasMac = encryptedBytes.length % 2 === 1;
	if (enforceMac && !hasMac) throw new CryptoError("mac expected but not present");
	const subKeys = getAesSubKeys(key, hasMac);
	let cipherTextWithoutMac;
	if (hasMac) {
		cipherTextWithoutMac = encryptedBytes.subarray(1, encryptedBytes.length - MAC_LENGTH_BYTES);
		const providedMacBytes = encryptedBytes.subarray(encryptedBytes.length - MAC_LENGTH_BYTES);
		verifyHmacSha256(assertNotNull(subKeys.mKey), cipherTextWithoutMac, providedMacBytes);
	} else cipherTextWithoutMac = encryptedBytes;
	const iv = cipherTextWithoutMac.slice(0, IV_BYTE_LENGTH);
	if (iv.length !== IV_BYTE_LENGTH) throw new CryptoError(`Invalid IV length in aesDecrypt: ${iv.length} bytes, must be 16 bytes (128 bits)`);
	const ciphertext = cipherTextWithoutMac.slice(IV_BYTE_LENGTH);
	try {
		const decrypted = sjcl_default.mode.cbc.decrypt(new sjcl_default.cipher.aes(subKeys.cKey), uint8ArrayToBitArray(ciphertext), uint8ArrayToBitArray(iv), [], usePadding);
		return new Uint8Array(bitArrayToUint8Array(decrypted));
	} catch (e) {
		throw new CryptoError("aes decryption failed", e);
	}
}
function verifyKeySize(key, bitLength) {
	if (!bitLength.includes(sjcl_default.bitArray.bitLength(key))) throw new CryptoError(`Illegal key length: ${sjcl_default.bitArray.bitLength(key)} (expected: ${bitLength})`);
}
function getAesSubKeys(key, mac) {
	if (mac) {
		let hashedKey;
		switch (getKeyLengthBytes(key)) {
			case KEY_LENGTH_BYTES_AES_128:
				hashedKey = sha256Hash(bitArrayToUint8Array(key));
				break;
			case KEY_LENGTH_BYTES_AES_256:
				hashedKey = sha512Hash(bitArrayToUint8Array(key));
				break;
			default: throw new Error(`unexpected key length ${getKeyLengthBytes(key)}`);
		}
		return {
			cKey: uint8ArrayToBitArray(hashedKey.subarray(0, hashedKey.length / 2)),
			mKey: uint8ArrayToBitArray(hashedKey.subarray(hashedKey.length / 2, hashedKey.length))
		};
	} else return {
		cKey: key,
		mKey: null
	};
}

//#endregion
//#region packages/tutanota-crypto/dist/internal/noble-curves-1.3.0.js
var nobleCurves = (() => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
	var input_exports = {};
	__export(input_exports, { x25519: () => x25519$1 });
	function isBytes(a) {
		return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
	}
	function bytes(b, ...lengths) {
		if (!isBytes(b)) throw new Error("Expected Uint8Array");
		if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
	}
	function exists(instance, checkFinished = true) {
		if (instance.destroyed) throw new Error("Hash instance has been destroyed");
		if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
	}
	function output(out, instance) {
		bytes(out);
		const min = instance.outputLen;
		if (out.length < min) throw new Error(`digestInto() expects output buffer of length at least ${min}`);
	}
	var crypto = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
	function isBytes2(a) {
		return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
	}
	var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
	var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
	if (!isLE) throw new Error("Non little-endian hardware is not supported");
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
		return new Uint8Array(new TextEncoder().encode(str));
	}
	function toBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		if (!isBytes2(data)) throw new Error(`expected Uint8Array, got ${typeof data}`);
		return data;
	}
	function concatBytes(...arrays) {
		let sum = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			if (!isBytes2(a)) throw new Error("Uint8Array expected");
			sum += a.length;
		}
		const res = new Uint8Array(sum);
		for (let i = 0, pad = 0; i < arrays.length; i++) {
			const a = arrays[i];
			res.set(a, pad);
			pad += a.length;
		}
		return res;
	}
	var Hash = class {
		clone() {
			return this._cloneInto();
		}
	};
	var toStr = {}.toString;
	function wrapConstructor(hashCons) {
		const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
		const tmp = hashCons();
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = () => hashCons();
		return hashC;
	}
	function randomBytes(bytesLength = 32) {
		if (crypto && typeof crypto.getRandomValues === "function") return crypto.getRandomValues(new Uint8Array(bytesLength));
		throw new Error("crypto.getRandomValues must be defined");
	}
	function setBigUint64(view, byteOffset, value, isLE2) {
		if (typeof view.setBigUint64 === "function") return view.setBigUint64(byteOffset, value, isLE2);
		const _32n2 = BigInt(32);
		const _u32_max = BigInt(4294967295);
		const wh = Number(value >> _32n2 & _u32_max);
		const wl = Number(value & _u32_max);
		const h = isLE2 ? 4 : 0;
		const l = isLE2 ? 0 : 4;
		view.setUint32(byteOffset + h, wh, isLE2);
		view.setUint32(byteOffset + l, wl, isLE2);
	}
	var SHA2 = class extends Hash {
		constructor(blockLen, outputLen, padOffset, isLE2) {
			super();
			this.blockLen = blockLen;
			this.outputLen = outputLen;
			this.padOffset = padOffset;
			this.isLE = isLE2;
			this.finished = false;
			this.length = 0;
			this.pos = 0;
			this.destroyed = false;
			this.buffer = new Uint8Array(blockLen);
			this.view = createView(this.buffer);
		}
		update(data) {
			exists(this);
			const { view, buffer, blockLen } = this;
			data = toBytes(data);
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				if (take === blockLen) {
					const dataView = createView(data);
					for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				pos += take;
				if (this.pos === blockLen) {
					this.process(view, 0);
					this.pos = 0;
				}
			}
			this.length += data.length;
			this.roundClean();
			return this;
		}
		digestInto(out) {
			exists(this);
			output(out, this);
			this.finished = true;
			const { buffer, view, blockLen, isLE: isLE2 } = this;
			let { pos } = this;
			buffer[pos++] = 128;
			this.buffer.subarray(pos).fill(0);
			if (this.padOffset > blockLen - pos) {
				this.process(view, 0);
				pos = 0;
			}
			for (let i = pos; i < blockLen; i++) buffer[i] = 0;
			setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
			this.process(view, 0);
			const oview = createView(out);
			const len = this.outputLen;
			if (len % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
			const outLen = len / 4;
			const state = this.get();
			if (outLen > state.length) throw new Error("_sha2: outputLen bigger than state");
			for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE2);
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
		_cloneInto(to) {
			to || (to = new this.constructor());
			to.set(...this.get());
			const { blockLen, buffer, length, finished, destroyed, pos } = this;
			to.length = length;
			to.pos = pos;
			to.finished = finished;
			to.destroyed = destroyed;
			if (length % blockLen) to.buffer.set(buffer);
			return to;
		}
	};
	var U32_MASK64 = /* @__PURE__ */ BigInt(4294967295);
	var _32n = /* @__PURE__ */ BigInt(32);
	function fromBig(n, le = false) {
		if (le) return {
			h: Number(n & U32_MASK64),
			l: Number(n >> _32n & U32_MASK64)
		};
		return {
			h: Number(n >> _32n & U32_MASK64) | 0,
			l: Number(n & U32_MASK64) | 0
		};
	}
	function split(lst, le = false) {
		let Ah = new Uint32Array(lst.length);
		let Al = new Uint32Array(lst.length);
		for (let i = 0; i < lst.length; i++) {
			const { h, l } = fromBig(lst[i], le);
			[Ah[i], Al[i]] = [h, l];
		}
		return [Ah, Al];
	}
	var toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
	var shrSH = (h, _l, s) => h >>> s;
	var shrSL = (h, l, s) => h << 32 - s | l >>> s;
	var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
	var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
	var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
	var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
	var rotr32H = (_h, l) => l;
	var rotr32L = (h, _l) => h;
	var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
	var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
	var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
	var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
	function add(Ah, Al, Bh, Bl) {
		const l = (Al >>> 0) + (Bl >>> 0);
		return {
			h: Ah + Bh + (l / 4294967296 | 0) | 0,
			l: l | 0
		};
	}
	var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
	var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 4294967296 | 0) | 0;
	var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
	var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 4294967296 | 0) | 0;
	var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
	var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 4294967296 | 0) | 0;
	var u64 = {
		fromBig,
		split,
		toBig,
		shrSH,
		shrSL,
		rotrSH,
		rotrSL,
		rotrBH,
		rotrBL,
		rotr32H,
		rotr32L,
		rotlSH,
		rotlSL,
		rotlBH,
		rotlBL,
		add,
		add3L,
		add3H,
		add4L,
		add4H,
		add5H,
		add5L
	};
	var u64_default = u64;
	var [SHA512_Kh, SHA512_Kl] = /* @__PURE__ */ (() => u64_default.split([
		"0x428a2f98d728ae22",
		"0x7137449123ef65cd",
		"0xb5c0fbcfec4d3b2f",
		"0xe9b5dba58189dbbc",
		"0x3956c25bf348b538",
		"0x59f111f1b605d019",
		"0x923f82a4af194f9b",
		"0xab1c5ed5da6d8118",
		"0xd807aa98a3030242",
		"0x12835b0145706fbe",
		"0x243185be4ee4b28c",
		"0x550c7dc3d5ffb4e2",
		"0x72be5d74f27b896f",
		"0x80deb1fe3b1696b1",
		"0x9bdc06a725c71235",
		"0xc19bf174cf692694",
		"0xe49b69c19ef14ad2",
		"0xefbe4786384f25e3",
		"0x0fc19dc68b8cd5b5",
		"0x240ca1cc77ac9c65",
		"0x2de92c6f592b0275",
		"0x4a7484aa6ea6e483",
		"0x5cb0a9dcbd41fbd4",
		"0x76f988da831153b5",
		"0x983e5152ee66dfab",
		"0xa831c66d2db43210",
		"0xb00327c898fb213f",
		"0xbf597fc7beef0ee4",
		"0xc6e00bf33da88fc2",
		"0xd5a79147930aa725",
		"0x06ca6351e003826f",
		"0x142929670a0e6e70",
		"0x27b70a8546d22ffc",
		"0x2e1b21385c26c926",
		"0x4d2c6dfc5ac42aed",
		"0x53380d139d95b3df",
		"0x650a73548baf63de",
		"0x766a0abb3c77b2a8",
		"0x81c2c92e47edaee6",
		"0x92722c851482353b",
		"0xa2bfe8a14cf10364",
		"0xa81a664bbc423001",
		"0xc24b8b70d0f89791",
		"0xc76c51a30654be30",
		"0xd192e819d6ef5218",
		"0xd69906245565a910",
		"0xf40e35855771202a",
		"0x106aa07032bbd1b8",
		"0x19a4c116b8d2d0c8",
		"0x1e376c085141ab53",
		"0x2748774cdf8eeb99",
		"0x34b0bcb5e19b48a8",
		"0x391c0cb3c5c95a63",
		"0x4ed8aa4ae3418acb",
		"0x5b9cca4f7763e373",
		"0x682e6ff3d6b2b8a3",
		"0x748f82ee5defb2fc",
		"0x78a5636f43172f60",
		"0x84c87814a1f0ab72",
		"0x8cc702081a6439ec",
		"0x90befffa23631e28",
		"0xa4506cebde82bde9",
		"0xbef9a3f7b2c67915",
		"0xc67178f2e372532b",
		"0xca273eceea26619c",
		"0xd186b8c721c0c207",
		"0xeada7dd6cde0eb1e",
		"0xf57d4f7fee6ed178",
		"0x06f067aa72176fba",
		"0x0a637dc5a2c898a6",
		"0x113f9804bef90dae",
		"0x1b710b35131c471b",
		"0x28db77f523047d84",
		"0x32caab7b40c72493",
		"0x3c9ebe0a15c9bebc",
		"0x431d67c49c100d4c",
		"0x4cc5d4becb3e42b6",
		"0x597f299cfc657e2a",
		"0x5fcb6fab3ad6faec",
		"0x6c44198c4a475817"
	].map((n) => BigInt(n))))();
	var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
	var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
	var SHA512 = class extends SHA2 {
		constructor() {
			super(128, 64, 16, false);
			this.Ah = 1779033703;
			this.Al = -205731576;
			this.Bh = -1150833019;
			this.Bl = -2067093701;
			this.Ch = 1013904242;
			this.Cl = -23791573;
			this.Dh = -1521486534;
			this.Dl = 1595750129;
			this.Eh = 1359893119;
			this.El = -1377402159;
			this.Fh = -1694144372;
			this.Fl = 725511199;
			this.Gh = 528734635;
			this.Gl = -79577749;
			this.Hh = 1541459225;
			this.Hl = 327033209;
		}
		get() {
			const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			return [
				Ah,
				Al,
				Bh,
				Bl,
				Ch,
				Cl,
				Dh,
				Dl,
				Eh,
				El,
				Fh,
				Fl,
				Gh,
				Gl,
				Hh,
				Hl
			];
		}
		set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
			this.Ah = Ah | 0;
			this.Al = Al | 0;
			this.Bh = Bh | 0;
			this.Bl = Bl | 0;
			this.Ch = Ch | 0;
			this.Cl = Cl | 0;
			this.Dh = Dh | 0;
			this.Dl = Dl | 0;
			this.Eh = Eh | 0;
			this.El = El | 0;
			this.Fh = Fh | 0;
			this.Fl = Fl | 0;
			this.Gh = Gh | 0;
			this.Gl = Gl | 0;
			this.Hh = Hh | 0;
			this.Hl = Hl | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) {
				SHA512_W_H[i] = view.getUint32(offset);
				SHA512_W_L[i] = view.getUint32(offset += 4);
			}
			for (let i = 16; i < 80; i++) {
				const W15h = SHA512_W_H[i - 15] | 0;
				const W15l = SHA512_W_L[i - 15] | 0;
				const s0h = u64_default.rotrSH(W15h, W15l, 1) ^ u64_default.rotrSH(W15h, W15l, 8) ^ u64_default.shrSH(W15h, W15l, 7);
				const s0l = u64_default.rotrSL(W15h, W15l, 1) ^ u64_default.rotrSL(W15h, W15l, 8) ^ u64_default.shrSL(W15h, W15l, 7);
				const W2h = SHA512_W_H[i - 2] | 0;
				const W2l = SHA512_W_L[i - 2] | 0;
				const s1h = u64_default.rotrSH(W2h, W2l, 19) ^ u64_default.rotrBH(W2h, W2l, 61) ^ u64_default.shrSH(W2h, W2l, 6);
				const s1l = u64_default.rotrSL(W2h, W2l, 19) ^ u64_default.rotrBL(W2h, W2l, 61) ^ u64_default.shrSL(W2h, W2l, 6);
				const SUMl = u64_default.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
				const SUMh = u64_default.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
				SHA512_W_H[i] = SUMh | 0;
				SHA512_W_L[i] = SUMl | 0;
			}
			let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			for (let i = 0; i < 80; i++) {
				const sigma1h = u64_default.rotrSH(Eh, El, 14) ^ u64_default.rotrSH(Eh, El, 18) ^ u64_default.rotrBH(Eh, El, 41);
				const sigma1l = u64_default.rotrSL(Eh, El, 14) ^ u64_default.rotrSL(Eh, El, 18) ^ u64_default.rotrBL(Eh, El, 41);
				const CHIh = Eh & Fh ^ ~Eh & Gh;
				const CHIl = El & Fl ^ ~El & Gl;
				const T1ll = u64_default.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
				const T1h = u64_default.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
				const T1l = T1ll | 0;
				const sigma0h = u64_default.rotrSH(Ah, Al, 28) ^ u64_default.rotrBH(Ah, Al, 34) ^ u64_default.rotrBH(Ah, Al, 39);
				const sigma0l = u64_default.rotrSL(Ah, Al, 28) ^ u64_default.rotrBL(Ah, Al, 34) ^ u64_default.rotrBL(Ah, Al, 39);
				const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
				const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
				Hh = Gh | 0;
				Hl = Gl | 0;
				Gh = Fh | 0;
				Gl = Fl | 0;
				Fh = Eh | 0;
				Fl = El | 0;
				({h: Eh, l: El} = u64_default.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
				Dh = Ch | 0;
				Dl = Cl | 0;
				Ch = Bh | 0;
				Cl = Bl | 0;
				Bh = Ah | 0;
				Bl = Al | 0;
				const All = u64_default.add3L(T1l, sigma0l, MAJl);
				Ah = u64_default.add3H(All, T1h, sigma0h, MAJh);
				Al = All | 0;
			}
			({h: Ah, l: Al} = u64_default.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
			({h: Bh, l: Bl} = u64_default.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
			({h: Ch, l: Cl} = u64_default.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
			({h: Dh, l: Dl} = u64_default.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
			({h: Eh, l: El} = u64_default.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
			({h: Fh, l: Fl} = u64_default.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
			({h: Gh, l: Gl} = u64_default.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
			({h: Hh, l: Hl} = u64_default.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
			this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
		}
		roundClean() {
			SHA512_W_H.fill(0);
			SHA512_W_L.fill(0);
		}
		destroy() {
			this.buffer.fill(0);
			this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	var sha512$1 = /* @__PURE__ */ wrapConstructor(() => new SHA512());
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	function isBytes3(a) {
		return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
	}
	var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	function bytesToHex(bytes2) {
		if (!isBytes3(bytes2)) throw new Error("Uint8Array expected");
		let hex = "";
		for (let i = 0; i < bytes2.length; i++) hex += hexes[bytes2[i]];
		return hex;
	}
	function hexToNumber(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		return BigInt(hex === "" ? "0" : `0x${hex}`);
	}
	var asciis = {
		_0: 48,
		_9: 57,
		_A: 65,
		_F: 70,
		_a: 97,
		_f: 102
	};
	function asciiToBase16(char) {
		if (char >= asciis._0 && char <= asciis._9) return char - asciis._0;
		if (char >= asciis._A && char <= asciis._F) return char - (asciis._A - 10);
		if (char >= asciis._a && char <= asciis._f) return char - (asciis._a - 10);
		return;
	}
	function hexToBytes(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		const hl = hex.length;
		const al = hl / 2;
		if (hl % 2) throw new Error("padded hex string expected, got unpadded hex of length " + hl);
		const array = new Uint8Array(al);
		for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
			const n1 = asciiToBase16(hex.charCodeAt(hi));
			const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
			if (n1 === void 0 || n2 === void 0) {
				const char = hex[hi] + hex[hi + 1];
				throw new Error("hex string expected, got non-hex character \"" + char + "\" at index " + hi);
			}
			array[ai] = n1 * 16 + n2;
		}
		return array;
	}
	function bytesToNumberBE(bytes2) {
		return hexToNumber(bytesToHex(bytes2));
	}
	function bytesToNumberLE(bytes2) {
		if (!isBytes3(bytes2)) throw new Error("Uint8Array expected");
		return hexToNumber(bytesToHex(Uint8Array.from(bytes2).reverse()));
	}
	function numberToBytesBE(n, len) {
		return hexToBytes(n.toString(16).padStart(len * 2, "0"));
	}
	function numberToBytesLE(n, len) {
		return numberToBytesBE(n, len).reverse();
	}
	function ensureBytes(title, hex, expectedLength) {
		let res;
		if (typeof hex === "string") try {
			res = hexToBytes(hex);
		} catch (e) {
			throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e}`);
		}
else if (isBytes3(hex)) res = Uint8Array.from(hex);
else throw new Error(`${title} must be hex string or Uint8Array`);
		const len = res.length;
		if (typeof expectedLength === "number" && len !== expectedLength) throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
		return res;
	}
	function concatBytes2(...arrays) {
		let sum = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			if (!isBytes3(a)) throw new Error("Uint8Array expected");
			sum += a.length;
		}
		let res = new Uint8Array(sum);
		let pad = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			res.set(a, pad);
			pad += a.length;
		}
		return res;
	}
	var bitMask = (n) => (_2n << BigInt(n - 1)) - _1n;
	var validatorFns = {
		bigint: (val) => typeof val === "bigint",
		function: (val) => typeof val === "function",
		boolean: (val) => typeof val === "boolean",
		string: (val) => typeof val === "string",
		stringOrUint8Array: (val) => typeof val === "string" || isBytes3(val),
		isSafeInteger: (val) => Number.isSafeInteger(val),
		array: (val) => Array.isArray(val),
		field: (val, object) => object.Fp.isValid(val),
		hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
	};
	function validateObject(object, validators, optValidators = {}) {
		const checkField = (fieldName, type, isOptional) => {
			const checkVal = validatorFns[type];
			if (typeof checkVal !== "function") throw new Error(`Invalid validator "${type}", expected function`);
			const val = object[fieldName];
			if (isOptional && val === void 0) return;
			if (!checkVal(val, object)) throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
		};
		for (const [fieldName, type] of Object.entries(validators)) checkField(fieldName, type, false);
		for (const [fieldName, type] of Object.entries(optValidators)) checkField(fieldName, type, true);
		return object;
	}
	var _0n2 = BigInt(0);
	var _1n2 = BigInt(1);
	var _2n2 = BigInt(2);
	var _3n = BigInt(3);
	var _4n = BigInt(4);
	var _5n = BigInt(5);
	var _8n = BigInt(8);
	var _9n = BigInt(9);
	var _16n = BigInt(16);
	function mod(a, b) {
		const result = a % b;
		return result >= _0n2 ? result : b + result;
	}
	function pow(num, power, modulo) {
		if (modulo <= _0n2 || power < _0n2) throw new Error("Expected power/modulo > 0");
		if (modulo === _1n2) return _0n2;
		let res = _1n2;
		while (power > _0n2) {
			if (power & _1n2) res = res * num % modulo;
			num = num * num % modulo;
			power >>= _1n2;
		}
		return res;
	}
	function pow2(x, power, modulo) {
		let res = x;
		while (power-- > _0n2) {
			res *= res;
			res %= modulo;
		}
		return res;
	}
	function invert(number, modulo) {
		if (number === _0n2 || modulo <= _0n2) throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
		let a = mod(number, modulo);
		let b = modulo;
		let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
		while (a !== _0n2) {
			const q = b / a;
			const r = b % a;
			const m = x - u * q;
			const n = y - v * q;
			b = a, a = r, x = u, y = v, u = m, v = n;
		}
		const gcd = b;
		if (gcd !== _1n2) throw new Error("invert: does not exist");
		return mod(x, modulo);
	}
	function tonelliShanks(P) {
		const legendreC = (P - _1n2) / _2n2;
		let Q, S, Z;
		for (Q = P - _1n2, S = 0; Q % _2n2 === _0n2; Q /= _2n2, S++);
		for (Z = _2n2; Z < P && pow(Z, legendreC, P) !== P - _1n2; Z++);
		if (S === 1) {
			const p1div4 = (P + _1n2) / _4n;
			return function tonelliFast(Fp2, n) {
				const root = Fp2.pow(n, p1div4);
				if (!Fp2.eql(Fp2.sqr(root), n)) throw new Error("Cannot find square root");
				return root;
			};
		}
		const Q1div2 = (Q + _1n2) / _2n2;
		return function tonelliSlow(Fp2, n) {
			if (Fp2.pow(n, legendreC) === Fp2.neg(Fp2.ONE)) throw new Error("Cannot find square root");
			let r = S;
			let g = Fp2.pow(Fp2.mul(Fp2.ONE, Z), Q);
			let x = Fp2.pow(n, Q1div2);
			let b = Fp2.pow(n, Q);
			while (!Fp2.eql(b, Fp2.ONE)) {
				if (Fp2.eql(b, Fp2.ZERO)) return Fp2.ZERO;
				let m = 1;
				for (let t2 = Fp2.sqr(b); m < r; m++) {
					if (Fp2.eql(t2, Fp2.ONE)) break;
					t2 = Fp2.sqr(t2);
				}
				const ge = Fp2.pow(g, _1n2 << BigInt(r - m - 1));
				g = Fp2.sqr(ge);
				x = Fp2.mul(x, ge);
				b = Fp2.mul(b, g);
				r = m;
			}
			return x;
		};
	}
	function FpSqrt(P) {
		if (P % _4n === _3n) {
			const p1div4 = (P + _1n2) / _4n;
			return function sqrt3mod4(Fp2, n) {
				const root = Fp2.pow(n, p1div4);
				if (!Fp2.eql(Fp2.sqr(root), n)) throw new Error("Cannot find square root");
				return root;
			};
		}
		if (P % _8n === _5n) {
			const c1 = (P - _5n) / _8n;
			return function sqrt5mod8(Fp2, n) {
				const n2 = Fp2.mul(n, _2n2);
				const v = Fp2.pow(n2, c1);
				const nv = Fp2.mul(n, v);
				const i = Fp2.mul(Fp2.mul(nv, _2n2), v);
				const root = Fp2.mul(nv, Fp2.sub(i, Fp2.ONE));
				if (!Fp2.eql(Fp2.sqr(root), n)) throw new Error("Cannot find square root");
				return root;
			};
		}
		if (P % _16n === _9n) {}
		return tonelliShanks(P);
	}
	var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n2) === _1n2;
	var FIELD_FIELDS = [
		"create",
		"isValid",
		"is0",
		"neg",
		"inv",
		"sqrt",
		"sqr",
		"eql",
		"add",
		"sub",
		"mul",
		"pow",
		"div",
		"addN",
		"subN",
		"mulN",
		"sqrN"
	];
	function validateField(field) {
		const initial = {
			ORDER: "bigint",
			MASK: "bigint",
			BYTES: "isSafeInteger",
			BITS: "isSafeInteger"
		};
		const opts = FIELD_FIELDS.reduce((map, val) => {
			map[val] = "function";
			return map;
		}, initial);
		return validateObject(field, opts);
	}
	function FpPow(f, num, power) {
		if (power < _0n2) throw new Error("Expected power > 0");
		if (power === _0n2) return f.ONE;
		if (power === _1n2) return num;
		let p = f.ONE;
		let d = num;
		while (power > _0n2) {
			if (power & _1n2) p = f.mul(p, d);
			d = f.sqr(d);
			power >>= _1n2;
		}
		return p;
	}
	function FpInvertBatch(f, nums) {
		const tmp = new Array(nums.length);
		const lastMultiplied = nums.reduce((acc, num, i) => {
			if (f.is0(num)) return acc;
			tmp[i] = acc;
			return f.mul(acc, num);
		}, f.ONE);
		const inverted = f.inv(lastMultiplied);
		nums.reduceRight((acc, num, i) => {
			if (f.is0(num)) return acc;
			tmp[i] = f.mul(acc, tmp[i]);
			return f.mul(acc, num);
		}, inverted);
		return tmp;
	}
	function nLength(n, nBitLength) {
		const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
		const nByteLength = Math.ceil(_nBitLength / 8);
		return {
			nBitLength: _nBitLength,
			nByteLength
		};
	}
	function Field(ORDER, bitLen, isLE2 = false, redef = {}) {
		if (ORDER <= _0n2) throw new Error(`Expected Field ORDER > 0, got ${ORDER}`);
		const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen);
		if (BYTES > 2048) throw new Error("Field lengths over 2048 bytes are not supported");
		const sqrtP = FpSqrt(ORDER);
		const f = Object.freeze({
			ORDER,
			BITS,
			BYTES,
			MASK: bitMask(BITS),
			ZERO: _0n2,
			ONE: _1n2,
			create: (num) => mod(num, ORDER),
			isValid: (num) => {
				if (typeof num !== "bigint") throw new Error(`Invalid field element: expected bigint, got ${typeof num}`);
				return _0n2 <= num && num < ORDER;
			},
			is0: (num) => num === _0n2,
			isOdd: (num) => (num & _1n2) === _1n2,
			neg: (num) => mod(-num, ORDER),
			eql: (lhs, rhs) => lhs === rhs,
			sqr: (num) => mod(num * num, ORDER),
			add: (lhs, rhs) => mod(lhs + rhs, ORDER),
			sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
			mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
			pow: (num, power) => FpPow(f, num, power),
			div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
			sqrN: (num) => num * num,
			addN: (lhs, rhs) => lhs + rhs,
			subN: (lhs, rhs) => lhs - rhs,
			mulN: (lhs, rhs) => lhs * rhs,
			inv: (num) => invert(num, ORDER),
			sqrt: redef.sqrt || ((n) => sqrtP(f, n)),
			invertBatch: (lst) => FpInvertBatch(f, lst),
			cmov: (a, b, c) => c ? b : a,
			toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
			fromBytes: (bytes2) => {
				if (bytes2.length !== BYTES) throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes2.length}`);
				return isLE2 ? bytesToNumberLE(bytes2) : bytesToNumberBE(bytes2);
			}
		});
		return Object.freeze(f);
	}
	function FpSqrtEven(Fp2, elm) {
		if (!Fp2.isOdd) throw new Error(`Field doesn't have isOdd`);
		const root = Fp2.sqrt(elm);
		return Fp2.isOdd(root) ? Fp2.neg(root) : root;
	}
	var _0n3 = BigInt(0);
	var _1n3 = BigInt(1);
	function wNAF(c, bits) {
		const constTimeNegate = (condition, item) => {
			const neg = item.negate();
			return condition ? neg : item;
		};
		const opts = (W) => {
			const windows = Math.ceil(bits / W) + 1;
			const windowSize = 2 ** (W - 1);
			return {
				windows,
				windowSize
			};
		};
		return {
			constTimeNegate,
			unsafeLadder(elm, n) {
				let p = c.ZERO;
				let d = elm;
				while (n > _0n3) {
					if (n & _1n3) p = p.add(d);
					d = d.double();
					n >>= _1n3;
				}
				return p;
			},
			precomputeWindow(elm, W) {
				const { windows, windowSize } = opts(W);
				const points = [];
				let p = elm;
				let base = p;
				for (let window = 0; window < windows; window++) {
					base = p;
					points.push(base);
					for (let i = 1; i < windowSize; i++) {
						base = base.add(p);
						points.push(base);
					}
					p = base.double();
				}
				return points;
			},
			wNAF(W, precomputes, n) {
				const { windows, windowSize } = opts(W);
				let p = c.ZERO;
				let f = c.BASE;
				const mask$1 = BigInt(2 ** W - 1);
				const maxNumber = 2 ** W;
				const shiftBy = BigInt(W);
				for (let window = 0; window < windows; window++) {
					const offset = window * windowSize;
					let wbits = Number(n & mask$1);
					n >>= shiftBy;
					if (wbits > windowSize) {
						wbits -= maxNumber;
						n += _1n3;
					}
					const offset1 = offset;
					const offset2 = offset + Math.abs(wbits) - 1;
					const cond1 = window % 2 !== 0;
					const cond2 = wbits < 0;
					if (wbits === 0) f = f.add(constTimeNegate(cond1, precomputes[offset1]));
else p = p.add(constTimeNegate(cond2, precomputes[offset2]));
				}
				return {
					p,
					f
				};
			},
			wNAFCached(P, precomputesMap, n, transform) {
				const W = P._WINDOW_SIZE || 1;
				let comp = precomputesMap.get(P);
				if (!comp) {
					comp = this.precomputeWindow(P, W);
					if (W !== 1) precomputesMap.set(P, transform(comp));
				}
				return this.wNAF(W, comp, n);
			}
		};
	}
	function validateBasic(curve) {
		validateField(curve.Fp);
		validateObject(curve, {
			n: "bigint",
			h: "bigint",
			Gx: "field",
			Gy: "field"
		}, {
			nBitLength: "isSafeInteger",
			nByteLength: "isSafeInteger"
		});
		return Object.freeze({
			...nLength(curve.n, curve.nBitLength),
			...curve,
			...{ p: curve.Fp.ORDER }
		});
	}
	var _0n4 = BigInt(0);
	var _1n4 = BigInt(1);
	var _2n3 = BigInt(2);
	var _8n2 = BigInt(8);
	var VERIFY_DEFAULT = { zip215: true };
	function validateOpts(curve) {
		const opts = validateBasic(curve);
		validateObject(curve, {
			hash: "function",
			a: "bigint",
			d: "bigint",
			randomBytes: "function"
		}, {
			adjustScalarBytes: "function",
			domain: "function",
			uvRatio: "function",
			mapToCurve: "function"
		});
		return Object.freeze({ ...opts });
	}
	function twistedEdwards(curveDef) {
		const CURVE = validateOpts(curveDef);
		const { Fp: Fp2, n: CURVE_ORDER, prehash, hash: cHash, randomBytes: randomBytes2, nByteLength, h: cofactor } = CURVE;
		const MASK = _2n3 << BigInt(nByteLength * 8) - _1n4;
		const modP = Fp2.create;
		const uvRatio2 = CURVE.uvRatio || ((u, v) => {
			try {
				return {
					isValid: true,
					value: Fp2.sqrt(u * Fp2.inv(v))
				};
			} catch (e) {
				return {
					isValid: false,
					value: _0n4
				};
			}
		});
		const adjustScalarBytes2 = CURVE.adjustScalarBytes || ((bytes2) => bytes2);
		const domain = CURVE.domain || ((data, ctx, phflag) => {
			if (ctx.length || phflag) throw new Error("Contexts/pre-hash are not supported");
			return data;
		});
		const inBig = (n) => typeof n === "bigint" && _0n4 < n;
		const inRange = (n, max) => inBig(n) && inBig(max) && n < max;
		const in0MaskRange = (n) => n === _0n4 || inRange(n, MASK);
		function assertInRange(n, max) {
			if (inRange(n, max)) return n;
			throw new Error(`Expected valid scalar < ${max}, got ${typeof n} ${n}`);
		}
		function assertGE0(n) {
			return n === _0n4 ? n : assertInRange(n, CURVE_ORDER);
		}
		const pointPrecomputes = /* @__PURE__ */ new Map();
		function isPoint(other) {
			if (!(other instanceof Point)) throw new Error("ExtendedPoint expected");
		}
		class Point {
			constructor(ex, ey, ez, et) {
				this.ex = ex;
				this.ey = ey;
				this.ez = ez;
				this.et = et;
				if (!in0MaskRange(ex)) throw new Error("x required");
				if (!in0MaskRange(ey)) throw new Error("y required");
				if (!in0MaskRange(ez)) throw new Error("z required");
				if (!in0MaskRange(et)) throw new Error("t required");
			}
			get x() {
				return this.toAffine().x;
			}
			get y() {
				return this.toAffine().y;
			}
			static fromAffine(p) {
				if (p instanceof Point) throw new Error("extended point not allowed");
				const { x, y } = p || {};
				if (!in0MaskRange(x) || !in0MaskRange(y)) throw new Error("invalid affine point");
				return new Point(x, y, _1n4, modP(x * y));
			}
			static normalizeZ(points) {
				const toInv = Fp2.invertBatch(points.map((p) => p.ez));
				return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
			}
			_setWindowSize(windowSize) {
				this._WINDOW_SIZE = windowSize;
				pointPrecomputes.delete(this);
			}
			assertValidity() {
				const { a, d } = CURVE;
				if (this.is0()) throw new Error("bad point: ZERO");
				const { ex: X, ey: Y, ez: Z, et: T } = this;
				const X2 = modP(X * X);
				const Y2 = modP(Y * Y);
				const Z2 = modP(Z * Z);
				const Z4 = modP(Z2 * Z2);
				const aX2 = modP(X2 * a);
				const left = modP(Z2 * modP(aX2 + Y2));
				const right = modP(Z4 + modP(d * modP(X2 * Y2)));
				if (left !== right) throw new Error("bad point: equation left != right (1)");
				const XY = modP(X * Y);
				const ZT = modP(Z * T);
				if (XY !== ZT) throw new Error("bad point: equation left != right (2)");
			}
			equals(other) {
				isPoint(other);
				const { ex: X1, ey: Y1, ez: Z1 } = this;
				const { ex: X2, ey: Y2, ez: Z2 } = other;
				const X1Z2 = modP(X1 * Z2);
				const X2Z1 = modP(X2 * Z1);
				const Y1Z2 = modP(Y1 * Z2);
				const Y2Z1 = modP(Y2 * Z1);
				return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
			}
			is0() {
				return this.equals(Point.ZERO);
			}
			negate() {
				return new Point(modP(-this.ex), this.ey, this.ez, modP(-this.et));
			}
			double() {
				const { a } = CURVE;
				const { ex: X1, ey: Y1, ez: Z1 } = this;
				const A = modP(X1 * X1);
				const B = modP(Y1 * Y1);
				const C = modP(_2n3 * modP(Z1 * Z1));
				const D = modP(a * A);
				const x1y1 = X1 + Y1;
				const E = modP(modP(x1y1 * x1y1) - A - B);
				const G2 = D + B;
				const F = G2 - C;
				const H = D - B;
				const X3 = modP(E * F);
				const Y3 = modP(G2 * H);
				const T3 = modP(E * H);
				const Z3 = modP(F * G2);
				return new Point(X3, Y3, Z3, T3);
			}
			add(other) {
				isPoint(other);
				const { a, d } = CURVE;
				const { ex: X1, ey: Y1, ez: Z1, et: T1 } = this;
				const { ex: X2, ey: Y2, ez: Z2, et: T2 } = other;
				if (a === BigInt(-1)) {
					const A2 = modP((Y1 - X1) * (Y2 + X2));
					const B2 = modP((Y1 + X1) * (Y2 - X2));
					const F2 = modP(B2 - A2);
					if (F2 === _0n4) return this.double();
					const C2 = modP(Z1 * _2n3 * T2);
					const D2 = modP(T1 * _2n3 * Z2);
					const E2 = D2 + C2;
					const G3 = B2 + A2;
					const H2 = D2 - C2;
					const X32 = modP(E2 * F2);
					const Y32 = modP(G3 * H2);
					const T32 = modP(E2 * H2);
					const Z32 = modP(F2 * G3);
					return new Point(X32, Y32, Z32, T32);
				}
				const A = modP(X1 * X2);
				const B = modP(Y1 * Y2);
				const C = modP(T1 * d * T2);
				const D = modP(Z1 * Z2);
				const E = modP((X1 + Y1) * (X2 + Y2) - A - B);
				const F = D - C;
				const G2 = D + C;
				const H = modP(B - a * A);
				const X3 = modP(E * F);
				const Y3 = modP(G2 * H);
				const T3 = modP(E * H);
				const Z3 = modP(F * G2);
				return new Point(X3, Y3, Z3, T3);
			}
			subtract(other) {
				return this.add(other.negate());
			}
			wNAF(n) {
				return wnaf.wNAFCached(this, pointPrecomputes, n, Point.normalizeZ);
			}
			multiply(scalar) {
				const { p, f } = this.wNAF(assertInRange(scalar, CURVE_ORDER));
				return Point.normalizeZ([p, f])[0];
			}
			multiplyUnsafe(scalar) {
				let n = assertGE0(scalar);
				if (n === _0n4) return I;
				if (this.equals(I) || n === _1n4) return this;
				if (this.equals(G)) return this.wNAF(n).p;
				return wnaf.unsafeLadder(this, n);
			}
			isSmallOrder() {
				return this.multiplyUnsafe(cofactor).is0();
			}
			isTorsionFree() {
				return wnaf.unsafeLadder(this, CURVE_ORDER).is0();
			}
			toAffine(iz) {
				const { ex: x, ey: y, ez: z } = this;
				const is0 = this.is0();
				if (iz == null) iz = is0 ? _8n2 : Fp2.inv(z);
				const ax = modP(x * iz);
				const ay = modP(y * iz);
				const zz = modP(z * iz);
				if (is0) return {
					x: _0n4,
					y: _1n4
				};
				if (zz !== _1n4) throw new Error("invZ was invalid");
				return {
					x: ax,
					y: ay
				};
			}
			clearCofactor() {
				const { h: cofactor2 } = CURVE;
				if (cofactor2 === _1n4) return this;
				return this.multiplyUnsafe(cofactor2);
			}
			static fromHex(hex, zip215 = false) {
				const { d, a } = CURVE;
				const len = Fp2.BYTES;
				hex = ensureBytes("pointHex", hex, len);
				const normed = hex.slice();
				const lastByte = hex[len - 1];
				normed[len - 1] = lastByte & -129;
				const y = bytesToNumberLE(normed);
				if (y === _0n4) {} else if (zip215) assertInRange(y, MASK);
else assertInRange(y, Fp2.ORDER);
				const y2 = modP(y * y);
				const u = modP(y2 - _1n4);
				const v = modP(d * y2 - a);
				let { isValid, value: x } = uvRatio2(u, v);
				if (!isValid) throw new Error("Point.fromHex: invalid y coordinate");
				const isXOdd = (x & _1n4) === _1n4;
				const isLastByteOdd = (lastByte & 128) !== 0;
				if (!zip215 && x === _0n4 && isLastByteOdd) throw new Error("Point.fromHex: x=0 and x_0=1");
				if (isLastByteOdd !== isXOdd) x = modP(-x);
				return Point.fromAffine({
					x,
					y
				});
			}
			static fromPrivateKey(privKey) {
				return getExtendedPublicKey(privKey).point;
			}
			toRawBytes() {
				const { x, y } = this.toAffine();
				const bytes2 = numberToBytesLE(y, Fp2.BYTES);
				bytes2[bytes2.length - 1] |= x & _1n4 ? 128 : 0;
				return bytes2;
			}
			toHex() {
				return bytesToHex(this.toRawBytes());
			}
		}
		Point.BASE = new Point(CURVE.Gx, CURVE.Gy, _1n4, modP(CURVE.Gx * CURVE.Gy));
		Point.ZERO = new Point(_0n4, _1n4, _1n4, _0n4);
		const { BASE: G, ZERO: I } = Point;
		const wnaf = wNAF(Point, nByteLength * 8);
		function modN(a) {
			return mod(a, CURVE_ORDER);
		}
		function modN_LE(hash) {
			return modN(bytesToNumberLE(hash));
		}
		function getExtendedPublicKey(key) {
			const len = nByteLength;
			key = ensureBytes("private key", key, len);
			const hashed = ensureBytes("hashed private key", cHash(key), 2 * len);
			const head = adjustScalarBytes2(hashed.slice(0, len));
			const prefix = hashed.slice(len, 2 * len);
			const scalar = modN_LE(head);
			const point = G.multiply(scalar);
			const pointBytes = point.toRawBytes();
			return {
				head,
				prefix,
				scalar,
				point,
				pointBytes
			};
		}
		function getPublicKey(privKey) {
			return getExtendedPublicKey(privKey).pointBytes;
		}
		function hashDomainToScalar(context = new Uint8Array(), ...msgs) {
			const msg = concatBytes2(...msgs);
			return modN_LE(cHash(domain(msg, ensureBytes("context", context), !!prehash)));
		}
		function sign(msg, privKey, options = {}) {
			msg = ensureBytes("message", msg);
			if (prehash) msg = prehash(msg);
			const { prefix, scalar, pointBytes } = getExtendedPublicKey(privKey);
			const r = hashDomainToScalar(options.context, prefix, msg);
			const R = G.multiply(r).toRawBytes();
			const k = hashDomainToScalar(options.context, R, pointBytes, msg);
			const s = modN(r + k * scalar);
			assertGE0(s);
			const res = concatBytes2(R, numberToBytesLE(s, Fp2.BYTES));
			return ensureBytes("result", res, nByteLength * 2);
		}
		const verifyOpts = VERIFY_DEFAULT;
		function verify(sig, msg, publicKey, options = verifyOpts) {
			const { context, zip215 } = options;
			const len = Fp2.BYTES;
			sig = ensureBytes("signature", sig, 2 * len);
			msg = ensureBytes("message", msg);
			if (prehash) msg = prehash(msg);
			const s = bytesToNumberLE(sig.slice(len, 2 * len));
			let A, R, SB;
			try {
				A = Point.fromHex(publicKey, zip215);
				R = Point.fromHex(sig.slice(0, len), zip215);
				SB = G.multiplyUnsafe(s);
			} catch (error) {
				return false;
			}
			if (!zip215 && A.isSmallOrder()) return false;
			const k = hashDomainToScalar(context, R.toRawBytes(), A.toRawBytes(), msg);
			const RkA = R.add(A.multiplyUnsafe(k));
			return RkA.subtract(SB).clearCofactor().equals(Point.ZERO);
		}
		G._setWindowSize(8);
		const utils = {
			getExtendedPublicKey,
			randomPrivateKey: () => randomBytes2(Fp2.BYTES),
			precompute(windowSize = 8, point = Point.BASE) {
				point._setWindowSize(windowSize);
				point.multiply(BigInt(3));
				return point;
			}
		};
		return {
			CURVE,
			getPublicKey,
			sign,
			verify,
			ExtendedPoint: Point,
			utils
		};
	}
	var _0n5 = BigInt(0);
	var _1n5 = BigInt(1);
	function validateOpts2(curve) {
		validateObject(curve, { a: "bigint" }, {
			montgomeryBits: "isSafeInteger",
			nByteLength: "isSafeInteger",
			adjustScalarBytes: "function",
			domain: "function",
			powPminus2: "function",
			Gu: "bigint"
		});
		return Object.freeze({ ...curve });
	}
	function montgomery(curveDef) {
		const CURVE = validateOpts2(curveDef);
		const { P } = CURVE;
		const modP = (n) => mod(n, P);
		const montgomeryBits = CURVE.montgomeryBits;
		const montgomeryBytes = Math.ceil(montgomeryBits / 8);
		const fieldLen = CURVE.nByteLength;
		const adjustScalarBytes2 = CURVE.adjustScalarBytes || ((bytes2) => bytes2);
		const powPminus2 = CURVE.powPminus2 || ((x) => pow(x, P - BigInt(2), P));
		function cswap(swap, x_2, x_3) {
			const dummy = modP(swap * (x_2 - x_3));
			x_2 = modP(x_2 - dummy);
			x_3 = modP(x_3 + dummy);
			return [x_2, x_3];
		}
		function assertFieldElement(n) {
			if (typeof n === "bigint" && _0n5 <= n && n < P) return n;
			throw new Error("Expected valid scalar 0 < scalar < CURVE.P");
		}
		const a24 = (CURVE.a - BigInt(2)) / BigInt(4);
		function montgomeryLadder(pointU, scalar) {
			const u = assertFieldElement(pointU);
			const k = assertFieldElement(scalar);
			const x_1 = u;
			let x_2 = _1n5;
			let z_2 = _0n5;
			let x_3 = u;
			let z_3 = _1n5;
			let swap = _0n5;
			let sw;
			for (let t$1 = BigInt(montgomeryBits - 1); t$1 >= _0n5; t$1--) {
				const k_t = k >> t$1 & _1n5;
				swap ^= k_t;
				sw = cswap(swap, x_2, x_3);
				x_2 = sw[0];
				x_3 = sw[1];
				sw = cswap(swap, z_2, z_3);
				z_2 = sw[0];
				z_3 = sw[1];
				swap = k_t;
				const A = x_2 + z_2;
				const AA = modP(A * A);
				const B = x_2 - z_2;
				const BB = modP(B * B);
				const E = AA - BB;
				const C = x_3 + z_3;
				const D = x_3 - z_3;
				const DA = modP(D * A);
				const CB = modP(C * B);
				const dacb = DA + CB;
				const da_cb = DA - CB;
				x_3 = modP(dacb * dacb);
				z_3 = modP(x_1 * modP(da_cb * da_cb));
				x_2 = modP(AA * BB);
				z_2 = modP(E * (AA + modP(a24 * E)));
			}
			sw = cswap(swap, x_2, x_3);
			x_2 = sw[0];
			x_3 = sw[1];
			sw = cswap(swap, z_2, z_3);
			z_2 = sw[0];
			z_3 = sw[1];
			const z2 = powPminus2(z_2);
			return modP(x_2 * z2);
		}
		function encodeUCoordinate(u) {
			return numberToBytesLE(modP(u), montgomeryBytes);
		}
		function decodeUCoordinate(uEnc) {
			const u = ensureBytes("u coordinate", uEnc, montgomeryBytes);
			if (fieldLen === 32) u[31] &= 127;
			return bytesToNumberLE(u);
		}
		function decodeScalar(n) {
			const bytes2 = ensureBytes("scalar", n);
			const len = bytes2.length;
			if (len !== montgomeryBytes && len !== fieldLen) throw new Error(`Expected ${montgomeryBytes} or ${fieldLen} bytes, got ${len}`);
			return bytesToNumberLE(adjustScalarBytes2(bytes2));
		}
		function scalarMult(scalar, u) {
			const pointU = decodeUCoordinate(u);
			const _scalar = decodeScalar(scalar);
			const pu = montgomeryLadder(pointU, _scalar);
			if (pu === _0n5) throw new Error("Invalid private or public key received");
			return encodeUCoordinate(pu);
		}
		const GuBytes = encodeUCoordinate(CURVE.Gu);
		function scalarMultBase(scalar) {
			return scalarMult(scalar, GuBytes);
		}
		return {
			scalarMult,
			scalarMultBase,
			getSharedSecret: (privateKey, publicKey) => scalarMult(privateKey, publicKey),
			getPublicKey: (privateKey) => scalarMultBase(privateKey),
			utils: { randomPrivateKey: () => CURVE.randomBytes(CURVE.nByteLength) },
			GuBytes
		};
	}
	var ED25519_P = BigInt("57896044618658097711785492504343953926634992332820282019728792003956564819949");
	var ED25519_SQRT_M1 = BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
	var _0n6 = BigInt(0);
	var _1n6 = BigInt(1);
	var _2n4 = BigInt(2);
	var _5n2 = BigInt(5);
	var _10n = BigInt(10);
	var _20n = BigInt(20);
	var _40n = BigInt(40);
	var _80n = BigInt(80);
	function ed25519_pow_2_252_3(x) {
		const P = ED25519_P;
		const x2 = x * x % P;
		const b2 = x2 * x % P;
		const b4 = pow2(b2, _2n4, P) * b2 % P;
		const b5 = pow2(b4, _1n6, P) * x % P;
		const b10 = pow2(b5, _5n2, P) * b5 % P;
		const b20 = pow2(b10, _10n, P) * b10 % P;
		const b40 = pow2(b20, _20n, P) * b20 % P;
		const b80 = pow2(b40, _40n, P) * b40 % P;
		const b160 = pow2(b80, _80n, P) * b80 % P;
		const b240 = pow2(b160, _80n, P) * b80 % P;
		const b250 = pow2(b240, _10n, P) * b10 % P;
		const pow_p_5_8 = pow2(b250, _2n4, P) * x % P;
		return {
			pow_p_5_8,
			b2
		};
	}
	function adjustScalarBytes(bytes2) {
		bytes2[0] &= 248;
		bytes2[31] &= 127;
		bytes2[31] |= 64;
		return bytes2;
	}
	function uvRatio(u, v) {
		const P = ED25519_P;
		const v3 = mod(v * v * v, P);
		const v7 = mod(v3 * v3 * v, P);
		const pow3 = ed25519_pow_2_252_3(u * v7).pow_p_5_8;
		let x = mod(u * v3 * pow3, P);
		const vx2 = mod(v * x * x, P);
		const root1 = x;
		const root2 = mod(x * ED25519_SQRT_M1, P);
		const useRoot1 = vx2 === u;
		const useRoot2 = vx2 === mod(-u, P);
		const noRoot = vx2 === mod(-u * ED25519_SQRT_M1, P);
		if (useRoot1) x = root1;
		if (useRoot2 || noRoot) x = root2;
		if (isNegativeLE(x, P)) x = mod(-x, P);
		return {
			isValid: useRoot1 || useRoot2,
			value: x
		};
	}
	var Fp = Field(ED25519_P, void 0, true);
	var ed25519Defaults = {
		a: BigInt(-1),
		d: BigInt("37095705934669439343138083508754565189542113879843219016388785533085940283555"),
		Fp,
		n: BigInt("7237005577332262213973186563042994240857116359379907606001950938285454250989"),
		h: BigInt(8),
		Gx: BigInt("15112221349535400772501151409588531511454012693041857206046113283949847762202"),
		Gy: BigInt("46316835694926478169428394003475163141307993866256225615783033603165251855960"),
		hash: sha512$1,
		randomBytes,
		adjustScalarBytes,
		uvRatio
	};
	function ed25519_domain(data, ctx, phflag) {
		if (ctx.length > 255) throw new Error("Context is too big");
		return concatBytes(utf8ToBytes("SigEd25519 no Ed25519 collisions"), new Uint8Array([phflag ? 1 : 0, ctx.length]), ctx, data);
	}
	var ed25519ctx = /* @__PURE__ */ twistedEdwards({
		...ed25519Defaults,
		domain: ed25519_domain
	});
	var ed25519ph = /* @__PURE__ */ twistedEdwards({
		...ed25519Defaults,
		domain: ed25519_domain,
		prehash: sha512$1
	});
	var x25519$1 = /* @__PURE__ */ (() => montgomery({
		P: ED25519_P,
		a: BigInt(486662),
		montgomeryBits: 255,
		nByteLength: 32,
		Gu: BigInt(9),
		powPminus2: (x) => {
			const P = ED25519_P;
			const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
			return mod(pow2(pow_p_5_8, BigInt(3), P) * b2, P);
		},
		adjustScalarBytes,
		randomBytes
	}))();
	var ELL2_C1 = (Fp.ORDER + BigInt(3)) / BigInt(8);
	var ELL2_C2 = Fp.pow(_2n4, ELL2_C1);
	var ELL2_C3 = Fp.sqrt(Fp.neg(Fp.ONE));
	var ELL2_C4 = (Fp.ORDER - BigInt(5)) / BigInt(8);
	var ELL2_J = BigInt(486662);
	var ELL2_C1_EDWARDS = FpSqrtEven(Fp, Fp.neg(BigInt(486664)));
	var SQRT_AD_MINUS_ONE = BigInt("25063068953384623474111414158702152701244531502492656460079210482610430750235");
	var INVSQRT_A_MINUS_D = BigInt("54469307008909316920995813868745141605393597292927456921205312896311721017578");
	var ONE_MINUS_D_SQ = BigInt("1159843021668779879193775521855586647937357759715417654439879720876111806838");
	var D_MINUS_ONE_SQ = BigInt("40440834346308536858101042469323190826248399146238708352240133220865137265952");
	var MAX_255B = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
	return __toCommonJS(input_exports);
})();
const x25519 = nobleCurves.x25519;

//#endregion
//#region packages/tutanota-crypto/dist/encryption/Ecc.js
const X25519_N_BYTE_LENGTH = 32;
function generateEccKeyPair() {
	const privateKey = clampPrivateKey(random.generateRandomData(X25519_N_BYTE_LENGTH));
	const publicKey = derivePublicKey(privateKey);
	return {
		privateKey,
		publicKey
	};
}
function eccEncapsulate(senderIdentityPrivateKey, ephemeralPrivateKey, recipientIdentityPublicKey) {
	const ephemeralSharedSecret = generateSharedSecret(ephemeralPrivateKey, recipientIdentityPublicKey);
	const authSharedSecret = generateSharedSecret(senderIdentityPrivateKey, recipientIdentityPublicKey);
	return {
		ephemeralSharedSecret,
		authSharedSecret
	};
}
function eccDecapsulate(senderIdentityPublicKey, ephemeralPublicKey, recipientIdentityPrivateKey) {
	const ephemeralSharedSecret = generateSharedSecret(recipientIdentityPrivateKey, ephemeralPublicKey);
	const authSharedSecret = generateSharedSecret(recipientIdentityPrivateKey, senderIdentityPublicKey);
	return {
		ephemeralSharedSecret,
		authSharedSecret
	};
}
/**
* Diffie-Hellman key exchange; works by combining one party's private key and the other party's public key to form a shared secret between both parties
*/
function generateSharedSecret(localPrivateKey, remotePublicKey) {
	const sharedSecret = x25519.getSharedSecret(localPrivateKey, remotePublicKey);
	if (sharedSecret.every((val) => val === 0)) throw new Error("can't get shared secret: bad key inputs");
	return sharedSecret;
}
function clampPrivateKey(privateKey) {
	privateKey[privateKey.length - 1] = privateKey[privateKey.length - 1] & 127 | 64;
	privateKey[0] &= 248;
	return privateKey;
}
function derivePublicKey(privateKey) {
	return x25519.getPublicKey(privateKey);
}

//#endregion
//#region packages/tutanota-crypto/dist/internal/bCrypt.js
function bCrypt() {
	this.GENSALT_DEFAULT_LOG2_ROUNDS = 10;
	this.BCRYPT_SALT_LEN = 16;
	this.BLOWFISH_NUM_ROUNDS = 16;
	this.MAX_EXECUTION_TIME = 100;
	this.P_orig = [
		608135816,
		2242054355,
		320440878,
		57701188,
		2752067618,
		698298832,
		137296536,
		3964562569,
		1160258022,
		953160567,
		3193202383,
		887688300,
		3232508343,
		3380367581,
		1065670069,
		3041331479,
		2450970073,
		2306472731
	];
	this.S_orig = [
		3509652390,
		2564797868,
		805139163,
		3491422135,
		3101798381,
		1780907670,
		3128725573,
		4046225305,
		614570311,
		3012652279,
		134345442,
		2240740374,
		1667834072,
		1901547113,
		2757295779,
		4103290238,
		227898511,
		1921955416,
		1904987480,
		2182433518,
		2069144605,
		3260701109,
		2620446009,
		720527379,
		3318853667,
		677414384,
		3393288472,
		3101374703,
		2390351024,
		1614419982,
		1822297739,
		2954791486,
		3608508353,
		3174124327,
		2024746970,
		1432378464,
		3864339955,
		2857741204,
		1464375394,
		1676153920,
		1439316330,
		715854006,
		3033291828,
		289532110,
		2706671279,
		2087905683,
		3018724369,
		1668267050,
		732546397,
		1947742710,
		3462151702,
		2609353502,
		2950085171,
		1814351708,
		2050118529,
		680887927,
		999245976,
		1800124847,
		3300911131,
		1713906067,
		1641548236,
		4213287313,
		1216130144,
		1575780402,
		4018429277,
		3917837745,
		3693486850,
		3949271944,
		596196993,
		3549867205,
		258830323,
		2213823033,
		772490370,
		2760122372,
		1774776394,
		2652871518,
		566650946,
		4142492826,
		1728879713,
		2882767088,
		1783734482,
		3629395816,
		2517608232,
		2874225571,
		1861159788,
		326777828,
		3124490320,
		2130389656,
		2716951837,
		967770486,
		1724537150,
		2185432712,
		2364442137,
		1164943284,
		2105845187,
		998989502,
		3765401048,
		2244026483,
		1075463327,
		1455516326,
		1322494562,
		910128902,
		469688178,
		1117454909,
		936433444,
		3490320968,
		3675253459,
		1240580251,
		122909385,
		2157517691,
		634681816,
		4142456567,
		3825094682,
		3061402683,
		2540495037,
		79693498,
		3249098678,
		1084186820,
		1583128258,
		426386531,
		1761308591,
		1047286709,
		322548459,
		995290223,
		1845252383,
		2603652396,
		3431023940,
		2942221577,
		3202600964,
		3727903485,
		1712269319,
		422464435,
		3234572375,
		1170764815,
		3523960633,
		3117677531,
		1434042557,
		442511882,
		3600875718,
		1076654713,
		1738483198,
		4213154764,
		2393238008,
		3677496056,
		1014306527,
		4251020053,
		793779912,
		2902807211,
		842905082,
		4246964064,
		1395751752,
		1040244610,
		2656851899,
		3396308128,
		445077038,
		3742853595,
		3577915638,
		679411651,
		2892444358,
		2354009459,
		1767581616,
		3150600392,
		3791627101,
		3102740896,
		284835224,
		4246832056,
		1258075500,
		768725851,
		2589189241,
		3069724005,
		3532540348,
		1274779536,
		3789419226,
		2764799539,
		1660621633,
		3471099624,
		4011903706,
		913787905,
		3497959166,
		737222580,
		2514213453,
		2928710040,
		3937242737,
		1804850592,
		3499020752,
		2949064160,
		2386320175,
		2390070455,
		2415321851,
		4061277028,
		2290661394,
		2416832540,
		1336762016,
		1754252060,
		3520065937,
		3014181293,
		791618072,
		3188594551,
		3933548030,
		2332172193,
		3852520463,
		3043980520,
		413987798,
		3465142937,
		3030929376,
		4245938359,
		2093235073,
		3534596313,
		375366246,
		2157278981,
		2479649556,
		555357303,
		3870105701,
		2008414854,
		3344188149,
		4221384143,
		3956125452,
		2067696032,
		3594591187,
		2921233993,
		2428461,
		544322398,
		577241275,
		1471733935,
		610547355,
		4027169054,
		1432588573,
		1507829418,
		2025931657,
		3646575487,
		545086370,
		48609733,
		2200306550,
		1653985193,
		298326376,
		1316178497,
		3007786442,
		2064951626,
		458293330,
		2589141269,
		3591329599,
		3164325604,
		727753846,
		2179363840,
		146436021,
		1461446943,
		4069977195,
		705550613,
		3059967265,
		3887724982,
		4281599278,
		3313849956,
		1404054877,
		2845806497,
		146425753,
		1854211946,
		1266315497,
		3048417604,
		3681880366,
		3289982499,
		290971e4,
		1235738493,
		2632868024,
		2414719590,
		3970600049,
		1771706367,
		1449415276,
		3266420449,
		422970021,
		1963543593,
		2690192192,
		3826793022,
		1062508698,
		1531092325,
		1804592342,
		2583117782,
		2714934279,
		4024971509,
		1294809318,
		4028980673,
		1289560198,
		2221992742,
		1669523910,
		35572830,
		157838143,
		1052438473,
		1016535060,
		1802137761,
		1753167236,
		1386275462,
		3080475397,
		2857371447,
		1040679964,
		2145300060,
		2390574316,
		1461121720,
		2956646967,
		4031777805,
		4028374788,
		33600511,
		2920084762,
		1018524850,
		629373528,
		3691585981,
		3515945977,
		2091462646,
		2486323059,
		586499841,
		988145025,
		935516892,
		3367335476,
		2599673255,
		2839830854,
		265290510,
		3972581182,
		2759138881,
		3795373465,
		1005194799,
		847297441,
		406762289,
		1314163512,
		1332590856,
		1866599683,
		4127851711,
		750260880,
		613907577,
		1450815602,
		3165620655,
		3734664991,
		3650291728,
		3012275730,
		3704569646,
		1427272223,
		778793252,
		1343938022,
		2676280711,
		2052605720,
		1946737175,
		3164576444,
		3914038668,
		3967478842,
		3682934266,
		1661551462,
		3294938066,
		4011595847,
		840292616,
		3712170807,
		616741398,
		312560963,
		711312465,
		1351876610,
		322626781,
		1910503582,
		271666773,
		2175563734,
		1594956187,
		70604529,
		3617834859,
		1007753275,
		1495573769,
		4069517037,
		2549218298,
		2663038764,
		504708206,
		2263041392,
		3941167025,
		2249088522,
		1514023603,
		1998579484,
		1312622330,
		694541497,
		2582060303,
		2151582166,
		1382467621,
		776784248,
		2618340202,
		3323268794,
		2497899128,
		2784771155,
		503983604,
		4076293799,
		907881277,
		423175695,
		432175456,
		1378068232,
		4145222326,
		3954048622,
		3938656102,
		3820766613,
		2793130115,
		2977904593,
		26017576,
		3274890735,
		3194772133,
		1700274565,
		1756076034,
		4006520079,
		3677328699,
		720338349,
		1533947780,
		354530856,
		688349552,
		3973924725,
		1637815568,
		332179504,
		3949051286,
		53804574,
		2852348879,
		3044236432,
		1282449977,
		3583942155,
		3416972820,
		4006381244,
		1617046695,
		2628476075,
		3002303598,
		1686838959,
		431878346,
		2686675385,
		1700445008,
		1080580658,
		1009431731,
		832498133,
		3223435511,
		2605976345,
		2271191193,
		2516031870,
		1648197032,
		4164389018,
		2548247927,
		300782431,
		375919233,
		238389289,
		3353747414,
		2531188641,
		2019080857,
		1475708069,
		455242339,
		2609103871,
		448939670,
		3451063019,
		1395535956,
		2413381860,
		1841049896,
		1491858159,
		885456874,
		4264095073,
		4001119347,
		1565136089,
		3898914787,
		1108368660,
		540939232,
		1173283510,
		2745871338,
		3681308437,
		4207628240,
		3343053890,
		4016749493,
		1699691293,
		1103962373,
		3625875870,
		2256883143,
		3830138730,
		1031889488,
		3479347698,
		1535977030,
		4236805024,
		3251091107,
		2132092099,
		1774941330,
		1199868427,
		1452454533,
		157007616,
		2904115357,
		342012276,
		595725824,
		1480756522,
		206960106,
		497939518,
		591360097,
		863170706,
		2375253569,
		3596610801,
		1814182875,
		2094937945,
		3421402208,
		1082520231,
		3463918190,
		2785509508,
		435703966,
		3908032597,
		1641649973,
		2842273706,
		3305899714,
		1510255612,
		2148256476,
		2655287854,
		3276092548,
		4258621189,
		236887753,
		3681803219,
		274041037,
		1734335097,
		3815195456,
		3317970021,
		1899903192,
		1026095262,
		4050517792,
		356393447,
		2410691914,
		3873677099,
		3682840055,
		3913112168,
		2491498743,
		4132185628,
		2489919796,
		1091903735,
		1979897079,
		3170134830,
		3567386728,
		3557303409,
		857797738,
		1136121015,
		1342202287,
		507115054,
		2535736646,
		337727348,
		3213592640,
		1301675037,
		2528481711,
		1895095763,
		1721773893,
		3216771564,
		62756741,
		2142006736,
		835421444,
		2531993523,
		1442658625,
		3659876326,
		2882144922,
		676362277,
		1392781812,
		170690266,
		3921047035,
		1759253602,
		3611846912,
		1745797284,
		664899054,
		1329594018,
		3901205900,
		3045908486,
		2062866102,
		2865634940,
		3543621612,
		3464012697,
		1080764994,
		553557557,
		3656615353,
		3996768171,
		991055499,
		499776247,
		1265440854,
		648242737,
		3940784050,
		980351604,
		3713745714,
		1749149687,
		3396870395,
		4211799374,
		3640570775,
		1161844396,
		3125318951,
		1431517754,
		545492359,
		4268468663,
		3499529547,
		1437099964,
		2702547544,
		3433638243,
		2581715763,
		2787789398,
		1060185593,
		1593081372,
		2418618748,
		4260947970,
		69676912,
		2159744348,
		86519011,
		2512459080,
		3838209314,
		1220612927,
		3339683548,
		133810670,
		1090789135,
		1078426020,
		1569222167,
		845107691,
		3583754449,
		4072456591,
		1091646820,
		628848692,
		1613405280,
		3757631651,
		526609435,
		236106946,
		48312990,
		2942717905,
		3402727701,
		1797494240,
		859738849,
		992217954,
		4005476642,
		2243076622,
		3870952857,
		3732016268,
		765654824,
		3490871365,
		2511836413,
		1685915746,
		3888969200,
		1414112111,
		2273134842,
		3281911079,
		4080962846,
		172450625,
		2569994100,
		980381355,
		4109958455,
		2819808352,
		2716589560,
		2568741196,
		3681446669,
		3329971472,
		1835478071,
		660984891,
		3704678404,
		4045999559,
		3422617507,
		3040415634,
		1762651403,
		1719377915,
		3470491036,
		2693910283,
		3642056355,
		3138596744,
		1364962596,
		2073328063,
		1983633131,
		926494387,
		3423689081,
		2150032023,
		4096667949,
		1749200295,
		3328846651,
		309677260,
		2016342300,
		1779581495,
		3079819751,
		111262694,
		1274766160,
		443224088,
		298511866,
		1025883608,
		3806446537,
		1145181785,
		168956806,
		3641502830,
		3584813610,
		1689216846,
		3666258015,
		3200248200,
		1692713982,
		2646376535,
		4042768518,
		1618508792,
		1610833997,
		3523052358,
		4130873264,
		2001055236,
		3610705100,
		2202168115,
		4028541809,
		2961195399,
		1006657119,
		2006996926,
		3186142756,
		1430667929,
		3210227297,
		1314452623,
		4074634658,
		4101304120,
		2273951170,
		1399257539,
		3367210612,
		3027628629,
		1190975929,
		2062231137,
		2333990788,
		2221543033,
		2438960610,
		1181637006,
		548689776,
		2362791313,
		3372408396,
		3104550113,
		3145860560,
		296247880,
		1970579870,
		3078560182,
		3769228297,
		1714227617,
		3291629107,
		3898220290,
		166772364,
		1251581989,
		493813264,
		448347421,
		195405023,
		2709975567,
		677966185,
		3703036547,
		1463355134,
		2715995803,
		1338867538,
		1343315457,
		2802222074,
		2684532164,
		233230375,
		2599980071,
		2000651841,
		3277868038,
		1638401717,
		4028070440,
		3237316320,
		6314154,
		819756386,
		300326615,
		590932579,
		1405279636,
		3267499572,
		3150704214,
		2428286686,
		3959192993,
		3461946742,
		1862657033,
		1266418056,
		963775037,
		2089974820,
		2263052895,
		1917689273,
		448879540,
		3550394620,
		3981727096,
		150775221,
		3627908307,
		1303187396,
		508620638,
		2975983352,
		2726630617,
		1817252668,
		1876281319,
		1457606340,
		908771278,
		3720792119,
		3617206836,
		2455994898,
		1729034894,
		1080033504,
		976866871,
		3556439503,
		2881648439,
		1522871579,
		1555064734,
		1336096578,
		3548522304,
		2579274686,
		3574697629,
		3205460757,
		3593280638,
		3338716283,
		3079412587,
		564236357,
		2993598910,
		1781952180,
		1464380207,
		3163844217,
		3332601554,
		1699332808,
		1393555694,
		1183702653,
		3581086237,
		1288719814,
		691649499,
		2847557200,
		2895455976,
		3193889540,
		2717570544,
		1781354906,
		1676643554,
		2592534050,
		3230253752,
		1126444790,
		2770207658,
		2633158820,
		2210423226,
		2615765581,
		2414155088,
		3127139286,
		673620729,
		2805611233,
		1269405062,
		4015350505,
		3341807571,
		4149409754,
		1057255273,
		2012875353,
		2162469141,
		2276492801,
		2601117357,
		993977747,
		3918593370,
		2654263191,
		753973209,
		36408145,
		2530585658,
		25011837,
		3520020182,
		2088578344,
		530523599,
		2918365339,
		1524020338,
		1518925132,
		3760827505,
		3759777254,
		1202760957,
		3985898139,
		3906192525,
		674977740,
		4174734889,
		2031300136,
		2019492241,
		3983892565,
		4153806404,
		3822280332,
		352677332,
		2297720250,
		60907813,
		90501309,
		3286998549,
		1016092578,
		2535922412,
		2839152426,
		457141659,
		509813237,
		4120667899,
		652014361,
		1966332200,
		2975202805,
		55981186,
		2327461051,
		676427537,
		3255491064,
		2882294119,
		3433927263,
		1307055953,
		942726286,
		933058658,
		2468411793,
		3933900994,
		4215176142,
		1361170020,
		2001714738,
		2830558078,
		3274259782,
		1222529897,
		1679025792,
		2729314320,
		3714953764,
		1770335741,
		151462246,
		3013232138,
		1682292957,
		1483529935,
		471910574,
		1539241949,
		458788160,
		3436315007,
		1807016891,
		3718408830,
		978976581,
		1043663428,
		3165965781,
		1927990952,
		4200891579,
		2372276910,
		3208408903,
		3533431907,
		1412390302,
		2931980059,
		4132332400,
		1947078029,
		3881505623,
		4168226417,
		2941484381,
		1077988104,
		1320477388,
		886195818,
		18198404,
		3786409e3,
		2509781533,
		112762804,
		3463356488,
		1866414978,
		891333506,
		18488651,
		661792760,
		1628790961,
		3885187036,
		3141171499,
		876946877,
		2693282273,
		1372485963,
		791857591,
		2686433993,
		3759982718,
		3167212022,
		3472953795,
		2716379847,
		445679433,
		3561995674,
		3504004811,
		3574258232,
		54117162,
		3331405415,
		2381918588,
		3769707343,
		4154350007,
		1140177722,
		4074052095,
		668550556,
		3214352940,
		367459370,
		261225585,
		2610173221,
		4209349473,
		3468074219,
		3265815641,
		314222801,
		3066103646,
		3808782860,
		282218597,
		3406013506,
		3773591054,
		379116347,
		1285071038,
		846784868,
		2669647154,
		3771962079,
		3550491691,
		2305946142,
		453669953,
		1268987020,
		3317592352,
		3279303384,
		3744833421,
		2610507566,
		3859509063,
		266596637,
		3847019092,
		517658769,
		3462560207,
		3443424879,
		370717030,
		4247526661,
		2224018117,
		4143653529,
		4112773975,
		2788324899,
		2477274417,
		1456262402,
		2901442914,
		1517677493,
		1846949527,
		2295493580,
		3734397586,
		2176403920,
		1280348187,
		1908823572,
		3871786941,
		846861322,
		1172426758,
		3287448474,
		3383383037,
		1655181056,
		3139813346,
		901632758,
		1897031941,
		2986607138,
		3066810236,
		3447102507,
		1393639104,
		373351379,
		950779232,
		625454576,
		3124240540,
		4148612726,
		2007998917,
		544563296,
		2244738638,
		2330496472,
		2058025392,
		1291430526,
		424198748,
		50039436,
		29584100,
		3605783033,
		2429876329,
		2791104160,
		1057563949,
		3255363231,
		3075367218,
		3463963227,
		1469046755,
		985887462
	];
	this.bf_crypt_ciphertext = [
		1332899944,
		1700884034,
		1701343084,
		1684370003,
		1668446532,
		1869963892
	];
	this.base64_code = [
		".",
		"/",
		"A",
		"B",
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
		"V",
		"W",
		"X",
		"Y",
		"Z",
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"g",
		"h",
		"i",
		"j",
		"k",
		"l",
		"m",
		"n",
		"o",
		"p",
		"q",
		"r",
		"s",
		"t",
		"u",
		"v",
		"w",
		"x",
		"y",
		"z",
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9"
	];
	this.index_64 = [
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		0,
		1,
		54,
		55,
		56,
		57,
		58,
		59,
		60,
		61,
		62,
		63,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		16,
		17,
		18,
		19,
		20,
		21,
		22,
		23,
		24,
		25,
		26,
		27,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		28,
		29,
		30,
		31,
		32,
		33,
		34,
		35,
		36,
		37,
		38,
		39,
		40,
		41,
		42,
		43,
		44,
		45,
		46,
		47,
		48,
		49,
		50,
		51,
		52,
		53,
		-1,
		-1,
		-1,
		-1,
		-1
	];
	this.P;
	this.S;
	this.lr;
	this.offp;
}
bCrypt.prototype.getByte = function(c) {
	var ret = 0;
	try {
		var b = c.charCodeAt(0);
	} catch (err) {
		b = c;
	}
	if (b > 127) return -128 + b % 128;
else return b;
};
bCrypt.prototype.encode_base64 = function(d, len) {
	var off = 0;
	var rs = [];
	var c1;
	var c2;
	if (len <= 0 || len > d.length) throw "Invalid len";
	while (off < len) {
		c1 = d[off++] & 255;
		rs.push(this.base64_code[c1 >> 2 & 63]);
		c1 = (c1 & 3) << 4;
		if (off >= len) {
			rs.push(this.base64_code[c1 & 63]);
			break;
		}
		c2 = d[off++] & 255;
		c1 |= c2 >> 4 & 15;
		rs.push(this.base64_code[c1 & 63]);
		c1 = (c2 & 15) << 2;
		if (off >= len) {
			rs.push(this.base64_code[c1 & 63]);
			break;
		}
		c2 = d[off++] & 255;
		c1 |= c2 >> 6 & 3;
		rs.push(this.base64_code[c1 & 63]);
		rs.push(this.base64_code[c2 & 63]);
	}
	return rs.join("");
};
bCrypt.prototype.char64 = function(x) {
	var code = x.charCodeAt(0);
	if (code < 0 || code > this.index_64.length) return -1;
	return this.index_64[code];
};
bCrypt.prototype.decode_base64 = function(s, maxolen) {
	var off = 0;
	var slen = s.length;
	var olen = 0;
	var rs = [];
	var c1, c2, c3, c4, o;
	if (maxolen <= 0) throw "Invalid maxolen";
	while (off < slen - 1 && olen < maxolen) {
		c1 = this.char64(s.charAt(off++));
		c2 = this.char64(s.charAt(off++));
		if (c1 == -1 || c2 == -1) break;
		o = this.getByte(c1 << 2);
		o |= (c2 & 48) >> 4;
		rs.push(String.fromCharCode(o));
		if (++olen >= maxolen || off >= slen) break;
		c3 = this.char64(s.charAt(off++));
		if (c3 == -1) break;
		o = this.getByte((c2 & 15) << 4);
		o |= (c3 & 60) >> 2;
		rs.push(String.fromCharCode(o));
		if (++olen >= maxolen || off >= slen) break;
		c4 = this.char64(s.charAt(off++));
		o = this.getByte((c3 & 3) << 6);
		o |= c4;
		rs.push(String.fromCharCode(o));
		++olen;
	}
	var ret = [];
	for (off = 0; off < olen; off++) ret.push(this.getByte(rs[off]));
	return ret;
};
bCrypt.prototype.encipher = function(lr, off) {
	var i;
	var n;
	var l = lr[off];
	var r = lr[off + 1];
	l ^= this.P[0];
	for (i = 0; i <= this.BLOWFISH_NUM_ROUNDS - 2;) {
		n = this.S[l >> 24 & 255];
		n += this.S[256 | l >> 16 & 255];
		n ^= this.S[512 | l >> 8 & 255];
		n += this.S[768 | l & 255];
		r ^= n ^ this.P[++i];
		n = this.S[r >> 24 & 255];
		n += this.S[256 | r >> 16 & 255];
		n ^= this.S[512 | r >> 8 & 255];
		n += this.S[768 | r & 255];
		l ^= n ^ this.P[++i];
	}
	lr[off] = r ^ this.P[this.BLOWFISH_NUM_ROUNDS + 1];
	lr[off + 1] = l;
};
bCrypt.prototype.streamtoword = function(data, offp) {
	var i;
	var word = 0;
	var off = offp;
	for (i = 0; i < 4; i++) {
		word = word << 8 | data[off] & 255;
		off = (off + 1) % data.length;
	}
	this.offp = off;
	return word;
};
bCrypt.prototype.init_key = function() {
	this.P = this.P_orig.slice();
	this.S = this.S_orig.slice();
};
bCrypt.prototype.key = function(key) {
	var i;
	this.offp = 0;
	var lr = new Array(0, 0);
	var plen = this.P.length;
	var slen = this.S.length;
	for (i = 0; i < plen; i++) this.P[i] = this.P[i] ^ this.streamtoword(key, this.offp);
	for (i = 0; i < plen; i += 2) {
		this.encipher(lr, 0);
		this.P[i] = lr[0];
		this.P[i + 1] = lr[1];
	}
	for (i = 0; i < slen; i += 2) {
		this.encipher(lr, 0);
		this.S[i] = lr[0];
		this.S[i + 1] = lr[1];
	}
};
bCrypt.prototype.ekskey = function(data, key) {
	var i;
	this.offp = 0;
	var lr = new Array(0, 0);
	var plen = this.P.length;
	var slen = this.S.length;
	for (i = 0; i < plen; i++) this.P[i] = this.P[i] ^ this.streamtoword(key, this.offp);
	this.offp = 0;
	for (i = 0; i < plen; i += 2) {
		lr[0] ^= this.streamtoword(data, this.offp);
		lr[1] ^= this.streamtoword(data, this.offp);
		this.encipher(lr, 0);
		this.P[i] = lr[0];
		this.P[i + 1] = lr[1];
	}
	for (i = 0; i < slen; i += 2) {
		lr[0] ^= this.streamtoword(data, this.offp);
		lr[1] ^= this.streamtoword(data, this.offp);
		this.encipher(lr, 0);
		this.S[i] = lr[0];
		this.S[i + 1] = lr[1];
	}
};
bCrypt.prototype.crypt_raw = function(password, salt, log_rounds) {
	var rounds;
	var j;
	var cdata = this.bf_crypt_ciphertext.slice();
	var clen = cdata.length;
	var one_percent;
	if (log_rounds < 4 || log_rounds > 31) throw "Bad number of rounds";
	if (salt.length != this.BCRYPT_SALT_LEN) throw "Bad _salt length";
	rounds = 1 << log_rounds;
	one_percent = Math.floor(rounds / 100) + 1;
	this.init_key();
	this.ekskey(salt, password);
	var obj = this;
	var i = 0;
	var roundFunction = null;
	roundFunction = function() {
		if (i < rounds) {
			var start = new Date();
			for (; i < rounds;) {
				i = i + 1;
				obj.key(password);
				obj.key(salt);
			}
			return roundFunction();
		} else {
			for (i = 0; i < 64; i++) for (j = 0; j < clen >> 1; j++) obj.encipher(cdata, j << 1);
			var ret = [];
			for (i = 0; i < clen; i++) {
				ret.push(obj.getByte(cdata[i] >> 24 & 255));
				ret.push(obj.getByte(cdata[i] >> 16 & 255));
				ret.push(obj.getByte(cdata[i] >> 8 & 255));
				ret.push(obj.getByte(cdata[i] & 255));
			}
			return ret;
		}
	};
	return roundFunction();
};
var bCrypt_default = bCrypt;

//#endregion
//#region packages/tutanota-crypto/dist/misc/Constants.js
var KeyLength;
(function(KeyLength$1) {
	KeyLength$1["b128"] = "128";
	KeyLength$1["b256"] = "256";
})(KeyLength || (KeyLength = {}));

//#endregion
//#region packages/tutanota-crypto/dist/hashes/Bcrypt.js
const logRounds = 8;
function generateRandomSalt() {
	return random.generateRandomData(16);
}
function generateKeyFromPassphrase(passphrase, salt, keyLengthType) {
	let passphraseBytes = sha256Hash(stringToUtf8Uint8Array(passphrase));
	let bytes = crypt_raw(passphraseBytes, salt, logRounds);
	if (keyLengthType === KeyLength.b128) return uint8ArrayToBitArray(bytes.slice(0, 16));
else return uint8ArrayToBitArray(sha256Hash(bytes));
}
function crypt_raw(passphraseBytes, saltBytes, logRounds$1) {
	try {
		return _signedBytesToUint8Array(new bCrypt_default().crypt_raw(_uint8ArrayToSignedBytes(passphraseBytes), _uint8ArrayToSignedBytes(saltBytes), logRounds$1));
	} catch (e) {
		const error = e;
		throw new CryptoError(error.message, error);
	}
}
/**
* Converts an array of signed byte values (-128 to 127) to an Uint8Array (values 0 to 255).
* @param signedBytes The signed byte values.
* @return The unsigned byte values.
*/
function _signedBytesToUint8Array(signedBytes) {
	return new Uint8Array(new Int8Array(signedBytes));
}
/**
* Converts an uint8Array (value 0 to 255) to an Array with unsigned bytes (-128 to 127).
* @param unsignedBytes The unsigned byte values.
* @return The signed byte values.
*/
function _uint8ArrayToSignedBytes(unsignedBytes) {
	return Array.from(new Uint8Array(new Int8Array(unsignedBytes)));
}

//#endregion
//#region packages/tutanota-crypto/dist/encryption/Liboqs/Kyber.js
const ML_KEM_RAND_AMOUNT_OF_ENTROPY = 64;
const ML_KEM_1024_ALGORITHM = "ML-KEM-1024";
const KYBER_K = 4;
const KYBER_POLYBYTES = 384;
const KYBER_POLYVECBYTES = KYBER_K * KYBER_POLYBYTES;
const KYBER_SYMBYTES = 32;
const OQS_KEM_ml_kem_1024_length_public_key = 1568;
const OQS_KEM_ml_kem_1024_length_secret_key = 3168;
const OQS_KEM_ml_kem_1024_length_ciphertext = 1568;
const OQS_KEM_ml_kem_1024_length_shared_secret = 32;
function generateKeyPair(kyberWasm, randomizer) {
	const OQS_KEM = createKem(kyberWasm);
	try {
		fillEntropyPool(kyberWasm, randomizer);
		const publicKey = new Uint8Array(OQS_KEM_ml_kem_1024_length_public_key);
		const privateKey = new Uint8Array(OQS_KEM_ml_kem_1024_length_secret_key);
		const result = callWebAssemblyFunctionWithArguments(kyberWasm.OQS_KEM_keypair, kyberWasm, OQS_KEM, mutableSecureFree(publicKey), mutableSecureFree(privateKey));
		if (result != 0) throw new Error(`OQS_KEM_keypair returned ${result}`);
		return {
			publicKey: { raw: publicKey },
			privateKey: { raw: privateKey }
		};
	} finally {
		freeKem(kyberWasm, OQS_KEM);
	}
}
function encapsulate(kyberWasm, publicKey, randomizer) {
	if (publicKey.raw.length != OQS_KEM_ml_kem_1024_length_public_key) throw new CryptoError(`Invalid public key length; expected ${OQS_KEM_ml_kem_1024_length_public_key}, got ${publicKey.raw.length}`);
	const OQS_KEM = createKem(kyberWasm);
	try {
		fillEntropyPool(kyberWasm, randomizer);
		const ciphertext = new Uint8Array(OQS_KEM_ml_kem_1024_length_ciphertext);
		const sharedSecret = new Uint8Array(OQS_KEM_ml_kem_1024_length_shared_secret);
		const result = callWebAssemblyFunctionWithArguments(kyberWasm.TUTA_KEM_encaps, kyberWasm, OQS_KEM, mutableSecureFree(ciphertext), mutableSecureFree(sharedSecret), mutableSecureFree(publicKey.raw));
		if (result != 0) throw new Error(`TUTA_KEM_encaps returned ${result}`);
		return {
			ciphertext,
			sharedSecret
		};
	} finally {
		freeKem(kyberWasm, OQS_KEM);
	}
}
function decapsulate(kyberWasm, privateKey, ciphertext) {
	if (privateKey.raw.length != OQS_KEM_ml_kem_1024_length_secret_key) throw new CryptoError(`Invalid private key length; expected ${OQS_KEM_ml_kem_1024_length_secret_key}, got ${privateKey.raw.length}`);
	if (ciphertext.length != OQS_KEM_ml_kem_1024_length_ciphertext) throw new CryptoError(`Invalid ciphertext length; expected ${OQS_KEM_ml_kem_1024_length_ciphertext}, got ${ciphertext.length}`);
	const OQS_KEM = createKem(kyberWasm);
	try {
		const sharedSecret = new Uint8Array(OQS_KEM_ml_kem_1024_length_shared_secret);
		const result = callWebAssemblyFunctionWithArguments(kyberWasm.TUTA_KEM_decaps, kyberWasm, OQS_KEM, mutableSecureFree(sharedSecret), secureFree(ciphertext), secureFree(privateKey.raw));
		if (result != 0) throw new Error(`TUTA_KEM_decaps returned ${result}`);
		return sharedSecret;
	} finally {
		freeKem(kyberWasm, OQS_KEM);
	}
}
function freeKem(kyberWasm, OQS_KEM) {
	callWebAssemblyFunctionWithArguments(kyberWasm.OQS_KEM_free, kyberWasm, OQS_KEM);
}
function createKem(kyberWasm) {
	return callWebAssemblyFunctionWithArguments(kyberWasm.OQS_KEM_new, kyberWasm, ML_KEM_1024_ALGORITHM);
}
function fillEntropyPool(exports, randomizer) {
	const entropyAmount = randomizer.generateRandomData(ML_KEM_RAND_AMOUNT_OF_ENTROPY);
	const remaining = callWebAssemblyFunctionWithArguments(exports.TUTA_inject_entropy, exports, entropyAmount, entropyAmount.length);
	if (remaining < 0) console.warn(`tried to copy too much entropy: overflowed with ${-remaining} bytes; fix RAND_AMOUNT_OF_ENTROPY/generateRandomData to silence this`);
}

//#endregion
//#region packages/tutanota-crypto/dist/encryption/Liboqs/KyberKeyPair.js
function kyberPrivateKeyToBytes(key) {
	const keyBytes = key.raw;
	const s = keyBytes.slice(0, KYBER_POLYVECBYTES);
	const t$1 = keyBytes.slice(KYBER_POLYVECBYTES, 2 * KYBER_POLYVECBYTES);
	const rho = keyBytes.slice(2 * KYBER_POLYVECBYTES, 2 * KYBER_POLYVECBYTES + KYBER_SYMBYTES);
	const hpk = keyBytes.slice(2 * KYBER_POLYVECBYTES + KYBER_SYMBYTES, 2 * KYBER_POLYVECBYTES + 2 * KYBER_SYMBYTES);
	const nonce = keyBytes.slice(2 * KYBER_POLYVECBYTES + 2 * KYBER_SYMBYTES, 2 * KYBER_POLYVECBYTES + 3 * KYBER_SYMBYTES);
	return byteArraysToBytes([
		s,
		hpk,
		nonce,
		t$1,
		rho
	]);
}
function kyberPublicKeyToBytes(key) {
	const keyBytes = key.raw;
	const t$1 = keyBytes.slice(0, KYBER_POLYVECBYTES);
	const rho = keyBytes.slice(KYBER_POLYVECBYTES, KYBER_POLYVECBYTES + KYBER_SYMBYTES);
	return byteArraysToBytes([t$1, rho]);
}
function bytesToKyberPublicKey(encodedPublicKey) {
	const keyComponents = bytesToByteArrays(encodedPublicKey, 2);
	return { raw: concat(...keyComponents) };
}
function bytesToKyberPrivateKey(encodedPrivateKey) {
	const keyComponents = bytesToByteArrays(encodedPrivateKey, 5);
	const s = keyComponents[0];
	const hpk = keyComponents[1];
	const nonce = keyComponents[2];
	const t$1 = keyComponents[3];
	const rho = keyComponents[4];
	return { raw: concat(s, t$1, rho, hpk, nonce) };
}

//#endregion
//#region packages/tutanota-crypto/dist/hashes/Argon2id/Argon2id.js
const ARGON2ID_ITERATIONS = 4;
const ARGON2ID_MEMORY_IN_KiB = 32768;
const ARGON2ID_PARALLELISM = 1;
const ARGON2ID_KEY_LENGTH = 32;
async function generateKeyFromPassphrase$1(argon2, pass, salt) {
	const hash = await argon2idHashRaw(argon2, ARGON2ID_ITERATIONS, ARGON2ID_MEMORY_IN_KiB, ARGON2ID_PARALLELISM, stringToUtf8Uint8Array(pass), salt, ARGON2ID_KEY_LENGTH);
	return uint8ArrayToBitArray(hash);
}
async function argon2idHashRaw(argon2, timeCost, memoryCost, parallelism, password, salt, hashLength) {
	const hash = new Uint8Array(hashLength);
	const result = callWebAssemblyFunctionWithArguments(argon2.argon2id_hash_raw, argon2, timeCost, memoryCost, parallelism, secureFree(password), password.length, salt, salt.length, mutableSecureFree(hash), hash.length);
	if (result !== 0) throw new Error(`argon2id_hash_raw returned ${result}`);
	return hash;
}

//#endregion
//#region packages/tutanota-crypto/dist/random/SecureRandom.js
var SecureRandom = class {
	/**
	* Only this function is used by jsbn for getting random bytes. Each byte is a value between 0 and 255.
	* @param array An array to fill with random bytes. The length of the array defines the number of bytes to create.
	*/
	nextBytes(array) {
		let bytes = random.generateRandomData(array.length);
		for (let i = 0; i < array.length; i++) array[i] = bytes[i];
	}
};

//#endregion
//#region packages/tutanota-crypto/dist/internal/crypto-jsbn-2012-08-09_1.js
var dbits;
var canary = 0xdeadbeefcafe;
var j_lm = (canary & 16777215) == 15715070;
function BigInteger(a, b, c) {
	if (a != null) if ("number" == typeof a) this.fromNumber(a, b, c);
else if (b == null && "string" != typeof a) this.fromString(a, 256);
else this.fromString(a, b);
}
function nbi() {
	return new BigInteger(null);
}
function am1(i, x, w, j, c, n) {
	while (--n >= 0) {
		var v = x * this[i++] + w[j] + c;
		c = Math.floor(v / 67108864);
		w[j++] = v & 67108863;
	}
	return c;
}
function am2(i, x, w, j, c, n) {
	var xl = x & 32767, xh = x >> 15;
	while (--n >= 0) {
		var l = this[i] & 32767;
		var h = this[i++] >> 15;
		var m = xh * l + h * xl;
		l = xl * l + ((m & 32767) << 15) + w[j] + (c & 1073741823);
		c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
		w[j++] = l & 1073741823;
	}
	return c;
}
function am3(i, x, w, j, c, n) {
	var xl = x & 16383, xh = x >> 14;
	while (--n >= 0) {
		var l = this[i] & 16383;
		var h = this[i++] >> 14;
		var m = xh * l + h * xl;
		l = xl * l + ((m & 16383) << 14) + w[j] + c;
		c = (l >> 28) + (m >> 14) + xh * h;
		w[j++] = l & 268435455;
	}
	return c;
}
if (j_lm && typeof navigator === "object" && navigator.appName == "Microsoft Internet Explorer") {
	BigInteger.prototype.am = am2;
	dbits = 30;
} else if (j_lm && typeof navigator === "object" && navigator.appName != "Netscape") {
	BigInteger.prototype.am = am1;
	dbits = 26;
} else {
	BigInteger.prototype.am = am3;
	dbits = 28;
}
BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = (1 << dbits) - 1;
BigInteger.prototype.DV = 1 << dbits;
var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2, BI_FP);
BigInteger.prototype.F1 = BI_FP - dbits;
BigInteger.prototype.F2 = 2 * dbits - BI_FP;
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr, vv;
rr = "0".charCodeAt(0);
for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
function int2char(n) {
	return BI_RM.charAt(n);
}
function intAt(s, i) {
	var c = BI_RC[s.charCodeAt(i)];
	return c == null ? -1 : c;
}
function bnpCopyTo(r) {
	for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
	r.t = this.t;
	r.s = this.s;
}
function bnpFromInt(x) {
	this.t = 1;
	this.s = x < 0 ? -1 : 0;
	if (x > 0) this[0] = x;
else if (x < -1) this[0] = x + DV;
else this.t = 0;
}
function nbv(i) {
	var r = nbi();
	r.fromInt(i);
	return r;
}
function bnpFromString(s, b) {
	var k;
	if (b == 16) k = 4;
else if (b == 8) k = 3;
else if (b == 256) k = 8;
else if (b == 2) k = 1;
else if (b == 32) k = 5;
else if (b == 4) k = 2;
else {
		this.fromRadix(s, b);
		return;
	}
	this.t = 0;
	this.s = 0;
	var i = s.length, mi = false, sh = 0;
	while (--i >= 0) {
		var x = k == 8 ? s[i] & 255 : intAt(s, i);
		if (x < 0) {
			if (s.charAt(i) == "-") mi = true;
			continue;
		}
		mi = false;
		if (sh == 0) this[this.t++] = x;
else if (sh + k > this.DB) {
			this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
			this[this.t++] = x >> this.DB - sh;
		} else this[this.t - 1] |= x << sh;
		sh += k;
		if (sh >= this.DB) sh -= this.DB;
	}
	if (k == 8 && (s[0] & 128) != 0) {
		this.s = -1;
		if (sh > 0) this[this.t - 1] |= (1 << this.DB - sh) - 1 << sh;
	}
	this.clamp();
	if (mi) BigInteger.ZERO.subTo(this, this);
}
function bnpClamp() {
	var c = this.s & this.DM;
	while (this.t > 0 && this[this.t - 1] == c) --this.t;
}
function bnToString(b) {
	if (this.s < 0) return "-" + this.negate().toString(b);
	var k;
	if (b == 16) k = 4;
else if (b == 8) k = 3;
else if (b == 2) k = 1;
else if (b == 32) k = 5;
else if (b == 4) k = 2;
else return this.toRadix(b);
	var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
	var p = this.DB - i * this.DB % k;
	if (i-- > 0) {
		if (p < this.DB && (d = this[i] >> p) > 0) {
			m = true;
			r = int2char(d);
		}
		while (i >= 0) {
			if (p < k) {
				d = (this[i] & (1 << p) - 1) << k - p;
				d |= this[--i] >> (p += this.DB - k);
			} else {
				d = this[i] >> (p -= k) & km;
				if (p <= 0) {
					p += this.DB;
					--i;
				}
			}
			if (d > 0) m = true;
			if (m) r += int2char(d);
		}
	}
	return m ? r : "0";
}
function bnNegate() {
	var r = nbi();
	BigInteger.ZERO.subTo(this, r);
	return r;
}
function bnAbs() {
	return this.s < 0 ? this.negate() : this;
}
function bnCompareTo(a) {
	var r = this.s - a.s;
	if (r != 0) return r;
	var i = this.t;
	r = i - a.t;
	if (r != 0) return this.s < 0 ? -r : r;
	while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
	return 0;
}
function nbits(x) {
	var r = 1, t$1;
	if ((t$1 = x >>> 16) != 0) {
		x = t$1;
		r += 16;
	}
	if ((t$1 = x >> 8) != 0) {
		x = t$1;
		r += 8;
	}
	if ((t$1 = x >> 4) != 0) {
		x = t$1;
		r += 4;
	}
	if ((t$1 = x >> 2) != 0) {
		x = t$1;
		r += 2;
	}
	if ((t$1 = x >> 1) != 0) {
		x = t$1;
		r += 1;
	}
	return r;
}
function bnBitLength() {
	if (this.t <= 0) return 0;
	return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
}
function bnpDLShiftTo(n, r) {
	var i;
	for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
	for (i = n - 1; i >= 0; --i) r[i] = 0;
	r.t = this.t + n;
	r.s = this.s;
}
function bnpDRShiftTo(n, r) {
	for (var i = n; i < this.t; ++i) r[i - n] = this[i];
	r.t = Math.max(this.t - n, 0);
	r.s = this.s;
}
function bnpLShiftTo(n, r) {
	var bs = n % this.DB;
	var cbs = this.DB - bs;
	var bm = (1 << cbs) - 1;
	var ds = Math.floor(n / this.DB), c = this.s << bs & this.DM, i;
	for (i = this.t - 1; i >= 0; --i) {
		r[i + ds + 1] = this[i] >> cbs | c;
		c = (this[i] & bm) << bs;
	}
	for (i = ds - 1; i >= 0; --i) r[i] = 0;
	r[ds] = c;
	r.t = this.t + ds + 1;
	r.s = this.s;
	r.clamp();
}
function bnpRShiftTo(n, r) {
	r.s = this.s;
	var ds = Math.floor(n / this.DB);
	if (ds >= this.t) {
		r.t = 0;
		return;
	}
	var bs = n % this.DB;
	var cbs = this.DB - bs;
	var bm = (1 << bs) - 1;
	r[0] = this[ds] >> bs;
	for (var i = ds + 1; i < this.t; ++i) {
		r[i - ds - 1] |= (this[i] & bm) << cbs;
		r[i - ds] = this[i] >> bs;
	}
	if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
	r.t = this.t - ds;
	r.clamp();
}
function bnpSubTo(a, r) {
	var i = 0, c = 0, m = Math.min(a.t, this.t);
	while (i < m) {
		c += this[i] - a[i];
		r[i++] = c & this.DM;
		c >>= this.DB;
	}
	if (a.t < this.t) {
		c -= a.s;
		while (i < this.t) {
			c += this[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		c += this.s;
	} else {
		c += this.s;
		while (i < a.t) {
			c -= a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		c -= a.s;
	}
	r.s = c < 0 ? -1 : 0;
	if (c < -1) r[i++] = this.DV + c;
else if (c > 0) r[i++] = c;
	r.t = i;
	r.clamp();
}
function bnpMultiplyTo(a, r) {
	var x = this.abs(), y = a.abs();
	var i = x.t;
	r.t = i + y.t;
	while (--i >= 0) r[i] = 0;
	for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
	r.s = 0;
	r.clamp();
	if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
}
function bnpSquareTo(r) {
	var x = this.abs();
	var i = r.t = 2 * x.t;
	while (--i >= 0) r[i] = 0;
	for (i = 0; i < x.t - 1; ++i) {
		var c = x.am(i, x[i], r, 2 * i, 0, 1);
		if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
			r[i + x.t] -= x.DV;
			r[i + x.t + 1] = 1;
		}
	}
	if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
	r.s = 0;
	r.clamp();
}
function bnpDivRemTo(m, q, r) {
	var pm = m.abs();
	if (pm.t <= 0) return;
	var pt = this.abs();
	if (pt.t < pm.t) {
		if (q != null) q.fromInt(0);
		if (r != null) this.copyTo(r);
		return;
	}
	if (r == null) r = nbi();
	var y = nbi(), ts = this.s, ms = m.s;
	var nsh = this.DB - nbits(pm[pm.t - 1]);
	if (nsh > 0) {
		pm.lShiftTo(nsh, y);
		pt.lShiftTo(nsh, r);
	} else {
		pm.copyTo(y);
		pt.copyTo(r);
	}
	var ys = y.t;
	var y0 = y[ys - 1];
	if (y0 == 0) return;
	var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
	var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
	var i = r.t, j = i - ys, t$1 = q == null ? nbi() : q;
	y.dlShiftTo(j, t$1);
	if (r.compareTo(t$1) >= 0) {
		r[r.t++] = 1;
		r.subTo(t$1, r);
	}
	BigInteger.ONE.dlShiftTo(ys, t$1);
	t$1.subTo(y, y);
	while (y.t < ys) y[y.t++] = 0;
	while (--j >= 0) {
		var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
		if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
			y.dlShiftTo(j, t$1);
			r.subTo(t$1, r);
			while (r[i] < --qd) r.subTo(t$1, r);
		}
	}
	if (q != null) {
		r.drShiftTo(ys, q);
		if (ts != ms) BigInteger.ZERO.subTo(q, q);
	}
	r.t = ys;
	r.clamp();
	if (nsh > 0) r.rShiftTo(nsh, r);
	if (ts < 0) BigInteger.ZERO.subTo(r, r);
}
function bnMod(a) {
	var r = nbi();
	this.abs().divRemTo(a, null, r);
	if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
	return r;
}
function Classic(m) {
	this.m = m;
}
function cConvert(x) {
	if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
else return x;
}
function cRevert(x) {
	return x;
}
function cReduce(x) {
	x.divRemTo(this.m, null, x);
}
function cMulTo(x, y, r) {
	x.multiplyTo(y, r);
	this.reduce(r);
}
function cSqrTo(x, r) {
	x.squareTo(r);
	this.reduce(r);
}
Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;
function bnpInvDigit() {
	if (this.t < 1) return 0;
	var x = this[0];
	if ((x & 1) == 0) return 0;
	var y = x & 3;
	y = y * (2 - (x & 15) * y) & 15;
	y = y * (2 - (x & 255) * y) & 255;
	y = y * (2 - ((x & 65535) * y & 65535)) & 65535;
	y = y * (2 - x * y % this.DV) % this.DV;
	return y > 0 ? this.DV - y : -y;
}
function Montgomery(m) {
	this.m = m;
	this.mp = m.invDigit();
	this.mpl = this.mp & 32767;
	this.mph = this.mp >> 15;
	this.um = (1 << m.DB - 15) - 1;
	this.mt2 = 2 * m.t;
}
function montConvert(x) {
	var r = nbi();
	x.abs().dlShiftTo(this.m.t, r);
	r.divRemTo(this.m, null, r);
	if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
	return r;
}
function montRevert(x) {
	var r = nbi();
	x.copyTo(r);
	this.reduce(r);
	return r;
}
function montReduce(x) {
	while (x.t <= this.mt2) x[x.t++] = 0;
	for (var i = 0; i < this.m.t; ++i) {
		var j = x[i] & 32767;
		var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
		j = i + this.m.t;
		x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
		while (x[j] >= x.DV) {
			x[j] -= x.DV;
			x[++j]++;
		}
	}
	x.clamp();
	x.drShiftTo(this.m.t, x);
	if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
}
function montSqrTo(x, r) {
	x.squareTo(r);
	this.reduce(r);
}
function montMulTo(x, y, r) {
	x.multiplyTo(y, r);
	this.reduce(r);
}
Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;
function bnpIsEven() {
	return (this.t > 0 ? this[0] & 1 : this.s) == 0;
}
function bnpExp(e, z) {
	if (e > 4294967295 || e < 1) return BigInteger.ONE;
	var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
	g.copyTo(r);
	while (--i >= 0) {
		z.sqrTo(r, r2);
		if ((e & 1 << i) > 0) z.mulTo(r2, g, r);
else {
			var t$1 = r;
			r = r2;
			r2 = t$1;
		}
	}
	return z.revert(r);
}
function bnModPowInt(e, m) {
	var z;
	if (e < 256 || m.isEven()) z = new Classic(m);
else z = new Montgomery(m);
	return this.exp(e, z);
}
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);
function bnClone() {
	var r = nbi();
	this.copyTo(r);
	return r;
}
function bnIntValue() {
	if (this.s < 0) {
		if (this.t == 1) return this[0] - this.DV;
else if (this.t == 0) return -1;
	} else if (this.t == 1) return this[0];
else if (this.t == 0) return 0;
	return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
}
function bnByteValue() {
	return this.t == 0 ? this.s : this[0] << 24 >> 24;
}
function bnShortValue() {
	return this.t == 0 ? this.s : this[0] << 16 >> 16;
}
function bnpChunkSize(r) {
	return Math.floor(Math.LN2 * this.DB / Math.log(r));
}
function bnSigNum() {
	if (this.s < 0) return -1;
else if (this.t <= 0 || this.t == 1 && this[0] <= 0) return 0;
else return 1;
}
function bnpToRadix(b) {
	if (b == null) b = 10;
	if (this.signum() == 0 || b < 2 || b > 36) return "0";
	var cs = this.chunkSize(b);
	var a = Math.pow(b, cs);
	var d = nbv(a), y = nbi(), z = nbi(), r = "";
	this.divRemTo(d, y, z);
	while (y.signum() > 0) {
		r = (a + z.intValue()).toString(b).substring(1) + r;
		y.divRemTo(d, y, z);
	}
	return z.intValue().toString(b) + r;
}
function bnpFromRadix(s, b) {
	this.fromInt(0);
	if (b == null) b = 10;
	var cs = this.chunkSize(b);
	var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
	for (var i = 0; i < s.length; ++i) {
		var x = intAt(s, i);
		if (x < 0) {
			if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
			continue;
		}
		w = b * w + x;
		if (++j >= cs) {
			this.dMultiply(d);
			this.dAddOffset(w, 0);
			j = 0;
			w = 0;
		}
	}
	if (j > 0) {
		this.dMultiply(Math.pow(b, j));
		this.dAddOffset(w, 0);
	}
	if (mi) BigInteger.ZERO.subTo(this, this);
}
function bnpFromNumber(a, b, c) {
	if ("number" == typeof b) if (a < 2) this.fromInt(1);
else {
		this.fromNumber(a, c);
		if (!this.testBit(a - 1)) this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
		if (this.isEven()) this.dAddOffset(1, 0);
		while (!this.isProbablePrime(b)) {
			this.dAddOffset(2, 0);
			if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
		}
	}
else {
		var x = new Array(), t$1 = a & 7;
		x.length = (a >> 3) + 1;
		b.nextBytes(x);
		if (t$1 > 0) x[0] &= (1 << t$1) - 1;
else x[0] = 0;
		this.fromString(x, 256);
	}
}
function bnToByteArray() {
	var i = this.t, r = new Array();
	r[0] = this.s;
	var p = this.DB - i * this.DB % 8, d, k = 0;
	if (i-- > 0) {
		if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p) r[k++] = d | this.s << this.DB - p;
		while (i >= 0) {
			if (p < 8) {
				d = (this[i] & (1 << p) - 1) << 8 - p;
				d |= this[--i] >> (p += this.DB - 8);
			} else {
				d = this[i] >> (p -= 8) & 255;
				if (p <= 0) {
					p += this.DB;
					--i;
				}
			}
			if ((d & 128) != 0) d |= -256;
			if (k == 0 && (this.s & 128) != (d & 128)) ++k;
			if (k > 0 || d != this.s) r[k++] = d;
		}
	}
	return r;
}
function bnEquals(a) {
	return this.compareTo(a) == 0;
}
function bnMin(a) {
	return this.compareTo(a) < 0 ? this : a;
}
function bnMax(a) {
	return this.compareTo(a) > 0 ? this : a;
}
function bnpBitwiseTo(a, op, r) {
	var i, f, m = Math.min(a.t, this.t);
	for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
	if (a.t < this.t) {
		f = a.s & this.DM;
		for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
		r.t = this.t;
	} else {
		f = this.s & this.DM;
		for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
		r.t = a.t;
	}
	r.s = op(this.s, a.s);
	r.clamp();
}
function op_and(x, y) {
	return x & y;
}
function bnAnd(a) {
	var r = nbi();
	this.bitwiseTo(a, op_and, r);
	return r;
}
function op_or(x, y) {
	return x | y;
}
function bnOr(a) {
	var r = nbi();
	this.bitwiseTo(a, op_or, r);
	return r;
}
function op_xor(x, y) {
	return x ^ y;
}
function bnXor(a) {
	var r = nbi();
	this.bitwiseTo(a, op_xor, r);
	return r;
}
function op_andnot(x, y) {
	return x & ~y;
}
function bnAndNot(a) {
	var r = nbi();
	this.bitwiseTo(a, op_andnot, r);
	return r;
}
function bnNot() {
	var r = nbi();
	for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
	r.t = this.t;
	r.s = ~this.s;
	return r;
}
function bnShiftLeft(n) {
	var r = nbi();
	if (n < 0) this.rShiftTo(-n, r);
else this.lShiftTo(n, r);
	return r;
}
function bnShiftRight(n) {
	var r = nbi();
	if (n < 0) this.lShiftTo(-n, r);
else this.rShiftTo(n, r);
	return r;
}
function lbit(x) {
	if (x == 0) return -1;
	var r = 0;
	if ((x & 65535) == 0) {
		x >>= 16;
		r += 16;
	}
	if ((x & 255) == 0) {
		x >>= 8;
		r += 8;
	}
	if ((x & 15) == 0) {
		x >>= 4;
		r += 4;
	}
	if ((x & 3) == 0) {
		x >>= 2;
		r += 2;
	}
	if ((x & 1) == 0) ++r;
	return r;
}
function bnGetLowestSetBit() {
	for (var i = 0; i < this.t; ++i) if (this[i] != 0) return i * this.DB + lbit(this[i]);
	if (this.s < 0) return this.t * this.DB;
	return -1;
}
function cbit(x) {
	var r = 0;
	while (x != 0) {
		x &= x - 1;
		++r;
	}
	return r;
}
function bnBitCount() {
	var r = 0, x = this.s & this.DM;
	for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
	return r;
}
function bnTestBit(n) {
	var j = Math.floor(n / this.DB);
	if (j >= this.t) return this.s != 0;
	return (this[j] & 1 << n % this.DB) != 0;
}
function bnpChangeBit(n, op) {
	var r = BigInteger.ONE.shiftLeft(n);
	this.bitwiseTo(r, op, r);
	return r;
}
function bnSetBit(n) {
	return this.changeBit(n, op_or);
}
function bnClearBit(n) {
	return this.changeBit(n, op_andnot);
}
function bnFlipBit(n) {
	return this.changeBit(n, op_xor);
}
function bnpAddTo(a, r) {
	var i = 0, c = 0, m = Math.min(a.t, this.t);
	while (i < m) {
		c += this[i] + a[i];
		r[i++] = c & this.DM;
		c >>= this.DB;
	}
	if (a.t < this.t) {
		c += a.s;
		while (i < this.t) {
			c += this[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		c += this.s;
	} else {
		c += this.s;
		while (i < a.t) {
			c += a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		c += a.s;
	}
	r.s = c < 0 ? -1 : 0;
	if (c > 0) r[i++] = c;
else if (c < -1) r[i++] = this.DV + c;
	r.t = i;
	r.clamp();
}
function bnAdd(a) {
	var r = nbi();
	this.addTo(a, r);
	return r;
}
function bnSubtract(a) {
	var r = nbi();
	this.subTo(a, r);
	return r;
}
function bnMultiply(a) {
	var r = nbi();
	this.multiplyTo(a, r);
	return r;
}
function bnSquare() {
	var r = nbi();
	this.squareTo(r);
	return r;
}
function bnDivide(a) {
	var r = nbi();
	this.divRemTo(a, r, null);
	return r;
}
function bnRemainder(a) {
	var r = nbi();
	this.divRemTo(a, null, r);
	return r;
}
function bnDivideAndRemainder(a) {
	var q = nbi(), r = nbi();
	this.divRemTo(a, q, r);
	return new Array(q, r);
}
function bnpDMultiply(n) {
	this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
	++this.t;
	this.clamp();
}
function bnpDAddOffset(n, w) {
	if (n == 0) return;
	while (this.t <= w) this[this.t++] = 0;
	this[w] += n;
	while (this[w] >= this.DV) {
		this[w] -= this.DV;
		if (++w >= this.t) this[this.t++] = 0;
		++this[w];
	}
}
function NullExp() {}
function nNop(x) {
	return x;
}
function nMulTo(x, y, r) {
	x.multiplyTo(y, r);
}
function nSqrTo(x, r) {
	x.squareTo(r);
}
NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;
function bnPow(e) {
	return this.exp(e, new NullExp());
}
function bnpMultiplyLowerTo(a, n, r) {
	var i = Math.min(this.t + a.t, n);
	r.s = 0;
	r.t = i;
	while (i > 0) r[--i] = 0;
	var j;
	for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
	for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
	r.clamp();
}
function bnpMultiplyUpperTo(a, n, r) {
	--n;
	var i = r.t = this.t + a.t - n;
	r.s = 0;
	while (--i >= 0) r[i] = 0;
	for (i = Math.max(n - this.t, 0); i < a.t; ++i) r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
	r.clamp();
	r.drShiftTo(1, r);
}
function Barrett(m) {
	this.r2 = nbi();
	this.q3 = nbi();
	BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
	this.mu = this.r2.divide(m);
	this.m = m;
}
function barrettConvert(x) {
	if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
else if (x.compareTo(this.m) < 0) return x;
else {
		var r = nbi();
		x.copyTo(r);
		this.reduce(r);
		return r;
	}
}
function barrettRevert(x) {
	return x;
}
function barrettReduce(x) {
	x.drShiftTo(this.m.t - 1, this.r2);
	if (x.t > this.m.t + 1) {
		x.t = this.m.t + 1;
		x.clamp();
	}
	this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
	this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
	while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
	x.subTo(this.r2, x);
	while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
}
function barrettSqrTo(x, r) {
	x.squareTo(r);
	this.reduce(r);
}
function barrettMulTo(x, y, r) {
	x.multiplyTo(y, r);
	this.reduce(r);
}
Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;
function bnModPow(e, m) {
	var xHex = this.toString(16);
	var eHex = e.toString(16);
	var mHex = m.toString(16);
	var result = powMod(str2bigInt(xHex, 16), str2bigInt(eHex, 16), str2bigInt(mHex, 16));
	return new BigInteger(bigInt2str(result, 16), 16);
}
function bnGCD(a) {
	var x = this.s < 0 ? this.negate() : this.clone();
	var y = a.s < 0 ? a.negate() : a.clone();
	if (x.compareTo(y) < 0) {
		var t$1 = x;
		x = y;
		y = t$1;
	}
	var i = x.getLowestSetBit(), g = y.getLowestSetBit();
	if (g < 0) return x;
	if (i < g) g = i;
	if (g > 0) {
		x.rShiftTo(g, x);
		y.rShiftTo(g, y);
	}
	while (x.signum() > 0) {
		if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
		if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
		if (x.compareTo(y) >= 0) {
			x.subTo(y, x);
			x.rShiftTo(1, x);
		} else {
			y.subTo(x, y);
			y.rShiftTo(1, y);
		}
	}
	if (g > 0) y.lShiftTo(g, y);
	return y;
}
function bnpModInt(n) {
	if (n <= 0) return 0;
	var d = this.DV % n, r = this.s < 0 ? n - 1 : 0;
	if (this.t > 0) if (d == 0) r = this[0] % n;
else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
	return r;
}
function bnModInverse(m) {
	var ac = m.isEven();
	if (this.isEven() && ac || m.signum() == 0) return BigInteger.ZERO;
	var u = m.clone(), v = this.clone();
	var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
	while (u.signum() != 0) {
		while (u.isEven()) {
			u.rShiftTo(1, u);
			if (ac) {
				if (!a.isEven() || !b.isEven()) {
					a.addTo(this, a);
					b.subTo(m, b);
				}
				a.rShiftTo(1, a);
			} else if (!b.isEven()) b.subTo(m, b);
			b.rShiftTo(1, b);
		}
		while (v.isEven()) {
			v.rShiftTo(1, v);
			if (ac) {
				if (!c.isEven() || !d.isEven()) {
					c.addTo(this, c);
					d.subTo(m, d);
				}
				c.rShiftTo(1, c);
			} else if (!d.isEven()) d.subTo(m, d);
			d.rShiftTo(1, d);
		}
		if (u.compareTo(v) >= 0) {
			u.subTo(v, u);
			if (ac) a.subTo(c, a);
			b.subTo(d, b);
		} else {
			v.subTo(u, v);
			if (ac) c.subTo(a, c);
			d.subTo(b, d);
		}
	}
	if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
	if (d.compareTo(m) >= 0) return d.subtract(m);
	if (d.signum() < 0) d.addTo(m, d);
else return d;
	if (d.signum() < 0) return d.add(m);
else return d;
}
var lowprimes = [
	2,
	3,
	5,
	7,
	11,
	13,
	17,
	19,
	23,
	29,
	31,
	37,
	41,
	43,
	47,
	53,
	59,
	61,
	67,
	71,
	73,
	79,
	83,
	89,
	97,
	101,
	103,
	107,
	109,
	113,
	127,
	131,
	137,
	139,
	149,
	151,
	157,
	163,
	167,
	173,
	179,
	181,
	191,
	193,
	197,
	199,
	211,
	223,
	227,
	229,
	233,
	239,
	241,
	251,
	257,
	263,
	269,
	271,
	277,
	281,
	283,
	293,
	307,
	311,
	313,
	317,
	331,
	337,
	347,
	349,
	353,
	359,
	367,
	373,
	379,
	383,
	389,
	397,
	401,
	409,
	419,
	421,
	431,
	433,
	439,
	443,
	449,
	457,
	461,
	463,
	467,
	479,
	487,
	491,
	499,
	503,
	509,
	521,
	523,
	541,
	547,
	557,
	563,
	569,
	571,
	577,
	587,
	593,
	599,
	601,
	607,
	613,
	617,
	619,
	631,
	641,
	643,
	647,
	653,
	659,
	661,
	673,
	677,
	683,
	691,
	701,
	709,
	719,
	727,
	733,
	739,
	743,
	751,
	757,
	761,
	769,
	773,
	787,
	797,
	809,
	811,
	821,
	823,
	827,
	829,
	839,
	853,
	857,
	859,
	863,
	877,
	881,
	883,
	887,
	907,
	911,
	919,
	929,
	937,
	941,
	947,
	953,
	967,
	971,
	977,
	983,
	991,
	997
];
var lplim = 67108864 / lowprimes[lowprimes.length - 1];
function bnIsProbablePrime(t$1) {
	var i, x = this.abs();
	if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
		for (i = 0; i < lowprimes.length; ++i) if (x[0] == lowprimes[i]) return true;
		return false;
	}
	if (x.isEven()) return false;
	i = 1;
	while (i < lowprimes.length) {
		var m = lowprimes[i], j = i + 1;
		while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
		m = x.modInt(m);
		while (i < j) if (m % lowprimes[i++] == 0) return false;
	}
	return x.millerRabin(t$1);
}
function bnpMillerRabin(t$1) {
	var n1 = this.subtract(BigInteger.ONE);
	var k = n1.getLowestSetBit();
	if (k <= 0) return false;
	var r = n1.shiftRight(k);
	t$1 = t$1 + 1 >> 1;
	if (t$1 > lowprimes.length) t$1 = lowprimes.length;
	var a = nbi();
	for (var i = 0; i < t$1; ++i) {
		a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
		var y = a.modPow(r, this);
		if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
			var j = 1;
			while (j++ < k && y.compareTo(n1) != 0) {
				y = y.modPowInt(2, this);
				if (y.compareTo(BigInteger.ONE) == 0) return false;
			}
			if (y.compareTo(n1) != 0) return false;
		}
	}
	return true;
}
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
BigInteger.prototype.square = bnSquare;
function parseBigInt(str, r) {
	return new BigInteger(str, r);
}
function pkcs1pad2(s, n) {
	if (n < s.length + 11) {
		alert("Message too long for RSA");
		return null;
	}
	var ba = new Array();
	var i = s.length - 1;
	while (i >= 0 && n > 0) {
		var c = s.charCodeAt(i--);
		if (c < 128) ba[--n] = c;
else if (c > 127 && c < 2048) {
			ba[--n] = c & 63 | 128;
			ba[--n] = c >> 6 | 192;
		} else {
			ba[--n] = c & 63 | 128;
			ba[--n] = c >> 6 & 63 | 128;
			ba[--n] = c >> 12 | 224;
		}
	}
	ba[--n] = 0;
	var rng = new SecureRandom();
	var x = new Array();
	while (n > 2) {
		x[0] = 0;
		while (x[0] == 0) rng.nextBytes(x);
		ba[--n] = x[0];
	}
	ba[--n] = 2;
	ba[--n] = 0;
	return new BigInteger(ba);
}
function RSAKey() {
	this.n = null;
	this.e = 0;
	this.d = null;
	this.p = null;
	this.q = null;
	this.dmp1 = null;
	this.dmq1 = null;
	this.coeff = null;
}
function RSASetPublic(N, E) {
	if (N != null && E != null && N.length > 0 && E.length > 0) {
		this.n = parseBigInt(N, 16);
		this.e = parseInt(E, 16);
	} else alert("Invalid RSA public key");
}
function RSADoPublic(x) {
	return x.modPowInt(this.e, this.n);
}
function RSAEncrypt(text) {
	var m = pkcs1pad2(text, this.n.bitLength() + 7 >> 3);
	if (m == null) return null;
	var c = this.doPublic(m);
	if (c == null) return null;
	var h = c.toString(16);
	if ((h.length & 1) == 0) return h;
else return "0" + h;
}
RSAKey.prototype.doPublic = RSADoPublic;
RSAKey.prototype.setPublic = RSASetPublic;
RSAKey.prototype.encrypt = RSAEncrypt;
function pkcs1unpad2(d, n) {
	var b = d.toByteArray();
	var i = 0;
	while (i < b.length && b[i] == 0) ++i;
	if (b.length - i != n - 1 || b[i] != 2) return null;
	++i;
	while (b[i] != 0) if (++i >= b.length) return null;
	var ret = "";
	while (++i < b.length) {
		var c = b[i] & 255;
		if (c < 128) ret += String.fromCharCode(c);
else if (c > 191 && c < 224) {
			ret += String.fromCharCode((c & 31) << 6 | b[i + 1] & 63);
			++i;
		} else {
			ret += String.fromCharCode((c & 15) << 12 | (b[i + 1] & 63) << 6 | b[i + 2] & 63);
			i += 2;
		}
	}
	return ret;
}
function RSASetPrivate(N, E, D) {
	if (N != null && E != null && N.length > 0 && E.length > 0) {
		this.n = parseBigInt(N, 16);
		this.e = parseInt(E, 16);
		this.d = parseBigInt(D, 16);
	} else alert("Invalid RSA private key");
}
function RSASetPrivateEx(N, E, D, P, Q, DP, DQ, C) {
	if (N != null && E != null && N.length > 0 && E.length > 0) {
		this.n = parseBigInt(N, 16);
		this.e = parseInt(E, 16);
		this.d = parseBigInt(D, 16);
		this.p = parseBigInt(P, 16);
		this.q = parseBigInt(Q, 16);
		this.dmp1 = parseBigInt(DP, 16);
		this.dmq1 = parseBigInt(DQ, 16);
		this.coeff = parseBigInt(C, 16);
	} else alert("Invalid RSA private key");
}
function RSAGenerate(B, E) {
	var rng = new SecureRandom();
	var qs = B >> 1;
	this.e = parseInt(E, 16);
	var ee = new BigInteger(E, 16);
	for (;;) {
		for (;;) {
			this.p = new BigInteger(B - qs, 10, rng);
			if (this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0) break;
		}
		for (;;) {
			this.q = new BigInteger(qs, 10, rng);
			if (this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0) break;
		}
		if (this.p.compareTo(this.q) <= 0) {
			var t$1 = this.p;
			this.p = this.q;
			this.q = t$1;
		}
		var p1 = this.p.subtract(BigInteger.ONE);
		var q1 = this.q.subtract(BigInteger.ONE);
		var phi = p1.multiply(q1);
		if (phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
			this.n = this.p.multiply(this.q);
			this.d = ee.modInverse(phi);
			this.dmp1 = this.d.mod(p1);
			this.dmq1 = this.d.mod(q1);
			this.coeff = this.q.modInverse(this.p);
			break;
		}
	}
}
function RSADoPrivate(x) {
	if (this.p == null || this.q == null) return x.modPow(this.d, this.n);
	var xp = x.mod(this.p).modPow(this.dmp1, this.p);
	var xq = x.mod(this.q).modPow(this.dmq1, this.q);
	while (xp.compareTo(xq) < 0) xp = xp.add(this.p);
	return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
}
function RSADecrypt(ctext) {
	var c = parseBigInt(ctext, 16);
	var m = this.doPrivate(c);
	if (m == null) return null;
	return pkcs1unpad2(m, this.n.bitLength() + 7 >> 3);
}
RSAKey.prototype.doPrivate = RSADoPrivate;
RSAKey.prototype.setPrivate = RSASetPrivate;
RSAKey.prototype.setPrivateEx = RSASetPrivateEx;
RSAKey.prototype.generate = RSAGenerate;
RSAKey.prototype.decrypt = RSADecrypt;
var bpe = 0;
var mask = 0;
var radix = mask + 1;
const digitsStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_=!@#$%^&*()[]{}|;:,.<>/?`~ \\'\"+-";
for (bpe = 0; 1 << bpe + 1 > 1 << bpe; bpe++);
bpe >>= 1;
mask = (1 << bpe) - 1;
radix = mask + 1;
const one = int2bigInt(1, 1, 1);
var t = new Array(0);
var s0 = t;
var s3 = t;
var s4 = t;
var s5 = t;
var s6 = t;
var s7 = t;
var sa = t;
function expand(x, n) {
	var ans = int2bigInt(0, (x.length > n ? x.length : n) * bpe, 0);
	copy_(ans, x);
	return ans;
}
function powMod(x, y, n) {
	var ans = expand(x, n.length);
	powMod_(ans, trim(y, 2), trim(n, 2), 0);
	return trim(ans, 1);
}
function inverseModInt(x, n) {
	var a = 1, b = 0, t$1;
	for (;;) {
		if (x == 1) return a;
		if (x == 0) return 0;
		b -= a * Math.floor(n / x);
		n %= x;
		if (n == 1) return b;
		if (n == 0) return 0;
		a -= b * Math.floor(x / n);
		x %= n;
	}
}
function negative(x) {
	return x[x.length - 1] >> bpe - 1 & 1;
}
function greaterShift(x, y, shift) {
	var i, kx = x.length, ky = y.length, k = kx + shift < ky ? kx + shift : ky;
	for (i = ky - 1 - shift; i < kx && i >= 0; i++) if (x[i] > 0) return 1;
	for (i = kx - 1 + shift; i < ky; i++) if (y[i] > 0) return 0;
	for (i = k - 1; i >= shift; i--) if (x[i - shift] > y[i]) return 1;
else if (x[i - shift] < y[i]) return 0;
	return 0;
}
function greater(x, y) {
	var i;
	var k = x.length < y.length ? x.length : y.length;
	for (i = x.length; i < y.length; i++) if (y[i]) return 0;
	for (i = y.length; i < x.length; i++) if (x[i]) return 1;
	for (i = k - 1; i >= 0; i--) if (x[i] > y[i]) return 1;
else if (x[i] < y[i]) return 0;
	return 0;
}
function divide_(x, y, q, r) {
	var kx, ky;
	var i, j, y1, y2, c, a, b;
	copy_(r, x);
	for (ky = y.length; y[ky - 1] == 0; ky--);
	b = y[ky - 1];
	for (a = 0; b; a++) b >>= 1;
	a = bpe - a;
	leftShift_(y, a);
	leftShift_(r, a);
	for (kx = r.length; r[kx - 1] == 0 && kx > ky; kx--);
	copyInt_(q, 0);
	while (!greaterShift(y, r, kx - ky)) {
		subShift_(r, y, kx - ky);
		q[kx - ky]++;
	}
	for (i = kx - 1; i >= ky; i--) {
		if (r[i] == y[ky - 1]) q[i - ky] = mask;
else q[i - ky] = Math.floor((r[i] * radix + r[i - 1]) / y[ky - 1]);
		for (;;) {
			y2 = (ky > 1 ? y[ky - 2] : 0) * q[i - ky];
			c = y2 >> bpe;
			y2 = y2 & mask;
			y1 = c + q[i - ky] * y[ky - 1];
			c = y1 >> bpe;
			y1 = y1 & mask;
			if (c == r[i] ? y1 == r[i - 1] ? y2 > (i > 1 ? r[i - 2] : 0) : y1 > r[i - 1] : c > r[i]) q[i - ky]--;
else break;
		}
		linCombShift_(r, y, -q[i - ky], i - ky);
		if (negative(r)) {
			addShift_(r, y, i - ky);
			q[i - ky]--;
		}
	}
	rightShift_(y, a);
	rightShift_(r, a);
}
function modInt(x, n) {
	var i, c = 0;
	for (i = x.length - 1; i >= 0; i--) c = (c * radix + x[i]) % n;
	return c;
}
function int2bigInt(t$1, bits, minSize) {
	var i, k, buff;
	k = Math.ceil(bits / bpe) + 1;
	k = minSize > k ? minSize : k;
	buff = new Array(k);
	copyInt_(buff, t$1);
	return buff;
}
function str2bigInt(s, base, minSize) {
	var d, i, j, x, y, kk;
	var k = s.length;
	if (base == -1) {
		x = new Array(0);
		for (;;) {
			y = new Array(x.length + 1);
			for (i = 0; i < x.length; i++) y[i + 1] = x[i];
			y[0] = parseInt(s, 10);
			x = y;
			d = s.indexOf(",", 0);
			if (d < 1) break;
			s = s.substring(d + 1);
			if (s.length == 0) break;
		}
		if (x.length < minSize) {
			y = new Array(minSize);
			copy_(y, x);
			return y;
		}
		return x;
	}
	x = int2bigInt(0, base * k, 0);
	for (i = 0; i < k; i++) {
		d = digitsStr.indexOf(s.substring(i, i + 1), 0);
		if (base <= 36 && d >= 36) d -= 26;
		if (d >= base || d < 0) break;
		multInt_(x, base);
		addInt_(x, d);
	}
	for (k = x.length; k > 0 && !x[k - 1]; k--);
	k = minSize > k + 1 ? minSize : k + 1;
	y = new Array(k);
	kk = k < x.length ? k : x.length;
	for (i = 0; i < kk; i++) y[i] = x[i];
	for (; i < k; i++) y[i] = 0;
	return y;
}
function equalsInt(x, y) {
	var i;
	if (x[0] != y) return 0;
	for (i = 1; i < x.length; i++) if (x[i]) return 0;
	return 1;
}
function isZero(x) {
	var i;
	for (i = 0; i < x.length; i++) if (x[i]) return 0;
	return 1;
}
function bigInt2str(x, base) {
	var i, t$1, s = "";
	if (s6.length != x.length) s6 = dup(x);
else copy_(s6, x);
	if (base == -1) {
		for (i = x.length - 1; i > 0; i--) s += x[i] + ",";
		s += x[0];
	} else while (!isZero(s6)) {
		t$1 = divInt_(s6, base);
		s = digitsStr.substring(t$1, t$1 + 1) + s;
	}
	if (s.length == 0) s = "0";
	return s;
}
function dup(x) {
	var i, buff;
	buff = new Array(x.length);
	copy_(buff, x);
	return buff;
}
function copy_(x, y) {
	var i;
	var k = x.length < y.length ? x.length : y.length;
	for (i = 0; i < k; i++) x[i] = y[i];
	for (i = k; i < x.length; i++) x[i] = 0;
}
function copyInt_(x, n) {
	var i, c;
	for (c = n, i = 0; i < x.length; i++) {
		x[i] = c & mask;
		c >>= bpe;
	}
}
function addInt_(x, n) {
	var i, k, c, b;
	x[0] += n;
	k = x.length;
	c = 0;
	for (i = 0; i < k; i++) {
		c += x[i];
		b = 0;
		if (c < 0) {
			b = -(c >> bpe);
			c += b * radix;
		}
		x[i] = c & mask;
		c = (c >> bpe) - b;
		if (!c) return;
	}
}
function rightShift_(x, n) {
	var i;
	var k = Math.floor(n / bpe);
	if (k) {
		for (i = 0; i < x.length - k; i++) x[i] = x[i + k];
		for (; i < x.length; i++) x[i] = 0;
		n %= bpe;
	}
	for (i = 0; i < x.length - 1; i++) x[i] = mask & (x[i + 1] << bpe - n | x[i] >> n);
	x[i] >>= n;
}
function leftShift_(x, n) {
	var i;
	var k = Math.floor(n / bpe);
	if (k) {
		for (i = x.length; i >= k; i--) x[i] = x[i - k];
		for (; i >= 0; i--) x[i] = 0;
		n %= bpe;
	}
	if (!n) return;
	for (i = x.length - 1; i > 0; i--) x[i] = mask & (x[i] << n | x[i - 1] >> bpe - n);
	x[i] = mask & x[i] << n;
}
function multInt_(x, n) {
	var i, k, c, b;
	if (!n) return;
	k = x.length;
	c = 0;
	for (i = 0; i < k; i++) {
		c += x[i] * n;
		b = 0;
		if (c < 0) {
			b = -(c >> bpe);
			c += b * radix;
		}
		x[i] = c & mask;
		c = (c >> bpe) - b;
	}
}
function divInt_(x, n) {
	var i, r = 0, s;
	for (i = x.length - 1; i >= 0; i--) {
		s = r * radix + x[i];
		x[i] = Math.floor(s / n);
		r = s % n;
	}
	return r;
}
function linCombShift_(x, y, b, ys) {
	var i, c, k, kk;
	k = x.length < ys + y.length ? x.length : ys + y.length;
	kk = x.length;
	for (c = 0, i = ys; i < k; i++) {
		c += x[i] + b * y[i - ys];
		x[i] = c & mask;
		c >>= bpe;
	}
	for (i = k; c && i < kk; i++) {
		c += x[i];
		x[i] = c & mask;
		c >>= bpe;
	}
}
function addShift_(x, y, ys) {
	var i, c, k, kk;
	k = x.length < ys + y.length ? x.length : ys + y.length;
	kk = x.length;
	for (c = 0, i = ys; i < k; i++) {
		c += x[i] + y[i - ys];
		x[i] = c & mask;
		c >>= bpe;
	}
	for (i = k; c && i < kk; i++) {
		c += x[i];
		x[i] = c & mask;
		c >>= bpe;
	}
}
function subShift_(x, y, ys) {
	var i, c, k, kk;
	k = x.length < ys + y.length ? x.length : ys + y.length;
	kk = x.length;
	for (c = 0, i = ys; i < k; i++) {
		c += x[i] - y[i - ys];
		x[i] = c & mask;
		c >>= bpe;
	}
	for (i = k; c && i < kk; i++) {
		c += x[i];
		x[i] = c & mask;
		c >>= bpe;
	}
}
function sub_(x, y) {
	var i, c, k, kk;
	k = x.length < y.length ? x.length : y.length;
	for (c = 0, i = 0; i < k; i++) {
		c += x[i] - y[i];
		x[i] = c & mask;
		c >>= bpe;
	}
	for (i = k; c && i < x.length; i++) {
		c += x[i];
		x[i] = c & mask;
		c >>= bpe;
	}
}
function mod_(x, n) {
	if (s4.length != x.length) s4 = dup(x);
else copy_(s4, x);
	if (s5.length != x.length) s5 = dup(x);
	divide_(s4, n, s5, x);
}
function multMod_(x, y, n) {
	var i;
	if (s0.length != 2 * x.length) s0 = new Array(2 * x.length);
	copyInt_(s0, 0);
	for (i = 0; i < y.length; i++) if (y[i]) linCombShift_(s0, x, y[i], i);
	mod_(s0, n);
	copy_(x, s0);
}
function squareMod_(x, n) {
	var i, j, d, c, kx, kn, k;
	for (kx = x.length; kx > 0 && !x[kx - 1]; kx--);
	k = kx > n.length ? 2 * kx : 2 * n.length;
	if (s0.length != k) s0 = new Array(k);
	copyInt_(s0, 0);
	for (i = 0; i < kx; i++) {
		c = s0[2 * i] + x[i] * x[i];
		s0[2 * i] = c & mask;
		c >>= bpe;
		for (j = i + 1; j < kx; j++) {
			c = s0[i + j] + 2 * x[i] * x[j] + c;
			s0[i + j] = c & mask;
			c >>= bpe;
		}
		s0[i + kx] = c;
	}
	mod_(s0, n);
	copy_(x, s0);
}
function trim(x, k) {
	var i, y;
	for (i = x.length; i > 0 && !x[i - 1]; i--);
	y = new Array(i + k);
	copy_(y, x);
	return y;
}
function powMod_(x, y, n) {
	var k1, k2, kn, np;
	if (s7.length != n.length) s7 = dup(n);
	if ((n[0] & 1) == 0) {
		copy_(s7, x);
		copyInt_(x, 1);
		while (!equalsInt(y, 0)) {
			if (y[0] & 1) multMod_(x, s7, n);
			divInt_(y, 2);
			squareMod_(s7, n);
		}
		return;
	}
	copyInt_(s7, 0);
	for (kn = n.length; kn > 0 && !n[kn - 1]; kn--);
	np = radix - inverseModInt(modInt(n, radix), radix);
	s7[kn] = 1;
	multMod_(x, s7, n);
	if (s3.length != x.length) s3 = dup(x);
else copy_(s3, x);
	for (k1 = y.length - 1; k1 > 0 & !y[k1]; k1--);
	if (y[k1] == 0) {
		copyInt_(x, 1);
		return;
	}
	for (k2 = 1 << bpe - 1; k2 && !(y[k1] & k2); k2 >>= 1);
	for (;;) {
		k2 >>= 1;
		if (!k2) {
			k1--;
			if (k1 < 0) {
				mont_(x, one, n, np);
				return;
			}
			k2 = 1 << bpe - 1;
		}
		mont_(x, x, n, np);
		if (k2 & y[k1]) mont_(x, s3, n, np);
	}
}
function mont_(x, y, n, np) {
	var i, j, c, ui, t$1, ks;
	var kn = n.length;
	var ky = y.length;
	if (sa.length != kn) sa = new Array(kn);
	copyInt_(sa, 0);
	for (; kn > 0 && n[kn - 1] == 0; kn--);
	for (; ky > 0 && y[ky - 1] == 0; ky--);
	ks = sa.length - 1;
	for (i = 0; i < kn; i++) {
		t$1 = sa[0] + x[i] * y[0];
		ui = (t$1 & mask) * np & mask;
		c = t$1 + ui * n[0] >> bpe;
		t$1 = x[i];
		j = 1;
		for (; j < ky - 4;) {
			c += sa[j] + ui * n[j] + t$1 * y[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
			c += sa[j] + ui * n[j] + t$1 * y[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
			c += sa[j] + ui * n[j] + t$1 * y[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
			c += sa[j] + ui * n[j] + t$1 * y[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
			c += sa[j] + ui * n[j] + t$1 * y[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
		}
		for (; j < ky;) {
			c += sa[j] + ui * n[j] + t$1 * y[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
		}
		for (; j < kn - 4;) {
			c += sa[j] + ui * n[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
			c += sa[j] + ui * n[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
			c += sa[j] + ui * n[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
			c += sa[j] + ui * n[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
			c += sa[j] + ui * n[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
		}
		for (; j < kn;) {
			c += sa[j] + ui * n[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
		}
		for (; j < ks;) {
			c += sa[j];
			sa[j - 1] = c & mask;
			c >>= bpe;
			j++;
		}
		sa[j - 1] = c & mask;
	}
	if (!greater(n, sa)) sub_(sa, n);
	copy_(x, sa);
}

//#endregion
//#region packages/tutanota-crypto/dist/encryption/AsymmetricKeyPair.js
var KeyPairType;
(function(KeyPairType$1) {
	KeyPairType$1[KeyPairType$1["RSA"] = 0] = "RSA";
	KeyPairType$1[KeyPairType$1["RSA_AND_ECC"] = 1] = "RSA_AND_ECC";
	KeyPairType$1[KeyPairType$1["TUTA_CRYPT"] = 2] = "TUTA_CRYPT";
})(KeyPairType || (KeyPairType = {}));
function isPqKeyPairs(keyPair) {
	return keyPair.keyPairType === KeyPairType.TUTA_CRYPT;
}
function isRsaOrRsaEccKeyPair(keyPair) {
	return keyPair.keyPairType === KeyPairType.RSA || keyPair.keyPairType === KeyPairType.RSA_AND_ECC;
}
function isRsaEccKeyPair(keyPair) {
	return keyPair.keyPairType === KeyPairType.RSA_AND_ECC;
}
function isPqPublicKey(publicKey) {
	return publicKey.keyPairType === KeyPairType.TUTA_CRYPT;
}
function isRsaPublicKey(publicKey) {
	return publicKey.keyPairType === KeyPairType.RSA;
}

//#endregion
//#region packages/tutanota-crypto/dist/encryption/Rsa.js
const RSA_KEY_LENGTH_BITS = 2048;
const RSA_PUBLIC_EXPONENT = 65537;
function rsaEncrypt(publicKey, bytes, seed) {
	const rsa = new RSAKey();
	rsa.n = new BigInteger(new Int8Array(base64ToUint8Array(publicKey.modulus)));
	rsa.e = publicKey.publicExponent;
	const paddedBytes = oaepPad(bytes, publicKey.keyLength, seed);
	const paddedHex = uint8ArrayToHex(paddedBytes);
	const bigInt = parseBigInt(paddedHex, 16);
	let encrypted;
	try {
		encrypted = new Uint8Array(rsa.doPublic(bigInt).toByteArray());
	} catch (e) {
		throw new CryptoError("failed RSA encryption", e);
	}
	return _padAndUnpadLeadingZeros(publicKey.keyLength / 8, encrypted);
}
function rsaDecrypt(privateKey, bytes) {
	try {
		const rsa = new RSAKey();
		rsa.n = new BigInteger(new Int8Array(base64ToUint8Array(privateKey.modulus)));
		rsa.d = new BigInteger(new Int8Array(base64ToUint8Array(privateKey.privateExponent)));
		rsa.p = new BigInteger(new Int8Array(base64ToUint8Array(privateKey.primeP)));
		rsa.q = new BigInteger(new Int8Array(base64ToUint8Array(privateKey.primeQ)));
		rsa.dmp1 = new BigInteger(new Int8Array(base64ToUint8Array(privateKey.primeExponentP)));
		rsa.dmq1 = new BigInteger(new Int8Array(base64ToUint8Array(privateKey.primeExponentQ)));
		rsa.coeff = new BigInteger(new Int8Array(base64ToUint8Array(privateKey.crtCoefficient)));
		const hex = uint8ArrayToHex(bytes);
		const bigInt = parseBigInt(hex, 16);
		const decrypted = new Uint8Array(rsa.doPrivate(bigInt).toByteArray());
		const paddedDecrypted = _padAndUnpadLeadingZeros(privateKey.keyLength / 8 - 1, decrypted);
		return oaepUnpad(paddedDecrypted, privateKey.keyLength);
	} catch (e) {
		throw new CryptoError("failed RSA decryption", e);
	}
}
function _padAndUnpadLeadingZeros(targetByteLength, byteArray) {
	const result = new Uint8Array(targetByteLength);
	if (byteArray.length > result.length) {
		const lastExtraByte = byteArray[byteArray.length - result.length - 1];
		if (lastExtraByte !== 0) throw new CryptoError(`leading byte is not 0 but ${lastExtraByte}, encrypted length: ${byteArray.length}`);
		byteArray = byteArray.slice(byteArray.length - result.length);
	}
	result.set(byteArray, result.length - byteArray.length);
	return result;
}
function oaepPad(value, keyLength, seed) {
	let hashLength = 32;
	if (seed.length !== hashLength) throw new CryptoError("invalid seed length: " + seed.length + ". expected: " + hashLength + " bytes!");
	if (value.length > keyLength / 8 - hashLength - 1) throw new CryptoError("invalid value length: " + value.length + ". expected: max. " + (keyLength / 8 - hashLength - 1));
	let block = _getPSBlock(value, keyLength);
	let dbMask = mgf1(seed, block.length - hashLength);
	for (let i = hashLength; i < block.length; i++) block[i] ^= dbMask[i - hashLength];
	let seedMask = mgf1(block.slice(hashLength, block.length), hashLength);
	for (let i = 0; i < seedMask.length; i++) block[i] = seed[i] ^ seedMask[i];
	return block;
}
function oaepUnpad(value, keyLength) {
	let hashLength = 32;
	if (value.length !== keyLength / 8 - 1) throw new CryptoError("invalid value length: " + value.length + ". expected: " + (keyLength / 8 - 1) + " bytes!");
	let seedMask = mgf1(value.slice(hashLength, value.length), hashLength);
	let seed = new Uint8Array(hashLength);
	for (let i = 0; i < seedMask.length; i++) seed[i] = value[i] ^ seedMask[i];
	let dbMask = mgf1(seed, value.length - hashLength);
	for (let i = hashLength; i < value.length; i++) value[i] ^= dbMask[i - hashLength];
	let index;
	for (index = 2 * hashLength; index < value.length; index++) if (value[index] === 1) break;
else if (value[index] !== 0 || index === value.length) throw new CryptoError("invalid padding");
	return value.slice(index + 1, value.length);
}
function _getPSBlock(value, keyLength) {
	let hashLength = 32;
	let blockLength = keyLength / 8 - 1;
	let block = new Uint8Array(blockLength);
	let defHash = sha256Hash(new Uint8Array([]));
	let nbrOfZeros = block.length - (1 + value.length);
	for (let i = 0; i < block.length; i++) if (i >= hashLength && i < 2 * hashLength) block[i] = defHash[i - hashLength];
else if (i < nbrOfZeros) block[i] = 0;
else if (i === nbrOfZeros) block[i] = 1;
else block[i] = value[i - nbrOfZeros - 1];
	return block;
}
function mgf1(seed, length) {
	let C = null;
	let counter = 0;
	let T = new Uint8Array(0);
	do {
		C = i2osp(counter);
		T = concat(T, sha256Hash(concat(seed, C)));
	} while (++counter < Math.ceil(length / 32));
	return T.slice(0, length);
}
function i2osp(i) {
	return new Uint8Array([
		i >> 24 & 255,
		i >> 16 & 255,
		i >> 8 & 255,
		i >> 0 & 255
	]);
}
function _arrayToPublicKey(publicKey) {
	return {
		keyPairType: KeyPairType.RSA,
		version: 0,
		keyLength: RSA_KEY_LENGTH_BITS,
		modulus: int8ArrayToBase64(new Int8Array(publicKey[0].toByteArray())),
		publicExponent: RSA_PUBLIC_EXPONENT
	};
}
function _arrayToPrivateKey(privateKey) {
	return {
		version: 0,
		keyLength: RSA_KEY_LENGTH_BITS,
		modulus: int8ArrayToBase64(new Int8Array(privateKey[0].toByteArray())),
		privateExponent: int8ArrayToBase64(new Int8Array(privateKey[1].toByteArray())),
		primeP: int8ArrayToBase64(new Int8Array(privateKey[2].toByteArray())),
		primeQ: int8ArrayToBase64(new Int8Array(privateKey[3].toByteArray())),
		primeExponentP: int8ArrayToBase64(new Int8Array(privateKey[4].toByteArray())),
		primeExponentQ: int8ArrayToBase64(new Int8Array(privateKey[5].toByteArray())),
		crtCoefficient: int8ArrayToBase64(new Int8Array(privateKey[6].toByteArray()))
	};
}
function _hexToKeyArray(hex) {
	try {
		let key = [];
		let pos = 0;
		while (pos < hex.length) {
			let nextParamLen = parseInt(hex.substring(pos, pos + 4), 16);
			pos += 4;
			key.push(parseBigInt(hex.substring(pos, pos + nextParamLen), 16));
			pos += nextParamLen;
		}
		_validateKeyLength(key);
		return key;
	} catch (e) {
		throw new CryptoError("hex to rsa key failed", e);
	}
}
function _validateKeyLength(key) {
	if (key.length !== 1 && key.length !== 7) throw new Error("invalid key params");
	if (key[0].bitLength() < RSA_KEY_LENGTH_BITS - 1 || key[0].bitLength() > RSA_KEY_LENGTH_BITS) throw new Error("invalid key length, expected: around " + RSA_KEY_LENGTH_BITS + ", but was: " + key[0].bitLength());
}
function hexToRsaPrivateKey(privateKeyHex) {
	return _arrayToPrivateKey(_hexToKeyArray(privateKeyHex));
}
function hexToRsaPublicKey(publicKeyHex) {
	return _arrayToPublicKey(_hexToKeyArray(publicKeyHex));
}

//#endregion
//#region packages/tutanota-crypto/dist/encryption/KeyEncryption.js
function isEncryptedPqKeyPairs(keyPair) {
	return keyPair.pubEccKey != null && keyPair.pubKyberKey != null && keyPair.symEncPrivEccKey != null && keyPair.symEncPrivKyberKey != null && keyPair.pubRsaKey == null && keyPair.symEncPrivRsaKey == null;
}
function encryptKey(encryptionKey, keyToBeEncrypted) {
	const keyLength = getKeyLengthBytes(encryptionKey);
	if (keyLength === KEY_LENGTH_BYTES_AES_128) return aesEncrypt(encryptionKey, bitArrayToUint8Array(keyToBeEncrypted), fixedIv, false, false).slice(fixedIv.length);
else if (keyLength === KEY_LENGTH_BYTES_AES_256) return aesEncrypt(encryptionKey, bitArrayToUint8Array(keyToBeEncrypted), undefined, false, true);
else throw new Error(`invalid AES key length (must be 128-bit or 256-bit, got ${keyLength} bytes instead)`);
}
function decryptKey(encryptionKey, keyToBeDecrypted) {
	const keyLength = getKeyLengthBytes(encryptionKey);
	if (keyLength === KEY_LENGTH_BYTES_AES_128) return uint8ArrayToBitArray(aesDecrypt(encryptionKey, concat(fixedIv, keyToBeDecrypted), false));
else if (keyLength === KEY_LENGTH_BYTES_AES_256) return uint8ArrayToBitArray(aesDecrypt(encryptionKey, keyToBeDecrypted, false));
else throw new Error(`invalid AES key length (must be 128-bit or 256-bit, got ${keyLength} bytes instead)`);
}
function aes256DecryptWithRecoveryKey(encryptionKey, keyToBeDecrypted) {
	if (keyToBeDecrypted.length === KEY_LENGTH_BYTES_AES_128) return uint8ArrayToBitArray(unauthenticatedAesDecrypt(encryptionKey, concat(fixedIv, keyToBeDecrypted), false));
else return decryptKey(encryptionKey, keyToBeDecrypted);
}
function encryptEccKey(encryptionKey, privateKey) {
	return aesEncrypt(encryptionKey, privateKey, undefined, true, true);
}
function encryptKyberKey(encryptionKey, privateKey) {
	return aesEncrypt(encryptionKey, kyberPrivateKeyToBytes(privateKey));
}
function decryptKeyPair(encryptionKey, keyPair) {
	if (keyPair.symEncPrivRsaKey) return decryptRsaOrRsaEccKeyPair(encryptionKey, keyPair);
else return decryptPQKeyPair(encryptionKey, keyPair);
}
function decryptRsaOrRsaEccKeyPair(encryptionKey, keyPair) {
	const publicKey = hexToRsaPublicKey(uint8ArrayToHex(assertNotNull(keyPair.pubRsaKey)));
	const privateKey = hexToRsaPrivateKey(uint8ArrayToHex(aesDecrypt(encryptionKey, keyPair.symEncPrivRsaKey, true)));
	if (keyPair.symEncPrivEccKey) {
		const publicEccKey = assertNotNull(keyPair.pubEccKey);
		const privateEccKey = aesDecrypt(encryptionKey, assertNotNull(keyPair.symEncPrivEccKey));
		return {
			keyPairType: KeyPairType.RSA_AND_ECC,
			publicKey,
			privateKey,
			publicEccKey,
			privateEccKey
		};
	} else return {
		keyPairType: KeyPairType.RSA,
		publicKey,
		privateKey
	};
}
function decryptPQKeyPair(encryptionKey, keyPair) {
	const eccPublicKey = assertNotNull(keyPair.pubEccKey, "expected pub ecc key for PQ keypair");
	const eccPrivateKey = aesDecrypt(encryptionKey, assertNotNull(keyPair.symEncPrivEccKey, "expected priv ecc key for PQ keypair"));
	const kyberPublicKey = bytesToKyberPublicKey(assertNotNull(keyPair.pubKyberKey, "expected pub kyber key for PQ keypair"));
	const kyberPrivateKey = bytesToKyberPrivateKey(aesDecrypt(encryptionKey, assertNotNull(keyPair.symEncPrivKyberKey, "expected enc priv kyber key for PQ keypair")));
	return {
		keyPairType: KeyPairType.TUTA_CRYPT,
		eccKeyPair: {
			publicKey: eccPublicKey,
			privateKey: eccPrivateKey
		},
		kyberKeyPair: {
			publicKey: kyberPublicKey,
			privateKey: kyberPrivateKey
		}
	};
}

//#endregion
//#region packages/tutanota-crypto/dist/encryption/PQKeyPairs.js
function pqKeyPairsToPublicKeys(keyPairs) {
	return {
		keyPairType: keyPairs.keyPairType,
		eccPublicKey: keyPairs.eccKeyPair.publicKey,
		kyberPublicKey: keyPairs.kyberKeyPair.publicKey
	};
}

//#endregion
//#region packages/tutanota-crypto/dist/hashes/Sha1.js
const sha1 = new sjcl_default.hash.sha1();

//#endregion
//#region packages/tutanota-crypto/dist/misc/TotpVerifier.js
let DIGITS = 6;
const DIGITS_POWER = [
	1,
	10,
	100,
	1e3,
	1e4,
	1e5,
	1e6,
	1e7,
	1e8
];
const base32 = sjcl_default.codec.base32;
var TotpVerifier = class TotpVerifier {
	_digits;
	constructor(digits = DIGITS) {
		this._digits = digits;
	}
	generateSecret() {
		let key = random.generateRandomData(16);
		let readableKey = TotpVerifier.readableKey(key);
		return {
			key,
			readableKey
		};
	}
	/**
	* This method generates a TOTP value for the given
	* set of parameters.
	*
	* @param time : a value that reflects a time
	* @param key  :  the shared secret. It is generated if it does not exist
	* @return: the key and a numeric String in base 10 that includes truncationDigits digits
	*/
	generateTotp(time, key) {
		let timeHex = time.toString(16);
		while (timeHex.length < 16) timeHex = "0" + timeHex;
		let msg = hexToUint8Array(timeHex);
		let hash = this.hmac_sha(key, msg);
		let offset = hash[hash.length - 1] & 15;
		let binary = (hash[offset] & 127) << 24 | (hash[offset + 1] & 255) << 16 | (hash[offset + 2] & 255) << 8 | hash[offset + 3] & 255;
		let code = binary % DIGITS_POWER[this._digits];
		return code;
	}
	hmac_sha(key, text) {
		let hmac = new sjcl_default.misc.hmac(uint8ArrayToBitArray(key), sjcl_default.hash.sha1);
		return bitArrayToUint8Array(hmac.encrypt(uint8ArrayToBitArray(text)));
	}
	static readableKey(key) {
		return base32.fromBits(uint8ArrayToBitArray(key)).toLowerCase().replace(/(.{4})/g, "$1 ").replace(/=/g, "").trim();
	}
};

//#endregion
//#region packages/tutanota-crypto/dist/hashes/MurmurHash.js
function x86fmix32(h) {
	h ^= h >>> 16;
	h = mul32(h, 2246822507);
	h ^= h >>> 13;
	h = mul32(h, 3266489909);
	h ^= h >>> 16;
	return h;
}
const x86hash32c1 = 3432918353;
const x86hash32c2 = 461845907;
function x86mix32(h, k) {
	k = mul32(k, x86hash32c1);
	k = rol32(k, 15);
	k = mul32(k, x86hash32c2);
	h ^= k;
	h = rol32(h, 13);
	h = mul32(h, 5) + 3864292196;
	return h;
}
function mul32(m, n) {
	return (m & 65535) * n + (((m >>> 16) * n & 65535) << 16);
}
function rol32(n, r) {
	return n << r | n >>> 32 - r;
}
function murmurHash(value) {
	let state = 0;
	const buf = stringToUtf8Uint8Array(value);
	let h1;
	let i;
	let len;
	h1 = state;
	i = 0;
	len = 0;
	const dtv = new DataView(buf.buffer, buf.byteOffset);
	const remainder = (buf.byteLength - i) % 4;
	const bytes = buf.byteLength - i - remainder;
	len += bytes;
	for (; i < bytes; i += 4) h1 = x86mix32(h1, dtv.getUint32(i, true));
	len += remainder;
	let k1 = 0;
	switch (remainder) {
		case 3: k1 ^= buf[i + 2] << 16;
		case 2: k1 ^= buf[i + 1] << 8;
		case 1:
			k1 ^= buf[i];
			k1 = mul32(k1, x86hash32c1);
			k1 = rol32(k1, 15);
			k1 = mul32(k1, x86hash32c2);
			h1 ^= k1;
	}
	h1 ^= len & 4294967295;
	h1 = x86fmix32(h1);
	return h1 >>> 0;
}

//#endregion
//#region packages/tutanota-crypto/dist/hashes/HKDF.js
function hkdf(salt, inputKeyMaterial, info, lengthInBytes) {
	const saltHmac = new sjcl_default.misc.hmac(uint8ArrayToBitArray(salt), sjcl_default.hash.sha256);
	const key = saltHmac.mac(uint8ArrayToBitArray(inputKeyMaterial));
	const hashLen = sjcl_default.bitArray.bitLength(key);
	const loops = Math.ceil(lengthInBytes * 8 / hashLen);
	if (loops > 255) throw new sjcl_default.exception.invalid("key bit length is too large for hkdf");
	const inputKeyMaterialHmac = new sjcl_default.misc.hmac(key, sjcl_default.hash.sha256);
	let curOut = [];
	let ret = [];
	for (let i = 1; i <= loops; i++) {
		inputKeyMaterialHmac.update(curOut);
		inputKeyMaterialHmac.update(uint8ArrayToBitArray(info));
		inputKeyMaterialHmac.update([sjcl_default.bitArray.partial(8, i)]);
		curOut = inputKeyMaterialHmac.digest();
		ret = sjcl_default.bitArray.concat(ret, curOut);
	}
	return bitArrayToUint8Array(sjcl_default.bitArray.clamp(ret, lengthInBytes * 8));
}

//#endregion
export { ENABLE_MAC, IV_BYTE_LENGTH, KEY_LENGTH_BYTES_AES_256, KeyLength, KeyPairType, ML_KEM_RAND_AMOUNT_OF_ENTROPY, TotpVerifier, aes256DecryptWithRecoveryKey, aes256EncryptSearchIndexEntry, aes256RandomKey, aesDecrypt, aesEncrypt, authenticatedAesDecrypt, base64ToKey, bitArrayToUint8Array, bytesToKyberPublicKey, createAuthVerifier, createAuthVerifierAsBase64Url, decapsulate, decryptKey, decryptKeyPair, eccDecapsulate, eccEncapsulate, encapsulate, encryptEccKey, encryptKey, encryptKyberKey, generateEccKeyPair, generateKeyFromPassphrase$1 as generateKeyFromPassphrase, generateKeyFromPassphrase as generateKeyFromPassphrase$1, generateKeyPair, generateRandomSalt, getKeyLengthBytes, hexToRsaPublicKey, hkdf, hmacSha256, isEncryptedPqKeyPairs, isPqKeyPairs, isPqPublicKey, isRsaEccKeyPair, isRsaOrRsaEccKeyPair, isRsaPublicKey, keyToBase64, keyToUint8Array, kyberPublicKeyToBytes, murmurHash, pqKeyPairsToPublicKeys, random, rsaDecrypt, rsaEncrypt, sha256Hash, uint8ArrayToBitArray, uint8ArrayToKey, unauthenticatedAesDecrypt, verifyHmacSha256 };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzdDMtY2h1bmsuanMiLCJuYW1lcyI6WyJ0Iiwic2pjbCIsInNqY2wiLCJzamNsIiwic2pjbCIsInNqY2wiLCJ4MjU1MTkiLCJzaGE1MTIiLCJtYXNrIiwidCIsIktleUxlbmd0aCIsImxvZ1JvdW5kcyIsImJDcnlwdCIsInQiLCJnZW5lcmF0ZUtleUZyb21QYXNzcGhyYXNlIiwidCIsIktleVBhaXJUeXBlIiwic2pjbCIsInNqY2wiLCJzamNsIl0sInNvdXJjZXMiOlsiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvaW50ZXJuYWwvc2pjbC5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L3JhbmRvbS9SYW5kb21pemVyLmpzIiwiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvaGFzaGVzL1NoYTI1Ni5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L21pc2MvVXRpbHMuanMiLCIuLi9wYWNrYWdlcy90dXRhbm90YS1jcnlwdG8vZGlzdC9oYXNoZXMvU2hhNTEyLmpzIiwiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvZW5jcnlwdGlvbi9IbWFjLmpzIiwiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvZW5jcnlwdGlvbi9BZXMuanMiLCIuLi9wYWNrYWdlcy90dXRhbm90YS1jcnlwdG8vZGlzdC9pbnRlcm5hbC9ub2JsZS1jdXJ2ZXMtMS4zLjAuanMiLCIuLi9wYWNrYWdlcy90dXRhbm90YS1jcnlwdG8vZGlzdC9lbmNyeXB0aW9uL0VjYy5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L2ludGVybmFsL2JDcnlwdC5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L21pc2MvQ29uc3RhbnRzLmpzIiwiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvaGFzaGVzL0JjcnlwdC5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L2VuY3J5cHRpb24vTGlib3FzL0t5YmVyLmpzIiwiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvZW5jcnlwdGlvbi9MaWJvcXMvS3liZXJLZXlQYWlyLmpzIiwiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvaGFzaGVzL0FyZ29uMmlkL0FyZ29uMmlkLmpzIiwiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvcmFuZG9tL1NlY3VyZVJhbmRvbS5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L2ludGVybmFsL2NyeXB0by1qc2JuLTIwMTItMDgtMDlfMS5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L2VuY3J5cHRpb24vQXN5bW1ldHJpY0tleVBhaXIuanMiLCIuLi9wYWNrYWdlcy90dXRhbm90YS1jcnlwdG8vZGlzdC9lbmNyeXB0aW9uL1JzYS5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L2VuY3J5cHRpb24vS2V5RW5jcnlwdGlvbi5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L2VuY3J5cHRpb24vUFFLZXlQYWlycy5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L2hhc2hlcy9TaGExLmpzIiwiLi4vcGFja2FnZXMvdHV0YW5vdGEtY3J5cHRvL2Rpc3QvbWlzYy9Ub3RwVmVyaWZpZXIuanMiLCIuLi9wYWNrYWdlcy90dXRhbm90YS1jcnlwdG8vZGlzdC9oYXNoZXMvTXVybXVySGFzaC5qcyIsIi4uL3BhY2thZ2VzL3R1dGFub3RhLWNyeXB0by9kaXN0L2hhc2hlcy9IS0RGLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAZmlsZU92ZXJ2aWV3IEphdmFzY3JpcHQgY3J5cHRvZ3JhcGh5IGltcGxlbWVudGF0aW9uLlxuICpcbiAqIENydXNoIHRvIHJlbW92ZSBjb21tZW50cywgc2hvcnRlbiB2YXJpYWJsZSBuYW1lcyBhbmRcbiAqIGdlbmVyYWxseSByZWR1Y2UgdHJhbnNtaXNzaW9uIHNpemUuXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cbi8vIEZPUktFRCBmcm9tIFNKQ0wgMS4wLjdcbi8vIENIQU5HRUQgKHR1dGFvLmFybSlcbi8vIC0gYWRkZWQgb3B0aW9uIHRvIG5vdCB1c2UgcGFkZGluZyBpbiBlbmNyeXB0L2RlY3J5cHQgaW4gY2JjIG1vZGVcbi8vIENIQU5HRUQgKHR1dGFvLml2aylcbi8vIC0gYWRkZWQgYnl0ZU9mZnNldCBhbmQgYnl0ZUxlbmd0aCB0byBjb2RlYy5hcnJheUJ1ZmZlci50b0JpdHNcbi8vIENvbmZpZ3VyZWQgd2l0aDogLi9jb25maWd1cmUgLS13aXRoLWNvZGVjQXJyYXlCdWZmZXIgLS13aXRoLWNiYyAtLXdpdGgtc2hhMSAtLXdpdGgtc2hhNTEyIC0td2l0aC1jb2RlY0J5dGVzIC0td2l0aG91dC1jY20gLS13aXRob3V0LW9jYjIgLS13aXRob3V0LXBia2RmMiAtLXdpdGhvdXQtY29udmVuaWVuY2UgLS1jb21wcmVzcz1ub25lXG4vKmpzbGludCBpbmRlbnQ6IDIsIGJpdHdpc2U6IGZhbHNlLCBub21lbjogZmFsc2UsIHBsdXNwbHVzOiBmYWxzZSwgd2hpdGU6IGZhbHNlLCByZWdleHA6IGZhbHNlICovXG4vKmdsb2JhbCBkb2N1bWVudCwgd2luZG93LCBlc2NhcGUsIHVuZXNjYXBlLCBtb2R1bGUsIHJlcXVpcmUsIFVpbnQzMkFycmF5ICovXG4vKipcbiAqIFRoZSBTdGFuZm9yZCBKYXZhc2NyaXB0IENyeXB0byBMaWJyYXJ5LCB0b3AtbGV2ZWwgbmFtZXNwYWNlLlxuICogQG5hbWVzcGFjZVxuICogQHR5cGUgYW55XG4gKi9cbnZhciBzamNsID0ge1xuICAgIC8qKlxuICAgICAqIFN5bW1ldHJpYyBjaXBoZXJzLlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKi9cbiAgICBjaXBoZXI6IHt9LFxuICAgIC8qKlxuICAgICAqIEhhc2ggZnVuY3Rpb25zLiAgUmlnaHQgbm93IG9ubHkgU0hBMjU2IGlzIGltcGxlbWVudGVkLlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKi9cbiAgICBoYXNoOiB7fSxcbiAgICAvKipcbiAgICAgKiBLZXkgZXhjaGFuZ2UgZnVuY3Rpb25zLiAgUmlnaHQgbm93IG9ubHkgU1JQIGlzIGltcGxlbWVudGVkLlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKi9cbiAgICBrZXlleGNoYW5nZToge30sXG4gICAgLyoqXG4gICAgICogQ2lwaGVyIG1vZGVzIG9mIG9wZXJhdGlvbi5cbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICovXG4gICAgbW9kZToge30sXG4gICAgLyoqXG4gICAgICogTWlzY2VsbGFuZW91cy4gIEhNQUMgYW5kIFBCS0RGMi5cbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICovXG4gICAgbWlzYzoge30sXG4gICAgLyoqXG4gICAgICogQml0IGFycmF5IGVuY29kZXJzIGFuZCBkZWNvZGVycy5cbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBUaGUgbWVtYmVycyBvZiB0aGlzIG5hbWVzcGFjZSBhcmUgZnVuY3Rpb25zIHdoaWNoIHRyYW5zbGF0ZSBiZXR3ZWVuXG4gICAgICogU0pDTCdzIGJpdEFycmF5cyBhbmQgb3RoZXIgb2JqZWN0cyAodXN1YWxseSBzdHJpbmdzKS4gIEJlY2F1c2UgaXRcbiAgICAgKiBpc24ndCBhbHdheXMgY2xlYXIgd2hpY2ggZGlyZWN0aW9uIGlzIGVuY29kaW5nIGFuZCB3aGljaCBpcyBkZWNvZGluZyxcbiAgICAgKiB0aGUgbWV0aG9kIG5hbWVzIGFyZSBcImZyb21CaXRzXCIgYW5kIFwidG9CaXRzXCIuXG4gICAgICovXG4gICAgY29kZWM6IHt9LFxuICAgIC8qKlxuICAgICAqIEV4Y2VwdGlvbnMuXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqL1xuICAgIGV4Y2VwdGlvbjoge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ2lwaGVydGV4dCBpcyBjb3JydXB0LlxuICAgICAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgICAgICovXG4gICAgICAgIGNvcnJ1cHQ6IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIkNPUlJVUFQ6IFwiICsgdGhpcy5tZXNzYWdlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnZhbGlkIHBhcmFtZXRlci5cbiAgICAgICAgICogQGNvbnN0cnVjdG9yXG4gICAgICAgICAqL1xuICAgICAgICBpbnZhbGlkOiBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJJTlZBTElEOiBcIiArIHRoaXMubWVzc2FnZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQnVnIG9yIG1pc3NpbmcgZmVhdHVyZSBpbiBTSkNMLlxuICAgICAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgICAgICovXG4gICAgICAgIGJ1ZzogZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiQlVHOiBcIiArIHRoaXMubWVzc2FnZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogU29tZXRoaW5nIGlzbid0IHJlYWR5LlxuICAgICAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgICAgICovXG4gICAgICAgIG5vdFJlYWR5OiBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJOT1QgUkVBRFk6IFwiICsgdGhpcy5tZXNzYWdlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIH0sXG4gICAgfSxcbn07XG4vKiogQGZpbGVPdmVydmlldyBMb3ctbGV2ZWwgQUVTIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIFRoaXMgZmlsZSBjb250YWlucyBhIGxvdy1sZXZlbCBpbXBsZW1lbnRhdGlvbiBvZiBBRVMsIG9wdGltaXplZCBmb3JcbiAqIHNpemUgYW5kIGZvciBlZmZpY2llbmN5IG9uIHNldmVyYWwgYnJvd3NlcnMuICBJdCBpcyBiYXNlZCBvblxuICogT3BlblNTTCdzIGFlc19jb3JlLmMsIGEgcHVibGljLWRvbWFpbiBpbXBsZW1lbnRhdGlvbiBieSBWaW5jZW50XG4gKiBSaWptZW4sIEFudG9vbiBCb3NzZWxhZXJzIGFuZCBQYXVsbyBCYXJyZXRvLlxuICpcbiAqIEFuIG9sZGVyIHZlcnNpb24gb2YgdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBhdmFpbGFibGUgaW4gdGhlIHB1YmxpY1xuICogZG9tYWluLCBidXQgdGhpcyBvbmUgaXMgKGMpIEVtaWx5IFN0YXJrLCBNaWtlIEhhbWJ1cmcsIERhbiBCb25laCxcbiAqIFN0YW5mb3JkIFVuaXZlcnNpdHkgMjAwOC0yMDEwIGFuZCBCU0QtbGljZW5zZWQgZm9yIGxpYWJpbGl0eVxuICogcmVhc29ucy5cbiAqXG4gKiBAYXV0aG9yIEVtaWx5IFN0YXJrXG4gKiBAYXV0aG9yIE1pa2UgSGFtYnVyZ1xuICogQGF1dGhvciBEYW4gQm9uZWhcbiAqL1xuLyoqXG4gKiBTY2hlZHVsZSBvdXQgYW4gQUVTIGtleSBmb3IgYm90aCBlbmNyeXB0aW9uIGFuZCBkZWNyeXB0aW9uLiAgVGhpc1xuICogaXMgYSBsb3ctbGV2ZWwgY2xhc3MuICBVc2UgYSBjaXBoZXIgbW9kZSB0byBkbyBidWxrIGVuY3J5cHRpb24uXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBrZXkgVGhlIGtleSBhcyBhbiBhcnJheSBvZiA0LCA2IG9yIDggd29yZHMuXG4gKi9cbnNqY2wuY2lwaGVyLmFlcyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIXRoaXMuX3RhYmxlc1swXVswXVswXSkge1xuICAgICAgICB0aGlzLl9wcmVjb21wdXRlKCk7XG4gICAgfVxuICAgIHZhciBpLCBqLCB0bXAsIGVuY0tleSwgZGVjS2V5LCBzYm94ID0gdGhpcy5fdGFibGVzWzBdWzRdLCBkZWNUYWJsZSA9IHRoaXMuX3RhYmxlc1sxXSwga2V5TGVuID0ga2V5Lmxlbmd0aCwgcmNvbiA9IDE7XG4gICAgaWYgKGtleUxlbiAhPT0gNCAmJiBrZXlMZW4gIT09IDYgJiYga2V5TGVuICE9PSA4KSB7XG4gICAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwiaW52YWxpZCBhZXMga2V5IHNpemVcIik7XG4gICAgfVxuICAgIHRoaXMuX2tleSA9IFsoZW5jS2V5ID0ga2V5LnNsaWNlKDApKSwgKGRlY0tleSA9IFtdKV07XG4gICAgLy8gc2NoZWR1bGUgZW5jcnlwdGlvbiBrZXlzXG4gICAgZm9yIChpID0ga2V5TGVuOyBpIDwgNCAqIGtleUxlbiArIDI4OyBpKyspIHtcbiAgICAgICAgdG1wID0gZW5jS2V5W2kgLSAxXTtcbiAgICAgICAgLy8gYXBwbHkgc2JveFxuICAgICAgICBpZiAoaSAlIGtleUxlbiA9PT0gMCB8fCAoa2V5TGVuID09PSA4ICYmIGkgJSBrZXlMZW4gPT09IDQpKSB7XG4gICAgICAgICAgICB0bXAgPSAoc2JveFt0bXAgPj4+IDI0XSA8PCAyNCkgXiAoc2JveFsodG1wID4+IDE2KSAmIDI1NV0gPDwgMTYpIF4gKHNib3hbKHRtcCA+PiA4KSAmIDI1NV0gPDwgOCkgXiBzYm94W3RtcCAmIDI1NV07XG4gICAgICAgICAgICAvLyBzaGlmdCByb3dzIGFuZCBhZGQgcmNvblxuICAgICAgICAgICAgaWYgKGkgJSBrZXlMZW4gPT09IDApIHtcbiAgICAgICAgICAgICAgICB0bXAgPSAodG1wIDw8IDgpIF4gKHRtcCA+Pj4gMjQpIF4gKHJjb24gPDwgMjQpO1xuICAgICAgICAgICAgICAgIHJjb24gPSAocmNvbiA8PCAxKSBeICgocmNvbiA+PiA3KSAqIDI4Myk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZW5jS2V5W2ldID0gZW5jS2V5W2kgLSBrZXlMZW5dIF4gdG1wO1xuICAgIH1cbiAgICAvLyBzY2hlZHVsZSBkZWNyeXB0aW9uIGtleXNcbiAgICBmb3IgKGogPSAwOyBpOyBqKyssIGktLSkge1xuICAgICAgICB0bXAgPSBlbmNLZXlbaiAmIDMgPyBpIDogaSAtIDRdO1xuICAgICAgICBpZiAoaSA8PSA0IHx8IGogPCA0KSB7XG4gICAgICAgICAgICBkZWNLZXlbal0gPSB0bXA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWNLZXlbal0gPVxuICAgICAgICAgICAgICAgIGRlY1RhYmxlWzBdW3Nib3hbdG1wID4+PiAyNF1dIF4gZGVjVGFibGVbMV1bc2JveFsodG1wID4+IDE2KSAmIDI1NV1dIF4gZGVjVGFibGVbMl1bc2JveFsodG1wID4+IDgpICYgMjU1XV0gXiBkZWNUYWJsZVszXVtzYm94W3RtcCAmIDI1NV1dO1xuICAgICAgICB9XG4gICAgfVxufTtcbnNqY2wuY2lwaGVyLmFlcy5wcm90b3R5cGUgPSB7XG4gICAgLy8gcHVibGljXG4gICAgLyogU29tZXRoaW5nIGxpa2UgdGhpcyBtaWdodCBhcHBlYXIgaGVyZSBldmVudHVhbGx5XG4gICAgIG5hbWU6IFwiQUVTXCIsXG4gICAgIGJsb2NrU2l6ZTogNCxcbiAgICAga2V5U2l6ZXM6IFs0LDYsOF0sXG4gICAgICovXG4gICAgLyoqXG4gICAgICogRW5jcnlwdCBhbiBhcnJheSBvZiA0IGJpZy1lbmRpYW4gd29yZHMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gZGF0YSBUaGUgcGxhaW50ZXh0LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgY2lwaGVydGV4dC5cbiAgICAgKi9cbiAgICBlbmNyeXB0OiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3J5cHQoZGF0YSwgMCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEZWNyeXB0IGFuIGFycmF5IG9mIDQgYmlnLWVuZGlhbiB3b3Jkcy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhIFRoZSBjaXBoZXJ0ZXh0LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgcGxhaW50ZXh0LlxuICAgICAqL1xuICAgIGRlY3J5cHQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcnlwdChkYXRhLCAxKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBleHBhbmRlZCBTLWJveCBhbmQgaW52ZXJzZSBTLWJveCB0YWJsZXMuICBUaGVzZSB3aWxsIGJlIGNvbXB1dGVkXG4gICAgICogb24gdGhlIGNsaWVudCBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8gc2VuZCB0aGVtIGRvd24gdGhlIHdpcmUuXG4gICAgICpcbiAgICAgKiBUaGVyZSBhcmUgdHdvIHRhYmxlcywgX3RhYmxlc1swXSBpcyBmb3IgZW5jcnlwdGlvbiBhbmRcbiAgICAgKiBfdGFibGVzWzFdIGlzIGZvciBkZWNyeXB0aW9uLlxuICAgICAqXG4gICAgICogVGhlIGZpcnN0IDQgc3ViLXRhYmxlcyBhcmUgdGhlIGV4cGFuZGVkIFMtYm94IHdpdGggTWl4Q29sdW1ucy4gIFRoZVxuICAgICAqIGxhc3QgKF90YWJsZXNbMDFdWzRdKSBpcyB0aGUgUy1ib3ggaXRzZWxmLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdGFibGVzOiBbXG4gICAgICAgIFtbXSwgW10sIFtdLCBbXSwgW11dLFxuICAgICAgICBbW10sIFtdLCBbXSwgW10sIFtdXSxcbiAgICBdLFxuICAgIC8qKlxuICAgICAqIEV4cGFuZCB0aGUgUy1ib3ggdGFibGVzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcHJlY29tcHV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZW5jVGFibGUgPSB0aGlzLl90YWJsZXNbMF0sIGRlY1RhYmxlID0gdGhpcy5fdGFibGVzWzFdLCBzYm94ID0gZW5jVGFibGVbNF0sIHNib3hJbnYgPSBkZWNUYWJsZVs0XSwgaSwgeCwgeEludiwgZCA9IFtdLCB0aCA9IFtdLCB4MiwgeDQsIHg4LCBzLCB0RW5jLCB0RGVjO1xuICAgICAgICAvLyBDb21wdXRlIGRvdWJsZSBhbmQgdGhpcmQgdGFibGVzXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgICAgICAgICAgdGhbKGRbaV0gPSAoaSA8PCAxKSBeICgoaSA+PiA3KSAqIDI4MykpIF4gaV0gPSBpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoeCA9IHhJbnYgPSAwOyAhc2JveFt4XTsgeCBePSB4MiB8fCAxLCB4SW52ID0gdGhbeEludl0gfHwgMSkge1xuICAgICAgICAgICAgLy8gQ29tcHV0ZSBzYm94XG4gICAgICAgICAgICBzID0geEludiBeICh4SW52IDw8IDEpIF4gKHhJbnYgPDwgMikgXiAoeEludiA8PCAzKSBeICh4SW52IDw8IDQpO1xuICAgICAgICAgICAgcyA9IChzID4+IDgpIF4gKHMgJiAyNTUpIF4gOTk7XG4gICAgICAgICAgICBzYm94W3hdID0gcztcbiAgICAgICAgICAgIHNib3hJbnZbc10gPSB4O1xuICAgICAgICAgICAgLy8gQ29tcHV0ZSBNaXhDb2x1bW5zXG4gICAgICAgICAgICB4OCA9IGRbKHg0ID0gZFsoeDIgPSBkW3hdKV0pXTtcbiAgICAgICAgICAgIHREZWMgPSAoeDggKiAweDEwMTAxMDEpIF4gKHg0ICogMHgxMDAwMSkgXiAoeDIgKiAweDEwMSkgXiAoeCAqIDB4MTAxMDEwMCk7XG4gICAgICAgICAgICB0RW5jID0gKGRbc10gKiAweDEwMSkgXiAocyAqIDB4MTAxMDEwMCk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5jVGFibGVbaV1beF0gPSB0RW5jID0gKHRFbmMgPDwgMjQpIF4gKHRFbmMgPj4+IDgpO1xuICAgICAgICAgICAgICAgIGRlY1RhYmxlW2ldW3NdID0gdERlYyA9ICh0RGVjIDw8IDI0KSBeICh0RGVjID4+PiA4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDb21wYWN0aWZ5LiAgQ29uc2lkZXJhYmxlIHNwZWVkdXAgb24gRmlyZWZveC5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgZW5jVGFibGVbaV0gPSBlbmNUYWJsZVtpXS5zbGljZSgwKTtcbiAgICAgICAgICAgIGRlY1RhYmxlW2ldID0gZGVjVGFibGVbaV0uc2xpY2UoMCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEVuY3J5cHRpb24gYW5kIGRlY3J5cHRpb24gY29yZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBpbnB1dCBGb3VyIHdvcmRzIHRvIGJlIGVuY3J5cHRlZCBvciBkZWNyeXB0ZWQuXG4gICAgICogQHBhcmFtIGRpciBUaGUgZGlyZWN0aW9uLCAwIGZvciBlbmNyeXB0IGFuZCAxIGZvciBkZWNyeXB0LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgZm91ciBlbmNyeXB0ZWQgb3IgZGVjcnlwdGVkIHdvcmRzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyeXB0OiBmdW5jdGlvbiAoaW5wdXQsIGRpcikge1xuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoICE9PSA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcImludmFsaWQgYWVzIGJsb2NrIHNpemVcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGtleSA9IHRoaXMuX2tleVtkaXJdLCBcbiAgICAgICAgLy8gc3RhdGUgdmFyaWFibGVzIGEsYixjLGQgYXJlIGxvYWRlZCB3aXRoIHByZS13aGl0ZW5lZCBkYXRhXG4gICAgICAgIGEgPSBpbnB1dFswXSBeIGtleVswXSwgYiA9IGlucHV0W2RpciA/IDMgOiAxXSBeIGtleVsxXSwgYyA9IGlucHV0WzJdIF4ga2V5WzJdLCBkID0gaW5wdXRbZGlyID8gMSA6IDNdIF4ga2V5WzNdLCBhMiwgYjIsIGMyLCBuSW5uZXJSb3VuZHMgPSBrZXkubGVuZ3RoIC8gNCAtIDIsIGksIGtJbmRleCA9IDQsIG91dCA9IFswLCAwLCAwLCAwXSwgdGFibGUgPSB0aGlzLl90YWJsZXNbZGlyXSwgXG4gICAgICAgIC8vIGxvYWQgdXAgdGhlIHRhYmxlc1xuICAgICAgICB0MCA9IHRhYmxlWzBdLCB0MSA9IHRhYmxlWzFdLCB0MiA9IHRhYmxlWzJdLCB0MyA9IHRhYmxlWzNdLCBzYm94ID0gdGFibGVbNF07XG4gICAgICAgIC8vIElubmVyIHJvdW5kcy4gIENyaWJiZWQgZnJvbSBPcGVuU1NMLlxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbklubmVyUm91bmRzOyBpKyspIHtcbiAgICAgICAgICAgIGEyID0gdDBbYSA+Pj4gMjRdIF4gdDFbKGIgPj4gMTYpICYgMjU1XSBeIHQyWyhjID4+IDgpICYgMjU1XSBeIHQzW2QgJiAyNTVdIF4ga2V5W2tJbmRleF07XG4gICAgICAgICAgICBiMiA9IHQwW2IgPj4+IDI0XSBeIHQxWyhjID4+IDE2KSAmIDI1NV0gXiB0MlsoZCA+PiA4KSAmIDI1NV0gXiB0M1thICYgMjU1XSBeIGtleVtrSW5kZXggKyAxXTtcbiAgICAgICAgICAgIGMyID0gdDBbYyA+Pj4gMjRdIF4gdDFbKGQgPj4gMTYpICYgMjU1XSBeIHQyWyhhID4+IDgpICYgMjU1XSBeIHQzW2IgJiAyNTVdIF4ga2V5W2tJbmRleCArIDJdO1xuICAgICAgICAgICAgZCA9IHQwW2QgPj4+IDI0XSBeIHQxWyhhID4+IDE2KSAmIDI1NV0gXiB0MlsoYiA+PiA4KSAmIDI1NV0gXiB0M1tjICYgMjU1XSBeIGtleVtrSW5kZXggKyAzXTtcbiAgICAgICAgICAgIGtJbmRleCArPSA0O1xuICAgICAgICAgICAgYSA9IGEyO1xuICAgICAgICAgICAgYiA9IGIyO1xuICAgICAgICAgICAgYyA9IGMyO1xuICAgICAgICB9XG4gICAgICAgIC8vIExhc3Qgcm91bmQuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgICAgIG91dFtkaXIgPyAzICYgLWkgOiBpXSA9IChzYm94W2EgPj4+IDI0XSA8PCAyNCkgXiAoc2JveFsoYiA+PiAxNikgJiAyNTVdIDw8IDE2KSBeIChzYm94WyhjID4+IDgpICYgMjU1XSA8PCA4KSBeIHNib3hbZCAmIDI1NV0gXiBrZXlba0luZGV4KytdO1xuICAgICAgICAgICAgYTIgPSBhO1xuICAgICAgICAgICAgYSA9IGI7XG4gICAgICAgICAgICBiID0gYztcbiAgICAgICAgICAgIGMgPSBkO1xuICAgICAgICAgICAgZCA9IGEyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfSxcbn07XG4vKiogQGZpbGVPdmVydmlldyBBcnJheXMgb2YgYml0cywgZW5jb2RlZCBhcyBhcnJheXMgb2YgTnVtYmVycy5cbiAqXG4gKiBAYXV0aG9yIEVtaWx5IFN0YXJrXG4gKiBAYXV0aG9yIE1pa2UgSGFtYnVyZ1xuICogQGF1dGhvciBEYW4gQm9uZWhcbiAqL1xuLyoqXG4gKiBBcnJheXMgb2YgYml0cywgZW5jb2RlZCBhcyBhcnJheXMgb2YgTnVtYmVycy5cbiAqIEBuYW1lc3BhY2VcbiAqIEBkZXNjcmlwdGlvblxuICogPHA+XG4gKiBUaGVzZSBvYmplY3RzIGFyZSB0aGUgY3VycmVuY3kgYWNjZXB0ZWQgYnkgU0pDTCdzIGNyeXB0byBmdW5jdGlvbnMuXG4gKiA8L3A+XG4gKlxuICogPHA+XG4gKiBNb3N0IG9mIG91ciBjcnlwdG8gcHJpbWl0aXZlcyBvcGVyYXRlIG9uIGFycmF5cyBvZiA0LWJ5dGUgd29yZHMgaW50ZXJuYWxseSxcbiAqIGJ1dCBtYW55IG9mIHRoZW0gY2FuIHRha2UgYXJndW1lbnRzIHRoYXQgYXJlIG5vdCBhIG11bHRpcGxlIG9mIDQgYnl0ZXMuXG4gKiBUaGlzIGxpYnJhcnkgZW5jb2RlcyBhcnJheXMgb2YgYml0cyAod2hvc2Ugc2l6ZSBuZWVkIG5vdCBiZSBhIG11bHRpcGxlIG9mIDhcbiAqIGJpdHMpIGFzIGFycmF5cyBvZiAzMi1iaXQgd29yZHMuICBUaGUgYml0cyBhcmUgcGFja2VkLCBiaWctZW5kaWFuLCBpbnRvIGFuXG4gKiBhcnJheSBvZiB3b3JkcywgMzIgYml0cyBhdCBhIHRpbWUuICBTaW5jZSB0aGUgd29yZHMgYXJlIGRvdWJsZS1wcmVjaXNpb25cbiAqIGZsb2F0aW5nIHBvaW50IG51bWJlcnMsIHRoZXkgZml0IHNvbWUgZXh0cmEgZGF0YS4gIFdlIHVzZSB0aGlzIChpbiBhIHByaXZhdGUsXG4gKiBwb3NzaWJseS1jaGFuZ2luZyBtYW5uZXIpIHRvIGVuY29kZSB0aGUgbnVtYmVyIG9mIGJpdHMgYWN0dWFsbHkgIHByZXNlbnRcbiAqIGluIHRoZSBsYXN0IHdvcmQgb2YgdGhlIGFycmF5LlxuICogPC9wPlxuICpcbiAqIDxwPlxuICogQmVjYXVzZSBiaXR3aXNlIG9wcyBjbGVhciB0aGlzIG91dC1vZi1iYW5kIGRhdGEsIHRoZXNlIGFycmF5cyBjYW4gYmUgcGFzc2VkXG4gKiB0byBjaXBoZXJzIGxpa2UgQUVTIHdoaWNoIHdhbnQgYXJyYXlzIG9mIHdvcmRzLlxuICogPC9wPlxuICovXG5zamNsLmJpdEFycmF5ID0ge1xuICAgIC8qKlxuICAgICAqIEFycmF5IHNsaWNlcyBpbiB1bml0cyBvZiBiaXRzLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGEgVGhlIGFycmF5IHRvIHNsaWNlLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBic3RhcnQgVGhlIG9mZnNldCB0byB0aGUgc3RhcnQgb2YgdGhlIHNsaWNlLCBpbiBiaXRzLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBiZW5kIFRoZSBvZmZzZXQgdG8gdGhlIGVuZCBvZiB0aGUgc2xpY2UsIGluIGJpdHMuICBJZiB0aGlzIGlzIHVuZGVmaW5lZCxcbiAgICAgKiBzbGljZSB1bnRpbCB0aGUgZW5kIG9mIHRoZSBhcnJheS5cbiAgICAgKiBAcmV0dXJuIHtiaXRBcnJheX0gVGhlIHJlcXVlc3RlZCBzbGljZS5cbiAgICAgKi9cbiAgICBiaXRTbGljZTogZnVuY3Rpb24gKGEsIGJzdGFydCwgYmVuZCkge1xuICAgICAgICBhID0gc2pjbC5iaXRBcnJheS5fc2hpZnRSaWdodChhLnNsaWNlKGJzdGFydCAvIDMyKSwgMzIgLSAoYnN0YXJ0ICYgMzEpKS5zbGljZSgxKTtcbiAgICAgICAgcmV0dXJuIGJlbmQgPT09IHVuZGVmaW5lZCA/IGEgOiBzamNsLmJpdEFycmF5LmNsYW1wKGEsIGJlbmQgLSBic3RhcnQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBhIG51bWJlciBwYWNrZWQgaW50byBhIGJpdCBhcnJheS5cbiAgICAgKiBAcGFyYW0ge2JpdEFycmF5fSBhIFRoZSBhcnJheSB0byBzbGljZS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYnN0YXJ0IFRoZSBvZmZzZXQgdG8gdGhlIHN0YXJ0IG9mIHRoZSBzbGljZSwgaW4gYml0cy5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYmxlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSBudW1iZXIgdG8gZXh0cmFjdC5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSByZXF1ZXN0ZWQgc2xpY2UuXG4gICAgICovXG4gICAgZXh0cmFjdDogZnVuY3Rpb24gKGEsIGJzdGFydCwgYmxlbmd0aCkge1xuICAgICAgICAvLyBUT0RPOiB0aGlzIE1hdGguZmxvb3IgaXMgbm90IG5lY2Vzc2FyeSBhdCBhbGwsIGJ1dCBmb3Igc29tZSByZWFzb25cbiAgICAgICAgLy8gICBzZWVtcyB0byBzdXBwcmVzcyBhIGJ1ZyBpbiB0aGUgQ2hyb21pdW0gSklULlxuICAgICAgICB2YXIgeCwgc2ggPSBNYXRoLmZsb29yKCgtYnN0YXJ0IC0gYmxlbmd0aCkgJiAzMSk7XG4gICAgICAgIGlmICgoKGJzdGFydCArIGJsZW5ndGggLSAxKSBeIGJzdGFydCkgJiAtMzIpIHtcbiAgICAgICAgICAgIC8vIGl0IGNyb3NzZXMgYSBib3VuZGFyeVxuICAgICAgICAgICAgeCA9IChhWyhic3RhcnQgLyAzMikgfCAwXSA8PCAoMzIgLSBzaCkpIF4gKGFbKGJzdGFydCAvIDMyICsgMSkgfCAwXSA+Pj4gc2gpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gd2l0aGluIGEgc2luZ2xlIHdvcmRcbiAgICAgICAgICAgIHggPSBhWyhic3RhcnQgLyAzMikgfCAwXSA+Pj4gc2g7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggJiAoKDEgPDwgYmxlbmd0aCkgLSAxKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENvbmNhdGVuYXRlIHR3byBiaXQgYXJyYXlzLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGExIFRoZSBmaXJzdCBhcnJheS5cbiAgICAgKiBAcGFyYW0ge2JpdEFycmF5fSBhMiBUaGUgc2Vjb25kIGFycmF5LlxuICAgICAqIEByZXR1cm4ge2JpdEFycmF5fSBUaGUgY29uY2F0ZW5hdGlvbiBvZiBhMSBhbmQgYTIuXG4gICAgICovXG4gICAgY29uY2F0OiBmdW5jdGlvbiAoYTEsIGEyKSB7XG4gICAgICAgIGlmIChhMS5sZW5ndGggPT09IDAgfHwgYTIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gYTEuY29uY2F0KGEyKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGFzdCA9IGExW2ExLmxlbmd0aCAtIDFdLCBzaGlmdCA9IHNqY2wuYml0QXJyYXkuZ2V0UGFydGlhbChsYXN0KTtcbiAgICAgICAgaWYgKHNoaWZ0ID09PSAzMikge1xuICAgICAgICAgICAgcmV0dXJuIGExLmNvbmNhdChhMik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2pjbC5iaXRBcnJheS5fc2hpZnRSaWdodChhMiwgc2hpZnQsIGxhc3QgfCAwLCBhMS5zbGljZSgwLCBhMS5sZW5ndGggLSAxKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEZpbmQgdGhlIGxlbmd0aCBvZiBhbiBhcnJheSBvZiBiaXRzLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGEgVGhlIGFycmF5LlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGxlbmd0aCBvZiBhLCBpbiBiaXRzLlxuICAgICAqL1xuICAgIGJpdExlbmd0aDogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgdmFyIGwgPSBhLmxlbmd0aCwgeDtcbiAgICAgICAgaWYgKGwgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIHggPSBhW2wgLSAxXTtcbiAgICAgICAgcmV0dXJuIChsIC0gMSkgKiAzMiArIHNqY2wuYml0QXJyYXkuZ2V0UGFydGlhbCh4KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRydW5jYXRlIGFuIGFycmF5LlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGEgVGhlIGFycmF5LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsZW4gVGhlIGxlbmd0aCB0byB0cnVuY2F0ZSB0bywgaW4gYml0cy5cbiAgICAgKiBAcmV0dXJuIHtiaXRBcnJheX0gQSBuZXcgYXJyYXksIHRydW5jYXRlZCB0byBsZW4gYml0cy5cbiAgICAgKi9cbiAgICBjbGFtcDogZnVuY3Rpb24gKGEsIGxlbikge1xuICAgICAgICBpZiAoYS5sZW5ndGggKiAzMiA8IGxlbikge1xuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIH1cbiAgICAgICAgYSA9IGEuc2xpY2UoMCwgTWF0aC5jZWlsKGxlbiAvIDMyKSk7XG4gICAgICAgIHZhciBsID0gYS5sZW5ndGg7XG4gICAgICAgIGxlbiA9IGxlbiAmIDMxO1xuICAgICAgICBpZiAobCA+IDAgJiYgbGVuKSB7XG4gICAgICAgICAgICBhW2wgLSAxXSA9IHNqY2wuYml0QXJyYXkucGFydGlhbChsZW4sIGFbbCAtIDFdICYgKDB4ODAwMDAwMDAgPj4gKGxlbiAtIDEpKSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYWtlIGEgcGFydGlhbCB3b3JkIGZvciBhIGJpdCBhcnJheS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVuIFRoZSBudW1iZXIgb2YgYml0cyBpbiB0aGUgd29yZC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgYml0cy5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW19lbmQ9MF0gUGFzcyAxIGlmIHggaGFzIGFscmVhZHkgYmVlbiBzaGlmdGVkIHRvIHRoZSBoaWdoIHNpZGUuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgcGFydGlhbCB3b3JkLlxuICAgICAqL1xuICAgIHBhcnRpYWw6IGZ1bmN0aW9uIChsZW4sIHgsIF9lbmQpIHtcbiAgICAgICAgaWYgKGxlbiA9PT0gMzIpIHtcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoX2VuZCA/IHggfCAwIDogeCA8PCAoMzIgLSBsZW4pKSArIGxlbiAqIDB4MTAwMDAwMDAwMDA7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG51bWJlciBvZiBiaXRzIHVzZWQgYnkgYSBwYXJ0aWFsIHdvcmQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHBhcnRpYWwgd29yZC5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBudW1iZXIgb2YgYml0cyB1c2VkIGJ5IHRoZSBwYXJ0aWFsIHdvcmQuXG4gICAgICovXG4gICAgZ2V0UGFydGlhbDogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoeCAvIDB4MTAwMDAwMDAwMDApIHx8IDMyO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ29tcGFyZSB0d28gYXJyYXlzIGZvciBlcXVhbGl0eSBpbiBhIHByZWRpY3RhYmxlIGFtb3VudCBvZiB0aW1lLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGEgVGhlIGZpcnN0IGFycmF5LlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGIgVGhlIHNlY29uZCBhcnJheS5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGEgPT0gYjsgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGVxdWFsOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBpZiAoc2pjbC5iaXRBcnJheS5iaXRMZW5ndGgoYSkgIT09IHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHggPSAwLCBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgeCB8PSBhW2ldIF4gYltpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geCA9PT0gMDtcbiAgICB9LFxuICAgIC8qKiBTaGlmdCBhbiBhcnJheSByaWdodC5cbiAgICAgKiBAcGFyYW0ge2JpdEFycmF5fSBhIFRoZSBhcnJheSB0byBzaGlmdC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc2hpZnQgVGhlIG51bWJlciBvZiBiaXRzIHRvIHNoaWZ0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbY2Fycnk9MF0gQSBieXRlIHRvIGNhcnJ5IGluXG4gICAgICogQHBhcmFtIHtiaXRBcnJheX0gW291dD1bXV0gQW4gYXJyYXkgdG8gcHJlcGVuZCB0byB0aGUgb3V0cHV0LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NoaWZ0UmlnaHQ6IGZ1bmN0aW9uIChhLCBzaGlmdCwgY2FycnksIG91dCkge1xuICAgICAgICB2YXIgaSwgbGFzdDIgPSAwLCBzaGlmdDI7XG4gICAgICAgIGlmIChvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgb3V0ID0gW107XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IHNoaWZ0ID49IDMyOyBzaGlmdCAtPSAzMikge1xuICAgICAgICAgICAgb3V0LnB1c2goY2FycnkpO1xuICAgICAgICAgICAgY2FycnkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaGlmdCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG91dC5jb25jYXQoYSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG91dC5wdXNoKGNhcnJ5IHwgKGFbaV0gPj4+IHNoaWZ0KSk7XG4gICAgICAgICAgICBjYXJyeSA9IGFbaV0gPDwgKDMyIC0gc2hpZnQpO1xuICAgICAgICB9XG4gICAgICAgIGxhc3QyID0gYS5sZW5ndGggPyBhW2EubGVuZ3RoIC0gMV0gOiAwO1xuICAgICAgICBzaGlmdDIgPSBzamNsLmJpdEFycmF5LmdldFBhcnRpYWwobGFzdDIpO1xuICAgICAgICBvdXQucHVzaChzamNsLmJpdEFycmF5LnBhcnRpYWwoKHNoaWZ0ICsgc2hpZnQyKSAmIDMxLCBzaGlmdCArIHNoaWZ0MiA+IDMyID8gY2FycnkgOiBvdXQucG9wKCksIDEpKTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxuICAgIC8qKiB4b3IgYSBibG9jayBvZiA0IHdvcmRzIHRvZ2V0aGVyLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3hvcjQ6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHJldHVybiBbeFswXSBeIHlbMF0sIHhbMV0gXiB5WzFdLCB4WzJdIF4geVsyXSwgeFszXSBeIHlbM11dO1xuICAgIH0sXG4gICAgLyoqIGJ5dGVzd2FwIGEgd29yZCBhcnJheSBpbnBsYWNlLlxuICAgICAqIChkb2VzIG5vdCBoYW5kbGUgcGFydGlhbCB3b3JkcylcbiAgICAgKiBAcGFyYW0ge3NqY2wuYml0QXJyYXl9IGEgd29yZCBhcnJheVxuICAgICAqIEByZXR1cm4ge3NqY2wuYml0QXJyYXl9IGJ5dGVzd2FwcGVkIGFycmF5XG4gICAgICovXG4gICAgYnl0ZXN3YXBNOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICB2YXIgaSwgdiwgbSA9IDB4ZmYwMDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHYgPSBhW2ldO1xuICAgICAgICAgICAgYVtpXSA9ICh2ID4+PiAyNCkgfCAoKHYgPj4+IDgpICYgbSkgfCAoKHYgJiBtKSA8PCA4KSB8ICh2IDw8IDI0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9LFxufTtcbi8qKiBAZmlsZU92ZXJ2aWV3IEJpdCBhcnJheSBjb2RlYyBpbXBsZW1lbnRhdGlvbnMuXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cbi8qKlxuICogVVRGLTggc3RyaW5nc1xuICogQG5hbWVzcGFjZVxuICovXG5zamNsLmNvZGVjLnV0ZjhTdHJpbmcgPSB7XG4gICAgLyoqIENvbnZlcnQgZnJvbSBhIGJpdEFycmF5IHRvIGEgVVRGLTggc3RyaW5nLiAqL1xuICAgIGZyb21CaXRzOiBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgIHZhciBvdXQgPSBcIlwiLCBibCA9IHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGFyciksIGksIHRtcDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJsIC8gODsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoKGkgJiAzKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRtcCA9IGFycltpIC8gNF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoKHRtcCA+Pj4gOCkgPj4+IDgpID4+PiA4KTtcbiAgICAgICAgICAgIHRtcCA8PD0gODtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShvdXQpKTtcbiAgICB9LFxuICAgIC8qKiBDb252ZXJ0IGZyb20gYSBVVEYtOCBzdHJpbmcgdG8gYSBiaXRBcnJheS4gKi9cbiAgICB0b0JpdHM6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgc3RyID0gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpO1xuICAgICAgICB2YXIgb3V0ID0gW10sIGksIHRtcCA9IDA7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRtcCA9ICh0bXAgPDwgOCkgfCBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIGlmICgoaSAmIDMpID09PSAzKSB7XG4gICAgICAgICAgICAgICAgb3V0LnB1c2godG1wKTtcbiAgICAgICAgICAgICAgICB0bXAgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpICYgMykge1xuICAgICAgICAgICAgb3V0LnB1c2goc2pjbC5iaXRBcnJheS5wYXJ0aWFsKDggKiAoaSAmIDMpLCB0bXApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH0sXG59O1xuLyoqIEBmaWxlT3ZlcnZpZXcgQml0IGFycmF5IGNvZGVjIGltcGxlbWVudGF0aW9ucy5cbiAqXG4gKiBAYXV0aG9yIEVtaWx5IFN0YXJrXG4gKiBAYXV0aG9yIE1pa2UgSGFtYnVyZ1xuICogQGF1dGhvciBEYW4gQm9uZWhcbiAqL1xuLyoqIEBmaWxlT3ZlcnZpZXcgQml0IGFycmF5IGNvZGVjIGltcGxlbWVudGF0aW9ucy5cbiAqXG4gKiBAYXV0aG9yIE5pbHMgS2VubmV3ZWdcbiAqL1xuLyoqXG4gKiBCYXNlMzIgZW5jb2RpbmcvZGVjb2RpbmdcbiAqIEBuYW1lc3BhY2VcbiAqL1xuc2pjbC5jb2RlYy5iYXNlMzIgPSB7XG4gICAgLyoqIFRoZSBiYXNlMzIgYWxwaGFiZXQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2hhcnM6IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVoyMzQ1NjdcIixcbiAgICBfaGV4Q2hhcnM6IFwiMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZcIixcbiAgICAvKiBiaXRzIGluIGFuIGFycmF5ICovXG4gICAgQklUUzogMzIsXG4gICAgLyogYmFzZSB0byBlbmNvZGUgYXQgKDJeeCkgKi9cbiAgICBCQVNFOiA1LFxuICAgIC8qIGJpdHMgLSBiYXNlICovXG4gICAgUkVNQUlOSU5HOiAyNyxcbiAgICAvKiogQ29udmVydCBmcm9tIGEgYml0QXJyYXkgdG8gYSBiYXNlMzIgc3RyaW5nLiAqL1xuICAgIGZyb21CaXRzOiBmdW5jdGlvbiAoYXJyLCBfbm9FcXVhbHMsIF9oZXgpIHtcbiAgICAgICAgdmFyIEJJVFMgPSBzamNsLmNvZGVjLmJhc2UzMi5CSVRTLCBCQVNFID0gc2pjbC5jb2RlYy5iYXNlMzIuQkFTRSwgUkVNQUlOSU5HID0gc2pjbC5jb2RlYy5iYXNlMzIuUkVNQUlOSU5HO1xuICAgICAgICB2YXIgb3V0ID0gXCJcIiwgaSwgYml0cyA9IDAsIGMgPSBzamNsLmNvZGVjLmJhc2UzMi5fY2hhcnMsIHRhID0gMCwgYmwgPSBzamNsLmJpdEFycmF5LmJpdExlbmd0aChhcnIpO1xuICAgICAgICBpZiAoX2hleCkge1xuICAgICAgICAgICAgYyA9IHNqY2wuY29kZWMuYmFzZTMyLl9oZXhDaGFycztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBvdXQubGVuZ3RoICogQkFTRSA8IGJsOykge1xuICAgICAgICAgICAgb3V0ICs9IGMuY2hhckF0KCh0YSBeIChhcnJbaV0gPj4+IGJpdHMpKSA+Pj4gUkVNQUlOSU5HKTtcbiAgICAgICAgICAgIGlmIChiaXRzIDwgQkFTRSkge1xuICAgICAgICAgICAgICAgIHRhID0gYXJyW2ldIDw8IChCQVNFIC0gYml0cyk7XG4gICAgICAgICAgICAgICAgYml0cyArPSBSRU1BSU5JTkc7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGEgPDw9IEJBU0U7XG4gICAgICAgICAgICAgICAgYml0cyAtPSBCQVNFO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChvdXQubGVuZ3RoICYgNyAmJiAhX25vRXF1YWxzKSB7XG4gICAgICAgICAgICBvdXQgKz0gXCI9XCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxuICAgIC8qKiBDb252ZXJ0IGZyb20gYSBiYXNlMzIgc3RyaW5nIHRvIGEgYml0QXJyYXkgKi9cbiAgICB0b0JpdHM6IGZ1bmN0aW9uIChzdHIsIF9oZXgpIHtcbiAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcc3w9L2csIFwiXCIpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIHZhciBCSVRTID0gc2pjbC5jb2RlYy5iYXNlMzIuQklUUywgQkFTRSA9IHNqY2wuY29kZWMuYmFzZTMyLkJBU0UsIFJFTUFJTklORyA9IHNqY2wuY29kZWMuYmFzZTMyLlJFTUFJTklORztcbiAgICAgICAgdmFyIG91dCA9IFtdLCBpLCBiaXRzID0gMCwgYyA9IHNqY2wuY29kZWMuYmFzZTMyLl9jaGFycywgdGEgPSAwLCB4LCBmb3JtYXQgPSBcImJhc2UzMlwiO1xuICAgICAgICBpZiAoX2hleCkge1xuICAgICAgICAgICAgYyA9IHNqY2wuY29kZWMuYmFzZTMyLl9oZXhDaGFycztcbiAgICAgICAgICAgIGZvcm1hdCA9IFwiYmFzZTMyaGV4XCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgeCA9IGMuaW5kZXhPZihzdHIuY2hhckF0KGkpKTtcbiAgICAgICAgICAgIGlmICh4IDwgMCkge1xuICAgICAgICAgICAgICAgIC8vIEludmFsaWQgY2hhcmFjdGVyLCB0cnkgaGV4IGZvcm1hdFxuICAgICAgICAgICAgICAgIGlmICghX2hleCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNqY2wuY29kZWMuYmFzZTMyaGV4LnRvQml0cyhzdHIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJ0aGlzIGlzbid0IFwiICsgZm9ybWF0ICsgXCIhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJpdHMgPiBSRU1BSU5JTkcpIHtcbiAgICAgICAgICAgICAgICBiaXRzIC09IFJFTUFJTklORztcbiAgICAgICAgICAgICAgICBvdXQucHVzaCh0YSBeICh4ID4+PiBiaXRzKSk7XG4gICAgICAgICAgICAgICAgdGEgPSB4IDw8IChCSVRTIC0gYml0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBiaXRzICs9IEJBU0U7XG4gICAgICAgICAgICAgICAgdGEgXj0geCA8PCAoQklUUyAtIGJpdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChiaXRzICYgNTYpIHtcbiAgICAgICAgICAgIG91dC5wdXNoKHNqY2wuYml0QXJyYXkucGFydGlhbChiaXRzICYgNTYsIHRhLCAxKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxufTtcbnNqY2wuY29kZWMuYmFzZTMyaGV4ID0ge1xuICAgIGZyb21CaXRzOiBmdW5jdGlvbiAoYXJyLCBfbm9FcXVhbHMpIHtcbiAgICAgICAgcmV0dXJuIHNqY2wuY29kZWMuYmFzZTMyLmZyb21CaXRzKGFyciwgX25vRXF1YWxzLCAxKTtcbiAgICB9LFxuICAgIHRvQml0czogZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc2pjbC5jb2RlYy5iYXNlMzIudG9CaXRzKHN0ciwgMSk7XG4gICAgfSxcbn07XG4vKiogQGZpbGVPdmVydmlldyBCaXQgYXJyYXkgY29kZWMgaW1wbGVtZW50YXRpb25zLlxuICpcbiAqIEBhdXRob3IgRW1pbHkgU3RhcmtcbiAqIEBhdXRob3IgTWlrZSBIYW1idXJnXG4gKiBAYXV0aG9yIERhbiBCb25laFxuICovXG4vKipcbiAqIEJhc2U2NCBlbmNvZGluZy9kZWNvZGluZ1xuICogQG5hbWVzcGFjZVxuICovXG5zamNsLmNvZGVjLmJhc2U2NCA9IHtcbiAgICAvKiogVGhlIGJhc2U2NCBhbHBoYWJldC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGFyczogXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvXCIsXG4gICAgLyoqIENvbnZlcnQgZnJvbSBhIGJpdEFycmF5IHRvIGEgYmFzZTY0IHN0cmluZy4gKi9cbiAgICBmcm9tQml0czogZnVuY3Rpb24gKGFyciwgX25vRXF1YWxzLCBfdXJsKSB7XG4gICAgICAgIHZhciBvdXQgPSBcIlwiLCBpLCBiaXRzID0gMCwgYyA9IHNqY2wuY29kZWMuYmFzZTY0Ll9jaGFycywgdGEgPSAwLCBibCA9IHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGFycik7XG4gICAgICAgIGlmIChfdXJsKSB7XG4gICAgICAgICAgICBjID0gYy5zdWJzdHJpbmcoMCwgNjIpICsgXCItX1wiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IG91dC5sZW5ndGggKiA2IDwgYmw7KSB7XG4gICAgICAgICAgICBvdXQgKz0gYy5jaGFyQXQoKHRhIF4gKGFycltpXSA+Pj4gYml0cykpID4+PiAyNik7XG4gICAgICAgICAgICBpZiAoYml0cyA8IDYpIHtcbiAgICAgICAgICAgICAgICB0YSA9IGFycltpXSA8PCAoNiAtIGJpdHMpO1xuICAgICAgICAgICAgICAgIGJpdHMgKz0gMjY7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGEgPDw9IDY7XG4gICAgICAgICAgICAgICAgYml0cyAtPSA2O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChvdXQubGVuZ3RoICYgMyAmJiAhX25vRXF1YWxzKSB7XG4gICAgICAgICAgICBvdXQgKz0gXCI9XCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxuICAgIC8qKiBDb252ZXJ0IGZyb20gYSBiYXNlNjQgc3RyaW5nIHRvIGEgYml0QXJyYXkgKi9cbiAgICB0b0JpdHM6IGZ1bmN0aW9uIChzdHIsIF91cmwpIHtcbiAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcc3w9L2csIFwiXCIpO1xuICAgICAgICB2YXIgb3V0ID0gW10sIGksIGJpdHMgPSAwLCBjID0gc2pjbC5jb2RlYy5iYXNlNjQuX2NoYXJzLCB0YSA9IDAsIHg7XG4gICAgICAgIGlmIChfdXJsKSB7XG4gICAgICAgICAgICBjID0gYy5zdWJzdHJpbmcoMCwgNjIpICsgXCItX1wiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHggPSBjLmluZGV4T2Yoc3RyLmNoYXJBdChpKSk7XG4gICAgICAgICAgICBpZiAoeCA8IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcInRoaXMgaXNuJ3QgYmFzZTY0IVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiaXRzID4gMjYpIHtcbiAgICAgICAgICAgICAgICBiaXRzIC09IDI2O1xuICAgICAgICAgICAgICAgIG91dC5wdXNoKHRhIF4gKHggPj4+IGJpdHMpKTtcbiAgICAgICAgICAgICAgICB0YSA9IHggPDwgKDMyIC0gYml0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBiaXRzICs9IDY7XG4gICAgICAgICAgICAgICAgdGEgXj0geCA8PCAoMzIgLSBiaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYml0cyAmIDU2KSB7XG4gICAgICAgICAgICBvdXQucHVzaChzamNsLmJpdEFycmF5LnBhcnRpYWwoYml0cyAmIDU2LCB0YSwgMSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfSxcbn07XG4vKiogQGZpbGVPdmVydmlldyBKYXZhc2NyaXB0IFNIQS0yNTYgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQW4gb2xkZXIgdmVyc2lvbiBvZiB0aGlzIGltcGxlbWVudGF0aW9uIGlzIGF2YWlsYWJsZSBpbiB0aGUgcHVibGljXG4gKiBkb21haW4sIGJ1dCB0aGlzIG9uZSBpcyAoYykgRW1pbHkgU3RhcmssIE1pa2UgSGFtYnVyZywgRGFuIEJvbmVoLFxuICogU3RhbmZvcmQgVW5pdmVyc2l0eSAyMDA4LTIwMTAgYW5kIEJTRC1saWNlbnNlZCBmb3IgbGlhYmlsaXR5XG4gKiByZWFzb25zLlxuICpcbiAqIFNwZWNpYWwgdGhhbmtzIHRvIEFsZG8gQ29ydGVzaSBmb3IgcG9pbnRpbmcgb3V0IHNldmVyYWwgYnVncyBpblxuICogdGhpcyBjb2RlLlxuICpcbiAqIEBhdXRob3IgRW1pbHkgU3RhcmtcbiAqIEBhdXRob3IgTWlrZSBIYW1idXJnXG4gKiBAYXV0aG9yIERhbiBCb25laFxuICovXG4vKipcbiAqIENvbnRleHQgZm9yIGEgU0hBLTI1NiBvcGVyYXRpb24gaW4gcHJvZ3Jlc3MuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuc2pjbC5oYXNoLnNoYTI1NiA9IGZ1bmN0aW9uIChoYXNoKSB7XG4gICAgaWYgKCF0aGlzLl9rZXlbMF0pIHtcbiAgICAgICAgdGhpcy5fcHJlY29tcHV0ZSgpO1xuICAgIH1cbiAgICBpZiAoaGFzaCkge1xuICAgICAgICB0aGlzLl9oID0gaGFzaC5faC5zbGljZSgwKTtcbiAgICAgICAgdGhpcy5fYnVmZmVyID0gaGFzaC5fYnVmZmVyLnNsaWNlKDApO1xuICAgICAgICB0aGlzLl9sZW5ndGggPSBoYXNoLl9sZW5ndGg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfVxufTtcbi8qKlxuICogSGFzaCBhIHN0cmluZyBvciBhbiBhcnJheSBvZiB3b3Jkcy5cbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSB7Yml0QXJyYXl8U3RyaW5nfSBkYXRhIHRoZSBkYXRhIHRvIGhhc2guXG4gKiBAcmV0dXJuIHtiaXRBcnJheX0gVGhlIGhhc2ggdmFsdWUsIGFuIGFycmF5IG9mIDE2IGJpZy1lbmRpYW4gd29yZHMuXG4gKi9cbnNqY2wuaGFzaC5zaGEyNTYuaGFzaCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBzamNsLmhhc2guc2hhMjU2KCkudXBkYXRlKGRhdGEpLmZpbmFsaXplKCk7XG59O1xuc2pjbC5oYXNoLnNoYTI1Ni5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogVGhlIGhhc2gncyBibG9jayBzaXplLCBpbiBiaXRzLlxuICAgICAqIEBjb25zdGFudFxuICAgICAqL1xuICAgIGJsb2NrU2l6ZTogNTEyLFxuICAgIC8qKlxuICAgICAqIFJlc2V0IHRoZSBoYXNoIHN0YXRlLlxuICAgICAqIEByZXR1cm4gdGhpc1xuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2ggPSB0aGlzLl9pbml0LnNsaWNlKDApO1xuICAgICAgICB0aGlzLl9idWZmZXIgPSBbXTtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbnB1dCBzZXZlcmFsIHdvcmRzIHRvIHRoZSBoYXNoLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl8U3RyaW5nfSBkYXRhIHRoZSBkYXRhIHRvIGhhc2guXG4gICAgICogQHJldHVybiB0aGlzXG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGRhdGEgPSBzamNsLmNvZGVjLnV0ZjhTdHJpbmcudG9CaXRzKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpLCBiID0gKHRoaXMuX2J1ZmZlciA9IHNqY2wuYml0QXJyYXkuY29uY2F0KHRoaXMuX2J1ZmZlciwgZGF0YSkpLCBvbCA9IHRoaXMuX2xlbmd0aCwgbmwgPSAodGhpcy5fbGVuZ3RoID0gb2wgKyBzamNsLmJpdEFycmF5LmJpdExlbmd0aChkYXRhKSk7XG4gICAgICAgIGlmIChubCA+IDkwMDcxOTkyNTQ3NDA5OTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwiQ2Fubm90IGhhc2ggbW9yZSB0aGFuIDJeNTMgLSAxIGJpdHNcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBVaW50MzJBcnJheSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdmFyIGMgPSBuZXcgVWludDMyQXJyYXkoYik7XG4gICAgICAgICAgICB2YXIgaiA9IDA7XG4gICAgICAgICAgICBmb3IgKGkgPSA1MTIgKyBvbCAtICgoNTEyICsgb2wpICYgNTExKTsgaSA8PSBubDsgaSArPSA1MTIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ibG9jayhjLnN1YmFycmF5KDE2ICogaiwgMTYgKiAoaiArIDEpKSk7XG4gICAgICAgICAgICAgICAgaiArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYi5zcGxpY2UoMCwgMTYgKiBqKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDUxMiArIG9sIC0gKCg1MTIgKyBvbCkgJiA1MTEpOyBpIDw9IG5sOyBpICs9IDUxMikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Jsb2NrKGIuc3BsaWNlKDAsIDE2KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDb21wbGV0ZSBoYXNoaW5nIGFuZCBvdXRwdXQgdGhlIGhhc2ggdmFsdWUuXG4gICAgICogQHJldHVybiB7Yml0QXJyYXl9IFRoZSBoYXNoIHZhbHVlLCBhbiBhcnJheSBvZiA4IGJpZy1lbmRpYW4gd29yZHMuXG4gICAgICovXG4gICAgZmluYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGksIGIgPSB0aGlzLl9idWZmZXIsIGggPSB0aGlzLl9oO1xuICAgICAgICAvLyBSb3VuZCBvdXQgYW5kIHB1c2ggdGhlIGJ1ZmZlclxuICAgICAgICBiID0gc2pjbC5iaXRBcnJheS5jb25jYXQoYiwgW3NqY2wuYml0QXJyYXkucGFydGlhbCgxLCAxKV0pO1xuICAgICAgICAvLyBSb3VuZCBvdXQgdGhlIGJ1ZmZlciB0byBhIG11bHRpcGxlIG9mIDE2IHdvcmRzLCBsZXNzIHRoZSAyIGxlbmd0aCB3b3Jkcy5cbiAgICAgICAgZm9yIChpID0gYi5sZW5ndGggKyAyOyBpICYgMTU7IGkrKykge1xuICAgICAgICAgICAgYi5wdXNoKDApO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFwcGVuZCB0aGUgbGVuZ3RoXG4gICAgICAgIGIucHVzaChNYXRoLmZsb29yKHRoaXMuX2xlbmd0aCAvIDB4MTAwMDAwMDAwKSk7XG4gICAgICAgIGIucHVzaCh0aGlzLl9sZW5ndGggfCAwKTtcbiAgICAgICAgd2hpbGUgKGIubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9ibG9jayhiLnNwbGljZSgwLCAxNikpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgcmV0dXJuIGg7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgU0hBLTI1NiBpbml0aWFsaXphdGlvbiB2ZWN0b3IsIHRvIGJlIHByZWNvbXB1dGVkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQ6IFtdLFxuICAgIC8qXG4gICAgIF9pbml0OlsweDZhMDllNjY3LDB4YmI2N2FlODUsMHgzYzZlZjM3MiwweGE1NGZmNTNhLDB4NTEwZTUyN2YsMHg5YjA1Njg4YywweDFmODNkOWFiLDB4NWJlMGNkMTldLFxuICAgICAqL1xuICAgIC8qKlxuICAgICAqIFRoZSBTSEEtMjU2IGhhc2gga2V5LCB0byBiZSBwcmVjb21wdXRlZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9rZXk6IFtdLFxuICAgIC8qXG4gICAgIF9rZXk6XG4gICAgIFsweDQyOGEyZjk4LCAweDcxMzc0NDkxLCAweGI1YzBmYmNmLCAweGU5YjVkYmE1LCAweDM5NTZjMjViLCAweDU5ZjExMWYxLCAweDkyM2Y4MmE0LCAweGFiMWM1ZWQ1LFxuICAgICAweGQ4MDdhYTk4LCAweDEyODM1YjAxLCAweDI0MzE4NWJlLCAweDU1MGM3ZGMzLCAweDcyYmU1ZDc0LCAweDgwZGViMWZlLCAweDliZGMwNmE3LCAweGMxOWJmMTc0LFxuICAgICAweGU0OWI2OWMxLCAweGVmYmU0Nzg2LCAweDBmYzE5ZGM2LCAweDI0MGNhMWNjLCAweDJkZTkyYzZmLCAweDRhNzQ4NGFhLCAweDVjYjBhOWRjLCAweDc2Zjk4OGRhLFxuICAgICAweDk4M2U1MTUyLCAweGE4MzFjNjZkLCAweGIwMDMyN2M4LCAweGJmNTk3ZmM3LCAweGM2ZTAwYmYzLCAweGQ1YTc5MTQ3LCAweDA2Y2E2MzUxLCAweDE0MjkyOTY3LFxuICAgICAweDI3YjcwYTg1LCAweDJlMWIyMTM4LCAweDRkMmM2ZGZjLCAweDUzMzgwZDEzLCAweDY1MGE3MzU0LCAweDc2NmEwYWJiLCAweDgxYzJjOTJlLCAweDkyNzIyYzg1LFxuICAgICAweGEyYmZlOGExLCAweGE4MWE2NjRiLCAweGMyNGI4YjcwLCAweGM3NmM1MWEzLCAweGQxOTJlODE5LCAweGQ2OTkwNjI0LCAweGY0MGUzNTg1LCAweDEwNmFhMDcwLFxuICAgICAweDE5YTRjMTE2LCAweDFlMzc2YzA4LCAweDI3NDg3NzRjLCAweDM0YjBiY2I1LCAweDM5MWMwY2IzLCAweDRlZDhhYTRhLCAweDViOWNjYTRmLCAweDY4MmU2ZmYzLFxuICAgICAweDc0OGY4MmVlLCAweDc4YTU2MzZmLCAweDg0Yzg3ODE0LCAweDhjYzcwMjA4LCAweDkwYmVmZmZhLCAweGE0NTA2Y2ViLCAweGJlZjlhM2Y3LCAweGM2NzE3OGYyXSxcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBwcmVjb21wdXRlIF9pbml0IGFuZCBfa2V5LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3ByZWNvbXB1dGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGkgPSAwLCBwcmltZSA9IDIsIGZhY3RvciwgaXNQcmltZTtcbiAgICAgICAgZnVuY3Rpb24gZnJhYyh4KSB7XG4gICAgICAgICAgICByZXR1cm4gKCh4IC0gTWF0aC5mbG9vcih4KSkgKiAweDEwMDAwMDAwMCkgfCAwO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoOyBpIDwgNjQ7IHByaW1lKyspIHtcbiAgICAgICAgICAgIGlzUHJpbWUgPSB0cnVlO1xuICAgICAgICAgICAgZm9yIChmYWN0b3IgPSAyOyBmYWN0b3IgKiBmYWN0b3IgPD0gcHJpbWU7IGZhY3RvcisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByaW1lICUgZmFjdG9yID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUHJpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzUHJpbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA8IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdFtpXSA9IGZyYWMoTWF0aC5wb3cocHJpbWUsIDEgLyAyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2tleVtpXSA9IGZyYWMoTWF0aC5wb3cocHJpbWUsIDEgLyAzKSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIG9uZSBjeWNsZSBvZiBTSEEtMjU2LlxuICAgICAqIEBwYXJhbSB7VWludDMyQXJyYXl8Yml0QXJyYXl9IHcgb25lIGJsb2NrIG9mIHdvcmRzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Jsb2NrOiBmdW5jdGlvbiAodykge1xuICAgICAgICB2YXIgaSwgdG1wLCBhLCBiLCBoID0gdGhpcy5faCwgayA9IHRoaXMuX2tleSwgaDAgPSBoWzBdLCBoMSA9IGhbMV0sIGgyID0gaFsyXSwgaDMgPSBoWzNdLCBoNCA9IGhbNF0sIGg1ID0gaFs1XSwgaDYgPSBoWzZdLCBoNyA9IGhbN107XG4gICAgICAgIC8qIFJhdGlvbmFsZSBmb3IgcGxhY2VtZW50IG9mIHwwIDpcbiAgICAgICAgICogSWYgYSB2YWx1ZSBjYW4gb3ZlcmZsb3cgaXMgb3JpZ2luYWwgMzIgYml0cyBieSBhIGZhY3RvciBvZiBtb3JlIHRoYW4gYSBmZXdcbiAgICAgICAgICogbWlsbGlvbiAoMl4yMyBpc2gpLCB0aGVyZSBpcyBhIHBvc3NpYmlsaXR5IHRoYXQgaXQgbWlnaHQgb3ZlcmZsb3cgdGhlXG4gICAgICAgICAqIDUzLWJpdCBtYW50aXNzYSBhbmQgbG9zZSBwcmVjaXNpb24uXG4gICAgICAgICAqXG4gICAgICAgICAqIFRvIGF2b2lkIHRoaXMsIHdlIGNsYW1wIGJhY2sgdG8gMzIgYml0cyBieSB8J2luZyB3aXRoIDAgb24gYW55IHZhbHVlIHRoYXRcbiAgICAgICAgICogcHJvcGFnYXRlcyBhcm91bmQgdGhlIGxvb3AsIGFuZCBvbiB0aGUgaGFzaCBzdGF0ZSBoW10uICBJIGRvbid0IGJlbGlldmVcbiAgICAgICAgICogdGhhdCB0aGUgY2xhbXBzIG9uIGg0IGFuZCBvbiBoMCBhcmUgc3RyaWN0bHkgbmVjZXNzYXJ5LCBidXQgaXQncyBjbG9zZVxuICAgICAgICAgKiAoZm9yIGg0IGFueXdheSksIGFuZCBiZXR0ZXIgc2FmZSB0aGFuIHNvcnJ5LlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2xhbXBzIG9uIGhbXSBhcmUgbmVjZXNzYXJ5IGZvciB0aGUgb3V0cHV0IHRvIGJlIGNvcnJlY3QgZXZlbiBpbiB0aGVcbiAgICAgICAgICogY29tbW9uIGNhc2UgYW5kIGZvciBzaG9ydCBpbnB1dHMuXG4gICAgICAgICAqL1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNjQ7IGkrKykge1xuICAgICAgICAgICAgLy8gbG9hZCB1cCB0aGUgaW5wdXQgd29yZCBmb3IgdGhpcyByb3VuZFxuICAgICAgICAgICAgaWYgKGkgPCAxNikge1xuICAgICAgICAgICAgICAgIHRtcCA9IHdbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhID0gd1soaSArIDEpICYgMTVdO1xuICAgICAgICAgICAgICAgIGIgPSB3WyhpICsgMTQpICYgMTVdO1xuICAgICAgICAgICAgICAgIHRtcCA9IHdbaSAmIDE1XSA9XG4gICAgICAgICAgICAgICAgICAgICgoKGEgPj4+IDcpIF4gKGEgPj4+IDE4KSBeIChhID4+PiAzKSBeIChhIDw8IDI1KSBeIChhIDw8IDE0KSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKChiID4+PiAxNykgXiAoYiA+Pj4gMTkpIF4gKGIgPj4+IDEwKSBeIChiIDw8IDE1KSBeIChiIDw8IDEzKSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgd1tpICYgMTVdICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdbKGkgKyA5KSAmIDE1XSkgfFxuICAgICAgICAgICAgICAgICAgICAgICAgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRtcCA9IHRtcCArIGg3ICsgKChoNCA+Pj4gNikgXiAoaDQgPj4+IDExKSBeIChoNCA+Pj4gMjUpIF4gKGg0IDw8IDI2KSBeIChoNCA8PCAyMSkgXiAoaDQgPDwgNykpICsgKGg2IF4gKGg0ICYgKGg1IF4gaDYpKSkgKyBrW2ldOyAvLyB8IDA7XG4gICAgICAgICAgICAvLyBzaGlmdCByZWdpc3RlclxuICAgICAgICAgICAgaDcgPSBoNjtcbiAgICAgICAgICAgIGg2ID0gaDU7XG4gICAgICAgICAgICBoNSA9IGg0O1xuICAgICAgICAgICAgaDQgPSAoaDMgKyB0bXApIHwgMDtcbiAgICAgICAgICAgIGgzID0gaDI7XG4gICAgICAgICAgICBoMiA9IGgxO1xuICAgICAgICAgICAgaDEgPSBoMDtcbiAgICAgICAgICAgIGgwID0gKHRtcCArICgoaDEgJiBoMikgXiAoaDMgJiAoaDEgXiBoMikpKSArICgoaDEgPj4+IDIpIF4gKGgxID4+PiAxMykgXiAoaDEgPj4+IDIyKSBeIChoMSA8PCAzMCkgXiAoaDEgPDwgMTkpIF4gKGgxIDw8IDEwKSkpIHwgMDtcbiAgICAgICAgfVxuICAgICAgICBoWzBdID0gKGhbMF0gKyBoMCkgfCAwO1xuICAgICAgICBoWzFdID0gKGhbMV0gKyBoMSkgfCAwO1xuICAgICAgICBoWzJdID0gKGhbMl0gKyBoMikgfCAwO1xuICAgICAgICBoWzNdID0gKGhbM10gKyBoMykgfCAwO1xuICAgICAgICBoWzRdID0gKGhbNF0gKyBoNCkgfCAwO1xuICAgICAgICBoWzVdID0gKGhbNV0gKyBoNSkgfCAwO1xuICAgICAgICBoWzZdID0gKGhbNl0gKyBoNikgfCAwO1xuICAgICAgICBoWzddID0gKGhbN10gKyBoNykgfCAwO1xuICAgIH0sXG59O1xuLyoqIEBmaWxlT3ZlcnZpZXcgSmF2YXNjcmlwdCBTSEEtNTEyIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIFRoaXMgaW1wbGVtZW50YXRpb24gd2FzIHdyaXR0ZW4gZm9yIENyeXB0b0pTIGJ5IEplZmYgTW90dCBhbmQgYWRhcHRlZCBmb3JcbiAqIFNKQ0wgYnkgU3RlZmFuIFRob21hcy5cbiAqXG4gKiBDcnlwdG9KUyAoYykgMjAwOeKAkzIwMTIgYnkgSmVmZiBNb3R0LiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogUmVsZWFzZWQgd2l0aCBOZXcgQlNEIExpY2Vuc2VcbiAqXG4gKiBAYXV0aG9yIEVtaWx5IFN0YXJrXG4gKiBAYXV0aG9yIE1pa2UgSGFtYnVyZ1xuICogQGF1dGhvciBEYW4gQm9uZWhcbiAqIEBhdXRob3IgSmVmZiBNb3R0XG4gKiBAYXV0aG9yIFN0ZWZhbiBUaG9tYXNcbiAqL1xuLyoqXG4gKiBDb250ZXh0IGZvciBhIFNIQS01MTIgb3BlcmF0aW9uIGluIHByb2dyZXNzLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnNqY2wuaGFzaC5zaGE1MTIgPSBmdW5jdGlvbiAoaGFzaCkge1xuICAgIGlmICghdGhpcy5fa2V5WzBdKSB7XG4gICAgICAgIHRoaXMuX3ByZWNvbXB1dGUoKTtcbiAgICB9XG4gICAgaWYgKGhhc2gpIHtcbiAgICAgICAgdGhpcy5faCA9IGhhc2guX2guc2xpY2UoMCk7XG4gICAgICAgIHRoaXMuX2J1ZmZlciA9IGhhc2guX2J1ZmZlci5zbGljZSgwKTtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gaGFzaC5fbGVuZ3RoO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cbn07XG4vKipcbiAqIEhhc2ggYSBzdHJpbmcgb3IgYW4gYXJyYXkgb2Ygd29yZHMuXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0ge2JpdEFycmF5fFN0cmluZ30gZGF0YSB0aGUgZGF0YSB0byBoYXNoLlxuICogQHJldHVybiB7Yml0QXJyYXl9IFRoZSBoYXNoIHZhbHVlLCBhbiBhcnJheSBvZiAxNiBiaWctZW5kaWFuIHdvcmRzLlxuICovXG5zamNsLmhhc2guc2hhNTEyLmhhc2ggPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiBuZXcgc2pjbC5oYXNoLnNoYTUxMigpLnVwZGF0ZShkYXRhKS5maW5hbGl6ZSgpO1xufTtcbnNqY2wuaGFzaC5zaGE1MTIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIFRoZSBoYXNoJ3MgYmxvY2sgc2l6ZSwgaW4gYml0cy5cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKi9cbiAgICBibG9ja1NpemU6IDEwMjQsXG4gICAgLyoqXG4gICAgICogUmVzZXQgdGhlIGhhc2ggc3RhdGUuXG4gICAgICogQHJldHVybiB0aGlzXG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5faCA9IHRoaXMuX2luaXQuc2xpY2UoMCk7XG4gICAgICAgIHRoaXMuX2J1ZmZlciA9IFtdO1xuICAgICAgICB0aGlzLl9sZW5ndGggPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIElucHV0IHNldmVyYWwgd29yZHMgdG8gdGhlIGhhc2guXG4gICAgICogQHBhcmFtIHtiaXRBcnJheXxTdHJpbmd9IGRhdGEgdGhlIGRhdGEgdG8gaGFzaC5cbiAgICAgKiBAcmV0dXJuIHRoaXNcbiAgICAgKi9cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgZGF0YSA9IHNqY2wuY29kZWMudXRmOFN0cmluZy50b0JpdHMoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGksIGIgPSAodGhpcy5fYnVmZmVyID0gc2pjbC5iaXRBcnJheS5jb25jYXQodGhpcy5fYnVmZmVyLCBkYXRhKSksIG9sID0gdGhpcy5fbGVuZ3RoLCBubCA9ICh0aGlzLl9sZW5ndGggPSBvbCArIHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGRhdGEpKTtcbiAgICAgICAgaWYgKG5sID4gOTAwNzE5OTI1NDc0MDk5MSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJDYW5ub3QgaGFzaCBtb3JlIHRoYW4gMl41MyAtIDEgYml0c1wiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIFVpbnQzMkFycmF5ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB2YXIgYyA9IG5ldyBVaW50MzJBcnJheShiKTtcbiAgICAgICAgICAgIHZhciBqID0gMDtcbiAgICAgICAgICAgIGZvciAoaSA9IDEwMjQgKyBvbCAtICgoMTAyNCArIG9sKSAmIDEwMjMpOyBpIDw9IG5sOyBpICs9IDEwMjQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ibG9jayhjLnN1YmFycmF5KDMyICogaiwgMzIgKiAoaiArIDEpKSk7XG4gICAgICAgICAgICAgICAgaiArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYi5zcGxpY2UoMCwgMzIgKiBqKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDEwMjQgKyBvbCAtICgoMTAyNCArIG9sKSAmIDEwMjMpOyBpIDw9IG5sOyBpICs9IDEwMjQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ibG9jayhiLnNwbGljZSgwLCAzMikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ29tcGxldGUgaGFzaGluZyBhbmQgb3V0cHV0IHRoZSBoYXNoIHZhbHVlLlxuICAgICAqIEByZXR1cm4ge2JpdEFycmF5fSBUaGUgaGFzaCB2YWx1ZSwgYW4gYXJyYXkgb2YgMTYgYmlnLWVuZGlhbiB3b3Jkcy5cbiAgICAgKi9cbiAgICBmaW5hbGl6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaSwgYiA9IHRoaXMuX2J1ZmZlciwgaCA9IHRoaXMuX2g7XG4gICAgICAgIC8vIFJvdW5kIG91dCBhbmQgcHVzaCB0aGUgYnVmZmVyXG4gICAgICAgIGIgPSBzamNsLmJpdEFycmF5LmNvbmNhdChiLCBbc2pjbC5iaXRBcnJheS5wYXJ0aWFsKDEsIDEpXSk7XG4gICAgICAgIC8vIFJvdW5kIG91dCB0aGUgYnVmZmVyIHRvIGEgbXVsdGlwbGUgb2YgMzIgd29yZHMsIGxlc3MgdGhlIDQgbGVuZ3RoIHdvcmRzLlxuICAgICAgICBmb3IgKGkgPSBiLmxlbmd0aCArIDQ7IGkgJiAzMTsgaSsrKSB7XG4gICAgICAgICAgICBiLnB1c2goMCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXBwZW5kIHRoZSBsZW5ndGhcbiAgICAgICAgYi5wdXNoKDApO1xuICAgICAgICBiLnB1c2goMCk7XG4gICAgICAgIGIucHVzaChNYXRoLmZsb29yKHRoaXMuX2xlbmd0aCAvIDB4MTAwMDAwMDAwKSk7XG4gICAgICAgIGIucHVzaCh0aGlzLl9sZW5ndGggfCAwKTtcbiAgICAgICAgd2hpbGUgKGIubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9ibG9jayhiLnNwbGljZSgwLCAzMikpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgcmV0dXJuIGg7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgU0hBLTUxMiBpbml0aWFsaXphdGlvbiB2ZWN0b3IsIHRvIGJlIHByZWNvbXB1dGVkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQ6IFtdLFxuICAgIC8qKlxuICAgICAqIExlYXN0IHNpZ25pZmljYW50IDI0IGJpdHMgb2YgU0hBNTEyIGluaXRpYWxpemF0aW9uIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEphdmFzY3JpcHQgb25seSBoYXMgNTMgYml0cyBvZiBwcmVjaXNpb24sIHNvIHdlIGNvbXB1dGUgdGhlIDQwIG1vc3RcbiAgICAgKiBzaWduaWZpY2FudCBiaXRzIGFuZCBhZGQgdGhlIHJlbWFpbmluZyAyNCBiaXRzIGFzIGNvbnN0YW50cy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRyOiBbMHhiY2M5MDgsIDB4Y2FhNzNiLCAweDk0ZjgyYiwgMHgxZDM2ZjEsIDB4ZTY4MmQxLCAweDNlNmMxZiwgMHg0MWJkNmIsIDB4N2UyMTc5XSxcbiAgICAvKlxuICBfaW5pdDpcbiAgWzB4NmEwOWU2NjcsIDB4ZjNiY2M5MDgsIDB4YmI2N2FlODUsIDB4ODRjYWE3M2IsIDB4M2M2ZWYzNzIsIDB4ZmU5NGY4MmIsIDB4YTU0ZmY1M2EsIDB4NWYxZDM2ZjEsXG4gICAweDUxMGU1MjdmLCAweGFkZTY4MmQxLCAweDliMDU2ODhjLCAweDJiM2U2YzFmLCAweDFmODNkOWFiLCAweGZiNDFiZDZiLCAweDViZTBjZDE5LCAweDEzN2UyMTc5XSxcbiAgKi9cbiAgICAvKipcbiAgICAgKiBUaGUgU0hBLTUxMiBoYXNoIGtleSwgdG8gYmUgcHJlY29tcHV0ZWQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfa2V5OiBbXSxcbiAgICAvKipcbiAgICAgKiBMZWFzdCBzaWduaWZpY2FudCAyNCBiaXRzIG9mIFNIQTUxMiBrZXkgdmFsdWVzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2tleXI6IFtcbiAgICAgICAgMHgyOGFlMjIsIDB4ZWY2NWNkLCAweDRkM2IyZiwgMHg4OWRiYmMsIDB4NDhiNTM4LCAweDA1ZDAxOSwgMHgxOTRmOWIsIDB4NmQ4MTE4LCAweDAzMDI0MiwgMHg3MDZmYmUsIDB4ZTRiMjhjLCAweGZmYjRlMiwgMHg3Yjg5NmYsIDB4MTY5NmIxLCAweGM3MTIzNSxcbiAgICAgICAgMHg2OTI2OTQsIDB4ZjE0YWQyLCAweDRmMjVlMywgMHg4Y2Q1YjUsIDB4YWM5YzY1LCAweDJiMDI3NSwgMHhhNmU0ODMsIDB4NDFmYmQ0LCAweDExNTNiNSwgMHg2NmRmYWIsIDB4YjQzMjEwLCAweGZiMjEzZiwgMHhlZjBlZTQsIDB4YTg4ZmMyLCAweDBhYTcyNSxcbiAgICAgICAgMHgwMzgyNmYsIDB4MGU2ZTcwLCAweGQyMmZmYywgMHgyNmM5MjYsIDB4YzQyYWVkLCAweDk1YjNkZiwgMHhhZjYzZGUsIDB4NzdiMmE4LCAweGVkYWVlNiwgMHg4MjM1M2IsIDB4ZjEwMzY0LCAweDQyMzAwMSwgMHhmODk3OTEsIDB4NTRiZTMwLCAweGVmNTIxOCxcbiAgICAgICAgMHg2NWE5MTAsIDB4NzEyMDJhLCAweGJiZDFiOCwgMHhkMmQwYzgsIDB4NDFhYjUzLCAweDhlZWI5OSwgMHg5YjQ4YTgsIDB4Yzk1YTYzLCAweDQxOGFjYiwgMHg2M2UzNzMsIDB4YjJiOGEzLCAweGVmYjJmYywgMHgxNzJmNjAsIDB4ZjBhYjcyLCAweDY0MzllYyxcbiAgICAgICAgMHg2MzFlMjgsIDB4ODJiZGU5LCAweGM2NzkxNSwgMHg3MjUzMmIsIDB4MjY2MTljLCAweGMwYzIwNywgMHhlMGViMWUsIDB4NmVkMTc4LCAweDE3NmZiYSwgMHhjODk4YTYsIDB4ZjkwZGFlLCAweDFjNDcxYiwgMHgwNDdkODQsIDB4YzcyNDkzLCAweGM5YmViYyxcbiAgICAgICAgMHgxMDBkNGMsIDB4M2U0MmI2LCAweDY1N2UyYSwgMHhkNmZhZWMsIDB4NDc1ODE3LFxuICAgIF0sXG4gICAgLypcbiAgX2tleTpcbiAgWzB4NDI4YTJmOTgsIDB4ZDcyOGFlMjIsIDB4NzEzNzQ0OTEsIDB4MjNlZjY1Y2QsIDB4YjVjMGZiY2YsIDB4ZWM0ZDNiMmYsIDB4ZTliNWRiYTUsIDB4ODE4OWRiYmMsXG4gICAweDM5NTZjMjViLCAweGYzNDhiNTM4LCAweDU5ZjExMWYxLCAweGI2MDVkMDE5LCAweDkyM2Y4MmE0LCAweGFmMTk0ZjliLCAweGFiMWM1ZWQ1LCAweGRhNmQ4MTE4LFxuICAgMHhkODA3YWE5OCwgMHhhMzAzMDI0MiwgMHgxMjgzNWIwMSwgMHg0NTcwNmZiZSwgMHgyNDMxODViZSwgMHg0ZWU0YjI4YywgMHg1NTBjN2RjMywgMHhkNWZmYjRlMixcbiAgIDB4NzJiZTVkNzQsIDB4ZjI3Yjg5NmYsIDB4ODBkZWIxZmUsIDB4M2IxNjk2YjEsIDB4OWJkYzA2YTcsIDB4MjVjNzEyMzUsIDB4YzE5YmYxNzQsIDB4Y2Y2OTI2OTQsXG4gICAweGU0OWI2OWMxLCAweDllZjE0YWQyLCAweGVmYmU0Nzg2LCAweDM4NGYyNWUzLCAweDBmYzE5ZGM2LCAweDhiOGNkNWI1LCAweDI0MGNhMWNjLCAweDc3YWM5YzY1LFxuICAgMHgyZGU5MmM2ZiwgMHg1OTJiMDI3NSwgMHg0YTc0ODRhYSwgMHg2ZWE2ZTQ4MywgMHg1Y2IwYTlkYywgMHhiZDQxZmJkNCwgMHg3NmY5ODhkYSwgMHg4MzExNTNiNSxcbiAgIDB4OTgzZTUxNTIsIDB4ZWU2NmRmYWIsIDB4YTgzMWM2NmQsIDB4MmRiNDMyMTAsIDB4YjAwMzI3YzgsIDB4OThmYjIxM2YsIDB4YmY1OTdmYzcsIDB4YmVlZjBlZTQsXG4gICAweGM2ZTAwYmYzLCAweDNkYTg4ZmMyLCAweGQ1YTc5MTQ3LCAweDkzMGFhNzI1LCAweDA2Y2E2MzUxLCAweGUwMDM4MjZmLCAweDE0MjkyOTY3LCAweDBhMGU2ZTcwLFxuICAgMHgyN2I3MGE4NSwgMHg0NmQyMmZmYywgMHgyZTFiMjEzOCwgMHg1YzI2YzkyNiwgMHg0ZDJjNmRmYywgMHg1YWM0MmFlZCwgMHg1MzM4MGQxMywgMHg5ZDk1YjNkZixcbiAgIDB4NjUwYTczNTQsIDB4OGJhZjYzZGUsIDB4NzY2YTBhYmIsIDB4M2M3N2IyYTgsIDB4ODFjMmM5MmUsIDB4NDdlZGFlZTYsIDB4OTI3MjJjODUsIDB4MTQ4MjM1M2IsXG4gICAweGEyYmZlOGExLCAweDRjZjEwMzY0LCAweGE4MWE2NjRiLCAweGJjNDIzMDAxLCAweGMyNGI4YjcwLCAweGQwZjg5NzkxLCAweGM3NmM1MWEzLCAweDA2NTRiZTMwLFxuICAgMHhkMTkyZTgxOSwgMHhkNmVmNTIxOCwgMHhkNjk5MDYyNCwgMHg1NTY1YTkxMCwgMHhmNDBlMzU4NSwgMHg1NzcxMjAyYSwgMHgxMDZhYTA3MCwgMHgzMmJiZDFiOCxcbiAgIDB4MTlhNGMxMTYsIDB4YjhkMmQwYzgsIDB4MWUzNzZjMDgsIDB4NTE0MWFiNTMsIDB4Mjc0ODc3NGMsIDB4ZGY4ZWViOTksIDB4MzRiMGJjYjUsIDB4ZTE5YjQ4YTgsXG4gICAweDM5MWMwY2IzLCAweGM1Yzk1YTYzLCAweDRlZDhhYTRhLCAweGUzNDE4YWNiLCAweDViOWNjYTRmLCAweDc3NjNlMzczLCAweDY4MmU2ZmYzLCAweGQ2YjJiOGEzLFxuICAgMHg3NDhmODJlZSwgMHg1ZGVmYjJmYywgMHg3OGE1NjM2ZiwgMHg0MzE3MmY2MCwgMHg4NGM4NzgxNCwgMHhhMWYwYWI3MiwgMHg4Y2M3MDIwOCwgMHgxYTY0MzllYyxcbiAgIDB4OTBiZWZmZmEsIDB4MjM2MzFlMjgsIDB4YTQ1MDZjZWIsIDB4ZGU4MmJkZTksIDB4YmVmOWEzZjcsIDB4YjJjNjc5MTUsIDB4YzY3MTc4ZjIsIDB4ZTM3MjUzMmIsXG4gICAweGNhMjczZWNlLCAweGVhMjY2MTljLCAweGQxODZiOGM3LCAweDIxYzBjMjA3LCAweGVhZGE3ZGQ2LCAweGNkZTBlYjFlLCAweGY1N2Q0ZjdmLCAweGVlNmVkMTc4LFxuICAgMHgwNmYwNjdhYSwgMHg3MjE3NmZiYSwgMHgwYTYzN2RjNSwgMHhhMmM4OThhNiwgMHgxMTNmOTgwNCwgMHhiZWY5MGRhZSwgMHgxYjcxMGIzNSwgMHgxMzFjNDcxYixcbiAgIDB4MjhkYjc3ZjUsIDB4MjMwNDdkODQsIDB4MzJjYWFiN2IsIDB4NDBjNzI0OTMsIDB4M2M5ZWJlMGEsIDB4MTVjOWJlYmMsIDB4NDMxZDY3YzQsIDB4OWMxMDBkNGMsXG4gICAweDRjYzVkNGJlLCAweGNiM2U0MmI2LCAweDU5N2YyOTljLCAweGZjNjU3ZTJhLCAweDVmY2I2ZmFiLCAweDNhZDZmYWVjLCAweDZjNDQxOThjLCAweDRhNDc1ODE3XSxcbiAgKi9cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBwcmVjb21wdXRlIF9pbml0IGFuZCBfa2V5LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3ByZWNvbXB1dGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gWFhYOiBUaGlzIGNvZGUgaXMgZm9yIHByZWNvbXB1dGluZyB0aGUgU0hBMjU2IGNvbnN0YW50cywgY2hhbmdlIGZvclxuICAgICAgICAvLyAgICAgIFNIQTUxMiBhbmQgcmUtZW5hYmxlLlxuICAgICAgICB2YXIgaSA9IDAsIHByaW1lID0gMiwgZmFjdG9yLCBpc1ByaW1lO1xuICAgICAgICBmdW5jdGlvbiBmcmFjKHgpIHtcbiAgICAgICAgICAgIHJldHVybiAoKHggLSBNYXRoLmZsb29yKHgpKSAqIDB4MTAwMDAwMDAwKSB8IDA7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gZnJhYzIoeCkge1xuICAgICAgICAgICAgcmV0dXJuICgoeCAtIE1hdGguZmxvb3IoeCkpICogMHgxMDAwMDAwMDAwMCkgJiAweGZmO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoOyBpIDwgODA7IHByaW1lKyspIHtcbiAgICAgICAgICAgIGlzUHJpbWUgPSB0cnVlO1xuICAgICAgICAgICAgZm9yIChmYWN0b3IgPSAyOyBmYWN0b3IgKiBmYWN0b3IgPD0gcHJpbWU7IGZhY3RvcisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByaW1lICUgZmFjdG9yID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUHJpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzUHJpbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA8IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdFtpICogMl0gPSBmcmFjKE1hdGgucG93KHByaW1lLCAxIC8gMikpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0W2kgKiAyICsgMV0gPSAoZnJhYzIoTWF0aC5wb3cocHJpbWUsIDEgLyAyKSkgPDwgMjQpIHwgdGhpcy5faW5pdHJbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2tleVtpICogMl0gPSBmcmFjKE1hdGgucG93KHByaW1lLCAxIC8gMykpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2tleVtpICogMiArIDFdID0gKGZyYWMyKE1hdGgucG93KHByaW1lLCAxIC8gMykpIDw8IDI0KSB8IHRoaXMuX2tleXJbaV07XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIG9uZSBjeWNsZSBvZiBTSEEtNTEyLlxuICAgICAqIEBwYXJhbSB7VWludDMyQXJyYXl8Yml0QXJyYXl9IHdvcmRzIG9uZSBibG9jayBvZiB3b3Jkcy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ibG9jazogZnVuY3Rpb24gKHdvcmRzKSB7XG4gICAgICAgIHZhciBpLCB3cmgsIHdybCwgaCA9IHRoaXMuX2gsIGsgPSB0aGlzLl9rZXksIGgwaCA9IGhbMF0sIGgwbCA9IGhbMV0sIGgxaCA9IGhbMl0sIGgxbCA9IGhbM10sIGgyaCA9IGhbNF0sIGgybCA9IGhbNV0sIGgzaCA9IGhbNl0sIGgzbCA9IGhbN10sIGg0aCA9IGhbOF0sIGg0bCA9IGhbOV0sIGg1aCA9IGhbMTBdLCBoNWwgPSBoWzExXSwgaDZoID0gaFsxMl0sIGg2bCA9IGhbMTNdLCBoN2ggPSBoWzE0XSwgaDdsID0gaFsxNV07XG4gICAgICAgIHZhciB3O1xuICAgICAgICBpZiAodHlwZW9mIFVpbnQzMkFycmF5ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdvcmRzIGlzIHBhc3NlZCB0byBfYmxvY2ssIGl0IGhhcyAzMiBlbGVtZW50cy4gU0hBNTEyIF9ibG9ja1xuICAgICAgICAgICAgLy8gZnVuY3Rpb24gZXh0ZW5kcyB3b3JkcyB3aXRoIG5ldyBlbGVtZW50cyAoYXQgdGhlIGVuZCB0aGVyZSBhcmUgMTYwIGVsZW1lbnRzKS5cbiAgICAgICAgICAgIC8vIFRoZSBwcm9ibGVtIGlzIHRoYXQgaWYgd2UgdXNlIFVpbnQzMkFycmF5IGluc3RlYWQgb2YgQXJyYXksXG4gICAgICAgICAgICAvLyB0aGUgbGVuZ3RoIG9mIFVpbnQzMkFycmF5IGNhbm5vdCBiZSBjaGFuZ2VkLiBUaHVzLCB3ZSByZXBsYWNlIHdvcmRzIHdpdGggYVxuICAgICAgICAgICAgLy8gbm9ybWFsIEFycmF5IGhlcmUuXG4gICAgICAgICAgICB3ID0gQXJyYXkoMTYwKTsgLy8gZG8gbm90IHVzZSBVaW50MzJBcnJheSBoZXJlIGFzIHRoZSBpbnN0YW50aWF0aW9uIGlzIHNsb3dlclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzMjsgaisrKSB7XG4gICAgICAgICAgICAgICAgd1tqXSA9IHdvcmRzW2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdyA9IHdvcmRzO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdvcmtpbmcgdmFyaWFibGVzXG4gICAgICAgIHZhciBhaCA9IGgwaCwgYWwgPSBoMGwsIGJoID0gaDFoLCBibCA9IGgxbCwgY2ggPSBoMmgsIGNsID0gaDJsLCBkaCA9IGgzaCwgZGwgPSBoM2wsIGVoID0gaDRoLCBlbCA9IGg0bCwgZmggPSBoNWgsIGZsID0gaDVsLCBnaCA9IGg2aCwgZ2wgPSBoNmwsIGhoID0gaDdoLCBobCA9IGg3bDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDgwOyBpKyspIHtcbiAgICAgICAgICAgIC8vIGxvYWQgdXAgdGhlIGlucHV0IHdvcmQgZm9yIHRoaXMgcm91bmRcbiAgICAgICAgICAgIGlmIChpIDwgMTYpIHtcbiAgICAgICAgICAgICAgICB3cmggPSB3W2kgKiAyXTtcbiAgICAgICAgICAgICAgICB3cmwgPSB3W2kgKiAyICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBHYW1tYTBcbiAgICAgICAgICAgICAgICB2YXIgZ2FtbWEweGggPSB3WyhpIC0gMTUpICogMl07XG4gICAgICAgICAgICAgICAgdmFyIGdhbW1hMHhsID0gd1soaSAtIDE1KSAqIDIgKyAxXTtcbiAgICAgICAgICAgICAgICB2YXIgZ2FtbWEwaCA9ICgoZ2FtbWEweGwgPDwgMzEpIHwgKGdhbW1hMHhoID4+PiAxKSkgXiAoKGdhbW1hMHhsIDw8IDI0KSB8IChnYW1tYTB4aCA+Pj4gOCkpIF4gKGdhbW1hMHhoID4+PiA3KTtcbiAgICAgICAgICAgICAgICB2YXIgZ2FtbWEwbCA9ICgoZ2FtbWEweGggPDwgMzEpIHwgKGdhbW1hMHhsID4+PiAxKSkgXiAoKGdhbW1hMHhoIDw8IDI0KSB8IChnYW1tYTB4bCA+Pj4gOCkpIF4gKChnYW1tYTB4aCA8PCAyNSkgfCAoZ2FtbWEweGwgPj4+IDcpKTtcbiAgICAgICAgICAgICAgICAvLyBHYW1tYTFcbiAgICAgICAgICAgICAgICB2YXIgZ2FtbWExeGggPSB3WyhpIC0gMikgKiAyXTtcbiAgICAgICAgICAgICAgICB2YXIgZ2FtbWExeGwgPSB3WyhpIC0gMikgKiAyICsgMV07XG4gICAgICAgICAgICAgICAgdmFyIGdhbW1hMWggPSAoKGdhbW1hMXhsIDw8IDEzKSB8IChnYW1tYTF4aCA+Pj4gMTkpKSBeICgoZ2FtbWExeGggPDwgMykgfCAoZ2FtbWExeGwgPj4+IDI5KSkgXiAoZ2FtbWExeGggPj4+IDYpO1xuICAgICAgICAgICAgICAgIHZhciBnYW1tYTFsID0gKChnYW1tYTF4aCA8PCAxMykgfCAoZ2FtbWExeGwgPj4+IDE5KSkgXiAoKGdhbW1hMXhsIDw8IDMpIHwgKGdhbW1hMXhoID4+PiAyOSkpIF4gKChnYW1tYTF4aCA8PCAyNikgfCAoZ2FtbWExeGwgPj4+IDYpKTtcbiAgICAgICAgICAgICAgICAvLyBTaG9ydGN1dHNcbiAgICAgICAgICAgICAgICB2YXIgd3I3aCA9IHdbKGkgLSA3KSAqIDJdO1xuICAgICAgICAgICAgICAgIHZhciB3cjdsID0gd1soaSAtIDcpICogMiArIDFdO1xuICAgICAgICAgICAgICAgIHZhciB3cjE2aCA9IHdbKGkgLSAxNikgKiAyXTtcbiAgICAgICAgICAgICAgICB2YXIgd3IxNmwgPSB3WyhpIC0gMTYpICogMiArIDFdO1xuICAgICAgICAgICAgICAgIC8vIFcocm91bmQpID0gZ2FtbWEwICsgVyhyb3VuZCAtIDcpICsgZ2FtbWExICsgVyhyb3VuZCAtIDE2KVxuICAgICAgICAgICAgICAgIHdybCA9IGdhbW1hMGwgKyB3cjdsO1xuICAgICAgICAgICAgICAgIHdyaCA9IGdhbW1hMGggKyB3cjdoICsgKHdybCA+Pj4gMCA8IGdhbW1hMGwgPj4+IDAgPyAxIDogMCk7XG4gICAgICAgICAgICAgICAgd3JsICs9IGdhbW1hMWw7XG4gICAgICAgICAgICAgICAgd3JoICs9IGdhbW1hMWggKyAod3JsID4+PiAwIDwgZ2FtbWExbCA+Pj4gMCA/IDEgOiAwKTtcbiAgICAgICAgICAgICAgICB3cmwgKz0gd3IxNmw7XG4gICAgICAgICAgICAgICAgd3JoICs9IHdyMTZoICsgKHdybCA+Pj4gMCA8IHdyMTZsID4+PiAwID8gMSA6IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd1tpICogMl0gPSB3cmggfD0gMDtcbiAgICAgICAgICAgIHdbaSAqIDIgKyAxXSA9IHdybCB8PSAwO1xuICAgICAgICAgICAgLy8gQ2hcbiAgICAgICAgICAgIHZhciBjaGggPSAoZWggJiBmaCkgXiAofmVoICYgZ2gpO1xuICAgICAgICAgICAgdmFyIGNobCA9IChlbCAmIGZsKSBeICh+ZWwgJiBnbCk7XG4gICAgICAgICAgICAvLyBNYWpcbiAgICAgICAgICAgIHZhciBtYWpoID0gKGFoICYgYmgpIF4gKGFoICYgY2gpIF4gKGJoICYgY2gpO1xuICAgICAgICAgICAgdmFyIG1hamwgPSAoYWwgJiBibCkgXiAoYWwgJiBjbCkgXiAoYmwgJiBjbCk7XG4gICAgICAgICAgICAvLyBTaWdtYTBcbiAgICAgICAgICAgIHZhciBzaWdtYTBoID0gKChhbCA8PCA0KSB8IChhaCA+Pj4gMjgpKSBeICgoYWggPDwgMzApIHwgKGFsID4+PiAyKSkgXiAoKGFoIDw8IDI1KSB8IChhbCA+Pj4gNykpO1xuICAgICAgICAgICAgdmFyIHNpZ21hMGwgPSAoKGFoIDw8IDQpIHwgKGFsID4+PiAyOCkpIF4gKChhbCA8PCAzMCkgfCAoYWggPj4+IDIpKSBeICgoYWwgPDwgMjUpIHwgKGFoID4+PiA3KSk7XG4gICAgICAgICAgICAvLyBTaWdtYTFcbiAgICAgICAgICAgIHZhciBzaWdtYTFoID0gKChlbCA8PCAxOCkgfCAoZWggPj4+IDE0KSkgXiAoKGVsIDw8IDE0KSB8IChlaCA+Pj4gMTgpKSBeICgoZWggPDwgMjMpIHwgKGVsID4+PiA5KSk7XG4gICAgICAgICAgICB2YXIgc2lnbWExbCA9ICgoZWggPDwgMTgpIHwgKGVsID4+PiAxNCkpIF4gKChlaCA8PCAxNCkgfCAoZWwgPj4+IDE4KSkgXiAoKGVsIDw8IDIzKSB8IChlaCA+Pj4gOSkpO1xuICAgICAgICAgICAgLy8gSyhyb3VuZClcbiAgICAgICAgICAgIHZhciBrcmggPSBrW2kgKiAyXTtcbiAgICAgICAgICAgIHZhciBrcmwgPSBrW2kgKiAyICsgMV07XG4gICAgICAgICAgICAvLyB0MSA9IGggKyBzaWdtYTEgKyBjaCArIEsocm91bmQpICsgVyhyb3VuZClcbiAgICAgICAgICAgIHZhciB0MWwgPSBobCArIHNpZ21hMWw7XG4gICAgICAgICAgICB2YXIgdDFoID0gaGggKyBzaWdtYTFoICsgKHQxbCA+Pj4gMCA8IGhsID4+PiAwID8gMSA6IDApO1xuICAgICAgICAgICAgdDFsICs9IGNobDtcbiAgICAgICAgICAgIHQxaCArPSBjaGggKyAodDFsID4+PiAwIDwgY2hsID4+PiAwID8gMSA6IDApO1xuICAgICAgICAgICAgdDFsICs9IGtybDtcbiAgICAgICAgICAgIHQxaCArPSBrcmggKyAodDFsID4+PiAwIDwga3JsID4+PiAwID8gMSA6IDApO1xuICAgICAgICAgICAgdDFsID0gKHQxbCArIHdybCkgfCAwOyAvLyBGRjMyLi5GRjM0IHBlcmYgaXNzdWUgaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTA1NDk3MlxuICAgICAgICAgICAgdDFoICs9IHdyaCArICh0MWwgPj4+IDAgPCB3cmwgPj4+IDAgPyAxIDogMCk7XG4gICAgICAgICAgICAvLyB0MiA9IHNpZ21hMCArIG1halxuICAgICAgICAgICAgdmFyIHQybCA9IHNpZ21hMGwgKyBtYWpsO1xuICAgICAgICAgICAgdmFyIHQyaCA9IHNpZ21hMGggKyBtYWpoICsgKHQybCA+Pj4gMCA8IHNpZ21hMGwgPj4+IDAgPyAxIDogMCk7XG4gICAgICAgICAgICAvLyBVcGRhdGUgd29ya2luZyB2YXJpYWJsZXNcbiAgICAgICAgICAgIGhoID0gZ2g7XG4gICAgICAgICAgICBobCA9IGdsO1xuICAgICAgICAgICAgZ2ggPSBmaDtcbiAgICAgICAgICAgIGdsID0gZmw7XG4gICAgICAgICAgICBmaCA9IGVoO1xuICAgICAgICAgICAgZmwgPSBlbDtcbiAgICAgICAgICAgIGVsID0gKGRsICsgdDFsKSB8IDA7XG4gICAgICAgICAgICBlaCA9IChkaCArIHQxaCArIChlbCA+Pj4gMCA8IGRsID4+PiAwID8gMSA6IDApKSB8IDA7XG4gICAgICAgICAgICBkaCA9IGNoO1xuICAgICAgICAgICAgZGwgPSBjbDtcbiAgICAgICAgICAgIGNoID0gYmg7XG4gICAgICAgICAgICBjbCA9IGJsO1xuICAgICAgICAgICAgYmggPSBhaDtcbiAgICAgICAgICAgIGJsID0gYWw7XG4gICAgICAgICAgICBhbCA9ICh0MWwgKyB0MmwpIHwgMDtcbiAgICAgICAgICAgIGFoID0gKHQxaCArIHQyaCArIChhbCA+Pj4gMCA8IHQxbCA+Pj4gMCA/IDEgOiAwKSkgfCAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIEludGVybWVkaWF0ZSBoYXNoXG4gICAgICAgIGgwbCA9IGhbMV0gPSAoaDBsICsgYWwpIHwgMDtcbiAgICAgICAgaFswXSA9IChoMGggKyBhaCArIChoMGwgPj4+IDAgPCBhbCA+Pj4gMCA/IDEgOiAwKSkgfCAwO1xuICAgICAgICBoMWwgPSBoWzNdID0gKGgxbCArIGJsKSB8IDA7XG4gICAgICAgIGhbMl0gPSAoaDFoICsgYmggKyAoaDFsID4+PiAwIDwgYmwgPj4+IDAgPyAxIDogMCkpIHwgMDtcbiAgICAgICAgaDJsID0gaFs1XSA9IChoMmwgKyBjbCkgfCAwO1xuICAgICAgICBoWzRdID0gKGgyaCArIGNoICsgKGgybCA+Pj4gMCA8IGNsID4+PiAwID8gMSA6IDApKSB8IDA7XG4gICAgICAgIGgzbCA9IGhbN10gPSAoaDNsICsgZGwpIHwgMDtcbiAgICAgICAgaFs2XSA9IChoM2ggKyBkaCArIChoM2wgPj4+IDAgPCBkbCA+Pj4gMCA/IDEgOiAwKSkgfCAwO1xuICAgICAgICBoNGwgPSBoWzldID0gKGg0bCArIGVsKSB8IDA7XG4gICAgICAgIGhbOF0gPSAoaDRoICsgZWggKyAoaDRsID4+PiAwIDwgZWwgPj4+IDAgPyAxIDogMCkpIHwgMDtcbiAgICAgICAgaDVsID0gaFsxMV0gPSAoaDVsICsgZmwpIHwgMDtcbiAgICAgICAgaFsxMF0gPSAoaDVoICsgZmggKyAoaDVsID4+PiAwIDwgZmwgPj4+IDAgPyAxIDogMCkpIHwgMDtcbiAgICAgICAgaDZsID0gaFsxM10gPSAoaDZsICsgZ2wpIHwgMDtcbiAgICAgICAgaFsxMl0gPSAoaDZoICsgZ2ggKyAoaDZsID4+PiAwIDwgZ2wgPj4+IDAgPyAxIDogMCkpIHwgMDtcbiAgICAgICAgaDdsID0gaFsxNV0gPSAoaDdsICsgaGwpIHwgMDtcbiAgICAgICAgaFsxNF0gPSAoaDdoICsgaGggKyAoaDdsID4+PiAwIDwgaGwgPj4+IDAgPyAxIDogMCkpIHwgMDtcbiAgICB9LFxufTtcbi8qKiBAZmlsZU92ZXJ2aWV3IEphdmFzY3JpcHQgU0hBLTEgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQmFzZWQgb24gdGhlIGltcGxlbWVudGF0aW9uIGluIFJGQyAzMTc0LCBtZXRob2QgMSwgYW5kIG9uIHRoZSBTSkNMXG4gKiBTSEEtMjU2IGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBhdXRob3IgUXVpbm4gU2xhY2tcbiAqL1xuLyoqXG4gKiBDb250ZXh0IGZvciBhIFNIQS0xIG9wZXJhdGlvbiBpbiBwcm9ncmVzcy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5zamNsLmhhc2guc2hhMSA9IGZ1bmN0aW9uIChoYXNoKSB7XG4gICAgaWYgKGhhc2gpIHtcbiAgICAgICAgdGhpcy5faCA9IGhhc2guX2guc2xpY2UoMCk7XG4gICAgICAgIHRoaXMuX2J1ZmZlciA9IGhhc2guX2J1ZmZlci5zbGljZSgwKTtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gaGFzaC5fbGVuZ3RoO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cbn07XG4vKipcbiAqIEhhc2ggYSBzdHJpbmcgb3IgYW4gYXJyYXkgb2Ygd29yZHMuXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0ge2JpdEFycmF5fFN0cmluZ30gZGF0YSB0aGUgZGF0YSB0byBoYXNoLlxuICogQHJldHVybiB7Yml0QXJyYXl9IFRoZSBoYXNoIHZhbHVlLCBhbiBhcnJheSBvZiA1IGJpZy1lbmRpYW4gd29yZHMuXG4gKi9cbnNqY2wuaGFzaC5zaGExLmhhc2ggPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiBuZXcgc2pjbC5oYXNoLnNoYTEoKS51cGRhdGUoZGF0YSkuZmluYWxpemUoKTtcbn07XG5zamNsLmhhc2guc2hhMS5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogVGhlIGhhc2gncyBibG9jayBzaXplLCBpbiBiaXRzLlxuICAgICAqIEBjb25zdGFudFxuICAgICAqL1xuICAgIGJsb2NrU2l6ZTogNTEyLFxuICAgIC8qKlxuICAgICAqIFJlc2V0IHRoZSBoYXNoIHN0YXRlLlxuICAgICAqIEByZXR1cm4gdGhpc1xuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2ggPSB0aGlzLl9pbml0LnNsaWNlKDApO1xuICAgICAgICB0aGlzLl9idWZmZXIgPSBbXTtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbnB1dCBzZXZlcmFsIHdvcmRzIHRvIHRoZSBoYXNoLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl8U3RyaW5nfSBkYXRhIHRoZSBkYXRhIHRvIGhhc2guXG4gICAgICogQHJldHVybiB0aGlzXG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGRhdGEgPSBzamNsLmNvZGVjLnV0ZjhTdHJpbmcudG9CaXRzKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpLCBiID0gKHRoaXMuX2J1ZmZlciA9IHNqY2wuYml0QXJyYXkuY29uY2F0KHRoaXMuX2J1ZmZlciwgZGF0YSkpLCBvbCA9IHRoaXMuX2xlbmd0aCwgbmwgPSAodGhpcy5fbGVuZ3RoID0gb2wgKyBzamNsLmJpdEFycmF5LmJpdExlbmd0aChkYXRhKSk7XG4gICAgICAgIGlmIChubCA+IDkwMDcxOTkyNTQ3NDA5OTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwiQ2Fubm90IGhhc2ggbW9yZSB0aGFuIDJeNTMgLSAxIGJpdHNcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBVaW50MzJBcnJheSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdmFyIGMgPSBuZXcgVWludDMyQXJyYXkoYik7XG4gICAgICAgICAgICB2YXIgaiA9IDA7XG4gICAgICAgICAgICBmb3IgKGkgPSB0aGlzLmJsb2NrU2l6ZSArIG9sIC0gKCh0aGlzLmJsb2NrU2l6ZSArIG9sKSAmICh0aGlzLmJsb2NrU2l6ZSAtIDEpKTsgaSA8PSBubDsgaSArPSB0aGlzLmJsb2NrU2l6ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Jsb2NrKGMuc3ViYXJyYXkoMTYgKiBqLCAxNiAqIChqICsgMSkpKTtcbiAgICAgICAgICAgICAgICBqICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiLnNwbGljZSgwLCAxNiAqIGopO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChpID0gdGhpcy5ibG9ja1NpemUgKyBvbCAtICgodGhpcy5ibG9ja1NpemUgKyBvbCkgJiAodGhpcy5ibG9ja1NpemUgLSAxKSk7IGkgPD0gbmw7IGkgKz0gdGhpcy5ibG9ja1NpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ibG9jayhiLnNwbGljZSgwLCAxNikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ29tcGxldGUgaGFzaGluZyBhbmQgb3V0cHV0IHRoZSBoYXNoIHZhbHVlLlxuICAgICAqIEByZXR1cm4ge2JpdEFycmF5fSBUaGUgaGFzaCB2YWx1ZSwgYW4gYXJyYXkgb2YgNSBiaWctZW5kaWFuIHdvcmRzLiBUT0RPXG4gICAgICovXG4gICAgZmluYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGksIGIgPSB0aGlzLl9idWZmZXIsIGggPSB0aGlzLl9oO1xuICAgICAgICAvLyBSb3VuZCBvdXQgYW5kIHB1c2ggdGhlIGJ1ZmZlclxuICAgICAgICBiID0gc2pjbC5iaXRBcnJheS5jb25jYXQoYiwgW3NqY2wuYml0QXJyYXkucGFydGlhbCgxLCAxKV0pO1xuICAgICAgICAvLyBSb3VuZCBvdXQgdGhlIGJ1ZmZlciB0byBhIG11bHRpcGxlIG9mIDE2IHdvcmRzLCBsZXNzIHRoZSAyIGxlbmd0aCB3b3Jkcy5cbiAgICAgICAgZm9yIChpID0gYi5sZW5ndGggKyAyOyBpICYgMTU7IGkrKykge1xuICAgICAgICAgICAgYi5wdXNoKDApO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFwcGVuZCB0aGUgbGVuZ3RoXG4gICAgICAgIGIucHVzaChNYXRoLmZsb29yKHRoaXMuX2xlbmd0aCAvIDB4MTAwMDAwMDAwKSk7XG4gICAgICAgIGIucHVzaCh0aGlzLl9sZW5ndGggfCAwKTtcbiAgICAgICAgd2hpbGUgKGIubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9ibG9jayhiLnNwbGljZSgwLCAxNikpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgcmV0dXJuIGg7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgU0hBLTEgaW5pdGlhbGl6YXRpb24gdmVjdG9yLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQ6IFsweDY3NDUyMzAxLCAweGVmY2RhYjg5LCAweDk4YmFkY2ZlLCAweDEwMzI1NDc2LCAweGMzZDJlMWYwXSxcbiAgICAvKipcbiAgICAgKiBUaGUgU0hBLTEgaGFzaCBrZXkuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfa2V5OiBbMHg1YTgyNzk5OSwgMHg2ZWQ5ZWJhMSwgMHg4ZjFiYmNkYywgMHhjYTYyYzFkNl0sXG4gICAgLyoqXG4gICAgICogVGhlIFNIQS0xIGxvZ2ljYWwgZnVuY3Rpb25zIGYoMCksIGYoMSksIC4uLiwgZig3OSkuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZjogZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcbiAgICAgICAgaWYgKHQgPD0gMTkpIHtcbiAgICAgICAgICAgIHJldHVybiAoYiAmIGMpIHwgKH5iICYgZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodCA8PSAzOSkge1xuICAgICAgICAgICAgcmV0dXJuIGIgXiBjIF4gZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0IDw9IDU5KSB7XG4gICAgICAgICAgICByZXR1cm4gKGIgJiBjKSB8IChiICYgZCkgfCAoYyAmIGQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHQgPD0gNzkpIHtcbiAgICAgICAgICAgIHJldHVybiBiIF4gYyBeIGQ7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENpcmN1bGFyIGxlZnQtc2hpZnQgb3BlcmF0b3IuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfUzogZnVuY3Rpb24gKG4sIHgpIHtcbiAgICAgICAgcmV0dXJuICh4IDw8IG4pIHwgKHggPj4+ICgzMiAtIG4pKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gb25lIGN5Y2xlIG9mIFNIQS0xLlxuICAgICAqIEBwYXJhbSB7VWludDMyQXJyYXl8Yml0QXJyYXl9IHdvcmRzIG9uZSBibG9jayBvZiB3b3Jkcy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ibG9jazogZnVuY3Rpb24gKHdvcmRzKSB7XG4gICAgICAgIHZhciB0LCB0bXAsIGEsIGIsIGMsIGQsIGUsIGggPSB0aGlzLl9oO1xuICAgICAgICB2YXIgdztcbiAgICAgICAgaWYgKHR5cGVvZiBVaW50MzJBcnJheSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgLy8gV2hlbiB3b3JkcyBpcyBwYXNzZWQgdG8gX2Jsb2NrLCBpdCBoYXMgMTYgZWxlbWVudHMuIFNIQTEgX2Jsb2NrXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBleHRlbmRzIHdvcmRzIHdpdGggbmV3IGVsZW1lbnRzIChhdCB0aGUgZW5kIHRoZXJlIGFyZSA4MCBlbGVtZW50cykuXG4gICAgICAgICAgICAvLyBUaGUgcHJvYmxlbSBpcyB0aGF0IGlmIHdlIHVzZSBVaW50MzJBcnJheSBpbnN0ZWFkIG9mIEFycmF5LFxuICAgICAgICAgICAgLy8gdGhlIGxlbmd0aCBvZiBVaW50MzJBcnJheSBjYW5ub3QgYmUgY2hhbmdlZC4gVGh1cywgd2UgcmVwbGFjZSB3b3JkcyB3aXRoIGFcbiAgICAgICAgICAgIC8vIG5vcm1hbCBBcnJheSBoZXJlLlxuICAgICAgICAgICAgdyA9IEFycmF5KDgwKTsgLy8gZG8gbm90IHVzZSBVaW50MzJBcnJheSBoZXJlIGFzIHRoZSBpbnN0YW50aWF0aW9uIGlzIHNsb3dlclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAxNjsgaisrKSB7XG4gICAgICAgICAgICAgICAgd1tqXSA9IHdvcmRzW2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdyA9IHdvcmRzO1xuICAgICAgICB9XG4gICAgICAgIGEgPSBoWzBdO1xuICAgICAgICBiID0gaFsxXTtcbiAgICAgICAgYyA9IGhbMl07XG4gICAgICAgIGQgPSBoWzNdO1xuICAgICAgICBlID0gaFs0XTtcbiAgICAgICAgZm9yICh0ID0gMDsgdCA8PSA3OTsgdCsrKSB7XG4gICAgICAgICAgICBpZiAodCA+PSAxNikge1xuICAgICAgICAgICAgICAgIHdbdF0gPSB0aGlzLl9TKDEsIHdbdCAtIDNdIF4gd1t0IC0gOF0gXiB3W3QgLSAxNF0gXiB3W3QgLSAxNl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG1wID0gKHRoaXMuX1MoNSwgYSkgKyB0aGlzLl9mKHQsIGIsIGMsIGQpICsgZSArIHdbdF0gKyB0aGlzLl9rZXlbTWF0aC5mbG9vcih0IC8gMjApXSkgfCAwO1xuICAgICAgICAgICAgZSA9IGQ7XG4gICAgICAgICAgICBkID0gYztcbiAgICAgICAgICAgIGMgPSB0aGlzLl9TKDMwLCBiKTtcbiAgICAgICAgICAgIGIgPSBhO1xuICAgICAgICAgICAgYSA9IHRtcDtcbiAgICAgICAgfVxuICAgICAgICBoWzBdID0gKGhbMF0gKyBhKSB8IDA7XG4gICAgICAgIGhbMV0gPSAoaFsxXSArIGIpIHwgMDtcbiAgICAgICAgaFsyXSA9IChoWzJdICsgYykgfCAwO1xuICAgICAgICBoWzNdID0gKGhbM10gKyBkKSB8IDA7XG4gICAgICAgIGhbNF0gPSAoaFs0XSArIGUpIHwgMDtcbiAgICB9LFxufTtcbi8qKiBAZmlsZU92ZXJ2aWV3IENCQyBtb2RlIGltcGxlbWVudGF0aW9uXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cbi8qKlxuICogRGFuZ2Vyb3VzOiBDQkMgbW9kZSB3aXRoIFBLQ1MjNSBwYWRkaW5nLlxuICogQG5hbWVzcGFjZVxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cbnNqY2wubW9kZS5jYmMgPSB7XG4gICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBtb2RlLlxuICAgICAqIEBjb25zdGFudFxuICAgICAqL1xuICAgIG5hbWU6IFwiY2JjXCIsXG4gICAgLyoqIEVuY3J5cHQgaW4gQ0JDIG1vZGUgd2l0aCBQS0NTIzUgcGFkZGluZy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJwIFRoZSBibG9jayBjaXBoZXIuICBJdCBtdXN0IGhhdmUgYSBibG9jayBzaXplIG9mIDE2IGJ5dGVzLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IHBsYWludGV4dCBUaGUgcGxhaW50ZXh0IGRhdGEuXG4gICAgICogQHBhcmFtIHtiaXRBcnJheX0gaXYgVGhlIGluaXRpYWxpemF0aW9uIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IFthZGF0YT1bXV0gVGhlIGF1dGhlbnRpY2F0ZWQgZGF0YS4gIE11c3QgYmUgZW1wdHkuXG4gICAgICogQHBhcmFtIHtib29sZWFufSB1c2VQYWRkaW5nIFRydWUgaWYgcGFkZGluZyBzaGFsbCBiZSB1c2VkLCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICogQHJldHVybiBUaGUgZW5jcnlwdGVkIGRhdGEsIGFuIGFycmF5IG9mIGJ5dGVzLlxuICAgICAqIEB0aHJvd3Mge3NqY2wuZXhjZXB0aW9uLmludmFsaWR9IGlmIHRoZSBJViBpc24ndCBleGFjdGx5IDEyOCBiaXRzLCBvciBpZiBhbnkgYWRhdGEgaXMgc3BlY2lmaWVkLlxuICAgICAqL1xuICAgIGVuY3J5cHQ6IGZ1bmN0aW9uIChwcnAsIHBsYWludGV4dCwgaXYsIGFkYXRhLCB1c2VQYWRkaW5nKSB7XG4gICAgICAgIGlmIChhZGF0YSAmJiBhZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwiY2JjIGNhbid0IGF1dGhlbnRpY2F0ZSBkYXRhXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzamNsLmJpdEFycmF5LmJpdExlbmd0aChpdikgIT09IDEyOCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJjYmMgaXYgbXVzdCBiZSAxMjggYml0c1wiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaSwgdyA9IHNqY2wuYml0QXJyYXksIHhvciA9IHcuX3hvcjQsIGJsID0gdy5iaXRMZW5ndGgocGxhaW50ZXh0KSwgYnAgPSAwLCBvdXRwdXQgPSBbXTtcbiAgICAgICAgaWYgKGJsICYgNykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJwa2NzIzUgcGFkZGluZyBvbmx5IHdvcmtzIGZvciBtdWx0aXBsZXMgb2YgYSBieXRlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGJwICsgMTI4IDw9IGJsOyBpICs9IDQsIGJwICs9IDEyOCkge1xuICAgICAgICAgICAgLyogRW5jcnlwdCBhIG5vbi1maW5hbCBibG9jayAqL1xuICAgICAgICAgICAgaXYgPSBwcnAuZW5jcnlwdCh4b3IoaXYsIHBsYWludGV4dC5zbGljZShpLCBpICsgNCkpKTtcbiAgICAgICAgICAgIC8vIFRVVEFPOiByZXBsYWNlZCBzcGxpY2Ugd2l0aCBwdXNoIGJlY2F1c2Ugb2YgcGVyZm9ybWFuY2UgYnVnIGluIGNocm9taXVtXG4gICAgICAgICAgICAvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MTQzOTUmY2FuPTEmcT1zcGxpY2UmY29sc3BlYz1JRCUyMFByaSUyME0lMjBTdGFycyUyMFJlbGVhc2VCbG9jayUyMENvbXBvbmVudCUyMFN0YXR1cyUyME93bmVyJTIwU3VtbWFyeSUyME9TJTIwTW9kaWZpZWRcbiAgICAgICAgICAgIC8vb3V0cHV0LnNwbGljZShpLCAwLCBpdlswXSwgaXZbMV0sIGl2WzJdLCBpdlszXSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChpdlswXSwgaXZbMV0sIGl2WzJdLCBpdlszXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVzZVBhZGRpbmcpIHtcbiAgICAgICAgICAgIC8qIENvbnN0cnVjdCB0aGUgcGFkLiAqL1xuICAgICAgICAgICAgYmwgPSAoMTYgLSAoKGJsID4+IDMpICYgMTUpKSAqIDB4MTAxMDEwMTtcbiAgICAgICAgICAgIC8qIFBhZCBhbmQgZW5jcnlwdC4gKi9cbiAgICAgICAgICAgIGl2ID0gcHJwLmVuY3J5cHQoeG9yKGl2LCB3LmNvbmNhdChwbGFpbnRleHQsIFtibCwgYmwsIGJsLCBibF0pLnNsaWNlKGksIGkgKyA0KSkpO1xuICAgICAgICAgICAgLy8gVFVUQU86IHJlcGxhY2VkIHNwbGljZSB3aXRoIHB1c2ggYmVjYXVzZSBvZiBwZXJmb3JtYW5jZSBidWcgaW4gY2hyb21pdW1cbiAgICAgICAgICAgIC8vIG91dHB1dC5zcGxpY2UoaSwgMCwgaXZbMF0sIGl2WzFdLCBpdlsyXSwgaXZbM10pO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goaXZbMF0sIGl2WzFdLCBpdlsyXSwgaXZbM10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfSxcbiAgICAvKiogRGVjcnlwdCBpbiBDQkMgbW9kZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJwIFRoZSBibG9jayBjaXBoZXIuICBJdCBtdXN0IGhhdmUgYSBibG9jayBzaXplIG9mIDE2IGJ5dGVzLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGNpcGhlcnRleHQgVGhlIGNpcGhlcnRleHQgZGF0YS5cbiAgICAgKiBAcGFyYW0ge2JpdEFycmF5fSBpdiBUaGUgaW5pdGlhbGl6YXRpb24gdmFsdWUuXG4gICAgICogQHBhcmFtIHtiaXRBcnJheX0gW2FkYXRhPVtdXSBUaGUgYXV0aGVudGljYXRlZCBkYXRhLiAgSXQgbXVzdCBiZSBlbXB0eS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZVBhZGRpbmcgVHJ1ZSBpZiBwYWRkaW5nIHNoYWxsIGJlIHVzZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKiBAcmV0dXJuIFRoZSBkZWNyeXB0ZWQgZGF0YSwgYW4gYXJyYXkgb2YgYnl0ZXMuXG4gICAgICogQHRocm93cyB7c2pjbC5leGNlcHRpb24uaW52YWxpZH0gaWYgdGhlIElWIGlzbid0IGV4YWN0bHkgMTI4IGJpdHMsIG9yIGlmIGFueSBhZGF0YSBpcyBzcGVjaWZpZWQuXG4gICAgICogQHRocm93cyB7c2pjbC5leGNlcHRpb24uY29ycnVwdH0gaWYgaWYgdGhlIG1lc3NhZ2UgaXMgY29ycnVwdC5cbiAgICAgKi9cbiAgICBkZWNyeXB0OiBmdW5jdGlvbiAocHJwLCBjaXBoZXJ0ZXh0LCBpdiwgYWRhdGEsIHVzZVBhZGRpbmcpIHtcbiAgICAgICAgaWYgKGFkYXRhICYmIGFkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJjYmMgY2FuJ3QgYXV0aGVudGljYXRlIGRhdGFcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGl2KSAhPT0gMTI4KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcImNiYyBpdiBtdXN0IGJlIDEyOCBiaXRzXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzamNsLmJpdEFycmF5LmJpdExlbmd0aChjaXBoZXJ0ZXh0KSAmIDEyNyB8fCAhY2lwaGVydGV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5jb3JydXB0KFwiY2JjIGNpcGhlcnRleHQgbXVzdCBiZSBhIHBvc2l0aXZlIG11bHRpcGxlIG9mIHRoZSBibG9jayBzaXplXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpLCB3ID0gc2pjbC5iaXRBcnJheSwgeG9yID0gdy5feG9yNCwgYmksIGJvLCBvdXRwdXQgPSBbXTtcbiAgICAgICAgYWRhdGEgPSBhZGF0YSB8fCBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNpcGhlcnRleHQubGVuZ3RoOyBpICs9IDQpIHtcbiAgICAgICAgICAgIGJpID0gY2lwaGVydGV4dC5zbGljZShpLCBpICsgNCk7XG4gICAgICAgICAgICBibyA9IHhvcihpdiwgcHJwLmRlY3J5cHQoYmkpKTtcbiAgICAgICAgICAgIC8vIFRVVEFPOiByZXBsYWNlZCBzcGxpY2Ugd2l0aCBwdXNoIGJlY2F1c2Ugb2YgcGVyZm9ybWFuY2UgYnVnIGluIGNocm9taXVtXG4gICAgICAgICAgICAvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MTQzOTUmY2FuPTEmcT1zcGxpY2UmY29sc3BlYz1JRCUyMFByaSUyME0lMjBTdGFycyUyMFJlbGVhc2VCbG9jayUyMENvbXBvbmVudCUyMFN0YXR1cyUyME93bmVyJTIwU3VtbWFyeSUyME9TJTIwTW9kaWZpZWRcbiAgICAgICAgICAgIC8vb3V0cHV0LnNwbGljZShpLCAwLCBib1swXSwgYm9bMV0sIGJvWzJdLCBib1szXSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChib1swXSwgYm9bMV0sIGJvWzJdLCBib1szXSk7XG4gICAgICAgICAgICBpdiA9IGJpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1c2VQYWRkaW5nKSB7XG4gICAgICAgICAgICAvKiBjaGVjayBhbmQgcmVtb3ZlIHRoZSBwYWQgKi9cbiAgICAgICAgICAgIGJpID0gb3V0cHV0W2kgLSAxXSAmIDI1NTtcbiAgICAgICAgICAgIGlmIChiaSA9PT0gMCB8fCBiaSA+IDE2KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmNvcnJ1cHQoXCJwa2NzIzUgcGFkZGluZyBjb3JydXB0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm8gPSBiaSAqIDB4MTAxMDEwMTtcbiAgICAgICAgICAgIGlmICghdy5lcXVhbCh3LmJpdFNsaWNlKFtibywgYm8sIGJvLCBib10sIDAsIGJpICogOCksIHcuYml0U2xpY2Uob3V0cHV0LCBvdXRwdXQubGVuZ3RoICogMzIgLSBiaSAqIDgsIG91dHB1dC5sZW5ndGggKiAzMikpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmNvcnJ1cHQoXCJwa2NzIzUgcGFkZGluZyBjb3JydXB0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHcuYml0U2xpY2Uob3V0cHV0LCAwLCBvdXRwdXQubGVuZ3RoICogMzIgLSBiaSAqIDgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH0sXG59O1xuLyoqIEBmaWxlT3ZlcnZpZXcgR0NNIG1vZGUgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQGF1dGhvciBKdWhvIFbDpGjDpC1IZXJ0dHVhXG4gKi9cbi8qKlxuICogR2Fsb2lzL0NvdW50ZXIgbW9kZS5cbiAqIEBuYW1lc3BhY2VcbiAqL1xuc2pjbC5tb2RlLmdjbSA9IHtcbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgbW9kZS5cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKi9cbiAgICBuYW1lOiBcImdjbVwiLFxuICAgIC8qKiBFbmNyeXB0IGluIEdDTSBtb2RlLlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJmIFRoZSBwc2V1ZG9yYW5kb20gZnVuY3Rpb24uICBJdCBtdXN0IGhhdmUgYSBibG9jayBzaXplIG9mIDE2IGJ5dGVzLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IHBsYWludGV4dCBUaGUgcGxhaW50ZXh0IGRhdGEuXG4gICAgICogQHBhcmFtIHtiaXRBcnJheX0gaXYgVGhlIGluaXRpYWxpemF0aW9uIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IFthZGF0YT1bXV0gVGhlIGF1dGhlbnRpY2F0ZWQgZGF0YS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3RsZW49MTI4XSBUaGUgZGVzaXJlZCB0YWcgbGVuZ3RoLCBpbiBiaXRzLlxuICAgICAqIEByZXR1cm4ge2JpdEFycmF5fSBUaGUgZW5jcnlwdGVkIGRhdGEsIGFuIGFycmF5IG9mIGJ5dGVzLlxuICAgICAqL1xuICAgIGVuY3J5cHQ6IGZ1bmN0aW9uIChwcmYsIHBsYWludGV4dCwgaXYsIGFkYXRhLCB0bGVuKSB7XG4gICAgICAgIHZhciBvdXQsIGRhdGEgPSBwbGFpbnRleHQuc2xpY2UoMCksIHcgPSBzamNsLmJpdEFycmF5O1xuICAgICAgICB0bGVuID0gdGxlbiB8fCAxMjg7XG4gICAgICAgIGFkYXRhID0gYWRhdGEgfHwgW107XG4gICAgICAgIC8vIGVuY3J5cHQgYW5kIHRhZ1xuICAgICAgICBvdXQgPSBzamNsLm1vZGUuZ2NtLl9jdHJNb2RlKHRydWUsIHByZiwgZGF0YSwgYWRhdGEsIGl2LCB0bGVuKTtcbiAgICAgICAgcmV0dXJuIHcuY29uY2F0KG91dC5kYXRhLCBvdXQudGFnKTtcbiAgICB9LFxuICAgIC8qKiBEZWNyeXB0IGluIEdDTSBtb2RlLlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJmIFRoZSBwc2V1ZG9yYW5kb20gZnVuY3Rpb24uICBJdCBtdXN0IGhhdmUgYSBibG9jayBzaXplIG9mIDE2IGJ5dGVzLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGNpcGhlcnRleHQgVGhlIGNpcGhlcnRleHQgZGF0YS5cbiAgICAgKiBAcGFyYW0ge2JpdEFycmF5fSBpdiBUaGUgaW5pdGlhbGl6YXRpb24gdmFsdWUuXG4gICAgICogQHBhcmFtIHtiaXRBcnJheX0gW2FkYXRhPVtdXSBUaGUgYXV0aGVudGljYXRlZCBkYXRhLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdGxlbj0xMjhdIFRoZSBkZXNpcmVkIHRhZyBsZW5ndGgsIGluIGJpdHMuXG4gICAgICogQHJldHVybiB7Yml0QXJyYXl9IFRoZSBkZWNyeXB0ZWQgZGF0YS5cbiAgICAgKi9cbiAgICBkZWNyeXB0OiBmdW5jdGlvbiAocHJmLCBjaXBoZXJ0ZXh0LCBpdiwgYWRhdGEsIHRsZW4pIHtcbiAgICAgICAgdmFyIG91dCwgZGF0YSA9IGNpcGhlcnRleHQuc2xpY2UoMCksIHRhZywgdyA9IHNqY2wuYml0QXJyYXksIGwgPSB3LmJpdExlbmd0aChkYXRhKTtcbiAgICAgICAgdGxlbiA9IHRsZW4gfHwgMTI4O1xuICAgICAgICBhZGF0YSA9IGFkYXRhIHx8IFtdO1xuICAgICAgICAvLyBTbGljZSB0YWcgb3V0IG9mIGRhdGFcbiAgICAgICAgaWYgKHRsZW4gPD0gbCkge1xuICAgICAgICAgICAgdGFnID0gdy5iaXRTbGljZShkYXRhLCBsIC0gdGxlbik7XG4gICAgICAgICAgICBkYXRhID0gdy5iaXRTbGljZShkYXRhLCAwLCBsIC0gdGxlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0YWcgPSBkYXRhO1xuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRlY3J5cHQgYW5kIHRhZ1xuICAgICAgICBvdXQgPSBzamNsLm1vZGUuZ2NtLl9jdHJNb2RlKGZhbHNlLCBwcmYsIGRhdGEsIGFkYXRhLCBpdiwgdGxlbik7XG4gICAgICAgIGlmICghdy5lcXVhbChvdXQudGFnLCB0YWcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uY29ycnVwdChcImdjbTogdGFnIGRvZXNuJ3QgbWF0Y2hcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dC5kYXRhO1xuICAgIH0sXG4gICAgLyogQ29tcHV0ZSB0aGUgZ2Fsb2lzIG11bHRpcGxpY2F0aW9uIG9mIFggYW5kIFlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nYWxvaXNNdWx0aXBseTogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdmFyIGksIGosIHhpLCBaaSwgVmksIGxzYl9WaSwgdyA9IHNqY2wuYml0QXJyYXksIHhvciA9IHcuX3hvcjQ7XG4gICAgICAgIFppID0gWzAsIDAsIDAsIDBdO1xuICAgICAgICBWaSA9IHkuc2xpY2UoMCk7XG4gICAgICAgIC8vIEJsb2NrIHNpemUgaXMgMTI4IGJpdHMsIHJ1biAxMjggdGltZXMgdG8gZ2V0IFpfMTI4XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjg7IGkrKykge1xuICAgICAgICAgICAgeGkgPSAoeFtNYXRoLmZsb29yKGkgLyAzMildICYgKDEgPDwgKDMxIC0gKGkgJSAzMikpKSkgIT09IDA7XG4gICAgICAgICAgICBpZiAoeGkpIHtcbiAgICAgICAgICAgICAgICAvLyBaX2krMSA9IFpfaSBeIFZfaVxuICAgICAgICAgICAgICAgIFppID0geG9yKFppLCBWaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTdG9yZSB0aGUgdmFsdWUgb2YgTFNCKFZfaSlcbiAgICAgICAgICAgIGxzYl9WaSA9IChWaVszXSAmIDEpICE9PSAwO1xuICAgICAgICAgICAgLy8gVl9pKzEgPSBWX2kgPj4gMVxuICAgICAgICAgICAgZm9yIChqID0gMzsgaiA+IDA7IGotLSkge1xuICAgICAgICAgICAgICAgIFZpW2pdID0gKFZpW2pdID4+PiAxKSB8ICgoVmlbaiAtIDFdICYgMSkgPDwgMzEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVmlbMF0gPSBWaVswXSA+Pj4gMTtcbiAgICAgICAgICAgIC8vIElmIExTQihWX2kpIGlzIDEsIFZfaSsxID0gKFZfaSA+PiAxKSBeIFJcbiAgICAgICAgICAgIGlmIChsc2JfVmkpIHtcbiAgICAgICAgICAgICAgICBWaVswXSA9IFZpWzBdIF4gKDB4ZTEgPDwgMjQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBaaTtcbiAgICB9LFxuICAgIF9naGFzaDogZnVuY3Rpb24gKEgsIFkwLCBkYXRhKSB7XG4gICAgICAgIHZhciBZaSwgaSwgbCA9IGRhdGEubGVuZ3RoO1xuICAgICAgICBZaSA9IFkwLnNsaWNlKDApO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSA0KSB7XG4gICAgICAgICAgICBZaVswXSBePSAweGZmZmZmZmZmICYgZGF0YVtpXTtcbiAgICAgICAgICAgIFlpWzFdIF49IDB4ZmZmZmZmZmYgJiBkYXRhW2kgKyAxXTtcbiAgICAgICAgICAgIFlpWzJdIF49IDB4ZmZmZmZmZmYgJiBkYXRhW2kgKyAyXTtcbiAgICAgICAgICAgIFlpWzNdIF49IDB4ZmZmZmZmZmYgJiBkYXRhW2kgKyAzXTtcbiAgICAgICAgICAgIFlpID0gc2pjbC5tb2RlLmdjbS5fZ2Fsb2lzTXVsdGlwbHkoWWksIEgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBZaTtcbiAgICB9LFxuICAgIC8qKiBHQ00gQ1RSIG1vZGUuXG4gICAgICogRW5jcnlwdCBvciBkZWNyeXB0IGRhdGEgYW5kIHRhZyB3aXRoIHRoZSBwcmYgaW4gR0NNLXN0eWxlIENUUiBtb2RlLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gZW5jcnlwdCBUcnVlIGlmIGVuY3J5cHQsIGZhbHNlIGlmIGRlY3J5cHQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByZiBUaGUgUFJGLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgZW5jcnlwdGVkIG9yIGRlY3J5cHRlZC5cbiAgICAgKiBAcGFyYW0ge2JpdEFycmF5fSBpdiBUaGUgaW5pdGlhbGl6YXRpb24gdmVjdG9yLlxuICAgICAqIEBwYXJhbSB7Yml0QXJyYXl9IGFkYXRhIFRoZSBhc3NvY2lhdGVkIGRhdGEgdG8gYmUgdGFnZ2VkLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0bGVuIFRoZSBsZW5ndGggb2YgdGhlIHRhZywgaW4gYml0cy5cbiAgICAgKi9cbiAgICBfY3RyTW9kZTogZnVuY3Rpb24gKGVuY3J5cHQsIHByZiwgZGF0YSwgYWRhdGEsIGl2LCB0bGVuKSB7XG4gICAgICAgIHZhciBILCBKMCwgUzAsIGVuYywgaSwgY3RyLCB0YWcsIGxhc3QsIGwsIGJsLCBhYmwsIGl2YmwsIHcgPSBzamNsLmJpdEFycmF5O1xuICAgICAgICAvLyBDYWxjdWxhdGUgZGF0YSBsZW5ndGhzXG4gICAgICAgIGwgPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgYmwgPSB3LmJpdExlbmd0aChkYXRhKTtcbiAgICAgICAgYWJsID0gdy5iaXRMZW5ndGgoYWRhdGEpO1xuICAgICAgICBpdmJsID0gdy5iaXRMZW5ndGgoaXYpO1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIHBhcmFtZXRlcnNcbiAgICAgICAgSCA9IHByZi5lbmNyeXB0KFswLCAwLCAwLCAwXSk7XG4gICAgICAgIGlmIChpdmJsID09PSA5Nikge1xuICAgICAgICAgICAgSjAgPSBpdi5zbGljZSgwKTtcbiAgICAgICAgICAgIEowID0gdy5jb25jYXQoSjAsIFsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBKMCA9IHNqY2wubW9kZS5nY20uX2doYXNoKEgsIFswLCAwLCAwLCAwXSwgaXYpO1xuICAgICAgICAgICAgSjAgPSBzamNsLm1vZGUuZ2NtLl9naGFzaChILCBKMCwgWzAsIDAsIE1hdGguZmxvb3IoaXZibCAvIDB4MTAwMDAwMDAwKSwgaXZibCAmIDB4ZmZmZmZmZmZdKTtcbiAgICAgICAgfVxuICAgICAgICBTMCA9IHNqY2wubW9kZS5nY20uX2doYXNoKEgsIFswLCAwLCAwLCAwXSwgYWRhdGEpO1xuICAgICAgICAvLyBJbml0aWFsaXplIGN0ciBhbmQgdGFnXG4gICAgICAgIGN0ciA9IEowLnNsaWNlKDApO1xuICAgICAgICB0YWcgPSBTMC5zbGljZSgwKTtcbiAgICAgICAgLy8gSWYgZGVjcnlwdGluZywgY2FsY3VsYXRlIGhhc2hcbiAgICAgICAgaWYgKCFlbmNyeXB0KSB7XG4gICAgICAgICAgICB0YWcgPSBzamNsLm1vZGUuZ2NtLl9naGFzaChILCBTMCwgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5jcnlwdCBhbGwgdGhlIGRhdGFcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gNCkge1xuICAgICAgICAgICAgY3RyWzNdKys7XG4gICAgICAgICAgICBlbmMgPSBwcmYuZW5jcnlwdChjdHIpO1xuICAgICAgICAgICAgZGF0YVtpXSBePSBlbmNbMF07XG4gICAgICAgICAgICBkYXRhW2kgKyAxXSBePSBlbmNbMV07XG4gICAgICAgICAgICBkYXRhW2kgKyAyXSBePSBlbmNbMl07XG4gICAgICAgICAgICBkYXRhW2kgKyAzXSBePSBlbmNbM107XG4gICAgICAgIH1cbiAgICAgICAgZGF0YSA9IHcuY2xhbXAoZGF0YSwgYmwpO1xuICAgICAgICAvLyBJZiBlbmNyeXB0aW5nLCBjYWxjdWxhdGUgaGFzaFxuICAgICAgICBpZiAoZW5jcnlwdCkge1xuICAgICAgICAgICAgdGFnID0gc2pjbC5tb2RlLmdjbS5fZ2hhc2goSCwgUzAsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhbGN1bGF0ZSBsYXN0IGJsb2NrIGZyb20gYml0IGxlbmd0aHMsIHVnbHkgYmVjYXVzZSBiaXR3aXNlIG9wZXJhdGlvbnMgYXJlIDMyLWJpdFxuICAgICAgICBsYXN0ID0gW01hdGguZmxvb3IoYWJsIC8gMHgxMDAwMDAwMDApLCBhYmwgJiAweGZmZmZmZmZmLCBNYXRoLmZsb29yKGJsIC8gMHgxMDAwMDAwMDApLCBibCAmIDB4ZmZmZmZmZmZdO1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGZpbmFsIHRhZyBibG9ja1xuICAgICAgICB0YWcgPSBzamNsLm1vZGUuZ2NtLl9naGFzaChILCB0YWcsIGxhc3QpO1xuICAgICAgICBlbmMgPSBwcmYuZW5jcnlwdChKMCk7XG4gICAgICAgIHRhZ1swXSBePSBlbmNbMF07XG4gICAgICAgIHRhZ1sxXSBePSBlbmNbMV07XG4gICAgICAgIHRhZ1syXSBePSBlbmNbMl07XG4gICAgICAgIHRhZ1szXSBePSBlbmNbM107XG4gICAgICAgIHJldHVybiB7IHRhZzogdy5iaXRTbGljZSh0YWcsIDAsIHRsZW4pLCBkYXRhOiBkYXRhIH07XG4gICAgfSxcbn07XG4vKiogQGZpbGVPdmVydmlldyBITUFDIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBhdXRob3IgRW1pbHkgU3RhcmtcbiAqIEBhdXRob3IgTWlrZSBIYW1idXJnXG4gKiBAYXV0aG9yIERhbiBCb25laFxuICovXG4vKiogSE1BQyB3aXRoIHRoZSBzcGVjaWZpZWQgaGFzaCBmdW5jdGlvbi5cbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtiaXRBcnJheX0ga2V5IHRoZSBrZXkgZm9yIEhNQUMuXG4gKiBAcGFyYW0ge09iamVjdH0gW0hhc2g9c2pjbC5oYXNoLnNoYTI1Nl0gVGhlIGhhc2ggZnVuY3Rpb24gdG8gdXNlLlxuICovXG5zamNsLm1pc2MuaG1hYyA9IGZ1bmN0aW9uIChrZXksIEhhc2gpIHtcbiAgICB0aGlzLl9oYXNoID0gSGFzaCA9IEhhc2ggfHwgc2pjbC5oYXNoLnNoYTI1NjtcbiAgICB2YXIgZXhLZXkgPSBbW10sIFtdXSwgaSwgYnMgPSBIYXNoLnByb3RvdHlwZS5ibG9ja1NpemUgLyAzMjtcbiAgICB0aGlzLl9iYXNlSGFzaCA9IFtuZXcgSGFzaCgpLCBuZXcgSGFzaCgpXTtcbiAgICBpZiAoa2V5Lmxlbmd0aCA+IGJzKSB7XG4gICAgICAgIGtleSA9IEhhc2guaGFzaChrZXkpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYnM7IGkrKykge1xuICAgICAgICBleEtleVswXVtpXSA9IGtleVtpXSBeIDB4MzYzNjM2MzY7XG4gICAgICAgIGV4S2V5WzFdW2ldID0ga2V5W2ldIF4gMHg1YzVjNWM1YztcbiAgICB9XG4gICAgdGhpcy5fYmFzZUhhc2hbMF0udXBkYXRlKGV4S2V5WzBdKTtcbiAgICB0aGlzLl9iYXNlSGFzaFsxXS51cGRhdGUoZXhLZXlbMV0pO1xuICAgIHRoaXMuX3Jlc3VsdEhhc2ggPSBuZXcgSGFzaCh0aGlzLl9iYXNlSGFzaFswXSk7XG59O1xuLyoqIEhNQUMgd2l0aCB0aGUgc3BlY2lmaWVkIGhhc2ggZnVuY3Rpb24uICBBbHNvIGNhbGxlZCBlbmNyeXB0IHNpbmNlIGl0J3MgYSBwcmYuXG4gKiBAcGFyYW0ge2JpdEFycmF5fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBtYWMuXG4gKi9cbnNqY2wubWlzYy5obWFjLnByb3RvdHlwZS5lbmNyeXB0ID0gc2pjbC5taXNjLmhtYWMucHJvdG90eXBlLm1hYyA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKCF0aGlzLl91cGRhdGVkKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKGRhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcy5kaWdlc3QoZGF0YSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcImVuY3J5cHQgb24gYWxyZWFkeSB1cGRhdGVkIGhtYWMgY2FsbGVkIVwiKTtcbiAgICB9XG59O1xuc2pjbC5taXNjLmhtYWMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3Jlc3VsdEhhc2ggPSBuZXcgdGhpcy5faGFzaCh0aGlzLl9iYXNlSGFzaFswXSk7XG4gICAgdGhpcy5fdXBkYXRlZCA9IGZhbHNlO1xufTtcbnNqY2wubWlzYy5obWFjLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMuX3VwZGF0ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3Jlc3VsdEhhc2gudXBkYXRlKGRhdGEpO1xufTtcbnNqY2wubWlzYy5obWFjLnByb3RvdHlwZS5kaWdlc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHcgPSB0aGlzLl9yZXN1bHRIYXNoLmZpbmFsaXplKCksIHJlc3VsdCA9IG5ldyB0aGlzLl9oYXNoKHRoaXMuX2Jhc2VIYXNoWzFdKS51cGRhdGUodykuZmluYWxpemUoKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG4vKiogQGZpbGVPdmVydmlldyBSYW5kb20gbnVtYmVyIGdlbmVyYXRvci5cbiAqXG4gKiBAYXV0aG9yIEVtaWx5IFN0YXJrXG4gKiBAYXV0aG9yIE1pa2UgSGFtYnVyZ1xuICogQGF1dGhvciBEYW4gQm9uZWhcbiAqIEBhdXRob3IgTWljaGFlbCBCcm9va3NcbiAqIEBhdXRob3IgU3RldmUgVGhvbWFzXG4gKi9cbi8qKlxuICogQGNsYXNzIFJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yXG4gKiBAZGVzY3JpcHRpb25cbiAqIDxiPlVzZSBzamNsLnJhbmRvbSBhcyBhIHNpbmdsZXRvbiBmb3IgdGhpcyBjbGFzcyE8L2I+XG4gKiA8cD5cbiAqIFRoaXMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IgaXMgYSBkZXJpdmF0aXZlIG9mIEZlcmd1c29uIGFuZCBTY2huZWllcidzXG4gKiBnZW5lcmF0b3IgRm9ydHVuYS4gIEl0IGNvbGxlY3RzIGVudHJvcHkgZnJvbSB2YXJpb3VzIGV2ZW50cyBpbnRvIHNldmVyYWxcbiAqIHBvb2xzLCBpbXBsZW1lbnRlZCBieSBzdHJlYW1pbmcgU0hBLTI1NiBpbnN0YW5jZXMuICBJdCBkaWZmZXJzIGZyb21cbiAqIG9yZGluYXJ5IEZvcnR1bmEgaW4gYSBmZXcgd2F5cywgdGhvdWdoLlxuICogPC9wPlxuICpcbiAqIDxwPlxuICogTW9zdCBpbXBvcnRhbnRseSwgaXQgaGFzIGFuIGVudHJvcHkgZXN0aW1hdG9yLiAgVGhpcyBpcyBwcmVzZW50IGJlY2F1c2VcbiAqIHRoZXJlIGlzIGEgc3Ryb25nIGNvbmZsaWN0IGhlcmUgYmV0d2VlbiBtYWtpbmcgdGhlIGdlbmVyYXRvciBhdmFpbGFibGVcbiAqIGFzIHNvb24gYXMgcG9zc2libGUsIGFuZCBtYWtpbmcgc3VyZSB0aGF0IGl0IGRvZXNuJ3QgXCJydW4gb24gZW1wdHlcIi5cbiAqIEluIEZvcnR1bmEsIHRoZXJlIGlzIGEgc2F2ZWQgc3RhdGUgZmlsZSwgYW5kIHRoZSBzeXN0ZW0gaXMgbGlrZWx5IHRvIGhhdmVcbiAqIHRpbWUgdG8gd2FybSB1cC5cbiAqIDwvcD5cbiAqXG4gKiA8cD5cbiAqIFNlY29uZCwgYmVjYXVzZSB1c2VycyBhcmUgdW5saWtlbHkgdG8gc3RheSBvbiB0aGUgcGFnZSBmb3IgdmVyeSBsb25nLFxuICogYW5kIHRvIHNwZWVkIHN0YXJ0dXAgdGltZSwgdGhlIG51bWJlciBvZiBwb29scyBpbmNyZWFzZXMgbG9nYXJpdGhtaWNhbGx5OlxuICogYSBuZXcgcG9vbCBpcyBjcmVhdGVkIHdoZW4gdGhlIHByZXZpb3VzIG9uZSBpcyBhY3R1YWxseSB1c2VkIGZvciBhIHJlc2VlZC5cbiAqIFRoaXMgZ2l2ZXMgdGhlIHNhbWUgYXN5bXB0b3RpYyBndWFyYW50ZWVzIGFzIEZvcnR1bmEsIGJ1dCBnaXZlcyBtb3JlXG4gKiBlbnRyb3B5IHRvIGVhcmx5IHJlc2VlZHMuXG4gKiA8L3A+XG4gKlxuICogPHA+XG4gKiBUaGUgZW50aXJlIG1lY2hhbmlzbSBoZXJlIGZlZWxzIHByZXR0eSBrbHVua3kuICBGdXJ0aGVybW9yZSwgdGhlcmUgYXJlXG4gKiBzZXZlcmFsIGltcHJvdmVtZW50cyB0aGF0IHNob3VsZCBiZSBtYWRlLCBpbmNsdWRpbmcgc3VwcG9ydCBmb3JcbiAqIGRlZGljYXRlZCBjcnlwdG9ncmFwaGljIGZ1bmN0aW9ucyB0aGF0IG1heSBiZSBwcmVzZW50IGluIHNvbWUgYnJvd3NlcnM7XG4gKiBzdGF0ZSBmaWxlcyBpbiBsb2NhbCBzdG9yYWdlOyBjb29raWVzIGNvbnRhaW5pbmcgcmFuZG9tbmVzczsgZXRjLiAgU29cbiAqIGxvb2sgZm9yIGltcHJvdmVtZW50cyBpbiBmdXR1cmUgdmVyc2lvbnMuXG4gKiA8L3A+XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuc2pjbC5wcm5nID0gZnVuY3Rpb24gKGRlZmF1bHRQYXJhbm9pYSkge1xuICAgIC8qIHByaXZhdGUgKi9cbiAgICB0aGlzLl9wb29scyA9IFtuZXcgc2pjbC5oYXNoLnNoYTI1NigpXTtcbiAgICB0aGlzLl9wb29sRW50cm9weSA9IFswXTtcbiAgICB0aGlzLl9yZXNlZWRDb3VudCA9IDA7XG4gICAgdGhpcy5fcm9iaW5zID0ge307XG4gICAgdGhpcy5fZXZlbnRJZCA9IDA7XG4gICAgdGhpcy5fY29sbGVjdG9ySWRzID0ge307XG4gICAgdGhpcy5fY29sbGVjdG9ySWROZXh0ID0gMDtcbiAgICB0aGlzLl9zdHJlbmd0aCA9IDA7XG4gICAgdGhpcy5fcG9vbFN0cmVuZ3RoID0gMDtcbiAgICB0aGlzLl9uZXh0UmVzZWVkID0gMDtcbiAgICB0aGlzLl9rZXkgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgdGhpcy5fY291bnRlciA9IFswLCAwLCAwLCAwXTtcbiAgICAvLyB0aGlzLl9jaXBoZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fZGVmYXVsdFBhcmFub2lhID0gZGVmYXVsdFBhcmFub2lhO1xuICAgIC8vIC8qIGV2ZW50IGxpc3RlbmVyIHN0dWZmICovXG4gICAgLy8gdGhpcy5fY29sbGVjdG9yc1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAvLyB0aGlzLl9jYWxsYmFja3MgPSB7cHJvZ3Jlc3M6IHt9LCBzZWVkZWQ6IHt9fTtcbiAgICAvLyB0aGlzLl9jYWxsYmFja0kgPSAwO1xuICAgIC8qIGNvbnN0YW50cyAqL1xuICAgIHRoaXMuX05PVF9SRUFEWSA9IDA7XG4gICAgdGhpcy5fUkVBRFkgPSAxO1xuICAgIHRoaXMuX1JFUVVJUkVTX1JFU0VFRCA9IDI7XG4gICAgdGhpcy5fTUFYX1dPUkRTX1BFUl9CVVJTVCA9IDY1NTM2O1xuICAgIHRoaXMuX1BBUkFOT0lBX0xFVkVMUyA9IFswLCA0OCwgNjQsIDk2LCAxMjgsIDE5MiwgMjU2LCAzODQsIDUxMiwgNzY4LCAxMDI0XTtcbiAgICB0aGlzLl9NSUxMSVNFQ09ORFNfUEVSX1JFU0VFRCA9IDMwMDAwO1xuICAgIHRoaXMuX0JJVFNfUEVSX1JFU0VFRCA9IDgwO1xufTtcbnNqY2wucHJuZy5wcm90b3R5cGUgPSB7XG4gICAgLyoqIEdlbmVyYXRlIHNldmVyYWwgcmFuZG9tIHdvcmRzLCBhbmQgcmV0dXJuIHRoZW0gaW4gYW4gYXJyYXkuXG4gICAgICogQSB3b3JkIGNvbnNpc3RzIG9mIDMyIGJpdHMgKDQgYnl0ZXMpXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG53b3JkcyBUaGUgbnVtYmVyIG9mIHdvcmRzIHRvIGdlbmVyYXRlLlxuICAgICAqL1xuICAgIHJhbmRvbVdvcmRzOiBmdW5jdGlvbiAobndvcmRzLCBwYXJhbm9pYSkge1xuICAgICAgICB2YXIgb3V0ID0gW10sIGksIHJlYWRpbmVzcyA9IHRoaXMuaXNSZWFkeShwYXJhbm9pYSksIGc7XG4gICAgICAgIGlmIChyZWFkaW5lc3MgPT09IHRoaXMuX05PVF9SRUFEWSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLm5vdFJlYWR5KFwiZ2VuZXJhdG9yIGlzbid0IHNlZWRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyZWFkaW5lc3MgJiB0aGlzLl9SRVFVSVJFU19SRVNFRUQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2VlZEZyb21Qb29scyghKHJlYWRpbmVzcyAmIHRoaXMuX1JFQURZKSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG53b3JkczsgaSArPSA0KSB7XG4gICAgICAgICAgICBpZiAoKGkgKyAxKSAlIHRoaXMuX01BWF9XT1JEU19QRVJfQlVSU1QgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9nYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnID0gdGhpcy5fZ2VuNHdvcmRzKCk7XG4gICAgICAgICAgICBvdXQucHVzaChnWzBdLCBnWzFdLCBnWzJdLCBnWzNdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9nYXRlKCk7XG4gICAgICAgIHJldHVybiBvdXQuc2xpY2UoMCwgbndvcmRzKTtcbiAgICB9LFxuICAgIC8vIHNldERlZmF1bHRQYXJhbm9pYTogZnVuY3Rpb24gKHBhcmFub2lhLCBhbGxvd1plcm9QYXJhbm9pYSkge1xuICAgIC8vIFx0aWYgKHBhcmFub2lhID09PSAwICYmIGFsbG93WmVyb1BhcmFub2lhXG4gICAgLy8gXHRcdCE9PSBcIlNldHRpbmcgcGFyYW5vaWE9MCB3aWxsIHJ1aW4geW91ciBzZWN1cml0eTsgdXNlIGl0IG9ubHkgZm9yIHRlc3RpbmdcIikge1xuICAgIC8vIFx0XHR0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcIlNldHRpbmcgcGFyYW5vaWE9MCB3aWxsIHJ1aW4geW91ciBzZWN1cml0eTsgdXNlIGl0IG9ubHkgZm9yIHRlc3RpbmdcIik7XG4gICAgLy8gXHR9XG4gICAgLy9cbiAgICAvLyBcdHRoaXMuX2RlZmF1bHRQYXJhbm9pYSA9IHBhcmFub2lhO1xuICAgIC8vIH0sXG4gICAgLyoqXG4gICAgICogQWRkIGVudHJvcHkgdG8gdGhlIHBvb2xzLlxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbnRyb3BpYyB2YWx1ZS4gIFNob3VsZCBiZSBhIDMyLWJpdCBpbnRlZ2VyLCBhcnJheSBvZiAzMi1iaXQgaW50ZWdlcnMsIG9yIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBlc3RpbWF0ZWRFbnRyb3B5IFRoZSBlc3RpbWF0ZWQgZW50cm9weSBvZiBkYXRhLCBpbiBiaXRzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNvdXJjZSBUaGUgc291cmNlIG9mIHRoZSBlbnRyb3B5LCBlZyBcIm1vdXNlXCJcbiAgICAgKi9cbiAgICBhZGRFbnRyb3B5OiBmdW5jdGlvbiAoZGF0YSwgZXN0aW1hdGVkRW50cm9weSwgc291cmNlKSB7XG4gICAgICAgIHNvdXJjZSA9IHNvdXJjZSB8fCBcInVzZXJcIjtcbiAgICAgICAgdmFyIGlkLCBpLCB0bXAsIHQgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKSwgcm9iaW4gPSB0aGlzLl9yb2JpbnNbc291cmNlXSwgb2xkUmVhZHkgPSB0aGlzLmlzUmVhZHkoKSwgZXJyID0gMCwgb2JqTmFtZTtcbiAgICAgICAgaWQgPSB0aGlzLl9jb2xsZWN0b3JJZHNbc291cmNlXTtcbiAgICAgICAgaWYgKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlkID0gdGhpcy5fY29sbGVjdG9ySWRzW3NvdXJjZV0gPSB0aGlzLl9jb2xsZWN0b3JJZE5leHQrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAocm9iaW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcm9iaW4gPSB0aGlzLl9yb2JpbnNbc291cmNlXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcm9iaW5zW3NvdXJjZV0gPSAodGhpcy5fcm9iaW5zW3NvdXJjZV0gKyAxKSAlIHRoaXMuX3Bvb2xzLmxlbmd0aDtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgZGF0YSkge1xuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgICAgIGlmIChlc3RpbWF0ZWRFbnRyb3B5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkRW50cm9weSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX3Bvb2xzW3JvYmluXS51cGRhdGUoW2lkLCB0aGlzLl9ldmVudElkKyssIDEsIGVzdGltYXRlZEVudHJvcHksIHQsIDEsIGRhdGEgfCAwXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAgICAgICAgb2JqTmFtZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAob2JqTmFtZSA9PT0gXCJbb2JqZWN0IFVpbnQzMkFycmF5XVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wLnB1c2goZGF0YVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHRtcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpOYW1lICE9PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoICYmICFlcnI7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2ldICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXN0aW1hdGVkRW50cm9weSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBob3JyaWJsZSBlbnRyb3B5IGVzdGltYXRvciAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkRW50cm9weSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcCA9IGRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRtcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkRW50cm9weSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXAgPSB0bXAgPj4+IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Bvb2xzW3JvYmluXS51cGRhdGUoW2lkLCB0aGlzLl9ldmVudElkKyssIDIsIGVzdGltYXRlZEVudHJvcHksIHQsIGRhdGEubGVuZ3RoXS5jb25jYXQoZGF0YSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICBpZiAoZXN0aW1hdGVkRW50cm9weSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIEVuZ2xpc2ggdGV4dCBoYXMganVzdCBvdmVyIDEgYml0IHBlciBjaGFyYWN0ZXIgb2YgZW50cm9weS5cbiAgICAgICAgICAgICAgICAgICAgICogQnV0IHRoaXMgbWlnaHQgYmUgSFRNTCBvciBzb21ldGhpbmcsIGFuZCBoYXZlIGZhciBsZXNzXG4gICAgICAgICAgICAgICAgICAgICAqIGVudHJvcHkgdGhhbiBFbmdsaXNoLi4uICBPaCB3ZWxsLCBsZXQncyBqdXN0IHNheSBvbmUgYml0LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkRW50cm9weSA9IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9wb29sc1tyb2Jpbl0udXBkYXRlKFtpZCwgdGhpcy5fZXZlbnRJZCsrLCAzLCBlc3RpbWF0ZWRFbnRyb3B5LCB0LCBkYXRhLmxlbmd0aF0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvb2xzW3JvYmluXS51cGRhdGUoZGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGVyciA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmJ1ZyhcInJhbmRvbTogYWRkRW50cm9weSBvbmx5IHN1cHBvcnRzIG51bWJlciwgYXJyYXkgb2YgbnVtYmVycyBvciBzdHJpbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgLyogcmVjb3JkIHRoZSBuZXcgc3RyZW5ndGggKi9cbiAgICAgICAgdGhpcy5fcG9vbEVudHJvcHlbcm9iaW5dICs9IGVzdGltYXRlZEVudHJvcHk7XG4gICAgICAgIHRoaXMuX3Bvb2xTdHJlbmd0aCArPSBlc3RpbWF0ZWRFbnRyb3B5O1xuICAgICAgICAvKiBmaXJlIG9mZiBldmVudHMgKi9cbiAgICAgICAgLyogVFVUQU8uYXJtOiByZW1vdmVkIGJhZCBpbXBsZW1lbnRhdGlvbjogX2ZpcmVFdmVudCBjYWxscyBzdGF0aWMgcmFuZG9taXplciBpbnN0YW5jZVxuICAgICAgICAgaWYgKG9sZFJlYWR5ID09PSB0aGlzLl9OT1RfUkVBRFkpIHtcbiAgICAgICAgIGlmICh0aGlzLmlzUmVhZHkoKSAhPT0gdGhpcy5fTk9UX1JFQURZKSB7XG4gICAgICAgICB0aGlzLl9maXJlRXZlbnQoXCJzZWVkZWRcIiwgTWF0aC5tYXgodGhpcy5fc3RyZW5ndGgsIHRoaXMuX3Bvb2xTdHJlbmd0aCkpO1xuICAgICAgICAgfVxuICAgICAgICAgdGhpcy5fZmlyZUV2ZW50KFwicHJvZ3Jlc3NcIiwgdGhpcy5nZXRQcm9ncmVzcygpKTtcbiAgICAgICAgIH0qL1xuICAgIH0sXG4gICAgLyoqIElzIHRoZSBnZW5lcmF0b3IgcmVhZHk/ICovXG4gICAgaXNSZWFkeTogZnVuY3Rpb24gKHBhcmFub2lhKSB7XG4gICAgICAgIHZhciBlbnRyb3B5UmVxdWlyZWQgPSB0aGlzLl9QQVJBTk9JQV9MRVZFTFNbcGFyYW5vaWEgIT09IHVuZGVmaW5lZCA/IHBhcmFub2lhIDogdGhpcy5fZGVmYXVsdFBhcmFub2lhXTtcbiAgICAgICAgaWYgKHRoaXMuX3N0cmVuZ3RoICYmIHRoaXMuX3N0cmVuZ3RoID49IGVudHJvcHlSZXF1aXJlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xFbnRyb3B5WzBdID4gdGhpcy5fQklUU19QRVJfUkVTRUVEICYmIG5ldyBEYXRlKCkudmFsdWVPZigpID4gdGhpcy5fbmV4dFJlc2VlZCA/IHRoaXMuX1JFUVVJUkVTX1JFU0VFRCB8IHRoaXMuX1JFQURZIDogdGhpcy5fUkVBRFk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcG9vbFN0cmVuZ3RoID49IGVudHJvcHlSZXF1aXJlZCA/IHRoaXMuX1JFUVVJUkVTX1JFU0VFRCB8IHRoaXMuX05PVF9SRUFEWSA6IHRoaXMuX05PVF9SRUFEWTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqIEdlbmVyYXRlIDQgcmFuZG9tIHdvcmRzLCBubyByZXNlZWQsIG5vIGdhdGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2VuNHdvcmRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9jb3VudGVyW2ldID0gKHRoaXMuX2NvdW50ZXJbaV0gKyAxKSB8IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5fY291bnRlcltpXSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9jaXBoZXIuZW5jcnlwdCh0aGlzLl9jb3VudGVyKTtcbiAgICB9LFxuICAgIC8qIFJla2V5IHRoZSBBRVMgaW5zdGFuY2Ugd2l0aCBpdHNlbGYgYWZ0ZXIgYSByZXF1ZXN0LCBvciBldmVyeSBfTUFYX1dPUkRTX1BFUl9CVVJTVCB3b3Jkcy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2tleSA9IHRoaXMuX2dlbjR3b3JkcygpLmNvbmNhdCh0aGlzLl9nZW40d29yZHMoKSk7XG4gICAgICAgIHRoaXMuX2NpcGhlciA9IG5ldyBzamNsLmNpcGhlci5hZXModGhpcy5fa2V5KTtcbiAgICB9LFxuICAgIC8qKiBSZXNlZWQgdGhlIGdlbmVyYXRvciB3aXRoIHRoZSBnaXZlbiB3b3Jkc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Jlc2VlZDogZnVuY3Rpb24gKHNlZWRXb3Jkcykge1xuICAgICAgICB0aGlzLl9rZXkgPSBzamNsLmhhc2guc2hhMjU2Lmhhc2godGhpcy5fa2V5LmNvbmNhdChzZWVkV29yZHMpKTtcbiAgICAgICAgdGhpcy5fY2lwaGVyID0gbmV3IHNqY2wuY2lwaGVyLmFlcyh0aGlzLl9rZXkpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5fY291bnRlcltpXSA9ICh0aGlzLl9jb3VudGVyW2ldICsgMSkgfCAwO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NvdW50ZXJbaV0pIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqIHJlc2VlZCB0aGUgZGF0YSBmcm9tIHRoZSBlbnRyb3B5IHBvb2xzXG4gICAgICogQHBhcmFtIGZ1bGwgSWYgc2V0LCB1c2UgYWxsIHRoZSBlbnRyb3B5IHBvb2xzIGluIHRoZSByZXNlZWQuXG4gICAgICovXG4gICAgX3Jlc2VlZEZyb21Qb29sczogZnVuY3Rpb24gKGZ1bGwpIHtcbiAgICAgICAgdmFyIHJlc2VlZERhdGEgPSBbXSwgc3RyZW5ndGggPSAwLCBpO1xuICAgICAgICB0aGlzLl9uZXh0UmVzZWVkID0gcmVzZWVkRGF0YVswXSA9IG5ldyBEYXRlKCkudmFsdWVPZigpICsgdGhpcy5fTUlMTElTRUNPTkRTX1BFUl9SRVNFRUQ7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgICAgICAvKiBPbiBzb21lIGJyb3dzZXJzLCB0aGlzIGlzIGNyeXB0b2dyYXBoaWNhbGx5IHJhbmRvbS4gIFNvIHdlIG1pZ2h0XG4gICAgICAgICAgICAgKiBhcyB3ZWxsIHRvc3MgaXQgaW4gdGhlIHBvdCBhbmQgc3Rpci4uLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXNlZWREYXRhLnB1c2goKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgfCAwKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5fcG9vbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc2VlZERhdGEgPSByZXNlZWREYXRhLmNvbmNhdCh0aGlzLl9wb29sc1tpXS5maW5hbGl6ZSgpKTtcbiAgICAgICAgICAgIHN0cmVuZ3RoICs9IHRoaXMuX3Bvb2xFbnRyb3B5W2ldO1xuICAgICAgICAgICAgdGhpcy5fcG9vbEVudHJvcHlbaV0gPSAwO1xuICAgICAgICAgICAgaWYgKCFmdWxsICYmIHRoaXMuX3Jlc2VlZENvdW50ICYgKDEgPDwgaSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpZiB3ZSB1c2VkIHRoZSBsYXN0IHBvb2wsIHB1c2ggYSBuZXcgb25lIG9udG8gdGhlIHN0YWNrICovXG4gICAgICAgIGlmICh0aGlzLl9yZXNlZWRDb3VudCA+PSAxIDw8IHRoaXMuX3Bvb2xzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fcG9vbHMucHVzaChuZXcgc2pjbC5oYXNoLnNoYTI1NigpKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xFbnRyb3B5LnB1c2goMCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaG93IHN0cm9uZyB3YXMgdGhpcyByZXNlZWQ/ICovXG4gICAgICAgIHRoaXMuX3Bvb2xTdHJlbmd0aCAtPSBzdHJlbmd0aDtcbiAgICAgICAgaWYgKHN0cmVuZ3RoID4gdGhpcy5fc3RyZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVuZ3RoID0gc3RyZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVzZWVkQ291bnQrKztcbiAgICAgICAgdGhpcy5fcmVzZWVkKHJlc2VlZERhdGEpO1xuICAgIH0sXG59O1xuLyoqIGFuIGluc3RhbmNlIGZvciB0aGUgcHJuZy5cbiAqIEBzZWUgc2pjbC5wcm5nXG4gKi9cbi8qIFRVVEFPLmFybTogcmVtb3ZlZCBzdGF0aWMgcmFuZG9taXplciBpbnN0YW5jZSBiZWNhdXNlIHdlIGhhdmUgb3VyIG93blxuc2pjbC5yYW5kb20gPSBuZXcgc2pjbC5wcm5nKDYpO1xuXG4oZnVuY3Rpb24gKCkge1xuICAgIC8vIGZ1bmN0aW9uIGZvciBnZXR0aW5nIG5vZGVqcyBjcnlwdG8gbW9kdWxlLiBjYXRjaGVzIGFuZCBpZ25vcmVzIGVycm9ycy5cbiAgICBmdW5jdGlvbiBnZXRDcnlwdG9Nb2R1bGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gcmVxdWlyZSgnY3J5cHRvJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIGJ1ZiwgY3J5cHQsIGFiO1xuXG4gICAgICAgIC8vIGdldCBjcnlwdG9ncmFwaGljYWxseSBzdHJvbmcgZW50cm9weSBkZXBlbmRpbmcgb24gcnVudGltZSBlbnZpcm9ubWVudFxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgJiYgKGNyeXB0ID0gZ2V0Q3J5cHRvTW9kdWxlKCkpICYmIGNyeXB0LnJhbmRvbUJ5dGVzKSB7XG4gICAgICAgICAgICBidWYgPSBjcnlwdC5yYW5kb21CeXRlcygxMDI0IC8gOCk7XG4gICAgICAgICAgICBidWYgPSBuZXcgVWludDMyQXJyYXkobmV3IFVpbnQ4QXJyYXkoYnVmKS5idWZmZXIpO1xuICAgICAgICAgICAgc2pjbC5yYW5kb20uYWRkRW50cm9weShidWYsIDEwMjQsIFwiY3J5cHRvLnJhbmRvbUJ5dGVzXCIpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIFVpbnQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYWIgPSBuZXcgVWludDMyQXJyYXkoMzIpO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5jcnlwdG8gJiYgd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhYik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5tc0NyeXB0byAmJiB3aW5kb3cubXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgd2luZG93Lm1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhYik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZ2V0IGNyeXB0b2dyYXBoaWNhbGx5IHN0cm9uZyBlbnRyb3B5IGluIFdlYmtpdFxuICAgICAgICAgICAgc2pjbC5yYW5kb20uYWRkRW50cm9weShhYiwgMTAyNCwgXCJjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzXCIpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBubyBnZXRSYW5kb21WYWx1ZXMgOi0oXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY29uc29sZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYW4gZXJyb3IgY29sbGVjdGluZyBlbnRyb3B5IGZyb20gdGhlIGJyb3dzZXI6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAvL3dlIGRvIG5vdCB3YW50IHRoZSBsaWJyYXJ5IHRvIGZhaWwgZHVlIHRvIHJhbmRvbW5lc3Mgbm90IGJlaW5nIG1haW50YWluZWQuXG4gICAgICAgIH1cbiAgICB9XG4gfSgpKTsqL1xuLyoqXG4gKiBBcnJheUJ1ZmZlclxuICogQG5hbWVzcGFjZVxuICovXG5zamNsLmNvZGVjLmFycmF5QnVmZmVyID0ge1xuICAgIC8qKiBDb252ZXJ0IGZyb20gYSBiaXRBcnJheSB0byBhbiBBcnJheUJ1ZmZlci5cbiAgICAgKiBXaWxsIGRlZmF1bHQgdG8gOGJ5dGUgcGFkZGluZyBpZiBwYWRkaW5nIGlzIHVuZGVmaW5lZCovXG4gICAgZnJvbUJpdHM6IGZ1bmN0aW9uIChhcnIsIHBhZGRpbmcsIHBhZGRpbmdfY291bnQpIHtcbiAgICAgICAgdmFyIG91dCwgaSwgb2wsIHRtcCwgc21hbGxlc3Q7XG4gICAgICAgIHBhZGRpbmcgPSBwYWRkaW5nID09IHVuZGVmaW5lZCA/IHRydWUgOiBwYWRkaW5nO1xuICAgICAgICBwYWRkaW5nX2NvdW50ID0gcGFkZGluZ19jb3VudCB8fCA4O1xuICAgICAgICBpZiAoYXJyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBcnJheUJ1ZmZlcigwKTtcbiAgICAgICAgfVxuICAgICAgICBvbCA9IHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGFycikgLyA4O1xuICAgICAgICAvL2NoZWNrIHRvIG1ha2Ugc3VyZSB0aGUgYml0TGVuZ3RoIGlzIGRpdmlzaWJsZSBieSA4LCBpZiBpdCBpc24ndFxuICAgICAgICAvL3dlIGNhbid0IGRvIGFueXRoaW5nIHNpbmNlIGFycmF5YnVmZmVycyB3b3JrIHdpdGggYnl0ZXMsIG5vdCBiaXRzXG4gICAgICAgIGlmIChzamNsLmJpdEFycmF5LmJpdExlbmd0aChhcnIpICUgOCAhPT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJJbnZhbGlkIGJpdCBzaXplLCBtdXN0IGJlIGRpdmlzYmxlIGJ5IDggdG8gZml0IGluIGFuIGFycmF5YnVmZmVyIGNvcnJlY3RseVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFkZGluZyAmJiBvbCAlIHBhZGRpbmdfY291bnQgIT09IDApIHtcbiAgICAgICAgICAgIG9sICs9IHBhZGRpbmdfY291bnQgLSAob2wgJSBwYWRkaW5nX2NvdW50KTtcbiAgICAgICAgfVxuICAgICAgICAvL3BhZGRlZCB0ZW1wIGZvciBlYXN5IGNvcHlpbmdcbiAgICAgICAgdG1wID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcihhcnIubGVuZ3RoICogNCkpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0bXAuc2V0VWludDMyKGkgKiA0LCBhcnJbaV0gPDwgMzIpOyAvL2dldCByaWQgb2YgdGhlIGhpZ2hlciBiaXRzXG4gICAgICAgIH1cbiAgICAgICAgLy9ub3cgY29weSB0aGUgZmluYWwgbWVzc2FnZSBpZiB3ZSBhcmUgbm90IGdvaW5nIHRvIDAgcGFkXG4gICAgICAgIG91dCA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIob2wpKTtcbiAgICAgICAgLy9zYXZlIGEgc3RlcCB3aGVuIHRoZSB0bXAgYW5kIG91dCBieXRlbGVuZ3RoIGFyZSA9PT1cbiAgICAgICAgaWYgKG91dC5ieXRlTGVuZ3RoID09PSB0bXAuYnl0ZUxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRtcC5idWZmZXI7XG4gICAgICAgIH1cbiAgICAgICAgc21hbGxlc3QgPSB0bXAuYnl0ZUxlbmd0aCA8IG91dC5ieXRlTGVuZ3RoID8gdG1wLmJ5dGVMZW5ndGggOiBvdXQuYnl0ZUxlbmd0aDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNtYWxsZXN0OyBpKyspIHtcbiAgICAgICAgICAgIG91dC5zZXRVaW50OChpLCB0bXAuZ2V0VWludDgoaSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQuYnVmZmVyO1xuICAgIH0sXG4gICAgdG9CaXRzOiBmdW5jdGlvbiAoYnVmZmVyLCBieXRlT2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gICAgICAgIHZhciBpLCBvdXQgPSBbXSwgbGVuLCBpblZpZXcsIHRtcDtcbiAgICAgICAgaWYgKGJ1ZmZlci5ieXRlTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgaW5WaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgICAgIGxlbiA9IGluVmlldy5ieXRlTGVuZ3RoIC0gKGluVmlldy5ieXRlTGVuZ3RoICUgNCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICAgICAgICAgIG91dC5wdXNoKGluVmlldy5nZXRVaW50MzIoaSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpblZpZXcuYnl0ZUxlbmd0aCAlIDQgIT0gMCkge1xuICAgICAgICAgICAgdG1wID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcig0KSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGluVmlldy5ieXRlTGVuZ3RoICUgNDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vd2Ugd2FudCB0aGUgZGF0YSB0byB0aGUgcmlnaHQsIGJlY2F1c2UgcGFydGlhbCBzbGljZXMgb2ZmIHRoZSBzdGFydGluZyBiaXRzXG4gICAgICAgICAgICAgICAgdG1wLnNldFVpbnQ4KGkgKyA0IC0gbCwgaW5WaWV3LmdldFVpbnQ4KGxlbiArIGkpKTsgLy8gYmlnLWVuZGlhbixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dC5wdXNoKHNqY2wuYml0QXJyYXkucGFydGlhbCgoaW5WaWV3LmJ5dGVMZW5ndGggJSA0KSAqIDgsIHRtcC5nZXRVaW50MzIoMCkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH0sXG59O1xuZXhwb3J0IGRlZmF1bHQgc2pjbDtcbiIsIi8vIEB0cy1pZ25vcmVbdW50eXBlZC1pbXBvcnRdXG5pbXBvcnQgc2pjbCBmcm9tIFwiLi4vaW50ZXJuYWwvc2pjbC5qc1wiO1xuaW1wb3J0IHsgQ3J5cHRvRXJyb3IgfSBmcm9tIFwiLi4vbWlzYy9DcnlwdG9FcnJvci5qc1wiO1xuLyoqXG4gKiBUaGlzIEludGVyZmFjZSBwcm92aWRlcyBhbiBhYnN0cmFjdGlvbiBvZiB0aGUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IgaW1wbGVtZW50YXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBSYW5kb21pemVyIHtcbiAgICByYW5kb207XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucmFuZG9tID0gbmV3IHNqY2wucHJuZyg2KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBlbnRyb3B5IHRvIHRoZSByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBhbGdvcml0aG1cbiAgICAgKiBAcGFyYW0gZW50cm9weUNhY2hlIHdpdGg6IG51bWJlciBBbnkgbnVtYmVyIHZhbHVlLCBlbnRyb3B5IFRoZSBhbW91bnQgb2YgZW50cm9weSBpbiB0aGUgbnVtYmVyIGluIGJpdCxcbiAgICAgKiBzb3VyY2UgVGhlIHNvdXJjZSBvZiB0aGUgbnVtYmVyLlxuICAgICAqL1xuICAgIGFkZEVudHJvcHkoZW50cm9weUNhY2hlKSB7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cm9weUNhY2hlKSB7XG4gICAgICAgICAgICB0aGlzLnJhbmRvbS5hZGRFbnRyb3B5KGVudHJ5LmRhdGEsIGVudHJ5LmVudHJvcHksIGVudHJ5LnNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBhZGRTdGF0aWNFbnRyb3B5KGJ5dGVzKSB7XG4gICAgICAgIGZvciAoY29uc3QgYnl0ZSBvZiBieXRlcykge1xuICAgICAgICAgICAgdGhpcy5yYW5kb20uYWRkRW50cm9weShieXRlLCA4LCBcInN0YXRpY1wiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBOb3QgdXNlZCBjdXJyZW50bHkgYmVjYXVzZSB3ZSBhbHdheXMgaGF2ZSBlbm91Z2ggZW50cm9weSB1c2luZyBnZXRSYW5kb21WYWx1ZXMoKVxuICAgICAqL1xuICAgIGlzUmVhZHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJhbmRvbS5pc1JlYWR5KCkgIT09IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyByYW5kb20gZGF0YS4gVGhlIGZ1bmN0aW9uIGluaXRSYW5kb21EYXRhR2VuZXJhdG9yIG11c3QgaGF2ZSBiZWVuIGNhbGxlZCBwcmlvciB0byB0aGUgZmlyc3QgY2FsbCB0byB0aGlzIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSBuYnJPZkJ5dGVzIFRoZSBudW1iZXIgb2YgYnl0ZXMgdGhlIHJhbmRvbSBkYXRhIHNoYWxsIGhhdmUuXG4gICAgICogQHJldHVybiBBIGhleCBjb2RlZCBzdHJpbmcgb2YgcmFuZG9tIGRhdGEuXG4gICAgICogQHRocm93cyB7Q3J5cHRvRXJyb3J9IGlmIHRoZSByYW5kb21pemVyIGlzIG5vdCBzZWVkZWQgKGlzUmVhZHkgPT0gZmFsc2UpXG4gICAgICovXG4gICAgZ2VuZXJhdGVSYW5kb21EYXRhKG5ick9mQnl0ZXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJlYWQgdGhlIG1pbmltYWwgbnVtYmVyIG9mIHdvcmRzIHRvIGdldCBuYnJPZkJ5dGVzXG4gICAgICAgICAgICBsZXQgbmJyT2ZXb3JkcyA9IE1hdGguZmxvb3IoKG5ick9mQnl0ZXMgKyAzKSAvIDQpO1xuICAgICAgICAgICAgbGV0IHdvcmRzID0gdGhpcy5yYW5kb20ucmFuZG9tV29yZHMobmJyT2ZXb3Jkcyk7XG4gICAgICAgICAgICBsZXQgYXJyYXlCdWZmZXIgPSBzamNsLmNvZGVjLmFycmF5QnVmZmVyLmZyb21CaXRzKHdvcmRzLCBmYWxzZSk7XG4gICAgICAgICAgICAvLyBzaW1wbHkgY3V0IG9mZiB0aGUgZXhjZWVkaW5nIGJ5dGVzXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIsIDAsIG5ick9mQnl0ZXMpOyAvLyB0cnVuY2F0ZSB0aGUgYXJyYXlidWZmZXIgYXMgcHJlY2F1dGlvblxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQ3J5cHRvRXJyb3IoXCJlcnJvciBkdXJpbmcgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uXCIsIGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgbnVtYmVyIHRoYXQgZml0cyBpbiB0aGUgcmFuZ2Ugb2YgYW4gbi1ieXRlIGludGVnZXJcbiAgICAgKi9cbiAgICBnZW5lcmF0ZVJhbmRvbU51bWJlcihuYnJPZkJ5dGVzKSB7XG4gICAgICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5nZW5lcmF0ZVJhbmRvbURhdGEobmJyT2ZCeXRlcyk7XG4gICAgICAgIGxldCByZXN1bHQgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gYnl0ZXNbaV0gPDwgKGkgKiA4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cbi8vIFRPRE8gc2luZ2xldG9uIHNob3VsZCBiZSBjcmVhdGVkIGluIHRoZSBhcHA/XG4vLyB0aGUgcmFuZG9taXplciBpbnN0YW5jZSAoc2luZ2xldG9uKSB0aGF0IHNob3VsZCBiZSB1c2VkIHRocm91Z2hvdXQgdGhlIGFwcFxuZXhwb3J0IGNvbnN0IHJhbmRvbSA9IG5ldyBSYW5kb21pemVyKCk7XG4iLCIvLyBAdHMtaWdub3JlW3VudHlwZWQtaW1wb3J0XVxuaW1wb3J0IHNqY2wgZnJvbSBcIi4uL2ludGVybmFsL3NqY2wuanNcIjtcbmNvbnN0IHNoYTI1NiA9IG5ldyBzamNsLmhhc2guc2hhMjU2KCk7XG5leHBvcnQgY29uc3QgU0hBMjU2X0hBU0hfTEVOR1RIX0JZVEVTID0gMzI7XG4vKipcbiAqIENyZWF0ZSB0aGUgaGFzaCBvZiB0aGUgZ2l2ZW4gZGF0YS5cbiAqIEBwYXJhbSB1aW50OEFycmF5IFRoZSBieXRlcy5cbiAqIEByZXR1cm4gVGhlIGhhc2guXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaGEyNTZIYXNoKHVpbnQ4QXJyYXkpIHtcbiAgICB0cnkge1xuICAgICAgICBzaGEyNTYudXBkYXRlKHNqY2wuY29kZWMuYXJyYXlCdWZmZXIudG9CaXRzKHVpbnQ4QXJyYXkuYnVmZmVyLCB1aW50OEFycmF5LmJ5dGVPZmZzZXQsIHVpbnQ4QXJyYXkuYnl0ZUxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc2pjbC5jb2RlYy5hcnJheUJ1ZmZlci5mcm9tQml0cyhzaGEyNTYuZmluYWxpemUoKSwgZmFsc2UpKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHNoYTI1Ni5yZXNldCgpO1xuICAgIH1cbn1cbiIsIi8vIEB0cy1pZ25vcmVbdW50eXBlZC1pbXBvcnRdXG5pbXBvcnQgc2pjbCBmcm9tIFwiLi4vaW50ZXJuYWwvc2pjbC5qc1wiO1xuaW1wb3J0IHsgYmFzZTY0VG9CYXNlNjRVcmwsIGJhc2U2NFRvVWludDhBcnJheSwgY29uY2F0LCBoZXhUb1VpbnQ4QXJyYXksIHVpbnQ4QXJyYXlUb0FycmF5QnVmZmVyLCB1aW50OEFycmF5VG9CYXNlNjQgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCI7XG5pbXBvcnQgeyBDcnlwdG9FcnJvciB9IGZyb20gXCIuL0NyeXB0b0Vycm9yLmpzXCI7XG5pbXBvcnQgeyBzaGEyNTZIYXNoIH0gZnJvbSBcIi4uL2hhc2hlcy9TaGEyNTYuanNcIjtcbmNvbnN0IFBBRERJTkdfQkxPQ0tfTEVOR1RIID0gMTY7IC8vIHNhbWUgZm9yIGFlczEyOCBhbmQgYWVzMjU2IGFzIHRoZSBibG9jayBzaXplIGlzIGFsd2F5cyAxNiBieXRlXG5leHBvcnQgZnVuY3Rpb24gcGFkQWVzKGJ5dGVzKSB7XG4gICAgbGV0IHBhZGRpbmdMZW5ndGggPSBQQURESU5HX0JMT0NLX0xFTkdUSCAtIChieXRlcy5ieXRlTGVuZ3RoICUgUEFERElOR19CTE9DS19MRU5HVEgpO1xuICAgIGxldCBwYWRkaW5nID0gbmV3IFVpbnQ4QXJyYXkocGFkZGluZ0xlbmd0aCk7XG4gICAgcGFkZGluZy5maWxsKHBhZGRpbmdMZW5ndGgpO1xuICAgIHJldHVybiBjb25jYXQoYnl0ZXMsIHBhZGRpbmcpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHVucGFkQWVzKGJ5dGVzKSB7XG4gICAgbGV0IHBhZGRpbmdMZW5ndGggPSBieXRlc1tieXRlcy5ieXRlTGVuZ3RoIC0gMV07XG4gICAgaWYgKHBhZGRpbmdMZW5ndGggPT09IDAgfHwgcGFkZGluZ0xlbmd0aCA+IGJ5dGVzLmJ5dGVMZW5ndGggfHwgcGFkZGluZ0xlbmd0aCA+IFBBRERJTkdfQkxPQ0tfTEVOR1RIKSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihcImludmFsaWQgcGFkZGluZzogXCIgKyBwYWRkaW5nTGVuZ3RoKTtcbiAgICB9XG4gICAgbGV0IGxlbmd0aCA9IGJ5dGVzLmJ5dGVMZW5ndGggLSBwYWRkaW5nTGVuZ3RoO1xuICAgIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xuICAgIHJlc3VsdC5zZXQoYnl0ZXMuc3ViYXJyYXkoMCwgbGVuZ3RoKSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogQ3JlYXRlcyB0aGUgYXV0aCB2ZXJpZmllciBmcm9tIHRoZSBwYXNzd29yZCBrZXkuXG4gKiBAcGFyYW0gcGFzc3dvcmRLZXkgVGhlIGtleS5cbiAqIEByZXR1cm5zIFRoZSBhdXRoIHZlcmlmaWVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdXRoVmVyaWZpZXIocGFzc3dvcmRLZXkpIHtcbiAgICAvLyBUT0RPIENvbXBhdGliaWxpdHkgVGVzdFxuICAgIHJldHVybiBzaGEyNTZIYXNoKGJpdEFycmF5VG9VaW50OEFycmF5KHBhc3N3b3JkS2V5KSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXV0aFZlcmlmaWVyQXNCYXNlNjRVcmwocGFzc3dvcmRLZXkpIHtcbiAgICByZXR1cm4gYmFzZTY0VG9CYXNlNjRVcmwodWludDhBcnJheVRvQmFzZTY0KGNyZWF0ZUF1dGhWZXJpZmllcihwYXNzd29yZEtleSkpKTtcbn1cbi8qKlxuICogUHJvdmlkZXMgdGhlIGluZm9ybWF0aW9uIGlmIGEga2V5IGlzIDEyOCBvciAyNTYgYml0IGxlbmd0aC5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleS5cbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGtleSBsZW5ndGggaXMgMTI4LCBmYWxzZSBpZiB0aGUga2V5IGxlbmd0aCBpcyAyNTYgYml0LlxuICogQHRocm93cyBJZiB0aGUga2V5IGlzIG5vdCAxMjggYml0IGFuZCBub3QgMjU2IGJpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSXMxMjhCaXRLZXkoa2V5KSB7XG4gICAgbGV0IGJpdExlbmd0aCA9IHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGtleSk7XG4gICAgaWYgKGJpdExlbmd0aCA9PT0gMTI4KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChiaXRMZW5ndGggPT09IDI1Nikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgQ3J5cHRvRXJyb3IoXCJpbnZhbGlkIGtleSBiaXQgbGVuZ3RoOiBcIiArIGJpdExlbmd0aCk7XG4gICAgfVxufVxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgZ2l2ZW4gQml0QXJyYXkgKFNKQ0wpIHRvIGFuIFVpbnQ4QXJyYXkuXG4gKiBAcGFyYW0gYml0cyBUaGUgQml0QXJyYXkuXG4gKiBAcmV0dXJuIFRoZSB1aW50OGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYml0QXJyYXlUb1VpbnQ4QXJyYXkoYml0cykge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShzamNsLmNvZGVjLmFycmF5QnVmZmVyLmZyb21CaXRzKGJpdHMsIGZhbHNlKSk7XG59XG4vKipcbiAqIENvbnZlcnRzIHRoZSBnaXZlbiB1aW50OGFycmF5IHRvIGEgQml0QXJyYXkgKFNKQ0wpLlxuICogQHBhcmFtIHVpbnQ4QXJyYXkgVGhlIHVpbnQ4QXJyYXkga2V5LlxuICogQHJldHVybiBUaGUga2V5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdWludDhBcnJheVRvQml0QXJyYXkodWludDhBcnJheSkge1xuICAgIHJldHVybiBzamNsLmNvZGVjLmFycmF5QnVmZmVyLnRvQml0cyh1aW50OEFycmF5VG9BcnJheUJ1ZmZlcih1aW50OEFycmF5KSk7XG59XG4vKipcbiAqIENvbnZlcnRzIHRoZSBnaXZlbiBrZXkgdG8gYSBiYXNlNjQgY29kZWQgc3RyaW5nLlxuICogQHBhcmFtIGtleSBUaGUga2V5LlxuICogQHJldHVybiBUaGUgYmFzZTY0IGNvZGVkIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUga2V5LlxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5VG9CYXNlNjQoa2V5KSB7XG4gICAgcmV0dXJuIHNqY2wuY29kZWMuYmFzZTY0LmZyb21CaXRzKGtleSk7XG59XG4vKipcbiAqIENvbnZlcnRzIHRoZSBnaXZlbiBiYXNlNjQgY29kZWQgc3RyaW5nIHRvIGEga2V5LlxuICogQHBhcmFtIGJhc2U2NCBUaGUgYmFzZTY0IGNvZGVkIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUga2V5LlxuICogQHJldHVybiBUaGUga2V5LlxuICogQHRocm93cyB7Q3J5cHRvRXJyb3J9IElmIHRoZSBjb252ZXJzaW9uIGZhaWxzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9LZXkoYmFzZTY0KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHNqY2wuY29kZWMuYmFzZTY0LnRvQml0cyhiYXNlNjQpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgQ3J5cHRvRXJyb3IoXCJoZXggdG8gYWVzIGtleSBmYWlsZWRcIiwgZSk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHVpbnQ4QXJyYXlUb0tleShhcnJheSkge1xuICAgIHJldHVybiBiYXNlNjRUb0tleSh1aW50OEFycmF5VG9CYXNlNjQoYXJyYXkpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBrZXlUb1VpbnQ4QXJyYXkoa2V5KSB7XG4gICAgcmV0dXJuIGJhc2U2NFRvVWludDhBcnJheShrZXlUb0Jhc2U2NChrZXkpKTtcbn1cbmV4cG9ydCBjb25zdCBmaXhlZEl2ID0gaGV4VG9VaW50OEFycmF5KFwiODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODhcIik7XG4iLCIvLyBAdHMtaWdub3JlW3VudHlwZWQtaW1wb3J0XVxuaW1wb3J0IHNqY2wgZnJvbSBcIi4uL2ludGVybmFsL3NqY2wuanNcIjtcbmNvbnN0IHNoYTUxMiA9IG5ldyBzamNsLmhhc2guc2hhNTEyKCk7XG5leHBvcnQgY29uc3QgU0hBNTEyX0hBU0hfTEVOR1RIX0JZVEVTID0gNjQ7XG4vKipcbiAqIENyZWF0ZSB0aGUgaGFzaCBvZiB0aGUgZ2l2ZW4gZGF0YS5cbiAqIEBwYXJhbSB1aW50OEFycmF5IFRoZSBieXRlcy5cbiAqIEByZXR1cm4gVGhlIGhhc2guXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaGE1MTJIYXNoKHVpbnQ4QXJyYXkpIHtcbiAgICB0cnkge1xuICAgICAgICBzaGE1MTIudXBkYXRlKHNqY2wuY29kZWMuYXJyYXlCdWZmZXIudG9CaXRzKHVpbnQ4QXJyYXkuYnVmZmVyLCB1aW50OEFycmF5LmJ5dGVPZmZzZXQsIHVpbnQ4QXJyYXkuYnl0ZUxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc2pjbC5jb2RlYy5hcnJheUJ1ZmZlci5mcm9tQml0cyhzaGE1MTIuZmluYWxpemUoKSwgZmFsc2UpKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHNoYTUxMi5yZXNldCgpO1xuICAgIH1cbn1cbiIsImltcG9ydCBzamNsIGZyb20gXCIuLi9pbnRlcm5hbC9zamNsLmpzXCI7XG5pbXBvcnQgeyBiaXRBcnJheVRvVWludDhBcnJheSwgdWludDhBcnJheVRvQml0QXJyYXkgfSBmcm9tIFwiLi4vbWlzYy9VdGlscy5qc1wiO1xuaW1wb3J0IHsgYXJyYXlFcXVhbHMgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCI7XG5pbXBvcnQgeyBDcnlwdG9FcnJvciB9IGZyb20gXCIuLi9taXNjL0NyeXB0b0Vycm9yLmpzXCI7XG4vKipcbiAqIENyZWF0ZSBhbiBITUFDLVNIQS0yNTYgdGFnIG92ZXIgdGhlIGdpdmVuIGRhdGEgdXNpbmcgdGhlIGdpdmVuIGtleS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhtYWNTaGEyNTYoa2V5LCBkYXRhKSB7XG4gICAgY29uc3QgaG1hYyA9IG5ldyBzamNsLm1pc2MuaG1hYyhrZXksIHNqY2wuaGFzaC5zaGEyNTYpO1xuICAgIHJldHVybiBiaXRBcnJheVRvVWludDhBcnJheShobWFjLmVuY3J5cHQodWludDhBcnJheVRvQml0QXJyYXkoZGF0YSkpKTtcbn1cbi8qKlxuICogVmVyaWZ5IGFuIEhNQUMtU0hBLTI1NiB0YWcgYWdhaW5zdCB0aGUgZ2l2ZW4gZGF0YSBhbmQga2V5LlxuICogQHRocm93cyBDcnlwdG9FcnJvciBpZiB0aGUgdGFnIGRvZXMgbm90IG1hdGNoIHRoZSBkYXRhIGFuZCBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlIbWFjU2hhMjU2KGtleSwgZGF0YSwgdGFnKSB7XG4gICAgY29uc3QgY29tcHV0ZWRUYWcgPSBobWFjU2hhMjU2KGtleSwgZGF0YSk7XG4gICAgaWYgKCFhcnJheUVxdWFscyhjb21wdXRlZFRhZywgdGFnKSkge1xuICAgICAgICB0aHJvdyBuZXcgQ3J5cHRvRXJyb3IoXCJpbnZhbGlkIG1hY1wiKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgc2pjbCBmcm9tIFwiLi4vaW50ZXJuYWwvc2pjbC5qc1wiO1xuaW1wb3J0IHsgcmFuZG9tIH0gZnJvbSBcIi4uL3JhbmRvbS9SYW5kb21pemVyLmpzXCI7XG5pbXBvcnQgeyBiaXRBcnJheVRvVWludDhBcnJheSwgdWludDhBcnJheVRvQml0QXJyYXkgfSBmcm9tIFwiLi4vbWlzYy9VdGlscy5qc1wiO1xuaW1wb3J0IHsgYXNzZXJ0Tm90TnVsbCwgY29uY2F0LCB1aW50OEFycmF5VG9CYXNlNjQgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCI7XG5pbXBvcnQgeyBzaGEyNTZIYXNoIH0gZnJvbSBcIi4uL2hhc2hlcy9TaGEyNTYuanNcIjtcbmltcG9ydCB7IENyeXB0b0Vycm9yIH0gZnJvbSBcIi4uL21pc2MvQ3J5cHRvRXJyb3IuanNcIjtcbmltcG9ydCB7IHNoYTUxMkhhc2ggfSBmcm9tIFwiLi4vaGFzaGVzL1NoYTUxMi5qc1wiO1xuaW1wb3J0IHsgaG1hY1NoYTI1NiwgdmVyaWZ5SG1hY1NoYTI1NiB9IGZyb20gXCIuL0htYWMuanNcIjtcbmV4cG9ydCBjb25zdCBFTkFCTEVfTUFDID0gdHJ1ZTtcbmV4cG9ydCBjb25zdCBJVl9CWVRFX0xFTkdUSCA9IDE2O1xuZXhwb3J0IGNvbnN0IEtFWV9MRU5HVEhfQllURVNfQUVTXzI1NiA9IDMyO1xuZXhwb3J0IGNvbnN0IEtFWV9MRU5HVEhfQklUU19BRVNfMjU2ID0gS0VZX0xFTkdUSF9CWVRFU19BRVNfMjU2ICogODtcbmV4cG9ydCBjb25zdCBLRVlfTEVOR1RIX0JZVEVTX0FFU18xMjggPSAxNjtcbmNvbnN0IEtFWV9MRU5HVEhfQklUU19BRVNfMTI4ID0gS0VZX0xFTkdUSF9CWVRFU19BRVNfMTI4ICogODtcbmV4cG9ydCBjb25zdCBNQUNfRU5BQkxFRF9QUkVGSVggPSAxO1xuY29uc3QgTUFDX0xFTkdUSF9CWVRFUyA9IDMyO1xuLyoqXG4gKiBAcmV0dXJuIHRoZSBrZXkgbGVuZ3RoIGluIGJ5dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlMZW5ndGhCeXRlcyhrZXkpIHtcbiAgICAvLyBzdG9yZWQgYXMgYW4gYXJyYXkgb2YgMzItYml0ICg0IGJ5dGUpIGludGVnZXJzXG4gICAgcmV0dXJuIGtleS5sZW5ndGggKiA0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFlczI1NlJhbmRvbUtleSgpIHtcbiAgICByZXR1cm4gdWludDhBcnJheVRvQml0QXJyYXkocmFuZG9tLmdlbmVyYXRlUmFuZG9tRGF0YShLRVlfTEVOR1RIX0JZVEVTX0FFU18yNTYpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUlWKCkge1xuICAgIHJldHVybiByYW5kb20uZ2VuZXJhdGVSYW5kb21EYXRhKElWX0JZVEVfTEVOR1RIKTtcbn1cbi8qKlxuICogRW5jcnlwdHMgYnl0ZXMgd2l0aCBBRVMxMjggb3IgQUVTMjU2IGluIENCQyBtb2RlLlxuICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHVzZSBmb3IgdGhlIGVuY3J5cHRpb24uXG4gKiBAcGFyYW0gYnl0ZXMgVGhlIHBsYWluIHRleHQuXG4gKiBAcGFyYW0gaXYgVGhlIGluaXRpYWxpemF0aW9uIHZlY3Rvci5cbiAqIEBwYXJhbSB1c2VQYWRkaW5nIElmIHRydWUsIHBhZGRpbmcgaXMgdXNlZCwgb3RoZXJ3aXNlIG5vIHBhZGRpbmcgaXMgdXNlZCBhbmQgdGhlIGVuY3J5cHRlZCBkYXRhIG11c3QgaGF2ZSB0aGUga2V5IHNpemUuXG4gKiBAcGFyYW0gdXNlTWFjIElmIHRydWUsIHVzZSBITUFDIChub3RlIHRoYXQgdGhpcyBpcyByZXF1aXJlZCBmb3IgQUVTLTI1NilcbiAqIEByZXR1cm4gVGhlIGVuY3J5cHRlZCBieXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWVzRW5jcnlwdChrZXksIGJ5dGVzLCBpdiA9IGdlbmVyYXRlSVYoKSwgdXNlUGFkZGluZyA9IHRydWUsIHVzZU1hYyA9IHRydWUpIHtcbiAgICB2ZXJpZnlLZXlTaXplKGtleSwgW0tFWV9MRU5HVEhfQklUU19BRVNfMTI4LCBLRVlfTEVOR1RIX0JJVFNfQUVTXzI1Nl0pO1xuICAgIGlmIChpdi5sZW5ndGggIT09IElWX0JZVEVfTEVOR1RIKSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihgSWxsZWdhbCBJViBsZW5ndGg6ICR7aXYubGVuZ3RofSAoZXhwZWN0ZWQ6ICR7SVZfQllURV9MRU5HVEh9KTogJHt1aW50OEFycmF5VG9CYXNlNjQoaXYpfSBgKTtcbiAgICB9XG4gICAgaWYgKCF1c2VNYWMgJiYgZ2V0S2V5TGVuZ3RoQnl0ZXMoa2V5KSA9PT0gS0VZX0xFTkdUSF9CWVRFU19BRVNfMjU2KSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihgQ2FuJ3QgdXNlIEFFUy0yNTYgd2l0aG91dCBNQUNgKTtcbiAgICB9XG4gICAgbGV0IHN1YktleXMgPSBnZXRBZXNTdWJLZXlzKGtleSwgdXNlTWFjKTtcbiAgICBsZXQgZW5jcnlwdGVkQml0cyA9IHNqY2wubW9kZS5jYmMuZW5jcnlwdChuZXcgc2pjbC5jaXBoZXIuYWVzKHN1YktleXMuY0tleSksIHVpbnQ4QXJyYXlUb0JpdEFycmF5KGJ5dGVzKSwgdWludDhBcnJheVRvQml0QXJyYXkoaXYpLCBbXSwgdXNlUGFkZGluZyk7XG4gICAgbGV0IGRhdGEgPSBjb25jYXQoaXYsIGJpdEFycmF5VG9VaW50OEFycmF5KGVuY3J5cHRlZEJpdHMpKTtcbiAgICBpZiAodXNlTWFjKSB7XG4gICAgICAgIGNvbnN0IG1hY0J5dGVzID0gaG1hY1NoYTI1Nihhc3NlcnROb3ROdWxsKHN1YktleXMubUtleSksIGRhdGEpO1xuICAgICAgICBkYXRhID0gY29uY2F0KG5ldyBVaW50OEFycmF5KFtNQUNfRU5BQkxFRF9QUkVGSVhdKSwgZGF0YSwgbWFjQnl0ZXMpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbn1cbi8qKlxuICogRW5jcnlwdHMgYnl0ZXMgd2l0aCBBRVMgMjU2IGluIENCQyBtb2RlIHdpdGhvdXQgbWFjLiBUaGlzIGlzIGxlZ2FjeSBjb2RlIGFuZCBzaG91bGQgYmUgcmVtb3ZlZCBvbmNlIHRoZSBpbmRleCBoYXMgYmVlbiBtaWdyYXRlZC5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byB1c2UgZm9yIHRoZSBlbmNyeXB0aW9uLlxuICogQHBhcmFtIGJ5dGVzIFRoZSBwbGFpbiB0ZXh0LlxuICogQHBhcmFtIGl2IFRoZSBpbml0aWFsaXphdGlvbiB2ZWN0b3IgKG9ubHkgdG8gYmUgcGFzc2VkIGZvciB0ZXN0aW5nKS5cbiAqIEBwYXJhbSB1c2VQYWRkaW5nIElmIHRydWUsIHBhZGRpbmcgaXMgdXNlZCwgb3RoZXJ3aXNlIG5vIHBhZGRpbmcgaXMgdXNlZCBhbmQgdGhlIGVuY3J5cHRlZCBkYXRhIG11c3QgaGF2ZSB0aGUga2V5IHNpemUuXG4gKiBAcmV0dXJuIFRoZSBlbmNyeXB0ZWQgdGV4dCBhcyB3b3JkcyAoc2pjbCBpbnRlcm5hbCBzdHJ1Y3R1cmUpLi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFlczI1NkVuY3J5cHRTZWFyY2hJbmRleEVudHJ5KGtleSwgYnl0ZXMsIGl2ID0gZ2VuZXJhdGVJVigpLCB1c2VQYWRkaW5nID0gdHJ1ZSkge1xuICAgIHZlcmlmeUtleVNpemUoa2V5LCBbS0VZX0xFTkdUSF9CSVRTX0FFU18yNTZdKTtcbiAgICBpZiAoaXYubGVuZ3RoICE9PSBJVl9CWVRFX0xFTkdUSCkge1xuICAgICAgICB0aHJvdyBuZXcgQ3J5cHRvRXJyb3IoYElsbGVnYWwgSVYgbGVuZ3RoOiAke2l2Lmxlbmd0aH0gKGV4cGVjdGVkOiAke0lWX0JZVEVfTEVOR1RIfSk6ICR7dWludDhBcnJheVRvQmFzZTY0KGl2KX0gYCk7XG4gICAgfVxuICAgIGxldCBzdWJLZXlzID0gZ2V0QWVzU3ViS2V5cyhrZXksIGZhbHNlKTtcbiAgICBsZXQgZW5jcnlwdGVkQml0cyA9IHNqY2wubW9kZS5jYmMuZW5jcnlwdChuZXcgc2pjbC5jaXBoZXIuYWVzKHN1YktleXMuY0tleSksIHVpbnQ4QXJyYXlUb0JpdEFycmF5KGJ5dGVzKSwgdWludDhBcnJheVRvQml0QXJyYXkoaXYpLCBbXSwgdXNlUGFkZGluZyk7XG4gICAgbGV0IGRhdGEgPSBjb25jYXQoaXYsIGJpdEFycmF5VG9VaW50OEFycmF5KGVuY3J5cHRlZEJpdHMpKTtcbiAgICByZXR1cm4gZGF0YTtcbn1cbi8qKlxuICogRGVjcnlwdHMgdGhlIGdpdmVuIHdvcmRzIHdpdGggQUVTLTEyOC8yNTYgaW4gQ0JDIG1vZGUgKHdpdGggSE1BQy1TSEEtMjU2IGFzIG1hYykuIFRoZSBtYWMgaXMgZW5mb3JjZWQgZm9yIEFFUy0yNTYgYnV0IG9wdGlvbmFsIGZvciBBRVMtMTI4LlxuICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHVzZSBmb3IgdGhlIGRlY3J5cHRpb24uXG4gKiBAcGFyYW0gZW5jcnlwdGVkQnl0ZXMgVGhlIGNpcGhlcnRleHQgZW5jb2RlZCBhcyBieXRlcy5cbiAqIEBwYXJhbSB1c2VQYWRkaW5nIElmIHRydWUsIHBhZGRpbmcgaXMgdXNlZCwgb3RoZXJ3aXNlIG5vIHBhZGRpbmcgaXMgdXNlZCBhbmQgdGhlIGVuY3J5cHRlZCBkYXRhIG11c3QgaGF2ZSB0aGUga2V5IHNpemUuXG4gKiBAcmV0dXJuIFRoZSBkZWNyeXB0ZWQgYnl0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZXNEZWNyeXB0KGtleSwgZW5jcnlwdGVkQnl0ZXMsIHVzZVBhZGRpbmcgPSB0cnVlKSB7XG4gICAgY29uc3Qga2V5TGVuZ3RoID0gZ2V0S2V5TGVuZ3RoQnl0ZXMoa2V5KTtcbiAgICBpZiAoa2V5TGVuZ3RoID09PSBLRVlfTEVOR1RIX0JZVEVTX0FFU18xMjgpIHtcbiAgICAgICAgcmV0dXJuIGFlc0RlY3J5cHRJbXBsKGtleSwgZW5jcnlwdGVkQnl0ZXMsIHVzZVBhZGRpbmcsIGZhbHNlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBhZXNEZWNyeXB0SW1wbChrZXksIGVuY3J5cHRlZEJ5dGVzLCB1c2VQYWRkaW5nLCB0cnVlKTtcbiAgICB9XG59XG4vKipcbiAqIERlY3J5cHRzIHRoZSBnaXZlbiB3b3JkcyB3aXRoIEFFUy0xMjgvIEFFUy0yNTYgaW4gQ0JDIG1vZGUgd2l0aCBITUFDLVNIQS0yNTYgYXMgbWFjLiBFbmZvcmNlcyB0aGUgbWFjLlxuICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHVzZSBmb3IgdGhlIGRlY3J5cHRpb24uXG4gKiBAcGFyYW0gZW5jcnlwdGVkQnl0ZXMgVGhlIGNpcGhlcnRleHQgZW5jb2RlZCBhcyBieXRlcy5cbiAqIEBwYXJhbSB1c2VQYWRkaW5nIElmIHRydWUsIHBhZGRpbmcgaXMgdXNlZCwgb3RoZXJ3aXNlIG5vIHBhZGRpbmcgaXMgdXNlZCBhbmQgdGhlIGVuY3J5cHRlZCBkYXRhIG11c3QgaGF2ZSB0aGUga2V5IHNpemUuXG4gKiBAcmV0dXJuIFRoZSBkZWNyeXB0ZWQgYnl0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdXRoZW50aWNhdGVkQWVzRGVjcnlwdChrZXksIGVuY3J5cHRlZEJ5dGVzLCB1c2VQYWRkaW5nID0gdHJ1ZSkge1xuICAgIHJldHVybiBhZXNEZWNyeXB0SW1wbChrZXksIGVuY3J5cHRlZEJ5dGVzLCB1c2VQYWRkaW5nLCB0cnVlKTtcbn1cbi8qKlxuICogRGVjcnlwdHMgdGhlIGdpdmVuIHdvcmRzIHdpdGggQUVTLTEyOC8yNTYgaW4gQ0JDIG1vZGUuIERvZXMgbm90IGVuZm9yY2UgYSBtYWMuXG4gKiBXZSBhbHdheXMgbXVzdCBlbmZvcmNlIG1hY3MuIFRoaXMgb25seSBleGlzdHMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgaW4gc29tZSBleGNlcHRpb25hbCBjYXNlcyBsaWtlIHNlYXJjaCBpbmRleCBlbnRyeSBlbmNyeXB0aW9uLlxuICpcbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byB1c2UgZm9yIHRoZSBkZWNyeXB0aW9uLlxuICogQHBhcmFtIGVuY3J5cHRlZEJ5dGVzIFRoZSBjaXBoZXJ0ZXh0IGVuY29kZWQgYXMgYnl0ZXMuXG4gKiBAcGFyYW0gdXNlUGFkZGluZyBJZiB0cnVlLCBwYWRkaW5nIGlzIHVzZWQsIG90aGVyd2lzZSBubyBwYWRkaW5nIGlzIHVzZWQgYW5kIHRoZSBlbmNyeXB0ZWQgZGF0YSBtdXN0IGhhdmUgdGhlIGtleSBzaXplLlxuICogQHJldHVybiBUaGUgZGVjcnlwdGVkIGJ5dGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5hdXRoZW50aWNhdGVkQWVzRGVjcnlwdChrZXksIGVuY3J5cHRlZEJ5dGVzLCB1c2VQYWRkaW5nID0gdHJ1ZSkge1xuICAgIHJldHVybiBhZXNEZWNyeXB0SW1wbChrZXksIGVuY3J5cHRlZEJ5dGVzLCB1c2VQYWRkaW5nLCBmYWxzZSk7XG59XG4vKipcbiAqIERlY3J5cHRzIHRoZSBnaXZlbiB3b3JkcyB3aXRoIEFFUy0xMjgvMjU2IGluIENCQyBtb2RlLlxuICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHVzZSBmb3IgdGhlIGRlY3J5cHRpb24uXG4gKiBAcGFyYW0gZW5jcnlwdGVkQnl0ZXMgVGhlIGNpcGhlcnRleHQgZW5jb2RlZCBhcyBieXRlcy5cbiAqIEBwYXJhbSB1c2VQYWRkaW5nIElmIHRydWUsIHBhZGRpbmcgaXMgdXNlZCwgb3RoZXJ3aXNlIG5vIHBhZGRpbmcgaXMgdXNlZCBhbmQgdGhlIGVuY3J5cHRlZCBkYXRhIG11c3QgaGF2ZSB0aGUga2V5IHNpemUuXG4gKiBAcGFyYW0gZW5mb3JjZU1hYyBpZiB0cnVlIGRlY3J5cHRpb24gd2lsbCBmYWlsIGlmIHRoZXJlIGlzIG5vIHZhbGlkIG1hYy4gd2Ugb25seSBzdXBwb3J0IGZhbHNlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LlxuICogXHRcdFx0XHQgaXQgbXVzdCBub3QgYmUgdXNlZCB3aXRoIG5ldyBjcnl0byBhbnltb3JlLlxuICogQHJldHVybiBUaGUgZGVjcnlwdGVkIGJ5dGVzLlxuICovXG5mdW5jdGlvbiBhZXNEZWNyeXB0SW1wbChrZXksIGVuY3J5cHRlZEJ5dGVzLCB1c2VQYWRkaW5nLCBlbmZvcmNlTWFjKSB7XG4gICAgdmVyaWZ5S2V5U2l6ZShrZXksIFtLRVlfTEVOR1RIX0JJVFNfQUVTXzEyOCwgS0VZX0xFTkdUSF9CSVRTX0FFU18yNTZdKTtcbiAgICBjb25zdCBoYXNNYWMgPSBlbmNyeXB0ZWRCeXRlcy5sZW5ndGggJSAyID09PSAxO1xuICAgIGlmIChlbmZvcmNlTWFjICYmICFoYXNNYWMpIHtcbiAgICAgICAgdGhyb3cgbmV3IENyeXB0b0Vycm9yKFwibWFjIGV4cGVjdGVkIGJ1dCBub3QgcHJlc2VudFwiKTtcbiAgICB9XG4gICAgY29uc3Qgc3ViS2V5cyA9IGdldEFlc1N1YktleXMoa2V5LCBoYXNNYWMpO1xuICAgIGxldCBjaXBoZXJUZXh0V2l0aG91dE1hYztcbiAgICBpZiAoaGFzTWFjKSB7XG4gICAgICAgIGNpcGhlclRleHRXaXRob3V0TWFjID0gZW5jcnlwdGVkQnl0ZXMuc3ViYXJyYXkoMSwgZW5jcnlwdGVkQnl0ZXMubGVuZ3RoIC0gTUFDX0xFTkdUSF9CWVRFUyk7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVkTWFjQnl0ZXMgPSBlbmNyeXB0ZWRCeXRlcy5zdWJhcnJheShlbmNyeXB0ZWRCeXRlcy5sZW5ndGggLSBNQUNfTEVOR1RIX0JZVEVTKTtcbiAgICAgICAgdmVyaWZ5SG1hY1NoYTI1Nihhc3NlcnROb3ROdWxsKHN1YktleXMubUtleSksIGNpcGhlclRleHRXaXRob3V0TWFjLCBwcm92aWRlZE1hY0J5dGVzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNpcGhlclRleHRXaXRob3V0TWFjID0gZW5jcnlwdGVkQnl0ZXM7XG4gICAgfVxuICAgIC8vIHRha2UgdGhlIGl2IGZyb20gdGhlIGZyb250IG9mIHRoZSBlbmNyeXB0ZWQgZGF0YVxuICAgIGNvbnN0IGl2ID0gY2lwaGVyVGV4dFdpdGhvdXRNYWMuc2xpY2UoMCwgSVZfQllURV9MRU5HVEgpO1xuICAgIGlmIChpdi5sZW5ndGggIT09IElWX0JZVEVfTEVOR1RIKSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihgSW52YWxpZCBJViBsZW5ndGggaW4gYWVzRGVjcnlwdDogJHtpdi5sZW5ndGh9IGJ5dGVzLCBtdXN0IGJlIDE2IGJ5dGVzICgxMjggYml0cylgKTtcbiAgICB9XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGNpcGhlclRleHRXaXRob3V0TWFjLnNsaWNlKElWX0JZVEVfTEVOR1RIKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkZWNyeXB0ZWQgPSBzamNsLm1vZGUuY2JjLmRlY3J5cHQobmV3IHNqY2wuY2lwaGVyLmFlcyhzdWJLZXlzLmNLZXkpLCB1aW50OEFycmF5VG9CaXRBcnJheShjaXBoZXJ0ZXh0KSwgdWludDhBcnJheVRvQml0QXJyYXkoaXYpLCBbXSwgdXNlUGFkZGluZyk7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShiaXRBcnJheVRvVWludDhBcnJheShkZWNyeXB0ZWQpKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IENyeXB0b0Vycm9yKFwiYWVzIGRlY3J5cHRpb24gZmFpbGVkXCIsIGUpO1xuICAgIH1cbn1cbi8vIHZpc2libGVGb3JUZXN0aW5nXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5S2V5U2l6ZShrZXksIGJpdExlbmd0aCkge1xuICAgIGlmICghYml0TGVuZ3RoLmluY2x1ZGVzKHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGtleSkpKSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihgSWxsZWdhbCBrZXkgbGVuZ3RoOiAke3NqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGtleSl9IChleHBlY3RlZDogJHtiaXRMZW5ndGh9KWApO1xuICAgIH1cbn1cbi8qKioqKioqKioqKioqKioqKioqKioqKiogTGVnYWN5IEFFUzEyOCAqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKipcbiAqIEBwcml2YXRlIHZpc2libGUgZm9yIHRlc3RzXG4gKiBAZGVwcmVjYXRlZFxuICogKi9cbmV4cG9ydCBmdW5jdGlvbiBfYWVzMTI4UmFuZG9tS2V5KCkge1xuICAgIHJldHVybiB1aW50OEFycmF5VG9CaXRBcnJheShyYW5kb20uZ2VuZXJhdGVSYW5kb21EYXRhKEtFWV9MRU5HVEhfQllURVNfQUVTXzEyOCkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEFlc1N1YktleXMoa2V5LCBtYWMpIHtcbiAgICBpZiAobWFjKSB7XG4gICAgICAgIGxldCBoYXNoZWRLZXk7XG4gICAgICAgIHN3aXRjaCAoZ2V0S2V5TGVuZ3RoQnl0ZXMoa2V5KSkge1xuICAgICAgICAgICAgY2FzZSBLRVlfTEVOR1RIX0JZVEVTX0FFU18xMjg6XG4gICAgICAgICAgICAgICAgaGFzaGVkS2V5ID0gc2hhMjU2SGFzaChiaXRBcnJheVRvVWludDhBcnJheShrZXkpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS0VZX0xFTkdUSF9CWVRFU19BRVNfMjU2OlxuICAgICAgICAgICAgICAgIGhhc2hlZEtleSA9IHNoYTUxMkhhc2goYml0QXJyYXlUb1VpbnQ4QXJyYXkoa2V5KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5leHBlY3RlZCBrZXkgbGVuZ3RoICR7Z2V0S2V5TGVuZ3RoQnl0ZXMoa2V5KX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY0tleTogdWludDhBcnJheVRvQml0QXJyYXkoaGFzaGVkS2V5LnN1YmFycmF5KDAsIGhhc2hlZEtleS5sZW5ndGggLyAyKSksXG4gICAgICAgICAgICBtS2V5OiB1aW50OEFycmF5VG9CaXRBcnJheShoYXNoZWRLZXkuc3ViYXJyYXkoaGFzaGVkS2V5Lmxlbmd0aCAvIDIsIGhhc2hlZEtleS5sZW5ndGgpKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjS2V5OiBrZXksXG4gICAgICAgICAgICBtS2V5OiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cbn1cbiIsIi8vIHgyNTUxOSBmcm9tIG5vYmxlLWN1cnZlcy0xLjMuMFxuLy9cbi8vIEhvdyB0byByZWJ1aWxkIHRoaXMgZmlsZVxuLy8gMS4gQ2xvbmUgbm9ibGUtY3VydmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvbm9ibGUtY3VydmVzIGFuZCBDRCBpbnRvIGl0XG4vLyAyLiBSdW4gYG5wbSBpYCBhbmQgdGhlbiBgbnBtIHJ1biBidWlsZGBcbi8vIDMuIENEIGludG8gYGJ1aWxkYFxuLy8gNC4gUmV3cml0ZSBpbnB1dC5qcyBpbnRvIGp1c3QgdGhpcyBvbmUgbGluZTogZXhwb3J0IHt4MjU1MTl9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvZWQyNTUxOSdcbi8vIDUuIFJ1biBgbnBtIGlgIGFuZCBgbnBtIHJ1biBidWlsZGBcbi8vIDYuIENvcHkgY29udGVudHMgb2Ygbm9ibGUtY3VydmVzLmpzIHRvIGJlbG93XG5cInVzZSBzdHJpY3RcIjtcbnZhciBub2JsZUN1cnZlcyA9ICgoKSA9PiB7XG4gICAgdmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbiAgICB2YXIgX19nZXRPd25Qcm9wRGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICAgdmFyIF9fZ2V0T3duUHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG4gICAgdmFyIF9faGFzT3duUHJvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gICAgdmFyIF9fZXhwb3J0ID0gKHRhcmdldCwgYWxsKSA9PiB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gYWxsKVxuICAgICAgICAgICAgX19kZWZQcm9wKHRhcmdldCwgbmFtZSwgeyBnZXQ6IGFsbFtuYW1lXSwgZW51bWVyYWJsZTogdHJ1ZSB9KTtcbiAgICB9O1xuICAgIHZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XG4gICAgICAgIGlmIChmcm9tICYmIHR5cGVvZiBmcm9tID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBmcm9tID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBfX2dldE93blByb3BOYW1lcyhmcm9tKSlcbiAgICAgICAgICAgICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxuICAgICAgICAgICAgICAgICAgICBfX2RlZlByb3AodG8sIGtleSwgeyBnZXQ6ICgpID0+IGZyb21ba2V5XSwgZW51bWVyYWJsZTogIShkZXNjID0gX19nZXRPd25Qcm9wRGVzYyhmcm9tLCBrZXkpKSB8fCBkZXNjLmVudW1lcmFibGUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvO1xuICAgIH07XG4gICAgdmFyIF9fdG9Db21tb25KUyA9IChtb2QyKSA9PiBfX2NvcHlQcm9wcyhfX2RlZlByb3Aoe30sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pLCBtb2QyKTtcbiAgICAvLyBpbnB1dC5qc1xuICAgIHZhciBpbnB1dF9leHBvcnRzID0ge307XG4gICAgX19leHBvcnQoaW5wdXRfZXhwb3J0cywge1xuICAgICAgICB4MjU1MTk6ICgpID0+IHgyNTUxOVxuICAgIH0pO1xuICAgIC8vIC4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL2VzbS9fYXNzZXJ0LmpzXG4gICAgZnVuY3Rpb24gaXNCeXRlcyhhKSB7XG4gICAgICAgIHJldHVybiBhIGluc3RhbmNlb2YgVWludDhBcnJheSB8fCBhICE9IG51bGwgJiYgdHlwZW9mIGEgPT09IFwib2JqZWN0XCIgJiYgYS5jb25zdHJ1Y3Rvci5uYW1lID09PSBcIlVpbnQ4QXJyYXlcIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gYnl0ZXMoYiwgLi4ubGVuZ3Rocykge1xuICAgICAgICBpZiAoIWlzQnl0ZXMoYikpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBVaW50OEFycmF5XCIpO1xuICAgICAgICBpZiAobGVuZ3Rocy5sZW5ndGggPiAwICYmICFsZW5ndGhzLmluY2x1ZGVzKGIubGVuZ3RoKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgVWludDhBcnJheSBvZiBsZW5ndGggJHtsZW5ndGhzfSwgbm90IG9mIGxlbmd0aD0ke2IubGVuZ3RofWApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBleGlzdHMoaW5zdGFuY2UsIGNoZWNrRmluaXNoZWQgPSB0cnVlKSB7XG4gICAgICAgIGlmIChpbnN0YW5jZS5kZXN0cm95ZWQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIYXNoIGluc3RhbmNlIGhhcyBiZWVuIGRlc3Ryb3llZFwiKTtcbiAgICAgICAgaWYgKGNoZWNrRmluaXNoZWQgJiYgaW5zdGFuY2UuZmluaXNoZWQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIYXNoI2RpZ2VzdCgpIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBvdXRwdXQob3V0LCBpbnN0YW5jZSkge1xuICAgICAgICBieXRlcyhvdXQpO1xuICAgICAgICBjb25zdCBtaW4gPSBpbnN0YW5jZS5vdXRwdXRMZW47XG4gICAgICAgIGlmIChvdXQubGVuZ3RoIDwgbWluKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGRpZ2VzdEludG8oKSBleHBlY3RzIG91dHB1dCBidWZmZXIgb2YgbGVuZ3RoIGF0IGxlYXN0ICR7bWlufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIC4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL2VzbS9jcnlwdG8uanNcbiAgICB2YXIgY3J5cHRvID0gdHlwZW9mIGdsb2JhbFRoaXMgPT09IFwib2JqZWN0XCIgJiYgXCJjcnlwdG9cIiBpbiBnbG9iYWxUaGlzID8gZ2xvYmFsVGhpcy5jcnlwdG8gOiB2b2lkIDA7XG4gICAgLy8gLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvZXNtL3V0aWxzLmpzXG4gICAgZnVuY3Rpb24gaXNCeXRlczIoYSkge1xuICAgICAgICByZXR1cm4gYSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgfHwgYSAhPSBudWxsICYmIHR5cGVvZiBhID09PSBcIm9iamVjdFwiICYmIGEuY29uc3RydWN0b3IubmFtZSA9PT0gXCJVaW50OEFycmF5XCI7XG4gICAgfVxuICAgIHZhciBjcmVhdGVWaWV3ID0gKGFycikgPT4gbmV3IERhdGFWaWV3KGFyci5idWZmZXIsIGFyci5ieXRlT2Zmc2V0LCBhcnIuYnl0ZUxlbmd0aCk7XG4gICAgdmFyIGlzTEUgPSBuZXcgVWludDhBcnJheShuZXcgVWludDMyQXJyYXkoWzI4NzQ1NDAyMF0pLmJ1ZmZlcilbMF0gPT09IDY4O1xuICAgIGlmICghaXNMRSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm9uIGxpdHRsZS1lbmRpYW4gaGFyZHdhcmUgaXMgbm90IHN1cHBvcnRlZFwiKTtcbiAgICBmdW5jdGlvbiB1dGY4VG9CeXRlcyhzdHIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHV0ZjhUb0J5dGVzIGV4cGVjdGVkIHN0cmluZywgZ290ICR7dHlwZW9mIHN0cn1gKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzdHIpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9CeXRlcyhkYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgIGRhdGEgPSB1dGY4VG9CeXRlcyhkYXRhKTtcbiAgICAgICAgaWYgKCFpc0J5dGVzMihkYXRhKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgVWludDhBcnJheSwgZ290ICR7dHlwZW9mIGRhdGF9YCk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb25jYXRCeXRlcyguLi5hcnJheXMpIHtcbiAgICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gYXJyYXlzW2ldO1xuICAgICAgICAgICAgaWYgKCFpc0J5dGVzMihhKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVaW50OEFycmF5IGV4cGVjdGVkXCIpO1xuICAgICAgICAgICAgc3VtICs9IGEubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBVaW50OEFycmF5KHN1bSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBwYWQgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gYXJyYXlzW2ldO1xuICAgICAgICAgICAgcmVzLnNldChhLCBwYWQpO1xuICAgICAgICAgICAgcGFkICs9IGEubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIHZhciBIYXNoID0gY2xhc3Mge1xuICAgICAgICAvLyBTYWZlIHZlcnNpb24gdGhhdCBjbG9uZXMgaW50ZXJuYWwgc3RhdGVcbiAgICAgICAgY2xvbmUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xvbmVJbnRvKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciB0b1N0ciA9IHt9LnRvU3RyaW5nO1xuICAgIGZ1bmN0aW9uIHdyYXBDb25zdHJ1Y3RvcihoYXNoQ29ucykge1xuICAgICAgICBjb25zdCBoYXNoQyA9IChtc2cpID0+IGhhc2hDb25zKCkudXBkYXRlKHRvQnl0ZXMobXNnKSkuZGlnZXN0KCk7XG4gICAgICAgIGNvbnN0IHRtcCA9IGhhc2hDb25zKCk7XG4gICAgICAgIGhhc2hDLm91dHB1dExlbiA9IHRtcC5vdXRwdXRMZW47XG4gICAgICAgIGhhc2hDLmJsb2NrTGVuID0gdG1wLmJsb2NrTGVuO1xuICAgICAgICBoYXNoQy5jcmVhdGUgPSAoKSA9PiBoYXNoQ29ucygpO1xuICAgICAgICByZXR1cm4gaGFzaEM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJhbmRvbUJ5dGVzKGJ5dGVzTGVuZ3RoID0gMzIpIHtcbiAgICAgICAgaWYgKGNyeXB0byAmJiB0eXBlb2YgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShieXRlc0xlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNyeXB0by5nZXRSYW5kb21WYWx1ZXMgbXVzdCBiZSBkZWZpbmVkXCIpO1xuICAgIH1cbiAgICAvLyAuLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9lc20vX3NoYTIuanNcbiAgICBmdW5jdGlvbiBzZXRCaWdVaW50NjQodmlldywgYnl0ZU9mZnNldCwgdmFsdWUsIGlzTEUyKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygdmlldy5zZXRCaWdVaW50NjQgPT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgIHJldHVybiB2aWV3LnNldEJpZ1VpbnQ2NChieXRlT2Zmc2V0LCB2YWx1ZSwgaXNMRTIpO1xuICAgICAgICBjb25zdCBfMzJuMiA9IEJpZ0ludCgzMik7XG4gICAgICAgIGNvbnN0IF91MzJfbWF4ID0gQmlnSW50KDQyOTQ5NjcyOTUpO1xuICAgICAgICBjb25zdCB3aCA9IE51bWJlcih2YWx1ZSA+PiBfMzJuMiAmIF91MzJfbWF4KTtcbiAgICAgICAgY29uc3Qgd2wgPSBOdW1iZXIodmFsdWUgJiBfdTMyX21heCk7XG4gICAgICAgIGNvbnN0IGggPSBpc0xFMiA/IDQgOiAwO1xuICAgICAgICBjb25zdCBsID0gaXNMRTIgPyAwIDogNDtcbiAgICAgICAgdmlldy5zZXRVaW50MzIoYnl0ZU9mZnNldCArIGgsIHdoLCBpc0xFMik7XG4gICAgICAgIHZpZXcuc2V0VWludDMyKGJ5dGVPZmZzZXQgKyBsLCB3bCwgaXNMRTIpO1xuICAgIH1cbiAgICB2YXIgU0hBMiA9IGNsYXNzIGV4dGVuZHMgSGFzaCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKGJsb2NrTGVuLCBvdXRwdXRMZW4sIHBhZE9mZnNldCwgaXNMRTIpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmJsb2NrTGVuID0gYmxvY2tMZW47XG4gICAgICAgICAgICB0aGlzLm91dHB1dExlbiA9IG91dHB1dExlbjtcbiAgICAgICAgICAgIHRoaXMucGFkT2Zmc2V0ID0gcGFkT2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5pc0xFID0gaXNMRTI7XG4gICAgICAgICAgICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBuZXcgVWludDhBcnJheShibG9ja0xlbik7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSBjcmVhdGVWaWV3KHRoaXMuYnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUoZGF0YSkge1xuICAgICAgICAgICAgZXhpc3RzKHRoaXMpO1xuICAgICAgICAgICAgY29uc3QgeyB2aWV3LCBidWZmZXIsIGJsb2NrTGVuIH0gPSB0aGlzO1xuICAgICAgICAgICAgZGF0YSA9IHRvQnl0ZXMoZGF0YSk7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IHBvcyA9IDA7IHBvcyA8IGxlbjspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YWtlID0gTWF0aC5taW4oYmxvY2tMZW4gLSB0aGlzLnBvcywgbGVuIC0gcG9zKTtcbiAgICAgICAgICAgICAgICBpZiAodGFrZSA9PT0gYmxvY2tMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YVZpZXcgPSBjcmVhdGVWaWV3KGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgYmxvY2tMZW4gPD0gbGVuIC0gcG9zOyBwb3MgKz0gYmxvY2tMZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3MoZGF0YVZpZXcsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBidWZmZXIuc2V0KGRhdGEuc3ViYXJyYXkocG9zLCBwb3MgKyB0YWtlKSwgdGhpcy5wb3MpO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zICs9IHRha2U7XG4gICAgICAgICAgICAgICAgcG9zICs9IHRha2U7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucG9zID09PSBibG9ja0xlbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3ModmlldywgMCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxlbmd0aCArPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMucm91bmRDbGVhbigpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGlnZXN0SW50byhvdXQpIHtcbiAgICAgICAgICAgIGV4aXN0cyh0aGlzKTtcbiAgICAgICAgICAgIG91dHB1dChvdXQsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCB7IGJ1ZmZlciwgdmlldywgYmxvY2tMZW4sIGlzTEU6IGlzTEUyIH0gPSB0aGlzO1xuICAgICAgICAgICAgbGV0IHsgcG9zIH0gPSB0aGlzO1xuICAgICAgICAgICAgYnVmZmVyW3BvcysrXSA9IDEyODtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLnN1YmFycmF5KHBvcykuZmlsbCgwKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhZE9mZnNldCA+IGJsb2NrTGVuIC0gcG9zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzKHZpZXcsIDApO1xuICAgICAgICAgICAgICAgIHBvcyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gcG9zOyBpIDwgYmxvY2tMZW47IGkrKylcbiAgICAgICAgICAgICAgICBidWZmZXJbaV0gPSAwO1xuICAgICAgICAgICAgc2V0QmlnVWludDY0KHZpZXcsIGJsb2NrTGVuIC0gOCwgQmlnSW50KHRoaXMubGVuZ3RoICogOCksIGlzTEUyKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzcyh2aWV3LCAwKTtcbiAgICAgICAgICAgIGNvbnN0IG92aWV3ID0gY3JlYXRlVmlldyhvdXQpO1xuICAgICAgICAgICAgY29uc3QgbGVuID0gdGhpcy5vdXRwdXRMZW47XG4gICAgICAgICAgICBpZiAobGVuICUgNClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJfc2hhMjogb3V0cHV0TGVuIHNob3VsZCBiZSBhbGlnbmVkIHRvIDMyYml0XCIpO1xuICAgICAgICAgICAgY29uc3Qgb3V0TGVuID0gbGVuIC8gNDtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5nZXQoKTtcbiAgICAgICAgICAgIGlmIChvdXRMZW4gPiBzdGF0ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiX3NoYTI6IG91dHB1dExlbiBiaWdnZXIgdGhhbiBzdGF0ZVwiKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0TGVuOyBpKyspXG4gICAgICAgICAgICAgICAgb3ZpZXcuc2V0VWludDMyKDQgKiBpLCBzdGF0ZVtpXSwgaXNMRTIpO1xuICAgICAgICB9XG4gICAgICAgIGRpZ2VzdCgpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgYnVmZmVyLCBvdXRwdXRMZW4gfSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmRpZ2VzdEludG8oYnVmZmVyKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGJ1ZmZlci5zbGljZSgwLCBvdXRwdXRMZW4pO1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIF9jbG9uZUludG8odG8pIHtcbiAgICAgICAgICAgIHRvIHx8ICh0byA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKCkpO1xuICAgICAgICAgICAgdG8uc2V0KC4uLnRoaXMuZ2V0KCkpO1xuICAgICAgICAgICAgY29uc3QgeyBibG9ja0xlbiwgYnVmZmVyLCBsZW5ndGgsIGZpbmlzaGVkLCBkZXN0cm95ZWQsIHBvcyB9ID0gdGhpcztcbiAgICAgICAgICAgIHRvLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgICAgIHRvLnBvcyA9IHBvcztcbiAgICAgICAgICAgIHRvLmZpbmlzaGVkID0gZmluaXNoZWQ7XG4gICAgICAgICAgICB0by5kZXN0cm95ZWQgPSBkZXN0cm95ZWQ7XG4gICAgICAgICAgICBpZiAobGVuZ3RoICUgYmxvY2tMZW4pXG4gICAgICAgICAgICAgICAgdG8uYnVmZmVyLnNldChidWZmZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRvO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyAuLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9lc20vX3U2NC5qc1xuICAgIHZhciBVMzJfTUFTSzY0ID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgyICoqIDMyIC0gMSk7XG4gICAgdmFyIF8zMm4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDMyKTtcbiAgICBmdW5jdGlvbiBmcm9tQmlnKG4sIGxlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGxlKVxuICAgICAgICAgICAgcmV0dXJuIHsgaDogTnVtYmVyKG4gJiBVMzJfTUFTSzY0KSwgbDogTnVtYmVyKG4gPj4gXzMybiAmIFUzMl9NQVNLNjQpIH07XG4gICAgICAgIHJldHVybiB7IGg6IE51bWJlcihuID4+IF8zMm4gJiBVMzJfTUFTSzY0KSB8IDAsIGw6IE51bWJlcihuICYgVTMyX01BU0s2NCkgfCAwIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNwbGl0KGxzdCwgbGUgPSBmYWxzZSkge1xuICAgICAgICBsZXQgQWggPSBuZXcgVWludDMyQXJyYXkobHN0Lmxlbmd0aCk7XG4gICAgICAgIGxldCBBbCA9IG5ldyBVaW50MzJBcnJheShsc3QubGVuZ3RoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHsgaCwgbCB9ID0gZnJvbUJpZyhsc3RbaV0sIGxlKTtcbiAgICAgICAgICAgIFtBaFtpXSwgQWxbaV1dID0gW2gsIGxdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbQWgsIEFsXTtcbiAgICB9XG4gICAgdmFyIHRvQmlnID0gKGgsIGwpID0+IEJpZ0ludChoID4+PiAwKSA8PCBfMzJuIHwgQmlnSW50KGwgPj4+IDApO1xuICAgIHZhciBzaHJTSCA9IChoLCBfbCwgcykgPT4gaCA+Pj4gcztcbiAgICB2YXIgc2hyU0wgPSAoaCwgbCwgcykgPT4gaCA8PCAzMiAtIHMgfCBsID4+PiBzO1xuICAgIHZhciByb3RyU0ggPSAoaCwgbCwgcykgPT4gaCA+Pj4gcyB8IGwgPDwgMzIgLSBzO1xuICAgIHZhciByb3RyU0wgPSAoaCwgbCwgcykgPT4gaCA8PCAzMiAtIHMgfCBsID4+PiBzO1xuICAgIHZhciByb3RyQkggPSAoaCwgbCwgcykgPT4gaCA8PCA2NCAtIHMgfCBsID4+PiBzIC0gMzI7XG4gICAgdmFyIHJvdHJCTCA9IChoLCBsLCBzKSA9PiBoID4+PiBzIC0gMzIgfCBsIDw8IDY0IC0gcztcbiAgICB2YXIgcm90cjMySCA9IChfaCwgbCkgPT4gbDtcbiAgICB2YXIgcm90cjMyTCA9IChoLCBfbCkgPT4gaDtcbiAgICB2YXIgcm90bFNIID0gKGgsIGwsIHMpID0+IGggPDwgcyB8IGwgPj4+IDMyIC0gcztcbiAgICB2YXIgcm90bFNMID0gKGgsIGwsIHMpID0+IGwgPDwgcyB8IGggPj4+IDMyIC0gcztcbiAgICB2YXIgcm90bEJIID0gKGgsIGwsIHMpID0+IGwgPDwgcyAtIDMyIHwgaCA+Pj4gNjQgLSBzO1xuICAgIHZhciByb3RsQkwgPSAoaCwgbCwgcykgPT4gaCA8PCBzIC0gMzIgfCBsID4+PiA2NCAtIHM7XG4gICAgZnVuY3Rpb24gYWRkKEFoLCBBbCwgQmgsIEJsKSB7XG4gICAgICAgIGNvbnN0IGwgPSAoQWwgPj4+IDApICsgKEJsID4+PiAwKTtcbiAgICAgICAgcmV0dXJuIHsgaDogQWggKyBCaCArIChsIC8gMiAqKiAzMiB8IDApIHwgMCwgbDogbCB8IDAgfTtcbiAgICB9XG4gICAgdmFyIGFkZDNMID0gKEFsLCBCbCwgQ2wpID0+IChBbCA+Pj4gMCkgKyAoQmwgPj4+IDApICsgKENsID4+PiAwKTtcbiAgICB2YXIgYWRkM0ggPSAobG93LCBBaCwgQmgsIENoKSA9PiBBaCArIEJoICsgQ2ggKyAobG93IC8gMiAqKiAzMiB8IDApIHwgMDtcbiAgICB2YXIgYWRkNEwgPSAoQWwsIEJsLCBDbCwgRGwpID0+IChBbCA+Pj4gMCkgKyAoQmwgPj4+IDApICsgKENsID4+PiAwKSArIChEbCA+Pj4gMCk7XG4gICAgdmFyIGFkZDRIID0gKGxvdywgQWgsIEJoLCBDaCwgRGgpID0+IEFoICsgQmggKyBDaCArIERoICsgKGxvdyAvIDIgKiogMzIgfCAwKSB8IDA7XG4gICAgdmFyIGFkZDVMID0gKEFsLCBCbCwgQ2wsIERsLCBFbCkgPT4gKEFsID4+PiAwKSArIChCbCA+Pj4gMCkgKyAoQ2wgPj4+IDApICsgKERsID4+PiAwKSArIChFbCA+Pj4gMCk7XG4gICAgdmFyIGFkZDVIID0gKGxvdywgQWgsIEJoLCBDaCwgRGgsIEVoKSA9PiBBaCArIEJoICsgQ2ggKyBEaCArIEVoICsgKGxvdyAvIDIgKiogMzIgfCAwKSB8IDA7XG4gICAgdmFyIHU2NCA9IHtcbiAgICAgICAgZnJvbUJpZyxcbiAgICAgICAgc3BsaXQsXG4gICAgICAgIHRvQmlnLFxuICAgICAgICBzaHJTSCxcbiAgICAgICAgc2hyU0wsXG4gICAgICAgIHJvdHJTSCxcbiAgICAgICAgcm90clNMLFxuICAgICAgICByb3RyQkgsXG4gICAgICAgIHJvdHJCTCxcbiAgICAgICAgcm90cjMySCxcbiAgICAgICAgcm90cjMyTCxcbiAgICAgICAgcm90bFNILFxuICAgICAgICByb3RsU0wsXG4gICAgICAgIHJvdGxCSCxcbiAgICAgICAgcm90bEJMLFxuICAgICAgICBhZGQsXG4gICAgICAgIGFkZDNMLFxuICAgICAgICBhZGQzSCxcbiAgICAgICAgYWRkNEwsXG4gICAgICAgIGFkZDRILFxuICAgICAgICBhZGQ1SCxcbiAgICAgICAgYWRkNUxcbiAgICB9O1xuICAgIHZhciB1NjRfZGVmYXVsdCA9IHU2NDtcbiAgICAvLyAuLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9lc20vc2hhNTEyLmpzXG4gICAgdmFyIFtTSEE1MTJfS2gsIFNIQTUxMl9LbF0gPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IHU2NF9kZWZhdWx0LnNwbGl0KFtcbiAgICAgICAgXCIweDQyOGEyZjk4ZDcyOGFlMjJcIixcbiAgICAgICAgXCIweDcxMzc0NDkxMjNlZjY1Y2RcIixcbiAgICAgICAgXCIweGI1YzBmYmNmZWM0ZDNiMmZcIixcbiAgICAgICAgXCIweGU5YjVkYmE1ODE4OWRiYmNcIixcbiAgICAgICAgXCIweDM5NTZjMjViZjM0OGI1MzhcIixcbiAgICAgICAgXCIweDU5ZjExMWYxYjYwNWQwMTlcIixcbiAgICAgICAgXCIweDkyM2Y4MmE0YWYxOTRmOWJcIixcbiAgICAgICAgXCIweGFiMWM1ZWQ1ZGE2ZDgxMThcIixcbiAgICAgICAgXCIweGQ4MDdhYTk4YTMwMzAyNDJcIixcbiAgICAgICAgXCIweDEyODM1YjAxNDU3MDZmYmVcIixcbiAgICAgICAgXCIweDI0MzE4NWJlNGVlNGIyOGNcIixcbiAgICAgICAgXCIweDU1MGM3ZGMzZDVmZmI0ZTJcIixcbiAgICAgICAgXCIweDcyYmU1ZDc0ZjI3Yjg5NmZcIixcbiAgICAgICAgXCIweDgwZGViMWZlM2IxNjk2YjFcIixcbiAgICAgICAgXCIweDliZGMwNmE3MjVjNzEyMzVcIixcbiAgICAgICAgXCIweGMxOWJmMTc0Y2Y2OTI2OTRcIixcbiAgICAgICAgXCIweGU0OWI2OWMxOWVmMTRhZDJcIixcbiAgICAgICAgXCIweGVmYmU0Nzg2Mzg0ZjI1ZTNcIixcbiAgICAgICAgXCIweDBmYzE5ZGM2OGI4Y2Q1YjVcIixcbiAgICAgICAgXCIweDI0MGNhMWNjNzdhYzljNjVcIixcbiAgICAgICAgXCIweDJkZTkyYzZmNTkyYjAyNzVcIixcbiAgICAgICAgXCIweDRhNzQ4NGFhNmVhNmU0ODNcIixcbiAgICAgICAgXCIweDVjYjBhOWRjYmQ0MWZiZDRcIixcbiAgICAgICAgXCIweDc2Zjk4OGRhODMxMTUzYjVcIixcbiAgICAgICAgXCIweDk4M2U1MTUyZWU2NmRmYWJcIixcbiAgICAgICAgXCIweGE4MzFjNjZkMmRiNDMyMTBcIixcbiAgICAgICAgXCIweGIwMDMyN2M4OThmYjIxM2ZcIixcbiAgICAgICAgXCIweGJmNTk3ZmM3YmVlZjBlZTRcIixcbiAgICAgICAgXCIweGM2ZTAwYmYzM2RhODhmYzJcIixcbiAgICAgICAgXCIweGQ1YTc5MTQ3OTMwYWE3MjVcIixcbiAgICAgICAgXCIweDA2Y2E2MzUxZTAwMzgyNmZcIixcbiAgICAgICAgXCIweDE0MjkyOTY3MGEwZTZlNzBcIixcbiAgICAgICAgXCIweDI3YjcwYTg1NDZkMjJmZmNcIixcbiAgICAgICAgXCIweDJlMWIyMTM4NWMyNmM5MjZcIixcbiAgICAgICAgXCIweDRkMmM2ZGZjNWFjNDJhZWRcIixcbiAgICAgICAgXCIweDUzMzgwZDEzOWQ5NWIzZGZcIixcbiAgICAgICAgXCIweDY1MGE3MzU0OGJhZjYzZGVcIixcbiAgICAgICAgXCIweDc2NmEwYWJiM2M3N2IyYThcIixcbiAgICAgICAgXCIweDgxYzJjOTJlNDdlZGFlZTZcIixcbiAgICAgICAgXCIweDkyNzIyYzg1MTQ4MjM1M2JcIixcbiAgICAgICAgXCIweGEyYmZlOGExNGNmMTAzNjRcIixcbiAgICAgICAgXCIweGE4MWE2NjRiYmM0MjMwMDFcIixcbiAgICAgICAgXCIweGMyNGI4YjcwZDBmODk3OTFcIixcbiAgICAgICAgXCIweGM3NmM1MWEzMDY1NGJlMzBcIixcbiAgICAgICAgXCIweGQxOTJlODE5ZDZlZjUyMThcIixcbiAgICAgICAgXCIweGQ2OTkwNjI0NTU2NWE5MTBcIixcbiAgICAgICAgXCIweGY0MGUzNTg1NTc3MTIwMmFcIixcbiAgICAgICAgXCIweDEwNmFhMDcwMzJiYmQxYjhcIixcbiAgICAgICAgXCIweDE5YTRjMTE2YjhkMmQwYzhcIixcbiAgICAgICAgXCIweDFlMzc2YzA4NTE0MWFiNTNcIixcbiAgICAgICAgXCIweDI3NDg3NzRjZGY4ZWViOTlcIixcbiAgICAgICAgXCIweDM0YjBiY2I1ZTE5YjQ4YThcIixcbiAgICAgICAgXCIweDM5MWMwY2IzYzVjOTVhNjNcIixcbiAgICAgICAgXCIweDRlZDhhYTRhZTM0MThhY2JcIixcbiAgICAgICAgXCIweDViOWNjYTRmNzc2M2UzNzNcIixcbiAgICAgICAgXCIweDY4MmU2ZmYzZDZiMmI4YTNcIixcbiAgICAgICAgXCIweDc0OGY4MmVlNWRlZmIyZmNcIixcbiAgICAgICAgXCIweDc4YTU2MzZmNDMxNzJmNjBcIixcbiAgICAgICAgXCIweDg0Yzg3ODE0YTFmMGFiNzJcIixcbiAgICAgICAgXCIweDhjYzcwMjA4MWE2NDM5ZWNcIixcbiAgICAgICAgXCIweDkwYmVmZmZhMjM2MzFlMjhcIixcbiAgICAgICAgXCIweGE0NTA2Y2ViZGU4MmJkZTlcIixcbiAgICAgICAgXCIweGJlZjlhM2Y3YjJjNjc5MTVcIixcbiAgICAgICAgXCIweGM2NzE3OGYyZTM3MjUzMmJcIixcbiAgICAgICAgXCIweGNhMjczZWNlZWEyNjYxOWNcIixcbiAgICAgICAgXCIweGQxODZiOGM3MjFjMGMyMDdcIixcbiAgICAgICAgXCIweGVhZGE3ZGQ2Y2RlMGViMWVcIixcbiAgICAgICAgXCIweGY1N2Q0ZjdmZWU2ZWQxNzhcIixcbiAgICAgICAgXCIweDA2ZjA2N2FhNzIxNzZmYmFcIixcbiAgICAgICAgXCIweDBhNjM3ZGM1YTJjODk4YTZcIixcbiAgICAgICAgXCIweDExM2Y5ODA0YmVmOTBkYWVcIixcbiAgICAgICAgXCIweDFiNzEwYjM1MTMxYzQ3MWJcIixcbiAgICAgICAgXCIweDI4ZGI3N2Y1MjMwNDdkODRcIixcbiAgICAgICAgXCIweDMyY2FhYjdiNDBjNzI0OTNcIixcbiAgICAgICAgXCIweDNjOWViZTBhMTVjOWJlYmNcIixcbiAgICAgICAgXCIweDQzMWQ2N2M0OWMxMDBkNGNcIixcbiAgICAgICAgXCIweDRjYzVkNGJlY2IzZTQyYjZcIixcbiAgICAgICAgXCIweDU5N2YyOTljZmM2NTdlMmFcIixcbiAgICAgICAgXCIweDVmY2I2ZmFiM2FkNmZhZWNcIixcbiAgICAgICAgXCIweDZjNDQxOThjNGE0NzU4MTdcIlxuICAgIF0ubWFwKChuKSA9PiBCaWdJbnQobikpKSkoKTtcbiAgICB2YXIgU0hBNTEyX1dfSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVWludDMyQXJyYXkoODApO1xuICAgIHZhciBTSEE1MTJfV19MID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSg4MCk7XG4gICAgdmFyIFNIQTUxMiA9IGNsYXNzIGV4dGVuZHMgU0hBMiB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoMTI4LCA2NCwgMTYsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuQWggPSAxNzc5MDMzNzAzIHwgMDtcbiAgICAgICAgICAgIHRoaXMuQWwgPSA0MDg5MjM1NzIwIHwgMDtcbiAgICAgICAgICAgIHRoaXMuQmggPSAzMTQ0MTM0Mjc3IHwgMDtcbiAgICAgICAgICAgIHRoaXMuQmwgPSAyMjI3ODczNTk1IHwgMDtcbiAgICAgICAgICAgIHRoaXMuQ2ggPSAxMDEzOTA0MjQyIHwgMDtcbiAgICAgICAgICAgIHRoaXMuQ2wgPSA0MjcxMTc1NzIzIHwgMDtcbiAgICAgICAgICAgIHRoaXMuRGggPSAyNzczNDgwNzYyIHwgMDtcbiAgICAgICAgICAgIHRoaXMuRGwgPSAxNTk1NzUwMTI5IHwgMDtcbiAgICAgICAgICAgIHRoaXMuRWggPSAxMzU5ODkzMTE5IHwgMDtcbiAgICAgICAgICAgIHRoaXMuRWwgPSAyOTE3NTY1MTM3IHwgMDtcbiAgICAgICAgICAgIHRoaXMuRmggPSAyNjAwODIyOTI0IHwgMDtcbiAgICAgICAgICAgIHRoaXMuRmwgPSA3MjU1MTExOTkgfCAwO1xuICAgICAgICAgICAgdGhpcy5HaCA9IDUyODczNDYzNSB8IDA7XG4gICAgICAgICAgICB0aGlzLkdsID0gNDIxNTM4OTU0NyB8IDA7XG4gICAgICAgICAgICB0aGlzLkhoID0gMTU0MTQ1OTIyNSB8IDA7XG4gICAgICAgICAgICB0aGlzLkhsID0gMzI3MDMzMjA5IHwgMDtcbiAgICAgICAgfVxuICAgICAgICAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgY29uc3QgeyBBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCB9ID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBbQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGxdO1xuICAgICAgICB9XG4gICAgICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgICAgICBzZXQoQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGwpIHtcbiAgICAgICAgICAgIHRoaXMuQWggPSBBaCB8IDA7XG4gICAgICAgICAgICB0aGlzLkFsID0gQWwgfCAwO1xuICAgICAgICAgICAgdGhpcy5CaCA9IEJoIHwgMDtcbiAgICAgICAgICAgIHRoaXMuQmwgPSBCbCB8IDA7XG4gICAgICAgICAgICB0aGlzLkNoID0gQ2ggfCAwO1xuICAgICAgICAgICAgdGhpcy5DbCA9IENsIHwgMDtcbiAgICAgICAgICAgIHRoaXMuRGggPSBEaCB8IDA7XG4gICAgICAgICAgICB0aGlzLkRsID0gRGwgfCAwO1xuICAgICAgICAgICAgdGhpcy5FaCA9IEVoIHwgMDtcbiAgICAgICAgICAgIHRoaXMuRWwgPSBFbCB8IDA7XG4gICAgICAgICAgICB0aGlzLkZoID0gRmggfCAwO1xuICAgICAgICAgICAgdGhpcy5GbCA9IEZsIHwgMDtcbiAgICAgICAgICAgIHRoaXMuR2ggPSBHaCB8IDA7XG4gICAgICAgICAgICB0aGlzLkdsID0gR2wgfCAwO1xuICAgICAgICAgICAgdGhpcy5IaCA9IEhoIHwgMDtcbiAgICAgICAgICAgIHRoaXMuSGwgPSBIbCB8IDA7XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzcyh2aWV3LCBvZmZzZXQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKywgb2Zmc2V0ICs9IDQpIHtcbiAgICAgICAgICAgICAgICBTSEE1MTJfV19IW2ldID0gdmlldy5nZXRVaW50MzIob2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBTSEE1MTJfV19MW2ldID0gdmlldy5nZXRVaW50MzIob2Zmc2V0ICs9IDQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE2OyBpIDwgODA7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IFcxNWggPSBTSEE1MTJfV19IW2kgLSAxNV0gfCAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IFcxNWwgPSBTSEE1MTJfV19MW2kgLSAxNV0gfCAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IHMwaCA9IHU2NF9kZWZhdWx0LnJvdHJTSChXMTVoLCBXMTVsLCAxKSBeIHU2NF9kZWZhdWx0LnJvdHJTSChXMTVoLCBXMTVsLCA4KSBeIHU2NF9kZWZhdWx0LnNoclNIKFcxNWgsIFcxNWwsIDcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHMwbCA9IHU2NF9kZWZhdWx0LnJvdHJTTChXMTVoLCBXMTVsLCAxKSBeIHU2NF9kZWZhdWx0LnJvdHJTTChXMTVoLCBXMTVsLCA4KSBeIHU2NF9kZWZhdWx0LnNoclNMKFcxNWgsIFcxNWwsIDcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFcyaCA9IFNIQTUxMl9XX0hbaSAtIDJdIHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBXMmwgPSBTSEE1MTJfV19MW2kgLSAyXSB8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgczFoID0gdTY0X2RlZmF1bHQucm90clNIKFcyaCwgVzJsLCAxOSkgXiB1NjRfZGVmYXVsdC5yb3RyQkgoVzJoLCBXMmwsIDYxKSBeIHU2NF9kZWZhdWx0LnNoclNIKFcyaCwgVzJsLCA2KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzMWwgPSB1NjRfZGVmYXVsdC5yb3RyU0woVzJoLCBXMmwsIDE5KSBeIHU2NF9kZWZhdWx0LnJvdHJCTChXMmgsIFcybCwgNjEpIF4gdTY0X2RlZmF1bHQuc2hyU0woVzJoLCBXMmwsIDYpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFNVTWwgPSB1NjRfZGVmYXVsdC5hZGQ0TChzMGwsIHMxbCwgU0hBNTEyX1dfTFtpIC0gN10sIFNIQTUxMl9XX0xbaSAtIDE2XSk7XG4gICAgICAgICAgICAgICAgY29uc3QgU1VNaCA9IHU2NF9kZWZhdWx0LmFkZDRIKFNVTWwsIHMwaCwgczFoLCBTSEE1MTJfV19IW2kgLSA3XSwgU0hBNTEyX1dfSFtpIC0gMTZdKTtcbiAgICAgICAgICAgICAgICBTSEE1MTJfV19IW2ldID0gU1VNaCB8IDA7XG4gICAgICAgICAgICAgICAgU0hBNTEyX1dfTFtpXSA9IFNVTWwgfCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHsgQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGwgfSA9IHRoaXM7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDgwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWdtYTFoID0gdTY0X2RlZmF1bHQucm90clNIKEVoLCBFbCwgMTQpIF4gdTY0X2RlZmF1bHQucm90clNIKEVoLCBFbCwgMTgpIF4gdTY0X2RlZmF1bHQucm90ckJIKEVoLCBFbCwgNDEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpZ21hMWwgPSB1NjRfZGVmYXVsdC5yb3RyU0woRWgsIEVsLCAxNCkgXiB1NjRfZGVmYXVsdC5yb3RyU0woRWgsIEVsLCAxOCkgXiB1NjRfZGVmYXVsdC5yb3RyQkwoRWgsIEVsLCA0MSk7XG4gICAgICAgICAgICAgICAgY29uc3QgQ0hJaCA9IEVoICYgRmggXiB+RWggJiBHaDtcbiAgICAgICAgICAgICAgICBjb25zdCBDSElsID0gRWwgJiBGbCBeIH5FbCAmIEdsO1xuICAgICAgICAgICAgICAgIGNvbnN0IFQxbGwgPSB1NjRfZGVmYXVsdC5hZGQ1TChIbCwgc2lnbWExbCwgQ0hJbCwgU0hBNTEyX0tsW2ldLCBTSEE1MTJfV19MW2ldKTtcbiAgICAgICAgICAgICAgICBjb25zdCBUMWggPSB1NjRfZGVmYXVsdC5hZGQ1SChUMWxsLCBIaCwgc2lnbWExaCwgQ0hJaCwgU0hBNTEyX0toW2ldLCBTSEE1MTJfV19IW2ldKTtcbiAgICAgICAgICAgICAgICBjb25zdCBUMWwgPSBUMWxsIHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWdtYTBoID0gdTY0X2RlZmF1bHQucm90clNIKEFoLCBBbCwgMjgpIF4gdTY0X2RlZmF1bHQucm90ckJIKEFoLCBBbCwgMzQpIF4gdTY0X2RlZmF1bHQucm90ckJIKEFoLCBBbCwgMzkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpZ21hMGwgPSB1NjRfZGVmYXVsdC5yb3RyU0woQWgsIEFsLCAyOCkgXiB1NjRfZGVmYXVsdC5yb3RyQkwoQWgsIEFsLCAzNCkgXiB1NjRfZGVmYXVsdC5yb3RyQkwoQWgsIEFsLCAzOSk7XG4gICAgICAgICAgICAgICAgY29uc3QgTUFKaCA9IEFoICYgQmggXiBBaCAmIENoIF4gQmggJiBDaDtcbiAgICAgICAgICAgICAgICBjb25zdCBNQUpsID0gQWwgJiBCbCBeIEFsICYgQ2wgXiBCbCAmIENsO1xuICAgICAgICAgICAgICAgIEhoID0gR2ggfCAwO1xuICAgICAgICAgICAgICAgIEhsID0gR2wgfCAwO1xuICAgICAgICAgICAgICAgIEdoID0gRmggfCAwO1xuICAgICAgICAgICAgICAgIEdsID0gRmwgfCAwO1xuICAgICAgICAgICAgICAgIEZoID0gRWggfCAwO1xuICAgICAgICAgICAgICAgIEZsID0gRWwgfCAwO1xuICAgICAgICAgICAgICAgICh7IGg6IEVoLCBsOiBFbCB9ID0gdTY0X2RlZmF1bHQuYWRkKERoIHwgMCwgRGwgfCAwLCBUMWggfCAwLCBUMWwgfCAwKSk7XG4gICAgICAgICAgICAgICAgRGggPSBDaCB8IDA7XG4gICAgICAgICAgICAgICAgRGwgPSBDbCB8IDA7XG4gICAgICAgICAgICAgICAgQ2ggPSBCaCB8IDA7XG4gICAgICAgICAgICAgICAgQ2wgPSBCbCB8IDA7XG4gICAgICAgICAgICAgICAgQmggPSBBaCB8IDA7XG4gICAgICAgICAgICAgICAgQmwgPSBBbCB8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgQWxsID0gdTY0X2RlZmF1bHQuYWRkM0woVDFsLCBzaWdtYTBsLCBNQUpsKTtcbiAgICAgICAgICAgICAgICBBaCA9IHU2NF9kZWZhdWx0LmFkZDNIKEFsbCwgVDFoLCBzaWdtYTBoLCBNQUpoKTtcbiAgICAgICAgICAgICAgICBBbCA9IEFsbCB8IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAoeyBoOiBBaCwgbDogQWwgfSA9IHU2NF9kZWZhdWx0LmFkZCh0aGlzLkFoIHwgMCwgdGhpcy5BbCB8IDAsIEFoIHwgMCwgQWwgfCAwKSk7XG4gICAgICAgICAgICAoeyBoOiBCaCwgbDogQmwgfSA9IHU2NF9kZWZhdWx0LmFkZCh0aGlzLkJoIHwgMCwgdGhpcy5CbCB8IDAsIEJoIHwgMCwgQmwgfCAwKSk7XG4gICAgICAgICAgICAoeyBoOiBDaCwgbDogQ2wgfSA9IHU2NF9kZWZhdWx0LmFkZCh0aGlzLkNoIHwgMCwgdGhpcy5DbCB8IDAsIENoIHwgMCwgQ2wgfCAwKSk7XG4gICAgICAgICAgICAoeyBoOiBEaCwgbDogRGwgfSA9IHU2NF9kZWZhdWx0LmFkZCh0aGlzLkRoIHwgMCwgdGhpcy5EbCB8IDAsIERoIHwgMCwgRGwgfCAwKSk7XG4gICAgICAgICAgICAoeyBoOiBFaCwgbDogRWwgfSA9IHU2NF9kZWZhdWx0LmFkZCh0aGlzLkVoIHwgMCwgdGhpcy5FbCB8IDAsIEVoIHwgMCwgRWwgfCAwKSk7XG4gICAgICAgICAgICAoeyBoOiBGaCwgbDogRmwgfSA9IHU2NF9kZWZhdWx0LmFkZCh0aGlzLkZoIHwgMCwgdGhpcy5GbCB8IDAsIEZoIHwgMCwgRmwgfCAwKSk7XG4gICAgICAgICAgICAoeyBoOiBHaCwgbDogR2wgfSA9IHU2NF9kZWZhdWx0LmFkZCh0aGlzLkdoIHwgMCwgdGhpcy5HbCB8IDAsIEdoIHwgMCwgR2wgfCAwKSk7XG4gICAgICAgICAgICAoeyBoOiBIaCwgbDogSGwgfSA9IHU2NF9kZWZhdWx0LmFkZCh0aGlzLkhoIHwgMCwgdGhpcy5IbCB8IDAsIEhoIHwgMCwgSGwgfCAwKSk7XG4gICAgICAgICAgICB0aGlzLnNldChBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCk7XG4gICAgICAgIH1cbiAgICAgICAgcm91bmRDbGVhbigpIHtcbiAgICAgICAgICAgIFNIQTUxMl9XX0guZmlsbCgwKTtcbiAgICAgICAgICAgIFNIQTUxMl9XX0wuZmlsbCgwKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0cm95KCkge1xuICAgICAgICAgICAgdGhpcy5idWZmZXIuZmlsbCgwKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgc2hhNTEyID0gLyogQF9fUFVSRV9fICovIHdyYXBDb25zdHJ1Y3RvcigoKSA9PiBuZXcgU0hBNTEyKCkpO1xuICAgIC8vIC4uL2VzbS9hYnN0cmFjdC91dGlscy5qc1xuICAgIHZhciBfMG4gPSBCaWdJbnQoMCk7XG4gICAgdmFyIF8xbiA9IEJpZ0ludCgxKTtcbiAgICB2YXIgXzJuID0gQmlnSW50KDIpO1xuICAgIGZ1bmN0aW9uIGlzQnl0ZXMzKGEpIHtcbiAgICAgICAgcmV0dXJuIGEgaW5zdGFuY2VvZiBVaW50OEFycmF5IHx8IGEgIT0gbnVsbCAmJiB0eXBlb2YgYSA9PT0gXCJvYmplY3RcIiAmJiBhLmNvbnN0cnVjdG9yLm5hbWUgPT09IFwiVWludDhBcnJheVwiO1xuICAgIH1cbiAgICB2YXIgaGV4ZXMgPSAvKiBAX19QVVJFX18gKi8gQXJyYXkuZnJvbSh7IGxlbmd0aDogMjU2IH0sIChfLCBpKSA9PiBpLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCBcIjBcIikpO1xuICAgIGZ1bmN0aW9uIGJ5dGVzVG9IZXgoYnl0ZXMyKSB7XG4gICAgICAgIGlmICghaXNCeXRlczMoYnl0ZXMyKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVpbnQ4QXJyYXkgZXhwZWN0ZWRcIik7XG4gICAgICAgIGxldCBoZXggPSBcIlwiO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzMi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGV4ICs9IGhleGVzW2J5dGVzMltpXV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhleDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaGV4VG9OdW1iZXIoaGV4KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGV4ICE9PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaGV4IHN0cmluZyBleHBlY3RlZCwgZ290IFwiICsgdHlwZW9mIGhleCk7XG4gICAgICAgIHJldHVybiBCaWdJbnQoaGV4ID09PSBcIlwiID8gXCIwXCIgOiBgMHgke2hleH1gKTtcbiAgICB9XG4gICAgdmFyIGFzY2lpcyA9IHsgXzA6IDQ4LCBfOTogNTcsIF9BOiA2NSwgX0Y6IDcwLCBfYTogOTcsIF9mOiAxMDIgfTtcbiAgICBmdW5jdGlvbiBhc2NpaVRvQmFzZTE2KGNoYXIpIHtcbiAgICAgICAgaWYgKGNoYXIgPj0gYXNjaWlzLl8wICYmIGNoYXIgPD0gYXNjaWlzLl85KVxuICAgICAgICAgICAgcmV0dXJuIGNoYXIgLSBhc2NpaXMuXzA7XG4gICAgICAgIGlmIChjaGFyID49IGFzY2lpcy5fQSAmJiBjaGFyIDw9IGFzY2lpcy5fRilcbiAgICAgICAgICAgIHJldHVybiBjaGFyIC0gKGFzY2lpcy5fQSAtIDEwKTtcbiAgICAgICAgaWYgKGNoYXIgPj0gYXNjaWlzLl9hICYmIGNoYXIgPD0gYXNjaWlzLl9mKVxuICAgICAgICAgICAgcmV0dXJuIGNoYXIgLSAoYXNjaWlzLl9hIC0gMTApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIGhleFRvQnl0ZXMoaGV4KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGV4ICE9PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaGV4IHN0cmluZyBleHBlY3RlZCwgZ290IFwiICsgdHlwZW9mIGhleCk7XG4gICAgICAgIGNvbnN0IGhsID0gaGV4Lmxlbmd0aDtcbiAgICAgICAgY29uc3QgYWwgPSBobCAvIDI7XG4gICAgICAgIGlmIChobCAlIDIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwYWRkZWQgaGV4IHN0cmluZyBleHBlY3RlZCwgZ290IHVucGFkZGVkIGhleCBvZiBsZW5ndGggXCIgKyBobCk7XG4gICAgICAgIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYWwpO1xuICAgICAgICBmb3IgKGxldCBhaSA9IDAsIGhpID0gMDsgYWkgPCBhbDsgYWkrKywgaGkgKz0gMikge1xuICAgICAgICAgICAgY29uc3QgbjEgPSBhc2NpaVRvQmFzZTE2KGhleC5jaGFyQ29kZUF0KGhpKSk7XG4gICAgICAgICAgICBjb25zdCBuMiA9IGFzY2lpVG9CYXNlMTYoaGV4LmNoYXJDb2RlQXQoaGkgKyAxKSk7XG4gICAgICAgICAgICBpZiAobjEgPT09IHZvaWQgMCB8fCBuMiA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hhciA9IGhleFtoaV0gKyBoZXhbaGkgKyAxXTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCBub24taGV4IGNoYXJhY3RlciBcIicgKyBjaGFyICsgJ1wiIGF0IGluZGV4ICcgKyBoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcnJheVthaV0gPSBuMSAqIDE2ICsgbjI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbiAgICBmdW5jdGlvbiBieXRlc1RvTnVtYmVyQkUoYnl0ZXMyKSB7XG4gICAgICAgIHJldHVybiBoZXhUb051bWJlcihieXRlc1RvSGV4KGJ5dGVzMikpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBieXRlc1RvTnVtYmVyTEUoYnl0ZXMyKSB7XG4gICAgICAgIGlmICghaXNCeXRlczMoYnl0ZXMyKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVpbnQ4QXJyYXkgZXhwZWN0ZWRcIik7XG4gICAgICAgIHJldHVybiBoZXhUb051bWJlcihieXRlc1RvSGV4KFVpbnQ4QXJyYXkuZnJvbShieXRlczIpLnJldmVyc2UoKSkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBudW1iZXJUb0J5dGVzQkUobiwgbGVuKSB7XG4gICAgICAgIHJldHVybiBoZXhUb0J5dGVzKG4udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KGxlbiAqIDIsIFwiMFwiKSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG51bWJlclRvQnl0ZXNMRShuLCBsZW4pIHtcbiAgICAgICAgcmV0dXJuIG51bWJlclRvQnl0ZXNCRShuLCBsZW4pLnJldmVyc2UoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZW5zdXJlQnl0ZXModGl0bGUsIGhleCwgZXhwZWN0ZWRMZW5ndGgpIHtcbiAgICAgICAgbGV0IHJlcztcbiAgICAgICAgaWYgKHR5cGVvZiBoZXggPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzID0gaGV4VG9CeXRlcyhoZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGl0bGV9IG11c3QgYmUgdmFsaWQgaGV4IHN0cmluZywgZ290IFwiJHtoZXh9XCIuIENhdXNlOiAke2V9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNCeXRlczMoaGV4KSkge1xuICAgICAgICAgICAgcmVzID0gVWludDhBcnJheS5mcm9tKGhleCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGl0bGV9IG11c3QgYmUgaGV4IHN0cmluZyBvciBVaW50OEFycmF5YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGVuID0gcmVzLmxlbmd0aDtcbiAgICAgICAgaWYgKHR5cGVvZiBleHBlY3RlZExlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBsZW4gIT09IGV4cGVjdGVkTGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RpdGxlfSBleHBlY3RlZCAke2V4cGVjdGVkTGVuZ3RofSBieXRlcywgZ290ICR7bGVufWApO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb25jYXRCeXRlczIoLi4uYXJyYXlzKSB7XG4gICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYSA9IGFycmF5c1tpXTtcbiAgICAgICAgICAgIGlmICghaXNCeXRlczMoYSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVWludDhBcnJheSBleHBlY3RlZFwiKTtcbiAgICAgICAgICAgIHN1bSArPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVzID0gbmV3IFVpbnQ4QXJyYXkoc3VtKTtcbiAgICAgICAgbGV0IHBhZCA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gYXJyYXlzW2ldO1xuICAgICAgICAgICAgcmVzLnNldChhLCBwYWQpO1xuICAgICAgICAgICAgcGFkICs9IGEubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIHZhciBiaXRNYXNrID0gKG4pID0+IChfMm4gPDwgQmlnSW50KG4gLSAxKSkgLSBfMW47XG4gICAgdmFyIHZhbGlkYXRvckZucyA9IHtcbiAgICAgICAgYmlnaW50OiAodmFsKSA9PiB0eXBlb2YgdmFsID09PSBcImJpZ2ludFwiLFxuICAgICAgICBmdW5jdGlvbjogKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gXCJmdW5jdGlvblwiLFxuICAgICAgICBib29sZWFuOiAodmFsKSA9PiB0eXBlb2YgdmFsID09PSBcImJvb2xlYW5cIixcbiAgICAgICAgc3RyaW5nOiAodmFsKSA9PiB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiLFxuICAgICAgICBzdHJpbmdPclVpbnQ4QXJyYXk6ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgfHwgaXNCeXRlczModmFsKSxcbiAgICAgICAgaXNTYWZlSW50ZWdlcjogKHZhbCkgPT4gTnVtYmVyLmlzU2FmZUludGVnZXIodmFsKSxcbiAgICAgICAgYXJyYXk6ICh2YWwpID0+IEFycmF5LmlzQXJyYXkodmFsKSxcbiAgICAgICAgZmllbGQ6ICh2YWwsIG9iamVjdCkgPT4gb2JqZWN0LkZwLmlzVmFsaWQodmFsKSxcbiAgICAgICAgaGFzaDogKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gXCJmdW5jdGlvblwiICYmIE51bWJlci5pc1NhZmVJbnRlZ2VyKHZhbC5vdXRwdXRMZW4pXG4gICAgfTtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdChvYmplY3QsIHZhbGlkYXRvcnMsIG9wdFZhbGlkYXRvcnMgPSB7fSkge1xuICAgICAgICBjb25zdCBjaGVja0ZpZWxkID0gKGZpZWxkTmFtZSwgdHlwZSwgaXNPcHRpb25hbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tWYWwgPSB2YWxpZGF0b3JGbnNbdHlwZV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNoZWNrVmFsICE9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZhbGlkYXRvciBcIiR7dHlwZX1cIiwgZXhwZWN0ZWQgZnVuY3Rpb25gKTtcbiAgICAgICAgICAgIGNvbnN0IHZhbCA9IG9iamVjdFtmaWVsZE5hbWVdO1xuICAgICAgICAgICAgaWYgKGlzT3B0aW9uYWwgJiYgdmFsID09PSB2b2lkIDApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCFjaGVja1ZhbCh2YWwsIG9iamVjdCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW0gJHtTdHJpbmcoZmllbGROYW1lKX09JHt2YWx9ICgke3R5cGVvZiB2YWx9KSwgZXhwZWN0ZWQgJHt0eXBlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IFtmaWVsZE5hbWUsIHR5cGVdIG9mIE9iamVjdC5lbnRyaWVzKHZhbGlkYXRvcnMpKVxuICAgICAgICAgICAgY2hlY2tGaWVsZChmaWVsZE5hbWUsIHR5cGUsIGZhbHNlKTtcbiAgICAgICAgZm9yIChjb25zdCBbZmllbGROYW1lLCB0eXBlXSBvZiBPYmplY3QuZW50cmllcyhvcHRWYWxpZGF0b3JzKSlcbiAgICAgICAgICAgIGNoZWNrRmllbGQoZmllbGROYW1lLCB0eXBlLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG4gICAgLy8gLi4vZXNtL2Fic3RyYWN0L21vZHVsYXIuanNcbiAgICB2YXIgXzBuMiA9IEJpZ0ludCgwKTtcbiAgICB2YXIgXzFuMiA9IEJpZ0ludCgxKTtcbiAgICB2YXIgXzJuMiA9IEJpZ0ludCgyKTtcbiAgICB2YXIgXzNuID0gQmlnSW50KDMpO1xuICAgIHZhciBfNG4gPSBCaWdJbnQoNCk7XG4gICAgdmFyIF81biA9IEJpZ0ludCg1KTtcbiAgICB2YXIgXzhuID0gQmlnSW50KDgpO1xuICAgIHZhciBfOW4gPSBCaWdJbnQoOSk7XG4gICAgdmFyIF8xNm4gPSBCaWdJbnQoMTYpO1xuICAgIGZ1bmN0aW9uIG1vZChhLCBiKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGEgJSBiO1xuICAgICAgICByZXR1cm4gcmVzdWx0ID49IF8wbjIgPyByZXN1bHQgOiBiICsgcmVzdWx0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBwb3cobnVtLCBwb3dlciwgbW9kdWxvKSB7XG4gICAgICAgIGlmIChtb2R1bG8gPD0gXzBuMiB8fCBwb3dlciA8IF8wbjIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBwb3dlci9tb2R1bG8gPiAwXCIpO1xuICAgICAgICBpZiAobW9kdWxvID09PSBfMW4yKVxuICAgICAgICAgICAgcmV0dXJuIF8wbjI7XG4gICAgICAgIGxldCByZXMgPSBfMW4yO1xuICAgICAgICB3aGlsZSAocG93ZXIgPiBfMG4yKSB7XG4gICAgICAgICAgICBpZiAocG93ZXIgJiBfMW4yKVxuICAgICAgICAgICAgICAgIHJlcyA9IHJlcyAqIG51bSAlIG1vZHVsbztcbiAgICAgICAgICAgIG51bSA9IG51bSAqIG51bSAlIG1vZHVsbztcbiAgICAgICAgICAgIHBvd2VyID4+PSBfMW4yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBvdzIoeCwgcG93ZXIsIG1vZHVsbykge1xuICAgICAgICBsZXQgcmVzID0geDtcbiAgICAgICAgd2hpbGUgKHBvd2VyLS0gPiBfMG4yKSB7XG4gICAgICAgICAgICByZXMgKj0gcmVzO1xuICAgICAgICAgICAgcmVzICU9IG1vZHVsbztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnZlcnQobnVtYmVyLCBtb2R1bG8pIHtcbiAgICAgICAgaWYgKG51bWJlciA9PT0gXzBuMiB8fCBtb2R1bG8gPD0gXzBuMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZlcnQ6IGV4cGVjdGVkIHBvc2l0aXZlIGludGVnZXJzLCBnb3Qgbj0ke251bWJlcn0gbW9kPSR7bW9kdWxvfWApO1xuICAgICAgICB9XG4gICAgICAgIGxldCBhID0gbW9kKG51bWJlciwgbW9kdWxvKTtcbiAgICAgICAgbGV0IGIgPSBtb2R1bG87XG4gICAgICAgIGxldCB4ID0gXzBuMiwgeSA9IF8xbjIsIHUgPSBfMW4yLCB2ID0gXzBuMjtcbiAgICAgICAgd2hpbGUgKGEgIT09IF8wbjIpIHtcbiAgICAgICAgICAgIGNvbnN0IHEgPSBiIC8gYTtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBiICUgYTtcbiAgICAgICAgICAgIGNvbnN0IG0gPSB4IC0gdSAqIHE7XG4gICAgICAgICAgICBjb25zdCBuID0geSAtIHYgKiBxO1xuICAgICAgICAgICAgYiA9IGEsIGEgPSByLCB4ID0gdSwgeSA9IHYsIHUgPSBtLCB2ID0gbjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBnY2QgPSBiO1xuICAgICAgICBpZiAoZ2NkICE9PSBfMW4yKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52ZXJ0OiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgICAgcmV0dXJuIG1vZCh4LCBtb2R1bG8pO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b25lbGxpU2hhbmtzKFApIHtcbiAgICAgICAgY29uc3QgbGVnZW5kcmVDID0gKFAgLSBfMW4yKSAvIF8ybjI7XG4gICAgICAgIGxldCBRLCBTLCBaO1xuICAgICAgICBmb3IgKFEgPSBQIC0gXzFuMiwgUyA9IDA7IFEgJSBfMm4yID09PSBfMG4yOyBRIC89IF8ybjIsIFMrKylcbiAgICAgICAgICAgIDtcbiAgICAgICAgZm9yIChaID0gXzJuMjsgWiA8IFAgJiYgcG93KFosIGxlZ2VuZHJlQywgUCkgIT09IFAgLSBfMW4yOyBaKyspXG4gICAgICAgICAgICA7XG4gICAgICAgIGlmIChTID09PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBwMWRpdjQgPSAoUCArIF8xbjIpIC8gXzRuO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHRvbmVsbGlGYXN0KEZwMiwgbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3QgPSBGcDIucG93KG4sIHAxZGl2NCk7XG4gICAgICAgICAgICAgICAgaWYgKCFGcDIuZXFsKEZwMi5zcXIocm9vdCksIG4pKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBzcXVhcmUgcm9vdFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgUTFkaXYyID0gKFEgKyBfMW4yKSAvIF8ybjI7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiB0b25lbGxpU2xvdyhGcDIsIG4pIHtcbiAgICAgICAgICAgIGlmIChGcDIucG93KG4sIGxlZ2VuZHJlQykgPT09IEZwMi5uZWcoRnAyLk9ORSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3RcIik7XG4gICAgICAgICAgICBsZXQgciA9IFM7XG4gICAgICAgICAgICBsZXQgZyA9IEZwMi5wb3coRnAyLm11bChGcDIuT05FLCBaKSwgUSk7XG4gICAgICAgICAgICBsZXQgeCA9IEZwMi5wb3cobiwgUTFkaXYyKTtcbiAgICAgICAgICAgIGxldCBiID0gRnAyLnBvdyhuLCBRKTtcbiAgICAgICAgICAgIHdoaWxlICghRnAyLmVxbChiLCBGcDIuT05FKSkge1xuICAgICAgICAgICAgICAgIGlmIChGcDIuZXFsKGIsIEZwMi5aRVJPKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZwMi5aRVJPO1xuICAgICAgICAgICAgICAgIGxldCBtID0gMTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0MiA9IEZwMi5zcXIoYik7IG0gPCByOyBtKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEZwMi5lcWwodDIsIEZwMi5PTkUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIHQyID0gRnAyLnNxcih0Mik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGdlID0gRnAyLnBvdyhnLCBfMW4yIDw8IEJpZ0ludChyIC0gbSAtIDEpKTtcbiAgICAgICAgICAgICAgICBnID0gRnAyLnNxcihnZSk7XG4gICAgICAgICAgICAgICAgeCA9IEZwMi5tdWwoeCwgZ2UpO1xuICAgICAgICAgICAgICAgIGIgPSBGcDIubXVsKGIsIGcpO1xuICAgICAgICAgICAgICAgIHIgPSBtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIEZwU3FydChQKSB7XG4gICAgICAgIGlmIChQICUgXzRuID09PSBfM24pIHtcbiAgICAgICAgICAgIGNvbnN0IHAxZGl2NCA9IChQICsgXzFuMikgLyBfNG47XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gc3FydDNtb2Q0KEZwMiwgbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3QgPSBGcDIucG93KG4sIHAxZGl2NCk7XG4gICAgICAgICAgICAgICAgaWYgKCFGcDIuZXFsKEZwMi5zcXIocm9vdCksIG4pKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBzcXVhcmUgcm9vdFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFAgJSBfOG4gPT09IF81bikge1xuICAgICAgICAgICAgY29uc3QgYzEgPSAoUCAtIF81bikgLyBfOG47XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gc3FydDVtb2Q4KEZwMiwgbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IG4yID0gRnAyLm11bChuLCBfMm4yKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gRnAyLnBvdyhuMiwgYzEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG52ID0gRnAyLm11bChuLCB2KTtcbiAgICAgICAgICAgICAgICBjb25zdCBpID0gRnAyLm11bChGcDIubXVsKG52LCBfMm4yKSwgdik7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdCA9IEZwMi5tdWwobnYsIEZwMi5zdWIoaSwgRnAyLk9ORSkpO1xuICAgICAgICAgICAgICAgIGlmICghRnAyLmVxbChGcDIuc3FyKHJvb3QpLCBuKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3RcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChQICUgXzE2biA9PT0gXzluKSB7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvbmVsbGlTaGFua3MoUCk7XG4gICAgfVxuICAgIHZhciBpc05lZ2F0aXZlTEUgPSAobnVtLCBtb2R1bG8pID0+IChtb2QobnVtLCBtb2R1bG8pICYgXzFuMikgPT09IF8xbjI7XG4gICAgdmFyIEZJRUxEX0ZJRUxEUyA9IFtcbiAgICAgICAgXCJjcmVhdGVcIixcbiAgICAgICAgXCJpc1ZhbGlkXCIsXG4gICAgICAgIFwiaXMwXCIsXG4gICAgICAgIFwibmVnXCIsXG4gICAgICAgIFwiaW52XCIsXG4gICAgICAgIFwic3FydFwiLFxuICAgICAgICBcInNxclwiLFxuICAgICAgICBcImVxbFwiLFxuICAgICAgICBcImFkZFwiLFxuICAgICAgICBcInN1YlwiLFxuICAgICAgICBcIm11bFwiLFxuICAgICAgICBcInBvd1wiLFxuICAgICAgICBcImRpdlwiLFxuICAgICAgICBcImFkZE5cIixcbiAgICAgICAgXCJzdWJOXCIsXG4gICAgICAgIFwibXVsTlwiLFxuICAgICAgICBcInNxck5cIlxuICAgIF07XG4gICAgZnVuY3Rpb24gdmFsaWRhdGVGaWVsZChmaWVsZCkge1xuICAgICAgICBjb25zdCBpbml0aWFsID0ge1xuICAgICAgICAgICAgT1JERVI6IFwiYmlnaW50XCIsXG4gICAgICAgICAgICBNQVNLOiBcImJpZ2ludFwiLFxuICAgICAgICAgICAgQllURVM6IFwiaXNTYWZlSW50ZWdlclwiLFxuICAgICAgICAgICAgQklUUzogXCJpc1NhZmVJbnRlZ2VyXCJcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb3B0cyA9IEZJRUxEX0ZJRUxEUy5yZWR1Y2UoKG1hcCwgdmFsKSA9PiB7XG4gICAgICAgICAgICBtYXBbdmFsXSA9IFwiZnVuY3Rpb25cIjtcbiAgICAgICAgICAgIHJldHVybiBtYXA7XG4gICAgICAgIH0sIGluaXRpYWwpO1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVPYmplY3QoZmllbGQsIG9wdHMpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBGcFBvdyhmLCBudW0sIHBvd2VyKSB7XG4gICAgICAgIGlmIChwb3dlciA8IF8wbjIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBwb3dlciA+IDBcIik7XG4gICAgICAgIGlmIChwb3dlciA9PT0gXzBuMilcbiAgICAgICAgICAgIHJldHVybiBmLk9ORTtcbiAgICAgICAgaWYgKHBvd2VyID09PSBfMW4yKVxuICAgICAgICAgICAgcmV0dXJuIG51bTtcbiAgICAgICAgbGV0IHAgPSBmLk9ORTtcbiAgICAgICAgbGV0IGQgPSBudW07XG4gICAgICAgIHdoaWxlIChwb3dlciA+IF8wbjIpIHtcbiAgICAgICAgICAgIGlmIChwb3dlciAmIF8xbjIpXG4gICAgICAgICAgICAgICAgcCA9IGYubXVsKHAsIGQpO1xuICAgICAgICAgICAgZCA9IGYuc3FyKGQpO1xuICAgICAgICAgICAgcG93ZXIgPj49IF8xbjI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIEZwSW52ZXJ0QmF0Y2goZiwgbnVtcykge1xuICAgICAgICBjb25zdCB0bXAgPSBuZXcgQXJyYXkobnVtcy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBsYXN0TXVsdGlwbGllZCA9IG51bXMucmVkdWNlKChhY2MsIG51bSwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGYuaXMwKG51bSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIHRtcFtpXSA9IGFjYztcbiAgICAgICAgICAgIHJldHVybiBmLm11bChhY2MsIG51bSk7XG4gICAgICAgIH0sIGYuT05FKTtcbiAgICAgICAgY29uc3QgaW52ZXJ0ZWQgPSBmLmludihsYXN0TXVsdGlwbGllZCk7XG4gICAgICAgIG51bXMucmVkdWNlUmlnaHQoKGFjYywgbnVtLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoZi5pczAobnVtKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgdG1wW2ldID0gZi5tdWwoYWNjLCB0bXBbaV0pO1xuICAgICAgICAgICAgcmV0dXJuIGYubXVsKGFjYywgbnVtKTtcbiAgICAgICAgfSwgaW52ZXJ0ZWQpO1xuICAgICAgICByZXR1cm4gdG1wO1xuICAgIH1cbiAgICBmdW5jdGlvbiBuTGVuZ3RoKG4sIG5CaXRMZW5ndGgpIHtcbiAgICAgICAgY29uc3QgX25CaXRMZW5ndGggPSBuQml0TGVuZ3RoICE9PSB2b2lkIDAgPyBuQml0TGVuZ3RoIDogbi50b1N0cmluZygyKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG5CeXRlTGVuZ3RoID0gTWF0aC5jZWlsKF9uQml0TGVuZ3RoIC8gOCk7XG4gICAgICAgIHJldHVybiB7IG5CaXRMZW5ndGg6IF9uQml0TGVuZ3RoLCBuQnl0ZUxlbmd0aCB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBGaWVsZChPUkRFUiwgYml0TGVuLCBpc0xFMiA9IGZhbHNlLCByZWRlZiA9IHt9KSB7XG4gICAgICAgIGlmIChPUkRFUiA8PSBfMG4yKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBGaWVsZCBPUkRFUiA+IDAsIGdvdCAke09SREVSfWApO1xuICAgICAgICBjb25zdCB7IG5CaXRMZW5ndGg6IEJJVFMsIG5CeXRlTGVuZ3RoOiBCWVRFUyB9ID0gbkxlbmd0aChPUkRFUiwgYml0TGVuKTtcbiAgICAgICAgaWYgKEJZVEVTID4gMjA0OClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGxlbmd0aHMgb3ZlciAyMDQ4IGJ5dGVzIGFyZSBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICBjb25zdCBzcXJ0UCA9IEZwU3FydChPUkRFUik7XG4gICAgICAgIGNvbnN0IGYgPSBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgIE9SREVSLFxuICAgICAgICAgICAgQklUUyxcbiAgICAgICAgICAgIEJZVEVTLFxuICAgICAgICAgICAgTUFTSzogYml0TWFzayhCSVRTKSxcbiAgICAgICAgICAgIFpFUk86IF8wbjIsXG4gICAgICAgICAgICBPTkU6IF8xbjIsXG4gICAgICAgICAgICBjcmVhdGU6IChudW0pID0+IG1vZChudW0sIE9SREVSKSxcbiAgICAgICAgICAgIGlzVmFsaWQ6IChudW0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bSAhPT0gXCJiaWdpbnRcIilcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGZpZWxkIGVsZW1lbnQ6IGV4cGVjdGVkIGJpZ2ludCwgZ290ICR7dHlwZW9mIG51bX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gXzBuMiA8PSBudW0gJiYgbnVtIDwgT1JERVI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXMwOiAobnVtKSA9PiBudW0gPT09IF8wbjIsXG4gICAgICAgICAgICBpc09kZDogKG51bSkgPT4gKG51bSAmIF8xbjIpID09PSBfMW4yLFxuICAgICAgICAgICAgbmVnOiAobnVtKSA9PiBtb2QoLW51bSwgT1JERVIpLFxuICAgICAgICAgICAgZXFsOiAobGhzLCByaHMpID0+IGxocyA9PT0gcmhzLFxuICAgICAgICAgICAgc3FyOiAobnVtKSA9PiBtb2QobnVtICogbnVtLCBPUkRFUiksXG4gICAgICAgICAgICBhZGQ6IChsaHMsIHJocykgPT4gbW9kKGxocyArIHJocywgT1JERVIpLFxuICAgICAgICAgICAgc3ViOiAobGhzLCByaHMpID0+IG1vZChsaHMgLSByaHMsIE9SREVSKSxcbiAgICAgICAgICAgIG11bDogKGxocywgcmhzKSA9PiBtb2QobGhzICogcmhzLCBPUkRFUiksXG4gICAgICAgICAgICBwb3c6IChudW0sIHBvd2VyKSA9PiBGcFBvdyhmLCBudW0sIHBvd2VyKSxcbiAgICAgICAgICAgIGRpdjogKGxocywgcmhzKSA9PiBtb2QobGhzICogaW52ZXJ0KHJocywgT1JERVIpLCBPUkRFUiksXG4gICAgICAgICAgICAvLyBTYW1lIGFzIGFib3ZlLCBidXQgZG9lc24ndCBub3JtYWxpemVcbiAgICAgICAgICAgIHNxck46IChudW0pID0+IG51bSAqIG51bSxcbiAgICAgICAgICAgIGFkZE46IChsaHMsIHJocykgPT4gbGhzICsgcmhzLFxuICAgICAgICAgICAgc3ViTjogKGxocywgcmhzKSA9PiBsaHMgLSByaHMsXG4gICAgICAgICAgICBtdWxOOiAobGhzLCByaHMpID0+IGxocyAqIHJocyxcbiAgICAgICAgICAgIGludjogKG51bSkgPT4gaW52ZXJ0KG51bSwgT1JERVIpLFxuICAgICAgICAgICAgc3FydDogcmVkZWYuc3FydCB8fCAoKG4pID0+IHNxcnRQKGYsIG4pKSxcbiAgICAgICAgICAgIGludmVydEJhdGNoOiAobHN0KSA9PiBGcEludmVydEJhdGNoKGYsIGxzdCksXG4gICAgICAgICAgICAvLyBUT0RPOiBkbyB3ZSByZWFsbHkgbmVlZCBjb25zdGFudCBjbW92P1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgaGF2ZSBjb25zdC10aW1lIGJpZ2ludHMgYW55d2F5LCBzbyBwcm9iYWJseSB3aWxsIGJlIG5vdCB2ZXJ5IHVzZWZ1bFxuICAgICAgICAgICAgY21vdjogKGEsIGIsIGMpID0+IGMgPyBiIDogYSxcbiAgICAgICAgICAgIHRvQnl0ZXM6IChudW0pID0+IGlzTEUyID8gbnVtYmVyVG9CeXRlc0xFKG51bSwgQllURVMpIDogbnVtYmVyVG9CeXRlc0JFKG51bSwgQllURVMpLFxuICAgICAgICAgICAgZnJvbUJ5dGVzOiAoYnl0ZXMyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGJ5dGVzMi5sZW5ndGggIT09IEJZVEVTKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZwLmZyb21CeXRlczogZXhwZWN0ZWQgJHtCWVRFU30sIGdvdCAke2J5dGVzMi5sZW5ndGh9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzTEUyID8gYnl0ZXNUb051bWJlckxFKGJ5dGVzMikgOiBieXRlc1RvTnVtYmVyQkUoYnl0ZXMyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKGYpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBGcFNxcnRFdmVuKEZwMiwgZWxtKSB7XG4gICAgICAgIGlmICghRnAyLmlzT2RkKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGaWVsZCBkb2Vzbid0IGhhdmUgaXNPZGRgKTtcbiAgICAgICAgY29uc3Qgcm9vdCA9IEZwMi5zcXJ0KGVsbSk7XG4gICAgICAgIHJldHVybiBGcDIuaXNPZGQocm9vdCkgPyBGcDIubmVnKHJvb3QpIDogcm9vdDtcbiAgICB9XG4gICAgLy8gLi4vZXNtL2Fic3RyYWN0L2N1cnZlLmpzXG4gICAgdmFyIF8wbjMgPSBCaWdJbnQoMCk7XG4gICAgdmFyIF8xbjMgPSBCaWdJbnQoMSk7XG4gICAgZnVuY3Rpb24gd05BRihjLCBiaXRzKSB7XG4gICAgICAgIGNvbnN0IGNvbnN0VGltZU5lZ2F0ZSA9IChjb25kaXRpb24sIGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5lZyA9IGl0ZW0ubmVnYXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gY29uZGl0aW9uID8gbmVnIDogaXRlbTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb3B0cyA9IChXKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3aW5kb3dzID0gTWF0aC5jZWlsKGJpdHMgLyBXKSArIDE7XG4gICAgICAgICAgICBjb25zdCB3aW5kb3dTaXplID0gMiAqKiAoVyAtIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHsgd2luZG93cywgd2luZG93U2l6ZSB9O1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29uc3RUaW1lTmVnYXRlLFxuICAgICAgICAgICAgLy8gbm9uLWNvbnN0IHRpbWUgbXVsdGlwbGljYXRpb24gbGFkZGVyXG4gICAgICAgICAgICB1bnNhZmVMYWRkZXIoZWxtLCBuKSB7XG4gICAgICAgICAgICAgICAgbGV0IHAgPSBjLlpFUk87XG4gICAgICAgICAgICAgICAgbGV0IGQgPSBlbG07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG4gPiBfMG4zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuICYgXzFuMylcbiAgICAgICAgICAgICAgICAgICAgICAgIHAgPSBwLmFkZChkKTtcbiAgICAgICAgICAgICAgICAgICAgZCA9IGQuZG91YmxlKCk7XG4gICAgICAgICAgICAgICAgICAgIG4gPj49IF8xbjM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQ3JlYXRlcyBhIHdOQUYgcHJlY29tcHV0YXRpb24gd2luZG93LiBVc2VkIGZvciBjYWNoaW5nLlxuICAgICAgICAgICAgICogRGVmYXVsdCB3aW5kb3cgc2l6ZSBpcyBzZXQgYnkgYHV0aWxzLnByZWNvbXB1dGUoKWAgYW5kIGlzIGVxdWFsIHRvIDguXG4gICAgICAgICAgICAgKiBOdW1iZXIgb2YgcHJlY29tcHV0ZWQgcG9pbnRzIGRlcGVuZHMgb24gdGhlIGN1cnZlIHNpemU6XG4gICAgICAgICAgICAgKiAyXijwnZGK4oiSMSkgKiAoTWF0aC5jZWlsKPCdkZsgLyDwnZGKKSArIDEpLCB3aGVyZTpcbiAgICAgICAgICAgICAqIC0g8J2RiiBpcyB0aGUgd2luZG93IHNpemVcbiAgICAgICAgICAgICAqIC0g8J2RmyBpcyB0aGUgYml0bGVuZ3RoIG9mIHRoZSBjdXJ2ZSBvcmRlci5cbiAgICAgICAgICAgICAqIEZvciBhIDI1Ni1iaXQgY3VydmUgYW5kIHdpbmRvdyBzaXplIDgsIHRoZSBudW1iZXIgb2YgcHJlY29tcHV0ZWQgcG9pbnRzIGlzIDEyOCAqIDMzID0gNDIyNC5cbiAgICAgICAgICAgICAqIEByZXR1cm5zIHByZWNvbXB1dGVkIHBvaW50IHRhYmxlcyBmbGF0dGVuZWQgdG8gYSBzaW5nbGUgYXJyYXlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcHJlY29tcHV0ZVdpbmRvdyhlbG0sIFcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHdpbmRvd3MsIHdpbmRvd1NpemUgfSA9IG9wdHMoVyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgICAgICAgICAgICAgbGV0IHAgPSBlbG07XG4gICAgICAgICAgICAgICAgbGV0IGJhc2UgPSBwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHdpbmRvdyA9IDA7IHdpbmRvdyA8IHdpbmRvd3M7IHdpbmRvdysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UgPSBwO1xuICAgICAgICAgICAgICAgICAgICBwb2ludHMucHVzaChiYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB3aW5kb3dTaXplOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSBiYXNlLmFkZChwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKGJhc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHAgPSBiYXNlLmRvdWJsZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW1wbGVtZW50cyBlYyBtdWx0aXBsaWNhdGlvbiB1c2luZyBwcmVjb21wdXRlZCB0YWJsZXMgYW5kIHctYXJ5IG5vbi1hZGphY2VudCBmb3JtLlxuICAgICAgICAgICAgICogQHBhcmFtIFcgd2luZG93IHNpemVcbiAgICAgICAgICAgICAqIEBwYXJhbSBwcmVjb21wdXRlcyBwcmVjb21wdXRlZCB0YWJsZXNcbiAgICAgICAgICAgICAqIEBwYXJhbSBuIHNjYWxhciAod2UgZG9uJ3QgY2hlY2sgaGVyZSwgYnV0IHNob3VsZCBiZSBsZXNzIHRoYW4gY3VydmUgb3JkZXIpXG4gICAgICAgICAgICAgKiBAcmV0dXJucyByZWFsIGFuZCBmYWtlIChmb3IgY29uc3QtdGltZSkgcG9pbnRzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHdOQUYoVywgcHJlY29tcHV0ZXMsIG4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHdpbmRvd3MsIHdpbmRvd1NpemUgfSA9IG9wdHMoVyk7XG4gICAgICAgICAgICAgICAgbGV0IHAgPSBjLlpFUk87XG4gICAgICAgICAgICAgICAgbGV0IGYgPSBjLkJBU0U7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFzayA9IEJpZ0ludCgyICoqIFcgLSAxKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXhOdW1iZXIgPSAyICoqIFc7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2hpZnRCeSA9IEJpZ0ludChXKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB3aW5kb3cgPSAwOyB3aW5kb3cgPCB3aW5kb3dzOyB3aW5kb3crKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB3aW5kb3cgKiB3aW5kb3dTaXplO1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2JpdHMgPSBOdW1iZXIobiAmIG1hc2spO1xuICAgICAgICAgICAgICAgICAgICBuID4+PSBzaGlmdEJ5O1xuICAgICAgICAgICAgICAgICAgICBpZiAod2JpdHMgPiB3aW5kb3dTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3Yml0cyAtPSBtYXhOdW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBuICs9IF8xbjM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0MSA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0MiA9IG9mZnNldCArIE1hdGguYWJzKHdiaXRzKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbmQxID0gd2luZG93ICUgMiAhPT0gMDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uZDIgPSB3Yml0cyA8IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3Yml0cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZiA9IGYuYWRkKGNvbnN0VGltZU5lZ2F0ZShjb25kMSwgcHJlY29tcHV0ZXNbb2Zmc2V0MV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHAgPSBwLmFkZChjb25zdFRpbWVOZWdhdGUoY29uZDIsIHByZWNvbXB1dGVzW29mZnNldDJdKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgcCwgZiB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdOQUZDYWNoZWQoUCwgcHJlY29tcHV0ZXNNYXAsIG4sIHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFcgPSBQLl9XSU5ET1dfU0laRSB8fCAxO1xuICAgICAgICAgICAgICAgIGxldCBjb21wID0gcHJlY29tcHV0ZXNNYXAuZ2V0KFApO1xuICAgICAgICAgICAgICAgIGlmICghY29tcCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wID0gdGhpcy5wcmVjb21wdXRlV2luZG93KFAsIFcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoVyAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlY29tcHV0ZXNNYXAuc2V0KFAsIHRyYW5zZm9ybShjb21wKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud05BRihXLCBjb21wLCBuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdmFsaWRhdGVCYXNpYyhjdXJ2ZSkge1xuICAgICAgICB2YWxpZGF0ZUZpZWxkKGN1cnZlLkZwKTtcbiAgICAgICAgdmFsaWRhdGVPYmplY3QoY3VydmUsIHtcbiAgICAgICAgICAgIG46IFwiYmlnaW50XCIsXG4gICAgICAgICAgICBoOiBcImJpZ2ludFwiLFxuICAgICAgICAgICAgR3g6IFwiZmllbGRcIixcbiAgICAgICAgICAgIEd5OiBcImZpZWxkXCJcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbkJpdExlbmd0aDogXCJpc1NhZmVJbnRlZ2VyXCIsXG4gICAgICAgICAgICBuQnl0ZUxlbmd0aDogXCJpc1NhZmVJbnRlZ2VyXCJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgIC4uLm5MZW5ndGgoY3VydmUubiwgY3VydmUubkJpdExlbmd0aCksXG4gICAgICAgICAgICAuLi5jdXJ2ZSxcbiAgICAgICAgICAgIC4uLnsgcDogY3VydmUuRnAuT1JERVIgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gLi4vZXNtL2Fic3RyYWN0L2Vkd2FyZHMuanNcbiAgICB2YXIgXzBuNCA9IEJpZ0ludCgwKTtcbiAgICB2YXIgXzFuNCA9IEJpZ0ludCgxKTtcbiAgICB2YXIgXzJuMyA9IEJpZ0ludCgyKTtcbiAgICB2YXIgXzhuMiA9IEJpZ0ludCg4KTtcbiAgICB2YXIgVkVSSUZZX0RFRkFVTFQgPSB7IHppcDIxNTogdHJ1ZSB9O1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlT3B0cyhjdXJ2ZSkge1xuICAgICAgICBjb25zdCBvcHRzID0gdmFsaWRhdGVCYXNpYyhjdXJ2ZSk7XG4gICAgICAgIHZhbGlkYXRlT2JqZWN0KGN1cnZlLCB7XG4gICAgICAgICAgICBoYXNoOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgICBhOiBcImJpZ2ludFwiLFxuICAgICAgICAgICAgZDogXCJiaWdpbnRcIixcbiAgICAgICAgICAgIHJhbmRvbUJ5dGVzOiBcImZ1bmN0aW9uXCJcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWRqdXN0U2NhbGFyQnl0ZXM6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICAgIGRvbWFpbjogXCJmdW5jdGlvblwiLFxuICAgICAgICAgICAgdXZSYXRpbzogXCJmdW5jdGlvblwiLFxuICAgICAgICAgICAgbWFwVG9DdXJ2ZTogXCJmdW5jdGlvblwiXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7IC4uLm9wdHMgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHR3aXN0ZWRFZHdhcmRzKGN1cnZlRGVmKSB7XG4gICAgICAgIGNvbnN0IENVUlZFID0gdmFsaWRhdGVPcHRzKGN1cnZlRGVmKTtcbiAgICAgICAgY29uc3QgeyBGcDogRnAyLCBuOiBDVVJWRV9PUkRFUiwgcHJlaGFzaCwgaGFzaDogY0hhc2gsIHJhbmRvbUJ5dGVzOiByYW5kb21CeXRlczIsIG5CeXRlTGVuZ3RoLCBoOiBjb2ZhY3RvciB9ID0gQ1VSVkU7XG4gICAgICAgIGNvbnN0IE1BU0sgPSBfMm4zIDw8IEJpZ0ludChuQnl0ZUxlbmd0aCAqIDgpIC0gXzFuNDtcbiAgICAgICAgY29uc3QgbW9kUCA9IEZwMi5jcmVhdGU7XG4gICAgICAgIGNvbnN0IHV2UmF0aW8yID0gQ1VSVkUudXZSYXRpbyB8fCAoKHUsIHYpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSwgdmFsdWU6IEZwMi5zcXJ0KHUgKiBGcDIuaW52KHYpKSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgdmFsdWU6IF8wbjQgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGFkanVzdFNjYWxhckJ5dGVzMiA9IENVUlZFLmFkanVzdFNjYWxhckJ5dGVzIHx8ICgoYnl0ZXMyKSA9PiBieXRlczIpO1xuICAgICAgICBjb25zdCBkb21haW4gPSBDVVJWRS5kb21haW4gfHwgKChkYXRhLCBjdHgsIHBoZmxhZykgPT4ge1xuICAgICAgICAgICAgaWYgKGN0eC5sZW5ndGggfHwgcGhmbGFnKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbnRleHRzL3ByZS1oYXNoIGFyZSBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBpbkJpZyA9IChuKSA9PiB0eXBlb2YgbiA9PT0gXCJiaWdpbnRcIiAmJiBfMG40IDwgbjtcbiAgICAgICAgY29uc3QgaW5SYW5nZSA9IChuLCBtYXgpID0+IGluQmlnKG4pICYmIGluQmlnKG1heCkgJiYgbiA8IG1heDtcbiAgICAgICAgY29uc3QgaW4wTWFza1JhbmdlID0gKG4pID0+IG4gPT09IF8wbjQgfHwgaW5SYW5nZShuLCBNQVNLKTtcbiAgICAgICAgZnVuY3Rpb24gYXNzZXJ0SW5SYW5nZShuLCBtYXgpIHtcbiAgICAgICAgICAgIGlmIChpblJhbmdlKG4sIG1heCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHZhbGlkIHNjYWxhciA8ICR7bWF4fSwgZ290ICR7dHlwZW9mIG59ICR7bn1gKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBhc3NlcnRHRTAobikge1xuICAgICAgICAgICAgcmV0dXJuIG4gPT09IF8wbjQgPyBuIDogYXNzZXJ0SW5SYW5nZShuLCBDVVJWRV9PUkRFUik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9pbnRQcmVjb21wdXRlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgICAgIGZ1bmN0aW9uIGlzUG9pbnQob3RoZXIpIHtcbiAgICAgICAgICAgIGlmICghKG90aGVyIGluc3RhbmNlb2YgUG9pbnQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4dGVuZGVkUG9pbnQgZXhwZWN0ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgY2xhc3MgUG9pbnQge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoZXgsIGV5LCBleiwgZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4ID0gZXg7XG4gICAgICAgICAgICAgICAgdGhpcy5leSA9IGV5O1xuICAgICAgICAgICAgICAgIHRoaXMuZXogPSBlejtcbiAgICAgICAgICAgICAgICB0aGlzLmV0ID0gZXQ7XG4gICAgICAgICAgICAgICAgaWYgKCFpbjBNYXNrUmFuZ2UoZXgpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ4IHJlcXVpcmVkXCIpO1xuICAgICAgICAgICAgICAgIGlmICghaW4wTWFza1JhbmdlKGV5KSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwieSByZXF1aXJlZFwiKTtcbiAgICAgICAgICAgICAgICBpZiAoIWluME1hc2tSYW5nZShleikpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInogcmVxdWlyZWRcIik7XG4gICAgICAgICAgICAgICAgaWYgKCFpbjBNYXNrUmFuZ2UoZXQpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0IHJlcXVpcmVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2V0IHgoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9BZmZpbmUoKS54O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2V0IHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9BZmZpbmUoKS55O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGljIGZyb21BZmZpbmUocCkge1xuICAgICAgICAgICAgICAgIGlmIChwIGluc3RhbmNlb2YgUG9pbnQpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImV4dGVuZGVkIHBvaW50IG5vdCBhbGxvd2VkXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgeCwgeSB9ID0gcCB8fCB7fTtcbiAgICAgICAgICAgICAgICBpZiAoIWluME1hc2tSYW5nZSh4KSB8fCAhaW4wTWFza1JhbmdlKHkpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGFmZmluZSBwb2ludFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvaW50KHgsIHksIF8xbjQsIG1vZFAoeCAqIHkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRpYyBub3JtYWxpemVaKHBvaW50cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvSW52ID0gRnAyLmludmVydEJhdGNoKHBvaW50cy5tYXAoKHApID0+IHAuZXopKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9pbnRzLm1hcCgocCwgaSkgPT4gcC50b0FmZmluZSh0b0ludltpXSkpLm1hcChQb2ludC5mcm9tQWZmaW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFwiUHJpdmF0ZSBtZXRob2RcIiwgZG9uJ3QgdXNlIGl0IGRpcmVjdGx5XG4gICAgICAgICAgICBfc2V0V2luZG93U2l6ZSh3aW5kb3dTaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fV0lORE9XX1NJWkUgPSB3aW5kb3dTaXplO1xuICAgICAgICAgICAgICAgIHBvaW50UHJlY29tcHV0ZXMuZGVsZXRlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm90IHJlcXVpcmVkIGZvciBmcm9tSGV4KCksIHdoaWNoIGFsd2F5cyBjcmVhdGVzIHZhbGlkIHBvaW50cy5cbiAgICAgICAgICAgIC8vIENvdWxkIGJlIHVzZWZ1bCBmb3IgZnJvbUFmZmluZSgpLlxuICAgICAgICAgICAgYXNzZXJ0VmFsaWRpdHkoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBhLCBkIH0gPSBDVVJWRTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pczAoKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYmFkIHBvaW50OiBaRVJPXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZXg6IFgsIGV5OiBZLCBlejogWiwgZXQ6IFQgfSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgY29uc3QgWDIgPSBtb2RQKFggKiBYKTtcbiAgICAgICAgICAgICAgICBjb25zdCBZMiA9IG1vZFAoWSAqIFkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFoyID0gbW9kUChaICogWik7XG4gICAgICAgICAgICAgICAgY29uc3QgWjQgPSBtb2RQKFoyICogWjIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFYMiA9IG1vZFAoWDIgKiBhKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsZWZ0ID0gbW9kUChaMiAqIG1vZFAoYVgyICsgWTIpKTtcbiAgICAgICAgICAgICAgICBjb25zdCByaWdodCA9IG1vZFAoWjQgKyBtb2RQKGQgKiBtb2RQKFgyICogWTIpKSk7XG4gICAgICAgICAgICAgICAgaWYgKGxlZnQgIT09IHJpZ2h0KVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYWQgcG9pbnQ6IGVxdWF0aW9uIGxlZnQgIT0gcmlnaHQgKDEpXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFhZID0gbW9kUChYICogWSk7XG4gICAgICAgICAgICAgICAgY29uc3QgWlQgPSBtb2RQKFogKiBUKTtcbiAgICAgICAgICAgICAgICBpZiAoWFkgIT09IFpUKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYWQgcG9pbnQ6IGVxdWF0aW9uIGxlZnQgIT0gcmlnaHQgKDIpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ29tcGFyZSBvbmUgcG9pbnQgdG8gYW5vdGhlci5cbiAgICAgICAgICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICAgICAgICAgIGlzUG9pbnQob3RoZXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZXg6IFgxLCBleTogWTEsIGV6OiBaMSB9ID0gdGhpcztcbiAgICAgICAgICAgICAgICBjb25zdCB7IGV4OiBYMiwgZXk6IFkyLCBlejogWjIgfSA9IG90aGVyO1xuICAgICAgICAgICAgICAgIGNvbnN0IFgxWjIgPSBtb2RQKFgxICogWjIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFgyWjEgPSBtb2RQKFgyICogWjEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFkxWjIgPSBtb2RQKFkxICogWjIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFkyWjEgPSBtb2RQKFkyICogWjEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBYMVoyID09PSBYMloxICYmIFkxWjIgPT09IFkyWjE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpczAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKFBvaW50LlpFUk8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmVnYXRlKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9pbnQobW9kUCgtdGhpcy5leCksIHRoaXMuZXksIHRoaXMuZXosIG1vZFAoLXRoaXMuZXQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZhc3QgYWxnbyBmb3IgZG91YmxpbmcgRXh0ZW5kZWQgUG9pbnQuXG4gICAgICAgICAgICAvLyBodHRwczovL2h5cGVyZWxsaXB0aWMub3JnL0VGRC9nMXAvYXV0by10d2lzdGVkLWV4dGVuZGVkLmh0bWwjZG91YmxpbmctZGJsLTIwMDgtaHdjZFxuICAgICAgICAgICAgLy8gQ29zdDogNE0gKyA0UyArIDEqYSArIDZhZGQgKyAxKjIuXG4gICAgICAgICAgICBkb3VibGUoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBhIH0gPSBDVVJWRTtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGV4OiBYMSwgZXk6IFkxLCBlejogWjEgfSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgY29uc3QgQSA9IG1vZFAoWDEgKiBYMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgQiA9IG1vZFAoWTEgKiBZMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgQyA9IG1vZFAoXzJuMyAqIG1vZFAoWjEgKiBaMSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IEQgPSBtb2RQKGEgKiBBKTtcbiAgICAgICAgICAgICAgICBjb25zdCB4MXkxID0gWDEgKyBZMTtcbiAgICAgICAgICAgICAgICBjb25zdCBFID0gbW9kUChtb2RQKHgxeTEgKiB4MXkxKSAtIEEgLSBCKTtcbiAgICAgICAgICAgICAgICBjb25zdCBHMiA9IEQgKyBCO1xuICAgICAgICAgICAgICAgIGNvbnN0IEYgPSBHMiAtIEM7XG4gICAgICAgICAgICAgICAgY29uc3QgSCA9IEQgLSBCO1xuICAgICAgICAgICAgICAgIGNvbnN0IFgzID0gbW9kUChFICogRik7XG4gICAgICAgICAgICAgICAgY29uc3QgWTMgPSBtb2RQKEcyICogSCk7XG4gICAgICAgICAgICAgICAgY29uc3QgVDMgPSBtb2RQKEUgKiBIKTtcbiAgICAgICAgICAgICAgICBjb25zdCBaMyA9IG1vZFAoRiAqIEcyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvaW50KFgzLCBZMywgWjMsIFQzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZhc3QgYWxnbyBmb3IgYWRkaW5nIDIgRXh0ZW5kZWQgUG9pbnRzLlxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9oeXBlcmVsbGlwdGljLm9yZy9FRkQvZzFwL2F1dG8tdHdpc3RlZC1leHRlbmRlZC5odG1sI2FkZGl0aW9uLWFkZC0yMDA4LWh3Y2RcbiAgICAgICAgICAgIC8vIENvc3Q6IDlNICsgMSphICsgMSpkICsgN2FkZC5cbiAgICAgICAgICAgIGFkZChvdGhlcikge1xuICAgICAgICAgICAgICAgIGlzUG9pbnQob3RoZXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgYSwgZCB9ID0gQ1VSVkU7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBleDogWDEsIGV5OiBZMSwgZXo6IFoxLCBldDogVDEgfSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBleDogWDIsIGV5OiBZMiwgZXo6IFoyLCBldDogVDIgfSA9IG90aGVyO1xuICAgICAgICAgICAgICAgIGlmIChhID09PSBCaWdJbnQoLTEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IEEyID0gbW9kUCgoWTEgLSBYMSkgKiAoWTIgKyBYMikpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBCMiA9IG1vZFAoKFkxICsgWDEpICogKFkyIC0gWDIpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgRjIgPSBtb2RQKEIyIC0gQTIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoRjIgPT09IF8wbjQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kb3VibGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgQzIgPSBtb2RQKFoxICogXzJuMyAqIFQyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgRDIgPSBtb2RQKFQxICogXzJuMyAqIFoyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgRTIgPSBEMiArIEMyO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBHMyA9IEIyICsgQTI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IEgyID0gRDIgLSBDMjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgWDMyID0gbW9kUChFMiAqIEYyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgWTMyID0gbW9kUChHMyAqIEgyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgVDMyID0gbW9kUChFMiAqIEgyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgWjMyID0gbW9kUChGMiAqIEczKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQb2ludChYMzIsIFkzMiwgWjMyLCBUMzIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBBID0gbW9kUChYMSAqIFgyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBCID0gbW9kUChZMSAqIFkyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBDID0gbW9kUChUMSAqIGQgKiBUMik7XG4gICAgICAgICAgICAgICAgY29uc3QgRCA9IG1vZFAoWjEgKiBaMik7XG4gICAgICAgICAgICAgICAgY29uc3QgRSA9IG1vZFAoKFgxICsgWTEpICogKFgyICsgWTIpIC0gQSAtIEIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IEYgPSBEIC0gQztcbiAgICAgICAgICAgICAgICBjb25zdCBHMiA9IEQgKyBDO1xuICAgICAgICAgICAgICAgIGNvbnN0IEggPSBtb2RQKEIgLSBhICogQSk7XG4gICAgICAgICAgICAgICAgY29uc3QgWDMgPSBtb2RQKEUgKiBGKTtcbiAgICAgICAgICAgICAgICBjb25zdCBZMyA9IG1vZFAoRzIgKiBIKTtcbiAgICAgICAgICAgICAgICBjb25zdCBUMyA9IG1vZFAoRSAqIEgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFozID0gbW9kUChGICogRzIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9pbnQoWDMsIFkzLCBaMywgVDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VidHJhY3Qob3RoZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQob3RoZXIubmVnYXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd05BRihuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHduYWYud05BRkNhY2hlZCh0aGlzLCBwb2ludFByZWNvbXB1dGVzLCBuLCBQb2ludC5ub3JtYWxpemVaKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENvbnN0YW50LXRpbWUgbXVsdGlwbGljYXRpb24uXG4gICAgICAgICAgICBtdWx0aXBseShzY2FsYXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHAsIGYgfSA9IHRoaXMud05BRihhc3NlcnRJblJhbmdlKHNjYWxhciwgQ1VSVkVfT1JERVIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUG9pbnQubm9ybWFsaXplWihbcCwgZl0pWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm9uLWNvbnN0YW50LXRpbWUgbXVsdGlwbGljYXRpb24uIFVzZXMgZG91YmxlLWFuZC1hZGQgYWxnb3JpdGhtLlxuICAgICAgICAgICAgLy8gSXQncyBmYXN0ZXIsIGJ1dCBzaG91bGQgb25seSBiZSB1c2VkIHdoZW4geW91IGRvbid0IGNhcmUgYWJvdXRcbiAgICAgICAgICAgIC8vIGFuIGV4cG9zZWQgcHJpdmF0ZSBrZXkgZS5nLiBzaWcgdmVyaWZpY2F0aW9uLlxuICAgICAgICAgICAgLy8gRG9lcyBOT1QgYWxsb3cgc2NhbGFycyBoaWdoZXIgdGhhbiBDVVJWRS5uLlxuICAgICAgICAgICAgbXVsdGlwbHlVbnNhZmUoc2NhbGFyKSB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSBhc3NlcnRHRTAoc2NhbGFyKTtcbiAgICAgICAgICAgICAgICBpZiAobiA9PT0gXzBuNClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXF1YWxzKEkpIHx8IG4gPT09IF8xbjQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVxdWFscyhHKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud05BRihuKS5wO1xuICAgICAgICAgICAgICAgIHJldHVybiB3bmFmLnVuc2FmZUxhZGRlcih0aGlzLCBuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrcyBpZiBwb2ludCBpcyBvZiBzbWFsbCBvcmRlci5cbiAgICAgICAgICAgIC8vIElmIHlvdSBhZGQgc29tZXRoaW5nIHRvIHNtYWxsIG9yZGVyIHBvaW50LCB5b3Ugd2lsbCBoYXZlIFwiZGlydHlcIlxuICAgICAgICAgICAgLy8gcG9pbnQgd2l0aCB0b3JzaW9uIGNvbXBvbmVudC5cbiAgICAgICAgICAgIC8vIE11bHRpcGxpZXMgcG9pbnQgYnkgY29mYWN0b3IgYW5kIGNoZWNrcyBpZiB0aGUgcmVzdWx0IGlzIDAuXG4gICAgICAgICAgICBpc1NtYWxsT3JkZXIoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlVbnNhZmUoY29mYWN0b3IpLmlzMCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTXVsdGlwbGllcyBwb2ludCBieSBjdXJ2ZSBvcmRlciBhbmQgY2hlY2tzIGlmIHRoZSByZXN1bHQgaXMgMC5cbiAgICAgICAgICAgIC8vIFJldHVybnMgYGZhbHNlYCBpcyB0aGUgcG9pbnQgaXMgZGlydHkuXG4gICAgICAgICAgICBpc1RvcnNpb25GcmVlKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3bmFmLnVuc2FmZUxhZGRlcih0aGlzLCBDVVJWRV9PUkRFUikuaXMwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDb252ZXJ0cyBFeHRlbmRlZCBwb2ludCB0byBkZWZhdWx0ICh4LCB5KSBjb29yZGluYXRlcy5cbiAgICAgICAgICAgIC8vIENhbiBhY2NlcHQgcHJlY29tcHV0ZWQgWl4tMSAtIGZvciBleGFtcGxlLCBmcm9tIGludmVydEJhdGNoLlxuICAgICAgICAgICAgdG9BZmZpbmUoaXopIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGV4OiB4LCBleTogeSwgZXo6IHogfSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgY29uc3QgaXMwID0gdGhpcy5pczAoKTtcbiAgICAgICAgICAgICAgICBpZiAoaXogPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgaXogPSBpczAgPyBfOG4yIDogRnAyLmludih6KTtcbiAgICAgICAgICAgICAgICBjb25zdCBheCA9IG1vZFAoeCAqIGl6KTtcbiAgICAgICAgICAgICAgICBjb25zdCBheSA9IG1vZFAoeSAqIGl6KTtcbiAgICAgICAgICAgICAgICBjb25zdCB6eiA9IG1vZFAoeiAqIGl6KTtcbiAgICAgICAgICAgICAgICBpZiAoaXMwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB4OiBfMG40LCB5OiBfMW40IH07XG4gICAgICAgICAgICAgICAgaWYgKHp6ICE9PSBfMW40KVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZaIHdhcyBpbnZhbGlkXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHg6IGF4LCB5OiBheSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2xlYXJDb2ZhY3RvcigpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGg6IGNvZmFjdG9yMiB9ID0gQ1VSVkU7XG4gICAgICAgICAgICAgICAgaWYgKGNvZmFjdG9yMiA9PT0gXzFuNClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlVbnNhZmUoY29mYWN0b3IyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENvbnZlcnRzIGhhc2ggc3RyaW5nIG9yIFVpbnQ4QXJyYXkgdG8gUG9pbnQuXG4gICAgICAgICAgICAvLyBVc2VzIGFsZ28gZnJvbSBSRkM4MDMyIDUuMS4zLlxuICAgICAgICAgICAgc3RhdGljIGZyb21IZXgoaGV4LCB6aXAyMTUgPSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZCwgYSB9ID0gQ1VSVkU7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVuID0gRnAyLkJZVEVTO1xuICAgICAgICAgICAgICAgIGhleCA9IGVuc3VyZUJ5dGVzKFwicG9pbnRIZXhcIiwgaGV4LCBsZW4pO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1lZCA9IGhleC5zbGljZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RCeXRlID0gaGV4W2xlbiAtIDFdO1xuICAgICAgICAgICAgICAgIG5vcm1lZFtsZW4gLSAxXSA9IGxhc3RCeXRlICYgfjEyODtcbiAgICAgICAgICAgICAgICBjb25zdCB5ID0gYnl0ZXNUb051bWJlckxFKG5vcm1lZCk7XG4gICAgICAgICAgICAgICAgaWYgKHkgPT09IF8wbjQpIHtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6aXAyMTUpXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRJblJhbmdlKHksIE1BU0spO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRJblJhbmdlKHksIEZwMi5PUkRFUik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHkyID0gbW9kUCh5ICogeSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdSA9IG1vZFAoeTIgLSBfMW40KTtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gbW9kUChkICogeTIgLSBhKTtcbiAgICAgICAgICAgICAgICBsZXQgeyBpc1ZhbGlkLCB2YWx1ZTogeCB9ID0gdXZSYXRpbzIodSwgdik7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQb2ludC5mcm9tSGV4OiBpbnZhbGlkIHkgY29vcmRpbmF0ZVwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpc1hPZGQgPSAoeCAmIF8xbjQpID09PSBfMW40O1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzTGFzdEJ5dGVPZGQgPSAobGFzdEJ5dGUgJiAxMjgpICE9PSAwO1xuICAgICAgICAgICAgICAgIGlmICghemlwMjE1ICYmIHggPT09IF8wbjQgJiYgaXNMYXN0Qnl0ZU9kZClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUG9pbnQuZnJvbUhleDogeD0wIGFuZCB4XzA9MVwiKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNMYXN0Qnl0ZU9kZCAhPT0gaXNYT2RkKVxuICAgICAgICAgICAgICAgICAgICB4ID0gbW9kUCgteCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBvaW50LmZyb21BZmZpbmUoeyB4LCB5IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGljIGZyb21Qcml2YXRlS2V5KHByaXZLZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RXh0ZW5kZWRQdWJsaWNLZXkocHJpdktleSkucG9pbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b1Jhd0J5dGVzKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgeCwgeSB9ID0gdGhpcy50b0FmZmluZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ5dGVzMiA9IG51bWJlclRvQnl0ZXNMRSh5LCBGcDIuQllURVMpO1xuICAgICAgICAgICAgICAgIGJ5dGVzMltieXRlczIubGVuZ3RoIC0gMV0gfD0geCAmIF8xbjQgPyAxMjggOiAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBieXRlczI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b0hleCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnl0ZXNUb0hleCh0aGlzLnRvUmF3Qnl0ZXMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgUG9pbnQuQkFTRSA9IG5ldyBQb2ludChDVVJWRS5HeCwgQ1VSVkUuR3ksIF8xbjQsIG1vZFAoQ1VSVkUuR3ggKiBDVVJWRS5HeSkpO1xuICAgICAgICBQb2ludC5aRVJPID0gbmV3IFBvaW50KF8wbjQsIF8xbjQsIF8xbjQsIF8wbjQpO1xuICAgICAgICBjb25zdCB7IEJBU0U6IEcsIFpFUk86IEkgfSA9IFBvaW50O1xuICAgICAgICBjb25zdCB3bmFmID0gd05BRihQb2ludCwgbkJ5dGVMZW5ndGggKiA4KTtcbiAgICAgICAgZnVuY3Rpb24gbW9kTihhKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9kKGEsIENVUlZFX09SREVSKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBtb2ROX0xFKGhhc2gpIHtcbiAgICAgICAgICAgIHJldHVybiBtb2ROKGJ5dGVzVG9OdW1iZXJMRShoYXNoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gZ2V0RXh0ZW5kZWRQdWJsaWNLZXkoa2V5KSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBuQnl0ZUxlbmd0aDtcbiAgICAgICAgICAgIGtleSA9IGVuc3VyZUJ5dGVzKFwicHJpdmF0ZSBrZXlcIiwga2V5LCBsZW4pO1xuICAgICAgICAgICAgY29uc3QgaGFzaGVkID0gZW5zdXJlQnl0ZXMoXCJoYXNoZWQgcHJpdmF0ZSBrZXlcIiwgY0hhc2goa2V5KSwgMiAqIGxlbik7XG4gICAgICAgICAgICBjb25zdCBoZWFkID0gYWRqdXN0U2NhbGFyQnl0ZXMyKGhhc2hlZC5zbGljZSgwLCBsZW4pKTtcbiAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGhhc2hlZC5zbGljZShsZW4sIDIgKiBsZW4pO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGFyID0gbW9kTl9MRShoZWFkKTtcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gRy5tdWx0aXBseShzY2FsYXIpO1xuICAgICAgICAgICAgY29uc3QgcG9pbnRCeXRlcyA9IHBvaW50LnRvUmF3Qnl0ZXMoKTtcbiAgICAgICAgICAgIHJldHVybiB7IGhlYWQsIHByZWZpeCwgc2NhbGFyLCBwb2ludCwgcG9pbnRCeXRlcyB9O1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGdldFB1YmxpY0tleShwcml2S2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0RXh0ZW5kZWRQdWJsaWNLZXkocHJpdktleSkucG9pbnRCeXRlcztcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBoYXNoRG9tYWluVG9TY2FsYXIoY29udGV4dCA9IG5ldyBVaW50OEFycmF5KCksIC4uLm1zZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGNvbmNhdEJ5dGVzMiguLi5tc2dzKTtcbiAgICAgICAgICAgIHJldHVybiBtb2ROX0xFKGNIYXNoKGRvbWFpbihtc2csIGVuc3VyZUJ5dGVzKFwiY29udGV4dFwiLCBjb250ZXh0KSwgISFwcmVoYXNoKSkpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNpZ24obXNnLCBwcml2S2V5LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgICAgIG1zZyA9IGVuc3VyZUJ5dGVzKFwibWVzc2FnZVwiLCBtc2cpO1xuICAgICAgICAgICAgaWYgKHByZWhhc2gpXG4gICAgICAgICAgICAgICAgbXNnID0gcHJlaGFzaChtc2cpO1xuICAgICAgICAgICAgY29uc3QgeyBwcmVmaXgsIHNjYWxhciwgcG9pbnRCeXRlcyB9ID0gZ2V0RXh0ZW5kZWRQdWJsaWNLZXkocHJpdktleSk7XG4gICAgICAgICAgICBjb25zdCByID0gaGFzaERvbWFpblRvU2NhbGFyKG9wdGlvbnMuY29udGV4dCwgcHJlZml4LCBtc2cpO1xuICAgICAgICAgICAgY29uc3QgUiA9IEcubXVsdGlwbHkocikudG9SYXdCeXRlcygpO1xuICAgICAgICAgICAgY29uc3QgayA9IGhhc2hEb21haW5Ub1NjYWxhcihvcHRpb25zLmNvbnRleHQsIFIsIHBvaW50Qnl0ZXMsIG1zZyk7XG4gICAgICAgICAgICBjb25zdCBzID0gbW9kTihyICsgayAqIHNjYWxhcik7XG4gICAgICAgICAgICBhc3NlcnRHRTAocyk7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBjb25jYXRCeXRlczIoUiwgbnVtYmVyVG9CeXRlc0xFKHMsIEZwMi5CWVRFUykpO1xuICAgICAgICAgICAgcmV0dXJuIGVuc3VyZUJ5dGVzKFwicmVzdWx0XCIsIHJlcywgbkJ5dGVMZW5ndGggKiAyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2ZXJpZnlPcHRzID0gVkVSSUZZX0RFRkFVTFQ7XG4gICAgICAgIGZ1bmN0aW9uIHZlcmlmeShzaWcsIG1zZywgcHVibGljS2V5LCBvcHRpb25zID0gdmVyaWZ5T3B0cykge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0LCB6aXAyMTUgfSA9IG9wdGlvbnM7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBGcDIuQllURVM7XG4gICAgICAgICAgICBzaWcgPSBlbnN1cmVCeXRlcyhcInNpZ25hdHVyZVwiLCBzaWcsIDIgKiBsZW4pO1xuICAgICAgICAgICAgbXNnID0gZW5zdXJlQnl0ZXMoXCJtZXNzYWdlXCIsIG1zZyk7XG4gICAgICAgICAgICBpZiAocHJlaGFzaClcbiAgICAgICAgICAgICAgICBtc2cgPSBwcmVoYXNoKG1zZyk7XG4gICAgICAgICAgICBjb25zdCBzID0gYnl0ZXNUb051bWJlckxFKHNpZy5zbGljZShsZW4sIDIgKiBsZW4pKTtcbiAgICAgICAgICAgIGxldCBBLCBSLCBTQjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgQSA9IFBvaW50LmZyb21IZXgocHVibGljS2V5LCB6aXAyMTUpO1xuICAgICAgICAgICAgICAgIFIgPSBQb2ludC5mcm9tSGV4KHNpZy5zbGljZSgwLCBsZW4pLCB6aXAyMTUpO1xuICAgICAgICAgICAgICAgIFNCID0gRy5tdWx0aXBseVVuc2FmZShzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghemlwMjE1ICYmIEEuaXNTbWFsbE9yZGVyKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgayA9IGhhc2hEb21haW5Ub1NjYWxhcihjb250ZXh0LCBSLnRvUmF3Qnl0ZXMoKSwgQS50b1Jhd0J5dGVzKCksIG1zZyk7XG4gICAgICAgICAgICBjb25zdCBSa0EgPSBSLmFkZChBLm11bHRpcGx5VW5zYWZlKGspKTtcbiAgICAgICAgICAgIHJldHVybiBSa0Euc3VidHJhY3QoU0IpLmNsZWFyQ29mYWN0b3IoKS5lcXVhbHMoUG9pbnQuWkVSTyk7XG4gICAgICAgIH1cbiAgICAgICAgRy5fc2V0V2luZG93U2l6ZSg4KTtcbiAgICAgICAgY29uc3QgdXRpbHMgPSB7XG4gICAgICAgICAgICBnZXRFeHRlbmRlZFB1YmxpY0tleSxcbiAgICAgICAgICAgIC8vIGVkMjU1MTkgcHJpdmF0ZSBrZXlzIGFyZSB1bmlmb3JtIDMyYi4gTm8gbmVlZCB0byBjaGVjayBmb3IgbW9kdWxvIGJpYXMsIGxpa2UgaW4gc2VjcDI1NmsxLlxuICAgICAgICAgICAgcmFuZG9tUHJpdmF0ZUtleTogKCkgPT4gcmFuZG9tQnl0ZXMyKEZwMi5CWVRFUyksXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFdlJ3JlIGRvaW5nIHNjYWxhciBtdWx0aXBsaWNhdGlvbiAodXNlZCBpbiBnZXRQdWJsaWNLZXkgZXRjKSB3aXRoIHByZWNvbXB1dGVkIEJBU0VfUE9JTlRcbiAgICAgICAgICAgICAqIHZhbHVlcy4gVGhpcyBzbG93cyBkb3duIGZpcnN0IGdldFB1YmxpY0tleSgpIGJ5IG1pbGxpc2Vjb25kcyAoc2VlIFNwZWVkIHNlY3Rpb24pLFxuICAgICAgICAgICAgICogYnV0IGFsbG93cyB0byBzcGVlZC11cCBzdWJzZXF1ZW50IGdldFB1YmxpY0tleSgpIGNhbGxzIHVwIHRvIDIweC5cbiAgICAgICAgICAgICAqIEBwYXJhbSB3aW5kb3dTaXplIDIsIDQsIDgsIDE2XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHByZWNvbXB1dGUod2luZG93U2l6ZSA9IDgsIHBvaW50ID0gUG9pbnQuQkFTRSkge1xuICAgICAgICAgICAgICAgIHBvaW50Ll9zZXRXaW5kb3dTaXplKHdpbmRvd1NpemUpO1xuICAgICAgICAgICAgICAgIHBvaW50Lm11bHRpcGx5KEJpZ0ludCgzKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgQ1VSVkUsXG4gICAgICAgICAgICBnZXRQdWJsaWNLZXksXG4gICAgICAgICAgICBzaWduLFxuICAgICAgICAgICAgdmVyaWZ5LFxuICAgICAgICAgICAgRXh0ZW5kZWRQb2ludDogUG9pbnQsXG4gICAgICAgICAgICB1dGlsc1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyAuLi9lc20vYWJzdHJhY3QvbW9udGdvbWVyeS5qc1xuICAgIHZhciBfMG41ID0gQmlnSW50KDApO1xuICAgIHZhciBfMW41ID0gQmlnSW50KDEpO1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlT3B0czIoY3VydmUpIHtcbiAgICAgICAgdmFsaWRhdGVPYmplY3QoY3VydmUsIHtcbiAgICAgICAgICAgIGE6IFwiYmlnaW50XCJcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbW9udGdvbWVyeUJpdHM6IFwiaXNTYWZlSW50ZWdlclwiLFxuICAgICAgICAgICAgbkJ5dGVMZW5ndGg6IFwiaXNTYWZlSW50ZWdlclwiLFxuICAgICAgICAgICAgYWRqdXN0U2NhbGFyQnl0ZXM6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICAgIGRvbWFpbjogXCJmdW5jdGlvblwiLFxuICAgICAgICAgICAgcG93UG1pbnVzMjogXCJmdW5jdGlvblwiLFxuICAgICAgICAgICAgR3U6IFwiYmlnaW50XCJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHsgLi4uY3VydmUgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1vbnRnb21lcnkoY3VydmVEZWYpIHtcbiAgICAgICAgY29uc3QgQ1VSVkUgPSB2YWxpZGF0ZU9wdHMyKGN1cnZlRGVmKTtcbiAgICAgICAgY29uc3QgeyBQIH0gPSBDVVJWRTtcbiAgICAgICAgY29uc3QgbW9kUCA9IChuKSA9PiBtb2QobiwgUCk7XG4gICAgICAgIGNvbnN0IG1vbnRnb21lcnlCaXRzID0gQ1VSVkUubW9udGdvbWVyeUJpdHM7XG4gICAgICAgIGNvbnN0IG1vbnRnb21lcnlCeXRlcyA9IE1hdGguY2VpbChtb250Z29tZXJ5Qml0cyAvIDgpO1xuICAgICAgICBjb25zdCBmaWVsZExlbiA9IENVUlZFLm5CeXRlTGVuZ3RoO1xuICAgICAgICBjb25zdCBhZGp1c3RTY2FsYXJCeXRlczIgPSBDVVJWRS5hZGp1c3RTY2FsYXJCeXRlcyB8fCAoKGJ5dGVzMikgPT4gYnl0ZXMyKTtcbiAgICAgICAgY29uc3QgcG93UG1pbnVzMiA9IENVUlZFLnBvd1BtaW51czIgfHwgKCh4KSA9PiBwb3coeCwgUCAtIEJpZ0ludCgyKSwgUCkpO1xuICAgICAgICBmdW5jdGlvbiBjc3dhcChzd2FwLCB4XzIsIHhfMykge1xuICAgICAgICAgICAgY29uc3QgZHVtbXkgPSBtb2RQKHN3YXAgKiAoeF8yIC0geF8zKSk7XG4gICAgICAgICAgICB4XzIgPSBtb2RQKHhfMiAtIGR1bW15KTtcbiAgICAgICAgICAgIHhfMyA9IG1vZFAoeF8zICsgZHVtbXkpO1xuICAgICAgICAgICAgcmV0dXJuIFt4XzIsIHhfM107XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gYXNzZXJ0RmllbGRFbGVtZW50KG4pIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbiA9PT0gXCJiaWdpbnRcIiAmJiBfMG41IDw9IG4gJiYgbiA8IFApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCB2YWxpZCBzY2FsYXIgMCA8IHNjYWxhciA8IENVUlZFLlBcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYTI0ID0gKENVUlZFLmEgLSBCaWdJbnQoMikpIC8gQmlnSW50KDQpO1xuICAgICAgICBmdW5jdGlvbiBtb250Z29tZXJ5TGFkZGVyKHBvaW50VSwgc2NhbGFyKSB7XG4gICAgICAgICAgICBjb25zdCB1ID0gYXNzZXJ0RmllbGRFbGVtZW50KHBvaW50VSk7XG4gICAgICAgICAgICBjb25zdCBrID0gYXNzZXJ0RmllbGRFbGVtZW50KHNjYWxhcik7XG4gICAgICAgICAgICBjb25zdCB4XzEgPSB1O1xuICAgICAgICAgICAgbGV0IHhfMiA9IF8xbjU7XG4gICAgICAgICAgICBsZXQgel8yID0gXzBuNTtcbiAgICAgICAgICAgIGxldCB4XzMgPSB1O1xuICAgICAgICAgICAgbGV0IHpfMyA9IF8xbjU7XG4gICAgICAgICAgICBsZXQgc3dhcCA9IF8wbjU7XG4gICAgICAgICAgICBsZXQgc3c7XG4gICAgICAgICAgICBmb3IgKGxldCB0ID0gQmlnSW50KG1vbnRnb21lcnlCaXRzIC0gMSk7IHQgPj0gXzBuNTsgdC0tKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga190ID0gayA+PiB0ICYgXzFuNTtcbiAgICAgICAgICAgICAgICBzd2FwIF49IGtfdDtcbiAgICAgICAgICAgICAgICBzdyA9IGNzd2FwKHN3YXAsIHhfMiwgeF8zKTtcbiAgICAgICAgICAgICAgICB4XzIgPSBzd1swXTtcbiAgICAgICAgICAgICAgICB4XzMgPSBzd1sxXTtcbiAgICAgICAgICAgICAgICBzdyA9IGNzd2FwKHN3YXAsIHpfMiwgel8zKTtcbiAgICAgICAgICAgICAgICB6XzIgPSBzd1swXTtcbiAgICAgICAgICAgICAgICB6XzMgPSBzd1sxXTtcbiAgICAgICAgICAgICAgICBzd2FwID0ga190O1xuICAgICAgICAgICAgICAgIGNvbnN0IEEgPSB4XzIgKyB6XzI7XG4gICAgICAgICAgICAgICAgY29uc3QgQUEgPSBtb2RQKEEgKiBBKTtcbiAgICAgICAgICAgICAgICBjb25zdCBCID0geF8yIC0gel8yO1xuICAgICAgICAgICAgICAgIGNvbnN0IEJCID0gbW9kUChCICogQik7XG4gICAgICAgICAgICAgICAgY29uc3QgRSA9IEFBIC0gQkI7XG4gICAgICAgICAgICAgICAgY29uc3QgQyA9IHhfMyArIHpfMztcbiAgICAgICAgICAgICAgICBjb25zdCBEID0geF8zIC0gel8zO1xuICAgICAgICAgICAgICAgIGNvbnN0IERBID0gbW9kUChEICogQSk7XG4gICAgICAgICAgICAgICAgY29uc3QgQ0IgPSBtb2RQKEMgKiBCKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYWNiID0gREEgKyBDQjtcbiAgICAgICAgICAgICAgICBjb25zdCBkYV9jYiA9IERBIC0gQ0I7XG4gICAgICAgICAgICAgICAgeF8zID0gbW9kUChkYWNiICogZGFjYik7XG4gICAgICAgICAgICAgICAgel8zID0gbW9kUCh4XzEgKiBtb2RQKGRhX2NiICogZGFfY2IpKTtcbiAgICAgICAgICAgICAgICB4XzIgPSBtb2RQKEFBICogQkIpO1xuICAgICAgICAgICAgICAgIHpfMiA9IG1vZFAoRSAqIChBQSArIG1vZFAoYTI0ICogRSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3ID0gY3N3YXAoc3dhcCwgeF8yLCB4XzMpO1xuICAgICAgICAgICAgeF8yID0gc3dbMF07XG4gICAgICAgICAgICB4XzMgPSBzd1sxXTtcbiAgICAgICAgICAgIHN3ID0gY3N3YXAoc3dhcCwgel8yLCB6XzMpO1xuICAgICAgICAgICAgel8yID0gc3dbMF07XG4gICAgICAgICAgICB6XzMgPSBzd1sxXTtcbiAgICAgICAgICAgIGNvbnN0IHoyID0gcG93UG1pbnVzMih6XzIpO1xuICAgICAgICAgICAgcmV0dXJuIG1vZFAoeF8yICogejIpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGVuY29kZVVDb29yZGluYXRlKHUpIHtcbiAgICAgICAgICAgIHJldHVybiBudW1iZXJUb0J5dGVzTEUobW9kUCh1KSwgbW9udGdvbWVyeUJ5dGVzKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBkZWNvZGVVQ29vcmRpbmF0ZSh1RW5jKSB7XG4gICAgICAgICAgICBjb25zdCB1ID0gZW5zdXJlQnl0ZXMoXCJ1IGNvb3JkaW5hdGVcIiwgdUVuYywgbW9udGdvbWVyeUJ5dGVzKTtcbiAgICAgICAgICAgIGlmIChmaWVsZExlbiA9PT0gMzIpXG4gICAgICAgICAgICAgICAgdVszMV0gJj0gMTI3O1xuICAgICAgICAgICAgcmV0dXJuIGJ5dGVzVG9OdW1iZXJMRSh1KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBkZWNvZGVTY2FsYXIobikge1xuICAgICAgICAgICAgY29uc3QgYnl0ZXMyID0gZW5zdXJlQnl0ZXMoXCJzY2FsYXJcIiwgbik7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBieXRlczIubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGxlbiAhPT0gbW9udGdvbWVyeUJ5dGVzICYmIGxlbiAhPT0gZmllbGRMZW4pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAke21vbnRnb21lcnlCeXRlc30gb3IgJHtmaWVsZExlbn0gYnl0ZXMsIGdvdCAke2xlbn1gKTtcbiAgICAgICAgICAgIHJldHVybiBieXRlc1RvTnVtYmVyTEUoYWRqdXN0U2NhbGFyQnl0ZXMyKGJ5dGVzMikpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNjYWxhck11bHQoc2NhbGFyLCB1KSB7XG4gICAgICAgICAgICBjb25zdCBwb2ludFUgPSBkZWNvZGVVQ29vcmRpbmF0ZSh1KTtcbiAgICAgICAgICAgIGNvbnN0IF9zY2FsYXIgPSBkZWNvZGVTY2FsYXIoc2NhbGFyKTtcbiAgICAgICAgICAgIGNvbnN0IHB1ID0gbW9udGdvbWVyeUxhZGRlcihwb2ludFUsIF9zY2FsYXIpO1xuICAgICAgICAgICAgaWYgKHB1ID09PSBfMG41KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcHJpdmF0ZSBvciBwdWJsaWMga2V5IHJlY2VpdmVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGVuY29kZVVDb29yZGluYXRlKHB1KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBHdUJ5dGVzID0gZW5jb2RlVUNvb3JkaW5hdGUoQ1VSVkUuR3UpO1xuICAgICAgICBmdW5jdGlvbiBzY2FsYXJNdWx0QmFzZShzY2FsYXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzY2FsYXJNdWx0KHNjYWxhciwgR3VCeXRlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjYWxhck11bHQsXG4gICAgICAgICAgICBzY2FsYXJNdWx0QmFzZSxcbiAgICAgICAgICAgIGdldFNoYXJlZFNlY3JldDogKHByaXZhdGVLZXksIHB1YmxpY0tleSkgPT4gc2NhbGFyTXVsdChwcml2YXRlS2V5LCBwdWJsaWNLZXkpLFxuICAgICAgICAgICAgZ2V0UHVibGljS2V5OiAocHJpdmF0ZUtleSkgPT4gc2NhbGFyTXVsdEJhc2UocHJpdmF0ZUtleSksXG4gICAgICAgICAgICB1dGlsczogeyByYW5kb21Qcml2YXRlS2V5OiAoKSA9PiBDVVJWRS5yYW5kb21CeXRlcyhDVVJWRS5uQnl0ZUxlbmd0aCkgfSxcbiAgICAgICAgICAgIEd1Qnl0ZXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gLi4vZXNtL2VkMjU1MTkuanNcbiAgICB2YXIgRUQyNTUxOV9QID0gQmlnSW50KFwiNTc4OTYwNDQ2MTg2NTgwOTc3MTE3ODU0OTI1MDQzNDM5NTM5MjY2MzQ5OTIzMzI4MjAyODIwMTk3Mjg3OTIwMDM5NTY1NjQ4MTk5NDlcIik7XG4gICAgdmFyIEVEMjU1MTlfU1FSVF9NMSA9IEJpZ0ludChcIjE5NjgxMTYxMzc2NzA3NTA1OTU2ODA3MDc5MzA0OTg4NTQyMDE1NDQ2MDY2NTE1OTIzODkwMTYyNzQ0MDIxMDczMTIzODI5Nzg0NzUyXCIpO1xuICAgIHZhciBfMG42ID0gQmlnSW50KDApO1xuICAgIHZhciBfMW42ID0gQmlnSW50KDEpO1xuICAgIHZhciBfMm40ID0gQmlnSW50KDIpO1xuICAgIHZhciBfNW4yID0gQmlnSW50KDUpO1xuICAgIHZhciBfMTBuID0gQmlnSW50KDEwKTtcbiAgICB2YXIgXzIwbiA9IEJpZ0ludCgyMCk7XG4gICAgdmFyIF80MG4gPSBCaWdJbnQoNDApO1xuICAgIHZhciBfODBuID0gQmlnSW50KDgwKTtcbiAgICBmdW5jdGlvbiBlZDI1NTE5X3Bvd18yXzI1Ml8zKHgpIHtcbiAgICAgICAgY29uc3QgUCA9IEVEMjU1MTlfUDtcbiAgICAgICAgY29uc3QgeDIgPSB4ICogeCAlIFA7XG4gICAgICAgIGNvbnN0IGIyID0geDIgKiB4ICUgUDtcbiAgICAgICAgY29uc3QgYjQgPSBwb3cyKGIyLCBfMm40LCBQKSAqIGIyICUgUDtcbiAgICAgICAgY29uc3QgYjUgPSBwb3cyKGI0LCBfMW42LCBQKSAqIHggJSBQO1xuICAgICAgICBjb25zdCBiMTAgPSBwb3cyKGI1LCBfNW4yLCBQKSAqIGI1ICUgUDtcbiAgICAgICAgY29uc3QgYjIwID0gcG93MihiMTAsIF8xMG4sIFApICogYjEwICUgUDtcbiAgICAgICAgY29uc3QgYjQwID0gcG93MihiMjAsIF8yMG4sIFApICogYjIwICUgUDtcbiAgICAgICAgY29uc3QgYjgwID0gcG93MihiNDAsIF80MG4sIFApICogYjQwICUgUDtcbiAgICAgICAgY29uc3QgYjE2MCA9IHBvdzIoYjgwLCBfODBuLCBQKSAqIGI4MCAlIFA7XG4gICAgICAgIGNvbnN0IGIyNDAgPSBwb3cyKGIxNjAsIF84MG4sIFApICogYjgwICUgUDtcbiAgICAgICAgY29uc3QgYjI1MCA9IHBvdzIoYjI0MCwgXzEwbiwgUCkgKiBiMTAgJSBQO1xuICAgICAgICBjb25zdCBwb3dfcF81XzggPSBwb3cyKGIyNTAsIF8ybjQsIFApICogeCAlIFA7XG4gICAgICAgIHJldHVybiB7IHBvd19wXzVfOCwgYjIgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRqdXN0U2NhbGFyQnl0ZXMoYnl0ZXMyKSB7XG4gICAgICAgIGJ5dGVzMlswXSAmPSAyNDg7XG4gICAgICAgIGJ5dGVzMlszMV0gJj0gMTI3O1xuICAgICAgICBieXRlczJbMzFdIHw9IDY0O1xuICAgICAgICByZXR1cm4gYnl0ZXMyO1xuICAgIH1cbiAgICBmdW5jdGlvbiB1dlJhdGlvKHUsIHYpIHtcbiAgICAgICAgY29uc3QgUCA9IEVEMjU1MTlfUDtcbiAgICAgICAgY29uc3QgdjMgPSBtb2QodiAqIHYgKiB2LCBQKTtcbiAgICAgICAgY29uc3QgdjcgPSBtb2QodjMgKiB2MyAqIHYsIFApO1xuICAgICAgICBjb25zdCBwb3czID0gZWQyNTUxOV9wb3dfMl8yNTJfMyh1ICogdjcpLnBvd19wXzVfODtcbiAgICAgICAgbGV0IHggPSBtb2QodSAqIHYzICogcG93MywgUCk7XG4gICAgICAgIGNvbnN0IHZ4MiA9IG1vZCh2ICogeCAqIHgsIFApO1xuICAgICAgICBjb25zdCByb290MSA9IHg7XG4gICAgICAgIGNvbnN0IHJvb3QyID0gbW9kKHggKiBFRDI1NTE5X1NRUlRfTTEsIFApO1xuICAgICAgICBjb25zdCB1c2VSb290MSA9IHZ4MiA9PT0gdTtcbiAgICAgICAgY29uc3QgdXNlUm9vdDIgPSB2eDIgPT09IG1vZCgtdSwgUCk7XG4gICAgICAgIGNvbnN0IG5vUm9vdCA9IHZ4MiA9PT0gbW9kKC11ICogRUQyNTUxOV9TUVJUX00xLCBQKTtcbiAgICAgICAgaWYgKHVzZVJvb3QxKVxuICAgICAgICAgICAgeCA9IHJvb3QxO1xuICAgICAgICBpZiAodXNlUm9vdDIgfHwgbm9Sb290KVxuICAgICAgICAgICAgeCA9IHJvb3QyO1xuICAgICAgICBpZiAoaXNOZWdhdGl2ZUxFKHgsIFApKVxuICAgICAgICAgICAgeCA9IG1vZCgteCwgUCk7XG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHVzZVJvb3QxIHx8IHVzZVJvb3QyLCB2YWx1ZTogeCB9O1xuICAgIH1cbiAgICB2YXIgRnAgPSBGaWVsZChFRDI1NTE5X1AsIHZvaWQgMCwgdHJ1ZSk7XG4gICAgdmFyIGVkMjU1MTlEZWZhdWx0cyA9IHtcbiAgICAgICAgLy8gUGFyYW06IGFcbiAgICAgICAgYTogQmlnSW50KC0xKSxcbiAgICAgICAgLy8gRnAuY3JlYXRlKC0xKSBpcyBwcm9wZXI7IG91ciB3YXkgc3RpbGwgd29ya3MgYW5kIGlzIGZhc3RlclxuICAgICAgICAvLyBkIGlzIGVxdWFsIHRvIC0xMjE2NjUvMTIxNjY2IG92ZXIgZmluaXRlIGZpZWxkLlxuICAgICAgICAvLyBOZWdhdGl2ZSBudW1iZXIgaXMgUCAtIG51bWJlciwgYW5kIGRpdmlzaW9uIGlzIGludmVydChudW1iZXIsIFApXG4gICAgICAgIGQ6IEJpZ0ludChcIjM3MDk1NzA1OTM0NjY5NDM5MzQzMTM4MDgzNTA4NzU0NTY1MTg5NTQyMTEzODc5ODQzMjE5MDE2Mzg4Nzg1NTMzMDg1OTQwMjgzNTU1XCIpLFxuICAgICAgICAvLyBGaW5pdGUgZmllbGQg8J2UvXAgb3ZlciB3aGljaCB3ZSdsbCBkbyBjYWxjdWxhdGlvbnM7IDJuKioyNTVuIC0gMTluXG4gICAgICAgIEZwLFxuICAgICAgICAvLyBTdWJncm91cCBvcmRlcjogaG93IG1hbnkgcG9pbnRzIGN1cnZlIGhhc1xuICAgICAgICAvLyAybioqMjUybiArIDI3NzQyMzE3Nzc3MzcyMzUzNTM1ODUxOTM3NzkwODgzNjQ4NDkzbjtcbiAgICAgICAgbjogQmlnSW50KFwiNzIzNzAwNTU3NzMzMjI2MjIxMzk3MzE4NjU2MzA0Mjk5NDI0MDg1NzExNjM1OTM3OTkwNzYwNjAwMTk1MDkzODI4NTQ1NDI1MDk4OVwiKSxcbiAgICAgICAgLy8gQ29mYWN0b3JcbiAgICAgICAgaDogQmlnSW50KDgpLFxuICAgICAgICAvLyBCYXNlIHBvaW50ICh4LCB5KSBha2EgZ2VuZXJhdG9yIHBvaW50XG4gICAgICAgIEd4OiBCaWdJbnQoXCIxNTExMjIyMTM0OTUzNTQwMDc3MjUwMTE1MTQwOTU4ODUzMTUxMTQ1NDAxMjY5MzA0MTg1NzIwNjA0NjExMzI4Mzk0OTg0Nzc2MjIwMlwiKSxcbiAgICAgICAgR3k6IEJpZ0ludChcIjQ2MzE2ODM1Njk0OTI2NDc4MTY5NDI4Mzk0MDAzNDc1MTYzMTQxMzA3OTkzODY2MjU2MjI1NjE1NzgzMDMzNjAzMTY1MjUxODU1OTYwXCIpLFxuICAgICAgICBoYXNoOiBzaGE1MTIsXG4gICAgICAgIHJhbmRvbUJ5dGVzLFxuICAgICAgICBhZGp1c3RTY2FsYXJCeXRlcyxcbiAgICAgICAgLy8gZG9tMlxuICAgICAgICAvLyBSYXRpbyBvZiB1IHRvIHYuIEFsbG93cyB1cyB0byBjb21iaW5lIGludmVyc2lvbiBhbmQgc3F1YXJlIHJvb3QuIFVzZXMgYWxnbyBmcm9tIFJGQzgwMzIgNS4xLjMuXG4gICAgICAgIC8vIENvbnN0YW50LXRpbWUsIHUv4oiadlxuICAgICAgICB1dlJhdGlvXG4gICAgfTtcbiAgICBmdW5jdGlvbiBlZDI1NTE5X2RvbWFpbihkYXRhLCBjdHgsIHBoZmxhZykge1xuICAgICAgICBpZiAoY3R4Lmxlbmd0aCA+IDI1NSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbnRleHQgaXMgdG9vIGJpZ1wiKTtcbiAgICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKHV0ZjhUb0J5dGVzKFwiU2lnRWQyNTUxOSBubyBFZDI1NTE5IGNvbGxpc2lvbnNcIiksIG5ldyBVaW50OEFycmF5KFtwaGZsYWcgPyAxIDogMCwgY3R4Lmxlbmd0aF0pLCBjdHgsIGRhdGEpO1xuICAgIH1cbiAgICB2YXIgZWQyNTUxOWN0eCA9IC8qIEBfX1BVUkVfXyAqLyB0d2lzdGVkRWR3YXJkcyh7XG4gICAgICAgIC4uLmVkMjU1MTlEZWZhdWx0cyxcbiAgICAgICAgZG9tYWluOiBlZDI1NTE5X2RvbWFpblxuICAgIH0pO1xuICAgIHZhciBlZDI1NTE5cGggPSAvKiBAX19QVVJFX18gKi8gdHdpc3RlZEVkd2FyZHMoe1xuICAgICAgICAuLi5lZDI1NTE5RGVmYXVsdHMsXG4gICAgICAgIGRvbWFpbjogZWQyNTUxOV9kb21haW4sXG4gICAgICAgIHByZWhhc2g6IHNoYTUxMlxuICAgIH0pO1xuICAgIHZhciB4MjU1MTkgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IG1vbnRnb21lcnkoe1xuICAgICAgICBQOiBFRDI1NTE5X1AsXG4gICAgICAgIGE6IEJpZ0ludCg0ODY2NjIpLFxuICAgICAgICBtb250Z29tZXJ5Qml0czogMjU1LFxuICAgICAgICAvLyBuIGlzIDI1MyBiaXRzXG4gICAgICAgIG5CeXRlTGVuZ3RoOiAzMixcbiAgICAgICAgR3U6IEJpZ0ludCg5KSxcbiAgICAgICAgcG93UG1pbnVzMjogKHgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFAgPSBFRDI1NTE5X1A7XG4gICAgICAgICAgICBjb25zdCB7IHBvd19wXzVfOCwgYjIgfSA9IGVkMjU1MTlfcG93XzJfMjUyXzMoeCk7XG4gICAgICAgICAgICByZXR1cm4gbW9kKHBvdzIocG93X3BfNV84LCBCaWdJbnQoMyksIFApICogYjIsIFApO1xuICAgICAgICB9LFxuICAgICAgICBhZGp1c3RTY2FsYXJCeXRlcyxcbiAgICAgICAgcmFuZG9tQnl0ZXNcbiAgICB9KSkoKTtcbiAgICB2YXIgRUxMMl9DMSA9IChGcC5PUkRFUiArIEJpZ0ludCgzKSkgLyBCaWdJbnQoOCk7XG4gICAgdmFyIEVMTDJfQzIgPSBGcC5wb3coXzJuNCwgRUxMMl9DMSk7XG4gICAgdmFyIEVMTDJfQzMgPSBGcC5zcXJ0KEZwLm5lZyhGcC5PTkUpKTtcbiAgICB2YXIgRUxMMl9DNCA9IChGcC5PUkRFUiAtIEJpZ0ludCg1KSkgLyBCaWdJbnQoOCk7XG4gICAgdmFyIEVMTDJfSiA9IEJpZ0ludCg0ODY2NjIpO1xuICAgIHZhciBFTEwyX0MxX0VEV0FSRFMgPSBGcFNxcnRFdmVuKEZwLCBGcC5uZWcoQmlnSW50KDQ4NjY2NCkpKTtcbiAgICB2YXIgU1FSVF9BRF9NSU5VU19PTkUgPSBCaWdJbnQoXCIyNTA2MzA2ODk1MzM4NDYyMzQ3NDExMTQxNDE1ODcwMjE1MjcwMTI0NDUzMTUwMjQ5MjY1NjQ2MDA3OTIxMDQ4MjYxMDQzMDc1MDIzNVwiKTtcbiAgICB2YXIgSU5WU1FSVF9BX01JTlVTX0QgPSBCaWdJbnQoXCI1NDQ2OTMwNzAwODkwOTMxNjkyMDk5NTgxMzg2ODc0NTE0MTYwNTM5MzU5NzI5MjkyNzQ1NjkyMTIwNTMxMjg5NjMxMTcyMTAxNzU3OFwiKTtcbiAgICB2YXIgT05FX01JTlVTX0RfU1EgPSBCaWdJbnQoXCIxMTU5ODQzMDIxNjY4Nzc5ODc5MTkzNzc1NTIxODU1NTg2NjQ3OTM3MzU3NzU5NzE1NDE3NjU0NDM5ODc5NzIwODc2MTExODA2ODM4XCIpO1xuICAgIHZhciBEX01JTlVTX09ORV9TUSA9IEJpZ0ludChcIjQwNDQwODM0MzQ2MzA4NTM2ODU4MTAxMDQyNDY5MzIzMTkwODI2MjQ4Mzk5MTQ2MjM4NzA4MzUyMjQwMTMzMjIwODY1MTM3MjY1OTUyXCIpO1xuICAgIHZhciBNQVhfMjU1QiA9IEJpZ0ludChcIjB4N2ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlwiKTtcbiAgICByZXR1cm4gX190b0NvbW1vbkpTKGlucHV0X2V4cG9ydHMpO1xufSkoKTtcbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbi8qISBCdW5kbGVkIGxpY2Vuc2UgaW5mb3JtYXRpb246XG5cbkBub2JsZS9oYXNoZXMvZXNtL3V0aWxzLmpzOlxuICAoKiEgbm9ibGUtaGFzaGVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICopXG4qL1xuZXhwb3J0IGNvbnN0IHgyNTUxOSA9IG5vYmxlQ3VydmVzLngyNTUxOTtcbiIsIi8vIEB0cy1pZ25vcmVbdW50eXBlZC1pbXBvcnRdXG5pbXBvcnQgeyB4MjU1MTkgfSBmcm9tIFwiLi4vaW50ZXJuYWwvbm9ibGUtY3VydmVzLTEuMy4wLmpzXCI7XG5pbXBvcnQgeyByYW5kb20gfSBmcm9tIFwiLi4vcmFuZG9tL1JhbmRvbWl6ZXIuanNcIjtcbi8vIFRoZSBudW1iZXIgb2YgYnl0ZXMgZm9yIGEgcHJpdmF0ZSBrZXkgaW4gdGhlIGN1cnZlXG4vLyB0aGUgYnl0ZSBsZW5ndGggb2YgdGhlIG1vZHVsdXNcbmNvbnN0IFgyNTUxOV9OX0JZVEVfTEVOR1RIID0gMzI7XG4vKipcbiAqIEByZXR1cm4gcmFuZG9tbHkgZ2VuZXJhdGVkIFgyNTUxOSBrZXkgcGFpclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVFY2NLZXlQYWlyKCkge1xuICAgIC8vIG5vYmxlLWN1cnZlcyBhcHBlYXJzIHRvIGNsYW1wIHRoZSBwcml2YXRlIGtleSB3aGVuIHVzaW5nIGl0LCBidXQgbm90IHdoZW4gZ2VuZXJhdGluZyBpdCwgc28gZm9yIHNhZmV0eSxcbiAgICAvLyB3ZSBkbyBub3Qgd2FudCB0byBzdG9yZSBpdCB1bi1jbGFtcGVkIGluIGNhc2Ugd2UgdXNlIGEgZGlmZmVyZW50IGltcGxlbWVudGF0aW9uIGxhdGVyXG4gICAgY29uc3QgcHJpdmF0ZUtleSA9IGNsYW1wUHJpdmF0ZUtleShyYW5kb20uZ2VuZXJhdGVSYW5kb21EYXRhKFgyNTUxOV9OX0JZVEVfTEVOR1RIKSk7XG4gICAgY29uc3QgcHVibGljS2V5ID0gZGVyaXZlUHVibGljS2V5KHByaXZhdGVLZXkpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHByaXZhdGVLZXksXG4gICAgICAgIHB1YmxpY0tleSxcbiAgICB9O1xufVxuLyoqXG4gKiBEZXJpdmUgYSBzaGFyZWQgc2VjcmV0IGZyb20gdGhlIHNlbmRlcidzIHByaXZhdGUga2V5IGFuZCB0aGUgcmVjaXBpZW50J3MgcHVibGljIGtleSB0byBlbmNyeXB0IGEgbWVzc2FnZVxuICogQHBhcmFtIHNlbmRlcklkZW50aXR5UHJpdmF0ZUtleVx0dGhlIHNlbmRlcidzIHByaXZhdGUgaWRlbnRpdHkga2V5XG4gKiBAcGFyYW0gZXBoZW1lcmFsUHJpdmF0ZUtleSAgdGhlIGVwaGVtZXJhbCBwcml2YXRlIGtleSBnZW5lcmF0ZWQgYnkgdGhlIHNlbmRlciBmb3IganVzdCBvbmUgbWVzc2FnZSAodG8gb25lIG9yIG1vcmUgcmVjaXBpZW50cylcbiAqIEBwYXJhbSByZWNpcGllbnRJZGVudGl0eVB1YmxpY0tleSB0aGUgcmVjaXBpZW50J3MgcHVibGljIGlkZW50aXR5IGtleVxuICogQHJldHVybiB0aGUgc2hhcmVkIHNlY3JldHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVjY0VuY2Fwc3VsYXRlKHNlbmRlcklkZW50aXR5UHJpdmF0ZUtleSwgZXBoZW1lcmFsUHJpdmF0ZUtleSwgcmVjaXBpZW50SWRlbnRpdHlQdWJsaWNLZXkpIHtcbiAgICBjb25zdCBlcGhlbWVyYWxTaGFyZWRTZWNyZXQgPSBnZW5lcmF0ZVNoYXJlZFNlY3JldChlcGhlbWVyYWxQcml2YXRlS2V5LCByZWNpcGllbnRJZGVudGl0eVB1YmxpY0tleSk7XG4gICAgY29uc3QgYXV0aFNoYXJlZFNlY3JldCA9IGdlbmVyYXRlU2hhcmVkU2VjcmV0KHNlbmRlcklkZW50aXR5UHJpdmF0ZUtleSwgcmVjaXBpZW50SWRlbnRpdHlQdWJsaWNLZXkpO1xuICAgIHJldHVybiB7IGVwaGVtZXJhbFNoYXJlZFNlY3JldCwgYXV0aFNoYXJlZFNlY3JldCB9O1xufVxuLyoqXG4gKiBEZXJpdmUgYSBzaGFyZWQgc2VjcmV0IGZyb20gdGhlIHJlY2lwaWVudCdzIHByaXZhdGUga2V5IGFuZCB0aGUgc2VuZGVyJ3MgcHVibGljIGtleSB0byBkZWNyeXB0IGEgbWVzc2FnZVxuICogQHBhcmFtIHNlbmRlcklkZW50aXR5UHVibGljS2V5XHR0aGUgc2VuZGVyJ3MgcHVibGljIGlkZW50aXR5IGtleVxuICogQHBhcmFtIGVwaGVtZXJhbFB1YmxpY0tleSAgdGhlIGVwaGVtZXJhbCBwdWJsaWMga2V5IGdlbmVyYXRlZCBieSB0aGUgc2VuZGVyIGZvciBqdXN0IG9uZSBtZXNzYWdlICh0byBvbmUgb3IgbW9yZSByZWNpcGllbnRzKVxuICogQHBhcmFtIHJlY2lwaWVudElkZW50aXR5UHJpdmF0ZUtleSB0aGUgcmVjaXBpZW50J3MgcHJpdmF0ZSBpZGVudGl0eSBrZXlcbiAqIEByZXR1cm4gc2hhcmVkIHNlY3JldCBhbmQgdGhlIHNlbmRlcidzIHB1YmxpYyBrZXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVjY0RlY2Fwc3VsYXRlKHNlbmRlcklkZW50aXR5UHVibGljS2V5LCBlcGhlbWVyYWxQdWJsaWNLZXksIHJlY2lwaWVudElkZW50aXR5UHJpdmF0ZUtleSkge1xuICAgIGNvbnN0IGVwaGVtZXJhbFNoYXJlZFNlY3JldCA9IGdlbmVyYXRlU2hhcmVkU2VjcmV0KHJlY2lwaWVudElkZW50aXR5UHJpdmF0ZUtleSwgZXBoZW1lcmFsUHVibGljS2V5KTtcbiAgICBjb25zdCBhdXRoU2hhcmVkU2VjcmV0ID0gZ2VuZXJhdGVTaGFyZWRTZWNyZXQocmVjaXBpZW50SWRlbnRpdHlQcml2YXRlS2V5LCBzZW5kZXJJZGVudGl0eVB1YmxpY0tleSk7XG4gICAgcmV0dXJuIHsgZXBoZW1lcmFsU2hhcmVkU2VjcmV0LCBhdXRoU2hhcmVkU2VjcmV0IH07XG59XG4vKipcbiAqIERpZmZpZS1IZWxsbWFuIGtleSBleGNoYW5nZTsgd29ya3MgYnkgY29tYmluaW5nIG9uZSBwYXJ0eSdzIHByaXZhdGUga2V5IGFuZCB0aGUgb3RoZXIgcGFydHkncyBwdWJsaWMga2V5IHRvIGZvcm0gYSBzaGFyZWQgc2VjcmV0IGJldHdlZW4gYm90aCBwYXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlU2hhcmVkU2VjcmV0KGxvY2FsUHJpdmF0ZUtleSwgcmVtb3RlUHVibGljS2V5KSB7XG4gICAgY29uc3Qgc2hhcmVkU2VjcmV0ID0geDI1NTE5LmdldFNoYXJlZFNlY3JldChsb2NhbFByaXZhdGVLZXksIHJlbW90ZVB1YmxpY0tleSk7XG4gICAgLy8gaWYgZXZlcnkgYnl0ZSBzb21laG93IGhhcHBlbnMgdG8gYmUgMCwgd2UgY2FuJ3QgdXNlIHRoaXMgYXMgYSBzZWNyZXQ7IHRoaXMgaXMgYXN0cm9ub21pY2FsbHkgdW5saWtlbHkgdG8gaGFwcGVuIGJ5IGNoYW5jZVxuICAgIGlmIChzaGFyZWRTZWNyZXQuZXZlcnkoKHZhbCkgPT4gdmFsID09PSAwKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW4ndCBnZXQgc2hhcmVkIHNlY3JldDogYmFkIGtleSBpbnB1dHNcIik7XG4gICAgfVxuICAgIHJldHVybiBzaGFyZWRTZWNyZXQ7XG59XG4vLyBzZWUgaHR0cHM6Ly93d3cuamNyYWlnZS5jb20vYW4tZXhwbGFpbmVyLW9uLWVkMjU1MTktY2xhbXBpbmcgZm9yIGFuIGV4cGxhbmF0aW9uIG9uIHdoeSB3ZSBkbyB0aGlzXG5mdW5jdGlvbiBjbGFtcFByaXZhdGVLZXkocHJpdmF0ZUtleSkge1xuICAgIC8vIEZpcnN0LCB3ZSB3YW50IHRvIHVuc2V0IHRoZSBoaWdoZXN0IGJpdCBidXQgc2V0IHRoZSBzZWNvbmQtaGlnaGVzdCBiaXQgdG8gMS4gVGhpcyBwcmV2ZW50cyBwb3RlbnRpYWwgdGltaW5nIGFuZCBicnV0ZS1mb3JjZSBhdHRhY2tzLCByZXNwZWN0aXZlbHkuXG4gICAgcHJpdmF0ZUtleVtwcml2YXRlS2V5Lmxlbmd0aCAtIDFdID0gKHByaXZhdGVLZXlbcHJpdmF0ZUtleS5sZW5ndGggLSAxXSAmIDBiMDExMTExMTEpIHwgMGIwMTAwMDAwMDtcbiAgICAvLyBUaGVuLCB3ZSB3YW50IHRvIGd1YXJhbnRlZSBvdXIgc2NhbGFyIGlzIGEgbXVsdGlwbGUgb2YgOCwgb3VyIGNvZmFjdG9yLCB0byBwcm90ZWN0IGFnYWluc3Qgc21hbGwtc3ViZ3JvdXAgYXR0YWNrcyBwZXIgUkZDIDI3ODUgd2hpY2ggY291bGQgbGVhayBrZXkgZGF0YSFcbiAgICBwcml2YXRlS2V5WzBdICY9IDBiMTExMTEwMDA7XG4gICAgcmV0dXJuIHByaXZhdGVLZXk7XG59XG5mdW5jdGlvbiBkZXJpdmVQdWJsaWNLZXkocHJpdmF0ZUtleSkge1xuICAgIHJldHVybiB4MjU1MTkuZ2V0UHVibGljS2V5KHByaXZhdGVLZXkpO1xufVxuIiwiLy8gdjIuMlxuLy8gdHV0YW8obWFwKTogc2xpZ2h0bHkgbW9kaWZpZWQgPT4gbWFkZSBzeW5jaHJvbm91cywgcmVtb3ZlZCB1bnVzZWQgY29kZVxuZnVuY3Rpb24gYkNyeXB0KCkge1xuICAgIHRoaXMuR0VOU0FMVF9ERUZBVUxUX0xPRzJfUk9VTkRTID0gMTA7XG4gICAgdGhpcy5CQ1JZUFRfU0FMVF9MRU4gPSAxNjtcbiAgICB0aGlzLkJMT1dGSVNIX05VTV9ST1VORFMgPSAxNjtcbiAgICAvLyBjb21tZW50ZWQgbmV4dCBsaW5lIGJlY2F1c2UgaXQgaXMgbm90IHVzZWRcbiAgICAvL1x0dGhpcy5QUk5HID0gQ2xpcHBlcnouQ3J5cHRvLlBSTkcuZGVmYXVsdFJhbmRvbUdlbmVyYXRvcigpO1xuICAgIHRoaXMuTUFYX0VYRUNVVElPTl9USU1FID0gMTAwO1xuICAgIHRoaXMuUF9vcmlnID0gW1xuICAgICAgICAweDI0M2Y2YTg4LCAweDg1YTMwOGQzLCAweDEzMTk4YTJlLCAweDAzNzA3MzQ0LCAweGE0MDkzODIyLFxuICAgICAgICAweDI5OWYzMWQwLCAweDA4MmVmYTk4LCAweGVjNGU2Yzg5LCAweDQ1MjgyMWU2LCAweDM4ZDAxMzc3LFxuICAgICAgICAweGJlNTQ2NmNmLCAweDM0ZTkwYzZjLCAweGMwYWMyOWI3LCAweGM5N2M1MGRkLCAweDNmODRkNWI1LFxuICAgICAgICAweGI1NDcwOTE3LCAweDkyMTZkNWQ5LCAweDg5NzlmYjFiXG4gICAgXTtcbiAgICB0aGlzLlNfb3JpZyA9IFtcbiAgICAgICAgMHhkMTMxMGJhNiwgMHg5OGRmYjVhYywgMHgyZmZkNzJkYiwgMHhkMDFhZGZiNywgMHhiOGUxYWZlZCxcbiAgICAgICAgMHg2YTI2N2U5NiwgMHhiYTdjOTA0NSwgMHhmMTJjN2Y5OSwgMHgyNGExOTk0NywgMHhiMzkxNmNmNyxcbiAgICAgICAgMHgwODAxZjJlMiwgMHg4NThlZmMxNiwgMHg2MzY5MjBkOCwgMHg3MTU3NGU2OSwgMHhhNDU4ZmVhMyxcbiAgICAgICAgMHhmNDkzM2Q3ZSwgMHgwZDk1NzQ4ZiwgMHg3MjhlYjY1OCwgMHg3MThiY2Q1OCwgMHg4MjE1NGFlZSxcbiAgICAgICAgMHg3YjU0YTQxZCwgMHhjMjVhNTliNSwgMHg5YzMwZDUzOSwgMHgyYWYyNjAxMywgMHhjNWQxYjAyMyxcbiAgICAgICAgMHgyODYwODVmMCwgMHhjYTQxNzkxOCwgMHhiOGRiMzhlZiwgMHg4ZTc5ZGNiMCwgMHg2MDNhMTgwZSxcbiAgICAgICAgMHg2YzllMGU4YiwgMHhiMDFlOGEzZSwgMHhkNzE1NzdjMSwgMHhiZDMxNGIyNywgMHg3OGFmMmZkYSxcbiAgICAgICAgMHg1NTYwNWM2MCwgMHhlNjU1MjVmMywgMHhhYTU1YWI5NCwgMHg1NzQ4OTg2MiwgMHg2M2U4MTQ0MCxcbiAgICAgICAgMHg1NWNhMzk2YSwgMHgyYWFiMTBiNiwgMHhiNGNjNWMzNCwgMHgxMTQxZThjZSwgMHhhMTU0ODZhZixcbiAgICAgICAgMHg3YzcyZTk5MywgMHhiM2VlMTQxMSwgMHg2MzZmYmMyYSwgMHgyYmE5YzU1ZCwgMHg3NDE4MzFmNixcbiAgICAgICAgMHhjZTVjM2UxNiwgMHg5Yjg3OTMxZSwgMHhhZmQ2YmEzMywgMHg2YzI0Y2Y1YywgMHg3YTMyNTM4MSxcbiAgICAgICAgMHgyODk1ODY3NywgMHgzYjhmNDg5OCwgMHg2YjRiYjlhZiwgMHhjNGJmZTgxYiwgMHg2NjI4MjE5MyxcbiAgICAgICAgMHg2MWQ4MDljYywgMHhmYjIxYTk5MSwgMHg0ODdjYWM2MCwgMHg1ZGVjODAzMiwgMHhlZjg0NWQ1ZCxcbiAgICAgICAgMHhlOTg1NzViMSwgMHhkYzI2MjMwMiwgMHhlYjY1MWI4OCwgMHgyMzg5M2U4MSwgMHhkMzk2YWNjNSxcbiAgICAgICAgMHgwZjZkNmZmMywgMHg4M2Y0NDIzOSwgMHgyZTBiNDQ4MiwgMHhhNDg0MjAwNCwgMHg2OWM4ZjA0YSxcbiAgICAgICAgMHg5ZTFmOWI1ZSwgMHgyMWM2Njg0MiwgMHhmNmU5NmM5YSwgMHg2NzBjOWM2MSwgMHhhYmQzODhmMCxcbiAgICAgICAgMHg2YTUxYTBkMiwgMHhkODU0MmY2OCwgMHg5NjBmYTcyOCwgMHhhYjUxMzNhMywgMHg2ZWVmMGI2YyxcbiAgICAgICAgMHgxMzdhM2JlNCwgMHhiYTNiZjA1MCwgMHg3ZWZiMmE5OCwgMHhhMWYxNjUxZCwgMHgzOWFmMDE3NixcbiAgICAgICAgMHg2NmNhNTkzZSwgMHg4MjQzMGU4OCwgMHg4Y2VlODYxOSwgMHg0NTZmOWZiNCwgMHg3ZDg0YTVjMyxcbiAgICAgICAgMHgzYjhiNWViZSwgMHhlMDZmNzVkOCwgMHg4NWMxMjA3MywgMHg0MDFhNDQ5ZiwgMHg1NmMxNmFhNixcbiAgICAgICAgMHg0ZWQzYWE2MiwgMHgzNjNmNzcwNiwgMHgxYmZlZGY3MiwgMHg0MjliMDIzZCwgMHgzN2QwZDcyNCxcbiAgICAgICAgMHhkMDBhMTI0OCwgMHhkYjBmZWFkMywgMHg0OWYxYzA5YiwgMHgwNzUzNzJjOSwgMHg4MDk5MWI3YixcbiAgICAgICAgMHgyNWQ0NzlkOCwgMHhmNmU4ZGVmNywgMHhlM2ZlNTAxYSwgMHhiNjc5NGMzYiwgMHg5NzZjZTBiZCxcbiAgICAgICAgMHgwNGMwMDZiYSwgMHhjMWE5NGZiNiwgMHg0MDlmNjBjNCwgMHg1ZTVjOWVjMiwgMHgxOTZhMjQ2MyxcbiAgICAgICAgMHg2OGZiNmZhZiwgMHgzZTZjNTNiNSwgMHgxMzM5YjJlYiwgMHgzYjUyZWM2ZiwgMHg2ZGZjNTExZixcbiAgICAgICAgMHg5YjMwOTUyYywgMHhjYzgxNDU0NCwgMHhhZjVlYmQwOSwgMHhiZWUzZDAwNCwgMHhkZTMzNGFmZCxcbiAgICAgICAgMHg2NjBmMjgwNywgMHgxOTJlNGJiMywgMHhjMGNiYTg1NywgMHg0NWM4NzQwZiwgMHhkMjBiNWYzOSxcbiAgICAgICAgMHhiOWQzZmJkYiwgMHg1NTc5YzBiZCwgMHgxYTYwMzIwYSwgMHhkNmExMDBjNiwgMHg0MDJjNzI3OSxcbiAgICAgICAgMHg2NzlmMjVmZSwgMHhmYjFmYTNjYywgMHg4ZWE1ZTlmOCwgMHhkYjMyMjJmOCwgMHgzYzc1MTZkZixcbiAgICAgICAgMHhmZDYxNmIxNSwgMHgyZjUwMWVjOCwgMHhhZDA1NTJhYiwgMHgzMjNkYjVmYSwgMHhmZDIzODc2MCxcbiAgICAgICAgMHg1MzMxN2I0OCwgMHgzZTAwZGY4MiwgMHg5ZTVjNTdiYiwgMHhjYTZmOGNhMCwgMHgxYTg3NTYyZSxcbiAgICAgICAgMHhkZjE3NjlkYiwgMHhkNTQyYThmNiwgMHgyODdlZmZjMywgMHhhYzY3MzJjNiwgMHg4YzRmNTU3MyxcbiAgICAgICAgMHg2OTViMjdiMCwgMHhiYmNhNThjOCwgMHhlMWZmYTM1ZCwgMHhiOGYwMTFhMCwgMHgxMGZhM2Q5OCxcbiAgICAgICAgMHhmZDIxODNiOCwgMHg0YWZjYjU2YywgMHgyZGQxZDM1YiwgMHg5YTUzZTQ3OSwgMHhiNmY4NDU2NSxcbiAgICAgICAgMHhkMjhlNDliYywgMHg0YmZiOTc5MCwgMHhlMWRkZjJkYSwgMHhhNGNiN2UzMywgMHg2MmZiMTM0MSxcbiAgICAgICAgMHhjZWU0YzZlOCwgMHhlZjIwY2FkYSwgMHgzNjc3NGMwMSwgMHhkMDdlOWVmZSwgMHgyYmYxMWZiNCxcbiAgICAgICAgMHg5NWRiZGE0ZCwgMHhhZTkwOTE5OCwgMHhlYWFkOGU3MSwgMHg2YjkzZDVhMCwgMHhkMDhlZDFkMCxcbiAgICAgICAgMHhhZmM3MjVlMCwgMHg4ZTNjNWIyZiwgMHg4ZTc1OTRiNywgMHg4ZmY2ZTJmYiwgMHhmMjEyMmI2NCxcbiAgICAgICAgMHg4ODg4YjgxMiwgMHg5MDBkZjAxYywgMHg0ZmFkNWVhMCwgMHg2ODhmYzMxYywgMHhkMWNmZjE5MSxcbiAgICAgICAgMHhiM2E4YzFhZCwgMHgyZjJmMjIxOCwgMHhiZTBlMTc3NywgMHhlYTc1MmRmZSwgMHg4YjAyMWZhMSxcbiAgICAgICAgMHhlNWEwY2MwZiwgMHhiNTZmNzRlOCwgMHgxOGFjZjNkNiwgMHhjZTg5ZTI5OSwgMHhiNGE4NGZlMCxcbiAgICAgICAgMHhmZDEzZTBiNywgMHg3Y2M0M2I4MSwgMHhkMmFkYThkOSwgMHgxNjVmYTI2NiwgMHg4MDk1NzcwNSxcbiAgICAgICAgMHg5M2NjNzMxNCwgMHgyMTFhMTQ3NywgMHhlNmFkMjA2NSwgMHg3N2I1ZmE4NiwgMHhjNzU0NDJmNSxcbiAgICAgICAgMHhmYjlkMzVjZiwgMHhlYmNkYWYwYywgMHg3YjNlODlhMCwgMHhkNjQxMWJkMywgMHhhZTFlN2U0OSxcbiAgICAgICAgMHgwMDI1MGUyZCwgMHgyMDcxYjM1ZSwgMHgyMjY4MDBiYiwgMHg1N2I4ZTBhZiwgMHgyNDY0MzY5YixcbiAgICAgICAgMHhmMDA5YjkxZSwgMHg1NTYzOTExZCwgMHg1OWRmYTZhYSwgMHg3OGMxNDM4OSwgMHhkOTVhNTM3ZixcbiAgICAgICAgMHgyMDdkNWJhMiwgMHgwMmU1YjljNSwgMHg4MzI2MDM3NiwgMHg2Mjk1Y2ZhOSwgMHgxMWM4MTk2OCxcbiAgICAgICAgMHg0ZTczNGE0MSwgMHhiMzQ3MmRjYSwgMHg3YjE0YTk0YSwgMHgxYjUxMDA1MiwgMHg5YTUzMjkxNSxcbiAgICAgICAgMHhkNjBmNTczZiwgMHhiYzliYzZlNCwgMHgyYjYwYTQ3NiwgMHg4MWU2NzQwMCwgMHgwOGJhNmZiNSxcbiAgICAgICAgMHg1NzFiZTkxZiwgMHhmMjk2ZWM2YiwgMHgyYTBkZDkxNSwgMHhiNjYzNjUyMSwgMHhlN2I5ZjliNixcbiAgICAgICAgMHhmZjM0MDUyZSwgMHhjNTg1NTY2NCwgMHg1M2IwMmQ1ZCwgMHhhOTlmOGZhMSwgMHgwOGJhNDc5OSxcbiAgICAgICAgMHg2ZTg1MDc2YSwgMHg0YjdhNzBlOSwgMHhiNWIzMjk0NCwgMHhkYjc1MDkyZSwgMHhjNDE5MjYyMyxcbiAgICAgICAgMHhhZDZlYTZiMCwgMHg0OWE3ZGY3ZCwgMHg5Y2VlNjBiOCwgMHg4ZmVkYjI2NiwgMHhlY2FhOGM3MSxcbiAgICAgICAgMHg2OTlhMTdmZiwgMHg1NjY0NTI2YywgMHhjMmIxOWVlMSwgMHgxOTM2MDJhNSwgMHg3NTA5NGMyOSxcbiAgICAgICAgMHhhMDU5MTM0MCwgMHhlNDE4M2EzZSwgMHgzZjU0OTg5YSwgMHg1YjQyOWQ2NSwgMHg2YjhmZTRkNixcbiAgICAgICAgMHg5OWY3M2ZkNiwgMHhhMWQyOWMwNywgMHhlZmU4MzBmNSwgMHg0ZDJkMzhlNiwgMHhmMDI1NWRjMSxcbiAgICAgICAgMHg0Y2RkMjA4NiwgMHg4NDcwZWIyNiwgMHg2MzgyZTljNiwgMHgwMjFlY2M1ZSwgMHgwOTY4NmIzZixcbiAgICAgICAgMHgzZWJhZWZjOSwgMHgzYzk3MTgxNCwgMHg2YjZhNzBhMSwgMHg2ODdmMzU4NCwgMHg1MmEwZTI4NixcbiAgICAgICAgMHhiNzljNTMwNSwgMHhhYTUwMDczNywgMHgzZTA3ODQxYywgMHg3ZmRlYWU1YywgMHg4ZTdkNDRlYyxcbiAgICAgICAgMHg1NzE2ZjJiOCwgMHhiMDNhZGEzNywgMHhmMDUwMGMwZCwgMHhmMDFjMWYwNCwgMHgwMjAwYjNmZixcbiAgICAgICAgMHhhZTBjZjUxYSwgMHgzY2I1NzRiMiwgMHgyNTgzN2E1OCwgMHhkYzA5MjFiZCwgMHhkMTkxMTNmOSxcbiAgICAgICAgMHg3Y2E5MmZmNiwgMHg5NDMyNDc3MywgMHgyMmY1NDcwMSwgMHgzYWU1ZTU4MSwgMHgzN2MyZGFkYyxcbiAgICAgICAgMHhjOGI1NzYzNCwgMHg5YWYzZGRhNywgMHhhOTQ0NjE0NiwgMHgwZmQwMDMwZSwgMHhlY2M4YzczZSxcbiAgICAgICAgMHhhNDc1MWU0MSwgMHhlMjM4Y2Q5OSwgMHgzYmVhMGUyZiwgMHgzMjgwYmJhMSwgMHgxODNlYjMzMSxcbiAgICAgICAgMHg0ZTU0OGIzOCwgMHg0ZjZkYjkwOCwgMHg2ZjQyMGQwMywgMHhmNjBhMDRiZiwgMHgyY2I4MTI5MCxcbiAgICAgICAgMHgyNDk3N2M3OSwgMHg1Njc5YjA3MiwgMHhiY2FmODlhZiwgMHhkZTlhNzcxZiwgMHhkOTkzMDgxMCxcbiAgICAgICAgMHhiMzhiYWUxMiwgMHhkY2NmM2YyZSwgMHg1NTEyNzIxZiwgMHgyZTZiNzEyNCwgMHg1MDFhZGRlNixcbiAgICAgICAgMHg5Zjg0Y2Q4NywgMHg3YTU4NDcxOCwgMHg3NDA4ZGExNywgMHhiYzlmOWFiYywgMHhlOTRiN2Q4YyxcbiAgICAgICAgMHhlYzdhZWMzYSwgMHhkYjg1MWRmYSwgMHg2MzA5NDM2NiwgMHhjNDY0YzNkMiwgMHhlZjFjMTg0NyxcbiAgICAgICAgMHgzMjE1ZDkwOCwgMHhkZDQzM2IzNywgMHgyNGMyYmExNiwgMHgxMmExNGQ0MywgMHgyYTY1YzQ1MSxcbiAgICAgICAgMHg1MDk0MDAwMiwgMHgxMzNhZTRkZCwgMHg3MWRmZjg5ZSwgMHgxMDMxNGU1NSwgMHg4MWFjNzdkNixcbiAgICAgICAgMHg1ZjExMTk5YiwgMHgwNDM1NTZmMSwgMHhkN2EzYzc2YiwgMHgzYzExMTgzYiwgMHg1OTI0YTUwOSxcbiAgICAgICAgMHhmMjhmZTZlZCwgMHg5N2YxZmJmYSwgMHg5ZWJhYmYyYywgMHgxZTE1M2M2ZSwgMHg4NmUzNDU3MCxcbiAgICAgICAgMHhlYWU5NmZiMSwgMHg4NjBlNWUwYSwgMHg1YTNlMmFiMywgMHg3NzFmZTcxYywgMHg0ZTNkMDZmYSxcbiAgICAgICAgMHgyOTY1ZGNiOSwgMHg5OWU3MWQwZiwgMHg4MDNlODlkNiwgMHg1MjY2YzgyNSwgMHgyZTRjYzk3OCxcbiAgICAgICAgMHg5YzEwYjM2YSwgMHhjNjE1MGViYSwgMHg5NGUyZWE3OCwgMHhhNWZjM2M1MywgMHgxZTBhMmRmNCxcbiAgICAgICAgMHhmMmY3NGVhNywgMHgzNjFkMmIzZCwgMHgxOTM5MjYwZiwgMHgxOWMyNzk2MCwgMHg1MjIzYTcwOCxcbiAgICAgICAgMHhmNzEzMTJiNiwgMHhlYmFkZmU2ZSwgMHhlYWMzMWY2NiwgMHhlM2JjNDU5NSwgMHhhNjdiYzg4MyxcbiAgICAgICAgMHhiMTdmMzdkMSwgMHgwMThjZmYyOCwgMHhjMzMyZGRlZiwgMHhiZTZjNWFhNSwgMHg2NTU4MjE4NSxcbiAgICAgICAgMHg2OGFiOTgwMiwgMHhlZWNlYTUwZiwgMHhkYjJmOTUzYiwgMHgyYWVmN2RhZCwgMHg1YjZlMmY4NCxcbiAgICAgICAgMHgxNTIxYjYyOCwgMHgyOTA3NjE3MCwgMHhlY2RkNDc3NSwgMHg2MTlmMTUxMCwgMHgxM2NjYTgzMCxcbiAgICAgICAgMHhlYjYxYmQ5NiwgMHgwMzM0ZmUxZSwgMHhhYTAzNjNjZiwgMHhiNTczNWM5MCwgMHg0YzcwYTIzOSxcbiAgICAgICAgMHhkNTllOWUwYiwgMHhjYmFhZGUxNCwgMHhlZWNjODZiYywgMHg2MDYyMmNhNywgMHg5Y2FiNWNhYixcbiAgICAgICAgMHhiMmYzODQ2ZSwgMHg2NDhiMWVhZiwgMHgxOWJkZjBjYSwgMHhhMDIzNjliOSwgMHg2NTVhYmI1MCxcbiAgICAgICAgMHg0MDY4NWEzMiwgMHgzYzJhYjRiMywgMHgzMTllZTlkNSwgMHhjMDIxYjhmNywgMHg5YjU0MGIxOSxcbiAgICAgICAgMHg4NzVmYTA5OSwgMHg5NWY3OTk3ZSwgMHg2MjNkN2RhOCwgMHhmODM3ODg5YSwgMHg5N2UzMmQ3NyxcbiAgICAgICAgMHgxMWVkOTM1ZiwgMHgxNjY4MTI4MSwgMHgwZTM1ODgyOSwgMHhjN2U2MWZkNiwgMHg5NmRlZGZhMSxcbiAgICAgICAgMHg3ODU4YmE5OSwgMHg1N2Y1ODRhNSwgMHgxYjIyNzI2MywgMHg5YjgzYzNmZiwgMHgxYWMyNDY5NixcbiAgICAgICAgMHhjZGIzMGFlYiwgMHg1MzJlMzA1NCwgMHg4ZmQ5NDhlNCwgMHg2ZGJjMzEyOCwgMHg1OGViZjJlZixcbiAgICAgICAgMHgzNGM2ZmZlYSwgMHhmZTI4ZWQ2MSwgMHhlZTdjM2M3MywgMHg1ZDRhMTRkOSwgMHhlODY0YjdlMyxcbiAgICAgICAgMHg0MjEwNWQxNCwgMHgyMDNlMTNlMCwgMHg0NWVlZTJiNiwgMHhhM2FhYWJlYSwgMHhkYjZjNGYxNSxcbiAgICAgICAgMHhmYWNiNGZkMCwgMHhjNzQyZjQ0MiwgMHhlZjZhYmJiNSwgMHg2NTRmM2IxZCwgMHg0MWNkMjEwNSxcbiAgICAgICAgMHhkODFlNzk5ZSwgMHg4Njg1NGRjNywgMHhlNDRiNDc2YSwgMHgzZDgxNjI1MCwgMHhjZjYyYTFmMixcbiAgICAgICAgMHg1YjhkMjY0NiwgMHhmYzg4ODNhMCwgMHhjMWM3YjZhMywgMHg3ZjE1MjRjMywgMHg2OWNiNzQ5MixcbiAgICAgICAgMHg0Nzg0OGEwYiwgMHg1NjkyYjI4NSwgMHgwOTViYmYwMCwgMHhhZDE5NDg5ZCwgMHgxNDYyYjE3NCxcbiAgICAgICAgMHgyMzgyMGUwMCwgMHg1ODQyOGQyYSwgMHgwYzU1ZjVlYSwgMHgxZGFkZjQzZSwgMHgyMzNmNzA2MSxcbiAgICAgICAgMHgzMzcyZjA5MiwgMHg4ZDkzN2U0MSwgMHhkNjVmZWNmMSwgMHg2YzIyM2JkYiwgMHg3Y2RlMzc1OSxcbiAgICAgICAgMHhjYmVlNzQ2MCwgMHg0MDg1ZjJhNywgMHhjZTc3MzI2ZSwgMHhhNjA3ODA4NCwgMHgxOWY4NTA5ZSxcbiAgICAgICAgMHhlOGVmZDg1NSwgMHg2MWQ5OTczNSwgMHhhOTY5YTdhYSwgMHhjNTBjMDZjMiwgMHg1YTA0YWJmYyxcbiAgICAgICAgMHg4MDBiY2FkYywgMHg5ZTQ0N2EyZSwgMHhjMzQ1MzQ4NCwgMHhmZGQ1NjcwNSwgMHgwZTFlOWVjOSxcbiAgICAgICAgMHhkYjczZGJkMywgMHgxMDU1ODhjZCwgMHg2NzVmZGE3OSwgMHhlMzY3NDM0MCwgMHhjNWM0MzQ2NSxcbiAgICAgICAgMHg3MTNlMzhkOCwgMHgzZDI4Zjg5ZSwgMHhmMTZkZmYyMCwgMHgxNTNlMjFlNywgMHg4ZmIwM2Q0YSxcbiAgICAgICAgMHhlNmUzOWYyYiwgMHhkYjgzYWRmNywgMHhlOTNkNWE2OCwgMHg5NDgxNDBmNywgMHhmNjRjMjYxYyxcbiAgICAgICAgMHg5NDY5MjkzNCwgMHg0MTE1MjBmNywgMHg3NjAyZDRmNywgMHhiY2Y0NmIyZSwgMHhkNGEyMDA2OCxcbiAgICAgICAgMHhkNDA4MjQ3MSwgMHgzMzIwZjQ2YSwgMHg0M2I3ZDRiNywgMHg1MDAwNjFhZiwgMHgxZTM5ZjYyZSxcbiAgICAgICAgMHg5NzI0NDU0NiwgMHgxNDIxNGY3NCwgMHhiZjhiODg0MCwgMHg0ZDk1ZmMxZCwgMHg5NmI1OTFhZixcbiAgICAgICAgMHg3MGY0ZGRkMywgMHg2NmEwMmY0NSwgMHhiZmJjMDllYywgMHgwM2JkOTc4NSwgMHg3ZmFjNmRkMCxcbiAgICAgICAgMHgzMWNiODUwNCwgMHg5NmViMjdiMywgMHg1NWZkMzk0MSwgMHhkYTI1NDdlNiwgMHhhYmNhMGE5YSxcbiAgICAgICAgMHgyODUwNzgyNSwgMHg1MzA0MjlmNCwgMHgwYTJjODZkYSwgMHhlOWI2NmRmYiwgMHg2OGRjMTQ2MixcbiAgICAgICAgMHhkNzQ4NjkwMCwgMHg2ODBlYzBhNCwgMHgyN2ExOGRlZSwgMHg0ZjNmZmVhMiwgMHhlODg3YWQ4YyxcbiAgICAgICAgMHhiNThjZTAwNiwgMHg3YWY0ZDZiNiwgMHhhYWNlMWU3YywgMHhkMzM3NWZlYywgMHhjZTc4YTM5OSxcbiAgICAgICAgMHg0MDZiMmE0MiwgMHgyMGZlOWUzNSwgMHhkOWYzODViOSwgMHhlZTM5ZDdhYiwgMHgzYjEyNGU4YixcbiAgICAgICAgMHgxZGM5ZmFmNywgMHg0YjZkMTg1NiwgMHgyNmEzNjYzMSwgMHhlYWUzOTdiMiwgMHgzYTZlZmE3NCxcbiAgICAgICAgMHhkZDViNDMzMiwgMHg2ODQxZTdmNywgMHhjYTc4MjBmYiwgMHhmYjBhZjU0ZSwgMHhkOGZlYjM5NyxcbiAgICAgICAgMHg0NTQwNTZhYywgMHhiYTQ4OTUyNywgMHg1NTUzM2EzYSwgMHgyMDgzOGQ4NywgMHhmZTZiYTliNyxcbiAgICAgICAgMHhkMDk2OTU0YiwgMHg1NWE4NjdiYywgMHhhMTE1OWE1OCwgMHhjY2E5Mjk2MywgMHg5OWUxZGIzMyxcbiAgICAgICAgMHhhNjJhNGE1NiwgMHgzZjMxMjVmOSwgMHg1ZWY0N2UxYywgMHg5MDI5MzE3YywgMHhmZGY4ZTgwMixcbiAgICAgICAgMHgwNDI3MmY3MCwgMHg4MGJiMTU1YywgMHgwNTI4MmNlMywgMHg5NWMxMTU0OCwgMHhlNGM2NmQyMixcbiAgICAgICAgMHg0OGMxMTMzZiwgMHhjNzBmODZkYywgMHgwN2Y5YzllZSwgMHg0MTA0MWYwZiwgMHg0MDQ3NzlhNCxcbiAgICAgICAgMHg1ZDg4NmUxNywgMHgzMjVmNTFlYiwgMHhkNTliYzBkMSwgMHhmMmJjYzE4ZiwgMHg0MTExMzU2NCxcbiAgICAgICAgMHgyNTdiNzgzNCwgMHg2MDJhOWM2MCwgMHhkZmY4ZThhMywgMHgxZjYzNmMxYiwgMHgwZTEyYjRjMixcbiAgICAgICAgMHgwMmUxMzI5ZSwgMHhhZjY2NGZkMSwgMHhjYWQxODExNSwgMHg2YjIzOTVlMCwgMHgzMzNlOTJlMSxcbiAgICAgICAgMHgzYjI0MGI2MiwgMHhlZWJlYjkyMiwgMHg4NWIyYTIwZSwgMHhlNmJhMGQ5OSwgMHhkZTcyMGM4YyxcbiAgICAgICAgMHgyZGEyZjcyOCwgMHhkMDEyNzg0NSwgMHg5NWI3OTRmZCwgMHg2NDdkMDg2MiwgMHhlN2NjZjVmMCxcbiAgICAgICAgMHg1NDQ5YTM2ZiwgMHg4NzdkNDhmYSwgMHhjMzlkZmQyNywgMHhmMzNlOGQxZSwgMHgwYTQ3NjM0MSxcbiAgICAgICAgMHg5OTJlZmY3NCwgMHgzYTZmNmVhYiwgMHhmNGY4ZmQzNywgMHhhODEyZGM2MCwgMHhhMWViZGRmOCxcbiAgICAgICAgMHg5OTFiZTE0YywgMHhkYjZlNmIwZCwgMHhjNjdiNTUxMCwgMHg2ZDY3MmMzNywgMHgyNzY1ZDQzYixcbiAgICAgICAgMHhkY2QwZTgwNCwgMHhmMTI5MGRjNywgMHhjYzAwZmZhMywgMHhiNTM5MGY5MiwgMHg2OTBmZWQwYixcbiAgICAgICAgMHg2NjdiOWZmYiwgMHhjZWRiN2Q5YywgMHhhMDkxY2YwYiwgMHhkOTE1NWVhMywgMHhiYjEzMmY4OCxcbiAgICAgICAgMHg1MTViYWQyNCwgMHg3Yjk0NzliZiwgMHg3NjNiZDZlYiwgMHgzNzM5MmViMywgMHhjYzExNTk3OSxcbiAgICAgICAgMHg4MDI2ZTI5NywgMHhmNDJlMzEyZCwgMHg2ODQyYWRhNywgMHhjNjZhMmIzYiwgMHgxMjc1NGNjYyxcbiAgICAgICAgMHg3ODJlZjExYywgMHg2YTEyNDIzNywgMHhiNzkyNTFlNywgMHgwNmExYmJlNiwgMHg0YmZiNjM1MCxcbiAgICAgICAgMHgxYTZiMTAxOCwgMHgxMWNhZWRmYSwgMHgzZDI1YmRkOCwgMHhlMmUxYzNjOSwgMHg0NDQyMTY1OSxcbiAgICAgICAgMHgwYTEyMTM4NiwgMHhkOTBjZWM2ZSwgMHhkNWFiZWEyYSwgMHg2NGFmNjc0ZSwgMHhkYTg2YTg1ZixcbiAgICAgICAgMHhiZWJmZTk4OCwgMHg2NGU0YzNmZSwgMHg5ZGJjODA1NywgMHhmMGY3YzA4NiwgMHg2MDc4N2JmOCxcbiAgICAgICAgMHg2MDAzNjA0ZCwgMHhkMWZkODM0NiwgMHhmNjM4MWZiMCwgMHg3NzQ1YWUwNCwgMHhkNzM2ZmNjYyxcbiAgICAgICAgMHg4MzQyNmIzMywgMHhmMDFlYWI3MSwgMHhiMDgwNDE4NywgMHgzYzAwNWU1ZiwgMHg3N2EwNTdiZSxcbiAgICAgICAgMHhiZGU4YWUyNCwgMHg1NTQ2NDI5OSwgMHhiZjU4MmU2MSwgMHg0ZTU4ZjQ4ZiwgMHhmMmRkZmRhMixcbiAgICAgICAgMHhmNDc0ZWYzOCwgMHg4Nzg5YmRjMiwgMHg1MzY2ZjljMywgMHhjOGIzOGU3NCwgMHhiNDc1ZjI1NSxcbiAgICAgICAgMHg0NmZjZDliOSwgMHg3YWViMjY2MSwgMHg4YjFkZGY4NCwgMHg4NDZhMGU3OSwgMHg5MTVmOTVlMixcbiAgICAgICAgMHg0NjZlNTk4ZSwgMHgyMGI0NTc3MCwgMHg4Y2Q1NTU5MSwgMHhjOTAyZGU0YywgMHhiOTBiYWNlMSxcbiAgICAgICAgMHhiYjgyMDVkMCwgMHgxMWE4NjI0OCwgMHg3NTc0YTk5ZSwgMHhiNzdmMTliNiwgMHhlMGE5ZGMwOSxcbiAgICAgICAgMHg2NjJkMDlhMSwgMHhjNDMyNDYzMywgMHhlODVhMWYwMiwgMHgwOWYwYmU4YywgMHg0YTk5YTAyNSxcbiAgICAgICAgMHgxZDZlZmUxMCwgMHgxYWI5M2QxZCwgMHgwYmE1YTRkZiwgMHhhMTg2ZjIwZiwgMHgyODY4ZjE2OSxcbiAgICAgICAgMHhkY2I3ZGE4MywgMHg1NzM5MDZmZSwgMHhhMWUyY2U5YiwgMHg0ZmNkN2Y1MiwgMHg1MDExNWUwMSxcbiAgICAgICAgMHhhNzA2ODNmYSwgMHhhMDAyYjVjNCwgMHgwZGU2ZDAyNywgMHg5YWY4OGMyNywgMHg3NzNmODY0MSxcbiAgICAgICAgMHhjMzYwNGMwNiwgMHg2MWE4MDZiNSwgMHhmMDE3N2EyOCwgMHhjMGY1ODZlMCwgMHgwMDYwNThhYSxcbiAgICAgICAgMHgzMGRjN2Q2MiwgMHgxMWU2OWVkNywgMHgyMzM4ZWE2MywgMHg1M2MyZGQ5NCwgMHhjMmMyMTYzNCxcbiAgICAgICAgMHhiYmNiZWU1NiwgMHg5MGJjYjZkZSwgMHhlYmZjN2RhMSwgMHhjZTU5MWQ3NiwgMHg2ZjA1ZTQwOSxcbiAgICAgICAgMHg0YjdjMDE4OCwgMHgzOTcyMGEzZCwgMHg3YzkyN2MyNCwgMHg4NmUzNzI1ZiwgMHg3MjRkOWRiOSxcbiAgICAgICAgMHgxYWMxNWJiNCwgMHhkMzllYjhmYywgMHhlZDU0NTU3OCwgMHgwOGZjYTViNSwgMHhkODNkN2NkMyxcbiAgICAgICAgMHg0ZGFkMGZjNCwgMHgxZTUwZWY1ZSwgMHhiMTYxZTZmOCwgMHhhMjg1MTRkOSwgMHg2YzUxMTMzYyxcbiAgICAgICAgMHg2ZmQ1YzdlNywgMHg1NmUxNGVjNCwgMHgzNjJhYmZjZSwgMHhkZGM2YzgzNywgMHhkNzlhMzIzNCxcbiAgICAgICAgMHg5MjYzODIxMiwgMHg2NzBlZmE4ZSwgMHg0MDYwMDBlMCwgMHgzYTM5Y2UzNywgMHhkM2ZhZjVjZixcbiAgICAgICAgMHhhYmMyNzczNywgMHg1YWM1MmQxYiwgMHg1Y2IwNjc5ZSwgMHg0ZmEzMzc0MiwgMHhkMzgyMjc0MCxcbiAgICAgICAgMHg5OWJjOWJiZSwgMHhkNTExOGU5ZCwgMHhiZjBmNzMxNSwgMHhkNjJkMWM3ZSwgMHhjNzAwYzQ3YixcbiAgICAgICAgMHhiNzhjMWI2YiwgMHgyMWExOTA0NSwgMHhiMjZlYjFiZSwgMHg2YTM2NmViNCwgMHg1NzQ4YWIyZixcbiAgICAgICAgMHhiYzk0NmU3OSwgMHhjNmEzNzZkMiwgMHg2NTQ5YzJjOCwgMHg1MzBmZjhlZSwgMHg0NjhkZGU3ZCxcbiAgICAgICAgMHhkNTczMGExZCwgMHg0Y2QwNGRjNiwgMHgyOTM5YmJkYiwgMHhhOWJhNDY1MCwgMHhhYzk1MjZlOCxcbiAgICAgICAgMHhiZTVlZTMwNCwgMHhhMWZhZDVmMCwgMHg2YTJkNTE5YSwgMHg2M2VmOGNlMiwgMHg5YTg2ZWUyMixcbiAgICAgICAgMHhjMDg5YzJiOCwgMHg0MzI0MmVmNiwgMHhhNTFlMDNhYSwgMHg5Y2YyZDBhNCwgMHg4M2MwNjFiYSxcbiAgICAgICAgMHg5YmU5NmE0ZCwgMHg4ZmU1MTU1MCwgMHhiYTY0NWJkNiwgMHgyODI2YTJmOSwgMHhhNzNhM2FlMSxcbiAgICAgICAgMHg0YmE5OTU4NiwgMHhlZjU1NjJlOSwgMHhjNzJmZWZkMywgMHhmNzUyZjdkYSwgMHgzZjA0NmY2OSxcbiAgICAgICAgMHg3N2ZhMGE1OSwgMHg4MGU0YTkxNSwgMHg4N2IwODYwMSwgMHg5YjA5ZTZhZCwgMHgzYjNlZTU5MyxcbiAgICAgICAgMHhlOTkwZmQ1YSwgMHg5ZTM0ZDc5NywgMHgyY2YwYjdkOSwgMHgwMjJiOGI1MSwgMHg5NmQ1YWMzYSxcbiAgICAgICAgMHgwMTdkYTY3ZCwgMHhkMWNmM2VkNiwgMHg3YzdkMmQyOCwgMHgxZjlmMjVjZiwgMHhhZGYyYjg5YixcbiAgICAgICAgMHg1YWQ2YjQ3MiwgMHg1YTg4ZjU0YywgMHhlMDI5YWM3MSwgMHhlMDE5YTVlNiwgMHg0N2IwYWNmZCxcbiAgICAgICAgMHhlZDkzZmE5YiwgMHhlOGQzYzQ4ZCwgMHgyODNiNTdjYywgMHhmOGQ1NjYyOSwgMHg3OTEzMmUyOCxcbiAgICAgICAgMHg3ODVmMDE5MSwgMHhlZDc1NjA1NSwgMHhmNzk2MGU0NCwgMHhlM2QzNWU4YywgMHgxNTA1NmRkNCxcbiAgICAgICAgMHg4OGY0NmRiYSwgMHgwM2ExNjEyNSwgMHgwNTY0ZjBiZCwgMHhjM2ViOWUxNSwgMHgzYzkwNTdhMixcbiAgICAgICAgMHg5NzI3MWFlYywgMHhhOTNhMDcyYSwgMHgxYjNmNmQ5YiwgMHgxZTYzMjFmNSwgMHhmNTljNjZmYixcbiAgICAgICAgMHgyNmRjZjMxOSwgMHg3NTMzZDkyOCwgMHhiMTU1ZmRmNSwgMHgwMzU2MzQ4MiwgMHg4YWJhM2NiYixcbiAgICAgICAgMHgyODUxNzcxMSwgMHhjMjBhZDlmOCwgMHhhYmNjNTE2NywgMHhjY2FkOTI1ZiwgMHg0ZGU4MTc1MSxcbiAgICAgICAgMHgzODMwZGM4ZSwgMHgzNzlkNTg2MiwgMHg5MzIwZjk5MSwgMHhlYTdhOTBjMiwgMHhmYjNlN2JjZSxcbiAgICAgICAgMHg1MTIxY2U2NCwgMHg3NzRmYmUzMiwgMHhhOGI2ZTM3ZSwgMHhjMzI5M2Q0NiwgMHg0OGRlNTM2OSxcbiAgICAgICAgMHg2NDEzZTY4MCwgMHhhMmFlMDgxMCwgMHhkZDZkYjIyNCwgMHg2OTg1MmRmZCwgMHgwOTA3MjE2NixcbiAgICAgICAgMHhiMzlhNDYwYSwgMHg2NDQ1YzBkZCwgMHg1ODZjZGVjZiwgMHgxYzIwYzhhZSwgMHg1YmJlZjdkZCxcbiAgICAgICAgMHgxYjU4OGQ0MCwgMHhjY2QyMDE3ZiwgMHg2YmI0ZTNiYiwgMHhkZGEyNmE3ZSwgMHgzYTU5ZmY0NSxcbiAgICAgICAgMHgzZTM1MGE0NCwgMHhiY2I0Y2RkNSwgMHg3MmVhY2VhOCwgMHhmYTY0ODRiYiwgMHg4ZDY2MTJhZSxcbiAgICAgICAgMHhiZjNjNmY0NywgMHhkMjliZTQ2MywgMHg1NDJmNWQ5ZSwgMHhhZWMyNzcxYiwgMHhmNjRlNjM3MCxcbiAgICAgICAgMHg3NDBlMGQ4ZCwgMHhlNzViMTM1NywgMHhmODcyMTY3MSwgMHhhZjUzN2Q1ZCwgMHg0MDQwY2IwOCxcbiAgICAgICAgMHg0ZWI0ZTJjYywgMHgzNGQyNDY2YSwgMHgwMTE1YWY4NCwgMHhlMWIwMDQyOCwgMHg5NTk4M2ExZCxcbiAgICAgICAgMHgwNmI4OWZiNCwgMHhjZTZlYTA0OCwgMHg2ZjNmM2I4MiwgMHgzNTIwYWI4MiwgMHgwMTFhMWQ0YixcbiAgICAgICAgMHgyNzcyMjdmOCwgMHg2MTE1NjBiMSwgMHhlNzkzM2ZkYywgMHhiYjNhNzkyYiwgMHgzNDQ1MjViZCxcbiAgICAgICAgMHhhMDg4MzllMSwgMHg1MWNlNzk0YiwgMHgyZjMyYzliNywgMHhhMDFmYmFjOSwgMHhlMDFjYzg3ZSxcbiAgICAgICAgMHhiY2M3ZDFmNiwgMHhjZjAxMTFjMywgMHhhMWU4YWFjNywgMHgxYTkwODc0OSwgMHhkNDRmYmQ5YSxcbiAgICAgICAgMHhkMGRhZGVjYiwgMHhkNTBhZGEzOCwgMHgwMzM5YzMyYSwgMHhjNjkxMzY2NywgMHg4ZGY5MzE3YyxcbiAgICAgICAgMHhlMGIxMmI0ZiwgMHhmNzllNTliNywgMHg0M2Y1YmIzYSwgMHhmMmQ1MTlmZiwgMHgyN2Q5NDU5YyxcbiAgICAgICAgMHhiZjk3MjIyYywgMHgxNWU2ZmMyYSwgMHgwZjkxZmM3MSwgMHg5Yjk0MTUyNSwgMHhmYWU1OTM2MSxcbiAgICAgICAgMHhjZWI2OWNlYiwgMHhjMmE4NjQ1OSwgMHgxMmJhYThkMSwgMHhiNmMxMDc1ZSwgMHhlMzA1NmEwYyxcbiAgICAgICAgMHgxMGQyNTA2NSwgMHhjYjAzYTQ0MiwgMHhlMGVjNmUwZSwgMHgxNjk4ZGIzYiwgMHg0Yzk4YTBiZSxcbiAgICAgICAgMHgzMjc4ZTk2NCwgMHg5ZjFmOTUzMiwgMHhlMGQzOTJkZiwgMHhkM2EwMzQyYiwgMHg4OTcxZjIxZSxcbiAgICAgICAgMHgxYjBhNzQ0MSwgMHg0YmEzMzQ4YywgMHhjNWJlNzEyMCwgMHhjMzc2MzJkOCwgMHhkZjM1OWY4ZCxcbiAgICAgICAgMHg5Yjk5MmYyZSwgMHhlNjBiNmY0NywgMHgwZmUzZjExZCwgMHhlNTRjZGE1NCwgMHgxZWRhZDg5MSxcbiAgICAgICAgMHhjZTYyNzljZiwgMHhjZDNlN2U2ZiwgMHgxNjE4YjE2NiwgMHhmZDJjMWQwNSwgMHg4NDhmZDJjNSxcbiAgICAgICAgMHhmNmZiMjI5OSwgMHhmNTIzZjM1NywgMHhhNjMyNzYyMywgMHg5M2E4MzUzMSwgMHg1NmNjY2QwMixcbiAgICAgICAgMHhhY2YwODE2MiwgMHg1YTc1ZWJiNSwgMHg2ZTE2MzY5NywgMHg4OGQyNzNjYywgMHhkZTk2NjI5MixcbiAgICAgICAgMHg4MWI5NDlkMCwgMHg0YzUwOTAxYiwgMHg3MWM2NTYxNCwgMHhlNmM2YzdiZCwgMHgzMjdhMTQwYSxcbiAgICAgICAgMHg0NWUxZDAwNiwgMHhjM2YyN2I5YSwgMHhjOWFhNTNmZCwgMHg2MmE4MGYwMCwgMHhiYjI1YmZlMixcbiAgICAgICAgMHgzNWJkZDJmNiwgMHg3MTEyNjkwNSwgMHhiMjA0MDIyMiwgMHhiNmNiY2Y3YywgMHhjZDc2OWMyYixcbiAgICAgICAgMHg1MzExM2VjMCwgMHgxNjQwZTNkMywgMHgzOGFiYmQ2MCwgMHgyNTQ3YWRmMCwgMHhiYTM4MjA5YyxcbiAgICAgICAgMHhmNzQ2Y2U3NiwgMHg3N2FmYTFjNSwgMHgyMDc1NjA2MCwgMHg4NWNiZmU0ZSwgMHg4YWU4OGRkOCxcbiAgICAgICAgMHg3YWFhZjliMCwgMHg0Y2Y5YWE3ZSwgMHgxOTQ4YzI1YywgMHgwMmZiOGE4YywgMHgwMWMzNmFlNCxcbiAgICAgICAgMHhkNmViZTFmOSwgMHg5MGQ0Zjg2OSwgMHhhNjVjZGVhMCwgMHgzZjA5MjUyZCwgMHhjMjA4ZTY5ZixcbiAgICAgICAgMHhiNzRlNjEzMiwgMHhjZTc3ZTI1YiwgMHg1NzhmZGZlMywgMHgzYWMzNzJlNlxuICAgIF07XG4gICAgdGhpcy5iZl9jcnlwdF9jaXBoZXJ0ZXh0ID0gW1xuICAgICAgICAweDRmNzI3MDY4LCAweDY1NjE2ZTQyLCAweDY1Njg2ZjZjLFxuICAgICAgICAweDY0NjU3MjUzLCAweDYzNzI3OTQ0LCAweDZmNzU2Mjc0XG4gICAgXTtcbiAgICB0aGlzLmJhc2U2NF9jb2RlID0gW1xuICAgICAgICAnLicsICcvJywgJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJyxcbiAgICAgICAgJ0onLCAnSycsICdMJywgJ00nLCAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLFxuICAgICAgICAnVycsICdYJywgJ1knLCAnWicsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsXG4gICAgICAgICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JyxcbiAgICAgICAgJ3cnLCAneCcsICd5JywgJ3onLCAnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLFxuICAgICAgICAnOSdcbiAgICBdO1xuICAgIHRoaXMuaW5kZXhfNjQgPSBbXG4gICAgICAgIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAwLCAxLFxuICAgICAgICA1NCwgNTUsIDU2LCA1NywgNTgsIDU5LCA2MCwgNjEsIDYyLCA2MywgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxNywgMTgsIDE5LCAyMCxcbiAgICAgICAgMjEsIDIyLCAyMywgMjQsIDI1LCAyNiwgMjcsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIDI4LCAyOSwgMzAsIDMxLFxuICAgICAgICAzMiwgMzMsIDM0LCAzNSwgMzYsIDM3LCAzOCwgMzksIDQwLCA0MSwgNDIsIDQzLCA0NCwgNDUsIDQ2LCA0NywgNDgsXG4gICAgICAgIDQ5LCA1MCwgNTEsIDUyLCA1MywgLTEsIC0xLCAtMSwgLTEsIC0xXG4gICAgXTtcbiAgICB0aGlzLlA7XG4gICAgdGhpcy5TO1xuICAgIHRoaXMubHI7XG4gICAgdGhpcy5vZmZwO1xufVxuYkNyeXB0LnByb3RvdHlwZS5nZXRCeXRlID0gZnVuY3Rpb24gKGMpIHtcbiAgICB2YXIgcmV0ID0gMDtcbiAgICB0cnkge1xuICAgICAgICB2YXIgYiA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBiID0gYztcbiAgICB9XG4gICAgaWYgKGIgPiAxMjcpIHtcbiAgICAgICAgcmV0dXJuIC0xMjggKyAoYiAlIDEyOCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gYjtcbiAgICB9XG59O1xuYkNyeXB0LnByb3RvdHlwZS5lbmNvZGVfYmFzZTY0ID0gZnVuY3Rpb24gKGQsIGxlbikge1xuICAgIHZhciBvZmYgPSAwO1xuICAgIHZhciBycyA9IFtdO1xuICAgIHZhciBjMTtcbiAgICB2YXIgYzI7XG4gICAgaWYgKGxlbiA8PSAwIHx8IGxlbiA+IGQubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IFwiSW52YWxpZCBsZW5cIjtcbiAgICB9XG4gICAgd2hpbGUgKG9mZiA8IGxlbikge1xuICAgICAgICBjMSA9IGRbb2ZmKytdICYgMHhmZjtcbiAgICAgICAgcnMucHVzaCh0aGlzLmJhc2U2NF9jb2RlWyhjMSA+PiAyKSAmIDB4M2ZdKTtcbiAgICAgICAgYzEgPSAoYzEgJiAweDAzKSA8PCA0O1xuICAgICAgICBpZiAob2ZmID49IGxlbikge1xuICAgICAgICAgICAgcnMucHVzaCh0aGlzLmJhc2U2NF9jb2RlW2MxICYgMHgzZl0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYzIgPSBkW29mZisrXSAmIDB4ZmY7XG4gICAgICAgIGMxIHw9IChjMiA+PiA0KSAmIDB4MGY7XG4gICAgICAgIHJzLnB1c2godGhpcy5iYXNlNjRfY29kZVtjMSAmIDB4M2ZdKTtcbiAgICAgICAgYzEgPSAoYzIgJiAweDBmKSA8PCAyO1xuICAgICAgICBpZiAob2ZmID49IGxlbikge1xuICAgICAgICAgICAgcnMucHVzaCh0aGlzLmJhc2U2NF9jb2RlW2MxICYgMHgzZl0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYzIgPSBkW29mZisrXSAmIDB4ZmY7XG4gICAgICAgIGMxIHw9IChjMiA+PiA2KSAmIDB4MDM7XG4gICAgICAgIHJzLnB1c2godGhpcy5iYXNlNjRfY29kZVtjMSAmIDB4M2ZdKTtcbiAgICAgICAgcnMucHVzaCh0aGlzLmJhc2U2NF9jb2RlW2MyICYgMHgzZl0pO1xuICAgIH1cbiAgICByZXR1cm4gcnMuam9pbignJyk7XG59O1xuYkNyeXB0LnByb3RvdHlwZS5jaGFyNjQgPSBmdW5jdGlvbiAoeCkge1xuICAgIHZhciBjb2RlID0geC5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChjb2RlIDwgMCB8fCBjb2RlID4gdGhpcy5pbmRleF82NC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbmRleF82NFtjb2RlXTtcbn07XG5iQ3J5cHQucHJvdG90eXBlLmRlY29kZV9iYXNlNjQgPSBmdW5jdGlvbiAocywgbWF4b2xlbikge1xuICAgIHZhciBvZmYgPSAwO1xuICAgIHZhciBzbGVuID0gcy5sZW5ndGg7XG4gICAgdmFyIG9sZW4gPSAwO1xuICAgIHZhciBycyA9IFtdO1xuICAgIHZhciBjMSwgYzIsIGMzLCBjNCwgbztcbiAgICBpZiAobWF4b2xlbiA8PSAwKSB7XG4gICAgICAgIHRocm93IFwiSW52YWxpZCBtYXhvbGVuXCI7XG4gICAgfVxuICAgIHdoaWxlIChvZmYgPCBzbGVuIC0gMSAmJiBvbGVuIDwgbWF4b2xlbikge1xuICAgICAgICBjMSA9IHRoaXMuY2hhcjY0KHMuY2hhckF0KG9mZisrKSk7XG4gICAgICAgIGMyID0gdGhpcy5jaGFyNjQocy5jaGFyQXQob2ZmKyspKTtcbiAgICAgICAgaWYgKGMxID09IC0xIHx8IGMyID09IC0xKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBvID0gdGhpcy5nZXRCeXRlKGMxIDw8IDIpO1xuICAgICAgICBvIHw9IChjMiAmIDB4MzApID4+IDQ7XG4gICAgICAgIHJzLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShvKSk7XG4gICAgICAgIGlmICgrK29sZW4gPj0gbWF4b2xlbiB8fCBvZmYgPj0gc2xlbikge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYzMgPSB0aGlzLmNoYXI2NChzLmNoYXJBdChvZmYrKykpO1xuICAgICAgICBpZiAoYzMgPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG8gPSB0aGlzLmdldEJ5dGUoKGMyICYgMHgwZikgPDwgNCk7XG4gICAgICAgIG8gfD0gKGMzICYgMHgzYykgPj4gMjtcbiAgICAgICAgcnMucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKG8pKTtcbiAgICAgICAgaWYgKCsrb2xlbiA+PSBtYXhvbGVuIHx8IG9mZiA+PSBzbGVuKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjNCA9IHRoaXMuY2hhcjY0KHMuY2hhckF0KG9mZisrKSk7XG4gICAgICAgIG8gPSB0aGlzLmdldEJ5dGUoKGMzICYgMHgwMykgPDwgNik7XG4gICAgICAgIG8gfD0gYzQ7XG4gICAgICAgIHJzLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShvKSk7XG4gICAgICAgICsrb2xlbjtcbiAgICB9XG4gICAgdmFyIHJldCA9IFtdO1xuICAgIGZvciAob2ZmID0gMDsgb2ZmIDwgb2xlbjsgb2ZmKyspIHtcbiAgICAgICAgcmV0LnB1c2godGhpcy5nZXRCeXRlKHJzW29mZl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn07XG5iQ3J5cHQucHJvdG90eXBlLmVuY2lwaGVyID0gZnVuY3Rpb24gKGxyLCBvZmYpIHtcbiAgICB2YXIgaTtcbiAgICB2YXIgbjtcbiAgICB2YXIgbCA9IGxyW29mZl07XG4gICAgdmFyIHIgPSBscltvZmYgKyAxXTtcbiAgICBsIF49IHRoaXMuUFswXTtcbiAgICBmb3IgKGkgPSAwOyBpIDw9IHRoaXMuQkxPV0ZJU0hfTlVNX1JPVU5EUyAtIDI7KSB7XG4gICAgICAgIC8vIEZlaXN0ZWwgc3Vic3RpdHV0aW9uIG9uIGxlZnQgd29yZFxuICAgICAgICBuID0gdGhpcy5TWyhsID4+IDI0KSAmIDB4ZmZdO1xuICAgICAgICBuICs9IHRoaXMuU1sweDEwMCB8ICgobCA+PiAxNikgJiAweGZmKV07XG4gICAgICAgIG4gXj0gdGhpcy5TWzB4MjAwIHwgKChsID4+IDgpICYgMHhmZildO1xuICAgICAgICBuICs9IHRoaXMuU1sweDMwMCB8IChsICYgMHhmZildO1xuICAgICAgICByIF49IG4gXiB0aGlzLlBbKytpXTtcbiAgICAgICAgLy8gRmVpc3RlbCBzdWJzdGl0dXRpb24gb24gcmlnaHQgd29yZFxuICAgICAgICBuID0gdGhpcy5TWyhyID4+IDI0KSAmIDB4ZmZdO1xuICAgICAgICBuICs9IHRoaXMuU1sweDEwMCB8ICgociA+PiAxNikgJiAweGZmKV07XG4gICAgICAgIG4gXj0gdGhpcy5TWzB4MjAwIHwgKChyID4+IDgpICYgMHhmZildO1xuICAgICAgICBuICs9IHRoaXMuU1sweDMwMCB8IChyICYgMHhmZildO1xuICAgICAgICBsIF49IG4gXiB0aGlzLlBbKytpXTtcbiAgICB9XG4gICAgbHJbb2ZmXSA9IHIgXiB0aGlzLlBbdGhpcy5CTE9XRklTSF9OVU1fUk9VTkRTICsgMV07XG4gICAgbHJbb2ZmICsgMV0gPSBsO1xufTtcbmJDcnlwdC5wcm90b3R5cGUuc3RyZWFtdG93b3JkID0gZnVuY3Rpb24gKGRhdGEsIG9mZnApIHtcbiAgICB2YXIgaTtcbiAgICB2YXIgd29yZCA9IDA7XG4gICAgdmFyIG9mZiA9IG9mZnA7XG4gICAgZm9yIChpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICB3b3JkID0gKHdvcmQgPDwgOCkgfCAoZGF0YVtvZmZdICYgMHhmZik7XG4gICAgICAgIG9mZiA9IChvZmYgKyAxKSAlIGRhdGEubGVuZ3RoO1xuICAgIH1cbiAgICB0aGlzLm9mZnAgPSBvZmY7XG4gICAgcmV0dXJuIHdvcmQ7XG59O1xuYkNyeXB0LnByb3RvdHlwZS5pbml0X2tleSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLlAgPSB0aGlzLlBfb3JpZy5zbGljZSgpO1xuICAgIHRoaXMuUyA9IHRoaXMuU19vcmlnLnNsaWNlKCk7XG59O1xuYkNyeXB0LnByb3RvdHlwZS5rZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGk7XG4gICAgdGhpcy5vZmZwID0gMDtcbiAgICB2YXIgbHIgPSBuZXcgQXJyYXkoMHgwMDAwMDAwMCwgMHgwMDAwMDAwMCk7XG4gICAgdmFyIHBsZW4gPSB0aGlzLlAubGVuZ3RoO1xuICAgIHZhciBzbGVuID0gdGhpcy5TLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcGxlbjsgaSsrKSB7XG4gICAgICAgIHRoaXMuUFtpXSA9IHRoaXMuUFtpXSBeIHRoaXMuc3RyZWFtdG93b3JkKGtleSwgdGhpcy5vZmZwKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IHBsZW47IGkgKz0gMikge1xuICAgICAgICB0aGlzLmVuY2lwaGVyKGxyLCAwKTtcbiAgICAgICAgdGhpcy5QW2ldID0gbHJbMF07XG4gICAgICAgIHRoaXMuUFtpICsgMV0gPSBsclsxXTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IHNsZW47IGkgKz0gMikge1xuICAgICAgICB0aGlzLmVuY2lwaGVyKGxyLCAwKTtcbiAgICAgICAgdGhpcy5TW2ldID0gbHJbMF07XG4gICAgICAgIHRoaXMuU1tpICsgMV0gPSBsclsxXTtcbiAgICB9XG59O1xuYkNyeXB0LnByb3RvdHlwZS5la3NrZXkgPSBmdW5jdGlvbiAoZGF0YSwga2V5KSB7XG4gICAgdmFyIGk7XG4gICAgdGhpcy5vZmZwID0gMDtcbiAgICB2YXIgbHIgPSBuZXcgQXJyYXkoMHgwMDAwMDAwMCwgMHgwMDAwMDAwMCk7XG4gICAgdmFyIHBsZW4gPSB0aGlzLlAubGVuZ3RoO1xuICAgIHZhciBzbGVuID0gdGhpcy5TLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcGxlbjsgaSsrKVxuICAgICAgICB0aGlzLlBbaV0gPSB0aGlzLlBbaV0gXiB0aGlzLnN0cmVhbXRvd29yZChrZXksIHRoaXMub2ZmcCk7XG4gICAgdGhpcy5vZmZwID0gMDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcGxlbjsgaSArPSAyKSB7XG4gICAgICAgIGxyWzBdIF49IHRoaXMuc3RyZWFtdG93b3JkKGRhdGEsIHRoaXMub2ZmcCk7XG4gICAgICAgIGxyWzFdIF49IHRoaXMuc3RyZWFtdG93b3JkKGRhdGEsIHRoaXMub2ZmcCk7XG4gICAgICAgIHRoaXMuZW5jaXBoZXIobHIsIDApO1xuICAgICAgICB0aGlzLlBbaV0gPSBsclswXTtcbiAgICAgICAgdGhpcy5QW2kgKyAxXSA9IGxyWzFdO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgc2xlbjsgaSArPSAyKSB7XG4gICAgICAgIGxyWzBdIF49IHRoaXMuc3RyZWFtdG93b3JkKGRhdGEsIHRoaXMub2ZmcCk7XG4gICAgICAgIGxyWzFdIF49IHRoaXMuc3RyZWFtdG93b3JkKGRhdGEsIHRoaXMub2ZmcCk7XG4gICAgICAgIHRoaXMuZW5jaXBoZXIobHIsIDApO1xuICAgICAgICB0aGlzLlNbaV0gPSBsclswXTtcbiAgICAgICAgdGhpcy5TW2kgKyAxXSA9IGxyWzFdO1xuICAgIH1cbn07XG4vLyByZW1vdmVkIGFyZ3VtZW50cy5jYWxsZWUgZnJvbSBvcmlnaW5hbCB2ZXJzaW9uIGJlY2F1c2UgaXQgaXMgbm90IGFsbG93ZWQgaW4gc3RyaWN0IG1vZGVcbmJDcnlwdC5wcm90b3R5cGUuY3J5cHRfcmF3ID0gZnVuY3Rpb24gKHBhc3N3b3JkLCBzYWx0LCBsb2dfcm91bmRzKSB7XG4gICAgdmFyIHJvdW5kcztcbiAgICB2YXIgajtcbiAgICB2YXIgY2RhdGEgPSB0aGlzLmJmX2NyeXB0X2NpcGhlcnRleHQuc2xpY2UoKTtcbiAgICB2YXIgY2xlbiA9IGNkYXRhLmxlbmd0aDtcbiAgICB2YXIgb25lX3BlcmNlbnQ7XG4gICAgaWYgKGxvZ19yb3VuZHMgPCA0IHx8IGxvZ19yb3VuZHMgPiAzMSkge1xuICAgICAgICB0aHJvdyBcIkJhZCBudW1iZXIgb2Ygcm91bmRzXCI7XG4gICAgfVxuICAgIGlmIChzYWx0Lmxlbmd0aCAhPSB0aGlzLkJDUllQVF9TQUxUX0xFTikge1xuICAgICAgICB0aHJvdyBcIkJhZCBfc2FsdCBsZW5ndGhcIjtcbiAgICB9XG4gICAgcm91bmRzID0gMSA8PCBsb2dfcm91bmRzO1xuICAgIG9uZV9wZXJjZW50ID0gTWF0aC5mbG9vcihyb3VuZHMgLyAxMDApICsgMTtcbiAgICB0aGlzLmluaXRfa2V5KCk7XG4gICAgdGhpcy5la3NrZXkoc2FsdCwgcGFzc3dvcmQpO1xuICAgIHZhciBvYmogPSB0aGlzO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgcm91bmRGdW5jdGlvbiA9IG51bGw7XG4gICAgcm91bmRGdW5jdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGkgPCByb3VuZHMpIHtcbiAgICAgICAgICAgIHZhciBzdGFydCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IHJvdW5kczspIHtcbiAgICAgICAgICAgICAgICBpID0gaSArIDE7XG4gICAgICAgICAgICAgICAgb2JqLmtleShwYXNzd29yZCk7XG4gICAgICAgICAgICAgICAgb2JqLmtleShzYWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByb3VuZEZ1bmN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNjQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCAoY2xlbiA+PiAxKTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5lbmNpcGhlcihjZGF0YSwgaiA8PCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmV0ID0gW107XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2xlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2gob2JqLmdldEJ5dGUoKGNkYXRhW2ldID4+IDI0KSAmIDB4ZmYpKTtcbiAgICAgICAgICAgICAgICByZXQucHVzaChvYmouZ2V0Qnl0ZSgoY2RhdGFbaV0gPj4gMTYpICYgMHhmZikpO1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKG9iai5nZXRCeXRlKChjZGF0YVtpXSA+PiA4KSAmIDB4ZmYpKTtcbiAgICAgICAgICAgICAgICByZXQucHVzaChvYmouZ2V0Qnl0ZShjZGF0YVtpXSAmIDB4ZmYpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiByb3VuZEZ1bmN0aW9uKCk7XG59O1xuZXhwb3J0IGRlZmF1bHQgYkNyeXB0O1xuIiwiZXhwb3J0IHZhciBLZXlMZW5ndGg7XG4oZnVuY3Rpb24gKEtleUxlbmd0aCkge1xuICAgIEtleUxlbmd0aFtcImIxMjhcIl0gPSBcIjEyOFwiO1xuICAgIEtleUxlbmd0aFtcImIyNTZcIl0gPSBcIjI1NlwiO1xufSkoS2V5TGVuZ3RoIHx8IChLZXlMZW5ndGggPSB7fSkpO1xuIiwiLy8gQHRzLWlnbm9yZVt1bnR5cGVkLWltcG9ydF1cbmltcG9ydCBiQ3J5cHQgZnJvbSBcIi4uL2ludGVybmFsL2JDcnlwdC5qc1wiO1xuaW1wb3J0IHsgcmFuZG9tIH0gZnJvbSBcIi4uL3JhbmRvbS9SYW5kb21pemVyLmpzXCI7XG5pbXBvcnQgeyBzdHJpbmdUb1V0ZjhVaW50OEFycmF5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiO1xuaW1wb3J0IHsgdWludDhBcnJheVRvQml0QXJyYXkgfSBmcm9tIFwiLi4vbWlzYy9VdGlscy5qc1wiO1xuaW1wb3J0IHsgS2V5TGVuZ3RoIH0gZnJvbSBcIi4uL21pc2MvQ29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgeyBDcnlwdG9FcnJvciB9IGZyb20gXCIuLi9taXNjL0NyeXB0b0Vycm9yLmpzXCI7XG5pbXBvcnQgeyBzaGEyNTZIYXNoIH0gZnJvbSBcIi4vU2hhMjU2LmpzXCI7XG5jb25zdCBsb2dSb3VuZHMgPSA4OyAvLyBwYmtkZjIgbnVtYmVyIG9mIGl0ZXJhdGlvbnNcbi8qKlxuICogQ3JlYXRlIGEgMTI4IGJpdCByYW5kb20gX3NhbHQgdmFsdWUuXG4gKiByZXR1cm4gX3NhbHQgMTI4IGJpdCBvZiByYW5kb20gZGF0YSwgZW5jb2RlZCBhcyBhIGhleCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVJhbmRvbVNhbHQoKSB7XG4gICAgcmV0dXJuIHJhbmRvbS5nZW5lcmF0ZVJhbmRvbURhdGEoMTI4IC8gOCk7XG59XG4vKipcbiAqIENyZWF0ZSBhIDEyOCBiaXQgc3ltbWV0cmljIGtleSBmcm9tIHRoZSBnaXZlbiBwYXNzcGhyYXNlLlxuICogQHBhcmFtIHBhc3NwaHJhc2UgVGhlIHBhc3NwaHJhc2UgdG8gdXNlIGZvciBrZXkgZ2VuZXJhdGlvbiBhcyB1dGY4IHN0cmluZy5cbiAqIEBwYXJhbSBzYWx0IDE2IGJ5dGVzIG9mIHJhbmRvbSBkYXRhXG4gKiBAcGFyYW0ga2V5TGVuZ3RoVHlwZSBEZWZpbmVzIHRoZSBsZW5ndGggb2YgdGhlIGtleSB0aGF0IHNoYWxsIGJlIGdlbmVyYXRlZC5cbiAqIEByZXR1cm4gcmVzb2x2ZWQgd2l0aCB0aGUga2V5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUtleUZyb21QYXNzcGhyYXNlKHBhc3NwaHJhc2UsIHNhbHQsIGtleUxlbmd0aFR5cGUpIHtcbiAgICAvLyBoYXNoIHRoZSBwYXNzd29yZCBmaXJzdCB0byBhdm9pZCBsb2dpbiB3aXRoIG11bHRpcGxlcyBvZiBhIHBhc3N3b3JkLCBpLmUuIFwiaGVsbG9cIiBhbmQgXCJoZWxsb2hlbGxvXCIgcHJvZHVjZSB0aGUgc2FtZSBrZXkgaWYgdGhlIHNhbWUgX3NhbHQgaXMgdXNlZFxuICAgIGxldCBwYXNzcGhyYXNlQnl0ZXMgPSBzaGEyNTZIYXNoKHN0cmluZ1RvVXRmOFVpbnQ4QXJyYXkocGFzc3BocmFzZSkpO1xuICAgIGxldCBieXRlcyA9IGNyeXB0X3JhdyhwYXNzcGhyYXNlQnl0ZXMsIHNhbHQsIGxvZ1JvdW5kcyk7XG4gICAgaWYgKGtleUxlbmd0aFR5cGUgPT09IEtleUxlbmd0aC5iMTI4KSB7XG4gICAgICAgIHJldHVybiB1aW50OEFycmF5VG9CaXRBcnJheShieXRlcy5zbGljZSgwLCAxNikpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVpbnQ4QXJyYXlUb0JpdEFycmF5KHNoYTI1Nkhhc2goYnl0ZXMpKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcnlwdF9yYXcocGFzc3BocmFzZUJ5dGVzLCBzYWx0Qnl0ZXMsIGxvZ1JvdW5kcykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBfc2lnbmVkQnl0ZXNUb1VpbnQ4QXJyYXkobmV3IGJDcnlwdCgpLmNyeXB0X3JhdyhfdWludDhBcnJheVRvU2lnbmVkQnl0ZXMocGFzc3BocmFzZUJ5dGVzKSwgX3VpbnQ4QXJyYXlUb1NpZ25lZEJ5dGVzKHNhbHRCeXRlcyksIGxvZ1JvdW5kcykpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBjb25zdCBlcnJvciA9IGU7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihlcnJvci5tZXNzYWdlLCBlcnJvcik7XG4gICAgfVxufVxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBzaWduZWQgYnl0ZSB2YWx1ZXMgKC0xMjggdG8gMTI3KSB0byBhbiBVaW50OEFycmF5ICh2YWx1ZXMgMCB0byAyNTUpLlxuICogQHBhcmFtIHNpZ25lZEJ5dGVzIFRoZSBzaWduZWQgYnl0ZSB2YWx1ZXMuXG4gKiBAcmV0dXJuIFRoZSB1bnNpZ25lZCBieXRlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gX3NpZ25lZEJ5dGVzVG9VaW50OEFycmF5KHNpZ25lZEJ5dGVzKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KG5ldyBJbnQ4QXJyYXkoc2lnbmVkQnl0ZXMpKTtcbn1cbi8qKlxuICogQ29udmVydHMgYW4gdWludDhBcnJheSAodmFsdWUgMCB0byAyNTUpIHRvIGFuIEFycmF5IHdpdGggdW5zaWduZWQgYnl0ZXMgKC0xMjggdG8gMTI3KS5cbiAqIEBwYXJhbSB1bnNpZ25lZEJ5dGVzIFRoZSB1bnNpZ25lZCBieXRlIHZhbHVlcy5cbiAqIEByZXR1cm4gVGhlIHNpZ25lZCBieXRlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gX3VpbnQ4QXJyYXlUb1NpZ25lZEJ5dGVzKHVuc2lnbmVkQnl0ZXMpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgVWludDhBcnJheShuZXcgSW50OEFycmF5KHVuc2lnbmVkQnl0ZXMpKSk7XG59XG4iLCJpbXBvcnQgeyBjYWxsV2ViQXNzZW1ibHlGdW5jdGlvbldpdGhBcmd1bWVudHMsIG11dGFibGVTZWN1cmVGcmVlLCBzZWN1cmVGcmVlIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiO1xuaW1wb3J0IHsgQ3J5cHRvRXJyb3IgfSBmcm9tIFwiLi4vLi4vbWlzYy9DcnlwdG9FcnJvci5qc1wiO1xuLyoqXG4gKiBOdW1iZXIgb2YgcmFuZG9tIGJ5dGVzIHJlcXVpcmVkIGZvciBhIEt5YmVyIG9wZXJhdGlvblxuICovXG5leHBvcnQgY29uc3QgTUxfS0VNX1JBTkRfQU1PVU5UX09GX0VOVFJPUFkgPSA2NDtcbmNvbnN0IE1MX0tFTV8xMDI0X0FMR09SSVRITSA9IFwiTUwtS0VNLTEwMjRcIjtcbmNvbnN0IEtZQkVSX0sgPSA0O1xuY29uc3QgS1lCRVJfUE9MWUJZVEVTID0gMzg0O1xuZXhwb3J0IGNvbnN0IEtZQkVSX1BPTFlWRUNCWVRFUyA9IEtZQkVSX0sgKiBLWUJFUl9QT0xZQllURVM7XG5leHBvcnQgY29uc3QgS1lCRVJfU1lNQllURVMgPSAzMjtcbmNvbnN0IE9RU19LRU1fbWxfa2VtXzEwMjRfbGVuZ3RoX3B1YmxpY19rZXkgPSAxNTY4O1xuY29uc3QgT1FTX0tFTV9tbF9rZW1fMTAyNF9sZW5ndGhfc2VjcmV0X2tleSA9IDMxNjg7XG5jb25zdCBPUVNfS0VNX21sX2tlbV8xMDI0X2xlbmd0aF9jaXBoZXJ0ZXh0ID0gMTU2ODtcbmNvbnN0IE9RU19LRU1fbWxfa2VtXzEwMjRfbGVuZ3RoX3NoYXJlZF9zZWNyZXQgPSAzMjtcbi8qKlxuICogQHJldHVybnMgYSBuZXcgcmFuZG9tIGt5YmVyIGtleSBwYWlyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVLZXlQYWlyKGt5YmVyV2FzbSwgcmFuZG9taXplcikge1xuICAgIGNvbnN0IE9RU19LRU0gPSBjcmVhdGVLZW0oa3liZXJXYXNtKTtcbiAgICB0cnkge1xuICAgICAgICBmaWxsRW50cm9weVBvb2woa3liZXJXYXNtLCByYW5kb21pemVyKTtcbiAgICAgICAgY29uc3QgcHVibGljS2V5ID0gbmV3IFVpbnQ4QXJyYXkoT1FTX0tFTV9tbF9rZW1fMTAyNF9sZW5ndGhfcHVibGljX2tleSk7XG4gICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBuZXcgVWludDhBcnJheShPUVNfS0VNX21sX2tlbV8xMDI0X2xlbmd0aF9zZWNyZXRfa2V5KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY2FsbFdlYkFzc2VtYmx5RnVuY3Rpb25XaXRoQXJndW1lbnRzKGt5YmVyV2FzbS5PUVNfS0VNX2tleXBhaXIsIGt5YmVyV2FzbSwgT1FTX0tFTSwgbXV0YWJsZVNlY3VyZUZyZWUocHVibGljS2V5KSwgbXV0YWJsZVNlY3VyZUZyZWUocHJpdmF0ZUtleSkpO1xuICAgICAgICBpZiAocmVzdWx0ICE9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgT1FTX0tFTV9rZXlwYWlyIHJldHVybmVkICR7cmVzdWx0fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwdWJsaWNLZXk6IHsgcmF3OiBwdWJsaWNLZXkgfSxcbiAgICAgICAgICAgIHByaXZhdGVLZXk6IHsgcmF3OiBwcml2YXRlS2V5IH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBmcmVlS2VtKGt5YmVyV2FzbSwgT1FTX0tFTSk7XG4gICAgfVxufVxuLyoqXG4gKiBAcGFyYW0ga3liZXJXYXNtIHRoZSBXZWJBc3NlbWJseS9Kc0ZhbGxiYWNrIG1vZHVsZSB0aGF0IGltcGxlbWVudHMgb3VyIGt5YmVyIHByaW1pdGl2ZXMgKGxpYm9xcylcbiAqIEBwYXJhbSBwdWJsaWNLZXkgdGhlIHB1YmxpYyBrZXkgdG8gZW5jYXBzdWxhdGUgd2l0aFxuICogQHBhcmFtIHJhbmRvbWl6ZXIgb3VyIHJhbmRvbWl6ZXIgdGhhdCBpcyB1c2VkIHRvIHRoZSBuYXRpdmUgbGlicmFyeSB3aXRoIGVudHJvcHlcbiAqIEByZXR1cm4gdGhlIHBsYWludGV4dCBzZWNyZXQga2V5IGFuZCB0aGUgZW5jYXBzdWxhdGVkIGtleSBmb3IgdXNlIHdpdGggQUVTIG9yIGFzIGlucHV0IHRvIGEgS0RGXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNhcHN1bGF0ZShreWJlcldhc20sIHB1YmxpY0tleSwgcmFuZG9taXplcikge1xuICAgIGlmIChwdWJsaWNLZXkucmF3Lmxlbmd0aCAhPSBPUVNfS0VNX21sX2tlbV8xMDI0X2xlbmd0aF9wdWJsaWNfa2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihgSW52YWxpZCBwdWJsaWMga2V5IGxlbmd0aDsgZXhwZWN0ZWQgJHtPUVNfS0VNX21sX2tlbV8xMDI0X2xlbmd0aF9wdWJsaWNfa2V5fSwgZ290ICR7cHVibGljS2V5LnJhdy5sZW5ndGh9YCk7XG4gICAgfVxuICAgIGNvbnN0IE9RU19LRU0gPSBjcmVhdGVLZW0oa3liZXJXYXNtKTtcbiAgICB0cnkge1xuICAgICAgICBmaWxsRW50cm9weVBvb2woa3liZXJXYXNtLCByYW5kb21pemVyKTtcbiAgICAgICAgY29uc3QgY2lwaGVydGV4dCA9IG5ldyBVaW50OEFycmF5KE9RU19LRU1fbWxfa2VtXzEwMjRfbGVuZ3RoX2NpcGhlcnRleHQpO1xuICAgICAgICBjb25zdCBzaGFyZWRTZWNyZXQgPSBuZXcgVWludDhBcnJheShPUVNfS0VNX21sX2tlbV8xMDI0X2xlbmd0aF9zaGFyZWRfc2VjcmV0KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY2FsbFdlYkFzc2VtYmx5RnVuY3Rpb25XaXRoQXJndW1lbnRzKGt5YmVyV2FzbS5UVVRBX0tFTV9lbmNhcHMsIGt5YmVyV2FzbSwgT1FTX0tFTSwgbXV0YWJsZVNlY3VyZUZyZWUoY2lwaGVydGV4dCksIG11dGFibGVTZWN1cmVGcmVlKHNoYXJlZFNlY3JldCksIG11dGFibGVTZWN1cmVGcmVlKHB1YmxpY0tleS5yYXcpKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRVVEFfS0VNX2VuY2FwcyByZXR1cm5lZCAke3Jlc3VsdH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBjaXBoZXJ0ZXh0LCBzaGFyZWRTZWNyZXQgfTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGZyZWVLZW0oa3liZXJXYXNtLCBPUVNfS0VNKTtcbiAgICB9XG59XG4vKipcbiAqIEBwYXJhbSBreWJlcldhc20gdGhlIFdlYkFzc2VtYmx5L0pzRmFsbGJhY2sgbW9kdWxlIHRoYXQgaW1wbGVtZW50cyBvdXIga3liZXIgcHJpbWl0aXZlcyAobGlib3FzKVxuICogQHBhcmFtIHByaXZhdGVLZXkgICAgICB0aGUgY29ycmVzcG9uZGluZyBwcml2YXRlIGtleSBvZiB0aGUgcHVibGljIGtleSB3aXRoIHdoaWNoIHRoZSBlbmNhcHN1bGF0ZWRLZXkgd2FzIGVuY2Fwc3VsYXRlZCB3aXRoXG4gKiBAcGFyYW0gY2lwaGVydGV4dCB0aGUgY2lwaGVydGV4dCBvdXRwdXQgb2YgZW5jYXBzdWxhdGUoKVxuICogQHJldHVybiB0aGUgcGxhaW50ZXh0IHNlY3JldCBrZXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY2Fwc3VsYXRlKGt5YmVyV2FzbSwgcHJpdmF0ZUtleSwgY2lwaGVydGV4dCkge1xuICAgIGlmIChwcml2YXRlS2V5LnJhdy5sZW5ndGggIT0gT1FTX0tFTV9tbF9rZW1fMTAyNF9sZW5ndGhfc2VjcmV0X2tleSkge1xuICAgICAgICB0aHJvdyBuZXcgQ3J5cHRvRXJyb3IoYEludmFsaWQgcHJpdmF0ZSBrZXkgbGVuZ3RoOyBleHBlY3RlZCAke09RU19LRU1fbWxfa2VtXzEwMjRfbGVuZ3RoX3NlY3JldF9rZXl9LCBnb3QgJHtwcml2YXRlS2V5LnJhdy5sZW5ndGh9YCk7XG4gICAgfVxuICAgIGlmIChjaXBoZXJ0ZXh0Lmxlbmd0aCAhPSBPUVNfS0VNX21sX2tlbV8xMDI0X2xlbmd0aF9jaXBoZXJ0ZXh0KSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihgSW52YWxpZCBjaXBoZXJ0ZXh0IGxlbmd0aDsgZXhwZWN0ZWQgJHtPUVNfS0VNX21sX2tlbV8xMDI0X2xlbmd0aF9jaXBoZXJ0ZXh0fSwgZ290ICR7Y2lwaGVydGV4dC5sZW5ndGh9YCk7XG4gICAgfVxuICAgIGNvbnN0IE9RU19LRU0gPSBjcmVhdGVLZW0oa3liZXJXYXNtKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzaGFyZWRTZWNyZXQgPSBuZXcgVWludDhBcnJheShPUVNfS0VNX21sX2tlbV8xMDI0X2xlbmd0aF9zaGFyZWRfc2VjcmV0KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY2FsbFdlYkFzc2VtYmx5RnVuY3Rpb25XaXRoQXJndW1lbnRzKGt5YmVyV2FzbS5UVVRBX0tFTV9kZWNhcHMsIGt5YmVyV2FzbSwgT1FTX0tFTSwgbXV0YWJsZVNlY3VyZUZyZWUoc2hhcmVkU2VjcmV0KSwgc2VjdXJlRnJlZShjaXBoZXJ0ZXh0KSwgc2VjdXJlRnJlZShwcml2YXRlS2V5LnJhdykpO1xuICAgICAgICBpZiAocmVzdWx0ICE9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVFVUQV9LRU1fZGVjYXBzIHJldHVybmVkICR7cmVzdWx0fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzaGFyZWRTZWNyZXQ7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBmcmVlS2VtKGt5YmVyV2FzbSwgT1FTX0tFTSk7XG4gICAgfVxufVxuZnVuY3Rpb24gZnJlZUtlbShreWJlcldhc20sIE9RU19LRU0pIHtcbiAgICBjYWxsV2ViQXNzZW1ibHlGdW5jdGlvbldpdGhBcmd1bWVudHMoa3liZXJXYXNtLk9RU19LRU1fZnJlZSwga3liZXJXYXNtLCBPUVNfS0VNKTtcbn1cbi8vIFRoZSByZXR1cm5lZCBwb2ludGVyIG5lZWRzIHRvIGJlIGZyZWVkIG9uY2Ugbm90IG5lZWRlZCBhbnltb3JlIGJ5IHRoZSBjYWxsZXJcbmZ1bmN0aW9uIGNyZWF0ZUtlbShreWJlcldhc20pIHtcbiAgICByZXR1cm4gY2FsbFdlYkFzc2VtYmx5RnVuY3Rpb25XaXRoQXJndW1lbnRzKGt5YmVyV2FzbS5PUVNfS0VNX25ldywga3liZXJXYXNtLCBNTF9LRU1fMTAyNF9BTEdPUklUSE0pO1xufVxuLy8gQWRkIGJ5dGVzIGV4dGVybmFsbHkgdG8gdGhlIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yXG5mdW5jdGlvbiBmaWxsRW50cm9weVBvb2woZXhwb3J0cywgcmFuZG9taXplcikge1xuICAgIGNvbnN0IGVudHJvcHlBbW91bnQgPSByYW5kb21pemVyLmdlbmVyYXRlUmFuZG9tRGF0YShNTF9LRU1fUkFORF9BTU9VTlRfT0ZfRU5UUk9QWSk7XG4gICAgY29uc3QgcmVtYWluaW5nID0gY2FsbFdlYkFzc2VtYmx5RnVuY3Rpb25XaXRoQXJndW1lbnRzKGV4cG9ydHMuVFVUQV9pbmplY3RfZW50cm9weSwgZXhwb3J0cywgZW50cm9weUFtb3VudCwgZW50cm9weUFtb3VudC5sZW5ndGgpO1xuICAgIGlmIChyZW1haW5pbmcgPCAwKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgdHJpZWQgdG8gY29weSB0b28gbXVjaCBlbnRyb3B5OiBvdmVyZmxvd2VkIHdpdGggJHstcmVtYWluaW5nfSBieXRlczsgZml4IFJBTkRfQU1PVU5UX09GX0VOVFJPUFkvZ2VuZXJhdGVSYW5kb21EYXRhIHRvIHNpbGVuY2UgdGhpc2ApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGJ5dGVBcnJheXNUb0J5dGVzLCBieXRlc1RvQnl0ZUFycmF5cywgY29uY2F0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiO1xuaW1wb3J0IHsgS1lCRVJfUE9MWVZFQ0JZVEVTLCBLWUJFUl9TWU1CWVRFUyB9IGZyb20gXCIuL0t5YmVyLmpzXCI7XG4vKipcbiAqIEVuY29kZXMgdGhlIGt5YmVyIHByaXZhdGUga2V5IGludG8gYSBieXRlIGFycmF5IGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0LlxuICogfCBsZW5ndGggKDIgQnl0ZSkgfCBwcml2YXRlS2V5LlMgKG4gQnl0ZSkgICB8XG4gKiB8IGxlbmd0aCAoMiBCeXRlKSB8IHByaXZhdGVLZXkuSFBLIChuIEJ5dGUpIHxcbiAqIHwgbGVuZ3RoICgyIEJ5dGUpIHwgcHJpdmF0ZUtleS5Ob25jZSAobiBCeXRlKSB8XG4gKiB8IGxlbmd0aCAoMiBCeXRlKSB8IHByaXZhdGVLZXkuVCAobiBCeXRlKSB8XG4gKiB8IGxlbmd0aCAoMiBCeXRlKSB8IHByaXZhdGVLZXkuUmhvIChuIEJ5dGUpIHxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGt5YmVyUHJpdmF0ZUtleVRvQnl0ZXMoa2V5KSB7XG4gICAgY29uc3Qga2V5Qnl0ZXMgPSBrZXkucmF3O1xuICAgIC8vbGlib3FzOiBzLCB0LCByaG8sIGhwaywgbm9uY2VcbiAgICAvL3R1dGEgZW5jb2RlZDogcywgaHBrLCBub25jZSwgdCwgcmhvXG4gICAgY29uc3QgcyA9IGtleUJ5dGVzLnNsaWNlKDAsIEtZQkVSX1BPTFlWRUNCWVRFUyk7XG4gICAgY29uc3QgdCA9IGtleUJ5dGVzLnNsaWNlKEtZQkVSX1BPTFlWRUNCWVRFUywgMiAqIEtZQkVSX1BPTFlWRUNCWVRFUyk7XG4gICAgY29uc3QgcmhvID0ga2V5Qnl0ZXMuc2xpY2UoMiAqIEtZQkVSX1BPTFlWRUNCWVRFUywgMiAqIEtZQkVSX1BPTFlWRUNCWVRFUyArIEtZQkVSX1NZTUJZVEVTKTtcbiAgICBjb25zdCBocGsgPSBrZXlCeXRlcy5zbGljZSgyICogS1lCRVJfUE9MWVZFQ0JZVEVTICsgS1lCRVJfU1lNQllURVMsIDIgKiBLWUJFUl9QT0xZVkVDQllURVMgKyAyICogS1lCRVJfU1lNQllURVMpO1xuICAgIGNvbnN0IG5vbmNlID0ga2V5Qnl0ZXMuc2xpY2UoMiAqIEtZQkVSX1BPTFlWRUNCWVRFUyArIDIgKiBLWUJFUl9TWU1CWVRFUywgMiAqIEtZQkVSX1BPTFlWRUNCWVRFUyArIDMgKiBLWUJFUl9TWU1CWVRFUyk7XG4gICAgcmV0dXJuIGJ5dGVBcnJheXNUb0J5dGVzKFtzLCBocGssIG5vbmNlLCB0LCByaG9dKTtcbn1cbi8qKlxuICogRW5jb2RlcyB0aGUga3liZXIgcHVibGljIGtleSBpbnRvIGEgYnl0ZSBhcnJheSBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdC5cbiAqIHwgbGVuZ3RoICgyIEJ5dGUpIHwgcHVibGljS2V5LlQgKG4gQnl0ZSkgIHxcbiAqIHwgbGVuZ3RoICgyIEJ5dGUpIHwgcHVibGljS2V5LlJobyAobiBCeXRlKSB8XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBreWJlclB1YmxpY0tleVRvQnl0ZXMoa2V5KSB7XG4gICAgY29uc3Qga2V5Qnl0ZXMgPSBrZXkucmF3O1xuICAgIGNvbnN0IHQgPSBrZXlCeXRlcy5zbGljZSgwLCBLWUJFUl9QT0xZVkVDQllURVMpO1xuICAgIGNvbnN0IHJobyA9IGtleUJ5dGVzLnNsaWNlKEtZQkVSX1BPTFlWRUNCWVRFUywgS1lCRVJfUE9MWVZFQ0JZVEVTICsgS1lCRVJfU1lNQllURVMpO1xuICAgIHJldHVybiBieXRlQXJyYXlzVG9CeXRlcyhbdCwgcmhvXSk7XG59XG4vKipcbiAqIEludmVyc2Ugb2YgcHVibGljS2V5VG9CeXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0t5YmVyUHVibGljS2V5KGVuY29kZWRQdWJsaWNLZXkpIHtcbiAgICBjb25zdCBrZXlDb21wb25lbnRzID0gYnl0ZXNUb0J5dGVBcnJheXMoZW5jb2RlZFB1YmxpY0tleSwgMik7XG4gICAgLy8ga2V5IGlzIGV4cGVjdGVkIGJ5IG9xcyBpbiB0aGUgc2FtZSBvcmRlciB0LCByaG9cbiAgICByZXR1cm4geyByYXc6IGNvbmNhdCguLi5rZXlDb21wb25lbnRzKSB9O1xufVxuLyoqXG4gKiBJbnZlcnNlIG9mIHByaXZhdGVLZXlUb0J5dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvS3liZXJQcml2YXRlS2V5KGVuY29kZWRQcml2YXRlS2V5KSB7XG4gICAgY29uc3Qga2V5Q29tcG9uZW50cyA9IGJ5dGVzVG9CeXRlQXJyYXlzKGVuY29kZWRQcml2YXRlS2V5LCA1KTtcbiAgICBjb25zdCBzID0ga2V5Q29tcG9uZW50c1swXTtcbiAgICBjb25zdCBocGsgPSBrZXlDb21wb25lbnRzWzFdO1xuICAgIGNvbnN0IG5vbmNlID0ga2V5Q29tcG9uZW50c1syXTtcbiAgICBjb25zdCB0ID0ga2V5Q29tcG9uZW50c1szXTtcbiAgICBjb25zdCByaG8gPSBrZXlDb21wb25lbnRzWzRdO1xuICAgIC8vIGtleSBpcyBleHBlY3RlZCBieSBvcXMgaW4gdGhpcyBvcmRlciAodnMgaG93IHdlIGVuY29kZSBpdCBvbiB0aGUgc2VydmVyKTogcywgdCwgcmhvLCBocGssIG5vbmNlXG4gICAgcmV0dXJuIHsgcmF3OiBjb25jYXQocywgdCwgcmhvLCBocGssIG5vbmNlKSB9O1xufVxuIiwiaW1wb3J0IHsgY2FsbFdlYkFzc2VtYmx5RnVuY3Rpb25XaXRoQXJndW1lbnRzLCBtdXRhYmxlU2VjdXJlRnJlZSwgc2VjdXJlRnJlZSwgc3RyaW5nVG9VdGY4VWludDhBcnJheSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIjtcbmltcG9ydCB7IHVpbnQ4QXJyYXlUb0JpdEFycmF5IH0gZnJvbSBcIi4uLy4uL21pc2MvVXRpbHMuanNcIjtcbi8vIFBlciBPV0FTUCdzIHJlY29tbWVuZGF0aW9ucyBAIGh0dHBzOi8vY2hlYXRzaGVldHNlcmllcy5vd2FzcC5vcmcvY2hlYXRzaGVldHMvUGFzc3dvcmRfU3RvcmFnZV9DaGVhdF9TaGVldC5odG1sXG5leHBvcnQgY29uc3QgQVJHT04ySURfSVRFUkFUSU9OUyA9IDQ7XG5leHBvcnQgY29uc3QgQVJHT04ySURfTUVNT1JZX0lOX0tpQiA9IDMyICogMTAyNDtcbmV4cG9ydCBjb25zdCBBUkdPTjJJRF9QQVJBTExFTElTTSA9IDE7XG5leHBvcnQgY29uc3QgQVJHT04ySURfS0VZX0xFTkdUSCA9IDMyO1xuLyoqXG4gKiBDcmVhdGUgYSAyNTYtYml0IHN5bW1ldHJpYyBrZXkgZnJvbSB0aGUgZ2l2ZW4gcGFzc3BocmFzZS5cbiAqIEBwYXJhbSBhcmdvbjIgYXJnb24yIG1vZHVsZSBleHBvcnRzXG4gKiBAcGFyYW0gcGFzcyBUaGUgcGFzc3BocmFzZSB0byB1c2UgZm9yIGtleSBnZW5lcmF0aW9uIGFzIHV0Zjggc3RyaW5nLlxuICogQHBhcmFtIHNhbHQgMTYgYnl0ZXMgb2YgcmFuZG9tIGRhdGFcbiAqIEByZXR1cm4gcmVzb2x2ZWQgd2l0aCB0aGUga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUtleUZyb21QYXNzcGhyYXNlKGFyZ29uMiwgcGFzcywgc2FsdCkge1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBhcmdvbjJpZEhhc2hSYXcoYXJnb24yLCBBUkdPTjJJRF9JVEVSQVRJT05TLCBBUkdPTjJJRF9NRU1PUllfSU5fS2lCLCBBUkdPTjJJRF9QQVJBTExFTElTTSwgc3RyaW5nVG9VdGY4VWludDhBcnJheShwYXNzKSwgc2FsdCwgQVJHT04ySURfS0VZX0xFTkdUSCk7XG4gICAgcmV0dXJuIHVpbnQ4QXJyYXlUb0JpdEFycmF5KGhhc2gpO1xufVxuYXN5bmMgZnVuY3Rpb24gYXJnb24yaWRIYXNoUmF3KGFyZ29uMiwgdGltZUNvc3QsIG1lbW9yeUNvc3QsIHBhcmFsbGVsaXNtLCBwYXNzd29yZCwgc2FsdCwgaGFzaExlbmd0aCkge1xuICAgIGNvbnN0IGhhc2ggPSBuZXcgVWludDhBcnJheShoYXNoTGVuZ3RoKTtcbiAgICBjb25zdCByZXN1bHQgPSBjYWxsV2ViQXNzZW1ibHlGdW5jdGlvbldpdGhBcmd1bWVudHMoYXJnb24yLmFyZ29uMmlkX2hhc2hfcmF3LCBhcmdvbjIsIHRpbWVDb3N0LCBtZW1vcnlDb3N0LCBwYXJhbGxlbGlzbSwgc2VjdXJlRnJlZShwYXNzd29yZCksIHBhc3N3b3JkLmxlbmd0aCwgc2FsdCwgc2FsdC5sZW5ndGgsIG11dGFibGVTZWN1cmVGcmVlKGhhc2gpLCBoYXNoLmxlbmd0aCk7XG4gICAgaWYgKHJlc3VsdCAhPT0gMCkge1xuICAgICAgICAvLyBJZiB5b3UgaGl0IHRoaXMsIHJlZmVyIHRvIGFyZ29uLmggKGxvb2sgZm9yIEFyZ29uMl9FcnJvckNvZGVzKSBmb3IgYSBkZXNjcmlwdGlvbiBvZiB3aGF0IGl0IG1lYW5zLiBJdCdzIGxpa2VseSBhbiBpc3N1ZSB3aXRoIG9uZSBvZiB5b3VyIGlucHV0cy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm90ZTogSWYgeW91IGdvdCBBUkdPTjJfTUVNT1JZX0FMTE9DQVRJT05fRVJST1IgKC0yMiksIHlvdSBwcm9iYWJseSBnYXZlIHRvbyBiaWcgb2YgYSBtZW1vcnkgY29zdC4gWW91IG5lZWQgdG8gcmVjb21waWxlIGFyZ29uMi53YXNtIHRvIHN1cHBvcnQgbW9yZSBtZW1vcnkuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYXJnb24yaWRfaGFzaF9yYXcgcmV0dXJuZWQgJHtyZXN1bHR9YCk7XG4gICAgfVxuICAgIHJldHVybiBoYXNoO1xufVxuIiwiaW1wb3J0IHsgcmFuZG9tIH0gZnJvbSBcIi4vUmFuZG9taXplci5qc1wiO1xuLyoqXG4gKiBUaGlzIGlzIHRoZSBhZGFwdGVyIHRvIHRoZSBQUk5HIGludGVyZmFjZSByZXF1aXJlZCBieSBKU0JOLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWN1cmVSYW5kb20ge1xuICAgIC8qKlxuICAgICAqIE9ubHkgdGhpcyBmdW5jdGlvbiBpcyB1c2VkIGJ5IGpzYm4gZm9yIGdldHRpbmcgcmFuZG9tIGJ5dGVzLiBFYWNoIGJ5dGUgaXMgYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAgICAgKiBAcGFyYW0gYXJyYXkgQW4gYXJyYXkgdG8gZmlsbCB3aXRoIHJhbmRvbSBieXRlcy4gVGhlIGxlbmd0aCBvZiB0aGUgYXJyYXkgZGVmaW5lcyB0aGUgbnVtYmVyIG9mIGJ5dGVzIHRvIGNyZWF0ZS5cbiAgICAgKi9cbiAgICBuZXh0Qnl0ZXMoYXJyYXkpIHtcbiAgICAgICAgbGV0IGJ5dGVzID0gcmFuZG9tLmdlbmVyYXRlUmFuZG9tRGF0YShhcnJheS5sZW5ndGgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcnJheVtpXSA9IGJ5dGVzW2ldO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgU2VjdXJlUmFuZG9tIH0gZnJvbSBcIi4uL3JhbmRvbS9TZWN1cmVSYW5kb20uanNcIjtcbi8vIENvcHlyaWdodCAoYykgMjAwNSAgVG9tIFd1XG4vLyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy8gU2VlIFwiTElDRU5TRVwiIGZvciBkZXRhaWxzLlxuLy8gQmFzaWMgSmF2YVNjcmlwdCBCTiBsaWJyYXJ5IC0gc3Vic2V0IHVzZWZ1bCBmb3IgUlNBIGVuY3J5cHRpb24uXG4vLyBCaXRzIHBlciBkaWdpdFxudmFyIGRiaXRzO1xuLy8gSmF2YVNjcmlwdCBlbmdpbmUgYW5hbHlzaXNcbnZhciBjYW5hcnkgPSAweGRlYWRiZWVmY2FmZTtcbnZhciBqX2xtID0gKGNhbmFyeSAmIDB4ZmZmZmZmKSA9PSAweGVmY2FmZTtcbi8vIChwdWJsaWMpIENvbnN0cnVjdG9yXG4vLyB0dXRhbzogYSA9IGJpdGxlbmd0aCAoMTAyNClcbi8vICAgICAgICBiID0gbnVtYmVyIG9mIG1pbGxlciByYWJpbiB0ZXN0ICogMlxuLy8gICAgICAgIGMgPSBTZWN1cmVSYW5kb21cbmV4cG9ydCBmdW5jdGlvbiBCaWdJbnRlZ2VyKGEsIGIsIGMpIHtcbiAgICBpZiAoYSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChcIm51bWJlclwiID09IHR5cGVvZiBhKSB7XG4gICAgICAgICAgICB0aGlzLmZyb21OdW1iZXIoYSwgYiwgYyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYiA9PSBudWxsICYmIFwic3RyaW5nXCIgIT0gdHlwZW9mIGEpIHtcbiAgICAgICAgICAgIHRoaXMuZnJvbVN0cmluZyhhLCAyNTYpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcm9tU3RyaW5nKGEsIGIpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gcmV0dXJuIG5ldywgdW5zZXQgQmlnSW50ZWdlclxuZnVuY3Rpb24gbmJpKCkge1xuICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihudWxsKTtcbn1cbi8vIGFtOiBDb21wdXRlIHdfaiArPSAoeCp0aGlzX2kpLCBwcm9wYWdhdGUgY2Fycmllcyxcbi8vIGMgaXMgaW5pdGlhbCBjYXJyeSwgcmV0dXJucyBmaW5hbCBjYXJyeS5cbi8vIGMgPCAzKmR2YWx1ZSwgeCA8IDIqZHZhbHVlLCB0aGlzX2kgPCBkdmFsdWVcbi8vIFdlIG5lZWQgdG8gc2VsZWN0IHRoZSBmYXN0ZXN0IG9uZSB0aGF0IHdvcmtzIGluIHRoaXMgZW52aXJvbm1lbnQuXG4vLyBhbTE6IHVzZSBhIHNpbmdsZSBtdWx0IGFuZCBkaXZpZGUgdG8gZ2V0IHRoZSBoaWdoIGJpdHMsXG4vLyBtYXggZGlnaXQgYml0cyBzaG91bGQgYmUgMjYgYmVjYXVzZVxuLy8gbWF4IGludGVybmFsIHZhbHVlID0gMipkdmFsdWVeMi0yKmR2YWx1ZSAoPCAyXjUzKVxuZnVuY3Rpb24gYW0xKGksIHgsIHcsIGosIGMsIG4pIHtcbiAgICB3aGlsZSAoLS1uID49IDApIHtcbiAgICAgICAgdmFyIHYgPSB4ICogdGhpc1tpKytdICsgd1tqXSArIGM7XG4gICAgICAgIGMgPSBNYXRoLmZsb29yKHYgLyAweDQwMDAwMDApO1xuICAgICAgICB3W2orK10gPSB2ICYgMHgzZmZmZmZmO1xuICAgIH1cbiAgICByZXR1cm4gYztcbn1cbi8vIGFtMiBhdm9pZHMgYSBiaWcgbXVsdC1hbmQtZXh0cmFjdCBjb21wbGV0ZWx5LlxuLy8gTWF4IGRpZ2l0IGJpdHMgc2hvdWxkIGJlIDw9IDMwIGJlY2F1c2Ugd2UgZG8gYml0d2lzZSBvcHNcbi8vIG9uIHZhbHVlcyB1cCB0byAyKmhkdmFsdWVeMi1oZHZhbHVlLTEgKDwgMl4zMSlcbmZ1bmN0aW9uIGFtMihpLCB4LCB3LCBqLCBjLCBuKSB7XG4gICAgdmFyIHhsID0geCAmIDB4N2ZmZiwgeGggPSB4ID4+IDE1O1xuICAgIHdoaWxlICgtLW4gPj0gMCkge1xuICAgICAgICB2YXIgbCA9IHRoaXNbaV0gJiAweDdmZmY7XG4gICAgICAgIHZhciBoID0gdGhpc1tpKytdID4+IDE1O1xuICAgICAgICB2YXIgbSA9IHhoICogbCArIGggKiB4bDtcbiAgICAgICAgbCA9IHhsICogbCArICgobSAmIDB4N2ZmZikgPDwgMTUpICsgd1tqXSArIChjICYgMHgzZmZmZmZmZik7XG4gICAgICAgIGMgPSAobCA+Pj4gMzApICsgKG0gPj4+IDE1KSArIHhoICogaCArIChjID4+PiAzMCk7XG4gICAgICAgIHdbaisrXSA9IGwgJiAweDNmZmZmZmZmO1xuICAgIH1cbiAgICByZXR1cm4gYztcbn1cbi8vIEFsdGVybmF0ZWx5LCBzZXQgbWF4IGRpZ2l0IGJpdHMgdG8gMjggc2luY2Ugc29tZVxuLy8gYnJvd3NlcnMgc2xvdyBkb3duIHdoZW4gZGVhbGluZyB3aXRoIDMyLWJpdCBudW1iZXJzLlxuZnVuY3Rpb24gYW0zKGksIHgsIHcsIGosIGMsIG4pIHtcbiAgICB2YXIgeGwgPSB4ICYgMHgzZmZmLCB4aCA9IHggPj4gMTQ7XG4gICAgd2hpbGUgKC0tbiA+PSAwKSB7XG4gICAgICAgIHZhciBsID0gdGhpc1tpXSAmIDB4M2ZmZjtcbiAgICAgICAgdmFyIGggPSB0aGlzW2krK10gPj4gMTQ7XG4gICAgICAgIHZhciBtID0geGggKiBsICsgaCAqIHhsO1xuICAgICAgICBsID0geGwgKiBsICsgKChtICYgMHgzZmZmKSA8PCAxNCkgKyB3W2pdICsgYztcbiAgICAgICAgYyA9IChsID4+IDI4KSArIChtID4+IDE0KSArIHhoICogaDtcbiAgICAgICAgd1tqKytdID0gbCAmIDB4ZmZmZmZmZjtcbiAgICB9XG4gICAgcmV0dXJuIGM7XG59XG5pZiAoal9sbSAmJiB0eXBlb2YgbmF2aWdhdG9yID09PSBcIm9iamVjdFwiICYmIG5hdmlnYXRvci5hcHBOYW1lID09IFwiTWljcm9zb2Z0IEludGVybmV0IEV4cGxvcmVyXCIpIHtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbSA9IGFtMjtcbiAgICBkYml0cyA9IDMwO1xufVxuZWxzZSBpZiAoal9sbSAmJiB0eXBlb2YgbmF2aWdhdG9yID09PSBcIm9iamVjdFwiICYmIG5hdmlnYXRvci5hcHBOYW1lICE9IFwiTmV0c2NhcGVcIikge1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFtID0gYW0xO1xuICAgIGRiaXRzID0gMjY7XG59XG5lbHNlIHtcbiAgICAvLyBNb3ppbGxhL05ldHNjYXBlIHNlZW1zIHRvIHByZWZlciBhbTNcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbSA9IGFtMztcbiAgICBkYml0cyA9IDI4O1xufVxuQmlnSW50ZWdlci5wcm90b3R5cGUuREIgPSBkYml0cztcbkJpZ0ludGVnZXIucHJvdG90eXBlLkRNID0gKDEgPDwgZGJpdHMpIC0gMTtcbkJpZ0ludGVnZXIucHJvdG90eXBlLkRWID0gMSA8PCBkYml0cztcbnZhciBCSV9GUCA9IDUyO1xuQmlnSW50ZWdlci5wcm90b3R5cGUuRlYgPSBNYXRoLnBvdygyLCBCSV9GUCk7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5GMSA9IEJJX0ZQIC0gZGJpdHM7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5GMiA9IDIgKiBkYml0cyAtIEJJX0ZQO1xuLy8gRGlnaXQgY29udmVyc2lvbnNcbnZhciBCSV9STSA9IFwiMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCI7XG52YXIgQklfUkMgPSBuZXcgQXJyYXkoKTtcbnZhciByciwgdnY7XG5yciA9IFwiMFwiLmNoYXJDb2RlQXQoMCk7XG5mb3IgKHZ2ID0gMDsgdnYgPD0gOTsgKyt2dilcbiAgICBCSV9SQ1tycisrXSA9IHZ2O1xucnIgPSBcImFcIi5jaGFyQ29kZUF0KDApO1xuZm9yICh2diA9IDEwOyB2diA8IDM2OyArK3Z2KVxuICAgIEJJX1JDW3JyKytdID0gdnY7XG5yciA9IFwiQVwiLmNoYXJDb2RlQXQoMCk7XG5mb3IgKHZ2ID0gMTA7IHZ2IDwgMzY7ICsrdnYpXG4gICAgQklfUkNbcnIrK10gPSB2djtcbmZ1bmN0aW9uIGludDJjaGFyKG4pIHtcbiAgICByZXR1cm4gQklfUk0uY2hhckF0KG4pO1xufVxuZnVuY3Rpb24gaW50QXQocywgaSkge1xuICAgIHZhciBjID0gQklfUkNbcy5jaGFyQ29kZUF0KGkpXTtcbiAgICByZXR1cm4gYyA9PSBudWxsID8gLTEgOiBjO1xufVxuLy8gKHByb3RlY3RlZCkgY29weSB0aGlzIHRvIHJcbmZ1bmN0aW9uIGJucENvcHlUbyhyKSB7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMudCAtIDE7IGkgPj0gMDsgLS1pKVxuICAgICAgICByW2ldID0gdGhpc1tpXTtcbiAgICByLnQgPSB0aGlzLnQ7XG4gICAgci5zID0gdGhpcy5zO1xufVxuLy8gKHByb3RlY3RlZCkgc2V0IGZyb20gaW50ZWdlciB2YWx1ZSB4LCAtRFYgPD0geCA8IERWXG5mdW5jdGlvbiBibnBGcm9tSW50KHgpIHtcbiAgICB0aGlzLnQgPSAxO1xuICAgIHRoaXMucyA9IHggPCAwID8gLTEgOiAwO1xuICAgIGlmICh4ID4gMCkge1xuICAgICAgICB0aGlzWzBdID0geDtcbiAgICB9XG4gICAgZWxzZSBpZiAoeCA8IC0xKSB7XG4gICAgICAgIHRoaXNbMF0gPSB4ICsgRFY7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnQgPSAwO1xuICAgIH1cbn1cbi8vIHJldHVybiBiaWdpbnQgaW5pdGlhbGl6ZWQgdG8gdmFsdWVcbmZ1bmN0aW9uIG5idihpKSB7XG4gICAgdmFyIHIgPSBuYmkoKTtcbiAgICByLmZyb21JbnQoaSk7XG4gICAgcmV0dXJuIHI7XG59XG4vLyAocHJvdGVjdGVkKSBzZXQgZnJvbSBzdHJpbmcgYW5kIHJhZGl4XG5mdW5jdGlvbiBibnBGcm9tU3RyaW5nKHMsIGIpIHtcbiAgICB2YXIgaztcbiAgICBpZiAoYiA9PSAxNikge1xuICAgICAgICBrID0gNDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYiA9PSA4KSB7XG4gICAgICAgIGsgPSAzO1xuICAgIH1cbiAgICBlbHNlIGlmIChiID09IDI1Nikge1xuICAgICAgICBrID0gODtcbiAgICB9IC8vIGJ5dGUgYXJyYXlcbiAgICBlbHNlIGlmIChiID09IDIpIHtcbiAgICAgICAgayA9IDE7XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgPT0gMzIpIHtcbiAgICAgICAgayA9IDU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgPT0gNCkge1xuICAgICAgICBrID0gMjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuZnJvbVJhZGl4KHMsIGIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudCA9IDA7XG4gICAgdGhpcy5zID0gMDtcbiAgICB2YXIgaSA9IHMubGVuZ3RoLCBtaSA9IGZhbHNlLCBzaCA9IDA7XG4gICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgIHZhciB4ID0gayA9PSA4ID8gc1tpXSAmIDB4ZmYgOiBpbnRBdChzLCBpKTtcbiAgICAgICAgaWYgKHggPCAwKSB7XG4gICAgICAgICAgICBpZiAocy5jaGFyQXQoaSkgPT0gXCItXCIpXG4gICAgICAgICAgICAgICAgbWkgPSB0cnVlO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbWkgPSBmYWxzZTtcbiAgICAgICAgaWYgKHNoID09IDApIHtcbiAgICAgICAgICAgIHRoaXNbdGhpcy50KytdID0geDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaCArIGsgPiB0aGlzLkRCKSB7XG4gICAgICAgICAgICB0aGlzW3RoaXMudCAtIDFdIHw9ICh4ICYgKCgxIDw8ICh0aGlzLkRCIC0gc2gpKSAtIDEpKSA8PCBzaDtcbiAgICAgICAgICAgIHRoaXNbdGhpcy50KytdID0geCA+PiAodGhpcy5EQiAtIHNoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXNbdGhpcy50IC0gMV0gfD0geCA8PCBzaDtcbiAgICAgICAgfVxuICAgICAgICBzaCArPSBrO1xuICAgICAgICBpZiAoc2ggPj0gdGhpcy5EQilcbiAgICAgICAgICAgIHNoIC09IHRoaXMuREI7XG4gICAgfVxuICAgIGlmIChrID09IDggJiYgKHNbMF0gJiAweDgwKSAhPSAwKSB7XG4gICAgICAgIHRoaXMucyA9IC0xO1xuICAgICAgICBpZiAoc2ggPiAwKVxuICAgICAgICAgICAgdGhpc1t0aGlzLnQgLSAxXSB8PSAoKDEgPDwgKHRoaXMuREIgLSBzaCkpIC0gMSkgPDwgc2g7XG4gICAgfVxuICAgIHRoaXMuY2xhbXAoKTtcbiAgICBpZiAobWkpXG4gICAgICAgIEJpZ0ludGVnZXIuWkVSTy5zdWJUbyh0aGlzLCB0aGlzKTtcbn1cbi8vIChwcm90ZWN0ZWQpIGNsYW1wIG9mZiBleGNlc3MgaGlnaCB3b3Jkc1xuZnVuY3Rpb24gYm5wQ2xhbXAoKSB7XG4gICAgdmFyIGMgPSB0aGlzLnMgJiB0aGlzLkRNO1xuICAgIHdoaWxlICh0aGlzLnQgPiAwICYmIHRoaXNbdGhpcy50IC0gMV0gPT0gYylcbiAgICAgICAgLS10aGlzLnQ7XG59XG4vLyAocHVibGljKSByZXR1cm4gc3RyaW5nIHJlcHJlc2VudGF0aW9uIGluIGdpdmVuIHJhZGl4XG5mdW5jdGlvbiBiblRvU3RyaW5nKGIpIHtcbiAgICBpZiAodGhpcy5zIDwgMClcbiAgICAgICAgcmV0dXJuIFwiLVwiICsgdGhpcy5uZWdhdGUoKS50b1N0cmluZyhiKTtcbiAgICB2YXIgaztcbiAgICBpZiAoYiA9PSAxNikge1xuICAgICAgICBrID0gNDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYiA9PSA4KSB7XG4gICAgICAgIGsgPSAzO1xuICAgIH1cbiAgICBlbHNlIGlmIChiID09IDIpIHtcbiAgICAgICAgayA9IDE7XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgPT0gMzIpIHtcbiAgICAgICAgayA9IDU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgPT0gNCkge1xuICAgICAgICBrID0gMjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvUmFkaXgoYik7XG4gICAgfVxuICAgIHZhciBrbSA9ICgxIDw8IGspIC0gMSwgZCwgbSA9IGZhbHNlLCByID0gXCJcIiwgaSA9IHRoaXMudDtcbiAgICB2YXIgcCA9IHRoaXMuREIgLSAoKGkgKiB0aGlzLkRCKSAlIGspO1xuICAgIGlmIChpLS0gPiAwKSB7XG4gICAgICAgIGlmIChwIDwgdGhpcy5EQiAmJiAoZCA9IHRoaXNbaV0gPj4gcCkgPiAwKSB7XG4gICAgICAgICAgICBtID0gdHJ1ZTtcbiAgICAgICAgICAgIHIgPSBpbnQyY2hhcihkKTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoaSA+PSAwKSB7XG4gICAgICAgICAgICBpZiAocCA8IGspIHtcbiAgICAgICAgICAgICAgICBkID0gKHRoaXNbaV0gJiAoKDEgPDwgcCkgLSAxKSkgPDwgKGsgLSBwKTtcbiAgICAgICAgICAgICAgICBkIHw9IHRoaXNbLS1pXSA+PiAocCArPSB0aGlzLkRCIC0gayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkID0gKHRoaXNbaV0gPj4gKHAgLT0gaykpICYga207XG4gICAgICAgICAgICAgICAgaWYgKHAgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBwICs9IHRoaXMuREI7XG4gICAgICAgICAgICAgICAgICAgIC0taTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZCA+IDApXG4gICAgICAgICAgICAgICAgbSA9IHRydWU7XG4gICAgICAgICAgICBpZiAobSlcbiAgICAgICAgICAgICAgICByICs9IGludDJjaGFyKGQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtID8gciA6IFwiMFwiO1xufVxuLy8gKHB1YmxpYykgLXRoaXNcbmZ1bmN0aW9uIGJuTmVnYXRlKCkge1xuICAgIHZhciByID0gbmJpKCk7XG4gICAgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHRoaXMsIHIpO1xuICAgIHJldHVybiByO1xufVxuLy8gKHB1YmxpYykgfHRoaXN8XG5mdW5jdGlvbiBibkFicygpIHtcbiAgICByZXR1cm4gdGhpcy5zIDwgMCA/IHRoaXMubmVnYXRlKCkgOiB0aGlzO1xufVxuLy8gKHB1YmxpYykgcmV0dXJuICsgaWYgdGhpcyA+IGEsIC0gaWYgdGhpcyA8IGEsIDAgaWYgZXF1YWxcbmZ1bmN0aW9uIGJuQ29tcGFyZVRvKGEpIHtcbiAgICB2YXIgciA9IHRoaXMucyAtIGEucztcbiAgICBpZiAociAhPSAwKVxuICAgICAgICByZXR1cm4gcjtcbiAgICB2YXIgaSA9IHRoaXMudDtcbiAgICByID0gaSAtIGEudDtcbiAgICBpZiAociAhPSAwKVxuICAgICAgICByZXR1cm4gdGhpcy5zIDwgMCA/IC1yIDogcjtcbiAgICB3aGlsZSAoLS1pID49IDApXG4gICAgICAgIGlmICgociA9IHRoaXNbaV0gLSBhW2ldKSAhPSAwKVxuICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgcmV0dXJuIDA7XG59XG4vLyByZXR1cm5zIGJpdCBsZW5ndGggb2YgdGhlIGludGVnZXIgeFxuZnVuY3Rpb24gbmJpdHMoeCkge1xuICAgIHZhciByID0gMSwgdDtcbiAgICBpZiAoKHQgPSB4ID4+PiAxNikgIT0gMCkge1xuICAgICAgICB4ID0gdDtcbiAgICAgICAgciArPSAxNjtcbiAgICB9XG4gICAgaWYgKCh0ID0geCA+PiA4KSAhPSAwKSB7XG4gICAgICAgIHggPSB0O1xuICAgICAgICByICs9IDg7XG4gICAgfVxuICAgIGlmICgodCA9IHggPj4gNCkgIT0gMCkge1xuICAgICAgICB4ID0gdDtcbiAgICAgICAgciArPSA0O1xuICAgIH1cbiAgICBpZiAoKHQgPSB4ID4+IDIpICE9IDApIHtcbiAgICAgICAgeCA9IHQ7XG4gICAgICAgIHIgKz0gMjtcbiAgICB9XG4gICAgaWYgKCh0ID0geCA+PiAxKSAhPSAwKSB7XG4gICAgICAgIHggPSB0O1xuICAgICAgICByICs9IDE7XG4gICAgfVxuICAgIHJldHVybiByO1xufVxuLy8gKHB1YmxpYykgcmV0dXJuIHRoZSBudW1iZXIgb2YgYml0cyBpbiBcInRoaXNcIlxuZnVuY3Rpb24gYm5CaXRMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMudCA8PSAwKVxuICAgICAgICByZXR1cm4gMDtcbiAgICByZXR1cm4gdGhpcy5EQiAqICh0aGlzLnQgLSAxKSArIG5iaXRzKHRoaXNbdGhpcy50IC0gMV0gXiAodGhpcy5zICYgdGhpcy5ETSkpO1xufVxuLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgPDwgbipEQlxuZnVuY3Rpb24gYm5wRExTaGlmdFRvKG4sIHIpIHtcbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgPSB0aGlzLnQgLSAxOyBpID49IDA7IC0taSlcbiAgICAgICAgcltpICsgbl0gPSB0aGlzW2ldO1xuICAgIGZvciAoaSA9IG4gLSAxOyBpID49IDA7IC0taSlcbiAgICAgICAgcltpXSA9IDA7XG4gICAgci50ID0gdGhpcy50ICsgbjtcbiAgICByLnMgPSB0aGlzLnM7XG59XG4vLyAocHJvdGVjdGVkKSByID0gdGhpcyA+PiBuKkRCXG5mdW5jdGlvbiBibnBEUlNoaWZ0VG8obiwgcikge1xuICAgIGZvciAodmFyIGkgPSBuOyBpIDwgdGhpcy50OyArK2kpXG4gICAgICAgIHJbaSAtIG5dID0gdGhpc1tpXTtcbiAgICByLnQgPSBNYXRoLm1heCh0aGlzLnQgLSBuLCAwKTtcbiAgICByLnMgPSB0aGlzLnM7XG59XG4vLyAocHJvdGVjdGVkKSByID0gdGhpcyA8PCBuXG5mdW5jdGlvbiBibnBMU2hpZnRUbyhuLCByKSB7XG4gICAgdmFyIGJzID0gbiAlIHRoaXMuREI7XG4gICAgdmFyIGNicyA9IHRoaXMuREIgLSBicztcbiAgICB2YXIgYm0gPSAoMSA8PCBjYnMpIC0gMTtcbiAgICB2YXIgZHMgPSBNYXRoLmZsb29yKG4gLyB0aGlzLkRCKSwgYyA9ICh0aGlzLnMgPDwgYnMpICYgdGhpcy5ETSwgaTtcbiAgICBmb3IgKGkgPSB0aGlzLnQgLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICByW2kgKyBkcyArIDFdID0gKHRoaXNbaV0gPj4gY2JzKSB8IGM7XG4gICAgICAgIGMgPSAodGhpc1tpXSAmIGJtKSA8PCBicztcbiAgICB9XG4gICAgZm9yIChpID0gZHMgLSAxOyBpID49IDA7IC0taSlcbiAgICAgICAgcltpXSA9IDA7XG4gICAgcltkc10gPSBjO1xuICAgIHIudCA9IHRoaXMudCArIGRzICsgMTtcbiAgICByLnMgPSB0aGlzLnM7XG4gICAgci5jbGFtcCgpO1xufVxuLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgPj4gblxuZnVuY3Rpb24gYm5wUlNoaWZ0VG8obiwgcikge1xuICAgIHIucyA9IHRoaXMucztcbiAgICB2YXIgZHMgPSBNYXRoLmZsb29yKG4gLyB0aGlzLkRCKTtcbiAgICBpZiAoZHMgPj0gdGhpcy50KSB7XG4gICAgICAgIHIudCA9IDA7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGJzID0gbiAlIHRoaXMuREI7XG4gICAgdmFyIGNicyA9IHRoaXMuREIgLSBicztcbiAgICB2YXIgYm0gPSAoMSA8PCBicykgLSAxO1xuICAgIHJbMF0gPSB0aGlzW2RzXSA+PiBicztcbiAgICBmb3IgKHZhciBpID0gZHMgKyAxOyBpIDwgdGhpcy50OyArK2kpIHtcbiAgICAgICAgcltpIC0gZHMgLSAxXSB8PSAodGhpc1tpXSAmIGJtKSA8PCBjYnM7XG4gICAgICAgIHJbaSAtIGRzXSA9IHRoaXNbaV0gPj4gYnM7XG4gICAgfVxuICAgIGlmIChicyA+IDApXG4gICAgICAgIHJbdGhpcy50IC0gZHMgLSAxXSB8PSAodGhpcy5zICYgYm0pIDw8IGNicztcbiAgICByLnQgPSB0aGlzLnQgLSBkcztcbiAgICByLmNsYW1wKCk7XG59XG4vLyAocHJvdGVjdGVkKSByID0gdGhpcyAtIGFcbmZ1bmN0aW9uIGJucFN1YlRvKGEsIHIpIHtcbiAgICB2YXIgaSA9IDAsIGMgPSAwLCBtID0gTWF0aC5taW4oYS50LCB0aGlzLnQpO1xuICAgIHdoaWxlIChpIDwgbSkge1xuICAgICAgICBjICs9IHRoaXNbaV0gLSBhW2ldO1xuICAgICAgICByW2krK10gPSBjICYgdGhpcy5ETTtcbiAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICB9XG4gICAgaWYgKGEudCA8IHRoaXMudCkge1xuICAgICAgICBjIC09IGEucztcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLnQpIHtcbiAgICAgICAgICAgIGMgKz0gdGhpc1tpXTtcbiAgICAgICAgICAgIHJbaSsrXSA9IGMgJiB0aGlzLkRNO1xuICAgICAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICAgICAgfVxuICAgICAgICBjICs9IHRoaXMucztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGMgKz0gdGhpcy5zO1xuICAgICAgICB3aGlsZSAoaSA8IGEudCkge1xuICAgICAgICAgICAgYyAtPSBhW2ldO1xuICAgICAgICAgICAgcltpKytdID0gYyAmIHRoaXMuRE07XG4gICAgICAgICAgICBjID4+PSB0aGlzLkRCO1xuICAgICAgICB9XG4gICAgICAgIGMgLT0gYS5zO1xuICAgIH1cbiAgICByLnMgPSBjIDwgMCA/IC0xIDogMDtcbiAgICBpZiAoYyA8IC0xKSB7XG4gICAgICAgIHJbaSsrXSA9IHRoaXMuRFYgKyBjO1xuICAgIH1cbiAgICBlbHNlIGlmIChjID4gMClcbiAgICAgICAgcltpKytdID0gYztcbiAgICByLnQgPSBpO1xuICAgIHIuY2xhbXAoKTtcbn1cbi8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzICogYSwgciAhPSB0aGlzLGEgKEhBQyAxNC4xMilcbi8vIFwidGhpc1wiIHNob3VsZCBiZSB0aGUgbGFyZ2VyIG9uZSBpZiBhcHByb3ByaWF0ZS5cbmZ1bmN0aW9uIGJucE11bHRpcGx5VG8oYSwgcikge1xuICAgIHZhciB4ID0gdGhpcy5hYnMoKSwgeSA9IGEuYWJzKCk7XG4gICAgdmFyIGkgPSB4LnQ7XG4gICAgci50ID0gaSArIHkudDtcbiAgICB3aGlsZSAoLS1pID49IDApXG4gICAgICAgIHJbaV0gPSAwO1xuICAgIGZvciAoaSA9IDA7IGkgPCB5LnQ7ICsraSlcbiAgICAgICAgcltpICsgeC50XSA9IHguYW0oMCwgeVtpXSwgciwgaSwgMCwgeC50KTtcbiAgICByLnMgPSAwO1xuICAgIHIuY2xhbXAoKTtcbiAgICBpZiAodGhpcy5zICE9IGEucylcbiAgICAgICAgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHIsIHIpO1xufVxuLy8gKHByb3RlY3RlZCkgciA9IHRoaXNeMiwgciAhPSB0aGlzIChIQUMgMTQuMTYpXG5mdW5jdGlvbiBibnBTcXVhcmVUbyhyKSB7XG4gICAgdmFyIHggPSB0aGlzLmFicygpO1xuICAgIHZhciBpID0gKHIudCA9IDIgKiB4LnQpO1xuICAgIHdoaWxlICgtLWkgPj0gMClcbiAgICAgICAgcltpXSA9IDA7XG4gICAgZm9yIChpID0gMDsgaSA8IHgudCAtIDE7ICsraSkge1xuICAgICAgICB2YXIgYyA9IHguYW0oaSwgeFtpXSwgciwgMiAqIGksIDAsIDEpO1xuICAgICAgICBpZiAoKHJbaSArIHgudF0gKz0geC5hbShpICsgMSwgMiAqIHhbaV0sIHIsIDIgKiBpICsgMSwgYywgeC50IC0gaSAtIDEpKSA+PSB4LkRWKSB7XG4gICAgICAgICAgICByW2kgKyB4LnRdIC09IHguRFY7XG4gICAgICAgICAgICByW2kgKyB4LnQgKyAxXSA9IDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHIudCA+IDApXG4gICAgICAgIHJbci50IC0gMV0gKz0geC5hbShpLCB4W2ldLCByLCAyICogaSwgMCwgMSk7XG4gICAgci5zID0gMDtcbiAgICByLmNsYW1wKCk7XG59XG4vLyAocHJvdGVjdGVkKSBkaXZpZGUgdGhpcyBieSBtLCBxdW90aWVudCBhbmQgcmVtYWluZGVyIHRvIHEsIHIgKEhBQyAxNC4yMClcbi8vIHIgIT0gcSwgdGhpcyAhPSBtLiAgcSBvciByIG1heSBiZSBudWxsLlxuZnVuY3Rpb24gYm5wRGl2UmVtVG8obSwgcSwgcikge1xuICAgIHZhciBwbSA9IG0uYWJzKCk7XG4gICAgaWYgKHBtLnQgPD0gMClcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBwdCA9IHRoaXMuYWJzKCk7XG4gICAgaWYgKHB0LnQgPCBwbS50KSB7XG4gICAgICAgIGlmIChxICE9IG51bGwpXG4gICAgICAgICAgICBxLmZyb21JbnQoMCk7XG4gICAgICAgIGlmIChyICE9IG51bGwpXG4gICAgICAgICAgICB0aGlzLmNvcHlUbyhyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAociA9PSBudWxsKVxuICAgICAgICByID0gbmJpKCk7XG4gICAgdmFyIHkgPSBuYmkoKSwgdHMgPSB0aGlzLnMsIG1zID0gbS5zO1xuICAgIHZhciBuc2ggPSB0aGlzLkRCIC0gbmJpdHMocG1bcG0udCAtIDFdKTsgLy8gbm9ybWFsaXplIG1vZHVsdXNcbiAgICBpZiAobnNoID4gMCkge1xuICAgICAgICBwbS5sU2hpZnRUbyhuc2gsIHkpO1xuICAgICAgICBwdC5sU2hpZnRUbyhuc2gsIHIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcG0uY29weVRvKHkpO1xuICAgICAgICBwdC5jb3B5VG8ocik7XG4gICAgfVxuICAgIHZhciB5cyA9IHkudDtcbiAgICB2YXIgeTAgPSB5W3lzIC0gMV07XG4gICAgaWYgKHkwID09IDApXG4gICAgICAgIHJldHVybjtcbiAgICB2YXIgeXQgPSB5MCAqICgxIDw8IHRoaXMuRjEpICsgKHlzID4gMSA/IHlbeXMgLSAyXSA+PiB0aGlzLkYyIDogMCk7XG4gICAgdmFyIGQxID0gdGhpcy5GViAvIHl0LCBkMiA9ICgxIDw8IHRoaXMuRjEpIC8geXQsIGUgPSAxIDw8IHRoaXMuRjI7XG4gICAgdmFyIGkgPSByLnQsIGogPSBpIC0geXMsIHQgPSBxID09IG51bGwgPyBuYmkoKSA6IHE7XG4gICAgeS5kbFNoaWZ0VG8oaiwgdCk7XG4gICAgaWYgKHIuY29tcGFyZVRvKHQpID49IDApIHtcbiAgICAgICAgcltyLnQrK10gPSAxO1xuICAgICAgICByLnN1YlRvKHQsIHIpO1xuICAgIH1cbiAgICBCaWdJbnRlZ2VyLk9ORS5kbFNoaWZ0VG8oeXMsIHQpO1xuICAgIHQuc3ViVG8oeSwgeSk7IC8vIFwibmVnYXRpdmVcIiB5IHNvIHdlIGNhbiByZXBsYWNlIHN1YiB3aXRoIGFtIGxhdGVyXG4gICAgd2hpbGUgKHkudCA8IHlzKVxuICAgICAgICB5W3kudCsrXSA9IDA7XG4gICAgd2hpbGUgKC0taiA+PSAwKSB7XG4gICAgICAgIC8vIEVzdGltYXRlIHF1b3RpZW50IGRpZ2l0XG4gICAgICAgIHZhciBxZCA9IHJbLS1pXSA9PSB5MCA/IHRoaXMuRE0gOiBNYXRoLmZsb29yKHJbaV0gKiBkMSArIChyW2kgLSAxXSArIGUpICogZDIpO1xuICAgICAgICBpZiAoKHJbaV0gKz0geS5hbSgwLCBxZCwgciwgaiwgMCwgeXMpKSA8IHFkKSB7XG4gICAgICAgICAgICAvLyBUcnkgaXQgb3V0XG4gICAgICAgICAgICB5LmRsU2hpZnRUbyhqLCB0KTtcbiAgICAgICAgICAgIHIuc3ViVG8odCwgcik7XG4gICAgICAgICAgICB3aGlsZSAocltpXSA8IC0tcWQpXG4gICAgICAgICAgICAgICAgci5zdWJUbyh0LCByKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocSAhPSBudWxsKSB7XG4gICAgICAgIHIuZHJTaGlmdFRvKHlzLCBxKTtcbiAgICAgICAgaWYgKHRzICE9IG1zKVxuICAgICAgICAgICAgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHEsIHEpO1xuICAgIH1cbiAgICByLnQgPSB5cztcbiAgICByLmNsYW1wKCk7XG4gICAgaWYgKG5zaCA+IDApXG4gICAgICAgIHIuclNoaWZ0VG8obnNoLCByKTsgLy8gRGVub3JtYWxpemUgcmVtYWluZGVyXG4gICAgaWYgKHRzIDwgMClcbiAgICAgICAgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHIsIHIpO1xufVxuLy8gKHB1YmxpYykgdGhpcyBtb2QgYVxuZnVuY3Rpb24gYm5Nb2QoYSkge1xuICAgIHZhciByID0gbmJpKCk7XG4gICAgdGhpcy5hYnMoKS5kaXZSZW1UbyhhLCBudWxsLCByKTtcbiAgICBpZiAodGhpcy5zIDwgMCAmJiByLmNvbXBhcmVUbyhCaWdJbnRlZ2VyLlpFUk8pID4gMClcbiAgICAgICAgYS5zdWJUbyhyLCByKTtcbiAgICByZXR1cm4gcjtcbn1cbi8vIE1vZHVsYXIgcmVkdWN0aW9uIHVzaW5nIFwiY2xhc3NpY1wiIGFsZ29yaXRobVxuZnVuY3Rpb24gQ2xhc3NpYyhtKSB7XG4gICAgdGhpcy5tID0gbTtcbn1cbmZ1bmN0aW9uIGNDb252ZXJ0KHgpIHtcbiAgICBpZiAoeC5zIDwgMCB8fCB4LmNvbXBhcmVUbyh0aGlzLm0pID49IDApIHtcbiAgICAgICAgcmV0dXJuIHgubW9kKHRoaXMubSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG59XG5mdW5jdGlvbiBjUmV2ZXJ0KHgpIHtcbiAgICByZXR1cm4geDtcbn1cbmZ1bmN0aW9uIGNSZWR1Y2UoeCkge1xuICAgIHguZGl2UmVtVG8odGhpcy5tLCBudWxsLCB4KTtcbn1cbmZ1bmN0aW9uIGNNdWxUbyh4LCB5LCByKSB7XG4gICAgeC5tdWx0aXBseVRvKHksIHIpO1xuICAgIHRoaXMucmVkdWNlKHIpO1xufVxuZnVuY3Rpb24gY1NxclRvKHgsIHIpIHtcbiAgICB4LnNxdWFyZVRvKHIpO1xuICAgIHRoaXMucmVkdWNlKHIpO1xufVxuQ2xhc3NpYy5wcm90b3R5cGUuY29udmVydCA9IGNDb252ZXJ0O1xuQ2xhc3NpYy5wcm90b3R5cGUucmV2ZXJ0ID0gY1JldmVydDtcbkNsYXNzaWMucHJvdG90eXBlLnJlZHVjZSA9IGNSZWR1Y2U7XG5DbGFzc2ljLnByb3RvdHlwZS5tdWxUbyA9IGNNdWxUbztcbkNsYXNzaWMucHJvdG90eXBlLnNxclRvID0gY1NxclRvO1xuLy8gKHByb3RlY3RlZCkgcmV0dXJuIFwiLTEvdGhpcyAlIDJeREJcIjsgdXNlZnVsIGZvciBNb250LiByZWR1Y3Rpb25cbi8vIGp1c3RpZmljYXRpb246XG4vLyAgICAgICAgIHh5ID09IDEgKG1vZCBtKVxuLy8gICAgICAgICB4eSA9ICAxK2ttXG4vLyAgIHh5KDIteHkpID0gKDEra20pKDEta20pXG4vLyB4W3koMi14eSldID0gMS1rXjJtXjJcbi8vIHhbeSgyLXh5KV0gPT0gMSAobW9kIG1eMilcbi8vIGlmIHkgaXMgMS94IG1vZCBtLCB0aGVuIHkoMi14eSkgaXMgMS94IG1vZCBtXjJcbi8vIHNob3VsZCByZWR1Y2UgeCBhbmQgeSgyLXh5KSBieSBtXjIgYXQgZWFjaCBzdGVwIHRvIGtlZXAgc2l6ZSBib3VuZGVkLlxuLy8gSlMgbXVsdGlwbHkgXCJvdmVyZmxvd3NcIiBkaWZmZXJlbnRseSBmcm9tIEMvQysrLCBzbyBjYXJlIGlzIG5lZWRlZCBoZXJlLlxuZnVuY3Rpb24gYm5wSW52RGlnaXQoKSB7XG4gICAgaWYgKHRoaXMudCA8IDEpXG4gICAgICAgIHJldHVybiAwO1xuICAgIHZhciB4ID0gdGhpc1swXTtcbiAgICBpZiAoKHggJiAxKSA9PSAwKVxuICAgICAgICByZXR1cm4gMDtcbiAgICB2YXIgeSA9IHggJiAzOyAvLyB5ID09IDEveCBtb2QgMl4yXG4gICAgeSA9ICh5ICogKDIgLSAoeCAmIDB4ZikgKiB5KSkgJiAweGY7IC8vIHkgPT0gMS94IG1vZCAyXjRcbiAgICB5ID0gKHkgKiAoMiAtICh4ICYgMHhmZikgKiB5KSkgJiAweGZmOyAvLyB5ID09IDEveCBtb2QgMl44XG4gICAgeSA9ICh5ICogKDIgLSAoKCh4ICYgMHhmZmZmKSAqIHkpICYgMHhmZmZmKSkpICYgMHhmZmZmOyAvLyB5ID09IDEveCBtb2QgMl4xNlxuICAgIC8vIGxhc3Qgc3RlcCAtIGNhbGN1bGF0ZSBpbnZlcnNlIG1vZCBEViBkaXJlY3RseTtcbiAgICAvLyBhc3N1bWVzIDE2IDwgREIgPD0gMzIgYW5kIGFzc3VtZXMgYWJpbGl0eSB0byBoYW5kbGUgNDgtYml0IGludHNcbiAgICB5ID0gKHkgKiAoMiAtICgoeCAqIHkpICUgdGhpcy5EVikpKSAlIHRoaXMuRFY7IC8vIHkgPT0gMS94IG1vZCAyXmRiaXRzXG4gICAgLy8gd2UgcmVhbGx5IHdhbnQgdGhlIG5lZ2F0aXZlIGludmVyc2UsIGFuZCAtRFYgPCB5IDwgRFZcbiAgICByZXR1cm4geSA+IDAgPyB0aGlzLkRWIC0geSA6IC15O1xufVxuLy8gTW9udGdvbWVyeSByZWR1Y3Rpb25cbmZ1bmN0aW9uIE1vbnRnb21lcnkobSkge1xuICAgIHRoaXMubSA9IG07XG4gICAgdGhpcy5tcCA9IG0uaW52RGlnaXQoKTtcbiAgICB0aGlzLm1wbCA9IHRoaXMubXAgJiAweDdmZmY7XG4gICAgdGhpcy5tcGggPSB0aGlzLm1wID4+IDE1O1xuICAgIHRoaXMudW0gPSAoMSA8PCAobS5EQiAtIDE1KSkgLSAxO1xuICAgIHRoaXMubXQyID0gMiAqIG0udDtcbn1cbi8vIHhSIG1vZCBtXG5mdW5jdGlvbiBtb250Q29udmVydCh4KSB7XG4gICAgdmFyIHIgPSBuYmkoKTtcbiAgICB4LmFicygpLmRsU2hpZnRUbyh0aGlzLm0udCwgcik7XG4gICAgci5kaXZSZW1Ubyh0aGlzLm0sIG51bGwsIHIpO1xuICAgIGlmICh4LnMgPCAwICYmIHIuY29tcGFyZVRvKEJpZ0ludGVnZXIuWkVSTykgPiAwKVxuICAgICAgICB0aGlzLm0uc3ViVG8ociwgcik7XG4gICAgcmV0dXJuIHI7XG59XG4vLyB4L1IgbW9kIG1cbmZ1bmN0aW9uIG1vbnRSZXZlcnQoeCkge1xuICAgIHZhciByID0gbmJpKCk7XG4gICAgeC5jb3B5VG8ocik7XG4gICAgdGhpcy5yZWR1Y2Uocik7XG4gICAgcmV0dXJuIHI7XG59XG4vLyB4ID0geC9SIG1vZCBtIChIQUMgMTQuMzIpXG5mdW5jdGlvbiBtb250UmVkdWNlKHgpIHtcbiAgICB3aGlsZSAoeC50IDw9IHRoaXMubXQyKVxuICAgICAgICAvLyBwYWQgeCBzbyBhbSBoYXMgZW5vdWdoIHJvb20gbGF0ZXJcbiAgICAgICAgeFt4LnQrK10gPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tLnQ7ICsraSkge1xuICAgICAgICAvLyBmYXN0ZXIgd2F5IG9mIGNhbGN1bGF0aW5nIHUwID0geFtpXSptcCBtb2QgRFZcbiAgICAgICAgdmFyIGogPSB4W2ldICYgMHg3ZmZmO1xuICAgICAgICB2YXIgdTAgPSAoaiAqIHRoaXMubXBsICsgKCgoaiAqIHRoaXMubXBoICsgKHhbaV0gPj4gMTUpICogdGhpcy5tcGwpICYgdGhpcy51bSkgPDwgMTUpKSAmIHguRE07XG4gICAgICAgIC8vIHVzZSBhbSB0byBjb21iaW5lIHRoZSBtdWx0aXBseS1zaGlmdC1hZGQgaW50byBvbmUgY2FsbFxuICAgICAgICBqID0gaSArIHRoaXMubS50O1xuICAgICAgICB4W2pdICs9IHRoaXMubS5hbSgwLCB1MCwgeCwgaSwgMCwgdGhpcy5tLnQpO1xuICAgICAgICAvLyBwcm9wYWdhdGUgY2FycnlcbiAgICAgICAgd2hpbGUgKHhbal0gPj0geC5EVikge1xuICAgICAgICAgICAgeFtqXSAtPSB4LkRWO1xuICAgICAgICAgICAgeFsrK2pdKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgeC5jbGFtcCgpO1xuICAgIHguZHJTaGlmdFRvKHRoaXMubS50LCB4KTtcbiAgICBpZiAoeC5jb21wYXJlVG8odGhpcy5tKSA+PSAwKVxuICAgICAgICB4LnN1YlRvKHRoaXMubSwgeCk7XG59XG4vLyByID0gXCJ4XjIvUiBtb2QgbVwiOyB4ICE9IHJcbmZ1bmN0aW9uIG1vbnRTcXJUbyh4LCByKSB7XG4gICAgeC5zcXVhcmVUbyhyKTtcbiAgICB0aGlzLnJlZHVjZShyKTtcbn1cbi8vIHIgPSBcInh5L1IgbW9kIG1cIjsgeCx5ICE9IHJcbmZ1bmN0aW9uIG1vbnRNdWxUbyh4LCB5LCByKSB7XG4gICAgeC5tdWx0aXBseVRvKHksIHIpO1xuICAgIHRoaXMucmVkdWNlKHIpO1xufVxuTW9udGdvbWVyeS5wcm90b3R5cGUuY29udmVydCA9IG1vbnRDb252ZXJ0O1xuTW9udGdvbWVyeS5wcm90b3R5cGUucmV2ZXJ0ID0gbW9udFJldmVydDtcbk1vbnRnb21lcnkucHJvdG90eXBlLnJlZHVjZSA9IG1vbnRSZWR1Y2U7XG5Nb250Z29tZXJ5LnByb3RvdHlwZS5tdWxUbyA9IG1vbnRNdWxUbztcbk1vbnRnb21lcnkucHJvdG90eXBlLnNxclRvID0gbW9udFNxclRvO1xuLy8gKHByb3RlY3RlZCkgdHJ1ZSBpZmYgdGhpcyBpcyBldmVuXG5mdW5jdGlvbiBibnBJc0V2ZW4oKSB7XG4gICAgcmV0dXJuICh0aGlzLnQgPiAwID8gdGhpc1swXSAmIDEgOiB0aGlzLnMpID09IDA7XG59XG4vLyAocHJvdGVjdGVkKSB0aGlzXmUsIGUgPCAyXjMyLCBkb2luZyBzcXIgYW5kIG11bCB3aXRoIFwiclwiIChIQUMgMTQuNzkpXG5mdW5jdGlvbiBibnBFeHAoZSwgeikge1xuICAgIGlmIChlID4gMHhmZmZmZmZmZiB8fCBlIDwgMSlcbiAgICAgICAgcmV0dXJuIEJpZ0ludGVnZXIuT05FO1xuICAgIHZhciByID0gbmJpKCksIHIyID0gbmJpKCksIGcgPSB6LmNvbnZlcnQodGhpcyksIGkgPSBuYml0cyhlKSAtIDE7XG4gICAgZy5jb3B5VG8ocik7XG4gICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgIHouc3FyVG8ociwgcjIpO1xuICAgICAgICBpZiAoKGUgJiAoMSA8PCBpKSkgPiAwKSB7XG4gICAgICAgICAgICB6Lm11bFRvKHIyLCBnLCByKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0ID0gcjtcbiAgICAgICAgICAgIHIgPSByMjtcbiAgICAgICAgICAgIHIyID0gdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gei5yZXZlcnQocik7XG59XG4vLyAocHVibGljKSB0aGlzXmUgJSBtLCAwIDw9IGUgPCAyXjMyXG5mdW5jdGlvbiBibk1vZFBvd0ludChlLCBtKSB7XG4gICAgdmFyIHo7XG4gICAgaWYgKGUgPCAyNTYgfHwgbS5pc0V2ZW4oKSlcbiAgICAgICAgeiA9IG5ldyBDbGFzc2ljKG0pO1xuICAgIGVsc2VcbiAgICAgICAgeiA9IG5ldyBNb250Z29tZXJ5KG0pO1xuICAgIHJldHVybiB0aGlzLmV4cChlLCB6KTtcbn1cbi8vIHByb3RlY3RlZFxuQmlnSW50ZWdlci5wcm90b3R5cGUuY29weVRvID0gYm5wQ29weVRvO1xuQmlnSW50ZWdlci5wcm90b3R5cGUuZnJvbUludCA9IGJucEZyb21JbnQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5mcm9tU3RyaW5nID0gYm5wRnJvbVN0cmluZztcbkJpZ0ludGVnZXIucHJvdG90eXBlLmNsYW1wID0gYm5wQ2xhbXA7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5kbFNoaWZ0VG8gPSBibnBETFNoaWZ0VG87XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5kclNoaWZ0VG8gPSBibnBEUlNoaWZ0VG87XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5sU2hpZnRUbyA9IGJucExTaGlmdFRvO1xuQmlnSW50ZWdlci5wcm90b3R5cGUuclNoaWZ0VG8gPSBibnBSU2hpZnRUbztcbkJpZ0ludGVnZXIucHJvdG90eXBlLnN1YlRvID0gYm5wU3ViVG87XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseVRvID0gYm5wTXVsdGlwbHlUbztcbkJpZ0ludGVnZXIucHJvdG90eXBlLnNxdWFyZVRvID0gYm5wU3F1YXJlVG87XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZSZW1UbyA9IGJucERpdlJlbVRvO1xuQmlnSW50ZWdlci5wcm90b3R5cGUuaW52RGlnaXQgPSBibnBJbnZEaWdpdDtcbkJpZ0ludGVnZXIucHJvdG90eXBlLmlzRXZlbiA9IGJucElzRXZlbjtcbkJpZ0ludGVnZXIucHJvdG90eXBlLmV4cCA9IGJucEV4cDtcbi8vIHB1YmxpY1xuQmlnSW50ZWdlci5wcm90b3R5cGUudG9TdHJpbmcgPSBiblRvU3RyaW5nO1xuQmlnSW50ZWdlci5wcm90b3R5cGUubmVnYXRlID0gYm5OZWdhdGU7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5hYnMgPSBibkFicztcbkJpZ0ludGVnZXIucHJvdG90eXBlLmNvbXBhcmVUbyA9IGJuQ29tcGFyZVRvO1xuQmlnSW50ZWdlci5wcm90b3R5cGUuYml0TGVuZ3RoID0gYm5CaXRMZW5ndGg7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2QgPSBibk1vZDtcbkJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvd0ludCA9IGJuTW9kUG93SW50O1xuLy8gXCJjb25zdGFudHNcIlxuQmlnSW50ZWdlci5aRVJPID0gbmJ2KDApO1xuQmlnSW50ZWdlci5PTkUgPSBuYnYoMSk7XG4vLyBDb3B5cmlnaHQgKGMpIDIwMDUtMjAwOSAgVG9tIFd1XG4vLyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy8gU2VlIFwiTElDRU5TRVwiIGZvciBkZXRhaWxzLlxuLy8gRXh0ZW5kZWQgSmF2YVNjcmlwdCBCTiBmdW5jdGlvbnMsIHJlcXVpcmVkIGZvciBSU0EgcHJpdmF0ZSBvcHMuXG4vLyBWZXJzaW9uIDEuMTogbmV3IEJpZ0ludGVnZXIoXCIwXCIsIDEwKSByZXR1cm5zIFwicHJvcGVyXCIgemVyb1xuLy8gVmVyc2lvbiAxLjI6IHNxdWFyZSgpIEFQSSwgaXNQcm9iYWJsZVByaW1lIGZpeFxuLy8gKHB1YmxpYylcbmZ1bmN0aW9uIGJuQ2xvbmUoKSB7XG4gICAgdmFyIHIgPSBuYmkoKTtcbiAgICB0aGlzLmNvcHlUbyhyKTtcbiAgICByZXR1cm4gcjtcbn1cbi8vIChwdWJsaWMpIHJldHVybiB2YWx1ZSBhcyBpbnRlZ2VyXG5mdW5jdGlvbiBibkludFZhbHVlKCkge1xuICAgIGlmICh0aGlzLnMgPCAwKSB7XG4gICAgICAgIGlmICh0aGlzLnQgPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbMF0gLSB0aGlzLkRWO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMudCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLnQgPT0gMSkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy50ID09IDApXG4gICAgICAgIHJldHVybiAwO1xuICAgIC8vIGFzc3VtZXMgMTYgPCBEQiA8IDMyXG4gICAgcmV0dXJuICgodGhpc1sxXSAmICgoMSA8PCAoMzIgLSB0aGlzLkRCKSkgLSAxKSkgPDwgdGhpcy5EQikgfCB0aGlzWzBdO1xufVxuLy8gKHB1YmxpYykgcmV0dXJuIHZhbHVlIGFzIGJ5dGVcbmZ1bmN0aW9uIGJuQnl0ZVZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLnQgPT0gMCA/IHRoaXMucyA6ICh0aGlzWzBdIDw8IDI0KSA+PiAyNDtcbn1cbi8vIChwdWJsaWMpIHJldHVybiB2YWx1ZSBhcyBzaG9ydCAoYXNzdW1lcyBEQj49MTYpXG5mdW5jdGlvbiBiblNob3J0VmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMudCA9PSAwID8gdGhpcy5zIDogKHRoaXNbMF0gPDwgMTYpID4+IDE2O1xufVxuLy8gKHByb3RlY3RlZCkgcmV0dXJuIHggcy50LiByXnggPCBEVlxuZnVuY3Rpb24gYm5wQ2h1bmtTaXplKHIpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoTWF0aC5MTjIgKiB0aGlzLkRCKSAvIE1hdGgubG9nKHIpKTtcbn1cbi8vIChwdWJsaWMpIDAgaWYgdGhpcyA9PSAwLCAxIGlmIHRoaXMgPiAwXG5mdW5jdGlvbiBiblNpZ051bSgpIHtcbiAgICBpZiAodGhpcy5zIDwgMCkge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMudCA8PSAwIHx8ICh0aGlzLnQgPT0gMSAmJiB0aGlzWzBdIDw9IDApKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfVxufVxuLy8gKHByb3RlY3RlZCkgY29udmVydCB0byByYWRpeCBzdHJpbmdcbmZ1bmN0aW9uIGJucFRvUmFkaXgoYikge1xuICAgIGlmIChiID09IG51bGwpXG4gICAgICAgIGIgPSAxMDtcbiAgICBpZiAodGhpcy5zaWdudW0oKSA9PSAwIHx8IGIgPCAyIHx8IGIgPiAzNilcbiAgICAgICAgcmV0dXJuIFwiMFwiO1xuICAgIHZhciBjcyA9IHRoaXMuY2h1bmtTaXplKGIpO1xuICAgIHZhciBhID0gTWF0aC5wb3coYiwgY3MpO1xuICAgIHZhciBkID0gbmJ2KGEpLCB5ID0gbmJpKCksIHogPSBuYmkoKSwgciA9IFwiXCI7XG4gICAgdGhpcy5kaXZSZW1UbyhkLCB5LCB6KTtcbiAgICB3aGlsZSAoeS5zaWdudW0oKSA+IDApIHtcbiAgICAgICAgciA9IChhICsgei5pbnRWYWx1ZSgpKS50b1N0cmluZyhiKS5zdWJzdHJpbmcoMSkgKyByO1xuICAgICAgICB5LmRpdlJlbVRvKGQsIHksIHopO1xuICAgIH1cbiAgICByZXR1cm4gei5pbnRWYWx1ZSgpLnRvU3RyaW5nKGIpICsgcjtcbn1cbi8vIChwcm90ZWN0ZWQpIGNvbnZlcnQgZnJvbSByYWRpeCBzdHJpbmdcbmZ1bmN0aW9uIGJucEZyb21SYWRpeChzLCBiKSB7XG4gICAgdGhpcy5mcm9tSW50KDApO1xuICAgIGlmIChiID09IG51bGwpXG4gICAgICAgIGIgPSAxMDtcbiAgICB2YXIgY3MgPSB0aGlzLmNodW5rU2l6ZShiKTtcbiAgICB2YXIgZCA9IE1hdGgucG93KGIsIGNzKSwgbWkgPSBmYWxzZSwgaiA9IDAsIHcgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgeCA9IGludEF0KHMsIGkpO1xuICAgICAgICBpZiAoeCA8IDApIHtcbiAgICAgICAgICAgIGlmIChzLmNoYXJBdChpKSA9PSBcIi1cIiAmJiB0aGlzLnNpZ251bSgpID09IDApXG4gICAgICAgICAgICAgICAgbWkgPSB0cnVlO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdyA9IGIgKiB3ICsgeDtcbiAgICAgICAgaWYgKCsraiA+PSBjcykge1xuICAgICAgICAgICAgdGhpcy5kTXVsdGlwbHkoZCk7XG4gICAgICAgICAgICB0aGlzLmRBZGRPZmZzZXQodywgMCk7XG4gICAgICAgICAgICBqID0gMDtcbiAgICAgICAgICAgIHcgPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChqID4gMCkge1xuICAgICAgICB0aGlzLmRNdWx0aXBseShNYXRoLnBvdyhiLCBqKSk7XG4gICAgICAgIHRoaXMuZEFkZE9mZnNldCh3LCAwKTtcbiAgICB9XG4gICAgaWYgKG1pKVxuICAgICAgICBCaWdJbnRlZ2VyLlpFUk8uc3ViVG8odGhpcywgdGhpcyk7XG59XG4vLyAocHJvdGVjdGVkKSBhbHRlcm5hdGUgY29uc3RydWN0b3Jcbi8vIHR1dGFvOiBvbiBmaXJzdCBpbnZvY2F0aW9uOlxuLy8gICAgICAgIGEgPSBiaXRsZW5ndGggKDEwMjQpXG4vLyAgICAgICAgYiA9IG51bWJlciBvZiBtaWxsZXIgcmFiaW4gdGVzdCAqIDJcbi8vICAgICAgICBjID0gU2VjdXJlUmFuZG9tXG4vLyAgICAgICBvbiBzZWNvbmQgaW52b2NhdGlvbjpcbi8vICAgICAgICBhID0gYml0bGVuZ3RoICgxMDI0KVxuLy8gICAgICAgIGIgPSBTZWN1cmVSYW5kb21cbi8vICAgICAgICBjID09IHVuZGVmaW5lZFxuZnVuY3Rpb24gYm5wRnJvbU51bWJlcihhLCBiLCBjKSB7XG4gICAgaWYgKFwibnVtYmVyXCIgPT0gdHlwZW9mIGIpIHtcbiAgICAgICAgLy8gbmV3IEJpZ0ludGVnZXIoaW50LGludCxSTkcpXG4gICAgICAgIGlmIChhIDwgMikge1xuICAgICAgICAgICAgdGhpcy5mcm9tSW50KDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcm9tTnVtYmVyKGEsIGMpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnRlc3RCaXQoYSAtIDEpKSB7XG4gICAgICAgICAgICAgICAgLy8gZm9yY2UgTVNCIHNldFxuICAgICAgICAgICAgICAgIHRoaXMuYml0d2lzZVRvKEJpZ0ludGVnZXIuT05FLnNoaWZ0TGVmdChhIC0gMSksIG9wX29yLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmlzRXZlbigpKVxuICAgICAgICAgICAgICAgIHRoaXMuZEFkZE9mZnNldCgxLCAwKTsgLy8gZm9yY2Ugb2RkXG4gICAgICAgICAgICB3aGlsZSAoIXRoaXMuaXNQcm9iYWJsZVByaW1lKGIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kQWRkT2Zmc2V0KDIsIDApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJpdExlbmd0aCgpID4gYSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJUbyhCaWdJbnRlZ2VyLk9ORS5zaGlmdExlZnQoYSAtIDEpLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gbmV3IEJpZ0ludGVnZXIoaW50LFJORylcbiAgICAgICAgdmFyIHggPSBuZXcgQXJyYXkoKSwgdCA9IGEgJiA3O1xuICAgICAgICB4Lmxlbmd0aCA9IChhID4+IDMpICsgMTtcbiAgICAgICAgYi5uZXh0Qnl0ZXMoeCk7XG4gICAgICAgIGlmICh0ID4gMClcbiAgICAgICAgICAgIHhbMF0gJj0gKDEgPDwgdCkgLSAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4WzBdID0gMDtcbiAgICAgICAgdGhpcy5mcm9tU3RyaW5nKHgsIDI1Nik7XG4gICAgfVxufVxuLy8gKHB1YmxpYykgY29udmVydCB0byBiaWdlbmRpYW4gYnl0ZSBhcnJheVxuZnVuY3Rpb24gYm5Ub0J5dGVBcnJheSgpIHtcbiAgICB2YXIgaSA9IHRoaXMudCwgciA9IG5ldyBBcnJheSgpO1xuICAgIHJbMF0gPSB0aGlzLnM7XG4gICAgdmFyIHAgPSB0aGlzLkRCIC0gKChpICogdGhpcy5EQikgJSA4KSwgZCwgayA9IDA7XG4gICAgaWYgKGktLSA+IDApIHtcbiAgICAgICAgaWYgKHAgPCB0aGlzLkRCICYmIChkID0gdGhpc1tpXSA+PiBwKSAhPSAodGhpcy5zICYgdGhpcy5ETSkgPj4gcCkge1xuICAgICAgICAgICAgcltrKytdID0gZCB8ICh0aGlzLnMgPDwgKHRoaXMuREIgLSBwKSk7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGkgPj0gMCkge1xuICAgICAgICAgICAgaWYgKHAgPCA4KSB7XG4gICAgICAgICAgICAgICAgZCA9ICh0aGlzW2ldICYgKCgxIDw8IHApIC0gMSkpIDw8ICg4IC0gcCk7XG4gICAgICAgICAgICAgICAgZCB8PSB0aGlzWy0taV0gPj4gKHAgKz0gdGhpcy5EQiAtIDgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZCA9ICh0aGlzW2ldID4+IChwIC09IDgpKSAmIDB4ZmY7XG4gICAgICAgICAgICAgICAgaWYgKHAgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBwICs9IHRoaXMuREI7XG4gICAgICAgICAgICAgICAgICAgIC0taTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKGQgJiAweDgwKSAhPSAwKVxuICAgICAgICAgICAgICAgIGQgfD0gLTI1NjtcbiAgICAgICAgICAgIGlmIChrID09IDAgJiYgKHRoaXMucyAmIDB4ODApICE9IChkICYgMHg4MCkpXG4gICAgICAgICAgICAgICAgKytrO1xuICAgICAgICAgICAgaWYgKGsgPiAwIHx8IGQgIT0gdGhpcy5zKVxuICAgICAgICAgICAgICAgIHJbaysrXSA9IGQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHI7XG59XG5mdW5jdGlvbiBibkVxdWFscyhhKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZVRvKGEpID09IDA7XG59XG5mdW5jdGlvbiBibk1pbihhKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZVRvKGEpIDwgMCA/IHRoaXMgOiBhO1xufVxuZnVuY3Rpb24gYm5NYXgoYSkge1xuICAgIHJldHVybiB0aGlzLmNvbXBhcmVUbyhhKSA+IDAgPyB0aGlzIDogYTtcbn1cbi8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzIG9wIGEgKGJpdHdpc2UpXG5mdW5jdGlvbiBibnBCaXR3aXNlVG8oYSwgb3AsIHIpIHtcbiAgICB2YXIgaSwgZiwgbSA9IE1hdGgubWluKGEudCwgdGhpcy50KTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbTsgKytpKVxuICAgICAgICByW2ldID0gb3AodGhpc1tpXSwgYVtpXSk7XG4gICAgaWYgKGEudCA8IHRoaXMudCkge1xuICAgICAgICBmID0gYS5zICYgdGhpcy5ETTtcbiAgICAgICAgZm9yIChpID0gbTsgaSA8IHRoaXMudDsgKytpKVxuICAgICAgICAgICAgcltpXSA9IG9wKHRoaXNbaV0sIGYpO1xuICAgICAgICByLnQgPSB0aGlzLnQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmID0gdGhpcy5zICYgdGhpcy5ETTtcbiAgICAgICAgZm9yIChpID0gbTsgaSA8IGEudDsgKytpKVxuICAgICAgICAgICAgcltpXSA9IG9wKGYsIGFbaV0pO1xuICAgICAgICByLnQgPSBhLnQ7XG4gICAgfVxuICAgIHIucyA9IG9wKHRoaXMucywgYS5zKTtcbiAgICByLmNsYW1wKCk7XG59XG4vLyAocHVibGljKSB0aGlzICYgYVxuZnVuY3Rpb24gb3BfYW5kKHgsIHkpIHtcbiAgICByZXR1cm4geCAmIHk7XG59XG5mdW5jdGlvbiBibkFuZChhKSB7XG4gICAgdmFyIHIgPSBuYmkoKTtcbiAgICB0aGlzLmJpdHdpc2VUbyhhLCBvcF9hbmQsIHIpO1xuICAgIHJldHVybiByO1xufVxuLy8gKHB1YmxpYykgdGhpcyB8IGFcbmZ1bmN0aW9uIG9wX29yKHgsIHkpIHtcbiAgICByZXR1cm4geCB8IHk7XG59XG5mdW5jdGlvbiBibk9yKGEpIHtcbiAgICB2YXIgciA9IG5iaSgpO1xuICAgIHRoaXMuYml0d2lzZVRvKGEsIG9wX29yLCByKTtcbiAgICByZXR1cm4gcjtcbn1cbi8vIChwdWJsaWMpIHRoaXMgXiBhXG5mdW5jdGlvbiBvcF94b3IoeCwgeSkge1xuICAgIHJldHVybiB4IF4geTtcbn1cbmZ1bmN0aW9uIGJuWG9yKGEpIHtcbiAgICB2YXIgciA9IG5iaSgpO1xuICAgIHRoaXMuYml0d2lzZVRvKGEsIG9wX3hvciwgcik7XG4gICAgcmV0dXJuIHI7XG59XG4vLyAocHVibGljKSB0aGlzICYgfmFcbmZ1bmN0aW9uIG9wX2FuZG5vdCh4LCB5KSB7XG4gICAgcmV0dXJuIHggJiB+eTtcbn1cbmZ1bmN0aW9uIGJuQW5kTm90KGEpIHtcbiAgICB2YXIgciA9IG5iaSgpO1xuICAgIHRoaXMuYml0d2lzZVRvKGEsIG9wX2FuZG5vdCwgcik7XG4gICAgcmV0dXJuIHI7XG59XG4vLyAocHVibGljKSB+dGhpc1xuZnVuY3Rpb24gYm5Ob3QoKSB7XG4gICAgdmFyIHIgPSBuYmkoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudDsgKytpKVxuICAgICAgICByW2ldID0gdGhpcy5ETSAmIH50aGlzW2ldO1xuICAgIHIudCA9IHRoaXMudDtcbiAgICByLnMgPSB+dGhpcy5zO1xuICAgIHJldHVybiByO1xufVxuLy8gKHB1YmxpYykgdGhpcyA8PCBuXG5mdW5jdGlvbiBiblNoaWZ0TGVmdChuKSB7XG4gICAgdmFyIHIgPSBuYmkoKTtcbiAgICBpZiAobiA8IDApXG4gICAgICAgIHRoaXMuclNoaWZ0VG8oLW4sIHIpO1xuICAgIGVsc2VcbiAgICAgICAgdGhpcy5sU2hpZnRUbyhuLCByKTtcbiAgICByZXR1cm4gcjtcbn1cbi8vIChwdWJsaWMpIHRoaXMgPj4gblxuZnVuY3Rpb24gYm5TaGlmdFJpZ2h0KG4pIHtcbiAgICB2YXIgciA9IG5iaSgpO1xuICAgIGlmIChuIDwgMClcbiAgICAgICAgdGhpcy5sU2hpZnRUbygtbiwgcik7XG4gICAgZWxzZVxuICAgICAgICB0aGlzLnJTaGlmdFRvKG4sIHIpO1xuICAgIHJldHVybiByO1xufVxuLy8gcmV0dXJuIGluZGV4IG9mIGxvd2VzdCAxLWJpdCBpbiB4LCB4IDwgMl4zMVxuZnVuY3Rpb24gbGJpdCh4KSB7XG4gICAgaWYgKHggPT0gMClcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIHZhciByID0gMDtcbiAgICBpZiAoKHggJiAweGZmZmYpID09IDApIHtcbiAgICAgICAgeCA+Pj0gMTY7XG4gICAgICAgIHIgKz0gMTY7XG4gICAgfVxuICAgIGlmICgoeCAmIDB4ZmYpID09IDApIHtcbiAgICAgICAgeCA+Pj0gODtcbiAgICAgICAgciArPSA4O1xuICAgIH1cbiAgICBpZiAoKHggJiAweGYpID09IDApIHtcbiAgICAgICAgeCA+Pj0gNDtcbiAgICAgICAgciArPSA0O1xuICAgIH1cbiAgICBpZiAoKHggJiAzKSA9PSAwKSB7XG4gICAgICAgIHggPj49IDI7XG4gICAgICAgIHIgKz0gMjtcbiAgICB9XG4gICAgaWYgKCh4ICYgMSkgPT0gMClcbiAgICAgICAgKytyO1xuICAgIHJldHVybiByO1xufVxuLy8gKHB1YmxpYykgcmV0dXJucyBpbmRleCBvZiBsb3dlc3QgMS1iaXQgKG9yIC0xIGlmIG5vbmUpXG5mdW5jdGlvbiBibkdldExvd2VzdFNldEJpdCgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudDsgKytpKVxuICAgICAgICBpZiAodGhpc1tpXSAhPSAwKVxuICAgICAgICAgICAgcmV0dXJuIGkgKiB0aGlzLkRCICsgbGJpdCh0aGlzW2ldKTtcbiAgICBpZiAodGhpcy5zIDwgMClcbiAgICAgICAgcmV0dXJuIHRoaXMudCAqIHRoaXMuREI7XG4gICAgcmV0dXJuIC0xO1xufVxuLy8gcmV0dXJuIG51bWJlciBvZiAxIGJpdHMgaW4geFxuZnVuY3Rpb24gY2JpdCh4KSB7XG4gICAgdmFyIHIgPSAwO1xuICAgIHdoaWxlICh4ICE9IDApIHtcbiAgICAgICAgeCAmPSB4IC0gMTtcbiAgICAgICAgKytyO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbn1cbi8vIChwdWJsaWMpIHJldHVybiBudW1iZXIgb2Ygc2V0IGJpdHNcbmZ1bmN0aW9uIGJuQml0Q291bnQoKSB7XG4gICAgdmFyIHIgPSAwLCB4ID0gdGhpcy5zICYgdGhpcy5ETTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudDsgKytpKVxuICAgICAgICByICs9IGNiaXQodGhpc1tpXSBeIHgpO1xuICAgIHJldHVybiByO1xufVxuLy8gKHB1YmxpYykgdHJ1ZSBpZmYgbnRoIGJpdCBpcyBzZXRcbmZ1bmN0aW9uIGJuVGVzdEJpdChuKSB7XG4gICAgdmFyIGogPSBNYXRoLmZsb29yKG4gLyB0aGlzLkRCKTtcbiAgICBpZiAoaiA+PSB0aGlzLnQpXG4gICAgICAgIHJldHVybiB0aGlzLnMgIT0gMDtcbiAgICByZXR1cm4gKHRoaXNbal0gJiAoMSA8PCBuICUgdGhpcy5EQikpICE9IDA7XG59XG4vLyAocHJvdGVjdGVkKSB0aGlzIG9wICgxPDxuKVxuZnVuY3Rpb24gYm5wQ2hhbmdlQml0KG4sIG9wKSB7XG4gICAgdmFyIHIgPSBCaWdJbnRlZ2VyLk9ORS5zaGlmdExlZnQobik7XG4gICAgdGhpcy5iaXR3aXNlVG8ociwgb3AsIHIpO1xuICAgIHJldHVybiByO1xufVxuLy8gKHB1YmxpYykgdGhpcyB8ICgxPDxuKVxuZnVuY3Rpb24gYm5TZXRCaXQobikge1xuICAgIHJldHVybiB0aGlzLmNoYW5nZUJpdChuLCBvcF9vcik7XG59XG4vLyAocHVibGljKSB0aGlzICYgfigxPDxuKVxuZnVuY3Rpb24gYm5DbGVhckJpdChuKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hhbmdlQml0KG4sIG9wX2FuZG5vdCk7XG59XG4vLyAocHVibGljKSB0aGlzIF4gKDE8PG4pXG5mdW5jdGlvbiBibkZsaXBCaXQobikge1xuICAgIHJldHVybiB0aGlzLmNoYW5nZUJpdChuLCBvcF94b3IpO1xufVxuLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgKyBhXG5mdW5jdGlvbiBibnBBZGRUbyhhLCByKSB7XG4gICAgdmFyIGkgPSAwLCBjID0gMCwgbSA9IE1hdGgubWluKGEudCwgdGhpcy50KTtcbiAgICB3aGlsZSAoaSA8IG0pIHtcbiAgICAgICAgYyArPSB0aGlzW2ldICsgYVtpXTtcbiAgICAgICAgcltpKytdID0gYyAmIHRoaXMuRE07XG4gICAgICAgIGMgPj49IHRoaXMuREI7XG4gICAgfVxuICAgIGlmIChhLnQgPCB0aGlzLnQpIHtcbiAgICAgICAgYyArPSBhLnM7XG4gICAgICAgIHdoaWxlIChpIDwgdGhpcy50KSB7XG4gICAgICAgICAgICBjICs9IHRoaXNbaV07XG4gICAgICAgICAgICByW2krK10gPSBjICYgdGhpcy5ETTtcbiAgICAgICAgICAgIGMgPj49IHRoaXMuREI7XG4gICAgICAgIH1cbiAgICAgICAgYyArPSB0aGlzLnM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjICs9IHRoaXMucztcbiAgICAgICAgd2hpbGUgKGkgPCBhLnQpIHtcbiAgICAgICAgICAgIGMgKz0gYVtpXTtcbiAgICAgICAgICAgIHJbaSsrXSA9IGMgJiB0aGlzLkRNO1xuICAgICAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICAgICAgfVxuICAgICAgICBjICs9IGEucztcbiAgICB9XG4gICAgci5zID0gYyA8IDAgPyAtMSA6IDA7XG4gICAgaWYgKGMgPiAwKSB7XG4gICAgICAgIHJbaSsrXSA9IGM7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMgPCAtMSlcbiAgICAgICAgcltpKytdID0gdGhpcy5EViArIGM7XG4gICAgci50ID0gaTtcbiAgICByLmNsYW1wKCk7XG59XG4vLyAocHVibGljKSB0aGlzICsgYVxuZnVuY3Rpb24gYm5BZGQoYSkge1xuICAgIHZhciByID0gbmJpKCk7XG4gICAgdGhpcy5hZGRUbyhhLCByKTtcbiAgICByZXR1cm4gcjtcbn1cbi8vIChwdWJsaWMpIHRoaXMgLSBhXG5mdW5jdGlvbiBiblN1YnRyYWN0KGEpIHtcbiAgICB2YXIgciA9IG5iaSgpO1xuICAgIHRoaXMuc3ViVG8oYSwgcik7XG4gICAgcmV0dXJuIHI7XG59XG4vLyAocHVibGljKSB0aGlzICogYVxuZnVuY3Rpb24gYm5NdWx0aXBseShhKSB7XG4gICAgdmFyIHIgPSBuYmkoKTtcbiAgICB0aGlzLm11bHRpcGx5VG8oYSwgcik7XG4gICAgcmV0dXJuIHI7XG59XG4vLyAocHVibGljKSB0aGlzXjJcbmZ1bmN0aW9uIGJuU3F1YXJlKCkge1xuICAgIHZhciByID0gbmJpKCk7XG4gICAgdGhpcy5zcXVhcmVUbyhyKTtcbiAgICByZXR1cm4gcjtcbn1cbi8vIChwdWJsaWMpIHRoaXMgLyBhXG5mdW5jdGlvbiBibkRpdmlkZShhKSB7XG4gICAgdmFyIHIgPSBuYmkoKTtcbiAgICB0aGlzLmRpdlJlbVRvKGEsIHIsIG51bGwpO1xuICAgIHJldHVybiByO1xufVxuLy8gKHB1YmxpYykgdGhpcyAlIGFcbmZ1bmN0aW9uIGJuUmVtYWluZGVyKGEpIHtcbiAgICB2YXIgciA9IG5iaSgpO1xuICAgIHRoaXMuZGl2UmVtVG8oYSwgbnVsbCwgcik7XG4gICAgcmV0dXJuIHI7XG59XG4vLyAocHVibGljKSBbdGhpcy9hLHRoaXMlYV1cbmZ1bmN0aW9uIGJuRGl2aWRlQW5kUmVtYWluZGVyKGEpIHtcbiAgICB2YXIgcSA9IG5iaSgpLCByID0gbmJpKCk7XG4gICAgdGhpcy5kaXZSZW1UbyhhLCBxLCByKTtcbiAgICByZXR1cm4gbmV3IEFycmF5KHEsIHIpO1xufVxuLy8gKHByb3RlY3RlZCkgdGhpcyAqPSBuLCB0aGlzID49IDAsIDEgPCBuIDwgRFZcbmZ1bmN0aW9uIGJucERNdWx0aXBseShuKSB7XG4gICAgdGhpc1t0aGlzLnRdID0gdGhpcy5hbSgwLCBuIC0gMSwgdGhpcywgMCwgMCwgdGhpcy50KTtcbiAgICArK3RoaXMudDtcbiAgICB0aGlzLmNsYW1wKCk7XG59XG4vLyAocHJvdGVjdGVkKSB0aGlzICs9IG4gPDwgdyB3b3JkcywgdGhpcyA+PSAwXG5mdW5jdGlvbiBibnBEQWRkT2Zmc2V0KG4sIHcpIHtcbiAgICBpZiAobiA9PSAwKVxuICAgICAgICByZXR1cm47XG4gICAgd2hpbGUgKHRoaXMudCA8PSB3KVxuICAgICAgICB0aGlzW3RoaXMudCsrXSA9IDA7XG4gICAgdGhpc1t3XSArPSBuO1xuICAgIHdoaWxlICh0aGlzW3ddID49IHRoaXMuRFYpIHtcbiAgICAgICAgdGhpc1t3XSAtPSB0aGlzLkRWO1xuICAgICAgICBpZiAoKyt3ID49IHRoaXMudClcbiAgICAgICAgICAgIHRoaXNbdGhpcy50KytdID0gMDtcbiAgICAgICAgKyt0aGlzW3ddO1xuICAgIH1cbn1cbi8vIEEgXCJudWxsXCIgcmVkdWNlclxuZnVuY3Rpb24gTnVsbEV4cCgpIHsgfVxuZnVuY3Rpb24gbk5vcCh4KSB7XG4gICAgcmV0dXJuIHg7XG59XG5mdW5jdGlvbiBuTXVsVG8oeCwgeSwgcikge1xuICAgIHgubXVsdGlwbHlUbyh5LCByKTtcbn1cbmZ1bmN0aW9uIG5TcXJUbyh4LCByKSB7XG4gICAgeC5zcXVhcmVUbyhyKTtcbn1cbk51bGxFeHAucHJvdG90eXBlLmNvbnZlcnQgPSBuTm9wO1xuTnVsbEV4cC5wcm90b3R5cGUucmV2ZXJ0ID0gbk5vcDtcbk51bGxFeHAucHJvdG90eXBlLm11bFRvID0gbk11bFRvO1xuTnVsbEV4cC5wcm90b3R5cGUuc3FyVG8gPSBuU3FyVG87XG4vLyAocHVibGljKSB0aGlzXmVcbmZ1bmN0aW9uIGJuUG93KGUpIHtcbiAgICByZXR1cm4gdGhpcy5leHAoZSwgbmV3IE51bGxFeHAoKSk7XG59XG4vLyAocHJvdGVjdGVkKSByID0gbG93ZXIgbiB3b3JkcyBvZiBcInRoaXMgKiBhXCIsIGEudCA8PSBuXG4vLyBcInRoaXNcIiBzaG91bGQgYmUgdGhlIGxhcmdlciBvbmUgaWYgYXBwcm9wcmlhdGUuXG5mdW5jdGlvbiBibnBNdWx0aXBseUxvd2VyVG8oYSwgbiwgcikge1xuICAgIHZhciBpID0gTWF0aC5taW4odGhpcy50ICsgYS50LCBuKTtcbiAgICByLnMgPSAwOyAvLyBhc3N1bWVzIGEsdGhpcyA+PSAwXG4gICAgci50ID0gaTtcbiAgICB3aGlsZSAoaSA+IDApXG4gICAgICAgIHJbLS1pXSA9IDA7XG4gICAgdmFyIGo7XG4gICAgZm9yIChqID0gci50IC0gdGhpcy50OyBpIDwgajsgKytpKVxuICAgICAgICByW2kgKyB0aGlzLnRdID0gdGhpcy5hbSgwLCBhW2ldLCByLCBpLCAwLCB0aGlzLnQpO1xuICAgIGZvciAoaiA9IE1hdGgubWluKGEudCwgbik7IGkgPCBqOyArK2kpXG4gICAgICAgIHRoaXMuYW0oMCwgYVtpXSwgciwgaSwgMCwgbiAtIGkpO1xuICAgIHIuY2xhbXAoKTtcbn1cbi8vIChwcm90ZWN0ZWQpIHIgPSBcInRoaXMgKiBhXCIgd2l0aG91dCBsb3dlciBuIHdvcmRzLCBuID4gMFxuLy8gXCJ0aGlzXCIgc2hvdWxkIGJlIHRoZSBsYXJnZXIgb25lIGlmIGFwcHJvcHJpYXRlLlxuZnVuY3Rpb24gYm5wTXVsdGlwbHlVcHBlclRvKGEsIG4sIHIpIHtcbiAgICAtLW47XG4gICAgdmFyIGkgPSAoci50ID0gdGhpcy50ICsgYS50IC0gbik7XG4gICAgci5zID0gMDsgLy8gYXNzdW1lcyBhLHRoaXMgPj0gMFxuICAgIHdoaWxlICgtLWkgPj0gMClcbiAgICAgICAgcltpXSA9IDA7XG4gICAgZm9yIChpID0gTWF0aC5tYXgobiAtIHRoaXMudCwgMCk7IGkgPCBhLnQ7ICsraSlcbiAgICAgICAgclt0aGlzLnQgKyBpIC0gbl0gPSB0aGlzLmFtKG4gLSBpLCBhW2ldLCByLCAwLCAwLCB0aGlzLnQgKyBpIC0gbik7XG4gICAgci5jbGFtcCgpO1xuICAgIHIuZHJTaGlmdFRvKDEsIHIpO1xufVxuLy8gQmFycmV0dCBtb2R1bGFyIHJlZHVjdGlvblxuZnVuY3Rpb24gQmFycmV0dChtKSB7XG4gICAgLy8gc2V0dXAgQmFycmV0dFxuICAgIHRoaXMucjIgPSBuYmkoKTtcbiAgICB0aGlzLnEzID0gbmJpKCk7XG4gICAgQmlnSW50ZWdlci5PTkUuZGxTaGlmdFRvKDIgKiBtLnQsIHRoaXMucjIpO1xuICAgIHRoaXMubXUgPSB0aGlzLnIyLmRpdmlkZShtKTtcbiAgICB0aGlzLm0gPSBtO1xufVxuZnVuY3Rpb24gYmFycmV0dENvbnZlcnQoeCkge1xuICAgIGlmICh4LnMgPCAwIHx8IHgudCA+IDIgKiB0aGlzLm0udCkge1xuICAgICAgICByZXR1cm4geC5tb2QodGhpcy5tKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoeC5jb21wYXJlVG8odGhpcy5tKSA8IDApIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgciA9IG5iaSgpO1xuICAgICAgICB4LmNvcHlUbyhyKTtcbiAgICAgICAgdGhpcy5yZWR1Y2Uocik7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGJhcnJldHRSZXZlcnQoeCkge1xuICAgIHJldHVybiB4O1xufVxuLy8geCA9IHggbW9kIG0gKEhBQyAxNC40MilcbmZ1bmN0aW9uIGJhcnJldHRSZWR1Y2UoeCkge1xuICAgIHguZHJTaGlmdFRvKHRoaXMubS50IC0gMSwgdGhpcy5yMik7XG4gICAgaWYgKHgudCA+IHRoaXMubS50ICsgMSkge1xuICAgICAgICB4LnQgPSB0aGlzLm0udCArIDE7XG4gICAgICAgIHguY2xhbXAoKTtcbiAgICB9XG4gICAgdGhpcy5tdS5tdWx0aXBseVVwcGVyVG8odGhpcy5yMiwgdGhpcy5tLnQgKyAxLCB0aGlzLnEzKTtcbiAgICB0aGlzLm0ubXVsdGlwbHlMb3dlclRvKHRoaXMucTMsIHRoaXMubS50ICsgMSwgdGhpcy5yMik7XG4gICAgd2hpbGUgKHguY29tcGFyZVRvKHRoaXMucjIpIDwgMClcbiAgICAgICAgeC5kQWRkT2Zmc2V0KDEsIHRoaXMubS50ICsgMSk7XG4gICAgeC5zdWJUbyh0aGlzLnIyLCB4KTtcbiAgICB3aGlsZSAoeC5jb21wYXJlVG8odGhpcy5tKSA+PSAwKVxuICAgICAgICB4LnN1YlRvKHRoaXMubSwgeCk7XG59XG4vLyByID0geF4yIG1vZCBtOyB4ICE9IHJcbmZ1bmN0aW9uIGJhcnJldHRTcXJUbyh4LCByKSB7XG4gICAgeC5zcXVhcmVUbyhyKTtcbiAgICB0aGlzLnJlZHVjZShyKTtcbn1cbi8vIHIgPSB4KnkgbW9kIG07IHgseSAhPSByXG5mdW5jdGlvbiBiYXJyZXR0TXVsVG8oeCwgeSwgcikge1xuICAgIHgubXVsdGlwbHlUbyh5LCByKTtcbiAgICB0aGlzLnJlZHVjZShyKTtcbn1cbkJhcnJldHQucHJvdG90eXBlLmNvbnZlcnQgPSBiYXJyZXR0Q29udmVydDtcbkJhcnJldHQucHJvdG90eXBlLnJldmVydCA9IGJhcnJldHRSZXZlcnQ7XG5CYXJyZXR0LnByb3RvdHlwZS5yZWR1Y2UgPSBiYXJyZXR0UmVkdWNlO1xuQmFycmV0dC5wcm90b3R5cGUubXVsVG8gPSBiYXJyZXR0TXVsVG87XG5CYXJyZXR0LnByb3RvdHlwZS5zcXJUbyA9IGJhcnJldHRTcXJUbztcbi8vIChwdWJsaWMpIHRoaXNeZSAlIG0gKEhBQyAxNC44NSlcbmZ1bmN0aW9uIGJuTW9kUG93KGUsIG0pIHtcbiAgICAvLyB3ZSBzd2l0Y2hlZCB0byBsZWVtb25zIGJpZ2ludCBsaWIgZm9yIG1vZHBvdywgYXMgdGhpcyBpcyBmYXN0ZXIgb24gc2FmYXJpIGJyb3dzZXJzIChyZWR1Y2VkIHRoZSBkZWNyeXB0aW9uIHRpbWVzOiA5cyAtPiAzLDRzKVxuICAgIC8vIFRPRE8gaW50cm9kdWNlIHN3aXRjaCBmb3Igb3RoZXIgYnJvd3NlcnMsIGFzIHRoZXkgYXJlIHNsb3dlciAoYnkgZmFjdG9yIDAuNSkgYmVjYXVzZSBvZiB0aGUgY29udmVyc2lvbiBvdmVyaGVhZFxuICAgIHZhciB4SGV4ID0gdGhpcy50b1N0cmluZygxNik7XG4gICAgdmFyIGVIZXggPSBlLnRvU3RyaW5nKDE2KTtcbiAgICB2YXIgbUhleCA9IG0udG9TdHJpbmcoMTYpO1xuICAgIHZhciByZXN1bHQgPSBwb3dNb2Qoc3RyMmJpZ0ludCh4SGV4LCAxNiksIHN0cjJiaWdJbnQoZUhleCwgMTYpLCBzdHIyYmlnSW50KG1IZXgsIDE2KSk7XG4gICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGJpZ0ludDJzdHIocmVzdWx0LCAxNiksIDE2KTtcbiAgICAvLyAgdmFyIGkgPSBlLmJpdExlbmd0aCgpLCBrLCByID0gbmJ2KDEpLCB6O1xuICAgIC8vICBpZihpIDw9IDApIHJldHVybiByO1xuICAgIC8vICBlbHNlIGlmKGkgPCAxOCkgayA9IDE7XG4gICAgLy8gIGVsc2UgaWYoaSA8IDQ4KSBrID0gMztcbiAgICAvLyAgZWxzZSBpZihpIDwgMTQ0KSBrID0gNDtcbiAgICAvLyAgZWxzZSBpZihpIDwgNzY4KSBrID0gNTtcbiAgICAvLyAgZWxzZSBrID0gNjtcbiAgICAvLyAgaWYoaSA8IDgpXG4gICAgLy8gICAgeiA9IG5ldyBDbGFzc2ljKG0pO1xuICAgIC8vICBlbHNlIGlmKG0uaXNFdmVuKCkpXG4gICAgLy8gICAgeiA9IG5ldyBCYXJyZXR0KG0pO1xuICAgIC8vICBlbHNlXG4gICAgLy8gICAgeiA9IG5ldyBNb250Z29tZXJ5KG0pO1xuICAgIC8vXG4gICAgLy8gIC8vIHByZWNvbXB1dGF0aW9uXG4gICAgLy8gIHZhciBnID0gbmV3IEFycmF5KCksIG4gPSAzLCBrMSA9IGstMSwga20gPSAoMTw8ayktMTtcbiAgICAvLyAgZ1sxXSA9IHouY29udmVydCh0aGlzKTtcbiAgICAvLyAgaWYoayA+IDEpIHtcbiAgICAvLyAgICB2YXIgZzIgPSBuYmkoKTtcbiAgICAvLyAgICB6LnNxclRvKGdbMV0sZzIpO1xuICAgIC8vICAgIHdoaWxlKG4gPD0ga20pIHtcbiAgICAvLyAgICAgIGdbbl0gPSBuYmkoKTtcbiAgICAvLyAgICAgIHoubXVsVG8oZzIsZ1tuLTJdLGdbbl0pO1xuICAgIC8vICAgICAgbiArPSAyO1xuICAgIC8vICAgIH1cbiAgICAvLyAgfVxuICAgIC8vXG4gICAgLy8gIHZhciBqID0gZS50LTEsIHcsIGlzMSA9IHRydWUsIHIyID0gbmJpKCksIHQ7XG4gICAgLy8gIGkgPSBuYml0cyhlW2pdKS0xO1xuICAgIC8vICB3aGlsZShqID49IDApIHtcbiAgICAvLyAgICBpZihpID49IGsxKSB3ID0gKGVbal0+PihpLWsxKSkma207XG4gICAgLy8gICAgZWxzZSB7XG4gICAgLy8gICAgICB3ID0gKGVbal0mKCgxPDwoaSsxKSktMSkpPDwoazEtaSk7XG4gICAgLy8gICAgICBpZihqID4gMCkgdyB8PSBlW2otMV0+Pih0aGlzLkRCK2ktazEpO1xuICAgIC8vICAgIH1cbiAgICAvL1xuICAgIC8vICAgIG4gPSBrO1xuICAgIC8vICAgIHdoaWxlKCh3JjEpID09IDApIHsgdyA+Pj0gMTsgLS1uOyB9XG4gICAgLy8gICAgaWYoKGkgLT0gbikgPCAwKSB7IGkgKz0gdGhpcy5EQjsgLS1qOyB9XG4gICAgLy8gICAgaWYoaXMxKSB7XHQvLyByZXQgPT0gMSwgZG9uJ3QgYm90aGVyIHNxdWFyaW5nIG9yIG11bHRpcGx5aW5nIGl0XG4gICAgLy8gICAgICBnW3ddLmNvcHlUbyhyKTtcbiAgICAvLyAgICAgIGlzMSA9IGZhbHNlO1xuICAgIC8vICAgIH1cbiAgICAvLyAgICBlbHNlIHtcbiAgICAvLyAgICAgIHdoaWxlKG4gPiAxKSB7IHouc3FyVG8ocixyMik7IHouc3FyVG8ocjIscik7IG4gLT0gMjsgfVxuICAgIC8vICAgICAgaWYobiA+IDApIHouc3FyVG8ocixyMik7IGVsc2UgeyB0ID0gcjsgciA9IHIyOyByMiA9IHQ7IH1cbiAgICAvLyAgICAgIHoubXVsVG8ocjIsZ1t3XSxyKTtcbiAgICAvLyAgICB9XG4gICAgLy9cbiAgICAvLyAgICB3aGlsZShqID49IDAgJiYgKGVbal0mKDE8PGkpKSA9PSAwKSB7XG4gICAgLy8gICAgICB6LnNxclRvKHIscjIpOyB0ID0gcjsgciA9IHIyOyByMiA9IHQ7XG4gICAgLy8gICAgICBpZigtLWkgPCAwKSB7IGkgPSB0aGlzLkRCLTE7IC0tajsgfVxuICAgIC8vICAgIH1cbiAgICAvLyAgfVxuICAgIC8vICByZXR1cm4gei5yZXZlcnQocik7XG59XG4vLyAocHVibGljKSBnY2QodGhpcyxhKSAoSEFDIDE0LjU0KVxuZnVuY3Rpb24gYm5HQ0QoYSkge1xuICAgIHZhciB4ID0gdGhpcy5zIDwgMCA/IHRoaXMubmVnYXRlKCkgOiB0aGlzLmNsb25lKCk7XG4gICAgdmFyIHkgPSBhLnMgPCAwID8gYS5uZWdhdGUoKSA6IGEuY2xvbmUoKTtcbiAgICBpZiAoeC5jb21wYXJlVG8oeSkgPCAwKSB7XG4gICAgICAgIHZhciB0ID0geDtcbiAgICAgICAgeCA9IHk7XG4gICAgICAgIHkgPSB0O1xuICAgIH1cbiAgICB2YXIgaSA9IHguZ2V0TG93ZXN0U2V0Qml0KCksIGcgPSB5LmdldExvd2VzdFNldEJpdCgpO1xuICAgIGlmIChnIDwgMClcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgaWYgKGkgPCBnKVxuICAgICAgICBnID0gaTtcbiAgICBpZiAoZyA+IDApIHtcbiAgICAgICAgeC5yU2hpZnRUbyhnLCB4KTtcbiAgICAgICAgeS5yU2hpZnRUbyhnLCB5KTtcbiAgICB9XG4gICAgd2hpbGUgKHguc2lnbnVtKCkgPiAwKSB7XG4gICAgICAgIGlmICgoaSA9IHguZ2V0TG93ZXN0U2V0Qml0KCkpID4gMClcbiAgICAgICAgICAgIHguclNoaWZ0VG8oaSwgeCk7XG4gICAgICAgIGlmICgoaSA9IHkuZ2V0TG93ZXN0U2V0Qml0KCkpID4gMClcbiAgICAgICAgICAgIHkuclNoaWZ0VG8oaSwgeSk7XG4gICAgICAgIGlmICh4LmNvbXBhcmVUbyh5KSA+PSAwKSB7XG4gICAgICAgICAgICB4LnN1YlRvKHksIHgpO1xuICAgICAgICAgICAgeC5yU2hpZnRUbygxLCB4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHkuc3ViVG8oeCwgeSk7XG4gICAgICAgICAgICB5LnJTaGlmdFRvKDEsIHkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChnID4gMClcbiAgICAgICAgeS5sU2hpZnRUbyhnLCB5KTtcbiAgICByZXR1cm4geTtcbn1cbi8vIChwcm90ZWN0ZWQpIHRoaXMgJSBuLCBuIDwgMl4yNlxuZnVuY3Rpb24gYm5wTW9kSW50KG4pIHtcbiAgICBpZiAobiA8PSAwKVxuICAgICAgICByZXR1cm4gMDtcbiAgICB2YXIgZCA9IHRoaXMuRFYgJSBuLCByID0gdGhpcy5zIDwgMCA/IG4gLSAxIDogMDtcbiAgICBpZiAodGhpcy50ID4gMCkge1xuICAgICAgICBpZiAoZCA9PSAwKSB7XG4gICAgICAgICAgICByID0gdGhpc1swXSAlIG47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy50IC0gMTsgaSA+PSAwOyAtLWkpXG4gICAgICAgICAgICAgICAgciA9IChkICogciArIHRoaXNbaV0pICUgbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcjtcbn1cbi8vIChwdWJsaWMpIDEvdGhpcyAlIG0gKEhBQyAxNC42MSlcbmZ1bmN0aW9uIGJuTW9kSW52ZXJzZShtKSB7XG4gICAgdmFyIGFjID0gbS5pc0V2ZW4oKTtcbiAgICBpZiAoKHRoaXMuaXNFdmVuKCkgJiYgYWMpIHx8IG0uc2lnbnVtKCkgPT0gMClcbiAgICAgICAgcmV0dXJuIEJpZ0ludGVnZXIuWkVSTztcbiAgICB2YXIgdSA9IG0uY2xvbmUoKSwgdiA9IHRoaXMuY2xvbmUoKTtcbiAgICB2YXIgYSA9IG5idigxKSwgYiA9IG5idigwKSwgYyA9IG5idigwKSwgZCA9IG5idigxKTtcbiAgICB3aGlsZSAodS5zaWdudW0oKSAhPSAwKSB7XG4gICAgICAgIHdoaWxlICh1LmlzRXZlbigpKSB7XG4gICAgICAgICAgICB1LnJTaGlmdFRvKDEsIHUpO1xuICAgICAgICAgICAgaWYgKGFjKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhLmlzRXZlbigpIHx8ICFiLmlzRXZlbigpKSB7XG4gICAgICAgICAgICAgICAgICAgIGEuYWRkVG8odGhpcywgYSk7XG4gICAgICAgICAgICAgICAgICAgIGIuc3ViVG8obSwgYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGEuclNoaWZ0VG8oMSwgYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghYi5pc0V2ZW4oKSlcbiAgICAgICAgICAgICAgICBiLnN1YlRvKG0sIGIpO1xuICAgICAgICAgICAgYi5yU2hpZnRUbygxLCBiKTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAodi5pc0V2ZW4oKSkge1xuICAgICAgICAgICAgdi5yU2hpZnRUbygxLCB2KTtcbiAgICAgICAgICAgIGlmIChhYykge1xuICAgICAgICAgICAgICAgIGlmICghYy5pc0V2ZW4oKSB8fCAhZC5pc0V2ZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICBjLmFkZFRvKHRoaXMsIGMpO1xuICAgICAgICAgICAgICAgICAgICBkLnN1YlRvKG0sIGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjLnJTaGlmdFRvKDEsIGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIWQuaXNFdmVuKCkpXG4gICAgICAgICAgICAgICAgZC5zdWJUbyhtLCBkKTtcbiAgICAgICAgICAgIGQuclNoaWZ0VG8oMSwgZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHUuY29tcGFyZVRvKHYpID49IDApIHtcbiAgICAgICAgICAgIHUuc3ViVG8odiwgdSk7XG4gICAgICAgICAgICBpZiAoYWMpXG4gICAgICAgICAgICAgICAgYS5zdWJUbyhjLCBhKTtcbiAgICAgICAgICAgIGIuc3ViVG8oZCwgYik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2LnN1YlRvKHUsIHYpO1xuICAgICAgICAgICAgaWYgKGFjKVxuICAgICAgICAgICAgICAgIGMuc3ViVG8oYSwgYyk7XG4gICAgICAgICAgICBkLnN1YlRvKGIsIGQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh2LmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSkgIT0gMClcbiAgICAgICAgcmV0dXJuIEJpZ0ludGVnZXIuWkVSTztcbiAgICBpZiAoZC5jb21wYXJlVG8obSkgPj0gMClcbiAgICAgICAgcmV0dXJuIGQuc3VidHJhY3QobSk7XG4gICAgaWYgKGQuc2lnbnVtKCkgPCAwKVxuICAgICAgICBkLmFkZFRvKG0sIGQpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgaWYgKGQuc2lnbnVtKCkgPCAwKVxuICAgICAgICByZXR1cm4gZC5hZGQobSk7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gZDtcbn1cbnZhciBsb3dwcmltZXMgPSBbXG4gICAgMiwgMywgNSwgNywgMTEsIDEzLCAxNywgMTksIDIzLCAyOSwgMzEsIDM3LCA0MSwgNDMsIDQ3LCA1MywgNTksIDYxLCA2NywgNzEsIDczLCA3OSwgODMsIDg5LCA5NywgMTAxLCAxMDMsIDEwNywgMTA5LCAxMTMsIDEyNywgMTMxLCAxMzcsIDEzOSwgMTQ5LCAxNTEsIDE1NyxcbiAgICAxNjMsIDE2NywgMTczLCAxNzksIDE4MSwgMTkxLCAxOTMsIDE5NywgMTk5LCAyMTEsIDIyMywgMjI3LCAyMjksIDIzMywgMjM5LCAyNDEsIDI1MSwgMjU3LCAyNjMsIDI2OSwgMjcxLCAyNzcsIDI4MSwgMjgzLCAyOTMsIDMwNywgMzExLCAzMTMsIDMxNywgMzMxLCAzMzcsXG4gICAgMzQ3LCAzNDksIDM1MywgMzU5LCAzNjcsIDM3MywgMzc5LCAzODMsIDM4OSwgMzk3LCA0MDEsIDQwOSwgNDE5LCA0MjEsIDQzMSwgNDMzLCA0MzksIDQ0MywgNDQ5LCA0NTcsIDQ2MSwgNDYzLCA0NjcsIDQ3OSwgNDg3LCA0OTEsIDQ5OSwgNTAzLCA1MDksIDUyMSwgNTIzLFxuICAgIDU0MSwgNTQ3LCA1NTcsIDU2MywgNTY5LCA1NzEsIDU3NywgNTg3LCA1OTMsIDU5OSwgNjAxLCA2MDcsIDYxMywgNjE3LCA2MTksIDYzMSwgNjQxLCA2NDMsIDY0NywgNjUzLCA2NTksIDY2MSwgNjczLCA2NzcsIDY4MywgNjkxLCA3MDEsIDcwOSwgNzE5LCA3MjcsIDczMyxcbiAgICA3MzksIDc0MywgNzUxLCA3NTcsIDc2MSwgNzY5LCA3NzMsIDc4NywgNzk3LCA4MDksIDgxMSwgODIxLCA4MjMsIDgyNywgODI5LCA4MzksIDg1MywgODU3LCA4NTksIDg2MywgODc3LCA4ODEsIDg4MywgODg3LCA5MDcsIDkxMSwgOTE5LCA5MjksIDkzNywgOTQxLCA5NDcsXG4gICAgOTUzLCA5NjcsIDk3MSwgOTc3LCA5ODMsIDk5MSwgOTk3LFxuXTtcbnZhciBscGxpbSA9ICgxIDw8IDI2KSAvIGxvd3ByaW1lc1tsb3dwcmltZXMubGVuZ3RoIC0gMV07XG4vLyAocHVibGljKSB0ZXN0IHByaW1hbGl0eSB3aXRoIGNlcnRhaW50eSA+PSAxLS41XnRcbmZ1bmN0aW9uIGJuSXNQcm9iYWJsZVByaW1lKHQpIHtcbiAgICB2YXIgaSwgeCA9IHRoaXMuYWJzKCk7XG4gICAgaWYgKHgudCA9PSAxICYmIHhbMF0gPD0gbG93cHJpbWVzW2xvd3ByaW1lcy5sZW5ndGggLSAxXSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbG93cHJpbWVzLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgaWYgKHhbMF0gPT0gbG93cHJpbWVzW2ldKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh4LmlzRXZlbigpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgaSA9IDE7XG4gICAgd2hpbGUgKGkgPCBsb3dwcmltZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBtID0gbG93cHJpbWVzW2ldLCBqID0gaSArIDE7XG4gICAgICAgIHdoaWxlIChqIDwgbG93cHJpbWVzLmxlbmd0aCAmJiBtIDwgbHBsaW0pXG4gICAgICAgICAgICBtICo9IGxvd3ByaW1lc1tqKytdO1xuICAgICAgICBtID0geC5tb2RJbnQobSk7XG4gICAgICAgIHdoaWxlIChpIDwgailcbiAgICAgICAgICAgIGlmIChtICUgbG93cHJpbWVzW2krK10gPT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB4Lm1pbGxlclJhYmluKHQpO1xufVxuLy8gKHByb3RlY3RlZCkgdHJ1ZSBpZiBwcm9iYWJseSBwcmltZSAoSEFDIDQuMjQsIE1pbGxlci1SYWJpbilcbmZ1bmN0aW9uIGJucE1pbGxlclJhYmluKHQpIHtcbiAgICB2YXIgbjEgPSB0aGlzLnN1YnRyYWN0KEJpZ0ludGVnZXIuT05FKTtcbiAgICB2YXIgayA9IG4xLmdldExvd2VzdFNldEJpdCgpO1xuICAgIGlmIChrIDw9IDApXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB2YXIgciA9IG4xLnNoaWZ0UmlnaHQoayk7XG4gICAgdCA9ICh0ICsgMSkgPj4gMTtcbiAgICBpZiAodCA+IGxvd3ByaW1lcy5sZW5ndGgpXG4gICAgICAgIHQgPSBsb3dwcmltZXMubGVuZ3RoO1xuICAgIHZhciBhID0gbmJpKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0OyArK2kpIHtcbiAgICAgICAgLy9QaWNrIGJhc2VzIGF0IHJhbmRvbSwgaW5zdGVhZCBvZiBzdGFydGluZyBhdCAyXG4gICAgICAgIC8vIFRVVEFPOiBJdCBpcyBmaW5lIHRvIHVzZSBNYXRoLnJhbmRvbSgpIGluc3RlYWQgc2VjdXJlIHJhbmRvbSBoZXJlIGJlY2F1c2UgaXQgaXMgb25seSB1c2VkIGZvciBjaGVja2luZyBpZiB0aGUgbnVtYmVyIGlzIGEgcHJpbWUuIFRoZSBudW1iZXIgaXRzZWxmIGlzIGdlbmVyYXRlZCB3aXRoIHRoZSBzZWN1cmUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IuXG4gICAgICAgIGEuZnJvbUludChsb3dwcmltZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbG93cHJpbWVzLmxlbmd0aCldKTtcbiAgICAgICAgdmFyIHkgPSBhLm1vZFBvdyhyLCB0aGlzKTtcbiAgICAgICAgaWYgKHkuY29tcGFyZVRvKEJpZ0ludGVnZXIuT05FKSAhPSAwICYmIHkuY29tcGFyZVRvKG4xKSAhPSAwKSB7XG4gICAgICAgICAgICB2YXIgaiA9IDE7XG4gICAgICAgICAgICB3aGlsZSAoaisrIDwgayAmJiB5LmNvbXBhcmVUbyhuMSkgIT0gMCkge1xuICAgICAgICAgICAgICAgIHkgPSB5Lm1vZFBvd0ludCgyLCB0aGlzKTtcbiAgICAgICAgICAgICAgICBpZiAoeS5jb21wYXJlVG8oQmlnSW50ZWdlci5PTkUpID09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh5LmNvbXBhcmVUbyhuMSkgIT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG4vLyBwcm90ZWN0ZWRcbkJpZ0ludGVnZXIucHJvdG90eXBlLmNodW5rU2l6ZSA9IGJucENodW5rU2l6ZTtcbkJpZ0ludGVnZXIucHJvdG90eXBlLnRvUmFkaXggPSBibnBUb1JhZGl4O1xuQmlnSW50ZWdlci5wcm90b3R5cGUuZnJvbVJhZGl4ID0gYm5wRnJvbVJhZGl4O1xuQmlnSW50ZWdlci5wcm90b3R5cGUuZnJvbU51bWJlciA9IGJucEZyb21OdW1iZXI7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXR3aXNlVG8gPSBibnBCaXR3aXNlVG87XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5jaGFuZ2VCaXQgPSBibnBDaGFuZ2VCaXQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGRUbyA9IGJucEFkZFRvO1xuQmlnSW50ZWdlci5wcm90b3R5cGUuZE11bHRpcGx5ID0gYm5wRE11bHRpcGx5O1xuQmlnSW50ZWdlci5wcm90b3R5cGUuZEFkZE9mZnNldCA9IGJucERBZGRPZmZzZXQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseUxvd2VyVG8gPSBibnBNdWx0aXBseUxvd2VyVG87XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseVVwcGVyVG8gPSBibnBNdWx0aXBseVVwcGVyVG87XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RJbnQgPSBibnBNb2RJbnQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5taWxsZXJSYWJpbiA9IGJucE1pbGxlclJhYmluO1xuLy8gcHVibGljXG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5jbG9uZSA9IGJuQ2xvbmU7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5pbnRWYWx1ZSA9IGJuSW50VmFsdWU7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5ieXRlVmFsdWUgPSBibkJ5dGVWYWx1ZTtcbkJpZ0ludGVnZXIucHJvdG90eXBlLnNob3J0VmFsdWUgPSBiblNob3J0VmFsdWU7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5zaWdudW0gPSBiblNpZ051bTtcbkJpZ0ludGVnZXIucHJvdG90eXBlLnRvQnl0ZUFycmF5ID0gYm5Ub0J5dGVBcnJheTtcbkJpZ0ludGVnZXIucHJvdG90eXBlLmVxdWFscyA9IGJuRXF1YWxzO1xuQmlnSW50ZWdlci5wcm90b3R5cGUubWluID0gYm5NaW47XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5tYXggPSBibk1heDtcbkJpZ0ludGVnZXIucHJvdG90eXBlLmFuZCA9IGJuQW5kO1xuQmlnSW50ZWdlci5wcm90b3R5cGUub3IgPSBibk9yO1xuQmlnSW50ZWdlci5wcm90b3R5cGUueG9yID0gYm5Yb3I7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5hbmROb3QgPSBibkFuZE5vdDtcbkJpZ0ludGVnZXIucHJvdG90eXBlLm5vdCA9IGJuTm90O1xuQmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0ID0gYm5TaGlmdExlZnQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0ID0gYm5TaGlmdFJpZ2h0O1xuQmlnSW50ZWdlci5wcm90b3R5cGUuZ2V0TG93ZXN0U2V0Qml0ID0gYm5HZXRMb3dlc3RTZXRCaXQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRDb3VudCA9IGJuQml0Q291bnQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS50ZXN0Qml0ID0gYm5UZXN0Qml0O1xuQmlnSW50ZWdlci5wcm90b3R5cGUuc2V0Qml0ID0gYm5TZXRCaXQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5jbGVhckJpdCA9IGJuQ2xlYXJCaXQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5mbGlwQml0ID0gYm5GbGlwQml0O1xuQmlnSW50ZWdlci5wcm90b3R5cGUuYWRkID0gYm5BZGQ7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGJuU3VidHJhY3Q7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseSA9IGJuTXVsdGlwbHk7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGUgPSBibkRpdmlkZTtcbkJpZ0ludGVnZXIucHJvdG90eXBlLnJlbWFpbmRlciA9IGJuUmVtYWluZGVyO1xuQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2aWRlQW5kUmVtYWluZGVyID0gYm5EaXZpZGVBbmRSZW1haW5kZXI7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RQb3cgPSBibk1vZFBvdztcbkJpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludmVyc2UgPSBibk1vZEludmVyc2U7XG5CaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3cgPSBiblBvdztcbkJpZ0ludGVnZXIucHJvdG90eXBlLmdjZCA9IGJuR0NEO1xuQmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lID0gYm5Jc1Byb2JhYmxlUHJpbWU7XG4vLyBKU0JOLXNwZWNpZmljIGV4dGVuc2lvblxuQmlnSW50ZWdlci5wcm90b3R5cGUuc3F1YXJlID0gYm5TcXVhcmU7XG4vLyBCaWdJbnRlZ2VyIGludGVyZmFjZXMgbm90IGltcGxlbWVudGVkIGluIGpzYm46XG4vLyBCaWdJbnRlZ2VyKGludCBzaWdudW0sIGJ5dGVbXSBtYWduaXR1ZGUpXG4vLyBkb3VibGUgZG91YmxlVmFsdWUoKVxuLy8gZmxvYXQgZmxvYXRWYWx1ZSgpXG4vLyBpbnQgaGFzaENvZGUoKVxuLy8gbG9uZyBsb25nVmFsdWUoKVxuLy8gc3RhdGljIEJpZ0ludGVnZXIgdmFsdWVPZihsb25nIHZhbClcbi8vIERlcGVuZHMgb24ganNibi5qcyBhbmQgcm5nLmpzXG4vLyBWZXJzaW9uIDEuMTogc3VwcG9ydCB1dGYtOCBlbmNvZGluZyBpbiBwa2NzMXBhZDJcbi8vIGNvbnZlcnQgYSAoaGV4KSBzdHJpbmcgdG8gYSBiaWdudW0gb2JqZWN0XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCaWdJbnQoc3RyLCByKSB7XG4gICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHN0ciwgcik7XG59XG5mdW5jdGlvbiBsaW5lYnJrKHMsIG4pIHtcbiAgICB2YXIgcmV0ID0gXCJcIjtcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKGkgKyBuIDwgcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0ICs9IHMuc3Vic3RyaW5nKGksIGkgKyBuKSArIFwiXFxuXCI7XG4gICAgICAgIGkgKz0gbjtcbiAgICB9XG4gICAgcmV0dXJuIHJldCArIHMuc3Vic3RyaW5nKGksIHMubGVuZ3RoKTtcbn1cbmZ1bmN0aW9uIGJ5dGUySGV4KGIpIHtcbiAgICBpZiAoYiA8IDB4MTApIHtcbiAgICAgICAgcmV0dXJuIFwiMFwiICsgYi50b1N0cmluZygxNik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gYi50b1N0cmluZygxNik7XG4gICAgfVxufVxuLy8gUEtDUyMxICh0eXBlIDIsIHJhbmRvbSkgcGFkIGlucHV0IHN0cmluZyBzIHRvIG4gYnl0ZXMsIGFuZCByZXR1cm4gYSBiaWdpbnRcbmZ1bmN0aW9uIHBrY3MxcGFkMihzLCBuKSB7XG4gICAgaWYgKG4gPCBzLmxlbmd0aCArIDExKSB7XG4gICAgICAgIC8vIFRPRE86IGZpeCBmb3IgdXRmLThcbiAgICAgICAgYWxlcnQoXCJNZXNzYWdlIHRvbyBsb25nIGZvciBSU0FcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgYmEgPSBuZXcgQXJyYXkoKTtcbiAgICB2YXIgaSA9IHMubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAoaSA+PSAwICYmIG4gPiAwKSB7XG4gICAgICAgIHZhciBjID0gcy5jaGFyQ29kZUF0KGktLSk7XG4gICAgICAgIGlmIChjIDwgMTI4KSB7XG4gICAgICAgICAgICAvLyBlbmNvZGUgdXNpbmcgdXRmLThcbiAgICAgICAgICAgIGJhWy0tbl0gPSBjO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMgPiAxMjcgJiYgYyA8IDIwNDgpIHtcbiAgICAgICAgICAgIGJhWy0tbl0gPSAoYyAmIDYzKSB8IDEyODtcbiAgICAgICAgICAgIGJhWy0tbl0gPSAoYyA+PiA2KSB8IDE5MjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJhWy0tbl0gPSAoYyAmIDYzKSB8IDEyODtcbiAgICAgICAgICAgIGJhWy0tbl0gPSAoKGMgPj4gNikgJiA2MykgfCAxMjg7XG4gICAgICAgICAgICBiYVstLW5dID0gKGMgPj4gMTIpIHwgMjI0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGJhWy0tbl0gPSAwO1xuICAgIHZhciBybmcgPSBuZXcgU2VjdXJlUmFuZG9tKCk7XG4gICAgdmFyIHggPSBuZXcgQXJyYXkoKTtcbiAgICB3aGlsZSAobiA+IDIpIHtcbiAgICAgICAgLy8gcmFuZG9tIG5vbi16ZXJvIHBhZFxuICAgICAgICB4WzBdID0gMDtcbiAgICAgICAgd2hpbGUgKHhbMF0gPT0gMClcbiAgICAgICAgICAgIHJuZy5uZXh0Qnl0ZXMoeCk7XG4gICAgICAgIGJhWy0tbl0gPSB4WzBdO1xuICAgIH1cbiAgICBiYVstLW5dID0gMjtcbiAgICBiYVstLW5dID0gMDtcbiAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIoYmEpO1xufVxuLy8gXCJlbXB0eVwiIFJTQSBrZXkgY29uc3RydWN0b3JcbmV4cG9ydCBmdW5jdGlvbiBSU0FLZXkoKSB7XG4gICAgdGhpcy5uID0gbnVsbDtcbiAgICB0aGlzLmUgPSAwO1xuICAgIHRoaXMuZCA9IG51bGw7XG4gICAgdGhpcy5wID0gbnVsbDtcbiAgICB0aGlzLnEgPSBudWxsO1xuICAgIHRoaXMuZG1wMSA9IG51bGw7XG4gICAgdGhpcy5kbXExID0gbnVsbDtcbiAgICB0aGlzLmNvZWZmID0gbnVsbDtcbn1cbi8vIFNldCB0aGUgcHVibGljIGtleSBmaWVsZHMgTiBhbmQgZSBmcm9tIGhleCBzdHJpbmdzXG5mdW5jdGlvbiBSU0FTZXRQdWJsaWMoTiwgRSkge1xuICAgIGlmIChOICE9IG51bGwgJiYgRSAhPSBudWxsICYmIE4ubGVuZ3RoID4gMCAmJiBFLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5uID0gcGFyc2VCaWdJbnQoTiwgMTYpO1xuICAgICAgICB0aGlzLmUgPSBwYXJzZUludChFLCAxNik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhbGVydChcIkludmFsaWQgUlNBIHB1YmxpYyBrZXlcIik7XG4gICAgfVxufVxuLy8gUGVyZm9ybSByYXcgcHVibGljIG9wZXJhdGlvbiBvbiBcInhcIjogcmV0dXJuIHheZSAobW9kIG4pXG5mdW5jdGlvbiBSU0FEb1B1YmxpYyh4KSB7XG4gICAgcmV0dXJuIHgubW9kUG93SW50KHRoaXMuZSwgdGhpcy5uKTtcbn1cbi8vIFJldHVybiB0aGUgUEtDUyMxIFJTQSBlbmNyeXB0aW9uIG9mIFwidGV4dFwiIGFzIGFuIGV2ZW4tbGVuZ3RoIGhleCBzdHJpbmdcbmZ1bmN0aW9uIFJTQUVuY3J5cHQodGV4dCkge1xuICAgIHZhciBtID0gcGtjczFwYWQyKHRleHQsICh0aGlzLm4uYml0TGVuZ3RoKCkgKyA3KSA+PiAzKTtcbiAgICBpZiAobSA9PSBudWxsKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB2YXIgYyA9IHRoaXMuZG9QdWJsaWMobSk7XG4gICAgaWYgKGMgPT0gbnVsbClcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgdmFyIGggPSBjLnRvU3RyaW5nKDE2KTtcbiAgICBpZiAoKGgubGVuZ3RoICYgMSkgPT0gMClcbiAgICAgICAgcmV0dXJuIGg7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gXCIwXCIgKyBoO1xufVxuLy8gUmV0dXJuIHRoZSBQS0NTIzEgUlNBIGVuY3J5cHRpb24gb2YgXCJ0ZXh0XCIgYXMgYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmdcbi8vZnVuY3Rpb24gUlNBRW5jcnlwdEI2NCh0ZXh0KSB7XG4vLyAgdmFyIGggPSB0aGlzLmVuY3J5cHQodGV4dCk7XG4vLyAgaWYoaCkgcmV0dXJuIGhleDJiNjQoaCk7IGVsc2UgcmV0dXJuIG51bGw7XG4vL31cbi8vIHByb3RlY3RlZFxuUlNBS2V5LnByb3RvdHlwZS5kb1B1YmxpYyA9IFJTQURvUHVibGljO1xuLy8gcHVibGljXG5SU0FLZXkucHJvdG90eXBlLnNldFB1YmxpYyA9IFJTQVNldFB1YmxpYztcblJTQUtleS5wcm90b3R5cGUuZW5jcnlwdCA9IFJTQUVuY3J5cHQ7XG4vL1JTQUtleS5wcm90b3R5cGUuZW5jcnlwdF9iNjQgPSBSU0FFbmNyeXB0QjY0O1xuLy8gRGVwZW5kcyBvbiByc2EuanMgYW5kIGpzYm4yLmpzXG4vLyBWZXJzaW9uIDEuMTogc3VwcG9ydCB1dGYtOCBkZWNvZGluZyBpbiBwa2NzMXVucGFkMlxuLy8gVW5kbyBQS0NTIzEgKHR5cGUgMiwgcmFuZG9tKSBwYWRkaW5nIGFuZCwgaWYgdmFsaWQsIHJldHVybiB0aGUgcGxhaW50ZXh0XG5mdW5jdGlvbiBwa2NzMXVucGFkMihkLCBuKSB7XG4gICAgdmFyIGIgPSBkLnRvQnl0ZUFycmF5KCk7XG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgYi5sZW5ndGggJiYgYltpXSA9PSAwKVxuICAgICAgICArK2k7XG4gICAgaWYgKGIubGVuZ3RoIC0gaSAhPSBuIC0gMSB8fCBiW2ldICE9IDIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgICsraTtcbiAgICB3aGlsZSAoYltpXSAhPSAwKVxuICAgICAgICBpZiAoKytpID49IGIubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgdmFyIHJldCA9IFwiXCI7XG4gICAgd2hpbGUgKCsraSA8IGIubGVuZ3RoKSB7XG4gICAgICAgIHZhciBjID0gYltpXSAmIDI1NTtcbiAgICAgICAgaWYgKGMgPCAxMjgpIHtcbiAgICAgICAgICAgIC8vIHV0Zi04IGRlY29kZVxuICAgICAgICAgICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYyA+IDE5MSAmJiBjIDwgMjI0KSB7XG4gICAgICAgICAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoKGMgJiAzMSkgPDwgNikgfCAoYltpICsgMV0gJiA2MykpO1xuICAgICAgICAgICAgKytpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjICYgMTUpIDw8IDEyKSB8ICgoYltpICsgMV0gJiA2MykgPDwgNikgfCAoYltpICsgMl0gJiA2MykpO1xuICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG59XG4vLyBTZXQgdGhlIHByaXZhdGUga2V5IGZpZWxkcyBOLCBlLCBhbmQgZCBmcm9tIGhleCBzdHJpbmdzXG5mdW5jdGlvbiBSU0FTZXRQcml2YXRlKE4sIEUsIEQpIHtcbiAgICBpZiAoTiAhPSBudWxsICYmIEUgIT0gbnVsbCAmJiBOLmxlbmd0aCA+IDAgJiYgRS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMubiA9IHBhcnNlQmlnSW50KE4sIDE2KTtcbiAgICAgICAgdGhpcy5lID0gcGFyc2VJbnQoRSwgMTYpO1xuICAgICAgICB0aGlzLmQgPSBwYXJzZUJpZ0ludChELCAxNik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhbGVydChcIkludmFsaWQgUlNBIHByaXZhdGUga2V5XCIpO1xuICAgIH1cbn1cbi8vIFNldCB0aGUgcHJpdmF0ZSBrZXkgZmllbGRzIE4sIGUsIGQgYW5kIENSVCBwYXJhbXMgZnJvbSBoZXggc3RyaW5nc1xuZnVuY3Rpb24gUlNBU2V0UHJpdmF0ZUV4KE4sIEUsIEQsIFAsIFEsIERQLCBEUSwgQykge1xuICAgIGlmIChOICE9IG51bGwgJiYgRSAhPSBudWxsICYmIE4ubGVuZ3RoID4gMCAmJiBFLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5uID0gcGFyc2VCaWdJbnQoTiwgMTYpO1xuICAgICAgICB0aGlzLmUgPSBwYXJzZUludChFLCAxNik7XG4gICAgICAgIHRoaXMuZCA9IHBhcnNlQmlnSW50KEQsIDE2KTtcbiAgICAgICAgdGhpcy5wID0gcGFyc2VCaWdJbnQoUCwgMTYpO1xuICAgICAgICB0aGlzLnEgPSBwYXJzZUJpZ0ludChRLCAxNik7XG4gICAgICAgIHRoaXMuZG1wMSA9IHBhcnNlQmlnSW50KERQLCAxNik7XG4gICAgICAgIHRoaXMuZG1xMSA9IHBhcnNlQmlnSW50KERRLCAxNik7XG4gICAgICAgIHRoaXMuY29lZmYgPSBwYXJzZUJpZ0ludChDLCAxNik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhbGVydChcIkludmFsaWQgUlNBIHByaXZhdGUga2V5XCIpO1xuICAgIH1cbn1cbi8vIEdlbmVyYXRlIGEgbmV3IHJhbmRvbSBwcml2YXRlIGtleSBCIGJpdHMgbG9uZywgdXNpbmcgcHVibGljIGV4cHQgRVxuZnVuY3Rpb24gUlNBR2VuZXJhdGUoQiwgRSkge1xuICAgIHZhciBybmcgPSBuZXcgU2VjdXJlUmFuZG9tKCk7XG4gICAgdmFyIHFzID0gQiA+PiAxO1xuICAgIHRoaXMuZSA9IHBhcnNlSW50KEUsIDE2KTtcbiAgICB2YXIgZWUgPSBuZXcgQmlnSW50ZWdlcihFLCAxNik7XG4gICAgZm9yICg7Oykge1xuICAgICAgICBmb3IgKDs7KSB7XG4gICAgICAgICAgICB0aGlzLnAgPSBuZXcgQmlnSW50ZWdlcihCIC0gcXMsIDEwLCBybmcpOyAvLyB0dXRhbzogY2hhbmdlZCBwYXJhbWV0ZXIgYiBmcm9tIDEgdG8gMTAgKD0+IDUgcm91bmRzKTsgYWNjb3JkaW5nIHRvIEhBQyA0LjQ5LCB3ZSBvbmx5IG5lZWQgMiByb3VuZHMgJiYgZGlzY3Vzc2lvbjogaHR0cHM6Ly9naXRodWIuY29tL2RpZ2l0YWxiYXphYXIvZm9yZ2UvaXNzdWVzLzI4XG4gICAgICAgICAgICAvLyB0dXRhbzogdGhlIHByaW1lIHByb2JhYmlsaXR5IGlzIGFscmVhZHkgZ3VhcmFudGVlZCBieSB0aGUgQmlnSW50ZWdlciBjb25zdHJ1Y3RvciBhYm92ZTsgaWYodGhpcy5wLnN1YnRyYWN0KEJpZ0ludGVnZXIuT05FKS5nY2QoZWUpLmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSkgPT0gMCAmJiB0aGlzLnAuaXNQcm9iYWJsZVByaW1lKDEwKSkgYnJlYWs7XG4gICAgICAgICAgICBpZiAodGhpcy5wLnN1YnRyYWN0KEJpZ0ludGVnZXIuT05FKS5nY2QoZWUpLmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSkgPT0gMClcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKDs7KSB7XG4gICAgICAgICAgICAvLyB0dXRhbzogc2FtZSBjaGFuZ2VzIGFzIGFib3ZlXG4gICAgICAgICAgICB0aGlzLnEgPSBuZXcgQmlnSW50ZWdlcihxcywgMTAsIHJuZyk7XG4gICAgICAgICAgICBpZiAodGhpcy5xLnN1YnRyYWN0KEJpZ0ludGVnZXIuT05FKS5nY2QoZWUpLmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSkgPT0gMClcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wLmNvbXBhcmVUbyh0aGlzLnEpIDw9IDApIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcy5wO1xuICAgICAgICAgICAgdGhpcy5wID0gdGhpcy5xO1xuICAgICAgICAgICAgdGhpcy5xID0gdDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcDEgPSB0aGlzLnAuc3VidHJhY3QoQmlnSW50ZWdlci5PTkUpO1xuICAgICAgICB2YXIgcTEgPSB0aGlzLnEuc3VidHJhY3QoQmlnSW50ZWdlci5PTkUpO1xuICAgICAgICB2YXIgcGhpID0gcDEubXVsdGlwbHkocTEpO1xuICAgICAgICBpZiAocGhpLmdjZChlZSkuY29tcGFyZVRvKEJpZ0ludGVnZXIuT05FKSA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm4gPSB0aGlzLnAubXVsdGlwbHkodGhpcy5xKTtcbiAgICAgICAgICAgIHRoaXMuZCA9IGVlLm1vZEludmVyc2UocGhpKTtcbiAgICAgICAgICAgIHRoaXMuZG1wMSA9IHRoaXMuZC5tb2QocDEpO1xuICAgICAgICAgICAgdGhpcy5kbXExID0gdGhpcy5kLm1vZChxMSk7XG4gICAgICAgICAgICB0aGlzLmNvZWZmID0gdGhpcy5xLm1vZEludmVyc2UodGhpcy5wKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gUGVyZm9ybSByYXcgcHJpdmF0ZSBvcGVyYXRpb24gb24gXCJ4XCI6IHJldHVybiB4XmQgKG1vZCBuKVxuZnVuY3Rpb24gUlNBRG9Qcml2YXRlKHgpIHtcbiAgICBpZiAodGhpcy5wID09IG51bGwgfHwgdGhpcy5xID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHgubW9kUG93KHRoaXMuZCwgdGhpcy5uKTtcbiAgICB9XG4gICAgLy8gVE9ETzogcmUtY2FsY3VsYXRlIGFueSBtaXNzaW5nIENSVCBwYXJhbXNcbiAgICB2YXIgeHAgPSB4Lm1vZCh0aGlzLnApLm1vZFBvdyh0aGlzLmRtcDEsIHRoaXMucCk7XG4gICAgdmFyIHhxID0geC5tb2QodGhpcy5xKS5tb2RQb3codGhpcy5kbXExLCB0aGlzLnEpO1xuICAgIHdoaWxlICh4cC5jb21wYXJlVG8oeHEpIDwgMClcbiAgICAgICAgeHAgPSB4cC5hZGQodGhpcy5wKTtcbiAgICByZXR1cm4geHAuc3VidHJhY3QoeHEpLm11bHRpcGx5KHRoaXMuY29lZmYpLm1vZCh0aGlzLnApLm11bHRpcGx5KHRoaXMucSkuYWRkKHhxKTtcbn1cbi8vIFJldHVybiB0aGUgUEtDUyMxIFJTQSBkZWNyeXB0aW9uIG9mIFwiY3RleHRcIi5cbi8vIFwiY3RleHRcIiBpcyBhbiBldmVuLWxlbmd0aCBoZXggc3RyaW5nIGFuZCB0aGUgb3V0cHV0IGlzIGEgcGxhaW4gc3RyaW5nLlxuZnVuY3Rpb24gUlNBRGVjcnlwdChjdGV4dCkge1xuICAgIHZhciBjID0gcGFyc2VCaWdJbnQoY3RleHQsIDE2KTtcbiAgICB2YXIgbSA9IHRoaXMuZG9Qcml2YXRlKGMpO1xuICAgIGlmIChtID09IG51bGwpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiBwa2NzMXVucGFkMihtLCAodGhpcy5uLmJpdExlbmd0aCgpICsgNykgPj4gMyk7XG59XG4vLyBSZXR1cm4gdGhlIFBLQ1MjMSBSU0EgZGVjcnlwdGlvbiBvZiBcImN0ZXh0XCIuXG4vLyBcImN0ZXh0XCIgaXMgYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgYW5kIHRoZSBvdXRwdXQgaXMgYSBwbGFpbiBzdHJpbmcuXG4vL2Z1bmN0aW9uIFJTQUI2NERlY3J5cHQoY3RleHQpIHtcbi8vICB2YXIgaCA9IGI2NHRvaGV4KGN0ZXh0KTtcbi8vICBpZihoKSByZXR1cm4gdGhpcy5kZWNyeXB0KGgpOyBlbHNlIHJldHVybiBudWxsO1xuLy99XG4vLyBwcm90ZWN0ZWRcblJTQUtleS5wcm90b3R5cGUuZG9Qcml2YXRlID0gUlNBRG9Qcml2YXRlO1xuLy8gcHVibGljXG5SU0FLZXkucHJvdG90eXBlLnNldFByaXZhdGUgPSBSU0FTZXRQcml2YXRlO1xuUlNBS2V5LnByb3RvdHlwZS5zZXRQcml2YXRlRXggPSBSU0FTZXRQcml2YXRlRXg7XG5SU0FLZXkucHJvdG90eXBlLmdlbmVyYXRlID0gUlNBR2VuZXJhdGU7XG5SU0FLZXkucHJvdG90eXBlLmRlY3J5cHQgPSBSU0FEZWNyeXB0O1xuLy9SU0FLZXkucHJvdG90eXBlLmI2NF9kZWNyeXB0ID0gUlNBQjY0RGVjcnlwdDtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEJpZyBJbnRlZ2VyIExpYnJhcnkgdi4gNS40XG4vLyBDcmVhdGVkIDIwMDAsIGxhc3QgbW9kaWZpZWQgMjAwOVxuLy8gTGVlbW9uIEJhaXJkXG4vLyB3d3cubGVlbW9uLmNvbVxuLy9cbi8vIFZlcnNpb24gaGlzdG9yeTpcbi8vIHYgNS40ICAzIE9jdCAyMDA5XG4vLyAgIC0gYWRkZWQgXCJ2YXIgaVwiIHRvIGdyZWF0ZXJTaGlmdCgpIHNvIGkgaXMgbm90IGdsb2JhbC4gKFRoYW5rcyB0byBQxb10ZXIgU3phYuKAlCBmb3IgZmluZGluZyB0aGF0IGJ1Zylcbi8vXG4vLyB2IDUuMyAgMjEgU2VwIDIwMDlcbi8vICAgLSBhZGRlZCByYW5kUHJvYlByaW1lKGspIGZvciBwcm9iYWJsZSBwcmltZXNcbi8vICAgLSB1bnJvbGxlZCBsb29wIGluIG1vbnRfIChzbGlnaHRseSBmYXN0ZXIpXG4vLyAgIC0gbWlsbGVyUmFiaW4gbm93IHRha2VzIGEgYmlnSW50IHBhcmFtZXRlciByYXRoZXIgdGhhbiBhbiBpbnRcbi8vXG4vLyB2IDUuMiAgMTUgU2VwIDIwMDlcbi8vICAgLSBmaXhlZCBjYXBpdGFsaXphdGlvbiBpbiBjYWxsIHRvIGludDJiaWdJbnQgaW4gcmFuZEJpZ0ludFxuLy8gICAgICh0aGFua3MgdG8gRW1pbGkgRXZyaXBpZG91LCBSZWluaG9sZCBCZWhyaW5nZXIsIGFuZCBTYW11ZWwgTWFjYWxlZXNlIGZvciBmaW5kaW5nIHRoYXQgYnVnKVxuLy9cbi8vIHYgNS4xICA4IE9jdCAyMDA3XG4vLyAgIC0gcmVuYW1lZCBpbnZlcnNlTW9kSW50XyB0byBpbnZlcnNlTW9kSW50IHNpbmNlIGl0IGRvZXNuJ3QgY2hhbmdlIGl0cyBwYXJhbWV0ZXJzXG4vLyAgIC0gYWRkZWQgZnVuY3Rpb25zIEdDRCBhbmQgcmFuZEJpZ0ludCwgd2hpY2ggY2FsbCBHQ0RfIGFuZCByYW5kQmlnSW50X1xuLy8gICAtIGZpeGVkIGEgYnVnIGZvdW5kIGJ5IFJvYiBWaXNzZXIgKHNlZSBjb21tZW50IHdpdGggaGlzIG5hbWUgYmVsb3cpXG4vLyAgIC0gaW1wcm92ZWQgY29tbWVudHNcbi8vXG4vLyBUaGlzIGZpbGUgaXMgcHVibGljIGRvbWFpbi4gICBZb3UgY2FuIHVzZSBpdCBmb3IgYW55IHB1cnBvc2Ugd2l0aG91dCByZXN0cmljdGlvbi5cbi8vIEkgZG8gbm90IGd1YXJhbnRlZSB0aGF0IGl0IGlzIGNvcnJlY3QsIHNvIHVzZSBpdCBhdCB5b3VyIG93biByaXNrLiAgSWYgeW91IHVzZVxuLy8gaXQgZm9yIHNvbWV0aGluZyBpbnRlcmVzdGluZywgSSdkIGFwcHJlY2lhdGUgaGVhcmluZyBhYm91dCBpdC4gIElmIHlvdSBmaW5kXG4vLyBhbnkgYnVncyBvciBtYWtlIGFueSBpbXByb3ZlbWVudHMsIEknZCBhcHByZWNpYXRlIGhlYXJpbmcgYWJvdXQgdGhvc2UgdG9vLlxuLy8gSXQgd291bGQgYWxzbyBiZSBuaWNlIGlmIG15IG5hbWUgYW5kIFVSTCB3ZXJlIGxlZnQgaW4gdGhlIGNvbW1lbnRzLiAgQnV0IG5vbmVcbi8vIG9mIHRoYXQgaXMgcmVxdWlyZWQuXG4vL1xuLy8gVGhpcyBjb2RlIGRlZmluZXMgYSBiaWdJbnQgbGlicmFyeSBmb3IgYXJiaXRyYXJ5LXByZWNpc2lvbiBpbnRlZ2Vycy5cbi8vIEEgYmlnSW50IGlzIGFuIGFycmF5IG9mIGludGVnZXJzIHN0b3JpbmcgdGhlIHZhbHVlIGluIGNodW5rcyBvZiBicGUgYml0cyxcbi8vIGxpdHRsZSBlbmRpYW4gKGJ1ZmZbMF0gaXMgdGhlIGxlYXN0IHNpZ25pZmljYW50IHdvcmQpLlxuLy8gTmVnYXRpdmUgYmlnSW50cyBhcmUgc3RvcmVkIHR3bydzIGNvbXBsZW1lbnQuICBBbG1vc3QgYWxsIHRoZSBmdW5jdGlvbnMgdHJlYXRcbi8vIGJpZ0ludHMgYXMgbm9ubmVnYXRpdmUuICBUaGUgZmV3IHRoYXQgdmlldyB0aGVtIGFzIHR3bydzIGNvbXBsZW1lbnQgc2F5IHNvXG4vLyBpbiB0aGVpciBjb21tZW50cy4gIFNvbWUgZnVuY3Rpb25zIGFzc3VtZSB0aGVpciBwYXJhbWV0ZXJzIGhhdmUgYXQgbGVhc3Qgb25lXG4vLyBsZWFkaW5nIHplcm8gZWxlbWVudC4gRnVuY3Rpb25zIHdpdGggYW4gdW5kZXJzY29yZSBhdCB0aGUgZW5kIG9mIHRoZSBuYW1lIHB1dFxuLy8gdGhlaXIgYW5zd2VyIGludG8gb25lIG9mIHRoZSBhcnJheXMgcGFzc2VkIGluLCBhbmQgaGF2ZSB1bnByZWRpY3RhYmxlIGJlaGF2aW9yXG4vLyBpbiBjYXNlIG9mIG92ZXJmbG93LCBzbyB0aGUgY2FsbGVyIG11c3QgbWFrZSBzdXJlIHRoZSBhcnJheXMgYXJlIGJpZyBlbm91Z2ggdG9cbi8vIGhvbGQgdGhlIGFuc3dlci4gIEJ1dCB0aGUgYXZlcmFnZSB1c2VyIHNob3VsZCBuZXZlciBoYXZlIHRvIGNhbGwgYW55IG9mIHRoZVxuLy8gdW5kZXJzY29yZWQgZnVuY3Rpb25zLiAgRWFjaCBpbXBvcnRhbnQgdW5kZXJzY29yZWQgZnVuY3Rpb24gaGFzIGEgd3JhcHBlciBmdW5jdGlvblxuLy8gb2YgdGhlIHNhbWUgbmFtZSB3aXRob3V0IHRoZSB1bmRlcnNjb3JlIHRoYXQgdGFrZXMgY2FyZSBvZiB0aGUgZGV0YWlscyBmb3IgeW91LlxuLy8gRm9yIGVhY2ggdW5kZXJzY29yZWQgZnVuY3Rpb24gd2hlcmUgYSBwYXJhbWV0ZXIgaXMgbW9kaWZpZWQsIHRoYXQgc2FtZSB2YXJpYWJsZVxuLy8gbXVzdCBub3QgYmUgdXNlZCBhcyBhbm90aGVyIGFyZ3VtZW50IHRvby4gIFNvLCB5b3UgY2Fubm90IHNxdWFyZSB4IGJ5IGRvaW5nXG4vLyBtdWx0TW9kXyh4LHgsbikuICBZb3UgbXVzdCB1c2Ugc3F1YXJlTW9kXyh4LG4pIGluc3RlYWQsIG9yIGRvIHk9ZHVwKHgpOyBtdWx0TW9kXyh4LHksbikuXG4vLyBPciBzaW1wbHkgdXNlIHRoZSBtdWx0TW9kKHgseCxuKSBmdW5jdGlvbiB3aXRob3V0IHRoZSB1bmRlcnNjb3JlLCB3aGVyZVxuLy8gc3VjaCBpc3N1ZXMgbmV2ZXIgYXJpc2UsIGJlY2F1c2Ugbm9uLXVuZGVyc2NvcmVkIGZ1bmN0aW9ucyBuZXZlciBjaGFuZ2Vcbi8vIHRoZWlyIHBhcmFtZXRlcnM7IHRoZXkgYWx3YXlzIGFsbG9jYXRlIG5ldyBtZW1vcnkgZm9yIHRoZSBhbnN3ZXIgdGhhdCBpcyByZXR1cm5lZC5cbi8vXG4vLyBUaGVzZSBmdW5jdGlvbnMgYXJlIGRlc2lnbmVkIHRvIGF2b2lkIGZyZXF1ZW50IGR5bmFtaWMgbWVtb3J5IGFsbG9jYXRpb24gaW4gdGhlIGlubmVyIGxvb3AuXG4vLyBGb3IgbW9zdCBmdW5jdGlvbnMsIGlmIGl0IG5lZWRzIGEgQmlnSW50IGFzIGEgbG9jYWwgdmFyaWFibGUgaXQgd2lsbCBhY3R1YWxseSB1c2Vcbi8vIGEgZ2xvYmFsLCBhbmQgd2lsbCBvbmx5IGFsbG9jYXRlIHRvIGl0IG9ubHkgd2hlbiBpdCdzIG5vdCB0aGUgcmlnaHQgc2l6ZS4gIFRoaXMgZW5zdXJlc1xuLy8gdGhhdCB3aGVuIGEgZnVuY3Rpb24gaXMgY2FsbGVkIHJlcGVhdGVkbHkgd2l0aCBzYW1lLXNpemVkIHBhcmFtZXRlcnMsIGl0IG9ubHkgYWxsb2NhdGVzXG4vLyBtZW1vcnkgb24gdGhlIGZpcnN0IGNhbGwuXG4vL1xuLy8gTm90ZSB0aGF0IGZvciBjcnlwdG9ncmFwaGljIHB1cnBvc2VzLCB0aGUgY2FsbHMgdG8gTWF0aC5yYW5kb20oKSBtdXN0XG4vLyBiZSByZXBsYWNlZCB3aXRoIGNhbGxzIHRvIGEgYmV0dGVyIHBzZXVkb3JhbmRvbSBudW1iZXIgZ2VuZXJhdG9yLlxuLy9cbi8vIEluIHRoZSBmb2xsb3dpbmcsIFwiYmlnSW50XCIgbWVhbnMgYSBiaWdJbnQgd2l0aCBhdCBsZWFzdCBvbmUgbGVhZGluZyB6ZXJvIGVsZW1lbnQsXG4vLyBhbmQgXCJpbnRlZ2VyXCIgbWVhbnMgYSBub25uZWdhdGl2ZSBpbnRlZ2VyIGxlc3MgdGhhbiByYWRpeC4gIEluIHNvbWUgY2FzZXMsIGludGVnZXJcbi8vIGNhbiBiZSBuZWdhdGl2ZS4gIE5lZ2F0aXZlIGJpZ0ludHMgYXJlIDJzIGNvbXBsZW1lbnQuXG4vL1xuLy8gVGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgZG8gbm90IG1vZGlmeSB0aGVpciBpbnB1dHMuXG4vLyBUaG9zZSByZXR1cm5pbmcgYSBiaWdJbnQsIHN0cmluZywgb3IgQXJyYXkgd2lsbCBkeW5hbWljYWxseSBhbGxvY2F0ZSBtZW1vcnkgZm9yIHRoYXQgdmFsdWUuXG4vLyBUaG9zZSByZXR1cm5pbmcgYSBib29sZWFuIHdpbGwgcmV0dXJuIHRoZSBpbnRlZ2VyIDAgKGZhbHNlKSBvciAxICh0cnVlKS5cbi8vIFRob3NlIHJldHVybmluZyBib29sZWFuIG9yIGludCB3aWxsIG5vdCBhbGxvY2F0ZSBtZW1vcnkgZXhjZXB0IHBvc3NpYmx5IG9uIHRoZSBmaXJzdFxuLy8gdGltZSB0aGV5J3JlIGNhbGxlZCB3aXRoIGEgZ2l2ZW4gcGFyYW1ldGVyIHNpemUuXG4vL1xuLy8gYmlnSW50ICBhZGQoeCx5KSAgICAgICAgICAgICAgIC8vcmV0dXJuICh4K3kpIGZvciBiaWdJbnRzIHggYW5kIHkuXG4vLyBiaWdJbnQgIGFkZEludCh4LG4pICAgICAgICAgICAgLy9yZXR1cm4gKHgrbikgd2hlcmUgeCBpcyBhIGJpZ0ludCBhbmQgbiBpcyBhbiBpbnRlZ2VyLlxuLy8gc3RyaW5nICBiaWdJbnQyc3RyKHgsYmFzZSkgICAgIC8vcmV0dXJuIGEgc3RyaW5nIGZvcm0gb2YgYmlnSW50IHggaW4gYSBnaXZlbiBiYXNlLCB3aXRoIDIgPD0gYmFzZSA8PSA5NVxuLy8gaW50ICAgICBiaXRTaXplKHgpICAgICAgICAgICAgIC8vcmV0dXJuIGhvdyBtYW55IGJpdHMgbG9uZyB0aGUgYmlnSW50IHggaXMsIG5vdCBjb3VudGluZyBsZWFkaW5nIHplcm9zXG4vLyBiaWdJbnQgIGR1cCh4KSAgICAgICAgICAgICAgICAgLy9yZXR1cm4gYSBjb3B5IG9mIGJpZ0ludCB4XG4vLyBib29sZWFuIGVxdWFscyh4LHkpICAgICAgICAgICAgLy9pcyB0aGUgYmlnSW50IHggZXF1YWwgdG8gdGhlIGJpZ2ludCB5P1xuLy8gYm9vbGVhbiBlcXVhbHNJbnQoeCx5KSAgICAgICAgIC8vaXMgYmlnaW50IHggZXF1YWwgdG8gaW50ZWdlciB5P1xuLy8gYmlnSW50ICBleHBhbmQoeCxuKSAgICAgICAgICAgIC8vcmV0dXJuIGEgY29weSBvZiB4IHdpdGggYXQgbGVhc3QgbiBlbGVtZW50cywgYWRkaW5nIGxlYWRpbmcgemVyb3MgaWYgbmVlZGVkXG4vLyBBcnJheSAgIGZpbmRQcmltZXMobikgICAgICAgICAgLy9yZXR1cm4gYXJyYXkgb2YgYWxsIHByaW1lcyBsZXNzIHRoYW4gaW50ZWdlciBuXG4vLyBiaWdJbnQgIEdDRCh4LHkpICAgICAgICAgICAgICAgLy9yZXR1cm4gZ3JlYXRlc3QgY29tbW9uIGRpdmlzb3Igb2YgYmlnSW50cyB4IGFuZCB5IChlYWNoIHdpdGggc2FtZSBudW1iZXIgb2YgZWxlbWVudHMpLlxuLy8gYm9vbGVhbiBncmVhdGVyKHgseSkgICAgICAgICAgIC8vaXMgeD55PyAgKHggYW5kIHkgYXJlIG5vbm5lZ2F0aXZlIGJpZ0ludHMpXG4vLyBib29sZWFuIGdyZWF0ZXJTaGlmdCh4LHksc2hpZnQpLy9pcyAoeCA8PChzaGlmdCpicGUpKSA+IHk/XG4vLyBiaWdJbnQgIGludDJiaWdJbnQodCxuLG0pICAgICAgLy9yZXR1cm4gYSBiaWdJbnQgZXF1YWwgdG8gaW50ZWdlciB0LCB3aXRoIGF0IGxlYXN0IG4gYml0cyBhbmQgbSBhcnJheSBlbGVtZW50c1xuLy8gYmlnSW50ICBpbnZlcnNlTW9kKHgsbikgICAgICAgIC8vcmV0dXJuICh4KiooLTEpIG1vZCBuKSBmb3IgYmlnSW50cyB4IGFuZCBuLiAgSWYgbm8gaW52ZXJzZSBleGlzdHMsIGl0IHJldHVybnMgbnVsbFxuLy8gaW50ICAgICBpbnZlcnNlTW9kSW50KHgsbikgICAgIC8vcmV0dXJuIHgqKigtMSkgbW9kIG4sIGZvciBpbnRlZ2VycyB4IGFuZCBuLiAgUmV0dXJuIDAgaWYgdGhlcmUgaXMgbm8gaW52ZXJzZVxuLy8gYm9vbGVhbiBpc1plcm8oeCkgICAgICAgICAgICAgIC8vaXMgdGhlIGJpZ0ludCB4IGVxdWFsIHRvIHplcm8/XG4vLyBib29sZWFuIG1pbGxlclJhYmluKHgsYikgICAgICAgLy9kb2VzIG9uZSByb3VuZCBvZiBNaWxsZXItUmFiaW4gYmFzZSBpbnRlZ2VyIGIgc2F5IHRoYXQgYmlnSW50IHggaXMgcG9zc2libHkgcHJpbWU/IChiIGlzIGJpZ0ludCwgMTxiPHgpXG4vLyBib29sZWFuIG1pbGxlclJhYmluSW50KHgsYikgICAgLy9kb2VzIG9uZSByb3VuZCBvZiBNaWxsZXItUmFiaW4gYmFzZSBpbnRlZ2VyIGIgc2F5IHRoYXQgYmlnSW50IHggaXMgcG9zc2libHkgcHJpbWU/IChiIGlzIGludCwgICAgMTxiPHgpXG4vLyBiaWdJbnQgIG1vZCh4LG4pICAgICAgICAgICAgICAgLy9yZXR1cm4gYSBuZXcgYmlnSW50IGVxdWFsIHRvICh4IG1vZCBuKSBmb3IgYmlnSW50cyB4IGFuZCBuLlxuLy8gaW50ICAgICBtb2RJbnQoeCxuKSAgICAgICAgICAgIC8vcmV0dXJuIHggbW9kIG4gZm9yIGJpZ0ludCB4IGFuZCBpbnRlZ2VyIG4uXG4vLyBiaWdJbnQgIG11bHQoeCx5KSAgICAgICAgICAgICAgLy9yZXR1cm4geCp5IGZvciBiaWdJbnRzIHggYW5kIHkuIFRoaXMgaXMgZmFzdGVyIHdoZW4geTx4LlxuLy8gYmlnSW50ICBtdWx0TW9kKHgseSxuKSAgICAgICAgIC8vcmV0dXJuICh4KnkgbW9kIG4pIGZvciBiaWdJbnRzIHgseSxuLiAgRm9yIGdyZWF0ZXIgc3BlZWQsIGxldCB5PHguXG4vLyBib29sZWFuIG5lZ2F0aXZlKHgpICAgICAgICAgICAgLy9pcyBiaWdJbnQgeCBuZWdhdGl2ZT9cbi8vIGJpZ0ludCAgcG93TW9kKHgseSxuKSAgICAgICAgICAvL3JldHVybiAoeCoqeSBtb2Qgbikgd2hlcmUgeCx5LG4gYXJlIGJpZ0ludHMgYW5kICoqIGlzIGV4cG9uZW50aWF0aW9uLiAgMCoqMD0xLiBGYXN0ZXIgZm9yIG9kZCBuLlxuLy8gYmlnSW50ICByYW5kQmlnSW50KG4scykgICAgICAgIC8vcmV0dXJuIGFuIG4tYml0IHJhbmRvbSBCaWdJbnQgKG4+PTEpLiAgSWYgcz0xLCB0aGVuIHRoZSBtb3N0IHNpZ25pZmljYW50IG9mIHRob3NlIG4gYml0cyBpcyBzZXQgdG8gMS5cbi8vIGJpZ0ludCAgcmFuZFRydWVQcmltZShrKSAgICAgICAvL3JldHVybiBhIG5ldywgcmFuZG9tLCBrLWJpdCwgdHJ1ZSBwcmltZSBiaWdJbnQgdXNpbmcgTWF1cmVyJ3MgYWxnb3JpdGhtLlxuLy8gYmlnSW50ICByYW5kUHJvYlByaW1lKGspICAgICAgIC8vcmV0dXJuIGEgbmV3LCByYW5kb20sIGstYml0LCBwcm9iYWJsZSBwcmltZSBiaWdJbnQgKHByb2JhYmlsaXR5IGl0J3MgY29tcG9zaXRlIGxlc3MgdGhhbiAyXi04MCkuXG4vLyBiaWdJbnQgIHN0cjJiaWdJbnQocyxiLG4sbSkgICAgLy9yZXR1cm4gYSBiaWdJbnQgZm9yIG51bWJlciByZXByZXNlbnRlZCBpbiBzdHJpbmcgcyBpbiBiYXNlIGIgd2l0aCBhdCBsZWFzdCBuIGJpdHMgYW5kIG0gYXJyYXkgZWxlbWVudHNcbi8vIGJpZ0ludCAgc3ViKHgseSkgICAgICAgICAgICAgICAvL3JldHVybiAoeC15KSBmb3IgYmlnSW50cyB4IGFuZCB5LiAgTmVnYXRpdmUgYW5zd2VycyB3aWxsIGJlIDJzIGNvbXBsZW1lbnRcbi8vIGJpZ0ludCAgdHJpbSh4LGspICAgICAgICAgICAgICAvL3JldHVybiBhIGNvcHkgb2YgeCB3aXRoIGV4YWN0bHkgayBsZWFkaW5nIHplcm8gZWxlbWVudHNcbi8vXG4vL1xuLy8gVGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgZWFjaCBoYXZlIGEgbm9uLXVuZGVyc2NvcmVkIHZlcnNpb24sIHdoaWNoIG1vc3QgdXNlcnMgc2hvdWxkIGNhbGwgaW5zdGVhZC5cbi8vIFRoZXNlIGZ1bmN0aW9ucyBlYWNoIHdyaXRlIHRvIGEgc2luZ2xlIHBhcmFtZXRlciwgYW5kIHRoZSBjYWxsZXIgaXMgcmVzcG9uc2libGUgZm9yIGVuc3VyaW5nIHRoZSBhcnJheVxuLy8gcGFzc2VkIGluIGlzIGxhcmdlIGVub3VnaCB0byBob2xkIHRoZSByZXN1bHQuXG4vL1xuLy8gdm9pZCAgICBhZGRJbnRfKHgsbikgICAgICAgICAgLy9kbyB4PXgrbiB3aGVyZSB4IGlzIGEgYmlnSW50IGFuZCBuIGlzIGFuIGludGVnZXJcbi8vIHZvaWQgICAgYWRkXyh4LHkpICAgICAgICAgICAgIC8vZG8geD14K3kgZm9yIGJpZ0ludHMgeCBhbmQgeVxuLy8gdm9pZCAgICBjb3B5Xyh4LHkpICAgICAgICAgICAgLy9kbyB4PXkgb24gYmlnSW50cyB4IGFuZCB5XG4vLyB2b2lkICAgIGNvcHlJbnRfKHgsbikgICAgICAgICAvL2RvIHg9biBvbiBiaWdJbnQgeCBhbmQgaW50ZWdlciBuXG4vLyB2b2lkICAgIEdDRF8oeCx5KSAgICAgICAgICAgICAvL3NldCB4IHRvIHRoZSBncmVhdGVzdCBjb21tb24gZGl2aXNvciBvZiBiaWdJbnRzIHggYW5kIHksICh5IGlzIGRlc3Ryb3llZCkuICAoVGhpcyBuZXZlciBvdmVyZmxvd3MgaXRzIGFycmF5KS5cbi8vIGJvb2xlYW4gaW52ZXJzZU1vZF8oeCxuKSAgICAgIC8vZG8geD14KiooLTEpIG1vZCBuLCBmb3IgYmlnSW50cyB4IGFuZCBuLiBSZXR1cm5zIDEgKDApIGlmIGludmVyc2UgZG9lcyAoZG9lc24ndCkgZXhpc3Rcbi8vIHZvaWQgICAgbW9kXyh4LG4pICAgICAgICAgICAgIC8vZG8geD14IG1vZCBuIGZvciBiaWdJbnRzIHggYW5kIG4uIChUaGlzIG5ldmVyIG92ZXJmbG93cyBpdHMgYXJyYXkpLlxuLy8gdm9pZCAgICBtdWx0Xyh4LHkpICAgICAgICAgICAgLy9kbyB4PXgqeSBmb3IgYmlnSW50cyB4IGFuZCB5LlxuLy8gdm9pZCAgICBtdWx0TW9kXyh4LHksbikgICAgICAgLy9kbyB4PXgqeSAgbW9kIG4gZm9yIGJpZ0ludHMgeCx5LG4uXG4vLyB2b2lkICAgIHBvd01vZF8oeCx5LG4pICAgICAgICAvL2RvIHg9eCoqeSBtb2Qgbiwgd2hlcmUgeCx5LG4gYXJlIGJpZ0ludHMgKG4gaXMgb2RkKSBhbmQgKiogaXMgZXhwb25lbnRpYXRpb24uICAwKiowPTEuXG4vLyB2b2lkICAgIHJhbmRCaWdJbnRfKGIsbixzKSAgICAvL2RvIGIgPSBhbiBuLWJpdCByYW5kb20gQmlnSW50LiBpZiBzPTEsIHRoZW4gbnRoIGJpdCAobW9zdCBzaWduaWZpY2FudCBiaXQpIGlzIHNldCB0byAxLiBuPj0xLlxuLy8gdm9pZCAgICByYW5kVHJ1ZVByaW1lXyhhbnMsaykgLy9kbyBhbnMgPSBhIHJhbmRvbSBrLWJpdCB0cnVlIHJhbmRvbSBwcmltZSAobm90IGp1c3QgcHJvYmFibGUgcHJpbWUpIHdpdGggMSBpbiB0aGUgbXNiLlxuLy8gdm9pZCAgICBzdWJfKHgseSkgICAgICAgICAgICAgLy9kbyB4PXgteSBmb3IgYmlnSW50cyB4IGFuZCB5LiBOZWdhdGl2ZSBhbnN3ZXJzIHdpbGwgYmUgMnMgY29tcGxlbWVudC5cbi8vXG4vLyBUaGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBkbyBOT1QgaGF2ZSBhIG5vbi11bmRlcnNjb3JlZCB2ZXJzaW9uLlxuLy8gVGhleSBlYWNoIHdyaXRlIGEgYmlnSW50IHJlc3VsdCB0byBvbmUgb3IgbW9yZSBwYXJhbWV0ZXJzLiAgVGhlIGNhbGxlciBpcyByZXNwb25zaWJsZSBmb3Jcbi8vIGVuc3VyaW5nIHRoZSBhcnJheXMgcGFzc2VkIGluIGFyZSBsYXJnZSBlbm91Z2ggdG8gaG9sZCB0aGUgcmVzdWx0cy5cbi8vXG4vLyB2b2lkIGFkZFNoaWZ0Xyh4LHkseXMpICAgICAgIC8vZG8geD14Kyh5PDwoeXMqYnBlKSlcbi8vIHZvaWQgY2FycnlfKHgpICAgICAgICAgICAgICAgLy9kbyBjYXJyaWVzIGFuZCBib3Jyb3dzIHNvIGVhY2ggZWxlbWVudCBvZiB0aGUgYmlnSW50IHggZml0cyBpbiBicGUgYml0cy5cbi8vIHZvaWQgZGl2aWRlXyh4LHkscSxyKSAgICAgICAgLy9kaXZpZGUgeCBieSB5IGdpdmluZyBxdW90aWVudCBxIGFuZCByZW1haW5kZXIgclxuLy8gaW50ICBkaXZJbnRfKHgsbikgICAgICAgICAgICAvL2RvIHg9Zmxvb3IoeC9uKSBmb3IgYmlnSW50IHggYW5kIGludGVnZXIgbiwgYW5kIHJldHVybiB0aGUgcmVtYWluZGVyLiAoVGhpcyBuZXZlciBvdmVyZmxvd3MgaXRzIGFycmF5KS5cbi8vIGludCAgZUdDRF8oeCx5LGQsYSxiKSAgICAgICAgLy9zZXRzIGEsYixkIHRvIHBvc2l0aXZlIGJpZ0ludHMgc3VjaCB0aGF0IGQgPSBHQ0RfKHgseSkgPSBhKngtYip5XG4vLyB2b2lkIGhhbHZlXyh4KSAgICAgICAgICAgICAgIC8vZG8geD1mbG9vcih8eHwvMikqc2duKHgpIGZvciBiaWdJbnQgeCBpbiAyJ3MgY29tcGxlbWVudC4gIChUaGlzIG5ldmVyIG92ZXJmbG93cyBpdHMgYXJyYXkpLlxuLy8gdm9pZCBsZWZ0U2hpZnRfKHgsbikgICAgICAgICAvL2xlZnQgc2hpZnQgYmlnSW50IHggYnkgbiBiaXRzLiAgbjxicGUuXG4vLyB2b2lkIGxpbkNvbWJfKHgseSxhLGIpICAgICAgIC8vZG8geD1hKngrYip5IGZvciBiaWdJbnRzIHggYW5kIHkgYW5kIGludGVnZXJzIGEgYW5kIGJcbi8vIHZvaWQgbGluQ29tYlNoaWZ0Xyh4LHksYix5cykgLy9kbyB4PXgrYiooeTw8KHlzKmJwZSkpIGZvciBiaWdJbnRzIHggYW5kIHksIGFuZCBpbnRlZ2VycyBiIGFuZCB5c1xuLy8gdm9pZCBtb250Xyh4LHksbixucCkgICAgICAgICAvL01vbnRnb21lcnkgbXVsdGlwbGljYXRpb24gKHNlZSBjb21tZW50cyB3aGVyZSB0aGUgZnVuY3Rpb24gaXMgZGVmaW5lZClcbi8vIHZvaWQgbXVsdEludF8oeCxuKSAgICAgICAgICAgLy9kbyB4PXgqbiB3aGVyZSB4IGlzIGEgYmlnSW50IGFuZCBuIGlzIGFuIGludGVnZXIuXG4vLyB2b2lkIHJpZ2h0U2hpZnRfKHgsbikgICAgICAgIC8vcmlnaHQgc2hpZnQgYmlnSW50IHggYnkgbiBiaXRzLiAgMCA8PSBuIDwgYnBlLiAoVGhpcyBuZXZlciBvdmVyZmxvd3MgaXRzIGFycmF5KS5cbi8vIHZvaWQgc3F1YXJlTW9kXyh4LG4pICAgICAgICAgLy9kbyB4PXgqeCAgbW9kIG4gZm9yIGJpZ0ludHMgeCxuXG4vLyB2b2lkIHN1YlNoaWZ0Xyh4LHkseXMpICAgICAgIC8vZG8geD14LSh5PDwoeXMqYnBlKSkuIE5lZ2F0aXZlIGFuc3dlcnMgd2lsbCBiZSAycyBjb21wbGVtZW50LlxuLy9cbi8vIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIGFyZSBiYXNlZCBvbiBhbGdvcml0aG1zIGZyb20gdGhlIF9IYW5kYm9vayBvZiBBcHBsaWVkIENyeXB0b2dyYXBoeV9cbi8vICAgIHBvd01vZF8oKSAgICAgICAgICAgPSBhbGdvcml0aG0gMTQuOTQsIE1vbnRnb21lcnkgZXhwb25lbnRpYXRpb25cbi8vICAgIGVHQ0RfLGludmVyc2VNb2RfKCkgPSBhbGdvcml0aG0gMTQuNjEsIEJpbmFyeSBleHRlbmRlZCBHQ0RfXG4vLyAgICBHQ0RfKCkgICAgICAgICAgICAgID0gYWxnb3JvdGhtIDE0LjU3LCBMZWhtZXIncyBhbGdvcml0aG1cbi8vICAgIG1vbnRfKCkgICAgICAgICAgICAgPSBhbGdvcml0aG0gMTQuMzYsIE1vbnRnb21lcnkgbXVsdGlwbGljYXRpb25cbi8vICAgIGRpdmlkZV8oKSAgICAgICAgICAgPSBhbGdvcml0aG0gMTQuMjAgIE11bHRpcGxlLXByZWNpc2lvbiBkaXZpc2lvblxuLy8gICAgc3F1YXJlTW9kXygpICAgICAgICA9IGFsZ29yaXRobSAxNC4xNiAgTXVsdGlwbGUtcHJlY2lzaW9uIHNxdWFyaW5nXG4vLyAgICByYW5kVHJ1ZVByaW1lXygpICAgID0gYWxnb3JpdGhtICA0LjYyLCBNYXVyZXIncyBhbGdvcml0aG1cbi8vICAgIG1pbGxlclJhYmluKCkgICAgICAgPSBhbGdvcml0aG0gIDQuMjQsIE1pbGxlci1SYWJpbiBhbGdvcml0aG1cbi8vXG4vLyBQcm9maWxpbmcgc2hvd3M6XG4vLyAgICAgcmFuZFRydWVQcmltZV8oKSBzcGVuZHM6XG4vLyAgICAgICAgIDEwJSBvZiBpdHMgdGltZSBpbiBjYWxscyB0byBwb3dNb2RfKClcbi8vICAgICAgICAgODUlIG9mIGl0cyB0aW1lIGluIGNhbGxzIHRvIG1pbGxlclJhYmluKClcbi8vICAgICBtaWxsZXJSYWJpbigpIHNwZW5kczpcbi8vICAgICAgICAgOTklIG9mIGl0cyB0aW1lIGluIGNhbGxzIHRvIHBvd01vZF8oKSAgIChhbHdheXMgd2l0aCBhIGJhc2Ugb2YgMilcbi8vICAgICBwb3dNb2RfKCkgc3BlbmRzOlxuLy8gICAgICAgICA5NCUgb2YgaXRzIHRpbWUgaW4gY2FsbHMgdG8gbW9udF8oKSAgKGFsbW9zdCBhbHdheXMgd2l0aCB4PT15KVxuLy9cbi8vIFRoaXMgc3VnZ2VzdHMgdGhlcmUgYXJlIHNldmVyYWwgd2F5cyB0byBzcGVlZCB1cCB0aGlzIGxpYnJhcnkgc2xpZ2h0bHk6XG4vLyAgICAgLSBjb252ZXJ0IHBvd01vZF8gdG8gdXNlIGEgTW9udGdvbWVyeSBmb3JtIG9mIGstYXJ5IHdpbmRvdyAob3IgbWF5YmUgYSBNb250Z29tZXJ5IGZvcm0gb2Ygc2xpZGluZyB3aW5kb3cpXG4vLyAgICAgICAgIC0tIHRoaXMgc2hvdWxkIGVzcGVjaWFsbHkgZm9jdXMgb24gYmVpbmcgZmFzdCB3aGVuIHJhaXNpbmcgMiB0byBhIHBvd2VyIG1vZCBuXG4vLyAgICAgLSBjb252ZXJ0IHJhbmRUcnVlUHJpbWVfKCkgdG8gdXNlIGEgbWluaW11bSByIG9mIDEvMyBpbnN0ZWFkIG9mIDEvMiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBjaGFuZ2UgdG8gdGhlIHRlc3Rcbi8vICAgICAtIHR1bmUgdGhlIHBhcmFtZXRlcnMgaW4gcmFuZFRydWVQcmltZV8oKSwgaW5jbHVkaW5nIGMsIG0sIGFuZCByZWNMaW1pdFxuLy8gICAgIC0gc3BlZWQgdXAgdGhlIHNpbmdsZSBsb29wIGluIG1vbnRfKCkgdGhhdCB0YWtlcyA5NSUgb2YgdGhlIHJ1bnRpbWUsIHBlcmhhcHMgYnkgcmVkdWNpbmcgY2hlY2tpbmdcbi8vICAgICAgIHdpdGhpbiB0aGUgbG9vcCB3aGVuIGFsbCB0aGUgcGFyYW1ldGVycyBhcmUgdGhlIHNhbWUgbGVuZ3RoLlxuLy9cbi8vIFRoZXJlIGFyZSBzZXZlcmFsIGlkZWFzIHRoYXQgbG9vayBsaWtlIHRoZXkgd291bGRuJ3QgaGVscCBtdWNoIGF0IGFsbDpcbi8vICAgICAtIHJlcGxhY2luZyB0cmlhbCBkaXZpc2lvbiBpbiByYW5kVHJ1ZVByaW1lXygpIHdpdGggYSBzaWV2ZSAodGhhdCBzcGVlZHMgdXAgc29tZXRoaW5nIHRha2luZyBhbG1vc3Qgbm8gdGltZSBhbnl3YXkpXG4vLyAgICAgLSBpbmNyZWFzZSBicGUgZnJvbSAxNSB0byAzMCAodGhhdCB3b3VsZCBoZWxwIGlmIHdlIGhhZCBhIDMyKjMyLT42NCBtdWx0aXBsaWVyLCBidXQgbm90IHdpdGggSmF2YVNjcmlwdCdzIDMyKjMyLT4zMilcbi8vICAgICAtIHNwZWVkaW5nIHVwIG1vbnRfKHgseSxuLG5wKSB3aGVuIHg9PXkgYnkgZG9pbmcgYSBub24tbW9kdWxhciwgbm9uLU1vbnRnb21lcnkgc3F1YXJlXG4vLyAgICAgICBmb2xsb3dlZCBieSBhIE1vbnRnb21lcnkgcmVkdWN0aW9uLiAgVGhlIGludGVybWVkaWF0ZSBhbnN3ZXIgd2lsbCBiZSB0d2ljZSBhcyBsb25nIGFzIHgsIHNvIHRoYXRcbi8vICAgICAgIG1ldGhvZCB3b3VsZCBiZSBzbG93ZXIuICBUaGlzIGlzIHVuZm9ydHVuYXRlIGJlY2F1c2UgdGhlIGNvZGUgY3VycmVudGx5IHNwZW5kcyBhbG1vc3QgYWxsIG9mIGl0cyB0aW1lXG4vLyAgICAgICBkb2luZyBtb250Xyh4LHgsLi4uKSwgYm90aCBmb3IgcmFuZFRydWVQcmltZV8oKSBhbmQgcG93TW9kXygpLiAgQSBmYXN0ZXIgbWV0aG9kIGZvciBNb250Z29tZXJ5IHNxdWFyaW5nXG4vLyAgICAgICB3b3VsZCBoYXZlIGEgbGFyZ2UgaW1wYWN0IG9uIHRoZSBzcGVlZCBvZiByYW5kVHJ1ZVByaW1lXygpIGFuZCBwb3dNb2RfKCkuICBIQUMgaGFzIGEgY291cGxlIG9mIHBvb3JseS13b3JkZWRcbi8vICAgICAgIHNlbnRlbmNlcyB0aGF0IHNlZW0gdG8gaW1wbHkgaXQncyBmYXN0ZXIgdG8gZG8gYSBub24tbW9kdWxhciBzcXVhcmUgZm9sbG93ZWQgYnkgYSBzaW5nbGVcbi8vICAgICAgIE1vbnRnb21lcnkgcmVkdWN0aW9uLCBidXQgdGhhdCdzIG9idmlvdXNseSB3cm9uZy5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vZ2xvYmFsc1xudmFyIGJwZSA9IDA7IC8vYml0cyBzdG9yZWQgcGVyIGFycmF5IGVsZW1lbnRcbnZhciBtYXNrID0gMDsgLy9BTkQgdGhpcyB3aXRoIGFuIGFycmF5IGVsZW1lbnQgdG8gY2hvcCBpdCBkb3duIHRvIGJwZSBiaXRzXG52YXIgcmFkaXggPSBtYXNrICsgMTsgLy9lcXVhbHMgMl5icGUuICBBIHNpbmdsZSAxIGJpdCB0byB0aGUgbGVmdCBvZiB0aGUgbGFzdCBiaXQgb2YgbWFzay5cbi8vdGhlIGRpZ2l0cyBmb3IgY29udmVydGluZyB0byBkaWZmZXJlbnQgYmFzZXNcbmNvbnN0IGRpZ2l0c1N0ciA9IFwiMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpfPSFAIyQlXiYqKClbXXt9fDs6LC48Pi8/YH4gXFxcXCdcXFwiKy1cIjtcbi8vaW5pdGlhbGl6ZSB0aGUgZ2xvYmFsIHZhcmlhYmxlc1xuZm9yIChicGUgPSAwOyAxIDw8IChicGUgKyAxKSA+IDEgPDwgYnBlOyBicGUrKylcbiAgICA7IC8vYnBlPW51bWJlciBvZiBiaXRzIGluIHRoZSBtYW50aXNzYSBvbiB0aGlzIHBsYXRmb3JtXG5icGUgPj49IDE7IC8vYnBlPW51bWJlciBvZiBiaXRzIGluIG9uZSBlbGVtZW50IG9mIHRoZSBhcnJheSByZXByZXNlbnRpbmcgdGhlIGJpZ0ludFxubWFzayA9ICgxIDw8IGJwZSkgLSAxOyAvL0FORCB0aGUgbWFzayB3aXRoIGFuIGludGVnZXIgdG8gZ2V0IGl0cyBicGUgbGVhc3Qgc2lnbmlmaWNhbnQgYml0c1xucmFkaXggPSBtYXNrICsgMTsgLy8yXmJwZS4gIGEgc2luZ2xlIDEgYml0IHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBiaXQgb2YgbWFza1xuY29uc3Qgb25lID0gaW50MmJpZ0ludCgxLCAxLCAxKTsgLy9jb25zdGFudCB1c2VkIGluIHBvd01vZF8oKVxuLy90aGUgZm9sbG93aW5nIGdsb2JhbCB2YXJpYWJsZXMgYXJlIHNjcmF0Y2hwYWQgbWVtb3J5IHRvXG4vL3JlZHVjZSBkeW5hbWljIG1lbW9yeSBhbGxvY2F0aW9uIGluIHRoZSBpbm5lciBsb29wXG52YXIgdCA9IG5ldyBBcnJheSgwKTtcbnZhciBzcyA9IHQ7IC8vdXNlZCBpbiBtdWx0XygpXG52YXIgczAgPSB0OyAvL3VzZWQgaW4gbXVsdE1vZF8oKSwgc3F1YXJlTW9kXygpXG52YXIgczEgPSB0OyAvL3VzZWQgaW4gcG93TW9kXygpLCBtdWx0TW9kXygpLCBzcXVhcmVNb2RfKClcbnZhciBzMiA9IHQ7IC8vdXNlZCBpbiBwb3dNb2RfKCksIG11bHRNb2RfKClcbnZhciBzMyA9IHQ7IC8vdXNlZCBpbiBwb3dNb2RfKClcbnZhciBzNCA9IHQ7XG52YXIgczUgPSB0OyAvL3VzZWQgaW4gbW9kXygpXG52YXIgczYgPSB0OyAvL3VzZWQgaW4gYmlnSW50MnN0cigpXG52YXIgczcgPSB0OyAvL3VzZWQgaW4gcG93TW9kXygpXG52YXIgVCA9IHQ7IC8vdXNlZCBpbiBHQ0RfKClcbnZhciBzYSA9IHQ7IC8vdXNlZCBpbiBtb250XygpXG52YXIgbXJfeDEgPSB0O1xudmFyIG1yX3IgPSB0O1xudmFyIG1yX2EgPSB0OyAvL3VzZWQgaW4gbWlsbGVyUmFiaW4oKVxudmFyIGVnX3YgPSB0O1xudmFyIGVnX3UgPSB0O1xudmFyIGVnX0EgPSB0O1xudmFyIGVnX0IgPSB0O1xudmFyIGVnX0MgPSB0O1xudmFyIGVnX0QgPSB0OyAvL3VzZWQgaW4gZUdDRF8oKSwgaW52ZXJzZU1vZF8oKVxudmFyIG1kX3ExID0gdDtcbnZhciBtZF9xMiA9IHQ7XG52YXIgbWRfcTMgPSB0O1xudmFyIG1kX3IgPSB0O1xudmFyIG1kX3IxID0gdDtcbnZhciBtZF9yMiA9IHQ7XG52YXIgbWRfdHQgPSB0OyAvL3VzZWQgaW4gbW9kXygpXG52YXIgcHJpbWVzID0gdDtcbnZhciBwb3dzID0gdDtcbnZhciBzX2kgPSB0O1xudmFyIHNfaTIgPSB0O1xudmFyIHNfUiA9IHQ7XG52YXIgc19ybSA9IHQ7XG52YXIgc19xID0gdDtcbnZhciBzX24xID0gdDtcbnZhciBzX2EgPSB0O1xudmFyIHNfcjIgPSB0O1xudmFyIHNfbiA9IHQ7XG52YXIgc19iID0gdDtcbnZhciBzX2QgPSB0O1xudmFyIHNfeDEgPSB0O1xudmFyIHNfeDIgPSB0O1xudmFyIHNfYWEgPSB0OyAvL3VzZWQgaW4gcmFuZFRydWVQcmltZV8oKVxudmFyIHJwcHJiID0gdDsgLy91c2VkIGluIHJhbmRQcm9iUHJpbWVSb3VuZHMoKSAod2hpY2ggYWxzbyB1c2VzIFwicHJpbWVzXCIpXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL3JldHVybiBhcnJheSBvZiBhbGwgcHJpbWVzIGxlc3MgdGhhbiBpbnRlZ2VyIG5cbmZ1bmN0aW9uIGZpbmRQcmltZXMobikge1xuICAgIHZhciBpLCBzLCBwLCBhbnM7XG4gICAgcyA9IG5ldyBBcnJheShuKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKVxuICAgICAgICBzW2ldID0gMDtcbiAgICBzWzBdID0gMjtcbiAgICBwID0gMDsgLy9maXJzdCBwIGVsZW1lbnRzIG9mIHMgYXJlIHByaW1lcywgdGhlIHJlc3QgYXJlIGEgc2lldmVcbiAgICBmb3IgKDsgc1twXSA8IG47KSB7XG4gICAgICAgIC8vc1twXSBpcyB0aGUgcHRoIHByaW1lXG4gICAgICAgIGZvciAoaSA9IHNbcF0gKiBzW3BdOyBpIDwgbjsgaSArPSBzW3BdIC8vbWFyayBtdWx0aXBsZXMgb2Ygc1twXVxuICAgICAgICApXG4gICAgICAgICAgICBzW2ldID0gMTtcbiAgICAgICAgcCsrO1xuICAgICAgICBzW3BdID0gc1twIC0gMV0gKyAxO1xuICAgICAgICBmb3IgKDsgc1twXSA8IG4gJiYgc1tzW3BdXTsgc1twXSsrKVxuICAgICAgICAgICAgOyAvL2ZpbmQgbmV4dCBwcmltZSAod2hlcmUgc1twXT09MClcbiAgICB9XG4gICAgYW5zID0gbmV3IEFycmF5KHApO1xuICAgIGZvciAoaSA9IDA7IGkgPCBwOyBpKyspXG4gICAgICAgIGFuc1tpXSA9IHNbaV07XG4gICAgcmV0dXJuIGFucztcbn1cbi8vZG9lcyBhIHNpbmdsZSByb3VuZCBvZiBNaWxsZXItUmFiaW4gYmFzZSBiIGNvbnNpZGVyIHggdG8gYmUgYSBwb3NzaWJsZSBwcmltZT9cbi8veCBpcyBhIGJpZ0ludCwgYW5kIGIgaXMgYW4gaW50ZWdlciwgd2l0aCBiPHhcbmZ1bmN0aW9uIG1pbGxlclJhYmluSW50KHgsIGIpIHtcbiAgICBpZiAobXJfeDEubGVuZ3RoICE9IHgubGVuZ3RoKSB7XG4gICAgICAgIG1yX3gxID0gZHVwKHgpO1xuICAgICAgICBtcl9yID0gZHVwKHgpO1xuICAgICAgICBtcl9hID0gZHVwKHgpO1xuICAgIH1cbiAgICBjb3B5SW50Xyhtcl9hLCBiKTtcbiAgICByZXR1cm4gbWlsbGVyUmFiaW4oeCwgbXJfYSk7XG59XG4vL2RvZXMgYSBzaW5nbGUgcm91bmQgb2YgTWlsbGVyLVJhYmluIGJhc2UgYiBjb25zaWRlciB4IHRvIGJlIGEgcG9zc2libGUgcHJpbWU/XG4vL3ggYW5kIGIgYXJlIGJpZ0ludHMgd2l0aCBiPHhcbmZ1bmN0aW9uIG1pbGxlclJhYmluKHgsIGIpIHtcbiAgICB2YXIgaSwgaiwgaywgcztcbiAgICBpZiAobXJfeDEubGVuZ3RoICE9IHgubGVuZ3RoKSB7XG4gICAgICAgIG1yX3gxID0gZHVwKHgpO1xuICAgICAgICBtcl9yID0gZHVwKHgpO1xuICAgICAgICBtcl9hID0gZHVwKHgpO1xuICAgIH1cbiAgICBjb3B5Xyhtcl9hLCBiKTtcbiAgICBjb3B5Xyhtcl9yLCB4KTtcbiAgICBjb3B5Xyhtcl94MSwgeCk7XG4gICAgYWRkSW50Xyhtcl9yLCAtMSk7XG4gICAgYWRkSW50Xyhtcl94MSwgLTEpO1xuICAgIC8vcz10aGUgaGlnaGVzdCBwb3dlciBvZiB0d28gdGhhdCBkaXZpZGVzIG1yX3JcbiAgICBrID0gMDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbXJfci5sZW5ndGg7IGkrKylcbiAgICAgICAgZm9yIChqID0gMTsgaiA8IG1hc2s7IGogPDw9IDEpXG4gICAgICAgICAgICBpZiAoeFtpXSAmIGopIHtcbiAgICAgICAgICAgICAgICBzID0gayA8IG1yX3IubGVuZ3RoICsgYnBlID8gayA6IDA7XG4gICAgICAgICAgICAgICAgaSA9IG1yX3IubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGogPSBtYXNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaysrO1xuICAgICAgICAgICAgfVxuICAgIGlmIChzKSB7XG4gICAgICAgIHJpZ2h0U2hpZnRfKG1yX3IsIHMpO1xuICAgIH1cbiAgICBwb3dNb2RfKG1yX2EsIG1yX3IsIHgpO1xuICAgIGlmICghZXF1YWxzSW50KG1yX2EsIDEpICYmICFlcXVhbHMobXJfYSwgbXJfeDEpKSB7XG4gICAgICAgIGogPSAxO1xuICAgICAgICB3aGlsZSAoaiA8PSBzIC0gMSAmJiAhZXF1YWxzKG1yX2EsIG1yX3gxKSkge1xuICAgICAgICAgICAgc3F1YXJlTW9kXyhtcl9hLCB4KTtcbiAgICAgICAgICAgIGlmIChlcXVhbHNJbnQobXJfYSwgMSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVxdWFscyhtcl9hLCBtcl94MSkpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAxO1xufVxuLy9yZXR1cm5zIGhvdyBtYW55IGJpdHMgbG9uZyB0aGUgYmlnSW50IGlzLCBub3QgY291bnRpbmcgbGVhZGluZyB6ZXJvcy5cbmZ1bmN0aW9uIGJpdFNpemUoeCkge1xuICAgIHZhciBqLCB6LCB3O1xuICAgIGZvciAoaiA9IHgubGVuZ3RoIC0gMTsgeFtqXSA9PSAwICYmIGogPiAwOyBqLS0pXG4gICAgICAgIDtcbiAgICBmb3IgKHogPSAwLCB3ID0geFtqXTsgdzsgdyA+Pj0gMSwgeisrKVxuICAgICAgICA7XG4gICAgeiArPSBicGUgKiBqO1xuICAgIHJldHVybiB6O1xufVxuLy9yZXR1cm4gYSBjb3B5IG9mIHggd2l0aCBhdCBsZWFzdCBuIGVsZW1lbnRzLCBhZGRpbmcgbGVhZGluZyB6ZXJvcyBpZiBuZWVkZWRcbmZ1bmN0aW9uIGV4cGFuZCh4LCBuKSB7XG4gICAgdmFyIGFucyA9IGludDJiaWdJbnQoMCwgKHgubGVuZ3RoID4gbiA/IHgubGVuZ3RoIDogbikgKiBicGUsIDApO1xuICAgIGNvcHlfKGFucywgeCk7XG4gICAgcmV0dXJuIGFucztcbn1cbi8vcmV0dXJuIGEgay1iaXQgdHJ1ZSByYW5kb20gcHJpbWUgdXNpbmcgTWF1cmVyJ3MgYWxnb3JpdGhtLlxuZnVuY3Rpb24gcmFuZFRydWVQcmltZShrKSB7XG4gICAgdmFyIGFucyA9IGludDJiaWdJbnQoMCwgaywgMCk7XG4gICAgcmFuZFRydWVQcmltZV8oYW5zLCBrKTtcbiAgICByZXR1cm4gdHJpbShhbnMsIDEpO1xufVxuLy9yZXR1cm4gYSBrLWJpdCByYW5kb20gcHJvYmFibGUgcHJpbWUgd2l0aCBwcm9iYWJpbGl0eSBvZiBlcnJvciA8IDJeLTgwXG5mdW5jdGlvbiByYW5kUHJvYlByaW1lKGspIHtcbiAgICBpZiAoayA+PSA2MDApXG4gICAgICAgIHJldHVybiByYW5kUHJvYlByaW1lUm91bmRzKGssIDIpOyAvL251bWJlcnMgZnJvbSBIQUMgdGFibGUgNC4zXG4gICAgaWYgKGsgPj0gNTUwKVxuICAgICAgICByZXR1cm4gcmFuZFByb2JQcmltZVJvdW5kcyhrLCA0KTtcbiAgICBpZiAoayA+PSA1MDApXG4gICAgICAgIHJldHVybiByYW5kUHJvYlByaW1lUm91bmRzKGssIDUpO1xuICAgIGlmIChrID49IDQwMClcbiAgICAgICAgcmV0dXJuIHJhbmRQcm9iUHJpbWVSb3VuZHMoaywgNik7XG4gICAgaWYgKGsgPj0gMzUwKVxuICAgICAgICByZXR1cm4gcmFuZFByb2JQcmltZVJvdW5kcyhrLCA3KTtcbiAgICBpZiAoayA+PSAzMDApXG4gICAgICAgIHJldHVybiByYW5kUHJvYlByaW1lUm91bmRzKGssIDkpO1xuICAgIGlmIChrID49IDI1MClcbiAgICAgICAgcmV0dXJuIHJhbmRQcm9iUHJpbWVSb3VuZHMoaywgMTIpOyAvL251bWJlcnMgZnJvbSBIQUMgdGFibGUgNC40XG4gICAgaWYgKGsgPj0gMjAwKVxuICAgICAgICByZXR1cm4gcmFuZFByb2JQcmltZVJvdW5kcyhrLCAxNSk7XG4gICAgaWYgKGsgPj0gMTUwKVxuICAgICAgICByZXR1cm4gcmFuZFByb2JQcmltZVJvdW5kcyhrLCAxOCk7XG4gICAgaWYgKGsgPj0gMTAwKVxuICAgICAgICByZXR1cm4gcmFuZFByb2JQcmltZVJvdW5kcyhrLCAyNyk7XG4gICAgcmV0dXJuIHJhbmRQcm9iUHJpbWVSb3VuZHMoaywgNDApOyAvL251bWJlciBmcm9tIEhBQyByZW1hcmsgNC4yNiAob25seSBhbiBlc3RpbWF0ZSlcbn1cbi8vcmV0dXJuIGEgay1iaXQgcHJvYmFibGUgcmFuZG9tIHByaW1lIHVzaW5nIG4gcm91bmRzIG9mIE1pbGxlciBSYWJpbiAoYWZ0ZXIgdHJpYWwgZGl2aXNpb24gd2l0aCBzbWFsbCBwcmltZXMpXG5mdW5jdGlvbiByYW5kUHJvYlByaW1lUm91bmRzKGssIG4pIHtcbiAgICB2YXIgYW5zLCBpLCBkaXZpc2libGUsIEI7XG4gICAgQiA9IDMwMDAwOyAvL0IgaXMgbGFyZ2VzdCBwcmltZSB0byB1c2UgaW4gdHJpYWwgZGl2aXNpb25cbiAgICBhbnMgPSBpbnQyYmlnSW50KDAsIGssIDApO1xuICAgIC8vb3B0aW1pemF0aW9uOiB0cnkgbGFyZ2VyIGFuZCBzbWFsbGVyIEIgdG8gZmluZCB0aGUgYmVzdCBsaW1pdC5cbiAgICBpZiAocHJpbWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHByaW1lcyA9IGZpbmRQcmltZXMoMzAwMDApO1xuICAgIH0gLy9jaGVjayBmb3IgZGl2aXNpYmlsaXR5IGJ5IHByaW1lcyA8PTMwMDAwXG4gICAgaWYgKHJwcHJiLmxlbmd0aCAhPSBhbnMubGVuZ3RoKSB7XG4gICAgICAgIHJwcHJiID0gZHVwKGFucyk7XG4gICAgfVxuICAgIGZvciAoOzspIHtcbiAgICAgICAgLy9rZWVwIHRyeWluZyByYW5kb20gdmFsdWVzIGZvciBhbnMgdW50aWwgb25lIGFwcGVhcnMgdG8gYmUgcHJpbWVcbiAgICAgICAgLy9vcHRpbWl6YXRpb246IHBpY2sgYSByYW5kb20gbnVtYmVyIHRpbWVzIEw9MiozKjUqLi4uKnAsIHBsdXMgYVxuICAgICAgICAvLyAgIHJhbmRvbSBlbGVtZW50IG9mIHRoZSBsaXN0IG9mIGFsbCBudW1iZXJzIGluIFswLEwpIG5vdCBkaXZpc2libGUgYnkgYW55IHByaW1lIHVwIHRvIHAuXG4gICAgICAgIC8vICAgVGhpcyBjYW4gcmVkdWNlIHRoZSBhbW91bnQgb2YgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uLlxuICAgICAgICByYW5kQmlnSW50XyhhbnMsIGssIDApOyAvL2FucyA9IGEgcmFuZG9tIG9kZCBudW1iZXIgdG8gY2hlY2tcbiAgICAgICAgYW5zWzBdIHw9IDE7XG4gICAgICAgIGRpdmlzaWJsZSA9IDA7XG4gICAgICAgIC8vY2hlY2sgYW5zIGZvciBkaXZpc2liaWxpdHkgYnkgc21hbGwgcHJpbWVzIHVwIHRvIEJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHByaW1lcy5sZW5ndGggJiYgcHJpbWVzW2ldIDw9IEI7IGkrKylcbiAgICAgICAgICAgIGlmIChtb2RJbnQoYW5zLCBwcmltZXNbaV0pID09IDAgJiYgIWVxdWFsc0ludChhbnMsIHByaW1lc1tpXSkpIHtcbiAgICAgICAgICAgICAgICBkaXZpc2libGUgPSAxO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAvL29wdGltaXphdGlvbjogY2hhbmdlIG1pbGxlclJhYmluIHNvIHRoZSBiYXNlIGNhbiBiZSBiaWdnZXIgdGhhbiB0aGUgbnVtYmVyIGJlaW5nIGNoZWNrZWQsIHRoZW4gZWxpbWluYXRlIHRoZSB3aGlsZSBoZXJlLlxuICAgICAgICAvL2RvIG4gcm91bmRzIG9mIE1pbGxlciBSYWJpbiwgd2l0aCByYW5kb20gYmFzZXMgbGVzcyB0aGFuIGFuc1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbiAmJiAhZGl2aXNpYmxlOyBpKyspIHtcbiAgICAgICAgICAgIHJhbmRCaWdJbnRfKHJwcHJiLCBrLCAwKTtcbiAgICAgICAgICAgIHdoaWxlICghZ3JlYXRlcihhbnMsIHJwcHJiKSlcbiAgICAgICAgICAgICAgICAvL3BpY2sgYSByYW5kb20gcnBwcmIgdGhhdCdzIDwgYW5zXG4gICAgICAgICAgICAgICAgcmFuZEJpZ0ludF8ocnBwcmIsIGssIDApO1xuICAgICAgICAgICAgaWYgKCFtaWxsZXJSYWJpbihhbnMsIHJwcHJiKSkge1xuICAgICAgICAgICAgICAgIGRpdmlzaWJsZSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkaXZpc2libGUpIHtcbiAgICAgICAgICAgIHJldHVybiBhbnM7XG4gICAgICAgIH1cbiAgICB9XG59XG4vL3JldHVybiBhIG5ldyBiaWdJbnQgZXF1YWwgdG8gKHggbW9kIG4pIGZvciBiaWdJbnRzIHggYW5kIG4uXG5mdW5jdGlvbiBtb2QoeCwgbikge1xuICAgIHZhciBhbnMgPSBkdXAoeCk7XG4gICAgbW9kXyhhbnMsIG4pO1xuICAgIHJldHVybiB0cmltKGFucywgMSk7XG59XG4vL3JldHVybiAoeCtuKSB3aGVyZSB4IGlzIGEgYmlnSW50IGFuZCBuIGlzIGFuIGludGVnZXIuXG5mdW5jdGlvbiBhZGRJbnQoeCwgbikge1xuICAgIHZhciBhbnMgPSBleHBhbmQoeCwgeC5sZW5ndGggKyAxKTtcbiAgICBhZGRJbnRfKGFucywgbik7XG4gICAgcmV0dXJuIHRyaW0oYW5zLCAxKTtcbn1cbi8vcmV0dXJuIHgqeSBmb3IgYmlnSW50cyB4IGFuZCB5LiBUaGlzIGlzIGZhc3RlciB3aGVuIHk8eC5cbmZ1bmN0aW9uIG11bHQoeCwgeSkge1xuICAgIHZhciBhbnMgPSBleHBhbmQoeCwgeC5sZW5ndGggKyB5Lmxlbmd0aCk7XG4gICAgbXVsdF8oYW5zLCB5KTtcbiAgICByZXR1cm4gdHJpbShhbnMsIDEpO1xufVxuLy9yZXR1cm4gKHgqKnkgbW9kIG4pIHdoZXJlIHgseSxuIGFyZSBiaWdJbnRzIGFuZCAqKiBpcyBleHBvbmVudGlhdGlvbi4gIDAqKjA9MS4gRmFzdGVyIGZvciBvZGQgbi5cbmZ1bmN0aW9uIHBvd01vZCh4LCB5LCBuKSB7XG4gICAgdmFyIGFucyA9IGV4cGFuZCh4LCBuLmxlbmd0aCk7XG4gICAgcG93TW9kXyhhbnMsIHRyaW0oeSwgMiksIHRyaW0obiwgMiksIDApOyAvL3RoaXMgc2hvdWxkIHdvcmsgd2l0aG91dCB0aGUgdHJpbSwgYnV0IGRvZXNuJ3RcbiAgICByZXR1cm4gdHJpbShhbnMsIDEpO1xufVxuLy9yZXR1cm4gKHgteSkgZm9yIGJpZ0ludHMgeCBhbmQgeS4gIE5lZ2F0aXZlIGFuc3dlcnMgd2lsbCBiZSAycyBjb21wbGVtZW50XG5mdW5jdGlvbiBzdWIoeCwgeSkge1xuICAgIHZhciBhbnMgPSBleHBhbmQoeCwgeC5sZW5ndGggPiB5Lmxlbmd0aCA/IHgubGVuZ3RoICsgMSA6IHkubGVuZ3RoICsgMSk7XG4gICAgc3ViXyhhbnMsIHkpO1xuICAgIHJldHVybiB0cmltKGFucywgMSk7XG59XG4vL3JldHVybiAoeCt5KSBmb3IgYmlnSW50cyB4IGFuZCB5LlxuZnVuY3Rpb24gYWRkKHgsIHkpIHtcbiAgICB2YXIgYW5zID0gZXhwYW5kKHgsIHgubGVuZ3RoID4geS5sZW5ndGggPyB4Lmxlbmd0aCArIDEgOiB5Lmxlbmd0aCArIDEpO1xuICAgIGFkZF8oYW5zLCB5KTtcbiAgICByZXR1cm4gdHJpbShhbnMsIDEpO1xufVxuLy9yZXR1cm4gKHgqKigtMSkgbW9kIG4pIGZvciBiaWdJbnRzIHggYW5kIG4uICBJZiBubyBpbnZlcnNlIGV4aXN0cywgaXQgcmV0dXJucyBudWxsXG5mdW5jdGlvbiBpbnZlcnNlTW9kKHgsIG4pIHtcbiAgICB2YXIgYW5zID0gZXhwYW5kKHgsIG4ubGVuZ3RoKTtcbiAgICB2YXIgcztcbiAgICBzID0gaW52ZXJzZU1vZF8oYW5zLCBuKTtcbiAgICByZXR1cm4gcyA/IHRyaW0oYW5zLCAxKSA6IG51bGw7XG59XG4vL3JldHVybiAoeCp5IG1vZCBuKSBmb3IgYmlnSW50cyB4LHksbi4gIEZvciBncmVhdGVyIHNwZWVkLCBsZXQgeTx4LlxuZnVuY3Rpb24gbXVsdE1vZCh4LCB5LCBuKSB7XG4gICAgdmFyIGFucyA9IGV4cGFuZCh4LCBuLmxlbmd0aCk7XG4gICAgbXVsdE1vZF8oYW5zLCB5LCBuKTtcbiAgICByZXR1cm4gdHJpbShhbnMsIDEpO1xufVxuLyogVFVUQU86IG5vdCB1c2VkXG4gLy9nZW5lcmF0ZSBhIGstYml0IHRydWUgcmFuZG9tIHByaW1lIHVzaW5nIE1hdXJlcidzIGFsZ29yaXRobSxcbiAvL2FuZCBwdXQgaXQgaW50byBhbnMuICBUaGUgYmlnSW50IGFucyBtdXN0IGJlIGxhcmdlIGVub3VnaCB0byBob2xkIGl0LlxuIGZ1bmN0aW9uIHJhbmRUcnVlUHJpbWVfKGFucyxrKSB7XG4gdmFyIGMsbSxwbSxkZCxqLHIsQixkaXZpc2libGUseix6eixyZWNTaXplO1xuXG4gaWYgKHByaW1lcy5sZW5ndGg9PTApXG4gcHJpbWVzPWZpbmRQcmltZXMoMzAwMDApOyAgLy9jaGVjayBmb3IgZGl2aXNpYmlsaXR5IGJ5IHByaW1lcyA8PTMwMDAwXG5cbiBpZiAocG93cy5sZW5ndGg9PTApIHtcbiBwb3dzPW5ldyBBcnJheSg1MTIpO1xuIGZvciAoaj0wO2o8NTEyO2orKykge1xuIHBvd3Nbal09TWF0aC5wb3coMixqLzUxMS4tMS4pO1xuIH1cbiB9XG5cbiAvL2MgYW5kIG0gc2hvdWxkIGJlIHR1bmVkIGZvciBhIHBhcnRpY3VsYXIgbWFjaGluZSBhbmQgdmFsdWUgb2YgaywgdG8gbWF4aW1pemUgc3BlZWRcbiBjPTAuMTsgIC8vYz0wLjEgaW4gSEFDXG4gbT0yMDsgICAvL2dlbmVyYXRlIHRoaXMgay1iaXQgbnVtYmVyIGJ5IGZpcnN0IHJlY3Vyc2l2ZWx5IGdlbmVyYXRpbmcgYSBudW1iZXIgdGhhdCBoYXMgYmV0d2VlbiBrLzIgYW5kIGstbSBiaXRzXG4gcmVjTGltaXQ9MjA7IC8vc3RvcCByZWN1cnNpb24gd2hlbiBrIDw9cmVjTGltaXQuICBNdXN0IGhhdmUgcmVjTGltaXQgPj0gMlxuXG4gaWYgKHNfaTIubGVuZ3RoIT1hbnMubGVuZ3RoKSB7XG4gc19pMj1kdXAoYW5zKTtcbiBzX1IgPWR1cChhbnMpO1xuIHNfbjE9ZHVwKGFucyk7XG4gc19yMj1kdXAoYW5zKTtcbiBzX2QgPWR1cChhbnMpO1xuIHNfeDE9ZHVwKGFucyk7XG4gc194Mj1kdXAoYW5zKTtcbiBzX2IgPWR1cChhbnMpO1xuIHNfbiA9ZHVwKGFucyk7XG4gc19pID1kdXAoYW5zKTtcbiBzX3JtPWR1cChhbnMpO1xuIHNfcSA9ZHVwKGFucyk7XG4gc19hID1kdXAoYW5zKTtcbiBzX2FhPWR1cChhbnMpO1xuIH1cblxuIGlmIChrIDw9IHJlY0xpbWl0KSB7ICAvL2dlbmVyYXRlIHNtYWxsIHJhbmRvbSBwcmltZXMgYnkgdHJpYWwgZGl2aXNpb24gdXAgdG8gaXRzIHNxdWFyZSByb290XG4gcG09KDE8PCgoaysyKT4+MSkpLTE7IC8vcG0gaXMgYmluYXJ5IG51bWJlciB3aXRoIGFsbCBvbmVzLCBqdXN0IG92ZXIgc3FydCgyXmspXG4gY29weUludF8oYW5zLDApO1xuIGZvciAoZGQ9MTtkZDspIHtcbiBkZD0wO1xuIGFuc1swXT0gMSB8ICgxPDwoay0xKSkgfCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKDE8PGspKTsgIC8vcmFuZG9tLCBrLWJpdCwgb2RkIGludGVnZXIsIHdpdGggbXNiIDFcbiBmb3IgKGo9MTsoajxwcmltZXMubGVuZ3RoKSAmJiAoKHByaW1lc1tqXSZwbSk9PXByaW1lc1tqXSk7aisrKSB7IC8vdHJpYWwgZGl2aXNpb24gYnkgYWxsIHByaW1lcyAzLi4uc3FydCgyXmspXG4gaWYgKDA9PShhbnNbMF0lcHJpbWVzW2pdKSkge1xuIGRkPTE7XG4gYnJlYWs7XG4gfVxuIH1cbiB9XG4gY2FycnlfKGFucyk7XG4gcmV0dXJuO1xuIH1cblxuIEI9YyprKms7ICAgIC8vdHJ5IHNtYWxsIHByaW1lcyB1cCB0byBCIChvciBhbGwgdGhlIHByaW1lc1tdIGFycmF5IGlmIHRoZSBsYXJnZXN0IGlzIGxlc3MgdGhhbiBCKS5cbiBpZiAoaz4yKm0pICAvL2dlbmVyYXRlIHRoaXMgay1iaXQgbnVtYmVyIGJ5IGZpcnN0IHJlY3Vyc2l2ZWx5IGdlbmVyYXRpbmcgYSBudW1iZXIgdGhhdCBoYXMgYmV0d2VlbiBrLzIgYW5kIGstbSBiaXRzXG4gZm9yIChyPTE7IGstaypyPD1tOyApXG4gcj1wb3dzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSo1MTIpXTsgICAvL3I9TWF0aC5wb3coMixNYXRoLnJhbmRvbSgpLTEpO1xuIGVsc2VcbiByPS41O1xuXG4gLy9zaW11bGF0aW9uIHN1Z2dlc3RzIHRoZSBtb3JlIGNvbXBsZXggYWxnb3JpdGhtIHVzaW5nIHI9LjMzMyBpcyBvbmx5IHNsaWdodGx5IGZhc3Rlci5cblxuIHJlY1NpemU9TWF0aC5mbG9vcihyKmspKzE7XG5cbiByYW5kVHJ1ZVByaW1lXyhzX3EscmVjU2l6ZSk7XG4gY29weUludF8oc19pMiwwKTtcbiBzX2kyW01hdGguZmxvb3IoKGstMikvYnBlKV0gfD0gKDE8PCgoay0yKSVicGUpKTsgICAvL3NfaTI9Ml4oay0yKVxuIGRpdmlkZV8oc19pMixzX3Esc19pLHNfcm0pOyAgICAgICAgICAgICAgICAgICAgICAgIC8vc19pPWZsb29yKCgyXihrLTEpKS8oMnEpKVxuXG4gej1iaXRTaXplKHNfaSk7XG5cbiBmb3IgKDs7KSB7XG4gZm9yICg7OykgeyAgLy9nZW5lcmF0ZSB6LWJpdCBudW1iZXJzIHVudGlsIG9uZSBmYWxscyBpbiB0aGUgcmFuZ2UgWzAsc19pLTFdXG4gcmFuZEJpZ0ludF8oc19SLHosMCk7XG4gaWYgKGdyZWF0ZXIoc19pLHNfUikpXG4gYnJlYWs7XG4gfSAgICAgICAgICAgICAgICAvL25vdyBzX1IgaXMgaW4gdGhlIHJhbmdlIFswLHNfaS0xXVxuIGFkZEludF8oc19SLDEpOyAgLy9ub3cgc19SIGlzIGluIHRoZSByYW5nZSBbMSxzX2ldXG4gYWRkXyhzX1Isc19pKTsgICAvL25vdyBzX1IgaXMgaW4gdGhlIHJhbmdlIFtzX2krMSwyKnNfaV1cblxuIGNvcHlfKHNfbixzX3EpO1xuIG11bHRfKHNfbixzX1IpO1xuIG11bHRJbnRfKHNfbiwyKTtcbiBhZGRJbnRfKHNfbiwxKTsgICAgLy9zX249MipzX1Iqc19xKzFcblxuIGNvcHlfKHNfcjIsc19SKTtcbiBtdWx0SW50XyhzX3IyLDIpOyAgLy9zX3IyPTIqc19SXG5cbiAvL2NoZWNrIHNfbiBmb3IgZGl2aXNpYmlsaXR5IGJ5IHNtYWxsIHByaW1lcyB1cCB0byBCXG4gZm9yIChkaXZpc2libGU9MCxqPTA7IChqPHByaW1lcy5sZW5ndGgpICYmIChwcmltZXNbal08Qik7IGorKylcbiBpZiAobW9kSW50KHNfbixwcmltZXNbal0pPT0wICYmICFlcXVhbHNJbnQoc19uLHByaW1lc1tqXSkpIHtcbiBkaXZpc2libGU9MTtcbiBicmVhaztcbiB9XG5cbiBpZiAoIWRpdmlzaWJsZSkgICAgLy9pZiBpdCBwYXNzZXMgc21hbGwgcHJpbWVzIGNoZWNrLCB0aGVuIHRyeSBhIHNpbmdsZSBNaWxsZXItUmFiaW4gYmFzZSAyXG4gaWYgKCFtaWxsZXJSYWJpbkludChzX24sMikpIC8vdGhpcyBsaW5lIHJlcHJlc2VudHMgNzUlIG9mIHRoZSB0b3RhbCBydW50aW1lIGZvciByYW5kVHJ1ZVByaW1lX1xuIGRpdmlzaWJsZT0xO1xuXG4gaWYgKCFkaXZpc2libGUpIHsgIC8vaWYgaXQgcGFzc2VzIHRoYXQgdGVzdCwgY29udGludWUgY2hlY2tpbmcgc19uXG4gYWRkSW50XyhzX24sLTMpO1xuIGZvciAoaj1zX24ubGVuZ3RoLTE7KHNfbltqXT09MCkgJiYgKGo+MCk7IGotLSk7ICAvL3N0cmlwIGxlYWRpbmcgemVyb3NcbiBmb3IgKHp6PTAsdz1zX25bal07IHc7ICh3Pj49MSksenorKyk7XG4genorPWJwZSpqOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy96ej1udW1iZXIgb2YgYml0cyBpbiBzX24sIGlnbm9yaW5nIGxlYWRpbmcgemVyb3NcbiBmb3IgKDs7KSB7ICAvL2dlbmVyYXRlIHotYml0IG51bWJlcnMgdW50aWwgb25lIGZhbGxzIGluIHRoZSByYW5nZSBbMCxzX24tMV1cbiByYW5kQmlnSW50XyhzX2EsenosMCk7XG4gaWYgKGdyZWF0ZXIoc19uLHNfYSkpXG4gYnJlYWs7XG4gfSAgICAgICAgICAgICAgICAvL25vdyBzX2EgaXMgaW4gdGhlIHJhbmdlIFswLHNfbi0xXVxuIGFkZEludF8oc19uLDMpOyAgLy9ub3cgc19hIGlzIGluIHRoZSByYW5nZSBbMCxzX24tNF1cbiBhZGRJbnRfKHNfYSwyKTsgIC8vbm93IHNfYSBpcyBpbiB0aGUgcmFuZ2UgWzIsc19uLTJdXG4gY29weV8oc19iLHNfYSk7XG4gY29weV8oc19uMSxzX24pO1xuIGFkZEludF8oc19uMSwtMSk7XG4gcG93TW9kXyhzX2Isc19uMSxzX24pOyAgIC8vc19iPXNfYV4oc19uLTEpIG1vZHVsbyBzX25cbiBhZGRJbnRfKHNfYiwtMSk7XG4gaWYgKGlzWmVybyhzX2IpKSB7XG4gY29weV8oc19iLHNfYSk7XG4gcG93TW9kXyhzX2Isc19yMixzX24pO1xuIGFkZEludF8oc19iLC0xKTtcbiBjb3B5XyhzX2FhLHNfbik7XG4gY29weV8oc19kLHNfYik7XG4gR0NEXyhzX2Qsc19uKTsgIC8vaWYgc19iIGFuZCBzX24gYXJlIHJlbGF0aXZlbHkgcHJpbWUsIHRoZW4gc19uIGlzIGEgcHJpbWVcbiBpZiAoZXF1YWxzSW50KHNfZCwxKSkge1xuIGNvcHlfKGFucyxzX2FhKTtcbiByZXR1cm47ICAgICAvL2lmIHdlJ3ZlIG1hZGUgaXQgdGhpcyBmYXIsIHRoZW4gc19uIGlzIGFic29sdXRlbHkgZ3VhcmFudGVlZCB0byBiZSBwcmltZVxuIH1cbiB9XG4gfVxuIH1cbiB9XG4gKi9cbi8vUmV0dXJuIGFuIG4tYml0IHJhbmRvbSBCaWdJbnQgKG4+PTEpLiAgSWYgcz0xLCB0aGVuIHRoZSBtb3N0IHNpZ25pZmljYW50IG9mIHRob3NlIG4gYml0cyBpcyBzZXQgdG8gMS5cbmZ1bmN0aW9uIHJhbmRCaWdJbnQobiwgcykge1xuICAgIHZhciBhLCBiO1xuICAgIGEgPSBNYXRoLmZsb29yKChuIC0gMSkgLyBicGUpICsgMjsgLy8jIGFycmF5IGVsZW1lbnRzIHRvIGhvbGQgdGhlIEJpZ0ludCB3aXRoIGEgbGVhZGluZyAwIGVsZW1lbnRcbiAgICBiID0gaW50MmJpZ0ludCgwLCAwLCBhKTtcbiAgICByYW5kQmlnSW50XyhiLCBuLCBzKTtcbiAgICByZXR1cm4gYjtcbn1cbi8qIFRVVEFPOiBub3QgdXNlZFxuIC8vU2V0IGIgdG8gYW4gbi1iaXQgcmFuZG9tIEJpZ0ludC4gIElmIHM9MSwgdGhlbiB0aGUgbW9zdCBzaWduaWZpY2FudCBvZiB0aG9zZSBuIGJpdHMgaXMgc2V0IHRvIDEuXG4gLy9BcnJheSBiIG11c3QgYmUgYmlnIGVub3VnaCB0byBob2xkIHRoZSByZXN1bHQuIE11c3QgaGF2ZSBuPj0xXG4gZnVuY3Rpb24gcmFuZEJpZ0ludF8oYixuLHMpIHtcbiB2YXIgaSxhO1xuIGZvciAoaT0wO2k8Yi5sZW5ndGg7aSsrKVxuIGJbaV09MDtcbiBhPU1hdGguZmxvb3IoKG4tMSkvYnBlKSsxOyAvLyMgYXJyYXkgZWxlbWVudHMgdG8gaG9sZCB0aGUgQmlnSW50XG4gZm9yIChpPTA7aTxhO2krKykge1xuIGJbaV09TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKigxPDwoYnBlLTEpKSk7XG4gfVxuIGJbYS0xXSAmPSAoMjw8KChuLTEpJWJwZSkpLTE7XG4gaWYgKHM9PTEpXG4gYlthLTFdIHw9ICgxPDwoKG4tMSklYnBlKSk7XG4gfVxuICovXG4vL1JldHVybiB0aGUgZ3JlYXRlc3QgY29tbW9uIGRpdmlzb3Igb2YgYmlnSW50cyB4IGFuZCB5IChlYWNoIHdpdGggc2FtZSBudW1iZXIgb2YgZWxlbWVudHMpLlxuZnVuY3Rpb24gR0NEKHgsIHkpIHtcbiAgICB2YXIgeGMsIHljO1xuICAgIHhjID0gZHVwKHgpO1xuICAgIHljID0gZHVwKHkpO1xuICAgIEdDRF8oeGMsIHljKTtcbiAgICByZXR1cm4geGM7XG59XG4vL3NldCB4IHRvIHRoZSBncmVhdGVzdCBjb21tb24gZGl2aXNvciBvZiBiaWdJbnRzIHggYW5kIHkgKGVhY2ggd2l0aCBzYW1lIG51bWJlciBvZiBlbGVtZW50cykuXG4vL3kgaXMgZGVzdHJveWVkLlxuZnVuY3Rpb24gR0NEXyh4LCB5KSB7XG4gICAgdmFyIGksIHhwLCB5cCwgQSwgQiwgQywgRCwgcSwgc2luZztcbiAgICBpZiAoVC5sZW5ndGggIT0geC5sZW5ndGgpIHtcbiAgICAgICAgVCA9IGR1cCh4KTtcbiAgICB9XG4gICAgc2luZyA9IDE7XG4gICAgd2hpbGUgKHNpbmcpIHtcbiAgICAgICAgLy93aGlsZSB5IGhhcyBub256ZXJvIGVsZW1lbnRzIG90aGVyIHRoYW4geVswXVxuICAgICAgICBzaW5nID0gMDtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IHkubGVuZ3RoOyBpKysgLy9jaGVjayBpZiB5IGhhcyBub256ZXJvIGVsZW1lbnRzIG90aGVyIHRoYW4gMFxuICAgICAgICApXG4gICAgICAgICAgICBpZiAoeVtpXSkge1xuICAgICAgICAgICAgICAgIHNpbmcgPSAxO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBpZiAoIXNpbmcpXG4gICAgICAgICAgICBicmVhazsgLy9xdWl0IHdoZW4geSBhbGwgemVybyBlbGVtZW50cyBleGNlcHQgcG9zc2libHkgeVswXVxuICAgICAgICBmb3IgKGkgPSB4Lmxlbmd0aDsgIXhbaV0gJiYgaSA+PSAwOyBpLS0pXG4gICAgICAgICAgICA7IC8vZmluZCBtb3N0IHNpZ25pZmljYW50IGVsZW1lbnQgb2YgeFxuICAgICAgICB4cCA9IHhbaV07XG4gICAgICAgIHlwID0geVtpXTtcbiAgICAgICAgQSA9IDE7XG4gICAgICAgIEIgPSAwO1xuICAgICAgICBDID0gMDtcbiAgICAgICAgRCA9IDE7XG4gICAgICAgIHdoaWxlICh5cCArIEMgJiYgeXAgKyBEKSB7XG4gICAgICAgICAgICBxID0gTWF0aC5mbG9vcigoeHAgKyBBKSAvICh5cCArIEMpKTtcbiAgICAgICAgICAgIGxldCBxcCA9IE1hdGguZmxvb3IoKHhwICsgQikgLyAoeXAgKyBEKSk7XG4gICAgICAgICAgICBpZiAocSAhPSBxcCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdCA9IEEgLSBxICogQztcbiAgICAgICAgICAgIEEgPSBDO1xuICAgICAgICAgICAgQyA9IHQ7IC8vICBkbyAoQSxCLHhwLCBDLEQseXApID0gKEMsRCx5cCwgQSxCLHhwKSAtIHEqKDAsMCwwLCBDLEQseXApXG4gICAgICAgICAgICB0ID0gQiAtIHEgKiBEO1xuICAgICAgICAgICAgQiA9IEQ7XG4gICAgICAgICAgICBEID0gdDtcbiAgICAgICAgICAgIHQgPSB4cCAtIHEgKiB5cDtcbiAgICAgICAgICAgIHhwID0geXA7XG4gICAgICAgICAgICB5cCA9IHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEIpIHtcbiAgICAgICAgICAgIGNvcHlfKFQsIHgpO1xuICAgICAgICAgICAgbGluQ29tYl8oeCwgeSwgQSwgQik7IC8veD1BKngrQip5XG4gICAgICAgICAgICBsaW5Db21iXyh5LCBULCBELCBDKTsgLy95PUQqeStDKlRcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1vZF8oeCwgeSk7XG4gICAgICAgICAgICBjb3B5XyhULCB4KTtcbiAgICAgICAgICAgIGNvcHlfKHgsIHkpO1xuICAgICAgICAgICAgY29weV8oeSwgVCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHlbMF0gPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHQgPSBtb2RJbnQoeCwgeVswXSk7XG4gICAgY29weUludF8oeCwgeVswXSk7XG4gICAgeVswXSA9IHQ7XG4gICAgd2hpbGUgKHlbMF0pIHtcbiAgICAgICAgeFswXSAlPSB5WzBdO1xuICAgICAgICB0ID0geFswXTtcbiAgICAgICAgeFswXSA9IHlbMF07XG4gICAgICAgIHlbMF0gPSB0O1xuICAgIH1cbn1cbi8vZG8geD14KiooLTEpIG1vZCBuLCBmb3IgYmlnSW50cyB4IGFuZCBuLlxuLy9JZiBubyBpbnZlcnNlIGV4aXN0cywgaXQgc2V0cyB4IHRvIHplcm8gYW5kIHJldHVybnMgMCwgZWxzZSBpdCByZXR1cm5zIDEuXG4vL1RoZSB4IGFycmF5IG11c3QgYmUgYXQgbGVhc3QgYXMgbGFyZ2UgYXMgdGhlIG4gYXJyYXkuXG5mdW5jdGlvbiBpbnZlcnNlTW9kXyh4LCBuKSB7XG4gICAgdmFyIGsgPSAxICsgMiAqIE1hdGgubWF4KHgubGVuZ3RoLCBuLmxlbmd0aCk7XG4gICAgaWYgKCEoeFswXSAmIDEpICYmICEoblswXSAmIDEpKSB7XG4gICAgICAgIC8vaWYgYm90aCBpbnB1dHMgYXJlIGV2ZW4sIHRoZW4gaW52ZXJzZSBkb2Vzbid0IGV4aXN0XG4gICAgICAgIGNvcHlJbnRfKHgsIDApO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgaWYgKGVnX3UubGVuZ3RoICE9IGspIHtcbiAgICAgICAgZWdfdSA9IG5ldyBBcnJheShrKTtcbiAgICAgICAgZWdfdiA9IG5ldyBBcnJheShrKTtcbiAgICAgICAgZWdfQSA9IG5ldyBBcnJheShrKTtcbiAgICAgICAgZWdfQiA9IG5ldyBBcnJheShrKTtcbiAgICAgICAgZWdfQyA9IG5ldyBBcnJheShrKTtcbiAgICAgICAgZWdfRCA9IG5ldyBBcnJheShrKTtcbiAgICB9XG4gICAgY29weV8oZWdfdSwgeCk7XG4gICAgY29weV8oZWdfdiwgbik7XG4gICAgY29weUludF8oZWdfQSwgMSk7XG4gICAgY29weUludF8oZWdfQiwgMCk7XG4gICAgY29weUludF8oZWdfQywgMCk7XG4gICAgY29weUludF8oZWdfRCwgMSk7XG4gICAgZm9yICg7Oykge1xuICAgICAgICB3aGlsZSAoIShlZ191WzBdICYgMSkpIHtcbiAgICAgICAgICAgIC8vd2hpbGUgZWdfdSBpcyBldmVuXG4gICAgICAgICAgICBoYWx2ZV8oZWdfdSk7XG4gICAgICAgICAgICBpZiAoIShlZ19BWzBdICYgMSkgJiYgIShlZ19CWzBdICYgMSkpIHtcbiAgICAgICAgICAgICAgICAvL2lmIGVnX0E9PWVnX0I9PTAgbW9kIDJcbiAgICAgICAgICAgICAgICBoYWx2ZV8oZWdfQSk7XG4gICAgICAgICAgICAgICAgaGFsdmVfKGVnX0IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRkXyhlZ19BLCBuKTtcbiAgICAgICAgICAgICAgICBoYWx2ZV8oZWdfQSk7XG4gICAgICAgICAgICAgICAgc3ViXyhlZ19CLCB4KTtcbiAgICAgICAgICAgICAgICBoYWx2ZV8oZWdfQik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKCEoZWdfdlswXSAmIDEpKSB7XG4gICAgICAgICAgICAvL3doaWxlIGVnX3YgaXMgZXZlblxuICAgICAgICAgICAgaGFsdmVfKGVnX3YpO1xuICAgICAgICAgICAgaWYgKCEoZWdfQ1swXSAmIDEpICYmICEoZWdfRFswXSAmIDEpKSB7XG4gICAgICAgICAgICAgICAgLy9pZiBlZ19DPT1lZ19EPT0wIG1vZCAyXG4gICAgICAgICAgICAgICAgaGFsdmVfKGVnX0MpO1xuICAgICAgICAgICAgICAgIGhhbHZlXyhlZ19EKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFkZF8oZWdfQywgbik7XG4gICAgICAgICAgICAgICAgaGFsdmVfKGVnX0MpO1xuICAgICAgICAgICAgICAgIHN1Yl8oZWdfRCwgeCk7XG4gICAgICAgICAgICAgICAgaGFsdmVfKGVnX0QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZ3JlYXRlcihlZ192LCBlZ191KSkge1xuICAgICAgICAgICAgLy9lZ192IDw9IGVnX3VcbiAgICAgICAgICAgIHN1Yl8oZWdfdSwgZWdfdik7XG4gICAgICAgICAgICBzdWJfKGVnX0EsIGVnX0MpO1xuICAgICAgICAgICAgc3ViXyhlZ19CLCBlZ19EKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vZWdfdiA+IGVnX3VcbiAgICAgICAgICAgIHN1Yl8oZWdfdiwgZWdfdSk7XG4gICAgICAgICAgICBzdWJfKGVnX0MsIGVnX0EpO1xuICAgICAgICAgICAgc3ViXyhlZ19ELCBlZ19CKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXF1YWxzSW50KGVnX3UsIDApKSB7XG4gICAgICAgICAgICBpZiAobmVnYXRpdmUoZWdfQykpIHtcbiAgICAgICAgICAgICAgICAvL21ha2Ugc3VyZSBhbnN3ZXIgaXMgbm9ubmVnYXRpdmVcbiAgICAgICAgICAgICAgICBhZGRfKGVnX0MsIG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29weV8oeCwgZWdfQyk7XG4gICAgICAgICAgICBpZiAoIWVxdWFsc0ludChlZ192LCAxKSkge1xuICAgICAgICAgICAgICAgIC8vaWYgR0NEXyh4LG4pIT0xLCB0aGVuIHRoZXJlIGlzIG5vIGludmVyc2VcbiAgICAgICAgICAgICAgICBjb3B5SW50Xyh4LCAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgfVxufVxuLy9yZXR1cm4geCoqKC0xKSBtb2QgbiwgZm9yIGludGVnZXJzIHggYW5kIG4uICBSZXR1cm4gMCBpZiB0aGVyZSBpcyBubyBpbnZlcnNlXG5mdW5jdGlvbiBpbnZlcnNlTW9kSW50KHgsIG4pIHtcbiAgICB2YXIgYSA9IDEsIGIgPSAwLCB0O1xuICAgIGZvciAoOzspIHtcbiAgICAgICAgaWYgKHggPT0gMSlcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICBpZiAoeCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIGIgLT0gYSAqIE1hdGguZmxvb3IobiAvIHgpO1xuICAgICAgICBuICU9IHg7XG4gICAgICAgIGlmIChuID09IDEpXG4gICAgICAgICAgICByZXR1cm4gYjsgLy90byBhdm9pZCBuZWdhdGl2ZXMsIGNoYW5nZSB0aGlzIGIgdG8gbi1iLCBhbmQgZWFjaCAtPSB0byArPVxuICAgICAgICBpZiAobiA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIGEgLT0gYiAqIE1hdGguZmxvb3IoeCAvIG4pO1xuICAgICAgICB4ICU9IG47XG4gICAgfVxufVxuLy90aGlzIGRlcHJlY2F0ZWQgZnVuY3Rpb24gaXMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgb25seS5cbmZ1bmN0aW9uIGludmVyc2VNb2RJbnRfKHgsIG4pIHtcbiAgICByZXR1cm4gaW52ZXJzZU1vZEludCh4LCBuKTtcbn1cbi8vR2l2ZW4gcG9zaXRpdmUgYmlnSW50cyB4IGFuZCB5LCBjaGFuZ2UgdGhlIGJpZ2ludHMgdiwgYSwgYW5kIGIgdG8gcG9zaXRpdmUgYmlnSW50cyBzdWNoIHRoYXQ6XG4vLyAgICAgdiA9IEdDRF8oeCx5KSA9IGEqeC1iKnlcbi8vVGhlIGJpZ0ludHMgdiwgYSwgYiwgbXVzdCBoYXZlIGV4YWN0bHkgYXMgbWFueSBlbGVtZW50cyBhcyB0aGUgbGFyZ2VyIG9mIHggYW5kIHkuXG5mdW5jdGlvbiBlR0NEXyh4LCB5LCB2LCBhLCBiKSB7XG4gICAgdmFyIGcgPSAwO1xuICAgIHZhciBrID0gTWF0aC5tYXgoeC5sZW5ndGgsIHkubGVuZ3RoKTtcbiAgICBpZiAoZWdfdS5sZW5ndGggIT0gaykge1xuICAgICAgICBlZ191ID0gbmV3IEFycmF5KGspO1xuICAgICAgICBlZ19BID0gbmV3IEFycmF5KGspO1xuICAgICAgICBlZ19CID0gbmV3IEFycmF5KGspO1xuICAgICAgICBlZ19DID0gbmV3IEFycmF5KGspO1xuICAgICAgICBlZ19EID0gbmV3IEFycmF5KGspO1xuICAgIH1cbiAgICB3aGlsZSAoISh4WzBdICYgMSkgJiYgISh5WzBdICYgMSkpIHtcbiAgICAgICAgLy93aGlsZSB4IGFuZCB5IGJvdGggZXZlblxuICAgICAgICBoYWx2ZV8oeCk7XG4gICAgICAgIGhhbHZlXyh5KTtcbiAgICAgICAgZysrO1xuICAgIH1cbiAgICBjb3B5XyhlZ191LCB4KTtcbiAgICBjb3B5Xyh2LCB5KTtcbiAgICBjb3B5SW50XyhlZ19BLCAxKTtcbiAgICBjb3B5SW50XyhlZ19CLCAwKTtcbiAgICBjb3B5SW50XyhlZ19DLCAwKTtcbiAgICBjb3B5SW50XyhlZ19ELCAxKTtcbiAgICBmb3IgKDs7KSB7XG4gICAgICAgIHdoaWxlICghKGVnX3VbMF0gJiAxKSkge1xuICAgICAgICAgICAgLy93aGlsZSB1IGlzIGV2ZW5cbiAgICAgICAgICAgIGhhbHZlXyhlZ191KTtcbiAgICAgICAgICAgIGlmICghKGVnX0FbMF0gJiAxKSAmJiAhKGVnX0JbMF0gJiAxKSkge1xuICAgICAgICAgICAgICAgIC8vaWYgQT09Qj09MCBtb2QgMlxuICAgICAgICAgICAgICAgIGhhbHZlXyhlZ19BKTtcbiAgICAgICAgICAgICAgICBoYWx2ZV8oZWdfQik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRfKGVnX0EsIHkpO1xuICAgICAgICAgICAgICAgIGhhbHZlXyhlZ19BKTtcbiAgICAgICAgICAgICAgICBzdWJfKGVnX0IsIHgpO1xuICAgICAgICAgICAgICAgIGhhbHZlXyhlZ19CKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoISh2WzBdICYgMSkpIHtcbiAgICAgICAgICAgIC8vd2hpbGUgdiBpcyBldmVuXG4gICAgICAgICAgICBoYWx2ZV8odik7XG4gICAgICAgICAgICBpZiAoIShlZ19DWzBdICYgMSkgJiYgIShlZ19EWzBdICYgMSkpIHtcbiAgICAgICAgICAgICAgICAvL2lmIEM9PUQ9PTAgbW9kIDJcbiAgICAgICAgICAgICAgICBoYWx2ZV8oZWdfQyk7XG4gICAgICAgICAgICAgICAgaGFsdmVfKGVnX0QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRkXyhlZ19DLCB5KTtcbiAgICAgICAgICAgICAgICBoYWx2ZV8oZWdfQyk7XG4gICAgICAgICAgICAgICAgc3ViXyhlZ19ELCB4KTtcbiAgICAgICAgICAgICAgICBoYWx2ZV8oZWdfRCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFncmVhdGVyKHYsIGVnX3UpKSB7XG4gICAgICAgICAgICAvL3Y8PXVcbiAgICAgICAgICAgIHN1Yl8oZWdfdSwgdik7XG4gICAgICAgICAgICBzdWJfKGVnX0EsIGVnX0MpO1xuICAgICAgICAgICAgc3ViXyhlZ19CLCBlZ19EKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vdj51XG4gICAgICAgICAgICBzdWJfKHYsIGVnX3UpO1xuICAgICAgICAgICAgc3ViXyhlZ19DLCBlZ19BKTtcbiAgICAgICAgICAgIHN1Yl8oZWdfRCwgZWdfQik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVxdWFsc0ludChlZ191LCAwKSkge1xuICAgICAgICAgICAgaWYgKG5lZ2F0aXZlKGVnX0MpKSB7XG4gICAgICAgICAgICAgICAgLy9tYWtlIHN1cmUgYSAoQylpcyBub25uZWdhdGl2ZVxuICAgICAgICAgICAgICAgIGFkZF8oZWdfQywgeSk7XG4gICAgICAgICAgICAgICAgc3ViXyhlZ19ELCB4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG11bHRJbnRfKGVnX0QsIC0xKTsgLy8vbWFrZSBzdXJlIGIgKEQpIGlzIG5vbm5lZ2F0aXZlXG4gICAgICAgICAgICBjb3B5XyhhLCBlZ19DKTtcbiAgICAgICAgICAgIGNvcHlfKGIsIGVnX0QpO1xuICAgICAgICAgICAgbGVmdFNoaWZ0Xyh2LCBnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vaXMgYmlnSW50IHggbmVnYXRpdmU/XG5mdW5jdGlvbiBuZWdhdGl2ZSh4KSB7XG4gICAgcmV0dXJuICh4W3gubGVuZ3RoIC0gMV0gPj4gKGJwZSAtIDEpKSAmIDE7XG59XG4vL2lzICh4IDw8IChzaGlmdCpicGUpKSA+IHk/XG4vL3ggYW5kIHkgYXJlIG5vbm5lZ2F0aXZlIGJpZ0ludHNcbi8vc2hpZnQgaXMgYSBub25uZWdhdGl2ZSBpbnRlZ2VyXG5mdW5jdGlvbiBncmVhdGVyU2hpZnQoeCwgeSwgc2hpZnQpIHtcbiAgICB2YXIgaSwga3ggPSB4Lmxlbmd0aCwga3kgPSB5Lmxlbmd0aCwgayA9IGt4ICsgc2hpZnQgPCBreSA/IGt4ICsgc2hpZnQgOiBreTtcbiAgICBmb3IgKGkgPSBreSAtIDEgLSBzaGlmdDsgaSA8IGt4ICYmIGkgPj0gMDsgaSsrKVxuICAgICAgICBpZiAoeFtpXSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IC8vaWYgdGhlcmUgYXJlIG5vbnplcm9zIGluIHggdG8gdGhlIGxlZnQgb2YgdGhlIGZpcnN0IGNvbHVtbiBvZiB5LCB0aGVuIHggaXMgYmlnZ2VyXG4gICAgZm9yIChpID0ga3ggLSAxICsgc2hpZnQ7IGkgPCBreTsgaSsrKVxuICAgICAgICBpZiAoeVtpXSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IC8vaWYgdGhlcmUgYXJlIG5vbnplcm9zIGluIHkgdG8gdGhlIGxlZnQgb2YgdGhlIGZpcnN0IGNvbHVtbiBvZiB4LCB0aGVuIHggaXMgbm90IGJpZ2dlclxuICAgIGZvciAoaSA9IGsgLSAxOyBpID49IHNoaWZ0OyBpLS0pXG4gICAgICAgIGlmICh4W2kgLSBzaGlmdF0gPiB5W2ldKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4W2kgLSBzaGlmdF0gPCB5W2ldKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgcmV0dXJuIDA7XG59XG4vL2lzIHggPiB5PyAoeCBhbmQgeSBib3RoIG5vbm5lZ2F0aXZlKVxuZnVuY3Rpb24gZ3JlYXRlcih4LCB5KSB7XG4gICAgdmFyIGk7XG4gICAgdmFyIGsgPSB4Lmxlbmd0aCA8IHkubGVuZ3RoID8geC5sZW5ndGggOiB5Lmxlbmd0aDtcbiAgICBmb3IgKGkgPSB4Lmxlbmd0aDsgaSA8IHkubGVuZ3RoOyBpKyspXG4gICAgICAgIGlmICh5W2ldKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSAvL3kgaGFzIG1vcmUgZGlnaXRzXG4gICAgZm9yIChpID0geS5sZW5ndGg7IGkgPCB4Lmxlbmd0aDsgaSsrKVxuICAgICAgICBpZiAoeFtpXSkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH0gLy94IGhhcyBtb3JlIGRpZ2l0c1xuICAgIGZvciAoaSA9IGsgLSAxOyBpID49IDA7IGktLSlcbiAgICAgICAgaWYgKHhbaV0gPiB5W2ldKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4W2ldIDwgeVtpXSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICByZXR1cm4gMDtcbn1cbi8vZGl2aWRlIHggYnkgeSBnaXZpbmcgcXVvdGllbnQgcSBhbmQgcmVtYWluZGVyIHIuICAocT1mbG9vcih4L3kpLCAgcj14IG1vZCB5KS4gIEFsbCA0IGFyZSBiaWdpbnRzLlxuLy94IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgbGVhZGluZyB6ZXJvIGVsZW1lbnQuXG4vL3kgbXVzdCBiZSBub256ZXJvLlxuLy9xIGFuZCByIG11c3QgYmUgYXJyYXlzIHRoYXQgYXJlIGV4YWN0bHkgdGhlIHNhbWUgbGVuZ3RoIGFzIHguIChPciBxIGNhbiBoYXZlIG1vcmUpLlxuLy9NdXN0IGhhdmUgeC5sZW5ndGggPj0geS5sZW5ndGggPj0gMi5cbmZ1bmN0aW9uIGRpdmlkZV8oeCwgeSwgcSwgcikge1xuICAgIHZhciBreCwga3k7XG4gICAgdmFyIGksIGosIHkxLCB5MiwgYywgYSwgYjtcbiAgICBjb3B5XyhyLCB4KTtcbiAgICBmb3IgKGt5ID0geS5sZW5ndGg7IHlba3kgLSAxXSA9PSAwOyBreS0tKVxuICAgICAgICA7IC8va3kgaXMgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHksIG5vdCBpbmNsdWRpbmcgbGVhZGluZyB6ZXJvc1xuICAgIC8vbm9ybWFsaXplOiBlbnN1cmUgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgZWxlbWVudCBvZiB5IGhhcyBpdHMgaGlnaGVzdCBiaXQgc2V0XG4gICAgYiA9IHlba3kgLSAxXTtcbiAgICBmb3IgKGEgPSAwOyBiOyBhKyspXG4gICAgICAgIGIgPj49IDE7XG4gICAgYSA9IGJwZSAtIGE7IC8vYSBpcyBob3cgbWFueSBiaXRzIHRvIHNoaWZ0IHNvIHRoYXQgdGhlIGhpZ2ggb3JkZXIgYml0IG9mIHkgaXMgbGVmdG1vc3QgaW4gaXRzIGFycmF5IGVsZW1lbnRcbiAgICBsZWZ0U2hpZnRfKHksIGEpOyAvL211bHRpcGx5IGJvdGggYnkgMTw8YSBub3csIHRoZW4gZGl2aWRlIGJvdGggYnkgdGhhdCBhdCB0aGUgZW5kXG4gICAgbGVmdFNoaWZ0XyhyLCBhKTtcbiAgICAvL1JvYiBWaXNzZXIgZGlzY292ZXJlZCBhIGJ1ZzogdGhlIGZvbGxvd2luZyBsaW5lIHdhcyBvcmlnaW5hbGx5IGp1c3QgYmVmb3JlIHRoZSBub3JtYWxpemF0aW9uLlxuICAgIGZvciAoa3ggPSByLmxlbmd0aDsgcltreCAtIDFdID09IDAgJiYga3ggPiBreTsga3gtLSlcbiAgICAgICAgOyAvL2t4IGlzIG51bWJlciBvZiBlbGVtZW50cyBpbiBub3JtYWxpemVkIHgsIG5vdCBpbmNsdWRpbmcgbGVhZGluZyB6ZXJvc1xuICAgIGNvcHlJbnRfKHEsIDApOyAvLyBxPTBcbiAgICB3aGlsZSAoIWdyZWF0ZXJTaGlmdCh5LCByLCBreCAtIGt5KSkge1xuICAgICAgICAvLyB3aGlsZSAobGVmdFNoaWZ0Xyh5LGt4LWt5KSA8PSByKSB7XG4gICAgICAgIHN1YlNoaWZ0XyhyLCB5LCBreCAtIGt5KTsgLy8gICByPXItbGVmdFNoaWZ0Xyh5LGt4LWt5KVxuICAgICAgICBxW2t4IC0ga3ldKys7IC8vICAgcVtreC1reV0rKztcbiAgICB9IC8vIH1cbiAgICBmb3IgKGkgPSBreCAtIDE7IGkgPj0ga3k7IGktLSkge1xuICAgICAgICBpZiAocltpXSA9PSB5W2t5IC0gMV0pIHtcbiAgICAgICAgICAgIHFbaSAtIGt5XSA9IG1hc2s7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBxW2kgLSBreV0gPSBNYXRoLmZsb29yKChyW2ldICogcmFkaXggKyByW2kgLSAxXSkgLyB5W2t5IC0gMV0pO1xuICAgICAgICB9XG4gICAgICAgIC8vVGhlIGZvbGxvd2luZyBmb3IoOzspIGxvb3AgaXMgZXF1aXZhbGVudCB0byB0aGUgY29tbWVudGVkIHdoaWxlIGxvb3AsXG4gICAgICAgIC8vZXhjZXB0IHRoYXQgdGhlIHVuY29tbWVudGVkIHZlcnNpb24gYXZvaWRzIG92ZXJmbG93LlxuICAgICAgICAvL1RoZSBjb21tZW50ZWQgbG9vcCBjb21lcyBmcm9tIEhBQywgd2hpY2ggYXNzdW1lcyByWy0xXT09eVstMV09PTBcbiAgICAgICAgLy8gIHdoaWxlIChxW2kta3ldKih5W2t5LTFdKnJhZGl4K3lba3ktMl0pID4gcltpXSpyYWRpeCpyYWRpeCtyW2ktMV0qcmFkaXgrcltpLTJdKVxuICAgICAgICAvLyAgICBxW2kta3ldLS07XG4gICAgICAgIGZvciAoOzspIHtcbiAgICAgICAgICAgIHkyID0gKGt5ID4gMSA/IHlba3kgLSAyXSA6IDApICogcVtpIC0ga3ldO1xuICAgICAgICAgICAgYyA9IHkyID4+IGJwZTtcbiAgICAgICAgICAgIHkyID0geTIgJiBtYXNrO1xuICAgICAgICAgICAgeTEgPSBjICsgcVtpIC0ga3ldICogeVtreSAtIDFdO1xuICAgICAgICAgICAgYyA9IHkxID4+IGJwZTtcbiAgICAgICAgICAgIHkxID0geTEgJiBtYXNrO1xuICAgICAgICAgICAgaWYgKGMgPT0gcltpXSA/ICh5MSA9PSByW2kgLSAxXSA/IHkyID4gKGkgPiAxID8gcltpIC0gMl0gOiAwKSA6IHkxID4gcltpIC0gMV0pIDogYyA+IHJbaV0pIHtcbiAgICAgICAgICAgICAgICBxW2kgLSBreV0tLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbkNvbWJTaGlmdF8ociwgeSwgLXFbaSAtIGt5XSwgaSAtIGt5KTsgLy9yPXItcVtpLWt5XSpsZWZ0U2hpZnRfKHksaS1reSlcbiAgICAgICAgaWYgKG5lZ2F0aXZlKHIpKSB7XG4gICAgICAgICAgICBhZGRTaGlmdF8ociwgeSwgaSAtIGt5KTsgLy9yPXIrbGVmdFNoaWZ0Xyh5LGkta3kpXG4gICAgICAgICAgICBxW2kgLSBreV0tLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByaWdodFNoaWZ0Xyh5LCBhKTsgLy91bmRvIHRoZSBub3JtYWxpemF0aW9uIHN0ZXBcbiAgICByaWdodFNoaWZ0XyhyLCBhKTsgLy91bmRvIHRoZSBub3JtYWxpemF0aW9uIHN0ZXBcbn1cbi8vZG8gY2FycmllcyBhbmQgYm9ycm93cyBzbyBlYWNoIGVsZW1lbnQgb2YgdGhlIGJpZ0ludCB4IGZpdHMgaW4gYnBlIGJpdHMuXG5mdW5jdGlvbiBjYXJyeV8oeCkge1xuICAgIHZhciBpLCBrLCBjLCBiO1xuICAgIGsgPSB4Lmxlbmd0aDtcbiAgICBjID0gMDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgazsgaSsrKSB7XG4gICAgICAgIGMgKz0geFtpXTtcbiAgICAgICAgYiA9IDA7XG4gICAgICAgIGlmIChjIDwgMCkge1xuICAgICAgICAgICAgYiA9IC0oYyA+PiBicGUpO1xuICAgICAgICAgICAgYyArPSBiICogcmFkaXg7XG4gICAgICAgIH1cbiAgICAgICAgeFtpXSA9IGMgJiBtYXNrO1xuICAgICAgICBjID0gKGMgPj4gYnBlKSAtIGI7XG4gICAgfVxufVxuLy9yZXR1cm4geCBtb2QgbiBmb3IgYmlnSW50IHggYW5kIGludGVnZXIgbi5cbmZ1bmN0aW9uIG1vZEludCh4LCBuKSB7XG4gICAgdmFyIGksIGMgPSAwO1xuICAgIGZvciAoaSA9IHgubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICAgIGMgPSAoYyAqIHJhZGl4ICsgeFtpXSkgJSBuO1xuICAgIHJldHVybiBjO1xufVxuLy9jb252ZXJ0IHRoZSBpbnRlZ2VyIHQgaW50byBhIGJpZ0ludCB3aXRoIGF0IGxlYXN0IHRoZSBnaXZlbiBudW1iZXIgb2YgYml0cy5cbi8vdGhlIHJldHVybmVkIGFycmF5IHN0b3JlcyB0aGUgYmlnSW50IGluIGJwZS1iaXQgY2h1bmtzLCBsaXR0bGUgZW5kaWFuIChidWZmWzBdIGlzIGxlYXN0IHNpZ25pZmljYW50IHdvcmQpXG4vL1BhZCB0aGUgYXJyYXkgd2l0aCBsZWFkaW5nIHplcm9zIHNvIHRoYXQgaXQgaGFzIGF0IGxlYXN0IG1pblNpemUgZWxlbWVudHMuXG4vL1RoZXJlIHdpbGwgYWx3YXlzIGJlIGF0IGxlYXN0IG9uZSBsZWFkaW5nIDAgZWxlbWVudC5cbmZ1bmN0aW9uIGludDJiaWdJbnQodCwgYml0cywgbWluU2l6ZSkge1xuICAgIHZhciBpLCBrLCBidWZmO1xuICAgIGsgPSBNYXRoLmNlaWwoYml0cyAvIGJwZSkgKyAxO1xuICAgIGsgPSBtaW5TaXplID4gayA/IG1pblNpemUgOiBrO1xuICAgIGJ1ZmYgPSBuZXcgQXJyYXkoayk7XG4gICAgY29weUludF8oYnVmZiwgdCk7XG4gICAgcmV0dXJuIGJ1ZmY7XG59XG4vL3JldHVybiB0aGUgYmlnSW50IGdpdmVuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGluIGEgZ2l2ZW4gYmFzZS5cbi8vUGFkIHRoZSBhcnJheSB3aXRoIGxlYWRpbmcgemVyb3Mgc28gdGhhdCBpdCBoYXMgYXQgbGVhc3QgbWluU2l6ZSBlbGVtZW50cy5cbi8vSWYgYmFzZT0tMSwgdGhlbiBpdCByZWFkcyBpbiBhIHNwYWNlLXNlcGFyYXRlZCBsaXN0IG9mIGFycmF5IGVsZW1lbnRzIGluIGRlY2ltYWwuXG4vL1RoZSBhcnJheSB3aWxsIGFsd2F5cyBoYXZlIGF0IGxlYXN0IG9uZSBsZWFkaW5nIHplcm8sIHVubGVzcyBiYXNlPS0xLlxuZnVuY3Rpb24gc3RyMmJpZ0ludChzLCBiYXNlLCBtaW5TaXplKSB7XG4gICAgdmFyIGQsIGksIGosIHgsIHksIGtrO1xuICAgIHZhciBrID0gcy5sZW5ndGg7XG4gICAgaWYgKGJhc2UgPT0gLTEpIHtcbiAgICAgICAgLy9jb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBhcnJheSBlbGVtZW50cyBpbiBkZWNpbWFsXG4gICAgICAgIHggPSBuZXcgQXJyYXkoMCk7XG4gICAgICAgIGZvciAoOzspIHtcbiAgICAgICAgICAgIHkgPSBuZXcgQXJyYXkoeC5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgIHlbaSArIDFdID0geFtpXTtcbiAgICAgICAgICAgIHlbMF0gPSBwYXJzZUludChzLCAxMCk7XG4gICAgICAgICAgICB4ID0geTtcbiAgICAgICAgICAgIGQgPSBzLmluZGV4T2YoXCIsXCIsIDApO1xuICAgICAgICAgICAgaWYgKGQgPCAxKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzID0gcy5zdWJzdHJpbmcoZCArIDEpO1xuICAgICAgICAgICAgaWYgKHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoeC5sZW5ndGggPCBtaW5TaXplKSB7XG4gICAgICAgICAgICB5ID0gbmV3IEFycmF5KG1pblNpemUpO1xuICAgICAgICAgICAgY29weV8oeSwgeCk7XG4gICAgICAgICAgICByZXR1cm4geTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgeCA9IGludDJiaWdJbnQoMCwgYmFzZSAqIGssIDApO1xuICAgIGZvciAoaSA9IDA7IGkgPCBrOyBpKyspIHtcbiAgICAgICAgZCA9IGRpZ2l0c1N0ci5pbmRleE9mKHMuc3Vic3RyaW5nKGksIGkgKyAxKSwgMCk7XG4gICAgICAgIGlmIChiYXNlIDw9IDM2ICYmIGQgPj0gMzYpIHtcbiAgICAgICAgICAgIC8vY29udmVydCBsb3dlcmNhc2UgdG8gdXBwZXJjYXNlIGlmIGJhc2U8PTM2XG4gICAgICAgICAgICBkIC09IDI2O1xuICAgICAgICB9XG4gICAgICAgIGlmIChkID49IGJhc2UgfHwgZCA8IDApIHtcbiAgICAgICAgICAgIC8vc3RvcCBhdCBmaXJzdCBpbGxlZ2FsIGNoYXJhY3RlclxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbXVsdEludF8oeCwgYmFzZSk7XG4gICAgICAgIGFkZEludF8oeCwgZCk7XG4gICAgfVxuICAgIGZvciAoayA9IHgubGVuZ3RoOyBrID4gMCAmJiAheFtrIC0gMV07IGstLSlcbiAgICAgICAgOyAvL3N0cmlwIG9mZiBsZWFkaW5nIHplcm9zXG4gICAgayA9IG1pblNpemUgPiBrICsgMSA/IG1pblNpemUgOiBrICsgMTtcbiAgICB5ID0gbmV3IEFycmF5KGspO1xuICAgIGtrID0gayA8IHgubGVuZ3RoID8gayA6IHgubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBrazsgaSsrKVxuICAgICAgICB5W2ldID0geFtpXTtcbiAgICBmb3IgKDsgaSA8IGs7IGkrKylcbiAgICAgICAgeVtpXSA9IDA7XG4gICAgcmV0dXJuIHk7XG59XG4vL2lzIGJpZ2ludCB4IGVxdWFsIHRvIGludGVnZXIgeT9cbi8veSBtdXN0IGhhdmUgbGVzcyB0aGFuIGJwZSBiaXRzXG5mdW5jdGlvbiBlcXVhbHNJbnQoeCwgeSkge1xuICAgIHZhciBpO1xuICAgIGlmICh4WzBdICE9IHkpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGZvciAoaSA9IDE7IGkgPCB4Lmxlbmd0aDsgaSsrKVxuICAgICAgICBpZiAoeFtpXSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICByZXR1cm4gMTtcbn1cbi8vYXJlIGJpZ2ludHMgeCBhbmQgeSBlcXVhbD9cbi8vdGhpcyB3b3JrcyBldmVuIGlmIHggYW5kIHkgYXJlIGRpZmZlcmVudCBsZW5ndGhzIGFuZCBoYXZlIGFyYml0cmFyaWx5IG1hbnkgbGVhZGluZyB6ZXJvc1xuZnVuY3Rpb24gZXF1YWxzKHgsIHkpIHtcbiAgICB2YXIgaTtcbiAgICB2YXIgayA9IHgubGVuZ3RoIDwgeS5sZW5ndGggPyB4Lmxlbmd0aCA6IHkubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBrOyBpKyspXG4gICAgICAgIGlmICh4W2ldICE9IHlbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgaWYgKHgubGVuZ3RoID4geS5sZW5ndGgpIHtcbiAgICAgICAgZm9yICg7IGkgPCB4Lmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgaWYgKHhbaV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZvciAoOyBpIDwgeS5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIGlmICh5W2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAxO1xufVxuLy9pcyB0aGUgYmlnSW50IHggZXF1YWwgdG8gemVybz9cbmZ1bmN0aW9uIGlzWmVybyh4KSB7XG4gICAgdmFyIGk7XG4gICAgZm9yIChpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspXG4gICAgICAgIGlmICh4W2ldKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIHJldHVybiAxO1xufVxuLy9jb252ZXJ0IGEgYmlnSW50IGludG8gYSBzdHJpbmcgaW4gYSBnaXZlbiBiYXNlLCBmcm9tIGJhc2UgMiB1cCB0byBiYXNlIDk1LlxuLy9CYXNlIC0xIHByaW50cyB0aGUgY29udGVudHMgb2YgdGhlIGFycmF5IHJlcHJlc2VudGluZyB0aGUgbnVtYmVyLlxuZnVuY3Rpb24gYmlnSW50MnN0cih4LCBiYXNlKSB7XG4gICAgdmFyIGksIHQsIHMgPSBcIlwiO1xuICAgIGlmIChzNi5sZW5ndGggIT0geC5sZW5ndGgpIHtcbiAgICAgICAgczYgPSBkdXAoeCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb3B5XyhzNiwgeCk7XG4gICAgfVxuICAgIGlmIChiYXNlID09IC0xKSB7XG4gICAgICAgIC8vcmV0dXJuIHRoZSBsaXN0IG9mIGFycmF5IGNvbnRlbnRzXG4gICAgICAgIGZvciAoaSA9IHgubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSlcbiAgICAgICAgICAgIHMgKz0geFtpXSArIFwiLFwiO1xuICAgICAgICBzICs9IHhbMF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvL3JldHVybiBpdCBpbiB0aGUgZ2l2ZW4gYmFzZVxuICAgICAgICB3aGlsZSAoIWlzWmVybyhzNikpIHtcbiAgICAgICAgICAgIHQgPSBkaXZJbnRfKHM2LCBiYXNlKTsgLy90PXM2ICUgYmFzZTsgczY9Zmxvb3IoczYvYmFzZSk7XG4gICAgICAgICAgICBzID0gZGlnaXRzU3RyLnN1YnN0cmluZyh0LCB0ICsgMSkgKyBzO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHMgPSBcIjBcIjtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG59XG4vL3JldHVybnMgYSBkdXBsaWNhdGUgb2YgYmlnSW50IHhcbmZ1bmN0aW9uIGR1cCh4KSB7XG4gICAgdmFyIGksIGJ1ZmY7XG4gICAgYnVmZiA9IG5ldyBBcnJheSh4Lmxlbmd0aCk7XG4gICAgY29weV8oYnVmZiwgeCk7XG4gICAgcmV0dXJuIGJ1ZmY7XG59XG4vL2RvIHg9eSBvbiBiaWdJbnRzIHggYW5kIHkuICB4IG11c3QgYmUgYW4gYXJyYXkgYXQgbGVhc3QgYXMgYmlnIGFzIHkgKG5vdCBjb3VudGluZyB0aGUgbGVhZGluZyB6ZXJvcyBpbiB5KS5cbmZ1bmN0aW9uIGNvcHlfKHgsIHkpIHtcbiAgICB2YXIgaTtcbiAgICB2YXIgayA9IHgubGVuZ3RoIDwgeS5sZW5ndGggPyB4Lmxlbmd0aCA6IHkubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBrOyBpKyspXG4gICAgICAgIHhbaV0gPSB5W2ldO1xuICAgIGZvciAoaSA9IGs7IGkgPCB4Lmxlbmd0aDsgaSsrKVxuICAgICAgICB4W2ldID0gMDtcbn1cbi8vZG8geD15IG9uIGJpZ0ludCB4IGFuZCBpbnRlZ2VyIHkuXG5mdW5jdGlvbiBjb3B5SW50Xyh4LCBuKSB7XG4gICAgdmFyIGksIGM7XG4gICAgZm9yIChjID0gbiwgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHhbaV0gPSBjICYgbWFzaztcbiAgICAgICAgYyA+Pj0gYnBlO1xuICAgIH1cbn1cbi8vZG8geD14K24gd2hlcmUgeCBpcyBhIGJpZ0ludCBhbmQgbiBpcyBhbiBpbnRlZ2VyLlxuLy94IG11c3QgYmUgbGFyZ2UgZW5vdWdoIHRvIGhvbGQgdGhlIHJlc3VsdC5cbmZ1bmN0aW9uIGFkZEludF8oeCwgbikge1xuICAgIHZhciBpLCBrLCBjLCBiO1xuICAgIHhbMF0gKz0gbjtcbiAgICBrID0geC5sZW5ndGg7XG4gICAgYyA9IDA7XG4gICAgZm9yIChpID0gMDsgaSA8IGs7IGkrKykge1xuICAgICAgICBjICs9IHhbaV07XG4gICAgICAgIGIgPSAwO1xuICAgICAgICBpZiAoYyA8IDApIHtcbiAgICAgICAgICAgIGIgPSAtKGMgPj4gYnBlKTtcbiAgICAgICAgICAgIGMgKz0gYiAqIHJhZGl4O1xuICAgICAgICB9XG4gICAgICAgIHhbaV0gPSBjICYgbWFzaztcbiAgICAgICAgYyA9IChjID4+IGJwZSkgLSBiO1xuICAgICAgICBpZiAoIWMpXG4gICAgICAgICAgICByZXR1cm47IC8vc3RvcCBjYXJyeWluZyBhcyBzb29uIGFzIHRoZSBjYXJyeSBpcyB6ZXJvXG4gICAgfVxufVxuLy9yaWdodCBzaGlmdCBiaWdJbnQgeCBieSBuIGJpdHMuICAwIDw9IG4gPCBicGUuXG5mdW5jdGlvbiByaWdodFNoaWZ0Xyh4LCBuKSB7XG4gICAgdmFyIGk7XG4gICAgdmFyIGsgPSBNYXRoLmZsb29yKG4gLyBicGUpO1xuICAgIGlmIChrKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB4Lmxlbmd0aCAtIGs7IGkrKyAvL3JpZ2h0IHNoaWZ0IHggYnkgayBlbGVtZW50c1xuICAgICAgICApXG4gICAgICAgICAgICB4W2ldID0geFtpICsga107XG4gICAgICAgIGZvciAoOyBpIDwgeC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHhbaV0gPSAwO1xuICAgICAgICBuICU9IGJwZTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IHgubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHhbaV0gPSBtYXNrICYgKCh4W2kgKyAxXSA8PCAoYnBlIC0gbikpIHwgKHhbaV0gPj4gbikpO1xuICAgIH1cbiAgICB4W2ldID4+PSBuO1xufVxuLy9kbyB4PWZsb29yKHx4fC8yKSpzZ24oeCkgZm9yIGJpZ0ludCB4IGluIDIncyBjb21wbGVtZW50XG5mdW5jdGlvbiBoYWx2ZV8oeCkge1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCB4Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB4W2ldID0gbWFzayAmICgoeFtpICsgMV0gPDwgKGJwZSAtIDEpKSB8ICh4W2ldID4+IDEpKTtcbiAgICB9XG4gICAgeFtpXSA9ICh4W2ldID4+IDEpIHwgKHhbaV0gJiAocmFkaXggPj4gMSkpOyAvL21vc3Qgc2lnbmlmaWNhbnQgYml0IHN0YXlzIHRoZSBzYW1lXG59XG4vL2xlZnQgc2hpZnQgYmlnSW50IHggYnkgbiBiaXRzLlxuZnVuY3Rpb24gbGVmdFNoaWZ0Xyh4LCBuKSB7XG4gICAgdmFyIGk7XG4gICAgdmFyIGsgPSBNYXRoLmZsb29yKG4gLyBicGUpO1xuICAgIGlmIChrKSB7XG4gICAgICAgIGZvciAoaSA9IHgubGVuZ3RoOyBpID49IGs7IGktLSAvL2xlZnQgc2hpZnQgeCBieSBrIGVsZW1lbnRzXG4gICAgICAgIClcbiAgICAgICAgICAgIHhbaV0gPSB4W2kgLSBrXTtcbiAgICAgICAgZm9yICg7IGkgPj0gMDsgaS0tKVxuICAgICAgICAgICAgeFtpXSA9IDA7XG4gICAgICAgIG4gJT0gYnBlO1xuICAgIH1cbiAgICBpZiAoIW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSB4Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgeFtpXSA9IG1hc2sgJiAoKHhbaV0gPDwgbikgfCAoeFtpIC0gMV0gPj4gKGJwZSAtIG4pKSk7XG4gICAgfVxuICAgIHhbaV0gPSBtYXNrICYgKHhbaV0gPDwgbik7XG59XG4vL2RvIHg9eCpuIHdoZXJlIHggaXMgYSBiaWdJbnQgYW5kIG4gaXMgYW4gaW50ZWdlci5cbi8veCBtdXN0IGJlIGxhcmdlIGVub3VnaCB0byBob2xkIHRoZSByZXN1bHQuXG5mdW5jdGlvbiBtdWx0SW50Xyh4LCBuKSB7XG4gICAgdmFyIGksIGssIGMsIGI7XG4gICAgaWYgKCFuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgayA9IHgubGVuZ3RoO1xuICAgIGMgPSAwO1xuICAgIGZvciAoaSA9IDA7IGkgPCBrOyBpKyspIHtcbiAgICAgICAgYyArPSB4W2ldICogbjtcbiAgICAgICAgYiA9IDA7XG4gICAgICAgIGlmIChjIDwgMCkge1xuICAgICAgICAgICAgYiA9IC0oYyA+PiBicGUpO1xuICAgICAgICAgICAgYyArPSBiICogcmFkaXg7XG4gICAgICAgIH1cbiAgICAgICAgeFtpXSA9IGMgJiBtYXNrO1xuICAgICAgICBjID0gKGMgPj4gYnBlKSAtIGI7XG4gICAgfVxufVxuLy9kbyB4PWZsb29yKHgvbikgZm9yIGJpZ0ludCB4IGFuZCBpbnRlZ2VyIG4sIGFuZCByZXR1cm4gdGhlIHJlbWFpbmRlclxuZnVuY3Rpb24gZGl2SW50Xyh4LCBuKSB7XG4gICAgdmFyIGksIHIgPSAwLCBzO1xuICAgIGZvciAoaSA9IHgubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgcyA9IHIgKiByYWRpeCArIHhbaV07XG4gICAgICAgIHhbaV0gPSBNYXRoLmZsb29yKHMgLyBuKTtcbiAgICAgICAgciA9IHMgJSBuO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbn1cbi8vZG8gdGhlIGxpbmVhciBjb21iaW5hdGlvbiB4PWEqeCtiKnkgZm9yIGJpZ0ludHMgeCBhbmQgeSwgYW5kIGludGVnZXJzIGEgYW5kIGIuXG4vL3ggbXVzdCBiZSBsYXJnZSBlbm91Z2ggdG8gaG9sZCB0aGUgYW5zd2VyLlxuZnVuY3Rpb24gbGluQ29tYl8oeCwgeSwgYSwgYikge1xuICAgIHZhciBpLCBjLCBrLCBraztcbiAgICBrID0geC5sZW5ndGggPCB5Lmxlbmd0aCA/IHgubGVuZ3RoIDogeS5sZW5ndGg7XG4gICAga2sgPSB4Lmxlbmd0aDtcbiAgICBmb3IgKGMgPSAwLCBpID0gMDsgaSA8IGs7IGkrKykge1xuICAgICAgICBjICs9IGEgKiB4W2ldICsgYiAqIHlbaV07XG4gICAgICAgIHhbaV0gPSBjICYgbWFzaztcbiAgICAgICAgYyA+Pj0gYnBlO1xuICAgIH1cbiAgICBmb3IgKGkgPSBrOyBpIDwga2s7IGkrKykge1xuICAgICAgICBjICs9IGEgKiB4W2ldO1xuICAgICAgICB4W2ldID0gYyAmIG1hc2s7XG4gICAgICAgIGMgPj49IGJwZTtcbiAgICB9XG59XG4vL2RvIHRoZSBsaW5lYXIgY29tYmluYXRpb24geD1hKngrYiooeTw8KHlzKmJwZSkpIGZvciBiaWdJbnRzIHggYW5kIHksIGFuZCBpbnRlZ2VycyBhLCBiIGFuZCB5cy5cbi8veCBtdXN0IGJlIGxhcmdlIGVub3VnaCB0byBob2xkIHRoZSBhbnN3ZXIuXG5mdW5jdGlvbiBsaW5Db21iU2hpZnRfKHgsIHksIGIsIHlzKSB7XG4gICAgdmFyIGksIGMsIGssIGtrO1xuICAgIGsgPSB4Lmxlbmd0aCA8IHlzICsgeS5sZW5ndGggPyB4Lmxlbmd0aCA6IHlzICsgeS5sZW5ndGg7XG4gICAga2sgPSB4Lmxlbmd0aDtcbiAgICBmb3IgKGMgPSAwLCBpID0geXM7IGkgPCBrOyBpKyspIHtcbiAgICAgICAgYyArPSB4W2ldICsgYiAqIHlbaSAtIHlzXTtcbiAgICAgICAgeFtpXSA9IGMgJiBtYXNrO1xuICAgICAgICBjID4+PSBicGU7XG4gICAgfVxuICAgIGZvciAoaSA9IGs7IGMgJiYgaSA8IGtrOyBpKyspIHtcbiAgICAgICAgYyArPSB4W2ldO1xuICAgICAgICB4W2ldID0gYyAmIG1hc2s7XG4gICAgICAgIGMgPj49IGJwZTtcbiAgICB9XG59XG4vL2RvIHg9eCsoeTw8KHlzKmJwZSkpIGZvciBiaWdJbnRzIHggYW5kIHksIGFuZCBpbnRlZ2VycyBhLGIgYW5kIHlzLlxuLy94IG11c3QgYmUgbGFyZ2UgZW5vdWdoIHRvIGhvbGQgdGhlIGFuc3dlci5cbmZ1bmN0aW9uIGFkZFNoaWZ0Xyh4LCB5LCB5cykge1xuICAgIHZhciBpLCBjLCBrLCBraztcbiAgICBrID0geC5sZW5ndGggPCB5cyArIHkubGVuZ3RoID8geC5sZW5ndGggOiB5cyArIHkubGVuZ3RoO1xuICAgIGtrID0geC5sZW5ndGg7XG4gICAgZm9yIChjID0gMCwgaSA9IHlzOyBpIDwgazsgaSsrKSB7XG4gICAgICAgIGMgKz0geFtpXSArIHlbaSAtIHlzXTtcbiAgICAgICAgeFtpXSA9IGMgJiBtYXNrO1xuICAgICAgICBjID4+PSBicGU7XG4gICAgfVxuICAgIGZvciAoaSA9IGs7IGMgJiYgaSA8IGtrOyBpKyspIHtcbiAgICAgICAgYyArPSB4W2ldO1xuICAgICAgICB4W2ldID0gYyAmIG1hc2s7XG4gICAgICAgIGMgPj49IGJwZTtcbiAgICB9XG59XG4vL2RvIHg9eC0oeTw8KHlzKmJwZSkpIGZvciBiaWdJbnRzIHggYW5kIHksIGFuZCBpbnRlZ2VycyBhLGIgYW5kIHlzLlxuLy94IG11c3QgYmUgbGFyZ2UgZW5vdWdoIHRvIGhvbGQgdGhlIGFuc3dlci5cbmZ1bmN0aW9uIHN1YlNoaWZ0Xyh4LCB5LCB5cykge1xuICAgIHZhciBpLCBjLCBrLCBraztcbiAgICBrID0geC5sZW5ndGggPCB5cyArIHkubGVuZ3RoID8geC5sZW5ndGggOiB5cyArIHkubGVuZ3RoO1xuICAgIGtrID0geC5sZW5ndGg7XG4gICAgZm9yIChjID0gMCwgaSA9IHlzOyBpIDwgazsgaSsrKSB7XG4gICAgICAgIGMgKz0geFtpXSAtIHlbaSAtIHlzXTtcbiAgICAgICAgeFtpXSA9IGMgJiBtYXNrO1xuICAgICAgICBjID4+PSBicGU7XG4gICAgfVxuICAgIGZvciAoaSA9IGs7IGMgJiYgaSA8IGtrOyBpKyspIHtcbiAgICAgICAgYyArPSB4W2ldO1xuICAgICAgICB4W2ldID0gYyAmIG1hc2s7XG4gICAgICAgIGMgPj49IGJwZTtcbiAgICB9XG59XG4vL2RvIHg9eC15IGZvciBiaWdJbnRzIHggYW5kIHkuXG4vL3ggbXVzdCBiZSBsYXJnZSBlbm91Z2ggdG8gaG9sZCB0aGUgYW5zd2VyLlxuLy9uZWdhdGl2ZSBhbnN3ZXJzIHdpbGwgYmUgMnMgY29tcGxlbWVudFxuZnVuY3Rpb24gc3ViXyh4LCB5KSB7XG4gICAgdmFyIGksIGMsIGssIGtrO1xuICAgIGsgPSB4Lmxlbmd0aCA8IHkubGVuZ3RoID8geC5sZW5ndGggOiB5Lmxlbmd0aDtcbiAgICBmb3IgKGMgPSAwLCBpID0gMDsgaSA8IGs7IGkrKykge1xuICAgICAgICBjICs9IHhbaV0gLSB5W2ldO1xuICAgICAgICB4W2ldID0gYyAmIG1hc2s7XG4gICAgICAgIGMgPj49IGJwZTtcbiAgICB9XG4gICAgZm9yIChpID0gazsgYyAmJiBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjICs9IHhbaV07XG4gICAgICAgIHhbaV0gPSBjICYgbWFzaztcbiAgICAgICAgYyA+Pj0gYnBlO1xuICAgIH1cbn1cbi8vZG8geD14K3kgZm9yIGJpZ0ludHMgeCBhbmQgeS5cbi8veCBtdXN0IGJlIGxhcmdlIGVub3VnaCB0byBob2xkIHRoZSBhbnN3ZXIuXG5mdW5jdGlvbiBhZGRfKHgsIHkpIHtcbiAgICB2YXIgaSwgYywgaywga2s7XG4gICAgayA9IHgubGVuZ3RoIDwgeS5sZW5ndGggPyB4Lmxlbmd0aCA6IHkubGVuZ3RoO1xuICAgIGZvciAoYyA9IDAsIGkgPSAwOyBpIDwgazsgaSsrKSB7XG4gICAgICAgIGMgKz0geFtpXSArIHlbaV07XG4gICAgICAgIHhbaV0gPSBjICYgbWFzaztcbiAgICAgICAgYyA+Pj0gYnBlO1xuICAgIH1cbiAgICBmb3IgKGkgPSBrOyBjICYmIGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGMgKz0geFtpXTtcbiAgICAgICAgeFtpXSA9IGMgJiBtYXNrO1xuICAgICAgICBjID4+PSBicGU7XG4gICAgfVxufVxuLy9kbyB4PXgqeSBmb3IgYmlnSW50cyB4IGFuZCB5LiAgVGhpcyBpcyBmYXN0ZXIgd2hlbiB5PHguXG5mdW5jdGlvbiBtdWx0Xyh4LCB5KSB7XG4gICAgdmFyIGk7XG4gICAgaWYgKHNzLmxlbmd0aCAhPSAyICogeC5sZW5ndGgpIHtcbiAgICAgICAgc3MgPSBuZXcgQXJyYXkoMiAqIHgubGVuZ3RoKTtcbiAgICB9XG4gICAgY29weUludF8oc3MsIDApO1xuICAgIGZvciAoaSA9IDA7IGkgPCB5Lmxlbmd0aDsgaSsrKVxuICAgICAgICBpZiAoeVtpXSkge1xuICAgICAgICAgICAgbGluQ29tYlNoaWZ0XyhzcywgeCwgeVtpXSwgaSk7XG4gICAgICAgIH0gLy9zcz0xKnNzK3lbaV0qKHg8PChpKmJwZSkpXG4gICAgY29weV8oeCwgc3MpO1xufVxuLy9kbyB4PXggbW9kIG4gZm9yIGJpZ0ludHMgeCBhbmQgbi5cbmZ1bmN0aW9uIG1vZF8oeCwgbikge1xuICAgIGlmIChzNC5sZW5ndGggIT0geC5sZW5ndGgpIHtcbiAgICAgICAgczQgPSBkdXAoeCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb3B5XyhzNCwgeCk7XG4gICAgfVxuICAgIGlmIChzNS5sZW5ndGggIT0geC5sZW5ndGgpIHtcbiAgICAgICAgczUgPSBkdXAoeCk7XG4gICAgfVxuICAgIGRpdmlkZV8oczQsIG4sIHM1LCB4KTsgLy94ID0gcmVtYWluZGVyIG9mIHM0IC8gblxufVxuLy9kbyB4PXgqeSBtb2QgbiBmb3IgYmlnSW50cyB4LHksbi5cbi8vZm9yIGdyZWF0ZXIgc3BlZWQsIGxldCB5PHguXG5mdW5jdGlvbiBtdWx0TW9kXyh4LCB5LCBuKSB7XG4gICAgdmFyIGk7XG4gICAgaWYgKHMwLmxlbmd0aCAhPSAyICogeC5sZW5ndGgpIHtcbiAgICAgICAgczAgPSBuZXcgQXJyYXkoMiAqIHgubGVuZ3RoKTtcbiAgICB9XG4gICAgY29weUludF8oczAsIDApO1xuICAgIGZvciAoaSA9IDA7IGkgPCB5Lmxlbmd0aDsgaSsrKVxuICAgICAgICBpZiAoeVtpXSkge1xuICAgICAgICAgICAgbGluQ29tYlNoaWZ0XyhzMCwgeCwgeVtpXSwgaSk7XG4gICAgICAgIH0gLy9zMD0xKnMwK3lbaV0qKHg8PChpKmJwZSkpXG4gICAgbW9kXyhzMCwgbik7XG4gICAgY29weV8oeCwgczApO1xufVxuLy9kbyB4PXgqeCBtb2QgbiBmb3IgYmlnSW50cyB4LG4uXG5mdW5jdGlvbiBzcXVhcmVNb2RfKHgsIG4pIHtcbiAgICB2YXIgaSwgaiwgZCwgYywga3gsIGtuLCBrO1xuICAgIGZvciAoa3ggPSB4Lmxlbmd0aDsga3ggPiAwICYmICF4W2t4IC0gMV07IGt4LS0pXG4gICAgICAgIDsgLy9pZ25vcmUgbGVhZGluZyB6ZXJvcyBpbiB4XG4gICAgayA9IGt4ID4gbi5sZW5ndGggPyAyICoga3ggOiAyICogbi5sZW5ndGg7IC8vaz0jIGVsZW1lbnRzIGluIHRoZSBwcm9kdWN0LCB3aGljaCBpcyB0d2ljZSB0aGUgZWxlbWVudHMgaW4gdGhlIGxhcmdlciBvZiB4IGFuZCBuXG4gICAgaWYgKHMwLmxlbmd0aCAhPSBrKSB7XG4gICAgICAgIHMwID0gbmV3IEFycmF5KGspO1xuICAgIH1cbiAgICBjb3B5SW50XyhzMCwgMCk7XG4gICAgZm9yIChpID0gMDsgaSA8IGt4OyBpKyspIHtcbiAgICAgICAgYyA9IHMwWzIgKiBpXSArIHhbaV0gKiB4W2ldO1xuICAgICAgICBzMFsyICogaV0gPSBjICYgbWFzaztcbiAgICAgICAgYyA+Pj0gYnBlO1xuICAgICAgICBmb3IgKGogPSBpICsgMTsgaiA8IGt4OyBqKyspIHtcbiAgICAgICAgICAgIGMgPSBzMFtpICsgal0gKyAyICogeFtpXSAqIHhbal0gKyBjO1xuICAgICAgICAgICAgczBbaSArIGpdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgIH1cbiAgICAgICAgczBbaSArIGt4XSA9IGM7XG4gICAgfVxuICAgIG1vZF8oczAsIG4pO1xuICAgIGNvcHlfKHgsIHMwKTtcbn1cbi8vcmV0dXJuIHggd2l0aCBleGFjdGx5IGsgbGVhZGluZyB6ZXJvIGVsZW1lbnRzXG5mdW5jdGlvbiB0cmltKHgsIGspIHtcbiAgICB2YXIgaSwgeTtcbiAgICBmb3IgKGkgPSB4Lmxlbmd0aDsgaSA+IDAgJiYgIXhbaSAtIDFdOyBpLS0pXG4gICAgICAgIDtcbiAgICB5ID0gbmV3IEFycmF5KGkgKyBrKTtcbiAgICBjb3B5Xyh5LCB4KTtcbiAgICByZXR1cm4geTtcbn1cbi8vZG8geD14Kip5IG1vZCBuLCB3aGVyZSB4LHksbiBhcmUgYmlnSW50cyBhbmQgKiogaXMgZXhwb25lbnRpYXRpb24uICAwKiowPTEuXG4vL3RoaXMgaXMgZmFzdGVyIHdoZW4gbiBpcyBvZGQuICB4IHVzdWFsbHkgbmVlZHMgdG8gaGF2ZSBhcyBtYW55IGVsZW1lbnRzIGFzIG4uXG5mdW5jdGlvbiBwb3dNb2RfKHgsIHksIG4pIHtcbiAgICB2YXIgazEsIGsyLCBrbiwgbnA7XG4gICAgaWYgKHM3Lmxlbmd0aCAhPSBuLmxlbmd0aCkge1xuICAgICAgICBzNyA9IGR1cChuKTtcbiAgICB9XG4gICAgLy9mb3IgZXZlbiBtb2R1bHVzLCB1c2UgYSBzaW1wbGUgc3F1YXJlLWFuZC1tdWx0aXBseSBhbGdvcml0aG0sXG4gICAgLy9yYXRoZXIgdGhhbiB1c2luZyB0aGUgbW9yZSBjb21wbGV4IE1vbnRnb21lcnkgYWxnb3JpdGhtLlxuICAgIGlmICgoblswXSAmIDEpID09IDApIHtcbiAgICAgICAgY29weV8oczcsIHgpO1xuICAgICAgICBjb3B5SW50Xyh4LCAxKTtcbiAgICAgICAgd2hpbGUgKCFlcXVhbHNJbnQoeSwgMCkpIHtcbiAgICAgICAgICAgIGlmICh5WzBdICYgMSkge1xuICAgICAgICAgICAgICAgIG11bHRNb2RfKHgsIHM3LCBuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpdkludF8oeSwgMik7XG4gICAgICAgICAgICBzcXVhcmVNb2RfKHM3LCBuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vY2FsY3VsYXRlIG5wIGZyb20gbiBmb3IgdGhlIE1vbnRnb21lcnkgbXVsdGlwbGljYXRpb25zXG4gICAgY29weUludF8oczcsIDApO1xuICAgIGZvciAoa24gPSBuLmxlbmd0aDsga24gPiAwICYmICFuW2tuIC0gMV07IGtuLS0pXG4gICAgICAgIDtcbiAgICBucCA9IHJhZGl4IC0gaW52ZXJzZU1vZEludChtb2RJbnQobiwgcmFkaXgpLCByYWRpeCk7XG4gICAgczdba25dID0gMTtcbiAgICBtdWx0TW9kXyh4LCBzNywgbik7IC8vIHggPSB4ICogMioqKGtuKmJwKSBtb2QgblxuICAgIGlmIChzMy5sZW5ndGggIT0geC5sZW5ndGgpIHtcbiAgICAgICAgczMgPSBkdXAoeCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb3B5XyhzMywgeCk7XG4gICAgfVxuICAgIGZvciAoazEgPSB5Lmxlbmd0aCAtIDE7IChrMSA+IDApICYgIXlbazFdOyBrMS0tKVxuICAgICAgICA7IC8vazE9Zmlyc3Qgbm9uemVybyBlbGVtZW50IG9mIHlcbiAgICBpZiAoeVtrMV0gPT0gMCkge1xuICAgICAgICAvL2FueXRoaW5nIHRvIHRoZSAwdGggcG93ZXIgaXMgMVxuICAgICAgICBjb3B5SW50Xyh4LCAxKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGsyID0gMSA8PCAoYnBlIC0gMSk7IGsyICYmICEoeVtrMV0gJiBrMik7IGsyID4+PSAxKVxuICAgICAgICA7IC8vazI9cG9zaXRpb24gb2YgZmlyc3QgMSBiaXQgaW4geVtrMV1cbiAgICBmb3IgKDs7KSB7XG4gICAgICAgIGsyID4+PSAxO1xuICAgICAgICBpZiAoIWsyKSB7XG4gICAgICAgICAgICAvL2xvb2sgYXQgbmV4dCBiaXQgb2YgeVxuICAgICAgICAgICAgazEtLTtcbiAgICAgICAgICAgIGlmIChrMSA8IDApIHtcbiAgICAgICAgICAgICAgICBtb250Xyh4LCBvbmUsIG4sIG5wKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrMiA9IDEgPDwgKGJwZSAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIG1vbnRfKHgsIHgsIG4sIG5wKTtcbiAgICAgICAgaWYgKGsyICYgeVtrMV0pIHtcbiAgICAgICAgICAgIC8vaWYgbmV4dCBiaXQgaXMgYSAxXG4gICAgICAgICAgICBtb250Xyh4LCBzMywgbiwgbnApO1xuICAgICAgICB9XG4gICAgfVxufVxuLy9kbyB4PXgqeSpSaSBtb2QgbiBmb3IgYmlnSW50cyB4LHksbixcbi8vICB3aGVyZSBSaSA9IDIqKigta24qYnBlKSBtb2QgbiwgYW5kIGtuIGlzIHRoZVxuLy8gIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgbiBhcnJheSwgbm90XG4vLyAgY291bnRpbmcgbGVhZGluZyB6ZXJvcy5cbi8veCBhcnJheSBtdXN0IGhhdmUgYXQgbGVhc3QgYXMgbWFueSBlbGVtbnRzIGFzIHRoZSBuIGFycmF5XG4vL0l0J3MgT0sgaWYgeCBhbmQgeSBhcmUgdGhlIHNhbWUgdmFyaWFibGUuXG4vL211c3QgaGF2ZTpcbi8vICB4LHkgPCBuXG4vLyAgbiBpcyBvZGRcbi8vICBucCA9IC0obl4oLTEpKSBtb2QgcmFkaXhcbmZ1bmN0aW9uIG1vbnRfKHgsIHksIG4sIG5wKSB7XG4gICAgdmFyIGksIGosIGMsIHVpLCB0LCBrcztcbiAgICB2YXIga24gPSBuLmxlbmd0aDtcbiAgICB2YXIga3kgPSB5Lmxlbmd0aDtcbiAgICBpZiAoc2EubGVuZ3RoICE9IGtuKSB7XG4gICAgICAgIHNhID0gbmV3IEFycmF5KGtuKTtcbiAgICB9XG4gICAgY29weUludF8oc2EsIDApO1xuICAgIGZvciAoOyBrbiA+IDAgJiYgbltrbiAtIDFdID09IDA7IGtuLS0pXG4gICAgICAgIDsgLy9pZ25vcmUgbGVhZGluZyB6ZXJvcyBvZiBuXG4gICAgZm9yICg7IGt5ID4gMCAmJiB5W2t5IC0gMV0gPT0gMDsga3ktLSlcbiAgICAgICAgOyAvL2lnbm9yZSBsZWFkaW5nIHplcm9zIG9mIHlcbiAgICBrcyA9IHNhLmxlbmd0aCAtIDE7IC8vc2Egd2lsbCBuZXZlciBoYXZlIG1vcmUgdGhhbiB0aGlzIG1hbnkgbm9uemVybyBlbGVtZW50cy5cbiAgICAvL3RoZSBmb2xsb3dpbmcgbG9vcCBjb25zdW1lcyA5NSUgb2YgdGhlIHJ1bnRpbWUgZm9yIHJhbmRUcnVlUHJpbWVfKCkgYW5kIHBvd01vZF8oKSBmb3IgbGFyZ2UgbnVtYmVyc1xuICAgIGZvciAoaSA9IDA7IGkgPCBrbjsgaSsrKSB7XG4gICAgICAgIHQgPSBzYVswXSArIHhbaV0gKiB5WzBdO1xuICAgICAgICB1aSA9ICgodCAmIG1hc2spICogbnApICYgbWFzazsgLy90aGUgaW5uZXIgXCImIG1hc2tcIiB3YXMgbmVlZGVkIG9uIFNhZmFyaSAoYnV0IG5vdCBNU0lFKSBhdCBvbmUgdGltZVxuICAgICAgICBjID0gKHQgKyB1aSAqIG5bMF0pID4+IGJwZTtcbiAgICAgICAgdCA9IHhbaV07XG4gICAgICAgIC8vZG8gc2E9KHNhK3hbaV0qeSt1aSpuKS9iICAgd2hlcmUgYj0yKipicGUuICBMb29wIGlzIHVucm9sbGVkIDUtZm9sZCBmb3Igc3BlZWRcbiAgICAgICAgaiA9IDE7XG4gICAgICAgIGZvciAoOyBqIDwga3kgLSA0Oykge1xuICAgICAgICAgICAgYyArPSBzYVtqXSArIHVpICogbltqXSArIHQgKiB5W2pdO1xuICAgICAgICAgICAgc2FbaiAtIDFdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgICAgICBjICs9IHNhW2pdICsgdWkgKiBuW2pdICsgdCAqIHlbal07XG4gICAgICAgICAgICBzYVtqIC0gMV0gPSBjICYgbWFzaztcbiAgICAgICAgICAgIGMgPj49IGJwZTtcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgIGMgKz0gc2Fbal0gKyB1aSAqIG5bal0gKyB0ICogeVtqXTtcbiAgICAgICAgICAgIHNhW2ogLSAxXSA9IGMgJiBtYXNrO1xuICAgICAgICAgICAgYyA+Pj0gYnBlO1xuICAgICAgICAgICAgaisrO1xuICAgICAgICAgICAgYyArPSBzYVtqXSArIHVpICogbltqXSArIHQgKiB5W2pdO1xuICAgICAgICAgICAgc2FbaiAtIDFdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgICAgICBjICs9IHNhW2pdICsgdWkgKiBuW2pdICsgdCAqIHlbal07XG4gICAgICAgICAgICBzYVtqIC0gMV0gPSBjICYgbWFzaztcbiAgICAgICAgICAgIGMgPj49IGJwZTtcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKDsgaiA8IGt5Oykge1xuICAgICAgICAgICAgYyArPSBzYVtqXSArIHVpICogbltqXSArIHQgKiB5W2pdO1xuICAgICAgICAgICAgc2FbaiAtIDFdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IGogPCBrbiAtIDQ7KSB7XG4gICAgICAgICAgICBjICs9IHNhW2pdICsgdWkgKiBuW2pdO1xuICAgICAgICAgICAgc2FbaiAtIDFdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgICAgICBjICs9IHNhW2pdICsgdWkgKiBuW2pdO1xuICAgICAgICAgICAgc2FbaiAtIDFdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgICAgICBjICs9IHNhW2pdICsgdWkgKiBuW2pdO1xuICAgICAgICAgICAgc2FbaiAtIDFdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgICAgICBjICs9IHNhW2pdICsgdWkgKiBuW2pdO1xuICAgICAgICAgICAgc2FbaiAtIDFdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgICAgICBjICs9IHNhW2pdICsgdWkgKiBuW2pdO1xuICAgICAgICAgICAgc2FbaiAtIDFdID0gYyAmIG1hc2s7XG4gICAgICAgICAgICBjID4+PSBicGU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IGogPCBrbjspIHtcbiAgICAgICAgICAgIGMgKz0gc2Fbal0gKyB1aSAqIG5bal07XG4gICAgICAgICAgICBzYVtqIC0gMV0gPSBjICYgbWFzaztcbiAgICAgICAgICAgIGMgPj49IGJwZTtcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKDsgaiA8IGtzOykge1xuICAgICAgICAgICAgYyArPSBzYVtqXTtcbiAgICAgICAgICAgIHNhW2ogLSAxXSA9IGMgJiBtYXNrO1xuICAgICAgICAgICAgYyA+Pj0gYnBlO1xuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG4gICAgICAgIHNhW2ogLSAxXSA9IGMgJiBtYXNrO1xuICAgIH1cbiAgICBpZiAoIWdyZWF0ZXIobiwgc2EpKSB7XG4gICAgICAgIHN1Yl8oc2EsIG4pO1xuICAgIH1cbiAgICBjb3B5Xyh4LCBzYSk7XG59XG4iLCJleHBvcnQgdmFyIEtleVBhaXJUeXBlO1xuKGZ1bmN0aW9uIChLZXlQYWlyVHlwZSkge1xuICAgIEtleVBhaXJUeXBlW0tleVBhaXJUeXBlW1wiUlNBXCJdID0gMF0gPSBcIlJTQVwiO1xuICAgIEtleVBhaXJUeXBlW0tleVBhaXJUeXBlW1wiUlNBX0FORF9FQ0NcIl0gPSAxXSA9IFwiUlNBX0FORF9FQ0NcIjtcbiAgICBLZXlQYWlyVHlwZVtLZXlQYWlyVHlwZVtcIlRVVEFfQ1JZUFRcIl0gPSAyXSA9IFwiVFVUQV9DUllQVFwiO1xufSkoS2V5UGFpclR5cGUgfHwgKEtleVBhaXJUeXBlID0ge30pKTtcbmV4cG9ydCBmdW5jdGlvbiBpc1BxS2V5UGFpcnMoa2V5UGFpcikge1xuICAgIHJldHVybiBrZXlQYWlyLmtleVBhaXJUeXBlID09PSBLZXlQYWlyVHlwZS5UVVRBX0NSWVBUO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUnNhT3JSc2FFY2NLZXlQYWlyKGtleVBhaXIpIHtcbiAgICByZXR1cm4ga2V5UGFpci5rZXlQYWlyVHlwZSA9PT0gS2V5UGFpclR5cGUuUlNBIHx8IGtleVBhaXIua2V5UGFpclR5cGUgPT09IEtleVBhaXJUeXBlLlJTQV9BTkRfRUNDO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUnNhRWNjS2V5UGFpcihrZXlQYWlyKSB7XG4gICAgcmV0dXJuIGtleVBhaXIua2V5UGFpclR5cGUgPT09IEtleVBhaXJUeXBlLlJTQV9BTkRfRUNDO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUHFQdWJsaWNLZXkocHVibGljS2V5KSB7XG4gICAgcmV0dXJuIHB1YmxpY0tleS5rZXlQYWlyVHlwZSA9PT0gS2V5UGFpclR5cGUuVFVUQV9DUllQVDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1JzYVB1YmxpY0tleShwdWJsaWNLZXkpIHtcbiAgICByZXR1cm4gcHVibGljS2V5LmtleVBhaXJUeXBlID09PSBLZXlQYWlyVHlwZS5SU0E7XG59XG4iLCIvLyBAdHMtaWdub3JlW3VudHlwZWQtaW1wb3J0XVxuaW1wb3J0IHsgQmlnSW50ZWdlciwgcGFyc2VCaWdJbnQsIFJTQUtleSB9IGZyb20gXCIuLi9pbnRlcm5hbC9jcnlwdG8tanNibi0yMDEyLTA4LTA5XzEuanNcIjtcbmltcG9ydCB7IGJhc2U2NFRvSGV4LCBiYXNlNjRUb1VpbnQ4QXJyYXksIGNvbmNhdCwgaW50OEFycmF5VG9CYXNlNjQsIHVpbnQ4QXJyYXlUb0hleCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIjtcbmltcG9ydCB7IENyeXB0b0Vycm9yIH0gZnJvbSBcIi4uL21pc2MvQ3J5cHRvRXJyb3IuanNcIjtcbmltcG9ydCB7IHNoYTI1Nkhhc2ggfSBmcm9tIFwiLi4vaGFzaGVzL1NoYTI1Ni5qc1wiO1xuaW1wb3J0IHsgS2V5UGFpclR5cGUgfSBmcm9tIFwiLi9Bc3ltbWV0cmljS2V5UGFpci5qc1wiO1xuY29uc3QgUlNBX0tFWV9MRU5HVEhfQklUUyA9IDIwNDg7XG5jb25zdCBSU0FfUFVCTElDX0VYUE9ORU5UID0gNjU1Mzc7XG5leHBvcnQgZnVuY3Rpb24gcnNhRW5jcnlwdChwdWJsaWNLZXksIGJ5dGVzLCBzZWVkKSB7XG4gICAgY29uc3QgcnNhID0gbmV3IFJTQUtleSgpO1xuICAgIC8vIHdlIGhhdmUgZG91YmxlIGNvbnZlcnNpb24gZnJvbSBieXRlcyB0byBoZXggdG8gYmlnIGludCBiZWNhdXNlIHRoZXJlIGlzIG5vIGRpcmVjdCBjb252ZXJzaW9uIGZyb20gYnl0ZXMgdG8gYmlnIGludFxuICAgIC8vIEJpZ0ludGVnZXIgb2YgSlNCTiB1c2VzIGEgc2lnbmVkIGJ5dGUgYXJyYXkgYW5kIHdlIGNvbnZlcnQgdG8gaXQgYnkgdXNpbmcgSW50OEFycmF5XG4gICAgcnNhLm4gPSBuZXcgQmlnSW50ZWdlcihuZXcgSW50OEFycmF5KGJhc2U2NFRvVWludDhBcnJheShwdWJsaWNLZXkubW9kdWx1cykpKTtcbiAgICByc2EuZSA9IHB1YmxpY0tleS5wdWJsaWNFeHBvbmVudDtcbiAgICBjb25zdCBwYWRkZWRCeXRlcyA9IG9hZXBQYWQoYnl0ZXMsIHB1YmxpY0tleS5rZXlMZW5ndGgsIHNlZWQpO1xuICAgIGNvbnN0IHBhZGRlZEhleCA9IHVpbnQ4QXJyYXlUb0hleChwYWRkZWRCeXRlcyk7XG4gICAgY29uc3QgYmlnSW50ID0gcGFyc2VCaWdJbnQocGFkZGVkSGV4LCAxNik7XG4gICAgbGV0IGVuY3J5cHRlZDtcbiAgICB0cnkge1xuICAgICAgICAvLyB0b0J5dGVBcnJheSgpIHByb2R1Y2VzIEFycmF5IHNvIHdlIGNvbnZlcnQgaXQgdG8gYnVmZmVyLlxuICAgICAgICBlbmNyeXB0ZWQgPSBuZXcgVWludDhBcnJheShyc2EuZG9QdWJsaWMoYmlnSW50KS50b0J5dGVBcnJheSgpKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IENyeXB0b0Vycm9yKFwiZmFpbGVkIFJTQSBlbmNyeXB0aW9uXCIsIGUpO1xuICAgIH1cbiAgICAvLyB0aGUgZW5jcnlwdGVkIHZhbHVlIG1pZ2h0IGhhdmUgbGVhZGluZyB6ZXJvcyBvciBuZWVkcyB0byBiZSBwYWRkZWQgd2l0aCB6ZXJvc1xuICAgIHJldHVybiBfcGFkQW5kVW5wYWRMZWFkaW5nWmVyb3MocHVibGljS2V5LmtleUxlbmd0aCAvIDgsIGVuY3J5cHRlZCk7XG59XG5leHBvcnQgZnVuY3Rpb24gcnNhRGVjcnlwdChwcml2YXRlS2V5LCBieXRlcykge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJzYSA9IG5ldyBSU0FLZXkoKTtcbiAgICAgICAgLy8gd2UgaGF2ZSBkb3VibGUgY29udmVyc2lvbiBmcm9tIGJ5dGVzIHRvIGhleCB0byBiaWcgaW50IGJlY2F1c2UgdGhlcmUgaXMgbm8gZGlyZWN0IGNvbnZlcnNpb24gZnJvbSBieXRlcyB0byBiaWcgaW50XG4gICAgICAgIC8vIEJpZ0ludGVnZXIgb2YgSlNCTiB1c2VzIGEgc2lnbmVkIGJ5dGUgYXJyYXkgYW5kIHdlIGNvbnZlcnQgdG8gaXQgYnkgdXNpbmcgSW50OEFycmF5XG4gICAgICAgIHJzYS5uID0gbmV3IEJpZ0ludGVnZXIobmV3IEludDhBcnJheShiYXNlNjRUb1VpbnQ4QXJyYXkocHJpdmF0ZUtleS5tb2R1bHVzKSkpO1xuICAgICAgICByc2EuZCA9IG5ldyBCaWdJbnRlZ2VyKG5ldyBJbnQ4QXJyYXkoYmFzZTY0VG9VaW50OEFycmF5KHByaXZhdGVLZXkucHJpdmF0ZUV4cG9uZW50KSkpO1xuICAgICAgICByc2EucCA9IG5ldyBCaWdJbnRlZ2VyKG5ldyBJbnQ4QXJyYXkoYmFzZTY0VG9VaW50OEFycmF5KHByaXZhdGVLZXkucHJpbWVQKSkpO1xuICAgICAgICByc2EucSA9IG5ldyBCaWdJbnRlZ2VyKG5ldyBJbnQ4QXJyYXkoYmFzZTY0VG9VaW50OEFycmF5KHByaXZhdGVLZXkucHJpbWVRKSkpO1xuICAgICAgICByc2EuZG1wMSA9IG5ldyBCaWdJbnRlZ2VyKG5ldyBJbnQ4QXJyYXkoYmFzZTY0VG9VaW50OEFycmF5KHByaXZhdGVLZXkucHJpbWVFeHBvbmVudFApKSk7XG4gICAgICAgIHJzYS5kbXExID0gbmV3IEJpZ0ludGVnZXIobmV3IEludDhBcnJheShiYXNlNjRUb1VpbnQ4QXJyYXkocHJpdmF0ZUtleS5wcmltZUV4cG9uZW50USkpKTtcbiAgICAgICAgcnNhLmNvZWZmID0gbmV3IEJpZ0ludGVnZXIobmV3IEludDhBcnJheShiYXNlNjRUb1VpbnQ4QXJyYXkocHJpdmF0ZUtleS5jcnRDb2VmZmljaWVudCkpKTtcbiAgICAgICAgY29uc3QgaGV4ID0gdWludDhBcnJheVRvSGV4KGJ5dGVzKTtcbiAgICAgICAgY29uc3QgYmlnSW50ID0gcGFyc2VCaWdJbnQoaGV4LCAxNik7XG4gICAgICAgIGNvbnN0IGRlY3J5cHRlZCA9IG5ldyBVaW50OEFycmF5KHJzYS5kb1ByaXZhdGUoYmlnSW50KS50b0J5dGVBcnJheSgpKTtcbiAgICAgICAgLy8gdGhlIGRlY3J5cHRlZCB2YWx1ZSBtaWdodCBoYXZlIGxlYWRpbmcgemVyb3Mgb3IgbmVlZHMgdG8gYmUgcGFkZGVkIHdpdGggemVyb3NcbiAgICAgICAgY29uc3QgcGFkZGVkRGVjcnlwdGVkID0gX3BhZEFuZFVucGFkTGVhZGluZ1plcm9zKHByaXZhdGVLZXkua2V5TGVuZ3RoIC8gOCAtIDEsIGRlY3J5cHRlZCk7XG4gICAgICAgIHJldHVybiBvYWVwVW5wYWQocGFkZGVkRGVjcnlwdGVkLCBwcml2YXRlS2V5LmtleUxlbmd0aCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihcImZhaWxlZCBSU0EgZGVjcnlwdGlvblwiLCBlKTtcbiAgICB9XG59XG4vKipcbiAqIEFkZHMgbGVhZGluZyAwJ3MgdG8gdGhlIGdpdmVuIGJ5dGUgYXJyYXkgdW50aWwgdGFyZ2VCeXRlTGVuZ3RoIGJ5dGVzIGFyZSByZWFjaGVkLiBSZW1vdmVzIGxlYWRpbmcgMCdzIGlmIGJ5dGVBcnJheSBpcyBsb25nZXIgdGhhbiB0YXJnZXRCeXRlTGVuZ3RoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gX3BhZEFuZFVucGFkTGVhZGluZ1plcm9zKHRhcmdldEJ5dGVMZW5ndGgsIGJ5dGVBcnJheSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KHRhcmdldEJ5dGVMZW5ndGgpO1xuICAgIC8vIEpTQk4gcHJvZHVjZXMgcmVzdWx0cyB3aGljaCBhcmUgbm90IGFsd2F5cyBleGFjdCBsZW5ndGguXG4gICAgLy8gVGhlIGJ5dGVBcnJheSBtaWdodCBoYXZlIGxlYWRpbmcgMCB0aGF0IG1ha2UgaXQgbGFyZ2VyIHRoYW4gdGhlIGFjdHVhbCByZXN1bHQgYXJyYXkgbGVuZ3RoLlxuICAgIC8vIEhlcmUgd2UgY3V0IHRoZW0gb2ZmXG4gICAgLy8gYnl0ZUFycmF5IFswLCAwLCAxLCAxLCAxXVxuICAgIC8vIHRhcmdldCAgICAgICBbMCwgMCwgMCwgMF1cbiAgICAvLyByZXN1bHQgICAgICAgWzAsIDEsIDEsIDFdXG4gICAgaWYgKGJ5dGVBcnJheS5sZW5ndGggPiByZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGxhc3RFeHRyYUJ5dGUgPSBieXRlQXJyYXlbYnl0ZUFycmF5Lmxlbmd0aCAtIHJlc3VsdC5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RFeHRyYUJ5dGUgIT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihgbGVhZGluZyBieXRlIGlzIG5vdCAwIGJ1dCAke2xhc3RFeHRyYUJ5dGV9LCBlbmNyeXB0ZWQgbGVuZ3RoOiAke2J5dGVBcnJheS5sZW5ndGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LnNsaWNlKGJ5dGVBcnJheS5sZW5ndGggLSByZXN1bHQubGVuZ3RoKTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIGJ5dGVBcnJheSBpcyBub3QgYXMgbG9uZyBhcyB0aGUgcmVzdWx0IGFycmF5IHdlIGFkZCBsZWFkaW5nIDAnc1xuICAgIC8vIGJ5dGVBcnJheSAgICAgWzEsIDEsIDFdXG4gICAgLy8gdGFyZ2V0ICAgICBbMCwgMCwgMCwgMF1cbiAgICAvLyByZXN1bHQgICAgIFswLCAxLCAxLCAxXVxuICAgIHJlc3VsdC5zZXQoYnl0ZUFycmF5LCByZXN1bHQubGVuZ3RoIC0gYnl0ZUFycmF5Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogT0FFUCAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKipcbiAqIE9wdGltYWwgQXN5bW1ldHJpYyBFbmNyeXB0aW9uIFBhZGRpbmcgKE9BRVApIC8gUlNBIHBhZGRpbmdcbiAqIEBzZWUgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0NDcjc2VjdGlvbi03LjFcbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIGJ5dGUgYXJyYXkgdG8gZW5jb2RlLlxuICogQHBhcmFtIGtleUxlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSBSU0Ega2V5IGluIGJpdC5cbiAqIEBwYXJhbSBzZWVkIEFuIGFycmF5IG9mIDMyIHJhbmRvbSBieXRlcy5cbiAqIEByZXR1cm4gVGhlIHBhZGRlZCBieXRlIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2FlcFBhZCh2YWx1ZSwga2V5TGVuZ3RoLCBzZWVkKSB7XG4gICAgbGV0IGhhc2hMZW5ndGggPSAzMjsgLy8gYnl0ZXMgc2hhMjU2XG4gICAgaWYgKHNlZWQubGVuZ3RoICE9PSBoYXNoTGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihcImludmFsaWQgc2VlZCBsZW5ndGg6IFwiICsgc2VlZC5sZW5ndGggKyBcIi4gZXhwZWN0ZWQ6IFwiICsgaGFzaExlbmd0aCArIFwiIGJ5dGVzIVwiKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlLmxlbmd0aCA+IGtleUxlbmd0aCAvIDggLSBoYXNoTGVuZ3RoIC0gMSkge1xuICAgICAgICB0aHJvdyBuZXcgQ3J5cHRvRXJyb3IoXCJpbnZhbGlkIHZhbHVlIGxlbmd0aDogXCIgKyB2YWx1ZS5sZW5ndGggKyBcIi4gZXhwZWN0ZWQ6IG1heC4gXCIgKyAoa2V5TGVuZ3RoIC8gOCAtIGhhc2hMZW5ndGggLSAxKSk7XG4gICAgfVxuICAgIGxldCBibG9jayA9IF9nZXRQU0Jsb2NrKHZhbHVlLCBrZXlMZW5ndGgpO1xuICAgIGxldCBkYk1hc2sgPSBtZ2YxKHNlZWQsIGJsb2NrLmxlbmd0aCAtIGhhc2hMZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSBoYXNoTGVuZ3RoOyBpIDwgYmxvY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmxvY2tbaV0gXj0gZGJNYXNrW2kgLSBoYXNoTGVuZ3RoXTtcbiAgICB9XG4gICAgLy8gc2FtZSBhcyBpbnZva2luZyBzaGEyNTYgZGlyZWN0bHkgYmVjYXVzZSBvbmx5IG9uZSBibG9jayBpcyBoYXNoZWRcbiAgICBsZXQgc2VlZE1hc2sgPSBtZ2YxKGJsb2NrLnNsaWNlKGhhc2hMZW5ndGgsIGJsb2NrLmxlbmd0aCksIGhhc2hMZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VlZE1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmxvY2tbaV0gPSBzZWVkW2ldIF4gc2VlZE1hc2tbaV07XG4gICAgfVxuICAgIHJldHVybiBibG9jaztcbn1cbi8qKlxuICogQHBhcmFtIHZhbHVlIFRoZSBieXRlIGFycmF5IHRvIHVucGFkLlxuICogQHBhcmFtIGtleUxlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSBSU0Ega2V5IGluIGJpdC5cbiAqIEByZXR1cm4gVGhlIHVucGFkZGVkIGJ5dGUgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYWVwVW5wYWQodmFsdWUsIGtleUxlbmd0aCkge1xuICAgIGxldCBoYXNoTGVuZ3RoID0gMzI7IC8vIGJ5dGVzIHNoYTI1NlxuICAgIGlmICh2YWx1ZS5sZW5ndGggIT09IGtleUxlbmd0aCAvIDggLSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihcImludmFsaWQgdmFsdWUgbGVuZ3RoOiBcIiArIHZhbHVlLmxlbmd0aCArIFwiLiBleHBlY3RlZDogXCIgKyAoa2V5TGVuZ3RoIC8gOCAtIDEpICsgXCIgYnl0ZXMhXCIpO1xuICAgIH1cbiAgICBsZXQgc2VlZE1hc2sgPSBtZ2YxKHZhbHVlLnNsaWNlKGhhc2hMZW5ndGgsIHZhbHVlLmxlbmd0aCksIGhhc2hMZW5ndGgpO1xuICAgIGxldCBzZWVkID0gbmV3IFVpbnQ4QXJyYXkoaGFzaExlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWVkTWFzay5sZW5ndGg7IGkrKykge1xuICAgICAgICBzZWVkW2ldID0gdmFsdWVbaV0gXiBzZWVkTWFza1tpXTtcbiAgICB9XG4gICAgbGV0IGRiTWFzayA9IG1nZjEoc2VlZCwgdmFsdWUubGVuZ3RoIC0gaGFzaExlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IGhhc2hMZW5ndGg7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZVtpXSBePSBkYk1hc2tbaSAtIGhhc2hMZW5ndGhdO1xuICAgIH1cbiAgICAvLyBjaGVjayB0aGF0IHRoZSB6ZXJvcyBhbmQgdGhlIG9uZSBpcyB0aGVyZVxuICAgIGxldCBpbmRleDtcbiAgICBmb3IgKGluZGV4ID0gMiAqIGhhc2hMZW5ndGg7IGluZGV4IDwgdmFsdWUubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGlmICh2YWx1ZVtpbmRleF0gPT09IDEpIHtcbiAgICAgICAgICAgIC8vIGZvdW5kIHRoZSAweDAxXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZVtpbmRleF0gIT09IDAgfHwgaW5kZXggPT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IENyeXB0b0Vycm9yKFwiaW52YWxpZCBwYWRkaW5nXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZS5zbGljZShpbmRleCArIDEsIHZhbHVlLmxlbmd0aCk7XG59XG4vKipcbiAqIFByb3ZpZGVzIGEgYmxvY2sgb2Yga2V5TGVuZ3RoIC8gOCAtIDEgYnl0ZXMgd2l0aCB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqIFsgemVyb3MgXSBbIGxhYmVsIGhhc2ggXSBbIHplcm9zIF0gWyAxIF0gWyB2YWx1ZSBdXG4gKiAgICAzMiAgICAgICAgICAgMzIgICAga2V5TGVuLTIqMzItMiAgMSAgdmFsdWUubGVuZ3RoXG4gKiBUaGUgbGFiZWwgaXMgdGhlIGhhc2ggb2YgYW4gZW1wdHkgc3RyaW5nIGxpa2UgZGVmaW5lZCBpbiBQS0NTIzEgdjIuMVxuICovXG5leHBvcnQgZnVuY3Rpb24gX2dldFBTQmxvY2sodmFsdWUsIGtleUxlbmd0aCkge1xuICAgIGxldCBoYXNoTGVuZ3RoID0gMzI7IC8vIGJ5dGVzIHNoYTI1NlxuICAgIGxldCBibG9ja0xlbmd0aCA9IGtleUxlbmd0aCAvIDggLSAxOyAvLyB0aGUgbGVhZGluZyBieXRlIHNoYWxsIGJlIDAgdG8gbWFrZSB0aGUgcmVzdWx0aW5nIHZhbHVlIGluIGFueSBjYXNlIHNtYWxsZXIgdGhhbiB0aGUgbW9kdWx1cywgc28gd2UganVzdCBsZWF2ZSB0aGUgYnl0ZSBvZmZcbiAgICBsZXQgYmxvY2sgPSBuZXcgVWludDhBcnJheShibG9ja0xlbmd0aCk7XG4gICAgbGV0IGRlZkhhc2ggPSBzaGEyNTZIYXNoKG5ldyBVaW50OEFycmF5KFtdKSk7IC8vIGVtcHR5IGxhYmVsXG4gICAgbGV0IG5ick9mWmVyb3MgPSBibG9jay5sZW5ndGggLSAoMSArIHZhbHVlLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBibG9jay5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSA+PSBoYXNoTGVuZ3RoICYmIGkgPCAyICogaGFzaExlbmd0aCkge1xuICAgICAgICAgICAgYmxvY2tbaV0gPSBkZWZIYXNoW2kgLSBoYXNoTGVuZ3RoXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpIDwgbmJyT2ZaZXJvcykge1xuICAgICAgICAgICAgYmxvY2tbaV0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGkgPT09IG5ick9mWmVyb3MpIHtcbiAgICAgICAgICAgIGJsb2NrW2ldID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJsb2NrW2ldID0gdmFsdWVbaSAtIG5ick9mWmVyb3MgLSAxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmxvY2s7XG59XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFBTUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKipcbiAqIEBwYXJhbSBtZXNzYWdlIFRoZSBieXRlIGFycmF5IHRvIGVuY29kZS5cbiAqIEBwYXJhbSBrZXlMZW5ndGggVGhlIGxlbmd0aCBvZiB0aGUgUlNBIGtleSBpbiBiaXQuXG4gKiBAcGFyYW0gc2FsdCBBbiBhcnJheSBvZiByYW5kb20gYnl0ZXMuXG4gKiBAcmV0dXJuIFRoZSBwYWRkZWQgYnl0ZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZShtZXNzYWdlLCBrZXlMZW5ndGgsIHNhbHQpIHtcbiAgICBsZXQgaGFzaExlbmd0aCA9IDMyOyAvLyBieXRlcyBzaGEyNTZcbiAgICBsZXQgZW1MZW4gPSBNYXRoLmNlaWwoa2V5TGVuZ3RoIC8gOCk7XG4gICAgaWYgKHNhbHQubGVuZ3RoICE9PSBoYXNoTGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgX3NhbHQgbGVuZ3RoOiBcIiArIHNhbHQubGVuZ3RoICsgXCIuIGV4cGVjdGVkOiBcIiArIGhhc2hMZW5ndGggKyBcIiBieXRlcyFcIik7XG4gICAgfVxuICAgIGxldCBsZW5ndGggPSBoYXNoTGVuZ3RoICsgc2FsdC5sZW5ndGggKyAyO1xuICAgIGlmIChlbUxlbiA8IGxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGhhc2gvX3NhbHQgbGVuZ3RoOiBcIiArIGxlbmd0aCArIFwiLiBleHBlY3RlZDogbWF4LiBcIiArIGVtTGVuKTtcbiAgICB9XG4gICAgbGV0IGVtQml0cyA9IGtleUxlbmd0aCAtIDE7XG4gICAgbGV0IG1pbkVtQml0c0xlbmd0aCA9IDggKiBoYXNoTGVuZ3RoICsgOCAqIHNhbHQubGVuZ3RoICsgOTtcbiAgICBpZiAoZW1CaXRzIDwgbWluRW1CaXRzTGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgbWF4aW11bSBlbUJpdHMgbGVuZ3RoLiBXYXMgXCIgKyBlbUJpdHMgKyBcIiwgZXhwZWN0ZWQ6IFwiICsgbWluRW1CaXRzTGVuZ3RoKTtcbiAgICB9XG4gICAgbGV0IG1lc3NhZ2VIYXNoID0gc2hhMjU2SGFzaChtZXNzYWdlKTtcbiAgICAvLyAgTScgPSAoMHgpMDAgMDAgMDAgMDAgMDAgMDAgMDAgMDAgfHwgbUhhc2ggfHwgX3NhbHRcbiAgICBsZXQgbWVzc2FnZTIgPSBjb25jYXQobmV3IFVpbnQ4QXJyYXkoWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKSwgbWVzc2FnZUhhc2gsIHNhbHQpO1xuICAgIGxldCBtZXNzYWdlMkhhc2ggPSBzaGEyNTZIYXNoKG1lc3NhZ2UyKTtcbiAgICBsZXQgcHMgPSBuZXcgVWludDhBcnJheShlbUxlbiAtIHNhbHQubGVuZ3RoIC0gaGFzaExlbmd0aCAtIDIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcHNbaV0gPSAwO1xuICAgIH1cbiAgICBsZXQgZGIgPSBjb25jYXQocHMsIG5ldyBVaW50OEFycmF5KFsxXSksIHNhbHQpO1xuICAgIF9jbGVhcihwcyk7XG4gICAgbGV0IGV4cGVjdGVkRGJMZW5ndGggPSBlbUxlbiAtIGhhc2hMZW5ndGggLSAxO1xuICAgIGlmIChkYi5sZW5ndGggIT09IGV4cGVjdGVkRGJMZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5leHBlY3RlZCBsZW5ndGggb2YgYmxvY2s6IFwiICsgZGIubGVuZ3RoICsgXCIuIEV4cGVjdGVkOiBcIiArIGV4cGVjdGVkRGJMZW5ndGgpO1xuICAgIH1cbiAgICBsZXQgZGJNYXNrID0gbWdmMShtZXNzYWdlMkhhc2gsIGVtTGVuIC0gbWVzc2FnZTJIYXNoLmxlbmd0aCAtIDEpO1xuICAgIGxldCBtYXNrZWREYiA9IG5ldyBVaW50OEFycmF5KGRiTWFzay5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGJNYXNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1hc2tlZERiW2ldID0gZGJbaV0gXiBkYk1hc2tbaV07XG4gICAgfVxuICAgIF9jbGVhcihkYik7XG4gICAgbWFza2VkRGJbMF0gJj0gMHhmZiA+PiAoOCAqIGVtTGVuIC0gZW1CaXRzKTtcbiAgICBsZXQgZW0gPSBjb25jYXQobWFza2VkRGIsIG1lc3NhZ2UySGFzaCwgbmV3IFVpbnQ4QXJyYXkoWzE4OF0pKTsgLy8gMHhiY1xuICAgIF9jbGVhcihtYXNrZWREYik7XG4gICAgcmV0dXJuIGVtO1xufVxuLyoqXG4gKiBjbGVhcnMgYW4gYXJyYXkgdG8gY29udGFpbiBvbmx5IHplcm9zICgwKVxuICovXG5mdW5jdGlvbiBfY2xlYXIoYXJyYXkpIHtcbiAgICBpZiAoIWFycmF5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXJyYXkuZmlsbCgwKTtcbn1cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogUlNBIHV0aWxzICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKlxuICogQHBhcmFtIHNlZWQgQW4gYXJyYXkgb2YgYnl0ZSB2YWx1ZXMuXG4gKiBAcGFyYW0gbGVuZ3RoIFRoZSBsZW5ndGggb2YgdGhlIHJldHVybiB2YWx1ZSBpbiBieXRlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1nZjEoc2VlZCwgbGVuZ3RoKSB7XG4gICAgbGV0IEMgPSBudWxsO1xuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICBsZXQgVCA9IG5ldyBVaW50OEFycmF5KDApO1xuICAgIGRvIHtcbiAgICAgICAgQyA9IGkyb3NwKGNvdW50ZXIpO1xuICAgICAgICBUID0gY29uY2F0KFQsIHNoYTI1Nkhhc2goY29uY2F0KHNlZWQsIEMpKSk7XG4gICAgfSB3aGlsZSAoKytjb3VudGVyIDwgTWF0aC5jZWlsKGxlbmd0aCAvICgyNTYgLyA4KSkpO1xuICAgIHJldHVybiBULnNsaWNlKDAsIGxlbmd0aCk7XG59XG4vKipcbiAqIGNvbnZlcnRzIGFuIGludGVnZXIgdG8gYSA0IGJ5dGUgYXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGkyb3NwKGkpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoWyhpID4+IDI0KSAmIDI1NSwgKGkgPj4gMTYpICYgMjU1LCAoaSA+PiA4KSAmIDI1NSwgKGkgPj4gMCkgJiAyNTVdKTtcbn1cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogS2V5IGNvbnZlcnNpb24gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqXG4gKiBAcGFyYW0gcHVibGljS2V5XG4gKiBAcmV0dXJucyBUaGUgcHVibGljIGtleSBpbiBhIHBlcnNpc3RhYmxlIGFycmF5IGZvcm1hdFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3B1YmxpY0tleVRvQXJyYXkocHVibGljS2V5KSB7XG4gICAgcmV0dXJuIFtfYmFzZTY0VG9CaWdJbnQocHVibGljS2V5Lm1vZHVsdXMpXTtcbn1cbi8qKlxuICogQHBhcmFtIHByaXZhdGVLZXlcbiAqIEByZXR1cm5zIFRoZSBwcml2YXRlIGtleSBpbiBhIHBlcnNpc3RhYmxlIGFycmF5IGZvcm1hdFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3ByaXZhdGVLZXlUb0FycmF5KHByaXZhdGVLZXkpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBfYmFzZTY0VG9CaWdJbnQocHJpdmF0ZUtleS5tb2R1bHVzKSxcbiAgICAgICAgX2Jhc2U2NFRvQmlnSW50KHByaXZhdGVLZXkucHJpdmF0ZUV4cG9uZW50KSxcbiAgICAgICAgX2Jhc2U2NFRvQmlnSW50KHByaXZhdGVLZXkucHJpbWVQKSxcbiAgICAgICAgX2Jhc2U2NFRvQmlnSW50KHByaXZhdGVLZXkucHJpbWVRKSxcbiAgICAgICAgX2Jhc2U2NFRvQmlnSW50KHByaXZhdGVLZXkucHJpbWVFeHBvbmVudFApLFxuICAgICAgICBfYmFzZTY0VG9CaWdJbnQocHJpdmF0ZUtleS5wcmltZUV4cG9uZW50USksXG4gICAgICAgIF9iYXNlNjRUb0JpZ0ludChwcml2YXRlS2V5LmNydENvZWZmaWNpZW50KSxcbiAgICBdO1xufVxuZnVuY3Rpb24gX2FycmF5VG9QdWJsaWNLZXkocHVibGljS2V5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5UGFpclR5cGU6IEtleVBhaXJUeXBlLlJTQSxcbiAgICAgICAgdmVyc2lvbjogMCxcbiAgICAgICAga2V5TGVuZ3RoOiBSU0FfS0VZX0xFTkdUSF9CSVRTLFxuICAgICAgICBtb2R1bHVzOiBpbnQ4QXJyYXlUb0Jhc2U2NChuZXcgSW50OEFycmF5KHB1YmxpY0tleVswXS50b0J5dGVBcnJheSgpKSksXG4gICAgICAgIHB1YmxpY0V4cG9uZW50OiBSU0FfUFVCTElDX0VYUE9ORU5ULFxuICAgIH07XG59XG5mdW5jdGlvbiBfYXJyYXlUb1ByaXZhdGVLZXkocHJpdmF0ZUtleSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZlcnNpb246IDAsXG4gICAgICAgIGtleUxlbmd0aDogUlNBX0tFWV9MRU5HVEhfQklUUyxcbiAgICAgICAgbW9kdWx1czogaW50OEFycmF5VG9CYXNlNjQobmV3IEludDhBcnJheShwcml2YXRlS2V5WzBdLnRvQnl0ZUFycmF5KCkpKSxcbiAgICAgICAgcHJpdmF0ZUV4cG9uZW50OiBpbnQ4QXJyYXlUb0Jhc2U2NChuZXcgSW50OEFycmF5KHByaXZhdGVLZXlbMV0udG9CeXRlQXJyYXkoKSkpLFxuICAgICAgICBwcmltZVA6IGludDhBcnJheVRvQmFzZTY0KG5ldyBJbnQ4QXJyYXkocHJpdmF0ZUtleVsyXS50b0J5dGVBcnJheSgpKSksXG4gICAgICAgIHByaW1lUTogaW50OEFycmF5VG9CYXNlNjQobmV3IEludDhBcnJheShwcml2YXRlS2V5WzNdLnRvQnl0ZUFycmF5KCkpKSxcbiAgICAgICAgcHJpbWVFeHBvbmVudFA6IGludDhBcnJheVRvQmFzZTY0KG5ldyBJbnQ4QXJyYXkocHJpdmF0ZUtleVs0XS50b0J5dGVBcnJheSgpKSksXG4gICAgICAgIHByaW1lRXhwb25lbnRROiBpbnQ4QXJyYXlUb0Jhc2U2NChuZXcgSW50OEFycmF5KHByaXZhdGVLZXlbNV0udG9CeXRlQXJyYXkoKSkpLFxuICAgICAgICBjcnRDb2VmZmljaWVudDogaW50OEFycmF5VG9CYXNlNjQobmV3IEludDhBcnJheShwcml2YXRlS2V5WzZdLnRvQnl0ZUFycmF5KCkpKSxcbiAgICB9O1xufVxuZnVuY3Rpb24gX2Jhc2U2NFRvQmlnSW50KGJhc2U2NCkge1xuICAgIHJldHVybiBwYXJzZUJpZ0ludChiYXNlNjRUb0hleChiYXNlNjQpLCAxNik7XG59XG4vKipcbiAqIFByb3ZpZGVzIHRoZSBsZW5ndGggb2YgdGhlIGdpdmVuIHN0cmluZyBhcyBoZXggc3RyaW5nIG9mIDQgY2hhcmFjdGVycyBsZW5ndGguIFBhZGRpbmcgdG8gNCBjaGFyYWN0ZXJzIGlzIGRvbmUgd2l0aCAnMCcuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIEEgc3RyaW5nIHRvIGdldCB0aGUgbGVuZ3RoIG9mLlxuICogQHJldHVybiB7c3RyaW5nfSBBIGhleCBzdHJpbmcgY29udGFpbmluZyB0aGUgbGVuZ3RoIG9mIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gX2hleExlbihzdHJpbmcpIHtcbiAgICBsZXQgaGV4TGVuID0gc3RyaW5nLmxlbmd0aC50b1N0cmluZygxNik7XG4gICAgd2hpbGUgKGhleExlbi5sZW5ndGggPCA0KSB7XG4gICAgICAgIGhleExlbiA9IFwiMFwiICsgaGV4TGVuO1xuICAgIH1cbiAgICByZXR1cm4gaGV4TGVuO1xufVxuZXhwb3J0IGZ1bmN0aW9uIF9rZXlBcnJheVRvSGV4KGtleSkge1xuICAgIGxldCBoZXggPSBcIlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBwYXJhbSA9IGtleVtpXS50b1N0cmluZygxNik7XG4gICAgICAgIGlmIChwYXJhbS5sZW5ndGggJSAyID09PSAxKSB7XG4gICAgICAgICAgICBwYXJhbSA9IFwiMFwiICsgcGFyYW07XG4gICAgICAgIH1cbiAgICAgICAgaGV4ICs9IF9oZXhMZW4ocGFyYW0pICsgcGFyYW07XG4gICAgfVxuICAgIHJldHVybiBoZXg7XG59XG5mdW5jdGlvbiBfaGV4VG9LZXlBcnJheShoZXgpIHtcbiAgICB0cnkge1xuICAgICAgICBsZXQga2V5ID0gW107XG4gICAgICAgIGxldCBwb3MgPSAwO1xuICAgICAgICB3aGlsZSAocG9zIDwgaGV4Lmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IG5leHRQYXJhbUxlbiA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcocG9zLCBwb3MgKyA0KSwgMTYpO1xuICAgICAgICAgICAgcG9zICs9IDQ7XG4gICAgICAgICAgICBrZXkucHVzaChwYXJzZUJpZ0ludChoZXguc3Vic3RyaW5nKHBvcywgcG9zICsgbmV4dFBhcmFtTGVuKSwgMTYpKTtcbiAgICAgICAgICAgIHBvcyArPSBuZXh0UGFyYW1MZW47XG4gICAgICAgIH1cbiAgICAgICAgX3ZhbGlkYXRlS2V5TGVuZ3RoKGtleSk7XG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBDcnlwdG9FcnJvcihcImhleCB0byByc2Ega2V5IGZhaWxlZFwiLCBlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBfdmFsaWRhdGVLZXlMZW5ndGgoa2V5KSB7XG4gICAgaWYgKGtleS5sZW5ndGggIT09IDEgJiYga2V5Lmxlbmd0aCAhPT0gNykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGtleSBwYXJhbXNcIik7XG4gICAgfVxuICAgIGlmIChrZXlbMF0uYml0TGVuZ3RoKCkgPCBSU0FfS0VZX0xFTkdUSF9CSVRTIC0gMSB8fCBrZXlbMF0uYml0TGVuZ3RoKCkgPiBSU0FfS0VZX0xFTkdUSF9CSVRTKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQga2V5IGxlbmd0aCwgZXhwZWN0ZWQ6IGFyb3VuZCBcIiArIFJTQV9LRVlfTEVOR1RIX0JJVFMgKyBcIiwgYnV0IHdhczogXCIgKyBrZXlbMF0uYml0TGVuZ3RoKCkpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiByc2FQcml2YXRlS2V5VG9IZXgocHJpdmF0ZUtleSkge1xuICAgIHJldHVybiBfa2V5QXJyYXlUb0hleChfcHJpdmF0ZUtleVRvQXJyYXkocHJpdmF0ZUtleSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJzYVB1YmxpY0tleVRvSGV4KHB1YmxpY0tleSkge1xuICAgIHJldHVybiBfa2V5QXJyYXlUb0hleChfcHVibGljS2V5VG9BcnJheShwdWJsaWNLZXkpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb1JzYVByaXZhdGVLZXkocHJpdmF0ZUtleUhleCkge1xuICAgIHJldHVybiBfYXJyYXlUb1ByaXZhdGVLZXkoX2hleFRvS2V5QXJyYXkocHJpdmF0ZUtleUhleCkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGhleFRvUnNhUHVibGljS2V5KHB1YmxpY0tleUhleCkge1xuICAgIHJldHVybiBfYXJyYXlUb1B1YmxpY0tleShfaGV4VG9LZXlBcnJheShwdWJsaWNLZXlIZXgpKTtcbn1cbiIsImltcG9ydCB7IGFlc0RlY3J5cHQsIGFlc0VuY3J5cHQsIGdldEtleUxlbmd0aEJ5dGVzLCBLRVlfTEVOR1RIX0JZVEVTX0FFU18xMjgsIEtFWV9MRU5HVEhfQllURVNfQUVTXzI1NiwgdW5hdXRoZW50aWNhdGVkQWVzRGVjcnlwdCB9IGZyb20gXCIuL0Flcy5qc1wiO1xuaW1wb3J0IHsgYml0QXJyYXlUb1VpbnQ4QXJyYXksIGZpeGVkSXYsIHVpbnQ4QXJyYXlUb0JpdEFycmF5IH0gZnJvbSBcIi4uL21pc2MvVXRpbHMuanNcIjtcbmltcG9ydCB7IGFzc2VydE5vdE51bGwsIGNvbmNhdCwgaGV4VG9VaW50OEFycmF5LCB1aW50OEFycmF5VG9IZXggfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCI7XG5pbXBvcnQgeyBoZXhUb1JzYVByaXZhdGVLZXksIGhleFRvUnNhUHVibGljS2V5LCByc2FQcml2YXRlS2V5VG9IZXggfSBmcm9tIFwiLi9Sc2EuanNcIjtcbmltcG9ydCB7IGJ5dGVzVG9LeWJlclByaXZhdGVLZXksIGJ5dGVzVG9LeWJlclB1YmxpY0tleSwga3liZXJQcml2YXRlS2V5VG9CeXRlcyB9IGZyb20gXCIuL0xpYm9xcy9LeWJlcktleVBhaXIuanNcIjtcbmltcG9ydCB7IEtleVBhaXJUeXBlIH0gZnJvbSBcIi4vQXN5bW1ldHJpY0tleVBhaXIuanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBpc0VuY3J5cHRlZFBxS2V5UGFpcnMoa2V5UGFpcikge1xuICAgIHJldHVybiAoa2V5UGFpci5wdWJFY2NLZXkgIT0gbnVsbCAmJlxuICAgICAgICBrZXlQYWlyLnB1Ykt5YmVyS2V5ICE9IG51bGwgJiZcbiAgICAgICAga2V5UGFpci5zeW1FbmNQcml2RWNjS2V5ICE9IG51bGwgJiZcbiAgICAgICAga2V5UGFpci5zeW1FbmNQcml2S3liZXJLZXkgIT0gbnVsbCAmJlxuICAgICAgICBrZXlQYWlyLnB1YlJzYUtleSA9PSBudWxsICYmXG4gICAgICAgIGtleVBhaXIuc3ltRW5jUHJpdlJzYUtleSA9PSBudWxsKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBlbmNyeXB0S2V5KGVuY3J5cHRpb25LZXksIGtleVRvQmVFbmNyeXB0ZWQpIHtcbiAgICBjb25zdCBrZXlMZW5ndGggPSBnZXRLZXlMZW5ndGhCeXRlcyhlbmNyeXB0aW9uS2V5KTtcbiAgICBpZiAoa2V5TGVuZ3RoID09PSBLRVlfTEVOR1RIX0JZVEVTX0FFU18xMjgpIHtcbiAgICAgICAgcmV0dXJuIGFlc0VuY3J5cHQoZW5jcnlwdGlvbktleSwgYml0QXJyYXlUb1VpbnQ4QXJyYXkoa2V5VG9CZUVuY3J5cHRlZCksIGZpeGVkSXYsIGZhbHNlLCBmYWxzZSkuc2xpY2UoZml4ZWRJdi5sZW5ndGgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChrZXlMZW5ndGggPT09IEtFWV9MRU5HVEhfQllURVNfQUVTXzI1Nikge1xuICAgICAgICByZXR1cm4gYWVzRW5jcnlwdChlbmNyeXB0aW9uS2V5LCBiaXRBcnJheVRvVWludDhBcnJheShrZXlUb0JlRW5jcnlwdGVkKSwgdW5kZWZpbmVkLCBmYWxzZSwgdHJ1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgQUVTIGtleSBsZW5ndGggKG11c3QgYmUgMTI4LWJpdCBvciAyNTYtYml0LCBnb3QgJHtrZXlMZW5ndGh9IGJ5dGVzIGluc3RlYWQpYCk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGRlY3J5cHRLZXkoZW5jcnlwdGlvbktleSwga2V5VG9CZURlY3J5cHRlZCkge1xuICAgIGNvbnN0IGtleUxlbmd0aCA9IGdldEtleUxlbmd0aEJ5dGVzKGVuY3J5cHRpb25LZXkpO1xuICAgIGlmIChrZXlMZW5ndGggPT09IEtFWV9MRU5HVEhfQllURVNfQUVTXzEyOCkge1xuICAgICAgICByZXR1cm4gdWludDhBcnJheVRvQml0QXJyYXkoYWVzRGVjcnlwdChlbmNyeXB0aW9uS2V5LCBjb25jYXQoZml4ZWRJdiwga2V5VG9CZURlY3J5cHRlZCksIGZhbHNlKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGtleUxlbmd0aCA9PT0gS0VZX0xFTkdUSF9CWVRFU19BRVNfMjU2KSB7XG4gICAgICAgIHJldHVybiB1aW50OEFycmF5VG9CaXRBcnJheShhZXNEZWNyeXB0KGVuY3J5cHRpb25LZXksIGtleVRvQmVEZWNyeXB0ZWQsIGZhbHNlKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgQUVTIGtleSBsZW5ndGggKG11c3QgYmUgMTI4LWJpdCBvciAyNTYtYml0LCBnb3QgJHtrZXlMZW5ndGh9IGJ5dGVzIGluc3RlYWQpYCk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGFlczI1NkRlY3J5cHRXaXRoUmVjb3ZlcnlLZXkoZW5jcnlwdGlvbktleSwga2V5VG9CZURlY3J5cHRlZCkge1xuICAgIC8vIGxlZ2FjeSBjYXNlOiByZWNvdmVyeSBjb2RlIHdpdGhvdXQgSVYvbWFjXG4gICAgaWYgKGtleVRvQmVEZWNyeXB0ZWQubGVuZ3RoID09PSBLRVlfTEVOR1RIX0JZVEVTX0FFU18xMjgpIHtcbiAgICAgICAgcmV0dXJuIHVpbnQ4QXJyYXlUb0JpdEFycmF5KHVuYXV0aGVudGljYXRlZEFlc0RlY3J5cHQoZW5jcnlwdGlvbktleSwgY29uY2F0KGZpeGVkSXYsIGtleVRvQmVEZWNyeXB0ZWQpLCBmYWxzZSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRlY3J5cHRLZXkoZW5jcnlwdGlvbktleSwga2V5VG9CZURlY3J5cHRlZCk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGVuY3J5cHRSc2FLZXkoZW5jcnlwdGlvbktleSwgcHJpdmF0ZUtleSwgaXYpIHtcbiAgICByZXR1cm4gYWVzRW5jcnlwdChlbmNyeXB0aW9uS2V5LCBoZXhUb1VpbnQ4QXJyYXkocnNhUHJpdmF0ZUtleVRvSGV4KHByaXZhdGVLZXkpKSwgaXYsIHRydWUsIHRydWUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGVuY3J5cHRFY2NLZXkoZW5jcnlwdGlvbktleSwgcHJpdmF0ZUtleSkge1xuICAgIHJldHVybiBhZXNFbmNyeXB0KGVuY3J5cHRpb25LZXksIHByaXZhdGVLZXksIHVuZGVmaW5lZCwgdHJ1ZSwgdHJ1ZSk7IC8vIHBhc3NpbmcgSVYgYXMgdW5kZWZpbmVkIGhlcmUgaXMgZmluZSwgYXMgaXQgd2lsbCBnZW5lcmF0ZSBhIG5ldyBvbmUgZm9yIGVhY2ggZW5jcnlwdGlvblxufVxuZXhwb3J0IGZ1bmN0aW9uIGVuY3J5cHRLeWJlcktleShlbmNyeXB0aW9uS2V5LCBwcml2YXRlS2V5KSB7XG4gICAgcmV0dXJuIGFlc0VuY3J5cHQoZW5jcnlwdGlvbktleSwga3liZXJQcml2YXRlS2V5VG9CeXRlcyhwcml2YXRlS2V5KSk7IC8vIHBhc3NpbmcgSVYgYXMgdW5kZWZpbmVkIGhlcmUgaXMgZmluZSwgYXMgaXQgd2lsbCBnZW5lcmF0ZSBhIG5ldyBvbmUgZm9yIGVhY2ggZW5jcnlwdGlvblxufVxuZXhwb3J0IGZ1bmN0aW9uIGRlY3J5cHRSc2FLZXkoZW5jcnlwdGlvbktleSwgZW5jcnlwdGVkUHJpdmF0ZUtleSkge1xuICAgIHJldHVybiBoZXhUb1JzYVByaXZhdGVLZXkodWludDhBcnJheVRvSGV4KGFlc0RlY3J5cHQoZW5jcnlwdGlvbktleSwgZW5jcnlwdGVkUHJpdmF0ZUtleSwgdHJ1ZSkpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZWNyeXB0S2V5UGFpcihlbmNyeXB0aW9uS2V5LCBrZXlQYWlyKSB7XG4gICAgaWYgKGtleVBhaXIuc3ltRW5jUHJpdlJzYUtleSkge1xuICAgICAgICByZXR1cm4gZGVjcnlwdFJzYU9yUnNhRWNjS2V5UGFpcihlbmNyeXB0aW9uS2V5LCBrZXlQYWlyKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0UFFLZXlQYWlyKGVuY3J5cHRpb25LZXksIGtleVBhaXIpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRlY3J5cHRSc2FPclJzYUVjY0tleVBhaXIoZW5jcnlwdGlvbktleSwga2V5UGFpcikge1xuICAgIGNvbnN0IHB1YmxpY0tleSA9IGhleFRvUnNhUHVibGljS2V5KHVpbnQ4QXJyYXlUb0hleChhc3NlcnROb3ROdWxsKGtleVBhaXIucHViUnNhS2V5KSkpO1xuICAgIGNvbnN0IHByaXZhdGVLZXkgPSBoZXhUb1JzYVByaXZhdGVLZXkodWludDhBcnJheVRvSGV4KGFlc0RlY3J5cHQoZW5jcnlwdGlvbktleSwga2V5UGFpci5zeW1FbmNQcml2UnNhS2V5LCB0cnVlKSkpO1xuICAgIGlmIChrZXlQYWlyLnN5bUVuY1ByaXZFY2NLZXkpIHtcbiAgICAgICAgY29uc3QgcHVibGljRWNjS2V5ID0gYXNzZXJ0Tm90TnVsbChrZXlQYWlyLnB1YkVjY0tleSk7XG4gICAgICAgIGNvbnN0IHByaXZhdGVFY2NLZXkgPSBhZXNEZWNyeXB0KGVuY3J5cHRpb25LZXksIGFzc2VydE5vdE51bGwoa2V5UGFpci5zeW1FbmNQcml2RWNjS2V5KSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBrZXlQYWlyVHlwZTogS2V5UGFpclR5cGUuUlNBX0FORF9FQ0MsXG4gICAgICAgICAgICBwdWJsaWNLZXksXG4gICAgICAgICAgICBwcml2YXRlS2V5LFxuICAgICAgICAgICAgcHVibGljRWNjS2V5LFxuICAgICAgICAgICAgcHJpdmF0ZUVjY0tleSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiB7IGtleVBhaXJUeXBlOiBLZXlQYWlyVHlwZS5SU0EsIHB1YmxpY0tleSwgcHJpdmF0ZUtleSB9O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRlY3J5cHRQUUtleVBhaXIoZW5jcnlwdGlvbktleSwga2V5UGFpcikge1xuICAgIGNvbnN0IGVjY1B1YmxpY0tleSA9IGFzc2VydE5vdE51bGwoa2V5UGFpci5wdWJFY2NLZXksIFwiZXhwZWN0ZWQgcHViIGVjYyBrZXkgZm9yIFBRIGtleXBhaXJcIik7XG4gICAgY29uc3QgZWNjUHJpdmF0ZUtleSA9IGFlc0RlY3J5cHQoZW5jcnlwdGlvbktleSwgYXNzZXJ0Tm90TnVsbChrZXlQYWlyLnN5bUVuY1ByaXZFY2NLZXksIFwiZXhwZWN0ZWQgcHJpdiBlY2Mga2V5IGZvciBQUSBrZXlwYWlyXCIpKTtcbiAgICBjb25zdCBreWJlclB1YmxpY0tleSA9IGJ5dGVzVG9LeWJlclB1YmxpY0tleShhc3NlcnROb3ROdWxsKGtleVBhaXIucHViS3liZXJLZXksIFwiZXhwZWN0ZWQgcHViIGt5YmVyIGtleSBmb3IgUFEga2V5cGFpclwiKSk7XG4gICAgY29uc3Qga3liZXJQcml2YXRlS2V5ID0gYnl0ZXNUb0t5YmVyUHJpdmF0ZUtleShhZXNEZWNyeXB0KGVuY3J5cHRpb25LZXksIGFzc2VydE5vdE51bGwoa2V5UGFpci5zeW1FbmNQcml2S3liZXJLZXksIFwiZXhwZWN0ZWQgZW5jIHByaXYga3liZXIga2V5IGZvciBQUSBrZXlwYWlyXCIpKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5UGFpclR5cGU6IEtleVBhaXJUeXBlLlRVVEFfQ1JZUFQsXG4gICAgICAgIGVjY0tleVBhaXI6IHtcbiAgICAgICAgICAgIHB1YmxpY0tleTogZWNjUHVibGljS2V5LFxuICAgICAgICAgICAgcHJpdmF0ZUtleTogZWNjUHJpdmF0ZUtleSxcbiAgICAgICAgfSxcbiAgICAgICAga3liZXJLZXlQYWlyOiB7XG4gICAgICAgICAgICBwdWJsaWNLZXk6IGt5YmVyUHVibGljS2V5LFxuICAgICAgICAgICAgcHJpdmF0ZUtleToga3liZXJQcml2YXRlS2V5LFxuICAgICAgICB9LFxuICAgIH07XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gcHFLZXlQYWlyc1RvUHVibGljS2V5cyhrZXlQYWlycykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGtleVBhaXJUeXBlOiBrZXlQYWlycy5rZXlQYWlyVHlwZSxcbiAgICAgICAgZWNjUHVibGljS2V5OiBrZXlQYWlycy5lY2NLZXlQYWlyLnB1YmxpY0tleSxcbiAgICAgICAga3liZXJQdWJsaWNLZXk6IGtleVBhaXJzLmt5YmVyS2V5UGFpci5wdWJsaWNLZXksXG4gICAgfTtcbn1cbiIsIi8vIEB0cy1pZ25vcmVbdW50eXBlZC1pbXBvcnRdXG5pbXBvcnQgc2pjbCBmcm9tIFwiLi4vaW50ZXJuYWwvc2pjbC5qc1wiO1xuY29uc3Qgc2hhMSA9IG5ldyBzamNsLmhhc2guc2hhMSgpO1xuLyoqXG4gKiBDcmVhdGUgdGhlIGhhc2ggb2YgdGhlIGdpdmVuIGRhdGEuXG4gKiBAcGFyYW0gdWludDhBcnJheSBUaGUgYnl0ZXMuXG4gKiBAcmV0dXJuIFRoZSBoYXNoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hhMUhhc2godWludDhBcnJheSkge1xuICAgIHRyeSB7XG4gICAgICAgIHNoYTEudXBkYXRlKHNqY2wuY29kZWMuYXJyYXlCdWZmZXIudG9CaXRzKHVpbnQ4QXJyYXkuYnVmZmVyLCB1aW50OEFycmF5LmJ5dGVPZmZzZXQsIHVpbnQ4QXJyYXkuYnl0ZUxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc2pjbC5jb2RlYy5hcnJheUJ1ZmZlci5mcm9tQml0cyhzaGExLmZpbmFsaXplKCksIGZhbHNlKSk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBzaGExLnJlc2V0KCk7XG4gICAgfVxufVxuIiwiLy8gQHRzLWlnbm9yZVt1bnR5cGVkLWltcG9ydF1cbmltcG9ydCBzamNsIGZyb20gXCIuLi9pbnRlcm5hbC9zamNsLmpzXCI7XG5pbXBvcnQgeyBiaXRBcnJheVRvVWludDhBcnJheSwgdWludDhBcnJheVRvQml0QXJyYXkgfSBmcm9tIFwiLi9VdGlscy5qc1wiO1xuaW1wb3J0IHsgaGV4VG9VaW50OEFycmF5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiO1xuaW1wb3J0IHsgcmFuZG9tIH0gZnJvbSBcIi4uL3JhbmRvbS9SYW5kb21pemVyLmpzXCI7XG5leHBvcnQgbGV0IERJR0lUUyA9IDY7XG5jb25zdCBESUdJVFNfUE9XRVIgPSBcbi8vIDAgICAxICAgMiAgICAzICAgIDQgICAgICA1ICAgICAgIDYgICAgICAgIDcgICAgICAgICA4XG5bMSwgMTAsIDEwMCwgMTAwMCwgMTAwMDAsIDEwMDAwMCwgMTAwMDAwMCwgMTAwMDAwMDAsIDEwMDAwMDAwMF07XG5jb25zdCBiYXNlMzIgPSBzamNsLmNvZGVjLmJhc2UzMjtcbmV4cG9ydCBjbGFzcyBUb3RwVmVyaWZpZXIge1xuICAgIF9kaWdpdHM7XG4gICAgY29uc3RydWN0b3IoZGlnaXRzID0gRElHSVRTKSB7XG4gICAgICAgIHRoaXMuX2RpZ2l0cyA9IGRpZ2l0cztcbiAgICB9XG4gICAgZ2VuZXJhdGVTZWNyZXQoKSB7XG4gICAgICAgIGxldCBrZXkgPSByYW5kb20uZ2VuZXJhdGVSYW5kb21EYXRhKDE2KTtcbiAgICAgICAgbGV0IHJlYWRhYmxlS2V5ID0gVG90cFZlcmlmaWVyLnJlYWRhYmxlS2V5KGtleSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBrZXksXG4gICAgICAgICAgICByZWFkYWJsZUtleSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgZ2VuZXJhdGVzIGEgVE9UUCB2YWx1ZSBmb3IgdGhlIGdpdmVuXG4gICAgICogc2V0IG9mIHBhcmFtZXRlcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGltZSA6IGEgdmFsdWUgdGhhdCByZWZsZWN0cyBhIHRpbWVcbiAgICAgKiBAcGFyYW0ga2V5ICA6ICB0aGUgc2hhcmVkIHNlY3JldC4gSXQgaXMgZ2VuZXJhdGVkIGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gICAgICogQHJldHVybjogdGhlIGtleSBhbmQgYSBudW1lcmljIFN0cmluZyBpbiBiYXNlIDEwIHRoYXQgaW5jbHVkZXMgdHJ1bmNhdGlvbkRpZ2l0cyBkaWdpdHNcbiAgICAgKi9cbiAgICBnZW5lcmF0ZVRvdHAodGltZSwga2V5KSB7XG4gICAgICAgIC8vIFVzaW5nIHRoZSBjb3VudGVyXG4gICAgICAgIC8vIEZpcnN0IDggYnl0ZXMgYXJlIGZvciB0aGUgbW92aW5nRmFjdG9yXG4gICAgICAgIC8vIENvbXBsaWFudCB3aXRoIGJhc2UgUkZDIDQyMjYgKEhPVFApXG4gICAgICAgIGxldCB0aW1lSGV4ID0gdGltZS50b1N0cmluZygxNik7XG4gICAgICAgIHdoaWxlICh0aW1lSGV4Lmxlbmd0aCA8IDE2KVxuICAgICAgICAgICAgdGltZUhleCA9IFwiMFwiICsgdGltZUhleDtcbiAgICAgICAgbGV0IG1zZyA9IGhleFRvVWludDhBcnJheSh0aW1lSGV4KTtcbiAgICAgICAgbGV0IGhhc2ggPSB0aGlzLmhtYWNfc2hhKGtleSwgbXNnKTtcbiAgICAgICAgbGV0IG9mZnNldCA9IGhhc2hbaGFzaC5sZW5ndGggLSAxXSAmIDB4ZjtcbiAgICAgICAgbGV0IGJpbmFyeSA9ICgoaGFzaFtvZmZzZXRdICYgMHg3ZikgPDwgMjQpIHwgKChoYXNoW29mZnNldCArIDFdICYgMHhmZikgPDwgMTYpIHwgKChoYXNoW29mZnNldCArIDJdICYgMHhmZikgPDwgOCkgfCAoaGFzaFtvZmZzZXQgKyAzXSAmIDB4ZmYpO1xuICAgICAgICBsZXQgY29kZSA9IGJpbmFyeSAlIERJR0lUU19QT1dFUlt0aGlzLl9kaWdpdHNdO1xuICAgICAgICByZXR1cm4gY29kZTtcbiAgICB9XG4gICAgaG1hY19zaGEoa2V5LCB0ZXh0KSB7XG4gICAgICAgIGxldCBobWFjID0gbmV3IHNqY2wubWlzYy5obWFjKHVpbnQ4QXJyYXlUb0JpdEFycmF5KGtleSksIHNqY2wuaGFzaC5zaGExKTtcbiAgICAgICAgcmV0dXJuIGJpdEFycmF5VG9VaW50OEFycmF5KGhtYWMuZW5jcnlwdCh1aW50OEFycmF5VG9CaXRBcnJheSh0ZXh0KSkpO1xuICAgIH1cbiAgICBzdGF0aWMgcmVhZGFibGVLZXkoa2V5KSB7XG4gICAgICAgIHJldHVybiBiYXNlMzJcbiAgICAgICAgICAgIC5mcm9tQml0cyh1aW50OEFycmF5VG9CaXRBcnJheShrZXkpKVxuICAgICAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIC5yZXBsYWNlKC8oLns0fSkvZywgXCIkMSBcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC89L2csIFwiXCIpXG4gICAgICAgICAgICAudHJpbSgpO1xuICAgIH1cbn1cbiIsIi8qIVxuICogKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gKiB8IG11cm11ckhhc2gzLmpzIHYzLjAuMCAoaHR0cDovL2dpdGh1Yi5jb20va2FyYW5seW9ucy9tdXJtdXJIYXNoMy5qcykgICAgICAgICAgICAgIHxcbiAqIHwgQSBUeXBlU2NyaXB0L0phdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgTXVybXVySGFzaDMncyBoYXNoaW5nIGFsZ29yaXRobXMuICAgICAgfFxuICogfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiB8IENvcHlyaWdodCAoYykgMjAxMi0yMDIwIEthcmFuIEx5b25zLiBGcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIHxcbiAqICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuICpcbiAqIHR1dGFvOiBoZWF2aWx5IHN0cmlwcGVkIGRvd24gdG8gb25seSB0YWtlIHg4Nmhhc2gzMiwgcmVtb3ZlZCB0eXBlcyBmb3Igbm93LlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBzaG91bGQgaGFuZGxlIG5vbi1hc2NpaSBjaGFyYWN0ZXJzLlxuICovXG5pbXBvcnQgeyBzdHJpbmdUb1V0ZjhVaW50OEFycmF5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiO1xuZnVuY3Rpb24geDg2Zm1peDMyKGgpIHtcbiAgICBoIF49IGggPj4+IDE2O1xuICAgIGggPSBtdWwzMihoLCAweDg1ZWJjYTZiKTtcbiAgICBoIF49IGggPj4+IDEzO1xuICAgIGggPSBtdWwzMihoLCAweGMyYjJhZTM1KTtcbiAgICBoIF49IGggPj4+IDE2O1xuICAgIHJldHVybiBoO1xufVxuY29uc3QgeDg2aGFzaDMyYzEgPSAweGNjOWUyZDUxO1xuY29uc3QgeDg2aGFzaDMyYzIgPSAweDFiODczNTkzO1xuZnVuY3Rpb24geDg2bWl4MzIoaCwgaykge1xuICAgIGsgPSBtdWwzMihrLCB4ODZoYXNoMzJjMSk7XG4gICAgayA9IHJvbDMyKGssIDE1KTtcbiAgICBrID0gbXVsMzIoaywgeDg2aGFzaDMyYzIpO1xuICAgIGggXj0gaztcbiAgICBoID0gcm9sMzIoaCwgMTMpO1xuICAgIGggPSBtdWwzMihoLCA1KSArIDB4ZTY1NDZiNjQ7XG4gICAgcmV0dXJuIGg7XG59XG5mdW5jdGlvbiBtdWwzMihtLCBuKSB7XG4gICAgcmV0dXJuIChtICYgMHhmZmZmKSAqIG4gKyAoKCgobSA+Pj4gMTYpICogbikgJiAweGZmZmYpIDw8IDE2KTtcbn1cbmZ1bmN0aW9uIHJvbDMyKG4sIHIpIHtcbiAgICByZXR1cm4gKG4gPDwgcikgfCAobiA+Pj4gKDMyIC0gcikpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG11cm11ckhhc2godmFsdWUpIHtcbiAgICBsZXQgc3RhdGUgPSAwO1xuICAgIGNvbnN0IGJ1ZiA9IHN0cmluZ1RvVXRmOFVpbnQ4QXJyYXkodmFsdWUpO1xuICAgIGxldCBoMTtcbiAgICBsZXQgaTtcbiAgICBsZXQgbGVuO1xuICAgIGgxID0gc3RhdGU7XG4gICAgaSA9IDA7XG4gICAgbGVuID0gMDtcbiAgICBjb25zdCBkdHYgPSBuZXcgRGF0YVZpZXcoYnVmLmJ1ZmZlciwgYnVmLmJ5dGVPZmZzZXQpO1xuICAgIGNvbnN0IHJlbWFpbmRlciA9IChidWYuYnl0ZUxlbmd0aCAtIGkpICUgNDtcbiAgICBjb25zdCBieXRlcyA9IGJ1Zi5ieXRlTGVuZ3RoIC0gaSAtIHJlbWFpbmRlcjtcbiAgICBsZW4gKz0gYnl0ZXM7XG4gICAgZm9yICg7IGkgPCBieXRlczsgaSArPSA0KSB7XG4gICAgICAgIGgxID0geDg2bWl4MzIoaDEsIGR0di5nZXRVaW50MzIoaSwgdHJ1ZSkpO1xuICAgIH1cbiAgICBsZW4gKz0gcmVtYWluZGVyO1xuICAgIGxldCBrMSA9IDB4MDtcbiAgICBzd2l0Y2ggKHJlbWFpbmRlcikge1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBrMSBePSBidWZbaSArIDJdIDw8IDE2O1xuICAgICAgICAvLyBmYWxscyB0aHJvdWdoXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGsxIF49IGJ1ZltpICsgMV0gPDwgODtcbiAgICAgICAgLy8gZmFsbHMgdGhyb3VnaFxuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBrMSBePSBidWZbaV07XG4gICAgICAgICAgICBrMSA9IG11bDMyKGsxLCB4ODZoYXNoMzJjMSk7XG4gICAgICAgICAgICBrMSA9IHJvbDMyKGsxLCAxNSk7XG4gICAgICAgICAgICBrMSA9IG11bDMyKGsxLCB4ODZoYXNoMzJjMik7XG4gICAgICAgICAgICBoMSBePSBrMTtcbiAgICB9XG4gICAgaDEgXj0gbGVuICYgMHhmZmZmZmZmZjtcbiAgICBoMSA9IHg4NmZtaXgzMihoMSk7XG4gICAgcmV0dXJuIGgxID4+PiAwO1xufVxuIiwiaW1wb3J0IHNqY2wgZnJvbSBcIi4uL2ludGVybmFsL3NqY2wuanNcIjtcbmltcG9ydCB7IGJpdEFycmF5VG9VaW50OEFycmF5LCB1aW50OEFycmF5VG9CaXRBcnJheSB9IGZyb20gXCIuLi9taXNjL1V0aWxzLmpzXCI7XG4vKipcbiAqIERlcml2ZXMgYSBrZXkgb2YgYSBkZWZpbmVkIGxlbmd0aCBmcm9tIHNhbHQsIGlucHV0S2V5TWF0ZXJpYWwgYW5kIGluZm8uXG4gKiBAcmV0dXJuIHRoZSBkZXJpdmVkIHNhbHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhrZGYoc2FsdCwgaW5wdXRLZXlNYXRlcmlhbCwgaW5mbywgbGVuZ3RoSW5CeXRlcykge1xuICAgIGNvbnN0IHNhbHRIbWFjID0gbmV3IHNqY2wubWlzYy5obWFjKHVpbnQ4QXJyYXlUb0JpdEFycmF5KHNhbHQpLCBzamNsLmhhc2guc2hhMjU2KTtcbiAgICBjb25zdCBrZXkgPSBzYWx0SG1hYy5tYWModWludDhBcnJheVRvQml0QXJyYXkoaW5wdXRLZXlNYXRlcmlhbCkpO1xuICAgIGNvbnN0IGhhc2hMZW4gPSBzamNsLmJpdEFycmF5LmJpdExlbmd0aChrZXkpO1xuICAgIGNvbnN0IGxvb3BzID0gTWF0aC5jZWlsKChsZW5ndGhJbkJ5dGVzICogOCkgLyBoYXNoTGVuKTtcbiAgICBpZiAobG9vcHMgPiAyNTUpIHtcbiAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJrZXkgYml0IGxlbmd0aCBpcyB0b28gbGFyZ2UgZm9yIGhrZGZcIik7XG4gICAgfVxuICAgIGNvbnN0IGlucHV0S2V5TWF0ZXJpYWxIbWFjID0gbmV3IHNqY2wubWlzYy5obWFjKGtleSwgc2pjbC5oYXNoLnNoYTI1Nik7XG4gICAgbGV0IGN1ck91dCA9IFtdO1xuICAgIGxldCByZXQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBsb29wczsgaSsrKSB7XG4gICAgICAgIGlucHV0S2V5TWF0ZXJpYWxIbWFjLnVwZGF0ZShjdXJPdXQpO1xuICAgICAgICBpbnB1dEtleU1hdGVyaWFsSG1hYy51cGRhdGUodWludDhBcnJheVRvQml0QXJyYXkoaW5mbykpO1xuICAgICAgICBpbnB1dEtleU1hdGVyaWFsSG1hYy51cGRhdGUoW3NqY2wuYml0QXJyYXkucGFydGlhbCg4LCBpKV0pO1xuICAgICAgICBjdXJPdXQgPSBpbnB1dEtleU1hdGVyaWFsSG1hYy5kaWdlc3QoKTtcbiAgICAgICAgcmV0ID0gc2pjbC5iaXRBcnJheS5jb25jYXQocmV0LCBjdXJPdXQpO1xuICAgIH1cbiAgICByZXR1cm4gYml0QXJyYXlUb1VpbnQ4QXJyYXkoc2pjbC5iaXRBcnJheS5jbGFtcChyZXQsIGxlbmd0aEluQnl0ZXMgKiA4KSk7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxJQUFJLE9BQU87Q0FLUCxRQUFRLENBQUU7Q0FLVixNQUFNLENBQUU7Q0FLUixhQUFhLENBQUU7Q0FLZixNQUFNLENBQUU7Q0FLUixNQUFNLENBQUU7Q0FXUixPQUFPLENBQUU7Q0FLVCxXQUFXO0VBS1AsU0FBUyxTQUFVLFNBQVM7QUFDeEIsUUFBSyxXQUFXLFdBQVk7QUFDeEIsV0FBTyxjQUFjLEtBQUs7R0FDN0I7QUFDRCxRQUFLLFVB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VUFBTztBQUNQLFVBQU8sT0FBTyxRQUFRLElBQUksUUFBUSxJQUFJLElBQUk7QUFDMUMsVUFBTztBQUNQLFVBQU8sT0FBTyxRQUFRLElBQUksUUFBUSxJQUFJLElBQUk7QUFDMUMsU0FBTyxNQUFNLE1BQU87QUFDcEIsVUFBTyxPQUFPLFFBQVEsSUFBSSxRQUFRLElBQUksSUFBSTtHQUUxQyxJQUFJLE1BQU0sVUFBVTtHQUNwQixJQUFJLE1BQU0sVUFBVSxRQUFRLFFBQVEsSUFBSSxZQUFZLElBQUksSUFBSTtBQUU1RCxRQUFLO0FBQ0wsUUFBSztBQUNMLFFBQUs7QUFDTCxRQUFLO0FBQ0wsUUFBSztBQUNMLFFBQUs7QUFDTCxRQUFNLEtBQUssTUFBTztBQUNsQixRQUFNLEtBQUssT0FBTyxPQUFPLElBQUksT0FBTyxJQUFJLElBQUksS0FBTTtBQUNsRCxRQUFLO0FBQ0wsUUFBSztBQUNMLFFBQUs7QUFDTCxRQUFLO0FBQ0wsUUFBSztBQUNMLFFBQUs7QUFDTCxRQUFNLE1BQU0sTUFBTztBQUNuQixRQUFNLE1BQU0sT0FBTyxPQUFPLElBQUksUUFBUSxJQUFJLElBQUksS0FBTTtFQUN2RDtBQUVELFFBQU0sRUFBRSxLQUFNLE1BQU0sS0FBTTtBQUMxQixJQUFFLEtBQU0sTUFBTSxNQUFNLFFBQVEsSUFBSSxPQUFPLElBQUksSUFBSSxLQUFNO0FBQ3JELFFBQU0sRUFBRSxLQUFNLE1BQU0sS0FBTTtBQUMxQixJQUFFLEtBQU0sTUFBTSxNQUFNLFFBQVEsSUFBSSxPQUFPLElBQUksSUFBSSxLQUFNO0FBQ3JELFFBQU0sRUFBRSxLQUFNLE1BQU0sS0FBTTtBQUMxQixJQUFFLEtBQU0sTUFBTSxNQUFNLFFBQVEsSUFBSSxPQUFPLElBQUksSUFBSSxLQUFNO0FBQ3JELFFBQU0sRUFBRSxLQUFNLE1BQU0sS0FBTTtBQUMxQixJQUFFLEtBQU0sTUFBTSxNQUFNLFFBQVEsSUFBSSxPQUFPLElBQUksSUFBSSxLQUFNO0FBQ3JELFFBQU0sRUFBRSxLQUFNLE1BQU0sS0FBTTtBQUMxQixJQUFFLEtBQU0sTUFBTSxN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QUFNLEVBQUU7QUFDckUsU0FBSyxLQUFLO0FBQ1YsU0FBSyxLQUFLO0FBQ1YsU0FBSyxLQUFLO0FBQ1YsU0FBSyxLQUFLO0FBQ1YsU0FBSyxLQUFLO0FBQ1YsU0FBSyxLQUFLO0lBQ1YsTUFBTSxNQUFNLFlBQVksTUFBTSxLQUFLLFNBQVMsS0FBSztBQUNqRCxTQUFLLFlBQVksTUFBTSxLQUFLLEtBQUssU0FBUyxLQUFLO0FBQy9DLFNBQUssTUFBTTtHQUNkO0FBQ0QsSUFBQyxDQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUksR0FBRyxZQUFZLElBQUksS0FBSyxLQUFLLEdBQUcsS0FBSyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssRUFBRTtBQUM3RSxJQUFDLENBQUUsR0FBRyxJQUFJLEdBQUcsR0FBSSxHQUFHLFlBQVksSUFBSSxLQUFLLEtBQUssR0FBRyxLQUFLLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFO0FBQzdFLElBQUMsQ0FBRSxHQUFHLElBQUksR0FBRyxHQUFJLEdBQUcsWUFBWSxJQUFJLEtBQUssS0FBSyxHQUFHLEtBQUssS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEVBQUU7QUFDN0UsSUFBQyxDQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUksR0FBRyxZQUFZLElBQUksS0FBSyxLQUFLLEdBQUcsS0FBSyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssRUFBRTtBQUM3RSxJQUFDLENBQUUsR0FBRyxJQUFJLEdBQUcsR0FBSSxHQUFHLFlBQVksSUFBSSxLQUFLLEtBQUssR0FBRyxLQUFLLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFO0FBQzdFLElBQUMsQ0FBRSxHQUFHLElBQUksR0FBRyxHQUFJLEdBQUcsWUFBWSxJQUFJLEtBQUssS0FBSyxHQUFHLEtBQUssS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEVBQUU7QUFDN0UsSUFBQyxDQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUksR0FBRyxZQUFZLElBQUksS0FBSyxLQUFLLEdBQUcsS0FBSyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssRUFBRTtBQUM3RSxJQUFDLENBQUUsR0FBRyxJQUFJLEdBQUcsR0FBSSxHQUFHLFlBQVksSUFBSSxLQUFLLEtBQUssR0FBRyxLQUFLLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFO0FBQzdFLFFBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHO0VBQzNFO0VBQ0QsYUFBYTtBQUNULGNBQVcsS0FBSyxFQUFFO0FBQ2xCLGNBQVcsS0FBSyxFQUFFO0VBQ3JCO0VBQ0QsVUFBVTtBQUNOLFFBQUssT0FBTyxLQUFLLEVBQUU7QUFDbkIsUUFBSyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUU7RUFDM0Q7Q0FDSjtDQUNELElBQUlDLDJCQUF5QixnQkFBZ0IsTUFBTSxJQUFJLFNBQVM7Q0FFaEUsSUFBSSxNQUFNLE9BQU8sRUFBRTtDQUNuQixJQUFJLE1BQU0sT0FBTyxFQUFFO0NBQ25CLElBQUksTUFBTSxPQUFPLEVBQUU7Q0FDbkIsU0FBUyxTQUFTLEdBQUc7QUFDakIsU0FBTyxhQUFhLGNBQWMsS0FBSyxlQUFlLE1BQU0sWUFBWSxFQUFFLFlBQVksU0FBUztDQUNsRztDQUNELElBQUksd0JBQXdCLE1BQU0sS0FBSyxFQUFFLFFBQVEsSUFBSyxHQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztDQUNsRyxTQUFTLFdBQVcsUUFBUTtBQUN4QixPQUFLLFNBQVMsT0FBTyxDQUNqQixPQUFNLElBQUksTUFBTTtFQUNwQixJQUFJLE1BQU07QUFDVixPQUFLLElBQUksSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLElBQy9CLFFBQU8sTUFBTSxPQUFPO0FBRXhCLFNBQU87Q0FDVjtDQUNELFNBQVMsWUFBWSxLQUFLO0FBQ3RCLGFBQVcsUUFBUSxTQUNmLE9BQU0sSUFBSSxNQUFNLHFDQUFxQztBQUN6RCxTQUFPLE9BQU8sUUFBUSxLQUFLLE9BQU8sSUFBSSxJQUFJLEVBQUU7Q0FDL0M7Q0FDRCxJQUFJLFNBQVM7RUFBRSxJQUFJO0VBQUksSUFBSTtFQUFJLElBQUk7RUFBSSxJQUFJO0VBQUksSUFBSTtFQUFJLElBQUk7Q0FBSztDQUNoRSxTQUFTLGNBQWMsTUFBTTtBQUN6QixNQUFJLFFBQVEsT0FBTyxNQUFNLFFBQVEsT0FBTyxHQUNwQyxRQUFPLE9BQU8sT0FBTztBQUN6QixNQUFJLFFBQVEsT0FBTyxNQUFNLFFBQVEsT0FBTyxHQUNwQyxRQUFPLFFBQVEsT0FBTyxLQUFLO0FBQy9CLE1BQUksUUFBUSxPQUFPLE1BQU0sUUFBUSxPQUFPLEdBQ3BDLFFBQU8sUUFBUSxPQUFPLEtBQUs7QUFDL0I7Q0FDSDtDQUNELFNBQVMsV0FBVyxLQUFLO0FBQ3JCLGFBQVcsUUFBUSxTQUNmLE9BQU0sSUFBSSxNQUFNLHFDQUFxQztFQUN6RCxNQUFNLEtBQUssSUFBSTtFQUNmLE1BQU0sS0FBSyxLQUFLO0FBQ2hCLE1BQUksS0FBSyxFQUNMLE9BQU0sSUFBSSxNQUFNLDREQUE0RDtFQUNoRixNQUFNLFFBQVEsSUFBSSxXQUFXO0FBQzdCLE9BQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxNQUFNLE1BQU0sR0FBRztHQUM3QyxNQUFNLEtBQUssY0FBYyxJQUFJLFdBQVcsR0FBRyxDQUFDO0dBQzVDLE1BQU0sS0FBSyxjQUFjLElBQUksV0FBVyxLQUFLLEVBQUUsQ0FBQztBQUNoRCxPQUFJLFlBQVksS0FBSyxZQUFZLEdBQUc7SUFDaEMsTUFBTSxPQUFPLElBQUksTUFBTSxJQUFJLEtBQUs7QUFDaEMsVUFBTSxJQUFJLE1BQU0sa0RBQWlELE9BQU8saUJBQWdCO0dBQzNGO0FBQ0QsU0FBTSxNQUFNLEtBQUssS0FBSztFQUN6QjtBQUNELFNBQU87Q0FDVjtDQUNELFNBQVMsZ0JBQWdCLFFBQVE7QUFDN0IsU0FBTyxZQUFZLFdBQVcsT0FBTyxDQUFDO0NBQ3pDO0NBQ0QsU0FBUyxnQkFBZ0IsUUFBUTtBQUM3QixPQUFLLFNBQVMsT0FBTyxDQUNqQixPQUFNLElBQUksTUFBTTtBQUNwQixTQUFPLFlBQVksV0FBVyxXQUFXLEtBQUssT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQ3BFO0NBQ0QsU0FBUyxnQkFBZ0IsR0FBRyxLQUFLO0FBQzdCLFNBQU8sV0FBVyxFQUFFLFNBQVMsR0FBRyxDQUFDLFNBQVMsTUFBTSxHQUFHLElBQUksQ0FBQztDQUMzRDtDQUNELFNBQVMsZ0JBQWdCLEdBQUcsS0FBSztBQUM3QixTQUFPLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTO0NBQzNDO0NBQ0QsU0FBUyxZQUFZLE9BQU8sS0FBSyxnQkFBZ0I7RUFDN0MsSUFBSTtBQUNKLGFBQVcsUUFBUSxTQUNmLEtBQUk7QUFDQSxTQUFNLFdBQVcsSUFBSTtFQUN4QixTQUNNLEdBQUc7QUFDTixTQUFNLElBQUksT0FBTyxFQUFFLE1BQU0sa0NBQWtDLElBQUksWUFBWSxFQUFFO0VBQ2hGO1NBRUksU0FBUyxJQUFJLENBQ2xCLE9BQU0sV0FBVyxLQUFLLElBQUk7SUFHMUIsT0FBTSxJQUFJLE9BQU8sRUFBRSxNQUFNO0VBRTdCLE1BQU0sTUFBTSxJQUFJO0FBQ2hCLGFBQVcsbUJBQW1CLFlBQVksUUFBUSxlQUM5QyxPQUFNLElBQUksT0FBTyxFQUFFLE1BQU0sWUFBWSxlQUFlLGNBQWMsSUFBSTtBQUMxRSxTQUFPO0NBQ1Y7Q0FDRCxTQUFTLGFBQWEsR0FBRyxRQUFRO0VBQzdCLElBQUksTUFBTTtBQUNWLE9BQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsS0FBSztHQUNwQyxNQUFNLElBQUksT0FBTztBQUNqQixRQUFLLFNBQVMsRUFBRSxDQUNaLE9BQU0sSUFBSSxNQUFNO0FBQ3BCLFVBQU8sRUFBRTtFQUNaO0VBQ0QsSUFBSSxNQUFNLElBQUksV0FBVztFQUN6QixJQUFJLE1BQU07QUFDVixPQUFLLElBQUksSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLEtBQUs7R0FDcEMsTUFBTSxJQUFJLE9BQU87QUFDakIsT0FBSSxJQUFJLEdBQUcsSUFBSTtBQUNmLFVBQU8sRUFBRTtFQUNaO0FBQ0QsU0FBTztDQUNWO0NBQ0QsSUFBSSxVQUFVLENBQUMsT0FBTyxPQUFPLE9BQU8sSUFBSSxFQUFFLElBQUk7Q0FDOUMsSUFBSSxlQUFlO0VBQ2YsUUFBUSxDQUFDLGVBQWUsUUFBUTtFQUNoQyxVQUFVLENBQUMsZUFBZSxRQUFRO0VBQ2xDLFNBQVMsQ0FBQyxlQUFlLFFBQVE7RUFDakMsUUFBUSxDQUFDLGVBQWUsUUFBUTtFQUNoQyxvQkFBb0IsQ0FBQyxlQUFlLFFBQVEsWUFBWSxTQUFTLElBQUk7RUFDckUsZUFBZSxDQUFDLFFBQVEsT0FBTyxjQUFjLElBQUk7RUFDakQsT0FBTyxDQUFDLFFBQVEsTUFBTSxRQUFRLElBQUk7RUFDbEMsT0FBTyxDQUFDLEtBQUssV0FBVyxPQUFPLEdBQUcsUUFBUSxJQUFJO0VBQzlDLE1BQU0sQ0FBQyxlQUFlLFFBQVEsY0FBYyxPQUFPLGNBQWMsSUFBSSxVQUFVO0NBQ2xGO0NBQ0QsU0FBUyxlQUFlLFFBQVEsWUFBWSxnQkFBZ0IsQ0FBRSxHQUFFO0VBQzVELE1BQU0sYUFBYSxDQUFDLFdBQVcsTUFBTSxlQUFlO0dBQ2hELE1BQU0sV0FBVyxhQUFhO0FBQzlCLGNBQVcsYUFBYSxXQUNwQixPQUFNLElBQUksT0FBTyxxQkFBcUIsS0FBSztHQUMvQyxNQUFNLE1BQU0sT0FBTztBQUNuQixPQUFJLGNBQWMsYUFBYSxFQUMzQjtBQUNKLFFBQUssU0FBUyxLQUFLLE9BQU8sQ0FDdEIsT0FBTSxJQUFJLE9BQU8sZ0JBQWdCLE9BQU8sVUFBVSxDQUFDLEdBQUcsSUFBSSxXQUFXLElBQUksY0FBYyxLQUFLO0VBRW5HO0FBQ0QsT0FBSyxNQUFNLENBQUMsV0FBVyxLQUFLLElBQUksT0FBTyxRQUFRLFdBQVcsQ0FDdEQsWUFBVyxXQUFXLE1BQU0sTUFBTTtBQUN0QyxPQUFLLE1BQU0sQ0FBQyxXQUFXLEtBQUssSUFBSSxPQUFPLFFBQVEsY0FBYyxDQUN6RCxZQUFXLFdBQVcsTUFBTSxLQUFLO0FBQ3JDLFNBQU87Q0FDVjtDQUVELElBQUksT0FBTyxPQUFPLEVBQUU7Q0FDcEIsSUFBSSxPQUFPLE9BQU8sRUFBRTtDQUNwQixJQUFJLE9BQU8sT0FBTyxFQUFFO0NBQ3BCLElBQUksTUFBTSxPQUFPLEVBQUU7Q0FDbkIsSUFBSSxNQUFNLE9BQU8sRUFBRTtDQUNuQixJQUFJLE1BQU0sT0FBTyxFQUFFO0NBQ25CLElBQUksTUFBTSxPQUFPLEVBQUU7Q0FDbkIsSUFBSSxNQUFNLE9BQU8sRUFBRTtDQUNuQixJQUFJLE9BQU8sT0FBTyxHQUFHO0NBQ3JCLFNBQVMsSUFBSSxHQUFHLEdBQUc7RUFDZixNQUFNLFNBQVMsSUFBSTtBQUNuQixTQUFPLFVBQVUsT0FBTyxTQUFTLElBQUk7Q0FDeEM7Q0FDRCxTQUFTLElBQUksS0FBSyxPQUFPLFFBQVE7QUFDN0IsTUFBSSxVQUFVLFFBQVEsUUFBUSxLQUMxQixPQUFNLElBQUksTUFBTTtBQUNwQixNQUFJLFdBQVcsS0FDWCxRQUFPO0VBQ1gsSUFBSSxNQUFNO0FBQ1YsU0FBTyxRQUFRLE1BQU07QUFDakIsT0FBSSxRQUFRLEtBQ1IsT0FBTSxNQUFNLE1BQU07QUFDdEIsU0FBTSxNQUFNLE1BQU07QUFDbEIsYUFBVTtFQUNiO0FBQ0QsU0FBTztDQUNWO0NBQ0QsU0FBUyxLQUFLLEdBQUcsT0FBTyxRQUFRO0VBQzVCLElBQUksTUFBTTtBQUNWLFNBQU8sVUFBVSxNQUFNO0FBQ25CLFVBQU87QUFDUCxVQUFPO0VBQ1Y7QUFDRCxTQUFPO0NBQ1Y7Q0FDRCxTQUFTLE9BQU8sUUFBUSxRQUFRO0FBQzVCLE1BQUksV0FBVyxRQUFRLFVBQVUsS0FDN0IsT0FBTSxJQUFJLE9BQU8sNENBQTRDLE9BQU8sT0FBTyxPQUFPO0VBRXRGLElBQUksSUFBSSxJQUFJLFFBQVEsT0FBTztFQUMzQixJQUFJLElBQUk7RUFDUixJQUFJLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUk7QUFDdEMsU0FBTyxNQUFNLE1BQU07R0FDZixNQUFNLElBQUksSUFBSTtHQUNkLE1BQU0sSUFBSSxJQUFJO0dBQ2QsTUFBTSxJQUFJLElBQUksSUFBSTtHQUNsQixNQUFNLElBQUksSUFBSSxJQUFJO0FBQ2xCLE9BQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSTtFQUMxQztFQUNELE1BQU0sTUFBTTtBQUNaLE1BQUksUUFBUSxLQUNSLE9BQU0sSUFBSSxNQUFNO0FBQ3BCLFNBQU8sSUFBSSxHQUFHLE9BQU87Q0FDeEI7Q0FDRCxTQUFTLGNBQWMsR0FBRztFQUN0QixNQUFNLGFBQWEsSUFBSSxRQUFRO0VBQy9CLElBQUksR0FBRyxHQUFHO0FBQ1YsT0FBSyxJQUFJLElBQUksTUFBTSxJQUFJLEdBQUcsSUFBSSxTQUFTLE1BQU0sS0FBSyxNQUFNO0FBRXhELE9BQUssSUFBSSxNQUFNLElBQUksS0FBSyxJQUFJLEdBQUcsV0FBVyxFQUFFLEtBQUssSUFBSSxNQUFNO0FBRTNELE1BQUksTUFBTSxHQUFHO0dBQ1QsTUFBTSxVQUFVLElBQUksUUFBUTtBQUM1QixVQUFPLFNBQVMsWUFBWSxLQUFLLEdBQUc7SUFDaEMsTUFBTSxPQUFPLElBQUksSUFBSSxHQUFHLE9BQU87QUFDL0IsU0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRSxFQUFFLENBQzFCLE9BQU0sSUFBSSxNQUFNO0FBQ3BCLFdBQU87R0FDVjtFQUNKO0VBQ0QsTUFBTSxVQUFVLElBQUksUUFBUTtBQUM1QixTQUFPLFNBQVMsWUFBWSxLQUFLLEdBQUc7QUFDaEMsT0FBSSxJQUFJLElBQUksR0FBRyxVQUFVLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUMxQyxPQUFNLElBQUksTUFBTTtHQUNwQixJQUFJLElBQUk7R0FDUixJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRSxFQUFFLEVBQUU7R0FDdkMsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLE9BQU87R0FDMUIsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7QUFDckIsV0FBUSxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtBQUN6QixRQUFJLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxDQUNwQixRQUFPLElBQUk7SUFDZixJQUFJLElBQUk7QUFDUixTQUFLLElBQUksS0FBSyxJQUFJLElBQUksRUFBRSxFQUFFLElBQUksR0FBRyxLQUFLO0FBQ2xDLFNBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQ3BCO0FBQ0osVUFBSyxJQUFJLElBQUksR0FBRztJQUNuQjtJQUNELE1BQU0sS0FBSyxJQUFJLElBQUksR0FBRyxRQUFRLE9BQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNoRCxRQUFJLElBQUksSUFBSSxHQUFHO0FBQ2YsUUFBSSxJQUFJLElBQUksR0FBRyxHQUFHO0FBQ2xCLFFBQUksSUFBSSxJQUFJLEdBQUcsRUFBRTtBQUNqQixRQUFJO0dBQ1A7QUFDRCxVQUFPO0VBQ1Y7Q0FDSjtDQUNELFNBQVMsT0FBTyxHQUFHO0FBQ2YsTUFBSSxJQUFJLFFBQVEsS0FBSztHQUNqQixNQUFNLFVBQVUsSUFBSSxRQUFRO0FBQzVCLFVBQU8sU0FBUyxVQUFVLEtBQUssR0FBRztJQUM5QixNQUFNLE9BQU8sSUFBSSxJQUFJLEdBQUcsT0FBTztBQUMvQixTQUFLLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FDMUIsT0FBTSxJQUFJLE1BQU07QUFDcEIsV0FBTztHQUNWO0VBQ0o7QUFDRCxNQUFJLElBQUksUUFBUSxLQUFLO0dBQ2pCLE1BQU0sTUFBTSxJQUFJLE9BQU87QUFDdkIsVUFBTyxTQUFTLFVBQVUsS0FBSyxHQUFHO0lBQzlCLE1BQU0sS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLO0lBQzNCLE1BQU0sSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHO0lBQ3pCLE1BQU0sS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFO0lBQ3hCLE1BQU0sSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7SUFDdkMsTUFBTSxPQUFPLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDO0FBQzdDLFNBQUssSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUMxQixPQUFNLElBQUksTUFBTTtBQUNwQixXQUFPO0dBQ1Y7RUFDSjtBQUNELE1BQUksSUFBSSxTQUFTLEtBQUssQ0FDckI7QUFDRCxTQUFPLGNBQWMsRUFBRTtDQUMxQjtDQUNELElBQUksZUFBZSxDQUFDLEtBQUssWUFBWSxJQUFJLEtBQUssT0FBTyxHQUFHLFVBQVU7Q0FDbEUsSUFBSSxlQUFlO0VBQ2Y7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtDQUNIO0NBQ0QsU0FBUyxjQUFjLE9BQU87RUFDMUIsTUFBTSxVQUFVO0dBQ1osT0FBTztHQUNQLE1BQU07R0FDTixPQUFPO0dBQ1AsTUFBTTtFQUNUO0VBQ0QsTUFBTSxPQUFPLGFBQWEsT0FBTyxDQUFDLEtBQUssUUFBUTtBQUMzQyxPQUFJLE9BQU87QUFDWCxVQUFPO0VBQ1YsR0FBRSxRQUFRO0FBQ1gsU0FBTyxlQUFlLE9BQU8sS0FBSztDQUNyQztDQUNELFNBQVMsTUFBTSxHQUFHLEtBQUssT0FBTztBQUMxQixNQUFJLFFBQVEsS0FDUixPQUFNLElBQUksTUFBTTtBQUNwQixNQUFJLFVBQVUsS0FDVixRQUFPLEVBQUU7QUFDYixNQUFJLFVBQVUsS0FDVixRQUFPO0VBQ1gsSUFBSSxJQUFJLEVBQUU7RUFDVixJQUFJLElBQUk7QUFDUixTQUFPLFFBQVEsTUFBTTtBQUNqQixPQUFJLFFBQVEsS0FDUixLQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUU7QUFDbkIsT0FBSSxFQUFFLElBQUksRUFBRTtBQUNaLGFBQVU7RUFDYjtBQUNELFNBQU87Q0FDVjtDQUNELFNBQVMsY0FBYyxHQUFHLE1BQU07RUFDNUIsTUFBTSxNQUFNLElBQUksTUFBTSxLQUFLO0VBQzNCLE1BQU0saUJBQWlCLEtBQUssT0FBTyxDQUFDLEtBQUssS0FBSyxNQUFNO0FBQ2hELE9BQUksRUFBRSxJQUFJLElBQUksQ0FDVixRQUFPO0FBQ1gsT0FBSSxLQUFLO0FBQ1QsVUFBTyxFQUFFLElBQUksS0FBSyxJQUFJO0VBQ3pCLEdBQUUsRUFBRSxJQUFJO0VBQ1QsTUFBTSxXQUFXLEVBQUUsSUFBSSxlQUFlO0FBQ3RDLE9BQUssWUFBWSxDQUFDLEtBQUssS0FBSyxNQUFNO0FBQzlCLE9BQUksRUFBRSxJQUFJLElBQUksQ0FDVixRQUFPO0FBQ1gsT0FBSSxLQUFLLEVBQUUsSUFBSSxLQUFLLElBQUksR0FBRztBQUMzQixVQUFPLEVBQUUsSUFBSSxLQUFLLElBQUk7RUFDekIsR0FBRSxTQUFTO0FBQ1osU0FBTztDQUNWO0NBQ0QsU0FBUyxRQUFRLEdBQUcsWUFBWTtFQUM1QixNQUFNLGNBQWMsb0JBQW9CLElBQUksYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDO0VBQ3ZFLE1BQU0sY0FBYyxLQUFLLEtBQUssY0FBYyxFQUFFO0FBQzlDLFNBQU87R0FBRSxZQUFZO0dBQWE7RUFBYTtDQUNsRDtDQUNELFNBQVMsTUFBTSxPQUFPLFFBQVEsUUFBUSxPQUFPLFFBQVEsQ0FBRSxHQUFFO0FBQ3JELE1BQUksU0FBUyxLQUNULE9BQU0sSUFBSSxPQUFPLGdDQUFnQyxNQUFNO0VBQzNELE1BQU0sRUFBRSxZQUFZLE1BQU0sYUFBYSxPQUFPLEdBQUcsUUFBUSxPQUFPLE9BQU87QUFDdkUsTUFBSSxRQUFRLEtBQ1IsT0FBTSxJQUFJLE1BQU07RUFDcEIsTUFBTSxRQUFRLE9BQU8sTUFBTTtFQUMzQixNQUFNLElBQUksT0FBTyxPQUFPO0dBQ3BCO0dBQ0E7R0FDQTtHQUNBLE1BQU0sUUFBUSxLQUFLO0dBQ25CLE1BQU07R0FDTixLQUFLO0dBQ0wsUUFBUSxDQUFDLFFBQVEsSUFBSSxLQUFLLE1BQU07R0FDaEMsU0FBUyxDQUFDLFFBQVE7QUFDZCxlQUFXLFFBQVEsU0FDZixPQUFNLElBQUksT0FBTyxxREFBcUQsSUFBSTtBQUM5RSxXQUFPLFFBQVEsT0FBTyxNQUFNO0dBQy9CO0dBQ0QsS0FBSyxDQUFDLFFBQVEsUUFBUTtHQUN0QixPQUFPLENBQUMsU0FBUyxNQUFNLFVBQVU7R0FDakMsS0FBSyxDQUFDLFFBQVEsS0FBSyxLQUFLLE1BQU07R0FDOUIsS0FBSyxDQUFDLEtBQUssUUFBUSxRQUFRO0dBQzNCLEtBQUssQ0FBQyxRQUFRLElBQUksTUFBTSxLQUFLLE1BQU07R0FDbkMsS0FBSyxDQUFDLEtBQUssUUFBUSxJQUFJLE1BQU0sS0FBSyxNQUFNO0dBQ3hDLEtBQUssQ0FBQyxLQUFLLFFBQVEsSUFBSSxNQUFNLEtBQUssTUFBTTtHQUN4QyxLQUFLLENBQUMsS0FBSyxRQUFRLElBQUksTUFBTSxLQUFLLE1BQU07R0FDeEMsS0FBSyxDQUFDLEtBQUssVUFBVSxNQUFNLEdBQUcsS0FBSyxNQUFNO0dBQ3pDLEtBQUssQ0FBQyxLQUFLLFFBQVEsSUFBSSxNQUFNLE9BQU8sS0FBSyxNQUFNLEVBQUUsTUFBTTtHQUV2RCxNQUFNLENBQUMsUUFBUSxNQUFNO0dBQ3JCLE1BQU0sQ0FBQyxLQUFLLFFBQVEsTUFBTTtHQUMxQixNQUFNLENBQUMsS0FBSyxRQUFRLE1BQU07R0FDMUIsTUFBTSxDQUFDLEtBQUssUUFBUSxNQUFNO0dBQzFCLEtBQUssQ0FBQyxRQUFRLE9BQU8sS0FBSyxNQUFNO0dBQ2hDLE1BQU0sTUFBTSxTQUFTLENBQUMsTUFBTSxNQUFNLEdBQUcsRUFBRTtHQUN2QyxhQUFhLENBQUMsUUFBUSxjQUFjLEdBQUcsSUFBSTtHQUczQyxNQUFNLENBQUMsR0FBRyxHQUFHLE1BQU0sSUFBSSxJQUFJO0dBQzNCLFNBQVMsQ0FBQyxRQUFRLFFBQVEsZ0JBQWdCLEtBQUssTUFBTSxHQUFHLGdCQUFnQixLQUFLLE1BQU07R0FDbkYsV0FBVyxDQUFDLFdBQVc7QUFDbkIsUUFBSSxPQUFPLFdBQVcsTUFDbEIsT0FBTSxJQUFJLE9BQU8seUJBQXlCLE1BQU0sUUFBUSxPQUFPLE9BQU87QUFDMUUsV0FBTyxRQUFRLGdCQUFnQixPQUFPLEdBQUcsZ0JBQWdCLE9BQU87R0FDbkU7RUFDSixFQUFDO0FBQ0YsU0FBTyxPQUFPLE9BQU8sRUFBRTtDQUMxQjtDQUNELFNBQVMsV0FBVyxLQUFLLEtBQUs7QUFDMUIsT0FBSyxJQUFJLE1BQ0wsT0FBTSxJQUFJLE9BQU87RUFDckIsTUFBTSxPQUFPLElBQUksS0FBSyxJQUFJO0FBQzFCLFNBQU8sSUFBSSxNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksS0FBSyxHQUFHO0NBQzVDO0NBRUQsSUFBSSxPQUFPLE9BQU8sRUFBRTtDQUNwQixJQUFJLE9BQU8sT0FBTyxFQUFFO0NBQ3BCLFNBQVMsS0FBSyxHQUFHLE1BQU07RUFDbkIsTUFBTSxrQkFBa0IsQ0FBQyxXQUFXLFNBQVM7R0FDekMsTUFBTSxNQUFNLEtBQUssUUFBUTtBQUN6QixVQUFPLFlBQVksTUFBTTtFQUM1QjtFQUNELE1BQU0sT0FBTyxDQUFDLE1BQU07R0FDaEIsTUFBTSxVQUFVLEtBQUssS0FBSyxPQUFPLEVBQUUsR0FBRztHQUN0QyxNQUFNLGFBQWEsTUFBTSxJQUFJO0FBQzdCLFVBQU87SUFBRTtJQUFTO0dBQVk7RUFDakM7QUFDRCxTQUFPO0dBQ0g7R0FFQSxhQUFhLEtBQUssR0FBRztJQUNqQixJQUFJLElBQUksRUFBRTtJQUNWLElBQUksSUFBSTtBQUNSLFdBQU8sSUFBSSxNQUFNO0FBQ2IsU0FBSSxJQUFJLEtBQ0osS0FBSSxFQUFFLElBQUksRUFBRTtBQUNoQixTQUFJLEVBQUUsUUFBUTtBQUNkLFdBQU07SUFDVDtBQUNELFdBQU87R0FDVjtHQVdELGlCQUFpQixLQUFLLEdBQUc7SUFDckIsTUFBTSxFQUFFLFNBQVMsWUFBWSxHQUFHLEtBQUssRUFBRTtJQUN2QyxNQUFNLFNBQVMsQ0FBRTtJQUNqQixJQUFJLElBQUk7SUFDUixJQUFJLE9BQU87QUFDWCxTQUFLLElBQUksU0FBUyxHQUFHLFNBQVMsU0FBUyxVQUFVO0FBQzdDLFlBQU87QUFDUCxZQUFPLEtBQUssS0FBSztBQUNqQixVQUFLLElBQUksSUFBSSxHQUFHLElBQUksWUFBWSxLQUFLO0FBQ2pDLGFBQU8sS0FBSyxJQUFJLEVBQUU7QUFDbEIsYUFBTyxLQUFLLEtBQUs7S0FDcEI7QUFDRCxTQUFJLEtBQUssUUFBUTtJQUNwQjtBQUNELFdBQU87R0FDVjtHQVFELEtBQUssR0FBRyxhQUFhLEdBQUc7SUFDcEIsTUFBTSxFQUFFLFNBQVMsWUFBWSxHQUFHLEtBQUssRUFBRTtJQUN2QyxJQUFJLElBQUksRUFBRTtJQUNWLElBQUksSUFBSSxFQUFFO0lBQ1YsTUFBTUMsU0FBTyxPQUFPLEtBQUssSUFBSSxFQUFFO0lBQy9CLE1BQU0sWUFBWSxLQUFLO0lBQ3ZCLE1BQU0sVUFBVSxPQUFPLEVBQUU7QUFDekIsU0FBSyxJQUFJLFNBQVMsR0FBRyxTQUFTLFNBQVMsVUFBVTtLQUM3QyxNQUFNLFNBQVMsU0FBUztLQUN4QixJQUFJLFFBQVEsT0FBTyxJQUFJQSxPQUFLO0FBQzVCLFdBQU07QUFDTixTQUFJLFFBQVEsWUFBWTtBQUNwQixlQUFTO0FBQ1QsV0FBSztLQUNSO0tBQ0QsTUFBTSxVQUFVO0tBQ2hCLE1BQU0sVUFBVSxTQUFTLEtBQUssSUFBSSxNQUFNLEdBQUc7S0FDM0MsTUFBTSxRQUFRLFNBQVMsTUFBTTtLQUM3QixNQUFNLFFBQVEsUUFBUTtBQUN0QixTQUFJLFVBQVUsRUFDVixLQUFJLEVBQUUsSUFBSSxnQkFBZ0IsT0FBTyxZQUFZLFNBQVMsQ0FBQztJQUd2RCxLQUFJLEVBQUUsSUFBSSxnQkFBZ0IsT0FBTyxZQUFZLFNBQVMsQ0FBQztJQUU5RDtBQUNELFdBQU87S0FBRTtLQUFHO0lBQUc7R0FDbEI7R0FDRCxXQUFXLEdBQUcsZ0JBQWdCLEdBQUcsV0FBVztJQUN4QyxNQUFNLElBQUksRUFBRSxnQkFBZ0I7SUFDNUIsSUFBSSxPQUFPLGVBQWUsSUFBSSxFQUFFO0FBQ2hDLFNBQUssTUFBTTtBQUNQLFlBQU8sS0FBSyxpQkFBaUIsR0FBRyxFQUFFO0FBQ2xDLFNBQUksTUFBTSxFQUNOLGdCQUFlLElBQUksR0FBRyxVQUFVLEtBQUssQ0FBQztJQUU3QztBQUNELFdBQU8sS0FBSyxLQUFLLEdBQUcsTUFBTSxFQUFFO0dBQy9CO0VBQ0o7Q0FDSjtDQUNELFNBQVMsY0FBYyxPQUFPO0FBQzFCLGdCQUFjLE1BQU0sR0FBRztBQUN2QixpQkFBZSxPQUFPO0dBQ2xCLEdBQUc7R0FDSCxHQUFHO0dBQ0gsSUFBSTtHQUNKLElBQUk7RUFDUCxHQUFFO0dBQ0MsWUFBWTtHQUNaLGFBQWE7RUFDaEIsRUFBQztBQUNGLFNBQU8sT0FBTyxPQUFPO0dBQ2pCLEdBQUcsUUFBUSxNQUFNLEdBQUcsTUFBTSxXQUFXO0dBQ3JDLEdBQUc7R0FDSCxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsTUFBTztFQUMzQixFQUFDO0NBQ0w7Q0FFRCxJQUFJLE9BQU8sT0FBTyxFQUFFO0NBQ3BCLElBQUksT0FBTyxPQUFPLEVBQUU7Q0FDcEIsSUFBSSxPQUFPLE9BQU8sRUFBRTtDQUNwQixJQUFJLE9BQU8sT0FBTyxFQUFFO0NBQ3BCLElBQUksaUJBQWlCLEVBQUUsUUFBUSxLQUFNO0NBQ3JDLFNBQVMsYUFBYSxPQUFPO0VBQ3pCLE1BQU0sT0FBTyxjQUFjLE1BQU07QUFDakMsaUJBQWUsT0FBTztHQUNsQixNQUFNO0dBQ04sR0FBRztHQUNILEdBQUc7R0FDSCxhQUFhO0VBQ2hCLEdBQUU7R0FDQyxtQkFBbUI7R0FDbkIsUUFBUTtHQUNSLFNBQVM7R0FDVCxZQUFZO0VBQ2YsRUFBQztBQUNGLFNBQU8sT0FBTyxPQUFPLEVBQUUsR0FBRyxLQUFNLEVBQUM7Q0FDcEM7Q0FDRCxTQUFTLGVBQWUsVUFBVTtFQUM5QixNQUFNLFFBQVEsYUFBYSxTQUFTO0VBQ3BDLE1BQU0sRUFBRSxJQUFJLEtBQUssR0FBRyxhQUFhLFNBQVMsTUFBTSxPQUFPLGFBQWEsY0FBYyxhQUFhLEdBQUcsVUFBVSxHQUFHO0VBQy9HLE1BQU0sT0FBTyxRQUFRLE9BQU8sY0FBYyxFQUFFLEdBQUc7RUFDL0MsTUFBTSxPQUFPLElBQUk7RUFDakIsTUFBTSxXQUFXLE1BQU0sWUFBWSxDQUFDLEdBQUcsTUFBTTtBQUN6QyxPQUFJO0FBQ0EsV0FBTztLQUFFLFNBQVM7S0FBTSxPQUFPLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7SUFBRTtHQUM1RCxTQUNNLEdBQUc7QUFDTixXQUFPO0tBQUUsU0FBUztLQUFPLE9BQU87SUFBTTtHQUN6QztFQUNKO0VBQ0QsTUFBTSxxQkFBcUIsTUFBTSxzQkFBc0IsQ0FBQyxXQUFXO0VBQ25FLE1BQU0sU0FBUyxNQUFNLFdBQVcsQ0FBQyxNQUFNLEtBQUssV0FBVztBQUNuRCxPQUFJLElBQUksVUFBVSxPQUNkLE9BQU0sSUFBSSxNQUFNO0FBQ3BCLFVBQU87RUFDVjtFQUNELE1BQU0sUUFBUSxDQUFDLGFBQWEsTUFBTSxZQUFZLE9BQU87RUFDckQsTUFBTSxVQUFVLENBQUMsR0FBRyxRQUFRLE1BQU0sRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUk7RUFDMUQsTUFBTSxlQUFlLENBQUMsTUFBTSxNQUFNLFFBQVEsUUFBUSxHQUFHLEtBQUs7RUFDMUQsU0FBUyxjQUFjLEdBQUcsS0FBSztBQUMzQixPQUFJLFFBQVEsR0FBRyxJQUFJLENBQ2YsUUFBTztBQUNYLFNBQU0sSUFBSSxPQUFPLDBCQUEwQixJQUFJLGVBQWUsRUFBRSxHQUFHLEVBQUU7RUFDeEU7RUFDRCxTQUFTLFVBQVUsR0FBRztBQUNsQixVQUFPLE1BQU0sT0FBTyxJQUFJLGNBQWMsR0FBRyxZQUFZO0VBQ3hEO0VBQ0QsTUFBTSxtQ0FBbUMsSUFBSTtFQUM3QyxTQUFTLFFBQVEsT0FBTztBQUNwQixTQUFNLGlCQUFpQixPQUNuQixPQUFNLElBQUksTUFBTTtFQUN2QjtFQUNELE1BQU0sTUFBTTtHQUNSLFlBQVksSUFBSSxJQUFJLElBQUksSUFBSTtBQUN4QixTQUFLLEtBQUs7QUFDVixTQUFLLEtBQUs7QUFDVixTQUFLLEtBQUs7QUFDVixTQUFLLEtBQUs7QUFDVixTQUFLLGFBQWEsR0FBRyxDQUNqQixPQUFNLElBQUksTUFBTTtBQUNwQixTQUFLLGFBQWEsR0FBRyxDQUNqQixPQUFNLElBQUksTUFBTTtBQUNwQixTQUFLLGFBQWEsR0FBRyxDQUNqQixPQUFNLElBQUksTUFBTTtBQUNwQixTQUFLLGFBQWEsR0FBRyxDQUNqQixPQUFNLElBQUksTUFBTTtHQUN2QjtHQUNELElBQUksSUFBSTtBQUNKLFdBQU8sS0FBSyxVQUFVLENBQUM7R0FDMUI7R0FDRCxJQUFJLElBQUk7QUFDSixXQUFPLEtBQUssVUFBVSxDQUFDO0dBQzFCO0dBQ0QsT0FBTyxXQUFXLEdBQUc7QUFDakIsUUFBSSxhQUFhLE1BQ2IsT0FBTSxJQUFJLE1BQU07SUFDcEIsTUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBRTtBQUN4QixTQUFLLGFBQWEsRUFBRSxLQUFLLGFBQWEsRUFBRSxDQUNwQyxPQUFNLElBQUksTUFBTTtBQUNwQixXQUFPLElBQUksTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLElBQUksRUFBRTtHQUMzQztHQUNELE9BQU8sV0FBVyxRQUFRO0lBQ3RCLE1BQU0sUUFBUSxJQUFJLFlBQVksT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztBQUN0RCxXQUFPLE9BQU8sSUFBSSxDQUFDLEdBQUcsTUFBTSxFQUFFLFNBQVMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sV0FBVztHQUMxRTtHQUVELGVBQWUsWUFBWTtBQUN2QixTQUFLLGVBQWU7QUFDcEIscUJBQWlCLE9BQU8sS0FBSztHQUNoQztHQUdELGlCQUFpQjtJQUNiLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRztBQUNqQixRQUFJLEtBQUssS0FBSyxDQUNWLE9BQU0sSUFBSSxNQUFNO0lBQ3BCLE1BQU0sRUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRztJQUN2QyxNQUFNLEtBQUssS0FBSyxJQUFJLEVBQUU7SUFDdEIsTUFBTSxLQUFLLEtBQUssSUFBSSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxLQUFLLElBQUksRUFBRTtJQUN0QixNQUFNLEtBQUssS0FBSyxLQUFLLEdBQUc7SUFDeEIsTUFBTSxNQUFNLEtBQUssS0FBSyxFQUFFO0lBQ3hCLE1BQU0sT0FBTyxLQUFLLEtBQUssS0FBSyxNQUFNLEdBQUcsQ0FBQztJQUN0QyxNQUFNLFFBQVEsS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDaEQsUUFBSSxTQUFTLE1BQ1QsT0FBTSxJQUFJLE1BQU07SUFDcEIsTUFBTSxLQUFLLEtBQUssSUFBSSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxLQUFLLElBQUksRUFBRTtBQUN0QixRQUFJLE9BQU8sR0FDUCxPQUFNLElBQUksTUFBTTtHQUN2QjtHQUVELE9BQU8sT0FBTztBQUNWLFlBQVEsTUFBTTtJQUNkLE1BQU0sRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHO0lBQ25DLE1BQU0sRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHO0lBQ25DLE1BQU0sT0FBTyxLQUFLLEtBQUssR0FBRztJQUMxQixNQUFNLE9BQU8sS0FBSyxLQUFLLEdBQUc7SUFDMUIsTUFBTSxPQUFPLEtBQUssS0FBSyxHQUFHO0lBQzFCLE1BQU0sT0FBTyxLQUFLLEtBQUssR0FBRztBQUMxQixXQUFPLFNBQVMsUUFBUSxTQUFTO0dBQ3BDO0dBQ0QsTUFBTTtBQUNGLFdBQU8sS0FBSyxPQUFPLE1BQU0sS0FBSztHQUNqQztHQUNELFNBQVM7QUFDTCxXQUFPLElBQUksTUFBTSxNQUFNLEtBQUssR0FBRyxFQUFFLEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxLQUFLLEdBQUc7R0FDcEU7R0FJRCxTQUFTO0lBQ0wsTUFBTSxFQUFFLEdBQUcsR0FBRztJQUNkLE1BQU0sRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHO0lBQ25DLE1BQU0sSUFBSSxLQUFLLEtBQUssR0FBRztJQUN2QixNQUFNLElBQUksS0FBSyxLQUFLLEdBQUc7SUFDdkIsTUFBTSxJQUFJLEtBQUssT0FBTyxLQUFLLEtBQUssR0FBRyxDQUFDO0lBQ3BDLE1BQU0sSUFBSSxLQUFLLElBQUksRUFBRTtJQUNyQixNQUFNLE9BQU8sS0FBSztJQUNsQixNQUFNLElBQUksS0FBSyxLQUFLLE9BQU8sS0FBSyxHQUFHLElBQUksRUFBRTtJQUN6QyxNQUFNLEtBQUssSUFBSTtJQUNmLE1BQU0sSUFBSSxLQUFLO0lBQ2YsTUFBTSxJQUFJLElBQUk7SUFDZCxNQUFNLEtBQUssS0FBSyxJQUFJLEVBQUU7SUFDdEIsTUFBTSxLQUFLLEtBQUssS0FBSyxFQUFFO0lBQ3ZCLE1BQU0sS0FBSyxLQUFLLElBQUksRUFBRTtJQUN0QixNQUFNLEtBQUssS0FBSyxJQUFJLEdBQUc7QUFDdkIsV0FBTyxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUk7R0FDaEM7R0FJRCxJQUFJLE9BQU87QUFDUCxZQUFRLE1BQU07SUFDZCxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUc7SUFDakIsTUFBTSxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHO0lBQzNDLE1BQU0sRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksR0FBRztBQUMzQyxRQUFJLE1BQU0sT0FBTyxHQUFHLEVBQUU7S0FDbEIsTUFBTSxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssSUFBSTtLQUN0QyxNQUFNLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxJQUFJO0tBQ3RDLE1BQU0sS0FBSyxLQUFLLEtBQUssR0FBRztBQUN4QixTQUFJLE9BQU8sS0FDUCxRQUFPLEtBQUssUUFBUTtLQUN4QixNQUFNLEtBQUssS0FBSyxLQUFLLE9BQU8sR0FBRztLQUMvQixNQUFNLEtBQUssS0FBSyxLQUFLLE9BQU8sR0FBRztLQUMvQixNQUFNLEtBQUssS0FBSztLQUNoQixNQUFNLEtBQUssS0FBSztLQUNoQixNQUFNLEtBQUssS0FBSztLQUNoQixNQUFNLE1BQU0sS0FBSyxLQUFLLEdBQUc7S0FDekIsTUFBTSxNQUFNLEtBQUssS0FBSyxHQUFHO0tBQ3pCLE1BQU0sTUFBTSxLQUFLLEtBQUssR0FBRztLQUN6QixNQUFNLE1BQU0sS0FBSyxLQUFLLEdBQUc7QUFDekIsWUFBTyxJQUFJLE1BQU0sS0FBSyxLQUFLLEtBQUs7SUFDbkM7SUFDRCxNQUFNLElBQUksS0FBSyxLQUFLLEdBQUc7SUFDdkIsTUFBTSxJQUFJLEtBQUssS0FBSyxHQUFHO0lBQ3ZCLE1BQU0sSUFBSSxLQUFLLEtBQUssSUFBSSxHQUFHO0lBQzNCLE1BQU0sSUFBSSxLQUFLLEtBQUssR0FBRztJQUN2QixNQUFNLElBQUksTUFBTSxLQUFLLE9BQU8sS0FBSyxNQUFNLElBQUksRUFBRTtJQUM3QyxNQUFNLElBQUksSUFBSTtJQUNkLE1BQU0sS0FBSyxJQUFJO0lBQ2YsTUFBTSxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7SUFDekIsTUFBTSxLQUFLLEtBQUssSUFBSSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxLQUFLLEtBQUssRUFBRTtJQUN2QixNQUFNLEtBQUssS0FBSyxJQUFJLEVBQUU7SUFDdEIsTUFBTSxLQUFLLEtBQUssSUFBSSxHQUFHO0FBQ3ZCLFdBQU8sSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJO0dBQ2hDO0dBQ0QsU0FBUyxPQUFPO0FBQ1osV0FBTyxLQUFLLElBQUksTUFBTSxRQUFRLENBQUM7R0FDbEM7R0FDRCxLQUFLLEdBQUc7QUFDSixXQUFPLEtBQUssV0FBVyxNQUFNLGtCQUFrQixHQUFHLE1BQU0sV0FBVztHQUN0RTtHQUVELFNBQVMsUUFBUTtJQUNiLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxLQUFLLEtBQUssY0FBYyxRQUFRLFlBQVksQ0FBQztBQUM5RCxXQUFPLE1BQU0sV0FBVyxDQUFDLEdBQUcsQ0FBRSxFQUFDLENBQUM7R0FDbkM7R0FLRCxlQUFlLFFBQVE7SUFDbkIsSUFBSSxJQUFJLFVBQVUsT0FBTztBQUN6QixRQUFJLE1BQU0sS0FDTixRQUFPO0FBQ1gsUUFBSSxLQUFLLE9BQU8sRUFBRSxJQUFJLE1BQU0sS0FDeEIsUUFBTztBQUNYLFFBQUksS0FBSyxPQUFPLEVBQUUsQ0FDZCxRQUFPLEtBQUssS0FBSyxFQUFFLENBQUM7QUFDeEIsV0FBTyxLQUFLLGFBQWEsTUFBTSxFQUFFO0dBQ3BDO0dBS0QsZUFBZTtBQUNYLFdBQU8sS0FBSyxlQUFlLFNBQVMsQ0FBQyxLQUFLO0dBQzdDO0dBR0QsZ0JBQWdCO0FBQ1osV0FBTyxLQUFLLGFBQWEsTUFBTSxZQUFZLENBQUMsS0FBSztHQUNwRDtHQUdELFNBQVMsSUFBSTtJQUNULE1BQU0sRUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHO0lBQ2hDLE1BQU0sTUFBTSxLQUFLLEtBQUs7QUFDdEIsUUFBSSxNQUFNLEtBQ04sTUFBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLEVBQUU7SUFDaEMsTUFBTSxLQUFLLEtBQUssSUFBSSxHQUFHO0lBQ3ZCLE1BQU0sS0FBSyxLQUFLLElBQUksR0FBRztJQUN2QixNQUFNLEtBQUssS0FBSyxJQUFJLEdBQUc7QUFDdkIsUUFBSSxJQUNBLFFBQU87S0FBRSxHQUFHO0tBQU0sR0FBRztJQUFNO0FBQy9CLFFBQUksT0FBTyxLQUNQLE9BQU0sSUFBSSxNQUFNO0FBQ3BCLFdBQU87S0FBRSxHQUFHO0tBQUksR0FBRztJQUFJO0dBQzFCO0dBQ0QsZ0JBQWdCO0lBQ1osTUFBTSxFQUFFLEdBQUcsV0FBVyxHQUFHO0FBQ3pCLFFBQUksY0FBYyxLQUNkLFFBQU87QUFDWCxXQUFPLEtBQUssZUFBZSxVQUFVO0dBQ3hDO0dBR0QsT0FBTyxRQUFRLEtBQUssU0FBUyxPQUFPO0lBQ2hDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRztJQUNqQixNQUFNLE1BQU0sSUFBSTtBQUNoQixVQUFNLFlBQVksWUFBWSxLQUFLLElBQUk7SUFDdkMsTUFBTSxTQUFTLElBQUksT0FBTztJQUMxQixNQUFNLFdBQVcsSUFBSSxNQUFNO0FBQzNCLFdBQU8sTUFBTSxLQUFLLFdBQVc7SUFDN0IsTUFBTSxJQUFJLGdCQUFnQixPQUFPO0FBQ2pDLFFBQUksTUFBTSxNQUFNLENBQ2YsV0FFTyxPQUNBLGVBQWMsR0FBRyxLQUFLO0lBRXRCLGVBQWMsR0FBRyxJQUFJLE1BQU07SUFFbkMsTUFBTSxLQUFLLEtBQUssSUFBSSxFQUFFO0lBQ3RCLE1BQU0sSUFBSSxLQUFLLEtBQUssS0FBSztJQUN6QixNQUFNLElBQUksS0FBSyxJQUFJLEtBQUssRUFBRTtJQUMxQixJQUFJLEVBQUUsU0FBUyxPQUFPLEdBQUcsR0FBRyxTQUFTLEdBQUcsRUFBRTtBQUMxQyxTQUFLLFFBQ0QsT0FBTSxJQUFJLE1BQU07SUFDcEIsTUFBTSxVQUFVLElBQUksVUFBVTtJQUM5QixNQUFNLGlCQUFpQixXQUFXLFNBQVM7QUFDM0MsU0FBSyxVQUFVLE1BQU0sUUFBUSxjQUN6QixPQUFNLElBQUksTUFBTTtBQUNwQixRQUFJLGtCQUFrQixPQUNsQixLQUFJLE1BQU0sRUFBRTtBQUNoQixXQUFPLE1BQU0sV0FBVztLQUFFO0tBQUc7SUFBRyxFQUFDO0dBQ3BDO0dBQ0QsT0FBTyxlQUFlLFNBQVM7QUFDM0IsV0FBTyxxQkFBcUIsUUFBUSxDQUFDO0dBQ3hDO0dBQ0QsYUFBYTtJQUNULE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxLQUFLLFVBQVU7SUFDaEMsTUFBTSxTQUFTLGdCQUFnQixHQUFHLElBQUksTUFBTTtBQUM1QyxXQUFPLE9BQU8sU0FBUyxNQUFNLElBQUksT0FBTyxNQUFNO0FBQzlDLFdBQU87R0FDVjtHQUNELFFBQVE7QUFDSixXQUFPLFdBQVcsS0FBSyxZQUFZLENBQUM7R0FDdkM7RUFDSjtBQUNELFFBQU0sT0FBTyxJQUFJLE1BQU0sTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sR0FBRztBQUMxRSxRQUFNLE9BQU8sSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNO0VBQ3pDLE1BQU0sRUFBRSxNQUFNLEdBQUcsTUFBTSxHQUFHLEdBQUc7RUFDN0IsTUFBTSxPQUFPLEtBQUssT0FBTyxjQUFjLEVBQUU7RUFDekMsU0FBUyxLQUFLLEdBQUc7QUFDYixVQUFPLElBQUksR0FBRyxZQUFZO0VBQzdCO0VBQ0QsU0FBUyxRQUFRLE1BQU07QUFDbkIsVUFBTyxLQUFLLGdCQUFnQixLQUFLLENBQUM7RUFDckM7RUFDRCxTQUFTLHFCQUFxQixLQUFLO0dBQy9CLE1BQU0sTUFBTTtBQUNaLFNBQU0sWUFBWSxlQUFlLEtBQUssSUFBSTtHQUMxQyxNQUFNLFNBQVMsWUFBWSxzQkFBc0IsTUFBTSxJQUFJLEVBQUUsSUFBSSxJQUFJO0dBQ3JFLE1BQU0sT0FBTyxtQkFBbUIsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDO0dBQ3JELE1BQU0sU0FBUyxPQUFPLE1BQU0sS0FBSyxJQUFJLElBQUk7R0FDekMsTUFBTSxTQUFTLFFBQVEsS0FBSztHQUM1QixNQUFNLFFBQVEsRUFBRSxTQUFTLE9BQU87R0FDaEMsTUFBTSxhQUFhLE1BQU0sWUFBWTtBQUNyQyxVQUFPO0lBQUU7SUFBTTtJQUFRO0lBQVE7SUFBTztHQUFZO0VBQ3JEO0VBQ0QsU0FBUyxhQUFhLFNBQVM7QUFDM0IsVUFBTyxxQkFBcUIsUUFBUSxDQUFDO0VBQ3hDO0VBQ0QsU0FBUyxtQkFBbUIsVUFBVSxJQUFJLGNBQWMsR0FBRyxNQUFNO0dBQzdELE1BQU0sTUFBTSxhQUFhLEdBQUcsS0FBSztBQUNqQyxVQUFPLFFBQVEsTUFBTSxPQUFPLEtBQUssWUFBWSxXQUFXLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQztFQUNqRjtFQUNELFNBQVMsS0FBSyxLQUFLLFNBQVMsVUFBVSxDQUFFLEdBQUU7QUFDdEMsU0FBTSxZQUFZLFdBQVcsSUFBSTtBQUNqQyxPQUFJLFFBQ0EsT0FBTSxRQUFRLElBQUk7R0FDdEIsTUFBTSxFQUFFLFFBQVEsUUFBUSxZQUFZLEdBQUcscUJBQXFCLFFBQVE7R0FDcEUsTUFBTSxJQUFJLG1CQUFtQixRQUFRLFNBQVMsUUFBUSxJQUFJO0dBQzFELE1BQU0sSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLFlBQVk7R0FDcEMsTUFBTSxJQUFJLG1CQUFtQixRQUFRLFNBQVMsR0FBRyxZQUFZLElBQUk7R0FDakUsTUFBTSxJQUFJLEtBQUssSUFBSSxJQUFJLE9BQU87QUFDOUIsYUFBVSxFQUFFO0dBQ1osTUFBTSxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQztBQUMxRCxVQUFPLFlBQVksVUFBVSxLQUFLLGNBQWMsRUFBRTtFQUNyRDtFQUNELE1BQU0sYUFBYTtFQUNuQixTQUFTLE9BQU8sS0FBSyxLQUFLLFdBQVcsVUFBVSxZQUFZO0dBQ3ZELE1BQU0sRUFBRSxTQUFTLFFBQVEsR0FBRztHQUM1QixNQUFNLE1BQU0sSUFBSTtBQUNoQixTQUFNLFlBQVksYUFBYSxLQUFLLElBQUksSUFBSTtBQUM1QyxTQUFNLFlBQVksV0FBVyxJQUFJO0FBQ2pDLE9BQUksUUFDQSxPQUFNLFFBQVEsSUFBSTtHQUN0QixNQUFNLElBQUksZ0JBQWdCLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDO0dBQ2xELElBQUksR0FBRyxHQUFHO0FBQ1YsT0FBSTtBQUNBLFFBQUksTUFBTSxRQUFRLFdBQVcsT0FBTztBQUNwQyxRQUFJLE1BQU0sUUFBUSxJQUFJLE1BQU0sR0FBRyxJQUFJLEVBQUUsT0FBTztBQUM1QyxTQUFLLEVBQUUsZUFBZSxFQUFFO0dBQzNCLFNBQ00sT0FBTztBQUNWLFdBQU87R0FDVjtBQUNELFFBQUssVUFBVSxFQUFFLGNBQWMsQ0FDM0IsUUFBTztHQUNYLE1BQU0sSUFBSSxtQkFBbUIsU0FBUyxFQUFFLFlBQVksRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJO0dBQzFFLE1BQU0sTUFBTSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsQ0FBQztBQUN0QyxVQUFPLElBQUksU0FBUyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sTUFBTSxLQUFLO0VBQzdEO0FBQ0QsSUFBRSxlQUFlLEVBQUU7RUFDbkIsTUFBTSxRQUFRO0dBQ1Y7R0FFQSxrQkFBa0IsTUFBTSxhQUFhLElBQUksTUFBTTtHQU8vQyxXQUFXLGFBQWEsR0FBRyxRQUFRLE1BQU0sTUFBTTtBQUMzQyxVQUFNLGVBQWUsV0FBVztBQUNoQyxVQUFNLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFDekIsV0FBTztHQUNWO0VBQ0o7QUFDRCxTQUFPO0dBQ0g7R0FDQTtHQUNBO0dBQ0E7R0FDQSxlQUFlO0dBQ2Y7RUFDSDtDQUNKO0NBRUQsSUFBSSxPQUFPLE9BQU8sRUFBRTtDQUNwQixJQUFJLE9BQU8sT0FBTyxFQUFFO0NBQ3BCLFNBQVMsY0FBYyxPQUFPO0FBQzFCLGlCQUFlLE9BQU8sRUFDbEIsR0FBRyxTQUNOLEdBQUU7R0FDQyxnQkFBZ0I7R0FDaEIsYUFBYTtHQUNiLG1CQUFtQjtHQUNuQixRQUFRO0dBQ1IsWUFBWTtHQUNaLElBQUk7RUFDUCxFQUFDO0FBQ0YsU0FBTyxPQUFPLE9BQU8sRUFBRSxHQUFHLE1BQU8sRUFBQztDQUNyQztDQUNELFNBQVMsV0FBVyxVQUFVO0VBQzFCLE1BQU0sUUFBUSxjQUFjLFNBQVM7RUFDckMsTUFBTSxFQUFFLEdBQUcsR0FBRztFQUNkLE1BQU0sT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUU7RUFDN0IsTUFBTSxpQkFBaUIsTUFBTTtFQUM3QixNQUFNLGtCQUFrQixLQUFLLEtBQUssaUJBQWlCLEVBQUU7RUFDckQsTUFBTSxXQUFXLE1BQU07RUFDdkIsTUFBTSxxQkFBcUIsTUFBTSxzQkFBc0IsQ0FBQyxXQUFXO0VBQ25FLE1BQU0sYUFBYSxNQUFNLGVBQWUsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sRUFBRSxFQUFFLEVBQUU7RUFDdkUsU0FBUyxNQUFNLE1BQU0sS0FBSyxLQUFLO0dBQzNCLE1BQU0sUUFBUSxLQUFLLFFBQVEsTUFBTSxLQUFLO0FBQ3RDLFNBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsU0FBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixVQUFPLENBQUMsS0FBSyxHQUFJO0VBQ3BCO0VBQ0QsU0FBUyxtQkFBbUIsR0FBRztBQUMzQixjQUFXLE1BQU0sWUFBWSxRQUFRLEtBQUssSUFBSSxFQUMxQyxRQUFPO0FBQ1gsU0FBTSxJQUFJLE1BQU07RUFDbkI7RUFDRCxNQUFNLE9BQU8sTUFBTSxJQUFJLE9BQU8sRUFBRSxJQUFJLE9BQU8sRUFBRTtFQUM3QyxTQUFTLGlCQUFpQixRQUFRLFFBQVE7R0FDdEMsTUFBTSxJQUFJLG1CQUFtQixPQUFPO0dBQ3BDLE1BQU0sSUFBSSxtQkFBbUIsT0FBTztHQUNwQyxNQUFNLE1BQU07R0FDWixJQUFJLE1BQU07R0FDVixJQUFJLE1BQU07R0FDVixJQUFJLE1BQU07R0FDVixJQUFJLE1BQU07R0FDVixJQUFJLE9BQU87R0FDWCxJQUFJO0FBQ0osUUFBSyxJQUFJQyxNQUFJLE9BQU8saUJBQWlCLEVBQUUsRUFBRUEsT0FBSyxNQUFNQSxPQUFLO0lBQ3JELE1BQU0sTUFBTSxLQUFLQSxNQUFJO0FBQ3JCLFlBQVE7QUFDUixTQUFLLE1BQU0sTUFBTSxLQUFLLElBQUk7QUFDMUIsVUFBTSxHQUFHO0FBQ1QsVUFBTSxHQUFHO0FBQ1QsU0FBSyxNQUFNLE1BQU0sS0FBSyxJQUFJO0FBQzFCLFVBQU0sR0FBRztBQUNULFVBQU0sR0FBRztBQUNULFdBQU87SUFDUCxNQUFNLElBQUksTUFBTTtJQUNoQixNQUFNLEtBQUssS0FBSyxJQUFJLEVBQUU7SUFDdEIsTUFBTSxJQUFJLE1BQU07SUFDaEIsTUFBTSxLQUFLLEtBQUssSUFBSSxFQUFFO0lBQ3RCLE1BQU0sSUFBSSxLQUFLO0lBQ2YsTUFBTSxJQUFJLE1BQU07SUFDaEIsTUFBTSxJQUFJLE1BQU07SUFDaEIsTUFBTSxLQUFLLEtBQUssSUFBSSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxLQUFLLElBQUksRUFBRTtJQUN0QixNQUFNLE9BQU8sS0FBSztJQUNsQixNQUFNLFFBQVEsS0FBSztBQUNuQixVQUFNLEtBQUssT0FBTyxLQUFLO0FBQ3ZCLFVBQU0sS0FBSyxNQUFNLEtBQUssUUFBUSxNQUFNLENBQUM7QUFDckMsVUFBTSxLQUFLLEtBQUssR0FBRztBQUNuQixVQUFNLEtBQUssS0FBSyxLQUFLLEtBQUssTUFBTSxFQUFFLEVBQUU7R0FDdkM7QUFDRCxRQUFLLE1BQU0sTUFBTSxLQUFLLElBQUk7QUFDMUIsU0FBTSxHQUFHO0FBQ1QsU0FBTSxHQUFHO0FBQ1QsUUFBSyxNQUFNLE1BQU0sS0FBSyxJQUFJO0FBQzFCLFNBQU0sR0FBRztBQUNULFNBQU0sR0FBRztHQUNULE1BQU0sS0FBSyxXQUFXLElBQUk7QUFDMUIsVUFBTyxLQUFLLE1BQU0sR0FBRztFQUN4QjtFQUNELFNBQVMsa0JBQWtCLEdBQUc7QUFDMUIsVUFBTyxnQkFBZ0IsS0FBSyxFQUFFLEVBQUUsZ0JBQWdCO0VBQ25EO0VBQ0QsU0FBUyxrQkFBa0IsTUFBTTtHQUM3QixNQUFNLElBQUksWUFBWSxnQkFBZ0IsTUFBTSxnQkFBZ0I7QUFDNUQsT0FBSSxhQUFhLEdBQ2IsR0FBRSxPQUFPO0FBQ2IsVUFBTyxnQkFBZ0IsRUFBRTtFQUM1QjtFQUNELFNBQVMsYUFBYSxHQUFHO0dBQ3JCLE1BQU0sU0FBUyxZQUFZLFVBQVUsRUFBRTtHQUN2QyxNQUFNLE1BQU0sT0FBTztBQUNuQixPQUFJLFFBQVEsbUJBQW1CLFFBQVEsU0FDbkMsT0FBTSxJQUFJLE9BQU8sV0FBVyxnQkFBZ0IsTUFBTSxTQUFTLGNBQWMsSUFBSTtBQUNqRixVQUFPLGdCQUFnQixtQkFBbUIsT0FBTyxDQUFDO0VBQ3JEO0VBQ0QsU0FBUyxXQUFXLFFBQVEsR0FBRztHQUMzQixNQUFNLFNBQVMsa0JBQWtCLEVBQUU7R0FDbkMsTUFBTSxVQUFVLGFBQWEsT0FBTztHQUNwQyxNQUFNLEtBQUssaUJBQWlCLFFBQVEsUUFBUTtBQUM1QyxPQUFJLE9BQU8sS0FDUCxPQUFNLElBQUksTUFBTTtBQUNwQixVQUFPLGtCQUFrQixHQUFHO0VBQy9CO0VBQ0QsTUFBTSxVQUFVLGtCQUFrQixNQUFNLEdBQUc7RUFDM0MsU0FBUyxlQUFlLFFBQVE7QUFDNUIsVUFBTyxXQUFXLFFBQVEsUUFBUTtFQUNyQztBQUNELFNBQU87R0FDSDtHQUNBO0dBQ0EsaUJBQWlCLENBQUMsWUFBWSxjQUFjLFdBQVcsWUFBWSxVQUFVO0dBQzdFLGNBQWMsQ0FBQyxlQUFlLGVBQWUsV0FBVztHQUN4RCxPQUFPLEVBQUUsa0JBQWtCLE1BQU0sTUFBTSxZQUFZLE1BQU0sWUFBWSxDQUFFO0dBQ3ZFO0VBQ0g7Q0FDSjtDQUVELElBQUksWUFBWSxPQUFPLGdGQUFnRjtDQUN2RyxJQUFJLGtCQUFrQixPQUFPLGdGQUFnRjtDQUM3RyxJQUFJLE9BQU8sT0FBTyxFQUFFO0NBQ3BCLElBQUksT0FBTyxPQUFPLEVBQUU7Q0FDcEIsSUFBSSxPQUFPLE9BQU8sRUFBRTtDQUNwQixJQUFJLE9BQU8sT0FBTyxFQUFFO0NBQ3BCLElBQUksT0FBTyxPQUFPLEdBQUc7Q0FDckIsSUFBSSxPQUFPLE9BQU8sR0FBRztDQUNyQixJQUFJLE9BQU8sT0FBTyxHQUFHO0NBQ3JCLElBQUksT0FBTyxPQUFPLEdBQUc7Q0FDckIsU0FBUyxvQkFBb0IsR0FBRztFQUM1QixNQUFNLElBQUk7RUFDVixNQUFNLEtBQUssSUFBSSxJQUFJO0VBQ25CLE1BQU0sS0FBSyxLQUFLLElBQUk7RUFDcEIsTUFBTSxLQUFLLEtBQUssSUFBSSxNQUFNLEVBQUUsR0FBRyxLQUFLO0VBQ3BDLE1BQU0sS0FBSyxLQUFLLElBQUksTUFBTSxFQUFFLEdBQUcsSUFBSTtFQUNuQyxNQUFNLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxHQUFHLEtBQUs7RUFDckMsTUFBTSxNQUFNLEtBQUssS0FBSyxNQUFNLEVBQUUsR0FBRyxNQUFNO0VBQ3ZDLE1BQU0sTUFBTSxLQUFLLEtBQUssTUFBTSxFQUFFLEdBQUcsTUFBTTtFQUN2QyxNQUFNLE1BQU0sS0FBSyxLQUFLLE1BQU0sRUFBRSxHQUFHLE1BQU07RUFDdkMsTUFBTSxPQUFPLEtBQUssS0FBSyxNQUFNLEVBQUUsR0FBRyxNQUFNO0VBQ3hDLE1BQU0sT0FBTyxLQUFLLE1BQU0sTUFBTSxFQUFFLEdBQUcsTUFBTTtFQUN6QyxNQUFNLE9BQU8sS0FBSyxNQUFNLE1BQU0sRUFBRSxHQUFHLE1BQU07RUFDekMsTUFBTSxZQUFZLEtBQUssTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQzVDLFNBQU87R0FBRTtHQUFXO0VBQUk7Q0FDM0I7Q0FDRCxTQUFTLGtCQUFrQixRQUFRO0FBQy9CLFNBQU8sTUFBTTtBQUNiLFNBQU8sT0FBTztBQUNkLFNBQU8sT0FBTztBQUNkLFNBQU87Q0FDVjtDQUNELFNBQVMsUUFBUSxHQUFHLEdBQUc7RUFDbkIsTUFBTSxJQUFJO0VBQ1YsTUFBTSxLQUFLLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRTtFQUM1QixNQUFNLEtBQUssSUFBSSxLQUFLLEtBQUssR0FBRyxFQUFFO0VBQzlCLE1BQU0sT0FBTyxvQkFBb0IsSUFBSSxHQUFHLENBQUM7RUFDekMsSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtFQUM3QixNQUFNLE1BQU0sSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFO0VBQzdCLE1BQU0sUUFBUTtFQUNkLE1BQU0sUUFBUSxJQUFJLElBQUksaUJBQWlCLEVBQUU7RUFDekMsTUFBTSxXQUFXLFFBQVE7RUFDekIsTUFBTSxXQUFXLFFBQVEsS0FBSyxHQUFHLEVBQUU7RUFDbkMsTUFBTSxTQUFTLFFBQVEsS0FBSyxJQUFJLGlCQUFpQixFQUFFO0FBQ25ELE1BQUksU0FDQSxLQUFJO0FBQ1IsTUFBSSxZQUFZLE9BQ1osS0FBSTtBQUNSLE1BQUksYUFBYSxHQUFHLEVBQUUsQ0FDbEIsS0FBSSxLQUFLLEdBQUcsRUFBRTtBQUNsQixTQUFPO0dBQUUsU0FBUyxZQUFZO0dBQVUsT0FBTztFQUFHO0NBQ3JEO0NBQ0QsSUFBSSxLQUFLLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSztDQUN2QyxJQUFJLGtCQUFrQjtFQUVsQixHQUFHLE9BQU8sR0FBRztFQUliLEdBQUcsT0FBTyxnRkFBZ0Y7RUFFMUY7RUFHQSxHQUFHLE9BQU8sK0VBQStFO0VBRXpGLEdBQUcsT0FBTyxFQUFFO0VBRVosSUFBSSxPQUFPLGdGQUFnRjtFQUMzRixJQUFJLE9BQU8sZ0ZBQWdGO0VBQzNGLE1BQU1GO0VBQ047RUFDQTtFQUlBO0NBQ0g7Q0FDRCxTQUFTLGVBQWUsTUFBTSxLQUFLLFFBQVE7QUFDdkMsTUFBSSxJQUFJLFNBQVMsSUFDYixPQUFNLElBQUksTUFBTTtBQUNwQixTQUFPLFlBQVksWUFBWSxtQ0FBbUMsRUFBRSxJQUFJLFdBQVcsQ0FBQyxTQUFTLElBQUksR0FBRyxJQUFJLE1BQU8sSUFBRyxLQUFLLEtBQUs7Q0FDL0g7Q0FDRCxJQUFJLDZCQUE2QixlQUFlO0VBQzVDLEdBQUc7RUFDSCxRQUFRO0NBQ1gsRUFBQztDQUNGLElBQUksNEJBQTRCLGVBQWU7RUFDM0MsR0FBRztFQUNILFFBQVE7RUFDUixTQUFTQTtDQUNaLEVBQUM7Q0FDRixJQUFJRCwyQkFBeUIsQ0FBQyxNQUFNLFdBQVc7RUFDM0MsR0FBRztFQUNILEdBQUcsT0FBTyxPQUFPO0VBQ2pCLGdCQUFnQjtFQUVoQixhQUFhO0VBQ2IsSUFBSSxPQUFPLEVBQUU7RUFDYixZQUFZLENBQUMsTUFBTTtHQUNmLE1BQU0sSUFBSTtHQUNWLE1BQU0sRUFBRSxXQUFXLElBQUksR0FBRyxvQkFBb0IsRUFBRTtBQUNoRCxVQUFPLElBQUksS0FBSyxXQUFXLE9BQU8sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLEVBQUU7RUFDcEQ7RUFDRDtFQUNBO0NBQ0gsRUFBQyxHQUFHO0NBQ0wsSUFBSSxXQUFXLEdBQUcsUUFBUSxPQUFPLEVBQUUsSUFBSSxPQUFPLEVBQUU7Q0FDaEQsSUFBSSxVQUFVLEdBQUcsSUFBSSxNQUFNLFFBQVE7Q0FDbkMsSUFBSSxVQUFVLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7Q0FDckMsSUFBSSxXQUFXLEdBQUcsUUFBUSxPQUFPLEVBQUUsSUFBSSxPQUFPLEVBQUU7Q0FDaEQsSUFBSSxTQUFTLE9BQU8sT0FBTztDQUMzQixJQUFJLGtCQUFrQixXQUFXLElBQUksR0FBRyxJQUFJLE9BQU8sT0FBTyxDQUFDLENBQUM7Q0FDNUQsSUFBSSxvQkFBb0IsT0FBTyxnRkFBZ0Y7Q0FDL0csSUFBSSxvQkFBb0IsT0FBTyxnRkFBZ0Y7Q0FDL0csSUFBSSxpQkFBaUIsT0FBTywrRUFBK0U7Q0FDM0csSUFBSSxpQkFBaUIsT0FBTyxnRkFBZ0Y7Q0FDNUcsSUFBSSxXQUFXLE9BQU8scUVBQXFFO0FBQzNGLFFBQU8sYUFBYSxjQUFjO0FBQ3JDLElBQUc7TUFPUyxTQUFTLFlBQVk7Ozs7QUN4a0RsQyxNQUFNLHVCQUF1QjtBQUl0QixTQUFTLHFCQUFxQjtDQUdqQyxNQUFNLGFBQWEsZ0JBQWdCLE9BQU8sbUJBQW1CLHFCQUFxQixDQUFDO0NBQ25GLE1BQU0sWUFBWSxnQkFBZ0IsV0FBVztBQUM3QyxRQUFPO0VBQ0g7RUFDQTtDQUNIO0FBQ0o7QUFRTSxTQUFTLGVBQWUsMEJBQTBCLHFCQUFxQiw0QkFBNEI7Q0FDdEcsTUFBTSx3QkFBd0IscUJBQXFCLHFCQUFxQiwyQkFBMkI7Q0FDbkcsTUFBTSxtQkFBbUIscUJBQXFCLDBCQUEwQiwyQkFBMkI7QUFDbkcsUUFBTztFQUFFO0VBQXVCO0NBQWtCO0FBQ3JEO0FBUU0sU0FBUyxlQUFlLHlCQUF5QixvQkFBb0IsNkJBQTZCO0NBQ3JHLE1BQU0sd0JBQXdCLHFCQUFxQiw2QkFBNkIsbUJBQW1CO0NBQ25HLE1BQU0sbUJBQW1CLHFCQUFxQiw2QkFBNkIsd0JBQXdCO0FBQ25HLFFBQU87RUFBRTtFQUF1QjtDQUFrQjtBQUNyRDs7OztBQUlELFNBQVMscUJBQXFCLGlCQUFpQixpQkFBaUI7Q0FDNUQsTUFBTSxlQUFlLE9BQU8sZ0JBQWdCLGlCQUFpQixnQkFBZ0I7QUFFN0UsS0FBSSxhQUFhLE1BQU0sQ0FBQyxRQUFRLFFBQVEsRUFBRSxDQUN0QyxPQUFNLElBQUksTUFBTTtBQUVwQixRQUFPO0FBQ1Y7QUFFRCxTQUFTLGdCQUFnQixZQUFZO0FBRWpDLFlBQVcsV0FBVyxTQUFTLEtBQU0sV0FBVyxXQUFXLFNBQVMsS0FBSyxNQUFjO0FBRXZGLFlBQVcsTUFBTTtBQUNqQixRQUFPO0FBQ1Y7QUFDRCxTQUFTLGdCQUFnQixZQUFZO0FBQ2pDLFFBQU8sT0FBTyxhQUFhLFdBQVc7QUFDekM7Ozs7QUM5REQsU0FBUyxTQUFTO0FBQ2QsTUFBSyw4QkFBOEI7QUFDbkMsTUFBSyxrQkFBa0I7QUFDdkIsTUFBSyxzQkFBc0I7QUFHM0IsTUFBSyxxQkFBcUI7QUFDMUIsTUFBSyxTQUFTO0VBQ1Y7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0NBQzNCO0FBQ0QsTUFBSyxTQUFTO0VBQ1Y7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VBQVk7RUFBWTtFQUFZO0VBQVk7RUFDaEQ7RUFBWTtFQUFZO0VBQVk7RUFBWTtFQUNoRDtFQUFZO0VBQVk7RUFBWTtFQUFZO0VBQ2hEO0VB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