const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const session = require('express-session');

const db = require("../db");

const saltRounds = 10;

let doc = {};
let paginaAtual = 'home';
let usuarioAtual

function criptografarSenha(senha) {
  return bcrypt.hashSync(senha, saltRounds);
}

function verificarSecao(req, res, next) {
  if (req.session.username) {
    next()
  } else {
    res.redirect('/')
  }
}

router.use(session({
  secret: 'usuario',
  resave: false,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    maxAge: 5 * 60 * 1000
  }
}));

router.get('/', (req, res, next) => {
  try {
    res.render('login')
  } catch (error) {
    next(error)
  }
})

router.get('/home', verificarSecao, (req, res, next) => {
  try {
    res.render('home', { doc })
  } catch (error) {
    next(error)
  }
})

router.get('/login', (req, res, next) => {
  try {
    res.render('login')
  } catch (error) {
    next(error)
  }
})

router.post('/login/:user', async (req, res, next) => {
  const user = req.params.user;
  const password = req.body.senha;

  try {
    const docs = await db.findOneUser(user)
    if (docs.user == user) {
      const cryptopassword = docs.crypto_password
      const correct_password = bcrypt.compareSync(password, cryptopassword)
      if (correct_password) {
        req.session.username = user
        const arrayName = docs.name.split(" ")
        const firstName = arrayName[0]
        doc.name = firstName
        usuarioAtual = user
        res.status(200).json({
          status: 'success',
          id: docs._id,
          name: firstName,
          usuario: req.session.username
        })
      } else {
        res.status(200).json({
          status: 'fail'
        })
      }
    }
  } catch (error) {
    next(error)
  }
})

router.get('/cadastro', async (req, res, next) => {
  try {
    res.render('cadastrar')
  } catch (error) {
    next(error)
  }
})

router.post('/cadastro', async (req, res, next) => {
  const name = req.body.nome;
  const user = req.body.usuario;
  const cep = req.body.cep;
  const password = req.body.senha;
  const crypto_password = criptografarSenha(password)

  try {
    const docs = await db.findAll()
    const encontrarUsuario = usuario => usuario.user == user
    const usuarioEncontrado = docs.filter(encontrarUsuario)
    if (usuarioEncontrado.length == 0) {
      await db.insert({ name, user, cep, crypto_password });
      req.session.username = user
      const arrayName = name.split(" ")
      const firstName = arrayName[0]
      doc.name = firstName
      res.status(200).json({
        status: 'success',
      })
    } else {
      res.status(200).json({
        status: 'fail',
        usuario: usuarioEncontrado
      })
    }
  } catch (err) {
    next(err);
  }
})

router.get('/perfil', verificarSecao, async (req, res, next) => {
  try {
    const docs = await db.findOneUser(usuarioAtual)
    paginaAtual = 'perfil'
    res.render(paginaAtual, { doc, docs })
  } catch (error) {
    next(error)
  }
})


router.get('/list', verificarSecao, async (req, res, next) => {
  const docs = await db.findAll();
  paginaAtual = 'usuarios'
  res.render(paginaAtual, { docs, doc })
})

router.get('/query/:id', async (req, res, next) => {
  const id = req.params.id;

  try {
    const docs = await db.findOne(id)
    res.status(200).json({
      status: 'success',
      dados: docs
    })
  } catch (error) {
    next(error)
  }
})

router.get('/edit/:id', async (req, res, next) => {
  const id = req.params.id

  try {
    const docs = await db.findOne(id)
    res.status(200).json({
      status: 'success',
      dados: docs,
      msg: 'success'
    })
  } catch (err) {
    next(err)
  }
})

router.post('/edit/:id', async (req, res, next) => {
  const id = req.params.id;
  const name = req.body.nome;
  const user = req.body.usuario;
  const cep = req.body.cep;

  try {
    await db.update(id, { name, user, cep })
    res.status(200).json({
      status: 'success',
      action: 'update'
    })
  } catch (err) {
    next(err)
  }
})

router.get('/delete/:id', async (req, res, next) => {
  const id = req.params.id

  try {
    await db.deleteOne(id)
    res.status(200).json({
      status: 'success'
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router;