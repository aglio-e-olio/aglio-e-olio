import React from 'react';

export default function PreviewTagBadge({ datas, title }) {
  return (
    <div class="card-actions" style={{marginTop: 0, marginBottom: 0}}>
      <div class='font-bold'>
      {title} <span> </span>
      {datas.map((tag, index) => (
        <span key={index} class="badge badge-outline flex-initial m-1 font-medium">
          {tag}
        </span>
      ))}
      </div>
    </div>
  );
}
