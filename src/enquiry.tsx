import { useState, type FormEvent } from 'react';
import { Send, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { services } from './data';
import { contact, contactLinks } from './contact';

type EnquiryKind='contact'|'quote'|'career';
export function EnquiryForm({kind='contact'}:{kind?:EnquiryKind}){
 const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');
 const [error,setError]=useState('');
 const career=kind==='career',quote=kind==='quote';
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(status==='sending'||status==='sent')return;
  const form=event.currentTarget;
  const payload={...Object.fromEntries(new FormData(form)),kind};
  setStatus('sending');setError('');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),35000);
  try{
   const response=await fetch('/api/enquiry.php',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   const isJson=response.headers.get('content-type')?.includes('application/json');
   const result=isJson?await response.json():null;
   if(!response.ok||result?.ok!==true)throw new Error(result?.message||'We could not send your enquiry. Please email or call us directly.');
   setStatus('sent');
  }catch(e){
   setStatus('error');
   setError(e instanceof Error&&e.name==='AbortError'?'We could not confirm delivery in time. Please contact us directly before submitting again.':e instanceof Error?e.message:'We could not send your enquiry. Please contact us directly.');
  }finally{clearTimeout(timer)}
 }
 return <form className="page-form enquiry-form" onSubmit={submit}>
  <fieldset disabled={status==='sending'||status==='sent'}>
   <div className="form-grid"><label>Full name <span aria-hidden="true">*</span><input name="name" autoComplete="name" required maxLength={150}/></label><label>Email address <span aria-hidden="true">*</span><input type="email" name="email" autoComplete="email" required maxLength={200}/></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40}/></label>{career?<label>Area of interest<select name="service"><option>Driving & Transport</option><option>Fleet & Maintenance</option><option>Operations & Logistics</option><option>Administration & Support</option><option>Other</option></select></label>:<label>Company<input name="company" autoComplete="organization" maxLength={150}/></label>}</div>
   {!career&&<label>Service<select name="service"><option>Transport quote</option>{services.map(s=><option key={s.id}>{s.title}</option>)}<option>Partnership / General enquiry</option></select></label>}
   {quote&&<div className="form-grid"><label>Collection location <span aria-hidden="true">*</span><input name="collection" required maxLength={250} placeholder="City and country"/></label><label>Delivery location <span aria-hidden="true">*</span><input name="delivery" required maxLength={250} placeholder="City and country"/></label></div>}
   {career&&<label>Relevant experience<input name="experience" placeholder="e.g. 5 years in regional transport" maxLength={250}/></label>}
   <label>{career?'Tell us about yourself':'How can we help?'} <span aria-hidden="true">*</span><textarea required name="message" rows={quote?3:5} maxLength={5000} placeholder={career?'Your experience, skills and the work you are interested in.':'Collection and delivery locations, cargo details, preferred dates and any special requirements.'}/></label>
   <div className="enquiry-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
   <label className="consent"><input type="checkbox" name="consent" value="yes" required/>I agree to share these details with Suvec Investments Limited so the team can respond to my enquiry.</label>
   <button className="button" type="submit" disabled={status==='sending'||status==='sent'}>{status==='sending'?<LoaderCircle size={17} className="spin"/>:status==='sent'?<CheckCircle2 size={17}/>:<Send size={17}/>} {status==='sending'?'Sending…':status==='sent'?'Enquiry Sent':career?'Send Career Interest':'Send Enquiry'}</button>
  </fieldset>
  {status==='sent'&&<div className="enquiry-success" role="status"><p>Thank you. Your {career?'career interest':'enquiry'} has been sent to the Suvec team.</p><button type="button" className="text-link" onClick={e=>{e.currentTarget.form?.reset();setStatus('idle')}}>Send another enquiry</button></div>}
  {status==='error'&&<p className="enquiry-error" role="alert">{error} <a href={contactLinks.email}>{contact.email}</a> · <a href={contactLinks.phone}>{contact.phone}</a></p>}
 </form>
}
