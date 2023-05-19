import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "demos";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.text("sender_name");
      table.text("company_name");
      table.text("address");
      table.text("pin");
      table.text("city");
      table.text("state");
      table.date("date");
      table.text("title");
      table.text("name");
      table.text("company_address");
      table.integer("company_pin");
      table.text("company_state");
      table.text("image");
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
