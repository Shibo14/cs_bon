const caseService = require('../services/caseService');
const userService = require('../services/userService');

/**
 * Get all active cases
 */
exports.getCases = async (req, res, next) => {
  try {
    const cases = await caseService.getActiveCases();

    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get case by ID
 */
exports.getCaseById = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseData = await caseService.getCaseById(caseId);

    res.json({
      success: true,
      data: caseData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Open a case
 */
exports.openCase = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID is required'
      });
    }

    const result = await caseService.openCase(user._id, caseId);

    res.json({
      success: true,
      message: 'Case opened successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Insufficient crystals') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
};

/**
 * Get case contents
 */
exports.getCaseContents = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const contents = await caseService.getCaseContents(caseId);

    res.json({
      success: true,
      data: contents
    });
  } catch (error) {
    next(error);
  }
};
