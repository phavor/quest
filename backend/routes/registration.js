const mongoose = require('mongoose'),
     express = require('express'),
     bcrypt = require('bcrypt'),
     _ = require('lodash');

const { User, validateUser } = require('../models/user')
// const auth_mid = require('../middleware/middleware_auth') // User needs to register before we can generate token for them.

const app = express();
const router = express.Router()

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send('User already registered.')

  user = new User(_.pick(req.body, ['name', 'username', 'email', 'password' ]))
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt);

  await user.save()

  const token = user.generateAuthToken();
  const details = _.pick(user, ['name', 'email', '_id', 'username'])
  
  res.json({
    token,
    details
  })

  // res.header('x-auth-token', token)
  //   .send(_.pick(user, [
  //   'name', 'email', '_id', 'username'
  // ]))
})

module.exports = router;