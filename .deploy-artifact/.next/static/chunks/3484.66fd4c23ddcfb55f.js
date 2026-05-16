"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3484],{23484:function(e,r,t){t.r(r),t.d(r,{CrossAppAuthScreen:function(){return h},CrossAppAuthScreenView:function(){return u},default:function(){return h}});var i=t(89418),n=t(4753),o=t(64982),a=t(5430),s=t(3010),l=t(9201),c=t(61318),d=t(74531),p=t(35868);t(96257),t(78439),t(55982),t(94936),t(21628);let u=({providerApp:e,success:r,error:t,onClose:o})=>{let{title:a,subtitle:s}=(0,n.useMemo)(()=>r?{title:`Successfully connected with ${e.name}`,subtitle:"You're good to go!"}:t?{title:"Authentication failed",subtitle:t.message}:{title:`Connecting to ${e.name}`,subtitle:`Please check the pop-up from ${e.name} to continue`},[r,t,e.name]);return(0,i.jsx)(p.S,{title:a,subtitle:s,icon:e.logoUrl,iconVariant:"loading",iconLoadingStatus:{success:r,fail:!!t},onBack:o,watermark:!0})},h={component:()=>{let e=(0,o.u)(),{data:r,navigate:t,setModalData:p,onUserCloseViaDialogOrKeybindRef:h}=(0,l.a)(),{crossAppAuthFlow:g,updateWallets:v,closePrivyModal:f,createAnalyticsEvent:x}=(0,s.u)(),{logout:m}=(0,c.q)(),[b,y]=(0,n.useState)({}),w=r?.crossAppAuth,j=new s.b(`There was an issue connecting your ${w?.name} account. Please try again.`),z=new a.R(async e=>{if(w?.popup)try{let r=await g({appId:e,popup:w.popup,action:w.action,disableSignup:w.disableSignup});y({data:r})}catch(e){if(e instanceof s.b)y({error:e});else if(e instanceof s.e){if(e.privyErrorCode===s.c.ACCOUNT_TRANSFER_REQUIRED&&e.data?.data?.nonce)return p({accountTransfer:{nonce:e.data?.data?.nonce,account:e.data?.data?.subject,displayName:e.data?.data?.account?.displayName,linkMethod:`privy:${w.appId}`,embeddedWalletAddress:e.data?.data?.otherUser?.embeddedWalletAddress,oAuthUserInfo:e.data?.data?.otherUser?.oAuthUserInfo}}),void t("LinkConflictScreen");w.popup&&w.popup.close(),y({error:j})}else y({error:j})}else y({error:j})}),k=()=>{b.data&&(v(),w?.onSuccess(b.data),f({shouldCallAuthOnSuccess:!0,isSuccess:!0})),w?.onError(b.error??new s.b("User canceled flow")),f({shouldCallAuthOnSuccess:!1,isSuccess:!1})};return h.current=k,(0,n.useEffect)(()=>{w?.appId?.length&&z.execute(w.appId)},[w?.appId]),(0,n.useEffect)(()=>{if(!b.data)return;let r=b.data;if(e.legal.requireUsersAcceptTerms&&!r.hasAcceptedTerms){let e=setTimeout(()=>{t("AffirmativeConsentScreen")},o.q);return()=>clearTimeout(e)}if((0,d.s)(r,e.embeddedWallets)){let e=setTimeout(()=>{p({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),x({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,provider:`privy:${w?.appId}`,screen:"CrossAppAuthScreen"}}),m()},callAuthOnSuccessOnClose:!0}}),t("EmbeddedWalletOnAccountCreateScreen")},o.q);return()=>clearTimeout(e)}let i=setTimeout(k,o.q);return()=>clearTimeout(i)},[b.data]),w?.appId?(0,i.jsx)(u,{providerApp:{id:w?.appId,logoUrl:w?.logoUrl,name:w?.name},success:!!b.data,error:b.error,onClose:k}):(console.warn("Missing data for Screen"),null)},isShownBeforeReady:!0}},18532:function(e,r,t){t.d(r,{S:function(){return j}});var i=t(89418),n=t(4753),o=t(43803),a=t(61318),s=t(13188),l=t(99539);let c=o.zo.div`
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
`,u=(0,o.zo)(s.M)`
  margin: 0 -8px;
`,h=o.zo.div`
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
`,g=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=o.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,f=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,x=o.zo.h3`
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
`,b=o.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,y=o.zo.div`
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
`,j=({children:e,...r})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...r,children:e})}),z=o.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,o.zo)(s.B)`
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
`,A=({step:e})=>e?(0,i.jsx)(z,{children:(0,i.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:t,iconVariant:n,iconLoadingStatus:o,showBack:a,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:h,step:g,headerTitle:b,...y})=>(0,i.jsxs)(p,{...y,children:[(0,i.jsx)(u,{backFn:a?s:void 0,infoFn:l?c:void 0,onClose:d?h:void 0,title:b,closeable:d}),(t||n||e||r)&&(0,i.jsxs)(v,{children:[t||n?(0,i.jsx)(j.Icon,{icon:t,variant:n,loadingStatus:o}):null,!(!e&&!r)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(x,{children:e}),r&&(0,i.jsx)(m,{children:r})]})]}),g&&(0,i.jsx)(A,{step:g})]}),(j.Body=n.forwardRef(({children:e,...r},t)=>(0,i.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,i.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,i.jsx)(T,{...r,children:e}),j.Watermark=()=>(0,i.jsx)(k,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(y,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(a.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(b,{$variant:r,children:(0,i.jsx)(l.N,{size:"64px"})}):(0,i.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let C=o.zo.div`
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
`,T=o.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,r,t){t.d(r,{S:function(){return a}});var i=t(89418),n=t(13188),o=t(18532);let a=({primaryCta:e,secondaryCta:r,helpText:t,footerText:a,watermark:s=!0,children:l,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,o=t.variant||"primary";return(0,i.jsx)(n.a,{...t,variant:o,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,o=t.variant||"secondary";return(0,i.jsx)(n.a,{...t,variant:o,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(o.S,{id:c.id,className:c.className,children:[(0,i.jsx)(o.S.Header,{...c}),l?(0,i.jsx)(o.S.Body,{children:l}):null,t||d||s?(0,i.jsxs)(o.S.Footer,{children:[t?(0,i.jsx)(o.S.HelpText,{children:t}):null,d?(0,i.jsx)(o.S.Actions,{children:d}):null,s?(0,i.jsx)(o.S.Watermark,{}):null]}):null,a?(0,i.jsx)(o.S.FooterText,{children:a}):null]})}},99539:function(e,r,t){t.d(r,{N:function(){return o}});var i=t(89418),n=t(43803);let o=({size:e,centerIcon:r})=>(0,i.jsx)(a,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(l,{children:r}):null]})}),a=n.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=n.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=n.zo.div`
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
`},74531:function(e,r,t){t.d(r,{s:function(){return n}});var i=t(5430);let n=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.k)(e,r.solana.createOnLogin)}}]);