const express = require('express')
const router = express.Router()

let id = 3;

let usersData = [
	{
		"id": 1,
		"fullname": "Minh Dong",
		"gender": true,
		"age": 18
	},
	{
		"id": 2,
		"fullname": "Minh Cu",
		"gender": false,
		"age": 15
	}
]

function getUser(id) {
    return usersData.find(user => user.id == id)
}
function deleteUser(id) {
    return usersData = usersData.filter(user => user.id != id)
}
function addUser(user) {
    const newUser = {
        id,
        ...user
    }
    usersData.push(newUser)
    id += 1;
    return newUser
}
function editUser(user) {
    const newUser = {
        ...user,
        ...req.body
    }
    usersData = usersData.map(user => user.id == newUser.id ? newUser : user)
}

router
    .get('/', (req, res) => {
        return res.status(200).json(usersData)
    })
    .post('/', (req, res) => {
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
    .put('/:id', (req, res) => {
        const user = getUser(req.params.id)
        if (user) {
            const newUser = editUser(req.body)
            return res.status(204).send()
        }
        return res.status(404).send('User not found')
    })

module.exports = router