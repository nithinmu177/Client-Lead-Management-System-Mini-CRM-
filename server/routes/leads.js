const express = require('express');
const router = express.Router();
const controller = require('../controllers/leadsController');
const auth = require('../middleware/auth');

router.get('/',       auth, controller.getAllLeads);
router.get('/:id',    auth, controller.getLeadById);
router.post('/',      auth, controller.createLead);
router.put('/:id',     auth, controller.updateLead);
router.delete('/:id',  auth, controller.deleteLead);

module.exports = router;
