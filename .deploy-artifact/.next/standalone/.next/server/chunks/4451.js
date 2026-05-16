"use strict";exports.id=4451,exports.ids=[4451],exports.modules={60635:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(26510);let a=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))})},88364:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(26510);let a=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m19.5 8.25-7.5 7.5-7.5-7.5"}))})},22277:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(26510);let a=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))})},38198:(e,t,n)=>{n.d(t,{B:()=>a,C:()=>s,F:()=>c,H:()=>o,R:()=>m,S:()=>u,a:()=>d,b:()=>p,c:()=>l,d:()=>f,e:()=>i});var r=n(96419);let a=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,i=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,o=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,s=(0,r.zo)(i)`
  padding: 20px 0;
`,l=(0,r.zo)(i)`
  gap: 16px;
`,c=r.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=r.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;r.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=r.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  width: 100%;
  background: var(--privy-color-background-2);
  border-radius: var(--privy-border-radius-md);
  && h4 {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
    text-decoration: underline;
    font-weight: medium;
  }
  && p {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
  }
`,p=r.zo.div`
  height: 16px;
`,m=r.zo.div`
  height: 12px;
`;r.zo.div`
  position: relative;
`;let f=r.zo.div`
  height: ${e=>e.height??"12"}px;
`;r.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},17846:(e,t,n)=>{n.d(t,{S:()=>k});var r=n(4913),a=n(26510),i=n(96419),o=n(13813),s=n(38102),l=n(90684);let c=i.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=i.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=i.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,i.zo)(s.M)`
  margin: 0 -8px;
`,m=i.zo.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;

  /* Enable scrolling */
  overflow-y: auto;

  /* Hide scrollbar but keep functionality when scrollable */
  /* Add padding for focus outline space, offset with negative margin */
  padding: 3px;
  margin: -3px;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-gutter: stable both-edges;
  scrollbar-width: none;
  -ms-overflow-style: none;

  /* Gradient effect for scroll indication */
  ${({$colorScheme:e})=>"light"===e?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.06)) bottom;":"dark"===e?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.06)) bottom;":void 0}

  background-repeat: no-repeat;
  background-size:
    100% 32px,
    100% 16px;
  background-attachment: local, scroll;
