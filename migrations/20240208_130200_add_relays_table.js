exports.up = function (knex) {
  return knex.schema.createTable('relays', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()'))
    table.binary('pubkey').primary().notNullable().index()
    table.specificType('sender_pubkey', 'bytea ARRAY').notNullable().index()
    // table.array('sender_pubkey').notNullable()
    table.text('name').notNullable()
    table.text('url').notNullable()
    table.text('pricing').notNullable()
    table.text('description').notNullable()
    table.jsonb('contact_details').notNullable()
    table.double('latitude').notNullable().index()
    table.double('longitude').notNullable().index()
    table.jsonb('location_format').notNullable()
    table.timestamp('approved_at').defaultTo(null)
    table.timestamp('created_at').defaultTo(knex.fn.now()).index()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('relays')
}
