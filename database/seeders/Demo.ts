import Database from "@ioc:Adonis/Lucid/Database";
import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";

export default class extends BaseSeeder {
  public static environment = ["development", "testing"];

  public async run() {
    // Write your database queries inside the run method
    await Database.insertQuery().table("demos").insert({
      sender_name: "Dipanjan Panja",
      company_name: "Geogo",
      address: "lowada",
      pin: "721136",
      city: "paschim medinipur",
      state: "wb",
      image: "http://127.0.0.1:57585/uploads/test.jpg",
      date: "09-08-9090",
      title: "this is a demo title",
      name: "Geogo Name",
      company_address: "kolkata",
      company_pin: "700092",
      company_state: "wb",
    });
  }
}
