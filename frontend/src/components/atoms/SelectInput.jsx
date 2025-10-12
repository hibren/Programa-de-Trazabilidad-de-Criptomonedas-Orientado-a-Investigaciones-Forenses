"use client";

import React from "react";

const SelectInput = ({ label, placeholder, value, onChange, options = [] }) => {
  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label className="text-sm font-medium mb-1 text-gray-700">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
      >
        <option value="">{placeholder || "Seleccionar..."}</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
