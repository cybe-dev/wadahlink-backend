import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Design from 'App/Models/Design'

export default class DesignsController {
  public async update({ request, auth }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        page_background: schema.string.optional(),
        name_color: schema.string.optional(),
        link_background: schema.string.optional(),
        link_color: schema.string.optional(),
      }),
    })

    const {
      page_background: pageBackground,
      name_color: nameColor,
      link_background: linkBackground,
      link_color: linkColor,
    } = payload

    const design = await Design.findByOrFail('user_id', auth.use('api').user?.id || 0)
    design.pageBackground = pageBackground || ''
    design.nameColor = nameColor || ''
    design.linkBackground = linkBackground || ''
    design.linkColor = linkColor || ''

    await design.save()

    return design.toJSON()
  }
}
