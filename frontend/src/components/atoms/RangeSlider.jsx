"use client";

import React from "react";

const RangeSlider = ({ label, min = 0, max = 100, value, onChange }) => {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-green-600"
      />
      <div className="text-xs text-gray-500 mt-1">Valor: {value}</div>
    </div>
  );
};

export default RangeSlider;
