import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from 'src/hooks/useUser';

// Định nghĩa kiểu dữ liệu cho option
export type OptionValue = string | number;

export interface OptionObject {
  value: OptionValue;
  label: string;
}

// Kiểu dữ liệu cho mỗi option có thể là string, number hoặc object
export type Option = OptionValue | OptionObject;

// Props của component Select
interface SelectProps {
  options: Option[];
  defaultValue?: OptionValue | OptionValue[];
  onChange?: (value: OptionValue | OptionValue[]) => void;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
}

const InpuSelect: React.FC<SelectProps> = ({
  options = [],
  defaultValue = '',
  onChange = () => {},
  placeholder = 'Chọn một giá trị',
  label = '',
  multiple = false,
}) => {
  const { theme } = useUser();

  // Khởi tạo state tùy thuộc vào multiple
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<OptionValue | null>(
    multiple ? null : (defaultValue as OptionValue),
  );
  const [selectedOptions, setSelectedOptions] = useState<OptionValue[]>(
    multiple && Array.isArray(defaultValue)
      ? defaultValue
      : multiple && !Array.isArray(defaultValue) && defaultValue
      ? [defaultValue as OptionValue]
      : [],
  );
  // Thêm state cho search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);

  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Thêm useEffect để filter options khi searchTerm thay đổi
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) => {
        const label = isOptionObject(option) ? option.label : String(option);
        return label.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Thêm useEffect để focus vào search input khi dropdown mở
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: OptionValue): void => {
    if (multiple) {
      let newSelectedOptions: OptionValue[];

      if (selectedOptions.includes(option)) {
        // Nếu option đã được chọn, loại bỏ nó
        newSelectedOptions = selectedOptions.filter((item) => item !== option);
      } else {
        // Nếu option chưa được chọn, thêm vào
        newSelectedOptions = [...selectedOptions, option];
      }

      setSelectedOptions(newSelectedOptions);
      onChange(newSelectedOptions);
    } else {
      // Single select
      setSelectedOption(option);
      onChange(option);
      setIsOpen(false);
      // Reset search khi đóng dropdown
      setSearchTerm('');
    }
  };

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
    // Reset search khi đóng dropdown
    if (isOpen) {
      setSearchTerm('');
    }
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search khi đóng dropdown
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if an option is an object or primitive
  const isOptionObject = (option: Option): option is OptionObject => {
    return typeof option === 'object' && option !== null;
  };

  // Lấy label cho hiển thị
  const getSelectedLabel = (): string => {
    if (multiple) {
      if (selectedOptions.length === 0) {
        return placeholder;
      }

      if (selectedOptions.length === 1) {
        const option = options.find((opt) =>
          isOptionObject(opt) ? opt.value === selectedOptions[0] : opt === selectedOptions[0],
        );

        if (!option) return placeholder;
        return isOptionObject(option) ? option.label : String(option);
      }

      return `${selectedOptions.length} group(s) selected`;
    } else {
      // Single select
      if (selectedOption === undefined || selectedOption === null || selectedOption === '') {
        return placeholder;
      }

      const selectedItem = options.find((item) =>
        isOptionObject(item) ? item.value === selectedOption : item === selectedOption,
      );

      if (!selectedItem) {
        return placeholder;
      }

      return isOptionObject(selectedItem) ? selectedItem.label : String(selectedItem);
    }
  };

  // Kiểm tra xem một option có được chọn hay không
  const isOptionSelected = (optionValue: OptionValue): boolean => {
    if (multiple) {
      return selectedOptions.includes(optionValue);
    }
    return selectedOption === optionValue;
  };

  // Xóa tất cả các giá trị đã chọn (chỉ dùng cho multiple)
  const clearAll = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedOptions([]);
    onChange([]);
  };

  // Xử lý khi search input thay đổi
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  // Xử lý khi nhấn phím trong search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    // Ngăn không cho dropdown đóng khi nhấn phím
    e.stopPropagation();
  };

  return (
    <div className="input_custom-wrapper">
      {label && (
        <label className={`input_custom-label ${theme === 'dark' ? 'dark-theme' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative" ref={selectRef}>
        <div
          className={`input_select_custom flex items-center justify-between w-full px-4 py-2.5 bg-white border rounded-md
             ${theme === 'dark' ? 'dark-theme' : ''}`}
          onClick={toggleDropdown}
        >
          <div
            className={`flex-grow truncate text-dark input_select_custom-value ${
              theme === 'dark' ? 'dark-theme' : ''
            }`}
          >
            {getSelectedLabel()}
          </div>
          <div className="flex items-center">
            {multiple && selectedOptions.length > 0 && (
              <button
                onClick={clearAll}
                className="mr-2 text-gray-400 hover:text-gray-600"
                title="Xóa tất cả"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              <Icon
                icon="solar:alt-arrow-up-line-duotone"
                height="18"
                className="hover:text-gray-600"
              />
            </div>
          </div>
        </div>

        {isOpen && (
          <div
            className={`input_select_custom-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden
            ${theme === 'dark' ? 'dark-theme' : ''}
          `}
          >
            {/* Thêm thanh search */}
            <div
              className={`input_select_custom-search-wrapper p-2 border-b border-gray-200 ${
                theme === 'dark' ? 'dark-theme' : ''
              }`}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search..."
                className={`input_select_custom-search-option ${
                  theme === 'dark' ? 'dark-theme' : ''
                }`}
              />
            </div>

            {/* Danh sách options đã được filter */}
            <div className="max-h-48 overflow-auto option-list-wrapper">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-2 text-gray-500">
                  {options.length === 0 ? 'Loading...' : 'Không tìm thấy kết quả'}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const value = isOptionObject(option) ? option.value : option;
                  const label = isOptionObject(option) ? option.label : String(option);
                  const isSelected = isOptionSelected(value);

                  return (
                    <div
                      key={index}
                      className={`input_select_custom-option-item px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                        isSelected
                          ? theme !== 'dark'
                            ? 'bg-blue-50 text-blue-600'
                            : 'input_select_custom-option-selected'
                          : ''
                      } ${theme === 'dark' ? 'dark-theme' : ''}`}
                      onClick={() => handleSelect(value)}
                    >
                      <div className="flex items-center">
                        {multiple && (
                          <div className="mr-2 flex items-center justify-center">
                            <div
                              className={`w-4 h-4 border ${
                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                              } rounded flex items-center justify-center`}
                            >
                              {isSelected && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-white"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        )}
                        <span>{label}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InpuSelect;
