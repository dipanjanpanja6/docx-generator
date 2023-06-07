import Application from "@ioc:Adonis/Core/Application";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import fs from "fs";
import { schema } from "@ioc:Adonis/Core/Validator";
import axios from "axios";
import Env from "@ioc:Adonis/Core/Env";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import ImageModule from "docxtemplater-image-module-free";

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

async function networkToBuffer(url) {
  try {
    const { data } = await axios.get(url, {responseType: "arraybuffer"});
    // console.log("url", url);

    // const res = await axios.get(url, {
    //   responseType: "text",
    //   responseEncoding: "base64",
    // });

    // const base64 = Buffer.from(res.data, "base64");

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
  // return await networkToBuffer(tagValue);
  return tagValue;
};

//Pass the function that return image size
// opts.getSize = function (img, tagValue, tagName) {
//   //img is the image returned by opts.getImage()
//   //tagValue is 'examples/image.png'
//   //tagName is 'image'
//   //tip: you can use node module 'image-size' here
//   return [150, 150];
// };

opts.getSize = function (img, tagValue, tagName) {
  console.log(tagValue, tagName);
  // img is the value that was returned by getImage
  // This is to force the width to 600px, but keep the same aspect ratio
  const sizeOf = require("image-size");
  const sizeObj = sizeOf(img);
  // console.log(sizeObj);
  const forceWidth = 600;
  const ratio = forceWidth / sizeObj.width;
  console.log([
    forceWidth,
    Math.round(sizeObj.height * ratio),
]);
  
  return [
      forceWidth,
      // calculate height taking into account aspect ratio
      Math.round(sizeObj.height * ratio),
  ];
}






export default class IndexController {
  private async load_images(
    case_cif_form_id: number,
    case_form_input_id: number,
    token: string
  ) {
    try {
      const fetch_url = `${Env.get(
        "API_HOST"
      )}/api/case_cif_forms/${case_cif_form_id}/case_form_inputs/${case_form_input_id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      var { data } = await axios.get(fetch_url, { headers });
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  public async index({ response, request }: HttpContextContract) {
    const resultFile = Application.publicPath(`uploads/result.docx`);
    const templateFile = Application.publicPath("uploads/image_docx_1.docx");

    const content = fs.readFileSync(templateFile, "binary");

    const zip = new PizZip(content);

    var imageModule = new ImageModule(opts);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });

    const case_cif_form_id = request.param("id");
    const { case_form_input_id, token, agent_id } = await request.validate({
      schema: schema.create({
        case_form_input_id: schema.number(),
        token: schema.string(),
        agent_id: schema.number(),
      }),
    });

    // console.log(case_cif_form_id);

    const case_cif_form = await Database.query()
      .from("case_cif_forms")
      .where({ id: case_cif_form_id })
      .firstOrFail();

    const case_form_input = await Database.query()
      .from("case_form_inputs")
      .where("case_cif_form_id", "=", case_cif_form.id)
      .where("submitted_by", "=", agent_id)
      .firstOrFail();

    const cif_form_template = await Database.query()
      .from("cif_form_templates")
      .where("case_cif_form_id", "=", case_cif_form.id)
      .firstOrFail();

    const cif_form_field_templates = await Database.query()
      .from("cif_form_field_templates")
      .where("cif_form_template_id", "=", cif_form_template.id);

    // console.log(case_cif_form_id, case_form_input_id, token);

    var images = await this.load_images(
      case_cif_form_id,
      case_form_input_id,
      token
    );

    // return;

    let cif_inputs: any[] = [];
    cif_form_field_templates.map((t) => {
      if (t.field_type === 7 && t.field_meta && t.field_meta.select_inputs) {
        var obj = t.field_meta.select_inputs.find(
          (ip: any) => ip.value == case_form_input.data[t.field_code]
        );
        console.log(t.field_meta.select_inputs);
        console.log(case_form_input.data);
        console.log(t.field_code);

        cif_inputs.push({ label: `${t.field_label}`, value: obj.label });
      } else {
        cif_inputs.push({
          label: `${t.field_label}`,
          value: case_form_input.data[t.field_code],
        });
      }
    });

    var insured_photos: any[] = [];
    for (const p of images?.data?.insured_photos) {
      insured_photos.push({ url: await networkToBuffer(p.url) });
    }

    // console.log(insured_photos);

    var id_proofs: any[] = [];
    for (const p of images?.data?.id_proofs) {
      id_proofs.push({ url: await networkToBuffer(p.url) });
    }

    // console.log(cif_inputs, insured_photos, id_proofs);

    doc.setData({
      cif_inputs,
      insured_photos,
      id_proofs,
    });

    doc.render();

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    fs.writeFileSync(resultFile, buffer);
    response.attachment(resultFile);

    return "ok";
  }
}
