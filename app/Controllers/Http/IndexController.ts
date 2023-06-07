import Application from "@ioc:Adonis/Core/Application";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import fs from "fs";
import { schema } from "@ioc:Adonis/Core/Validator";
import axios from "axios";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import ImageModule from "docxtemplater-image-module-free";
import opts from "App/Services/DocxImager";
import ResolveImage from "App/Services/RailsImage";

export default class IndexController {
  public async index({ response, request }: HttpContextContract) {
    const resultFile = Application.publicPath(`uploads/result.docx`);
    const templateFile = Application.publicPath("uploads/image_docx.docx");
    const content = fs.readFileSync(templateFile, "binary");
    const zip = new PizZip(content);
    const imageModule = new ImageModule(opts);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });
    // const case_cif_form_id = request.param("id");
    // const { case_form_input_id, token, agent_id } = await request.validate({
    //   schema: schema.create({
    //     case_form_input_id: schema.number(),
    //     token: schema.string(),
    //     agent_id: schema.number(),
    //   }),
    // });

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
      first_name: "ok",
      last_name: "ok2",
      description: "se",
      phone: "34",
      images: [
        {
          src: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
        },
        {
          src: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
        },
        {
          src: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
        },
      ],
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
