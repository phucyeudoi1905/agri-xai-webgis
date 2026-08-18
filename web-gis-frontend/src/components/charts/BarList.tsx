export interface BarItem {
  name: string;
  value: number;
  caption?: string;
}

interface Props {
  items: BarItem[];
  format?: (value: number) => string;
}

export function BarList({ items, format }: Props) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="barlist">
      {items.map((item) => (
        <div className="barlist-item" key={item.name}>
          <div className="barlist-top">
            <span className="name">{item.name}</span>
            <span className="val">
              {format ? format(item.value) : item.value.toLocaleString('vi-VN')}
              {item.caption ? ` · ${item.caption}` : ''}
            </span>
          </div>
          <div className="barlist-track">
            <div
              className="barlist-fill"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
