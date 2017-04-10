/**
 * Created by sammy on 4/9/17.
 */
const express = require('express');
const router  = express.Router();
const articleCtrl = require('../../controllers/article/article.ctrl.js');

router.get('/', articleCtrl.getAll);
router.get('/:id', articleCtrl.getOne);
router.post('/', articleCtrl.createOne);
router.put('/:id', articleCtrl.updateOne);
router.delete('/:id', articleCtrl.deleteOne);

module.exports = router;