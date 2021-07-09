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
        next(createError(500, "An Error ocurred while creating a new cart"))
    }
})

export default cartsRouter