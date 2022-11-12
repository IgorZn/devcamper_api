const express = require('express');
const {getRootBC, getBCbyID, postBC, deleteBC, putBC, getBCinRadius, uploadBCPhoto} = require("../controllers/bootcamps.controllers");
const router = express.Router();

// Include other resources routes
const courseRouter = require('./courses.routes');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/')
    .get(getRootBC)
    .post(postBC)


router.route('/:id')
    .get(getBCbyID)
    .put(putBC)
    .delete(deleteBC)


router.route('/:id/photo')
    .put(uploadBCPhoto)


router.route('/radius/:zipcode/:distance')
    .get(getBCinRadius)


module.exports = router;
