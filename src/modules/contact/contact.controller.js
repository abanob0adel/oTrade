import ContactUs from './contact.model.js';
import mongoose from 'mongoose';

/**
 * Create contact us request
 * POST /api/contact-us
 * Public
 */
export const createContactRequest = async (req, res) => {
  try {
    const { fullName, phone, country } = req.body;

    // Validation
    if (!fullName || !phone || !country) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: fullName, phone, country'
      });
    }

    // Create contact request
    const contactRequest = await ContactUs.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      country: country.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Contact request submitted successfully',
      data: {
        id: contactRequest._id,
        fullName: contactRequest.fullName,
        phone: contactRequest.phone,
        country: contactRequest.country,
        createdAt: contactRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Create Contact Request Error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to submit contact request'
    });
  }
};

/**
 * Get all contact requests
 * GET /api/contact-us
 * Admin only
 */
export const getAllContactRequests = async (req, res) => {
  try {
    // Pagination support
    const skip = req.pagination?.skip || 0;
    const limit = req.pagination?.limit || 0;

    // Get total count
    const total = await ContactUs.countDocuments();

    // Get contact requests with pagination
    let query = ContactUs.find().sort({ createdAt: -1 });
    
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    const contactRequests = await query;

    // Send response with or without pagination
    if (req.paginatedResponse) {
      res.status(200).json(req.paginatedResponse(contactRequests, total));
    } else {
      res.status(200).json({
        success: true,
        data: contactRequests
      });
    }
  } catch (error) {
    console.error('Get Contact Requests Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contact requests'
    });
  }
};

/**
 * Get contact request by ID
 * GET /api/contact-us/:id
 * Admin only
 */
export const getContactRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact request ID'
      });
    }

    const contactRequest = await ContactUs.findById(id);

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        error: 'Contact request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contactRequest
    });
  } catch (error) {
    console.error('Get Contact Request Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contact request'
    });
  }
};

/**
 * Delete contact request
 * DELETE /api/contact-us/:id
 * Admin only
 */
export const deleteContactRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact request ID'
      });
    }

    const contactRequest = await ContactUs.findByIdAndDelete(id);

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        error: 'Contact request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact request deleted successfully'
    });
  } catch (error) {
    console.error('Delete Contact Request Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact request'
    });
  }
};
