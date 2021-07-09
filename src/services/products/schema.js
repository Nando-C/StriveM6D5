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
        reviews: [
            {
                comment: {
                    type: String,
                    required: true,
                },
                rate: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                createdAt: Date,
            }
        ]
    },
    {
        timestamps: true,
    }
)

ProductSchema.static('findProducts', async function (query) {
    const total = await this.countDocuments(query.criteria)
    const products = await this.find(query.criteria, query.options.fields)
        .skip(query.options.skip)
        .limit(query.options.limit)
        .sort(query.options.sort)

    return { total, products }
})

export default model('Product', ProductSchema)