import {
  iso31661,
  iso31662,
  iso31661Alpha2ToAlpha3,
  ISO31662Entry,
  ISO31661AssignedEntry,
} from 'iso-3166';

type MenuItem = {
  value: string;
  label: string;
};

// Country code specification used by ftx.us
// https://documenter.getpostman.com/view/16837442/UVR7LUCM#37d28da9-8c21-4176-b127-d6f1c3e6fbe0
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

export const ALPHA3_TO_COUNTRY_NAME: Record<string, string> = iso31661
  .filter((state) => state.state === 'assigned')
  .reduce((map: Record<string, string>, entry: ISO31661AssignedEntry) => {
    map[entry.alpha3] = entry.name;
    return map;
  }, {});

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

export const EU_COUNTRIES: Set<string> = new Set([
  'AUT',
  'BEL',
  'BGR',
  'HRV',
  'CYP',
  'CZE',
  'DNK',
  'EST',
  'FIN',
  'FRA',
  'DEU',
  'GRC',
  'HUN',
  'IRL',
  'ITA',
  'LVA',
  'LTU',
  'LUX',
  'MLT',
  'NLD',
  'POL',
  'PRT',
  'ROU',
  'SVK',
  'SVN',
  'ESP',
  'SWE',
]);
