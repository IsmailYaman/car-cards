import React from 'react';

type VehicleFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  onRefresh: () => void;
  vehicleTypes: string[];
  vehicleTypeFilter: string;
  onVehicleTypeChange: (value: string) => void;
  brands: string[];
  brandFilter: string;
  onBrandChange: (value: string) => void;
  sortOption: 'default' | 'latestTenaamstelling' | 'oldestTenaamstelling';
  onSortChange: (value: 'default' | 'latestTenaamstelling' | 'oldestTenaamstelling') => void;
  onlyExpiringSoon: boolean;
  onOnlyExpiringSoonChange: (value: boolean) => void;
};

const VehicleFilters = ({
  searchTerm,
  onSearchChange,
  limit,
  onLimitChange,
  onRefresh,
  vehicleTypes,
  vehicleTypeFilter,
  onVehicleTypeChange,
  brands,
  brandFilter,
  onBrandChange,
  sortOption,
  onSortChange,
  onlyExpiringSoon,
  onOnlyExpiringSoonChange,
}: VehicleFiltersProps) => (
  <div className="space-y-4">
    <div className="flex flex-col gap-3 lg:flex-row">
      <input
        type="search"
        placeholder="Zoek op merk, model, kenteken..."
        className="w-full rounded-md border px-3 py-2 text-sm"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <div className="flex gap-2">
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          {[10, 25, 50, 75, 100].map((value) => (
            <option key={value} value={value}>
              Laat {value}
            </option>
          ))}
        </select>
        <button
          onClick={onRefresh}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <select
        className="rounded-md border px-3 py-2 text-sm"
        value={vehicleTypeFilter}
        onChange={(event) => onVehicleTypeChange(event.target.value)}
      >
        <option value="all">Alle voertuigsoorten</option>
        {vehicleTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border px-3 py-2 text-sm"
        value={brandFilter}
        onChange={(event) => onBrandChange(event.target.value)}
      >
        <option value="all">Alle merken</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border px-3 py-2 text-sm"
        value={sortOption}
        onChange={(event) =>
          onSortChange(event.target.value as 'default' | 'latestTenaamstelling' | 'oldestTenaamstelling')
        }
      >
        <option value="latestTenaamstelling">Nieuwste tenaamstelling eerst</option>
        <option value="oldestTenaamstelling">Oudste tenaamstelling eerst</option>
        <option value="default">Oorspronkelijke volgorde</option>
      </select>

      <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={onlyExpiringSoon}
          onChange={(event) => onOnlyExpiringSoonChange(event.target.checked)}
        />
        Alleen APK expiring ≤60d
      </label>
    </div>
  </div>
);

export default VehicleFilters;

