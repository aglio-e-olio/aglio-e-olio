import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';

export default function Announcer({ title }) {
  const { searchedData, setSearchedData } = useContext(codeContext);
  const [beforeItems, setBeforeItems] = useState([]);
  const [alignedItems, setAlignedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    searchedData.map((item) => {
      setAlignedItems([...new Set([...item.teamMates])]);
    });
  }, [searchedData]);

  function itemClick(e) {
    setBeforeItems(searchedData);
    let value = e.target.innerHTML;
    setSelectedItems(prev => [...prev, value])
    let result = [];
    result = searchedData.filter((data) => {
      if (data.announcer.search(value) !== -1) {
        return true;
      }
      return false;
    });
    setSearchedData(result);
  }

  function handleItemBtn(e) {
    let value = e.target.innerHTML
    setSearchedData(beforeItems)
    let index = selectedItems.indexOf(value)
    setSelectedItems(prev => selectedItems.splice(index, 1))
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
      {selectedItems &&
        selectedItems.map((item, index) => {
          return (
            <button key={index} onClick={handleItemBtn} class="btn btn-xs">
              {item}
            </button>
          );
        })}
    </>
  );
}
