"use strict";exports.id=4374,exports.ids=[4374],exports.modules={36272:(e,n,t)=>{t.d(n,{Z:()=>a});let a=(0,t(5670).Z)("wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]])},9430:(e,n,t)=>{t.d(n,{Z:()=>l});var a=t(26510);let l=a.forwardRef(function({title:e,titleId:n,...t},l){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":n},t),e?a.createElement("title",{id:n},e):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"}))})},26550:(e,n,t)=>{t.d(n,{C:()=>i});var a=t(4913),l=t(96419),o=t(66461);let i=({children:e,color:n,isLoading:t,isPulsing:l,...o})=>(0,a.jsx)(r,{$color:n,$isLoading:t,$isPulsing:l,...o,children:e}),r=l.zo.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let n,t;"green"===e.$color&&(n="var(--privy-color-success-dark)",t="var(--privy-color-success-light)"),"red"===e.$color&&(n="var(--privy-color-error)",t="var(--privy-color-error-light)"),"gray"===e.$color&&(n="var(--privy-color-foreground-2)",t="var(--privy-color-background-2)");let a=(0,l.F4)`
      from, to {
        background-color: ${t};
      }

      50% {
        background-color: rgba(${t}, 0.8);
      }
    `;return(0,l.iv)`
      color: ${n};
      background-color: ${t};
      ${e.$isPulsing&&(0,l.iv)`
        animation: ${a} 3s linear infinite;
      `};
    `}}

  ${o.L}
`},42365:(e,n,t)=>{t.d(n,{t:()=>i});var a=t(4913),l=t(55182),o=t(38102);function i({title:e}){let{currentScreen:n,navigateBack:t,navigate:i,data:r,setModalData:c}=(0,l.a)();return(0,a.jsx)(o.M,{title:e,backFn:"ManualTransferScreen"===n?t:n===r?.funding?.methodScreen?r.funding.comingFromSendTransactionScreen?()=>i("SendTransactionScreen"):void 0:r?.funding?.methodScreen?()=>{let e=r.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),c({funding:e,solanaFundingData:r?.solanaFundingData}),i(e.methodScreen)}:void 0})}},8992:(e,n,t)=>{t.d(n,{I:()=>o});var a=t(4913),l=t(9430);let o=({icon:e,name:n})=>"string"==typeof e?(0,a.jsx)("img",{alt:`${n||"wallet"} logo`,src:e,style:{height:24,width:24,borderRadius:4}}):void 0===e?(0,a.jsx)(l.Z,{style:{height:24,width:24}}):e?(0,a.jsx)(e,{style:{height:24,width:24}}):null},66461:(e,n,t)=>{t.d(n,{L:()=>o});var a=t(96419);let l=(0,a.F4)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,o=(0,a.iv)`
  ${e=>e.$isLoading?(0,a.iv)`
          width: 35%;
          animation: ${l} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},82145:(e,n,t)=>{t.d(n,{C:()=>i,S:()=>o});var a=t(4913),l=t(96419);let o=({title:e,description:n,children:t,...l})=>(0,a.jsx)(r,{...l,children:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("h3",{children:e}),"string"==typeof n?(0,a.jsx)("p",{children:n}):n,t]})});(0,l.zo)(o)`
  margin-bottom: 24px;
`;let i=({title:e,description:n,icon:t,children:l,...o})=>(0,a.jsxs)(c,{...o,children:[t||null,(0,a.jsx)("h3",{children:e}),n&&"string"==typeof n?(0,a.jsx)("p",{children:n}):n,l]}),r=l.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  width: 100%;
  margin-bottom: 24px;

  && h3 {
    font-size: 17px;
    color: var(--privy-color-foreground);
  }

  /* Sugar assuming children are paragraphs. Otherwise, handling styling on your own */
  && p {
    color: var(--privy-color-foreground-2);
    font-size: 14px;
  }
`,c=(0,l.zo)(r)`
  align-items: center;
  text-align: center;
  gap: 16px;

  h3 {
    margin-bottom: 24px;
  }
