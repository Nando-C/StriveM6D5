import express from 'express'
import UserModel from './schema.js'
import createError from 'http-errors'
import q2m from 'query-to-mongo'

const usersRouter = express.Router()

// ===============  CREATES NEW USER =======================
usersRouter.post('/', async (req, res, next) => {
    try {
        const newUser = new UserModel(req.body)
        const { _id } = await newUser.save()

        res.status(201).send({ _id })

    } catch (error) {
        if(error.name === "validationError") {
            next(createError(400, error))
        } else {
            console.log(error)
            next(createError(500, "An Error ocurred while creating a new user"))
        }
    }
})

// ===============  RETURNS USER LIST =======================
usersRouter.get('/', async (req, res, next) => {
    try {
        const query = q2m(req.query)

        const { total, users } = await UserModel.findUsers(query)

        res.send({ links: query.links('/users', total), total, users })
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the list of users"))
    }
})

// ===============  RETURNS SINGLE USER =======================
usersRouter.get('/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId
        const user = await UserModel.findById(userId)

        if(user) {
            res.send(user)
        } else {
            next(createError(404, `User with _id ${userId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the user"))
    }
})

// ===============  UPDATES AN USER =======================
usersRouter.put('/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId
        const modifiedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true,
        } )

        if(modifiedUser) {
            res.send(modifiedUser)
        } else {
            next(createError(404, `User with _id ${userId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while updating the user ${req.params.userId}`))
    }
})

// ===============  DELETES AN USER =======================
usersRouter.delete('/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId
        const deletedUser = await UserModel.findByIdAndDelete(userId)

        if (deletedUser) {
            res.status(204).send()
        } else {
            next(createError(404, `User with _id ${userId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while deleting the user ${req.params.userId}`))
    }
})

export default usersRouter