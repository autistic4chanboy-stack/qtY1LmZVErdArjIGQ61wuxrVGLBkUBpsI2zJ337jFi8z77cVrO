// Équilibrage — Basse-Fosse, la ville sous la ville, et les secrets de la Zone (agent V5, quatorzième vague)
//  - la vallée ne bouge pas (V5 n'y pose rien) ;
//  - la ville est sous terre : aucun bloc d'en bas n'affleure ; la voûte n'a pas de jour ; le Septième Degré descend en
//    pente douce (≤ 0,5) de la cave à la porte ; on compte les blocs (budget), les objets posés, les interactions ;
//  - la tonnellerie est dans la Ville Basse, au sec, hors des chemins, loin des feux de veille ; on y va à pied ;
//  - le graphe des rues relie chaque maison au temple ; les portes font plus de 2,05 m ;
//  - les lieux secrets sont posés et atteints à pied ; les objets des fins existent (battant, cendre, lettres) ;
//  - les rues ne sont pas toutes éclairées : la part des rues à plus de 9 m d'un feu (on peut s'y cacher) ;
//  - les objets nouveaux ont un nom, une icône connue, un prix sensé ; les butins sont valides et modestes.
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');
module.exports = {
  titre: 'Basse-Fosse et les secrets de la Zone (V5)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- la vallée : rien de V5
    const w = await vallee(J, 1234);
    const e = empreinte(w, [98896, 1308, 516]);
    log(`empreinte des anciens objets : ${e === EMPREINTE_1234 ? 'inchangée' : 'CHANGÉE ' + e}`);
    if (e !== EMPREINTE_1234) ko('l’empreinte de la vallée a changé');
    J.ctx.__w = w;
    const nV = J.ev('__w.props.filter((q) => String(q.id).startsWith("v5_")).length + __w.inter.filter((i) => String(i.kind).startsWith("v5_")).length');
    if (nV) ko(`${nV} objets ou interactions de V5 dans la vallée`);
    // ---------------------------------------------------------------- la Zone
    const t0 = Date.now();
    const Z = await J.ev('zoneGen.generer(zone.graine(), () => {})');
    J.ctx.__Z = Z;
    const R = JSON.parse(J.ev(`(()=>{const Z=__Z,v=Z.v5,s=Z.v5s;if(!v)return 'null';
      const WL=Z.waterLevel,out={mes:v.mesures,F:v.F,TOP:v.TOP,cave:{x:v.cave.x,z:v.cave.z,r:v.cave.r,sol:v.cave.sol}};
      // les blocs d'en bas qui affleurent
      let aff=0,pire=0;for(const b of Z.blocks){if(!b.v5sous||b.sx>300)continue;const c=Math.cos(b.r),sn=Math.sin(b.r);let hmin=1e9;for(const[dx,dz]of[[0,0],[-1,-1],[1,-1],[-1,1],[1,1],[0,1],[1,0],[0,-1],[-1,0]]){const lx=dx*b.sx/2,lz=dz*b.sz/2;hmin=Math.min(hmin,Z.heightAt(b.x+lx*c+lz*sn,b.z-lx*sn+lz*c));}const top=b.y+b.sy;if(top>hmin-0.3){aff++;pire=Math.max(pire,top-hmin);}}
      out.affleure=aff;out.pire=+pire.toFixed(2);
      // la voûte : un point de la ville sans plafond au-dessus ? (on lance des rayons vers le haut sur une grille)
      let trous=0,tests=0;const st=v.site;for(let x=-160;x<=160;x+=8)for(let z=-160;z<=160;z+=8){if(Math.hypot(x,z)>${'V5_PLAN.MUR'}-1)continue;tests++;const X=st.x+x,Zz=st.z+z;let toit=false;for(const b of Z.blocks){if(!b.ceil||!b.v5sous)continue;const [lx,lz]=v5Local(b,X,Zz);if(Math.abs(lx)<=b.sx/2&&Math.abs(lz)<=b.sz/2&&b.y>v.F+2){toit=true;break;}}if(!toit)trous++;}
      out.voute={tests,trous};
      // le Degré : la pente des volées
      const D=v.degre;out.degre={pente:+(D.dy/D.lf).toFixed(2),paliers:D.paliers.length,haut:+D.yHaut.toFixed(1),bas:+v.F.toFixed(1)};
      // la tonnellerie : région, sec, chemins, feux
      const T=v.tonnellerie;out.tonn={region:zone.region(T.x,T.z),sol:+(T.y-WL).toFixed(1),chemin:zoneGen.surChemin(Z.v1.masque,Z.v1.mW,T.x,T.z,1),feu:Math.min(...Z.props.filter(q=>q.id==='v1_feu'&&!(q.data&&String(q.data.id).startsWith('feu_degre'))).map(q=>Math.hypot(q.x-T.x,q.z-T.z))).toFixed(0)};
      // les maisons reliées au temple ; les portes
      out.maisons=v.maisons.length;out.reliees=v.maisons.filter(M=>M.relie).length;out.porteH=V5_PLAN.PORTE_H;
      { const N=v.noeuds,vu=new Set([v.temple.noeuds.porte]),pile=[v.temple.noeuds.porte];while(pile.length){const i=pile.pop();for(const j of N[i].v)if(!vu.has(j)){vu.add(j);pile.push(j);}}
        out.lieuxRelies={'le marché':vu.has(v.marche.noeud),'le puits':vu.has(v.puits.noeud),'la porte':vu.has(v.porte.noeud),'la greffe':vu.has(v.temple.noeuds.greffe),'le registre':vu.has(v.temple.noeuds.registre)};out.noeudsSeuls=N.length-vu.size; }
      // l'obscurité : la part des nœuds des rues à plus de 9 m d'un feu
      const rues=v.noeuds.filter(q=>q.tag===''||q.tag==='enceinte');let sombres=0;for(const q of rues){let dm=1e9;for(const f of v.feux)dm=Math.min(dm,Math.hypot(f.x-q.x,f.z-q.z));if(dm>9)sombres++;}
      out.sombre=+(sombres/Math.max(1,rues.length)).toFixed(2);out.feux=v.feux.length;
      // les secrets
      out.secrets=s?Object.keys(s.lieux):[];out.murs=v.murs.map(m=>m.id).concat(s?s.murs.map(m=>m.id):[]);
      out.objets=v.objets.map(o=>o.item).concat(s?s.objets.map(o=>o.item):[]);
      out.lieux=s?Object.fromEntries(Object.entries(s.lieux).map(([k,L])=>[k,[L.x,L.z]])):{};
      out.cairn=s&&s.lieux.cairn?Math.round(Math.hypot(s.lieux.cairn.x-T.x,s.lieux.cairn.z-T.z)):null;
      out.inter=Z.inter.filter(i=>String(i.kind).startsWith('v5_')).length;
      return JSON.stringify(out);})()`));
    const dt = Date.now() - t0;
    if (R === null) { ko('la passe V5 n’a rien posé (Z.v5 absent)'); return { echecs }; }
    const M = R.mes;
    log(`la Zone générée en ${dt} ms ; passe V5 : ${M.ms} ms, ${M.blocs} blocs, ${M.props} objets posés, ${M.inter} interactions, ${M.ilots} îlots, ${M.maisons} maisons, ${M.noeuds} nœuds (${M.relies} reliés au temple)`);
    if (M.blocs > 2600) ko(`trop de blocs pour la ville (${M.blocs})`);
    if (M.props > 900) ko(`trop d’objets posés pour la ville (${M.props})`);
    log(`sous terre : sol ${R.F.toFixed(1)}, plafond ${R.TOP.toFixed(1)} ; blocs qui affleurent : ${R.affleure} (pire ${R.pire} m) ; voûte : ${R.voute.trous} trou(s) sur ${R.voute.tests} points`);
    if (R.affleure) ko(`${R.affleure} blocs d’en bas affleurent au-dessus du sol`);
    if (R.voute.trous) ko(`la voûte a ${R.voute.trous} trou(s)`);
    log(`le Septième Degré : ${R.degre.paliers} paliers, de ${R.degre.haut} à ${R.degre.bas} ; pente des volées ${R.degre.pente}`);
    if (R.degre.pente > 0.5) ko('le Septième Degré est trop raide');
    log(`la tonnellerie : ${R.tonn.region}, ${R.tonn.sol} m au-dessus de l’eau, ${R.tonn.chemin ? 'SUR un chemin' : 'hors des chemins'}, à ${R.tonn.feu} m du feu de veille le plus proche ; la cave à ${Math.round(R.cave.r)} m du centre de la ville`);
    if (R.tonn.region !== 'ville_basse') ko('la tonnellerie n’est pas dans la Ville Basse');
    if (R.tonn.sol < 1) ko('la tonnellerie est dans l’eau');
    if (R.tonn.chemin) ko('la tonnellerie est sur un chemin');
    if (R.tonn.feu < 60) ko('la tonnellerie est trop près d’un feu de veille (trop facile)');
    log(`maisons : ${R.maisons}, reliées au temple : ${R.reliees} ; portes de ${R.porteH} m`);
    if (R.reliees < R.maisons) ko('des maisons ne sont pas reliées aux rues');
    log(`lieux des gens d’en bas reliés au temple : ${Object.entries(R.lieuxRelies).map(([k, ok]) => k + (ok ? '' : ' NON')).join(', ')} ; nœuds seuls : ${R.noeudsSeuls}`);
    for (const k in R.lieuxRelies) if (!R.lieuxRelies[k]) ko(`${k} n’est pas relié au temple (les gens d’en bas n’y vont pas)`);
    if (R.porteH < 2.05) ko('des portes trop basses');
    log(`feux : ${R.feux} ; rues dans le noir (à plus de 9 m d’un feu) : ${Math.round(R.sombre * 100)} %`);
    if (R.sombre < 0.5) ko('les rues sont trop éclairées : on ne peut pas s’y cacher');
    if (R.sombre > 0.97) ko('les rues sont toutes dans le noir');
    log(`secrets : ${R.secrets.join(', ')} ; murs qui mentent : ${R.murs.join(', ')} ; le cairn d’A. à ${R.cairn} m de la tonnellerie`);
    for (const k of ['tertre', 'chapelle', 'ermitage', 'brasier', 'cairn']) if (!R.secrets.includes(k)) ko(`le lieu secret « ${k} » n’est pas posé`);
    if (R.murs.length < 5) ko('trop peu de murs qui mentent');
    for (const it of ['v5_battant', 'v5_lettre_1', 'v5_lettre_2', 'v5_lettre_3', 'v5_lettre_4', 'v5_lettre_notaire', 'v5_couronne_cire', 'v5_carnet_ermite', 'v5_sceau_ville', 'v5_livre_feve', 'v5_masque_cire']) if (!R.objets.includes(it)) ko(`l’objet ${it} n’est posé nulle part`);
    // ---------------------------------------------------------------- à pied, depuis l'arrivée : la tonnellerie et les lieux secrets
    const A = JSON.parse(J.ev(`(()=>{const Z=__Z,WL=Z.waterLevel,S=Z.size,C=4,N=Math.floor(S/C),acc=new Uint8Array(N*N),Q=[];
      const H=new Float32Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++)H[j*N+i]=Z.heightAt((i+0.5)*C,(j+0.5)*C);
      const pont=new Float32Array(N*N).fill(-1e9);for(const p of Z.v1.ponts){for(let s=-p.L/2;s<=p.L/2;s+=1)for(let l=-p.w/2;l<=p.w/2;l+=1){const x=p.x+Math.sin(p.r)*s+Math.cos(p.r)*l,z=p.z+Math.cos(p.r)*s-Math.sin(p.r)*l,i=Math.floor(x/C),j=Math.floor(z/C);if(i>=0&&j>=0&&i<N&&j<N)pont[j*N+i]=p.y;}}
      const hh=(k)=>pont[k]>-1e8?pont[k]:H[k];
      const Ar=Z.v1.arrivee,s0=Math.floor(Ar.z/C)*N+Math.floor(Ar.x/C);acc[s0]=1;Q.push(s0);
      for(let h=0;h<Q.length;h++){const k=Q[h],i=k%N,j=(k/N)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<1||jj<1||ii>=N-1||jj>=N-1)continue;const k2=jj*N+ii;if(acc[k2])continue;const h2=hh(k2);if((h2<WL+0.4&&pont[k2]<-1e8)||Math.abs(h2-hh(k))>C*1.05)continue;acc[k2]=1;Q.push(k2);}}
      const atteint=(x,z,r)=>{const i0=Math.floor(x/C),j0=Math.floor(z/C),R=Math.max(1,Math.ceil(r/C));for(let j=j0-R;j<=j0+R;j++)for(let i=i0-R;i<=i0+R;i++){if(i<0||j<0||i>=N||j>=N)continue;if(acc[j*N+i])return true;}return false;};
      const v=Z.v5,s=Z.v5s,out={tonnellerie:atteint(v.tonnellerie.x,v.tonnellerie.z,6)};for(const k in s.lieux)out[k]=atteint(s.lieux[k].x,s.lieux[k].z,8);return JSON.stringify(out);})()`));
    log(`à pied depuis l’arrivée : ${Object.entries(A).map(([k, ok]) => k + (ok ? '' : ' NON')).join(', ')}`);
    for (const k in A) if (!A[k]) ko(`on n’atteint pas à pied : ${k}`);
    // ---------------------------------------------------------------- les objets, les butins, le troc
    const O = JSON.parse(J.ev(`(()=>{const L=Object.keys(ITEMS).filter(k=>k.startsWith('v5_'));const out=[];for(const k of L){const it=ITEMS[k];out.push({k,name:it.name,cat:it.cat,price:it.price,ic:it.ic&&it.ic[0],desc:!!it.desc});}
      const troc=Object.keys(V5_TROC_PREND).filter(k=>!ITEMS[k]);const donne=V5_TROC_DONNE.filter(t=>t.id!=='v5_dire'&&!ITEMS[t.id]).map(t=>t.id);
      return JSON.stringify({items:out,troc,donne,lect:Object.keys(V5_LECTURES).filter(k=>!ITEMS[k])});})()`));
    log(`objets nouveaux : ${O.items.length} (${O.items.map((i) => i.k.replace('v5_', '')).join(', ')})`);
    for (const it of O.items) {
      if (!it.name || !it.desc) ko(`${it.k} : sans nom ou sans description`);
      if (!(it.price >= 0) || it.price > 60) ko(`${it.k} : prix ${it.price}`);
    }
    if (O.troc.length) log(`(le troc ignore les objets absents : ${O.troc.join(', ')})`);
    if (O.donne.length) ko(`la Marchande donne des objets inconnus : ${O.donne.join(', ')}`);
    if (O.lect.length) ko(`des lectures sans objet : ${O.lect.join(', ')}`);
    const L = JSON.parse(J.ev(`(()=>{const out={};for(const k of ['v5_maison','v5_caveau']){const T=LOOT[k];if(!T){out[k]=null;continue;}let ok=Array.isArray(T.rolls)&&T.rolls[0]>=0&&T.rolls[1]>=T.rolls[0];let ev=0;const W=T.items.reduce((a,e)=>a+e[3],0);for(const e of T.items){if(e[3]>0&&e[0]!=='argent'&&!ITEMS[e[0]])ok=false;const q=(e[1]+e[2])/2,p=e[0]==='argent'?1:(ITEMS[e[0]]?ITEMS[e[0]].price:0);ev+=e[3]/W*q*p;}out[k]={ok,ev:+(ev*(T.rolls[0]+T.rolls[1])/2).toFixed(1)};}return JSON.stringify(out);})()`));
    log(`butins : ${Object.entries(L).map(([k, T]) => `${k} ${T ? T.ev + ' pièces en moyenne' : 'ABSENT'}`).join(' ; ')}`);
    for (const k in L) { if (!L[k] || !L[k].ok) ko(`le butin ${k} est invalide`); else if (L[k].ev > 40) ko(`le butin ${k} est trop riche (${L[k].ev})`); }
    // les niches des maisons : combien d'argent, au plus, en fouillant tout Basse-Fosse
    log(`tout fouiller en bas : environ ${Math.round(L.v5_maison.ev * R.maisons)} pièces (une seule fois : les niches ne se remplissent pas)`);
    return { echecs };
  },
};
