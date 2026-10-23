export const contact = {
  address: '52733 off Lumumba Road, Heavy Industrial Area, Lusaka, Zambia',
  email: 'info@suvec.org',
  phone: '+260973828063',
};

export const contactLinks = {
  email: `mailto:${contact.email}`,
  phone: `tel:${contact.phone}`,
  map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`,
};