`},83059:(e,n,t)=>{t.d(n,{S:()=>l});var a=t(96419);let l=a.zo.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},76045:(e,n,t)=>{t.r(n),t.d(n,{TransferFromWalletScreen:()=>W,default:()=>W});var a=t(4913),l=t(26510),o=t(38102),i=t(82145),r=t(42365),c=t(26550),s=t(83059),d=t(14348),p=t(13813),u=t(49171),y=t(55182),h=t(2207),g=t(77393),m=t(45592),f=t(46898),w=t(96419),x=t(8992),v=t(22554),T=t(44780);t(50470),t(36577),t(42330),t(84440);let C=({provider:e,displayName:n,logo:t,connectOnly:l,connector:o})=>{let i,{navigate:r,setModalData:c}=(0,y.a)(),{connectWallet:s}=(0,u.u)(),d=(0,p.r)(),h=(0,p.z)(e),g="wallet_connect_v2"===o.connectorType?e:o.walletClientType,w=window.matchMedia("(display-mode: standalone)").matches,T=(0,p.k)({connectorType:o.connectorType,walletClientType:g});i=T&&T.chainTypes.includes(o.chainType)?()=>{T.isInstalled||"solana"===o.chainType&&"isInstalled"in o&&o.isInstalled?(s(o,g),r(l?"ConnectOnlyStatusScreen":"ConnectionStatusScreen")):f.tq?(c({installWalletModalData:{walletConfig:T,chainType:o.chainType,connectOnly:l}}),r("WalletInterstitialScreen")):(c({installWalletModalData:{walletConfig:T,chainType:o.chainType,connectOnly:l}}),r("InstallWalletScreen"))}:"coinbase_wallet"!==o.connectorType||"eoaOnly"!==o.coinbaseWalletConfig.preference?.options||!f.tq||w||(0,v.z)()?()=>{(!(0,m.x)(window.navigator.userAgent)||event?.isTrusted)&&(s(o,g),l?"wallet_connect_v2"===o.connectorType?(c(e=>({...e,externalConnectWallet:{...e?.externalConnectWallet,preSelectedWalletId:"wallet_connect_qr"}})),r("ConnectOnlyLandingScreen")):r("ConnectOnlyStatusScreen"):r("ConnectionStatusScreen"))}:()=>{window.location.href=`https://go.cb-w.com/dapp?cb_url=${encodeURI(window.location.href)}`};let C=n||h?.metadata?.shortName||h?.name||o.walletClientType;return(0,a.jsxs)(j,{onClick:i,children:[(0,a.jsx)(x.I,{icon:t||h?.image_url?.md,name:C}),(0,a.jsx)("span",{children:C}),(0,a.jsxs)($,{id:"chip-container",children:[d?.walletClientType===g&&d?.chainType===o.chainType?(0,a.jsx)(b,{color:"gray",children:"Recent"}):(0,a.jsx)("span",{id:"connect-text",children:"Connect"}),"solana"===o.chainType&&(0,a.jsx)(b,{color:"gray",children:"Solana"})]})]})},j=(0,w.zo)(p.A)`
  /* Wallet name text color */
  > span {
    color: var(--privy-color-foreground);
  }

  /* Show "Connect" on hover */
  > #chip-container > #connect-text {
    font-weight: 500;
    color: var(--privy-color-accent);
    opacity: 0;
    transition: opacity 0.1s ease-out;
  }

  :hover > #chip-container > #connect-text {
    opacity: 1;
  }

  @media (max-width: 440px) {
    > #chip-container > #connect-text {
      display: none;
    }
  }
`,b=(0,w.zo)(c.C)`
  margin-left: auto;
