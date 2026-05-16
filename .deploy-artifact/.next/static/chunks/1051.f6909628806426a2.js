"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1051],{12859:function(e,r,t){t.d(r,{Z:function(){return i}});let i=(0,t(79095).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},68610:function(e,r,t){t.d(r,{Z:function(){return i}});let i=(0,t(79095).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},30897:function(e,r,t){var i=t(4753);let n=i.forwardRef(function(e,r){let{title:t,titleId:n,...o}=e;return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":n},o),t?i.createElement("title",{id:n},t):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))});r.Z=n},22073:function(e,r,t){t.d(r,{A:function(){return c}});var i=t(89418),n=t(12859),o=t(68610),a=t(4753),l=t(43803),s=t(40099),d=t(13188);let c=({address:e,showCopyIcon:r,url:t,className:l})=>{let[c,g]=(0,a.useState)(!1);function x(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>g(!0)).catch(console.error)}return(0,a.useEffect)(()=>{if(c){let e=setTimeout(()=>g(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,i.jsxs)(p,t?{children:[(0,i.jsx)(u,{title:e,className:l,href:`${t}/address/${e}`,target:"_blank",children:(0,s.w)(e)}),r&&(0,i.jsx)(d.S,{onClick:x,size:"sm",style:{gap:"0.375rem"},children:(0,i.jsxs)(i.Fragment,c?{children:["Copied",(0,i.jsx)(n.Z,{size:16})]}:{children:["Copy",(0,i.jsx)(o.Z,{size:16})]})})]}:{children:[(0,i.jsx)(h,{title:e,className:l,children:(0,s.w)(e)}),r&&(0,i.jsx)(d.S,{onClick:x,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,i.jsxs)(i.Fragment,c?{children:["Copied",(0,i.jsx)(n.Z,{size:14})]}:{children:["Copy",(0,i.jsx)(o.Z,{size:14})]})})]})},p=l.zo.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,h=l.zo.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,u=l.zo.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`},41051:function(e,r,t){t.r(r),t.d(r,{EmbeddedWalletKeyExportScreen:function(){return v},EmbeddedWalletKeyExportView:function(){return u},constructWalletExportIframeUrl:function(){return y},default:function(){return v},supportsSeedPhraseExport:function(){return x}});var i=t(89418),n=t(4753),o=t(43803),a=t(52359),l=t(7520),s=t(90116),d=t(64982),c=t(3010),p=t(9201),h=t(35868);t(78439),t(55982),t(96257);let u=({address:e,hideWalletAddress:r,accessToken:t,appConfigTheme:n,onClose:o,exportButtonProps:a,onBack:d})=>(0,i.jsx)(h.S,{title:"Export wallet",subtitle:(0,i.jsxs)(i.Fragment,{children:["Copy either your private key or seed phrase to export your wallet."," ",(0,i.jsx)("a",{href:"https://privy-io.notion.site/Transferring-your-account-9dab9e16c6034a7ab1ff7fa479b02828",target:"blank",rel:"noopener noreferrer",children:"Learn more"})]}),onClose:o,onBack:d,showBack:!!d,watermark:!0,children:(0,i.jsxs)(g,{children:[(0,i.jsx)(l.W,{theme:n,children:"Never share your private key or seed phrase with anyone."}),!r&&(0,i.jsx)(s.W,{title:"Your wallet",address:e,showCopyButton:!0}),(0,i.jsx)("div",{style:{width:"100%"},children:t&&a&&(0,i.jsx)(f,{accessToken:t,dimensions:{height:"44px"},...a})})]})}),g=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
`;function x({chainType:e,imported:r,isUnifiedWallet:t}){return!r&&(t?"ethereum"===e||"bitcoin-taproot"===e:"ethereum"===e)}function f(e){let[r,t]=(0,n.useState)(e.dimensions.width),[o,a]=(0,n.useState)(!1),[l,s]=(0,n.useState)(void 0),d=(0,n.useRef)(null);(0,n.useEffect)(()=>{if(d.current&&void 0===r){let{width:e}=d.current.getBoundingClientRect();t(e)}let e=getComputedStyle(document.documentElement);s({background:e.getPropertyValue("--privy-color-background"),background2:e.getPropertyValue("--privy-color-background-2"),foreground3:e.getPropertyValue("--privy-color-foreground-3"),foregroundAccent:e.getPropertyValue("--privy-color-foreground-accent"),accent:e.getPropertyValue("--privy-color-accent"),accentDark:e.getPropertyValue("--privy-color-accent-dark"),success:e.getPropertyValue("--privy-color-success"),colorScheme:e.getPropertyValue("color-scheme")})},[]);let c=x({chainType:e.chainType,imported:e.imported,isUnifiedWallet:e.isUnifiedWallet});return(0,i.jsx)("div",{ref:d,children:r&&(0,i.jsxs)(m,{children:[(0,i.jsx)("iframe",{style:{position:"absolute",zIndex:1,opacity:o?1:0,transition:"opacity 50ms ease-in-out",pointerEvents:o?"auto":"none"},onLoad:()=>setTimeout(()=>a(!0),1500),width:r,height:e.dimensions.height,allow:"clipboard-write self *",src:y({origin:e.origin,appId:e.appId,appClientId:e.appClientId,walletId:e.walletId,entropyId:e.entropyId,entropyIdVerifier:e.entropyIdVerifier,hdWalletIndex:e.hdWalletIndex,chainType:e.chainType,accessToken:e.accessToken,clientAnalyticsId:e.clientAnalyticsId,width:r,palette:l,isUnifiedWallet:e.isUnifiedWallet,exportSeedPhrase:c})}),(0,i.jsx)(b,{children:"Loading..."}),c&&(0,i.jsx)(b,{children:"Loading..."})]})})}let v={component:()=>{let[e,r]=(0,n.useState)(null),{authenticated:t,user:o}=(0,p.u)(),{closePrivyModal:a,createAnalyticsEvent:l,clientAnalyticsId:s,client:h}=(0,c.u)(),g=(0,d.u)(),{data:x,onUserCloseViaDialogOrKeybindRef:f}=(0,p.a)(),{onFailure:v,onSuccess:y,origin:m,appId:b,appClientId:w,entropyId:j,entropyIdVerifier:z,walletId:k,hdWalletIndex:I,chainType:C,address:S,uiOptions:E,isUnifiedWallet:T,imported:W,showBackButton:$}=x.keyExport,A=e=>{a({shouldCallAuthOnSuccess:!1}),v("string"==typeof e?Error(e):e)},B=()=>{a({shouldCallAuthOnSuccess:!1}),y(),l({eventName:"embedded_wallet_key_export_completed",payload:{walletAddress:S}})};return(0,n.useEffect)(()=>{if(!t)return A("User must be authenticated before exporting their wallet");h.getAccessToken().then(r).catch(A)},[t,o]),f.current=B,(0,i.jsx)(u,{address:S,hideWalletAddress:E?.hideWalletAddress,accessToken:e,appConfigTheme:g.appearance.palette.colorScheme,onClose:B,isLoading:!e,onBack:$?B:void 0,exportButtonProps:e?{origin:m,appId:b,appClientId:w,clientAnalyticsId:s,entropyId:j,entropyIdVerifier:z,walletId:k,hdWalletIndex:I,isUnifiedWallet:T,imported:W,chainType:C}:void 0})}};function y({origin:e,appId:r,appClientId:t,walletId:i,entropyId:n,entropyIdVerifier:o,hdWalletIndex:l,chainType:s,accessToken:d,clientAnalyticsId:c,width:p,palette:h,isUnifiedWallet:u,exportSeedPhrase:g}){return(0,a.v)({origin:e,path:`/apps/${r}/embedded-wallets/export`,query:u?{v:"1-unified",wallet_id:i,client_id:t,width:`${p}px`,caid:c,phrase_export:g,...h}:{v:"1",entropy_id:n,entropy_id_verifier:o,hd_wallet_index:l,chain_type:s,client_id:t,width:`${p}px`,caid:c,phrase_export:g,...h},hash:{token:d}})}let m=o.zo.div`
  overflow: visible;
  position: relative;
  overflow: none;
  height: 44px;
  display: flex;
  gap: 12px;
`,b=o.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
  border-radius: var(--privy-border-radius-md);
  background-color: var(--privy-color-background-2);
  color: var(--privy-color-foreground-3);
`},41815:function(e,r,t){t.d(r,{E:function(){return n}});var i=t(43803);let n=i.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},24974:function(e,r,t){t.d(r,{L:function(){return n}});var i=t(43803);let n=i.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},18532:function(e,r,t){t.d(r,{S:function(){return j}});var i=t(89418),n=t(4753),o=t(43803),a=t(61318),l=t(13188),s=t(99539);let d=o.zo.div`
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
`,h=(0,o.zo)(l.M)`
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
`,g=o.zo.div`
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
`,f=o.zo.div`
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
`,y=o.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,m=o.zo.div`
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
`,j=({children:e,...r})=>(0,i.jsx)(d,{children:(0,i.jsx)(c,{...r,children:e})}),z=o.zo.div`
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
`,I=o.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,i.jsx)(z,{children:(0,i.jsx)(I,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:t,iconVariant:n,iconLoadingStatus:o,showBack:a,onBack:l,showInfo:s,onInfo:d,showClose:c,onClose:u,step:g,headerTitle:m,...b})=>(0,i.jsxs)(p,{...b,children:[(0,i.jsx)(h,{backFn:a?l:void 0,infoFn:s?d:void 0,onClose:c?u:void 0,title:m,closeable:c}),(t||n||e||r)&&(0,i.jsxs)(x,{children:[t||n?(0,i.jsx)(j.Icon,{icon:t,variant:n,loadingStatus:o}):null,!(!e&&!r)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(v,{children:e}),r&&(0,i.jsx)(y,{children:r})]})]}),g&&(0,i.jsx)(C,{step:g})]}),(j.Body=n.forwardRef(({children:e,...r},t)=>(0,i.jsx)(u,{ref:t,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,i.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,i.jsx)(S,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,i.jsx)(T,{...r,children:e}),j.Watermark=()=>(0,i.jsx)(k,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(a.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(m,{$variant:r,children:(0,i.jsx)(s.N,{size:"64px"})}):(0,i.jsx)(m,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let S=o.zo.div`
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
`},35868:function(e,r,t){t.d(r,{S:function(){return a}});var i=t(89418),n=t(13188),o=t(18532);let a=({primaryCta:e,secondaryCta:r,helpText:t,footerText:a,watermark:l=!0,children:s,...d})=>{let c=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,o=t.variant||"primary";return(0,i.jsx)(n.a,{...t,variant:o,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,o=t.variant||"secondary";return(0,i.jsx)(n.a,{...t,variant:o,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(o.S,{id:d.id,className:d.className,children:[(0,i.jsx)(o.S.Header,{...d}),s?(0,i.jsx)(o.S.Body,{children:s}):null,t||c||l?(0,i.jsxs)(o.S.Footer,{children:[t?(0,i.jsx)(o.S.HelpText,{children:t}):null,c?(0,i.jsx)(o.S.Actions,{children:c}):null,l?(0,i.jsx)(o.S.Watermark,{}):null]}):null,a?(0,i.jsx)(o.S.FooterText,{children:a}):null]})}},90116:function(e,r,t){t.d(r,{W:function(){return b}});var i=t(89418),n=t(12859),o=t(68610),a=t(4753),l=t(43803),s=t(13188),d=t(41815),c=t(24974),p=t(22073),h=t(78236);let u=(0,l.zo)(h.B)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,g=l.zo.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,x=l.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,f=l.zo.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,v=(0,l.zo)(c.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,y=(0,l.zo)(d.E)`
  margin-top: 0.25rem;
`,m=(0,l.zo)(s.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,b=({errMsg:e,balance:r,address:t,className:l,title:s,showCopyButton:d=!1})=>{let[c,h]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{if(c){let e=setTimeout(()=>h(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,i.jsxs)("div",{children:[s&&(0,i.jsx)(v,{children:s}),(0,i.jsx)(u,{className:l,$state:e?"error":void 0,children:(0,i.jsxs)(g,{children:[(0,i.jsxs)(x,{children:[(0,i.jsx)(p.A,{address:t,showCopyIcon:!1}),void 0!==r&&(0,i.jsx)(f,{children:r})]}),d&&(0,i.jsx)(m,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(t).then(()=>h(!0)).catch(console.error)},size:"sm",children:(0,i.jsxs)(i.Fragment,c?{children:["Copied",(0,i.jsx)(n.Z,{size:14})]}:{children:["Copy",(0,i.jsx)(o.Z,{size:14})]})})]})}),e&&(0,i.jsx)(y,{children:e})]})}},7520:function(e,r,t){t.d(r,{W:function(){return a}});var i=t(89418),n=t(30897),o=t(43803);let a=({children:e,theme:r,className:t})=>(0,i.jsxs)(l,{$theme:r,className:t,children:[(0,i.jsx)(n.Z,{width:"20px",height:"20px",color:"var(--privy-color-icon-warning)",strokeWidth:2,style:{flexShrink:0}}),(0,i.jsx)(s,{$theme:r,children:e})]}),l=o.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-warn-bg);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,s=o.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  flex: 1;
  text-align: left;
`},99539:function(e,r,t){t.d(r,{N:function(){return o}});var i=t(89418),n=t(43803);let o=({size:e,centerIcon:r})=>(0,i.jsx)(a,{$size:e,children:(0,i.jsxs)(l,{children:[(0,i.jsx)(d,{}),(0,i.jsx)(c,{}),r?(0,i.jsx)(s,{children:r}):null]})}),a=n.zo.div`
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
`},78236:function(e,r,t){t.d(r,{B:function(){return o},a:function(){return n}});var i=t(43803);let n=(0,i.iv)`
  && {
    border-width: 1px;
    padding: 0.5rem 1rem;
  }

  width: 100%;
  text-align: left;
  border: solid 1px var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${e=>"error"===e.$state?"\n        border-color: var(--privy-color-error);\n        background: var(--privy-color-error-bg);\n      ":""}
`,o=i.zo.div`
  ${n}
`}}]);