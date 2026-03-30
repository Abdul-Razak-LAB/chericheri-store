import mongoose from "mongoose";

let cached = global.mongoose

const sanitizeMongoUri = (uri) => {
    return String(uri || "")
        .trim()
        .replace(/^['"]|['"]$/g, "")
}

const buildMongoUri = () => {
    const baseUri = sanitizeMongoUri(process.env.MONGODB_URI)

    if (!baseUri) {
        throw new Error("MONGODB_URI is not set or is invalid.")
    }

    // If a DB name is already present in URI path, use it directly.
    if (/^mongodb(\+srv)?:\/\/[^/]+\/[^?]+/.test(baseUri)) {
        return baseUri
    }

    return `${baseUri.replace(/\/$/, "")}/chericheristore`
}

if (!cached) {
    cached = global.mongoose = { conn: null, Promise: null }
}

async function connectDB() {
    
    if(cached.conn) {
        return cached.conn
    }

    if (!cached.Promise) {
        const opts = {
            BufferCommands: false
        }

        const mongoUri = buildMongoUri()

        cached.Promise = mongoose.connect(mongoUri, opts).then( mongoose => {
            return mongoose
        })
    }
    cached.conn = await cached.Promise
    return cached.conn
}
export default connectDB