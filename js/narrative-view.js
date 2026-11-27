import {element, tr, shortCard, currentLanguage} from './strings.js?v=2.0.0';

export function narrativeText(narrative, lang, heading) {
  const content = narrative[lang];
  return [heading, content.introduction, ...[...content.sections,...content.packets].map(row =>
    row.heading + '\n' + row.text), content.conclusion].join('\n\n');
}

function localDownload(text, lang) {
  const url = URL.createObjectURL(new Blob([text+'\n'],{type:'text/plain;charset=utf-8'}));
  const link = element('a');
  link.href = url;
  link.download = 'seismic-cartomancy-' + lang + '.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function narrativePanel(narrative, knowledge, hcke) {
  const lang = currentLanguage();
  const data = narrative[lang];
  const heading = tr('narrativeTitle');
  const panel = element('article','narrative-panel');
  panel.setAttribute('aria-label',heading);
  panel.append(element('p','eyebrow',tr(narrative.topic?'synthesisLabel':'edition')), element('h2','',heading),
    element('p','narrative-intro',data.introduction));
  const sections = element('div','narrative-sections');
  for (const row of data.sections) {
    const section = element('section','narrative-section');
    section.append(element('h3','',row.heading),element('p','',row.text));
    sections.append(section);
  }
  const packets = element('details','narrative-packets');
  packets.append(element('summary','',tr('packetNarrative')));
  for (const row of data.packets) {
    const section = element('section','narrative-section');
    section.append(element('h3','',row.heading),element('p','',row.text));
    packets.append(section);
  }
  const printTitle = element('h3','print-packet-heading',tr('packetNarrative'));
  panel.append(sections, printTitle, packets, element('p','narrative-conclusion',data.conclusion),
    element('p','field-note',tr('entertainment')));
  const comparative = knowledge.comparative.filter(row => narrative.plan.comparative?.includes(row.id));
  if (comparative.length) {
    const info = element('details','narrative-sources');
    info.append(element('summary','',tr('otherReadings')),
      element('p','field-note',tr('otherReadingsNote')));
    for (const row of comparative) {
      const [label, url] = knowledge.sources[row.source];
      const link = element('a','',label);
      link.href = url;
      link.rel = 'noopener noreferrer';
      link.target = '_blank';
      const entry = element('p','');
      entry.append(element('strong','',row.cards.map(shortCard).join(' + ')), ' · ',
        tr(row.relation === 'alternative' ? 'otherMeaning' : 'relatedMeaning'), ' · ',
        row[lang], ' ', link);
      info.append(entry);
    }
    panel.append(info);
  }
  if (narrative.topic && hcke) {
    const details=element('details','narrative-sources');
    details.append(element('summary','',tr('hckeSources')));
    const groups=[...narrative.plan.sections,...narrative.plan.packets];
    const cues=[...new Set(groups.flatMap(s=>s.ids??s.claims))];
    const sources=hcke.active.supporting_sources;
    const related=[...new Set(cues.flatMap(id=>hcke.indexed[id].witness_ids))];
    const nuances=[...new Set(groups.map(s=>s.nuance).filter(Boolean).map(id=>id.slice('S-REF-'.length)))];
    const list=element('ul');
    for (const id of [...cues,...nuances,...related]) {
      const ref=hcke.indexed[id]?.source??sources[id];
      if (!ref) continue;
      const entry=element('li');
      const link=element('a','',ref.title+' · '+tr('page')+' '+ref.locator);
      link.href=ref.url;
      link.target='_blank';
      link.rel='noopener noreferrer';
      entry.append(element('strong','mono',id),' · ',link);
      list.append(entry);
    }
    const archive=element('a','',lang==='el'?'Πλήρες ιστορικό αρχείο (JSON)':'Full historical archive (JSON)');
    archive.href=new URL('../docs/historical/knowledge.json',import.meta.url).href;
    details.append(archive,list);
    panel.append(details);
  }
  const controls = element('div','narrative-controls');
  const status = element('span','field-note');
  status.setAttribute('role','status');
  const text = narrativeText(narrative,lang,heading) + '\n\n' + tr('entertainment');
  const action = (key, run) => {
    const button = element('button','quiet',tr(key));
    button.type = 'button';
    button.addEventListener('click',run);
    controls.append(button);
  };
  action('copyNarrative',async () => {
    try { await navigator.clipboard.writeText(text); status.textContent = tr('copiedNarrative'); }
    catch { status.textContent = tr('copyUnavailable'); }
  });
  action('printNarrative',() => {
    const printable = panel.cloneNode(true);
    printable.classList.add('print-selected');
    printable.querySelector('.narrative-packets').open = true;
    document.body.append(printable);
    window.addEventListener('afterprint', () => printable.remove(), {once:true});
    window.print();
  });
  action('saveNarrative',() => localDownload(text,lang));
  if (typeof navigator.share === 'function') action('shareNarrative',async () => {
    try { await navigator.share({title:heading,text}); }
    catch (error) { if (error.name !== 'AbortError') status.textContent = tr('shareUnavailable'); }
  });
  controls.append(status);
  panel.append(controls);
  return panel;
}
