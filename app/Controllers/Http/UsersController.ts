import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import fs from 'fs'

export default class UsersController {
  public async read({ params }: HttpContextContract) {
    const user = await User.findOrFail(params.id || 0)
    const links = await user.related('links').query().orderBy('sort', 'asc')
    const design = await user.related('design').query().first()

    return {
      ...user.toJSON(),
      links,
      design,
    }
  }

  public async render({ view, params }: HttpContextContract) {
    const user = await User.findByOrFail('username', params.username || 0)
    const links = await user.related('links').query().orderBy('sort', 'asc')
    const design = await user.related('design').query().first()

    const state = {
      fullname: user.fullname,
      photo: user.photo,
      design: design?.toJSON(),
      links: links,
    }

    return view.render('user', state)
  }

  public async check({ request }: HttpContextContract) {
    const username = request.input('username', '')
    const email = request.input('email', '')
    const user = await User.query()
      .where('username', username)
      .orWhere('email', email)
      .firstOrFail()

    return user.toJSON()
  }

  public async update({ params, response, request, auth }: HttpContextContract) {
    const user = await User.findOrFail(params.id || 0)
    if (auth.use('api').user?.id !== user.id) {
      return response.methodNotAllowed()
    }

    const payload = await request.validate({
      schema: schema.create({
        fullname: schema.string(),
      }),
    })

    const photo = request.file('photo', {
      size: '2mb',
      extnames: ['png', 'jpg'],
    })

    if (photo && !photo.isValid) {
      return photo.errors
    }

    const { fullname } = payload

    user.fullname = fullname
    if (photo) {
      if (user.photo) {
        fs.unlinkSync(`public/${user.photo}`)
      }
      const fileName = `${cuid()}.${photo.extname}`
      await photo.move('public/uploads', {
        name: fileName,
      })

      user.photo = 'uploads/' + fileName
    }

    await user.save()

    return user.toJSON()
  }
}
