const axios = require("axios");
const cheerio = require('cheerio');

class ControllerHelpers {
    static generateJsonError(message, statusCode){

        const code = statusCode || 400;

        return {
                "errors": [
                    {
                        "domain": "global",
                        "reason": "Server Error",
                        "message": message
                    }
                ],
                "code": code,
                "message": message
            };
    }
    static sendJsonResponse(res, status, content) {
        res.status(status);
        res.json(content);
    }
    static sendJsonError(res, statusCode, message) {
        module.exports.sendJsonResponse(res, statusCode, this.generateJsonError(message, statusCode));
    }
    static getPageImg(url) {
        return new Promise((resolve, reject) => {
            //get our html
            axios.get(url)
            .then(resp => {
                //html
                const html = resp.data;
                //load into a $
                const $ = cheerio.load(html);
                //find ourself a img
                const src = url + "/" + $("body").find("img")[0].attribs.src;
                //make sure there are no extra slashes
                resolve(src.replace(/([^:]\/)\/+/g, "$1"));
            })
            .catch(err => {
               reject(err);
            });
        });
    }
}
module.exports = ControllerHelpers;

