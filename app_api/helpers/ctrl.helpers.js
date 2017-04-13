const axios = require("axios");
const cheerio = require('cheerio');
const nodeURL = require("url");


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

    /**
     *  TODO MAKE THIS HANDLE ANY URL relative or absolute, and make sure to use the hostname as the base
     *  I think i made it work
     * @param url
     * @returns {Promise}
     */
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
                const retURL = nodeURL.resolve(url,$("body").find("img")[0].attribs.src);
                console.log(retURL);
                resolve(retURL);
            })
            .catch(err => {
               reject(err);
            });
        });
    }
}
module.exports = ControllerHelpers;

