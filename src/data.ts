import { Truck, Package, Container, Snowflake, Handshake } from 'lucide-react';

export const navigation = [
 { label: 'Home', path: '/' }, { label: 'About Us', path: '/about' },
 { label: 'Our Services', path: '/services' }, { label: 'Our Fleet', path: '/fleet' },
 { label: 'Routes', path: '/routes' }, { label: 'Careers', path: '/careers' },
 { label: 'Contact', path: '/contact' },
];
export const services = [
 {id:'bulk',icon:Truck,title:'Bulk Cargo Transport',text:'Reliable movement of bulk and general cargo across Zambia and neighbouring countries.',description:'Keep the essentials moving. Plan road transport for bulk materials, packaged goods and everyday business cargo, with collection and delivery requirements shaped around your operation.',items:['Bulk and general cargo','Domestic and regional movements','One-off and recurring requirements'],image:'/hero.png'},
 {id:'industrial',icon:Package,title:'Industrial & Mining Logistics',text:'Transport solutions for mining, construction and industrial supply chains.',description:'Connect your supply chain to the people and projects that depend on it. Discuss site deliveries, industrial inputs and transport planning for your next project.',items:['Mining supply chains','Construction materials','Industrial supplies and site deliveries'],image:'/fleet.png'},
 {id:'container',icon:Container,title:'Container Transport',text:'Efficient container haulage connecting your business to regional markets.',description:'Build a clearer plan for your container movement. Share your collection point, container requirements and destination so the right haulage arrangement can be discussed.',items:['Container collection and delivery','Regional corridor planning','Shipment-specific transport arrangements'],image:'/fleet.png'},
 {id:'refrigerated',icon:Snowflake,title:'Refrigerated Transport',text:'Discuss temperature-controlled transport for your perishable goods.',description:'Some cargo needs a more considered journey. Tell us about your product, required temperature range and timing so suitable equipment and availability can be confirmed.',items:['Perishable cargo enquiries','Temperature requirements assessment','Equipment availability confirmed per shipment'],image:'/hero.png'},
 {id:'project',icon:Handshake,title:'Contract & Project Logistics',text:'Tailored transport planning for large-scale and long-term projects.',description:'Make transport part of the plan from the beginning. Discuss the volume, schedule and delivery milestones behind an ongoing contract or a new project.',items:['Long-term transport requirements','Project mobilisation planning','Phased deliveries and recurring movements'],image:'/regional.png'},
];
export const countries=['Zambia','South Africa','Zimbabwe','Botswana','DR Congo','Tanzania','Malawi','Mozambique','Namibia'];
export const routeDetails: Record<string,{region:string,description:string,cargo:string[]}>={
 'Zambia':{region:'Domestic network',description:'From our base in Lusaka, plan domestic collections and deliveries to support your business across Zambia.',cargo:['General cargo','Industrial supplies','Agricultural cargo']},
 'South Africa':{region:'Southern corridor',description:'Discuss cross-border transport between Zambia and South Africa for your next regional shipment.',cargo:['General cargo','Container enquiries','Project supplies']},
 'Zimbabwe':{region:'Southern corridor',description:'Connect your Zambian operation with collection and delivery points in Zimbabwe.',cargo:['Business cargo','Construction materials','Industrial inputs']},
 'Botswana':{region:'Southwestern corridor',description:'Plan a regional cargo movement between Zambia and Botswana around your business requirements.',cargo:['General cargo','Project supplies','Industrial cargo']},
 'DR Congo':{region:'Northern corridor',description:'Discuss transport requirements connecting Zambia with the Democratic Republic of the Congo.',cargo:['Mining supplies','Industrial inputs','General cargo']},
 'Tanzania':{region:'Northeastern corridor',description:'Explore road transport requirements linking your Zambian business with destinations in Tanzania.',cargo:['General cargo','Container enquiries','Industrial supplies']},
 'Malawi':{region:'Eastern corridor',description:'Bring collection points, destinations and timing together for a Zambia–Malawi transport enquiry.',cargo:['Packaged goods','Agricultural cargo','Business supplies']},
 'Mozambique':{region:'Southeastern corridor',description:'Discuss shipment planning between Zambia and Mozambique, including your collection and delivery requirements.',cargo:['General cargo','Container enquiries','Project supplies']},
 'Namibia':{region:'Western corridor',description:'Explore transport requirements connecting Zambia with collection and delivery points in Namibia.',cargo:['General cargo','Container enquiries','Industrial supplies']},
};
