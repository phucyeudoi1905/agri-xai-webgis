import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { Icon } from '../ui/Icon';
import {
  filterLamDongPlaces,
  type LamDongPlace,
} from '../../lib/lamDongPlaces';

interface Props {
  map: LeafletMap | null;
  disabled?: boolean;
}

export function PlaceSearchBox({ map, disabled }: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);

  const suggestions = useMemo(() => filterLamDongPlaces(query, 8), [query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query, open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const flyToPlace = (place: LamDongPlace) => {
    if (!map || disabled) return;
    setQuery(place.name);
    setActivePlaceId(place.id);
    setOpen(false);
    map.flyTo([place.lat, place.lng], place.zoom, {
      animate: true,
      duration: 1.25,
      easeLinearity: 0.25,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = suggestions[activeIdx];
      if (target) flyToPlace(target);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`place-search ${disabled ? 'is-disabled' : ''}`.trim()}
    >
      <div className="place-search-field">
        <Icon name="map-pin" size={15} />
        <input
          className="input"
          type="search"
          value={query}
          disabled={disabled || !map}
          placeholder="Tìm địa danh Lâm Đồng…"
          aria-label="Tìm địa danh trên bản đồ"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {query && !disabled && (
          <button
            type="button"
            className="place-search-clear"
            aria-label="Xóa tìm kiếm"
            onClick={() => {
              setQuery('');
              setActivePlaceId(null);
              setOpen(true);
            }}
          >
            <Icon name="close" size={13} />
          </button>
        )}
      </div>

      {open && !disabled && (
        <ul id={listId} className="place-search-list" role="listbox">
          {suggestions.length === 0 ? (
            <li className="place-search-empty">Không tìm thấy địa danh phù hợp</li>
          ) : (
            suggestions.map((place, idx) => {
              const isActive = idx === activeIdx;
              const isCurrent = place.id === activePlaceId;
              return (
                <li key={place.id} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    className={`place-search-item ${isActive ? 'is-active' : ''} ${isCurrent ? 'is-current' : ''}`.trim()}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => flyToPlace(place)}
                  >
                    <span className="place-search-item-icon">
                      <Icon name="map-pin" size={14} />
                    </span>
                    <span className="place-search-item-text">
                      <span className="place-search-item-name">{place.name}</span>
                      <span className="place-search-item-meta">{place.district}</span>
                    </span>
                    <span className="place-search-item-zoom">z{place.zoom}</span>
                  </button>
                </li>
              );
            })
          )}
          <li className="place-search-hint">
            Gợi ý: Đà Lạt, Cầu Đất, Lạc Dương, Bảo Lộc…
          </li>
        </ul>
      )}
    </div>
  );
}
