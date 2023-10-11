/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('book_storage', function (table) {
        table.increments('book_id');
        table.string('category', 255).notNullable();
        table.string('description', 255).notNullable();
        table.string('detail', 255).notNullable();
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

    
};
