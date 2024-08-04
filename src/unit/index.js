import { blockType, StorageKey } from './const';

const propriedadeOculta = (() => { // document[hiddenProperty] pode determinar se a página perdeu o foco
  let nomes = [
    'hidden',
    'webkitHidden',
    'mozHidden',
    'msHidden',
  ];
  nomes = nomes.filter((e) => (e in document));
  return nomes.length > 0 ? nomes[0] : false;
})();

const eventoMudancaVisibilidade = (() => {
  if (!propriedadeOculta) {
    return false;
  }
  return propriedadeOculta.replace(/hidden/i, 'visibilitychange'); // Se a propriedade tem prefixo, o evento correspondente também terá
})();

const estaFocado = () => {
  if (!propriedadeOculta) { // Se essa característica não existe, assume-se que está sempre focado
    return true;
  }
  return !document[propriedadeOculta];
};

const unidade = {
  getProximoTipo() { // Obter o próximo tipo de bloco aleatoriamente
    const len = blockType.length;
    return blockType[Math.floor(Math.random() * len)];
  },
  quer(next, matrix) { // O bloco pode mover para a posição especificada?
    const xy = next.xy;
    const shape = next.shape;
    const horizontal = shape.get(0).size;
    return shape.every((m, k1) => (
      m.every((n, k2) => {
        if (xy[1] < 0) { // esquerda
          return false;
        }
        if (xy[1] + horizontal > 10) { // direita
          return false;
        }
        if (xy[0] + k1 < 0) { // topo
          return true;
        }
        if (xy[0] + k1 >= 20) { // fundo
          return false;
        }
        if (n) {
          if (matrix.get(xy[0] + k1).get(xy[1] + k2)) {
            return false;
          }
          return true;
        }
        return true;
      })
    ));
  },
  estaLimpo(matrix) { // Estado de limpeza alcançado?
    const linhasLimpar = [];
    matrix.forEach((m, k) => {
      if (m.every(n => !!n)) {
        linhasLimpar.push(k);
      }
    });
    if (linhasLimpar.length === 0) {
      return false;
    }
    return linhasLimpar;
  },
  estaTerminado(matrix) { // O jogo terminou? A primeira linha com bloco é o critério
    return matrix.get(0).some(n => !!n);
  },
  registrarRecord(store) { // Registrar estado no localStorage
    store.subscribe(() => {
      let data = store.getState().toJS();
      if (data.lock) { // Quando o estado está bloqueado, não registrar
        return;
      }
      data = JSON.stringify(data);
      data = encodeURIComponent(data);
      if (window.btoa) {
        data = btoa(data);
      }
      localStorage.setItem(StorageKey, data);
    });
  },
  ehMobile() { // Determinar se é um dispositivo móvel
    const ua = navigator.userAgent;
    const android = /Android (\d+\.\d+)/.test(ua);
    const iphone = ua.indexOf('iPhone') > -1;
    const ipod = ua.indexOf('iPod') > -1;
    const ipad = ua.indexOf('iPad') > -1;
    const nokiaN = ua.indexOf('NokiaN') > -1;
    return android || iphone || ipod || ipad || nokiaN;
  },
  eventoMudancaVisibilidade,
  estaFocado,
};

module.exports = unidade;
