// Extracted from LAB25Q reference implementation. Preserve behavior until unified landscape contract replaces per-stage calibration.
export const LEGACY_WORLD_CONFIG = {
  canvas: { w: 960, h: 540 },
  activeWorld: 'sa01',
  worldContract: {
    sourceW: 2048,
    sourceH: 682,
    midBaselineSourceY: 621,
    groundSurfaceSourceY: 393,
    cloudSpeed: 8,
    cloudY: 0,
    cloudScale: 0.65,
    cloudOpacity: 0.75,
    footOffset: { claude: 19, constance: 20 }
  },
  profiles: {
    na01:{label:'NA 1 — DESERT',farKey:'far',midKey:'mid',groundKey:'ground',seamY:408,farY:58,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1,characterGrounding:{claude:0,constance:0}},
    na02:{label:'NA 2 — PINES / MOUNTAINS',farKey:'na02Far',midKey:'na02Mid',groundKey:'na02Ground',seamY:428,farY:74,farScale:1,midYOffset:-35,midScale:1,midParallax:.20,groundYOffset:-43,groundScale:1,groundParallax:1,characterGrounding:{claude:0,constance:0}},
    na03:{label:'NA 3 — CITY',farKey:'na03Far',midKey:'na03Mid',groundKey:'na03Ground',seamY:407,farY:66,farScale:1,midYOffset:22,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1,characterGrounding:{claude:0,constance:0}},
    sa01:{label:'SA 1 — AMAZON RAINFOREST',farKey:'sa01Far',midKey:'sa01Mid',groundKey:'sa01Ground',seamY:408,farY:-14,farScale:1,midYOffset:-42,midScale:1,midParallax:.20,groundYOffset:-8,groundScale:1,groundParallax:1,characterGrounding:{claude:6,constance:7}},
    sa02:{label:'SA 2 — ANDES MOUNTAINS',farKey:'sa02Far',midKey:'sa02Mid',groundKey:'sa02Ground',seamY:420,farY:-4,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:-26,groundScale:1,groundParallax:1,characterGrounding:{claude:-5,constance:-6}},
    sa03:{label:'SA 3 — RIO DE JANEIRO',farKey:'sa03Far',midKey:'sa03Mid',groundKey:'sa03Ground',seamY:408,farY:-52,farScale:1,midYOffset:-64,midScale:1,midParallax:.20,groundYOffset:-30,groundScale:1,groundParallax:1,characterGrounding:{claude:12,constance:13}},
    eu01:{label:'EU 1 — GREECE / SANTORINI',farKey:'eu01Far',midKey:'eu01Mid',groundKey:'eu01Ground',seamY:408,farY:0,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1,characterGrounding:{claude:0,constance:0},clouds:true},
    eu02:{label:'EU 2 — FRANCE / PARIS',farKey:'eu02Far',midKey:'eu02Mid',groundKey:'eu02Ground',seamY:408,farY:0,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1,characterGrounding:{claude:0,constance:0},clouds:true},
    eu03:{label:'EU 3 — SPAIN / BARCELONA',farKey:'eu03Far',midKey:'eu03Mid',groundKey:'eu03Ground',seamY:408,farY:0,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1,characterGrounding:{claude:0,constance:0},clouds:true}
  }
};

// Target replacement contract under validation. These values are not yet production-locked.
export const UNIFIED_WORLD_TARGET = {
  logicalViewport: { w: 480, h: 270 },
  runningSurfaceY: 205,
  sourceCanvas: { w: 2172, h: 724 },
  requirement: 'One shared FAR/MID/GROUND geometry; regenerate/normalize landscapes that fail it rather than adding stage offsets.'
};
