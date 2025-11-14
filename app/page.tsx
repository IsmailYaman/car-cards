'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/vehicle/StatCard';
import VehicleDetailsCard from '@/components/vehicle/VehicleDetailsCard';
import VehicleFilters from '@/components/vehicle/VehicleFilters';
import KentekenLookup from '@/components/vehicle/KentekenLookup';
import VehiclesTable from '@/components/vehicle/VehiclesTable';
import {
  Vehicle,
  TableColumn,
  RDW_DATASET_ENDPOINT,
  parseDateToNumber,
  parseRdwDate,
  formatDate,
  cleanKenteken,
  isApkExpiringSoon,
  createRdwUrl,
  MS_IN_DAY,
} from '@/lib/vehicles';

const Home = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(50);
  const [sortOption, setSortOption] = useState<'default' | 'latestTenaamstelling' | 'oldestTenaamstelling'>(
    'latestTenaamstelling'
  );
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [onlyExpiringSoon, setOnlyExpiringSoon] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [kentekenQuery, setKentekenQuery] = useState('');
  const [kentekenResult, setKentekenResult] = useState<Vehicle | null>(null);
  const [kentekenLoading, setKentekenLoading] = useState(false);
  const [kentekenError, setKentekenError] = useState<string | null>(null);

  const fetchVehicleData = useCallback(async () => {
    setLoading(true);
    try {
      const url = createRdwUrl({
        $limit: String(limit),
        $order: 'datum_tenaamstelling DESC',
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data: Vehicle[] = await response.json();
      setVehicles(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch vehicle data:', err);
      setError('Live RDW data kon niet worden opgehaald. Voorbeeldgegevens worden getoond.');
      setVehicles(sampleData);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]);

  const vehicleTypes = useMemo(() => {
    const unique = new Set<string>();
    vehicles.forEach((vehicle) => {
      if (vehicle.voertuigsoort) unique.add(vehicle.voertuigsoort);
    });
    return Array.from(unique).sort();
  }, [vehicles]);

  const brands = useMemo(() => {
    const unique = new Set<string>();
    vehicles.forEach((vehicle) => {
      if (vehicle.merk) unique.add(vehicle.merk);
    });
    return Array.from(unique).sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !normalizedTerm ||
        Object.values(vehicle).some((value) => value?.toString().toLowerCase().includes(normalizedTerm));
      const matchesType = vehicleTypeFilter === 'all' || vehicle.voertuigsoort === vehicleTypeFilter;
      const matchesBrand = brandFilter === 'all' || vehicle.merk === brandFilter;
      const matchesExpiry = !onlyExpiringSoon || isApkExpiringSoon(vehicle);
      return matchesSearch && matchesType && matchesBrand && matchesExpiry;
    });
  }, [vehicles, searchTerm, vehicleTypeFilter, brandFilter, onlyExpiringSoon]);

  const sortedVehicles = useMemo(() => {
    if (sortOption === 'default') {
      return filteredVehicles;
    }

    const list = [...filteredVehicles];

    list.sort((a, b) => {
      const dateA = parseDateToNumber(a.datum_tenaamstelling);
      const dateB = parseDateToNumber(b.datum_tenaamstelling);

      if (dateA === dateB) return 0;
      if (dateA === null) return 1;
      if (dateB === null) return -1;

      return sortOption === 'latestTenaamstelling' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [filteredVehicles, sortOption]);

  useEffect(() => {
    if (!sortedVehicles.length) {
      setSelectedVehicle(null);
      return;
    }

    setSelectedVehicle((current) => {
      if (current && sortedVehicles.some((vehicle) => vehicle.kenteken === current.kenteken)) {
        return current;
      }
      return sortedVehicles[0];
    });
  }, [sortedVehicles]);

  const vehicleStats = useMemo(() => {
    if (!vehicles.length) {
      return [
        { label: 'Records shown', value: '0', helper: 'Fetch data to begin' },
        { label: 'Latest tenaamstelling', value: 'n.v.t.', helper: 'No data yet' },
        { label: 'Avg registration age', value: 'n.v.t.', helper: 'Waiting for RDW data' },
        { label: 'APK expiring ≤60d', value: '0', helper: 'Toggle once data is loaded' },
      ];
    }

    const newest = filteredVehicles.reduce<{ vehicle: Vehicle | null; date: Date | null }>(
      (acc, vehicle) => {
        const date = parseRdwDate(vehicle.datum_tenaamstelling);
        if (!date) return acc;
        if (!acc.date || date > acc.date) {
          return { vehicle, date };
        }
        return acc;
      },
      { vehicle: null, date: null }
    );

    const ages = filteredVehicles
      .map((vehicle) => {
        const date = parseRdwDate(vehicle.datum_tenaamstelling);
        if (!date) return null;
        return (Date.now() - date.getTime()) / (MS_IN_DAY * 365.25);
      })
      .filter((value): value is number => value !== null);

    const avgAge = ages.length ? `${(ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1)} yrs` : 'n.v.t.';
    const expiringSoonCount = filteredVehicles.filter((vehicle) => isApkExpiringSoon(vehicle)).length;

    return [
      {
        label: 'Records shown',
        value: filteredVehicles.length.toString(),
        helper: `${vehicles.length} geladen`,
      },
      {
        label: 'Latest tenaamstelling',
        value: newest.date ? formatDate(newest.date) : 'n.v.t.',
        helper: newest.vehicle?.kenteken ? `${newest.vehicle.kenteken} · ${newest.vehicle.merk ?? 'Onbekend'}` : 'Geen datum gevonden',
      },
      {
        label: 'Avg registration age',
        value: avgAge,
        helper: 'Gebaseerd op tenaamstelling',
      },
      {
        label: 'APK expiring ≤60d',
        value: expiringSoonCount.toString(),
        helper: 'Gebruik de toggle om ze te filteren',
      },
    ];
  }, [filteredVehicles, vehicles]);

  const tableColumns = useMemo<TableColumn[]>(
    () => [
      { key: 'kenteken', label: 'Kenteken' },
      { key: 'merk', label: 'Merk' },
      { key: 'handelsbenaming', label: 'Model' },
      { key: 'voertuigsoort', label: 'Type' },
      {
        key: 'datum_tenaamstelling',
        label: 'Tenaamstelling',
        render: (vehicle) => formatDate(vehicle.datum_tenaamstelling),
      },
      {
        key: 'vervaldatum_apk',
        label: 'APK vervaldatum',
        render: (vehicle) => formatDate(vehicle.vervaldatum_apk),
      },
    ],
    []
  );

  const handleKentekenSearch = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const normalized = cleanKenteken(kentekenQuery);

    if (!normalized) {
      setKentekenError('Voer een geldig kenteken in (bijv. AB123C).');
      setKentekenResult(null);
      return;
    }

    setKentekenLoading(true);
    setKentekenError(null);

    try {
      const url = createRdwUrl({
        kenteken: normalized,
        $order: 'datum_tenaamstelling DESC',
        $limit: '1',
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Kenteken lookup responded with status: ${response.status}`);
      }

      const data: Vehicle[] = await response.json();

      if (!data.length) {
        setKentekenError('Geen voertuig gevonden voor dit kenteken.');
        setKentekenResult(null);
        return;
      }

      setKentekenResult(data[0]);
      setSelectedVehicle(data[0]);
    } catch (lookupError) {
      console.error('Kenteken lookup failed:', lookupError);
      setKentekenError('Kentekenzoekopdracht mislukt. Probeer het later opnieuw.');
    } finally {
      setKentekenLoading(false);
    }
  };

  const handleResetKenteken = () => {
    setKentekenQuery('');
    setKentekenResult(null);
    setKentekenError(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <Card>
        <CardHeader className="bg-gray-100">
          <CardTitle>Open RDW Vehicle Explorer</CardTitle>
          <CardDescription>Inzicht in Nederlandse kentekengegevens, APK-deadlines en voertuigdetails.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-4 text-sm text-gray-600">
          <p>
            Deze pagina haalt live gegevens uit de RDW dataset <code className="rounded bg-gray-200 px-1">m9d7-ebf2</code>.
            Gebruik de filters om snel voertuigen te vinden, sorteer op tenaamstelling en bekijk detailinformatie per kenteken.
          </p>
          <p className="text-xs text-gray-500">
            Laatst bekeken: {new Date().toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {vehicleStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
          </div>

      <Card>
        <CardHeader>
          <CardTitle>Datasetfilters</CardTitle>
          <CardDescription>Combineer zoeken, sorteren en RDW-velden voor een gerichte lijst.</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            limit={limit}
            onLimitChange={setLimit}
            onRefresh={fetchVehicleData}
            vehicleTypes={vehicleTypes}
            vehicleTypeFilter={vehicleTypeFilter}
            onVehicleTypeChange={setVehicleTypeFilter}
            brands={brands}
            brandFilter={brandFilter}
            onBrandChange={setBrandFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onlyExpiringSoon={onlyExpiringSoon}
            onOnlyExpiringSoonChange={setOnlyExpiringSoon}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zoek op kenteken</CardTitle>
          <CardDescription>Raadpleeg rechtstreeks de RDW API voor één kenteken.</CardDescription>
        </CardHeader>
        <CardContent>
          <KentekenLookup
            query={kentekenQuery}
            onQueryChange={setKentekenQuery}
            onSubmit={handleKentekenSearch}
            onReset={handleResetKenteken}
            loading={kentekenLoading}
            error={kentekenError}
          />
        </CardContent>
      </Card>

      {kentekenResult && (
        <VehicleDetailsCard
          className="border-emerald-200"
          vehicle={kentekenResult}
          title={`Resultaat voor ${kentekenResult.kenteken}`}
          subtitle="Live kentekenopvraag"
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registraties</CardTitle>
          <CardDescription>Overzicht van de huidige dataset (klik om details te bekijken).</CardDescription>
        </CardHeader>
        <CardContent>
          <VehiclesTable
            columns={tableColumns}
            vehicles={sortedVehicles}
            selectedVehicle={selectedVehicle}
            onSelect={setSelectedVehicle}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>

      {selectedVehicle && (
        <VehicleDetailsCard
          vehicle={selectedVehicle}
          title={`Details voor ${selectedVehicle.kenteken}`}
          subtitle="Geselecteerd uit het overzicht"
        />
      )}
    </div>
  );
};

const sampleData: Vehicle[] = [
  {
    kenteken: 'AB123Z',
    voertuigsoort: 'Personenauto',
    merk: 'VOLKSWAGEN',
    handelsbenaming: 'GOLF',
    vervaldatum_apk: '20231215',
    datum_tenaamstelling: '20190601',
    eerste_kleur: 'ZWART',
    massa_ledig_voertuig: '1321',
    laadvermogen: '579',
    aantal_zitplaatsen: '5',
    zuinigheidslabel: 'C',
  },
  {
    kenteken: 'XY456A',
    voertuigsoort: 'Personenauto',
    merk: 'TOYOTA',
    handelsbenaming: 'YARIS',
    vervaldatum_apk: '20240815',
    datum_tenaamstelling: '20200112',
    eerste_kleur: 'ROOD',
    massa_ledig_voertuig: '1080',
    laadvermogen: '500',
    aantal_zitplaatsen: '5',
    zuinigheidslabel: 'B',
  },
  {
    kenteken: 'CD789B',
    voertuigsoort: 'Bedrijfsauto',
    merk: 'MERCEDES-BENZ',
    handelsbenaming: 'SPRINTER',
    vervaldatum_apk: '20230320',
    datum_tenaamstelling: '20180725',
    eerste_kleur: 'WIT',
    massa_ledig_voertuig: '2450',
    laadvermogen: '1000',
    aantal_zitplaatsen: '3',
    zuinigheidslabel: 'G',
  },
  {
    kenteken: 'FG321H',
    voertuigsoort: 'Personenauto',
    merk: 'BMW',
    handelsbenaming: '3-SERIE',
    vervaldatum_apk: '20240630',
    datum_tenaamstelling: '20210415',
    eerste_kleur: 'BLAUW',
    massa_ledig_voertuig: '1495',
    laadvermogen: '525',
    aantal_zitplaatsen: '5',
    zuinigheidslabel: 'D',
  },
  {
    kenteken: 'JK654L',
    voertuigsoort: 'Motorfiets',
    merk: 'HONDA',
    handelsbenaming: 'CBR',
    vervaldatum_apk: '20231030',
    datum_tenaamstelling: '20190812',
    eerste_kleur: 'ZWART',
    massa_ledig_voertuig: '202',
    laadvermogen: '180',
    aantal_zitplaatsen: '2',
    zuinigheidslabel: 'n.v.t.',
  },
];

export default Home;