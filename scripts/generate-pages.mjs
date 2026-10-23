import { readFile, writeFile, mkdir } from 'node:fs/promises';

// Emit real entry points so page URLs also work on simple static hosts.
const pages = [
 ['about','About Us','Meet Suvec Investments Limited, a Lusaka-based logistics company with over 150 vehicles serving Zambia and the region.'],
 ['services','Our Services','Explore Suvec road transport services, from bulk cargo and industrial logistics to container and project transport enquiries.'],
 ['fleet','Our Fleet','Explore transport capabilities backed by a Suvec fleet of over 150 vehicles.'],
 ['routes','Routes','Explore domestic and regional transport destinations connecting Zambia with neighbouring markets.'],
 ['careers','Careers','Explore areas of career interest at Suvec Investments Limited and prepare an introduction.'],
 ['contact','Contact','Send your transport enquiry to Suvec Investments Limited in Lusaka, Zambia.'],
];
const html=await readFile('dist/index.html','utf8');
for(const [path,title,description] of pages){
 const page=html.replace(/<title>.*?<\/title>/,`<title>${title} | Suvec Investments Limited</title>`).replace(/(<meta name="description" content=")[^"]*("\s*\/?\s*>)/,`$1${description}$2`);
 await mkdir(`dist/${path}`,{recursive:true});
 await writeFile(`dist/${path}/index.html`,page);
}
await writeFile('dist/404.html',html.replace(/<title>.*?<\/title>/,'<title>Page Not Found | Suvec Investments Limited</title>'));
console.log(`Generated ${pages.length} static page entry points and a 404 page.`);
