"use strict";
window.GAME_CONFIG={
 canvas:{w:960,h:540},
 activeWorld:"sa01",
 worldProfiles:{
   na01:{label:"NA 1 — DESERT",farKey:"far",midKey:"mid",groundKey:"ground",seamY:408,farY:58,farScale:1.00,midYOffset:0,midScale:1.00,midParallax:0.20,groundYOffset:0,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:0,constance:0}},
   na02:{label:"NA 2 — PINES / MOUNTAINS",farKey:"na02Far",midKey:"na02Mid",groundKey:"na02Ground",seamY:428,farY:74,farScale:1.00,midYOffset:-35,midScale:1.00,midParallax:0.20,groundYOffset:-43,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:0,constance:0}},
   na03:{label:"NA 3 — CITY",farKey:"na03Far",midKey:"na03Mid",groundKey:"na03Ground",seamY:407,farY:66,farScale:1.00,midYOffset:22,midScale:1.00,midParallax:0.20,groundYOffset:0,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:0,constance:0}},
   sa01:{label:"SA 1 — AMAZON RAINFOREST",farKey:"sa01Far",midKey:"sa01Mid",groundKey:"sa01Ground",seamY:408,farY:-14,farScale:1.00,midYOffset:-42,midScale:1.00,midParallax:0.20,groundYOffset:-8,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:6,constance:7}},
   sa02:{label:"SA 2 — ANDES MOUNTAINS",farKey:"sa02Far",midKey:"sa02Mid",groundKey:"sa02Ground",seamY:420,farY:-4,farScale:1.00,midYOffset:0,midScale:1.00,midParallax:0.20,groundYOffset:-26,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:-5,constance:-6}},
   sa03:{label:"SA 3 — RIO DE JANEIRO",farKey:"sa03Far",midKey:"sa03Mid",groundKey:"sa03Ground",seamY:408,farY:-52,farScale:1.00,midYOffset:-64,midScale:1.00,midParallax:0.20,groundYOffset:-30,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:12,constance:13}},
   eu01:{label:"EU 1 — GREECE / SANTORINI",farKey:"eu01Far",midKey:"eu01Mid",groundKey:"eu01Ground",seamY:408,farY:0,farScale:1.00,midYOffset:0,midScale:1.00,midParallax:0.20,groundYOffset:0,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:0,constance:0},clouds:true},
   eu02:{label:"EU 2 — FRANCE / PARIS",farKey:"eu02Far",midKey:"eu02Mid",groundKey:"eu02Ground",seamY:408,farY:0,farScale:1.00,midYOffset:0,midScale:1.00,midParallax:0.20,groundYOffset:0,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:0,constance:0},clouds:true},
   eu03:{label:"EU 3 — SPAIN / BARCELONA",farKey:"eu03Far",midKey:"eu03Mid",groundKey:"eu03Ground",seamY:408,farY:0,farScale:1.00,midYOffset:0,midScale:1.00,midParallax:0.20,groundYOffset:0,groundScale:1.00,groundParallax:1.00,characterGrounding:{claude:0,constance:0},clouds:true}
 },
 worldContract:{
   sourceW:2048,
   sourceH:682,
   midBaselineSourceY:621,
   groundSurfaceSourceY:393,
   cloudSpeed:8,
   cloudY:0,
   cloudScale:0.65,
   cloudOpacity:0.75,
   showGuides:false,
   footOffset:{claude:19,constance:20}
 },
 objectQA:{
   activeIndex:{na01:0,na02:0,na03:2,sa01:0,sa02:0,sa03:0,eu01:0,eu02:0,eu03:0},
   x:650, groundOffset:36, showBounds:true, scrollWithWorld:false, scrollOrigin:0, loopDistance:1120,
   characterCollision:{
     claude:{run:{w:.56,h:.96,x:0,y:0},idle:{w:.54,h:.90,x:0,y:0},jump:{w:.56,h:.82,x:0,y:.02},slide:{w:.72,h:1.00,x:.03,y:0},hit:{w:.60,h:.84,x:0,y:0},celebrate:{w:.56,h:.90,x:0,y:0}},
     constance:{run:{w:.54,h:1.00,x:0,y:0},idle:{w:.52,h:.90,x:0,y:0},jump:{w:.55,h:.82,x:0,y:.02},slide:{w:.70,h:.94,x:.01,y:0},hit:{w:.58,h:.84,x:0,y:0},celebrate:{w:.54,h:.90,x:0,y:0}}
   },
   defs:{
     na01:[
       {name:"Cactus",kind:"ground",atlasKey:"na01Hazards",rect:{x:0,y:0,w:887,h:887},scale:.22,groundOffset:28,cw:.32,ch:.66,cx:0,cy:-.08},
       {name:"Cattle Bones",kind:"ground",atlasKey:"na01Hazards",rect:{x:887,y:0,w:887,h:887},scale:.26,groundOffset:30,cw:.62,ch:.22,cx:0,cy:-.06},
       {name:"Vulture",kind:"flying",atlasKey:"na01Bird",frameW:512,frameH:682,frames:4,scale:.34,cw:.56,ch:.38,cx:-.08,cy:.12}
     ],
     na02:[
       {name:"Fallen Log",kind:"ground",atlasKey:"na02Hazards",rect:{x:0,y:0,w:887,h:887},scale:.22,groundOffset:36,cw:.70,ch:.30,cx:0,cy:-.14},
       {name:"Boulder",kind:"ground",atlasKey:"na02Hazards",rect:{x:887,y:0,w:887,h:887},scale:.20,groundOffset:36,cw:.52,ch:.52,cx:.04,cy:-.12},
       {name:"Eagle",kind:"flying",atlasKey:"na02Bird",frameW:512,frameH:682,frames:4,scale:.34,cw:.60,ch:.46,cx:-.06,cy:.06}
     ],
     na03:[
       {name:"Fire Hydrant",kind:"ground",atlasKey:"na03Hazards",rect:{x:0,y:0,w:887,h:887},scale:.22,groundOffset:32,cw:.32,ch:.70,cx:-.08,cy:-.02},
       {name:"Street Barricade",kind:"ground",atlasKey:"na03Hazards",rect:{x:887,y:0,w:887,h:887},scale:.18,groundOffset:26,cw:.60,ch:.64,cx:-.02,cy:0},
       {name:"Pigeons",kind:"flying",atlasKey:"na03Bird",frameW:512,frameH:682,frames:4,scale:.32,cw:.68,ch:.54,cx:0,cy:.06}
     ],
     sa01:[
       {name:"Giant Root / Stump",kind:"ground",atlasKey:"sa01Hazards",rect:{x:0,y:0,w:887,h:887},scale:.17,groundOffset:36,cw:.58,ch:.64,cx:0,cy:-.08,crop:{l:0,r:0,t:0,b:0}},
       {name:"Tropical Plant Cluster",kind:"ground",atlasKey:"sa01Hazards",rect:{x:887,y:0,w:887,h:887},scale:.20,groundOffset:38,cw:.74,ch:.42,cx:0,cy:-.08,crop:{l:0,r:0,t:0,b:0}},
       {name:"Macaws",kind:"flying",atlasKey:"sa01Bird",frameW:543,frameH:724,frames:4,scale:.30,cw:.52,ch:.48,cx:.02,cy:.08,crop:{l:0,r:0,t:0,b:0}}
     ],
     sa02:[
       {name:"Rock Outcrop",kind:"ground",atlasKey:"sa02Hazards",rect:{x:0,y:0,w:1086,h:724},scale:.22,groundOffset:26,cw:.46,ch:.52,cx:.16,cy:-.08,crop:{l:0,r:0,t:0,b:0}},
       {name:"Llama / Alpaca",kind:"ground",atlasKey:"sa02Hazards",rect:{x:1086,y:0,w:1086,h:724},scale:.26,groundOffset:28,cw:.26,ch:.64,cx:-.06,cy:-.06,crop:{l:0,r:0,t:0,b:0}},
       {name:"Andean Flamingo",kind:"flying",atlasKey:"sa02Bird",frameW:543,frameH:724,frames:4,scale:.34,cw:.64,ch:.40,cx:.04,cy:.04,crop:{l:0,r:0,t:0,b:0}}
     ],
     sa03:[
       {name:"Beach Vendor Cart",kind:"ground",atlasKey:"sa03Hazards",rect:{x:0,y:0,w:887,h:887},scale:.20,groundOffset:40,cw:.42,ch:.64,cx:-.02,cy:-.04,crop:{l:0,r:3,t:0,b:0}},
       {name:"Beach Street Barrier",kind:"ground",atlasKey:"sa03Hazards",rect:{x:887,y:0,w:887,h:887},scale:.22,groundOffset:42,cw:.68,ch:.34,cx:-.04,cy:-.04,crop:{l:0,r:0,t:0,b:0}},
       {name:"Tropical Parakeets",kind:"flying",atlasKey:"sa03Bird",frameW:543,frameH:724,frames:4,scale:.30,cw:.60,ch:.52,cx:0,cy:.04,crop:{l:0,r:0,t:0,b:0}}
     ],
     eu01:[
       {name:"Market Crates & Baskets",kind:"ground",atlasKey:"eu01Hazards",rect:{x:0,y:0,w:1774,h:887},scale:.18,groundOffset:34,cw:.68,ch:.54,cx:0,cy:-.05,crop:{l:0,r:0,t:0,b:0}},
       {name:"Rolling Wooden Barrel",kind:"ground",atlasKey:"eu01Barrel",frameW:543,frameH:724,frames:4,scale:.20,groundOffset:34,cw:.62,ch:.58,cx:0,cy:-.05,crop:{l:0,r:0,t:0,b:0}},
       {name:"Aegean Gulls",kind:"flying",atlasKey:"eu01Bird",frameW:543,frameH:724,frames:4,scale:.30,cw:.62,ch:.48,cx:0,cy:.05,crop:{l:0,r:0,t:0,b:0}}
     ],
     eu02:[
       {name:"Paris Café Table & Chairs",kind:"ground",atlasKey:"eu02Hazards",rect:{x:0,y:0,w:1536,h:512},scale:.20,groundOffset:34,cw:.70,ch:.58,cx:0,cy:-.05,crop:{l:0,r:0,t:0,b:0}},
       {name:"Paris Bicycle",kind:"ground",atlasKey:"eu02Hazards",rect:{x:0,y:512,w:1536,h:512},scale:.20,groundOffset:34,cw:.70,ch:.50,cx:0,cy:-.05,crop:{l:0,r:0,t:0,b:0}},
       {name:"European Swallows",kind:"flying",atlasKey:"eu02Bird",frameW:543,frameH:724,frames:4,scale:.30,cw:.62,ch:.48,cx:0,cy:.05,crop:{l:0,r:0,t:0,b:0}}
     ],
     eu03:[
       {name:"Gaudí Mosaic Bench",kind:"ground",atlasKey:"eu03Hazards",rect:{x:0,y:0,w:1086,h:724},scale:.20,groundOffset:34,cw:.74,ch:.48,cx:0,cy:-.05,crop:{l:0,r:0,t:0,b:0}},
       {name:"Barcelona Drinking Fountain",kind:"ground",atlasKey:"eu03Hazards",rect:{x:1086,y:0,w:1086,h:724},scale:.20,groundOffset:34,cw:.42,ch:.72,cx:0,cy:-.04,crop:{l:0,r:0,t:0,b:0}},
       {name:"Mediterranean Bats",kind:"flying",atlasKey:"eu03Bird",frameW:443.5,frameH:887,frames:4,scale:.30,cw:.62,ch:.50,cx:0,cy:.04,crop:{l:0,r:0,t:0,b:0}}
     ]
   },
   flying:{mode:"high",highClearance:68,lowClearance:18,speed:170,fps:8,frame:0,t:0,travel:0}
 },
 spawnDirector:{
   enabled:false, paused:false, failed:false, unlimitedLives:false, elapsed:0, active:[], hits:0, cleared:0, lastEvent:"Ready",
   stageDuration:90, startingLives:3, lives:3, finishRelease:5, maxVisible:2, reactionLead:2.20, spawnLeadX:1080,
   signatureStart:75, seed:2309, planned:[], nextPlanIndex:0,
   speedClasses:{slow:150,normal:170,fast:210},
   altitudeMix:{high:55,low:45},
   phases:{warmup:[0,10],establish:[10,30],develop:[30,55],pressure:[55,75],signature:[75,85],finish:[85,90]}
 },
 hitRecovery:{recoveryDuration:1.10,invulnerabilityDuration:2.00,showStars:true},
 actions:{slideDuration:0.75},
 finish:{
   triggerWidth:56, showBounds:false,
   stages:{
     na01:{scale:.22,groundOffset:24,xOffset:-4},
     na02:{scale:.22,groundOffset:24,xOffset:-4},
     na03:{scale:.22,groundOffset:24,xOffset:-4},
     sa01:{scale:.22,groundOffset:30,xOffset:-4},
     sa02:{scale:.22,groundOffset:24,xOffset:-4},
     sa03:{scale:.22,groundOffset:38,xOffset:-4},
     eu01:{scale:.22,groundOffset:24,xOffset:-4},
     eu02:{scale:.22,groundOffset:24,xOffset:-4},
     eu03:{scale:.22,groundOffset:24,xOffset:-4}
   }
 },
 characterX:220,
 worldSpeed:120,
 masterScale:{"claude":0.185,"constance":0.179},
 stateScale:{
   claude:{run:1.000,idle:0.820,jump:0.780,slide:0.700,hit:0.820,celebrate:0.870},
   constance:{run:1.000,idle:0.810,jump:0.900,slide:0.770,hit:0.830,celebrate:0.840}
 },
 renderOffsetX:{
   claude:{run:0,idle:0,jump:0,slide:0,hit:0,celebrate:0},
   constance:{run:0,idle:0,jump:0,slide:0,hit:0,celebrate:0}
 },
 renderOffsetY:{
   claude:{run:0,idle:0,jump:0,slide:0,hit:0,celebrate:0},
   constance:{run:0,idle:0,jump:0,slide:0,hit:0,celebrate:0}
 },
 cropInsets:{
   claude:{run:Array.from({length:4},()=>({l:0,r:0,t:0,b:0})),idle:Array.from({length:2},()=>({l:0,r:0,t:0,b:0})),jump:Array.from({length:3},()=>({l:0,r:0,t:0,b:0})),slide:Array.from({length:2},()=>({l:0,r:0,t:0,b:0})),hit:Array.from({length:3},()=>({l:0,r:0,t:0,b:0})),celebrate:Array.from({length:4},()=>({l:0,r:0,t:0,b:0}))},
   constance:{run:Array.from({length:4},()=>({l:0,r:0,t:0,b:0})),idle:Array.from({length:2},()=>({l:0,r:0,t:0,b:0})),jump:Array.from({length:3},()=>({l:0,r:0,t:0,b:0})),slide:[{l:0,r:0,t:0,b:0},{l:55,r:0,t:0,b:0}],hit:Array.from({length:3},()=>({l:0,r:0,t:0,b:0})),celebrate:Array.from({length:4},()=>({l:0,r:0,t:0,b:0}))}
 },
 characterQA:{showCropBounds:false,showCollisionBounds:false},
 starYOffset:{claude:4,constance:4},
 starScale:{claude:0.36,constance:0.34},
 cell:700,
 starCell:{w:240,h:150},
 starRenderScale:0.56,
 starFPS:10,
 jump:{launch:-402,gravity:825},
 state:{"run": {"frames": 4, "fps": 9, "scroll": true}, "idle": {"frames": 2, "fps": 1.4, "scroll": false}, "jump": {"frames": 3, "fps": 0, "scroll": true}, "slide": {"frames": 2, "fps": 10, "scroll": true}, "hit": {"frames": 3, "fps": 0, "scroll": false}, "celebrate": {"frames": 4, "fps": 6, "scroll": false}},
 visibleMeta:{"run": [[{"w": 311, "h": 364, "top": 336, "bottom": 700, "lift": 0}, {"w": 213, "h": 363, "top": 337, "bottom": 700, "lift": 0}, {"w": 343, "h": 364, "top": 336, "bottom": 700, "lift": 0}, {"w": 240, "h": 364, "top": 336, "bottom": 700, "lift": 0}], [{"w": 316, "h": 376, "top": 324, "bottom": 700, "lift": 0}, {"w": 244, "h": 374, "top": 326, "bottom": 700, "lift": 0}, {"w": 334, "h": 376, "top": 324, "bottom": 700, "lift": 0}, {"w": 240, "h": 374, "top": 326, "bottom": 700, "lift": 0}]], "idle": [[{"w": 299, "h": 473, "top": 227, "bottom": 700, "lift": 0}, {"w": 300, "h": 473, "top": 227, "bottom": 700, "lift": 0}], [{"w": 298, "h": 499, "top": 201, "bottom": 700, "lift": 0}, {"w": 301, "h": 498, "top": 202, "bottom": 700, "lift": 0}]], "jump": [[{"w": 346, "h": 387, "top": 313, "bottom": 700, "lift": 0}, {"w": 323, "h": 503, "top": 197, "bottom": 700, "lift": 0}, {"w": 335, "h": 346, "top": 354, "bottom": 700, "lift": 0}], [{"w": 326, "h": 427, "top": 273, "bottom": 700, "lift": 0}, {"w": 312, "h": 448, "top": 252, "bottom": 700, "lift": 0}, {"w": 325, "h": 411, "top": 289, "bottom": 700, "lift": 0}]], "slide": [[{"w": 660, "h": 393, "top": 307, "bottom": 700, "lift": 0}, {"w": 616, "h": 413, "top": 287, "bottom": 700, "lift": 0}], [{"w": 660, "h": 431, "top": 269, "bottom": 700, "lift": 0}, {"w": 636, "h": 405, "top": 260, "bottom": 665, "lift": 35}]], "hit": [[{"w": 466, "h": 509, "top": 191, "bottom": 700, "lift": 0}, {"w": 276, "h": 443, "top": 257, "bottom": 700, "lift": 0}, {"w": 326, "h": 427, "top": 273, "bottom": 700, "lift": 0}], [{"w": 470, "h": 511, "top": 189, "bottom": 700, "lift": 0}, {"w": 289, "h": 458, "top": 242, "bottom": 700, "lift": 0}, {"w": 314, "h": 458, "top": 242, "bottom": 700, "lift": 0}]], "celebrate": [[{"w": 290, "h": 445, "top": 255, "bottom": 700, "lift": 0}, {"w": 303, "h": 475, "top": 225, "bottom": 700, "lift": 0}, {"w": 278, "h": 512, "top": 154, "bottom": 666, "lift": 34}, {"w": 288, "h": 438, "top": 262, "bottom": 700, "lift": 0}], [{"w": 315, "h": 470, "top": 230, "bottom": 700, "lift": 0}, {"w": 321, "h": 480, "top": 220, "bottom": 700, "lift": 0}, {"w": 289, "h": 427, "top": 239, "bottom": 666, "lift": 34}, {"w": 303, "h": 452, "top": 248, "bottom": 700, "lift": 0}]]}
};
