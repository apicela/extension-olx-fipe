const URL_API = "https://parallelum.com.br/fipe/api/v1/motos/marcas/";

const motos = new Map([
    ["HONDA", {
      "CB500": "CB 500",
      "Fan160": "Fan 160",
      "XRE300": "XRE 300",
      "CB1000R": "CB 1000R",
      "Twister250": "Twister 250",
      "CB650F": "CB 650F",
      "NXR160Bros": "NXR 160 Bros"
    }],
    ["YAMAHA", {
      "Fazer250": "Fazer 250",
      "R1": "R1",
      "XJ6": "XJ6",
      "Lander250": "Lander 250",
      "Tenere700": "Ténéré 700",
      "YZFR3": "YZF-R3",
      "XTZ250": "XTZ 250"
    }],
    ["KAWASAKI", {
      "Ninja400": "Ninja 400",
      "Z900": "Z900",
      "VulcanS": "Vulcan S",
      "KLR650": "KLR 650",
      "Z1000": "Z1000",
      "Versys650": "Versys 650",
      "NinjaZX10R": "Ninja ZX-10R"
    }]  ]);


async function obterModelos() {
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

function verificarItem() {
    if (window.location.href.includes("olx.com.br/")) {
        const elemento = document.getElementById("description-title");

        if (elemento) {
            const valor = elemento.innerText || "Valor não encontrado";

            mostrarNotificacao("OLX Motos", `Valor do item: ${valor}`);
        } else {
            console.log("Elemento 'item-x' não encontrado.");
        }
    }
}

// Função para exibir a notificação
function mostrarNotificacao(titulo, mensagem) {
    chrome.runtime.sendMessage({
        type: "notificacao",
        title: titulo,
        message: mensagem
    });
}

function extrairValorDoCampo(labelText) {
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

  async function buscarCodigoMarca(marca) {
    marca = marca.toUpperCase();
    try {
      const marcas = await obterModelos();
  
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
  
  const marca = extrairValorDoCampo('Marca');
  const ano = extrairValorDoCampo('Ano');

    buscarCodigoMarca(marca);

    // Aguarda a página carregar totalmente antes de buscar o elemento
    window.addEventListener("load", verificarItem);
