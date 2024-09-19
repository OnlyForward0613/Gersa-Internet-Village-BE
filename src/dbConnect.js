import mongoose from "mongoose"

export async function connectDb(mongo_uri) {
	mongoose.set("strictQuery", true)
	return mongoose.connect(mongo_uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
}
