import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useUser } from 'src/hooks/useUser';

import './input.css';

// Định nghĩa kiểu dữ liệu cho props
interface PasswordInputProps {
  passwordLabel?: string;
  confirmLabel?: string;
  value?: string;
  onChange?: (value: string) => void;
  onValidStateChange?: (isValid: boolean) => void;
  isEditable?: boolean;
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
  placeholder?: string;
  confirmPlaceholder?: string;
  errorMessages?: {
    minLength?: string;
    match?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
    specialChar?: string;
    required?: string;
  };
  required?: boolean;
  className?: string;
}

// Component PasswordInput
export default function InputPassword({
  passwordLabel = 'Password',
  confirmLabel = 'Confirm Password',
  value = '',
  onChange,
  onValidStateChange,
  isEditable = true,
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumber = true,
  requireSpecialChar = true,
  placeholder = 'Enter Your Password',
  confirmPlaceholder = 'Confirm Your Password',
  errorMessages = {
    minLength: `At least ${minLength} character`,
    match: 'Confirmation password does not match',
    uppercase: 'At least one uppercase character (A-Z)',
    lowercase: 'At least one lowercase character (a-z)',
    number: 'At least one number (0-9)',
    specialChar: 'At least one special character (@, #, !, $, %, &, ...)',
    required: 'This field is required',
  },
  required = true,
  className = '',
}: PasswordInputProps) {
  const { theme } = useUser();
  const [password, setPassword] = useState(value);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formInteracted, setFormInteracted] = useState(false);
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [confirmBlurred, setConfirmBlurred] = useState(false);

  // Cập nhật giá trị khi props thay đổi - FIXED: Không gọi trim() và kiểm tra chính xác
  useEffect(() => {
    setPassword(value);
  }, [value]);

  // Xác thực mật khẩu - FIXED: Loại bỏ logic onChange trong validation
  const validatePasswords = useCallback(() => {
    const errors: string[] = [];

    // Kiểm tra trường bắt buộc
    if (required && !password.trim()) {
      errors.push(errorMessages.required || 'This field is required');
    }

    // Chỉ thực hiện validation nếu có mật khẩu hoặc trường là bắt buộc
    if (password.trim() || required) {
      // Kiểm tra độ dài tối thiểu
      if (password.trim().length < minLength) {
        errors.push(errorMessages.minLength || `At least ${minLength} character`);
      }

      // Kiểm tra chữ hoa
      if (requireUppercase && !/[A-Z]/.test(password.trim())) {
        errors.push(errorMessages.uppercase || 'At least one uppercase character (A-Z)');
      }

      // Kiểm tra chữ thường
      if (requireLowercase && !/[a-z]/.test(password.trim())) {
        errors.push(errorMessages.lowercase || 'At least one lowercase character (a-z)');
      }

      // Kiểm tra chữ số
      if (requireNumber && !/[0-9]/.test(password.trim())) {
        errors.push(errorMessages.number || 'At least one number (0-9)');
      }

      // Kiểm tra ký tự đặc biệt
      if (requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.trim())) {
        errors.push(
          errorMessages.specialChar || 'At least one special character (@, #, !, $, %, &, ...)',
        );
      }
    }

    // Cập nhật các lỗi mật khẩu
    setPasswordErrors(errors);

    // Kiểm tra mật khẩu xác nhận nếu đã nhập
    let matchError = null;
    if (confirmPassword.trim() && password.trim() !== confirmPassword.trim()) {
      matchError = errorMessages.match || 'Confirmation password does not match';
    }
    setConfirmError(matchError);

    // Xác định tính hợp lệ tổng thể
    const valid = errors.length === 0 && !!confirmPassword && password === confirmPassword;

    // Thông báo trạng thái hợp lệ cho component cha
    if (onValidStateChange) {
      onValidStateChange(valid);
    }

    // REMOVED: Logic onChange từ đây để tránh vòng lặp
  }, [
    password,
    confirmPassword,
    required,
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumber,
    requireSpecialChar,
    errorMessages,
    onValidStateChange, // REMOVED: onChange, value từ dependencies
  ]);

  // Validate khi dữ liệu thay đổi và form đã được tương tác
  useEffect(() => {
    if (formInteracted) {
      validatePasswords();
    }
  }, [password, confirmPassword, formInteracted, validatePasswords]);

  // Xử lý khi mật khẩu thay đổi - ADDED: Gọi onChange ở đây thay vì trong validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trimStart();
    setPassword(newValue);
    setPasswordTouched(true);
    setFormInteracted(true);

    // Gọi onChange ngay khi user nhập
    if (onChange) {
      onChange(newValue);
    }
  };

  // Xử lý khi mật khẩu xác nhận thay đổi
  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value.trimStart());
    setConfirmTouched(true);
    setFormInteracted(true);
  };

  // Xử lý các sự kiện focus và blur
  const handlePasswordFocus = () => {
    setPasswordTouched(true);
  };

  const handleConfirmFocus = () => {
    setConfirmTouched(true);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(false);
    setPasswordBlurred(true);
    setFormInteracted(true);
  };

  const handleConfirmBlur = () => {
    setConfirmTouched(false);
    setConfirmBlurred(true);
    setFormInteracted(true);
  };

  return (
    <div className="input_custom-wrapper">
      {/* Trường nhập mật khẩu */}
      <div className="input_custom-wrapper">
        {passwordLabel && (
          <label className={`input_custom-label ${theme === 'dark' ? 'dark-theme' : ''}`}>
            {passwordLabel} {required && <span className="input_custom-label-require-icon">*</span>}
          </label>
        )}

        <div className="input_custom-box">
          {isEditable ? (
            <>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                placeholder={placeholder}
                className={`input_custom-for-typing ${
                  passwordErrors.length > 0 && !passwordTouched && passwordBlurred ? 'invalid' : ''
                } ${className} ${theme === 'dark' ? 'dark-theme' : ''}`}
                disabled={!isEditable}
              />
              <Icon
                icon="solar:eye-broken"
                height="22"
                className={
                  showPassword
                    ? `input_custom-show-password-icon  ${
                        theme === 'dark' ? 'dark-theme text-light' : 'text-dark'
                      }`
                    : `input_custom-show-password-icon ${theme === 'dark' ? 'dark-theme' : ''}`
                }
                onClick={() => setShowPassword(!showPassword)}
              />
            </>
          ) : (
            <div className="input_custom-text-read-only">
              {'•'.repeat(password.trim().length) || 'No data...'}
            </div>
          )}
        </div>

        {passwordErrors.length > 0 && !passwordTouched && passwordBlurred && (
          <div>
            {passwordErrors.map((error, index) => (
              <p key={index} className="input_custom-error">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Trường xác nhận mật khẩu */}
      <div className="input_custom-wrapper">
        {confirmLabel && (
          <label className={`input_custom-label ${theme === 'dark' ? 'dark-theme' : ''}`}>
            {confirmLabel} {required && <span className="input_custom-label-require-icon">*</span>}
          </label>
        )}

        <div className="input_custom-box">
          {isEditable ? (
            <>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmChange}
                onFocus={handleConfirmFocus}
                onBlur={handleConfirmBlur}
                placeholder={confirmPlaceholder}
                className={`input_custom-for-typing ${
                  confirmError && !confirmTouched && confirmBlurred ? 'invalid' : ''
                } ${className} ${theme === 'dark' ? 'dark-theme' : ''}`}
                disabled={!isEditable}
              />
              <Icon
                icon="solar:eye-broken"
                height="22"
                className={
                  showConfirmPassword
                    ? `input_custom-show-password-icon  ${
                        theme === 'dark' ? 'dark-theme text-light' : 'text-dark'
                      }`
                    : `input_custom-show-password-icon ${theme === 'dark' ? 'dark-theme' : ''}`
                }
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </>
          ) : (
            <div className="input_custom-text-read-only">
              {'•'.repeat(confirmPassword.trim().length) || 'No data...'}
            </div>
          )}
        </div>

        {confirmError && !confirmTouched && confirmBlurred && (
          <p className="input_custom-error">{confirmError}</p>
        )}
      </div>
    </div>
  );
}
