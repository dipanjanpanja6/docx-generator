import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import ImageModule from "docxtemplater-image-module-free";
import opts, { networkToBuffer } from "App/Services/DocxImager";
import ResolveImage from "App/Services/RailsImage";

export default class IndexController {
  public async index({ response, request }: HttpContextContract) {
    const case_cif_form_id = request.param("id");
    const { case_form_input_id, agent_id, template_url } =
      await request.validate({
        schema: schema.create({
          case_form_input_id: schema.number(),
          agent_id: schema.number(),
          template_url: schema.string(),
        }),
      });

    const content = await networkToBuffer(template_url);

    const zip = new PizZip(content);
    const imageModule = new ImageModule(opts);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });

    const data = await ResolveImage(
      case_cif_form_id,
      case_form_input_id,
      agent_id
    );

    await doc.resolveData(data);

    doc.render();

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    response.header(
      "content-type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    return response.send(buffer);
  }
}
