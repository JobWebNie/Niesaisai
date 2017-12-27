const express = require('express')
const multer = require('multer')
// const storage = multer.memoryStorage()
const upload = multer()
const fileSystem = require('fs')
const router = express.Router()
const spawnSync = require('child_process').spawnSync
const mysql = require('mysql2')
const pool = mysql.createPool({
  host: '47.94.172.95',
  port: 3306,
  user: 'program_w',
  password: 'KQPp5wrZJG33fwFs',
  database: 'xiaobaods',
  charset: 'UTF8_GENERAL_CI'
})
router.get('/product', (req, res) => {
  const table = req.query.name === 'hotseller' ? 'bc_attribute_granularity_sales' : 'bc_attribute_granularity_visitor'
  const {productStyle: category, dateTime: date, extraShown: variable, timeLen: length} = req.query
  const parms = "{'fun':'a','table':'" + table + "','date':'" + date + "','category':'" + category + "','variable':'" + variable + "','length':" + length + '}'
  const spawnSync1 = spawnSync('python', ['xiaobaods.py', parms], {cwd: './server/python'})
  const data = JSON.parse(spawnSync1.stdout)
  res.send(data)
})
router.get('/world', (req, res) => {
  if (req.query.name === 'flash') {
    const {productStyle: category, dateTime: date, attribute: choice, extraShown: variable, timeLen: length} = req.query
    const parms = "{'choice':'" + choice + "','date':'" + date + "','category':'" + category + "','variable':'" + variable + "','length':" + length + '}'
    const spawnSync1 = spawnSync('python', ['xiaobaods_ws.py', parms], {cwd: './server/python'})
    const data = JSON.parse(spawnSync1.stdout)
    res.send(data)
  } else {
    let name = 'w'
    const {productStyle: category, dateTime: date, attribute: choice, extraShown: variable, timeLen: length} = req.query
    const parms = "{'fun':'" + name + "','choice':'" + choice + "','date':'" + date + "','category':'" + category + "','variable':'" + variable + "','length':" + length + '}'
    const spawnSync1 = spawnSync('python', ['xiaobaods.py', parms], {cwd: './server/python'})
    const data = JSON.parse(spawnSync1.stdout)
    res.send(data)
  }
})
router.get('/property', (req, res) => {
  // const table = req.query.name === 'hotseller' ? 'bc_attribute_granularity_sales' : 'bc_attribute_granularity_visitor'
  // const {productStyle: category, dateTime: date, extraShown: variable, timeLen: length} = req.query
  // const parms = "{'fun':'a','table':'" + table + "','date':'" + date + "','category':'" + category + "','variable':'" + variable + "','length':" + length + '}'
  const spawnSync1 = spawnSync('python', ['xiaobaods.py', "{'fun':'c'}"], {cwd: './server/python'})
  const data = JSON.parse(spawnSync1.stdout)
  res.send(data)
})
router.get('/property-deal', (req, res) => {
  const spawnSync1 = spawnSync('python', ['xiaobaods_e.py', "{'attribute':'list'}"], {cwd: './server/python'})
  const data = JSON.parse(spawnSync1.stdout)
  const spawnSync2 = spawnSync('python', ['xiaobaods_e.py', "{'attribute':'" + data[0] + "','variable': 'all'}"], {cwd: './server/python'})
  const data1 = JSON.parse(spawnSync2.stdout)
  res.send({data: data, data1: data1})
})
router.post('/property-deal', upload.single(), (req, res) => {
  fileSystem.writeFile('./server/uploads/html.txt', req.body.information, (err) => {
    if (err) throw err
    const spawnSync3 = spawnSync('python', ['run.py'], {cwd: './server/Business_adviser_parser'})
    const data = spawnSync3.stdout.toString()
    res.send(data)
  })
})
router.get('/weekreport', (req, res) => {
  pool.query('SELECT * FROM weekly_publication ORDER BY id DESC LIMIT 0,1;', function (err, result) {
    if (err) throw (err)
    fileSystem.readFile('./server/markdown/' + result[0].name, function (err, data) {
      if (err) throw (err)
      res.send(data)
    })
  })
})
router.get('/tool-box', (req, res) => {
  console.log(req.query)
  let product = req.query.name === 'betatest' ? req.query.product : ''

  pool.query('SELECT * FROM `Tools_conversion` WHERE `category` = ?', [product], function (err, results, fields) {
    if (err) throw err
    else {
      res.send(results[0])
    }
  })
})
module.exports = router
