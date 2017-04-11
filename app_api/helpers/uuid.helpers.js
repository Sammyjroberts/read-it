/**
 * Created by deanroberts on 4/10/17.
 */
const uuidV1 = require('uuid/v1');

class SequentialCompactUUID {
    /**
     * This function will generate a compacts, semi-sequential UUID.
     * @returns {string}
     * @type compactedUUID
     */
    static generateUUID() {
        const id = uuidV1();
        return this._compactifyUUID(id).trim();
    }

    /**
     * This function will take a expanded uuid and turn it into a compact uuic
     * @private - only exposed for testing purposes
     * @param uuid
     * @returns compactedUUID
     */
    static _compactifyUUID(uuid) {
        const parts = uuid.split('-');
        return parts[2] + parts[1] +parts[0] + parts[3] + parts[4];
    }

    /**
     * This function will expand a uuid to a more "human readable" and standard form.
     * @param compactID - compactedUUID
     * @returns expandedUUID
     */
    static decompactifyUUID(compactID) {
        return compactID.substring(8,16) + "-" +compactID.substring(4,8) + "-" +
            compactID.substring(0,4)+ "-" +compactID.substring(16,20)+ "-" +compactID.substring(20, 33);
    }
}

module.exports = SequentialCompactUUID;