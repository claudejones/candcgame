export class AssetLoader {
  constructor(createImage = () => new Image()) { this.createImage=createImage; this.cache=new Map(); this.request=0; }
  load(source) {
    if(!this.cache.has(source)) {
      const promise=new Promise((resolve,reject)=>{
        const image=this.createImage();
        image.onload=async()=>{try{await image.decode();resolve(image);}catch{reject(new Error('Image could not be decoded.'));}};
        image.onerror=()=>reject(new Error('Image could not be loaded.'));
        image.src=source;
      });
      this.cache.set(source,promise);
      promise.catch(()=>this.cache.delete(source));
    }
    return this.cache.get(source);
  }
  async select(entries, {progress, ready, failed}) {
    const token=++this.request; let completed=0, rejected=false;
    progress(0,entries.length);
    try {
      const loaded=await Promise.all(entries.map(async([key,source])=>{
        const image=await this.load(source);
        if(token===this.request && !rejected)progress(++completed,entries.length);
        return [key,image];
      }));
      if(token===this.request)ready(Object.fromEntries(loaded));
    } catch(error) {
      rejected=true;
      if(token===this.request)failed(error);
    }
  }
}
