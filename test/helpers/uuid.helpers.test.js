/**
 * Created by deanroberts on 4/10/17.
 */
const uuidV1 = require('uuid/v1');
const uuid = require("../../app_api/helpers/uuid.helpers");
const should = require("should");
describe('UUID Helpers', () => {

    describe('UUID - Generate UUID', function() {

        it('should be possible to compact a given uuid', function(done) {
            const id = uuid.generateUUID();
            should.exist(id);
            done();

        });

        it('should be possible to generate a compacted uuid', function(done) {
            const id = "58e0a7d7-eebc-11d8-9669-0800200c9a66";
            const compactID = uuid._compactifyUUID(id);
            compactID.should.equal("11d8eebc58e0a7d796690800200c9a66");
            done();
        });

        it('should be possible to decompactify a uuid', function(done) {
            const id = "58e0a7d7-eebc-11d8-9669-0800200c9a66";
            const compactID = uuid._compactifyUUID(id);
            const decompactedID = uuid.decompactifyUUID(compactID);
            decompactedID.should.equal(id);
            done();
        });

        it('multi-test : should be possible to decompactify a uuid test on 10 random ids', function(done) {
            const ids = [];
            const compactedIDs = [];
            for(let i = 0; i < 10; i++) {
                ids.push(uuidV1());
            }
            for(let i = 0; i < ids.length; i++) {
                compactedIDs.push(uuid._compactifyUUID(ids[i]));
            }
            for(let i = 0; i < ids.length; i++) {
                uuid.decompactifyUUID(compactedIDs[i]).should.equal(ids[i]);
            }
            done();
        });


    });

});