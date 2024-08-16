exports.up = function (knex) {
  return knex.schema.createTable("relay_requests", (table) => {
    table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()"));
    table.binary("pubkey").primary().notNullable().index();
    table.specificType("sender_pubkey", "binary ARRAY").notNullable().index();
    table.text("name").notNullable();
    table.text("url").notNullable();
    table.text("pricing").notNullable();
    table.text("description").notNullable();
    table.jsonb("contact_details").notNullable();
    table.double("latitude").notNullable().index();
    table.double("longitude").notNullable().index();
    table.jsonb("location_format").notNullable();
    table.date("approved_at").defaultTo(null).index();
    table.date("declined_at").defaultTo(null).index();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("relay_requests");
};
