import React, { useState } from 'react';
import { TextInput, Button } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { useUser } from 'src/hooks/useUser';

import './Search.css';

interface searchPropType {
  placeholder: string;
  handleSearch: (inputSearch: string) => void;
}

const Search = ({ placeholder, handleSearch }: searchPropType) => {
  const { theme } = useUser();
  const [inputSearch, setInputSearch] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(inputSearch);
    }
  };

  return (
    <div className="search-container">
      <div className={`search-basic ${theme === 'dark' ? 'dark-theme' : ''}`}>
        <TextInput
          id="name"
          type="text"
          placeholder={placeholder}
          className="search-input form-control form-rounded-xl"
          onChange={(e) => setInputSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className={`search-separate ${theme === 'dark' ? 'dark-theme' : ''}`}></span>
        <Button color={'primary'} className="search-btn" onClick={() => handleSearch(inputSearch)}>
          <Icon
            icon="solar:minimalistic-magnifer-outline"
            height="18"
            className="text-light search-btn-icon"
          />
        </Button>
      </div>
    </div>
  );
};

export default Search;
