import mongoose from 'mongoose'

const { Schema, model } = mongoose

const ProductSchema = new Schema (
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true,
    }
)

 export default model('Product', ProductSchema)