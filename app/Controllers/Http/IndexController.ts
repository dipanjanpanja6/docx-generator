import Application from "@ioc:Adonis/Core/Application";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import carbone from "carbone";
import { DocxImager } from "docximager";
import fs from "fs";
import { schema } from "@ioc:Adonis/Core/Validator";
import axios from "axios";
import Env from "@ioc:Adonis/Core/Env";

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

  public async index({ response, request }: HttpContextContract) {
    const case_cif_form_id = request.param("id");
    const { case_form_input_id, token, agent_id } = await request.validate({
      schema: schema.create({
        case_form_input_id: schema.number(),
        token: schema.string(),
        agent_id: schema.number(),
      }),
    });

    const resultFile = Application.publicPath(
      `uploads/result-${case_cif_form_id}.docx`
    );
    const templateFile = Application.publicPath(
      "uploads/Foxivision Template (3) (5).docx"
    );
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

    var images = await this.load_images(
      case_cif_form_id,
      case_form_input_id,
      token
    );

    let cif_inputs: any[] = [];
    cif_form_field_templates.map((t) => {
      if (t.field_type === 7 && t.field_meta && t.field_meta.select_inputs) {
        var obj = t.field_meta.select_inputs.find(
          (ip: any) => ip.value == case_form_input.data[t.field_code]
        );
        cif_inputs.push({ label: `${t.field_label}`, value: obj.label });
      } else {
        cif_inputs.push({
          label: `${t.field_label}`,
          value: case_form_input.data[t.field_code],
        });
      }
    });

    var data = {
      // cif_inputs,
      // insured_photos: images?.data?.insured_photos?.map((img: any) => img.url),
      insured_photos: images?.data?.insured_photos?.map(
        (img: any, i: number) => ({
          value: `{{insert_image img${i + 1} jpg 300 400}}`,
        })
      ),
      id_proofs: images?.data?.id_proofs?.map((img: any) => img.url),
      house_photos: images?.data?.house_photos?.map((img: any) => img.url),
      fe_selfies: images?.data?.fe_selfies?.map((img: any) => img.url),
      landmark_photos: images?.data?.landmark_photos?.map(
        (img: any) => img.url
      ),
      evidence_photos: images?.data?.evidence_photos?.map(
        (img: any) => img.url
      ),
      signature: images?.data?.signature.url,
    };
    // console.log(data);

    var options = {
      // if you want to convert this doc to pdf you have to install external packages, see carbon doc
      //   convertTo: "pdf",
    };
    // update text placeholder
    await new Promise((resolve, reject) => {
      carbone.render(templateFile, data, options, function (err, result) {
        if (err) {
          reject(err);
          return console.log(err);
        }
        // write the result
        fs.writeFileSync(resultFile, result);
        resolve(result);
      });
    });

    // lets update image placeholder
    let docxImager = new DocxImager();
    await docxImager.load(resultFile);
    for (const [i, img] of images?.data?.insured_photos.entries()) {
      const payload={ [`img${i + 1}`]: img.url }
      console.log(payload);
      
      await docxImager.insertImage(payload);
    }
    await docxImager.save(resultFile);

    // response.header(
    //   "Content-Type",
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    // );
    response.attachment(resultFile);
    // you can also access this file from http://localhost:3333/uploads/uploads/result.docx
  }
}
