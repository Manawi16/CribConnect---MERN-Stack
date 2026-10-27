const Report = require('/models/Report');
const mongoose = require('mongoose');

// Validate ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Allowed enums
const VALID_ENTITY_TYPES = ['landlord', 'tenant', 'property', 'post', 'message'];
const VALID_REPORT_TYPES = ['spam', 'abusive_word', 'fraud', 'didn’t_like', 'other'];

// Create Report
async function createReport(reporter_id, reported_id, data, is_approved = false) {
  const { type, report_type, description } = data;

  // Validate IDs
  if (!isValidObjectId(reporter_id)) {
    throw new Error('Invalid reporter ID');
  }

  if (!isValidObjectId(reported_id)) {
    throw new Error('Invalid reported entity ID');
  }

  // Validate type 
  if (!VALID_ENTITY_TYPES.includes(type)) {
    throw new Error(`Invalid entity type: ${type}`);
  }

  // Validate report_type
  if (!VALID_REPORT_TYPES.includes(report_type)) {
    throw new Error(`Invalid report type: ${report_type}`);
  }

  // Create report
  const report = new Report({
    reporter_id,
    reported_entity: {
      type,
      reported_id
    },
    report_type,
    description: description || '',
    is_approved: !!is_approved
  });

  return await report.save();
}

module.exports = {
  createReport
};
