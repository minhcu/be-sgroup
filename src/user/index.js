const express = require('express')

const router = express.Router()
const { validateUser } = require('../middlewares')

let id = 3

let usersData = [
    {
        id: 1,
        fullname: 'Minh Dong',
        gender: true,
        age: 18,
    },
    {
        id: 2,
        fullname: 'Minh Cu',
        gender: false,
        age: 15,
    },
]

function getUser(userID) {
    return usersData.find((user) => user.id === userID)
}
function deleteUser(userID) {
    usersData = usersData.filter((user) => user.id !== userID)
    return true
}
function addUser(user) {
    const newUser = {
        id,
        ...user,
    }
    usersData.push(newUser)
    id += 1
    return newUser
}
function editUser(userID, userData) {
    const oldUser = getUser(userID)
    if (!oldUser) return false
    const newUser = {
        ...oldUser,
        ...userData,
    }
    usersData = usersData.map((user) => (user.id === newUser.id ? newUser : user))
    return true
}

router
    .get('/', (req, res) => res.status(200).json(usersData))
    .post('/', validateUser, (req, res) => {
        const user = addUser(req.body)
        return res.status(201).json(user)
    })

router
    .get('/:id', (req, res) => {
        const user = getUser(req.params.id)
        if (user) return res.status(200).json(user)
        return res.status(404).send('User not found!')
    })
    .delete('/:id', (req, res) => {
        const user = getUser(req.params.id)
        if (user) {
            deleteUser(req.params.id)
            return res.status(204).send()
        }
        return res.status(404).send('User not found')
    })
    .put('/:id', validateUser, (req, res) => {
        const user = editUser(req.params.id, req.body)
        if (user) {
            return res.status(204).send()
        }
        return res.status(404).send('User not found')
    })

module.exports = router
