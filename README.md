### Introdução em Inglês
Please view [README-EN.md](https://github.com/chvin/react-tetris/blob/master/README-EN.md)

----
## Tetris feito com React, Redux e Immutable

----
Tetris é um clássico jogo que desenvolvedores adoram recriar em várias linguagens de programação. Há muitas versões em JavaScript, mas fazer uma versão com React se tornou meu objetivo.

Clique aqui para jogar: [https://chvin.github.io/react-tetris/](https://chvin.github.io/react-tetris/)

----
### Visualização do resultado
![Visualização do resultado](https://img.alicdn.com/tps/TB1Ag7CNXXXXXaoXXXXXXXXXXXX-320-483.gif)

Gravado em velocidade normal, experiência fluida.

### Responsividade
![Responsividade](https://img.alicdn.com/tps/TB1AdjZNXXXXXcCapXXXXXXXXXX-480-343.gif)

Não apenas se adapta à tela, mas também permite `usar o teclado no PC e o toque no celular`:

![Celular](https://img.alicdn.com/tps/TB1kvJyOVXXXXbhaFXXXXXXXXXX-320-555.gif)

### Persistência de dados
![Persistência de dados](https://img.alicdn.com/tps/TB1EY7cNXXXXXXraXXXXXXXXXXX-320-399.gif)

O maior medo de jogar offline é perder progresso. Através do `store.subscribe`, o estado é salvo no localStorage, registrando todos os estados precisamente. Mesmo que a página seja fechada ou atualizada, ou o celular fique sem bateria, você pode continuar de onde parou.

### Visualização do estado Redux ([Redux DevTools extension](https://github.com/zalmoxisus/redux-devtools-extension))
![Visualização do estado Redux](https://img.alicdn.com/tps/TB1hGQqNXXXXXX3XFXXXXXXXXXX-640-381.gif)

O Redux gerencia todos os estados armazenados, garantindo a persistência mencionada acima.

----
A estrutura do jogo usa React + Redux, com Immutable para gerenciar o estado do Redux. (Para mais informações sobre React e Redux, veja: [Introdução ao React](http://www.ruanyifeng.com/blog/2015/03/react.html), [Documentação do Redux em Chinês](https://camsong.github.io/redux-in-chinese/index.html))

## 1. O que é Immutable?
Immutable é um tipo de dado que, uma vez criado, não pode ser alterado. Qualquer modificação, adição ou remoção de um objeto Immutable retorna um novo objeto Immutable.

### Introdução:
Vamos ver o seguinte código:
``` JavaScript
function keyLog(touchFn) {
  let data = { key: 'value' };
  f(data);
  console.log(data.key); // O que será impresso?
}
```
Sem ver a função f, não sabemos o que ela faz com `data`, então não podemos ter certeza do valor impresso. Mas se `data` for Immutable, podemos ter certeza de que imprimirá `value`:
``` JavaScript
function keyLog(touchFn) {
  let data = Immutable.Map({ key: 'value' });
  f(data);
  console.log(data.get('key'));  // value
}
```

Em JavaScript, `Object` e `Array` usam atribuição por referência. Um novo objeto referencia o objeto original, de modo que alterar o novo objeto também altera o antigo:
``` JavaScript
foo = {a: 1};  bar = foo;  bar.a = 2;
foo.a // 2
```
Embora isso economize memória, pode causar estados incontroláveis em aplicativos complexos, transformando a economia de memória em um problema.

Com Immutable, é diferente:
``` JavaScript
foo = Immutable.Map({ a: 1 });  bar = foo.set('a', 2);
foo.get('a') // 1
```

### Simplificação:
No `Redux`, a melhor prática é que cada `reducer` retorne um novo objeto (array). Muitas vezes vemos código assim:
``` JavaScript
// reducer
...
return [
   ...oldArr.slice(0, 3),
   newValue,
   ...oldArr.slice(4)
];
```
Para retornar um novo objeto (array), temos que escrever código estranho como o acima. Com estruturas de dados mais profundas, isso se torna ainda mais complicado. Com Immutable, fica assim:
``` JavaScript
// reducer
...
return oldArr.set(4, newValue);
```
Muito mais simples, não?

### Sobre “===”:
Sabemos que a comparação `===` para `Object` e `Array` é baseada na referência de endereço, não no valor:
``` JavaScript
{a:1, b:2, c:3} === {a:1, b:2, c:3}; // false
[1, 2, [3, 4]] === [1, 2, [3, 4]]; // false
```
Para comparar esses valores, precisaríamos de `deepCopy` ou `deepCompare`, que são trabalhosos e consomem muita performance.

Com Immutable, a comparação fica assim:
``` JavaScript
map1 = Immutable.Map({a:1, b:2, c:3});
map2 = Immutable.Map({a:1, b:2, c:3});
Immutable.is(map1, map2); // true

// List1 = Immutable.List([1, 2, Immutable.List[3, 4]]);
List1 = Immutable.fromJS([1, 2, [3, 4]]);
List2 = Immutable.fromJS([1, 2, [3, 4]]);
Immutable.is(List1, List2); // true
```
Muito mais eficiente!

Quando otimizamos a performance do React, uma técnica importante é `shouldComponentUpdate()`, que por padrão retorna `true`, sempre executando o método `render()`. Para calcular `shouldComponentUpdate` corretamente com objetos nativos, precisaríamos de `deepCopy` e `deepCompare`, o que consome muita performance. Com Immutable, a comparação de estruturas profundas é simples.

No Tetris, imagine que o tabuleiro é uma `matriz 2D`, e a peça móvel é uma `forma (também uma matriz 2D)` + `coordenadas`. A combinação do tabuleiro e da peça forma o resultado final `Matrix`. Essas propriedades são construídas com Immutable, facilitando a escrita de `shouldComponentUpdate`. Código-fonte: [/src/components/matrix/index.js#L35](https://github.com/chvin/react-tetris/blob/master/src/components/matrix/index.js#L35)

Recursos para aprender Immutable:
* [Immutable.js](http://facebook.github.io/immutable-js/)
* [Guia detalhado e práticas no React com Immutable](https://github.com/camsong/blog/issues/3)

----
## 2. Como usar Immutable no Redux
Objetivo: Tornar o `state` Immutable.
Biblioteca-chave: [gajus/redux-immutable](https://github.com/gajus/redux-immutable)
Troque `combineReducers` do Redux pela biblioteca acima:
``` JavaScript
// rootReducers.js
// import { combineReducers } from 'redux'; // Método antigo
import { combineReducers } from 'redux-immutable'; // Novo método

import prop1 from './prop1';
import prop2 from './prop2';
import prop3 from './prop3';

const rootReducer = combineReducers({
  prop1, prop2, prop3,
});


// store.js
// Criação da store é igual ao método convencional
import { createStore } from 'redux';
import rootReducer from './reducers';

const store = createStore(rootReducer);
export default store;
```
O novo `combineReducers` transforma o objeto store em Immutable. No container, o uso também será ligeiramente diferente (mas é exatamente o que queremos):

``` JavaScript
const mapStateToProps = (state) => ({
  prop1: state.get('prop1'),
  prop2: state.get('prop2'),
  prop3: state.get('prop3'),
  next: state.get('next'),
});
export default connect(mapStateToProps)(App);
```

----
## 3. Web Audio API
O jogo possui muitos efeitos sonoros diferentes, mas na verdade só utiliza um arquivo de som: [/build/music.mp3](https://github.com/chvin/react-tetris/blob/master/build/music.mp3). Com a `Web Audio API`, é possível reproduzir efeitos sonoros de alta frequência e precisão em milissegundos, algo que a tag `<audio>` não consegue fazer. Durante o jogo, ao segurar as teclas de direção, você pode ouvir efeitos sonoros de alta frequência.

![Avançado áudio na web](https://img.alicdn.com/tps/TB1fYgzNXXXXXXnXpXXXXXXXXXX-633-358.png)

`WAA` é uma nova e independente interface que oferece maior controle sobre arquivos de áudio e efeitos de som profissionais. Ela é recomendada pelo W3C e permite manipulações profissionais de "velocidade do som, volume, visualização do ambiente, timbre, alta frequência e direção do som". Abaixo está o fluxo de uso do WAA.

![Fluxo](https://img.alicdn.com/tps/TB1nBf1NXXXXXagapXXXXXXXXXX-520-371.png)

No diagrama, Source representa uma fonte de áudio e Destination representa a saída final. Múltiplas fontes se combinam para formar a Destination. Código-fonte: [/src/unit/music.js](https://github.com/chvin/react-tetris/blob/master/src/unit/music.js), que implementa o carregamento AJAX de mp

3 e a conversão para WAA, controlando a reprodução.

A compatibilidade do WAA com as versões mais recentes dos navegadores ([CanIUse](http://caniuse.com/#search=webaudio)):

![Compatibilidade do navegador](https://img.alicdn.com/tps/TB15z4VOVXXXXahaXXXXXXXXXXX-679-133.png)

Podemos ver que IE e a maioria dos dispositivos Android não são compatíveis, mas os outros navegadores sim.

Recursos para aprender Web Audio API:
* [Web Audio API | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API)
* [Introdução à Web Audio API](http://www.html5rocks.com/en/tutorials/webaudio/intro/)

----
## 4. Otimização da experiência de jogo
* Técnica:
	* A frequência de disparo para movimento horizontal e vertical ao pressionar as teclas de direção é diferente. O jogo define a frequência de disparo, substituindo a frequência de eventos nativos. Código-fonte: [/src/unit/event.js](https://github.com/chvin/react-tetris/blob/master/src/unit/event.js);
	* Movimentos laterais podem atrasar a velocidade de queda, mas quando se move ao bater na parede, o atraso é menor. Na velocidade nível 6, o atraso garante que você possa mover horizontalmente por uma linha completa;
	* Eventos `touchstart` e `mousedown` são registrados para botões, permitindo um jogo responsivo. Quando `touchstart` ocorre, `mousedown` não é disparado, e quando `mousedown` ocorre, `mouseout` é usado para simular `mouseup`. Código-fonte: [/src/components/keyboard/index.js](https://github.com/chvin/react-tetris/blob/master/src/components/keyboard/index.js);
	* O evento `visibilitychange` é monitorado, pausando o jogo quando a página é oculta/trocada, e retomando quando volta ao foco. Esse estado de foco também é armazenado no Redux. Então, se receber uma ligação no celular, o progresso do jogo é salvo; no PC, o jogo pausará quando sair da página e não tocará o som de game over. Isso é semelhante ao comportamento dos aplicativos iOS;
	* A qualquer momento, atualizar a página (por exemplo, ao limpar linhas ou quando o jogo termina) restaura o estado atual;
	* A única imagem usada no jogo é ![image](https://img.alicdn.com/tps/TB1qq7kNXXXXXacXFXXXXXXXXXX-400-186.png), o restante é feito com CSS;
	* O jogo é compatível com Chrome, Firefox, IE9+, Edge e outros;
* Jogabilidade:
	* Você pode definir o tabuleiro inicial (dez níveis) e a velocidade (seis níveis) antes de começar o jogo;
	* Eliminar 1 linha dá 100 pontos, 2 linhas dão 300 pontos, 3 linhas dão 700 pontos, e 4 linhas dão 1500 pontos;
	* A velocidade de queda aumenta com o número de linhas eliminadas (aumenta um nível a cada 20 linhas);

----
## 5. Lições aprendidas durante o desenvolvimento
* Escrever `shouldComponentUpdate` para todos os `components` melhorou significativamente o desempenho no celular. Aplicações de médio a grande porte podem se beneficiar muito ao escrever `shouldComponentUpdate`.
* Componentes sem estado ([Stateless Functional Components](https://medium.com/@joshblack/stateless-components-in-react-0-14-f9798f8b992d#.xjqnbfx4e)) não possuem ciclo de vida. Devido ao ponto acima, todos os componentes precisam do ciclo de vida `shouldComponentUpdate`, então componentes sem estado não foram usados.
* No `webpack.config.js`, definir o atributo devServer como `host: '0.0.0.0'` permite acessar o desenvolvimento pelo IP, não apenas localhost;
* No Redux, a `store` não precisa ser passada apenas via connect para o `container`. Pode-se obter a store em outros arquivos para controle de fluxo (dispatch). Código-fonte: [/src/control/states.js](https://github.com/chvin/react-tetris/blob/master/src/control/states.js);
* Com react+redux, a persistência é muito conveniente. Basta armazenar o estado Redux e, ao inicializar cada reducer, ler o estado armazenado.
* Integrar ESLint no projeto através da configuração `.eslintrc.js` e `webpack.config.js` ajuda a manter o código conforme as normas, controlando a qualidade do código. Erros fora das normas podem ser detectados durante o desenvolvimento (ou build) pelo IDE e console. Referência: [Guia de estilo do React da Airbnb](https://github.com/dwqs/react-style-guide);

----
## 6. Conclusão
* Como um aplicativo de prática com React, a implementação do Tetris revelou muitos detalhes que podem ser otimizados e aprimorados. Isso testa a atenção e habilidade de um desenvolvedor front-end.
* A otimização envolve tanto o próprio React, como decidir quais estados ficam no Redux e quais no state do componente, quanto características específicas do produto. Para alcançar suas necessidades, essas otimizações impulsionam o desenvolvimento da tecnologia.
* Um projeto começa do zero, com funcionalidades acumulando pouco a pouco, até se tornar algo grandioso. Não tenha medo das dificuldades, se tem uma ideia, comece a codificar. ^_^

----
## 7. Fluxo de controle
![Fluxo de controle](https://img.alicdn.com/tfs/TB1B6ODRXXXXXXHaFXXXXXXXXXX-1920-1080.png)

----
## 8. Desenvolvimento
### Instalação
```
npm install
```
### Execução
```
npm start
```
O navegador abrirá automaticamente [http://127.0.0.1:8080/](http://127.0.0.1:8080/)
### Multilíngue
Configurar o ambiente multilíngue em [i18n.json](https://github.com/chvin/react-tetris/blob/master/i18n.json), usando o parâmetro "lan" para definir o idioma, por exemplo: `https://chvin.github.io/react-tetris/?lan=en`
### Build
```
npm run build
```
O resultado será gerado na pasta build.