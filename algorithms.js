class SearchResult {
  constructor(indices, comparisons, timeNs, steps) {
    this.indices = indices;
    this.comparisons = comparisons;
    this.timeNs = timeNs;
    this.steps = steps || [];
  }
}

class SearchStrategy {
  search(text, pattern, stepByStep) {
    throw new Error('Implementar search em subclass.');
  }
}

class NaiveSearch extends SearchStrategy {
  search(text, pattern, stepByStep = false) {
    const n=text.length, m=pattern.length;
    const indices=[];
    let comparisons=0;
    const steps=[];
    const start=performance.now();
    for(let i=0;i<=n-m;i++){
      let match=true;
      for(let j=0;j<m;j++){
        comparisons++;
        if(stepByStep) steps.push({i, j, textChar:text[i+j], patternChar:pattern[j], comparisons});
        if(text[i+j]!==pattern[j]){ match=false; break; }
      }
      if(match) indices.push(i);
    }
    const end=performance.now();
    return new SearchResult(indices, comparisons, Math.round((end-start)*1e6), steps);
  }
}

class RabinKarpSearch extends SearchStrategy {
  search(text, pattern, stepByStep=false){
    const d=256; const q=101;
    const n=text.length, m=pattern.length;
    const indices=[]; let comparisons=0; const steps=[];
    if(m===0)return new SearchResult([0],0,0,steps);
    let h=1; for(let i=0;i<m-1;i++)h=(h*d)%q;
    let p=0, t=0;
    for(let i=0;i<m;i++){ p=(d*p+pattern.charCodeAt(i))%q; t=(d*t+text.charCodeAt(i))%q; }
    const start=performance.now();
    for(let i=0;i<=n-m;i++){
      if(p===t){
        let match=true;
        for(let j=0;j<m;j++){
          comparisons++;
          if(stepByStep) steps.push({i,j,textChar:text[i+j],patternChar:pattern[j],comparisons});
          if(text[i+j]!==pattern[j]){ match=false; break; }
        }
        if(match) indices.push(i);
      }
      if(i<n-m){
        t=(d*(t-text.charCodeAt(i)*h)+text.charCodeAt(i+m))%q;
        if(t<0) t+=q;
      }
    }
    const end=performance.now();
    return new SearchResult(indices, comparisons, Math.round((end-start)*1e6), steps);
  }
}

class KMPSearch extends SearchStrategy{
  computeLPS(pattern){
    const m=pattern.length; const lps=new Array(m).fill(0);
    let len=0, i=1;
    while(i<m){
      if(pattern[i]===pattern[len]){ len++; lps[i]=len; i++; }
      else{ if(len!==0) len=lps[len-1]; else { lps[i]=0; i++; } }
    }
    return lps;
  }
  search(text, pattern, stepByStep=false){
    const n=text.length, m=pattern.length;
    const lps=this.computeLPS(pattern);
    const indices=[]; let comparisons=0; const steps=[];
    let i=0, j=0; const start=performance.now();
    while(i<n){
      comparisons++;
      if(stepByStep) steps.push({i,j,textChar:text[i],patternChar:pattern[j],comparisons, lps:[...lps]});
      if(text[i]===pattern[j]){ i++; j++; }
      if(j===m){ indices.push(i-j); j=lps[j-1]; }
      else if(i<n && text[i]!==pattern[j]){
        if(j!==0){ j=lps[j-1]; }
        else { i++; }
      }
    }
    const end=performance.now();
    return new SearchResult(indices, comparisons, Math.round((end-start)*1e6), steps);
  }
}

class BoyerMooreSearch extends SearchStrategy{
  buildBadChar(pattern){
    const badChar={};
    for(let i=0;i<pattern.length;i++) badChar[pattern[i]]=i;
    return badChar;
  }
  search(text, pattern, stepByStep=false){
    const n=text.length, m=pattern.length;
    const badChar=this.buildBadChar(pattern);
    const indices=[]; let comparisons=0; const steps=[];
    let s=0; const start=performance.now();
    while(s<=n-m){
      let j=m-1;
      while(j>=0){
        comparisons++;
        if(stepByStep) steps.push({s,j,textChar:text[s+j],patternChar:pattern[j],comparisons, badChar});
        if(pattern[j]===text[s+j]) j--; else break;
      }
      if(j<0){ indices.push(s); s += (s+m<n) ? m - (badChar[text[s+m]] ?? -1) : 1; }
      else { s += Math.max(1, j-(badChar[text[s+j]] ?? -1)); }
    }
    const end=performance.now();
    return new SearchResult(indices, comparisons, Math.round((end-start)*1e6), steps);
  }
}

function createStrategy(name){
  switch(name){
    case 'naive': return new NaiveSearch();
    case 'rabin-karp': return new RabinKarpSearch();
    case 'kmp': return new KMPSearch();
    case 'boyer-moore': return new BoyerMooreSearch();
    default: throw new Error('Algoritmo desconhecido: '+name);
  }
}
