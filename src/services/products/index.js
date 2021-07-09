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
//                                 COMMENTS
// *****************************************************************************

// =========  CREATES A NEW COMMENT ON A PRODUCT =============

productsRouter.post('/:productId', async (req, res, next) => {
    try {
        const commentToInsert = {...req.body, createdAt: new Date(), updatedAt: new Date()}

        const productId = req.params.productId
        const updatedProduct = await ProductModel.findByIdAndUpdate(productId, { $push: {comments: commentToInsert}}, { new: true, runValidators: true })

        if(updatedProduct) {
            res.send(updatedProduct)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        if(error.name === "validationError") {
            next(createError(400, error))
        } else {
        next(createError(500, `An Error ocurred while creating a comment on product ID: ${req.params.productId}`))
        }
    }
})

// =========  RETRIEVES A LIST OF COMMENTS FROM A PRODUCT =============

productsRouter.get('/:productId/reviews', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const product = await ProductModel.findById(productId)

        if (product) {
            res.send(product.comments)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the list of comments"))
    }
})

// =========  RETRIEVES A SINGLE COMMENT FROM A PRODUCT =============

productsRouter.get('/:productId/reviews/:commentId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const commentId = req.params.commentId
        const productComment = await ProductModel.findById(productId, { comments: { $elemMatch: { _id: commentId}}})
        
        if (productComment) {
            if (productComment.comments.length > 0) {
                res.send(productComment.comments[0])
            } else {
                next(createError(404, `Comment with _id ${commentId} Not Found!`))
            }

        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while getting comment with ID: ${req.params.commentId}`))
    }
})

// =========  DELETES A COMMENT FROM A PRODUCT =============

productsRouter.delete('/:productId/reviews/:commentId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const commentId = req.params.commentId
        const product = await ProductModel.findByIdAndUpdate(productId, { $pull: { comments: {_id: commentId}}}, { new: true })

        if (product) {
            res.send(product)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while deleting comment with ID: ${req.params.commentId}`))
    }
})

// =========  UPDATES A COMMENT ON A PRODUCT =============

productsRouter.put('/:productId/reviews/:commentId', async (req, res, next) => {
    try {
        const productId = req.params.productId
        const commentId = req.params.commentId

        const product = await ProductModel.findOneAndUpdate( 
            { _id: productId , "comments._id": commentId, }, 
            { $set: { "comments.$": req.body, }}, 
            { new: true, runValidators: true, }
        )
        if (product) {
            res.send(product)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while updating comment with ID: ${req.params.commentId}`))
    }
})
export default productsRouter
