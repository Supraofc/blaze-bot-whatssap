require('../lib/conf');
const axios = require('axios');

const sinaisAtivados = {};
let corEsperada = '';
let ultimoSinalEnviado = null;
let sinalPendente = null;
let ultimoPadrao = null;

const obterHorarioAtual = () => {
  const agora = new Date();
  const horas = agora.getHours().toString().padStart(2, '0');
  const minutos = agora.getMinutes().toString().padStart(2, '0');
  const segundos = agora.getSeconds().toString().padStart(2, '0');
  return `${horas}:${minutos}:${segundos}`;
};

module.exports = async (vermelinhaai, mensagem) => {
  const baileys = require('@whiskeysockets/baileys');
  const tipo = baileys.getContentType(mensagem.message);
  const corpo = (tipo === 'conversation') ? mensagem.message.conversation : (tipo == 'imageMessage') ? mensagem.message.imageMessage.caption : (tipo == 'videoMessage') ? mensagem.message.videoMessage.caption : (tipo == 'extendedTextMessage') ? mensagem.message.extendedTextMessage.text : (tipo == 'buttonsResponseMessage') ? mensagem.message.buttonsResponseMessage.selectedButtonId : (tipo == 'listResponseMessage') ? mensagem.message.listResponseMessage.singleSelectReply.selectedRowId : (tipo == 'templateButtonReplyMessage') ? mensagem.message.templateButtonReplyMessage.selectedId : (tipo === 'messageContextInfo') ? (mensagem.message.buttonsResponseMessage?.selectedButtonId || mensagem.message.listResponseMessage?.singleSelectReply.selectedRowId || mensagem.text) : '';  

  const ehGrupo = mensagem.key.remoteJid.endsWith('@g.us');
  const remetente = ehGrupo ? mensagem.key.participant : mensagem.key.remoteJid;
  const ehComando = corpo.startsWith(prefix); 
  const comando = ehComando ? corpo.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
  const numeroBot = vermelinhaai.user.id.split(':')[0] + '@s.whatsapp.net';
  const ehCriador = [numeroBot, ...numeroc].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(remetente);
  const de = mensagem.key.remoteJid;
  const resposta = (texto) => { vermelinhaai.sendMessage(de, { text: texto }, { quoted: mensagem }); };
  const enviarMensagem = async (texto) => {
    await vermelinhaai.sendMessage(mensagem.key.remoteJid, { text: texto });
  };

  const obterHistoricoRecente = async () => {
    const url = 'https://blaze.com/api/roulette_games/recent/history?page=1';

    try {
      const resposta = await axios.get(url);
      const dados = resposta.data.records;

      if (!dados || dados.length === 0) {
        console.error('Nenhum dado válido recebido da API.');
        return [];
      }

      return dados.map(entrada => ({
        id: entrada.id,
        criadoEm: entrada.created_at,
        cor: entrada.color,
        lancamento: entrada.roll,
        sementeServidor: entrada.server_seed,
      }));
    } catch (erro) {
      console.error('Erro ao obter histórico da API:', erro.message);
      return [];
    }
  };

  const construirEstrategia = async () => {
    try {
      const historico = await obterHistoricoRecente();
      const ultimasCores = historico.slice(0, 3).map(entrada => entrada.cor);
      const padrao = ultimasCores.join('');

      if (padrao === 'VVV' || padrao === 'PPP') {
        const cor = padrao === 'VVV' ? 'Vermelho' : 'Preto';
        enviarSinal(cor, padrao); 
        validarJogo(cor, padrao); 
      } else if (padrao === '222' && !sinalPendente && ultimoPadrao !== '222') {
        corEsperada = 'Preto'; 
        sinalPendente = { cor: 'Preto', padrao }; 
        ultimoPadrao = '222'; 
      } else if (padrao === '111' && !sinalPendente && ultimoPadrao !== '111') {
        corEsperada = 'Vermelho'; 
        sinalPendente = { cor: 'Vermelho', padrao };
        ultimoPadrao = '111'; 
      } else if (padrao !== '222' && padrao !== '111' && sinalPendente) {
        const proximaCor = padrao === 'Preto' ? 'Preto' : 'Vermelho';
        enviarSinal(sinalPendente.cor, sinalPendente.padrao); 
        validarJogo(proximaCor, sinalPendente.padrao); 
        sinalPendente = null; 
      }

      console.log('Estratégia definida com base no histórico:', corEsperada, 'com padrão:', padrao);
    } catch (erro) {
      console.error('Erro ao construir a estratégia:', erro.message);
    }
  };

  const validarJogo = (cor, padrao) => {
    if (cor === corEsperada || cor === 'B') {
      enviarSinal(cor, padrao);
    } else {
      enviarSinal(cor, padrao);
    }
  };

const exibirMenu = () => {
  const linkConviteBlaze = 'blaze-4.com/r/6gkyRl';
    const menu = `
📊 *COMANDOS DISPONÍVEIS*
- *${prefix}sinais*: Ativa/desativa os sinais para o grupo.
- *${prefix}menu*: Exibe este menu.
- *${prefix}blaze*: [Convite para a Blaze](${linkConviteBlaze})
👤 *SOBRE O CRIADOR*

Meu nome é Newton, conhecido como Supra.
Tenho 21 anos e trabalho com programação há 5 anos.
Possuo conhecimento em várias linguagens, como Python, JavaScript, C, C++, PHP, etc.
`;
    resposta(menu);
};

  if (comando === 'sinais') {
    if (ehCriador) {
      sinaisAtivados[mensagem.key.remoteJid] = !sinaisAtivados[mensagem.key.remoteJid];
      const status = sinaisAtivados[mensagem.key.remoteJid] ? 'ativados' : 'desativados';
      resposta(`Os sinais foram ${status} para este grupo.`);
    } else {
      resposta('Apenas administradores do grupo podem ativar ou desativar os sinais.');
    }
  }
  if (comando === 'menu') {
    exibirMenu();
}


const enviarSinal = (cor, padrao) => {
  const horarioFormatado = obterHorarioAtual();
  let nomeSinal = '';

  if (cor === 'Vermelho') {
    nomeSinal = padrao === '111' ? '🔥🔴✨ *CONFIRMADO* ✨🔴🔥' : '🔴 *CONFIRMADO* 🔴';
  } else {
    nomeSinal = padrao === '222' ? '⚫️🎉 *CONFIRMADO* 🎉⚫️' : '⚫️ *CONFIRMADO* ⚫️';
  }

  if (padrao && ultimoSinalEnviado !== padrao) {
    const mensagem = `
      ${nomeSinal}

      🟢 *Padrão:* ${padrao}
      🎯 *Entrada:* ${cor === 'Vermelho' ? '🔴 Vermelho' : '⚫️ Preto'}
      ⏰ *Hora:* ${horarioFormatado}

      Faça até 2 Gales para não quebrar a Banca 🚀
    `;
    enviarMensagem(mensagem);
    ultimoSinalEnviado = padrao;
  }
};

  const verificarSinais = async () => {
    if (!sinaisAtivados[mensagem.key.remoteJid] || !ehCriador) {
      return;
    }

    try {
      console.log('Construindo estratégia...');
      await construirEstrategia();
    } catch (erro) {
      console.error('Erro ao construir estratégia:', erro.message);
    }
  };

  setInterval(verificarSinais, 10000);
};
