import React from 'react';

export default function PreviewText({ data, title }) {
  return (
    <div class="text-left mb-2">
      <span>{title}</span>
      {title === 'Update Time' ? (
        <span style={{ marginLeft: '1rem' }}>{data}</span>
      ) : (
        <span style={{ marginLeft: '2.2rem' }}>{data}</span>
      )}
    </div>
  );
}
