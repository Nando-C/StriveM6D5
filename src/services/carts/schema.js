import mongoose from 'mongoose'

const { Schema, model } = mongoose

const CartSchema = new Schema(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        products: [
            {
                _id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product'
                },
                name: String,
                price: Number,
                quantity: Number
            }
        ],
        status: {
            type: String,
            enum: [ 'active', 'paid']
        }
    },
    {
        timestamps: true,
    }
)

export default model('Cart', CartSchema)