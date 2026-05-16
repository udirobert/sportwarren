"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4381],{26332:function(e,r,t){t.d(r,{C:function(){return s}});var i=t(89418),o=t(4753),n=t(43803);let l=({style:e,color:r,...t})=>(0,i.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:r||"currentColor",style:{height:"1.5rem",width:"1.5rem",...e},...t,children:(0,i.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M4.5 12.75l6 6 9-13.5"})}),a=({color:e,...r})=>(0,i.jsx)("svg",{version:"1.1",id:"Layer_1",xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 115.77 122.88",xmlSpace:"preserve",...r,children:(0,i.jsx)("g",{children:(0,i.jsx)("path",{fill:e||"currentColor",className:"st0",d:"M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"})})}),s=e=>{let[r,t]=(0,o.useState)(!1);return(0,i.jsxs)(c,{color:e.color,onClick:()=>{t(!0),navigator.clipboard.writeText(e.text),setTimeout(()=>t(!1),1500)},$justCopied:r,children:[r?(0,i.jsx)(l,{style:{height:"14px",width:"14px"},strokeWidth:"2"}):(0,i.jsx)(a,{style:{height:"14px",width:"14px"}}),r?"Copied":"Copy"," ",e.itemName?e.itemName:"to Clipboard"]})},c=n.zo.button`
  display: flex;
  align-items: center;
  gap: 6px;

  && {
    margin: 8px 2px;
    font-size: 14px;
    color: ${e=>e.$justCopied?"var(--privy-color-foreground)":e.color||"var(--privy-color-foreground-3)"};
    font-weight: ${e=>e.$justCopied?"medium":"normal"};
    transition: color 350ms ease;

    :focus,
    :active {
      background-color: transparent;
      border: none;
      outline: none;
      box-shadow: none;
    }

    :hover {
      color: ${e=>e.$justCopied?"var(--privy-color-foreground)":"var(--privy-color-foreground-2)"};
    }

    :active {
      color: 'var(--privy-color-foreground)';
      font-weight: medium;
    }

    @media (max-width: 440px) {
      margin: 12px 2px;
    }
  }

  svg {
    width: 14px;
    height: 14px;
  }
`},44381:function(e,r,t){t.r(r),t.d(r,{FarcasterSignerStatusScreen:function(){return C},FarcasterSignerStatusView:function(){return f},default:function(){return C}});var i=t(89418),o=t(4753),n=t(55982),l=t(43803),a=t(26332),s=t(61318),c=t(30238),d=t(79478),h=t(64982),p=t(3010),u=t(9201),g=t(35868),x=t(77429);t(78439),t(2892),t(96257);let v="#8a63d2",f=({appName:e,loading:r,success:t,errorMessage:o,connectUri:l,onBack:h,onClose:p,onOpenFarcaster:u})=>(0,i.jsx)(g.S,n.tq||r?n.gn?{title:o?o.message:"Add a signer to Farcaster",subtitle:o?o.detail:`This will allow ${e} to add casts, likes, follows, and more on your behalf.`,icon:x.F,iconVariant:"loading",iconLoadingStatus:{success:t,fail:!!o},primaryCta:l&&u?{label:"Open Farcaster app",onClick:u}:void 0,onBack:h,onClose:p,watermark:!0}:{title:o?o.message:"Requesting signer from Farcaster",subtitle:o?o.detail:"This should only take a moment",icon:x.F,iconVariant:"loading",iconLoadingStatus:{success:t,fail:!!o},onBack:h,onClose:p,watermark:!0,children:l&&n.tq&&(0,i.jsx)(m,{children:(0,i.jsx)(c.O,{text:"Take me to Farcaster",url:l,color:v})})}:{title:"Add a signer to Farcaster",subtitle:`This will allow ${e} to add casts, likes, follows, and more on your behalf.`,onBack:h,onClose:p,watermark:!0,children:(0,i.jsxs)(y,{children:[(0,i.jsx)(w,{children:l?(0,i.jsx)(d.Q,{url:l,size:275,squareLogoElement:x.F}):(0,i.jsx)(z,{children:(0,i.jsx)(s.L,{})})}),(0,i.jsxs)(b,{children:[(0,i.jsx)(j,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),l&&(0,i.jsx)(a.C,{text:l,itemName:"link",color:v})]})]})}),m=l.zo.div`
  margin-top: 24px;
`,y=l.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,w=l.zo.div`
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,b=l.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,j=l.zo.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,z=l.zo.div`
  position: relative;
  width: 82px;
  height: 82px;
`,C={component:()=>{let{lastScreen:e,navigateBack:r,data:t}=(0,u.a)(),n=(0,h.u)(),{requestFarcasterSignerStatus:l,closePrivyModal:a}=(0,p.u)(),[s,c]=(0,o.useState)(void 0),[d,g]=(0,o.useState)(!1),[x,v]=(0,o.useState)(!1),m=(0,o.useRef)([]),y=t?.farcasterSigner;(0,o.useEffect)(()=>{let e=Date.now(),r=setInterval(async()=>{if(!y?.public_key)return clearInterval(r),void c({retryable:!0,message:"Connect failed",detail:"Something went wrong. Please try again."});"approved"===y.status&&(clearInterval(r),g(!1),v(!0),m.current.push(setTimeout(()=>a({shouldCallAuthOnSuccess:!1,isSuccess:!0}),h.q)));let t=await l(y?.public_key),i=Date.now()-e;"approved"===t.status?(clearInterval(r),g(!1),v(!0),m.current.push(setTimeout(()=>a({shouldCallAuthOnSuccess:!1,isSuccess:!0}),h.q))):i>3e5?(clearInterval(r),c({retryable:!0,message:"Connect failed",detail:"The request timed out. Try again."})):"revoked"===t.status&&(clearInterval(r),c({retryable:!0,message:"Request rejected",detail:"The request was rejected. Please try again."}))},2e3);return()=>{clearInterval(r),m.current.forEach(e=>clearTimeout(e))}},[]);let w="pending_approval"===y?.status?y.signer_approval_url:void 0;return(0,i.jsx)(f,{appName:n.name,loading:d,success:x,errorMessage:s,connectUri:w,onBack:e?r:void 0,onClose:a,onOpenFarcaster:()=>{w&&(window.location.href=w)}})}}},30238:function(e,r,t){t.d(r,{O:function(){return l}});var i=t(89418),o=t(4753),n=t(43803);let l=e=>{let[r,t]=(0,o.useState)(!1);return(0,i.jsx)(a,{color:e.color,href:e.url,target:"_blank",rel:"noreferrer noopener",onClick:()=>{t(!0),setTimeout(()=>t(!1),1500)},justOpened:r,children:e.text})},a=n.zo.a`
  display: flex;
  align-items: center;
  gap: 6px;

  && {
    margin: 8px 2px;
    font-size: 14px;
    color: ${e=>e.justOpened?"var(--privy-color-foreground)":e.color||"var(--privy-color-foreground-3)"};
    font-weight: ${e=>e.justOpened?"medium":"normal"};
    transition: color 350ms ease;

    :focus,
    :active {
      background-color: transparent;
      border: none;
      outline: none;
      box-shadow: none;
    }

    :hover {
      color: ${e=>e.justOpened?"var(--privy-color-foreground)":"var(--privy-color-foreground-2)"};
    }

    :active {
      color: 'var(--privy-color-foreground)';
      font-weight: medium;
    }

    @media (max-width: 440px) {
      margin: 12px 2px;
    }
  }

  svg {
    width: 14px;
    height: 14px;
  }
`},79478:function(e,r,t){t.d(r,{Q:function(){return m}});var i=t(89418),o=t(2892),n=t(4753),l=t(43803),a=t(64982),s=t(40099);let c=()=>(0,i.jsx)("svg",{width:"200",height:"200",viewBox:"-77 -77 200 200",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{height:"28px",width:"28px"},children:(0,i.jsx)("rect",{width:"50",height:"50",fill:"black",rx:10,ry:10})}),d=(e,r,t,i,o)=>{for(let n=r;n<r+i;n++)for(let r=t;r<t+o;r++){let t=e?.[r];t&&t[n]&&(t[n]=0)}return e},h=(e,r)=>{let t=o.create(e,{errorCorrectionLevel:r}).modules,i=(0,s.E)(Array.from(t.data),t.size);return i=d(i,0,0,7,7),i=d(i,i.length-7,0,7,7),d(i,0,i.length-7,7,7)},p=({x:e,y:r,cellSize:t,bgColor:o,fgColor:n})=>(0,i.jsx)(i.Fragment,{children:[0,1,2].map(l=>(0,i.jsx)("circle",{r:t*(7-2*l)/2,cx:e+7*t/2,cy:r+7*t/2,fill:l%2!=0?o:n},`finder-${e}-${r}-${l}`))}),u=({cellSize:e,matrixSize:r,bgColor:t,fgColor:o})=>(0,i.jsx)(i.Fragment,{children:[[0,0],[(r-7)*e,0],[0,(r-7)*e]].map(([r,n])=>(0,i.jsx)(p,{x:r,y:n,cellSize:e,bgColor:t,fgColor:o},`finder-${r}-${n}`))}),g=({matrix:e,cellSize:r,color:t})=>(0,i.jsx)(i.Fragment,{children:e.map((e,o)=>e.map((e,l)=>e?(0,i.jsx)("rect",{height:r-.4,width:r-.4,x:o*r+.1*r,y:l*r+.1*r,rx:.5*r,ry:.5*r,fill:t},`cell-${o}-${l}`):(0,i.jsx)(n.Fragment,{},`circle-${o}-${l}`)))}),x=({cellSize:e,matrixSize:r,element:t,sizePercentage:o,bgColor:n})=>{if(!t)return(0,i.jsx)(i.Fragment,{});let l=r*(o||.14),a=Math.floor(r/2-l/2),s=Math.floor(r/2+l/2);(s-a)%2!=r%2&&(s+=1);let c=(s-a)*e,d=c-.2*c,h=a*e;return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("rect",{x:a*e,y:a*e,width:c,height:c,fill:n}),(0,i.jsx)(t,{x:h+.1*c,y:h+.1*c,height:d,width:d})]})},v=e=>{let r=e.outputSize,t=h(e.url,e.errorCorrectionLevel),o=r/t.length,n=(0,s.F)(2*o,{min:.025*r,max:.036*r});return(0,i.jsxs)("svg",{height:e.outputSize,width:e.outputSize,viewBox:`0 0 ${e.outputSize} ${e.outputSize}`,style:{height:"100%",width:"100%",padding:`${n}px`},children:[(0,i.jsx)(g,{matrix:t,cellSize:o,color:e.fgColor}),(0,i.jsx)(u,{cellSize:o,matrixSize:t.length,fgColor:e.fgColor,bgColor:e.bgColor}),(0,i.jsx)(x,{cellSize:o,element:e.logo?.element,bgColor:e.bgColor,matrixSize:t.length})]})},f=l.zo.div.attrs({className:"ph-no-capture"})`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${e=>`${e.$size}px`};
  width: ${e=>`${e.$size}px`};
  margin: auto;
  background-color: ${e=>e.$bgColor};

  && {
    border-width: 2px;
    border-color: ${e=>e.$borderColor};
    border-radius: var(--privy-border-radius-md);
  }
`,m=e=>{let{appearance:r}=(0,a.u)(),t=e.bgColor||"#FFFFFF",o=e.fgColor||"#000000",n=e.size||160,l="dark"===r.palette.colorScheme?t:o;return(0,i.jsx)(f,{$size:n,$bgColor:t,$fgColor:o,$borderColor:l,children:(0,i.jsx)(v,{url:e.url,logo:{element:e.squareLogoElement??c},outputSize:n,bgColor:t,fgColor:o,errorCorrectionLevel:e.errorCorrectionLevel||"Q"})})}},18532:function(e,r,t){t.d(r,{S:function(){return j}});var i=t(89418),o=t(4753),n=t(43803),l=t(61318),a=t(13188),s=t(99539);let c=n.zo.div`
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
`,h=n.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,n.zo)(a.M)`
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
`,w=n.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,b=n.zo.div`
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
`,j=({children:e,...r})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...r,children:e})}),z=n.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,C=(0,n.zo)(a.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,k=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,i.jsx)(z,{children:(0,i.jsx)(k,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:t,iconVariant:o,iconLoadingStatus:n,showBack:l,onBack:a,showInfo:s,onInfo:c,showClose:d,onClose:u,step:g,headerTitle:y,...w})=>(0,i.jsxs)(h,{...w,children:[(0,i.jsx)(p,{backFn:l?a:void 0,infoFn:s?c:void 0,onClose:d?u:void 0,title:y,closeable:d}),(t||o||e||r)&&(0,i.jsxs)(x,{children:[t||o?(0,i.jsx)(j.Icon,{icon:t,variant:o,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(v,{children:[e&&(0,i.jsx)(f,{children:e}),r&&(0,i.jsx)(m,{children:r})]})]}),g&&(0,i.jsx)(S,{step:g})]}),(j.Body=o.forwardRef(({children:e,...r},t)=>(0,i.jsx)(u,{ref:t,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,i.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,i.jsx)($,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,i.jsx)(F,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,i.jsx)(V,{...r,children:e}),j.Watermark=()=>(0,i.jsx)(C,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(w,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,i.jsx)(b,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(l.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(y,{$variant:r,children:(0,i.jsx)(s.N,{size:"64px"})}):(0,i.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let $=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,F=n.zo.div`
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
`,V=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,r,t){t.d(r,{S:function(){return l}});var i=t(89418),o=t(13188),n=t(18532);let l=({primaryCta:e,secondaryCta:r,helpText:t,footerText:l,watermark:a=!0,children:s,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,n=t.variant||"primary";return(0,i.jsx)(o.a,{...t,variant:n,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,n=t.variant||"secondary";return(0,i.jsx)(o.a,{...t,variant:n,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,i.jsx)(n.S.Header,{...c}),s?(0,i.jsx)(n.S.Body,{children:s}):null,t||d||a?(0,i.jsxs)(n.S.Footer,{children:[t?(0,i.jsx)(n.S.HelpText,{children:t}):null,d?(0,i.jsx)(n.S.Actions,{children:d}):null,a?(0,i.jsx)(n.S.Watermark,{}):null]}):null,l?(0,i.jsx)(n.S.FooterText,{children:l}):null]})}},77429:function(e,r,t){t.d(r,{F:function(){return o}});var i=t(89418);let o=e=>(0,i.jsxs)("svg",{width:"33",height:"32",viewBox:"0 0 33 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:[(0,i.jsx)("rect",{x:"0.5",width:"32",height:"32",rx:"4",fill:"#855DCD"}),(0,i.jsxs)("g",{"clip-path":"url(#clip0_1715_1960)",children:[(0,i.jsx)("path",{d:"M4.5 4H28.5V28H4.5V4Z",fill:"#855DCD"}),(0,i.jsx)("path",{d:"M11.1072 8.42105H21.6983V23.5789H20.1437V16.6357H20.1284C19.9566 14.7167 18.3542 13.2129 16.4028 13.2129C14.4514 13.2129 12.849 14.7167 12.6771 16.6357H12.6619V23.5789H11.1072V8.42105Z",fill:"white"}),(0,i.jsx)("path",{d:"M8.28943 10.5725L8.92101 12.7239H9.45542V21.4275C9.1871 21.4275 8.96959 21.6464 8.96959 21.9165V22.5032H8.87242C8.60411 22.5032 8.38659 22.7221 8.38659 22.9922V23.5789H13.8279V22.9922C13.8279 22.7221 13.6104 22.5032 13.3421 22.5032H13.2449V21.9165C13.2449 21.6464 13.0274 21.4275 12.7591 21.4275H12.1761V10.5725H8.28943Z",fill:"white"}),(0,i.jsx)("path",{d:"M20.2408 21.4275C19.9725 21.4275 19.755 21.6464 19.755 21.9165V22.5032H19.6579C19.3895 22.5032 19.172 22.7221 19.172 22.9922V23.5789H24.6133V22.9922C24.6133 22.7221 24.3958 22.5032 24.1275 22.5032H24.0303V21.9165C24.0303 21.6464 23.8128 21.4275 23.5445 21.4275V12.7239H24.0789L24.7105 10.5725H20.8238V21.4275H20.2408Z",fill:"white"})]}),(0,i.jsx)("defs",{children:(0,i.jsx)("clipPath",{id:"clip0_1715_1960",children:(0,i.jsx)("rect",{width:"24",height:"24",fill:"white",transform:"translate(4.5 4)"})})})]})},99539:function(e,r,t){t.d(r,{N:function(){return n}});var i=t(89418),o=t(43803);let n=({size:e,centerIcon:r})=>(0,i.jsx)(l,{$size:e,children:(0,i.jsxs)(a,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),l=o.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,a=o.zo.div`
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
`}}]);