var express = require("express");
var router = express.Router();
var models = require("../models");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var authService = require("../services/auth");
const { TokenExpiredError } = require("jsonwebtoken");

//inUse
router.get('/api', (req, res, next) => {
  models.users.findAll({
    where: {
      UserId: {
        [Op.gt]: 1
      }
    },
    attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
    include: [
      {
        model: models.groups
      },
      {
        model: models.posts,
        include: [
          {
            model: models.users,
            attributes: ['UserName']
          },
          {
            model: models.comments,
            include: {
              model: models.users,
              attributes: ['UserName']
            }
          }
        ]
      }
    ],
  }).then(users => {
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify(users))
  })
})

//inUse
router.post('/api/signup', (req, res, next) => {
  models.users.findOrCreate({
    where: { Email: req.body.email },
    defaults: {
      FullName: req.body.name,
      Email: req.body.email,
      UserName: req.body.userName,
      Password: authService.hashPassword(req.body.password),
      Admin: 0
    }
  }).spread((result, created) => {
    if (created) {
      res.header('Content-Type', 'application/json')
      res.send(JSON.stringify({ result: true, message: 'you have successfully signed up' }))
    } else {
      res.header('Content-Type', 'application/json')
      res.send({ result: false, message: 'user already exists' })
    }
  })
})


router.get('/api/login', (req, res, next) => {
  let token = req.cookies.jwt
  try {
    authService.verifyUser(token).then(user => {
      models.users.findOne({
        where: { UserId: user.UserId },
        include: [
          {
            model: models.users,
            as: 'Friends'
          },
          {
            model: models.users,
            as: 'Requests'
          },
          {
            model: models.groups
          },
          {
            model: models.posts,
            include: [
              {
                model: models.users,
                attributes: ['UserName']
              },
              {
                model: models.comments,
                include: {
                  model: models.users,
                  attributes: ['UserName']
                }
              }
            ]
          }
        ],
      }).then(data => {
        res.header('Content-Type', 'application/json')
        res.send(JSON.stringify({ status: true, data }))
      })
    })
  } catch (error) {
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify({ status: false, message: error.message }))
  }
})

//inUse
router.post('/api/login', (req, res, next) => {
  models.users.findOne({
    where: { Email: req.body.email },
    include: [
      {
        model: models.users,
        as: 'Friends'
      },
      {
        model: models.users,
        as: 'Requests'
      },
      {
        model: models.groups
      },
      {
        model: models.posts,
        include: [
          {
            model: models.users,
            attributes: ['UserName']
          },
          {
            model: models.comments,
            include: {
              model: models.users,
              attributes: ['UserName']
            }
          }
        ]
      }
    ],
  }).then(user => {
    if (!user) {
      res.send(JSON.stringify({ result: false, message: 'user not found', user: null }))
    } else {
      let passwordMatch = authService.comparePassword(req.body.password, user.Password)
      if (passwordMatch) {
        let token = authService.signUser(user)
        res.header('Content-Type', 'application/json')
        res.cookie('jwt', token)
        res.send(JSON.stringify({ result: true, message: 'Login successful', user: user }))
      } else {
        res.send(JSON.stringify({ result: false, message: 'incorrect password', user: null }))
      }
    }
  })
})

router.get('/api/profile', (req, res, next) => {
  let token = req.cookies.jwt
  console.log(token)
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.users.findOne({
          where: { Email: user.Email },
          attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
          include: [
            {
              model: models.users,
              as: 'Friends'
            },
            {
              model: models.users,
              as: 'Requests'
            },
            {
              model: models.groups
            },
            {
              model: models.posts,
              include: [
                {
                  model: models.users,
                  attributes: ['UserName']
                },
                {
                  model: models.comments,
                  include: {
                    model: models.users,
                    attributes: ['UserName']
                  }
                }
              ]
            }
          ],
        })
          .then(result => {
            res.header('Content-Type', 'application/json')
            res.send(JSON.stringify({ result: true, data: result }))
          })
      } else {
        res.send(JSON.stringify({ result: false, message: 'must be logged in' }))
      }
    })
  } else {
    res.send(JSON.stringify({ result: false, message: 'must be logged in' }))
  }
})

