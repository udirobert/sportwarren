"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3986],{60973:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("arrow-right-left",[["path",{d:"m16 3 4 4-4 4",key:"1x1c3m"}],["path",{d:"M20 7H4",key:"zbl0bi"}],["path",{d:"m8 21-4-4 4-4",key:"h9nckh"}],["path",{d:"M4 17h16",key:"g4d7ey"}]])},53986:function(e,r,i){i.r(r),i.d(r,{ConnectLedgerScreen:function(){return h},ConnectLedgerScreenComponent:function(){return p},ConnectLedgerScreenView:function(){return d},default:function(){return h}});var n=i(89418),t=i(60973),o=i(43803),a=i(9201),l=i(35868),s=i(5430);i(4753),i(96257),i(78439),i(55982),i(94936),i(21628);let c=e=>(0,n.jsx)("svg",{id:"Layer_1",xmlns:"http://www.w3.org/2000/svg",viewBox:"-0.625 12.48 397.647 399.546",width:"2500",height:"674",preserveAspectRatio:"none",...e,children:(0,n.jsx)("g",{children:(0,n.jsx)("path",{fill:"#333745",d:"M 333.9 12.8 L 150.9 12.8 L 150.9 258.4 L 396.5 258.4 L 396.5 76.7 C 396.6 42.2 368.4 12.8 333.9 12.8 Z M 94.7 12.8 L 64 12.8 C 29.5 12.8 0 40.9 0 76.8 L 0 107.5 L 94.7 107.5 L 94.7 12.8 Z M 0 165 L 94.7 165 L 94.7 259.7 L 0 259.7 L 0 165 Z M 301.9 410.6 L 332.6 410.6 C 367.1 410.6 396.6 382.5 396.6 346.6 L 396.6 316 L 301.9 316 L 301.9 410.6 Z M 150.9 316 L 245.6 316 L 245.6 410.7 L 150.9 410.7 L 150.9 316 Z M 0 316 L 0 346.7 C 0 381.2 28.1 410.7 64 410.7 L 94.7 410.7 L 94.7 316 L 0 316 Z"})})}),d=({onContinueWithLedger:e,onContinueWithoutLedger:r,title:i="Phantom supports Ledger",subtitle:o="Are you using a Ledger hardware wallet?\nContinue to sign with Ledger"})=>(0,n.jsx)(l.S,{title:i,subtitle:(0,n.jsx)(u,{children:o}),primaryCta:{label:"Continue with Ledger",onClick:e},secondaryCta:{label:"Continue without Ledger",onClick:r},watermark:!0,children:(0,n.jsxs)(g,{children:[(0,n.jsx)(s.E,{style:{width:"48px",height:"48px"}}),(0,n.jsx)(t.Z,{strokeWidth:2,color:"var(--privy-color-icon-subtle)",width:22,height:22}),(0,n.jsx)(c,{style:{width:"48px",height:"48px"}})]})});function p(){let{data:e,setModalData:r,navigate:i}=(0,a.a)();return(0,n.jsx)(d,{onContinueWithLedger:function(){r({...e,login:{...e?.login,isSigningInWithLedgerSolana:!0}}),i("ConnectionStatusScreen")},onContinueWithoutLedger:function(){r({...e,login:{...e?.login,isSigningInWithLedgerSolana:!1}}),i("ConnectionStatusScreen")}})}let h={component:p},g=o.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: var(--screen-space);
`,u=o.zo.span`
  white-space: pre-wrap;
`},18532:function(e,r,i){i.d(r,{S:function(){return j}});var n=i(89418),t=i(4753),o=i(43803),a=i(61318),l=i(13188),s=i(99539);let c=o.zo.div`
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
`,p=o.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,o.zo)(l.M)`
  margin: 0 -8px;
`,g=o.zo.div`
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
`,u=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,x=o.zo.div`
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
`,w=o.zo.div`
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
`,j=({children:e,...r})=>(0,n.jsx)(c,{children:(0,n.jsx)(d,{...r,children:e})}),z=o.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,o.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,L=o.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,n.jsx)(z,{children:(0,n.jsx)(L,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:o,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:g,step:u,headerTitle:y,...b})=>(0,n.jsxs)(p,{...b,children:[(0,n.jsx)(h,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?g:void 0,title:y,closeable:d}),(i||t||e||r)&&(0,n.jsxs)(x,{children:[i||t?(0,n.jsx)(j.Icon,{icon:i,variant:t,loadingStatus:o}):null,!(!e&&!r)&&(0,n.jsxs)(v,{children:[e&&(0,n.jsx)(f,{children:e}),r&&(0,n.jsx)(m,{children:r})]})]}),u&&(0,n.jsx)(C,{step:u})]}),(j.Body=t.forwardRef(({children:e,...r},i)=>(0,n.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,n.jsx)(u,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,n.jsx)(S,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,n.jsx)(E,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,n.jsx)(F,{...r,children:e}),j.Watermark=()=>(0,n.jsx)(k,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,n.jsx)(b,"string"==typeof e?{children:(0,n.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,n.jsx)(w,{children:(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,n.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,n.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,n.jsx)(y,{$variant:r,children:(0,n.jsx)(s.N,{size:"64px"})}):(0,n.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,n.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let S=o.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,E=o.zo.div`
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
`},35868:function(e,r,i){i.d(r,{S:function(){return a}});var n=i(89418),t=i(13188),o=i(18532);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,n.jsxs)(n.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,o=i.variant||"primary";return(0,n.jsx)(t.a,{...i,variant:o,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,o=i.variant||"secondary";return(0,n.jsx)(t.a,{...i,variant:o,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,n.jsxs)(o.S,{id:c.id,className:c.className,children:[(0,n.jsx)(o.S.Header,{...c}),s?(0,n.jsx)(o.S.Body,{children:s}):null,i||d||l?(0,n.jsxs)(o.S.Footer,{children:[i?(0,n.jsx)(o.S.HelpText,{children:i}):null,d?(0,n.jsx)(o.S.Actions,{children:d}):null,l?(0,n.jsx)(o.S.Watermark,{}):null]}):null,a?(0,n.jsx)(o.S.FooterText,{children:a}):null]})}},99539:function(e,r,i){i.d(r,{N:function(){return o}});var n=i(89418),t=i(43803);let o=({size:e,centerIcon:r})=>(0,n.jsx)(a,{$size:e,children:(0,n.jsxs)(l,{children:[(0,n.jsx)(c,{}),(0,n.jsx)(d,{}),r?(0,n.jsx)(s,{children:r}):null]})}),a=t.zo.div`
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
`}}]);