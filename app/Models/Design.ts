import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Design extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public pageBackground: string

  @column()
  public nameColor: string

  @column()
  public linkBackground: string

  @column()
  public linkColor: string

  @hasOne(() => User)
  public user: HasOne<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
