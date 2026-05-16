"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5456],{12859:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},3184:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},60660:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},68610:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},22073:function(e,r,i){i.d(r,{A:function(){return d}});var n=i(89418),t=i(12859),o=i(68610),a=i(4753),l=i(43803),s=i(40099),c=i(13188);let d=({address:e,showCopyIcon:r,url:i,className:l})=>{let[d,g]=(0,a.useState)(!1);function x(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>g(!0)).catch(console.error)}return(0,a.useEffect)(()=>{if(d){let e=setTimeout(()=>g(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,n.jsxs)(p,i?{children:[(0,n.jsx)(h,{title:e,className:l,href:`${i}/address/${e}`,target:"_blank",children:(0,s.w)(e)}),r&&(0,n.jsx)(c.S,{onClick:x,size:"sm",style:{gap:"0.375rem"},children:(0,n.jsxs)(n.Fragment,d?{children:["Copied",(0,n.jsx)(t.Z,{size:16})]}:{children:["Copy",(0,n.jsx)(o.Z,{size:16})]})})]}:{children:[(0,n.jsx)(u,{title:e,className:l,children:(0,s.w)(e)}),r&&(0,n.jsx)(c.S,{onClick:x,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,n.jsxs)(n.Fragment,d?{children:["Copied",(0,n.jsx)(t.Z,{size:14})]}:{children:["Copy",(0,n.jsx)(o.Z,{size:14})]})})]})},p=l.zo.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,u=l.zo.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,h=l.zo.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`},95456:function(e,r,i){i.r(r),i.d(r,{DelegatedActionsConsentScreen:function(){return g},DelegatedActionsConsentScreenView:function(){return h},default:function(){return g}});var n=i(89418),t=i(3184),o=i(60660);let a=(0,i(79095).Z)("cloud-upload",[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]]);var l=i(4753),s=i(90116),c=i(64982),d=i(3010),p=i(9201),u=i(35868);i(78439),i(55982),i(96257);let h=({appName:e,address:r,success:i,error:l,onAccept:c,onDecline:d,onClose:p})=>(0,n.jsx)(u.S,i||l?{title:l?"Something went wrong":"Success!",subtitle:l?"Please try again.":`You've successfully granted delegated action permissions to ${e}.`,icon:l?t.Z:o.Z,iconVariant:l?"error":"success",onBack:p,watermark:!0}:{title:"Enable offline access",subtitle:`By confirming, ${e} will be able to use your wallet for you even when you're not around. You can revoke this later.`,icon:a,primaryCta:{label:"Accept",onClick:c},secondaryCta:{label:"Not now",onClick:d},onBack:p,watermark:!0,children:(0,n.jsx)(s.W,{address:r,title:"Wallet"})}),g={component:()=>{let{data:e}=(0,p.a)(),r=(0,c.u)(),{closePrivyModal:i}=(0,d.u)(),[t,o]=(0,l.useState)(!1),[a,s]=(0,l.useState)(),{address:u,onDelegate:g,onSuccess:x,onError:v}=e.delegatedActions.consent,f=async()=>{t?x():v(a??new d.b("User declined delegating actions.")),i({shouldCallAuthOnSuccess:!1})};return(0,l.useEffect)(()=>{if(!t&&!a)return;let e=setTimeout(f,c.r);return()=>clearTimeout(e)},[t,a]),(0,n.jsx)(h,{appName:r.name,address:u,success:t,error:a,onAccept:async()=>{try{await g(),o(!0)}catch(e){s(e)}},onDecline:()=>{f()},onClose:f})}}},41815:function(e,r,i){i.d(r,{E:function(){return t}});var n=i(43803);let t=n.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},24974:function(e,r,i){i.d(r,{L:function(){return t}});var n=i(43803);let t=n.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},18532:function(e,r,i){i.d(r,{S:function(){return z}});var n=i(89418),t=i(4753),o=i(43803),a=i(61318),l=i(13188),s=i(99539);let c=o.zo.div`
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
`,u=(0,o.zo)(l.M)`
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
`,z=({children:e,...r})=>(0,n.jsx)(c,{children:(0,n.jsx)(d,{...r,children:e})}),w=o.zo.div`
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
`,C=o.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,n.jsx)(w,{children:(0,n.jsx)(C,{pct:Math.min(100,e.current/e.total*100)})}):null;z.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:o,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:h,step:g,headerTitle:y,...b})=>(0,n.jsxs)(p,{...b,children:[(0,n.jsx)(u,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?h:void 0,title:y,closeable:d}),(i||t||e||r)&&(0,n.jsxs)(x,{children:[i||t?(0,n.jsx)(z.Icon,{icon:i,variant:t,loadingStatus:o}):null,!(!e&&!r)&&(0,n.jsxs)(v,{children:[e&&(0,n.jsx)(f,{children:e}),r&&(0,n.jsx)(m,{children:r})]})]}),g&&(0,n.jsx)(S,{step:g})]}),(z.Body=t.forwardRef(({children:e,...r},i)=>(0,n.jsx)(h,{ref:i,...r,children:e}))).displayName="Screen.Body",z.Footer=({children:e,...r})=>(0,n.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),z.Actions=({children:e,...r})=>(0,n.jsx)(E,{...r,children:e}),z.HelpText=({children:e,...r})=>(0,n.jsx)($,{...r,children:e}),z.FooterText=({children:e,...r})=>(0,n.jsx)(Z,{...r,children:e}),z.Watermark=()=>(0,n.jsx)(k,{}),z.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,n.jsx)(b,"string"==typeof e?{children:(0,n.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,n.jsx)(j,{children:(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,n.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,n.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,n.jsx)(y,{$variant:r,children:(0,n.jsx)(s.N,{size:"64px"})}):(0,n.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,n.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=o.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,$=o.zo.div`
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
`,Z=o.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,r,i){i.d(r,{S:function(){return a}});var n=i(89418),t=i(13188),o=i(18532);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,n.jsxs)(n.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,o=i.variant||"primary";return(0,n.jsx)(t.a,{...i,variant:o,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,o=i.variant||"secondary";return(0,n.jsx)(t.a,{...i,variant:o,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,n.jsxs)(o.S,{id:c.id,className:c.className,children:[(0,n.jsx)(o.S.Header,{...c}),s?(0,n.jsx)(o.S.Body,{children:s}):null,i||d||l?(0,n.jsxs)(o.S.Footer,{children:[i?(0,n.jsx)(o.S.HelpText,{children:i}):null,d?(0,n.jsx)(o.S.Actions,{children:d}):null,l?(0,n.jsx)(o.S.Watermark,{}):null]}):null,a?(0,n.jsx)(o.S.FooterText,{children:a}):null]})}},90116:function(e,r,i){i.d(r,{W:function(){return b}});var n=i(89418),t=i(12859),o=i(68610),a=i(4753),l=i(43803),s=i(13188),c=i(41815),d=i(24974),p=i(22073),u=i(78236);let h=(0,l.zo)(u.B)`
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
`,f=(0,l.zo)(d.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,m=(0,l.zo)(c.E)`
  margin-top: 0.25rem;
