import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  getProfile,
  updateProfile
} from './auth.service.js';
import { handleResponse, handleError } from '../../utils/response.js';

/**
 * 📝 Register Controller
 * POST /api/auth/register
 */
const registerController = async (req, res) => {
  try {
    const result = await register(req.body);
    handleResponse(res, 201, result);
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

/**
 * 🔐 Login Controller
 * POST /api/auth/login
 */
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    handleResponse(res, 200, result);
  } catch (error) {
    handleError(res, 401, error.message);
  }
};

/**
 * 📧 Forgot Password Controller
 * POST /api/auth/forgot-password
 */
const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPassword(email);
    handleResponse(res, 200, result);
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

/**
 * 🔄 Reset Password Controller
 * POST /api/auth/reset-password
 */
const resetPasswordController = async (req, res) => {
  try {
    const { code, password } = req.body;
    const result = await resetPassword(code, password);
    handleResponse(res, 200, result);
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

/**
 * 👤 Get Profile Controller
 * GET /api/auth/profile
 */
const getProfileController = async (req, res) => {
  try {
    const userId = req.auth.id;
    const result = await getProfile(userId);
    handleResponse(res, 200, result);
  } catch (error) {
    handleError(res, 404, error.message);
  }
};

/**
 * ✏️ Update Profile Controller
 * PUT /api/auth/profile
 */
const updateProfileController = async (req, res) => {
  try {
    const userId = req.auth.id;
    const result = await updateProfile(userId, req.body);
    handleResponse(res, 200, result);
  } catch (error) {
    handleError(res, 400, error.message);
  }
};




/**
 * 📸 Upload Profile Image Controller
 * POST /api/auth/profile/image
 */
const uploadProfileImageController = async (req, res) => {
  try {
    const userId = req.auth.id;
    
    // Check if file was uploaded (support any field name)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Profile image is required'
      });
    }

    const file = req.files[0]; // Get first file regardless of field name

    // Validate it's an image
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'File must be an image'
      });
    }

    // Import BunnyCDN service
    const bunnyCDN = (await import('../../utils/bunnycdn.js')).default;
    
    // Upload to BunnyCDN - returns URL string
    const imageUrl = await bunnyCDN.uploadFile(
      file.buffer,
      file.originalname,
      'profiles'
    );

    // Update user profile with new image URL
    const result = await updateProfile(userId, { profileImage: imageUrl });
    
    handleResponse(res, 200, {
      ...result,
      uploadedFile: {
        url: imageUrl,
        fileName: file.originalname
      }
    });
  } catch (error) {
    console.error('Upload Profile Image Error:', error);
    handleError(res, 400, error.message);
  }
};



export { 
  registerController as register, 
  loginController as login,
  forgotPasswordController as forgotPassword,
  resetPasswordController as resetPassword,
  getProfileController as getProfile,
  updateProfileController as updateProfile,
  uploadProfileImageController as uploadProfileImage
};