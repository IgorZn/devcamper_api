const removeFields = (req) => {
    console.log('removeFields, before =>', req.query);

    const reqQuery = { ...req.query}
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach( remove => delete reqQuery[remove] );
    console.log('removeFields, after =>', reqQuery);

    return reqQuery
}

module.exports = removeFields