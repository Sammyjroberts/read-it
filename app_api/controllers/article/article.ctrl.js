/**
 * Created by sammy on 4/9/17.
 */
const model = require("../../models/article.redis.model");
const helpers = require("../../helpers/ctrl.helpers");
class ArticleCtrl {
    /**
     *
     * @param req - @type {request} Express Request
     * @param res - @type {response} Express Response
     */
    static getOne(req, res) {
        console.log(req.params);
        if(!req.params || !req.params.id) {
            helpers.sendJsonError(res, 404, "no uri found, or potentially missing id in request");
        }
        else {
            model.getArticle(req.params.id)
            .then(article => {
                helpers.sendJsonResponse(res, 200, article);
            })
            .catch(err => {
                helpers.sendJsonError(res, 404, "data not found: " + err);
            });
        }
    }
    static createOne(req, res) {
        const user = req.body.user || "";
        const title = req.body.title || "";
        const type = req.body.type || "";
        const text = req.body.text || "";
        const link = req.body.link || "";
        let ID;
        model.postArticle(user, title, type, text,link)
        .then( resp => {
            ID = resp;
            helpers.sendJsonResponse(res, 200, {id: ID});
            return helpers.getPageImg(link);
        })
        .then(imgSrc => {
            return model.updateArticle(ID, {img: imgSrc});
        })
        .then(resp => {
            console.log(resp);
        })
        .catch(err => {
            helpers.sendJsonError(res, 422, err.message);
        });

    }
    static getAll(req, res) {

    }
    static deleteOne(req, res) {

    }
    static updateOne(req, res) {

    }
}

module.exports =  ArticleCtrl;