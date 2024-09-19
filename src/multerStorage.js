import multer from "multer"

const FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpg": "jpg",
	"image/jpeg": "jpeg",
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const isValid = FILE_TYPE_MAP[file.mimetype]
		let uploadError = new Error("Invalid Image Type")
		if (isValid) {
			uploadError = null
		}
		cb(uploadError, "public/uploads")
	},
	filename: function (req, file, cb) {
		const fileName = file.originalname.split(" ").join("-")
		const extension = FILE_TYPE_MAP[file.mimetype]
		cb(null, `${fileName}-${Date.now()}.${extension}`)
	},
})

export default multer({ storage: storage })
