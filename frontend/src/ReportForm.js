import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ReportForm.css';

function ReportForm() {
  const { entityType, entityId } = useParams();
  const navigate = useNavigate();

  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!reportType) {
      newErrors.reportType = 'Please select a reason for the report.';
    }
    if (reportType === 'other' && !description.trim()) {
      newErrors.description = 'Please provide a description for your report.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const reportData = {
        reporter_id: 'current_user_id_123', // This would come from your auth context
        reported_id: entityId,
        reported_entity: entityType,
        report_type: reportType,
        description: description,
      };
      console.log("Submitting Report:", reportData);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="report-form-page">
        <div className="report-form-container success-message">
          <h2>Thank You!</h2>
          <p>Your report has been submitted and our team will review it shortly.</p>
          <button onClick={() => navigate(-1)} className="submit-btn">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-form-page">
      <form className="report-form-container" onSubmit={handleSubmit} noValidate>
        <div className="report-header">
          <h1>Report Content</h1>
          <p>Help us keep the community safe. Let us know what's wrong.</p>
        </div>

        <div className="form-group">
          <label className="main-label">Reason for reporting*</label>
          <div className="radio-group">
            {['spam', 'bad_words', 'fraud', 'other'].map(type => (
              <label key={type} className="radio-label">
                <input 
                  type="radio" 
                  name="report_type" 
                  value={type}
                  checked={reportType === type}
                  onChange={(e) => setReportType(e.target.value)} 
                />
                <span>{type.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
          {errors.reportType && <p className="error-message">{errors.reportType}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="main-label">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            placeholder="Please provide any additional details that can help us understand the issue."
          />
          {errors.description && <p className="error-message">{errors.description}</p>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="cancel-btn">Cancel</button>
          <button type="submit" className="submit-btn">Submit Report</button>
        </div>
      </form>
    </div>
  );
}

export default ReportForm;