"use strict";exports.id=9741,exports.ids=[9741],exports.modules={10081:(e,t,r)=>{r.d(t,{Z:()=>o});var n=r(26510);let o=n.forwardRef(function({title:e,titleId:t,...r},o){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":t},r),e?n.createElement("title",{id:t},e):null,n.createElement("path",{fillRule:"evenodd",d:"M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z",clipRule:"evenodd"}))})},46027:(e,t,r)=>{r.d(t,{Z:()=>o});var n=r(26510);let o=n.forwardRef(function({title:e,titleId:t,...r},o){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":t},r),e?n.createElement("title",{id:t},e):null,n.createElement("path",{fillRule:"evenodd",d:"M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",clipRule:"evenodd"}))})},39741:(e,t,r)=>{r.r(t),r.d(t,{CoinbaseOnrampStatusScreen:()=>m,default:()=>m});var n=r(4913),o=r(10081),i=r(46027),a=r(26510),l=r(96419),s=r(38102),d=r(38198),c=r(13813),u=r(49171),g=r(55182),f=r(26844),p=r(45592);r(50470),r(36577),r(46898),r(42330),r(84440);let m={component:()=>{let{data:e,setModalData:t,navigate:r,navigateBack:o}=(0,g.a)(),{closePrivyModal:i,createAnalyticsEvent:l,client:d}=(0,u.u)(),[c,p]=(0,a.useState)("pending-in-flow"),m=(0,a.useRef)(0),v={...e?.funding,showAlternateFundingMethod:!0};v.usingDefaultFundingMethod&&(v.usingDefaultFundingMethod=!1);let{partnerUserId:h,popup:y}=e?.coinbaseOnrampStatus??{};return(0,a.useEffect)(()=>{if("pending-in-flow"===c||"pending-after-flow"===c){let n=setInterval(async()=>{if(h)try{let{status:n}=await d.getCoinbaseOnRampStatus({partnerUserId:h});if("success"===n)return void p("success");if("failure"===n)throw Error("There was an error completing Coinbase Onramp flow.");if(m.current>=3)return t({funding:v,solanaFundingData:e?.solanaFundingData}),void r("FundingMethodSelectionScreen");y?.closed&&(m.current=m.current+1,p("pending-after-flow"))}catch(n){console.error(n),p("error"),l({eventName:f.O,payload:{status:"failure",provider:"coinbase-onramp",error:n.message}}),t({funding:{...v,errorMessage:"Something went wrong adding funds. Please try again or use another method."},solanaFundingData:e?.solanaFundingData}),r("FundingMethodSelectionScreen")}},1500);return()=>clearInterval(n)}},[h,y,c]),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.M,{title:"Fund account",backFn:()=>{t({funding:v,solanaFundingData:e?.solanaFundingData}),o()}},"header"),(0,n.jsx)(x,{status:c,onClickCta:i}),(0,n.jsx)(s.B,{})]})}},x=({status:e,onClickCta:t})=>{let{title:r,body:o,cta:i}=(0,a.useMemo)(()=>(e=>{switch(e){case"success":return{title:"You've funded your account!",body:"It may take a few minutes for the assets to appear.",cta:"Continue"};case"pending-after-flow":return{title:"In Progress",body:"Almost done. Retrieving transaction status from Coinbase",cta:""};case"error":case"pending-in-flow":return{title:"In Progress",body:"Go back to Coinbase Onramp to finish funding your account.",cta:""}}})(e),[e]);return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(y,{children:[(0,n.jsx)(v,{isSucccess:"success"===e}),(0,n.jsxs)(d.a,{children:[(0,n.jsx)("h3",{children:r}),(0,n.jsx)(h,{children:o})]})]}),i&&(0,n.jsx)(s.P,{onClick:t,children:i})]})},v=({isSucccess:e})=>{if(!e){let e="var(--privy-color-foreground-4)";return(0,n.jsxs)("div",{style:{position:"relative"},children:[(0,n.jsx)(c.L,{color:e,style:{position:"absolute"}}),(0,n.jsx)(c.O,{color:e}),(0,n.jsx)(p.F,{style:{position:"absolute",width:"2.8rem",height:"2.8rem",top:"1.2rem",left:"1.2rem"}})]})}let t=e?i.Z:()=>(0,n.jsx)(o.Z,{width:"3rem",height:"3rem",style:{backgroundColor:"var(--privy-color-foreground-4)",color:"var(--privy-color-background)",borderRadius:"100%",padding:"0.5rem",margin:"0.5rem"}}),r=e?"var(--privy-color-success)":"var(--privy-color-foreground-4)";return(0,n.jsx)("div",{style:{borderColor:r,display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"100%",borderWidth:2,padding:"0.5rem",marginBottom:"0.5rem"},children:t&&(0,n.jsx)(t,{width:"4rem",height:"4rem",color:r})})},h=l.zo.p`
  font-size: 1rem;
  color: var(--privy-color-foreground-3);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,y=l.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 1.75rem;
  margin-right: 1.75rem;
  padding: 2rem 0;
`},38198:(e,t,r)=>{r.d(t,{B:()=>o,C:()=>l,F:()=>d,H:()=>a,R:()=>f,S:()=>u,a:()=>c,b:()=>g,c:()=>s,d:()=>p,e:()=>i});var n=r(96419);let o=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,i=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,n.zo)(i)`
  padding: 20px 0;
`,s=(0,n.zo)(i)`
  gap: 16px;
`,d=n.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,c=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;n.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=n.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  width: 100%;
  background: var(--privy-color-background-2);
  border-radius: var(--privy-border-radius-md);
  && h4 {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
    text-decoration: underline;
    font-weight: medium;
  }
  && p {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
  }
`,g=n.zo.div`
  height: 16px;
`,f=n.zo.div`
  height: 12px;
`;n.zo.div`
  position: relative;
`;let p=n.zo.div`
  height: ${e=>e.height??"12"}px;
`;n.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},26844:(e,t,r)=>{r.d(t,{O:()=>n});let n="sdk_fiat_on_ramp_completed_with_status"}};