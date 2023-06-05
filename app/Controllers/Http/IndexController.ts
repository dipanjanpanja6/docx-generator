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
//Pass your image loader
opts.getImage = function (tagValue, tagName) {
  //tagValue is 'examples/image.png'
  //tagName is 'image'
  // return fs.readFileSync(tagValue);
  return base64DataURLToArrayBuffer(tagValue);
};

//Pass the function that return image size
opts.getSize = function (img, tagValue, tagName) {
  //img is the image returned by opts.getImage()
  //tagValue is 'examples/image.png'
  //tagName is 'image'
  //tip: you can use node module 'image-size' here
  return [150, 150];
};

export default class IndexController {
  private async load_images(
    case_cif_form_id: number,
    case_form_input_id: number,
    token: string
  ) {
    const fetch_url = `${Env.get(
      "API_HOST"
    )}/api/case_cif_forms/${case_cif_form_id}/case_form_inputs/${case_form_input_id}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    var { data } = await axios.get(fetch_url, { headers });
    return data;
  }

  // public async indexq({ response, request }: HttpContextContract) {
  //   const case_cif_form_id = request.param("id");
  //   // const { case_form_input_id, token, agent_id } = await request.validate({
  //   //   schema: schema.create({
  //   //     case_form_input_id: schema.number(),
  //   //     token: schema.string(),
  //   //     agent_id: schema.number(),
  //   //   }),
  //   // });

  //   const resultFile = Application.publicPath(`uploads/result.docx`);
  //   const templateFile = Application.publicPath("uploads/template_1.docx");
  //   // const case_cif_form = await Database.query()
  //   //   .from("case_cif_forms")
  //   //   .where({ id: case_cif_form_id })
  //   //   .firstOrFail();

  //   // const case_form_input = await Database.query()
  //   //   .from("case_form_inputs")
  //   //   .where("case_cif_form_id", "=", case_cif_form.id)
  //   //   .where("submitted_by", "=", agent_id)
  //   //   .firstOrFail();

  //   // const cif_form_template = await Database.query()
  //   //   .from("cif_form_templates")
  //   //   .where("case_cif_form_id", "=", case_cif_form.id)
  //   //   .firstOrFail();

  //   // const cif_form_field_templates = await Database.query()
  //   //   .from("cif_form_field_templates")
  //   //   .where("cif_form_template_id", "=", cif_form_template.id);

  //   // var images = await this.load_images(
  //   //   case_cif_form_id,
  //   //   case_form_input_id,
  //   //   token
  //   // );

  //   // let cif_inputs: any[] = [];
  //   // cif_form_field_templates.map((t) => {
  //   //   if (t.field_type === 7 && t.field_meta && t.field_meta.select_inputs) {
  //   //     var obj = t.field_meta.select_inputs.find(
  //   //       (ip: any) => ip.value == case_form_input.data[t.field_code]
  //   //     );
  //   //     cif_inputs.push({ label: `${t.field_label}`, value: obj.label });
  //   //   } else {
  //   //     cif_inputs.push({
  //   //       label: `${t.field_label}`,
  //   //       value: case_form_input.data[t.field_code],
  //   //     });
  //   //   }
  //   // });

  //   var data = {
  //     // cif_inputs,
  //     // insured_photos: images?.data?.insured_photos?.map((img: any) => img.url),
  //     insured_photos: [
  //       {
  //         value: `{{insert_image img1 png 400 400}}`,
  //       },
  //       {
  //         value: `{{insert_image img2 jpg 300 400}}`,
  //       },
  //     ],
  //     // id_proofs: images?.data?.id_proofs?.map((img: any) => img.url),
  //     // house_photos: images?.data?.house_photos?.map((img: any) => img.url),
  //     // fe_selfies: images?.data?.fe_selfies?.map((img: any) => img.url),
  //     // landmark_photos: images?.data?.landmark_photos?.map(
  //     //   (img: any) => img.url
  //     // ),
  //     // evidence_photos: images?.data?.evidence_photos?.map(
  //     //   (img: any) => img.url
  //     // ),
  //     // signature: images?.data?.signature.url,
  //   };
  //   // console.log(data);

  //   var options = {
  //     // if you want to convert this doc to pdf you have to install external packages, see carbon doc
  //     //   convertTo: "pdf",
  //   };
  //   // update text placeholder
  //   await new Promise((resolve, reject) => {
  //     carbone.render(templateFile, data, options, function (err, result) {
  //       if (err) {
  //         reject(err);
  //         return console.log(err);
  //       }
  //       // write the result
  //       fs.writeFileSync(resultFile, result);
  //       resolve(result);
  //     });
  //   });

  //   // lets update image placeholder
  //   let docxImager = new DocxImager();
  //   await docxImager.load(resultFile);

  //   await docxImager.insertImage({
  //     img1: "https://w7.pngwing.com/pngs/895/199/png-transparent-spider-man-heroes-download-with-transparent-background-free.png",
  //     img2: "https://onlinejpgtools.com/images/examples-onlinejpgtools/sunflower-0quality.jpg",
  //   });
  //   await docxImager.save(resultFile);

  //   // response.header(
  //   //   "Content-Type",
  //   //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //   // );
  //   response.attachment(resultFile);
  //   // you can also access this file from http://localhost:3333/uploads/uploads/result.docx
  // }
  public async index({ response }: HttpContextContract) {
    const resultFile = Application.publicPath(`uploads/result.docx`);
    const templateFile = Application.publicPath("uploads/image_docx.docx");

    const content = fs.readFileSync(templateFile, "binary");

    const zip = new PizZip(content);

    var imageModule = new ImageModule(opts);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });

    // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
    doc.setData({
      images: [
        {
          src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==",
        },
        {
          src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5AcDDQ8FHr772QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAo0lEQVQY02P8++/vfwYiABMDkYAFmeNfocXw6t5XBgYGBgYxJW6GjR3X4HKMMKv9K7QY3jz6hmKKqAI3w4a2q6gmvnn4lYGNi4WBhY2JgYWNiYGVgxm71aKKPAxsnMwMzFCFbJxMDEzMjJgK9T0kGV4/+MLAysHMwMLGyMDKycIgyi+B6UYGBgaGGecyGN58e8LAxsTBIM6jxBCv14VdIVXCEQAMjCktnpOJWwAAAABJRU5ErkJggg==",
        },
      ],
      first_name: "Hipp",
      last_name: "Edgar",
      phone: "0652455478",
      description: "New Website",
    });

    doc.render();

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      // compression: DEFLATE adds a compression step.
      // For a 50MB output document, expect 500ms additional CPU time
      compression: "DEFLATE",
    });

    fs.writeFileSync(resultFile, buffer);
    return "ok";
  }
}
