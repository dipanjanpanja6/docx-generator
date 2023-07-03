import axios from "axios";

var opts: any = {};
opts.centered = false; //Set to true to always center images
opts.fileType = "docx"; //Or pptx

export async function networkToBuffer(url: string) {
  try {
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    return data;
  } catch (error) {
    console.log("networkToBuffer => ", error);
    return null;
  }
}

//Pass your image loader
opts.getImage = async function (tagValue: string, _tagName: string) {
  //tagValue is 'examples/image.png'
  //tagName is 'image'
  // return fs.readFileSync(tagValue);
  // return base64DataURLToArrayBuffer(tagValue);
  return networkToBuffer(tagValue);
};

opts.getSize = function (img, tagValue, tagName) {
  console.log("getSize=>", tagValue, tagName);
  // img is the value that was returned by getImage
  // This is to force the width to 600px, but keep the same aspect ratio
  const sizeOf = require("image-size");
  const sizeObj = sizeOf(img);
  // console.log(sizeObj);
  const forceHeight = 800;
  const ratio = forceHeight / sizeObj.height;

  return [
    Math.round(sizeObj.width * ratio),
    forceHeight,
    // calculate height taking into account aspect ratio
  ];
};

//@ts-ignore
function base64DataURLToArrayBuffer(dataURL) {
  const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
  if (!base64Regex.test(dataURL)) {
    return false;
  }
  const stringBase64 = dataURL.replace(base64Regex, "");
  let binaryString;
  // if (typeof window !== "undefined") {
  //   binaryString = window.atob(stringBase64);
  // } else {
  binaryString = new Buffer(stringBase64, "base64").toString("binary");
  // }
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
}

export default opts;
