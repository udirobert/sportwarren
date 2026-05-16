"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9893],{40765:function(e,n,t){var r=t(4753);let i=r.forwardRef(function(e,n){let{title:t,titleId:i,...a}=e;return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":i},a),t?r.createElement("title",{id:i},t):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))});n.Z=i},16249:function(e,n,t){var r=t(4753);let i=r.forwardRef(function(e,n){let{title:t,titleId:i,...a}=e;return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":i},a),t?r.createElement("title",{id:i},t):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m19.5 8.25-7.5 7.5-7.5-7.5"}))});n.Z=i},30897:function(e,n,t){var r=t(4753);let i=r.forwardRef(function(e,n){let{title:t,titleId:i,...a}=e;return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":i},a),t?r.createElement("title",{id:i},t):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))});n.Z=i},94923:function(e,n,t){t.d(n,{B:function(){return i},C:function(){return s},F:function(){return l},H:function(){return o},R:function(){return f},S:function(){return u},a:function(){return d},b:function(){return p},c:function(){return c},d:function(){return m},e:function(){return a}});var r=t(43803);let i=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,a=r.zo.div`
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
`,s=(0,r.zo)(a)`
  padding: 20px 0;
`,c=(0,r.zo)(a)`
  gap: 16px;
`,l=r.zo.div`
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
`,f=r.zo.div`
  height: 12px;
`;r.zo.div`
  position: relative;
`;let m=r.zo.div`
  height: ${e=>e.height??"12"}px;
`;r.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},18532:function(e,n,t){t.d(n,{S:function(){return k}});var r=t(89418),i=t(4753),a=t(43803),o=t(61318),s=t(13188),c=t(99539);let l=a.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=a.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,a.zo)(s.M)`
  margin: 0 -8px;
`,f=a.zo.div`
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
`,m=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,g=a.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,h=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,x=a.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,y=a.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,v=a.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=a.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=a.zo.div`
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
`,k=({children:e,...n})=>(0,r.jsx)(l,{children:(0,r.jsx)(d,{...n,children:e})}),S=a.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,j=(0,a.zo)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,A=a.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,z=({step:e})=>e?(0,r.jsx)(S,{children:(0,r.jsx)(A,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:n,icon:t,iconVariant:i,iconLoadingStatus:a,showBack:o,onBack:s,showInfo:c,onInfo:l,showClose:d,onClose:f,step:m,headerTitle:v,...b})=>(0,r.jsxs)(u,{...b,children:[(0,r.jsx)(p,{backFn:o?s:void 0,infoFn:c?l:void 0,onClose:d?f:void 0,title:v,closeable:d}),(t||i||e||n)&&(0,r.jsxs)(g,{children:[t||i?(0,r.jsx)(k.Icon,{icon:t,variant:i,loadingStatus:a}):null,!(!e&&!n)&&(0,r.jsxs)(h,{children:[e&&(0,r.jsx)(x,{children:e}),n&&(0,r.jsx)(y,{children:n})]})]}),m&&(0,r.jsx)(z,{step:m})]}),(k.Body=i.forwardRef(({children:e,...n},t)=>(0,r.jsx)(f,{ref:t,...n,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...n})=>(0,r.jsx)(m,{id:"privy-content-footer-container",...n,children:e}),k.Actions=({children:e,...n})=>(0,r.jsx)(C,{...n,children:e}),k.HelpText=({children:e,...n})=>(0,r.jsx)(I,{...n,children:e}),k.FooterText=({children:e,...n})=>(0,r.jsx)(E,{...n,children:e}),k.Watermark=()=>(0,r.jsx)(j,{}),k.Icon=({icon:e,variant:n="subtle",loadingStatus:t})=>"logo"===n&&e?(0,r.jsx)(b,"string"==typeof e?{children:(0,r.jsx)("img",{src:e,alt:""})}:i.isValidElement(e)?{children:e}:{children:i.createElement(e)}):"loading"===n?e?(0,r.jsx)(w,{children:(0,r.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,r.jsx)(o.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,r.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):i.isValidElement(e)?i.cloneElement(e,{style:{width:"38px",height:"38px"}}):i.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,r.jsx)(v,{$variant:n,children:(0,r.jsx)(c.N,{size:"64px"})}):(0,r.jsx)(v,{$variant:n,children:e&&("string"==typeof e?(0,r.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):i.isValidElement(e)?e:i.createElement(e,{width:32,height:32,stroke:(()=>{switch(n){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let C=a.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,I=a.zo.div`
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
`,E=a.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,n,t){t.d(n,{S:function(){return o}});var r=t(89418),i=t(13188),a=t(18532);let o=({primaryCta:e,secondaryCta:n,helpText:t,footerText:o,watermark:s=!0,children:c,...l})=>{let d=e||n?(0,r.jsxs)(r.Fragment,{children:[e&&(()=>{let{label:n,...t}=e,a=t.variant||"primary";return(0,r.jsx)(i.a,{...t,variant:a,style:{width:"100%",...t.style},children:n})})(),n&&(()=>{let{label:e,...t}=n,a=t.variant||"secondary";return(0,r.jsx)(i.a,{...t,variant:a,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,r.jsxs)(a.S,{id:l.id,className:l.className,children:[(0,r.jsx)(a.S.Header,{...l}),c?(0,r.jsx)(a.S.Body,{children:c}):null,t||d||s?(0,r.jsxs)(a.S.Footer,{children:[t?(0,r.jsx)(a.S.HelpText,{children:t}):null,d?(0,r.jsx)(a.S.Actions,{children:d}):null,s?(0,r.jsx)(a.S.Watermark,{}):null]}):null,o?(0,r.jsx)(a.S.FooterText,{children:o}):null]})}},67510:function(e,n,t){t.d(n,{e:function(){return i}});var r=t(43803);let i=r.zo.div`
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
`},88969:function(e,n,t){t.r(n),t.d(n,{StandardSignAndSendTransactionScreen:function(){return V},default:function(){return V}});var r=t(89418),i=t(4753),a=t(60115),o=t(9201),s=t(64982),c=t(3010),l=t(80483),d=t(19850),u=t(40765),p=t(43803),f=t(13188),m=t(94923),g=t(31128),h=t(20053),x=t(39045),y=t(26559),v=t(67510),b=t(61318),w=t(472),k=t(63821),S=t(39028),j=t(8833),A=t(29077);function z(e){return Object.freeze({executable:e.executable,lamports:e.lamports,programAddress:e.owner,space:e.space})}async function C(e,n,t={}){let{abortSignal:r,...i}=t;return(await e.getMultipleAccounts(n,{...i,encoding:"jsonParsed"}).send({abortSignal:r})).value.map((e,t)=>e&&"object"==typeof e&&"parsed"in e.data?function(e,n){if(!n)return Object.freeze({address:e,exists:!1});let t=n.data.parsed.info||{};return(n.data.program||n.data.parsed.type)&&(t.parsedAccountMeta={program:n.data.program,type:n.data.parsed.type}),Object.freeze({...z(n),address:e,data:t,exists:!0})}(n[t],e):function(e,n){if(!n)return Object.freeze({address:e,exists:!1});let t=(0,A.tA)().encode(n.data[0]);return Object.freeze({...z(n),address:e,data:t,exists:!0})}(n[t],e))}async function I(e,n,t){if(0===e.length)return{};let r=await C(n,e,t);return!function(e){let n=e.filter(e=>(!("exists"in e)||"exists"in e&&e.exists)&&e.data instanceof Uint8Array);if(n.length>0){let e=n.map(e=>e.address);throw new j.g1$(j.L25,{addresses:e})}}(r),!function(e){let n=e.filter(e=>!e.exists);if(n.length>0){let e=n.map(e=>e.address);throw new j.g1$(j.SH6,{addresses:e})}}(r),r.reduce((e,n)=>({...e,[n.address]:n.data.addresses}),{})}var E=t(6772),T=t(60504),$=t(29183),F=t(58541);t(96257),t(78439),t(55982),t(94936),t(21628);let L=p.zo.span`
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
`,O=({instruction:e,fees:n,transactionInfo:t,solPrice:i,chain:a})=>(0,r.jsxs)(h.a,{children:[t?.action&&(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"Action"}),(0,r.jsx)(x.V,{children:t.action})]}),null!=e?.total&&(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"Total"}),(0,r.jsx)(x.V,{children:e.total})]}),!e?.total&&null!=e?.amount&&(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"Total"}),(0,r.jsx)(x.V,{children:(0,r.jsx)(y.S,{quantities:[e.amount,n],tokenPrice:i})})]}),(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"Fees"}),(0,r.jsx)(x.V,{children:(0,r.jsx)(y.S,{quantities:[n],tokenPrice:i})})]}),e?.to&&(0,r.jsxs)(h.R,{children:[(0,r.jsx)(x.L,{children:"To"}),(0,r.jsx)(x.V,{children:(0,r.jsx)(y.W,{walletAddress:e.to,chainId:a,chainType:"solana"})})]})]}),P=({fees:e,onClose:n,receiptHeader:t,receiptDescription:i,transactionInfo:a,solPrice:o,signOnly:s,instruction:c,chain:l})=>(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(f.M,{onClose:n}),(0,r.jsx)(v.e,{style:{marginBottom:"16px"},children:(0,r.jsxs)("div",{children:[(0,r.jsx)(L,{color:"var(--privy-color-success-light)"}),(0,r.jsx)(u.Z,{height:38,width:38,strokeWidth:2,stroke:"var(--privy-color-success)"})]})}),(0,r.jsx)(g.C,{title:t??`Transaction ${s?"signed":"complete"}!`,description:i??"You're all set."}),(0,r.jsx)(O,{solPrice:o,instruction:c,fees:e,transactionInfo:a,chain:l}),(0,r.jsx)(b.G,{}),(0,r.jsx)(B,{loading:!1,onClick:n,children:"Close"}),(0,r.jsx)(m.R,{}),(0,r.jsx)(f.B,{})]}),B=(0,p.zo)(f.P)`
  && {
    margin-top: 24px;
  }
  transition:
    color 350ms ease,
    background-color 350ms ease;
`;async function U(e,n){try{return await e}catch{return n}}async function D({privyClient:e,chain:n,mint:t}){let r=F.D[n];if(!r[t]){let i=await e.getSplTokenMetadata({mintAddress:t,cluster:function(e){switch(e){case"solana:mainnet":return"mainnet-beta";case"solana:devnet":return"devnet";case"solana:testnet":return"testnet"}}(n)});i&&(r[t]={address:t,symbol:i.symbol,decimals:i.decimals})}return r[t]}async function R({tx:e,solanaClient:n,privyClient:t,checkFunds:r}){let i=(0,S.o$)().decode((0,$.a)(e)),a=i.staticAccounts[0]??"",o=await (0,$.f)({solanaClient:n,tx:e}),s=r?await U((0,$.s)({solanaClient:n,tx:e})):void 0,c=s?.hasFunds??!0,l={},d=[],u=await async function({solanaClient:e,message:n}){if(!("addressTableLookups"in n)||!n.addressTableLookups)return[...n.staticAccounts];let t=n.addressTableLookups.map(e=>e.lookupTableAddress),r=await I(t,e.rpc),i=t.map((e,t)=>[...n.addressTableLookups[t]?.writableIndexes.map(n=>{let i=r[e]?.[n];if(i)return{key:i,isWritable:!0,altIdx:t}})??[],...n.addressTableLookups[t]?.readonlyIndexes.map(n=>{let i=r[e]?.[n];if(i)return{key:i,isWritable:!1,altIdx:t}})??[]]).flat().filter(e=>!!e).sort((e,n)=>e.isWritable!==n.isWritable?e.isWritable?-1:1:e.altIdx-n.altIdx).map(({key:e})=>e);return[...n.staticAccounts,...i]}({solanaClient:n,message:i});for(let e of i.instructions){let r=i.staticAccounts[e.programAddressIndex]||"";if(r!==F.T&&r!==F.a){if(r!==F.S){if(r===F.A){let n=await U(function(e,n,t){let[r,i,a,o]=e.accountIndices?.map(e=>n[e])??[];return{type:"ata-creation",program:t,payer:r,ata:i,owner:a,mint:o}}(e,u,r));if(!n){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}if(d.push(n),n.ata&&n.owner&&n.mint){l[n.ata]={owner:n.owner,mint:n.mint};continue}}if(F.R.includes(r)){let i=await U(_(e,u,n,t,r));if(!i){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}d.push(i)}else if(F.J.includes(r)){let i=await U(J(e,u,n,t,r));if(!i){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}d.push(i)}else d.push({type:"unknown",program:r,discriminator:e.data?.[0]})}else{let n=await U(N(e,u));if(!n){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}d.push(n)}}else{let i=await U(H(e,u,n,t,l,r));if(!i){d.push({type:"unknown",program:r,discriminator:e.data?.[0]});continue}d.push(i),"spl-transfer"===i.type&&(i.fromAta&&i.fromAccount&&i.token.address&&(l[i.fromAta]??={owner:i.fromAccount,mint:i.token.address}),i.toAta&&i.toAccount&&i.token.address&&(l[i.toAta]??={owner:i.toAccount,mint:i.token.address}))}}return{spender:a,fee:o,instructions:d,hasFunds:!!c}}function M(e,n=0){try{return function(e,n=0){let t=0n;for(let r=0;r<8;r++)t|=BigInt(e[n+r])<<BigInt(8*r);return t}(e,n)}catch{}try{return e.readBigInt64LE(n)}catch{}let t=(0,$.b)(e);try{return((e,n=0)=>{let t=e[n],r=e[n+7];if(!t||!r)throw Error(`Buffer offset out of range: first: ${t}, last: ${r}.`);return(BigInt(e[n+4]+256*e[n+5]+65536*e[n+6]+(r<<24))<<32n)+BigInt(t+256*e[++n]+65536*e[++n]+16777216*e[++n])})(t)}catch{}try{return t.subarray(n).readBigInt64LE()}catch{}try{return t.readBigInt64LE(n)}catch{}return 0n}async function H(e,n,t,r,i,a){let o=e.data?.[0],s=e.accountIndices?.map(e=>n[e])??[];if(1===o){let[e,n,t]=s;return{type:"spl-init-account",program:a,account:e,mint:n,owner:t}}if(3===o){let n,o,[c,l,d]=s,u="",p=l?i[l]:void 0;if(p)n=p.owner,u=p.mint;else if(l){let e=await t.rpc.getAccountInfo(l,{commitment:"confirmed",encoding:"jsonParsed"}).send(),r=e.value?.data;n=r?.parsed?.info?.owner,u=r?.parsed?.info?.mint??"",o=r?.parsed?.info?.tokenAmount?.decimals}if(!u&&c){let e=await t.rpc.getAccountInfo(c,{commitment:"confirmed",encoding:"jsonParsed"}).send(),n=e.value?.data;u=n?.parsed?.info?.mint??""}let f=await D({privyClient:r,chain:t.chain,mint:u}),m=f?.symbol??"";return o??=f?.decimals??9,{type:"spl-transfer",program:a,fromAta:c,fromAccount:d,toAta:l,toAccount:n,value:M(e.data,1),token:{symbol:m,decimals:o,address:u}}}if(9===o){let[e,n,t]=s;return{type:"spl-close-account",program:a,source:e,destination:n,owner:t}}if(17===o)return{type:"spl-sync-native",program:a};throw Error(`Token program instruction type ${o} not supported`)}async function N(e,n){let t=e.data?.[0],r=e.accountIndices?.map(e=>n[e])??[];if(0===t){let[,n]=r;return{type:"create-account",program:F.S,account:n?.toString(),value:M(e.data,4),withSeed:!1}}if(2===t){let[n,t]=r;return{type:"sol-transfer",program:F.S,fromAccount:n,toAccount:t,token:{symbol:"SOL",decimals:9},value:M(e.data,4),withSeed:!1}}if(3===t){let[,n]=r;return{type:"create-account",program:F.S,account:n,withSeed:!0,value:M(e.data.slice(e.data.length-32-8-8))}}if(11===t){let[n,t]=r;return{type:"sol-transfer",program:F.S,fromAccount:n,toAccount:t,value:M(e.data,4),token:{symbol:"SOL",decimals:9},withSeed:!0}}throw Error(`System program instruction type ${t} not supported`)}async function _(e,n,t,r,i){let a=e.accountIndices?.map(e=>n[e])??[],o=e.data?.[0];if(143===o){let n=a[10],o=a[11];return{type:"raydium-swap-base-input",program:i,mintIn:n,mintOut:o,tokenIn:n?await D({privyClient:r,chain:t.chain,mint:n}):void 0,tokenOut:o?await D({privyClient:r,chain:t.chain,mint:o}):void 0,amountIn:M(e.data,8),minimumAmountOut:M(e.data,16)}}if(55===o){let n=a[10],o=a[11];return{type:"raydium-swap-base-output",program:i,mintIn:n,mintOut:o,tokenIn:n?await D({privyClient:r,chain:t.chain,mint:n}):void 0,tokenOut:o?await D({privyClient:r,chain:t.chain,mint:o}):void 0,maxAmountIn:M(e.data,8),amountOut:M(e.data,16)}}throw Error(`Raydium swap program instruction type ${o} not supported`)}async function J(e,n,t,r,i){let a=e.data?.[0],o=e.accountIndices?.map(e=>n[e])??[];if([208,51,239,151,123,43,237,92].includes(a)){let n=o[5],a=o[6];return{type:"jupiter-swap-exact-out-route",program:i,mintIn:n,mintOut:a,tokenIn:n?await D({privyClient:r,chain:t.chain,mint:n}):void 0,tokenOut:a?await D({privyClient:r,chain:t.chain,mint:a}):void 0,outAmount:M(e.data,e.data.length-1-2-8-8),quotedInAmount:M(e.data,e.data.length-1-2-8)}}if([176,209,105,168,154,125,69,62].includes(a)){let n=o[7],a=o[8];return{type:"jupiter-swap-exact-out-route",program:i,mintIn:n,mintOut:a,tokenIn:n?await D({privyClient:r,chain:t.chain,mint:n}):void 0,tokenOut:a?await D({privyClient:r,chain:t.chain,mint:a}):void 0,outAmount:M(e.data,e.data.length-1-2-8-8),quotedInAmount:M(e.data,e.data.length-1-2-8)}}if([193,32,155,51,65,214,156,129].includes(a)){let n=o[7],a=o[8];return{type:"jupiter-swap-shared-accounts-route",program:i,mintIn:n,mintOut:a,tokenIn:n?await D({privyClient:r,chain:t.chain,mint:n}):void 0,tokenOut:a?await D({privyClient:r,chain:t.chain,mint:a}):void 0,inAmount:M(e.data,e.data.length-1-2-8-8),quotedOutAmount:M(e.data,e.data.length-1-2-8)}}throw[62,198,214,193,213,159,108,210].includes(a)&&console.warn("Jupiter swap program instruction 'claim' not implemented"),[116,206,27,191,166,19,0,73].includes(a)&&console.warn("Jupiter swap program instruction 'claim_token' not implemented"),[26,74,236,151,104,64,183,249].includes(a)&&console.warn("Jupiter swap program instruction 'close_token' not implemented"),[229,194,212,172,8,10,134,147].includes(a)&&console.warn("Jupiter swap program instruction 'create_open_orders' not implemented"),[28,226,32,148,188,136,113,171].includes(a)&&console.warn("Jupiter swap program instruction 'create_program_open_orders' not implemented"),[232,242,197,253,240,143,129,52].includes(a)&&console.warn("Jupiter swap program instruction 'create_token_ledger' not implemented"),[147,241,123,100,244,132,174,118].includes(a)&&console.warn("Jupiter swap program instruction 'create_token_account' not implemented"),[229,23,203,151,122,227,173,42].includes(a)&&console.warn("Jupiter swap program instruction 'route' not implemented"),[150,86,71,116,167,93,14,104].includes(a)&&console.warn("Jupiter swap program instruction 'route_with_token_ledger' not implemented"),[228,85,185,112,78,79,77,2].includes(a)&&console.warn("Jupiter swap program instruction 'set_token_ledger' not implemented"),[230,121,143,80,119,159,106,170].includes(a)&&console.warn("Jupiter swap program instruction 'shared_accounts_route_with_token_ledger' not implemented"),Error(`Jupiter swap program instruction type ${a} not supported`)}let V={component:()=>{let{data:e,onUserCloseViaDialogOrKeybindRef:n,setModalData:t,navigate:u}=(0,o.a)(),{client:p,closePrivyModal:f,walletProxy:m,showFiatPrices:g}=(0,c.u)(),h=(0,s.u)(),{user:x}=(0,o.u)(),y=(0,$.u)()(e?.standardSignAndSendTransaction?.chain??"solana:mainnet"),[v,b]=(0,i.useState)(e?.standardSignAndSendTransaction?.transaction),[j,z]=(0,i.useState)(),[C,I]=(0,i.useState)(),[L,O]=(0,i.useState)({value:0n,isLoading:!1}),[B,U]=(0,i.useState)(!1),[D,M]=(0,i.useState)({}),[H,N]=(0,i.useState)(),_=e?.standardSignAndSendTransaction?.account,J=!!e?.standardSignAndSendTransaction?.signOnly,V=!!e?.standardSignAndSendTransaction?.isSponsored,W=_?.imported?(0,o.h)(x).find(e=>e.address===_.address):(0,o.g)(x),{solPrice:q,isSolPriceLoading:Z}=(0,l.u)({enabled:g}),G=(0,i.useMemo)(()=>{if(!j)return;let e=j.spender,n=(0,k.g)(j.fee),t=(0,k.g)(L.value,3,!0),r=j.instructions.filter(e=>["sol-transfer","spl-transfer","raydium-swap-base-input","raydium-swap-base-output","jupiter-swap-shared-accounts-route","jupiter-swap-exact-out-route"].includes(e.type)),i=r.at(0);return!i||r.length>1?{fee:n,spender:e,balance:t}:"sol-transfer"===i.type?{fee:n,spender:e,balance:t,total:(0,k.g)(i.value)}:"spl-transfer"===i.type?{fee:n,spender:e,balance:t,total:`${(0,a.LH)({amount:i.value,decimals:i.token.decimals})} ${i.token.symbol}`}:"raydium-swap-base-input"===i.type&&i.tokenIn&&i.tokenOut?{fee:n,spender:e,balance:t,swap:`${(0,a.LH)({amount:i.amountIn,decimals:i.tokenIn.decimals})} ${i.tokenIn.symbol} → ${(0,a.LH)({amount:i.minimumAmountOut,decimals:i.tokenOut.decimals})} ${i.tokenOut.symbol}`}:"raydium-swap-base-output"===i.type&&i.tokenIn&&i.tokenOut?{fee:n,spender:e,balance:t,swap:`${(0,a.LH)({amount:i.maxAmountIn,decimals:i.tokenIn.decimals})} ${i.tokenIn.symbol} → ${(0,a.LH)({amount:i.amountOut,decimals:i.tokenOut.decimals})} ${i.tokenOut.symbol}`}:"jupiter-swap-shared-accounts-route"===i.type&&i.tokenIn&&i.tokenOut?{fee:n,spender:e,balance:t,swap:`${(0,a.LH)({amount:i.inAmount,decimals:i.tokenIn.decimals})} ${i.tokenIn.symbol} → ${(0,a.LH)({amount:i.quotedOutAmount,decimals:i.tokenOut.decimals})} ${i.tokenOut.symbol}`}:"jupiter-swap-exact-out-route"===i.type&&i.tokenIn&&i.tokenOut?{fee:n,spender:e,balance:t,swap:`${(0,a.LH)({amount:i.quotedInAmount,decimals:i.tokenIn.decimals})} ${i.tokenIn.symbol} → ${(0,a.LH)({amount:i.outAmount,decimals:i.tokenOut.decimals})} ${i.tokenOut.symbol}`}:{fee:n,spender:e,balance:t}},[j,_?.address,L]),Y=(0,i.useMemo)(()=>{let e;if(!j||!g||!q||Z)return;function n(...e){return(0,F.g)(e.reduce((e,n)=>e+n,0n),q??0)}_?.address===j.spender&&(e=n(j.fee));let t=n(L.value),r=j.instructions.filter(e=>"sol-transfer"===e.type||"spl-transfer"===e.type).at(0);return!r||j.instructions.length>1?{fee:e,balance:t}:"sol-transfer"===r.type?{fee:e,balance:t,total:n(r.value,_?.address===j.spender?j.fee:0n)}:"spl-transfer"===r.type?{fee:e,balance:t,total:`${(0,a.LH)({amount:r.value,decimals:r.token.decimals})} ${r.token.symbol}`}:{fee:e,balance:t}},[j,g,q,Z,_?.address,L]);if((0,i.useEffect)(()=>{!async function(){if(v&&p)try{I(void 0);let e=await R({tx:v,solanaClient:y,privyClient:p,checkFunds:!J&&!V});z(e)}catch(e){console.error("Failed to prepare transaction",e),I(e)}}()},[v,y,p,J]),(0,i.useEffect)(()=>{(async function(){if(!_)return;O({value:L.value,isLoading:!0});let{value:e}=await y.rpc.getBalance(_.address,{commitment:"confirmed"}).send();O({value:e??0n,isLoading:!1})})().catch(console.error)},[j]),!v||!e?.standardSignAndSendTransaction||!_){let n=Error("Invalid transaction request");return(0,r.jsx)(d.ErrorScreenView,{error:n,allowlistConfig:h.allowlistConfig,onRetry:()=>{e?.standardSignAndSendTransaction?.onFailure(n),f({shouldCallAuthOnSuccess:!1})}})}let Q=()=>{if(!B)return D.signature||D.signedTransaction?e?.standardSignAndSendTransaction?.onSuccess({signature:D.signature,signedTransaction:D.signedTransaction}):e?.standardSignAndSendTransaction?.onFailure(H??C??Error("User exited the modal before submitting the transaction")),f({shouldCallAuthOnSuccess:!1})};n.current=Q;let K=e.standardSignAndSendTransaction?.uiOptions?.transactionInfo?.contractInfo?.imgUrl?(0,r.jsx)("img",{src:e.standardSignAndSendTransaction.uiOptions.transactionInfo.contractInfo.imgUrl,alt:e.standardSignAndSendTransaction.uiOptions.transactionInfo.contractInfo.imgAltText}):null,X=!!(e.funding&&e.funding.supportedOptions.length>0),ee=!j?.hasFunds&&X&&!V;if(D.signature||D.signedTransaction){let n=j?.instructions.filter(e=>"sol-transfer"===e.type||"spl-transfer"===e.type),t=1===n?.length?n?.at(0):void 0;return(0,r.jsx)(P,{fees:D.fees??0n,onClose:Q,transactionInfo:e.standardSignAndSendTransaction?.uiOptions.transactionInfo,solPrice:q,receiptHeader:e.standardSignAndSendTransaction?.uiOptions.successHeader,receiptDescription:e.standardSignAndSendTransaction?.uiOptions.successDescription,chain:y.chain,signOnly:J,instruction:"sol-transfer"===t?.type?{to:t.toAccount,amount:t.value}:{to:t?.toAccount||t?.toAta,total:G?.total}})}return H?(0,r.jsx)(w.T,{transactionError:H,chainId:y.chain,onClose:Q,chainType:"solana",onRetry:async()=>{N(void 0);let{value:e}=await y.rpc.getLatestBlockhash().send();b((0,E.z)((0,S.o$)().decode((0,$.a)(v)),e=>(0,S.al)(e),n=>(0,S.bV)(e,n),e=>(0,T.qy)(e),e=>new Uint8Array((0,T.Kt)().encode(e))))}}):(0,r.jsx)(w.a,{img:K,title:e.standardSignAndSendTransaction?.uiOptions?.transactionInfo?.title||"Confirm transaction",subtitle:e.standardSignAndSendTransaction?.uiOptions?.description||`${h.name} wants your permission to approve the following transaction.`,cta:ee?"Add funds":e.standardSignAndSendTransaction?.uiOptions?.buttonText||"Approve",instructions:j?.instructions??[],network:"solana:mainnet"==y.chain?"Solana":y.chain.replace("solana:",""),blockExplorerUrl:y.blockExplorerUrl,total:g?Y?.total:G?.total,fee:g?Y?.fee:G?.fee,balance:g?Y?.balance:G?.balance,swap:G?.swap,transactingWalletAddress:_.address,disabled:!j?.hasFunds&&!X,isSubmitting:B,isPreparing:!j||L.isLoading,isTokenPriceLoading:g&&Z,isMissingFunds:!j?.hasFunds,submitError:H??void 0,isSponsored:!!e.standardSignAndSendTransaction?.isSponsored,parseError:C,onClick:ee?async()=>{if(!_)return;if(!X)throw Error("Funding wallet is not enabled");let n="FundingMethodSelectionScreen";t({...e,funding:{...e.funding,methodScreen:n},solanaFundingData:e?.solanaFundingData}),u(n)}:async()=>{try{if(U(!0),B||!_||!m||!x||!W)return;let n=await e.standardSignAndSendTransaction.onConfirm(v);if("signature"in n){let e=await async function({solanaClient:e,signature:n}){let t=(0,A._V)().decode(n),r=await e.rpc.getTransaction(t,{maxSupportedTransactionVersion:0,commitment:"confirmed",encoding:"base64"}).send().catch(()=>null);return r?{fee:r.meta?.fee??0n}:null}({solanaClient:y,signature:n.signature});return void M({...n,fees:e?.fee})}M(n)}catch(e){console.warn({transaction:v,error:e}),N(e)}finally{U(!1)}},onClose:Q})}}},26559:function(e,n,t){t.d(n,{H:function(){return d},P:function(){return u},S:function(){return p},W:function(){return x}});var r=t(89418),i=t(43803),a=t(1603),o=t(34644),s=t(58541),c=t(63821),l=t(40099);let d=({weiQuantities:e,tokenPrice:n,tokenSymbol:t})=>{let i=(0,o.s)(e),a=n?(0,o.a)(i,n):void 0,s=(0,o.g)(i,t);return(0,r.jsx)(f,{children:a||s})},u=({weiQuantities:e,tokenPrice:n,tokenSymbol:t})=>{let i=(0,o.s)(e),a=n?(0,o.a)(i,n):void 0,s=(0,o.g)(i,t);return(0,r.jsx)(f,{children:a?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(m,{children:"USD"}),"<$0.01"===a?(0,r.jsxs)(h,{children:[(0,r.jsx)(g,{children:"<"}),"$0.01"]}):a]}):s})},p=({quantities:e,tokenPrice:n,tokenSymbol:t="SOL",tokenDecimals:i=9})=>{let o=e.reduce((e,n)=>e+n,0n),l=n&&"SOL"===t&&9===i?(0,s.g)(o,n):void 0,d="SOL"===t&&9===i?(0,c.g)(o):`${(0,a.b)(o,i)} ${t}`;return(0,r.jsx)(f,{children:l?(0,r.jsx)(r.Fragment,{children:"<$0.01"===l?(0,r.jsxs)(h,{children:[(0,r.jsx)(g,{children:"<"}),"$0.01"]}):l}):d})},f=i.zo.span`
  font-size: 14px;
  line-height: 140%;
  display: flex;
  gap: 4px;
  align-items: center;
`,m=i.zo.span`
  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
`,g=i.zo.span`
  font-size: 10px;
`,h=i.zo.span`
  display: flex;
  align-items: center;
`,x=e=>{var n,t;return(0,r.jsx)(y,{href:"ethereum"===e.chainType?(0,o.b)(e.chainId,e.walletAddress):(n=e.walletAddress,t=e.chainId,`https://explorer.solana.com/account/${n}?chain=${t}`),target:"_blank",children:(0,l.w)(e.walletAddress)})},y=i.zo.a`
  &:hover {
    text-decoration: underline;
  }
`},34644:function(e,n,t){t.d(n,{a:function(){return l},b:function(){return f},c:function(){return c},g:function(){return d},p:function(){return u},s:function(){return p}});var r=t(40778),i=t(3010),a=t(40099);let o=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2}),s=e=>o.format(e),c=(e,n)=>{let t=s(n*parseFloat(e));return"$0.00"!==t?t:"<$0.01"},l=(e,n)=>{let t=s(n*parseFloat((0,r.d)(e)));return"$0.00"===t?"<$0.01":t},d=(e,n,t=6,r=!1)=>`${u(e,t,r)} ${n}`,u=(e,n=6,t=!1)=>{let i=parseFloat((0,r.d)(e)).toFixed(n).replace(/0+$/,"").replace(/\.$/,"");return t?i:`${"0"===i?"<0.001":i}`},p=e=>e.reduce((e,n)=>e+n,0n),f=(e,n)=>{let{chains:t}=(0,i.u)(),r=`https://etherscan.io/address/${n}`,o=`${(0,a.G)(e,t)}/address/${n}`;if(!o)return r;try{new URL(o)}catch{return r}return o}},58541:function(e,n,t){t.d(n,{A:function(){return s},D:function(){return d},J:function(){return l},L:function(){return r},R:function(){return c},S:function(){return i},T:function(){return a},a:function(){return o},g:function(){return u}});let r=1e9,i="11111111111111111111111111111111",a="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",o="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",s="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",c=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],l=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],d={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}};function u(e,n){let t=parseFloat(e.toString())/r,i=p.format(n*t);return"$0.00"===i?"<$0.01":i}let p=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},99539:function(e,n,t){t.d(n,{N:function(){return a}});var r=t(89418),i=t(43803);let a=({size:e,centerIcon:n})=>(0,r.jsx)(o,{$size:e,children:(0,r.jsxs)(s,{children:[(0,r.jsx)(l,{}),(0,r.jsx)(d,{}),n?(0,r.jsx)(c,{children:n}):null]})}),o=i.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=i.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,c=i.zo.div`
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
`,l=i.zo.div`
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
`,d=i.zo.div`
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
`},63821:function(e,n,t){t.d(n,{a:function(){return a},g:function(){return i}});var r=t(58541);function i(e,n=6,t=!1,r=!1){let i=(parseFloat(e.toString())/1e9).toFixed(n).replace(/0+$/,"").replace(/\.$/,""),a=r?"":" SOL";return t?`${i}${a}`:`${"0"===i?"<0.001":i}${a}`}function a({amount:e,fee:n,tokenPrice:t,isUsdc:a}){let o=BigInt(Math.floor(parseFloat(e)*10**(a?6:9))),s=a?o:o+n;return{fundingAmountInBaseUnit:o,fundingAmountInUsd:t?(0,r.g)(o,t):void 0,totalPriceInUsd:t?(0,r.g)(s,t):void 0,totalPriceInNativeCurrency:i(s),feePriceInNativeCurrency:i(n),feePriceInUsd:t?(0,r.g)(n,t):void 0}}},80483:function(e,n,t){t.d(n,{u:function(){return a}});var r=t(4753),i=t(3010);let a=({enabled:e=!0}={})=>{let{showFiatPrices:n,getUsdPriceForSol:t}=(0,i.u)(),[a,o]=(0,r.useState)(!0),[s,c]=(0,r.useState)(void 0),[l,d]=(0,r.useState)(void 0);return(0,r.useEffect)(()=>{(async()=>{if(n&&e)try{o(!0);let e=await t();e?d(e):c(Error("Unable to fetch SOL price"))}catch(e){c(e)}finally{o(!1)}else o(!1)})()},[]),{solPrice:l,isSolPriceLoading:a,solPriceError:s}}},29183:function(e,n,t){t.d(n,{a:function(){return u},b:function(){return m},f:function(){return p},s:function(){return f},u:function(){return h},w:function(){return g}});var r=t(60504),i=t(29077),a=t(4753),o=t(64982),s=t(98401),c=t(3010),l=t(95115).Buffer;let d=Symbol("default-solana-rpcs-plugin");function u(e){return new Uint8Array((0,r.x7)().decode(e).messageBytes)}async function p({solanaClient:e,tx:n}){let t=(0,i.TJ)().decode(u(n)),{value:r}=await e.rpc.getFeeForMessage(t).send();return r??0n}async function f({solanaClient:e,tx:n,replaceRecentBlockhash:t}){let{value:r}=await e.rpc.simulateTransaction((0,i.TJ)().decode(n),{commitment:"confirmed",encoding:"base64",sigVerify:!1,replaceRecentBlockhash:t}).send();if("BlockhashNotFound"===r.err&&t)throw Error("Simulation failed: Blockhash not found");return"BlockhashNotFound"===r.err?await f({solanaClient:e,tx:n,replaceRecentBlockhash:!0}):{logs:r.logs??[],error:r.err,hasError:!!r.err,hasFunds:r.logs?.every(e=>!/insufficient funds/gi.test(e)&&!/insufficient lamports/gi.test(e))??!0}}let m=(...e)=>{if(void 0===l)throw new c.b("Buffer is not defined.",void 0,c.c.BUFFER_NOT_DEFINED);return l.from(...e)};async function g({rpcSubscriptions:e,signature:n,timeout:t}){let r=new AbortController,i=await e.signatureNotifications(n,{commitment:"confirmed"}).subscribe({abortSignal:r.signal}),a=await Promise.race([new Promise(e=>{setTimeout(()=>{r.abort(),e(Error("Transaction confirmation timed out"))},t)}),new Promise(async e=>{for await(let n of i){if(r.abort(),n.value.err)return e(Error("Transaction confirmation failed"));e(void 0)}})]);if(a instanceof Error)throw a}function h(){let e=(0,o.u)(),n=(0,s.u)(),t=(0,a.useMemo)(()=>{let t=n(d),r=t?.getDefaultRpcs({appId:e.id});return Object.fromEntries(["solana:mainnet","solana:devnet","solana:testnet"].map(n=>{let t=e.solanaRpcs[n]??r?.[n]??null;return[n,t?function({rpc:e,rpcSubscriptions:n,chain:t,blockExplorerUrl:r}){let a=function({rpc:e,rpcSubscriptions:n}){return async t=>new Promise(async(r,a)=>{try{let a=await e.sendTransaction(m(t).toString("base64"),{preflightCommitment:"confirmed",encoding:"base64"}).send();await g({rpcSubscriptions:n,signature:a,timeout:1e4}),r({signature:new Uint8Array((0,i.Un)().encode(a))})}catch(e){a(e)}})}({rpc:e,rpcSubscriptions:n});return{rpc:e,rpcSubscriptions:n,chain:t,blockExplorerUrl:r,sendAndConfirmTransaction:a}}({chain:n,rpc:t.rpc,rpcSubscriptions:t.rpcSubscriptions,blockExplorerUrl:t.blockExplorerUrl??`https://explorer.solana.com?cluster=${n.replace("solana:","")}`}):null]}))},[e.solanaRpcs,e.id,n]);return(0,a.useCallback)(e=>{if(!t[e])throw Error(`No RPC configuration found for chain ${e}`);return t[e]},[t])}}}]);