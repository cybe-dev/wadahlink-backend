import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Designs extends BaseSchema {
  protected tableName = 'designs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('page_background').nullable()
      table.string('name_color').nullable()
      table.string('link_background').nullable()
      table.string('link_color').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
