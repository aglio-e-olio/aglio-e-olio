import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';

export default function Dropdown({ title, item }) {
  const { searchedData, setSearchedData, keywords, setKeywords } =
    useContext(codeContext);
  const [alignedItems, setAlignedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (title === 'Announcer') item = 'teamMates';
    searchedData.map((data) => {
      setAlignedItems((prev) => [...new Set([...prev, ...data[item]])]);
    });
  }, [searchedData]);

  function itemClick(e) {
    let value = e.target.innerHTML;
    let keyword = {};
    keyword.key = item;
    keyword.value = value;

    setKeywords([...new Set([...keywords, keyword])]);
  }

  function handleItemBtn(e) {
    let value = e.target.innerHTML;
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
          {alignedItems &&
            alignedItems.map((item, index) => {
              return (
                <li key={index} onClick={itemClick}>
                  <a>{item}</a>
                </li>
              );
            })}
        </ul>
      </div>
      {/* {selectedItems &&
        selectedItems.map((item, index) => {
          return (
            <button key={index} onClick={handleItemBtn} class="btn btn-xs">
              {item}
            </button>
          );
        })} */}
    </>
  );
}
