/* =========================================================================
   TECLA.EXE — NÍVEIS (40 fases, em 4 mundos de dificuldade progressiva)
   Todo o texto abaixo é original, escrito para este jogo.
   ========================================================================= */

const WORLDS = [
  { id: 1, name: "Mundo 1 — Fundamentos", icon: "⌨️", levelIds: [1,2,3,4,5,6,7,8,9,10] },
  { id: 2, name: "Mundo 2 — Ritmo & Pontuação", icon: "⚡", levelIds: [11,12,13,14,15,16,17,18,19,20] },
  { id: 3, name: "Mundo 3 — Fluência", icon: "📝", levelIds: [21,22,23,24,25,26,27,28,29,30] },
  { id: 4, name: "Mundo 4 — Modo Elite", icon: "🔥", levelIds: [31,32,33,34,35,36,37,38,39,40] }
];

const LEVELS = [
  // ---------- MUNDO 1: FUNDAMENTOS ----------
  { id: 1, name: "Aquecimento", text: "asdf jklç asdf jklç fada sala dado calo jarra Alaska falado gafe kkk lalala ajkl fjsl aksl fajk sadf lçfk asdf jklç" },
  { id: 2, name: "Palavras Curtas", text: "jogo meme reels stories live post chat dm zap live likes seguir salvar amigo grupo festa role trend viral musica dance" },
  { id: 3, name: "Vocabulário Gamer", text: "controle vitoria derrota respawn upgrade personagem inventario missao ranking campeonato equipe estrategia habilidade combo loot" },
  { id: 4, name: "Letras Vizinhas", text: "qwer tyui asdf ghjk zxcv bnm poiu lkjh mnbv rewq uytr fdsa kjhg vcxz que ruas fresta gato pato lata rata mata bata" },
  { id: 5, name: "Frases Simples", text: "Hoje eu vou treinar minha velocidade. Quero ficar mais rapido no teclado. Praticar todos os dias faz a diferenca. Isso vai valer a pena." },
  { id: 6, name: "Maiúsculas", text: "Minha Cidade Fica Perto Da Praia. Eu Adoro Sabado De Manha. Meu Jogo Favorito Comecou Ontem. Vamos Jogar Juntos Essa Semana Inteira." },
  { id: 7, name: "Acentos e Til", text: "coração emoção função estação atenção nação paixão amanhã manhã irmã maçã não ímã órgão pão até café sofá avó órfão." },
  { id: 8, name: "Tech & Internet", text: "notificacao aplicativo atualizacao senha usuario conexao servidor download upload streaming playlist configuracoes desempenho conquista" },
  { id: 9, name: "Combinado com Números", text: "Comprei 3 skins, ganhei 15 moedas e subi para o nivel 27. Faltam 8 fases para o final e ja marquei 942 pontos nessa temporada." },
  { id: 10, name: "Fase Final: Primeiro Chefe", text: "Voce venceu o Mundo 1! A base esta pronta: dedos nos lugares certos, olhos na tela, ritmo constante. Agora o desafio fica mais interessante!" },

  // ---------- MUNDO 2: RITMO & PONTUAÇÃO ----------
  { id: 11, name: "Vírgulas e Pausas", text: "Depois da escola, eu jogo um pouco, estudo, e ainda sobra tempo para treinar digitacao, praticar musica, e conversar com os amigos no grupo." },
  { id: 12, name: "Pontuação Pesada", text: "Voce ja treinou hoje? Nao esqueca: pratica todo dia, foco na precisao, e velocidade vem depois! Bora la, sem desculpas... vamos nessa!" },
  { id: 13, name: "Parênteses e Travessão", text: "O evento (que comeca as 20h) vai ter premiacao especial — e voce, vai participar? Marque na agenda: sabado, sem falta, com o time todo." },
  { id: 14, name: "Dois-pontos e Listas", text: "Para vencer essa fase, lembre-se: mantenha a postura, respire fundo, olhe para frente e confie no treino. O resultado vem com constancia." },
  { id: 15, name: "Diálogo Rápido", text: "\"Voce viu meu novo recorde?\" — perguntou ela. \"Vi sim, ficou incrivel!\" — respondi. \"Da proxima vez eu supero o seu\", ela sorriu, confiante." },
  { id: 16, name: "Números em Jogo", text: "Em 2024 eu comecei no nivel 1, hoje estou no nivel 10. Ja fiz 350 partidas, ganhei 128 vezes e perdi 87. Minha meta e chegar a 500 vitorias." },
  { id: 17, name: "Símbolos do Dia a Dia", text: "Meu e-mail e usuario@email.com, o preco ficou R$ 45,90 e o desconto foi de 20%. Confirma o pedido #4821 antes das 18h, por favor." },
  { id: 18, name: "Exclamações", text: "Que fase incrivel! Voce zerou sem nenhum erro! Continue assim e logo vai bater todos os recordes do ranking! Parabens pela dedicacao total!" },
  { id: 19, name: "Interrogações", text: "Voce prefere jogar de manha ou a noite? Qual estilo combina mais com voce? Ja escolheu seus acessorios favoritos para o personagem hoje?" },
  { id: 20, name: "Fase Final: Segundo Chefe", text: "Mundo 2 concluido! Virgula, ponto, interrogacao, exclamacao — voce domina a pontuacao inteira. Hora de partir para textos mais longos e completos!" },

  // ---------- MUNDO 3: FLUÊNCIA ----------
  { id: 21, name: "Parágrafo: Moda", text: "A moda muda toda semana nas redes sociais, e cada estilo conta uma historia diferente. Do sportlife ao streetwear, do y2k ao coquette, cada visual mostra um pouco da personalidade de quem usa. O importante e se sentir confiante com a propria identidade." },
  { id: 22, name: "Parágrafo: Amizade", text: "Ter amigos que jogam junto com voce faz tudo mais divertido. Depois de uma fase dificil, e otimo comemorar as vitorias e rir das derrotas. No fim das contas, o que fica mesmo sao as boas lembrancas construidas em equipe." },
  { id: 23, name: "Parágrafo: Rotina", text: "Acordar cedo, estudar um pouco, treinar digitacao por quinze minutos e ainda sobrar tempo para jogar — essa e a rotina perfeita para quem quer evoluir rapido sem abrir mao da diversao no meio do caminho." },
  { id: 24, name: "Parágrafo: Superação", text: "Ninguem comeca digitando rapido. No inicio os erros aparecem o tempo todo, os dedos se atrapalham e a paciencia e testada. Mas cada fase repetida deixa o caminho mais facil, ate que um dia a velocidade aparece sem esforco." },
  { id: 25, name: "Diálogo Estendido", text: "\"Bora treinar mais uma fase?\" — chamou o amigo. \"Só se for a ultima do mundo!\" — respondeu ela, rindo. \"Combinado. E depois a gente confere o ranking juntos\", ele completou, já digitando rapido." },
  { id: 26, name: "Parágrafo: Tecnologia", text: "Todo teclado tem seu proprio ritmo, e encontrar esse ritmo e parte do desafio. Praticar com constancia treina nao so os dedos, mas tambem a concentracao — uma habilidade que serve para muito alem dos jogos, inclusive nos estudos e no trabalho." },
  { id: 27, name: "Frases Compostas", text: "Enquanto uns preferem velocidade, outros focam em precisao; no fim, os dois caminhos levam ao mesmo lugar: dominar o teclado por completo, sem depender de olhar para as teclas o tempo todo." },
  { id: 28, name: "Parágrafo: Estratégia", text: "Vencer o jogo nao e so sobre ser rapido — e sobre errar pouco, manter o foco e nao desanimar quando a fase parece dificil demais. Quem entende isso chega mais longe do que quem so pensa em bater recordes." },
  { id: 29, name: "Texto Misto", text: "Placar: 87% de precisao, 42 PPM, 3 estrelas! Nada mal para quem comecou hoje. \"Continue assim\", diz a mensagem na tela, \"e logo voce chega ao topo do ranking geral do servidor.\"" },
  { id: 30, name: "Fase Final: Terceiro Chefe", text: "Voce concluiu o Mundo 3! Textos longos, dialogos, numeros e simbolos ja nao sao mais desafio. Falta pouco: o Mundo 4 separa quem pratica de quem realmente domina o teclado." },

  // ---------- MUNDO 4: MODO ELITE ----------
  { id: 31, name: "Ritmo Constante", text: "digitar rapido nao adianta se a cada tres palavras aparece um erro; o segredo esta em manter um ritmo constante, sem pressa, ate que a velocidade cresca naturalmente com a pratica repetida todos os dias." },
  { id: 32, name: "Precisão Máxima", text: "Zero erros, esse e o objetivo desta fase: cada tecla precisa ser exatamente a certa, no tempo certo, sem hesitacao — prove que sua precisao e tao boa quanto sua velocidade de digitacao." },
  { id: 33, name: "Símbolos Avançados", text: "A funcao calcula (a + b) * c / 2, retorna o valor & registra em log[]; se o resultado > 100, envia alerta @sistema — confira o codigo #v2 antes do deploy." },
  { id: 34, name: "Texto Corrido Longo", text: "Existem jogadores que treinam todos os dias, mesmo quando nao tem vontade, porque sabem que a constancia e o que realmente separa quem evolui de quem fica estagnado; e existem aqueles que so treinam quando esta facil, e por isso demoram mais para chegar ao nivel que desejam alcancar." },
  { id: 35, name: "Diálogo sob Pressão", text: "\"Faltam dez segundos!\" — gritou o narrador. \"Ele consegue, olha essa velocidade!\" — respondeu o outro. \"Impossivel... ele vai bater o recorde do campeonato inteiro, ao vivo, na frente de todo mundo!\"" },
  { id: 36, name: "Números e Datas", text: "O campeonato de 2025 teve 1.284 participantes, 96 partidas por dia e um premio de R$ 12.500,00 para o primeiro colocado, decidido em uma final de 3 rounds, no dia 14/11, as 19h30." },
  { id: 37, name: "Parágrafo Técnico", text: "Um bom sistema de pontuacao considera velocidade e precisao ao mesmo tempo, porque digitar rapido sem acertar as teclas certas nao tem valor real; por isso, cada fase deste jogo recompensa quem equilibra as duas coisas com inteligencia." },
  { id: 38, name: "Maratona de Frases", text: "Confianca se constroi com pratica. Pratica se constroi com constancia. Constancia se constroi com disciplina. E disciplina, no fim, e so uma questao de decidir continuar mesmo nos dias em que voce nao tem vontade nenhuma." },
  { id: 39, name: "Penúltimo Desafio", text: "Esta fase mistura tudo: (numeros), \"dialogos\", pontuacao! forte, simbolos & acentos — coração, atenção, órgão — alem de frases longas que testam sua resistencia ate o ultimo caractere digitado corretamente." },
  { id: 40, name: "Fase Final: Boss Supremo", text: "Ultima fase! Sera que voce aguenta o ritmo? 40 niveis, 100% de foco, 0% de desistencia. A precisao vale mais que a pressa: erre pouco, digite com calma, e o recorde (e o 1o lugar do ranking) sera seu!" }
];

function defaultLevelsProgress() {
  const levels = {};
  LEVELS.forEach((lv, i) => {
    levels[lv.id] = { stars: 0, bestPpm: 0, bestAcc: 0, unlocked: i === 0 };
  });
  return levels;
}

function worldForLevel(levelId) {
  return WORLDS.find(w => w.levelIds.includes(levelId));
}
