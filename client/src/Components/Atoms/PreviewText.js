import React from 'react';

export default function PreviewText({ data, title }) {
  const length = title.length;
  let remMargin = 10 - length;
  return (
    <div class="text-left mb-2">
      <span>{title}</span>
      <span style={{ marginLeft: `${remMargin}rem` }}>{data}</span>
    </div>
  );
}