//inUse
router.get('/api/profile/:id', (req, res, next) => {
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.UserId === parseInt(req.params.id)) {
        console.log('success')
        models.users.findOne({
          where: { Email: user.Email },
          attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
          include: [
            {
              model: models.users,
              as: 'Friends'
            },
            {
              model: models.users,
              as: 'Requests'
            },
            {
              model: models.groups
            },
            {
              model: models.posts,
              include: [
                {
                  model: models.users,
                  attributes: ['UserName']
                },
                {
                  model: models.comments,
                  include: {
                    model: models.users,
                    attributes: ['UserName']
                  }
                }
              ]
            }
          ],
        }).then(result => {
          res.header('Content-Type', 'application/json')
          res.send(JSON.stringify({ result: true, data: result }))
        })
      } else {
        models.users.findOne({
          where: { UserId: parseInt(req.params.id) },
          attributes: ['UserId', 'FullName', 'UserName'],
          include: [
            {
              model: models.users,
              as: 'Friends'
            },
            {
              model: models.users,
              as: 'Requests'
            },
            {
              model: models.groups
            },
            {
              model: models.posts,
              include: [
                {
                  model: models.users,
                  attributes: ['UserName']
                },
                {
                  model: models.comments,
                  include: {
                    model: models.users,
                    attributes: ['UserName']
                  }
                }
              ]
            }
          ],
        }).then(user => {
          res.header('Content-Type', 'application/json')
          res.send(JSON.stringify({ result: false, data: user }))
        })
      }
    })
  } else {
    models.users.findOne({
      where: { UserId: parseInt(req.params.id) },
      attributes: ['UserId', 'FullName', 'UserName'],
      include: [
        {
          model: models.users,
          as: 'Friends'
        },
        {
          model: models.users,
          as: 'Requests'
        },
        {
          model: models.groups
        },
        {
          model: models.posts,
          include: [
            {
              model: models.users,
              attributes: ['UserName']
            },
            {
              model: models.comments,
              include: {
                model: models.users,
                attributes: ['UserName']
              }
            }
          ]
        }
      ],
    }).then(user => {
      res.header('Content-Type', 'application/json')
      res.send(JSON.stringify({ result: false, data: user }))
    })
  }
})

//inUse
router.get('/api/logout', (req, res, next) => {
  res.cookie('jwt', "", { expires: new Date(0) })
  res.send(JSON.stringify({ result: true, message: 'logged out' }))
})

//
router.delete('/api/:userId', (req, res, next) => {
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.UserId == req.params.userId || user.Admin == 1) {
        let model = [models.users, models.posts, models.comments]
        let status = []
        for (let i = 0; i < model.length; i++) {
          model[i].destroy({
            where: { UserId: parseInt(req.params.userId) }
          }).then(result => {
            status.push(result)
          })
        }
        return status
      }
    }).then(status => {
      res.header('Content-Type', 'application/json')
      res.send(JSON.stringify(status))
    })
  }
})


router.post('/api/add/friend', (req, res, nest) => {
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then(user => {
      models.friends.findOrCreate({
        where: { FriendshipId: 0 },
        defaults: {
          UserId1: user.UserId,
          UserId2: req.body.recieverId,
          Status: 1,
          Active: 1
        }
      }).spread((result, created) => {
        if (created) {
          models.users.findOne({
            where: { Email: user.Email },
            attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
            include: [
              {
                model: models.users,
                as: 'Friends'
              },
              {
                model: models.users,
                as: 'Requests'
              },
              {
                model: models.groups
              },
              {
                model: models.posts,
                include: [
                  {
                    model: models.users,
                    attributes: ['UserName']
                  },
                  {
                    model: models.comments,
                    include: {
                      model: models.users,
                      attributes: ['UserName']
                    }
                  }
                ]
              }
            ],
          }).then(result => {
            res.header('Content-Type', 'application/json')
            res.send(JSON.stringify({ result: true, data: result }))
          })
        } else {
          res.header('Content-Type', 'application/json')
          res.send(JSON.stringify({ result: false, }))
        }
      })
    })
  }
})


router.delete('/api/cancel/friend/:recieverId', (req, res, next) => {
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then(user => {
      models.friends.destroy({
        where: {
          [Op.and]: [
            { UserId1: user.UserId },
            { UserId2: parseInt(req.params.recieverId) }
          ]
        }
      }).then(deleted => {
        if (deleted) {
          models.users.findOne({
            where: { Email: user.Email },
            attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
            include: [
              {
                model: models.users,
                as: 'Friends'
              },
              {
                model: models.users,
                as: 'Requests'
              },
              {
                model: models.groups
              },
              {
                model: models.posts,
                include: [
                  {
                    model: models.users,
                    attributes: ['UserName']
                  },
                  {
                    model: models.comments,
                    include: {
                      model: models.users,
                      attributes: ['UserName']
                    }
                  }
                ]
              }
            ],
          }).then(result => {
            res.header('Content-Type', 'application/json')
            res.send(JSON.stringify({ result: true, data: result }))
          })
        }
      })
    })
  } else {

  }
})


