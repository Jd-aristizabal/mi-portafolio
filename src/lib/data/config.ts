const whatsappNumber = '573202678913';
const email = 'jdaristizabal8725@gmail.com';
export const resume = { url: '/CV-Johan-Aristi.pdf', filename: 'CV-Johan-Aristi.pdf' };
export const contact = { name: 'Johan Aristizabal', email, emailUrl: `mailto:${email}`, whatsapp: '+57 3202678913', whatsappUrl: `https://wa.me/${whatsappNumber}` };
export const quickActions = [
  { id: 'work', label: 'Quiero trabajar contigo', answer: '¡Hagamos algo especial! Cuéntale a Johan sobre tu idea, los objetivos y el tiempo que tienes en mente.', link: contact.whatsappUrl, linkLabel: 'Contactar por WhatsApp' },
  { id: 'projects', label: 'Explorar proyectos', answer: 'Puedes probar Focus Flow para organizar tu día o Pixel Sprint para poner a prueba tus reflejos.', link: '/#works', linkLabel: 'Ver los proyectos' },
  { id: 'about', label: 'Conocer a Johan', answer: 'Johan crea experiencias digitales con atención al diseño, las interacciones y los detalles. Su enfoque actual es SvelteKit y TypeScript.', link: '/#about', linkLabel: 'Más sobre Johan' }
];
