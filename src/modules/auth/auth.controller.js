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
    const { token, password } = req.body;
    const result = await resetPassword(token, password);
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
    const { profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({
        success: false,
        error: 'Profile image URL is required'
      });
    }


    const result = await updateProfile(userId, { profileImage });
    handleResponse(res, 200, result);
  } catch (error) {
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