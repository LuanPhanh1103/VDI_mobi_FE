import { useState, useEffect } from 'react';
import { useUser } from 'src/hooks/UserContext';

import './input.css';

// Định nghĩa kiểu dữ liệu cho props
interface CustomInputTextProps {
  type?: string;
  label?: string;
  value?: string;
  isEditable?: boolean;
  placeholder?: string;
  minLength?: number;
  existingValues?: string[];
  onChange?: (value: string) => void;
  onValidStateChange?: (isValid: boolean) => void;
  errorMessages?: {
    minLength?: string;
    duplicate?: string;
    required?: string;

    // email
    invalid?: string;
  };
  required?: boolean;
  className?: string;

  // Thêm các props đặc trưng cho email
  allowedDomains?: string[];
}

// email regex + verify
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const validTLDs = ['com', 'net', 'org', 'vn', 'io', 'edu', 'gov'];

export default function InputText({
  type = 'text',
  label,
  value = '',
  isEditable = true,
  placeholder = 'Enter your value...',
  minLength = 0,
  existingValues = [],
  onChange,
  onValidStateChange,
  errorMessages = {
    minLength: 'Minimum length not met',
    duplicate: 'This value already exists',
    required: 'This field is required',

    // email
    invalid: 'Invalid email address',
  },
  required = false,
  className = '',

  //   email
  allowedDomains = [],
}: CustomInputTextProps) {
  const { theme } = useUser();

  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Cập nhật giá trị khi props thay đổi
  useEffect(() => {
    setInputValue(value.trimStart());
  }, [value]);

  // Kiểm tra tính hợp lệ của input
  const validateInput = (val: string): boolean => {
    // Kiểm tra trường bắt buộc
    if (required && !val.trim()) {
      setError(errorMessages.required || 'This field is required');
      return false;
    }

    // Bỏ qua validation nếu không có giá trị và không bắt buộc
    if (!required && !val.trim()) {
      setError(null);
      return true;
    }

    // Kiểm tra độ dài tối thiểu
    if (type === 'text' && val.trim() && val.trim().length < minLength) {
      setError(errorMessages.minLength || `At least ${minLength} characters`);
      return false;
    }

    // Kiểm tra định dạng email
    if (type === 'email' && !EMAIL_REGEX.test(val.trim())) {
      setError(errorMessages.invalid || 'Invalid email address');
      return false;
    }

    if (type === 'email' && val.includes('.')) {
      const tld = val.trim().split('.').pop()?.toLowerCase();
      if (!tld || !validTLDs.includes(tld)) {
        setError(errorMessages.invalid || 'Invalid email address');
        return false;
      }
    }

    // Kiểm tra domain cho phép (nếu có)
    if (type === 'email' && allowedDomains.length > 0) {
      const domain = val.trim().split('@')[1];
      if (!allowedDomains.includes(domain)) {
        setError(`Email must belong to one of the following domains: ${allowedDomains.join(', ')}`);
        return false;
      }
    }

    // Kiểm tra trùng lặp
    if (val.trim() && existingValues.includes(val.trim())) {
      setError(errorMessages.duplicate || 'This value already exists');
      return false;
    }

    setError(null);
    return true;
  };

  // Xử lý khi giá trị thay đổi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setTouched(true);

    const isValid = validateInput(newValue);
    if (onChange) {
      onChange(newValue);
    }

    if (onValidStateChange) {
      onValidStateChange(isValid);
    }
  };

  // Xử lý khi blur input
  const handleBlur = () => {
    setTouched(false);
    validateInput(inputValue);
  };

  return (
    <div className="input_custom-wrapper">
      {label && (
        <label className={`input_custom-label ${theme === 'dark' ? 'dark-theme' : ''}`}>
          {label} {required && <span className="input_custom-label-require-icon">*</span>}
        </label>
      )}

      <div className="input_custom-box">
        {isEditable ? (
          <input
            type={type}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`input_custom-for-typing ${error && !touched && 'invalid'} ${className} ${
              theme === 'dark' ? 'dark-theme' : ''
            }`}
            disabled={!isEditable}
          />
        ) : (
          <div className={`input_custom-text-read-only ${theme === 'dark' ? 'dark-theme' : ''}`}>
            {type === 'password' && inputValue.trim().length !== 0
              ? '•'.repeat(inputValue.trim().length)
              : inputValue.trim().length !== 0
              ? inputValue
              : 'No data...'}
          </div>
        )}
      </div>

      {error && !touched && required && <p className="input_custom-error">{error}</p>}
    </div>
  );
}
