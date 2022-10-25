const express = require('express');
const { getRootBC, getBCbyID, postBC, deleteBC, putBC } = require("../controllers/bootcamps.controllers");
const router = express.Router();

router.route('/')
    .get(getRootBC)
    .post(postBC)


router.route('/:id')
    .get(getBCbyID)
    .put(putBC)
    .delete(deleteBC)


module.exports = router;
