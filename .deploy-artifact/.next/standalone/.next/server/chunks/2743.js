"use strict";exports.id=2743,exports.ids=[2743],exports.modules={32354:(e,r,i)=>{i.d(r,{Z:()=>t});let t=(0,i(5670).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},60840:(e,r,i)=>{i.d(r,{Z:()=>t});let t=(0,i(5670).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},22277:(e,r,i)=>{i.d(r,{Z:()=>o});var t=i(26510);let o=t.forwardRef(function({title:e,titleId:r,...i},o){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":r},i),e?t.createElement("title",{id:r},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))})},62709:(e,r,i)=>{i.d(r,{A:()=>c});var t=i(4913),o=i(32354),n=i(60840),a=i(26510),l=i(96419),s=i(22554),d=i(38102);let c=({address:e,showCopyIcon:r,url:i,className:l})=>{let[c,g]=(0,a.useState)(!1);function x(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>g(!0)).catch(console.error)}return(0,a.useEffect)(()=>{if(c){let e=setTimeout(()=>g(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,t.jsxs)(p,i?{children:[(0,t.jsx)(u,{title:e,className:l,href:`${i}/address/${e}`,target:"_blank",children:(0,s.w)(e)}),r&&(0,t.jsx)(d.S,{onClick:x,size:"sm",style:{gap:"0.375rem"},children:(0,t.jsxs)(t.Fragment,c?{children:["Copied",(0,t.jsx)(o.Z,{size:16})]}:{children:["Copy",(0,t.jsx)(n.Z,{size:16})]})})]}:{children:[(0,t.jsx)(h,{title:e,className:l,children:(0,s.w)(e)}),r&&(0,t.jsx)(d.S,{onClick:x,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,t.jsxs)(t.Fragment,c?{children:["Copied",(0,t.jsx)(o.Z,{size:14})]}:{children:["Copy",(0,t.jsx)(n.Z,{size:14})]})})]})},p=l.zo.span`
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
`},82743:(e,r,i)=>{i.r(r),i.d(r,{EmbeddedWalletKeyExportScreen:()=>f,EmbeddedWalletKeyExportView:()=>u,constructWalletExportIframeUrl:()=>y,default:()=>f,supportsSeedPhraseExport:()=>x});var t=i(4913),o=i(26510),n=i(96419),a=i(15001),l=i(49536),s=i(18034),d=i(14348),c=i(49171),p=i(55182),h=i(77681);i(36577),i(46898),i(50470);let u=({address:e,hideWalletAddress:r,accessToken:i,appConfigTheme:o,onClose:n,exportButtonProps:a,onBack:d})=>(0,t.jsx)(h.S,{title:"Export wallet",subtitle:(0,t.jsxs)(t.Fragment,{children:["Copy either your private key or seed phrase to export your wallet."," ",(0,t.jsx)("a",{href:"https://privy-io.notion.site/Transferring-your-account-9dab9e16c6034a7ab1ff7fa479b02828",target:"blank",rel:"noopener noreferrer",children:"Learn more"})]}),onClose:n,onBack:d,showBack:!!d,watermark:!0,children:(0,t.jsxs)(g,{children:[(0,t.jsx)(l.W,{theme:o,children:"Never share your private key or seed phrase with anyone."}),!r&&(0,t.jsx)(s.W,{title:"Your wallet",address:e,showCopyButton:!0}),(0,t.jsx)("div",{style:{width:"100%"},children:i&&a&&(0,t.jsx)(v,{accessToken:i,dimensions:{height:"44px"},...a})})]})}),g=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
`;function x({chainType:e,imported:r,isUnifiedWallet:i}){return!r&&(i?"ethereum"===e||"bitcoin-taproot"===e:"ethereum"===e)}function v(e){let[r,i]=(0,o.useState)(e.dimensions.width),[n,a]=(0,o.useState)(!1),[l,s]=(0,o.useState)(void 0),d=(0,o.useRef)(null);(0,o.useEffect)(()=>{if(d.current&&void 0===r){let{width:e}=d.current.getBoundingClientRect();i(e)}let e=getComputedStyle(document.documentElement);s({background:e.getPropertyValue("--privy-color-background"),background2:e.getPropertyValue("--privy-color-background-2"),foreground3:e.getPropertyValue("--privy-color-foreground-3"),foregroundAccent:e.getPropertyValue("--privy-color-foreground-accent"),accent:e.getPropertyValue("--privy-color-accent"),accentDark:e.getPropertyValue("--privy-color-accent-dark"),success:e.getPropertyValue("--privy-color-success"),colorScheme:e.getPropertyValue("color-scheme")})},[]);let c=x({chainType:e.chainType,imported:e.imported,isUnifiedWallet:e.isUnifiedWallet});return(0,t.jsx)("div",{ref:d,children:r&&(0,t.jsxs)(m,{children:[(0,t.jsx)("iframe",{style:{position:"absolute",zIndex:1,opacity:n?1:0,transition:"opacity 50ms ease-in-out",pointerEvents:n?"auto":"none"},onLoad:()=>setTimeout(()=>a(!0),1500),width:r,height:e.dimensions.height,allow:"clipboard-write self *",src:y({origin:e.origin,appId:e.appId,appClientId:e.appClientId,walletId:e.walletId,entropyId:e.entropyId,entropyIdVerifier:e.entropyIdVerifier,hdWalletIndex:e.hdWalletIndex,chainType:e.chainType,accessToken:e.accessToken,clientAnalyticsId:e.clientAnalyticsId,width:r,palette:l,isUnifiedWallet:e.isUnifiedWallet,exportSeedPhrase:c})}),(0,t.jsx)(b,{children:"Loading..."}),c&&(0,t.jsx)(b,{children:"Loading..."})]})})}let f={component:()=>{let[e,r]=(0,o.useState)(null),{authenticated:i,user:n}=(0,p.u)(),{closePrivyModal:a,createAnalyticsEvent:l,clientAnalyticsId:s,client:h}=(0,c.u)(),g=(0,d.u)(),{data:x,onUserCloseViaDialogOrKeybindRef:v}=(0,p.a)(),{onFailure:f,onSuccess:y,origin:m,appId:b,appClientId:w,entropyId:j,entropyIdVerifier:z,walletId:k,hdWalletIndex:I,chainType:C,address:S,uiOptions:E,isUnifiedWallet:T,imported:W,showBackButton:$}=x.keyExport,A=e=>{a({shouldCallAuthOnSuccess:!1}),f("string"==typeof e?Error(e):e)},B=()=>{a({shouldCallAuthOnSuccess:!1}),y(),l({eventName:"embedded_wallet_key_export_completed",payload:{walletAddress:S}})};return(0,o.useEffect)(()=>{if(!i)return A("User must be authenticated before exporting their wallet");h.getAccessToken().then(r).catch(A)},[i,n]),v.current=B,(0,t.jsx)(u,{address:S,hideWalletAddress:E?.hideWalletAddress,accessToken:e,appConfigTheme:g.appearance.palette.colorScheme,onClose:B,isLoading:!e,onBack:$?B:void 0,exportButtonProps:e?{origin:m,appId:b,appClientId:w,clientAnalyticsId:s,entropyId:j,entropyIdVerifier:z,walletId:k,hdWalletIndex:I,isUnifiedWallet:T,imported:W,chainType:C}:void 0})}};function y({origin:e,appId:r,appClientId:i,walletId:t,entropyId:o,entropyIdVerifier:n,hdWalletIndex:l,chainType:s,accessToken:d,clientAnalyticsId:c,width:p,palette:h,isUnifiedWallet:u,exportSeedPhrase:g}){return(0,a.v)({origin:e,path:`/apps/${r}/embedded-wallets/export`,query:u?{v:"1-unified",wallet_id:t,client_id:i,width:`${p}px`,caid:c,phrase_export:g,...h}:{v:"1",entropy_id:o,entropy_id_verifier:n,hd_wallet_index:l,chain_type:s,client_id:i,width:`${p}px`,caid:c,phrase_export:g,...h},hash:{token:d}})}let m=n.zo.div`
  overflow: visible;
  position: relative;
  overflow: none;
  height: 44px;
  display: flex;
  gap: 12px;
`,b=n.zo.div`
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
`},73993:(e,r,i)=>{i.d(r,{E:()=>o});var t=i(96419);let o=t.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},59169:(e,r,i)=>{i.d(r,{L:()=>o});var t=i(96419);let o=t.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},17846:(e,r,i)=>{i.d(r,{S:()=>j});var t=i(4913),o=i(26510),n=i(96419),a=i(13813),l=i(38102),s=i(90684);let d=n.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,c=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=n.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,n.zo)(l.M)`
  margin: 0 -8px;
`,u=n.zo.div`
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
`,g=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,x=n.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,v=n.zo.div`
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
`,y=n.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,m=n.zo.div`
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
`,w=n.zo.div`
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
`,j=({children:e,...r})=>(0,t.jsx)(d,{children:(0,t.jsx)(c,{...r,children:e})}),z=n.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,n.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,I=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,t.jsx)(z,{children:(0,t.jsx)(I,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:o,iconLoadingStatus:n,showBack:a,onBack:l,showInfo:s,onInfo:d,showClose:c,onClose:u,step:g,headerTitle:m,...b})=>(0,t.jsxs)(p,{...b,children:[(0,t.jsx)(h,{backFn:a?l:void 0,infoFn:s?d:void 0,onClose:c?u:void 0,title:m,closeable:c}),(i||o||e||r)&&(0,t.jsxs)(x,{children:[i||o?(0,t.jsx)(j.Icon,{icon:i,variant:o,loadingStatus:n}):null,!(!e&&!r)&&(0,t.jsxs)(v,{children:[e&&(0,t.jsx)(f,{children:e}),r&&(0,t.jsx)(y,{children:r})]})]}),g&&(0,t.jsx)(C,{step:g})]}),(j.Body=o.forwardRef(({children:e,...r},i)=>(0,t.jsx)(u,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,t.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,t.jsx)(S,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,t.jsx)(T,{...r,children:e}),j.Watermark=()=>(0,t.jsx)(k,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(b,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,t.jsx)(w,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(m,{$variant:r,children:(0,t.jsx)(s.N,{size:"64px"})}):(0,t.jsx)(m,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let S=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,E=n.zo.div`
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
`,T=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>a});var t=i(4913),o=i(38102),n=i(17846);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...d})=>{let c=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,n=i.variant||"primary";return(0,t.jsx)(o.a,{...i,variant:n,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,n=i.variant||"secondary";return(0,t.jsx)(o.a,{...i,variant:n,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(n.S,{id:d.id,className:d.className,children:[(0,t.jsx)(n.S.Header,{...d}),s?(0,t.jsx)(n.S.Body,{children:s}):null,i||c||l?(0,t.jsxs)(n.S.Footer,{children:[i?(0,t.jsx)(n.S.HelpText,{children:i}):null,c?(0,t.jsx)(n.S.Actions,{children:c}):null,l?(0,t.jsx)(n.S.Watermark,{}):null]}):null,a?(0,t.jsx)(n.S.FooterText,{children:a}):null]})}},18034:(e,r,i)=>{i.d(r,{W:()=>b});var t=i(4913),o=i(32354),n=i(60840),a=i(26510),l=i(96419),s=i(38102),d=i(73993),c=i(59169),p=i(62709),h=i(55276);let u=(0,l.zo)(h.B)`
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
`,v=l.zo.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,f=(0,l.zo)(c.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,y=(0,l.zo)(d.E)`
  margin-top: 0.25rem;
`,m=(0,l.zo)(s.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,b=({errMsg:e,balance:r,address:i,className:l,title:s,showCopyButton:d=!1})=>{let[c,h]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{if(c){let e=setTimeout(()=>h(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,t.jsxs)("div",{children:[s&&(0,t.jsx)(f,{children:s}),(0,t.jsx)(u,{className:l,$state:e?"error":void 0,children:(0,t.jsxs)(g,{children:[(0,t.jsxs)(x,{children:[(0,t.jsx)(p.A,{address:i,showCopyIcon:!1}),void 0!==r&&(0,t.jsx)(v,{children:r})]}),d&&(0,t.jsx)(m,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(i).then(()=>h(!0)).catch(console.error)},size:"sm",children:(0,t.jsxs)(t.Fragment,c?{children:["Copied",(0,t.jsx)(o.Z,{size:14})]}:{children:["Copy",(0,t.jsx)(n.Z,{size:14})]})})]})}),e&&(0,t.jsx)(y,{children:e})]})}},49536:(e,r,i)=>{i.d(r,{W:()=>a});var t=i(4913),o=i(22277),n=i(96419);let a=({children:e,theme:r,className:i})=>(0,t.jsxs)(l,{$theme:r,className:i,children:[(0,t.jsx)(o.Z,{width:"20px",height:"20px",color:"var(--privy-color-icon-warning)",strokeWidth:2,style:{flexShrink:0}}),(0,t.jsx)(s,{$theme:r,children:e})]}),l=n.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-warn-bg);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,s=n.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  flex: 1;
  text-align: left;
`},90684:(e,r,i)=>{i.d(r,{N:()=>n});var t=i(4913),o=i(96419);let n=({size:e,centerIcon:r})=>(0,t.jsx)(a,{$size:e,children:(0,t.jsxs)(l,{children:[(0,t.jsx)(d,{}),(0,t.jsx)(c,{}),r?(0,t.jsx)(s,{children:r}):null]})}),a=o.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=o.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=o.zo.div`
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
`,d=o.zo.div`
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
`,c=o.zo.div`
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
`},55276:(e,r,i)=>{i.d(r,{B:()=>n,a:()=>o});var t=i(96419);let o=(0,t.iv)`
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
`,n=t.zo.div`
  ${o}
`}};