`,y=(0,l.zo)(s.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,b=({errMsg:e,balance:r,address:i,className:l,title:s,showCopyButton:c=!1})=>{let[d,u]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{if(d){let e=setTimeout(()=>u(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,n.jsxs)("div",{children:[s&&(0,n.jsx)(f,{children:s}),(0,n.jsx)(h,{className:l,$state:e?"error":void 0,children:(0,n.jsxs)(g,{children:[(0,n.jsxs)(x,{children:[(0,n.jsx)(p.A,{address:i,showCopyIcon:!1}),void 0!==r&&(0,n.jsx)(v,{children:r})]}),c&&(0,n.jsx)(y,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(i).then(()=>u(!0)).catch(console.error)},size:"sm",children:(0,n.jsxs)(n.Fragment,d?{children:["Copied",(0,n.jsx)(t.Z,{size:14})]}:{children:["Copy",(0,n.jsx)(o.Z,{size:14})]})})]})}),e&&(0,n.jsx)(m,{children:e})]})}},99539:function(e,r,i){i.d(r,{N:function(){return o}});var n=i(89418),t=i(43803);let o=({size:e,centerIcon:r})=>(0,n.jsx)(a,{$size:e,children:(0,n.jsxs)(l,{children:[(0,n.jsx)(c,{}),(0,n.jsx)(d,{}),r?(0,n.jsx)(s,{children:r}):null]})}),a=t.zo.div`
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
`},78236:function(e,r,i){i.d(r,{B:function(){return o},a:function(){return t}});var n=i(43803);let t=(0,n.iv)`
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
`,o=n.zo.div`
  ${t}
`}}]);