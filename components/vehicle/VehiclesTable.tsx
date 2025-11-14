import React from 'react';
import type { TableColumn, Vehicle } from '@/lib/vehicles';

type VehiclesTableProps = {
  columns: TableColumn[];
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelect: (vehicle: Vehicle) => void;
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
};

const VehiclesTable = ({
  columns,
  vehicles,
  selectedVehicle,
  onSelect,
  loading,
  error,
  emptyMessage = 'Geen resultaten. Pas je filters of zoekterm aan.',
}: VehiclesTableProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-sm text-gray-600">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
        Gegevens laden...
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {vehicles.map((vehicle, idx) => {
              const isActive = selectedVehicle?.kenteken === vehicle.kenteken;
              return (
                <tr
                  key={`${vehicle.kenteken}-${idx}`}
                  className={`cursor-pointer transition-colors ${
                    isActive ? 'bg-blue-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50`}
                  onClick={() => onSelect(vehicle)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                      {column.render ? column.render(vehicle) : vehicle[column.key] ?? 'n.v.t.'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {vehicles.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          {emptyMessage}
        </div>
      )}
    </>
  );
};

export default VehiclesTable;

