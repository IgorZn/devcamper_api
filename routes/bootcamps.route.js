const express = require('express');
const router = express.Router();

router.route('/')
    /* GET bootcamps */
    .get(function (req, res, next) {
        res.status(200).json({success: false, msg: 'Show all bootcamps'});
    })


router.route('/:id')
    /* GET bootcamps */
    .get(function (req, res, next) {
        res.status(200).json({success: false, msg: 'Show all bootcamps'});
    })
    /* POST bootcamps */
    .post(function (req, res, next) {
        res.status(200).json({success: false, msg: 'Create new bootcamps'});
    })
    /* PUT bootcamps */
    .put(function (req, res, next) {
        res.status(200).json({success: false, msg: `Display bootcamps ${req.params.id}`});
    })
    /* DELETE bootcamps */
    .delete(function (req, res, next) {
        res.status(200).json({success: false, msg: `Delete bootcamps ${req.params.id}`});
    })



module.exports = router;
