import express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import mongoose from 'mongoose'
import { badRequestMiddleware, catchAllErrorsMiddleware, notFoundMiddleware } from './errorMiddlewares.js'
import productsRouter from './services/products/index.js'
import usersRouter from './services/users/index.js'
import cartsRouter from './services/carts/index.js'


const port = process.env.PORT || 3001

const server = express()

// ===================== MIDDLEWARES =============================
server.use(cors())
server.use(express.json())

// ===================== ROUTES  =================================
server.use("/products", productsRouter)
server.use("/users", usersRouter)
server.use("/carts", cartsRouter)
// ===================== ERROR HANDLERS ==========================
server.use(notFoundMiddleware)
server.use(badRequestMiddleware)
server.use(catchAllErrorsMiddleware)
// ===============================================================

console.table(listEndpoints(server))

mongoose.connect(process.env.MONGO_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(() => 
    server.listen(port, () => {
        console.log(" ✅  Server is running on port: " + port);
    })
)
.catch(err => console.log(err))
