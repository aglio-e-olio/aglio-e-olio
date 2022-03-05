import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';

export default function Dropdown({ title, item }) {
  const { searchedData, setSearchedData, keywords, setKeywords } =
    useContext(codeContext);
  const [dropdownOptions, setDropdownOptions] = useState([]);

  useEffect(() => {
    if (title === 'Announcer') item = 'teamMates';
    searchedData.map((data) => {
      setDropdownOptions((prev) => [...new Set([...prev, ...data[item]])]);
    });
  }, [searchedData]);

  function optionClick(e) {
    let beforeKeyword = keywords;
    let keyword = {};
    keyword.key = item;
    keyword.value = e.target.innerHTML;
    setKeywords([...new Set([...beforeKeyword, keyword])]);
  }

  return (
    <>
      <div class="dropdown dropdown-hover">
        <label tabindex="0" class="btn m-1">
          {title}
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          {dropdownOptions &&
            dropdownOptions.map((option, index) => {
              return (
                <li key={index} onClick={optionClick}>
                  <a>{option}</a>
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
}
