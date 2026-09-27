/* ==========================================================================
   Projetos reais e depoimentos — EDITE AQUI (só com autorização)
   A seção "Projetos reais" só aparece na página quando houver pelo menos um
   item abaixo. Nunca coloque exemplos fictícios, textos de preenchimento,
   logos de terceiros ou números sem comprovação. Guarde as imagens em
   public/projetos/ e registre a autorização de cada cliente.
   ========================================================================== */

export type RealProject = {
  /** Nome da empresa, como autorizado pelo cliente. */
  client: string;
  segment: string;
  /** Endereço publicado, se o cliente autorizar o link. */
  url?: string;
  /** Imagem do site entregue (caminho em public/, ex.: /projetos/cliente.webp). */
  image: string;
  /** Imagem da prévia escolhida, para comparar prévia × site entregue. */
  previewImage?: string;
  /** Data da autorização por escrito (controle interno). */
  authorizedAt: string;
};

export type Testimonial = {
  name: string;
  company?: string;
  text: string;
  authorizedAt: string;
};

export const realProjects: RealProject[] = [];

export const testimonials: Testimonial[] = [];
