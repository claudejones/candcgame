// Hazard/object tuning recovered from LAB25Q. Structural extraction only.
export const HAZARD_CONFIG = {
  characterCollision: {
    claude:{run:{w:.56,h:.96,x:0,y:0},idle:{w:.54,h:.90,x:0,y:0},jump:{w:.56,h:.82,x:0,y:.02},slide:{w:.72,h:1,x:.03,y:0},hit:{w:.60,h:.84,x:0,y:0},celebrate:{w:.56,h:.90,x:0,y:0}},
    constance:{run:{w:.54,h:1,x:0,y:0},idle:{w:.52,h:.90,x:0,y:0},jump:{w:.55,h:.82,x:0,y:.02},slide:{w:.70,h:.94,x:.01,y:0},hit:{w:.58,h:.84,x:0,y:0},celebrate:{w:.54,h:.90,x:0,y:0}}
  },
  flying:{mode:'high',highClearance:68,lowClearance:18,speed:170,fps:8},
  stages:{
    na01:[{name:'Cactus',kind:'ground',atlasKey:'na01Hazards',scale:.22,groundOffset:28,cw:.32,ch:.66,cx:0,cy:-.08},{name:'Cattle Bones',kind:'ground',atlasKey:'na01Hazards',scale:.26,groundOffset:30,cw:.62,ch:.22,cx:0,cy:-.06},{name:'Vulture',kind:'flying',atlasKey:'na01Bird',frames:4,scale:.34,cw:.56,ch:.38,cx:-.08,cy:.12}],
    na02:[{name:'Fallen Log',kind:'ground',atlasKey:'na02Hazards',scale:.22,groundOffset:36,cw:.70,ch:.30,cx:0,cy:-.14},{name:'Boulder',kind:'ground',atlasKey:'na02Hazards',scale:.20,groundOffset:36,cw:.52,ch:.52,cx:.04,cy:-.12},{name:'Eagle',kind:'flying',atlasKey:'na02Bird',frames:4,scale:.34,cw:.60,ch:.46,cx:-.06,cy:.06}],
    na03:[{name:'Fire Hydrant',kind:'ground',atlasKey:'na03Hazards',scale:.22,groundOffset:32,cw:.32,ch:.70,cx:-.08,cy:-.02},{name:'Street Barricade',kind:'ground',atlasKey:'na03Hazards',scale:.18,groundOffset:26,cw:.60,ch:.64,cx:-.02,cy:0},{name:'Pigeons',kind:'flying',atlasKey:'na03Bird',frames:4,scale:.32,cw:.68,ch:.54,cx:0,cy:.06}],
    sa01:[{name:'Giant Root / Stump',kind:'ground',atlasKey:'sa01Hazards',scale:.17,groundOffset:36,cw:.58,ch:.64,cx:0,cy:-.08},{name:'Tropical Plant Cluster',kind:'ground',atlasKey:'sa01Hazards',scale:.20,groundOffset:38,cw:.74,ch:.42,cx:0,cy:-.08},{name:'Macaws',kind:'flying',atlasKey:'sa01Bird',frames:4,scale:.30,cw:.52,ch:.48,cx:.02,cy:.08}],
    sa02:[{name:'Rock Outcrop',kind:'ground',atlasKey:'sa02Hazards',scale:.22,groundOffset:26,cw:.46,ch:.52,cx:.16,cy:-.08},{name:'Llama / Alpaca',kind:'ground',atlasKey:'sa02Hazards',scale:.26,groundOffset:28,cw:.26,ch:.64,cx:-.06,cy:-.06},{name:'Andean Flamingo',kind:'flying',atlasKey:'sa02Bird',frames:4,scale:.34,cw:.64,ch:.40,cx:.04,cy:.04}],
    sa03:[{name:'Beach Vendor Cart',kind:'ground',atlasKey:'sa03Hazards',scale:.20,groundOffset:40,cw:.42,ch:.64,cx:-.02,cy:-.04},{name:'Beach Street Barrier',kind:'ground',atlasKey:'sa03Hazards',scale:.22,groundOffset:42,cw:.68,ch:.34,cx:-.04,cy:-.04},{name:'Tropical Parakeets',kind:'flying',atlasKey:'sa03Bird',frames:4,scale:.30,cw:.60,ch:.52,cx:0,cy:.04}],
    eu01:[{name:'Market Crates & Baskets',kind:'ground',atlasKey:'eu01Hazards',scale:.18,groundOffset:34,cw:.68,ch:.54,cx:0,cy:-.05},{name:'Rolling Wooden Barrel',kind:'ground',atlasKey:'eu01Barrel',frames:4,scale:.20,groundOffset:34,cw:.62,ch:.58,cx:0,cy:-.05},{name:'Aegean Gulls',kind:'flying',atlasKey:'eu01Bird',frames:4,scale:.30,cw:.62,ch:.48,cx:0,cy:.05}],
    eu02:[{name:'Paris Café Table & Chairs',kind:'ground',atlasKey:'eu02Hazards',scale:.20,groundOffset:34,cw:.70,ch:.58,cx:0,cy:-.05},{name:'Paris Bicycle',kind:'ground',atlasKey:'eu02Hazards',scale:.20,groundOffset:34,cw:.70,ch:.50,cx:0,cy:-.05},{name:'European Swallows',kind:'flying',atlasKey:'eu02Bird',frames:4,scale:.30,cw:.62,ch:.48,cx:0,cy:.05}],
    eu03:[{name:'Gaudí Mosaic Bench',kind:'ground',atlasKey:'eu03Hazards',scale:.20,groundOffset:34,cw:.74,ch:.48,cx:0,cy:-.05},{name:'Barcelona Drinking Fountain',kind:'ground',atlasKey:'eu03Hazards',scale:.20,groundOffset:34,cw:.42,ch:.72,cx:0,cy:-.04},{name:'Mediterranean Bats',kind:'flying',atlasKey:'eu03Bird',frames:4,scale:.30,cw:.62,ch:.50,cx:0,cy:.04}]
  }
};
