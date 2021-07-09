import express from 'express'
import ProductModel from './schema.js'
import createError from 'http-errors'
import q2m from 'query-to-mongo'

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
        const query = q2m(req.query)

        const { total, products } = await ProductModel.findProducts(query)

        res.send({ links: query.links('/products', total), total, products })
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

// *****************************************************************************
//                                 REVIEWS
// *****************************************************************************

// =========  CREATES A NEW REVIEW ON A PRODUCT =============

productsRouter.post('/:productId', async (req, res, next) => {
    try {
        const reviewToInsert = {...req.body, createdAt: new Date() }

        const productId = req.params.productId
        const updatedProduct = await ProductModel.findByIdAndUpdate(productId, { $push: {reviews: reviewToInsert}}, { new: true, runValidators: true })

        if(updatedProduct) {
            res.send(updatedProduct)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        if(error.name === "validationError") {
            next(createError(400, error))
        } else {
        next(createError(500, `An Error ocurred while creating a review on product ID: ${req.params.productId}`))
        }
    }
})

// =========  RETRIEVES A LIST OF REVIEWS FROM A PRODUCT =============

productsRouter.get('/:productId/reviews', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const product = await ProductModel.findById(productId)

        if (product) {
            res.send(product.reviews)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the list of reviews"))
    }
})

// =========  RETRIEVES A SINGLE REVIEW FROM A PRODUCT =============

productsRouter.get('/:productId/reviews/:reviewId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const reviewId = req.params.reviewId
        const productReview = await ProductModel.findById(productId, { reviews: { $elemMatch: { _id: reviewId}}})
        
        if (productReview) {
            if (productReview.reviews.length > 0) {
                res.send(productReview.reviews[0])
            } else {
                next(createError(404, `Review with _id ${reviewId} Not Found!`))
            }

        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while getting review with ID: ${req.params.reviewId}`))
    }
})

// =========  DELETES A REVIEW FROM A PRODUCT =============

productsRouter.delete('/:productId/reviews/:reviewId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const reviewId = req.params.reviewId
        const product = await ProductModel.findByIdAndUpdate(productId, { $pull: { reviews: {_id: reviewId}}}, { new: true })

        if (product) {
            res.send(product)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while deleting review with ID: ${req.params.reviewId}`))
    }
})

// =========  UPDATES A REVIEW ON A PRODUCT =============

productsRouter.put('/:productId/reviews/:reviewId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const reviewId = req.params.reviewId

        const updatedReview = {_id: reviewId, ...req.body, createdAt: new Date()}

        const product = await ProductModel.findOneAndUpdate( 
            { _id: productId , "reviews._id": reviewId, }, 
            { $set: { "reviews.$": updatedReview }}, 
            { new: true, runValidators: true, }
        )
        if (product) {
            res.send(product)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while updating review with ID: ${req.params.reviewId}`))
    }
})
export default productsRouter
