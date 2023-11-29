import cors from 'cors'
import express from 'express'
import fs from 'fs'
import multer from 'multer'

import mongoose from 'mongoose'

import {
	loginValidation,
	postCreateValidation,
	registerValidation,
} from './validations.js'

import { checkAuth, handleValidationErrors } from './utils/index.js'

import { PostController, UserController } from './controllers/index.js'
mongoose
	.connect(
		'mongodb+srv://admin:villpgh2001@cluster0.ojanfqm.mongodb.net/blog?retryWrites=true&w=majority'
	)
	.then(() => console.log('Db ok'))
	.catch(err => console.log('DB error', err))

const app = express()

app.get('/', (req, res) => {
	res.send('Server started')
})

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		if (!fs.existsSync('uploads')) {
			fs.mkdirSync('uploads')
		}
		cb(null, 'uploads')
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname)
	},
})

const upload = multer({ storage })

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.post(
	'/auth/login',
	loginValidation,
	handleValidationErrors,
	UserController.login
)

app.post(
	'/auth/register',
	registerValidation,
	handleValidationErrors,
	UserController.register
)

app.get('/auth/me', checkAuth, UserController.getMe)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`,
	})
})

app.get('/tags', PostController.getLastTags)

app.get('/posts', PostController.getAll)
app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
app.post(
	'/posts',
	checkAuth,
	postCreateValidation,
	handleValidationErrors,
	PostController.create
)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch(
	'/posts/:id',
	checkAuth,
	postCreateValidation,
	handleValidationErrors,
	PostController.update
)

app.listen(process.env.PORT || 5555, err => {
	if (err) {
		return console.log(err)
	}

	console.log('Server OK')
})
