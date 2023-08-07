import Database from "@ioc:Adonis/Lucid/Database";
import Env from "@ioc:Adonis/Core/Env";
import axios from "axios";
import { FormatDate } from "./Utils";

const load_images = async (
  case_cif_form_id: number,
  case_form_input_id: number
) => {
  try {
    const fetch_url = `${Env.get(
      "API_HOST"
    )}/api/case_cif_forms/${case_cif_form_id}/case_form_inputs/${case_form_input_id}/get_input`;

    var { data } = await axios.get(fetch_url);
    return data;
  } catch (error) {
    console.log(error);
  }
};
export default async function ResolveImage(
  case_cif_form_id: number,
  case_form_input_id: number,
  agent_id: number
) {
  const case_cif_form = await Database.query()
    .from("case_cif_forms")
    .where({ id: case_cif_form_id })
    .firstOrFail();
  const project = await Database.query()
    .from("cases")
    .where({ id: case_cif_form.case_id })
    .firstOrFail();
  const customer = await Database.query()
    .from("customers")
    .where({ id: project.customer_id })
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
  const customer_post = await Database.query()
    .from("post_offices")
    .where("id", "=", customer.post_office_id)
    .firstOrFail();
  const report_sent_activities = await Database.query()
    .from("activity_logs")
    .where("loggable_type", "=", "Case")
    .where("loggable_id", "=", project.id)
    .where("event_type", "=", "stage_change");

  const report_sent = report_sent_activities.filter(
    (log) => log.event_data.to_stage === "report_submitted"
  );

  var images = await load_images(case_cif_form_id, case_form_input_id);
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

  const insured_photos = images?.data?.insured_photos.map(({ url }) => ({
    url,
  }));
  const id_proofs = images?.data?.id_proofs.map(({ url }) => ({ url }));
  const house_photos = images?.data?.house_photos.map(({ url }) => ({ url }));
  const fe_selfies = images?.data?.fe_selfies.map(({ url }) => ({ url }));
  const landmark_photos = images?.data?.landmark_photos.map(({ url }) => ({
    url,
  }));
  const evidence_photos = images?.data?.evidence_photos.map(({ url }) => ({
    url,
  }));
  const signature = [{ url: images?.data?.signature?.url }];
  const summary = project?.summary || "";

  const { case_number, case_type, created_at } = project || {};
  const { name, phone, address, city } = customer || {};
  const { state } = customer_post || {};

  return {
    id_proofs,
    insured_photos,
    house_photos,
    fe_selfies,
    landmark_photos,
    evidence_photos,
    signature,
    cif_inputs,
    summary,
    app_no: case_number || "",
    customer_name: name || "",
    customer_phone: phone || "",
    customer_address: address || "",
    customer_city: city || "",
    customer_state: state || "",
    case_visit_type:
      case_type === 1 ? "Scheduled" : case_type === 2 ? "Direct" : "",
    case_allocation_date: FormatDate(created_at),
    case_done_date: FormatDate(case_form_input?.created_at),
    case_report_sent_date:
      report_sent.length > 0
        ? FormatDate(report_sent[report_sent.length - 1]?.created_at)
        : "",
    page_break: `<w:p><w:br w:type="page" /></w:p>`,
  };
}
