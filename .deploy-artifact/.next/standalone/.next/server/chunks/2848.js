"use strict";exports.id=2848,exports.ids=[2848],exports.modules={88364:(e,r,i)=>{i.d(r,{Z:()=>n});var t=i(26510);let n=t.forwardRef(function({title:e,titleId:r,...i},n){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},i),e?t.createElement("title",{id:r},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m19.5 8.25-7.5 7.5-7.5-7.5"}))})},22277:(e,r,i)=>{i.d(r,{Z:()=>n});var t=i(26510);let n=t.forwardRef(function({title:e,titleId:r,...i},n){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},i),e?t.createElement("title",{id:r},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))})},46400:(e,r,i)=>{i.d(r,{Q:()=>n});var t=i(41204);function n(e){let r=e.filter(e=>!t.e.has(e.id));return t.B.concat(r)}},38198:(e,r,i)=>{i.d(r,{B:()=>n,C:()=>l,F:()=>d,H:()=>a,R:()=>u,S:()=>p,a:()=>c,b:()=>x,c:()=>s,d:()=>h,e:()=>o});var t=i(96419);let n=t.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,o=t.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=t.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,t.zo)(o)`
  padding: 20px 0;
`,s=(0,t.zo)(o)`
  gap: 16px;
`,d=t.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,c=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;t.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let p=t.zo.div`
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
`,x=t.zo.div`
  height: 16px;
`,u=t.zo.div`
  height: 12px;
`;t.zo.div`
  position: relative;
`;let h=t.zo.div`
  height: ${e=>e.height??"12"}px;
`;t.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},17846:(e,r,i)=>{i.d(r,{S:()=>w});var t=i(4913),n=i(26510),o=i(96419),a=i(13813),l=i(38102),s=i(90684);let d=o.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,c=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=o.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,x=(0,o.zo)(l.M)`
  margin: 0 -8px;
`,u=o.zo.div`
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
`,h=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,g=o.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,v=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=o.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=o.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,y=o.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=o.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,j=o.zo.div`
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
`,w=({children:e,...r})=>(0,t.jsx)(d,{children:(0,t.jsx)(c,{...r,children:e})}),k=o.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,z=(0,o.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,S=o.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,P=({step:e})=>e?(0,t.jsx)(k,{children:(0,t.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;w.Header=({title:e,subtitle:r,icon:i,iconVariant:n,iconLoadingStatus:o,showBack:a,onBack:l,showInfo:s,onInfo:d,showClose:c,onClose:u,step:h,headerTitle:y,...b})=>(0,t.jsxs)(p,{...b,children:[(0,t.jsx)(x,{backFn:a?l:void 0,infoFn:s?d:void 0,onClose:c?u:void 0,title:y,closeable:c}),(i||n||e||r)&&(0,t.jsxs)(g,{children:[i||n?(0,t.jsx)(w.Icon,{icon:i,variant:n,loadingStatus:o}):null,!(!e&&!r)&&(0,t.jsxs)(v,{children:[e&&(0,t.jsx)(f,{children:e}),r&&(0,t.jsx)(m,{children:r})]})]}),h&&(0,t.jsx)(P,{step:h})]}),(w.Body=n.forwardRef(({children:e,...r},i)=>(0,t.jsx)(u,{ref:i,...r,children:e}))).displayName="Screen.Body",w.Footer=({children:e,...r})=>(0,t.jsx)(h,{id:"privy-content-footer-container",...r,children:e}),w.Actions=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),w.HelpText=({children:e,...r})=>(0,t.jsx)(C,{...r,children:e}),w.FooterText=({children:e,...r})=>(0,t.jsx)(F,{...r,children:e}),w.Watermark=()=>(0,t.jsx)(z,{}),w.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(b,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,t.jsx)(j,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(y,{$variant:r,children:(0,t.jsx)(s.N,{size:"64px"})}):(0,t.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=o.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,C=o.zo.div`
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
`,F=o.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>a});var t=i(4913),n=i(38102),o=i(17846);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...d})=>{let c=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,o=i.variant||"primary";return(0,t.jsx)(n.a,{...i,variant:o,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,o=i.variant||"secondary";return(0,t.jsx)(n.a,{...i,variant:o,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(o.S,{id:d.id,className:d.className,children:[(0,t.jsx)(o.S.Header,{...d}),s?(0,t.jsx)(o.S.Body,{children:s}):null,i||c||l?(0,t.jsxs)(o.S.Footer,{children:[i?(0,t.jsx)(o.S.HelpText,{children:i}):null,c?(0,t.jsx)(o.S.Actions,{children:c}):null,l?(0,t.jsx)(o.S.Watermark,{}):null]}):null,a?(0,t.jsx)(o.S.FooterText,{children:a}):null]})}},21952:(e,r,i)=>{i.d(r,{T:()=>A});var t=i(4913),n=i(96419),o=i(57194),a=i(46158),l=i(38198),s=i(88364),d=i(26510),c=i(14348);let p=({label:e,children:r,valueStyles:i})=>(0,t.jsxs)(x,{children:[(0,t.jsx)("div",{children:e}),(0,t.jsx)(u,{style:{...i},children:r})]}),x=n.zo.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  > :first-child {
    color: var(--privy-color-foreground-3);
    text-align: left;
  }

  > :last-child {
    color: var(--privy-color-foreground-2);
    text-align: right;
  }
`,u=n.zo.div`
  font-size: 14px;
  line-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-full);
  background-color: var(--privy-color-background-2);
  padding: 4px 8px;
`,h=({gas:e,tokenPrice:r,tokenSymbol:i})=>(0,t.jsxs)(l.F,{style:{paddingBottom:"12px"},children:[(0,t.jsxs)(v,{children:[(0,t.jsx)(m,{children:"Est. Fees"}),(0,t.jsx)("div",{children:(0,t.jsx)(o.P,{weiQuantities:[BigInt(e)],tokenPrice:r,tokenSymbol:i})})]}),r&&(0,t.jsx)(f,{children:`${(0,a.g)(BigInt(e),i)}`})]}),g=({value:e,gas:r,tokenPrice:i,tokenSymbol:n})=>{let s=BigInt(e??0)+BigInt(r);return(0,t.jsxs)(l.F,{children:[(0,t.jsxs)(v,{children:[(0,t.jsx)(m,{children:"Total (including fees)"}),(0,t.jsx)("div",{children:(0,t.jsx)(o.P,{weiQuantities:[BigInt(e||0),BigInt(r)],tokenPrice:i,tokenSymbol:n})})]}),i&&(0,t.jsx)(f,{children:(0,a.g)(s,n)})]})},v=n.zo.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
`,f=n.zo.div`
  display: flex;
  flex-direction: row;
  height: 12px;

  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
  font-weight: 400;
`,m=n.zo.div`
  font-size: 14px;
  line-height: 22.4px;
  font-weight: 400;
`,y=(0,d.createContext)(void 0),b=(0,d.createContext)(void 0),j=({defaultValue:e,children:r})=>{let[i,n]=(0,d.useState)(e||null);return(0,t.jsx)(y.Provider,{value:{activePanel:i,togglePanel:e=>{n(i===e?null:e)}},children:(0,t.jsx)(P,{children:r})})},w=({value:e,children:r})=>{let{activePanel:i,togglePanel:n}=(0,d.useContext)(y),o=i===e;return(0,t.jsx)(b.Provider,{value:{onToggle:()=>n(e),value:e},children:(0,t.jsx)($,{isActive:o?"true":"false","data-open":String(o),children:r})})},k=({children:e})=>{let{activePanel:r}=(0,d.useContext)(y),{onToggle:i,value:n}=(0,d.useContext)(b),o=r===n;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(E,{onClick:i,"data-open":String(o),children:[(0,t.jsx)(F,{children:e}),(0,t.jsx)(L,{isactive:o?"true":"false",children:(0,t.jsx)(s.Z,{height:"16px",width:"16px",strokeWidth:"2"})})]}),(0,t.jsx)(C,{})]})},z=({children:e})=>{let{activePanel:r}=(0,d.useContext)(y),{value:i}=(0,d.useContext)(b);return(0,t.jsx)(T,{"data-open":String(r===i),children:(0,t.jsx)(B,{children:e})})},S=({children:e})=>{let{activePanel:r}=(0,d.useContext)(y),{value:i}=(0,d.useContext)(b);return(0,t.jsx)(B,{children:"function"==typeof e?e({isActive:r===i}):e})},P=n.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`,E=n.zo.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer;
  padding-bottom: 8px;
`,C=n.zo.div`
  width: 100%;

  && {
    border-top: 1px solid;
    border-color: var(--privy-color-foreground-4);
  }
  padding-bottom: 12px;
`,F=n.zo.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 19.6px;
  width: 100%;
  padding-right: 8px;
`,$=n.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  padding: 12px;

  && {
    border: 1px solid;
    border-color: var(--privy-color-foreground-4);
    border-radius: var(--privy-border-radius-md);
  }
`,T=n.zo.div`
  position: relative;
  overflow: hidden;
  transition: max-height 25ms ease-out;

  &[data-open='true'] {
    max-height: 700px;
  }

  &[data-open='false'] {
    max-height: 0;
  }
`,B=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 1px;
`,L=n.zo.div`
  transform: ${e=>"true"===e.isactive?"rotate(180deg)":"rotate(0deg)"};
`,A=({from:e,to:r,txn:i,transactionInfo:n,tokenPrice:a,gas:l,tokenSymbol:s})=>{let d=BigInt(i?.value||0);return(0,t.jsx)(j,{...(0,c.u)().render.standalone?{defaultValue:"details"}:{},children:(0,t.jsxs)(w,{value:"details",children:[(0,t.jsx)(k,{children:(0,t.jsxs)(I,{children:[(0,t.jsx)("div",{children:n?.title||"Details"}),(0,t.jsx)(U,{children:(0,t.jsx)(o.H,{weiQuantities:[d],tokenPrice:a,tokenSymbol:s})})]})}),(0,t.jsxs)(z,{children:[(0,t.jsx)(p,{label:"From",children:(0,t.jsx)(o.W,{walletAddress:e,chainId:i.chainId||c.s,chainType:"ethereum"})}),(0,t.jsx)(p,{label:"To",children:(0,t.jsx)(o.W,{walletAddress:r,chainId:i.chainId||c.s,chainType:"ethereum"})}),n&&n.action&&(0,t.jsx)(p,{label:"Action",children:n.action}),l&&(0,t.jsx)(h,{value:i.value,gas:l,tokenPrice:a,tokenSymbol:s})]}),(0,t.jsx)(S,{children:({isActive:e})=>(0,t.jsx)(g,{value:i.value,displayFee:e,gas:l||"0x0",tokenPrice:a,tokenSymbol:s})})]})})},I=n.zo.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`,U=n.zo.div`
  flex-shrink: 0;
  padding-left: 8px;
`},57194:(e,r,i)=>{i.d(r,{H:()=>c,P:()=>p,S:()=>x,W:()=>f});var t=i(4913),n=i(96419),o=i(91299),a=i(46158),l=i(24689),s=i(77013),d=i(22554);let c=({weiQuantities:e,tokenPrice:r,tokenSymbol:i})=>{let n=(0,a.s)(e),o=r?(0,a.a)(n,r):void 0,l=(0,a.g)(n,i);return(0,t.jsx)(u,{children:o||l})},p=({weiQuantities:e,tokenPrice:r,tokenSymbol:i})=>{let n=(0,a.s)(e),o=r?(0,a.a)(n,r):void 0,l=(0,a.g)(n,i);return(0,t.jsx)(u,{children:o?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(h,{children:"USD"}),"<$0.01"===o?(0,t.jsxs)(v,{children:[(0,t.jsx)(g,{children:"<"}),"$0.01"]}):o]}):l})},x=({quantities:e,tokenPrice:r,tokenSymbol:i="SOL",tokenDecimals:n=9})=>{let a=e.reduce((e,r)=>e+r,0n),d=r&&"SOL"===i&&9===n?(0,l.g)(a,r):void 0,c="SOL"===i&&9===n?(0,s.g)(a):`${(0,o.b)(a,n)} ${i}`;return(0,t.jsx)(u,{children:d?(0,t.jsx)(t.Fragment,{children:"<$0.01"===d?(0,t.jsxs)(v,{children:[(0,t.jsx)(g,{children:"<"}),"$0.01"]}):d}):c})},u=n.zo.span`
  font-size: 14px;
  line-height: 140%;
  display: flex;
  gap: 4px;
  align-items: center;
`,h=n.zo.span`
  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
`,g=n.zo.span`
  font-size: 10px;
`,v=n.zo.span`
  display: flex;
  align-items: center;
`,f=e=>{var r,i;return(0,t.jsx)(m,{href:"ethereum"===e.chainType?(0,a.b)(e.chainId,e.walletAddress):(r=e.walletAddress,i=e.chainId,`https://explorer.solana.com/account/${r}?chain=${i}`),target:"_blank",children:(0,d.w)(e.walletAddress)})},m=n.zo.a`
  &:hover {
    text-decoration: underline;
  }
`},46158:(e,r,i)=>{i.d(r,{a:()=>d,b:()=>u,c:()=>s,g:()=>c,p:()=>p,s:()=>x});var t=i(10),n=i(49171),o=i(22554);let a=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2}),l=e=>a.format(e),s=(e,r)=>{let i=l(r*parseFloat(e));return"$0.00"!==i?i:"<$0.01"},d=(e,r)=>{let i=l(r*parseFloat((0,t.d)(e)));return"$0.00"===i?"<$0.01":i},c=(e,r,i=6,t=!1)=>`${p(e,i,t)} ${r}`,p=(e,r=6,i=!1)=>{let n=parseFloat((0,t.d)(e)).toFixed(r).replace(/0+$/,"").replace(/\.$/,"");return i?n:`${"0"===n?"<0.001":n}`},x=e=>e.reduce((e,r)=>e+r,0n),u=(e,r)=>{let{chains:i}=(0,n.u)(),t=`https://etherscan.io/address/${r}`,a=`${(0,o.G)(e,i)}/address/${r}`;if(!a)return t;try{new URL(a)}catch{return t}return a}},24689:(e,r,i)=>{i.d(r,{A:()=>l,D:()=>c,J:()=>d,L:()=>t,R:()=>s,S:()=>n,T:()=>o,a:()=>a,g:()=>p});let t=1e9,n="11111111111111111111111111111111",o="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",a="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",l="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",s=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],d=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],c={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}};function p(e,r){let i=parseFloat(e.toString())/t,n=x.format(r*i);return"$0.00"===n?"<$0.01":n}let x=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},90684:(e,r,i)=>{i.d(r,{N:()=>o});var t=i(4913),n=i(96419);let o=({size:e,centerIcon:r})=>(0,t.jsx)(a,{$size:e,children:(0,t.jsxs)(l,{children:[(0,t.jsx)(d,{}),(0,t.jsx)(c,{}),r?(0,t.jsx)(s,{children:r}):null]})}),a=n.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=n.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=n.zo.div`
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
`,d=n.zo.div`
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
`,c=n.zo.div`
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
`},77013:(e,r,i)=>{i.d(r,{a:()=>o,g:()=>n});var t=i(24689);function n(e,r=6,i=!1,t=!1){let n=(parseFloat(e.toString())/1e9).toFixed(r).replace(/0+$/,"").replace(/\.$/,""),o=t?"":" SOL";return i?`${n}${o}`:`${"0"===n?"<0.001":n}${o}`}function o({amount:e,fee:r,tokenPrice:i,isUsdc:o}){let a=BigInt(Math.floor(parseFloat(e)*10**(o?6:9))),l=o?a:a+r;return{fundingAmountInBaseUnit:a,fundingAmountInUsd:i?(0,t.g)(a,i):void 0,totalPriceInUsd:i?(0,t.g)(l,i):void 0,totalPriceInNativeCurrency:n(l),feePriceInNativeCurrency:n(r),feePriceInUsd:i?(0,t.g)(r,i):void 0}}},9781:(e,r,i)=>{i.d(r,{u:()=>o});var t=i(26510),n=i(49171);let o=({enabled:e=!0}={})=>{let{showFiatPrices:r,getUsdPriceForSol:i}=(0,n.u)(),[o,a]=(0,t.useState)(!0),[l,s]=(0,t.useState)(void 0),[d,c]=(0,t.useState)(void 0);return(0,t.useEffect)(()=>{(async()=>{if(r&&e)try{a(!0);let e=await i();e?c(e):s(Error("Unable to fetch SOL price"))}catch(e){s(e)}finally{a(!1)}else a(!1)})()},[]),{solPrice:d,isSolPriceLoading:o,solPriceError:l}}},29499:(e,r,i)=>{i.d(r,{u:()=>s});var t=i(26510),n=i(46400),o=i(14348),a=i(49171),l=i(9781);function s(e){let{tokenPrice:r,isTokenPriceLoading:i,tokenPriceError:s}=(e=>{let{showFiatPrices:r,getUsdTokenPrice:i,chains:l}=(0,a.u)(),[s,d]=(0,t.useState)(!0),[c,p]=(0,t.useState)(void 0),[x,u]=(0,t.useState)(void 0);return(0,t.useEffect)(()=>{e||=o.s;let t=(0,n.Q)(l).find(r=>r.id===Number(e));(async()=>{if(r){if(!t)return d(!1),void p(Error(`Unable to fetch token price on chain id ${e}`));try{d(!0);let e=await i(t);e?u(e):p(Error(`Unable to fetch token price on chain id ${t.id}`))}catch(e){p(e)}finally{d(!1)}}else d(!1)})()},[e]),{tokenPrice:x,isTokenPriceLoading:s,tokenPriceError:c}})("solana"===e?-1:e),{solPrice:d,isSolPriceLoading:c,solPriceError:p}=(0,l.u)({enabled:"solana"===e});return"solana"===e?{tokenPrice:d,isTokenPriceLoading:c,tokenPriceError:p}:{tokenPrice:r,isTokenPriceLoading:i,tokenPriceError:s}}}};