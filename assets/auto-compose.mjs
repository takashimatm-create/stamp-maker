// On-device face registration, semantic hair matting and luminance matching.
// Only static JS/WASM/model downloads go to the CDNs. Images stay in this browser.
const ROOT='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
let enginePromise;
export async function prepare(){
 if(!enginePromise)enginePromise=(async()=>{const {FilesetResolver,FaceLandmarker,ImageSegmenter}=await import(ROOT+'/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks(ROOT+'/wasm');
 const face=await FaceLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',delegate:'CPU'},runningMode:'IMAGE',numFaces:1,minFaceDetectionConfidence:0.45,minFacePresenceConfidence:0.45});
 const segment=await ImageSegmenter.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/1/selfie_multiclass_256x256.tflite',delegate:'CPU'},runningMode:'IMAGE',outputCategoryMask:false,outputConfidenceMasks:true});return {face,segment};})().catch(e=>{enginePromise=null;throw Error('自動補正の準備に失敗しました。通信環境を確認してください。生成は開始していません。')});return enginePromise;
}
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const OVAL=[10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];
export function fitSimilarity(source,target){
 const n=source.length;if(n!==target.length||n<2)throw Error('位置合わせの基準点が不足しています。');const mean=p=>p.reduce((a,v)=>[a[0]+v[0]/n,a[1]+v[1]/n],[0,0]),s=mean(source),t=mean(target);let dot=0,cross=0,den=0;
 source.forEach((p,i)=>{const x=p[0]-s[0],y=p[1]-s[1],u=target[i][0]-t[0],v=target[i][1]-t[1];dot+=x*u+y*v;cross+=x*v-y*u;den+=x*x+y*y});if(den<1e-8)throw Error('顔の位置を確認できません。');const a=dot/den,b=cross/den,tx=t[0]-a*s[0]+b*s[1],ty=t[1]-b*s[0]-a*s[1];const error=Math.sqrt(source.reduce((sum,p,i)=>sum+(a*p[0]-b*p[1]+tx-target[i][0])**2+(b*p[0]+a*p[1]+ty-target[i][1])**2,0)/n);return {a,b,tx,ty,scale:Math.hypot(a,b),error};
}
function detect(engine,input){const result=engine.face.detect(input);const points=result.faceLandmarks?.[0];return points?.map(p=>[p.x*input.width,p.y*input.height])||null}
function semantics(engine,input){let output;engine.segment.segment(input,result=>{if(result.confidenceMasks?.length!==6)throw Error('髪・肌の分離モデルを確認できません。');const masks=result.confidenceMasks.map(m=>({w:m.width,h:m.height,data:new Float32Array(m.getAsFloat32Array())}));output=masks;});return output;}
function maskCanvas(values,w,h){const c=canvas(w,h),im=c.getContext('2d').createImageData(w,h);values.forEach((v,i)=>{im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=255;im.data[i*4+3]=Math.round(clamp(v,0,1)*255)});c.getContext('2d').putImageData(im,0,0);return c}
function channelAt(m,x,y,w,h){return m.data[clamp(Math.floor(y*m.h/h),0,m.h-1)*m.w+clamp(Math.floor(x*m.w/w),0,m.w-1)]}
function connectedHair(hair,w,h,anchor){
 const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let best=[],score=Infinity;for(let start=0;start<hair.length;start++){if(seen[start]||hair[start]<.16)continue;let first=0,last=0,minDistance=Infinity;queue[last++]=start;seen[start]=1;while(first<last){const n=queue[first++],x=n%w,y=Math.floor(n/w);minDistance=Math.min(minDistance,(x-anchor[0])**2+(y-anchor[1])**2);for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){const a=x+dx,b=y+dy,k=b*w+a;if(a>=0&&a<w&&b>=0&&b<h&&!seen[k]&&hair[k]>=.16){seen[k]=1;queue[last++]=k}}}if(last>20&&minDistance<score){score=minDistance;best=Array.from(queue.subarray(0,last));}}
 const keep=new Uint8Array(w*h);for(const n of best){const x=n%w,y=Math.floor(n/w);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const a=x+dx,b=y+dy;if(a>=0&&a<w&&b>=0&&b<h)keep[b*w+a]=1}}return keep;
}
function headAlpha(input,classes,points){
 const {width:w,height:h}=input,oval=canvas(w,h),ctx=oval.getContext('2d');if(points){ctx.beginPath();OVAL.forEach((id,j)=>j?ctx.lineTo(...points[id]):ctx.moveTo(...points[id]));ctx.closePath();ctx.fill();ctx.lineJoin='round';ctx.lineWidth=3;ctx.stroke();}
 const face=ctx.getImageData(0,0,w,h).data,alpha=new Float32Array(w*h),skin=new Float32Array(w*h),hairValues=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)hairValues[y*w+x]=channelAt(classes[1],x,y,w,h);
 const keep=connectedHair(hairValues,w,h,points?points[10]:[w/2,h/2]),chin=points?points[152][1]+2:h,faceXs=points?OVAL.map(i=>points[i][0]):[0,w],left=Math.min(...faceXs)-5,right=Math.max(...faceXs)+5;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=y*w+x,hair=keep[n]?hairValues[n]:0,p=channelAt(classes[3],x,y,w,h),ovalA=points?face[n*4+3]/255:1,inside=y<=chin&&x>=left&&x<=right;skin[n]=inside?p:0;alpha[n]=Math.max(clamp((hair-0.08)/0.82,0,1),points&&inside?Math.max(ovalA,clamp((p-0.05)/0.7,0,1)):0);}
 return {alpha,skin};
}
function median(a){if(!a.length)return null;a.sort((x,y)=>x-y);return a[Math.floor(a.length/2)]}
export function luminanceGain(source,target){if(!Number.isFinite(source)||!Number.isFinite(target)||source<15)return 1;return clamp(target/source,0.78,1.28)}
function skinLight(input,skin){const d=input.getContext('2d').getImageData(0,0,input.width,input.height).data,values=[];for(let i=0;i<skin.length;i++)if(skin[i]>.85){const y=.2126*d[i*4]+.7152*d[i*4+1]+.0722*d[i*4+2];if(y>35&&y<240)values.push(y)}return values.length>30?median(values):null}
function alphaBounds(alpha,w,h){let x=w,y=h,r=0,b=0,count=0;for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(alpha[j*w+i]>.45){x=Math.min(x,i);y=Math.min(y,j);r=Math.max(r,i);b=Math.max(b,j);count++}if(count<35)throw Error('髪の輪郭を確認できません。画像を保持したまま停止しました。');return {x,y,w:r-x+1,h:b-y+1,count}}
function crop(input,region){const c=canvas(Math.ceil(region.w),Math.ceil(region.h)),ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(input,region.x,region.y,region.w,region.h,0,0,c.width,c.height);return c}
function applyProtection(ctx,protect){if(!protect)return;ctx.save();ctx.globalCompositeOperation='destination-out';ctx.drawImage(protect,0,0);ctx.restore()}
function backgroundFill(reference,classes){
 const w=reference.width,h=reference.height,original=reference.getContext('2d').getImageData(0,0,w,h),data=new Uint8ClampedArray(original.data),seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let first=0,last=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=y*w+x,k=n*4,r=data[k],g=data[k+1],b=data[k+2],white=Math.min(r,g,b)>248&&Math.max(r,g,b)-Math.min(r,g,b)<6,blue=b>140&&b-r>20&&b-g>8;if(channelAt(classes[0],x,y,w,h)>.7&&(white||blue)){if(white)data[k]=data[k+1]=data[k+2]=255;seen[n]=1;queue[last++]=n;}}
 if(!last){for(let n=0;n<w*h;n++){data[n*4]=data[n*4+1]=data[n*4+2]=255;data[n*4+3]=255;}}
 else while(first<last){const n=queue[first++],x=n%w,y=Math.floor(n/w);for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const a=x+dx,b=y+dy,k=b*w+a;if(a>=0&&a<w&&b>=0&&b<h&&!seen[k]){seen[k]=1;queue[last++]=k;for(let c=0;c<4;c++)data[k*4+c]=data[n*4+c];}}}
 const raw=canvas(w,h);raw.getContext('2d').putImageData(new ImageData(data,w,h),0,0);const out=canvas(w,h),ctx=out.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.filter='blur(6px)';ctx.drawImage(raw,0,0);return out;
}
export async function correct({source,reference,region,protect,envelope,poseOnly=false}){
 const engine=await prepare(),s=crop(source,region),t=crop(reference,region),sp=poseOnly?null:detect(engine,s),tp=poseOnly?null:detect(engine,t);
 if(!poseOnly&&(!sp||!tp))throw Error('目・鼻・顎を検出できないため、自動補正を止めました。元の画像は保持しています。');
 const sourceClasses=semantics(engine,s),targetClasses=semantics(engine,t),sm=headAlpha(s,sourceClasses,sp),tm=headAlpha(t,targetClasses,tp);let fit;
 if(sp&&tp){const ids=[33,133,362,263,1,152];fit=fitSimilarity(ids.map(i=>sp[i]),ids.map(i=>tp[i]));const eyeDistance=Math.hypot(tp[33][0]-tp[263][0],tp[33][1]-tp[263][1]);if(fit.scale<.55||fit.scale>1.7||fit.error>eyeDistance*.23)throw Error('顔の角度差が大きいため、自動補正を止めました。完成済み画像は保持しています。');}
 else{const a=alphaBounds(sm.alpha,s.width,s.height),b=alphaBounds(tm.alpha,t.width,t.height),scale=Math.min(b.w/a.w,b.h/a.h);fit={a:scale,b:0,tx:b.x+b.w/2-scale*(a.x+a.w/2),ty:b.y+b.h/2-scale*(a.y+a.h/2),scale,error:0};}
 const sourceLight=skinLight(s,sm.skin),targetLight=skinLight(t,tm.skin),gain=luminanceGain(sourceLight,targetLight),pixels=s.getContext('2d').getImageData(0,0,s.width,s.height);
 // Scale luminance only on skin; leave hair colour and image background unchanged.
 for(let n=0;n<sm.alpha.length;n++){const d=n*4,weight=clamp(sm.skin[n],0,1),g=1+(gain-1)*weight;for(let k=0;k<3;k++)pixels.data[d+k]=clamp(pixels.data[d+k]*g,0,255);pixels.data[d+3]=Math.round(sm.alpha[n]*255)}s.getContext('2d').putImageData(pixels,0,0);
 const result=canvas(reference.width,reference.height),ctx=result.getContext('2d');ctx.drawImage(reference,0,0);
 // Remove the ORIGINAL head silhouette before replacing it; never keep an old chin.
 const erase=canvas(reference.width,reference.height),ec=erase.getContext('2d');const solid=new Float32Array(tm.alpha.length);tm.alpha.forEach((v,i)=>solid[i]=v>.025?1:0);
 if(envelope&&tp){const zone=canvas(t.width,t.height);zone.getContext('2d').drawImage(envelope,region.x,region.y,region.w,region.h,0,0,t.width,t.height);const a=zone.getContext('2d').getImageData(0,0,t.width,t.height).data,d=t.getContext('2d').getImageData(0,0,t.width,t.height).data;for(let y=0;y<Math.min(t.height,tp[10][1]+5);y++)for(let x=0;x<t.width;x++){const n=y*t.width+x,k=n*4,max=Math.max(d[k],d[k+1],d[k+2]),min=Math.min(d[k],d[k+1],d[k+2]);if(a[k+3]>180&&max-min<65&&max>65)solid[n]=1;}}
 const eraser=maskCanvas(solid,t.width,t.height);ec.filter='blur(1px)';ec.drawImage(eraser,region.x,region.y,region.w,region.h);ec.filter='none';ec.drawImage(eraser,region.x,region.y,region.w,region.h);applyProtection(ec,protect);
 const restored=canvas(reference.width,reference.height),rc=restored.getContext('2d');rc.drawImage(backgroundFill(t,targetClasses),region.x,region.y,region.w,region.h);rc.globalCompositeOperation='destination-in';rc.drawImage(erase,0,0);ctx.drawImage(restored,0,0);
 const placed=canvas(reference.width,reference.height),pc=placed.getContext('2d');pc.translate(region.x,region.y);pc.transform(fit.a,fit.b,-fit.b,fit.a,fit.tx,fit.ty);pc.drawImage(s,0,0);pc.resetTransform();applyProtection(pc,protect);ctx.drawImage(placed,0,0);
 return {frame:result,diagnostics:{landmarkError:fit.error,scale:fit.scale,sourceLight,targetLight,brightnessGain:gain,poseOnly}};
}
