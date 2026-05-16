"use strict";exports.id=7219,exports.ids=[7219],exports.modules={32354:(e,r,i)=>{i.d(r,{Z:()=>t});let t=(0,i(5670).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},39607:(e,r,i)=>{i.d(r,{Z:()=>t});let t=(0,i(5670).Z)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},22324:(e,r,i)=>{i.d(r,{Z:()=>t});let t=(0,i(5670).Z)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},60840:(e,r,i)=>{i.d(r,{Z:()=>t});let t=(0,i(5670).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},62709:(e,r,i)=>{i.d(r,{A:()=>d});var t=i(4913),o=i(32354),n=i(60840),a=i(26510),l=i(96419),s=i(22554),c=i(38102);let d=({address:e,showCopyIcon:r,url:i,className:l})=>{let[d,x]=(0,a.useState)(!1);function u(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>x(!0)).catch(console.error)}return(0,a.useEffect)(()=>{if(d){let e=setTimeout(()=>x(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,t.jsxs)(p,i?{children:[(0,t.jsx)(g,{title:e,className:l,href:`${i}/address/${e}`,target:"_blank",children:(0,s.w)(e)}),r&&(0,t.jsx)(c.S,{onClick:u,size:"sm",style:{gap:"0.375rem"},children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(o.Z,{size:16})]}:{children:["Copy",(0,t.jsx)(n.Z,{size:16})]})})]}:{children:[(0,t.jsx)(h,{title:e,className:l,children:(0,s.w)(e)}),r&&(0,t.jsx)(c.S,{onClick:u,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(o.Z,{size:14})]}:{children:["Copy",(0,t.jsx)(n.Z,{size:14})]})})]})},p=l.zo.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,h=l.zo.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,g=l.zo.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`},17219:(e,r,i)=>{i.r(r),i.d(r,{DelegatedActionsConsentScreen:()=>x,DelegatedActionsConsentScreenView:()=>g,default:()=>x});var t=i(4913),o=i(39607),n=i(22324);let a=(0,i(5670).Z)("cloud-upload",[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]]);var l=i(26510),s=i(18034),c=i(14348),d=i(49171),p=i(55182),h=i(77681);i(36577),i(46898),i(50470);let g=({appName:e,address:r,success:i,error:l,onAccept:c,onDecline:d,onClose:p})=>(0,t.jsx)(h.S,i||l?{title:l?"Something went wrong":"Success!",subtitle:l?"Please try again.":`You've successfully granted delegated action permissions to ${e}.`,icon:l?o.Z:n.Z,iconVariant:l?"error":"success",onBack:p,watermark:!0}:{title:"Enable offline access",subtitle:`By confirming, ${e} will be able to use your wallet for you even when you're not around. You can revoke this later.`,icon:a,primaryCta:{label:"Accept",onClick:c},secondaryCta:{label:"Not now",onClick:d},onBack:p,watermark:!0,children:(0,t.jsx)(s.W,{address:r,title:"Wallet"})}),x={component:()=>{let{data:e}=(0,p.a)(),r=(0,c.u)(),{closePrivyModal:i}=(0,d.u)(),[o,n]=(0,l.useState)(!1),[a,s]=(0,l.useState)(),{address:h,onDelegate:x,onSuccess:u,onError:v}=e.delegatedActions.consent,m=async()=>{o?u():v(a??new d.b("User declined delegating actions.")),i({shouldCallAuthOnSuccess:!1})};return(0,l.useEffect)(()=>{if(!o&&!a)return;let e=setTimeout(m,c.r);return()=>clearTimeout(e)},[o,a]),(0,t.jsx)(g,{appName:r.name,address:h,success:o,error:a,onAccept:async()=>{try{await x(),n(!0)}catch(e){s(e)}},onDecline:()=>{m()},onClose:m})}}},73993:(e,r,i)=>{i.d(r,{E:()=>o});var t=i(96419);let o=t.zo.span`
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
`},17846:(e,r,i)=>{i.d(r,{S:()=>z});var t=i(4913),o=i(26510),n=i(96419),a=i(13813),l=i(38102),s=i(90684);let c=n.zo.div`
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
`,p=n.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,n.zo)(l.M)`
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
`,x=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,u=n.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,v=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,m=n.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,f=n.zo.p`
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
`,z=({children:e,...r})=>(0,t.jsx)(c,{children:(0,t.jsx)(d,{...r,children:e})}),w=n.zo.div`
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
`,S=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,t.jsx)(w,{children:(0,t.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;z.Header=({title:e,subtitle:r,icon:i,iconVariant:o,iconLoadingStatus:n,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:g,step:x,headerTitle:y,...b})=>(0,t.jsxs)(p,{...b,children:[(0,t.jsx)(h,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?g:void 0,title:y,closeable:d}),(i||o||e||r)&&(0,t.jsxs)(u,{children:[i||o?(0,t.jsx)(z.Icon,{icon:i,variant:o,loadingStatus:n}):null,!(!e&&!r)&&(0,t.jsxs)(v,{children:[e&&(0,t.jsx)(m,{children:e}),r&&(0,t.jsx)(f,{children:r})]})]}),x&&(0,t.jsx)(C,{step:x})]}),(z.Body=o.forwardRef(({children:e,...r},i)=>(0,t.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",z.Footer=({children:e,...r})=>(0,t.jsx)(x,{id:"privy-content-footer-container",...r,children:e}),z.Actions=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),z.HelpText=({children:e,...r})=>(0,t.jsx)($,{...r,children:e}),z.FooterText=({children:e,...r})=>(0,t.jsx)(Z,{...r,children:e}),z.Watermark=()=>(0,t.jsx)(k,{}),z.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(b,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,t.jsx)(j,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(y,{$variant:r,children:(0,t.jsx)(s.N,{size:"64px"})}):(0,t.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,$=n.zo.div`
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
`,Z=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>a});var t=i(4913),o=i(38102),n=i(17846);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,n=i.variant||"primary";return(0,t.jsx)(o.a,{...i,variant:n,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,n=i.variant||"secondary";return(0,t.jsx)(o.a,{...i,variant:n,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,t.jsx)(n.S.Header,{...c}),s?(0,t.jsx)(n.S.Body,{children:s}):null,i||d||l?(0,t.jsxs)(n.S.Footer,{children:[i?(0,t.jsx)(n.S.HelpText,{children:i}):null,d?(0,t.jsx)(n.S.Actions,{children:d}):null,l?(0,t.jsx)(n.S.Watermark,{}):null]}):null,a?(0,t.jsx)(n.S.FooterText,{children:a}):null]})}},18034:(e,r,i)=>{i.d(r,{W:()=>b});var t=i(4913),o=i(32354),n=i(60840),a=i(26510),l=i(96419),s=i(38102),c=i(73993),d=i(59169),p=i(62709),h=i(55276);let g=(0,l.zo)(h.B)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,x=l.zo.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,u=l.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,v=l.zo.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,m=(0,l.zo)(d.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,f=(0,l.zo)(c.E)`
  margin-top: 0.25rem;
`,y=(0,l.zo)(s.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,b=({errMsg:e,balance:r,address:i,className:l,title:s,showCopyButton:c=!1})=>{let[d,h]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{if(d){let e=setTimeout(()=>h(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,t.jsxs)("div",{children:[s&&(0,t.jsx)(m,{children:s}),(0,t.jsx)(g,{className:l,$state:e?"error":void 0,children:(0,t.jsxs)(x,{children:[(0,t.jsxs)(u,{children:[(0,t.jsx)(p.A,{address:i,showCopyIcon:!1}),void 0!==r&&(0,t.jsx)(v,{children:r})]}),c&&(0,t.jsx)(y,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(i).then(()=>h(!0)).catch(console.error)},size:"sm",children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(o.Z,{size:14})]}:{children:["Copy",(0,t.jsx)(n.Z,{size:14})]})})]})}),e&&(0,t.jsx)(f,{children:e})]})}},90684:(e,r,i)=>{i.d(r,{N:()=>n});var t=i(4913),o=i(96419);let n=({size:e,centerIcon:r})=>(0,t.jsx)(a,{$size:e,children:(0,t.jsxs)(l,{children:[(0,t.jsx)(c,{}),(0,t.jsx)(d,{}),r?(0,t.jsx)(s,{children:r}):null]})}),a=o.zo.div`
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
`,c=o.zo.div`
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
`,d=o.zo.div`
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