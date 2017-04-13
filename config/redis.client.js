/**
 * Created by sammy on 4/9/17.
 */
const redis = require("redis");
const bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
/**
 * 3 is our default db
 */
const client = redis.createClient();
client.select(3, () => {

});

module.exports = client;