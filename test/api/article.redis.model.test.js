/**
 * Created by sammy on 4/9/17.
 */
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;

describe('Redis Article Model', () => {
    const client = require("../../config/redis.client.js");
    const model = require("../../app_api/models/article.redis.model");
    const should = require('should');
    before(() => {
        // 15 is our testing db so we dont flush our main DB lol
        client.select(15);
        client.flushdb();
    });

    after(() => {
        client.quit();
    });

    describe('Articles - Post Article', function() {
        it('should be possible to post an article and read it back given the id returned', function(done) {
            const before = new Date().getTime()/1000;
            model.postArticle('username', 'A title', "link", "", 'http://www.google.com')
            .then((id) => {
                return client.hgetallAsync('article:' + id);
            })
            .then((result) => {
                result.title.should.equal('A title');
                result.link.should.equal('http://www.google.com');
                result.user.should.equal('username');
                result.type.should.equal("link");
                result.text.should.equal("");
                parseInt(result.votes, 10).should.equal(1);
                parseFloat(result.dateCreated).should.be.above(before - 0.00001);
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
    });
    describe('Articles - Update Article - Update all', function() {
        it('should be possible to post an article update it then read it', function(done) {
            let respID;
            const before = new Date().getTime()/1000;
            model.postArticle('username', 'A title', "link", "", 'http://www.google.com')
            .then((id) => {
                respID = id;
                const newData = {
                    user:"newuser",
                    title: "newtitle",
                    type: "text",
                    link :"new.com",
                    text: "some text",
                };
                return model.updateArticle(id, newData);
            })
            .then(() => {
                return client.hgetallAsync("article:"+respID);
            })
            .then(result => {
                result.title.should.equal('newtitle');
                result.link.should.equal('new.com');
                result.user.should.equal('newuser');
                result.type.should.equal("text");
                result.text.should.equal("some text");
                parseInt(result.votes, 10).should.equal(1);
                parseFloat(result.dateCreated).should.be.above(before - 0.00001);
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
    });
    describe('Articles - Update Article - Update one', function() {
        it('should be possible to post an article update it then read it', function(done) {
            let respID;
            const before = new Date().getTime()/1000;
            model.postArticle('username', 'A title', "link", "", 'http://www.google.com')
            .then((id) => {
                respID = id;
                const newData = {
                    img: "https://img.com"
                };
                return model.updateArticle(id, newData);
            })
            .then(() => {
                return client.hgetallAsync("article:"+respID);
            })
            .then(result => {
                result.title.should.equal('A title');
                result.link.should.equal('http://www.google.com');
                result.user.should.equal('username');
                result.type.should.equal("link");
                result.text.should.equal("");
                result.img.should.equal("https://img.com");
                parseInt(result.votes, 10).should.equal(1);
                parseFloat(result.dateCreated).should.be.above(before - 0.00001);
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
    });
    describe('Article - Get One', () => {
        beforeEach(() => {
            client.flushdb();
        });
        it('get one article should return the article requested', done => {
            const before = new Date().getTime()/1000;
            model.postArticle('username', 'A title', "link", "", 'http://www.google.com')
            .then((id) => {
                return model.getArticle(id);
            })
            .then((result) => {
                result.title.should.equal('A title');
                result.link.should.equal('http://www.google.com');
                result.user.should.equal('username');
                parseInt(result.votes, 10).should.equal(1);
                parseFloat(result.dateCreated).should.be.above(before - .00001);
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
    });
    describe('Articles - Empty Get', () => {
        beforeEach(() => {
            client.flushdb();
        });
        it('getArticles should return empty list when db is empty', (done) => {
            model.getArticles(1, null)
            .then((articles) => {
                articles.length.should.equal(0);
                done();
            })
            .catch((err)=> {
                done(err);
            });
        });
    });

    describe('Article - Vote and Get', function() {
        let ids;
        const voteForArticles = function(done) {
            model.articleVote('user2', 'article:' + ids[1])
            .then(() => {
                return model.articleVote('user2', 'article:' + ids[2]);
            })
            .then(() => {
                return model.articleVote('user3', 'article:' + ids[2]);
            })
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err.message);
            });
        };
        beforeEach((done) => {
            ids = [];
            const cb = function(err, id) {
                ids.push(id);
                if (ids.length === 3) {
                    voteForArticles(done);
                }
            };

            client.flushdb(); // Empty db so we know what's there

            model.postArticle('username', 'a0', 'link0', "", "")
            .then((id) => {
                cb(null,id);
            })
            .catch((err) => {
                done(err);
            });
            model.postArticle('username', 'a1', 'link1', "", "")
            .then((id) => {
                cb(null,id);
            })
            .catch((err) => {
                done(err);
            });
            model.postArticle('username', 'a2', 'link1', "", "")
            .then((id) => {
                cb(null,id);
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should return articles sorted according to number of votes', function(done) {
            model.getArticles(1, null)
            .then((articles) => {
                articles.length.should.equal(3);

                articles[0].id.should.equal('article:' + ids[2]);
                parseInt(articles[0].votes, 10).should.equal(3);

                articles[1].id.should.equal('article:' + ids[1]);
                parseInt(articles[1].votes, 10).should.equal(2);

                articles[2].id.should.equal('article:' + ids[0]);
                parseInt(articles[2].votes, 10).should.equal(1);

                done();
            });
        });

        it('should not be possible to vote for the same article twice', function(done) {
            model.articleVote('user2', 'article:' + ids[1])
            .then(() => {
                done("could vote twice");
            })
            .catch((err) => {
                should.exist(err);
                err.should.equal('user2 already voted for article:' + ids[1]);
                done();
            });
        });

    });
    describe('Articles - Vote after cutoff', function() {
        let articleID;
        beforeEach(function(done) {
            model.postArticle('username', 'a0', 'link0', "", "")
            .then((id) => {
                articleID = id;
                // Set today to be one week and one millisecond later
                model.setToday(function() {
                    return new Date(new Date().getTime() + model.ONE_WEEK_IN_SECONDS * 1000 + 1);
                });
                done();
            })
            .catch((err) =>{
                done(err);
            });
        });
        afterEach(function() {
            model.setToday();
        });

        it('should not be possible to vote for an article after the cutoff', function(done) {
            model.articleVote('user2', 'article:' + articleID)
            .then(() => {
                done("can vote post cuttoff date, no bueno!");
            })
            .catch((err) => {
                should.exist(err);
                err.should.be.an.instanceOf(Error);
                err.message.should.equal('cutoff');
                done();
            });
        });

    });

    describe('Groups - create and remove', function() {

        beforeEach(function(done) {
            model.addRemoveGroups('1', ['x'], null)
            .then(() => {
                done();
            })
            .catch(err => {
                done(err);
            });
        });

        it('should be possible to create group0', function(done) {
            model.addRemoveGroups('1', ['group0'], [])
            .then(() => {
                return client.smembersAsync('group:group0');
            })
            .then((result)=> {
                result.length.should.equal(1);
                result[0].should.equal('article:1');
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
        it('should be possible to remove group x', function(done) {
            model.addRemoveGroups('1', undefined, ['x'])
            .then(() => {
                return client.smembersAsync('group:x');
            })
            .then(result => {
                result.length.should.equal(0);
                done();
            })
            .catch(err => {
                done(err);
            });
        });
        it('should be possible to add group1 and remove group x at the same time', function(done) {
            model.addRemoveGroups('1', ['group1'], ['x'])
            .then(() => {
                return client.smembersAsync('group:group1');
            })
            .then(result => {
                result.length.should.equal(1);
                result[0].should.equal('article:1');

                return client.smembersAsync('group:x');
            })
            .then(result => {
                result.length.should.equal(0);
                done();
            })
            .catch(err => {
                done(err);
            });
        });
    });

    describe('Groups', function() {

        let ids;
        const addGroups = function(done) {
            model.addRemoveGroups(ids[0], ['g0', 'g1'], null)
            .then(() => {
                return model.addRemoveGroups(ids[1], ['g1'], null);
            })
            .then(() => {
                return model.addRemoveGroups(ids[2], ['g0', 'g1', 'g2'], null);
            })
            .then(() => {
                done();
            })
            .catch(err => {
                done(err);
            });
        };
        const voteForArticles = function(done) {
            model.articleVote('user2', 'article:' + ids[1])
            .then(() => {
                return model.articleVote('user2', 'article:' + ids[2]);
            })
            .then(() => {
                return model.articleVote('user3', 'article:' + ids[2]);
            })
            .then(() => {
                addGroups(done);
            })
            .catch(err => {
                done(err);
            });
        };
        beforeEach(function(done) {
            ids = [];
            const cb = function(id) {
                ids.push(id);
                if (ids.length === 3) {
                    voteForArticles(done);
                }
            };

            client.flushdb(); // Empty db so we know what's there
            const promArr = [];
            promArr.push(model.postArticle('username', 'a0', 'link0', "", ""));
            promArr.push(model.postArticle('username', 'a1', 'link1', "", ""));
            promArr.push(model.postArticle('username', 'a2', 'link1', "", ""));
            Promise.all(promArr)
            .then(response => {
                response.forEach((id) => {
                    cb(id);
                });
            })
            .catch(err => {
                done(err);
            });
        });

        it('group g0 should contain article 2 and 0', function(done) {
            model.getGroupArticles('g0', 1, null)
            .then((articles) => {
                articles.length.should.equal(2);
                articles[0].id.should.equal('article:' + ids[2]);
                articles[1].id.should.equal('article:' + ids[0]);
                done();
            })
            .catch(err => {
                done(err);
            });
        });

        it('group g1 should contain all three articles', function(done) {
            model.getGroupArticles('g1', 1, null)
            .then(articles => {
                articles.length.should.equal(3);
                articles[0].id.should.equal('article:' + ids[2]);
                articles[1].id.should.equal('article:' + ids[1]);
                articles[2].id.should.equal('article:' + ids[0]);
                done();
            })
            .catch(err => {
                done(err);
            });
        });

        it('group g2 should only contain article 1', function(done) {
            model.getGroupArticles('g2', 1, null)
            .then(articles => {
                articles.length.should.equal(1);
                articles[0].id.should.equal('article:' + ids[2]);
                done();
            })
            .catch(err => {
                done(err);
            });
        });

    });

});