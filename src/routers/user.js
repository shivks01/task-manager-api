const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const account = require('../emails/account')

// Creating User
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        account.sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(500).send(e)
    }
})

// Logging users in
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// Logging users out of all sessions
router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Logging users out of one session
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Reading Users data
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Updating User
router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpadtes = ['name', 'email', 'password', 'age']
    const isValidoperation = updates.every((update) => allowedUpadtes.includes(update))

    if (!isValidoperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {

        res.status(400).send(e)
    }
})

// Deleting User
router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        account.departEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {

        res.status(500).send(e)
    }
})

// Adding profile pic to your profile
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error('Please upload a valid image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// Deleting profile pic of a particular user
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//Fetching an avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router