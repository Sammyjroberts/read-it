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
}
module.exports = ControllerHelpers;