`,f=i.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,g=i.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,h=i.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,x=i.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,y=i.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,v=i.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=i.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=i.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 82px;

  > div {
    position: relative;
  }

  > div > :first-child {
    position: relative;
  }

  > div > :last-child {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`,k=({children:e,...t})=>(0,r.jsx)(c,{children:(0,r.jsx)(d,{...t,children:e})}),S=i.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,j=(0,i.zo)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,A=i.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,z=({step:e})=>e?(0,r.jsx)(S,{children:(0,r.jsx)(A,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:t,icon:n,iconVariant:a,iconLoadingStatus:i,showBack:o,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:m,step:f,headerTitle:v,...b})=>(0,r.jsxs)(u,{...b,children:[(0,r.jsx)(p,{backFn:o?s:void 0,infoFn:l?c:void 0,onClose:d?m:void 0,title:v,closeable:d}),(n||a||e||t)&&(0,r.jsxs)(g,{children:[n||a?(0,r.jsx)(k.Icon,{icon:n,variant:a,loadingStatus:i}):null,!(!e&&!t)&&(0,r.jsxs)(h,{children:[e&&(0,r.jsx)(x,{children:e}),t&&(0,r.jsx)(y,{children:t})]})]}),f&&(0,r.jsx)(z,{step:f})]}),(k.Body=a.forwardRef(({children:e,...t},n)=>(0,r.jsx)(m,{ref:n,...t,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...t})=>(0,r.jsx)(f,{id:"privy-content-footer-container",...t,children:e}),k.Actions=({children:e,...t})=>(0,r.jsx)(C,{...t,children:e}),k.HelpText=({children:e,...t})=>(0,r.jsx)(I,{...t,children:e}),k.FooterText=({children:e,...t})=>(0,r.jsx)(T,{...t,children:e}),k.Watermark=()=>(0,r.jsx)(j,{}),k.Icon=({icon:e,variant:t="subtle",loadingStatus:n})=>"logo"===t&&e?(0,r.jsx)(b,"string"==typeof e?{children:(0,r.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===t?e?(0,r.jsx)(w,{children:(0,r.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,r.jsx)(o.N,{success:n?.success,fail:n?.fail}),"string"==typeof e?(0,r.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,r.jsx)(v,{$variant:t,children:(0,r.jsx)(l.N,{size:"64px"})}):(0,r.jsx)(v,{$variant:t,children:e&&("string"==typeof e?(0,r.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(t){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let C=i.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,I=i.zo.div`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 13px;
    line-height: 20px;

    & a {
      text-decoration: underline;
    }
  }
`,T=i.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,t,n)=>{n.d(t,{S:()=>o});var r=n(4913),a=n(38102),i=n(17846);let o=({primaryCta:e,secondaryCta:t,helpText:n,footerText:o,watermark:s=!0,children:l,...c})=>{let d=e||t?(0,r.jsxs)(r.Fragment,{children:[e&&(()=>{let{label:t,...n}=e,i=n.variant||"primary";return(0,r.jsx)(a.a,{...n,variant:i,style:{width:"100%",...n.style},children:t})})(),t&&(()=>{let{label:e,...n}=t,i=n.variant||"secondary";return(0,r.jsx)(a.a,{...n,variant:i,style:{width:"100%",...n.style},children:e})})()]}):null;return(0,r.jsxs)(i.S,{id:c.id,className:c.className,children:[(0,r.jsx)(i.S.Header,{...c}),l?(0,r.jsx)(i.S.Body,{children:l}):null,n||d||s?(0,r.jsxs)(i.S.Footer,{children:[n?(0,r.jsx)(i.S.HelpText,{children:n}):null,d?(0,r.jsx)(i.S.Actions,{children:d}):null,s?(0,r.jsx)(i.S.Watermark,{}):null]}):null,o?(0,r.jsx)(i.S.FooterText,{children:o}):null]})}},70886:(e,t,n)=>{n.d(t,{e:()=>a});var r=n(96419);let a=r.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 82px;

  > div {
    position: relative;
  }

  > div > span {
    position: absolute;
    left: -41px;
    top: -41px;
  }

  > div > :last-child {
    position: absolute;
    left: -19px;
    top: -19px;
  }
`},67395:(e,t,n)=>{n.r(t),n.d(t,{StandardSignAndSendTransactionScreen:()=>_,default:()=>_});var r=n(4913),a=n(26510),i=n(56370),o=n(55182),s=n(14348),l=n(49171),c=n(9781),d=n(91778),u=n(60635),p=n(96419),m=n(38102),f=n(38198),g=n(82145),h=n(51766),x=n(63622),y=n(57194),v=n(70886),b=n(13813),w=n(18013),k=n(77013),S=n(81340),j=n(21849),A=n(47949);function z(e){return Object.freeze({executable:e.executable,lamports:e.lamports,programAddress:e.owner,space:e.space})}async function C(e,t,n={}){let{abortSignal:r,...a}=n;return(await e.getMultipleAccounts(t,{...a,encoding:"jsonParsed"}).send({abortSignal:r})).value.map((e,n)=>e&&"object"==typeof e&&"parsed"in e.data?function(e,t){if(!t)return Object.freeze({address:e,exists:!1});let n=t.data.parsed.info||{};return(t.data.program||t.data.parsed.type)&&(n.parsedAccountMeta={program:t.data.program,type:t.data.parsed.type}),Object.freeze({...z(t),address:e,data:n,exists:!0})}(t[n],e):function(e,t){if(!t)return Object.freeze({address:e,exists:!1});let n=(0,A.tA)().encode(t.data[0]);return Object.freeze({...z(t),address:e,data:n,exists:!0})}(t[n],e))}async function I(e,t,n){if(0===e.length)return{};let r=await C(t,e,n);return function(e){let t=e.filter(e=>(!("exists"in e)||"exists"in e&&e.exists)&&e.data instanceof Uint8Array);if(t.length>0){let e=t.map(e=>e.address);throw new j.g1$(j.L25,{addresses:e})}}(r),function(e){let t=e.filter(e=>!e.exists);if(t.length>0){let e=t.map(e=>e.address);throw new j.g1$(j.SH6,{addresses:e})}}(r),r.reduce((e,t)=>({...e,[t.address]:t.data.addresses}),{})}var T=n(79726),E=n(51542),$=n(75989),F=n(24689);n(50470),n(36577),n(46898),n(42330),n(84440);let L=p.zo.span`
  && {
    width: 82px;
    height: 82px;
    border-width: 4px;
    border-style: solid;
    border-color: ${e=>e.color??"var(--privy-color-accent)"};
    background-color: ${e=>e.color??"var(--privy-color-accent)"};
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
  }
`,O=({instruction:e,fees:t,transactionInfo:n,solPrice:a,chain:i})=>(0,r.jsxs)(h.a,{children:[n?.action&&(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"Action"}),(0,r.jsx)(x.V,{children:n.action})]}),null!=e?.total&&(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"Total"}),(0,r.jsx)(x.V,{children:e.total})]}),!e?.total&&null!=e?.amount&&(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"Total"}),(0,r.jsx)(x.V,{children:(0,r.jsx)(y.S,{quantities:[e.amount,t],tokenPrice:a})})]}),(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"Fees"}),(0,r.jsx)(x.V,{children:(0,r.jsx)(y.S,{quantities:[t],tokenPrice:a})})]}),e?.to&&(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"To"}),(0,r.jsx)(x.V,{children:(0,r.jsx)(y.W,{walletAddress:e.to,chainId:i,chainType:"solana"})})]})]}),P=({fees:e,onClose:t,receiptHeader:n,receiptDescription:a,transactionInfo:i,solPrice:o,signOnly:s,instruction:l,chain:c})=>(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(m.M,{onClose:t}),(0,r.jsx)(v.e,{style:{marginBottom:"16px"},children:(0,r.jsxs)("div",{children:[(0,r.jsx)(L,{color:"var(--privy-color-success-light)"}),(0,r.jsx)(u.Z,{height:38,width:38,strokeWidth:2,stroke:"var(--privy-color-success)"})]})}),(0,r.jsx)(g.C,{title:n??`Transaction ${s?"signed":"complete"}!`,description:a??"You're all set."}),(0,r.jsx)(O,{solPrice:o,instruction:l,fees:e,transactionInfo:i,chain:c}),(0,r.jsx)(b.G,{}),(0,r.jsx)(B,{loading:!1,onClick:t,children:"Close"}),(0,r.jsx)(f.R,{}),(0,r.jsx)(m.B,{})]}),B=(0,p.zo)(m.P)`
  && {
    margin-top: 24px;
  }
  transition:
    color 350ms ease,
    background-color 350ms ease;
`;async function U(e,t){try{return await e}catch{return t}}async function D({privyClient:e,chain:t,mint:n}){let r=F.D[t];if(!r[n]){let a=await e.getSplTokenMetadata({mintAddress:n,cluster:function(e){switch(e){case"solana:mainnet":return"mainnet-beta";case"solana:devnet":return"devnet";case"solana:testnet":return"testnet"}}(t)});a&&(r[n]={address:n,symbol:a.symbol,decimals:a.decimals})}return r[n]}async function R({tx:e,solanaClient:t,privyClient:n,checkFunds:r}){let a=(0,S.o$)().decode((0,$.a)(e)),i=a.staticAccounts[0]??"",o=await (0,$.f)({solanaClient:t,tx:e}),s=r?await U((0,$.s)({solanaClient:t,tx:e})):void 0,l=s?.hasFunds??!0,c={},d=[],u=await async function({solanaClient:e,message:t}){if(!("addressTableLookups"in t)||!t.addressTableLookups)return[...t.staticAccounts];let n=t.addressTableLookups.map(e=>e.lookupTableAddress),r=await I(n,e.rpc),a=n.map((e,n)=>[...t.addressTableLookups[n]?.writableIndexes.map(t=>{let a=r[e]?.[t];if(a)return{key:a,isWritable:!0,altIdx:n}})??[],...t.addressTableLookups[n]?.readonlyIndexes.map(t=>{let a=r[e]?.[t];if(a)return{key:a,isWritable:!1,altIdx:n}})??[]]).flat().filter(e=>!!e).sort((e,t)=>e.isWritable!==t.isWritable?e.isWritable?-1:1:e.altIdx-t.altIdx).map(({key:e})=>e);return[...t.staticAccounts,...a]}({solanaClient:t,message:a});for(let e of a.instructions){let r=a.staticAccounts[e.programAddressIndex]||"";if(r!==F.T&&r!==F.a){if(r!==F.S){if(r===F.A){let t=await U(function(e,t,n){let[r,a,i,o]=e.accountIndices?.map(e=>t[e])??[];return{type:"ata-creation",program:n,payer:r,ata:a,owner:i,mint:o}}(e,u,r));if(!t){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}if(d.push(t),t.ata&&t.owner&&t.mint){c[t.ata]={owner:t.owner,mint:t.mint};continue}}if(F.R.includes(r)){let a=await U(J(e,u,t,n,r));if(!a){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}d.push(a)}else if(F.J.includes(r)){let a=await U(V(e,u,t,n,r));if(!a){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}d.push(a)}else d.push({type:"unknown",program:r,discriminator:e.data?.[0]})}else{let t=await U(N(e,u));if(!t){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}d.push(t)}}else{let a=await U(H(e,u,t,n,c,r));if(!a){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}d.push(a),"spl-transfer"===a.type&&(a.fromAta&&a.fromAccount&&a.token.address&&(c[a.fromAta]??={owner:a.fromAccount,mint:a.token.address}),a.toAta&&a.toAccount&&a.token.address&&(c[a.toAta]??={owner:a.toAccount,mint:a.token.address}))}}return{spender:i,fee:o,instructions:d,hasFunds:!!l}}function M(e,t=0){try{return function(e,t=0){let n=0n;for(let r=0;r<8;r++)n|=BigInt(e[t+r])<<BigInt(8*r);return n}(e,t)}catch{}try{return e.readBigInt64LE(t)}catch{}let n=(0,$.b)(e);try{return((e,t=0)=>{let n=e[t],r=e[t+7];if(!n||!r)throw Error(`Buffer offset out of range: first: ${n}, last: ${r}.`);return(BigInt(e[t+4]+256*e[t+5]+65536*e[t+6]+(r<<24))<<32n)+BigInt(n+256*e[++t]+65536*e[++t]+16777216*e[++t])})(n)}catch{}try{return n.subarray(t).readBigInt64LE()}catch{}try{return n.readBigInt64LE(t)}catch{}return 0n}async function H(e,t,n,r,a,i){let o=e.data?.[0],s=e.accountIndices?.map(e=>t[e])??[];if(1===o){let[e,t,n]=s;return{type:"spl-init-account",program:i,account:e,mint:t,owner:n}}if(3===o){let t,o,[l,c,d]=s,u="",p=c?a[c]:void 0;if(p)t=p.owner,u=p.mint;else if(c){let e=await n.rpc.getAccountInfo(c,{commitment:"confirmed",encoding:"jsonParsed"}).send(),r=e.value?.data;t=r?.parsed?.info?.owner,u=r?.parsed?.info?.mint??"",o=r?.parsed?.info?.tokenAmount?.decimals}if(!u&&l){let e=await n.rpc.getAccountInfo(l,{commitment:"confirmed",encoding:"jsonParsed"}).send(),t=e.value?.data;u=t?.parsed?.info?.mint??""}let m=await D({privyClient:r,chain:n.chain,mint:u}),f=m?.symbol??"";return o??=m?.decimals??9,{type:"spl-transfer",program:i,fromAta:l,fromAccount:d,toAta:c,toAccount:t,value:M(e.data,1),token:{symbol:f,decimals:o,address:u}}}if(9===o){let[e,t,n]=s;return{type:"spl-close-account",program:i,source:e,destination:t,owner:n}}if(17===o)return{type:"spl-sync-native",program:i};throw Error(`Token program instruction type ${o} not supported`)}async function N(e,t){let n=e.data?.[0],r=e.accountIndices?.map(e=>t[e])??[];if(0===n){let[,t]=r;return{type:"create-account",program:F.S,account:t?.toString(),value:M(e.data,4),withSeed:!1}}if(2===n){let[t,n]=r;return{type:"sol-transfer",program:F.S,fromAccount:t,toAccount:n,token:{symbol:"SOL",decimals:9},value:M(e.data,4),withSeed:!1}}if(3===n){let[,t]=r;return{type:"create-account",program:F.S,account:t,withSeed:!0,value:M(e.data.slice(e.data.length-32-8-8))}}if(11===n){let[t,n]=r;return{type:"sol-transfer",program:F.S,fromAccount:t,toAccount:n,value:M(e.data,4),token:{symbol:"SOL",decimals:9},withSeed:!0}}throw Error(`System program instruction type ${n} not supported`)}async function J(e,t,n,r,a){let i=e.accountIndices?.map(e=>t[e])??[],o=e.data?.[0];if(143===o){let t=i[10],o=i[11];return{type:"raydium-swap-base-input",program:a,mintIn:t,mintOut:o,tokenIn:t?await D({privyClient:r,chain:n.chain,mint:t}):void 0,tokenOut:o?await D({privyClient:r,chain:n.chain,mint:o}):void 0,amountIn:M(e.data,8),minimumAmountOut:M(e.data,16)}}if(55===o){let t=i[10],o=i[11];return{type:"raydium-swap-base-output",program:a,mintIn:t,mintOut:o,tokenIn:t?await D({privyClient:r,chain:n.chain,mint:t}):void 0,tokenOut:o?await D({privyClient:r,chain:n.chain,mint:o}):void 0,maxAmountIn:M(e.data,8),amountOut:M(e.data,16)}}throw Error(`Raydium swap program instruction type ${o} not supported`)}async function V(e,t,n,r,a){let i=e.data?.[0],o=e.accountIndices?.map(e=>t[e])??[];if([208,51,239,151,123,43,237,92].includes(i)){let t=o[5],i=o[6];return{type:"jupiter-swap-exact-out-route",program:a,mintIn:t,mintOut:i,tokenIn:t?await D({privyClient:r,chain:n.chain,mint:t}):void 0,tokenOut:i?await D({privyClient:r,chain:n.chain,mint:i}):void 0,outAmount:M(e.data,e.data.length-1-2-8-8),quotedInAmount:M(e.data,e.data.length-1-2-8)}}if([176,209,105,168,154,125,69,62].includes(i)){let t=o[7],i=o[8];return{type:"jupiter-swap-exact-out-route",program:a,mintIn:t,mintOut:i,tokenIn:t?await D({privyClient:r,chain:n.chain,mint:t}):void 0,tokenOut:i?await D({privyClient:r,chain:n.chain,mint:i}):void 0,outAmount:M(e.data,e.data.length-1-2-8-8),quotedInAmount:M(e.data,e.data.length-1-2-8)}}if([193,32,155,51,65,214,156,129].includes(i)){let t=o[7],i=o[8];return{type:"jupiter-swap-shared-accounts-route",program:a,mintIn:t,mintOut:i,tokenIn:t?await D({privyClient:r,chain:n.chain,mint:t}):void 0,tokenOut:i?await D({privyClient:r,chain:n.chain,mint:i}):void 0,inAmount:M(e.data,e.data.length-1-2-8-8),quotedOutAmount:M(e.data,e.data.length-1-2-8)}}throw[62,198,214,193,213,159,108,210].includes(i)&&console.warn("Jupiter swap program instruction 'claim' not implemented"),[116,206,27,191,166,19,0,73].includes(i)&&console.warn("Jupiter swap program instruction 'claim_token' not implemented"),[26,74,236,151,104,64,183,249].includes(i)&&console.warn("Jupiter swap program instruction 'close_token' not implemented"),[229,194,212,172,8,10,134,147].includes(i)&&console.warn("Jupiter swap program instruction 'create_open_orders' not implemented"),[28,226,32,148,188,136,113,171].includes(i)&&console.warn("Jupiter swap program instruction 'create_program_open_orders' not implemented"),[232,242,197,253,240,143,129,52].includes(i)&&console.warn("Jupiter swap program instruction 'create_token_ledger' not implemented"),[147,241,123,100,244,132,174,118].includes(i)&&console.warn("Jupiter swap program instruction 'create_token_account' not implemented"),[229,23,203,151,122,227,173,42].includes(i)&&console.warn("Jupiter swap program instruction 'route' not implemented"),[150,86,71,116,167,93,14,104].includes(i)&&console.warn("Jupiter swap program instruction 'route_with_token_ledger' not implemented"),[228,85,185,112,78,79,77,2].includes(i)&&console.warn("Jupiter swap program instruction 'set_token_ledger' not implemented"),[230,121,143,80,119,159,106,170].includes(i)&&console.warn("Jupiter swap program instruction 'shared_accounts_route_with_token_ledger' not implemented"),Error(`Jupiter swap program instruction type ${i} not supported`)}let _={component:()=>{let{data:e,onUserCloseViaDialogOrKeybindRef:t,setModalData:n,navigate:u}=(0,o.a)(),{client:p,closePrivyModal:m,walletProxy:f,showFiatPrices:g}=(0,l.u)(),h=(0,s.u)(),{user:x}=(0,o.u)(),y=(0,$.u)()(e?.standardSignAndSendTransaction?.chain??"solana:mainnet"),[v,b]=(0,a.useState)(e?.standardSignAndSendTransaction?.transaction),[j,z]=(0,a.useState)(),[C,I]=(0,a.useState)(),[L,O]=(0,a.useState)({value:0n,isLoading:!1}),[B,U]=(0,a.useState)(!1),[D,M]=(0,a.useState)({}),[H,N]=(0,a.useState)(),J=e?.standardSignAndSendTransaction?.account,V=!!e?.standardSignAndSendTransaction?.signOnly,_=!!e?.standardSignAndSendTransaction?.isSponsored,W=J?.imported?(0,o.h)(x).find(e=>e.address===J.address):(0,o.g)(x),{solPrice:q,isSolPriceLoading:Z}=(0,c.u)({enabled:g}),G=(0,a.useMemo)(()=>{if(!j)return;let e=j.spender,t=(0,k.g)(j.fee),n=(0,k.g)(L.value,3,!0),r=j.instructions.filter(e=>["sol-transfer","spl-transfer","raydium-swap-base-input","raydium-swap-base-output","jupiter-swap-shared-accounts-route","jupiter-swap-exact-out-route"].includes(e.type)),a=r.at(0);return!a||r.length>1?{fee:t,spender:e,balance:n}:"sol-transfer"===a.type?{fee:t,spender:e,balance:n,total:(0,k.g)(a.value)}:"spl-transfer"===a.type?{fee:t,spender:e,balance:n,total:`${(0,i.LH)({amount:a.value,decimals:a.token.decimals})} ${a.token.symbol}`}:"raydium-swap-base-input"===a.type&&a.tokenIn&&a.tokenOut?{fee:t,spender:e,balance:n,swap:`${(0,i.LH)({amount:a.amountIn,decimals:a.tokenIn.decimals})} ${a.tokenIn.symbol} → ${(0,i.LH)({amount:a.minimumAmountOut,decimals:a.tokenOut.decimals})} ${a.tokenOut.symbol}`}:"raydium-swap-base-output"===a.type&&a.tokenIn&&a.tokenOut?{fee:t,spender:e,balance:n,swap:`${(0,i.LH)({amount:a.maxAmountIn,decimals:a.tokenIn.decimals})} ${a.tokenIn.symbol} → ${(0,i.LH)({amount:a.amountOut,decimals:a.tokenOut.decimals})} ${a.tokenOut.symbol}`}:"jupiter-swap-shared-accounts-route"===a.type&&a.tokenIn&&a.tokenOut?{fee:t,spender:e,balance:n,swap:`${(0,i.LH)({amount:a.inAmount,decimals:a.tokenIn.decimals})} ${a.tokenIn.symbol} → ${(0,i.LH)({amount:a.quotedOutAmount,decimals:a.tokenOut.decimals})} ${a.tokenOut.symbol}`}:"jupiter-swap-exact-out-route"===a.type&&a.tokenIn&&a.tokenOut?{fee:t,spender:e,balance:n,swap:`${(0,i.LH)({amount:a.quotedInAmount,decimals:a.tokenIn.decimals})} ${a.tokenIn.symbol} → ${(0,i.LH)({amount:a.outAmount,decimals:a.tokenOut.decimals})} ${a.tokenOut.symbol}`}:{fee:t,spender:e,balance:n}},[j,J?.address,L]),Y=(0,a.useMemo)(()=>{let e;if(!j||!g||!q||Z)return;function t(...e){return(0,F.g)(e.reduce((e,t)=>e+t,0n),q??0)}J?.address===j.spender&&(e=t(j.fee));let n=t(L.value),r=j.instructions.filter(e=>"sol-transfer"===e.type||"spl-transfer"===e.type).at(0);return!r||j.instructions.length>1?{fee:e,balance:n}:"sol-transfer"===r.type?{fee:e,balance:n,total:t(r.value,J?.address===j.spender?j.fee:0n)}:"spl-transfer"===r.type?{fee:e,balance:n,total:`${(0,i.LH)({amount:r.value,decimals:r.token.decimals})} ${r.token.symbol}`}:{fee:e,balance:n}},[j,g,q,Z,J?.address,L]);if((0,a.useEffect)(()=>{!async function(){if(v&&p)try{I(void 0);let e=await R({tx:v,solanaClient:y,privyClient:p,checkFunds:!V&&!_});z(e)}catch(e){console.error("Failed to prepare transaction",e),I(e)}}()},[v,y,p,V]),(0,a.useEffect)(()=>{(async function(){if(!J)return;O({value:L.value,isLoading:!0});let{value:e}=await y.rpc.getBalance(J.address,{commitment:"confirmed"}).send();O({value:e??0n,isLoading:!1})})().catch(console.error)},[j]),!v||!e?.standardSignAndSendTransaction||!J){let t=Error("Invalid transaction request");return(0,r.jsx)(d.ErrorScreenView,{error:t,allowlistConfig:h.allowlistConfig,onRetry:()=>{e?.standardSignAndSendTransaction?.onFailure(t),m({shouldCallAuthOnSuccess:!1})}})}let Q=()=>{if(!B)return D.signature||D.signedTransaction?e?.standardSignAndSendTransaction?.onSuccess({signature:D.signature,signedTransaction:D.signedTransaction}):e?.standardSignAndSendTransaction?.onFailure(H??C??Error("User exited the modal before submitting the transaction")),m({shouldCallAuthOnSuccess:!1})};t.current=Q;let K=e.standardSignAndSendTransaction?.uiOptions?.transactionInfo?.contractInfo?.imgUrl?(0,r.jsx)("img",{src:e.standardSignAndSendTransaction.uiOptions.transactionInfo.contractInfo.imgUrl,alt:e.standardSignAndSendTransaction.uiOptions.transactionInfo.contractInfo.imgAltText}):null,X=!!(e.funding&&e.funding.supportedOptions.length>0),ee=!j?.hasFunds&&X&&!_;if(D.signature||D.signedTransaction){let t=j?.instructions.filter(e=>"sol-transfer"===e.type||"spl-transfer"===e.type),n=1===t?.length?t?.at(0):void 0;return(0,r.jsx)(P,{fees:D.fees??0n,onClose:Q,transactionInfo:e.standardSignAndSendTransaction?.uiOptions.transactionInfo,solPrice:q,receiptHeader:e.standardSignAndSendTransaction?.uiOptions.successHeader,receiptDescription:e.standardSignAndSendTransaction?.uiOptions.successDescription,chain:y.chain,signOnly:V,instruction:"sol-transfer"===n?.type?{to:n.toAccount,amount:n.value}:{to:n?.toAccount||n?.toAta,total:G?.total}})}return H?(0,r.jsx)(w.T,{transactionError:H,chainId:y.chain,onClose:Q,chainType:"solana",onRetry:async()=>{N(void 0);let{value:e}=await y.rpc.getLatestBlockhash().send();b((0,T.z)((0,S.o$)().decode((0,$.a)(v)),e=>(0,S.al)(e),t=>(0,S.bV)(e,t),e=>(0,E.qy)(e),e=>new Uint8Array((0,E.Kt)().encode(e))))}}):(0,r.jsx)(w.a,{img:K,title:e.standardSignAndSendTransaction?.uiOptions?.transactionInfo?.title||"Confirm transaction",subtitle:e.standardSignAndSendTransaction?.uiOptions?.description||`${h.name} wants your permission to approve the following transaction.`,cta:ee?"Add funds":e.standardSignAndSendTransaction?.uiOptions?.buttonText||"Approve",instructions:j?.instructions??[],network:"solana:mainnet"==y.chain?"Solana":y.chain.replace("solana:",""),blockExplorerUrl:y.blockExplorerUrl,total:g?Y?.total:G?.total,fee:g?Y?.fee:G?.fee,balance:g?Y?.balance:G?.balance,swap:G?.swap,transactingWalletAddress:J.address,disabled:!j?.hasFunds&&!X,isSubmitting:B,isPreparing:!j||L.isLoading,isTokenPriceLoading:g&&Z,isMissingFunds:!j?.hasFunds,submitError:H??void 0,isSponsored:!!e.standardSignAndSendTransaction?.isSponsored,parseError:C,onClick:ee?async()=>{if(!J)return;if(!X)throw Error("Funding wallet is not enabled");let t="FundingMethodSelectionScreen";n({...e,funding:{...e.funding,methodScreen:t},solanaFundingData:e?.solanaFundingData}),u(t)}:async()=>{try{if(U(!0),B||!J||!f||!x||!W)return;let t=await e.standardSignAndSendTransaction.onConfirm(v);if("signature"in t){let e=await async function({solanaClient:e,signature:t}){let n=(0,A._V)().decode(t),r=await e.rpc.getTransaction(n,{maxSupportedTransactionVersion:0,commitment:"confirmed",encoding:"base64"}).send().catch(()=>null);return r?{fee:r.meta?.fee??0n}:null}({solanaClient:y,signature:t.signature});return void M({...t,fees:e?.fee})}M(t)}catch(e){console.warn({transaction:v,error:e}),N(e)}finally{U(!1)}},onClose:Q})}}},57194:(e,t,n)=>{n.d(t,{H:()=>d,P:()=>u,S:()=>p,W:()=>x});var r=n(4913),a=n(96419),i=n(91299),o=n(46158),s=n(24689),l=n(77013),c=n(22554);let d=({weiQuantities:e,tokenPrice:t,tokenSymbol:n})=>{let a=(0,o.s)(e),i=t?(0,o.a)(a,t):void 0,s=(0,o.g)(a,n);return(0,r.jsx)(m,{children:i||s})},u=({weiQuantities:e,tokenPrice:t,tokenSymbol:n})=>{let a=(0,o.s)(e),i=t?(0,o.a)(a,t):void 0,s=(0,o.g)(a,n);return(0,r.jsx)(m,{children:i?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(f,{children:"USD"}),"<$0.01"===i?(0,r.jsxs)(h,{children:[(0,r.jsx)(g,{children:"<"}),"$0.01"]}):i]}):s})},p=({quantities:e,tokenPrice:t,tokenSymbol:n="SOL",tokenDecimals:a=9})=>{let o=e.reduce((e,t)=>e+t,0n),c=t&&"SOL"===n&&9===a?(0,s.g)(o,t):void 0,d="SOL"===n&&9===a?(0,l.g)(o):`${(0,i.b)(o,a)} ${n}`;return(0,r.jsx)(m,{children:c?(0,r.jsx)(r.Fragment,{children:"<$0.01"===c?(0,r.jsxs)(h,{children:[(0,r.jsx)(g,{children:"<"}),"$0.01"]}):c}):d})},m=a.zo.span`
  font-size: 14px;
  line-height: 140%;
  display: flex;
  gap: 4px;
  align-items: center;
`,f=a.zo.span`
  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
`,g=a.zo.span`
  font-size: 10px;
`,h=a.zo.span`
  display: flex;
  align-items: center;
`,x=e=>{var t,n;return(0,r.jsx)(y,{href:"ethereum"===e.chainType?(0,o.b)(e.chainId,e.walletAddress):(t=e.walletAddress,n=e.chainId,`https://explorer.solana.com/account/${t}?chain=${n}`),target:"_blank",children:(0,c.w)(e.walletAddress)})},y=a.zo.a`
  &:hover {
    text-decoration: underline;
  }
`},46158:(e,t,n)=>{n.d(t,{a:()=>c,b:()=>m,c:()=>l,g:()=>d,p:()=>u,s:()=>p});var r=n(10),a=n(49171),i=n(22554);let o=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2}),s=e=>o.format(e),l=(e,t)=>{let n=s(t*parseFloat(e));return"$0.00"!==n?n:"<$0.01"},c=(e,t)=>{let n=s(t*parseFloat((0,r.d)(e)));return"$0.00"===n?"<$0.01":n},d=(e,t,n=6,r=!1)=>`${u(e,n,r)} ${t}`,u=(e,t=6,n=!1)=>{let a=parseFloat((0,r.d)(e)).toFixed(t).replace(/0+$/,"").replace(/\.$/,"");return n?a:`${"0"===a?"<0.001":a}`},p=e=>e.reduce((e,t)=>e+t,0n),m=(e,t)=>{let{chains:n}=(0,a.u)(),r=`https://etherscan.io/address/${t}`,o=`${(0,i.G)(e,n)}/address/${t}`;if(!o)return r;try{new URL(o)}catch{return r}return o}},24689:(e,t,n)=>{n.d(t,{A:()=>s,D:()=>d,J:()=>c,L:()=>r,R:()=>l,S:()=>a,T:()=>i,a:()=>o,g:()=>u});let r=1e9,a="11111111111111111111111111111111",i="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",o="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",s="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",l=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],c=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],d={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}};function u(e,t){let n=parseFloat(e.toString())/r,a=p.format(t*n);return"$0.00"===a?"<$0.01":a}let p=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},90684:(e,t,n)=>{n.d(t,{N:()=>i});var r=n(4913),a=n(96419);let i=({size:e,centerIcon:t})=>(0,r.jsx)(o,{$size:e,children:(0,r.jsxs)(s,{children:[(0,r.jsx)(c,{}),(0,r.jsx)(d,{}),t?(0,r.jsx)(l,{children:t}):null]})}),o=a.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=a.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=a.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  svg,
  img {
    width: calc(var(--spinner-size) * 0.4);
    height: calc(var(--spinner-size) * 0.4);
    border-radius: var(--privy-border-radius-full);
  }
`,c=a.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=a.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);
  animation: spin 1200ms linear infinite;

  && {
    border: 4px solid;
    border-color: var(--privy-color-icon-subtle) transparent transparent transparent;
    border-radius: 50%;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`},77013:(e,t,n)=>{n.d(t,{a:()=>i,g:()=>a});var r=n(24689);function a(e,t=6,n=!1,r=!1){let a=(parseFloat(e.toString())/1e9).toFixed(t).replace(/0+$/,"").replace(/\.$/,""),i=r?"":" SOL";return n?`${a}${i}`:`${"0"===a?"<0.001":a}${i}`}function i({amount:e,fee:t,tokenPrice:n,isUsdc:i}){let o=BigInt(Math.floor(parseFloat(e)*10**(i?6:9))),s=i?o:o+t;return{fundingAmountInBaseUnit:o,fundingAmountInUsd:n?(0,r.g)(o,n):void 0,totalPriceInUsd:n?(0,r.g)(s,n):void 0,totalPriceInNativeCurrency:a(s),feePriceInNativeCurrency:a(t),feePriceInUsd:n?(0,r.g)(t,n):void 0}}},9781:(e,t,n)=>{n.d(t,{u:()=>i});var r=n(26510),a=n(49171);let i=({enabled:e=!0}={})=>{let{showFiatPrices:t,getUsdPriceForSol:n}=(0,a.u)(),[i,o]=(0,r.useState)(!0),[s,l]=(0,r.useState)(void 0),[c,d]=(0,r.useState)(void 0);return(0,r.useEffect)(()=>{(async()=>{if(t&&e)try{o(!0);let e=await n();e?d(e):l(Error("Unable to fetch SOL price"))}catch(e){l(e)}finally{o(!1)}else o(!1)})()},[]),{solPrice:c,isSolPriceLoading:i,solPriceError:s}}},75989:(e,t,n)=>{n.d(t,{a:()=>d,b:()=>m,f:()=>u,s:()=>p,u:()=>g,w:()=>f});var r=n(51542),a=n(47949),i=n(26510),o=n(14348),s=n(16820),l=n(49171);let c=Symbol("default-solana-rpcs-plugin");function d(e){return new Uint8Array((0,r.x7)().decode(e).messageBytes)}async function u({solanaClient:e,tx:t}){let n=(0,a.TJ)().decode(d(t)),{value:r}=await e.rpc.getFeeForMessage(n).send();return r??0n}async function p({solanaClient:e,tx:t,replaceRecentBlockhash:n}){let{value:r}=await e.rpc.simulateTransaction((0,a.TJ)().decode(t),{commitment:"confirmed",encoding:"base64",sigVerify:!1,replaceRecentBlockhash:n}).send();if("BlockhashNotFound"===r.err&&n)throw Error("Simulation failed: Blockhash not found");return"BlockhashNotFound"===r.err?await p({solanaClient:e,tx:t,replaceRecentBlockhash:!0}):{logs:r.logs??[],error:r.err,hasError:!!r.err,hasFunds:r.logs?.every(e=>!/insufficient funds/gi.test(e)&&!/insufficient lamports/gi.test(e))??!0}}let m=(...e)=>{if("undefined"==typeof Buffer)throw new l.b("Buffer is not defined.",void 0,l.c.BUFFER_NOT_DEFINED);return Buffer.from(...e)};async function f({rpcSubscriptions:e,signature:t,timeout:n}){let r=new AbortController,a=await e.signatureNotifications(t,{commitment:"confirmed"}).subscribe({abortSignal:r.signal}),i=await Promise.race([new Promise(e=>{setTimeout(()=>{r.abort(),e(Error("Transaction confirmation timed out"))},n)}),new Promise(async e=>{for await(let t of a){if(r.abort(),t.value.err)return e(Error("Transaction confirmation failed"));e(void 0)}})]);if(i instanceof Error)throw i}function g(){let e=(0,o.u)(),t=(0,s.u)(),n=(0,i.useMemo)(()=>{let n=t(c),r=n?.getDefaultRpcs({appId:e.id});return Object.fromEntries(["solana:mainnet","solana:devnet","solana:testnet"].map(t=>{let n=e.solanaRpcs[t]??r?.[t]??null;return[t,n?function({rpc:e,rpcSubscriptions:t,chain:n,blockExplorerUrl:r}){let i=function({rpc:e,rpcSubscriptions:t}){return async n=>new Promise(async(r,i)=>{try{let i=await e.sendTransaction(m(n).toString("base64"),{preflightCommitment:"confirmed",encoding:"base64"}).send();await f({rpcSubscriptions:t,signature:i,timeout:1e4}),r({signature:new Uint8Array((0,a.Un)().encode(i))})}catch(e){i(e)}})}({rpc:e,rpcSubscriptions:t});return{rpc:e,rpcSubscriptions:t,chain:n,blockExplorerUrl:r,sendAndConfirmTransaction:i}}({chain:t,rpc:n.rpc,rpcSubscriptions:n.rpcSubscriptions,blockExplorerUrl:n.blockExplorerUrl??`https://explorer.solana.com?cluster=${t.replace("solana:","")}`}):null]}))},[e.solanaRpcs,e.id,t]);return(0,i.useCallback)(e=>{if(!n[e])throw Error(`No RPC configuration found for chain ${e}`);return n[e]},[n])}}};