import Application from "@ioc:Adonis/Core/Application";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import fs from "fs";
import { schema } from "@ioc:Adonis/Core/Validator";
import axios from "axios";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import ImageModule from "docxtemplater-image-module-free";
import opts, { networkToBuffer } from "App/Services/DocxImager";
import ResolveImage, { getTemplate } from "App/Services/RailsImage";

export default class IndexController {
  public async index({ response, request }: HttpContextContract) {
    const case_cif_form_id = request.param("id");
    const { case_form_input_id, token, agent_id, template } =
      await request.validate({
        schema: schema.create({
          case_form_input_id: schema.number(),
          token: schema.string(),
          agent_id: schema.number(),
          // template: schema.file(),
          template: schema.string(),
        }),
      });
    // const resultFile = Application.publicPath(`uploads/result.docx`);
    // const templateFile = Application.publicPath("uploads/image_docx_1.docx");
    const content = await networkToBuffer(template);

    // const content = fs.readFileSync(template.tmpPath!, "binary");
    const zip = new PizZip(content);
    const imageModule = new ImageModule(opts);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });

    // const data = await ResolveImage(
    //   case_cif_form_id,
    //   case_form_input_id,
    //   token,
    //   agent_id
    // );

    // await doc.resolveData({
    //   first_name: "ok",
    //   last_name: "ok2",
    //   description: "se",
    //   phone: "34",
    //   images: [
    //     {
    //       src: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
    //     },
    //     {
    //       src: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
    //     },
    //     {
    //       src: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
    //     },
    //   ],
    // });
    await doc.resolveData({
      cif_inputs: [{ label: "qed", value: "ed" }],
      insured_photos: [
        {
          url: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
        },
      ],
      id_proofs: [
        {
          url: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
        },
        {
          url: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
          // url: "https://crm.foxivision.net/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBb000IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--baffae70af7cf379f440f4531c22a6c90d7f5655/insured_photos",
        },
      ],
    });

    doc.render();

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // fs.writeFileSync(resultFile, buffer);
    // response.attachment(resultFile);
    response.header(
      "content-type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    return response.send(buffer);
  }
}
