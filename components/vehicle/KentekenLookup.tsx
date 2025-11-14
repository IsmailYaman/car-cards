import React from 'react';

type KentekenLookupProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  loading: boolean;
  error: string | null;
};

const KentekenLookup = ({ query, onQueryChange, onSubmit, onReset, loading, error }: KentekenLookupProps) => (
  <div className="space-y-2">
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Bijv. AB-123-C"
        className="w-full rounded-md border px-3 py-2 text-sm uppercase tracking-widest"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? 'Zoeken…' : 'Zoek'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Wis
        </button>
      </div>
    </form>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default KentekenLookup;

