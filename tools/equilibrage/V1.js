// Équilibrage — la Grande Porte et la Zone (agent V1, quatorzième vague)
//  - la vallée ne bouge pas (empreinte des anciens objets) ; la Porte est posée, sur la terre ferme, au pied d'une paroi,
//    et l'on y va à pied depuis la ferme (parcours au pas de 4 m, pentes douces) ;
//  - la Porte est parfois fermée, jamais le plus souvent : toute la journée des morts, les matins de brume, une nuit sur
//    trois environ (mesuré sur 120 jours) ;
//  - la Zone fait deux fois la surface de la vallée ; ses sites réservés existent, sont aplanis à leur hauteur annoncée,
//    au sec (sauf ce qui est sous terre) ; depuis l'arrivée, on atteint à pied chaque région et chaque site de surface
//    (les ponts comptent) ; on n'y meurt pas de faim faute de feux : six feux de veille, chacun à côté d'un chemin.
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');
module.exports = {
  titre: 'La Grande Porte et la Zone (V1)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- la vallée et la Porte
    const w = await vallee(J, 1234);
    const e = empreinte(w, [98896, 1308, 516]);
    log(`empreinte des anciens objets : ${e === EMPREINTE_1234 ? 'inchangée' : 'CHANGÉE ' + e}`);
    if (e !== EMPREINTE_1234) ko('l’empreinte de la vallée a changé');
    J.ctx.__w = w;
    const P = JSON.parse(J.ev(`(()=>{const w=__w,P=w.v1porte;if(!P)return 'null';
      const WL=w.waterLevel,C=4,N=Math.floor(w.size/C),F=w.lm.ferme,acc=new Uint8Array(N*N),Q=[];const H=(i,j)=>w.heightAt((i+0.5)*C,(j+0.5)*C);
      const s0=Math.floor(F.z/C)*N+Math.floor(F.x/C);acc[s0]=1;Q.push(s0);const S=P.sortie,ci=Math.floor(S.x/C),cj=Math.floor(S.z/C);let ok=false,pas=0;
      for(let h=0;h<Q.length;h++){const k=Q[h],i=k%N,j=(k/N)|0;if(Math.abs(i-ci)<=2&&Math.abs(j-cj)<=2){ok=true;break;}
        for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<1||jj<1||ii>=N-1||jj>=N-1)continue;const k2=jj*N+ii;if(acc[k2])continue;const h2=H(ii,jj);if(h2<WL+0.5||Math.abs(h2-H(i,j))>C*1.0)continue;acc[k2]=1;Q.push(k2);}}
      const R=w.lm.ruines;
      return JSON.stringify({x:Math.round(P.x),z:Math.round(P.z),haut:+(P.y-WL).toFixed(1),paroi:P.paroi,plat:P.plat,ok,
        ruines:R?Math.round(Math.hypot(R.x-P.x,R.z-P.z)):null,ferme:Math.round(Math.hypot(F.x-P.x,F.z-P.z)),
        n:w.props.filter(q=>q.id==='v1_vantail').length,ni:w.inter.filter(i=>i.kind==='v1_porte').length});})()`));
    if (!P) ko('pas de Grande Porte dans la vallée');
    else {
      log(`la Porte : ${P.x}, ${P.z}, ${P.haut} m au-dessus de l'eau ; paroi ${P.paroi} m sur trente ; à ${P.ruines} m des ruines, ${P.ferme} m de la ferme ; à pied depuis la ferme : ${P.ok ? 'oui' : 'NON'}`);
      if (!P.ok) ko('on ne va pas à pied de la ferme à la Porte');
      if (P.haut < 2) ko('la Porte est au ras de l’eau');
      if (P.paroi < 12) ko('la Porte n’est pas au pied d’une paroi');
      if (P.n !== 2 || P.ni !== 1) ko(`vantaux ${P.n}, interactions ${P.ni}`);
    }
    // ---------------------------------------------------------------- quand la Porte est fermée
    const F = JSON.parse(J.ev(`(()=>{farm.s={seed:1234,day:1};const out={n:0,t:0,vorndi:0,brume:0,nuit:0,vorndiOuvert:0,joursFermes:0};
      for(let d=1;d<=120;d++){let f=false;for(let h=0;h<24;h+=0.5){const r=porteV1.fermee(d,h);out.t++;if(r){out.n++;out[r]++;f=true;}if(cal.is('morts',d)&&h>=6&&!r)out.vorndiOuvert++;}if(f)out.joursFermes++;}
      farm.s=null;return JSON.stringify(out);})()`));
    const part = F.n / F.t;
    log(`sur 120 jours : fermée ${(part * 100).toFixed(1)} % du temps (jour des morts ${F.vorndi / 2} h, brume ${F.brume / 2} h, nuits ${F.nuit / 2} h) ; ${F.joursFermes} jours avec au moins une fermeture`);
    if (F.vorndiOuvert) ko('la Porte s’ouvre le jour des morts');
    if (part < 0.06 || part > 0.3) ko('la Porte est trop rarement ou trop souvent fermée');
    if (!F.brume || !F.nuit) ko('il manque une sorte de fermeture');
    // ---------------------------------------------------------------- la Zone
    const t0 = Date.now();
    const Z = await J.ev('zoneGen.generer(zone.graine(), () => {})');
    const dt = Date.now() - t0;
    J.ctx.__Z = Z;
    const surf = (Z.size * Z.size) / (w.size * w.size);
    log(`la Zone : ${Z.N} cases de ${Z.cell} m, ${Z.size} m de côté (vallée ${w.size} m) : ${surf.toFixed(3)} fois la surface ; générée en ${dt} ms (machine virtuelle) ; ${Z.objects.length} objets, ${Z.blocks.length} blocs, ${Z.props.length} objets posés`);
    if (Math.abs(surf - 2) > 0.03) ko('la Zone ne fait pas deux fois la surface de la vallée');
    const R = JSON.parse(J.ev(`(()=>{const Z=__Z,WL=Z.waterLevel,S=Z.size,C=4,N=Math.floor(S/C),acc=new Uint8Array(N*N),Q=[];
      const H=new Float32Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++)H[j*N+i]=Z.heightAt((i+0.5)*C,(j+0.5)*C);
      // les ponts : leurs cases sont praticables (à leur hauteur)
      const pont=new Float32Array(N*N).fill(-1e9);for(const p of Z.v1.ponts){for(let s=-p.L/2;s<=p.L/2;s+=1)for(let l=-p.w/2;l<=p.w/2;l+=1){const x=p.x+Math.sin(p.r)*s+Math.cos(p.r)*l,z=p.z+Math.cos(p.r)*s-Math.sin(p.r)*l,i=Math.floor(x/C),j=Math.floor(z/C);if(i>=0&&j>=0&&i<N&&j<N)pont[j*N+i]=p.y;}}
      const hh=(k)=>pont[k]>-1e8?pont[k]:H[k];
      const A=Z.v1.arrivee,s0=Math.floor(A.z/C)*N+Math.floor(A.x/C);acc[s0]=1;Q.push(s0);
      for(let h=0;h<Q.length;h++){const k=Q[h],i=k%N,j=(k/N)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<1||jj<1||ii>=N-1||jj>=N-1)continue;const k2=jj*N+ii;if(acc[k2])continue;const h2=hh(k2);if((h2<WL+0.4&&pont[k2]<-1e8)||Math.abs(h2-hh(k))>C*1.05)continue;acc[k2]=1;Q.push(k2);}}
      const atteint=(x,z,r)=>{const i0=Math.floor(x/C),j0=Math.floor(z/C),R=Math.max(1,Math.ceil(r/C));for(let j=j0-R;j<=j0+R;j++)for(let i=i0-R;i<=i0+R;i++){if(i<0||j<0||i>=N||j>=N)continue;if(acc[j*N+i])return true;}return false;};
      const reg={};for(const k in V1_REGIONS){const G=V1_REGIONS[k];reg[k]=atteint(G.x*S,G.z*S,G.r*S*0.25);}
      const sites=zone.sites().map(s=>({id:s.id,sous:s.sous,y:+s.y.toFixed(1),sol:+Z.heightAt(s.x,s.z).toFixed(1),eau:Z.heightAt(s.x,s.z)<WL+0.3,ok:s.sous?true:atteint(s.x,s.z,s.r),plat:(()=>{if(s.sous)return 0;let m=0;for(let a=0;a<12;a++)for(const f of [0.3,0.6,0.9]){m=Math.max(m,Math.abs(Z.heightAt(s.x+Math.cos(a)*s.r*f,s.z+Math.sin(a)*s.r*f)-s.y));}return +m.toFixed(2);})()}));
      const feux=Z.props.filter(q=>q.id==='v1_feu').map(q=>({id:q.data.id,ok:atteint(q.x,q.z,3),eau:Z.heightAt(q.x,q.z)<WL+0.3}));
      let n=0;for(let k=0;k<acc.length;k++)n+=acc[k];
      return JSON.stringify({reg,sites,feux,part:n/(N*N),arrivee:+(Z.heightAt(A.x,A.z)-WL).toFixed(1)});})()`));
    log(`à pied depuis l'arrivée (${R.arrivee} m au-dessus de l'eau) : ${(R.part * 100).toFixed(0)} % de la Zone ; régions : ${Object.entries(R.reg).map(([k, v]) => k + (v ? '' : ' NON')).join(', ')}`);
    for (const k in R.reg) if (!R.reg[k] && k !== 'etang') ko(`la région ${k} n’est pas atteinte à pied`);
    for (const s of R.sites) {
      if (!s.sous && s.eau) ko(`le site ${s.id} est dans l’eau`);
      if (!s.sous && s.plat > 0.8) ko(`le site ${s.id} n’est pas plat (écart ${s.plat} m)`);
      if (!s.ok && !s.id.startsWith('dragon_')) ko(`le site ${s.id} n’est pas atteint à pied`);
    }
    log(`sites : ${R.sites.map((s) => `${s.id}${s.sous ? ' (sous terre, y ' + s.y + ')' : (s.ok ? '' : ' (hors d’atteinte : ' + (s.id.startsWith('dragon_') ? 'perchoir' : 'NON') + ')')}`).join(', ')}`);
    log(`feux de veille : ${R.feux.length} (${R.feux.map((f) => f.id + (f.ok ? '' : ' NON')).join(', ')})`);
    if (R.feux.length < 5) ko('trop peu de feux de veille');
    for (const f of R.feux) if (!f.ok || f.eau) ko(`le feu ${f.id} n’est pas atteint à pied ou est dans l’eau`);
    return { echecs };
  },
};
