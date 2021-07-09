import express from 'express'
import ProductModel from './schema.js'
import createError from 'http-errors'

const productsRouter = express.Router()

// ===============  CREATES NEW PRODUCT =======================
productsRouter.post('/', async (req, res, next) => {
    try {
        const newProduct = new ProductModel(req.body)
        const { _id } = await newProduct.save()

        res.status(201).send({ _id })

    } catch (error) {
        if(error.name === "validationError") {
            next(createError(400, error))
        } else {
            console.log(error)
            next(createError(500, "An Error ocurred while creating a new product"))
        }
    }
})

// ===============  RETURNS PRODUCT LIST =======================
productsRouter.get('/', async (req, res, next) => {
    try {
        const products = await ProductModel.find()
        res.send(products)
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the list of products"))
    }
})

// ===============  RETURNS SINGLE PRODUCT =======================
productsRouter.get('/:productId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const product = await ProductModel.findById(productId)

        if(product) {
            res.send(product)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the product"))
    }
})

// ===============  UPDATES A PRODUCT =======================
productsRouter.put('/:productId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const modifiedproduct = await ProductModel.findByIdAndUpdate(productId, req.body, {
            new: true,
            runValidators: true,
        } )

        if(modifiedproduct) {
            res.send(modifiedproduct)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while updating the product ${req.params.productId}`))
    }
})

// ===============  DELETES A PRODUCT =======================
productsRouter.delete('/:productId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const deletedproduct = await ProductModel.findByIdAndDelete(productId)

        if (deletedproduct) {
            res.status(204).send()
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while deleting the product ${req.params.productId}`))
    }
})

export default productsRouter
