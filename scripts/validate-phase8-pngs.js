"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = [
  "assets/phase8-validation/north-america/NA01_BG_DISTANT_MESAS.png",
  "assets/phase8-validation/north-america/NA01_BG_MID_DESERT.png",
  "assets/phase8-validation/north-america/NA01_GROUND_DESERT.png",
  "assets/phase8-validation/north-america/NA02_BG_DISTANT_MOUNTAINS.png",
  "assets/phase8-validation/north-america/NA02_BG_MID_PINES.png",
  "assets/phase8-validation/north-america/NA02_GROUND_TRAIL.png",
  "assets/phase8-validation/north-america/NA03_BG_DISTANT_NYC.png",
  "assets/phase8-validation/north-america/NA03_BG_MID_CITY.png",
  "assets/phase8-validation/north-america/NA03_GROUND_CITY.png"
];

const EXPECTED_DIMENSIONS = {
  "assets/phase8-validation/north-america/NA03_GROUND_CITY.png": [2170, 725]
};

const CRC_TABLE = Array.from({length:256},(_,n)=>{
  let c=n;
  for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;
  return c>>>0;
});

function crc32(buffer){
  let c=0xffffffff;
  for(const byte of buffer)c=CRC_TABLE[(c^byte)&0xff]^(c>>>8);
  return (c^0xffffffff)>>>0;
}

function validatePng(relative){
  const file=path.join(ROOT,relative),data=fs.readFileSync(file);
  if(!data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error(`${relative}: invalid PNG signature`);
  let offset=8,ihdr=null,ended=false;
  const idat=[];
  while(offset<data.length){
    if(offset+12>data.length)throw new Error(`${relative}: truncated PNG chunk header`);
    const length=data.readUInt32BE(offset),type=data.toString("ascii",offset+4,offset+8),end=offset+12+length;
    if(end>data.length)throw new Error(`${relative}: truncated ${type} chunk`);
    const payload=data.subarray(offset+8,offset+8+length),expected=data.readUInt32BE(offset+8+length),actual=crc32(data.subarray(offset+4,offset+8+length));
    if(actual!==expected)throw new Error(`${relative}: ${type} CRC mismatch`);
    if(type==="IHDR"){
      if(ihdr)throw new Error(`${relative}: duplicate IHDR`);
      ihdr={width:payload.readUInt32BE(0),height:payload.readUInt32BE(4),depth:payload[8],colorType:payload[9],compression:payload[10],filter:payload[11],interlace:payload[12]};
    }else if(type==="IDAT")idat.push(payload);
    else if(type==="IEND"){
      if(length!==0)throw new Error(`${relative}: invalid IEND`);
      ended=true;offset=end;break;
    }
    offset=end;
  }
  if(!ihdr||!idat.length||!ended||offset!==data.length)throw new Error(`${relative}: incomplete PNG structure`);
  const [expectedWidth,expectedHeight]=EXPECTED_DIMENSIONS[relative]||[2172,724];
  if(ihdr.width!==expectedWidth||ihdr.height!==expectedHeight)throw new Error(`${relative}: expected ${expectedWidth}x${expectedHeight}, got ${ihdr.width}x${ihdr.height}`);
  if(ihdr.compression!==0||ihdr.filter!==0||ihdr.interlace!==0)throw new Error(`${relative}: unsupported PNG encoding`);
  const channels={0:1,2:3,3:1,4:2,6:4}[ihdr.colorType];
  if(!channels)throw new Error(`${relative}: unsupported color type ${ihdr.colorType}`);
  const bytesPerRow=Math.ceil(ihdr.width*channels*ihdr.depth/8),expectedInflated=ihdr.height*(bytesPerRow+1);
  let inflated;
  try{inflated=zlib.inflateSync(Buffer.concat(idat));}catch(error){throw new Error(`${relative}: IDAT decompression failed (${error.message})`);}
  if(inflated.length!==expectedInflated)throw new Error(`${relative}: incomplete pixel data (${inflated.length}/${expectedInflated} bytes)`);
  for(let y=0;y<ihdr.height;y++)if(inflated[y*(bytesPerRow+1)]>4)throw new Error(`${relative}: invalid filter byte at row ${y}`);
  console.log(`PNG OK ${relative} ${ihdr.width}x${ihdr.height}`);
}

for(const asset of ASSETS)validatePng(asset);
