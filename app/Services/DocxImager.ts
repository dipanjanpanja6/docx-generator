import axios from "axios";
import https from "https";
import { Transform } from "stream";

var opts: any = {};
opts.centered = false; //Set to true to always center images
opts.fileType = "docx"; //Or pptx

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

export async function networkToBuffer(url) {
  try {
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    // console.log("url", url);

    // const res = await axios.get(url, {
    //   responseType: "text",
    //   responseEncoding: "base64",
    // });

    // const base64 = Buffer.from(res.data, "base64");
    console.log(data);

    return data;
  } catch (error) {
    console.log("error");
    console.log(error);
    return null;
  }
}

//Pass your image loader
opts.getImage = async function (tagValue, tagName) {
  //tagValue is 'examples/image.png'
  //tagName is 'image'
  // return fs.readFileSync(tagValue);
  // return base64DataURLToArrayBuffer(tagValue);
  return networkToBuffer(tagValue);
  // return tagValue;
  console.log(tagValue, tagName);
  // tagValue is "https://docxtemplater.com/xt-pro-white.png" and tagName is "image"
  // return new Promise(function (resolve, reject) {
  //   getHttpData(tagValue, function (err, data) {
  //     if (err) {
  //       return reject(err);
  //     }
  //     resolve(data);
  //   });
  // });
};

opts.getSize = function (img, tagValue, tagName) {
  console.log("getSize=>", tagValue, tagName);
  // img is the value that was returned by getImage
  // This is to force the width to 600px, but keep the same aspect ratio
  const sizeOf = require("image-size");
  const sizeObj = sizeOf(img);
  // console.log(sizeObj);
  const forceWidth = 600;
  const ratio = forceWidth / sizeObj.width;

  return [
    forceWidth,
    // calculate height taking into account aspect ratio
    Math.round(sizeObj.height * ratio),
  ];
};

function getHttpData(url, callback) {
  https
    .request(url, function (response) {
      if (response.statusCode !== 200) {
        return callback(
          new Error(
            `Request to ${url} failed, status code: ${response.statusCode}`
          )
        );
      }

      const data = new Transform();
      response.on("data", function (chunk) {
        data.push(chunk);
      });
      response.on("end", function () {
        callback(null, data.read());
      });
      response.on("error", function (e) {
        console.log(e);

        callback(e);
      });
    })
    .end();
}

export default opts;
