const KEY='brumas-de-ambar-save-v1';
export function saveGame(state){try{localStorage.setItem(KEY,JSON.stringify({...state,savedAt:Date.now()}));return true}catch(e){console.warn('Não foi possível guardar:',e);return false}}
export function loadGame(){try{const raw=localStorage.getItem(KEY);if(!raw)return null;const data=JSON.parse(raw);return data&&data.version===1&&Array.isArray(data.party)?data:null}catch(e){console.warn('Gravação inválida; será iniciado um jogo novo.',e);return null}}
export function hasSave(){return !!loadGame()}export function clearSave(){localStorage.removeItem(KEY)}
