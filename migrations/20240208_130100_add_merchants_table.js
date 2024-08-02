exports.up = function (knex) {
  return knex.schema.createTable("merchants", (table) => {
    table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()"));
    table.binary("pubkey").primary().notNullable().index();
    table.text("name").notNullable();
    table.text("description").notNullable();
    table.text("pricing").notNullable();
    table.jsonb("contact_details").notNullable();
    table.double("latitude").notNullable().index();
    table.double("longitude").notNullable().index();
    table.double("balance").defaultTo(0.0);
    table.date("advertised_on").defaultTo(null);
    table.date("approved_at").defaultTo(null).index();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("merchants");
};
