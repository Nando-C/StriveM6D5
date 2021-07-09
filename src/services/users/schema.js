import mongoose from 'mongoose'

const { Schema, model } = mongoose

const UserSchema = new Schema (
    {
        name: {
            type: String,
            required: true,
        },
        surname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            min: 18,
            max: 65,
            default: 18,
        },
    }
)

UserSchema.static('findUsers', async function (query) {
    const total = await this.countDocuments(query.criteria)
    const users = await this.find(query.criteria, query.options.fields)
        .skip(query.options.skip)
        .limit(query.options.limit)
        .sort(query.options.sort)

    return { total, users }
})

export default model('User', UserSchema)