import Database from "@ioc:Adonis/Lucid/Database";

export default async function ResolveImage(
  case_cif_form_id: string,
  case_form_input_id: number,
  token: string,
  agent_id: number
) {
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
  var insured_photos: any[] = [];
  for (const p of images?.data?.insured_photos) {
    insured_photos.push({ url: p.url });
  }
  var id_proofs: any[] = [];
  for (const p of images?.data?.id_proofs) {
    id_proofs.push({ url: p.url });
  }

  return { id_proofs, insured_photos, cif_inputs };
}
