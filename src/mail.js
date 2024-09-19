import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config({ path: "../.env" })

export async function sendMail(recepient, subject, text) {
	const transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		secure: true,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD,
		},
	})

	const message = {
		from: process.env.MAIL_USER,
		to: recepient,
		subject: subject,
		text: text,
	}

	transporter.sendMail(message, (error, info) => {
		if (error) {
			console.log(error)
			return
		} else {
			// console.log(info.response)
			return
		}
	})
}
