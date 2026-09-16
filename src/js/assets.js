const ROOT='../assets';
export const ASSET_URLS={
 run:`${ROOT}/characters/G1A_RUN_CYCLE_ATLAS.png`,idle:`${ROOT}/characters/G1B_IDLE_ATLAS.png`,jump:`${ROOT}/characters/G1C_JUMP_ATLAS.png`,slide:`${ROOT}/characters/G1D_SLIDE_ATLAS.png`,hit:`${ROOT}/characters/G1E_HIT_ATLAS.png`,celebrate:`${ROOT}/characters/G1F_CELEBRATE_ATLAS.png`,stars:`${ROOT}/characters/FX_STUN_STARS_ATLAS.png`,clouds:`${ROOT}/shared/NA_CLOUD_LAYER.png`,finish:`${ROOT}/shared/NA_STAGE_FINISH_MARKER.png`,
 far:`${ROOT}/worlds/north-america/NA01_BG_DISTANT_MESAS.png`,mid:`${ROOT}/worlds/north-america/NA01_BG_MID_DESERT.png`,ground:`${ROOT}/worlds/north-america/NA01_GROUND_DESERT.png`,
 na02Far:`${ROOT}/worlds/north-america/NA02_BG_DISTANT_MOUNTAINS.png`,na02Mid:`${ROOT}/worlds/north-america/NA02_BG_MID_PINES.png`,na02Ground:`${ROOT}/worlds/north-america/NA02_GROUND_TRAIL.png`,
 na03Far:`${ROOT}/worlds/north-america/NA03_BG_DISTANT_NYC.png`,na03Mid:`${ROOT}/worlds/north-america/NA03_BG_MID_CITY.png`,na03Ground:`${ROOT}/worlds/north-america/NA03_GROUND_CITY.png`,
 sa01Far:`${ROOT}/worlds/south-america/SA01_BG_DISTANT_AMAZON.png`,sa01Mid:`${ROOT}/worlds/south-america/SA01_BG_MID_AMAZON.png`,sa01Ground:`${ROOT}/worlds/south-america/SA01_GROUND_AMAZON.png`,
 sa02Far:`${ROOT}/worlds/south-america/SA02_BG_DISTANT_ANDES.png`,sa02Mid:`${ROOT}/worlds/south-america/SA02_BG_MID_ANDES.png`,sa02Ground:`${ROOT}/worlds/south-america/SA02_GROUND_ANDES.png`,
 sa03Far:`${ROOT}/worlds/south-america/SA03_BG_DISTANT_RIO.png`,sa03Mid:`${ROOT}/worlds/south-america/SA03_BG_MID_RIO.png`,sa03Ground:`${ROOT}/worlds/south-america/SA03_GROUND_RIO.png`,
 eu01Far:`${ROOT}/worlds/europe/EU01_BG_DISTANT_GREECE.png`,eu01Mid:`${ROOT}/worlds/europe/EU01_BG_MID_GREECE.png`,eu01Ground:`${ROOT}/worlds/europe/EU01_GROUND_GREECE.png`,
 eu02Far:`${ROOT}/worlds/europe/EU02_BG_DISTANT_PARIS.png`,eu02Mid:`${ROOT}/worlds/europe/EU02_BG_MID_PARIS.png`,eu02Ground:`${ROOT}/worlds/europe/EU02_GROUND_PARIS.png`,
 eu03Far:`${ROOT}/worlds/europe/EU03_BG_DISTANT_BARCELONA.png`,eu03Mid:`${ROOT}/worlds/europe/EU03_BG_MID_BARCELONA.png`,eu03Ground:`${ROOT}/worlds/europe/EU03_GROUND_BARCELONA.png`
};
export async function loadAssets(){const entries=await Promise.all(Object.entries(ASSET_URLS).map(([key,url])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([key,img]);img.onerror=()=>reject(new Error(`Asset failed: ${key} ${url}`));img.src=url;})));return Object.fromEntries(entries);}
