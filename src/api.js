const express = require("express")
const serverless = require("serverless-http")
const request = require("request")
const querystring = require("querystring")

const app = express()
const router = express.Router()

const redirect_uri = process.env.REDIRECT_URI || "http://localhost:9000/.netlify/functions/api/callback"

router.get("/", (req, res) => {
    console.log("hi")
	res.send("Hi from root")
})

router.get("/login", (req, res) => {
    let queryParams = querystring.stringify({
        client_id: process.env.CLIENT_ID,
        response_type: "code",
        redirect_uri: redirect_uri,
        scope: "user-top-read user-modify-playback-state"
    })
    res.redirect("https://accounts.spotify.com/authorize?" + queryParams)
})

router.get("/callback", (req, res) => {
    let code = req.query.code || null
    let requestOptions = {
        url: "https://accounts.spotify.com/api/token",
        form: {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirect_uri
        },
        headers: {
            "Authorization": "Basic " + (Buffer.from(
                process.env.client_id + ":" + process.env.CLIENT_SECRET
            ).toString("base64"))
        },
        json: true
    }
    request.post(requestOptions, (error, response, body) => {
        let accessToken = body.access_token
        let uri = process.env.FRONTEND_URI || "http://localhost:3000/main"
        console.log("Authorization complete!")
        res.redirect(uri + "?" + "access_token=" + accessToken)
    })

})

app.use(`/.netlify/functions/api`, router)

module.exports = app;
module.exports.handler = serverless(app)