`,$=w.zo.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
`,_=["coinbase_wallet","base_account"],S=["metamask","okx_wallet","rainbow","uniswap","bybit_wallet","ronin_wallet","haha_wallet","uniswap_extension","zerion","rabby_wallet","cryptocom","binance","kraken_wallet"],z=["safe"],k=["phantom","backpack","solflare","jupiter","universal_profile"],W={component:()=>{let e,{connectors:n}=(0,u.u)(),{setModalData:t,data:c,navigate:f}=(0,y.a)(),w=(0,d.u)(),{wallets:x}=(0,h.u)(),v=n.filter(p.c).flatMap(e=>e.wallets),[T,j]=(0,l.useState)("default"),b="solana"===c?.funding?.chainType,$=!!c?.funding?.crossChainBridgingEnabled;e="ethereum"===c?.funding?.chainType?c.funding.erc20Address&&!c.funding.isUSDC?"ethereum-only":$&&!c.funding.chain.testnet?"ethereum-and-solana":"ethereum-only":$&&!c.funding?.isUSDC?"ethereum-and-solana":"solana-only";let W=x.filter(e=>"privy"!==e.walletClientType),D=W.map(e=>e.walletClientType),O=v.filter(e=>"privy"!==e.walletClientType),M=O.map(e=>e.walletClientType),B=[],A={...c.funding};A.usingDefaultFundingMethod&&(A.usingDefaultFundingMethod=!1);let E=({wallet:e,walletChainType:n})=>{t({...c,funding:{...A,connectedWallet:e,onContinueWithExternalWallet:()=>f(I({destChainType:b?"solana":"ethereum",sourceChainType:n}))},solanaFundingData:c?.solanaFundingData?{...c.solanaFundingData,sourceWalletData:{address:e.address,walletClientType:e.walletClientType}}:void 0}),f("FundingAmountEditScreen")};"solana-only"!==e&&B.push(...W.map((e,n)=>(0,a.jsx)(F,{onClick:()=>E({wallet:e,walletChainType:"ethereum"}),icon:e.meta.icon,name:e.meta.name,chainType:e.type},n))),"ethereum-only"!==e&&B.push(...O.map((e,n)=>(0,a.jsx)(F,{onClick:()=>E({wallet:e,walletChainType:"solana"}),icon:e.meta.icon,name:e.meta.name,chainType:e.type},n))),B.push(...(({walletList:e,walletChainType:n,connectors:t,connectOnly:l,ignore:o,walletConnectEnabled:i,forceWallet:r})=>{let c=[],s=[],d=[],p=t.filter(e=>"ethereum-only"===n?"ethereum"===e.chainType:"solana-only"!==n||"solana"===e.chainType),u=p.find(e=>"wallet_connect_v2"===e.connectorType);for(let[t,y]of(r?[r.wallet]:e).entries()){if("detected_ethereum_wallets"===y)for(let[e,n]of p.filter(({chainType:e,connectorType:n,walletClientType:t})=>"solana"!==e&&("uniswap_wallet_extension"===t||"uniswap_extension"===t?!o.includes("uniswap"):"crypto.com_wallet_extension"===t||"crypto.com_onchain"===t?!o.includes("cryptocom"):"injected"===n&&!o.includes(t))).entries()){let{walletClientType:o,walletBranding:i,chainType:r}=n;("unknown"===o?s:c).push((0,a.jsx)(C,{connectOnly:l,provider:o,logo:i.icon,displayName:i.name,connector:n},`${t}-${y}-${o}-${r}-${e}`))}if("detected_solana_wallets"===y)for(let[e,i]of p.filter(({chainType:e,walletClientType:t})=>{if("solana"===e)return"ethereum-only"!==n&&!o.includes(t)}).entries()){let{walletClientType:n,walletBranding:o,chainType:r}=i;("unknown"===n?s:c).push((0,a.jsx)(C,{connectOnly:l,provider:n,logo:o.icon,displayName:o.name,connector:i},`${t}-${y}-${n}-${r}-${e}`))}if(k.includes(y)){let e=p.find(e=>"injected"===e.connectorType&&e.walletClientType===y||e.connectorType===y);if(e&&c.push((0,a.jsx)(C,{connectOnly:l,provider:y,connector:e},`${t}-${y}`)),"solana-only"===n||"ethereum-and-solana"===n){let e=p.find(({chainType:e,walletClientType:n})=>"solana"===e&&n===y);e&&c.push((0,a.jsx)(C,{connectOnly:l,provider:y,connector:e},`${y}-solana`))}}else if(S.includes(y)){let e=p.find(e=>"uniswap"===y?"uniswap_wallet_extension"===e.walletClientType||"uniswap_extension"===e.walletClientType:"cryptocom"===y?"crypto.com_wallet_extension"===e.walletClientType||"crypto.com_onchain"===e.walletClientType:"injected"===e.connectorType&&e.walletClientType===y);if(i&&!e&&(e=u),e&&c.push((0,a.jsx)(C,{connectOnly:l,provider:y,connector:e,logo:"injected"===e.connectorType?e.walletBranding.icon:void 0,displayName:"injected"===e.connectorType?e.walletBranding.name:void 0},`${t}-${y}`)),"solana-only"===n||"ethereum-and-solana"===n){let e=p.find(({chainType:e,walletClientType:n})=>"solana"===e&&n===y);e&&c.push((0,a.jsx)(C,{connectOnly:l,provider:y,connector:e},`${y}-solana`))}}else if(_.includes(y)){let e=p.find(({connectorType:e})=>e===y);e&&c.push((0,a.jsx)(C,{connectOnly:l,provider:y,connector:e,displayName:"coinbase_wallet"===e.walletClientType?"Coinbase":"Base",logo:"coinbase_wallet"===e.walletClientType?m.y:m.z},`${t}-${y}`))}else if(z.includes(y))u&&d.push((0,a.jsx)(C,{connectOnly:l,provider:y,connector:u},`${t}-${y}`));else if("wallet_connect"===y)u&&d.push((0,a.jsx)(C,{connectOnly:l,provider:y,connector:u,logo:u.walletBranding.icon,displayName:"WalletConnect"},`${t}-${y}`));else if(y===r?.wallet){let n="ethereum"===r.chainType&&e.includes("detected_ethereum_wallets"),o="solana"===r.chainType&&e.includes("detected_solana_wallets");if(n||o){let e=p.find(({walletClientType:e})=>e===y);e&&c.push((0,a.jsx)(C,{connectOnly:l,provider:y,displayName:e.walletBranding?.name,logo:e.walletBranding?.icon,connector:e},`${t}-${y}`))}}}return[...s,...c,...d]})({walletList:w.appearance.walletList.filter(e=>!W.some(n=>n.walletClientType===e)&&!O.some(n=>n.walletClientType===e)),walletChainType:e,connectors:n,connectOnly:!0,ignore:[...w.appearance.walletList,...D,...M],walletConnectEnabled:w.externalWallets.walletConnect.enabled}));let L=(0,a.jsx)(g.W,{text:"More wallets",onClick:()=>j("overflow")}),I=({sourceChainType:e,destChainType:n})=>"ethereum"===e&&"solana"===n?"AwaitingEvmToSolBridgingScreen":"ethereum"===e&&"ethereum"===n?"AwaitingExternalEthereumTransferScreen":"solana"===e&&"ethereum"===n?"AwaitingSolToEvmBridgingScreen":A.externalSolanaFundingScreen;return(0,l.useEffect)(()=>{t({...c,externalConnectWallet:{onCompleteNavigateTo:({address:e,walletClientType:n,walletChainType:a})=>{let l=a??"ethereum",o="ethereum"===l?W.find(t=>t.address===e&&t.walletClientType===n):O.find(t=>t.address===e&&t.walletClientType===n);return t({...c,funding:{...A,connectedWallet:o,onContinueWithExternalWallet:()=>{f(I({destChainType:b?"solana":"ethereum",sourceChainType:l}))}},solanaFundingData:c?.solanaFundingData?{...c.solanaFundingData,sourceWalletData:{address:e||"",walletClientType:n||""}}:void 0}),"FundingAmountEditScreen"}}})},[]),(0,a.jsxs)(a.Fragment,"overflow"===T?{children:[(0,a.jsx)(o.M,{backFn:()=>j("default")},"header"),(0,a.jsxs)(p.Q,{children:[(0,a.jsx)(s.S,{style:{color:"var(--privy-color-foreground-3)",textAlign:"left"},children:"More wallets"}),B]}),(0,a.jsx)(o.B,{})]}:{children:[(0,a.jsx)(r.t,{}),(0,a.jsx)(i.C,{title:"Transfer from wallet",description:"Connect a wallet to deposit funds or send funds manually to your wallet address."}),(0,a.jsxs)(p.Q,{children:[B.length>4?B.slice(0,3):B,B.length>4&&L]}),(0,a.jsx)(o.B,{})]})}},F=({onClick:e,icon:n,name:t,chainType:l})=>(0,a.jsxs)(p.A,{onClick:e,children:[(0,a.jsx)(T.I,{style:{width:20},children:(0,a.jsx)("img",{src:n})}),t,(0,a.jsx)(c.C,{color:"gray",style:{marginLeft:"auto"},children:"Connected"}),"solana"===l&&(0,a.jsx)(c.C,{color:"gray",children:"Solana"})]})},77393:(e,n,t)=>{t.d(n,{W:()=>i});var a=t(4913),l=t(36272),o=t(13813);let i=({onClick:e,text:n})=>(0,a.jsxs)(o.A,{onClick:e,children:[(0,a.jsx)(o.C,{children:(0,a.jsx)(l.Z,{})}),(0,a.jsx)(o.G,{children:n})]})},44780:(e,n,t)=>{t.d(n,{F:()=>c,I:()=>r,a:()=>s,b:()=>d,c:()=>u,d:()=>y,e:()=>i,f:()=>g,g:()=>m,h:()=>p});var a=t(96419),l=t(38102),o=t(64870);let i=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  padding-bottom: 24px;
`,r=a.zo.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    border-radius: var(--privy-border-radius-sm);
  }
`,c=a.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`,s=a.zo.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0 16px;
  border-width: 1px !important;
  border-radius: 12px;
  cursor: text;

  &:focus-within {
    border-color: var(--privy-color-accent);
  }
`;a.zo.div`
  font-size: 42px !important;
`;let d=a.zo.input`
  background-color: var(--privy-color-background);
  width: 100%;

  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  && {
    font-size: 26px;
  }
`,p=(0,a.zo)(d)`
  && {
    font-size: 42px;
  }
`;a.zo.button`
  cursor: pointer;
  padding-left: 4px;
`;let u=a.zo.div`
  font-size: 18px;
`,y=a.zo.div`
  font-size: 12px;
  color: var(--privy-color-foreground-3);
  // we need this container to maintain a static height if there's no content
  height: 20px;
`;a.zo.div`
  display: flex;
  flex-direction: row;
  line-height: 22px;
  font-size: 16px;
  text-align: center;
  svg {
    margin-right: 6px;
    margin: auto;
  }
`,(0,a.zo)(o.LinkButton)`
  margin-top: 16px;
`;let h=(0,a.F4)`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;(0,a.zo)(l.d)`
  border-radius: var(--privy-border-radius-md) !important;
  animation: ${h} 0.3s ease-in-out;
`;let g=a.zo.div``,m=a.zo.a`
  && {
    color: var(--privy-color-accent);
  }

  cursor: pointer;
`}};