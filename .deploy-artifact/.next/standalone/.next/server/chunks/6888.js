"use strict";exports.id=6888,exports.ids=[6888],exports.modules={64388:(e,r,i)=>{i.d(r,{Z:()=>o});let o=(0,i(5670).Z)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]])},46888:(e,r,i)=>{i.r(r),i.d(r,{InAppBrowserLoginNotPossible:()=>s,InAppBrowserLoginNotPossibleView:()=>l,default:()=>s});var o=i(4913),n=i(64388),t=i(49171),a=i(77681);i(26510),i(50470),i(36577),i(46898);let l=({onClose:e})=>(0,o.jsx)(a.S,{title:"Could not log in with provider",subtitle:"It looks like you're using an in-app browser. To log in, please try again using an external browser.",icon:n.Z,primaryCta:{label:"Close",onClick:e},watermark:!0}),s={component:()=>{let{closePrivyModal:e}=(0,t.u)();return(0,o.jsx)(l,{onClose:()=>e()})}}},17846:(e,r,i)=>{i.d(r,{S:()=>w});var o=i(4913),n=i(26510),t=i(96419),a=i(13813),l=i(38102),s=i(90684);let c=t.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=t.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,t.zo)(l.M)`
  margin: 0 -8px;
`,g=t.zo.div`
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
`,v=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,x=t.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,u=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=t.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=t.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,b=t.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,y=t.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,j=t.zo.div`
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
`,w=({children:e,...r})=>(0,o.jsx)(c,{children:(0,o.jsx)(d,{...r,children:e})}),z=t.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,t.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,S=t.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,o.jsx)(z,{children:(0,o.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;w.Header=({title:e,subtitle:r,icon:i,iconVariant:n,iconLoadingStatus:t,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:g,step:v,headerTitle:b,...y})=>(0,o.jsxs)(p,{...y,children:[(0,o.jsx)(h,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?g:void 0,title:b,closeable:d}),(i||n||e||r)&&(0,o.jsxs)(x,{children:[i||n?(0,o.jsx)(w.Icon,{icon:i,variant:n,loadingStatus:t}):null,!(!e&&!r)&&(0,o.jsxs)(u,{children:[e&&(0,o.jsx)(f,{children:e}),r&&(0,o.jsx)(m,{children:r})]})]}),v&&(0,o.jsx)(C,{step:v})]}),(w.Body=n.forwardRef(({children:e,...r},i)=>(0,o.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",w.Footer=({children:e,...r})=>(0,o.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),w.Actions=({children:e,...r})=>(0,o.jsx)(E,{...r,children:e}),w.HelpText=({children:e,...r})=>(0,o.jsx)(F,{...r,children:e}),w.FooterText=({children:e,...r})=>(0,o.jsx)($,{...r,children:e}),w.Watermark=()=>(0,o.jsx)(k,{}),w.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,o.jsx)(y,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,o.jsx)(j,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(b,{$variant:r,children:(0,o.jsx)(s.N,{size:"64px"})}):(0,o.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=t.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,F=t.zo.div`
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
`,$=t.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>a});var o=i(4913),n=i(38102),t=i(17846);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,t=i.variant||"primary";return(0,o.jsx)(n.a,{...i,variant:t,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,t=i.variant||"secondary";return(0,o.jsx)(n.a,{...i,variant:t,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,o.jsxs)(t.S,{id:c.id,className:c.className,children:[(0,o.jsx)(t.S.Header,{...c}),s?(0,o.jsx)(t.S.Body,{children:s}):null,i||d||l?(0,o.jsxs)(t.S.Footer,{children:[i?(0,o.jsx)(t.S.HelpText,{children:i}):null,d?(0,o.jsx)(t.S.Actions,{children:d}):null,l?(0,o.jsx)(t.S.Watermark,{}):null]}):null,a?(0,o.jsx)(t.S.FooterText,{children:a}):null]})}},90684:(e,r,i)=>{i.d(r,{N:()=>t});var o=i(4913),n=i(96419);let t=({size:e,centerIcon:r})=>(0,o.jsx)(a,{$size:e,children:(0,o.jsxs)(l,{children:[(0,o.jsx)(c,{}),(0,o.jsx)(d,{}),r?(0,o.jsx)(s,{children:r}):null]})}),a=n.zo.div`
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
`,c=n.zo.div`
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
`,d=n.zo.div`
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