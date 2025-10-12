"use client";

import React from "react";

const DateInput = ({ label, value, onChange, min, max }) => {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
      />
    </div>
  );
};

export default DateInput;
