import express from 'express'
import { KEY_LOGIC_CONFIG, KEY_SITE_CONFIG } from '../common'

require('dotenv').config()


const PORT = process.env.BACKEND_PORT;
const app = express();

app.get("/" + KEY_LOGIC_CONFIG, async function (req, res) {
    res.send({});
});

app.get("/" + KEY_SITE_CONFIG, async function (req, res) {
    res.send({});
});


app.listen(PORT, () => {
    console.log(`Backend listening at http://localhost:${PORT}`);
});
