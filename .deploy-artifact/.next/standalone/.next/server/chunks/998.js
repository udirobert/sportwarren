"use strict";exports.id=998,exports.ids=[998],exports.modules={22324:(e,r,i)=>{i.d(r,{Z:()=>t});let t=(0,i(5670).Z)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},94749:(e,r,i)=>{i.d(r,{Z:()=>t});let t=(0,i(5670).Z)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},70998:(e,r,i)=>{i.r(r),i.d(r,{CaptchaScreen:()=>u,CaptchaScreenView:()=>d,default:()=>u});var t=i(4913),a=i(22324),n=i(94749),o=i(26510),s=i(45592),l=i(55182),c=i(77681);i(36577),i(50470),i(46898),i(42330),i(84440);let d=({status:e,title:r,description:i,userIntentRequired:s,retriesRemaining:l,hasSelectedCta:d,onContinue:u,onRetry:p})=>{let g=(0,o.useMemo)(()=>{switch(e){case"loading":default:return;case"success":return s?{label:d?"Continuing...":"Continue",onClick:u,disabled:d,loading:d}:void 0;case"error":return l>0?{label:"Retry",onClick:p}:void 0}},[e,d,u,p]),h=(0,o.useMemo)(()=>({loading:"loading",ready:"subtle",disabled:"subtle",success:"success",error:"error"})[e]||"loading",[e]);return(0,t.jsx)(c.S,{icon:"loading"===e||"ready"===e?void 0:"success"===e?a.Z:n.Z,iconVariant:h,title:r,subtitle:i,primaryCta:g,watermark:!0})},u={component:()=>{let{lastScreen:e,data:r,navigate:i,setModalData:a}=(0,l.a)(),{status:n,token:c,waitForResult:u,reset:p,execute:g}=(0,s.a)(),h=(0,o.useRef)([]),v=e=>{h.current=[e,...h.current]},[x,f]=(0,o.useState)(!0);(0,o.useEffect)(()=>(v(setTimeout(f,1e3,!1)),()=>{h.current.forEach(e=>clearTimeout(e)),h.current=[]}),[]);let[m,y]=(0,o.useState)(""),[b,j]=(0,o.useState)("Checking that you are a human..."),[w,k]=(0,o.useState)(!1),[z,S]=(0,o.useState)(3),C=r?.captchaModalData,E=async r=>{try{await C?.callback(r),C?.onSuccessNavigateTo&&i(C?.onSuccessNavigateTo,!1)}catch(r){if(r instanceof s.C)return;a({errorModalData:{error:r,previousScreen:e||"LandingScreen"}}),i(C?.onErrorNavigateTo||"ErrorScreen",!1)}};return(0,o.useEffect)(()=>{"success"===n?v(setTimeout(async()=>{let e=await u();!e||C?.userIntentRequired||E(e)},1e3)):"ready"===n&&v(setTimeout(()=>{"ready"===n&&g()},500))},[n]),(0,o.useEffect)(()=>{if(!x)switch(n){case"success":y("Success!"),j("CAPTCHA passed successfully."),C?.userIntentRequired||setTimeout(()=>{k(!0),E(c)},2e3);break;case"loading":y(""),j("Checking that you are a human...");break;case"error":y("Something went wrong"),j(z<=0?"If you use an adblocker or VPN, try disabling and re-attempting.":"You did not pass CAPTCHA. Please try again.")}},[n,x,w]),(0,t.jsx)(d,{status:n,title:m,description:b,userIntentRequired:C?.userIntentRequired,retriesRemaining:z,hasSelectedCta:w,onContinue:()=>{k(!0),E(c)},onRetry:async()=>{if(z<=0)return;S(e=>e-1),p(),g();let e=await u();!e||C?.userIntentRequired||E(e)}})}}},17846:(e,r,i)=>{i.d(r,{S:()=>w});var t=i(4913),a=i(26510),n=i(96419),o=i(13813),s=i(38102),l=i(90684);let c=n.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=n.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,n.zo)(s.M)`
  margin: 0 -8px;
`,g=n.zo.div`
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
`,h=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=n.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,x=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=n.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=n.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,y=n.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=n.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,j=n.zo.div`
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
`,w=({children:e,...r})=>(0,t.jsx)(c,{children:(0,t.jsx)(d,{...r,children:e})}),k=n.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,z=(0,n.zo)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,S=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,t.jsx)(k,{children:(0,t.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;w.Header=({title:e,subtitle:r,icon:i,iconVariant:a,iconLoadingStatus:n,showBack:o,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:g,step:h,headerTitle:y,...b})=>(0,t.jsxs)(u,{...b,children:[(0,t.jsx)(p,{backFn:o?s:void 0,infoFn:l?c:void 0,onClose:d?g:void 0,title:y,closeable:d}),(i||a||e||r)&&(0,t.jsxs)(v,{children:[i||a?(0,t.jsx)(w.Icon,{icon:i,variant:a,loadingStatus:n}):null,!(!e&&!r)&&(0,t.jsxs)(x,{children:[e&&(0,t.jsx)(f,{children:e}),r&&(0,t.jsx)(m,{children:r})]})]}),h&&(0,t.jsx)(C,{step:h})]}),(w.Body=a.forwardRef(({children:e,...r},i)=>(0,t.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",w.Footer=({children:e,...r})=>(0,t.jsx)(h,{id:"privy-content-footer-container",...r,children:e}),w.Actions=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),w.HelpText=({children:e,...r})=>(0,t.jsx)(T,{...r,children:e}),w.FooterText=({children:e,...r})=>(0,t.jsx)(R,{...r,children:e}),w.Watermark=()=>(0,t.jsx)(z,{}),w.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(b,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===r?e?(0,t.jsx)(j,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(o.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(y,{$variant:r,children:(0,t.jsx)(l.N,{size:"64px"})}):(0,t.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,T=n.zo.div`
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
`,R=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>o});var t=i(4913),a=i(38102),n=i(17846);let o=({primaryCta:e,secondaryCta:r,helpText:i,footerText:o,watermark:s=!0,children:l,...c})=>{let d=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,n=i.variant||"primary";return(0,t.jsx)(a.a,{...i,variant:n,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,n=i.variant||"secondary";return(0,t.jsx)(a.a,{...i,variant:n,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,t.jsx)(n.S.Header,{...c}),l?(0,t.jsx)(n.S.Body,{children:l}):null,i||d||s?(0,t.jsxs)(n.S.Footer,{children:[i?(0,t.jsx)(n.S.HelpText,{children:i}):null,d?(0,t.jsx)(n.S.Actions,{children:d}):null,s?(0,t.jsx)(n.S.Watermark,{}):null]}):null,o?(0,t.jsx)(n.S.FooterText,{children:o}):null]})}},90684:(e,r,i)=>{i.d(r,{N:()=>n});var t=i(4913),a=i(96419);let n=({size:e,centerIcon:r})=>(0,t.jsx)(o,{$size:e,children:(0,t.jsxs)(s,{children:[(0,t.jsx)(c,{}),(0,t.jsx)(d,{}),r?(0,t.jsx)(l,{children:r}):null]})}),o=a.zo.div`
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
`}};