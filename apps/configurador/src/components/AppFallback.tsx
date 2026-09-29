/* ==========================================================================
   Aviso para quando o JavaScript da página não inicia (erro de execução,
   arquivo bloqueado, navegador antigo). Fica no fluxo da página, acima do
   cabeçalho — nunca por cima de botões — e só aparece se, 4 s depois do
   carregamento completo, a página ainda não marcou data-app="ok"
   (AppReady). Tudo aqui é link comum: funciona sem script.

   O script é escrito à mão em ES5 para rodar até em navegadores que não
   entendem o restante do código. Ele guarda as primeiras mensagens de erro
   e a versão do iOS (nada pessoal) e as acrescenta à mensagem do WhatsApp,
   para que o problema possa ser identificado.
   ========================================================================== */
import { contact } from '@/config/contact';
import { whatsappLink } from '@/lib/whatsapp';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const message = 'Olá, Matheus! Tentei usar o site da Beck Performance, mas a página não funcionou no meu navegador. Quero conversar sobre o site da minha empresa.';

export const startWatch = `(function(){var d=document.documentElement,errs=[];function add(m){if(errs.length<3)errs.push(String(m||'erro').slice(0,120));}
window.addEventListener('error',function(e){var t=e&&e.target,u=t&&(t.src||t.href);add(e&&(e.message||(u&&'arquivo não carregou: '+String(u).split('/').pop())));},true);
window.addEventListener('unhandledrejection',function(e){add(e&&e.reason&&(e.reason.message||e.reason));});
function check(){if(d.getAttribute('data-app')==='ok')return;d.setAttribute('data-app','falhou');var box=document.getElementById('app-fallback');if(!box)return;
var m=navigator.userAgent.match(/OS (\\d+)_(\\d+)(?:_(\\d+))? like Mac/);var info=(m?'iOS '+m[1]+'.'+m[2]+(m[3]?'.'+m[3]:''):'')+(errs.length?(m?' · ':'')+errs.join(' | '):'');
var code=document.getElementById('app-fallback-code');if(code&&info){code.textContent='Informação técnica: '+info;code.hidden=false;}
var wa=document.getElementById('app-fallback-wa');if(wa&&info)wa.href+=encodeURIComponent('\\n\\n(Informação técnica: '+info+')');
var again=document.getElementById('app-fallback-again');if(again)again.href=location.href;box.hidden=false;}
if(document.readyState==='complete')setTimeout(check,4000);else window.addEventListener('load',function(){setTimeout(check,4000);});})();`;

export function AppFallback() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: startWatch }} />
      <div id="app-fallback" className="app-fallback" role="alert" hidden>
        <p>
          <strong>Parte desta página não carregou no seu navegador.</strong> Você pode conversar direto sobre o seu site ou tentar de novo.
        </p>
        <p className="app-fallback-links">
          <a id="app-fallback-wa" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
            Conversar pelo WhatsApp {contact.whatsappDisplay}
          </a>
          <a href={`${base}/pacotes/`}>Ver pacotes e valores</a>
          <a id="app-fallback-again" href={`${base}/`}>
            Tentar de novo
          </a>
        </p>
        <p id="app-fallback-code" className="app-fallback-code" hidden />
      </div>
    </>
  );
}
