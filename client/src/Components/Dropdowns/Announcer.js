import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';

export default function Announcer({ title }) {
  const { searchedData, setSearchedData } = useContext(codeContext);
  const [alignedItems, setAlignedItems] = useState([])

  useEffect(() => {
    searchedData.map(item => {
      setAlignedItems([...new Set([...item.teamMates])])
    })
  }, [searchedData])

  function itemClick(e){
    console.log("event", e.target.innerHTML)
    let value = e.target.innerHTML;
    let result = [];
    result = searchedData.filter((data) => {
      if(data.announcer.search(value) !== -1) {
        return true;
      }
      return false;
    });
    setSearchedData(result)
  }


  return (
    <div class="dropdown dropdown-hover">
      <label tabindex="0" class="btn m-1">
        {title}
      </label>
      <ul
        tabindex="0"
        class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        {alignedItems && alignedItems.map((item, index) => {
          return (
            <li key = {index} onClick = {itemClick}>
              <a>{item}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
