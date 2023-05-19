import Application from "@ioc:Adonis/Core/Application";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import carbone from "carbone";
import { DocxImager } from "docximager";
import fs from "fs";

export default class IndexController {
  public async index({ response, request }: HttpContextContract) {
    const id = request.param("id");
    const resultFile = Application.publicPath(`uploads/result-${id}.docx`);
    const templateFile = Application.publicPath("uploads/template.docx");
    const { image, ...data } = await Database.query()
      .from("demos")
      .where({ id })
      .firstOrFail();

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
    await docxImager.insertImage({ img1: image });
    await docxImager.save(resultFile);

    // response.header(
    //   "Content-Type",
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    // );
    response.attachment(resultFile);
    // you can also access this file from http://localhost:3333/uploads/uploads/result.docx
  }
}
