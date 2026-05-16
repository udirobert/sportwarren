"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8202],{16249:function(e,r,i){var n=i(4753);let t=n.forwardRef(function(e,r){let{title:i,titleId:t,...o}=e;return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":t},o),i?n.createElement("title",{id:t},i):null,n.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m19.5 8.25-7.5 7.5-7.5-7.5"}))});r.Z=t},30897:function(e,r,i){var n=i(4753);let t=n.forwardRef(function(e,r){let{title:i,titleId:t,...o}=e;return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":t},o),i?n.createElement("title",{id:t},i):null,n.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))});r.Z=t},71038:function(e,r,i){i.d(r,{Q:function(){return t}});var n=i(6347);function t(e){let r=e.filter(e=>!n.e.has(e.id));return n.B.concat(r)}},94923:function(e,r,i){i.d(r,{B:function(){return t},C:function(){return l},F:function(){return c},H:function(){return a},R:function(){return x},S:function(){return u},a:function(){return d},b:function(){return p},c:function(){return s},d:function(){return h},e:function(){return o}});var n=i(43803);let t=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,o=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,n.zo)(o)`
  padding: 20px 0;
`,s=(0,n.zo)(o)`
  gap: 16px;
`,c=n.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;n.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=n.zo.div`
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
`,p=n.zo.div`
  height: 16px;
`,x=n.zo.div`
  height: 12px;
`;n.zo.div`
  position: relative;
`;let h=n.zo.div`
  height: ${e=>e.height??"12"}px;
`;n.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},18532:function(e,r,i){i.d(r,{S:function(){return w}});var n=i(89418),t=i(4753),o=i(43803),a=i(61318),l=i(13188),s=i(99539);let c=o.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=o.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,o.zo)(l.M)`
  margin: 0 -8px;
`,x=o.zo.div`
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
`,f=o.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,g=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,v=o.zo.h3`
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
`,w=({children:e,...r})=>(0,n.jsx)(c,{children:(0,n.jsx)(d,{...r,children:e})}),k=o.zo.div`
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
`,P=({step:e})=>e?(0,n.jsx)(k,{children:(0,n.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;w.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:o,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:x,step:h,headerTitle:y,...b})=>(0,n.jsxs)(u,{...b,children:[(0,n.jsx)(p,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?x:void 0,title:y,closeable:d}),(i||t||e||r)&&(0,n.jsxs)(f,{children:[i||t?(0,n.jsx)(w.Icon,{icon:i,variant:t,loadingStatus:o}):null,!(!e&&!r)&&(0,n.jsxs)(g,{children:[e&&(0,n.jsx)(v,{children:e}),r&&(0,n.jsx)(m,{children:r})]})]}),h&&(0,n.jsx)(P,{step:h})]}),(w.Body=t.forwardRef(({children:e,...r},i)=>(0,n.jsx)(x,{ref:i,...r,children:e}))).displayName="Screen.Body",w.Footer=({children:e,...r})=>(0,n.jsx)(h,{id:"privy-content-footer-container",...r,children:e}),w.Actions=({children:e,...r})=>(0,n.jsx)(E,{...r,children:e}),w.HelpText=({children:e,...r})=>(0,n.jsx)(C,{...r,children:e}),w.FooterText=({children:e,...r})=>(0,n.jsx)(F,{...r,children:e}),w.Watermark=()=>(0,n.jsx)(z,{}),w.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,n.jsx)(b,"string"==typeof e?{children:(0,n.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,n.jsx)(j,{children:(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,n.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,n.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,n.jsx)(y,{$variant:r,children:(0,n.jsx)(s.N,{size:"64px"})}):(0,n.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,n.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=o.zo.div`
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
`},35868:function(e,r,i){i.d(r,{S:function(){return a}});var n=i(89418),t=i(13188),o=i(18532);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,n.jsxs)(n.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,o=i.variant||"primary";return(0,n.jsx)(t.a,{...i,variant:o,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,o=i.variant||"secondary";return(0,n.jsx)(t.a,{...i,variant:o,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,n.jsxs)(o.S,{id:c.id,className:c.className,children:[(0,n.jsx)(o.S.Header,{...c}),s?(0,n.jsx)(o.S.Body,{children:s}):null,i||d||l?(0,n.jsxs)(o.S.Footer,{children:[i?(0,n.jsx)(o.S.HelpText,{children:i}):null,d?(0,n.jsx)(o.S.Actions,{children:d}):null,l?(0,n.jsx)(o.S.Watermark,{}):null]}):null,a?(0,n.jsx)(o.S.FooterText,{children:a}):null]})}},31334:function(e,r,i){i.d(r,{T:function(){return A}});var n=i(89418),t=i(43803),o=i(26559),a=i(34644),l=i(94923),s=i(16249),c=i(4753),d=i(64982);let u=({label:e,children:r,valueStyles:i})=>(0,n.jsxs)(p,{children:[(0,n.jsx)("div",{children:e}),(0,n.jsx)(x,{style:{...i},children:r})]}),p=t.zo.div`
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
`,x=t.zo.div`
  font-size: 14px;
  line-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-full);
  background-color: var(--privy-color-background-2);
  padding: 4px 8px;
`,h=({gas:e,tokenPrice:r,tokenSymbol:i})=>(0,n.jsxs)(l.F,{style:{paddingBottom:"12px"},children:[(0,n.jsxs)(g,{children:[(0,n.jsx)(m,{children:"Est. Fees"}),(0,n.jsx)("div",{children:(0,n.jsx)(o.P,{weiQuantities:[BigInt(e)],tokenPrice:r,tokenSymbol:i})})]}),r&&(0,n.jsx)(v,{children:`${(0,a.g)(BigInt(e),i)}`})]}),f=({value:e,gas:r,tokenPrice:i,tokenSymbol:t})=>{let s=BigInt(e??0)+BigInt(r);return(0,n.jsxs)(l.F,{children:[(0,n.jsxs)(g,{children:[(0,n.jsx)(m,{children:"Total (including fees)"}),(0,n.jsx)("div",{children:(0,n.jsx)(o.P,{weiQuantities:[BigInt(e||0),BigInt(r)],tokenPrice:i,tokenSymbol:t})})]}),i&&(0,n.jsx)(v,{children:(0,a.g)(s,t)})]})},g=t.zo.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
`,v=t.zo.div`
  display: flex;
  flex-direction: row;
  height: 12px;

  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
  font-weight: 400;
`,m=t.zo.div`
  font-size: 14px;
  line-height: 22.4px;
  font-weight: 400;
`,y=(0,c.createContext)(void 0),b=(0,c.createContext)(void 0),j=({defaultValue:e,children:r})=>{let[i,t]=(0,c.useState)(e||null);return(0,n.jsx)(y.Provider,{value:{activePanel:i,togglePanel:e=>{t(i===e?null:e)}},children:(0,n.jsx)(P,{children:r})})},w=({value:e,children:r})=>{let{activePanel:i,togglePanel:t}=(0,c.useContext)(y),o=i===e;return(0,n.jsx)(b.Provider,{value:{onToggle:()=>t(e),value:e},children:(0,n.jsx)($,{isActive:o?"true":"false","data-open":String(o),children:r})})},k=({children:e})=>{let{activePanel:r}=(0,c.useContext)(y),{onToggle:i,value:t}=(0,c.useContext)(b),o=r===t;return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(E,{onClick:i,"data-open":String(o),children:[(0,n.jsx)(F,{children:e}),(0,n.jsx)(L,{isactive:o?"true":"false",children:(0,n.jsx)(s.Z,{height:"16px",width:"16px",strokeWidth:"2"})})]}),(0,n.jsx)(C,{})]})},z=({children:e})=>{let{activePanel:r}=(0,c.useContext)(y),{value:i}=(0,c.useContext)(b);return(0,n.jsx)(T,{"data-open":String(r===i),children:(0,n.jsx)(B,{children:e})})},S=({children:e})=>{let{activePanel:r}=(0,c.useContext)(y),{value:i}=(0,c.useContext)(b);return(0,n.jsx)(B,{children:"function"==typeof e?e({isActive:r===i}):e})},P=t.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`,E=t.zo.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer;
  padding-bottom: 8px;
`,C=t.zo.div`
  width: 100%;

  && {
    border-top: 1px solid;
    border-color: var(--privy-color-foreground-4);
  }
  padding-bottom: 12px;
`,F=t.zo.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 19.6px;
  width: 100%;
  padding-right: 8px;
`,$=t.zo.div`
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
`,T=t.zo.div`
  position: relative;
  overflow: hidden;
  transition: max-height 25ms ease-out;

  &[data-open='true'] {
    max-height: 700px;
  }

  &[data-open='false'] {
    max-height: 0;
  }
`,B=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 1px;
`,L=t.zo.div`
  transform: ${e=>"true"===e.isactive?"rotate(180deg)":"rotate(0deg)"};
`,A=({from:e,to:r,txn:i,transactionInfo:t,tokenPrice:a,gas:l,tokenSymbol:s})=>{let c=BigInt(i?.value||0);return(0,n.jsx)(j,{...(0,d.u)().render.standalone?{defaultValue:"details"}:{},children:(0,n.jsxs)(w,{value:"details",children:[(0,n.jsx)(k,{children:(0,n.jsxs)(I,{children:[(0,n.jsx)("div",{children:t?.title||"Details"}),(0,n.jsx)(N,{children:(0,n.jsx)(o.H,{weiQuantities:[c],tokenPrice:a,tokenSymbol:s})})]})}),(0,n.jsxs)(z,{children:[(0,n.jsx)(u,{label:"From",children:(0,n.jsx)(o.W,{walletAddress:e,chainId:i.chainId||d.s,chainType:"ethereum"})}),(0,n.jsx)(u,{label:"To",children:(0,n.jsx)(o.W,{walletAddress:r,chainId:i.chainId||d.s,chainType:"ethereum"})}),t&&t.action&&(0,n.jsx)(u,{label:"Action",children:t.action}),l&&(0,n.jsx)(h,{value:i.value,gas:l,tokenPrice:a,tokenSymbol:s})]}),(0,n.jsx)(S,{children:({isActive:e})=>(0,n.jsx)(f,{value:i.value,displayFee:e,gas:l||"0x0",tokenPrice:a,tokenSymbol:s})})]})})},I=t.zo.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`,N=t.zo.div`
  flex-shrink: 0;
  padding-left: 8px;
`},26559:function(e,r,i){i.d(r,{H:function(){return d},P:function(){return u},S:function(){return p},W:function(){return v}});var n=i(89418),t=i(43803),o=i(1603),a=i(34644),l=i(58541),s=i(63821),c=i(40099);let d=({weiQuantities:e,tokenPrice:r,tokenSymbol:i})=>{let t=(0,a.s)(e),o=r?(0,a.a)(t,r):void 0,l=(0,a.g)(t,i);return(0,n.jsx)(x,{children:o||l})},u=({weiQuantities:e,tokenPrice:r,tokenSymbol:i})=>{let t=(0,a.s)(e),o=r?(0,a.a)(t,r):void 0,l=(0,a.g)(t,i);return(0,n.jsx)(x,{children:o?(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(h,{children:"USD"}),"<$0.01"===o?(0,n.jsxs)(g,{children:[(0,n.jsx)(f,{children:"<"}),"$0.01"]}):o]}):l})},p=({quantities:e,tokenPrice:r,tokenSymbol:i="SOL",tokenDecimals:t=9})=>{let a=e.reduce((e,r)=>e+r,0n),c=r&&"SOL"===i&&9===t?(0,l.g)(a,r):void 0,d="SOL"===i&&9===t?(0,s.g)(a):`${(0,o.b)(a,t)} ${i}`;return(0,n.jsx)(x,{children:c?(0,n.jsx)(n.Fragment,{children:"<$0.01"===c?(0,n.jsxs)(g,{children:[(0,n.jsx)(f,{children:"<"}),"$0.01"]}):c}):d})},x=t.zo.span`
  font-size: 14px;
  line-height: 140%;
  display: flex;
  gap: 4px;
  align-items: center;
`,h=t.zo.span`
  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
`,f=t.zo.span`
  font-size: 10px;
`,g=t.zo.span`
  display: flex;
  align-items: center;
`,v=e=>{var r,i;return(0,n.jsx)(m,{href:"ethereum"===e.chainType?(0,a.b)(e.chainId,e.walletAddress):(r=e.walletAddress,i=e.chainId,`https://explorer.solana.com/account/${r}?chain=${i}`),target:"_blank",children:(0,c.w)(e.walletAddress)})},m=t.zo.a`
  &:hover {
    text-decoration: underline;
  }
`},34644:function(e,r,i){i.d(r,{a:function(){return c},b:function(){return x},c:function(){return s},g:function(){return d},p:function(){return u},s:function(){return p}});var n=i(40778),t=i(3010),o=i(40099);let a=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2}),l=e=>a.format(e),s=(e,r)=>{let i=l(r*parseFloat(e));return"$0.00"!==i?i:"<$0.01"},c=(e,r)=>{let i=l(r*parseFloat((0,n.d)(e)));return"$0.00"===i?"<$0.01":i},d=(e,r,i=6,n=!1)=>`${u(e,i,n)} ${r}`,u=(e,r=6,i=!1)=>{let t=parseFloat((0,n.d)(e)).toFixed(r).replace(/0+$/,"").replace(/\.$/,"");return i?t:`${"0"===t?"<0.001":t}`},p=e=>e.reduce((e,r)=>e+r,0n),x=(e,r)=>{let{chains:i}=(0,t.u)(),n=`https://etherscan.io/address/${r}`,a=`${(0,o.G)(e,i)}/address/${r}`;if(!a)return n;try{new URL(a)}catch{return n}return a}},58541:function(e,r,i){i.d(r,{A:function(){return l},D:function(){return d},J:function(){return c},L:function(){return n},R:function(){return s},S:function(){return t},T:function(){return o},a:function(){return a},g:function(){return u}});let n=1e9,t="11111111111111111111111111111111",o="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",a="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",l="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",s=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],c=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],d={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}};function u(e,r){let i=parseFloat(e.toString())/n,t=p.format(r*i);return"$0.00"===t?"<$0.01":t}let p=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},99539:function(e,r,i){i.d(r,{N:function(){return o}});var n=i(89418),t=i(43803);let o=({size:e,centerIcon:r})=>(0,n.jsx)(a,{$size:e,children:(0,n.jsxs)(l,{children:[(0,n.jsx)(c,{}),(0,n.jsx)(d,{}),r?(0,n.jsx)(s,{children:r}):null]})}),a=t.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=t.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=t.zo.div`
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
`,c=t.zo.div`
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
`,d=t.zo.div`
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
`},63821:function(e,r,i){i.d(r,{a:function(){return o},g:function(){return t}});var n=i(58541);function t(e,r=6,i=!1,n=!1){let t=(parseFloat(e.toString())/1e9).toFixed(r).replace(/0+$/,"").replace(/\.$/,""),o=n?"":" SOL";return i?`${t}${o}`:`${"0"===t?"<0.001":t}${o}`}function o({amount:e,fee:r,tokenPrice:i,isUsdc:o}){let a=BigInt(Math.floor(parseFloat(e)*10**(o?6:9))),l=o?a:a+r;return{fundingAmountInBaseUnit:a,fundingAmountInUsd:i?(0,n.g)(a,i):void 0,totalPriceInUsd:i?(0,n.g)(l,i):void 0,totalPriceInNativeCurrency:t(l),feePriceInNativeCurrency:t(r),feePriceInUsd:i?(0,n.g)(r,i):void 0}}},80483:function(e,r,i){i.d(r,{u:function(){return o}});var n=i(4753),t=i(3010);let o=({enabled:e=!0}={})=>{let{showFiatPrices:r,getUsdPriceForSol:i}=(0,t.u)(),[o,a]=(0,n.useState)(!0),[l,s]=(0,n.useState)(void 0),[c,d]=(0,n.useState)(void 0);return(0,n.useEffect)(()=>{(async()=>{if(r&&e)try{a(!0);let e=await i();e?d(e):s(Error("Unable to fetch SOL price"))}catch(e){s(e)}finally{a(!1)}else a(!1)})()},[]),{solPrice:c,isSolPriceLoading:o,solPriceError:l}}},13404:function(e,r,i){i.d(r,{u:function(){return s}});var n=i(4753),t=i(71038),o=i(64982),a=i(3010),l=i(80483);function s(e){let{tokenPrice:r,isTokenPriceLoading:i,tokenPriceError:s}=(e=>{let{showFiatPrices:r,getUsdTokenPrice:i,chains:l}=(0,a.u)(),[s,c]=(0,n.useState)(!0),[d,u]=(0,n.useState)(void 0),[p,x]=(0,n.useState)(void 0);return(0,n.useEffect)(()=>{e||=o.s;let n=(0,t.Q)(l).find(r=>r.id===Number(e));(async()=>{if(r){if(!n)return c(!1),void u(Error(`Unable to fetch token price on chain id ${e}`));try{c(!0);let e=await i(n);e?x(e):u(Error(`Unable to fetch token price on chain id ${n.id}`))}catch(e){u(e)}finally{c(!1)}}else c(!1)})()},[e]),{tokenPrice:p,isTokenPriceLoading:s,tokenPriceError:d}})("solana"===e?-1:e),{solPrice:c,isSolPriceLoading:d,solPriceError:u}=(0,l.u)({enabled:"solana"===e});return"solana"===e?{tokenPrice:c,isTokenPriceLoading:d,tokenPriceError:u}:{tokenPrice:r,isTokenPriceLoading:i,tokenPriceError:s}}}}]);