router.post('/api/accept/request', (req, res, next) => {
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then(user => {
      models.friends.findOrCreate({
        where: { FriendshipId: 0 },
        defaults: {
          UserId1: user.UserId,
          UserId2: req.body.userId,
          Status: 2,
          Active: 0
        }
      }).spread((result, created) => {
        if (created) {
          models.friends.update({ Status: 2 }, {
            where: {
              [Op.and]: [
                { UserId1: req.body.userId },
                { UserId2: user.UserId }
              ]
            }
          }).then(() => {
            return models.users.findOne({
              where: { Email: user.Email },
              attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
              include: [
                {
                  model: models.users,
                  as: 'Friends'
                },
                {
                  model: models.users,
                  as: 'Requests'
                },
                {
                  model: models.groups
                },
                {
                  model: models.posts,
                  include: [
                    {
                      model: models.users,
                      attributes: ['UserName']
                    },
                    {
                      model: models.comments,
                      include: {
                        model: models.users,
                        attributes: ['UserName']
                      }
                    }
                  ]
                }
              ],
            })
          }).then(user => {
            res.header('Content-Type', 'application/json')
            res.send(JSON.stringify({ result: true, data: user }))
          })
        } else {
          res.header('Content-Type', 'application/json')
          res.send(JSON.stringify({ result: false, message: '' }))
        }
      })
    })
  } else {
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify({ result: false, message: '' }))
  }
})


router.put('/api/deny/request', (req, res, next) => {
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then(user => {
      models.friends.update({ Status: 3 }, {
        where: {
          [Op.and]: [
            { UserId1: req.body.userId },
            { UserId2: user.UserId }
          ]
        }
      }).then(() => {
        return models.users.findOne({
          where: { Email: user.Email },
          attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
          include: [
            {
              model: models.users,
              as: 'Friends'
            },
            {
              model: models.users,
              as: 'Requests'
            },
            {
              model: models.groups
            },
            {
              model: models.posts,
              include: [
                {
                  model: models.users,
                  attributes: ['UserName']
                },
                {
                  model: models.comments,
                  include: {
                    model: models.users,
                    attributes: ['UserName']
                  }
                }
              ]
            }
          ],
        })
      }).then(user => {
        res.header('Content-Type', 'application/json')
        res.send(JSON.stringify({ result: true, data: user }))
      })
    })
  }
})

router.put('/api/confirm/notification', (req, res, next) => {
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then(user => {
      models.friends.update({ Active: 0 }, {
        where: {
          [Op.and]: [
            { UserId1: user.UserId },
            { UserId2: req.body.userId }
          ]
        }
      }).then(() => {
        return models.users.findOne({
          where: { Email: user.Email },
          attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
          include: [
            {
              model: models.users,
              as: 'Friends'
            },
            {
              model: models.users,
              as: 'Requests'
            },
            {
              model: models.groups
            },
            {
              model: models.posts,
              include: [
                {
                  model: models.users,
                  attributes: ['UserName']
                },
                {
                  model: models.comments,
                  include: {
                    model: models.users,
                    attributes: ['UserName']
                  }
                }
              ]
            }
          ],
        })
      }).then(user => {
        res.header('Content-Type', 'application/json')
        res.send(JSON.stringify({ result: true, data: user }))
      })
    })
  }
})

router.delete('/api/remove/friend/:friendId', (req, res, next) => {
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then(user => {
      models.friends.destroy({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { UserId1: parseInt(user.UserId) },
                { UserId2: parseInt(req.params.friendId) }
              ]
            },
            {
              [Op.and]: [
                { UserId1: parseInt(req.params.friendId) },
                { UserId2: parseInt(user.UserId) }
              ]
            }
          ]
        }
      }).then(deleted => {
        if (deleted) {
          models.users.findOne({
            where: { Email: user.Email },
            attributes: ['UserId', 'FullName', 'UserName', 'Email', 'Admin'],
            include: [
              {
                model: models.users,
                as: 'Friends'
              },
              {
                model: models.users,
                as: 'Requests'
              },
              {
                model: models.groups
              },
              {
                model: models.posts,
                include: [
                  {
                    model: models.users,
                    attributes: ['UserName']
                  },
                  {
                    model: models.comments,
                    include: {
                      model: models.users,
                      attributes: ['UserName']
                    }
                  }
                ]
              }
            ],
          }).then(user => {
            res.header('Content-Type', 'application/json')
            res.send(JSON.stringify({ result: true, data: user }))
          })
        }
      })
    })
  }
})

module.exports = router