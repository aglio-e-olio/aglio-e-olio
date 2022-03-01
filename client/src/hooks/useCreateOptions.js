import React, { useCallback } from 'react';

export default function useCreateOptions() {
  useCallback(
    (inputValue) => {
      const newValue = { value: inputValue.toLowerCase(), label: inputValue };
      setAlgorithmOptions([...algorithmOptions, newValue]);
    },
    [algorithmOptions]
  );
  return <div>useCreateOptions</div>;
}
