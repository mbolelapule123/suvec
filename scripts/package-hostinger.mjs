import { cp, mkdir } from 'node:fs/promises';

const target='deployment/hostinger';
await mkdir(`${target}/public_html`,{recursive:true});
await cp('dist',`${target}/public_html`,{recursive:true});
await cp('server/php',`${target}/public_html/api`,{recursive:true});
await cp('server/suvec-mail-config.example.php',`${target}/suvec-mail-config.example.php`);
console.log(`Hostinger release prepared in ${target}. Configure SMTP outside public_html before enabling email delivery.`);
