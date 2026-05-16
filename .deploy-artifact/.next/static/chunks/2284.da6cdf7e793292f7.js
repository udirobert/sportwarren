(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2284],{29530:function(e){"use strict";var t={single_source_shortest_paths:function(e,o,r){var i,n,a,l,s,c,d,u={},h={};h[o]=0;var p=t.PriorityQueue.make();for(p.push(o,0);!p.empty();)for(a in n=(i=p.pop()).value,l=i.cost,s=e[n]||{})s.hasOwnProperty(a)&&(c=l+s[a],d=h[a],(void 0===h[a]||d>c)&&(h[a]=c,p.push(a,c),u[a]=n));if(void 0!==r&&void 0===h[r])throw Error(["Could not find a path from ",o," to ",r,"."].join(""));return u},extract_shortest_path_from_predecessor_list:function(e,t){for(var o=[],r=t;r;)o.push(r),e[r],r=e[r];return o.reverse(),o},find_path:function(e,o,r){var i=t.single_source_shortest_paths(e,o,r);return t.extract_shortest_path_from_predecessor_list(i,r)},PriorityQueue:{make:function(e){var o,r=t.PriorityQueue,i={};for(o in e=e||{},r)r.hasOwnProperty(o)&&(i[o]=r[o]);return i.queue=[],i.sorter=e.sorter||r.default_sorter,i},default_sorter:function(e,t){return e.cost-t.cost},push:function(e,t){this.queue.push({value:e,cost:t}),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return 0===this.queue.length}}};e.exports=t},97277:function(e){"use strict";e.exports=function(e){for(var t=[],o=e.length,r=0;r<o;r++){var i=e.charCodeAt(r);if(i>=55296&&i<=56319&&o>r+1){var n=e.charCodeAt(r+1);n>=56320&&n<=57343&&(i=(i-55296)*1024+n-56320+65536,r+=1)}if(i<128){t.push(i);continue}if(i<2048){t.push(i>>6|192),t.push(63&i|128);continue}if(i<55296||i>=57344&&i<65536){t.push(i>>12|224),t.push(i>>6&63|128),t.push(63&i|128);continue}if(i>=65536&&i<=1114111){t.push(i>>18|240),t.push(i>>12&63|128),t.push(i>>6&63|128),t.push(63&i|128);continue}t.push(239,191,189)}return new Uint8Array(t).buffer}},79213:function(e,t,o){let r=o(97814),i=o(38126),n=o(47117),a=o(59599);function l(e,t,o,n,a){let l=[].slice.call(arguments,1),s=l.length,c="function"==typeof l[s-1];if(!c&&!r())throw Error("Callback required as last argument");if(c){if(s<2)throw Error("Too few arguments provided");2===s?(a=o,o=t,t=n=void 0):3===s&&(t.getContext&&void 0===a?(a=n,n=void 0):(a=n,n=o,o=t,t=void 0))}else{if(s<1)throw Error("Too few arguments provided");return 1===s?(o=t,t=n=void 0):2!==s||t.getContext||(n=o,o=t,t=void 0),new Promise(function(r,a){try{let a=i.create(o,n);r(e(a,t,n))}catch(e){a(e)}})}try{let r=i.create(o,n);a(null,e(r,t,n))}catch(e){a(e)}}t.create=i.create,t.toCanvas=l.bind(null,n.render),t.toDataURL=l.bind(null,n.renderToDataURL),t.toString=l.bind(null,function(e,t,o){return a.render(e,o)})},97814:function(e){e.exports=function(){return"function"==typeof Promise&&Promise.prototype&&Promise.prototype.then}},37534:function(e,t,o){let r=o(35568).getSymbolSize;t.getRowColCoords=function(e){if(1===e)return[];let t=Math.floor(e/7)+2,o=r(e),i=145===o?26:2*Math.ceil((o-13)/(2*t-2)),n=[o-7];for(let e=1;e<t-1;e++)n[e]=n[e-1]-i;return n.push(6),n.reverse()},t.getPositions=function(e){let o=[],r=t.getRowColCoords(e),i=r.length;for(let e=0;e<i;e++)for(let t=0;t<i;t++)(0!==e||0!==t)&&(0!==e||t!==i-1)&&(e!==i-1||0!==t)&&o.push([r[e],r[t]]);return o}},30352:function(e,t,o){let r=o(67372),i=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function n(e){this.mode=r.ALPHANUMERIC,this.data=e}n.getBitsLength=function(e){return 11*Math.floor(e/2)+e%2*6},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(e){let t;for(t=0;t+2<=this.data.length;t+=2){let o=45*i.indexOf(this.data[t]);o+=i.indexOf(this.data[t+1]),e.put(o,11)}this.data.length%2&&e.put(i.indexOf(this.data[t]),6)},e.exports=n},45600:function(e){function t(){this.buffer=[],this.length=0}t.prototype={get:function(e){return(this.buffer[Math.floor(e/8)]>>>7-e%8&1)==1},put:function(e,t){for(let o=0;o<t;o++)this.putBit((e>>>t-o-1&1)==1)},getLengthInBits:function(){return this.length},putBit:function(e){let t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}},e.exports=t},91973:function(e){function t(e){if(!e||e<1)throw Error("BitMatrix size must be defined and greater than 0");this.size=e,this.data=new Uint8Array(e*e),this.reservedBit=new Uint8Array(e*e)}t.prototype.set=function(e,t,o,r){let i=e*this.size+t;this.data[i]=o,r&&(this.reservedBit[i]=!0)},t.prototype.get=function(e,t){return this.data[e*this.size+t]},t.prototype.xor=function(e,t,o){this.data[e*this.size+t]^=o},t.prototype.isReserved=function(e,t){return this.reservedBit[e*this.size+t]},e.exports=t},91644:function(e,t,o){let r=o(97277),i=o(67372);function n(e){this.mode=i.BYTE,"string"==typeof e&&(e=r(e)),this.data=new Uint8Array(e)}n.getBitsLength=function(e){return 8*e},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(e){for(let t=0,o=this.data.length;t<o;t++)e.put(this.data[t],8)},e.exports=n},37187:function(e,t,o){let r=o(85969),i=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],n=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];t.getBlocksCount=function(e,t){switch(t){case r.L:return i[(e-1)*4+0];case r.M:return i[(e-1)*4+1];case r.Q:return i[(e-1)*4+2];case r.H:return i[(e-1)*4+3];default:return}},t.getTotalCodewordsCount=function(e,t){switch(t){case r.L:return n[(e-1)*4+0];case r.M:return n[(e-1)*4+1];case r.Q:return n[(e-1)*4+2];case r.H:return n[(e-1)*4+3];default:return}}},85969:function(e,t){t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2},t.isValid=function(e){return e&&void 0!==e.bit&&e.bit>=0&&e.bit<4},t.from=function(e,o){if(t.isValid(e))return e;try{return function(e){if("string"!=typeof e)throw Error("Param is not a string");switch(e.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw Error("Unknown EC Level: "+e)}}(e)}catch(e){return o}}},23599:function(e,t,o){let r=o(35568).getSymbolSize;t.getPositions=function(e){let t=r(e);return[[0,0],[t-7,0],[0,t-7]]}},33871:function(e,t,o){let r=o(35568),i=r.getBCHDigit(1335);t.getEncodedBits=function(e,t){let o=e.bit<<3|t,n=o<<10;for(;r.getBCHDigit(n)-i>=0;)n^=1335<<r.getBCHDigit(n)-i;return(o<<10|n)^21522}},13461:function(e,t){let o=new Uint8Array(512),r=new Uint8Array(256);!function(){let e=1;for(let t=0;t<255;t++)o[t]=e,r[e]=t,256&(e<<=1)&&(e^=285);for(let e=255;e<512;e++)o[e]=o[e-255]}(),t.log=function(e){if(e<1)throw Error("log("+e+")");return r[e]},t.exp=function(e){return o[e]},t.mul=function(e,t){return 0===e||0===t?0:o[r[e]+r[t]]}},82145:function(e,t,o){let r=o(67372),i=o(35568);function n(e){this.mode=r.KANJI,this.data=e}n.getBitsLength=function(e){return 13*e},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(e){let t;for(t=0;t<this.data.length;t++){let o=i.toSJIS(this.data[t]);if(o>=33088&&o<=40956)o-=33088;else if(o>=57408&&o<=60351)o-=49472;else throw Error("Invalid SJIS character: "+this.data[t]+"\nMake sure your charset is UTF-8");o=(o>>>8&255)*192+(255&o),e.put(o,13)}},e.exports=n},86562:function(e,t){t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};let o={N1:3,N2:3,N3:40,N4:10};t.isValid=function(e){return null!=e&&""!==e&&!isNaN(e)&&e>=0&&e<=7},t.from=function(e){return t.isValid(e)?parseInt(e,10):void 0},t.getPenaltyN1=function(e){let t=e.size,r=0,i=0,n=0,a=null,l=null;for(let s=0;s<t;s++){i=n=0,a=l=null;for(let c=0;c<t;c++){let t=e.get(s,c);t===a?i++:(i>=5&&(r+=o.N1+(i-5)),a=t,i=1),(t=e.get(c,s))===l?n++:(n>=5&&(r+=o.N1+(n-5)),l=t,n=1)}i>=5&&(r+=o.N1+(i-5)),n>=5&&(r+=o.N1+(n-5))}return r},t.getPenaltyN2=function(e){let t=e.size,r=0;for(let o=0;o<t-1;o++)for(let i=0;i<t-1;i++){let t=e.get(o,i)+e.get(o,i+1)+e.get(o+1,i)+e.get(o+1,i+1);(4===t||0===t)&&r++}return r*o.N2},t.getPenaltyN3=function(e){let t=e.size,r=0,i=0,n=0;for(let o=0;o<t;o++){i=n=0;for(let a=0;a<t;a++)i=i<<1&2047|e.get(o,a),a>=10&&(1488===i||93===i)&&r++,n=n<<1&2047|e.get(a,o),a>=10&&(1488===n||93===n)&&r++}return r*o.N3},t.getPenaltyN4=function(e){let t=0,r=e.data.length;for(let o=0;o<r;o++)t+=e.data[o];return Math.abs(Math.ceil(100*t/r/5)-10)*o.N4},t.applyMask=function(e,o){let r=o.size;for(let i=0;i<r;i++)for(let n=0;n<r;n++)o.isReserved(n,i)||o.xor(n,i,function(e,o,r){switch(e){case t.Patterns.PATTERN000:return(o+r)%2==0;case t.Patterns.PATTERN001:return o%2==0;case t.Patterns.PATTERN010:return r%3==0;case t.Patterns.PATTERN011:return(o+r)%3==0;case t.Patterns.PATTERN100:return(Math.floor(o/2)+Math.floor(r/3))%2==0;case t.Patterns.PATTERN101:return o*r%2+o*r%3==0;case t.Patterns.PATTERN110:return(o*r%2+o*r%3)%2==0;case t.Patterns.PATTERN111:return(o*r%3+(o+r)%2)%2==0;default:throw Error("bad maskPattern:"+e)}}(e,n,i))},t.getBestMask=function(e,o){let r=Object.keys(t.Patterns).length,i=0,n=1/0;for(let a=0;a<r;a++){o(a),t.applyMask(a,e);let r=t.getPenaltyN1(e)+t.getPenaltyN2(e)+t.getPenaltyN3(e)+t.getPenaltyN4(e);t.applyMask(a,e),r<n&&(n=r,i=a)}return i}},67372:function(e,t,o){let r=o(55049),i=o(69155);t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(e,t){if(!e.ccBits)throw Error("Invalid mode: "+e);if(!r.isValid(t))throw Error("Invalid version: "+t);return t>=1&&t<10?e.ccBits[0]:t<27?e.ccBits[1]:e.ccBits[2]},t.getBestModeForData=function(e){return i.testNumeric(e)?t.NUMERIC:i.testAlphanumeric(e)?t.ALPHANUMERIC:i.testKanji(e)?t.KANJI:t.BYTE},t.toString=function(e){if(e&&e.id)return e.id;throw Error("Invalid mode")},t.isValid=function(e){return e&&e.bit&&e.ccBits},t.from=function(e,o){if(t.isValid(e))return e;try{return function(e){if("string"!=typeof e)throw Error("Param is not a string");switch(e.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw Error("Unknown mode: "+e)}}(e)}catch(e){return o}}},27564:function(e,t,o){let r=o(67372);function i(e){this.mode=r.NUMERIC,this.data=e.toString()}i.getBitsLength=function(e){return 10*Math.floor(e/3)+(e%3?e%3*3+1:0)},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(e){let t,o;for(t=0;t+3<=this.data.length;t+=3)o=parseInt(this.data.substr(t,3),10),e.put(o,10);let r=this.data.length-t;r>0&&(o=parseInt(this.data.substr(t),10),e.put(o,3*r+1))},e.exports=i},31851:function(e,t,o){let r=o(13461);t.mul=function(e,t){let o=new Uint8Array(e.length+t.length-1);for(let i=0;i<e.length;i++)for(let n=0;n<t.length;n++)o[i+n]^=r.mul(e[i],t[n]);return o},t.mod=function(e,t){let o=new Uint8Array(e);for(;o.length-t.length>=0;){let e=o[0];for(let i=0;i<t.length;i++)o[i]^=r.mul(t[i],e);let i=0;for(;i<o.length&&0===o[i];)i++;o=o.slice(i)}return o},t.generateECPolynomial=function(e){let o=new Uint8Array([1]);for(let i=0;i<e;i++)o=t.mul(o,new Uint8Array([1,r.exp(i)]));return o}},38126:function(e,t,o){let r=o(35568),i=o(85969),n=o(45600),a=o(91973),l=o(37534),s=o(23599),c=o(86562),d=o(37187),u=o(19157),h=o(46090),p=o(33871),g=o(67372),f=o(67272);function w(e,t,o){let r,i;let n=e.size,a=p.getEncodedBits(t,o);for(r=0;r<15;r++)i=(a>>r&1)==1,r<6?e.set(r,8,i,!0):r<8?e.set(r+1,8,i,!0):e.set(n-15+r,8,i,!0),r<8?e.set(8,n-r-1,i,!0):r<9?e.set(8,15-r-1+1,i,!0):e.set(8,15-r-1,i,!0);e.set(n-8,8,1,!0)}t.create=function(e,t){let o,p;if(void 0===e||""===e)throw Error("No input text");let m=i.M;return void 0!==t&&(m=i.from(t.errorCorrectionLevel,i.M),o=h.from(t.version),p=c.from(t.maskPattern),t.toSJISFunc&&r.setToSJISFunction(t.toSJISFunc)),function(e,t,o,i){let p;if(Array.isArray(e))p=f.fromArray(e);else if("string"==typeof e){let r=t;if(!r){let t=f.rawSplit(e);r=h.getBestVersionForData(t,o)}p=f.fromString(e,r||40)}else throw Error("Invalid data");let m=h.getBestVersionForData(p,o);if(!m)throw Error("The amount of data is too big to be stored in a QR Code");if(t){if(t<m)throw Error("\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: "+m+".\n")}else t=m;let b=function(e,t,o){let i=new n;o.forEach(function(t){i.put(t.mode.bit,4),i.put(t.getLength(),g.getCharCountIndicator(t.mode,e)),t.write(i)});let a=(r.getSymbolTotalCodewords(e)-d.getTotalCodewordsCount(e,t))*8;for(i.getLengthInBits()+4<=a&&i.put(0,4);i.getLengthInBits()%8!=0;)i.putBit(0);let l=(a-i.getLengthInBits())/8;for(let e=0;e<l;e++)i.put(e%2?17:236,8);return function(e,t,o){let i,n;let a=r.getSymbolTotalCodewords(t),l=a-d.getTotalCodewordsCount(t,o),s=d.getBlocksCount(t,o),c=a%s,h=s-c,p=Math.floor(a/s),g=Math.floor(l/s),f=g+1,w=p-g,m=new u(w),b=0,y=Array(s),v=Array(s),C=0,x=new Uint8Array(e.buffer);for(let e=0;e<s;e++){let t=e<h?g:f;y[e]=x.slice(b,b+t),v[e]=m.encode(y[e]),b+=t,C=Math.max(C,t)}let $=new Uint8Array(a),k=0;for(i=0;i<C;i++)for(n=0;n<s;n++)i<y[n].length&&($[k++]=y[n][i]);for(i=0;i<w;i++)for(n=0;n<s;n++)$[k++]=v[n][i];return $}(i,e,t)}(t,o,p),y=new a(r.getSymbolSize(t));return function(e,t){let o=e.size,r=s.getPositions(t);for(let t=0;t<r.length;t++){let i=r[t][0],n=r[t][1];for(let t=-1;t<=7;t++)if(!(i+t<=-1)&&!(o<=i+t))for(let r=-1;r<=7;r++)n+r<=-1||o<=n+r||(t>=0&&t<=6&&(0===r||6===r)||r>=0&&r<=6&&(0===t||6===t)||t>=2&&t<=4&&r>=2&&r<=4?e.set(i+t,n+r,!0,!0):e.set(i+t,n+r,!1,!0))}}(y,t),function(e){let t=e.size;for(let o=8;o<t-8;o++){let t=o%2==0;e.set(o,6,t,!0),e.set(6,o,t,!0)}}(y),function(e,t){let o=l.getPositions(t);for(let t=0;t<o.length;t++){let r=o[t][0],i=o[t][1];for(let t=-2;t<=2;t++)for(let o=-2;o<=2;o++)-2===t||2===t||-2===o||2===o||0===t&&0===o?e.set(r+t,i+o,!0,!0):e.set(r+t,i+o,!1,!0)}}(y,t),w(y,o,0),t>=7&&function(e,t){let o,r,i;let n=e.size,a=h.getEncodedBits(t);for(let t=0;t<18;t++)o=Math.floor(t/3),r=t%3+n-8-3,i=(a>>t&1)==1,e.set(o,r,i,!0),e.set(r,o,i,!0)}(y,t),function(e,t){let o=e.size,r=-1,i=o-1,n=7,a=0;for(let l=o-1;l>0;l-=2)for(6===l&&l--;;){for(let o=0;o<2;o++)if(!e.isReserved(i,l-o)){let r=!1;a<t.length&&(r=(t[a]>>>n&1)==1),e.set(i,l-o,r),-1==--n&&(a++,n=7)}if((i+=r)<0||o<=i){i-=r,r=-r;break}}}(y,b),isNaN(i)&&(i=c.getBestMask(y,w.bind(null,y,o))),c.applyMask(i,y),w(y,o,i),{modules:y,version:t,errorCorrectionLevel:o,maskPattern:i,segments:p}}(e,o,m,p)}},19157:function(e,t,o){let r=o(31851);function i(e){this.genPoly=void 0,this.degree=e,this.degree&&this.initialize(this.degree)}i.prototype.initialize=function(e){this.degree=e,this.genPoly=r.generateECPolynomial(this.degree)},i.prototype.encode=function(e){if(!this.genPoly)throw Error("Encoder not initialized");let t=new Uint8Array(e.length+this.degree);t.set(e);let o=r.mod(t,this.genPoly),i=this.degree-o.length;if(i>0){let e=new Uint8Array(this.degree);return e.set(o,i),e}return o},e.exports=i},69155:function(e,t){let o="[0-9]+",r="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+",i="(?:(?![A-Z0-9 $%*+\\-./:]|"+(r=r.replace(/u/g,"\\u"))+")(?:.|[\r\n]))+";t.KANJI=RegExp(r,"g"),t.BYTE_KANJI=RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),t.BYTE=RegExp(i,"g"),t.NUMERIC=RegExp(o,"g"),t.ALPHANUMERIC=RegExp("[A-Z $%*+\\-./:]+","g");let n=RegExp("^"+r+"$"),a=RegExp("^"+o+"$"),l=RegExp("^[A-Z0-9 $%*+\\-./:]+$");t.testKanji=function(e){return n.test(e)},t.testNumeric=function(e){return a.test(e)},t.testAlphanumeric=function(e){return l.test(e)}},67272:function(e,t,o){let r=o(67372),i=o(27564),n=o(30352),a=o(91644),l=o(82145),s=o(69155),c=o(35568),d=o(29530);function u(e){return unescape(encodeURIComponent(e)).length}function h(e,t,o){let r;let i=[];for(;null!==(r=e.exec(o));)i.push({data:r[0],index:r.index,mode:t,length:r[0].length});return i}function p(e){let t,o;let i=h(s.NUMERIC,r.NUMERIC,e),n=h(s.ALPHANUMERIC,r.ALPHANUMERIC,e);return c.isKanjiModeEnabled()?(t=h(s.BYTE,r.BYTE,e),o=h(s.KANJI,r.KANJI,e)):(t=h(s.BYTE_KANJI,r.BYTE,e),o=[]),i.concat(n,t,o).sort(function(e,t){return e.index-t.index}).map(function(e){return{data:e.data,mode:e.mode,length:e.length}})}function g(e,t){switch(t){case r.NUMERIC:return i.getBitsLength(e);case r.ALPHANUMERIC:return n.getBitsLength(e);case r.KANJI:return l.getBitsLength(e);case r.BYTE:return a.getBitsLength(e)}}function f(e,t){let o;let s=r.getBestModeForData(e);if((o=r.from(t,s))!==r.BYTE&&o.bit<s.bit)throw Error('"'+e+'" cannot be encoded with mode '+r.toString(o)+".\n Suggested mode is: "+r.toString(s));switch(o!==r.KANJI||c.isKanjiModeEnabled()||(o=r.BYTE),o){case r.NUMERIC:return new i(e);case r.ALPHANUMERIC:return new n(e);case r.KANJI:return new l(e);case r.BYTE:return new a(e)}}t.fromArray=function(e){return e.reduce(function(e,t){return"string"==typeof t?e.push(f(t,null)):t.data&&e.push(f(t.data,t.mode)),e},[])},t.fromString=function(e,o){let i=function(e,t){let o={},i={start:{}},n=["start"];for(let a=0;a<e.length;a++){let l=e[a],s=[];for(let e=0;e<l.length;e++){let c=l[e],d=""+a+e;s.push(d),o[d]={node:c,lastCount:0},i[d]={};for(let e=0;e<n.length;e++){let a=n[e];o[a]&&o[a].node.mode===c.mode?(i[a][d]=g(o[a].lastCount+c.length,c.mode)-g(o[a].lastCount,c.mode),o[a].lastCount+=c.length):(o[a]&&(o[a].lastCount=c.length),i[a][d]=g(c.length,c.mode)+4+r.getCharCountIndicator(c.mode,t))}}n=s}for(let e=0;e<n.length;e++)i[n[e]].end=0;return{map:i,table:o}}(function(e){let t=[];for(let o=0;o<e.length;o++){let i=e[o];switch(i.mode){case r.NUMERIC:t.push([i,{data:i.data,mode:r.ALPHANUMERIC,length:i.length},{data:i.data,mode:r.BYTE,length:i.length}]);break;case r.ALPHANUMERIC:t.push([i,{data:i.data,mode:r.BYTE,length:i.length}]);break;case r.KANJI:t.push([i,{data:i.data,mode:r.BYTE,length:u(i.data)}]);break;case r.BYTE:t.push([{data:i.data,mode:r.BYTE,length:u(i.data)}])}}return t}(p(e,c.isKanjiModeEnabled())),o),n=d.find_path(i.map,"start","end"),a=[];for(let e=1;e<n.length-1;e++)a.push(i.table[n[e]].node);return t.fromArray(a.reduce(function(e,t){let o=e.length-1>=0?e[e.length-1]:null;return o&&o.mode===t.mode?e[e.length-1].data+=t.data:e.push(t),e},[]))},t.rawSplit=function(e){return t.fromArray(p(e,c.isKanjiModeEnabled()))}},35568:function(e,t){let o;let r=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];t.getSymbolSize=function(e){if(!e)throw Error('"version" cannot be null or undefined');if(e<1||e>40)throw Error('"version" should be in range from 1 to 40');return 4*e+17},t.getSymbolTotalCodewords=function(e){return r[e]},t.getBCHDigit=function(e){let t=0;for(;0!==e;)t++,e>>>=1;return t},t.setToSJISFunction=function(e){if("function"!=typeof e)throw Error('"toSJISFunc" is not a valid function.');o=e},t.isKanjiModeEnabled=function(){return void 0!==o},t.toSJIS=function(e){return o(e)}},55049:function(e,t){t.isValid=function(e){return!isNaN(e)&&e>=1&&e<=40}},46090:function(e,t,o){let r=o(35568),i=o(37187),n=o(85969),a=o(67372),l=o(55049),s=r.getBCHDigit(7973);function c(e,t){return a.getCharCountIndicator(e,t)+4}t.from=function(e,t){return l.isValid(e)?parseInt(e,10):t},t.getCapacity=function(e,t,o){if(!l.isValid(e))throw Error("Invalid QR Code version");void 0===o&&(o=a.BYTE);let n=(r.getSymbolTotalCodewords(e)-i.getTotalCodewordsCount(e,t))*8;if(o===a.MIXED)return n;let s=n-c(o,e);switch(o){case a.NUMERIC:return Math.floor(s/10*3);case a.ALPHANUMERIC:return Math.floor(s/11*2);case a.KANJI:return Math.floor(s/13);case a.BYTE:default:return Math.floor(s/8)}},t.getBestVersionForData=function(e,o){let r;let i=n.from(o,n.M);if(Array.isArray(e)){if(e.length>1)return function(e,o){for(let r=1;r<=40;r++)if(function(e,t){let o=0;return e.forEach(function(e){let r=c(e.mode,t);o+=r+e.getBitsLength()}),o}(e,r)<=t.getCapacity(r,o,a.MIXED))return r}(e,i);if(0===e.length)return 1;r=e[0]}else r=e;return function(e,o,r){for(let i=1;i<=40;i++)if(o<=t.getCapacity(i,r,e))return i}(r.mode,r.getLength(),i)},t.getEncodedBits=function(e){if(!l.isValid(e)||e<7)throw Error("Invalid QR Code version");let t=e<<12;for(;r.getBCHDigit(t)-s>=0;)t^=7973<<r.getBCHDigit(t)-s;return e<<12|t}},47117:function(e,t,o){let r=o(24426);t.render=function(e,t,o){var i;let n=o,a=t;void 0!==n||t&&t.getContext||(n=t,t=void 0),t||(a=function(){try{return document.createElement("canvas")}catch(e){throw Error("You need to specify a canvas element")}}()),n=r.getOptions(n);let l=r.getImageWidth(e.modules.size,n),s=a.getContext("2d"),c=s.createImageData(l,l);return r.qrToImageData(c.data,e,n),i=a,s.clearRect(0,0,i.width,i.height),i.style||(i.style={}),i.height=l,i.width=l,i.style.height=l+"px",i.style.width=l+"px",s.putImageData(c,0,0),a},t.renderToDataURL=function(e,o,r){let i=r;void 0!==i||o&&o.getContext||(i=o,o=void 0),i||(i={});let n=t.render(e,o,i),a=i.type||"image/png",l=i.rendererOpts||{};return n.toDataURL(a,l.quality)}},59599:function(e,t,o){let r=o(24426);function i(e,t){let o=e.a/255,r=t+'="'+e.hex+'"';return o<1?r+" "+t+'-opacity="'+o.toFixed(2).slice(1)+'"':r}function n(e,t,o){let r=e+t;return void 0!==o&&(r+=" "+o),r}t.render=function(e,t,o){let a=r.getOptions(t),l=e.modules.size,s=e.modules.data,c=l+2*a.margin,d=a.color.light.a?"<path "+i(a.color.light,"fill")+' d="M0 0h'+c+"v"+c+'H0z"/>':"",u="<path "+i(a.color.dark,"stroke")+' d="'+function(e,t,o){let r="",i=0,a=!1,l=0;for(let s=0;s<e.length;s++){let c=Math.floor(s%t),d=Math.floor(s/t);c||a||(a=!0),e[s]?(l++,s>0&&c>0&&e[s-1]||(r+=a?n("M",c+o,.5+d+o):n("m",i,0),i=0,a=!1),c+1<t&&e[s+1]||(r+=n("h",l),l=0)):i++}return r}(s,l,a.margin)+'"/>',h='<svg xmlns="http://www.w3.org/2000/svg" '+(a.width?'width="'+a.width+'" height="'+a.width+'" ':"")+('viewBox="0 0 '+c)+" "+c+'" shape-rendering="crispEdges">'+d+u+"</svg>\n";return"function"==typeof o&&o(null,h),h}},24426:function(e,t){function o(e){if("number"==typeof e&&(e=e.toString()),"string"!=typeof e)throw Error("Color should be defined as hex string");let t=e.slice().replace("#","").split("");if(t.length<3||5===t.length||t.length>8)throw Error("Invalid hex color: "+e);(3===t.length||4===t.length)&&(t=Array.prototype.concat.apply([],t.map(function(e){return[e,e]}))),6===t.length&&t.push("F","F");let o=parseInt(t.join(""),16);return{r:o>>24&255,g:o>>16&255,b:o>>8&255,a:255&o,hex:"#"+t.slice(0,6).join("")}}t.getOptions=function(e){e||(e={}),e.color||(e.color={});let t=void 0===e.margin||null===e.margin||e.margin<0?4:e.margin,r=e.width&&e.width>=21?e.width:void 0,i=e.scale||4;return{width:r,scale:r?4:i,margin:t,color:{dark:o(e.color.dark||"#000000ff"),light:o(e.color.light||"#ffffffff")},type:e.type,rendererOpts:e.rendererOpts||{}}},t.getScale=function(e,t){return t.width&&t.width>=e+2*t.margin?t.width/(e+2*t.margin):t.scale},t.getImageWidth=function(e,o){let r=t.getScale(e,o);return Math.floor((e+2*o.margin)*r)},t.qrToImageData=function(e,o,r){let i=o.modules.size,n=o.modules.data,a=t.getScale(i,r),l=Math.floor((i+2*r.margin)*a),s=r.margin*a,c=[r.color.light,r.color.dark];for(let t=0;t<l;t++)for(let o=0;o<l;o++){let d=(t*l+o)*4,u=r.color.light;t>=s&&o>=s&&t<l-s&&o<l-s&&(u=c[n[Math.floor((t-s)/a)*i+Math.floor((o-s)/a)]?1:0]),e[d++]=u.r,e[d++]=u.g,e[d++]=u.b,e[d]=u.a}}},2284:function(e,t,o){"use strict";o.r(t),o.d(t,{W3mAllWalletsView:function(){return tw},W3mConnectingWcBasicView:function(){return eB},W3mDownloadsView:function(){return tv}});var r=o(13044),i=o(64167),n=o(69778),a=o(40567),l=o(30146),s=o(51282),c=o(81078);o(10808);var d=o(16609),u=o(59804),h=o(76778),p=o(4768),g=o(36445),f=o(59228);o(94188);var w=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let m=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=h.ConnectorController.state.connectors,this.count=l.ApiController.state.count,this.filteredCount=l.ApiController.state.filteredWallets.length,this.isFetchingRecommendedWallets=l.ApiController.state.isFetchingRecommendedWallets,this.unsubscribe.push(h.ConnectorController.subscribeKey("connectors",e=>this.connectors=e),l.ApiController.subscribeKey("count",e=>this.count=e),l.ApiController.subscribeKey("filteredWallets",e=>this.filteredCount=e.length),l.ApiController.subscribeKey("isFetchingRecommendedWallets",e=>this.isFetchingRecommendedWallets=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.connectors.find(e=>"walletConnect"===e.id),{allWallets:t}=a.OptionsController.state;if(!e||"HIDE"===t||"ONLY_MOBILE"===t&&!n.j.isMobile())return null;let o=l.ApiController.state.featured.length,i=this.count+o,s=this.filteredCount>0?this.filteredCount:i<10?i:10*Math.floor(i/10),c=`${s}`;this.filteredCount>0?c=`${this.filteredCount}`:s<i&&(c=`${s}+`);let h=p.ConnectionController.hasAnyConnection(u.b.CONNECTOR_ID.WALLET_CONNECT);return(0,r.dy)`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${c}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${(0,d.o)(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${h}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){g.X.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),f.RouterController.push("AllWallets",{redirectView:f.RouterController.state.data?.redirectView})}};w([(0,i.Cb)()],m.prototype,"tabIdx",void 0),w([(0,i.SB)()],m.prototype,"connectors",void 0),w([(0,i.SB)()],m.prototype,"count",void 0),w([(0,i.SB)()],m.prototype,"filteredCount",void 0),w([(0,i.SB)()],m.prototype,"isFetchingRecommendedWallets",void 0),m=w([(0,c.Mo)("w3m-all-wallets-widget")],m);var b=o(99717),y=o(28430),v=o(23811),C=o(36601),x=(0,c.iv)`
  :host {
    margin-top: ${({spacing:e})=>e["1"]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1)
      ${({spacing:e})=>e["2"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`,$=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let k=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.connectors=h.ConnectorController.state.connectors,this.recommended=l.ApiController.state.recommended,this.featured=l.ApiController.state.featured,this.explorerWallets=l.ApiController.state.explorerWallets,this.connections=p.ConnectionController.state.connections,this.connectorImages=b.W.state.connectorImages,this.loadingTelegram=!1,this.unsubscribe.push(h.ConnectorController.subscribeKey("connectors",e=>this.connectors=e),p.ConnectionController.subscribeKey("connections",e=>this.connections=e),b.W.subscribeKey("connectorImages",e=>this.connectorImages=e),l.ApiController.subscribeKey("recommended",e=>this.recommended=e),l.ApiController.subscribeKey("featured",e=>this.featured=e),l.ApiController.subscribeKey("explorerFilteredWallets",e=>{this.explorerWallets=e?.length?e:l.ApiController.state.explorerWallets}),l.ApiController.subscribeKey("explorerWallets",e=>{this.explorerWallets?.length||(this.explorerWallets=e)})),n.j.isTelegram()&&n.j.isIos()&&(this.loadingTelegram=!p.ConnectionController.state.wcUri,this.unsubscribe.push(p.ConnectionController.subscribeKey("wcUri",e=>this.loadingTelegram=!e)))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,r.dy)`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}mapConnectorsToExplorerWallets(e,t){return e.map(e=>{if("MULTI_CHAIN"===e.type&&e.connectors){let o=e.connectors.map(e=>e.id),r=e.connectors.map(e=>e.name),i=e.connectors.map(e=>e.info?.rdns),n=t?.find(e=>o.includes(e.id)||r.includes(e.name)||e.rdns&&(i.includes(e.rdns)||o.includes(e.rdns)));return e.explorerWallet=n??e.explorerWallet,e}let o=t?.find(t=>t.id===e.id||t.rdns===e.info?.rdns||t.name===e.name);return e.explorerWallet=o??e.explorerWallet,e})}processConnectorsByType(e,t=!0){let o=C.C.sortConnectorsByExplorerWallet([...e]);return t?o.filter(C.C.showConnector):o}connectorListTemplate(){let e=this.mapConnectorsToExplorerWallets(this.connectors,this.explorerWallets??[]),t=C.C.getConnectorsByType(e,this.recommended,this.featured),o=this.processConnectorsByType(t.announced.filter(e=>"walletConnect"!==e.id)),r=this.processConnectorsByType(t.injected),i=this.processConnectorsByType(t.multiChain.filter(e=>"WalletConnect"!==e.name),!1),a=t.custom,l=t.recent,s=this.processConnectorsByType(t.external.filter(e=>e.id!==u.b.CONNECTOR_ID.COINBASE_SDK)),c=t.recommended,d=t.featured,h=C.C.getConnectorTypeOrder({custom:a,recent:l,announced:o,injected:r,multiChain:i,recommended:c,featured:d,external:s}),p=this.connectors.find(e=>"walletConnect"===e.id),g=n.j.isMobile(),f=[];for(let e of h)switch(e){case"walletConnect":!g&&p&&f.push({kind:"connector",subtype:"walletConnect",connector:p});break;case"recent":C.C.getFilteredRecentWallets().forEach(e=>f.push({kind:"wallet",subtype:"recent",wallet:e}));break;case"injected":i.forEach(e=>f.push({kind:"connector",subtype:"multiChain",connector:e})),o.forEach(e=>f.push({kind:"connector",subtype:"announced",connector:e})),r.forEach(e=>f.push({kind:"connector",subtype:"injected",connector:e}));break;case"featured":d.forEach(e=>f.push({kind:"wallet",subtype:"featured",wallet:e}));break;case"custom":C.C.getFilteredCustomWallets(a??[]).forEach(e=>f.push({kind:"wallet",subtype:"custom",wallet:e}));break;case"external":s.forEach(e=>f.push({kind:"connector",subtype:"external",connector:e}));break;case"recommended":C.C.getCappedRecommendedWallets(c).forEach(e=>f.push({kind:"wallet",subtype:"recommended",wallet:e}));break;default:console.warn(`Unknown connector type: ${e}`)}return f.map((e,t)=>"connector"===e.kind?this.renderConnector(e,t):this.renderWallet(e,t))}renderConnector(e,t){let o,i;let n=e.connector,a=y.f.getConnectorImage(n)||this.connectorImages[n?.imageId??""],l=(this.connections.get(n.chain)??[]).some(e=>v.g.isLowerCaseMatch(e.connectorId,n.id));"multiChain"===e.subtype?(o="multichain",i="info"):"walletConnect"===e.subtype?(o="qr code",i="accent"):"injected"===e.subtype||"announced"===e.subtype?(o=l?"connected":"installed",i=l?"info":"success"):(o=void 0,i=void 0);let s=p.ConnectionController.hasAnyConnection(u.b.CONNECTOR_ID.WALLET_CONNECT),c=("walletConnect"===e.subtype||"external"===e.subtype)&&s;return(0,r.dy)`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${(0,d.o)(a)}
        .installed=${!0}
        name=${n.name??"Unknown"}
        .tagVariant=${i}
        tagLabel=${(0,d.o)(o)}
        data-testid=${`wallet-selector-${n.id.toLowerCase()}`}
        size="sm"
        @click=${()=>this.onClickConnector(e)}
        tabIdx=${(0,d.o)(this.tabIdx)}
        ?disabled=${c}
        rdnsId=${(0,d.o)(n.explorerWallet?.rdns||void 0)}
        walletRank=${(0,d.o)(n.explorerWallet?.order)}
      >
      </w3m-list-wallet>
    `}onClickConnector(e){let t=f.RouterController.state.data?.redirectView;if("walletConnect"===e.subtype){h.ConnectorController.setActiveConnector(e.connector),n.j.isMobile()?f.RouterController.push("AllWallets"):f.RouterController.push("ConnectingWalletConnect",{redirectView:t});return}if("multiChain"===e.subtype){h.ConnectorController.setActiveConnector(e.connector),f.RouterController.push("ConnectingMultiChain",{redirectView:t});return}if("injected"===e.subtype){h.ConnectorController.setActiveConnector(e.connector),f.RouterController.push("ConnectingExternal",{connector:e.connector,redirectView:t,wallet:e.connector.explorerWallet});return}if("announced"===e.subtype){if("walletConnect"===e.connector.id){n.j.isMobile()?f.RouterController.push("AllWallets"):f.RouterController.push("ConnectingWalletConnect",{redirectView:t});return}f.RouterController.push("ConnectingExternal",{connector:e.connector,redirectView:t,wallet:e.connector.explorerWallet});return}f.RouterController.push("ConnectingExternal",{connector:e.connector,redirectView:t})}renderWallet(e,t){let o=e.wallet,i=y.f.getWalletImage(o),n=p.ConnectionController.hasAnyConnection(u.b.CONNECTOR_ID.WALLET_CONNECT),a=this.loadingTelegram,l="recent"===e.subtype?"recent":void 0,s="recent"===e.subtype?"info":void 0;return(0,r.dy)`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${(0,d.o)(i)}
        name=${o.name??"Unknown"}
        @click=${()=>this.onClickWallet(e)}
        size="sm"
        data-testid=${`wallet-selector-${o.id}`}
        tabIdx=${(0,d.o)(this.tabIdx)}
        ?loading=${a}
        ?disabled=${n}
        rdnsId=${(0,d.o)(o.rdns||void 0)}
        walletRank=${(0,d.o)(o.order)}
        tagLabel=${(0,d.o)(l)}
        .tagVariant=${s}
      >
      </w3m-list-wallet>
    `}onClickWallet(e){let t=f.RouterController.state.data?.redirectView;if("featured"===e.subtype){h.ConnectorController.selectWalletConnector(e.wallet);return}if("recent"===e.subtype){if(this.loadingTelegram)return;h.ConnectorController.selectWalletConnector(e.wallet);return}if("custom"===e.subtype){if(this.loadingTelegram)return;f.RouterController.push("ConnectingWalletConnect",{wallet:e.wallet,redirectView:t});return}if(this.loadingTelegram)return;let o=h.ConnectorController.getConnector({id:e.wallet.id,rdns:e.wallet.rdns});o?f.RouterController.push("ConnectingExternal",{connector:o,redirectView:t}):f.RouterController.push("ConnectingWalletConnect",{wallet:e.wallet,redirectView:t})}};k.styles=x,$([(0,i.Cb)({type:Number})],k.prototype,"tabIdx",void 0),$([(0,i.SB)()],k.prototype,"connectors",void 0),$([(0,i.SB)()],k.prototype,"recommended",void 0),$([(0,i.SB)()],k.prototype,"featured",void 0),$([(0,i.SB)()],k.prototype,"explorerWallets",void 0),$([(0,i.SB)()],k.prototype,"connections",void 0),$([(0,i.SB)()],k.prototype,"connectorImages",void 0),$([(0,i.SB)()],k.prototype,"loadingTelegram",void 0),k=$([(0,c.Mo)("w3m-connector-list")],k);var R=o(40399),E=o(92201),S=o(72895),T=o(49903),A=o(1096),I=o(24015),P=o(44953),B=o(44346);o(5012),o(76061);var j=o(5603),L=(0,j.iv)`
  :host {
    flex: 1;
    height: 100%;
  }

  button {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    column-gap: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-active='true'] {
    color: ${({tokens:e})=>e.theme.textPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundTertiary};
  }

  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    wui-text,
    wui-icon {
      color: ${({tokens:e})=>e.theme.textPrimary};
    }
  }
`,O=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let M={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},N={lg:"md",md:"sm",sm:"sm"},z=class extends r.oi{constructor(){super(...arguments),this.icon="mobile",this.size="md",this.label="",this.active=!1}render(){return(0,r.dy)`
      <button data-active=${this.active}>
        ${this.icon?(0,r.dy)`<wui-icon size=${N[this.size]} name=${this.icon}></wui-icon>`:""}
        <wui-text variant=${M[this.size]}> ${this.label} </wui-text>
      </button>
    `}};z.styles=[P.ET,P.ZM,L],O([(0,i.Cb)()],z.prototype,"icon",void 0),O([(0,i.Cb)()],z.prototype,"size",void 0),O([(0,i.Cb)()],z.prototype,"label",void 0),O([(0,i.Cb)({type:Boolean})],z.prototype,"active",void 0),z=O([(0,B.M)("wui-tab-item")],z);var W=(0,j.iv)`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e["01"]};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`,_=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let D=class extends r.oi{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size="md",this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((e,t)=>{let o=t===this.activeTab;return(0,r.dy)`
        <wui-tab-item
          @click=${()=>this.onTabClick(t)}
          icon=${e.icon}
          size=${this.size}
          label=${e.label}
          ?active=${o}
          data-active=${o}
          data-testid="tab-${e.label?.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(e){this.activeTab=e,this.onTabChange(e)}};D.styles=[P.ET,P.ZM,W],_([(0,i.Cb)({type:Array})],D.prototype,"tabs",void 0),_([(0,i.Cb)()],D.prototype,"onTabChange",void 0),_([(0,i.Cb)()],D.prototype,"size",void 0),_([(0,i.SB)()],D.prototype,"activeTab",void 0),D=_([(0,B.M)("wui-tabs")],D);var U=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let F=class extends r.oi{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.generateTabs();return(0,r.dy)`
      <wui-flex justifyContent="center" .padding=${["0","0","4","0"]}>
        <wui-tabs .tabs=${e} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){let e=this.platforms.map(e=>"browser"===e?{label:"Browser",icon:"extension",platform:"browser"}:"mobile"===e?{label:"Mobile",icon:"mobile",platform:"mobile"}:"qrcode"===e?{label:"Mobile",icon:"mobile",platform:"qrcode"}:"web"===e?{label:"Webapp",icon:"browser",platform:"web"}:"desktop"===e?{label:"Desktop",icon:"desktop",platform:"desktop"}:{label:"Browser",icon:"extension",platform:"unsupported"});return this.platformTabs=e.map(({platform:e})=>e),e}onTabChange(e){let t=this.platformTabs[e];t&&this.onSelectPlatfrom?.(t)}};U([(0,i.Cb)({type:Array})],F.prototype,"platforms",void 0),U([(0,i.Cb)()],F.prototype,"onSelectPlatfrom",void 0),F=U([(0,c.Mo)("w3m-connecting-header")],F);var H=o(46283);o(32305);var q=(0,j.iv)`
  :host {
    width: var(--local-width);
  }

  button {
    width: var(--local-width);
    white-space: nowrap;
    column-gap: ${({spacing:e})=>e[2]};
    transition:
      scale ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: scale, background-color, border-radius;
    cursor: pointer;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[2]};
    padding: 0 ${({spacing:e})=>e[2]};
    height: 28px;
  }

  button[data-size='md'] {
    border-radius: ${({borderRadius:e})=>e[3]};
    padding: 0 ${({spacing:e})=>e[4]};
    height: 38px;
  }

  button[data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: 0 ${({spacing:e})=>e[5]};
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent-primary'] {
    background-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='accent-secondary'] {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button[data-variant='neutral-primary'] {
    background-color: ${({tokens:e})=>e.theme.backgroundInvert};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='neutral-secondary'] {
    background-color: transparent;
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  button[data-variant='neutral-tertiary'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  button[data-variant='error-primary'] {
    background-color: ${({tokens:e})=>e.core.textError};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='error-secondary'] {
    background-color: ${({tokens:e})=>e.core.backgroundError};
    color: ${({tokens:e})=>e.core.textError};
  }

  button[data-variant='shade'] {
    background: var(--wui-color-gray-glass-002);
    color: var(--wui-color-fg-200);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-size='sm']:focus-visible:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:focus-visible:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:focus-visible:enabled {
    border-radius: 48px;
  }
  button[data-variant='shade']:focus-visible:enabled {
    background: var(--wui-color-gray-glass-005);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-gray-glass-002);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button[data-size='sm']:hover:enabled {
      border-radius: 28px;
    }

    button[data-size='md']:hover:enabled {
      border-radius: 38px;
    }

    button[data-size='lg']:hover:enabled {
      border-radius: 48px;
    }

    button[data-variant='shade']:hover:enabled {
      background: var(--wui-color-gray-glass-002);
    }

    button[data-variant='shade']:active:enabled {
      background: var(--wui-color-gray-glass-005);
    }
  }

  button[data-size='sm']:active:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:active:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:active:enabled {
    border-radius: 48px;
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
  }
`,K=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let V={lg:"lg-regular-mono",md:"md-regular-mono",sm:"sm-regular-mono"},Y={lg:"md",md:"md",sm:"sm"},X=class extends r.oi{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="accent-primary"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
     `;let e=this.textVariant??V[this.size];return(0,r.dy)`
      <button data-variant=${this.variant} data-size=${this.size} ?disabled=${this.disabled}>
        ${this.loadingTemplate()}
        <slot name="iconLeft"></slot>
        <wui-text variant=${e} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}loadingTemplate(){if(this.loading){let e=Y[this.size],t="neutral-primary"===this.variant||"accent-primary"===this.variant?"invert":"primary";return(0,r.dy)`<wui-loading-spinner color=${t} size=${e}></wui-loading-spinner>`}return null}};X.styles=[P.ET,P.ZM,q],K([(0,i.Cb)()],X.prototype,"size",void 0),K([(0,i.Cb)({type:Boolean})],X.prototype,"disabled",void 0),K([(0,i.Cb)({type:Boolean})],X.prototype,"fullWidth",void 0),K([(0,i.Cb)({type:Boolean})],X.prototype,"loading",void 0),K([(0,i.Cb)()],X.prototype,"variant",void 0),K([(0,i.Cb)()],X.prototype,"textVariant",void 0),X=K([(0,B.M)("wui-button")],X),o(39874),o(77672),o(25963);var J=(0,j.iv)`
  :host {
    display: block;
    width: 100px;
    height: 100px;
  }

  svg {
    width: 100px;
    height: 100px;
  }

  rect {
    fill: none;
    stroke: ${e=>e.colors.accent100};
    stroke-width: 3px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`,Q=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let G=class extends r.oi{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){let e=this.radius>50?50:this.radius,t=36-e;return(0,r.dy)`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${e}
          stroke-dasharray="${116+t} ${245+t}"
          stroke-dashoffset=${360+1.75*t}
        />
      </svg>
    `}};G.styles=[P.ET,J],Q([(0,i.Cb)({type:Number})],G.prototype,"radius",void 0),G=Q([(0,B.M)("wui-loading-thumbnail")],G),o(15853),o(743),o(36547);var Z=(0,j.iv)`
  wui-flex {
    width: 100%;
    height: 52px;
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding-left: ${({spacing:e})=>e[3]};
    padding-right: ${({spacing:e})=>e[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[6]};
  }

  wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-icon {
    width: 12px;
    height: 12px;
  }
`,ee=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let et=class extends r.oi{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return(0,r.dy)`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};et.styles=[P.ET,P.ZM,Z],ee([(0,i.Cb)({type:Boolean})],et.prototype,"disabled",void 0),ee([(0,i.Cb)()],et.prototype,"label",void 0),ee([(0,i.Cb)()],et.prototype,"buttonLabel",void 0),et=ee([(0,B.M)("wui-cta-button")],et);var eo=(0,c.iv)`
  :host {
    display: block;
    padding: 0 ${({spacing:e})=>e["5"]} ${({spacing:e})=>e["5"]};
  }
`,er=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let ei=class extends r.oi{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;let{name:e,app_store:t,play_store:o,chrome_store:i,homepage:a}=this.wallet,l=n.j.isMobile(),s=n.j.isIos(),d=n.j.isAndroid(),u=[t,o,a,i].filter(Boolean).length>1,h=c.Hg.getTruncateString({string:e,charsStart:12,charsEnd:0,truncate:"end"});return u&&!l?(0,r.dy)`
        <wui-cta-button
          label=${`Don't have ${h}?`}
          buttonLabel="Get"
          @click=${()=>f.RouterController.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!u&&a?(0,r.dy)`
        <wui-cta-button
          label=${`Don't have ${h}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:t&&s?(0,r.dy)`
        <wui-cta-button
          label=${`Don't have ${h}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:o&&d?(0,r.dy)`
        <wui-cta-button
          label=${`Don't have ${h}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){this.wallet?.app_store&&n.j.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&n.j.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&n.j.openHref(this.wallet.homepage,"_blank")}};ei.styles=[eo],er([(0,i.Cb)({type:Object})],ei.prototype,"wallet",void 0),ei=er([(0,c.Mo)("w3m-mobile-download-links")],ei);var en=(0,c.iv)`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-wallet-image {
    width: 56px;
    height: 56px;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e["1"]} * -1);
    bottom: calc(${({spacing:e})=>e["1"]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: ${({durations:e})=>e.lg};
    transition-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e["4"]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e["ease-out-power-2"]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  w3m-mobile-download-links {
    padding: 0px;
    width: 100%;
  }
`,ea=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};class el extends r.oi{constructor(){super(),this.wallet=f.RouterController.state.data?.wallet,this.connector=f.RouterController.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=y.f.getConnectorImage(this.connector)??y.f.getWalletImage(this.wallet),this.name=this.wallet?.name??this.connector?.name??"Wallet",this.isRetrying=!1,this.uri=p.ConnectionController.state.wcUri,this.error=p.ConnectionController.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(p.ConnectionController.subscribeKey("wcUri",e=>{this.uri=e,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),p.ConnectionController.subscribeKey("wcError",e=>this.error=e)),(n.j.isTelegram()||n.j.isSafari())&&n.j.isIos()&&p.ConnectionController.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),p.ConnectionController.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();let e=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel,t="";return this.label?t=this.label:(t=`Continue in ${this.name}`,this.error&&(t="Connection declined")),(0,r.dy)`
      <wui-flex
        data-error=${(0,d.o)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${(0,d.o)(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="6"> <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["2","0","0","0"]}
        >
          <wui-text align="center" variant="lg-medium" color=${this.error?"error":"primary"}>
            ${t}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">${e}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?(0,r.dy)`
                <wui-button
                  variant="neutral-secondary"
                  size="md"
                  ?disabled=${this.isRetrying||this.isLoading}
                  @click=${this.onTryAgain.bind(this)}
                  data-testid="w3m-connecting-widget-secondary-button"
                >
                  <wui-icon
                    color="inherit"
                    slot="iconLeft"
                    name=${this.secondaryBtnIcon}
                  ></wui-icon>
                  ${this.secondaryBtnLabel}
                </wui-button>
              `:null}
      </wui-flex>

      ${this.isWalletConnect?(0,r.dy)`
              <wui-flex .padding=${["0","5","5","5"]} justifyContent="center">
                <wui-link
                  @click=${this.onCopyUri}
                  variant="secondary"
                  icon="copy"
                  data-testid="wui-link-copy"
                >
                  Copy link
                </wui-link>
              </wui-flex>
            `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links></wui-flex>
      </wui-flex>
    `}onShowRetry(){if(this.error&&!this.showRetry){this.showRetry=!0;let e=this.shadowRoot?.querySelector("wui-button");e?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}onTryAgain(){p.ConnectionController.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){let e=H.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return(0,r.dy)`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(n.j.copyToClopboard(this.uri),S.SnackController.showSuccess("Link copied"))}catch{S.SnackController.showError("Failed to copy")}}}el.styles=en,ea([(0,i.SB)()],el.prototype,"isRetrying",void 0),ea([(0,i.SB)()],el.prototype,"uri",void 0),ea([(0,i.SB)()],el.prototype,"error",void 0),ea([(0,i.SB)()],el.prototype,"ready",void 0),ea([(0,i.SB)()],el.prototype,"showRetry",void 0),ea([(0,i.SB)()],el.prototype,"label",void 0),ea([(0,i.SB)()],el.prototype,"secondaryBtnLabel",void 0),ea([(0,i.SB)()],el.prototype,"secondaryLabel",void 0),ea([(0,i.SB)()],el.prototype,"isLoading",void 0),ea([(0,i.Cb)({type:Boolean})],el.prototype,"isMobile",void 0),ea([(0,i.Cb)()],el.prototype,"onRetry",void 0);let es=class extends el{constructor(){if(super(),!this.wallet)throw Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),g.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:f.RouterController.state.view}})}async onConnectProxy(){try{this.error=!1;let{connectors:e}=h.ConnectorController.state,t=e.find(e=>"ANNOUNCED"===e.type&&e.info?.rdns===this.wallet?.rdns||"INJECTED"===e.type||e.name===this.wallet?.name);if(t)await p.ConnectionController.connectExternal(t,t.chain);else throw Error("w3m-connecting-wc-browser: No connector found");T.I.close(),g.X.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:this.wallet?.name||"Unknown",view:f.RouterController.state.view,walletRank:this.wallet?.order}})}catch(e){e instanceof A.g&&e.originalName===R.jD.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?g.X.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):g.X.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),this.error=!0}}};es=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a}([(0,c.Mo)("w3m-connecting-wc-browser")],es);let ec=class extends el{constructor(){if(super(),!this.wallet)throw Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),g.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:f.RouterController.state.view}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;let{desktop_link:e,name:t}=this.wallet,{redirect:o,href:r}=n.j.formatNativeUrl(e,this.uri);p.ConnectionController.setWcLinking({name:t,href:r}),p.ConnectionController.setRecentWallet(this.wallet),n.j.openHref(o,"_blank")}catch{this.error=!0}}};ec=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a}([(0,c.Mo)("w3m-connecting-wc-desktop")],ec);var ed=o(92405),eu=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let eh=class extends el{constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=a.OptionsController.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{if(this.wallet?.mobile_link&&this.uri)try{this.error=!1;let{mobile_link:e,link_mode:t,name:o}=this.wallet,{redirect:r,redirectUniversalLink:i,href:a}=n.j.formatNativeUrl(e,this.uri,t);this.redirectDeeplink=r,this.redirectUniversalLink=i,this.target=n.j.isIframe()?"_top":"_self",p.ConnectionController.setWcLinking({name:o,href:a}),p.ConnectionController.setRecentWallet(this.wallet),this.preferUniversalLinks&&this.redirectUniversalLink?n.j.openHref(this.redirectUniversalLink,this.target):n.j.openHref(this.redirectDeeplink,this.target)}catch(e){g.X.sendEvent({type:"track",event:"CONNECT_PROXY_ERROR",properties:{message:e instanceof Error?e.message:"Error parsing the deeplink",uri:this.uri,mobile_link:this.wallet.mobile_link,name:this.wallet.name}}),this.error=!0}},!this.wallet)throw Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=ed.bq.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(p.ConnectionController.subscribeKey("wcUri",()=>{this.onHandleURI()})),g.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:f.RouterController.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){p.ConnectionController.setWcError(!1),this.onConnect?.()}};eu([(0,i.SB)()],eh.prototype,"redirectDeeplink",void 0),eu([(0,i.SB)()],eh.prototype,"redirectUniversalLink",void 0),eu([(0,i.SB)()],eh.prototype,"target",void 0),eu([(0,i.SB)()],eh.prototype,"preferUniversalLinks",void 0),eu([(0,i.SB)()],eh.prototype,"isLoading",void 0),eh=eu([(0,c.Mo)("w3m-connecting-wc-mobile")],eh),o(81899);var ep=o(79213);function eg(e,t,o){return e!==t&&(e-t<0?t-e:e-t)<=o+.1}let ef={generate({uri:e,size:t,logoSize:o,padding:i=8,dotColor:n="var(--apkt-colors-black)"}){let a=[],l=function(e,t){let o=Array.prototype.slice.call(ep.create(e,{errorCorrectionLevel:"Q"}).modules.data,0),r=Math.sqrt(o.length);return o.reduce((e,t,o)=>(o%r==0?e.push([t]):e[e.length-1].push(t))&&e,[])}(e,0),s=(t-2*i)/l.length,c=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];c.forEach(({x:e,y:t})=>{let o=(l.length-7)*s*e+i,d=(l.length-7)*s*t+i;for(let e=0;e<c.length;e+=1){let t=s*(7-2*e);a.push((0,r.YP)`
            <rect
              fill=${2===e?"var(--apkt-colors-black)":"var(--apkt-colors-white)"}
              width=${0===e?t-10:t}
              rx= ${0===e?(t-10)*.45:.45*t}
              ry= ${0===e?(t-10)*.45:.45*t}
              stroke=${n}
              stroke-width=${0===e?10:0}
              height=${0===e?t-10:t}
              x= ${0===e?d+s*e+5:d+s*e}
              y= ${0===e?o+s*e+5:o+s*e}
            />
          `)}});let d=Math.floor((o+25)/s),u=l.length/2-d/2,h=l.length/2+d/2-1,p=[];l.forEach((e,t)=>{e.forEach((e,o)=>{!l[t][o]||t<7&&o<7||t>l.length-8&&o<7||t<7&&o>l.length-8||t>u&&t<h&&o>u&&o<h||p.push([t*s+s/2+i,o*s+s/2+i])})});let g={};return p.forEach(([e,t])=>{g[e]?g[e]?.push(t):g[e]=[t]}),Object.entries(g).map(([e,t])=>{let o=t.filter(e=>t.every(t=>!eg(e,t,s)));return[Number(e),o]}).forEach(([e,t])=>{t.forEach(t=>{a.push((0,r.YP)`<circle cx=${e} cy=${t} fill=${n} r=${s/2.5} />`)})}),Object.entries(g).filter(([e,t])=>t.length>1).map(([e,t])=>{let o=t.filter(e=>t.some(t=>eg(e,t,s)));return[Number(e),o]}).map(([e,t])=>{t.sort((e,t)=>e<t?-1:1);let o=[];for(let e of t){let t=o.find(t=>t.some(t=>eg(e,t,s)));t?t.push(e):o.push([e])}return[e,o.map(e=>[e[0],e[e.length-1]])]}).forEach(([e,t])=>{t.forEach(([t,o])=>{a.push((0,r.YP)`
              <line
                x1=${e}
                x2=${e}
                y1=${t}
                y2=${o}
                stroke=${n}
                stroke-width=${s/1.25}
                stroke-linecap="round"
              />
            `)})}),a}};var ew=(0,j.iv)`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: 100%;
    height: 100%;
    background-color: ${({colors:e})=>e.white};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  :host {
    border-radius: ${({borderRadius:e})=>e[4]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host([data-clear='true']) > wui-icon {
    display: none;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    box-shadow: inset 0 0 0 4px ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: ${({borderRadius:e})=>e[6]};
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: #3396ff !important;
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }

  wui-icon > svg {
    width: inherit;
    height: inherit;
  }
`,em=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let eb=class extends r.oi{constructor(){super(...arguments),this.uri="",this.size=0,this.theme="dark",this.imageSrc=void 0,this.alt=void 0,this.arenaClear=void 0,this.farcaster=void 0}render(){return this.dataset.theme=this.theme,this.dataset.clear=String(this.arenaClear),this.style.cssText=`--local-size: ${this.size}px`,(0,r.dy)`<wui-flex
      alignItems="center"
      justifyContent="center"
      class="wui-qr-code"
      direction="column"
      gap="4"
      width="100%"
      style="height: 100%"
    >
      ${this.templateVisual()} ${this.templateSvg()}
    </wui-flex>`}templateSvg(){return(0,r.YP)`
      <svg height=${this.size} width=${this.size}>
        ${ef.generate({uri:this.uri,size:this.size,logoSize:this.arenaClear?0:this.size/4})}
      </svg>
    `}templateVisual(){return this.imageSrc?(0,r.dy)`<wui-image src=${this.imageSrc} alt=${this.alt??"logo"}></wui-image>`:this.farcaster?(0,r.dy)`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`:(0,r.dy)`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`}};eb.styles=[P.ET,ew],em([(0,i.Cb)()],eb.prototype,"uri",void 0),em([(0,i.Cb)({type:Number})],eb.prototype,"size",void 0),em([(0,i.Cb)()],eb.prototype,"theme",void 0),em([(0,i.Cb)()],eb.prototype,"imageSrc",void 0),em([(0,i.Cb)()],eb.prototype,"alt",void 0),em([(0,i.Cb)({type:Boolean})],eb.prototype,"arenaClear",void 0),em([(0,i.Cb)({type:Boolean})],eb.prototype,"farcaster",void 0),eb=em([(0,B.M)("wui-qr-code")],eb);var ey=(0,j.iv)`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({tokens:e})=>e.theme.foregroundSecondary} 0%,
      ${({tokens:e})=>e.theme.foregroundTertiary} 50%,
      ${({tokens:e})=>e.theme.foregroundSecondary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1s ease-in-out infinite;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`,ev=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let eC=class extends r.oi{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
    `,this.dataset.rounded=this.rounded?"true":"false",(0,r.dy)`<slot></slot>`}};eC.styles=[ey],ev([(0,i.Cb)()],eC.prototype,"width",void 0),ev([(0,i.Cb)()],eC.prototype,"height",void 0),ev([(0,i.Cb)()],eC.prototype,"variant",void 0),ev([(0,i.Cb)({type:Boolean})],eC.prototype,"rounded",void 0),eC=ev([(0,B.M)("wui-shimmer")],eC),o(94396);var ex=(0,c.iv)`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,e$=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let ek=class extends el{constructor(){super(),this.basic=!1,this.forceUpdate=()=>{this.requestUpdate()},window.addEventListener("resize",this.forceUpdate)}firstUpdated(){this.basic||g.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet?.name??"WalletConnect",platform:"qrcode",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:f.RouterController.state.view}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(e=>e()),window.removeEventListener("resize",this.forceUpdate)}render(){return this.onRenderProxy(),(0,r.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","5","5","5"]}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let e=this.getBoundingClientRect().width-40,t=this.wallet?this.wallet.name:void 0;p.ConnectionController.setWcLinking(void 0),p.ConnectionController.setRecentWallet(this.wallet);let o=this.uri;if(this.wallet?.mobile_link){let{redirect:e}=n.j.formatNativeUrl(this.wallet?.mobile_link,this.uri,null);o=e}return(0,r.dy)` <wui-qr-code
      size=${e}
      theme=${H.ThemeController.state.themeMode}
      uri=${o}
      imageSrc=${(0,d.o)(y.f.getWalletImage(this.wallet))}
      color=${(0,d.o)(H.ThemeController.state.themeVariables["--w3m-qr-color"])}
      alt=${(0,d.o)(t)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){let e=!this.uri||!this.ready;return(0,r.dy)`<wui-button
      .disabled=${e}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`}};ek.styles=ex,e$([(0,i.Cb)({type:Boolean})],ek.prototype,"basic",void 0),ek=e$([(0,c.Mo)("w3m-connecting-wc-qrcode")],ek);let eR=class extends r.oi{constructor(){if(super(),this.wallet=f.RouterController.state.data?.wallet,!this.wallet)throw Error("w3m-connecting-wc-unsupported: No wallet provided");g.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:f.RouterController.state.view}})}render(){return(0,r.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${(0,d.o)(y.f.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};eR=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a}([(0,c.Mo)("w3m-connecting-wc-unsupported")],eR);var eE=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let eS=class extends el{constructor(){if(super(),this.isLoading=!0,!this.wallet)throw Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=ed.bq.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(p.ConnectionController.subscribeKey("wcUri",()=>{this.updateLoadingState()})),g.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:f.RouterController.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;let{webapp_link:e,name:t}=this.wallet,{redirect:o,href:r}=n.j.formatUniversalUrl(e,this.uri);p.ConnectionController.setWcLinking({name:t,href:r}),p.ConnectionController.setRecentWallet(this.wallet),n.j.openHref(o,"_blank")}catch{this.error=!0}}};eE([(0,i.SB)()],eS.prototype,"isLoading",void 0),eS=eE([(0,c.Mo)("w3m-connecting-wc-web")],eS);var eT=(0,c.iv)`
  :host([data-mobile-fullscreen='true']) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :host([data-mobile-fullscreen='true']) wui-ux-by-reown {
    margin-top: auto;
  }
`,eA=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let eI=class extends r.oi{constructor(){super(),this.wallet=f.RouterController.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!a.OptionsController.state.siwx,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return a.OptionsController.state.enableMobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),(0,r.dy)`
      ${this.headerTemplate()}
      <div class="platform-container">${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding&&this.displayBranding?(0,r.dy)`<wui-ux-by-reown></wui-ux-by-reown>`:null}async initializeConnection(e=!1){if("browser"!==this.platform&&(!a.OptionsController.state.manualWCControl||e))try{let{wcPairingExpiry:t,status:o}=p.ConnectionController.state,{redirectView:r}=f.RouterController.state.data??{};if(e||a.OptionsController.state.enableEmbedded||n.j.isPairingExpired(t)||"connecting"===o){let e=p.ConnectionController.getConnections(E.R.state.activeChain),t=this.remoteFeatures?.multiWallet,o=e.length>0;await p.ConnectionController.connectWalletConnect({cache:"never"}),this.isSiwxEnabled||(o&&t?(f.RouterController.replace("ProfileWallets"),S.SnackController.showSuccess("New Wallet Added")):r?f.RouterController.replace(r):T.I.close())}}catch(e){if(e instanceof Error&&e.message.includes("An error occurred when attempting to switch chain")&&!a.OptionsController.state.enableNetworkSwitch&&E.R.state.activeChain){E.R.setActiveCaipNetwork(I.f.getUnsupportedNetwork(`${E.R.state.activeChain}:${E.R.state.activeCaipNetwork?.id}`)),E.R.showUnsupportedChainUI();return}e instanceof A.g&&e.originalName===R.jD.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?g.X.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):g.X.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),p.ConnectionController.setWcError(!0),S.SnackController.showError(e.message??"Connection error"),p.ConnectionController.resetWcConnection(),f.RouterController.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;let{mobile_link:e,desktop_link:t,webapp_link:o,injected:r,rdns:i}=this.wallet,l=r?.map(({injected_id:e})=>e).filter(Boolean),s=[...i?[i]:l??[]],c=!a.OptionsController.state.isUniversalProvider&&s.length,d=p.ConnectionController.checkInstalled(s),u=c&&d,h=t&&!n.j.isMobile();u&&!E.R.state.noAdapters&&this.platforms.push("browser"),e&&this.platforms.push(n.j.isMobile()?"mobile":"qrcode"),o&&this.platforms.push("web"),h&&this.platforms.push("desktop"),u||!c||E.R.state.noAdapters||this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return(0,r.dy)`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return(0,r.dy)`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return(0,r.dy)`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return(0,r.dy)`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return(0,r.dy)`<w3m-connecting-wc-qrcode ?basic=${this.basic}></w3m-connecting-wc-qrcode>`;default:return(0,r.dy)`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?(0,r.dy)`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(e){let t=this.shadowRoot?.querySelector("div");t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=e,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};eI.styles=eT,eA([(0,i.SB)()],eI.prototype,"platform",void 0),eA([(0,i.SB)()],eI.prototype,"platforms",void 0),eA([(0,i.SB)()],eI.prototype,"isSiwxEnabled",void 0),eA([(0,i.SB)()],eI.prototype,"remoteFeatures",void 0),eA([(0,i.Cb)({type:Boolean})],eI.prototype,"displayBranding",void 0),eA([(0,i.Cb)({type:Boolean})],eI.prototype,"basic",void 0),eI=eA([(0,c.Mo)("w3m-connecting-wc-view")],eI);var eP=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let eB=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.isMobile=n.j.isMobile(),this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.unsubscribe.push(a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(this.isMobile){let{featured:e,recommended:t}=l.ApiController.state,{customWallets:o}=a.OptionsController.state,i=s.M.getRecentWallets(),n=e.length||t.length||o?.length||i.length;return(0,r.dy)`<wui-flex flexDirection="column" gap="2" .margin=${["1","3","3","3"]}>
        ${n?(0,r.dy)`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return(0,r.dy)`<wui-flex flexDirection="column" .padding=${["0","0","4","0"]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${["0","3","0","3"]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?(0,r.dy)` <wui-flex flexDirection="column" .padding=${["1","0","1","0"]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};eP([(0,i.SB)()],eB.prototype,"isMobile",void 0),eP([(0,i.SB)()],eB.prototype,"remoteFeatures",void 0),eB=eP([(0,c.Mo)("w3m-connecting-wc-basic-view")],eB);var ej=o(129);let{I:eL}=ej._$LH,eO=e=>void 0===e.strings;var eM=o(17954);let eN=(e,t)=>{let o=e._$AN;if(void 0===o)return!1;for(let e of o)e._$AO?.(t,!1),eN(e,t);return!0},ez=e=>{let t,o;do{if(void 0===(t=e._$AM))break;(o=t._$AN).delete(e),e=t}while(0===o?.size)},eW=e=>{for(let t;t=e._$AM;e=t){let o=t._$AN;if(void 0===o)t._$AN=o=new Set;else if(o.has(e))break;o.add(e),eU(t)}};function e_(e){void 0!==this._$AN?(ez(this),this._$AM=e,eW(this)):this._$AM=e}function eD(e,t=!1,o=0){let r=this._$AH,i=this._$AN;if(void 0!==i&&0!==i.size){if(t){if(Array.isArray(r))for(let e=o;e<r.length;e++)eN(r[e],!1),ez(r[e]);else null!=r&&(eN(r,!1),ez(r))}else eN(this,e)}}let eU=e=>{e.type==eM.pX.CHILD&&(e._$AP??=eD,e._$AQ??=e_)};class eF extends eM.Xe{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,o){super._$AT(e,t,o),eW(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(eN(this,e),ez(this))}setValue(e){if(eO(this._$Ct))this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}let eH=()=>new eq;class eq{}let eK=new WeakMap,eV=(0,eM.XM)(class extends eF{render(e){return ej.Ld}update(e,[t]){let o=t!==this.G;return o&&void 0!==this.G&&this.rt(void 0),(o||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),ej.Ld}rt(e){if(this.isConnected||(e=void 0),"function"==typeof this.G){let t=this.ht??globalThis,o=eK.get(t);void 0===o&&(o=new WeakMap,eK.set(t,o)),void 0!==o.get(this.G)&&this.G.call(this.ht,void 0),o.set(this.G,e),void 0!==e&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return"function"==typeof this.G?eK.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});var eY=(0,j.iv)`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    user-select: none;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({colors:e})=>e.neutrals300};
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid transparent;
    will-change: border;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  span:before {
    content: '';
    position: absolute;
    background-color: ${({colors:e})=>e.white};
    border-radius: 50%;
  }

  /* -- Sizes --------------------------------------------------------- */
  label[data-size='lg'] {
    width: 48px;
    height: 32px;
  }

  label[data-size='md'] {
    width: 40px;
    height: 28px;
  }

  label[data-size='sm'] {
    width: 32px;
    height: 22px;
  }

  label[data-size='lg'] > span:before {
    height: 24px;
    width: 24px;
    left: 4px;
    top: 3px;
  }

  label[data-size='md'] > span:before {
    height: 20px;
    width: 20px;
    left: 4px;
    top: 3px;
  }

  label[data-size='sm'] > span:before {
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
  }

  /* -- Focus states --------------------------------------------------- */
  input:focus-visible:not(:checked) + span,
  input:focus:not(:checked) + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    background-color: ${({tokens:e})=>e.theme.textTertiary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  input:focus-visible:checked + span,
  input:focus:checked + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  input:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  label[data-size='lg'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='md'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='sm'] > input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }

  /* -- Hover states ------------------------------------------------------- */
  label:hover > input:not(:checked):not(:disabled) + span {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  label:hover > input:checked:not(:disabled) + span {
    background-color: ${({colors:e})=>e.accent080};
  }

  /* -- Disabled state --------------------------------------------------- */
  label:has(input:disabled) {
    pointer-events: none;
    user-select: none;
  }

  input:not(:checked):disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:checked:disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:not(:checked):disabled + span::before {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  input:checked:disabled + span::before {
    background-color: ${({tokens:e})=>e.theme.textTertiary};
  }
`,eX=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let eJ=class extends r.oi{constructor(){super(...arguments),this.inputElementRef=eH(),this.checked=!1,this.disabled=!1,this.size="md"}render(){return(0,r.dy)`
      <label data-size=${this.size}>
        <input
          ${eV(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("switchChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};eJ.styles=[P.ET,P.ZM,eY],eX([(0,i.Cb)({type:Boolean})],eJ.prototype,"checked",void 0),eX([(0,i.Cb)({type:Boolean})],eJ.prototype,"disabled",void 0),eX([(0,i.Cb)()],eJ.prototype,"size",void 0),eJ=eX([(0,B.M)("wui-toggle")],eJ);var eQ=(0,j.iv)`
  :host {
    height: auto;
  }

  :host > wui-flex {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: ${({spacing:e})=>e["2"]};
    padding: ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["3"]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e["4"]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`,eG=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let eZ=class extends r.oi{constructor(){super(...arguments),this.checked=!1}render(){return(0,r.dy)`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(e){e.stopPropagation(),this.checked=e.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("certifiedSwitchChange",{detail:this.checked,bubbles:!0,composed:!0}))}};eZ.styles=[P.ET,P.ZM,eQ],eG([(0,i.Cb)({type:Boolean})],eZ.prototype,"checked",void 0),eZ=eG([(0,B.M)("wui-certified-switch")],eZ);var e0=(0,j.iv)`
  :host {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    gap: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.textPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  .wui-input-text-container {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    color: inherit;
    background: transparent;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[3]} ${({spacing:e})=>e[10]};
    font-size: ${({textSize:e})=>e.large};
    line-height: ${({typography:e})=>e["lg-regular"].lineHeight};
    letter-spacing: ${({typography:e})=>e["lg-regular"].letterSpacing};
    font-weight: ${({fontWeight:e})=>e.regular};
    font-family: ${({fontFamily:e})=>e.regular};
  }

  input[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[4]} ${({spacing:e})=>e[10]};
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    }
  }

  input:disabled {
    cursor: unset;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  input::placeholder {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  input:focus:enabled {
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  div.wui-input-text-container:has(input:disabled) {
    opacity: 0.5;
  }

  wui-icon.wui-input-text-left-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    left: ${({spacing:e})=>e[4]};
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button.wui-input-text-submit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: ${({borderRadius:e})=>e[2]};
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button.wui-input-text-submit-button:disabled {
    opacity: 1;
  }

  button.wui-input-text-submit-button.loading wui-icon {
    animation: spin 1s linear infinite;
  }

  button.wui-input-text-submit-button:hover {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  input:has(+ .wui-input-text-submit-button) {
    padding-right: ${({spacing:e})=>e[12]};
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  /* -- Keyframes --------------------------------------------------- */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`,e1=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let e3=class extends r.oi{constructor(){super(...arguments),this.inputElementRef=eH(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return(0,r.dy)` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${eV(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${(0,d.o)(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value||""}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`}templateLeftIcon(){return this.icon?(0,r.dy)`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}templateSubmitButton(){return this.onSubmit?(0,r.dy)`<button
        class="wui-input-text-submit-button ${this.loading?"loading":""}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled||this.loading}
      >
        ${this.loading?(0,r.dy)`<wui-icon name="spinner" size="md"></wui-icon>`:(0,r.dy)`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`:null}templateError(){return this.errorText?(0,r.dy)`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?(0,r.dy)`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};e3.styles=[P.ET,P.ZM,e0],e1([(0,i.Cb)()],e3.prototype,"icon",void 0),e1([(0,i.Cb)({type:Boolean})],e3.prototype,"disabled",void 0),e1([(0,i.Cb)({type:Boolean})],e3.prototype,"loading",void 0),e1([(0,i.Cb)()],e3.prototype,"placeholder",void 0),e1([(0,i.Cb)()],e3.prototype,"type",void 0),e1([(0,i.Cb)()],e3.prototype,"value",void 0),e1([(0,i.Cb)()],e3.prototype,"errorText",void 0),e1([(0,i.Cb)()],e3.prototype,"warningText",void 0),e1([(0,i.Cb)()],e3.prototype,"onSubmit",void 0),e1([(0,i.Cb)()],e3.prototype,"size",void 0),e1([(0,i.Cb)({attribute:!1})],e3.prototype,"onKeyDown",void 0),e3=e1([(0,B.M)("wui-input-text")],e3);var e2=(0,j.iv)`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.iconDefault};
    cursor: pointer;
    padding: ${({spacing:e})=>e[2]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
  }

  @media (hover: hover) {
    wui-icon:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }
`,e5=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let e4=class extends r.oi{constructor(){super(...arguments),this.inputComponentRef=eH(),this.inputValue=""}render(){return(0,r.dy)`
      <wui-input-text
        ${eV(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue?(0,r.dy)`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`:null}
      </wui-input-text>
    `}onInputChange(e){this.inputValue=e.detail||""}clearValue(){let e=this.inputComponentRef.value,t=e?.inputElementRef.value;t&&(t.value="",this.inputValue="",t.focus(),t.dispatchEvent(new Event("input")))}};e4.styles=[P.ET,e2],e5([(0,i.Cb)()],e4.prototype,"inputValue",void 0),e4=e5([(0,B.M)("wui-search-bar")],e4);let e6=(0,r.YP)`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`;var e8=(0,j.iv)`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 104px;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--apkt-path-network);
    clip-path: var(--apkt-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: ${({tokens:e})=>e.theme.foregroundSecondary};
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`,e7=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let e9=class extends r.oi{constructor(){super(...arguments),this.type="wallet"}render(){return(0,r.dy)`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return"network"===this.type?(0,r.dy)` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${e6}`:(0,r.dy)`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};e9.styles=[P.ET,P.ZM,e8],e7([(0,i.Cb)()],e9.prototype,"type",void 0),e9=e7([(0,B.M)("wui-card-select-loader")],e9);var te=o(60536),tt=(0,r.iv)`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`,to=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let tr=class extends r.oi{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};
      padding-top: ${this.padding&&te.H.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&te.H.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&te.H.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&te.H.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&te.H.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&te.H.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&te.H.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&te.H.getSpacingStyles(this.margin,3)};
    `,(0,r.dy)`<slot></slot>`}};tr.styles=[P.ET,tt],to([(0,i.Cb)()],tr.prototype,"gridTemplateRows",void 0),to([(0,i.Cb)()],tr.prototype,"gridTemplateColumns",void 0),to([(0,i.Cb)()],tr.prototype,"justifyItems",void 0),to([(0,i.Cb)()],tr.prototype,"alignItems",void 0),to([(0,i.Cb)()],tr.prototype,"justifyContent",void 0),to([(0,i.Cb)()],tr.prototype,"alignContent",void 0),to([(0,i.Cb)()],tr.prototype,"columnGap",void 0),to([(0,i.Cb)()],tr.prototype,"rowGap",void 0),to([(0,i.Cb)()],tr.prototype,"gap",void 0),to([(0,i.Cb)()],tr.prototype,"padding",void 0),to([(0,i.Cb)()],tr.prototype,"margin",void 0),tr=to([(0,B.M)("wui-grid")],tr);var ti=o(52881),tn=(0,c.iv)`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({spacing:e})=>e["2"]};
    padding: ${({spacing:e})=>e["3"]} ${({spacing:e})=>e["0"]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({borderRadius:e})=>e["4"]}, 20px);
    transition:
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({tokens:e})=>e.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({colors:e})=>e.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({colors:e})=>e.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({colors:e})=>e.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`,ta=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let tl=class extends r.oi{constructor(){super(),this.observer=new IntersectionObserver(()=>void 0),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId="",this.walletQuery="",this.certified=!1,this.displayIndex=0,this.wallet=void 0,this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){let e=this.wallet?.badge_type==="certified";return(0,r.dy)`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${(0,d.o)(e?"certified":void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${e?(0,r.dy)`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return(this.visible||this.imageSrc)&&!this.imageLoading?(0,r.dy)`
      <wui-wallet-image
        size="lg"
        imageSrc=${(0,d.o)(this.imageSrc)}
        name=${(0,d.o)(this.wallet?.name)}
        .installed=${this.wallet?.installed??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `:this.shimmerTemplate()}shimmerTemplate(){return(0,r.dy)`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=y.f.getWalletImage(this.wallet),this.imageSrc||(this.imageLoading=!0,this.imageSrc=await y.f.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){this.wallet&&!this.isImpressed&&(this.isImpressed=!0,g.X.sendWalletImpressionEvent({name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:f.RouterController.state.view,query:this.walletQuery,certified:this.certified,displayIndex:this.displayIndex}))}};tl.styles=tn,ta([(0,i.SB)()],tl.prototype,"visible",void 0),ta([(0,i.SB)()],tl.prototype,"imageSrc",void 0),ta([(0,i.SB)()],tl.prototype,"imageLoading",void 0),ta([(0,i.SB)()],tl.prototype,"isImpressed",void 0),ta([(0,i.Cb)()],tl.prototype,"explorerId",void 0),ta([(0,i.Cb)()],tl.prototype,"walletQuery",void 0),ta([(0,i.Cb)()],tl.prototype,"certified",void 0),ta([(0,i.Cb)()],tl.prototype,"displayIndex",void 0),ta([(0,i.Cb)({type:Object})],tl.prototype,"wallet",void 0),tl=ta([(0,c.Mo)("w3m-all-wallets-list-item")],tl);var ts=(0,c.iv)`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  w3m-all-wallets-list-item {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-inout-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-loading-spinner {
    padding-top: ${({spacing:e})=>e["4"]};
    padding-bottom: ${({spacing:e})=>e["4"]};
    justify-content: center;
    grid-column: 1 / span 4;
  }
`,tc=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let td="local-paginator",tu=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!l.ApiController.state.wallets.length,this.wallets=l.ApiController.state.wallets,this.recommended=l.ApiController.state.recommended,this.featured=l.ApiController.state.featured,this.filteredWallets=l.ApiController.state.filteredWallets,this.mobileFullScreen=a.OptionsController.state.enableMobileFullScreen,this.unsubscribe.push(l.ApiController.subscribeKey("wallets",e=>this.wallets=e),l.ApiController.subscribeKey("recommended",e=>this.recommended=e),l.ApiController.subscribeKey("featured",e=>this.featured=e),l.ApiController.subscribeKey("filteredWallets",e=>this.filteredWallets=e))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.paginationObserver?.disconnect()}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),(0,r.dy)`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","3","3","3"]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;let e=this.shadowRoot?.querySelector("wui-grid");e&&(await l.ApiController.fetchWalletsByPage({page:1}),await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(e,t){return[...Array(e)].map(()=>(0,r.dy)`
        <wui-card-select-loader type="wallet" id=${(0,d.o)(t)}></wui-card-select-loader>
      `)}getWallets(){let e=[...this.featured,...this.recommended];this.filteredWallets?.length>0?e.push(...this.filteredWallets):e.push(...this.wallets);let t=n.j.uniqueBy(e,"id"),o=ti.J.markWalletsAsInstalled(t);return ti.J.markWalletsWithDisplayIndex(o)}walletsTemplate(){return this.getWallets().map((e,t)=>(0,r.dy)`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${e.id}"
          @click=${()=>this.onConnectWallet(e)}
          .wallet=${e}
          explorerId=${e.id}
          certified=${"certified"===this.badge}
          displayIndex=${t}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){let{wallets:e,recommended:t,featured:o,count:r,mobileFilteredOutWalletsLength:i}=l.ApiController.state,n=window.innerWidth<352?3:4,a=e.length+t.length,s=Math.ceil(a/n)*n-a+n;return(s-=e.length?o.length%n:0,0===r&&o.length>0)?null:0===r||[...o,...e,...t].length<r-(i??0)?this.shimmerTemplate(s,td):null}createPaginationObserver(){let e=this.shadowRoot?.querySelector(`#${td}`);e&&(this.paginationObserver=new IntersectionObserver(([e])=>{if(e?.isIntersecting&&!this.loading){let{page:e,count:t,wallets:o}=l.ApiController.state;o.length<t&&l.ApiController.fetchWalletsByPage({page:e+1})}}),this.paginationObserver.observe(e))}onConnectWallet(e){h.ConnectorController.selectWalletConnector(e)}};tu.styles=ts,tc([(0,i.SB)()],tu.prototype,"loading",void 0),tc([(0,i.SB)()],tu.prototype,"wallets",void 0),tc([(0,i.SB)()],tu.prototype,"recommended",void 0),tc([(0,i.SB)()],tu.prototype,"featured",void 0),tc([(0,i.SB)()],tu.prototype,"filteredWallets",void 0),tc([(0,i.SB)()],tu.prototype,"badge",void 0),tc([(0,i.SB)()],tu.prototype,"mobileFullScreen",void 0),tu=tc([(0,c.Mo)("w3m-all-wallets-list")],tu);var th=(0,r.iv)`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
    height: auto;
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`,tp=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let tg=class extends r.oi{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.mobileFullScreen=a.OptionsController.state.enableMobileFullScreen,this.query=""}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.onSearch(),this.loading?(0,r.dy)`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await l.ApiController.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){let{search:e}=l.ApiController.state,t=ti.J.markWalletsAsInstalled(e);return e.length?(0,r.dy)`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","3","3","3"]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${t.map((e,t)=>(0,r.dy)`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(e)}
              .wallet=${e}
              data-testid="wallet-search-item-${e.id}"
              explorerId=${e.id}
              certified=${"certified"===this.badge}
              walletQuery=${this.query}
              displayIndex=${t}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:(0,r.dy)`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(e){h.ConnectorController.selectWalletConnector(e)}};tg.styles=th,tp([(0,i.SB)()],tg.prototype,"loading",void 0),tp([(0,i.SB)()],tg.prototype,"mobileFullScreen",void 0),tp([(0,i.Cb)()],tg.prototype,"query",void 0),tp([(0,i.Cb)()],tg.prototype,"badge",void 0),tg=tp([(0,c.Mo)("w3m-all-wallets-search")],tg);var tf=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let tw=class extends r.oi{constructor(){super(...arguments),this.search="",this.badge=void 0,this.onDebouncedSearch=n.j.debounce(e=>{this.search=e})}render(){let e=this.search.length>=2;return(0,r.dy)`
      <wui-flex .padding=${["1","3","3","3"]} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${"certified"===this.badge}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${e||this.badge?(0,r.dy)`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`:(0,r.dy)`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}onCertifiedSwitchChange(e){e.detail?(this.badge="certified",S.SnackController.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})):this.badge=void 0}qrButtonTemplate(){return n.j.isMobile()?(0,r.dy)`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){f.RouterController.push("ConnectingWalletConnect")}};tf([(0,i.SB)()],tw.prototype,"search",void 0),tf([(0,i.SB)()],tw.prototype,"badge",void 0),tw=tf([(0,c.Mo)("w3m-all-wallets-view")],tw);var tm=(0,j.iv)`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      scale ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, scale;
  }

  wui-text {
    text-transform: capitalize;
  }

  wui-image {
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,tb=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let ty=class extends r.oi{constructor(){super(...arguments),this.imageSrc="google",this.loading=!1,this.disabled=!1,this.rightIcon=!0,this.rounded=!1,this.fullSize=!1}render(){return this.dataset.rounded=this.rounded?"true":"false",(0,r.dy)`
      <button
        ?disabled=${!!this.loading||!!this.disabled}
        data-loading=${this.loading}
        tabindex=${(0,d.o)(this.tabIdx)}
      >
        <wui-flex gap="2" alignItems="center">
          ${this.templateLeftIcon()}
          <wui-flex gap="1">
            <slot></slot>
          </wui-flex>
        </wui-flex>
        ${this.templateRightIcon()}
      </button>
    `}templateLeftIcon(){return this.icon?(0,r.dy)`<wui-image
        icon=${this.icon}
        iconColor=${(0,d.o)(this.iconColor)}
        ?boxed=${!0}
        ?rounded=${this.rounded}
      ></wui-image>`:(0,r.dy)`<wui-image
      ?boxed=${!0}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      src=${this.imageSrc}
    ></wui-image>`}templateRightIcon(){return this.rightIcon?this.loading?(0,r.dy)`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:(0,r.dy)`<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`:null}};ty.styles=[P.ET,P.ZM,tm],tb([(0,i.Cb)()],ty.prototype,"imageSrc",void 0),tb([(0,i.Cb)()],ty.prototype,"icon",void 0),tb([(0,i.Cb)()],ty.prototype,"iconColor",void 0),tb([(0,i.Cb)({type:Boolean})],ty.prototype,"loading",void 0),tb([(0,i.Cb)()],ty.prototype,"tabIdx",void 0),tb([(0,i.Cb)({type:Boolean})],ty.prototype,"disabled",void 0),tb([(0,i.Cb)({type:Boolean})],ty.prototype,"rightIcon",void 0),tb([(0,i.Cb)({type:Boolean})],ty.prototype,"rounded",void 0),tb([(0,i.Cb)({type:Boolean})],ty.prototype,"fullSize",void 0),ty=tb([(0,B.M)("wui-list-item")],ty);let tv=class extends r.oi{constructor(){super(...arguments),this.wallet=f.RouterController.state.data?.wallet}render(){if(!this.wallet)throw Error("w3m-downloads-view");return(0,r.dy)`
      <wui-flex gap="2" flexDirection="column" .padding=${["3","3","4","3"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?(0,r.dy)`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?(0,r.dy)`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?(0,r.dy)`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?(0,r.dy)`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `:null}openStore(e){e.href&&this.wallet&&(g.X.sendEvent({type:"track",event:"GET_WALLET",properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.wallet.id,type:e.type}}),n.j.openHref(e.href,"_blank"))}onChromeStore(){this.wallet?.chrome_store&&this.openStore({href:this.wallet.chrome_store,type:"chrome_store"})}onAppStore(){this.wallet?.app_store&&this.openStore({href:this.wallet.app_store,type:"app_store"})}onPlayStore(){this.wallet?.play_store&&this.openStore({href:this.wallet.play_store,type:"play_store"})}onHomePage(){this.wallet?.homepage&&this.openStore({href:this.wallet.homepage,type:"homepage"})}};tv=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a}([(0,c.Mo)("w3m-downloads-view")],tv)}}]);