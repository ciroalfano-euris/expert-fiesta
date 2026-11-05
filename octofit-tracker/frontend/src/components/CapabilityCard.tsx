import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  collection: string;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, path, collection, emptyText, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(null);
    getJson<Record<string, unknown>>(path)
      .then((response) => {
        const collectionItems = response[collection];
        if (!Array.isArray(collectionItems)) throw new Error(`Invalid ${collection} response`);
        if (active) setItems(collectionItems as T[]);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'An unexpected error occurred');
      });

    return () => { active = false; };
  }, [collection, path]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {items === null && error === null && <p role="status">Loading {title.toLowerCase()}...</p>}
    {error !== null && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}
    {items !== null && items.length === 0 && <p>{emptyText}</p>}
    {items !== null && items.length > 0 && <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
