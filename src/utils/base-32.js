const encodeAsBase32 = (buf) => {
  var ALPHABET = "ybndrfg8ejkmcpqxot1uwisza345h769".split("")
  const max = buf.byteLength * 8
  let s = ""
  for (let p = 0; p < max; p += 5) {
    const i = p >> 3
    const j = p & 7
    if (j <= 3) {
      s += ALPHABET[(buf[i] >> (3 - j)) & 31]
      continue
    }
    const of = j - 3
    const h = (buf[i] << of) & 31
    const l = (i >= buf.length ? 0 : buf[i + 1]) >> (8 - of)
    s += ALPHABET[h | l]
  }
  return s
}

const decodeFromBase32 = (string) => {
  var base32tohex = (function () {
    var dec2hex = function (s) {
        return (s < 15.5 ? "0" : "") + Math.round(s).toString(16)
      },
      hex2dec = function (s) {
        return parseInt(s, 16)
      },
      base32tohex = function (base32) {
        for (
          var base32chars = "ybndrfg8ejkmcpqxot1uwisza345h769".toUpperCase(),
            bits = "",
            hex = "",
            i = 0;
          i < base32.length;
          i++
        ) {
          var val = base32chars.indexOf(base32.charAt(i).toUpperCase())
          bits += leftpad(val.toString(2), 5, "0")
        }
        for (i = 0; i + 4 <= bits.length; i += 4) {
          var chunk = bits.substr(i, 4)
          hex += parseInt(chunk, 2).toString(16)
        }
        return hex
      },
      leftpad = function (str, len, pad) {
        return len + 1 >= str.length && (str = new Array(len + 1 - str.length).join(pad) + str), str
      }
    return base32tohex
  })()
  var hex = base32tohex(string)
  var arr = Buffer.from(hex, "hex")
  return arr
}

module.exports = {
  encodeAsBase32,
  decodeFromBase32,
}
