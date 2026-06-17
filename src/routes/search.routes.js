const express = require('express');
const router = express.Router();
const { searchProfessionals, getSearchSuggestions } = require('../controllers/search.controller');

router.get('/professionals', searchProfessionals);
router.get('/suggestions', getSearchSuggestions);

module.exports = router;
