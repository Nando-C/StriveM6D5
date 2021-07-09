import express from 'express'
import createError from 'http-errors'
import ProductModel from '../products/schema.js'
import CartModel from './schema.js'

const cartsRouter = express.Router()

// ===============  ADDS PRODUCT TO CART / INCREMENTS QUANTITY IF ALREADY THERE  =======================
// receives productId & quantity in the body of the request

cartsRouter.post('/:ownerId/addProduct', async (req, res, next) => {
    try {
        const productId = req.body._id
        const purchasedProduct = await ProductModel.findById(productId)

        if( purchasedProduct) {
            const product = { ...purchasedProduct.toObject(), quantity: req.body.quantity }
            const isProductThere = await CartModel.findOne({ownerId: req.params.ownerId, status: 'active', 'products._id': purchasedProduct._id})

            if( isProductThere ) {
                await CartModel.findOneAndUpdate({ownerId: req.params.ownerId, status: 'active', 'products._id': purchasedProduct._id}, { $inc: { 'products.$.quantity': req.body.quantity }}, { upsert: true })
                
                res.send('Quantity increased!')

            } else {
                await CartModel.findOneAndUpdate({ ownerId: req.params.ownerId, status: 'active' }, { $push: { products: product }}, { upsert: true })
                
                res.send('Product added to cart!')
            }
        } else {
            next(createError(404, `Product with _id ${productId} Not Found!`))
        }
    } catch (error) {
        console.log(error)
        next(createError(500, "An Error ocurred while adding product to cart"))
    }
})

// ===============  REMOVES PRODUCT FROM CART  =======================
cartsRouter.delete('/:ownerId/removeProduct', async (req, res, next) => {
    try {
        const productId = req.body._id
        const isProductThere = await CartModel.findOne({ownerId: req.params.ownerId, status: 'active', 'products._id': productId})

        if (isProductThere) {
            const cart = await CartModel.findOneAndUpdate({ownerId: req.params.ownerId, status: 'active', 'products._id': productId}, { $pull: { products: { _id: productId } }}, { new: true })

            res.send(cart)
        } else {
            next(createError(404, `Product with _id ${productId} Not Found in cart!`))
        }

    } catch (error) {
        console.log(error)
        next(createError(500, "An Error ocurred while removing a new cart"))
    }
})

// ===============  RETURNS AN USER'S CART  =======================
cartsRouter.get('/:ownerId', async (req, res, next) => {
    try {
        const cart = await CartModel.findOne({ownerId: req.params.ownerId})
        if(cart) {
            res.send(cart)
        } else {
            next(createError(404, `Cart Not Found!`))
        }
    } catch (error) {
        console.log(error)
        next(createError(500, "An Error ocurred while getting the user's cart's products"))
    }
})
export default cartsRouter