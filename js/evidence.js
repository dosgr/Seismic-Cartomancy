/** Read-only retrieval of the missing FDSN evidence for a saved round. */
export function dataselectRoute(station, context) {
  return context.stations.find(route => route.provider === station.provider &&
    route.protocol === 'FDSN' && route.id === station.id);
}

export function evidenceUrl(stations, round) {
  const [network,, location, channel] = stations[0].id.split('.');
  const params = new URLSearchParams({
    network, location: location || '--', channel,
    station: stations.map(station => station.id.split('.')[1]).join(','),
    starttime: round.start_utc, endtime: round.end_utc, nodata: '404'
  });
  return stations[0].url + '?' + params;
}

export function evidenceGroups(missing, context) {
  const groups = new Map();
  for (const station of missing) {
    const route = dataselectRoute(station, context);
    if (!route) continue;
    const [net,, loc, channel] = station.id.split('.');
    const key = JSON.stringify([route.url, net, loc, channel]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({station, route});
  }
  return [...groups.values()];
}

async function boundedBody(response) {
  const reader = response.body.getReader();
  const maximum = 768000;
  const parts = [];
  let size = 0;
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maximum) {
      await reader.cancel();
      throw new Error('records');
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return bytes;
}

export async function obtainEvidence(group, round, signal) {
  const url = evidenceUrl(group.map(({route}) => route), round);
  const result = await fetch(url, {
    mode: 'cors', credentials: 'omit', redirect: 'error',
    referrerPolicy: 'no-referrer', signal: AbortSignal.any([signal, AbortSignal.timeout(15000)])
  });
  if (!result.ok) throw new Error('fetchSome');
  const bytes = await boundedBody(result);
  const parsed = SeismoMseed.parse(bytes, false);
  const recordings = new Map();
  for (const {station} of group) {
    const parts = parsed.filter(segment => segment.id === station.id).map(segment => segment.raw);
    if (!parts.length) continue;
    const length = parts.reduce((sum, part) => sum + part.length, 0);
    const recording = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) { recording.set(part, offset); offset += part.length; }
    recordings.set(station.key, recording);
  }
  return recordings;
}
