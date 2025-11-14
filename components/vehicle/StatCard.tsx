import React from 'react';

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

const StatCard = ({ label, value, helper }: StatCardProps) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    {helper && <p className="mt-2 text-sm text-gray-500">{helper}</p>}
  </div>
);

export default StatCard;

