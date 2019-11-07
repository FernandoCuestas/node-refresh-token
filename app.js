import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
const router = express.Router()
import config from './config';
const tokenList = {}
const app = express()

router.get('/', (req,res) => {
    res.send('Ok');
})

router.post('/login', ({body}, res) => {
    const postData = body;
    const user = {
        "email": postData.email,
        "name": postData.name
    }
    // do the database authentication here, with user name and password combination.
    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife})
    const response = {
        "status": "Logged in",
        "token": token,
        "refreshToken": refreshToken,
    }
    tokenList[refreshToken] = response
    res.status(200).json(response);
})

router.post('/token', ({body}, res) => {
    // refresh the damn token
    const postData = body
    // if refresh token exists
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "email": postData.email,
            "name": postData.name
        }
        const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
        const response = {
            "token": token,
        }
        // update the token in the list
        tokenList[postData.refreshToken].token = token
        res.status(200).json(response);        
    } else {
        res.status(404).send('Invalid request')
    }
})

router.use(require('./tokenChecker'))

router.get('/secure', (req,res) => {
    // all secured routes goes here
    res.send('I am secured...')
})

app.use(bodyParser.json())
app.use('/api', router)
app.listen(config.port || process.env.port || 3000);