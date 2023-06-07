import Database from "@ioc:Adonis/Lucid/Database";
import Env from "@ioc:Adonis/Core/Env";
import axios from "axios";

const load_images = async (
  case_cif_form_id: number,
  case_form_input_id: number,
  token: string
) => {
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
};
export default async function ResolveImage(
  case_cif_form_id: number,
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
  var images = await load_images(case_cif_form_id, case_form_input_id, token);
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
  const id_proofs = images?.data?.id_proofs.map(({ url }) => ({ url }));

  return { id_proofs, insured_photos, cif_inputs };
}
