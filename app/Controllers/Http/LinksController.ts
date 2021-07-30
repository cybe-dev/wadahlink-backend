import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Link from 'App/Models/Link'
import Database from '@ioc:Adonis/Lucid/Database'

export default class LinksController {
  public async create({ request, auth }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        name: schema.string(),
        url: schema.string(),
        sort: schema.number(),
      }),
    })

    const { name, url, sort } = payload
    const user = await User.findOrFail(auth.use('api').user?.id || 0)
    const link = await user.related('links').create({
      name,
      url,
      sort,
    })

    return link.toJSON()
  }

  public async update({ params, auth, response, request }: HttpContextContract) {
    const link = await Link.findOrFail(params.id || 0)
    if (auth.use('api').user?.id !== link.userId) {
      return response.methodNotAllowed()
    }

    const payload = await request.validate({
      schema: schema.create({
        name: schema.string(),
        url: schema.string(),
      }),
    })

    const { name, url } = payload

    link.name = name
    link.url = url

    await link.save()

    return link.toJSON()
  }

  public async delete({ params, auth, response }: HttpContextContract) {
    const link = await Link.findOrFail(params.id || 0)
    if (auth.use('api').user?.id !== link.userId) {
      return response.methodNotAllowed()
    }

    await link.delete()
    return link.toJSON()
  }

  public async reorder({ request, auth }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        links: schema.array().members(
          schema.object().members({
            id: schema.number(),
            sort: schema.number(),
          })
        ),
      }),
    })

    const { links } = payload
    const userId = auth.use('api').user?.id || 0

    const result = await Database.transaction(async (trx) => {
      const result = new Array()
      for (let item of links) {
        const link = await Link.findOrFail(item.id)
        if (userId !== link.userId) {
          throw new Error()
        }
        link.sort = item.sort
        link.useTransaction(trx)
        await link.save()

        result.push(link.toJSON())
      }

      return result
    })

    return result
  }
}
