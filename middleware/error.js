const NoSuchObj = "No such ObjectId";

const errMsgs = {
    CastError: NoSuchObj,
    Cast: NoSuchObj,
}

const getErrMsg = (err) => {
    for (const key of Object.keys(errMsgs)) {
        if (err.message.includes(key)) {
            return errMsgs[key]
        }
    }
}

const errorHandler = async (err, req, res, next) => {
    console.error("Err stuck:".bold.bgMagenta, err.stack)
    console.error("Err name:".bold.bgMagenta, Object.keys(err))
    res
        .status(err.statusCode || 500)
        .json({success: false, error: getErrMsg(err) || err.message || "Internal Server Error"});
};

module.exports = errorHandler;