import React from 'react';

export default function DataMapBadge({ data }) {
  let badges = data.map((tag, index) => {
    return (
      <span key={index} class="badge badge-outline mx-0.5">
        {tag}
      </span>
    ); // tag 안에 _id와 value 넣음
  });
  return badges;
}
