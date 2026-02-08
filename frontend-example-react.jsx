/**
 * 📚 React Component Example - Create Book with Direct Upload
 * Complete implementation for uploading files directly to BunnyCDN
 */

import React, { useState } from 'react';
import axios from 'axios';

const CreateBookForm = () => {
  const [formData, setFormData] = useState({
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    content: { en: '', ar: '' },
    coverImageUrl: '',
    pdfUrl: '',
    isActive: true
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    cover: 0,
    pdf: 0
  });
  const [errors, setErrors] = useState({});

  const API_BASE_URL = 'https://your-api.com/api';
  const TOKEN = localStorage.getItem('token');

  /**
   * 🔐 Get upload URL from backend
   */
  const getUploadUrl = async (file, fileType, category) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/upload/generate-url`,
        {
          fileName: file.name,
          fileType,
          category,
          fileSize: file.size
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`
          }
        }
      );

      return data.data;
    } catch (error) {
      console.error('Failed to get upload URL:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to generate upload URL'
      );
    }
  };

  /**
   * 📤 Upload file directly to BunnyCDN
   */
  const uploadToBunny = async (file, uploadData, progressKey) => {
    try {
      await axios.put(uploadData.uploadUrl, file, {
        headers: {
          'AccessKey': uploadData.headers.AccessKey,
          'Content-Type': uploadData.headers['Content-Type']
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(prev => ({
            ...prev,
            [progressKey]: percent
          }));
        }
      });

      return uploadData.fileUrl;
    } catch (error) {
      console.error('Failed to upload to BunnyCDN:', error);
      throw new Error('Failed to upload file to CDN');
    }
  };

  /**
   * 🖼️ Handle cover image upload
   */
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, cover: 'Only JPG and PNG images are allowed' });
      return;
    }

    // Validate file size (10MB max for images)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, cover: 'Image size must be less than 10MB' });
      return;
    }

    setUploading(true);
    setErrors({ ...errors, cover: null });

    try {
      // Step 1: Get upload URL
      const uploadData = await getUploadUrl(file, 'image', 'books');

      // Step 2: Upload to BunnyCDN
      const coverUrl = await uploadToBunny(file, uploadData, 'cover');

      // Step 3: Update form data
      setFormData({ ...formData, coverImageUrl: coverUrl });

      alert('✅ Cover image uploaded successfully!');
    } catch (error) {
      setErrors({ ...errors, cover: error.message });
      alert('❌ Failed to upload cover image');
    } finally {
      setUploading(false);
      setUploadProgress({ ...uploadProgress, cover: 0 });
    }
  };

  /**
   * 📄 Handle PDF upload
   */
  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setErrors({ ...errors, pdf: 'Only PDF files are allowed' });
      return;
    }

    // Validate file size (200MB max)
    if (file.size > 200 * 1024 * 1024) {
      setErrors({ ...errors, pdf: 'PDF size must be less than 200MB' });
      return;
    }

    setUploading(true);
    setErrors({ ...errors, pdf: null });

    try {
      // Step 1: Get upload URL
      const uploadData = await getUploadUrl(file, 'pdf', 'books');

      // Step 2: Upload to BunnyCDN
      const pdfUrl = await uploadToBunny(file, uploadData, 'pdf');

      // Step 3: Update form data
      setFormData({ ...formData, pdfUrl });

      alert('✅ PDF uploaded successfully!');
    } catch (error) {
      setErrors({ ...errors, pdf: error.message });
      alert('❌ Failed to upload PDF');
    } finally {
      setUploading(false);
      setUploadProgress({ ...uploadProgress, pdf: 0 });
    }
  };

  /**
   * 📝 Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.en && !formData.title.ar) {
      alert('Please provide at least one title (English or Arabic)');
      return;
    }

    if (!formData.coverImageUrl) {
      alert('Please upload a cover image');
      return;
    }

    if (!formData.pdfUrl) {
      alert('Please upload a PDF file');
      return;
    }

    try {
      setUploading(true);

      // Create book with uploaded URLs
      const { data } = await axios.post(
        `${API_BASE_URL}/books`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('✅ Book created successfully!');
      console.log('Created book:', data);

      // Reset form
      setFormData({
        title: { en: '', ar: '' },
        description: { en: '', ar: '' },
        content: { en: '', ar: '' },
        coverImageUrl: '',
        pdfUrl: '',
        isActive: true
      });

    } catch (error) {
      console.error('Failed to create book:', error);
      alert('❌ Failed to create book: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="create-book-form" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>📚 Create New Book</h1>

      <form onSubmit={handleSubmit}>
        {/* Cover Image Upload */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            🖼️ Cover Image *
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleCoverUpload}
            disabled={uploading}
            style={{ display: 'block', marginBottom: '10px' }}
          />
          {uploadProgress.cover > 0 && (
            <div>
              <progress value={uploadProgress.cover} max="100" style={{ width: '100%' }} />
              <span> {uploadProgress.cover}%</span>
            </div>
          )}
          {errors.cover && <p style={{ color: 'red' }}>{errors.cover}</p>}
          {formData.coverImageUrl && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={formData.coverImageUrl}
                alt="Cover preview"
                style={{ maxWidth: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <p style={{ color: 'green' }}>✅ Cover uploaded</p>
            </div>
          )}
        </div>

        {/* PDF Upload */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            📄 PDF File *
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePDFUpload}
            disabled={uploading}
            style={{ display: 'block', marginBottom: '10px' }}
          />
          {uploadProgress.pdf > 0 && (
            <div>
              <progress value={uploadProgress.pdf} max="100" style={{ width: '100%' }} />
              <span> {uploadProgress.pdf}%</span>
            </div>
          )}
          {errors.pdf && <p style={{ color: 'red' }}>{errors.pdf}</p>}
          {formData.pdfUrl && (
            <p style={{ color: 'green' }}>✅ PDF uploaded successfully</p>
          )}
        </div>

        {/* Title - English */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Title (English) *
          </label>
          <input
            type="text"
            value={formData.title.en}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: { ...formData.title, en: e.target.value }
              })
            }
            placeholder="Enter book title in English"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        {/* Title - Arabic */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Title (Arabic) *
          </label>
          <input
            type="text"
            value={formData.title.ar}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: { ...formData.title, ar: e.target.value }
              })
            }
            placeholder="أدخل عنوان الكتاب بالعربية"
            style={{ width: '100%', padding: '8px', fontSize: '16px', direction: 'rtl' }}
          />
        </div>

        {/* Description - English */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description (English)
          </label>
          <textarea
            value={formData.description.en}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: { ...formData.description, en: e.target.value }
              })
            }
            placeholder="Enter book description in English"
            rows="4"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        {/* Description - Arabic */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description (Arabic)
          </label>
          <textarea
            value={formData.description.ar}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: { ...formData.description, ar: e.target.value }
              })
            }
            placeholder="أدخل وصف الكتاب بالعربية"
            rows="4"
            style={{ width: '100%', padding: '8px', fontSize: '16px', direction: 'rtl' }}
          />
        </div>

        {/* Content - English */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Content (English)
          </label>
          <textarea
            value={formData.content.en}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: { ...formData.content, en: e.target.value }
              })
            }
            placeholder="Enter book content in English"
            rows="6"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        {/* Content - Arabic */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Content (Arabic)
          </label>
          <textarea
            value={formData.content.ar}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: { ...formData.content, ar: e.target.value }
              })
            }
            placeholder="أدخل محتوى الكتاب بالعربية"
            rows="6"
            style={{ width: '100%', padding: '8px', fontSize: '16px', direction: 'rtl' }}
          />
        </div>

        {/* Active Status */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontWeight: 'bold' }}>Active (visible to users)</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !formData.coverImageUrl || !formData.pdfUrl}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: uploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? '⏳ Processing...' : '✅ Create Book'}
        </button>
      </form>

      {/* Instructions */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>📋 Instructions:</h3>
        <ol>
          <li>Upload cover image (JPG/PNG, max 10MB)</li>
          <li>Upload PDF file (max 200MB)</li>
          <li>Fill in book details (at least one language)</li>
          <li>Click "Create Book"</li>
        </ol>
        <p><strong>Note:</strong> Files are uploaded directly to BunnyCDN, not through the backend server.</p>
      </div>
    </div>
  );
};

export default CreateBookForm;
