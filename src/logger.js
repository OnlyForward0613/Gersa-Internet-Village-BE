import morgan from "morgan"
import util from "util"
import fs from "fs"
import { projectdir } from "./fileSystem.js"

const errorLogStream = fs.createWriteStream(`${projectdir}/logs/error.log`, {
	flags: "a",
})

morgan.token("reqBody", function (req, res) {
	return util.inspect(req.body, false, null)
})

morgan.token("error", function (req, res) {
	return req.error
})

export const errorLogger = morgan(
	'[:date[clf]] ":method :url" :status :reqBody :error',
	{
		stream: errorLogStream,
		skip: function (req, res) {
			return res.statusCode < 500
		},
	}
)
