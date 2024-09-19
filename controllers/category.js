import Category from "../models/category.js"
import mongoose from "mongoose"

export async function createCategory(req, res, next) {
	let category
	try {
		const requiredMeasurement = req.body.requiredMeasurements
			? String(req.body.requiredMeasurements).split(",")
			: undefined
		category = new Category({
			name: req.body.name,
			requiredMeasurements: requiredMeasurement,
		})
		category = await category.save()
		if (!category) {
			return res
				.status(400)
				.json({ success: false, message: "Category not Created" })
		}
		return res.status(201).json({ category })
	} catch (error) {
		next(error)
	}
}

export async function getAllCategories(req, res, next) {
	try {
		const categoryList = await Category.find({})
		return res.json({ categoryList })
	} catch (error) {
		next(error)
	}
}

export async function updateCategory(req, res, next) {
	try {
		const requiredMeasurement = req.body.requiredMeasurements
			? req.body.requiredMeasurements.split(",")
			: undefined
		let update = {
			name: req.body.name,
			requiredMeasurements: requiredMeasurement,
		}
		const categoryUpdate = await Category.findByIdAndUpdate(
			req.params.categoryId,
			{
				$set: update,
			},
			{ new: true }
		)
		if (!categoryUpdate) {
			return res
				.status(500)
				.json({ success: false, message: "Unable to update Category" })
		}

		return res.json({ success: true })
	} catch (error) {
		next(error)
	}
}

export async function deleteCategory(req, res, next) {
	try {
		if (!mongoose.isValidObjectId(req.params.categoryId)) {
			return res
				.status(400)
				.json({ success: false, message: "invalid category" })
		}
		Category.findByIdAndDelete(req.body.categoryId).then((category) => {
			if (category) {
				return res.json({
					success: true,
					message: "category deleted successfully",
				})
			} else {
				return res.status(404).json({
					success: false,
					message: "category not found",
				})
			}
		})
	} catch (error) {
		next(error)
	}
}

export async function getCategoryDetails(req, res, next) {
	try {
		if (!mongoose.isValidObjectId(req.params.categoryId)) {
			return res
				.status(400)
				.json({ success: false, message: "invalid category" })
		}
		const category = await Category.findById(req.params.categoryId)
		if (!category) {
			return res
				.status(404)
				.json({ success: false, message: "Category not found" })
		}
		return res.json({ category })
	} catch (error) {
		next(error)
	}
}
