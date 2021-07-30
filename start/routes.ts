/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('/get-token', 'AuthController.login')
    Route.get('/check-token', 'AuthController.checkToken').middleware('auth')
    Route.post('/register', 'AuthController.register')
    Route.put('/change-password', 'AuthController.changePassword').middleware('auth')
    Route.delete('/logout', 'AuthController.logout').middleware('auth')
  }).prefix('/auth')

  Route.group(() => {
    Route.post('/', 'LinksController.create').middleware('auth')

    Route.put('/reorder', 'LinksController.reorder').middleware('auth')
    Route.put('/:id', 'LinksController.update')
      .middleware('auth')
      .where('id', {
        match: /^[0-9]+$/,
        cast: (id) => Number(id),
      })

    Route.delete('/:id', 'LinksController.delete')
      .middleware('auth')
      .where('id', {
        match: /^[0-9]+$/,
        cast: (id) => Number(id),
      })
  }).prefix('/link')

  Route.group(() => {
    Route.get('/check', 'UsersController.check')

    Route.get('/:id', 'UsersController.read').where('id', {
      match: /^[0-9]+$/,
      cast: (id) => Number(id),
    })

    Route.put('/:id', 'UsersController.update')
      .middleware('auth')
      .where('id', {
        match: /^[0-9]+$/,
        cast: (id) => Number(id),
      })
  }).prefix('/user')

  Route.group(() => {
    Route.put('/', 'DesignsController.update')
  })
    .middleware('auth')
    .prefix('/design')
}).prefix('/api')

Route.get('/:username', 'UsersController.render')
