export const GAMEPLAY_CONFIG={
 characterX:220,worldSpeed:120,cell:700,
 masterScale:{claude:.185,constance:.179},
 stateScale:{claude:{run:1,idle:.820,jump:.780,slide:.700,hit:.820,celebrate:.870},constance:{run:1,idle:.810,jump:.900,slide:.770,hit:.830,celebrate:.840}},
 state:{run:{frames:4,fps:9,scroll:true},idle:{frames:2,fps:1.4,scroll:false},jump:{frames:3,fps:0,scroll:true},slide:{frames:2,fps:10,scroll:true},hit:{frames:3,fps:0,scroll:false},celebrate:{frames:4,fps:6,scroll:false}},
 cropInsets:{claude:{slide:[{l:0,r:0,t:0,b:0},{l:0,r:0,t:0,b:0}]},constance:{slide:[{l:0,r:0,t:0,b:0},{l:55,r:0,t:0,b:0}]}},
 jump:{launch:-402,gravity:825},
 actions:{slideDuration:.75,productionSlideDuration:.70},
 hitRecovery:{recoveryDuration:1.10,invulnerabilityDuration:2,showStars:true},
 footOffset:{claude:19,constance:20},
 star:{cell:{w:240,h:150},fps:10,scale:{claude:.36,constance:.34},yOffset:{claude:4,constance:4}},
 spawnDirector:{stageDuration:90,startingLives:3,finishRelease:5,maxVisible:2,reactionLead:2.20,spawnLeadX:1080,signatureStart:75,seed:2309,speedClasses:{slow:150,normal:170,fast:210},altitudeMix:{high:55,low:45},phases:{warmup:[0,10],establish:[10,30],develop:[30,55],pressure:[55,75],signature:[75,85],finish:[85,90]}},
 flying:{highClearance:68,lowClearance:18,speed:170,fps:8}
};
