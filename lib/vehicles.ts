import { ReactNode } from 'react';

export const RDW_DATASET_ENDPOINT = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';

export type Vehicle = {
  kenteken: string;
  voertuigsoort?: string | null;
  merk?: string | null;
  handelsbenaming?: string | null;
  datum_tenaamstelling?: string | null;
  vervaldatum_apk?: string | null;
  eerste_kleur?: string | null;
  tweede_kleur?: string | null;
  aantal_zitplaatsen?: string | null;
  zuinigheidslabel?: string | null;
  bruto_bpm?: string | null;
  massa_ledig_voertuig?: string | null;
  laadvermogen?: string | null;
  cilinderinhoud?: string | null;
  maximum_massa_trekken_ongeremd?: string | null;
  [key: string]: string | null | undefined;
};

export type TableColumn = {
  key: string;
  label: string;
  render?: (vehicle: Vehicle) => ReactNode;
};

const dutchDateFormatter = new Intl.DateTimeFormat('nl-NL', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export const MS_IN_DAY = 1000 * 60 * 60 * 24;

export const parseDateToNumber = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.replace(/\D/g, '');
  if (trimmed.length !== 8) return null;
  return Number(trimmed);
};

export const parseRdwDate = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.replace(/\D/g, '');
  if (trimmed.length !== 8) return null;
  const year = Number(trimmed.slice(0, 4));
  const month = Number(trimmed.slice(4, 6)) - 1;
  const day = Number(trimmed.slice(6, 8));
  const date = new Date(Date.UTC(year, month, day));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (input?: string | Date | null) => {
  const date = input instanceof Date ? input : parseRdwDate(input);
  if (!date) return 'n.v.t.';
  return dutchDateFormatter.format(date);
};

export const cleanKenteken = (value: string) => value.replace(/[^a-z0-9]/gi, '').toUpperCase();

export const isApkExpiringSoon = (vehicle: Vehicle, withinDays = 60) => {
  const date = parseRdwDate(vehicle.vervaldatum_apk);
  if (!date) return false;
  const diffDays = (date.getTime() - Date.now()) / MS_IN_DAY;
  return diffDays >= 0 && diffDays <= withinDays;
};

export const createRdwUrl = (params: Record<string, string>) => {
  const url = new URL(RDW_DATASET_ENDPOINT);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
};

