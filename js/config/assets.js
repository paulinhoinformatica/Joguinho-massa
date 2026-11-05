export const ASSET_MANIFEST={
 // Planned backgrounds remain registered; enable once their PNGs are installed.
 loadBackgrounds:false,
 entities:{
  protagonist:{category:'characters',name:'Kael',config:'assets/characters/protagonist/config.json',regions:['slums','industrial','corporate','virus_core']},
  cyborg_soldier:{procedural:true,category:'enemies',name:'Patrulheiro cibernético',config:'assets/enemies/cyborg_soldier/config.json',regions:['slums','industrial','corporate','virus_core']},
  infected_drone:{procedural:true,category:'enemies',name:'Drone infetado',config:'assets/enemies/infected_drone/config.json',regions:['slums','industrial','corporate','virus_core']},
  infected_robot:{procedural:true,category:'enemies',name:'Robô industrial corrompido',config:'assets/enemies/infected_robot/config.json',regions:['slums','industrial','corporate','virus_core']},
  matrona:{category:'bosses',name:'Matrona-7',config:'assets/bosses/matrona/config.json',regions:['slums']},abismo:{category:'bosses',name:'Abismo',config:'assets/bosses/abismo/config.json',procedural:true,regions:[]},
  warden:{category:'bosses',name:'Warden Prime',config:'assets/bosses/warden/config.json',procedural:true,regions:['industrial']},vespera:{category:'bosses',name:'Véspera',config:'assets/bosses/vespera/config.json',procedural:true,regions:['corporate','virus_core']},
  emp_pulse:{procedural:true,category:'effects',name:'Pulso eletromagnético',config:'assets/effects/emp_pulse/config.json',regions:['slums','industrial','corporate','virus_core']},
  npc_survivor:{procedural:true,category:'characters',name:'Habitante sobrevivente',config:'assets/characters/npcs/survivor/config.json',regions:['slums','industrial','corporate','virus_core']},
  yara:{category:'characters',name:'Yara',config:'assets/characters/npcs/yara/config.json',regions:['slums']},
  oren:{category:'characters',name:'Oren',config:'assets/characters/npcs/oren/config.json',regions:['slums','industrial']},
  ion_pistol:{procedural:true,category:'weapons',name:'Pistola de energia',config:'assets/weapons/ion_pistol/config.json',regions:['slums','industrial','corporate','virus_core']}
 },
 regions:{slums:['assets/backgrounds/slums_far.png','assets/backgrounds/slums_mid.png','assets/environments/slums/platform_tile.png'],industrial:['assets/backgrounds/industrial_far.png','assets/backgrounds/industrial_mid.png','assets/environments/industrial/platform_tile.png'],sewers:['assets/backgrounds/sewers_far.png','assets/backgrounds/sewers_mid.png','assets/environments/sewers/platform_tile.png'],corporate:['assets/backgrounds/corporate_far.png','assets/backgrounds/corporate_mid.png','assets/environments/corporate/platform_tile.png'],virus_core:['assets/backgrounds/virus_core_far.png','assets/backgrounds/virus_core_mid.png','assets/environments/virus_core/platform_tile.png']},
 backgroundLayers:{slums:[{src:'assets/backgrounds/slums_far.png',parallax:.12,depth:0,width:960,height:540,repeatX:true},{src:'assets/backgrounds/slums_mid.png',parallax:.32,depth:1,width:960,height:540,repeatX:true}],industrial:[{src:'assets/backgrounds/industrial_far.png',parallax:.12,depth:0,width:960,height:540,repeatX:true},{src:'assets/backgrounds/industrial_mid.png',parallax:.32,depth:1,width:960,height:540,repeatX:true}],sewers:[{src:'assets/backgrounds/sewers_far.png',parallax:.12,depth:0,width:960,height:540,repeatX:true},{src:'assets/backgrounds/sewers_mid.png',parallax:.32,depth:1,width:960,height:540,repeatX:true}],corporate:[{src:'assets/backgrounds/corporate_far.png',parallax:.12,depth:0,width:960,height:540,repeatX:true},{src:'assets/backgrounds/corporate_mid.png',parallax:.32,depth:1,width:960,height:540,repeatX:true}],virus_core:[{src:'assets/backgrounds/virus_core_far.png',parallax:.12,depth:0,width:960,height:540,repeatX:true},{src:'assets/backgrounds/virus_core_mid.png',parallax:.32,depth:1,width:960,height:540,repeatX:true}]},
 regionTiles:{slums:'assets/environments/slums/platform_tile.png',industrial:'assets/environments/industrial/platform_tile.png',sewers:'assets/environments/sewers/platform_tile.png',corporate:'assets/environments/corporate/platform_tile.png',virus_core:'assets/environments/virus_core/platform_tile.png'},
 environmentObjects:{slums:[],industrial:[],sewers:[],corporate:[],virus_core:[]}
};
export const PROTOTYPE_FALLBACKS=true;
