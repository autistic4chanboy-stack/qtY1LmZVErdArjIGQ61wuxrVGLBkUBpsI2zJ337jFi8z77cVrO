// Équilibrage — les créatures de la Zone (agent V2, quatorzième vague)
//  - quinze espèces, chacune avec son squelette, ses poses, ses cris, ses sens (furtif), au moins un nid dans la Zone ;
//  - évitables en restant discret : accroupi, on ne s'entend pas à plus de six mètres d'aucune bête ; aucune bête unique
//    (tarasque, basilic, chimère, vouivre) à moins de 60 m d'un chemin ; les cordes des pendus à plus de 3,5 m des
//    chemins (sur le chemin, debout, ils ne tombent pas) ; aucun nid hostile sur un chemin, près d'un feu de veille, ni
//    près de l'arrivée ;
//  - les nids au bon endroit : au sec (sauf les noyés, dans plus d'1,4 m d'eau), les perchées au-dessus du sol ;
//  - la Zone ne rend pas riche : butin moyen d'une bête ordinaire sous 40 pièces, une cache de repaire sous 250, tout
//    ce que la Zone peut rendre une fois (caches et uniques) sous trois jours de revenus du milieu de partie ;
//  - la fluidité : moins de 80 nids, moins de 160 bêtes en tout, la passe en moins d'une demi-seconde.
'use strict';
module.exports = {
  titre: 'Les créatures de la Zone (V2)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- les espèces
    const E = JSON.parse(J.ev(`(()=>{const out={};const src=String(SoundEngine.prototype.v2Son);
      for(const id of V2_ORDRE){const D=V2_ESPECES[id];let parts=0,err=null;try{const r=V2_RIGS[id](0);parts=r.parts.length;const e={move:0.5,phase:1,t:1,seed:1,nuit:1,regard:0.2};V2_POSES[id](r,e,1);}catch(x){err=x.message;}
        const cris=(src.match(new RegExp("'"+id+":[a-z_]+'","g"))||[]).length;
        out[id]={nom:D.nom,nature:D.nature,unique:!!D.unique,parts,err,cris,pose:typeof V2_POSES[id]==='function',conduite:typeof V2_CONDUITES[D.conduite]==='function',
          sens:D.sens,coup:D.coup,carnet:(V2_CARNET[id]||[]).length,butin:D.butin};}
      return JSON.stringify(out);})()`));
    const ids = Object.keys(E);
    log(`${ids.length} espèces : ${ids.map((k) => E[k].nom).join(', ')}`);
    if (ids.length < 12) ko('moins de douze espèces');
    const paisibles = ids.filter((k) => E[k].nature !== 'hostile'), aides = ids.filter((k) => E[k].nature === 'aide');
    log(`paisibles : ${paisibles.length} (dont ${aides.length} qui aident : ${aides.map((k) => E[k].nom).join(', ')})`);
    if (paisibles.length < 3 || aides.length < 1) ko('trop peu de bêtes paisibles ou qui aident');
    for (const k of ids) {
      const e = E[k];
      if (e.err || e.parts < 8) ko(`${k} : squelette (${e.parts} pièces) ${e.err || ''}`);
      if (!e.pose || !e.conduite) ko(`${k} : pose ou conduite absente`);
      if (e.cris < 2) ko(`${k} : moins de deux cris (${e.cris})`);
      if (e.carnet < 3) ko(`${k} : le carnet n'a pas ses trois lignes`);
      // discret : accroupi (2,5 m de bruit), on ne s'entend pas au-delà de 6 m
      const S = e.sens, ouieAcc = S.sourd ? 0 : 2.5 * (S.ouie || 1);
      if (ouieAcc > 6.0) ko(`${k} : entend un pas accroupi à ${ouieAcc.toFixed(1)} m`);
      if ((S.vue || 0) > 50) ko(`${k} : voit trop loin (${S.vue} m)`);
      if (e.nature === 'hostile' && e.coup && e.coup.dmg > 45) ko(`${k} : un coup trop fort (${e.coup.dmg})`);
      if (e.nature === 'hostile' && e.coup && e.coup.prep === undefined) ko(`${k} : un coup sans avertissement`);
    }
    log(`accroupi, la bête qui entend le mieux vous entend à ${Math.max(...ids.map((k) => (E[k].sens.sourd ? 0 : 2.5 * (E[k].sens.ouie || 1)))).toFixed(1)} m ; la plus forte frappe ${Math.max(...ids.map((k) => (E[k].coup ? E[k].coup.dmg : 0)))} (vie : 100)`);
    // ---------------------------------------------------------------- les butins
    const B = JSON.parse(J.ev(`(()=>{const tab={};const v=(id)=>id==='argent'?1:(ITEMS[id]?ITEMS[id].price||0:NaN);
      for(const k in LOOT){if(!k.startsWith('v2_'))continue;const T=LOOT[k];const items=T.items.filter(e=>e[3]>0);const W=items.reduce((a,e)=>a+e[3],0)||1,nr=(T.rolls[0]+T.rolls[1])/2;
        let tot=0,bad=[];for(const e of items){if(e[0]!=='argent'&&!ITEMS[e[0]])bad.push(e[0]);if(!(e[1]>=1&&e[2]>=e[1]))bad.push('quantité '+e);tot+=nr*e[3]/W*(e[1]+e[2])/2*v(e[0]);}
        tab[k]={tot:Math.round(tot),bad};}
      const objets={};for(const id in ITEMS)if(id.startsWith('v2_'))objets[id]={p:ITEMS[id].price,desc:!!ITEMS[id].desc,nom:ITEMS[id].name};
      return JSON.stringify({tab,objets});})()`));
    for (const k in B.tab) { const T = B.tab[k]; if (T.bad.length) ko(`table ${k} : ${T.bad.join(', ')}`); }
    for (const id in B.objets) { const o = B.objets[id]; if (!o.desc || !(o.p >= 0)) ko(`objet ${id} sans description ou sans prix`); }
    log(`objets : ${Object.keys(B.objets).length} ; tables : ${Object.entries(B.tab).map(([k, t]) => k.replace('v2_', '') + ' ' + t.tot).join(', ')}`);
    for (const k of ['v2_garou', 'v2_charognard', 'v2_pendu', 'v2_ecoutant', 'v2_gargouille', 'v2_stryge', 'v2_sans_visage']) if (B.tab[k] && B.tab[k].tot > 40) ko(`la bête ${k} rapporte trop (${B.tab[k].tot} en moyenne)`);
    for (const k of ['v2_nid_stryge', 'v2_charrettes', 'v2_offrandes', 'v2_tanniere', 'v2_cache_cerf']) if (B.tab[k] && B.tab[k].tot > 250) ko(`la cache ${k} rapporte trop (${B.tab[k].tot})`);
    // ---------------------------------------------------------------- la Zone et ses nids
    const t0 = Date.now();
    const Z = await J.ev('zoneGen.generer(zone.graine(), () => {})');
    J.ctx.__Z = Z;
    const R = JSON.parse(J.ev(`(()=>{const Z=__Z,N=Z.v2.nids,WL=Z.waterLevel,A=Z.v1.arrivee,feux=Z.props.filter(q=>q.id==='v1_feu');
      const S=Z.size,chem=[];for(const P of V1_CHEMINS){const pts=P.pts.map(([u,v])=>[u*S,v*S]);for(let i=1;i<pts.length;i++){const [x0,z0]=pts[i-1],[x1,z1]=pts[i],L=Math.hypot(x1-x0,z1-z0);for(let t=0;t<=L;t+=4)chem.push([x0+(x1-x0)*t/L,z0+(z1-z0)*t/L]);}}
      const dChem=(x,z)=>{let m=1e9;for(const c of chem){const d=Math.hypot(c[0]-x,c[1]-z);if(d<m)m=d;}return m;};
      const out=[];
      for(const n of N){const D=V2_ESPECES[n.esp];const sol=Z.heightAt(n.x,n.z);
        const r={id:n.id,esp:n.esp,n:n.n,hostile:D.nature==='hostile',unique:!!D.unique,eau:!!D.eau,perche:!!n.perche,sol:+sol.toFixed(1),y:+n.y.toFixed(1),
          chem:Math.round(zoneGen.surChemin(Z.v1.masque,Z.v1.mW,n.x,n.z,0)?0:dChem(n.x,n.z)),feu:Math.round(Math.min(...feux.map(f=>Math.hypot(f.x-n.x,f.z-n.z)))),arr:Math.round(Math.hypot(n.x-A.x,n.z-A.z))};
        if(n.esp==='v2_pendu'&&n.branches)r.cordes=Math.round(Math.min(...n.branches.map(b=>dChem(b.x,b.z)))*10)/10;
        out.push(r);}
      return JSON.stringify({nids:out,WL,props:Z.props.filter(q=>q.id.startsWith('v2_')).length,blocs:Z.blocks.length,mes:zone.mesures.etapes['passe V2-repaires']});})()`));
    log(`la Zone générée en ${Date.now() - t0} ms (machine virtuelle) ; la passe V2 : ${R.mes} ms ; ${R.nids.length} nids, ${R.nids.reduce((a, n) => a + n.n, 0)} bêtes, ${R.props} objets posés V2`);
    if (R.nids.length > 80) ko('trop de nids');
    if (R.nids.reduce((a, n) => a + n.n, 0) > 160) ko('trop de bêtes');
    if (R.mes > 500) ko('la passe V2 est trop lente');
    const par = {};
    for (const n of R.nids) par[n.esp] = (par[n.esp] || 0) + n.n;
    log(`par espèce : ${ids.map((k) => E[k].nom + ' ' + (par[k] || 0)).join(', ')}`);
    for (const k of ids) if (!par[k]) ko(`aucun nid pour ${k}`);
    for (const n of R.nids) {
      if (n.eau) { if (n.sol > R.WL - 1.4) ko(`${n.id} : pas assez d'eau (${n.sol})`); continue; }
      if (n.perche) { if (n.y < n.sol + 1) ko(`${n.id} : perchée trop bas`); continue; }
      if (n.esp !== 'v2_vouivre' && n.sol < R.WL + 0.3) ko(`${n.id} : dans l'eau (${n.sol})`);
      if (n.hostile && n.chem < 2 && n.esp !== 'v2_pendu') ko(`${n.id} : sur un chemin`);
      if (n.hostile && n.feu < 40) ko(`${n.id} : trop près d'un feu de veille (${n.feu} m)`);
      if (n.hostile && n.arr < 120) ko(`${n.id} : trop près de l'arrivée (${n.arr} m)`);
      if (n.unique && n.hostile && n.chem < 60) ko(`${n.id} : une bête unique à ${n.chem} m d'un chemin`);
      if (n.cordes !== undefined && n.cordes < 3.5) ko(`${n.id} : une corde à ${n.cordes} m d'un chemin`);
    }
    const uniq = R.nids.filter((n) => n.unique && n.hostile).map((n) => `${n.esp.replace('v2_', '')} ${n.chem} m`);
    log(`les uniques, loin des chemins : ${uniq.join(', ')} ; les pendus des chemins : cordes à ${R.nids.filter((n) => n.cordes !== undefined).map((n) => n.cordes).join(', ')} m`);
    // ---------------------------------------------------------------- l'API pour V3, V4, V5
    const API = JSON.parse(J.ev(`(()=>{const Z=__Z,C=zone.creatures;const n0=Z.v2.nids.length;
      const id=C.poser('gargouille',100,50,100,{id:'essai_v2',agent:'V4',perche:true});
      const ok1=Z.v2.nids.length===n0+1&&Z.v2.nids[n0].esp==='v2_gargouille'&&Z.v2.nids[n0].perche;
      const L=C.liste({x:100,z:100,r:5}),et=C.etat(id);const ret=C.retirer(id)&&Z.v2.nids.length===n0&&!C.etat(id);
      return JSON.stringify({especes:C.especes().length,id,ok1,liste:L.length,etat:!!(et&&et.espece==='v2_gargouille'&&et.vivants===1),ret,site:C.liste('repaire_3').map(n=>n.espece).join(','),pour:[C.pour('gardien',false),C.pour('gardien',true),C.pour('rodeur',false),C.pour('rodeur',true),C.pour('paisible',false)].join(',')});})()`));
    log(`API zone.creatures : ${API.especes} espèces ; poser (« gargouille » perchée) ${API.ok1 ? 'ok' : 'NON'} ; liste d'un disque ${API.liste} ; etat ${API.etat ? 'ok' : 'NON'} ; retirer ${API.ret ? 'ok' : 'NON'} ; le repaire 3 : ${API.site} ; pour : ${API.pour}`);
    if (API.especes < 12 || !API.ok1 || API.liste !== 1 || !API.etat || !API.ret || !API.site.includes('v2_tarasque')) ko('l’API zone.creatures ne répond pas comme le contrat le dit');
    // ---------------------------------------------------------------- tout ce que la Zone rend une fois
    const once = JSON.parse(J.ev(`(()=>{const Z=__Z;const v=(id)=>ITEMS[id]?ITEMS[id].price||0:0;let caches=0;
      for(const it of Z.inter){if(!it.kind.startsWith('v2_'))continue;const t=it.data&&it.data.table;if(t&&LOOT[t]){const T=LOOT[t];const items=T.items.filter(e=>e[3]>0);const W=items.reduce((a,e)=>a+e[3],0),nr=(T.rolls[0]+T.rolls[1])/2;for(const e of items)caches+=nr*e[3]/W*(e[1]+e[2])/2*(e[0]==='argent'?1:v(e[0]));}}
      const uniques=v('v2_oeil_basilic')+v('v2_crete_basilic')+3*v('v2_ecaille_tarasque')+v('v2_ruban_bleu')+v('v2_criniere')+v('v2_corne_chimere')+v('v2_collier_armes')+v('v2_escarboucle')+2*v('v2_ecaille_vouivre')+3*v('v2_sou_korrigan')+v('v2_alliance')+v('v2_miroir_acier');
      return JSON.stringify({caches:Math.round(caches),uniques});})()`));
    const tot = once.caches + once.uniques, milieu = 1200;
    log(`ce que la Zone rend une fois : caches ${once.caches}, bêtes uniques et secrets ${once.uniques} — ${tot} pièces, ${(tot / milieu).toFixed(1)} jours de revenus du milieu de partie`);
    if (tot > 3 * milieu) ko('la Zone rend trop');
    return { echecs };
  },
};
