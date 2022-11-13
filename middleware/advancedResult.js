const removeFields = require("../utils/request.utils");


const advancedResult = (model, populate) => async (req, res, next) => {
    // remove 'select' from 'query'
    const reqQuery = removeFields(req);

    // Now without 'select' if it was
    let query = JSON.stringify(reqQuery);

    // Create operators (add $)
    query = query.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Do DB query with operators
    let dbQuery = model.find(JSON.parse(query));

    // Do SELECT if exist
    if (req.query.select) {
        const selectedFields = req.query.select.split(',').join(' ');
        dbQuery.select(selectedFields);
    }

    // Do SORT if exist
    if (req.query.sort) {
        const selectedFields = req.query.sort.split(',').join(' ');
        dbQuery.sort(selectedFields);
    }

    // Do pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    dbQuery = dbQuery.skip(startIndex).limit(limit);

    // Do populate if populate
    if (populate) {
        dbQuery = dbQuery.populate(populate)
    }

    // Pagination result
    const pagination = {};

    pagination.totalDocs = total;

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    // Finding resource
    await dbQuery.then(response => {
        res.advancedResults = {
            success: true,
            count: response.length,
            pagination,
            data: response
        }

        next();
    }).catch(err => {
        next(err);
    });


}

module.exports = advancedResult;