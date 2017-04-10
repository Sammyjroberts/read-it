const client = require("../../config/redis.client");
const uuidV1 = require('uuid/v1');

/**
 *  Article Model
 *  TODO make this handle persistance to mysql
 *  TODO concider the downsides of uuid as our sql id
 */
//this is how we change testing date outside of the module
let today = todayOrig = function() {
    return new Date();
};

class Article {
    static get ONE_WEEK_IN_SECONDS() {
        return (7*86400);
    }
    static get VOTE_SCORE() {
        return (432);
    }
    static get ARTICLES_PER_PAGE() {
        return (25);
    }

    /**
     *
     * @param user - string of users username TODO refactor
     * @param title
     * @param link
     * @returns {Promise}
     */
    static postArticle(user, title, link) {
        const self = this;
        const now = (today()/1000);
        const id = uuidV1();
        const article= "article:"+id;
        return new Promise((resolve, reject) => {
            client.saddAsync("voted:"+id, user)
            .then(() => {
                const articleData = {
                    title : title,
                    link: link,
                    user: user,
                    now: ''+now,
                    votes: '1'
                };
                return client.hmsetAsync(article, articleData);
            })
            .then(() => {
                return client.zaddAsync('score:', now + self.VOTE_SCORE, article);
            })
            .then(() => {
                return client.zaddAsync('time:', now, article)
            })
            .then(()=> {
                resolve(id);
            })
            .catch((err) => {
                reject(err);
            });
        });
    }

    /**
     *
     * @param user - string TODO refactor
     * @param article
     * @returns {Promise}
     */
    static articleVote(user, article) {
        const self = this;
        return new Promise((resolve, reject) => {
            //calculate voting cutoff time
            const cutOff = (today()/1000) - self.ONE_WEEK_IN_SECONDS;
            client.zscoreAsync("time:", article)
            .then((data) => {
                //get time posted and see if we can still vote
                if(data < cutOff) {
                    const err = new Error();
                    err.message = "cutoff";
                    reject(err);
                }
                else {
                    //get article ID
                    const articleID = article.substring(article.indexOf(':') + 1);

                    //add the user to the set of people who have already voted
                    return client.saddAsync('voted:'+articleID, user)
                }
            })
            .then((result) => {
                if(result === 1) {
                    //update article vote score
                    return client.zincrbyAsync('score:', self.VOTE_SCORE, article);
                }
                else {
                    // they cant vote 2 times
                    reject(user + " already voted for " + article)
                }
            })
            .then(() => {
                //increment vote count
                return client.hincrbyAsync(article, 'votes', 1);
            })
            .then((resp) => {
                resolve(resp);
            })
            .catch((err)=> {
                reject(err);
            });
        });
    }

    /**
     *
     * @param page - current page
     * @param order - method by which we order, defaults to score.
     * @returns {Promise}
     */
    static getArticles(page, order) {
        order = order || 'score:';
        const articles = [];
        const start = (page-1) * this.ARTICLES_PER_PAGE;
        const end = start + this.ARTICLES_PER_PAGE - 1;

        return new Promise((resolve, reject) => {
            client.zrevrangeAsync(order, start, end)
            .then((resp)=> {
                //let count = resp.length;
                const promArr = [];
                resp.forEach((id) => {
                    promArr.push(new Promise((resolve, reject) => {
                        client.hgetallAsync(id)
                        .then((articleData) =>{
                            articleData['id'] = id;
                            articles.push(articleData);
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                    }));

                });
                return Promise.all(promArr);
            })
            .then(() => {
                resolve(articles);
            })
            .catch(err => {
                reject(err);
            });
        });

    }

    /**
     *
     * @param articleID
     * @returns Promise{*}
     */
    static getArticle(articleID) {
        return client.hgetallAsync("article:"+articleID);
    }

    /**
     *
     * @param articleID
     * @param toAdd
     * @param toRemove
     * @returns {Promise.<*>}
     */
    static addRemoveGroups(articleID, toAdd, toRemove) {
        toAdd = toAdd || [];
        toRemove = toRemove || [];
        const article = 'article:' + articleID;

        const promiseArr = [];
        toAdd.forEach(function(group) {
            promiseArr.push(new Promise((resolve, reject) => {
               client.saddAsync('group:' + group, article)
                .then(() => {
                   resolve(null);
                })
                .catch((err) => {
                    reject(err);
                });
            }));
        });

        toRemove.forEach(function(group) {
            promiseArr.push(new Promise((resolve, reject) => {
                client.sremAsync('group:' + group, article)
                .then(() => {
                    resolve(null);
                })
                .catch(err => {
                    reject(err);
                });
            }));
        });
        return Promise.all(promiseArr);
    }

    /**
     *
     * @param group
     * @param page
     * @param order
     * @returns {Promise}
     */
    static getGroupArticles(group, page, order) {
        const self = this;
        return new Promise((resolve, reject) => {
            order = order || 'score:';
            const key = order + group;
            client.existsAsync(key)
            .then(exists => {
                if (!exists) {
                    const args = [key, '2', 'group:' + group, order, 'aggregate', 'max'];
                    client.zinterstoreAsync(args)
                    .then(() => {
                        client.expireAsync(key, 60);
                    })
                    .then(() => {
                        resolve(self.getArticles(page, key));
                    })
                    .catch(err => {
                        reject(err);
                    });
                } else {
                    resolve(self.getArticles(page, key));
                }
            });
        });
    }
    static setToday(f) {
        today = f || todayOrig;
    }
}
module.exports = Article;