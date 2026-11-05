export const OREN_UPGRADE=Object.freeze({price:20,health:15,maxHealth:190});
export function buyOrenUpgrade(state){
 const p=state.player;
 if(p.maxHealth+OREN_UPGRADE.health>OREN_UPGRADE.maxHealth)return{success:false,message:'Esse reforço já está no nível máximo. Nem minhas ferramentas fazem milagres.'};
 if(state.credits<OREN_UPGRADE.price)return{success:false,message:'Preciso de 20 créditos. Ferramentas não se pagam com promessas, garoto.'};
 const gain=OREN_UPGRADE.health;
 state.credits-=OREN_UPGRADE.price;p.maxHealth+=gain;p.health=p.maxHealth;
 return{success:true,message:`Reforço instalado: +${gain} PV máximos por 20 créditos. Agora trate de não estragar meu trabalho.`};
}
