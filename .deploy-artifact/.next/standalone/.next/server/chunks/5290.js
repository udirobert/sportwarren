"use strict";exports.id=5290,exports.ids=[5290],exports.modules={94749:(e,r,i)=>{i.d(r,{Z:()=>n});let n=(0,i(5670).Z)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},25290:(e,r,i)=>{i.r(r),i.d(r,{LoginFailedScreen:()=>c,LoginFailedScreenView:()=>s,default:()=>c});var n=i(4913),t=i(94749),a=i(49171),o=i(55182),l=i(77681);i(26510),i(50470),i(36577),i(46898);let s=({title:e="Could not connect with wallet",subtitle:r="Please check that Phantom multichain is enabled and try again.",primaryCtaText:i="Try again",secondaryCtaText:a="Cancel",onTryAgain:o,onCancel:s})=>(0,n.jsx)(l.S,{title:e,subtitle:r,icon:t.Z,iconVariant:"error",primaryCta:{label:i,onClick:o},secondaryCta:{label:a,onClick:s},watermark:!0}),c={component:()=>{let{closePrivyModal:e}=(0,a.u)(),{navigate:r}=(0,o.a)();return(0,n.jsx)(s,{onTryAgain:()=>{r("LandingScreen")},onCancel:async()=>{await e()}})}}},17846:(e,r,i)=>{i.d(r,{S:()=>w});var n=i(4913),t=i(26510),a=i(96419),o=i(13813),l=i(38102),s=i(90684);let c=a.zo.div`
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
`,p=a.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,a.zo)(l.M)`
  margin: 0 -8px;
`,g=a.zo.div`
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
`,x=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=a.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,u=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,m=a.zo.h3`
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
`,f=a.zo.div`
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
`,j=a.zo.div`
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
`,w=({children:e,...r})=>(0,n.jsx)(c,{children:(0,n.jsx)(d,{...r,children:e})}),z=a.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,a.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,S=a.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,n.jsx)(z,{children:(0,n.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;w.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:a,showBack:o,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:g,step:x,headerTitle:f,...b})=>(0,n.jsxs)(p,{...b,children:[(0,n.jsx)(h,{backFn:o?l:void 0,infoFn:s?c:void 0,onClose:d?g:void 0,title:f,closeable:d}),(i||t||e||r)&&(0,n.jsxs)(v,{children:[i||t?(0,n.jsx)(w.Icon,{icon:i,variant:t,loadingStatus:a}):null,!(!e&&!r)&&(0,n.jsxs)(u,{children:[e&&(0,n.jsx)(m,{children:e}),r&&(0,n.jsx)(y,{children:r})]})]}),x&&(0,n.jsx)(C,{step:x})]}),(w.Body=t.forwardRef(({children:e,...r},i)=>(0,n.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",w.Footer=({children:e,...r})=>(0,n.jsx)(x,{id:"privy-content-footer-container",...r,children:e}),w.Actions=({children:e,...r})=>(0,n.jsx)(E,{...r,children:e}),w.HelpText=({children:e,...r})=>(0,n.jsx)(F,{...r,children:e}),w.FooterText=({children:e,...r})=>(0,n.jsx)(T,{...r,children:e}),w.Watermark=()=>(0,n.jsx)(k,{}),w.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,n.jsx)(b,"string"==typeof e?{children:(0,n.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,n.jsx)(j,{children:(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,n.jsx)(o.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,n.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,n.jsx)(f,{$variant:r,children:(0,n.jsx)(s.N,{size:"64px"})}):(0,n.jsx)(f,{$variant:r,children:e&&("string"==typeof e?(0,n.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=a.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,F=a.zo.div`
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
`,T=a.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>o});var n=i(4913),t=i(38102),a=i(17846);let o=({primaryCta:e,secondaryCta:r,helpText:i,footerText:o,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,n.jsxs)(n.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,a=i.variant||"primary";return(0,n.jsx)(t.a,{...i,variant:a,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,a=i.variant||"secondary";return(0,n.jsx)(t.a,{...i,variant:a,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,n.jsxs)(a.S,{id:c.id,className:c.className,children:[(0,n.jsx)(a.S.Header,{...c}),s?(0,n.jsx)(a.S.Body,{children:s}):null,i||d||l?(0,n.jsxs)(a.S.Footer,{children:[i?(0,n.jsx)(a.S.HelpText,{children:i}):null,d?(0,n.jsx)(a.S.Actions,{children:d}):null,l?(0,n.jsx)(a.S.Watermark,{}):null]}):null,o?(0,n.jsx)(a.S.FooterText,{children:o}):null]})}},90684:(e,r,i)=>{i.d(r,{N:()=>a});var n=i(4913),t=i(96419);let a=({size:e,centerIcon:r})=>(0,n.jsx)(o,{$size:e,children:(0,n.jsxs)(l,{children:[(0,n.jsx)(c,{}),(0,n.jsx)(d,{}),r?(0,n.jsx)(s,{children:r}):null]})}),o=t.zo.div`
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
`}};