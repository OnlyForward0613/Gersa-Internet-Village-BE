import app from "./app.js"
import { connectDb } from "./src/dbConnect.js"

async function start() {
	try {
		const mongoURI = process.env.ENV
			? process.env.MONGO_URI_LOCAL
			: process.env.MONGO_URI
		await connectDb(mongoURI)
		app.listen(process.env.PORT, async () => {
			console.log(`Listening on port: ${process.env.PORT}`)
		})
	} catch (err) {
		console.log(err)
	}
}

start()
