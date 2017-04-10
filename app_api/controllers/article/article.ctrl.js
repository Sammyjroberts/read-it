/**
 * Created by sammy on 4/9/17.
 */
const model = require("../../models/article.redis.model");
const helpers = require("../../helpers/ctrl.helpers");
class ArticleCtrl {
    static getOne(req, res) {
        if(!req.params || req.params.id) {
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

    }
    static getAll(req, res) {

    }
    static deleteOne(req, res) {

    }
    static updateOne(req, res) {

    }
}

module.exports =  ArticleCtrl;