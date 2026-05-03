const express = require('express');

const router = express.Router();
const controller = require('../controllers/notesController');
const auth = require('../middleware/auth');

router.get('/:leadId', auth, controller.getNotesByLead);
router.post('/',       auth, controller.createNote);

module.exports = router;
