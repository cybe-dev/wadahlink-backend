import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Design from 'App/Models/Design'

export default class AuthController {
  public async checkToken({ auth }: HttpContextContract) {
    const user = await User.findOrFail(auth.use('api').user?.id || 0)
    const links = await user.related('links').query().orderBy('sort', 'asc')
    const design = await user.related('design').query().first()

    return {
      ...user.toJSON(),
      links,
      design,
    }
  }
  public async register({ request, auth }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        fullname: schema.string(),
        username: schema.string({}, [
          rules.regex(/^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/),
          rules.unique({ table: 'users', column: 'username' }),
        ]),
        email: schema.string({}, [
          rules.email(),
          rules.unique({ table: 'users', column: 'email' }),
        ]),
        password: schema.string(),
      }),
    })

    const { fullname, password, email, username } = payload

    const user = await Database.transaction(async (trx) => {
      const user = new User()
      user.fullname = fullname
      user.password = password
      user.email = email
      user.username = username

      user.useTransaction(trx)

      await user.save()

      const design = new Design()
      design.userId = user.id

      design.useTransaction(trx)

      await design.save()

      return user
    })

    const token = await auth.use('api').generate(user)

    return {
      ...user.toJSON(),
      token,
    }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    let payload
    try {
      payload = await validator.validate({
        schema: schema.create({
          username: schema.string(),
          password: schema.string(),
        }),
        data: request.all(),
      })
    } catch (error) {
      return response.badRequest(error.messages)
    }

    const { username, password } = payload

    const user = await User.query()
      .where('username', username)
      .orWhere('email', username)
      .firstOrFail()

    if (!(await Hash.verify(user.password, password))) {
      return response.badRequest('Invalid Credentials')
    }

    const token = await auth.use('api').generate(user)

    return {
      ...user.toJSON(),
      token,
    }
  }

  public async changePassword({ request, auth, response }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        old_password: schema.string(),
        new_password: schema.string(),
      }),
    })

    const { old_password: oldPassword, new_password: newPassword } = payload

    const user = await User.findOrFail(auth.use('api').user?.id || 0)

    if (!(await Hash.verify(user.password, oldPassword))) {
      return response.badRequest('Invalid Credentials')
    }

    user.password = newPassword
    await user.save()

    await Database.from('api_tokens')
      .where('user_id', auth.use('api').user?.id || 0)
      .andWhereNot('token', auth.use('api').token?.tokenHash || '')
      .delete()

    return user.toJSON()
  }

  public async logout({ auth }: HttpContextContract) {
    await auth.use('api').revoke()
    return 'Token Revoked'
  }
}
