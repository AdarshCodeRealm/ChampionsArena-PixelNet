import { Organizer } from '../models/organizer.model.js';

export const isApprovedOrganizer = async (req, res, next) => {
  try {
    const organizer = await Organizer.findById(req.user._id);
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    if (!organizer.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Organizer not approved. Please wait for admin approval.'
      });
    }

    req.organizer = organizer;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking organizer status',
      error: error.message
    });
  }
}; 