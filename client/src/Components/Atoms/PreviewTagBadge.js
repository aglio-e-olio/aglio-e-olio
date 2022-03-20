import React from 'react';
import DataMapBadge from './DataMapBadge';

export default function PreviewTagBadge({ datas, title }) {
  return (
    <div class="card-actions" style={{ marginTop: 0, marginBottom: 0 }}>
      <div class="font-bold">
        {title} <span> </span>
        <DataMapBadge data={datas} />
      </div>
    </div>
  );
}
