// Équilibrage — la pierre ronde et la cité vaisseau (agent G, douzième vague)
//  - une seule pierre ronde par vallée, sur la terre ferme, loin des chemins, et un chemin praticable à pied pour y monter
//    (pentes douces depuis la ferme : on refait le parcours avec un pas plus fin que celui de la génération) ;
//  - l'Atelier des corps reste modeste : moins que la potion de célérité, que l'élixir de légèreté, et ce que la cité cache
//    de cœurs de verre ne suffit pas à tout prendre ;
//  - ce qu'on rapporte de là-haut (une seule fois) vaut quelques journées de travail, pas une fortune.
'use strict';
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'La pierre ronde et la cité vaisseau (G)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- l'Atelier des corps
    const E = J.ev('JSON.stringify(vgEffets({ jambes: VG_CORPS_MAX, jarret: VG_CORPS_MAX, souffle: VG_CORPS_MAX, os: VG_CORPS_MAX }))');
    const e = JSON.parse(E);
    log(`Atelier des corps, tout au plus haut : vitesse ×${e.vitesse.toFixed(3)}, élan du saut ×${e.saut.toFixed(3)} (hauteur ×${(e.saut * e.saut).toFixed(2)}), fatigue de course ×${e.fatigue.toFixed(2)}, souffle sous l'eau ×${e.apnee.toFixed(2)}, chute ressentie ×${e.chute.toFixed(2)}`);
    if (e.vitesse >= 1.35) ko('les jambes valent la potion de célérité (×1,35)');
    if (e.vitesse > 1.15) ko('les jambes dépassent +15 %');
    if (e.saut >= 1.55 || e.saut > 1.2) ko('le jarret approche l’élixir de légèreté');
    if (e.fatigue < 0.5) ko('le souffle supprime presque la fatigue');
    const N = J.ev('JSON.stringify({ max: VG_CORPS_MAX, tot: VG_CORPS_TOTAL, cout: VG_CORPS_COUT, vie: VG_CORPS_VIE, n: VG_CORPS.length })');
    const C = JSON.parse(N);
    const coutMax = C.cout.slice(0, C.max).reduce((a, b) => a + b, 0) * Math.floor(C.tot / C.max); // deux reprises poussées au bout
    // les cœurs de verre que cache la cité : objets posés et coffres (compte dans le source de la population)
    const fs = require('fs'), path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'src', '11-zzzzG-vaisseau2-choses.js'), 'utf8');
    let coeurs = (src.match(/'vg_coeur', 'boule'/g) || []).length;
    for (const m of src.matchAll(/\['vg_coeur', (\d+)\]/g)) coeurs += +m[1];
    const maisons = J.ev("JSON.stringify(Object.values(VG_MAISONS).flatMap((M) => M[2]).filter(([id]) => id === 'vg_coeur').reduce((a, [, n]) => a + n, 0))");
    coeurs += +maisons;
    log(`cœurs de verre dans la cité : ${coeurs} ; pousser deux reprises au bout en coûterait ${coeurs < coutMax ? coutMax + ' (impossible)' : coutMax}`);
    if (coeurs >= coutMax) ko('la cité cache de quoi pousser deux reprises au bout');
    if (coeurs < C.cout[0] * C.n) ko('pas même de quoi un degré de chaque reprise');
    // ---------------------------------------------------------------- ce qu'on rapporte
    const prix = JSON.parse(J.ev("JSON.stringify(Object.fromEntries(Object.keys(ITEMS).filter((k) => k.startsWith('vg_')).map((k) => [k, ITEMS[k].price || 0])))"));
    let butin = 0;
    for (const m of src.matchAll(/this\.objet\([^;]*?'(vg_[a-z_]+)'[^;]*?(?:n: (\d+))?[^;]*?\);/g)) butin += (prix[m[1]] || 0) * (+m[2] || 1);
    for (const m of src.matchAll(/\['(vg_[a-z_]+)', (\d+)\]/g)) butin += (prix[m[1]] || 0) * +m[2];
    const coffresMaisons = JSON.parse(J.ev('JSON.stringify(Object.values(VG_MAISONS).flatMap((M) => M[2]))'));
    for (const [id, n] of coffresMaisons) butin += (prix[id] || 0) * n;
    log(`tout ce qu'on peut rapporter de la cité, vendu : ${butin} (une seule fois)`);
    if (butin > 2600) ko('la cité rapporte une fortune');
    // ---------------------------------------------------------------- la pierre ronde
    for (const graine of [1234]) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      const r = JSON.parse(J.ev(`(()=>{const w=__w,v=w.vg;if(!v)return JSON.stringify(null);
        const WL=w.waterLevel,n=w.props.filter(q=>q.id==='vg_pierre').length,ni=w.inter.filter(i=>i.kind==='vg_pierre').length;
        let dn=1e9;for(const q of w.nav.nodes)dn=Math.min(dn,Math.hypot(q.x-v.x,q.z-v.z));
        // un chemin à pied depuis la ferme, au pas de 4 m (pentes <= 1)
        const C=4,N=Math.floor(w.size/C),F=w.lm.ferme,acc=new Uint8Array(N*N),Q=[];const H=(i,j)=>w.heightAt((i+0.5)*C,(j+0.5)*C);
        const s0=Math.floor(F.z/C)*N+Math.floor(F.x/C);acc[s0]=1;Q.push(s0);const cible=Math.floor(v.z/C)*N+Math.floor(v.x/C);let ok=false;
        for(let h=0;h<Q.length;h++){const k=Q[h],i=k%N,j=(k/N)|0;if(Math.abs(i-cible%N)<=2&&Math.abs(j-((cible/N)|0))<=2){ok=true;break;}
          for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<1||jj<1||ii>=N-1||jj>=N-1)continue;const k2=jj*N+ii;if(acc[k2])continue;const h2=H(ii,jj);if(h2<WL+0.5||Math.abs(h2-H(i,j))>C*1.0)continue;acc[k2]=1;Q.push(k2);}}
        return JSON.stringify({n,ni,x:Math.round(v.x),z:Math.round(v.z),haut:Math.round(v.y-WL),dn:Math.round(dn),ok,versant:LIEU_NAMES.vg_versant});})()`));
      if (!r) { ko(`graine ${graine} : pas de pierre ronde`); continue; }
      log(`graine ${graine} : pierre en ${r.x}, ${r.z}, ${r.haut} m au-dessus de l'eau, à ${r.dn} m du chemin le plus proche (« ${r.versant} ») ; on y monte à pied : ${r.ok ? 'oui' : 'NON'}`);
      if (r.n !== 1 || r.ni !== 1) ko(`graine ${graine} : ${r.n} pierres, ${r.ni} interactions`);
      if (r.haut < 3) ko(`graine ${graine} : la pierre est au ras de l'eau`);
      if (r.dn < 50) ko(`graine ${graine} : la pierre est trop près d'un chemin`);
      if (!r.ok) ko(`graine ${graine} : on ne peut pas monter jusqu'à la pierre`);
    }
    return { echecs };
  },
};
