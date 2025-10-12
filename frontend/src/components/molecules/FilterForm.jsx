import React from 'react';
import RangeSlider from "../atoms/RangeSlider";
import DateInput from '../atoms/DateInput';
import Input from '../atoms/Input';
import SelectInput from "../atoms/SelectInput";

const FilterForm = ({ filters, updateFilter }) => {
  const patronesOptions = [
    { value: 'mixing', label: 'Mixing' },
    { value: 'layering', label: 'Layering' },
    { value: 'smurf', label: 'Smurf' },
    { value: 'circular', label: 'Circular' }
  ];

  const transaccionOptions = [
    { value: 'entrada', label: 'Entrada' },
    { value: 'salida', label: 'Salida' },
    { value: 'interna', label: 'Interna' }
  ];

  return (
    <div className="space-y-6">
      <RangeSlider
        label="Rango de Monto (BTC)"
        min={0}
        max={100}
        value={filters.rangoMonto}
        onChange={(val) => updateFilter('rangoMonto', val)}
        unit="BTC"
      />

      <div className="flex gap-4">
        <DateInput
          label="Fecha Inicio"
          value={filters.fechaInicio}
          onChange={(val) => updateFilter('fechaInicio', val)}
        />
        <DateInput
          label="Fecha Fin"
          value={filters.fechaFin}
          onChange={(val) => updateFilter('fechaFin', val)}
        />
      </div>

      <SelectInput
        label="Tipo de Patrón"
        placeholder="Seleccionar patrón..."
        value={filters.tipoPatron}
        onChange={(val) => updateFilter('tipoPatron', val)}
        options={patronesOptions}
      />

      <SelectInput
        label="Tipo de Transacción"
        placeholder="Seleccionar tipo..."
        value={filters.tipoTransaccion}
        onChange={(val) => updateFilter('tipoTransaccion', val)}
        options={transaccionOptions}
      />

      <Input
        label="Dirección Específica"
        placeholder="Ingrese dirección Bitcoin..."
        value={filters.direccion}
        onChange={(val) => updateFilter('direccion', val)}
      />

      <Input
        label="Hash de Transacción"
        placeholder="Ingrese hash de transacción..."
        value={filters.hashTransaccion}
        onChange={(val) => updateFilter('hashTransaccion', val)}
      />
    </div>
  );
};

export default FilterForm;