import {readFile, access} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const get=(path)=>readFile(new URL(path,root),'utf8');

for(const [file, canonical, locale, lang] of [
  ['index.html','https://dos.gr/seismiki/','el_GR','el'],
  ['en/index.html','https://dos.gr/seismiki/en/','en_GB','en']
]){
 test(`static discovery metadata and local assets in ${file}`,async()=>{
   const html=await get(file);
   assert.match(html,new RegExp('rel="canonical" href="'+canonical+'"'));
   for(const name of ['title','description','url','type','site_name','locale','locale:alternate','image',
     'image:secure_url','image:type','image:width','image:height','image:alt'])
     assert.ok(html.includes('property="og:'+name+'"'));
   for(const name of ['card','title','description','image','image:alt'])
     assert.ok(html.includes('name="twitter:'+name+'"'));
   assert.ok(html.includes('property="og:locale" content="'+locale+'"'));
   assert.ok(html.includes('content="https://dos.gr/seismiki/assets/social.jpg"'));
   assert.ok(html.includes('hreflang="en" href="https://dos.gr/seismiki/en/"'));
   const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
   assert.equal(schema['@type'],'WebApplication');
   assert.equal(schema.softwareVersion,'1.1.0');
   assert.equal(schema.url,canonical);
   const manifest=JSON.parse(await get('manifest-'+lang+'.json'));
   await Promise.all(manifest.icons.map(icon=>access(new URL(icon.src,root))));
 });
}
