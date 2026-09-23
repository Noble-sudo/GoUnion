const fs = require('fs');

let content = fs.readFileSync('frontend/pages/Onboarding.jsx', 'utf8');

content = content.replace(
  /const filteredInstitutions = useMemo\(\(\) => \{\n\s*const q = institutionQuery\.trim\(\)\.toLowerCase\(\);\n\s*if \(\!q\) return institutions\.slice\(0, 10\);\n\s*return institutions\.filter\(i =>\s*\n\s*i\.name\.toLowerCase\(\)\.includes\(q\) \|\|\s*\n\s*\(i\.aliases && i\.aliases\.some\(a => a\.toLowerCase\(\)\.includes\(q\)\)\)\n\s*\)\.slice\(0, 10\);\n\s*\}, \[institutions, institutionQuery\]\);/,
  `const filteredInstitutions = useMemo(() => {
    const q = institutionQuery.trim().toLowerCase();
    if (!q) return institutions.slice(0, 30); // show top 30 initially
    return institutions.filter(i => 
      i.name.toLowerCase().includes(q) || 
      (i.aliases && i.aliases.some(a => a.toLowerCase().includes(q)))
    ).slice(0, 50); // allow up to 50 results when searching
  }, [institutions, institutionQuery]);`
);

fs.writeFileSync('frontend/pages/Onboarding.jsx', content);
console.log('Patched Onboarding.jsx search limit');
