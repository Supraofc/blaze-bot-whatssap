require('./lib/conf')

 const { default: makevermelinha } = require('@whiskeysockets/baileys')
 const { useMultiFileAuthState,
    DisconnectReason } = require('@whiskeysockets/baileys')
 const vermelinhac = require('./message/vermelinha')
 const bunyan = require('bunyan');

const vermelinha = async () => {
 const { state, saveCreds } = await useMultiFileAuthState(`${sessionName}`)
 function conectver() {
    const vermelinhaai = makevermelinha({
        printQRInTerminal: true,
        auth: state,
        browser: ['Vermelinha-md', '2023'],
     logger: bunyan.createLogger({ name: 'vermelinha-bot', streams: [{ path: 'logfile.log' }] })
    })

    vermelinhaai.ev.on('creds.update', saveCreds)
    vermelinhaai.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            if(shouldReconnect) {
                conectver()
            }
        } else if(connection === 'open') {
            console.log('Vermelinha Conectada')
        }
    })    
    vermelinhaai.ev.on('messages.upsert', async (meds) => {
    	meds.messages.forEach(async (message) => {
			if (!message.message || message.key && message.key.remoteJid == 'status@broadcast') return
			await vermelinhac(vermelinhaai, message);
})    
})
   
}
conectver()
}
vermelinha()

