import {
  iso31661,
  iso31662,
  iso31661Alpha2ToAlpha3,
  ISO31662Entry,
} from 'iso-3166';

type MenuItem = {
  value: string;
  label: string;
};

export const countryCodesAlpha3: MenuItem[] = iso31661
  .filter((state) => state.state === 'assigned')
  .map((state) => ({ value: state.alpha3, label: state.name }))
  .sort((a, b) => {
    const nameA = a.label.toUpperCase(); // ignore upper and lowercase
    const nameB = b.label.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

export const countryRegionsAlpha3: Record<string, MenuItem[]> = iso31662.reduce(
  (map: Record<string, MenuItem[]>, entry: ISO31662Entry) => {
    const alpha3 = iso31661Alpha2ToAlpha3[entry.parent];
    if (map[alpha3] === undefined) {
      map[alpha3] = [];
    }
    map[alpha3].push({
      value: entry.code.substring(entry.parent.length + 1, entry.code.length),
      label: entry.name,
    });
    return map;
  },
  {}
);

export function countryRegionsAlpha3F(country: string): MenuItem[] {
  return iso31662
    .filter((entry) => entry.parent === country)
    .map((entry) => ({
      value: entry.code.substring(country.length + 1, entry.code.length),
      label: entry.name,
    }));
}
