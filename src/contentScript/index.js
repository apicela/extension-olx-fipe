const URL_API = "https://parallelum.com.br/fipe/api/v1/motos/marcas/";
var notified = false;
const marcasFamosas = [
  "HONDA", "YAMAHA", "KAWASAKI", "SUZUKI", "BMW", 
  "DUCATI", "HARLEY-DAVIDSON", "HONDA", "TRIUMPH", "KTM",
  "vendo", "passo", "moto", "nova", "usada", "oportunidade","XTZ", "VENDO", "PASSO", "MOTO", "NOVA"
];
let motoName, marcaCode, modeloCode, ano;
const mapOfCommonItems = new Map();
mapOfCommonItems.set('MT-03', '7527');
mapOfCommonItems.set('LANDER', '4195');
mapOfCommonItems.set('LANDER 250', '4195');
mapOfCommonItems.set('XRE 300', '4940');
mapOfCommonItems.set('XRE 300 ADVENTURE', '7912');
mapOfCommonItems.set('XRE 300 RALLY', '6720');
mapOfCommonItems.set('Z 1000', '2904');
mapOfCommonItems.set('FAZER 250', '8143');
mapOfCommonItems.set('FZ 25', '8143');
mapOfCommonItems.set('FZ25', '8143');
mapOfCommonItems.set('HONDA', '80');
mapOfCommonItems.set('BMW', '67');
mapOfCommonItems.set('KAWASAKI', '85');
mapOfCommonItems.set('YAMAHA', '101');


  // Aguarda a página carregar totalmente antes de buscar o elemento
  const observer = new MutationObserver((mutations, obs) => {
    const title = document.getElementById("description-title");
    const spans = document.querySelectorAll('span.olx-text--overline');
    
    if (title && spans.length > 0) {
      start(); // Chama a função quando os elementos existirem
      obs.disconnect(); // Para de observar após encontrar os elementos
    }
  });
  
  // Inicia a observação em todo o documento
  observer.observe(document, {
    childList: true,
    subtree: true
  });

  async function start() {
    if (notified) return;
  
    const isOlx = window.location.href.includes("olx.com.br/");
    if (!isOlx) return;
  
    try {
      await fillFields(); //  fill motoName, marcaCode, modeloCode, ano
  
      const fipeData = await findFipe(marcaCode, modeloCode, ano);
      const notifText = `${fipeData.Valor}` + '\n' + `Ano: ${fipeData.AnoModelo}` + '\n' + `Modelo: ${fipeData.Modelo}`;
      notify("Apicela", notifText);
    } catch (error) {
      console.error("Erro ao iniciar o processo:", error);
    }
  }
  // API CALLS

  async function obterMarcas() {
    try {
      const response = await fetch(URL_API);
  
      if (!response.ok) {
        throw new Error("Erro na requisição: " + response.status);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao fazer a requisição:", error);
    }
  }

  async function findModelCode(motoName) {
    try {
      const params = `${marcaCode}/modelos/`;
      const response = await fetch(URL_API + params);
  
      if (!response.ok) {
        throw new Error("Erro na requisição: " + response.status);
      }
  
      const data = await response.json();
      if(mapOfCommonItems.has(motoName)) return mapOfCommonItems.get(motoName);
      for (const item of data.modelos) {
        if (item.nome.includes(motoName)) {
          return item.codigo; 
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao fazer a requisição:", error);
    }
  }

  async function findFipe(marcaCode, modeloCode, ano) {
    try {
      var anoCode = `${ano}-1`;
      const params = `${marcaCode}/modelos/${modeloCode}/anos/${anoCode}`;
      console.log(URL_API + params);
      const response = await fetch(URL_API + params);
  
      if (!response.ok) {
        throw new Error("Erro na requisição: " + response.status);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao fazer a requisição:", error);
    }
  }

  // SECONDARY FUNCTIONS

  async function findMarcaCode(marca) {
    if(mapOfCommonItems.has(marca)) return mapOfCommonItems.get(marca);
    try {
      const marcas = await obterMarcas();
  
      const marcaEncontrada = marcas.find((it) => it.nome === marca);
  
      if (marcaEncontrada) {
        return marcaEncontrada.codigo;
      } else {
        console.log("Marca não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
    }
  }

  // Função para exibir a notificação
function sendChromeNotification(titulo, mensagem) {
  chrome.runtime.sendMessage({
      type: "notificacao",
      title: titulo,
      message: mensagem
  });
  notified = true;
}

async function fillFields() {
  const olxTitle = document.getElementById("description-title");
  const title = olxTitle.innerText;

  const marca = extractFromOlxGrid('Marca').toUpperCase();
  ano = extractFromOlxGrid('Ano');
  motoName = extrairModeloMoto(title);
  marcasFamosas.forEach((marcaFamosa) => {
    if(motoName.includes(marcaFamosa)) {
      motoName = motoName.replace(marcaFamosa, '');
    }
  });
  motoName = motoName.trim();
  if (motoName.startsWith("MT")) {
    motoName = motoName.replace(/(MT)\s*(\d{2,3})/g, '$1-$2');
} else {
    motoName = motoName.replace(/([A-Z])(\d{2,4})/g, '$1 $2')  // Letra seguida de número (ex: "Z1000")
    if(marca == "BMW") motoName =    motoName.replace(/(\d{2,4})([A-Z])/g, '$1 $2'); // Número seguido de letra (ex: "850F")
}
  marcaCode = await findMarcaCode(marca);
  modeloCode = await findModelCode(motoName.trim());

  console.log("Marca Code:", marcaCode);
  console.log("Modelo:", motoName);
  console.log("Modelo Code:", modeloCode);
}


  // DATA EXTRACTOR

  function extractFromOlxGrid(labelText) {
    const labels = document.querySelectorAll('span.olx-text--overline');
    
    for (const label of labels) {
      if (label.textContent.trim() === labelText) {
        // Encontrar o elemento irmão que contém o valor
        const container = label.closest('.olx-ai-flex-start');
        if (container) {
          const valueElement = container.querySelector('a.olx-link, span.ad__sc-hj0yqs-0');
          return valueElement ? valueElement.textContent.trim() : null;
        }
      }
    }
    return null;
  }


  
function extrairModeloMoto(titulo) {
  // Padrão regex para capturar modelos de moto (ex: "CG 160", "Ninja 400", "XRE 300")
  const padrao = /([A-Za-z]{2,}(?:\s+[A-Za-z]+)?\s*\d{2,4}[A-Za-z]*)/i;
  const match = titulo.match(padrao);
  return match ? match[0].toUpperCase().replace(/\b(19|20)\d{2}\b/g, '').trim() : null;
}

function notify(titulo, mensagem) {
  const notificationDiv = document.createElement('div');
  notificationDiv.style.position = 'fixed';
  notificationDiv.style.top = '10px';
  notificationDiv.style.right = '10px';
  notificationDiv.style.padding = '10px';
  notificationDiv.style.backgroundColor = '#4CAF50'; // Cor verde para sucesso
  notificationDiv.style.color = 'white';
  notificationDiv.style.fontSize = '16px';
  notificationDiv.style.borderRadius = '5px';
  notificationDiv.style.zIndex = '10000'; // Para garantir que fique acima de outros elementos
  
  notificationDiv.innerHTML = `<strong>${titulo}</strong><br>${mensagem}`;
  
  // Adiciona a notificação ao corpo da página
  document.body.appendChild(notificationDiv);

}