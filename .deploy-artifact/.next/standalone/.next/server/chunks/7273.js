"use strict";exports.id=7273,exports.ids=[7273],exports.modules={60635:(e,t,n)=>{n.d(t,{Z:()=>i});var a=n(26510);let i=a.forwardRef(function({title:e,titleId:t,...n},i){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:i,"aria-labelledby":t},n),e?a.createElement("title",{id:t},e):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))})},9430:(e,t,n)=>{n.d(t,{Z:()=>i});var a=n(26510);let i=a.forwardRef(function({title:e,titleId:t,...n},i){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:i,"aria-labelledby":t},n),e?a.createElement("title",{id:t},e):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"}))})},46400:(e,t,n)=>{n.d(t,{Q:()=>i});var a=n(41204);function i(e){let t=e.filter(e=>!a.e.has(e.id));return a.B.concat(t)}},56370:(e,t,n)=>{n.d(t,{Cr:()=>s,LH:()=>o,R1:()=>r});var a=n(10),i=n(91299);function r(e){return e?`${e.slice(0,5)}…${e.slice(-4)}`:""}function s({wei:e,precision:t=3}){return parseFloat((0,a.d)(e)).toFixed(t).replace(/0+$/,"").replace(/\.$/,"")}function o({amount:e,decimals:t}){return(0,i.b)(BigInt(e),t)}},27273:(e,t,n)=>{let a,i,r,s;n.r(t),n.d(t,{FundSolWalletWithExternalSolanaWallet:()=>eV,default:()=>eV});var o=n(4913),l=n(60635),c=n(26510),d=n(56370),u=n(38102),g=n(38198),p=n(82145),f=n(42365),h=n(8992),m=n(90684),v=n(63622),y=n(51766),w=n(14348),b=n(49171),A=n(55182),S=n(47949),x=n(51542),T=n(28958),E=n(3303),C=n(99710),j=n(55976),I=n(2207),P=n(36577),F=n(63152);let O=()=>{let{walletProxy:e,client:t}=(0,b.u)();return(0,c.useMemo)(()=>({signWithUserSigner:async({message:n,targetAppId:a})=>{if(!e)throw Error("Wallet proxy not initialized");let i=await t.getAccessToken();if(!i)throw Error("User must be authenticated");let{signature:r}=await e.signWithUserSigner({accessToken:i,message:n,targetAppId:a});return{signature:r}}}),[e,t])};var U=n(75989),W=n(83767),k=n(22554);let M=["solana:mainnet","solana:devnet","solana:testnet"];function N(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw TypeError("attempted to use private field on non-instance");return e}var D=0,L="__private_"+D+++"__implementation";function _(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw TypeError("attempted to use private field on non-instance");return e}var z=0;function B(e){return"__private_"+z+++"_"+e}var R=B("_address"),V=B("_publicKey"),$=B("_chains"),Q=B("_features"),H=B("_label"),Z=B("_icon");class J{get address(){return _(this,R)[R]}get publicKey(){return _(this,V)[V].slice()}get chains(){return _(this,$)[$].slice()}get features(){return _(this,Q)[Q].slice()}get label(){return _(this,H)[H]}get icon(){return _(this,Z)[Z]}constructor({address:e,publicKey:t,label:n,icon:a}){Object.defineProperty(this,R,{writable:!0,value:void 0}),Object.defineProperty(this,V,{writable:!0,value:void 0}),Object.defineProperty(this,$,{writable:!0,value:void 0}),Object.defineProperty(this,Q,{writable:!0,value:void 0}),Object.defineProperty(this,H,{writable:!0,value:void 0}),Object.defineProperty(this,Z,{writable:!0,value:void 0}),_(this,R)[R]=e,_(this,V)[V]=t,_(this,$)[$]=M,_(this,H)[H]=n,_(this,Z)[Z]=a,_(this,Q)[Q]=["solana:signAndSendTransaction","solana:signTransaction","solana:signMessage"],new.target===J&&Object.freeze(this)}}function G(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw TypeError("attempted to use private field on non-instance");return e}var Y=0;function K(e){return"__private_"+Y+++"_"+e}var q=K("_listeners"),X=K("_version"),ee=K("_name"),et=K("_icon"),en=K("_injection"),ea=K("_isPrivyWallet"),ei=K("_accounts"),er=K("_on"),es=K("_emit"),eo=K("_off"),el=K("_connected"),ec=K("_connect"),ed=K("_disconnect"),eu=K("_signMessage"),eg=K("_signAndSendTransaction"),ep=K("_signTransaction");function ef(e,...t){G(this,q)[q][e]?.forEach(e=>e.apply(null,t))}function eh(e,t){G(this,q)[q][e]=G(this,q)[q][e]?.filter(e=>t!==e)}function em(){let{isHeadlessSigning:e,walletProxy:t,initializeWalletProxy:n,recoverEmbeddedWallet:a,openModal:i,privy:r,client:s}=(0,b.u)(),{user:o}=(0,j.u)(),{setModalData:l}=(0,A.a)(),{signWithUserSigner:c}=O();return{signMessage:({message:d,address:u,options:g})=>new Promise(async(p,f)=>{let h=(0,A.j)(o,u);if("privy"!==h?.walletClientType)return void f(new b.b("Wallet is not a Privy wallet",void 0,b.c.EMBEDDED_WALLET_NOT_FOUND));let{entropyId:m,entropyIdVerifier:v}=(0,I.b)(o,h),y=(0,A.b)(h),w=(0,U.b)(d).toString("base64");if(w.length<1)return void f(new b.b("Message must be a non-empty string",void 0,b.c.INVALID_MESSAGE));let S=async()=>{let e;if(!o)throw Error("User must be authenticated before signing with a Privy wallet");let i=await s.getAccessToken();if(!i)throw Error("User must be authenticated to use their embedded wallet.");let l=t??await n(15e3);if(!l)throw Error("Failed to initialize embedded wallet proxy.");if(!await a({address:h.address}))throw Error("Unable to connect to wallet");if(y){let t=await (0,E.f)(r,c,{chain_type:"solana",method:"signMessage",params:{message:w,encoding:"base64"},wallet_id:h.id});if(!t.data||!("signature"in t.data))throw Error("Failed to sign message");e=t.data.signature}else{let{response:t}=await l.rpc({accessToken:i,entropyId:m,entropyIdVerifier:v,chainType:"solana",hdWalletIndex:h.walletIndex??0,requesterAppId:g?.uiOptions?.requesterAppId,request:{method:"signMessage",params:{message:w}}});e=t.data.signature}return e};if(e({showWalletUIs:g?.uiOptions?.showWalletUIs}))try{let e=await S(),t=new Uint8Array((0,U.b)(e,"base64"));p({signature:t})}catch(e){f(e)}else l({signMessage:{method:"solana_signMessage",data:w,confirmAndSign:S,onSuccess:e=>{p({signature:new Uint8Array((0,U.b)(e,"base64"))})},onFailure:e=>{f(e)},uiOptions:g?.uiOptions??{}},connectWallet:{recoveryMethod:h.recoveryMethod,connectingWalletAddress:h.address,entropyId:m,entropyIdVerifier:v,isUnifiedWallet:y,onCompleteNavigateTo:"SignRequestScreen",onFailure:e=>{f(new b.b("Failed to connect to wallet",e,b.c.UNKNOWN_CONNECT_WALLET_ERROR))}}}),i("EmbeddedWalletConnectingScreen")})}}function ev(){let{isHeadlessSigning:e,openModal:t,privy:n}=(0,b.u)(),{setModalData:a}=(0,A.a)(),{signMessage:i}=em(),{signWithUserSigner:r}=O(),{user:s}=(0,j.u)();return{signTransaction:async({transaction:o,options:l,chain:c="solana:mainnet",address:d})=>{let u=(0,A.j)(s,d);if("privy"!==u?.walletClientType)throw new b.b("Wallet is not a Privy wallet",void 0,b.c.EMBEDDED_WALLET_NOT_FOUND);let g=(0,A.b)(u);async function p(e){let t,a;if(g){let t=await (0,E.f)(n,r,{chain_type:"solana",method:"signTransaction",params:{transaction:W.j.base64.fromBytes(e),encoding:"base64"},wallet_id:u.id});if(t.data&&"signed_transaction"in t.data)return{signedTransaction:new Uint8Array(W.j.base64.toBytes(t.data.signed_transaction))};throw Error("Failed to sign transaction")}let{signature:s}=await i({message:(0,U.a)(e),address:d,options:{...l,uiOptions:{...l?.uiOptions,showWalletUIs:!1}}});return{signedTransaction:(t=structuredClone((0,x.x7)().decode(e)),(a=(0,T.Lk)(d))in t.signatures&&(t.signatures[a]=s),new Uint8Array((0,x.Kt)().encode(t)))}}return e({showWalletUIs:l?.uiOptions?.showWalletUIs})?p(o):new Promise(async(e,n)=>{let{entropyId:i,entropyIdVerifier:r}=(0,I.b)(s,u);function d(e){return t=>{n(t instanceof b.b?t:new b.b("Failed to connect to wallet",t,e))}}let f={account:u,transaction:o,chain:c,signOnly:!0,uiOptions:l?.uiOptions||{},onConfirm:p,onSuccess:e,onFailure:d(b.c.TRANSACTION_FAILURE)};a({connectWallet:{recoveryMethod:u.recoveryMethod,connectingWalletAddress:u.address,entropyId:i,entropyIdVerifier:r,isUnifiedWallet:g,onCompleteNavigateTo:"StandardSignAndSendTransactionScreen",onFailure:d(b.c.UNKNOWN_CONNECT_WALLET_ERROR)},standardSignAndSendTransaction:f}),t("EmbeddedWalletConnectingScreen")})}}}let ey=new class extends P.Z{setImplementation(e){N(this,L)[L]=e}async signMessage(e){return N(this,L)[L].signMessage(e)}async signAndSendTransaction(e){return N(this,L)[L].signAndSendTransaction(e)}async signTransaction(e){return N(this,L)[L].signTransaction(e)}constructor(e){super(),Object.defineProperty(this,L,{writable:!0,value:void 0}),N(this,L)[L]=e}}({signTransaction:(0,b.l)("signTransaction was not injected"),signAndSendTransaction:(0,b.l)("signAndSendTransaction was not injected"),signMessage:(0,b.l)("signMessage was not injected")}),ew=new class{get version(){return G(this,X)[X]}get name(){return G(this,ee)[ee]}get icon(){return G(this,et)[et]}get chains(){return M.slice()}get features(){return{"standard:connect":{version:"1.0.0",connect:G(this,ec)[ec]},"standard:disconnect":{version:"1.0.0",disconnect:G(this,ed)[ed]},"standard:events":{version:"1.0.0",on:G(this,er)[er]},"solana:signAndSendTransaction":{version:"1.0.0",supportedTransactionVersions:["legacy",0],signAndSendTransaction:G(this,eg)[eg]},"solana:signTransaction":{version:"1.0.0",supportedTransactionVersions:["legacy",0],signTransaction:G(this,ep)[ep]},"solana:signMessage":{version:"1.0.0",signMessage:G(this,eu)[eu]},"privy:":{privy:{signMessage:G(this,en)[en].signMessage,signTransaction:G(this,en)[en].signTransaction,signAndSendTransaction:G(this,en)[en].signAndSendTransaction}}}}get accounts(){return G(this,ei)[ei].slice()}get isPrivyWallet(){return G(this,ea)[ea]}constructor({name:e,icon:t,version:n,injection:a,wallets:i}){Object.defineProperty(this,es,{value:ef}),Object.defineProperty(this,eo,{value:eh}),Object.defineProperty(this,q,{writable:!0,value:void 0}),Object.defineProperty(this,X,{writable:!0,value:void 0}),Object.defineProperty(this,ee,{writable:!0,value:void 0}),Object.defineProperty(this,et,{writable:!0,value:void 0}),Object.defineProperty(this,en,{writable:!0,value:void 0}),Object.defineProperty(this,ea,{writable:!0,value:void 0}),Object.defineProperty(this,ei,{writable:!0,value:void 0}),Object.defineProperty(this,er,{writable:!0,value:void 0}),Object.defineProperty(this,el,{writable:!0,value:void 0}),Object.defineProperty(this,ec,{writable:!0,value:void 0}),Object.defineProperty(this,ed,{writable:!0,value:void 0}),Object.defineProperty(this,eu,{writable:!0,value:void 0}),Object.defineProperty(this,eg,{writable:!0,value:void 0}),Object.defineProperty(this,ep,{writable:!0,value:void 0}),G(this,q)[q]={},G(this,er)[er]=(e,t)=>(G(this,q)[q][e]?.push(t)||(G(this,q)[q][e]=[t]),()=>G(this,eo)[eo](e,t)),G(this,el)[el]=e=>{null!=e&&(G(this,ei)[ei]=e.map(({address:e})=>new J({address:e,publicKey:F.Jq.decode(e)}))),G(this,es)[es]("change",{accounts:this.accounts})},G(this,ec)[ec]=async()=>(G(this,es)[es]("change",{accounts:this.accounts}),{accounts:this.accounts}),G(this,ed)[ed]=async()=>{G(this,es)[es]("change",{accounts:this.accounts})},G(this,eu)[eu]=async(...e)=>{let t=[];for(let{account:n,...a}of e){let{signature:e}=await G(this,en)[en].signMessage({...a,address:n.address});t.push({signedMessage:a.message,signature:e})}return t},G(this,eg)[eg]=async(...e)=>{let t=[];for(let n of e){let{signature:e}=await G(this,en)[en].signAndSendTransaction({...n,transaction:n.transaction,address:n.account.address,chain:n.chain||"solana:mainnet",options:n.options});t.push({signature:e})}return t},G(this,ep)[ep]=async(...e)=>{let t=[];for(let{transaction:n,account:a,options:i,chain:r}of e){let{signedTransaction:e}=await G(this,en)[en].signTransaction({transaction:n,address:a.address,chain:r||"solana:mainnet",options:i});t.push({signedTransaction:e})}return t},G(this,ee)[ee]=e,G(this,et)[et]=t,G(this,X)[X]=n,G(this,en)[en]=a,G(this,ei)[ei]=[],G(this,ea)[ea]=!0,a.on("accountChanged",G(this,el)[el],this),G(this,el)[el](i)}}({name:"Privy",version:"1.0.0",icon:"data:image/png;base64,AAABAAEAFBQAAAAAIABlAQAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAUAAAAFAgGAAAAjYkdDQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAQVJREFUeJxiYMANZIC4E4ivAPFPIP4FxDeAuB+IlfDowwBMQFwJxF+B+D8O/AOI66Bq8QJGIF6ExyB0vAqImfEZmEeCYTDcgMswPiB+T4aB34FYApuBsWQYBsP52AycToGBK7EZuJECAw9jM3AVBQbuwWZgIwUGTsZmoDkFBnpiMxAEjpJh2FV8iVsbiD+TYBgoDVrgMgwGnID4HRGGgTKBGyHDYEAaiBdCSxh0g/5AU4Q8sYYhAzEgjoGmABBOgFo2eACowFABYn0oVgViAVINkQTiZUD8DIj/ATF6GILEXgLxCiCWIsZAbiAuBeKtQHwHiEHJ6C8UfwHie0C8E4jLoWpRAAAAAP//rcbhsQAAAAZJREFUAwBYFs3VKJ0cuQAAAABJRU5ErkJggg==",wallets:[],injection:ey});var eb=n(29499),eA=n(26844),eS=n(19118),ex=n(69586),eT=n(34354),eE=n(85563),eC=n(32983),ej=((a=ej||{})[a.Uninitialized=0]="Uninitialized",a[a.Initialized=1]="Initialized",a),eI=((i=eI||{})[i.Legacy=0]="Legacy",i[i.Current=1]="Current",i),eP=((r=eP||{})[r.Nonce=0]="Nonce",r),eF=((s=eF||{})[s.CreateAccount=0]="CreateAccount",s[s.Assign=1]="Assign",s[s.TransferSol=2]="TransferSol",s[s.CreateAccountWithSeed=3]="CreateAccountWithSeed",s[s.AdvanceNonceAccount=4]="AdvanceNonceAccount",s[s.WithdrawNonceAccount=5]="WithdrawNonceAccount",s[s.InitializeNonceAccount=6]="InitializeNonceAccount",s[s.AuthorizeNonceAccount=7]="AuthorizeNonceAccount",s[s.Allocate=8]="Allocate",s[s.AllocateWithSeed=9]="AllocateWithSeed",s[s.AssignWithSeed=10]="AssignWithSeed",s[s.TransferSolWithSeed=11]="TransferSolWithSeed",s[s.UpgradeNonceAccount=12]="UpgradeNonceAccount",s);function eO(e){return!!e&&"object"==typeof e&&"address"in e&&(0,ex.he)(e)}var eU=n(79726),eW=n(81340),ek=n(42582),eM=n(24689),eN=n(58103),eD=n(81033);function eL({rows:e}){return(0,o.jsx)(y.a,{children:e.filter(e=>!!e).map((e,t)=>null!=e.value||e.isLoading?(0,o.jsxs)(y.R,{children:[(0,o.jsx)(v.L,{children:e.label}),(0,o.jsx)(v.V,{$isLoading:e.isLoading,children:e.value})]},t):null)})}function e_(e){return BigInt(Math.floor(1e9*parseFloat(e)))}function ez(e){return+eB.format(parseFloat(e.toString())/1e9)}n(46898),n(50470);let eB=Intl.NumberFormat(void 0,{maximumFractionDigits:8});async function eR({tx:e,solanaClient:t,amount:n,asset:a,tokenPrice:i}){if(!e)return null;if("SOL"===a&&i){let a=e_(n),r=(0,eM.g)(a,i),s=await (0,U.f)({solanaClient:t,tx:e});return{amountInUsd:r,feeInUsd:i?(0,eM.g)(s,i):void 0,totalInUsd:(0,eM.g)(a+s,i)}}if("USDC"===a&&i){let a;let r="$"+n,s=await (0,U.f)({solanaClient:t,tx:e}),o=(a=parseFloat(s.toString())/eM.L*i)<.01?0:a;return{amountInUsd:r,feeInUsd:(0,eM.g)(s,i),totalInUsd:"$"+(parseFloat(n)+o).toFixed(2)}}if("SOL"===a){let a=e_(n),i=await (0,U.f)({solanaClient:t,tx:e});return{amountInSol:n+" SOL",feeInSol:ez(i)+" SOL",totalInSol:ez(a+i)+" SOL"}}return{amountInUsdc:n+" USDC",feeInSol:ez(await (0,U.f)({solanaClient:t,tx:e}))+" SOL"}}let eV={component:function(){let e=(0,w.u)(),{closePrivyModal:t,createAnalyticsEvent:n}=(0,b.u)(),{data:a,setModalData:i,navigate:r}=(0,A.a)(),{wallets:s}=function(){let{ready:e,wallets:t}=function(){let{client:e}=(0,b.u)(),{ready:t,wallet:n}=function(){let{ready:e}=(0,I.u)(),{user:t}=(0,j.u)(),{signMessage:n}=em(),{signTransaction:a}=ev(),{signAndSendTransaction:i}=function(){let e=(0,w.u)(),{isHeadlessSigning:t,openModal:n,privy:a}=(0,b.u)(),{setModalData:i}=(0,A.a)(),{signTransaction:r}=ev(),s=(0,U.u)(),{user:o}=(0,j.u)(),{signWithUserSigner:l}=O();return{signAndSendTransaction:async({transaction:c,address:d,chain:u="solana:mainnet",options:g})=>{let p=(0,A.j)(o,d);if("privy"!==p?.walletClientType)throw new b.b("Wallet is not a Privy wallet",void 0,b.c.EMBEDDED_WALLET_NOT_FOUND);let f=(0,A.b)(p);async function h(e){if(g?.sponsor)return await (async e=>{if(!f)throw new b.b("Sponsoring transactions is only supported for wallets on the TEE stack",b.c.INVALID_DATA);let t=await (0,E.f)(a,l,{chain_type:"solana",method:"signAndSendTransaction",sponsor:!0,params:{transaction:(0,U.b)(e).toString("base64"),encoding:"base64"},caip2:`solana:${(await s(u).rpc.getGenesisHash().send()).substring(0,32)}`,wallet_id:p.id});if(t.data&&"hash"in t.data)return{signature:F.Jq.decode(t.data.hash)};throw Error("Failed to sign and send transaction")})(e);let{signedTransaction:t}=await r({transaction:e,address:d,chain:u,options:{...g,uiOptions:{...g?.uiOptions,showWalletUIs:!1}}}),{signature:n}=await s(u).sendAndConfirmTransaction(t);return{signature:n}}return t({showWalletUIs:g?.uiOptions?.showWalletUIs})?h(c):new Promise(async(t,a)=>{let r,s,{entropyId:l,entropyIdVerifier:m}=(0,I.b)(o,p);function v(e){return t=>{a(t instanceof b.b?t:new b.b("Failed to connect to wallet",t,e))}}let y={account:p,transaction:c,chain:u,signOnly:!1,uiOptions:g?.uiOptions||{},onConfirm:h,onSuccess:t,onFailure:v(b.c.TRANSACTION_FAILURE),isSponsored:!!g?.sponsor},w={recoveryMethod:p.recoveryMethod,connectingWalletAddress:p.address,entropyId:l,entropyIdVerifier:m,isUnifiedWallet:f,onCompleteNavigateTo:"StandardSignAndSendTransactionScreen",onFailure:v(b.c.UNKNOWN_CONNECT_WALLET_ERROR)};e.fundingConfig&&(r=(0,k.y)({address:d,appConfig:e,methodScreen:"FundingMethodSelectionScreen",fundWalletConfig:{...g,asset:"native-currency",chain:u},externalSolanaFundingScreen:"FundSolWalletWithExternalSolanaWallet"}),s={amount:e.fundingConfig.defaultRecommendedAmount,asset:"SOL",chain:u,destinationAddress:d,afterSuccessScreen:"StandardSignAndSendTransactionScreen",sourceWalletData:void 0}),i({connectWallet:w,standardSignAndSendTransaction:y,funding:r,solanaFundingData:s}),n("EmbeddedWalletConnectingScreen")})}}}(),r=(0,c.useMemo)(()=>{let e=[...(0,A.m)(t).sort((e,t)=>(e.walletIndex??0)-(t.walletIndex??0))],n=(0,A.h)(t);return n.length?[...e,...n]:e},[t]),s=(0,c.useMemo)(()=>({signMessage:async({message:e,address:t,options:a})=>await n({message:e,address:t,options:a}),signTransaction:async({transaction:e,address:t,chain:n,options:i})=>await a({transaction:e,address:t,chain:n,options:i}),async signAndSendTransaction({transaction:e,address:t,chain:n,options:a}){let{signature:r}=await i({transaction:e,address:t,chain:n,options:a});return{signature:r}}}),[n,a,i]);return(0,c.useEffect)(()=>{ey?.setImplementation(s)},[s]),(0,c.useEffect)(()=>{var t;!e||(t=ew.accounts).length===r.length&&t.every((e,t)=>e.address===r[t]?.address)||ey?.emit("accountChanged",r)},[e,r]),{ready:e,wallet:ew}}(),[a,i]=(0,c.useState)([]),[r,s]=(0,c.useState)([]);return(0,c.useEffect)(()=>{let e=[n,...a.filter(e=>"solana"===e.chainType&&!!e.wallet.features).map(e=>e.wallet)];s(e);let t=a.flatMap(t=>{let n=()=>s([...e]);return t.on("walletsUpdated",n),{connector:t,off:n}}),i=e.map(t=>t.features["standard:events"]?.on("change",()=>{s([...e])}));return()=>{i.forEach(e=>e?.()),t.forEach(({connector:e,off:t})=>e.off("walletsUpdated",t))}},[a]),(0,c.useEffect)(()=>{i(e.connectors?.walletConnectors.filter(e=>"solana"===e.chainType)??[]);let t=()=>{i(e.connectors?.walletConnectors.filter(e=>"solana"===e.chainType)??[])};return e.connectors?.on("connectorInitialized",t),()=>{e.connectors?.off("connectorInitialized",t)}},[t,e.connectors]),{ready:t,wallets:r}}();return{ready:e,wallets:(0,c.useMemo)(()=>t.flatMap(e=>e.accounts.map(t=>new C.O({wallet:e,account:t}))),[t])}}(),[v,y]=(0,c.useState)("preparing"),[T,P]=(0,c.useState)(),[W,M]=(0,c.useState)(),[N,D]=(0,c.useState)();if(!a?.solanaFundingData)throw Error("Funding config is missing");if(!a.solanaFundingData.sourceWalletData)throw Error("Funding config is missing source wallet data");let{amount:L,asset:_,chain:z,sourceWalletData:B,destinationAddress:R,afterSuccessScreen:V}=a.solanaFundingData,$=s.find(e=>e.address===B.address&&(0,k.I)(B.walletClientType)===(0,k.I)(e.standardWallet.name)),Q=(0,U.u)()(z),{tokenPrice:H,isTokenPriceLoading:Z}=(0,eb.u)("solana");return(0,c.useEffect)(()=>{if("preparing"!==v||Z||!$)return;let e="SOL"===_?e_(L):BigInt(Math.floor(1e6*parseFloat(L)));M({amount:("SOL"===_&&H?(0,eM.g)(e,H):L)??L}),("SOL"===_?async function({solanaClient:e,source:t,destination:n,amountInLamports:a}){let{value:i}=await e.rpc.getLatestBlockhash().send(),r={address:t},s=(0,eU.z)((0,eW.fy)({version:0}),e=>(0,ex.Qg)(r,e),e=>(0,eW.bV)(i,e),e=>(0,eW.d3)(function(e,t){let n={source:{value:e.source??null,isWritable:!0},destination:{value:e.destination??null,isWritable:!0}},a={...e},i=e=>{if(!e.value)return;let t=e.isWritable?eS.g4.WRITABLE:eS.g4.READONLY;return Object.freeze({address:function(e){if(!e)throw Error("Expected a Address.");return"object"==typeof e&&"address"in e?e.address:Array.isArray(e)?e[0]:e}(e.value),role:eO(e.value)?(0,eS.$k)(t):t,...eO(e.value)?{signer:e.value}:{}})};return Object.freeze({accounts:[i(n.source),i(n.destination)],data:(0,eT.Nz)((0,eE.Q5)([["discriminator",(0,eC.Nf)()],["amount",(0,eC.bP)()]]),e=>({...e,discriminator:2})).encode(a),programAddress:(void 0)??"11111111111111111111111111111111"})}({amount:a,source:r,destination:n}),e),e=>(0,x.qy)(e));return new Uint8Array((0,x.Kt)().encode(s))}({solanaClient:Q,source:$.address,destination:R,amountInLamports:e}):async function({solanaClient:e,source:t,destination:n,amountInBaseUnits:a}){let i=(0,eN.g)(e.chain),{value:r}=await e.rpc.getLatestBlockhash().send(),s={address:t},[o]=await (0,ek.BQD)({mint:i,owner:t,tokenProgram:eM.T}),[l]=await (0,ek.BQD)({mint:i,owner:n,tokenProgram:eM.T}),[c,d]=await Promise.all([e.rpc.getAccountInfo(o,{commitment:"confirmed",encoding:"jsonParsed"}).send().catch(()=>null),e.rpc.getAccountInfo(l,{commitment:"confirmed",encoding:"jsonParsed"}).send().catch(()=>null)]);if(!c?.value)throw Error(`Source token account does not exist for address: ${t}`);let u=(0,ek.mo_)({payer:s,ata:l,owner:n,mint:i}),g=(0,eU.z)((0,eW.fy)({version:0}),e=>(0,ex.Qg)(s,e),e=>(0,eW.bV)(r,e),e=>d?.value?e:(0,eW.d3)(u,e),e=>(0,eW.d3)((0,ek.y3x)({source:o,destination:l,authority:s,amount:a}),e),e=>(0,x.qy)(e));return new Uint8Array((0,x.Kt)().encode(g))}({solanaClient:Q,source:$.address,destination:R,amountInBaseUnits:e})).then(P).catch(e=>{y("error"),D(e)})},[v,L,_,z,$,R,Z,H]),(0,c.useEffect)(()=>{"preparing"===v&&T&&eR({tx:T,solanaClient:Q,amount:L,asset:_,tokenPrice:H}).then(e=>{y("loaded"),M({amount:e?.amountInUsd??e?.amountInUsdc??e?.amountInSol??L,fee:e?.feeInUsd??e?.feeInSol,total:e?.totalInUsd??e?.totalInSol})}).catch(e=>{y("error"),D(e)})},[T,L,_,v,H]),(0,c.useEffect)(()=>{"error"===v&&N&&(i({errorModalData:{error:N,previousScreen:"FundSolWalletWithExternalSolanaWallet"},solanaFundingData:a.solanaFundingData}),r("ErrorScreen",!1))},[v,r]),(0,c.useEffect)(()=>{if("success"!==v)return;let e=setTimeout(V?()=>r(V):t,w.t);return()=>clearTimeout(e)},[v]),(0,o.jsxs)(o.Fragment,"success"===v?{children:[(0,o.jsx)(f.t,{}),(0,o.jsx)(g.b,{}),(0,o.jsxs)(g.c,{children:[(0,o.jsx)(l.Z,{color:"var(--privy-color-success)",width:"64px",height:"64px"}),(0,o.jsx)(p.C,{title:"Success!",description:`You’ve successfully added ${L} ${_} to your ${e.name} wallet. It may take a minute before the funds are available to use.`})]}),(0,o.jsx)(g.R,{}),(0,o.jsx)(u.B,{})]}:"preparing"===v||"loaded"===v||"sending"===v?{children:[(0,o.jsx)(f.t,{}),(0,o.jsx)(g.e,{style:{marginTop:"16px"},children:(0,o.jsx)(h.I,{icon:$?.standardWallet.icon,name:$?.standardWallet.name})}),(0,o.jsx)(p.C,{style:{marginTop:"8px",marginBottom:"12px"},title:"sending"===v&&$?`Confirming with ${$.standardWallet.name}`:"Confirm transaction"}),(0,o.jsx)(eL,{rows:[{label:"Source",value:(0,d.R1)(B.address)},{label:"Destination",value:(0,d.R1)(R)},{label:"Network",value:(0,eD.g)(z)},{label:"Amount",value:W?.amount,isLoading:"preparing"===v},{label:"Estimated fee",value:W?.fee,isLoading:"preparing"===v},{label:"Total",value:W?.total,isLoading:"preparing"===v}]}),(0,o.jsx)(u.P,{style:{marginTop:"1rem"},loading:"preparing"===v||"sending"===v,onClick:function(){"loaded"===v&&T&&$&&(y("sending"),(async function({transaction:e,chain:t,sourceWallet:n,solanaClient:a}){var i;let{hasFunds:r}=await (0,U.s)({solanaClient:a,tx:e});if(!r)throw new b.b(`Wallet ${(0,d.R1)(n.address)} does not have enough funds.`,void 0,b.c.INSUFFICIENT_BALANCE);let s=(i=(await n.signAndSendTransaction({transaction:e,chain:t}).catch(e=>{throw new b.b("Transaction was rejected by the user",e,b.c.TRANSACTION_FAILURE)})).signature,(0,S._V)().decode(i));return await (0,U.w)({rpcSubscriptions:a.rpcSubscriptions,signature:s,timeout:2e4}),s})({solanaClient:Q,transaction:T,chain:z,sourceWallet:$}).then(e=>{y("success"),n({eventName:eA.O,payload:{provider:"external",status:"success",txHash:e,address:$.address,value:L,chainType:"solana",clusterName:z,token:_,destinationAddress:R,destinationValue:L,destinationChainType:"solana",destinationClusterName:z,destinationToken:_}})}).catch(e=>{y("error"),D(e)}))},children:"Confirm"}),(0,o.jsx)(u.B,{})]}:{children:[(0,o.jsx)(f.t,{}),(0,o.jsx)(m.N,{}),(0,o.jsx)("div",{style:{marginTop:"1rem"}}),(0,o.jsx)(u.B,{})]})}}},42365:(e,t,n)=>{n.d(t,{t:()=>s});var a=n(4913),i=n(55182),r=n(38102);function s({title:e}){let{currentScreen:t,navigateBack:n,navigate:s,data:o,setModalData:l}=(0,i.a)();return(0,a.jsx)(r.M,{title:e,backFn:"ManualTransferScreen"===t?n:t===o?.funding?.methodScreen?o.funding.comingFromSendTransactionScreen?()=>s("SendTransactionScreen"):void 0:o?.funding?.methodScreen?()=>{let e=o.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),l({funding:e,solanaFundingData:o?.solanaFundingData}),s(e.methodScreen)}:void 0})}},8992:(e,t,n)=>{n.d(t,{I:()=>r});var a=n(4913),i=n(9430);let r=({icon:e,name:t})=>"string"==typeof e?(0,a.jsx)("img",{alt:`${t||"wallet"} logo`,src:e,style:{height:24,width:24,borderRadius:4}}):void 0===e?(0,a.jsx)(i.Z,{style:{height:24,width:24}}):e?(0,a.jsx)(e,{style:{height:24,width:24}}):null},38198:(e,t,n)=>{n.d(t,{B:()=>i,C:()=>o,F:()=>c,H:()=>s,R:()=>p,S:()=>u,a:()=>d,b:()=>g,c:()=>l,d:()=>f,e:()=>r});var a=n(96419);let i=a.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,r=a.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,s=a.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,o=(0,a.zo)(r)`
  padding: 20px 0;
`,l=(0,a.zo)(r)`
  gap: 16px;
`,c=a.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;a.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=a.zo.div`
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
`,g=a.zo.div`
  height: 16px;
`,p=a.zo.div`
  height: 12px;
`;a.zo.div`
  position: relative;
`;let f=a.zo.div`
  height: ${e=>e.height??"12"}px;
`;a.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},66461:(e,t,n)=>{n.d(t,{L:()=>r});var a=n(96419);let i=(0,a.F4)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,r=(0,a.iv)`
  ${e=>e.$isLoading?(0,a.iv)`
          width: 35%;
          animation: ${i} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},51766:(e,t,n)=>{n.d(t,{R:()=>r,a:()=>i});var a=n(96419);let i=a.zo.span`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
`,r=a.zo.span`
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 0.5rem;
`},82145:(e,t,n)=>{n.d(t,{C:()=>s,S:()=>r});var a=n(4913),i=n(96419);let r=({title:e,description:t,children:n,...i})=>(0,a.jsx)(o,{...i,children:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("h3",{children:e}),"string"==typeof t?(0,a.jsx)("p",{children:t}):t,n]})});(0,i.zo)(r)`
  margin-bottom: 24px;
`;let s=({title:e,description:t,icon:n,children:i,...r})=>(0,a.jsxs)(l,{...r,children:[n||null,(0,a.jsx)("h3",{children:e}),t&&"string"==typeof t?(0,a.jsx)("p",{children:t}):t,i]}),o=i.zo.div`
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
`,l=(0,i.zo)(o)`
  align-items: center;
  text-align: center;
  gap: 16px;

  h3 {
    margin-bottom: 24px;
  }
`},63622:(e,t,n)=>{n.d(t,{L:()=>r,V:()=>o,a:()=>s});var a=n(96419),i=n(66461);let r=a.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */
`,s=(0,a.zo)(r)`
  color: var(--privy-color-accent);
`,o=a.zo.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.375rem; /* 157.143% */
  word-break: break-all;
  text-align: right;

  ${i.L}
`},26844:(e,t,n)=>{n.d(t,{O:()=>a});let a="sdk_fiat_on_ramp_completed_with_status"},81033:(e,t,n)=>{n.d(t,{g:()=>a});function a(e){switch(e){case"solana:mainnet":return"Solana";case"solana:devnet":return"Devnet";case"solana:testnet":return"Testnet"}}},24689:(e,t,n)=>{n.d(t,{A:()=>o,D:()=>d,J:()=>c,L:()=>a,R:()=>l,S:()=>i,T:()=>r,a:()=>s,g:()=>u});let a=1e9,i="11111111111111111111111111111111",r="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",s="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",o="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",l=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],c=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],d={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}};function u(e,t){let n=parseFloat(e.toString())/a,i=g.format(t*n);return"$0.00"===i?"<$0.01":i}let g=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},58103:(e,t,n)=>{n.d(t,{g:()=>i});var a=n(24689);function i(e){let[t]=Object.entries(a.D[e]).find(([e,t])=>"USDC"===t.symbol)??[];return t}},90684:(e,t,n)=>{n.d(t,{N:()=>r});var a=n(4913),i=n(96419);let r=({size:e,centerIcon:t})=>(0,a.jsx)(s,{$size:e,children:(0,a.jsxs)(o,{children:[(0,a.jsx)(c,{}),(0,a.jsx)(d,{}),t?(0,a.jsx)(l,{children:t}):null]})}),s=i.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,o=i.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=i.zo.div`
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
`,c=i.zo.div`
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
`,d=i.zo.div`
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
`},9781:(e,t,n)=>{n.d(t,{u:()=>r});var a=n(26510),i=n(49171);let r=({enabled:e=!0}={})=>{let{showFiatPrices:t,getUsdPriceForSol:n}=(0,i.u)(),[r,s]=(0,a.useState)(!0),[o,l]=(0,a.useState)(void 0),[c,d]=(0,a.useState)(void 0);return(0,a.useEffect)(()=>{(async()=>{if(t&&e)try{s(!0);let e=await n();e?d(e):l(Error("Unable to fetch SOL price"))}catch(e){l(e)}finally{s(!1)}else s(!1)})()},[]),{solPrice:c,isSolPriceLoading:r,solPriceError:o}}},29499:(e,t,n)=>{n.d(t,{u:()=>l});var a=n(26510),i=n(46400),r=n(14348),s=n(49171),o=n(9781);function l(e){let{tokenPrice:t,isTokenPriceLoading:n,tokenPriceError:l}=(e=>{let{showFiatPrices:t,getUsdTokenPrice:n,chains:o}=(0,s.u)(),[l,c]=(0,a.useState)(!0),[d,u]=(0,a.useState)(void 0),[g,p]=(0,a.useState)(void 0);return(0,a.useEffect)(()=>{e||=r.s;let a=(0,i.Q)(o).find(t=>t.id===Number(e));(async()=>{if(t){if(!a)return c(!1),void u(Error(`Unable to fetch token price on chain id ${e}`));try{c(!0);let e=await n(a);e?p(e):u(Error(`Unable to fetch token price on chain id ${a.id}`))}catch(e){u(e)}finally{c(!1)}}else c(!1)})()},[e]),{tokenPrice:g,isTokenPriceLoading:l,tokenPriceError:d}})("solana"===e?-1:e),{solPrice:c,isSolPriceLoading:d,solPriceError:u}=(0,o.u)({enabled:"solana"===e});return"solana"===e?{tokenPrice:c,isTokenPriceLoading:d,tokenPriceError:u}:{tokenPrice:t,isTokenPriceLoading:n,tokenPriceError:l}}},75989:(e,t,n)=>{n.d(t,{a:()=>d,b:()=>p,f:()=>u,s:()=>g,u:()=>h,w:()=>f});var a=n(51542),i=n(47949),r=n(26510),s=n(14348),o=n(16820),l=n(49171);let c=Symbol("default-solana-rpcs-plugin");function d(e){return new Uint8Array((0,a.x7)().decode(e).messageBytes)}async function u({solanaClient:e,tx:t}){let n=(0,i.TJ)().decode(d(t)),{value:a}=await e.rpc.getFeeForMessage(n).send();return a??0n}async function g({solanaClient:e,tx:t,replaceRecentBlockhash:n}){let{value:a}=await e.rpc.simulateTransaction((0,i.TJ)().decode(t),{commitment:"confirmed",encoding:"base64",sigVerify:!1,replaceRecentBlockhash:n}).send();if("BlockhashNotFound"===a.err&&n)throw Error("Simulation failed: Blockhash not found");return"BlockhashNotFound"===a.err?await g({solanaClient:e,tx:t,replaceRecentBlockhash:!0}):{logs:a.logs??[],error:a.err,hasError:!!a.err,hasFunds:a.logs?.every(e=>!/insufficient funds/gi.test(e)&&!/insufficient lamports/gi.test(e))??!0}}let p=(...e)=>{if("undefined"==typeof Buffer)throw new l.b("Buffer is not defined.",void 0,l.c.BUFFER_NOT_DEFINED);return Buffer.from(...e)};async function f({rpcSubscriptions:e,signature:t,timeout:n}){let a=new AbortController,i=await e.signatureNotifications(t,{commitment:"confirmed"}).subscribe({abortSignal:a.signal}),r=await Promise.race([new Promise(e=>{setTimeout(()=>{a.abort(),e(Error("Transaction confirmation timed out"))},n)}),new Promise(async e=>{for await(let t of i){if(a.abort(),t.value.err)return e(Error("Transaction confirmation failed"));e(void 0)}})]);if(r instanceof Error)throw r}function h(){let e=(0,s.u)(),t=(0,o.u)(),n=(0,r.useMemo)(()=>{let n=t(c),a=n?.getDefaultRpcs({appId:e.id});return Object.fromEntries(["solana:mainnet","solana:devnet","solana:testnet"].map(t=>{let n=e.solanaRpcs[t]??a?.[t]??null;return[t,n?function({rpc:e,rpcSubscriptions:t,chain:n,blockExplorerUrl:a}){let r=function({rpc:e,rpcSubscriptions:t}){return async n=>new Promise(async(a,r)=>{try{let r=await e.sendTransaction(p(n).toString("base64"),{preflightCommitment:"confirmed",encoding:"base64"}).send();await f({rpcSubscriptions:t,signature:r,timeout:1e4}),a({signature:new Uint8Array((0,i.Un)().encode(r))})}catch(e){r(e)}})}({rpc:e,rpcSubscriptions:t});return{rpc:e,rpcSubscriptions:t,chain:n,blockExplorerUrl:a,sendAndConfirmTransaction:r}}({chain:t,rpc:n.rpc,rpcSubscriptions:n.rpcSubscriptions,blockExplorerUrl:n.blockExplorerUrl??`https://explorer.solana.com?cluster=${t.replace("solana:","")}`}):null]}))},[e.solanaRpcs,e.id,t]);return(0,r.useCallback)(e=>{if(!n[e])throw Error(`No RPC configuration found for chain ${e}`);return n[e]},[n])}}};