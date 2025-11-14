import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Vehicle } from '@/lib/vehicles';
import { formatDate } from '@/lib/vehicles';

type VehicleDetailsCardProps = {
  vehicle: Vehicle | null;
  title: string;
  subtitle?: string;
  className?: string;
};

const VehicleDetailsCard = ({ vehicle, title, subtitle, className }: VehicleDetailsCardProps) => {
  if (!vehicle) return null;

  const details = [
    { label: 'Kenteken', value: vehicle.kenteken },
    { label: 'Merk', value: vehicle.merk },
    { label: 'Handelsbenaming', value: vehicle.handelsbenaming },
    { label: 'Voertuigsoort', value: vehicle.voertuigsoort },
    { label: 'Eerste kleur', value: vehicle.eerste_kleur },
    { label: 'Tweede kleur', value: vehicle.tweede_kleur },
    { label: 'Tenaamstelling', value: formatDate(vehicle.datum_tenaamstelling) },
    { label: 'APK vervaldatum', value: formatDate(vehicle.vervaldatum_apk) },
    { label: 'Aantal zitplaatsen', value: vehicle.aantal_zitplaatsen },
    {
      label: 'Massa ledig',
      value: vehicle.massa_ledig_voertuig ? `${vehicle.massa_ledig_voertuig} kg` : null,
    },
    {
      label: 'Laadvermogen',
      value: vehicle.laadvermogen ? `${vehicle.laadvermogen} kg` : null,
    },
    {
      label: 'Cilinderinhoud',
      value: vehicle.cilinderinhoud ? `${vehicle.cilinderinhoud} cc` : null,
    },
    { label: 'Zuinigheidslabel', value: vehicle.zuinigheidslabel },
    {
      label: 'Bruto BPM',
      value: vehicle.bruto_bpm ? `€ ${Number(vehicle.bruto_bpm).toLocaleString('nl-NL')}` : null,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs uppercase tracking-wide text-gray-500">{detail.label}</dt>
              <dd className="text-sm font-medium text-gray-900">{detail.value ?? 'n.v.t.'}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

export default VehicleDetailsCard;

