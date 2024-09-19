import { unlink } from "fs"
import * as url from "url"

export const projectdir = url.fileURLToPath(new URL("../", import.meta.url))

export async function deleteImage(fileName) {
	const file = `${projectdir}/public/uploads/${fileName}`
	unlink(file, (error) => {
		if (error) throw error
	})
}

// deleteImage("HSS113-Red-Hawaii.jpg-1677773691780.jpeg")
