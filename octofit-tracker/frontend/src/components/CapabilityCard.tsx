import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  loadItems: () => Promise<T[]>;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, loadItems, emptyText, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(null);
    loadItems()
      .then((results) => { if (active) setItems(results); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'An unexpected error occurred');
      });

    return () => { active = false; };
  }, [loadItems]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {items === null && error === null && <p role="status">Loading {title.toLowerCase()}...</p>}
    {error !== null && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}
    {items !== null && items.length === 0 && <p>{emptyText}</p>}
    {items !== null && items.length > 0 && <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
