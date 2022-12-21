require("http").createServer((_, res) => res.end("Hello Owner.")).listen(0000)

const sessionName = 'OpenAi'
const donet = '-'
const owner = ['6285878313791']
const { default: ZakkConnect, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, getContentType } = require("@adiwajshing/baileys")
const { state, saveState } = useSingleFileAuthState('./session.json')
const pino = require('pino')
const CFonts = require('cfonts')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const figlet = require('figlet')
const _ = require('lodash')
const PhoneNumber = require('awesome-phonenumber')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

function hikone(conn, msg, store) {
    if (!msg) return msg
    let Chican = proto.WebMessageInfo
    if (msg.key) {
        msg.id = msg.key.id
        msg.isBaileys = msg.id.startsWith('BAE5') && msg.id.length === 16
        msg.chat = msg.key.remoteJid
        msg.fromMe = msg.key.fromMe
        msg.isGroup = msg.chat.endsWith('@g.us')
        msg.sender = conn.decodeJid(msg.fromMe && conn.user.id || msg.participant || msg.key.participant || msg.chat || '')
        if (msg.isGroup) msg.participant = conn.decodeJid(msg.key.participant) || ''
    }
    if (msg.message) {
        msg.mtype = getContentType(msg.message)
        msg.msg = (msg.mtype == 'viewOnceMessage' ? msg.message[msg.mtype].message[getContentType(msg.message[msg.mtype].message)] : msg.message[msg.mtype])
        msg.body = msg.message.conversation || msg.msg.caption || msg.msg.text || (msg.mtype == 'listResponseMessage') && msg.msg.singleSelectReply.selectedRowId || (msg.mtype == 'buttonsResponseMessage') && msg.msg.selectedButtonId || (msg.mtype == 'viewOnceMessage') && msg.msg.caption || msg.text
        let quoted = msg.quoted = msg.msg.contextInfo ? msg.msg.contextInfo.quotedMessage : null
        msg.mentionedJid = msg.msg.contextInfo ? msg.msg.contextInfo.mentionedJid : []
        if (msg.quoted) {
            let type = getContentType(quoted)
			msg.quoted = msg.quoted[type]
            if (['productMessage'].includes(type)) {
				type = getContentType(msg.quoted)
				msg.quoted = msg.quoted[type]
			}
            if (typeof msg.quoted === 'string') msg.quoted = {
				text: msg.quoted
			}
            msg.quoted.mtype = type
            msg.quoted.id = msg.msg.contextInfo.stanzaId
			msg.quoted.chat = msg.msg.contextInfo.remoteJid || msg.chat
            msg.quoted.isBaileys = msg.quoted.id ? msg.quoted.id.startsWith('BAE5') && msg.quoted.id.length === 16 : false
			msg.quoted.sender = conn.decodeJid(msg.msg.contextInfo.participant)
			msg.quoted.fromMe = msg.quoted.sender === conn.decodeJid(conn.user.id)
            msg.quoted.text = msg.quoted.text || msg.quoted.caption || msg.quoted.conversation || msg.quoted.contentText || msg.quoted.selectedDisplayText || msg.quoted.title || ''
			msg.quoted.mentionedJid = msg.msg.contextInfo ? msg.msg.contextInfo.mentionedJid : []
            msg.getQuotedObj = msg.getQuotedMessage = async () => {
			if (!msg.quoted.id) return false
			let q = await store.loadMessage(msg.chat, msg.quoted.id, conn)
 			return exports.hikone(conn, q, store)
            }
            let vM = msg.quoted.fakeObj = Chican.fromObject({
                key: {
                    remoteJid: msg.quoted.chat,
                    fromMe: msg.quoted.fromMe,
                    id: msg.quoted.id
                },
                message: quoted,
                ...(msg.isGroup ? { participant: msg.quoted.sender } : {})
            })
        }
    }
  msg.text = msg.msg.text || msg.msg.caption || msg.message.conversation || msg.msg.contentText || msg.msg.selectedDisplayText || msg.msg.title || ''
    /**
	* Reply to this message
	* @param {String|Object} text 
	* @param {String|false} chatId 
	* @param {Object} options 
	*/
    msg.reply = (text, chatId = msg.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', msg, { ...options }) : conn.sendText(chatId, text, msg, { ...options })
    /**
	* Copy this message
	*/
	msg.copy = () => exports.hikone(conn, Chican.fromObject(Chican.toObject(m)))

	/**
	 * 
	 * @param {*} jid 
	 * @param {*} forceForward 
	 * @param {*} options 
	 * @returns 
	 */
	msg.copyNForward = (jid = msg.chat, forceForward = false, options = {}) => conn.copyNForward(jid, msg, forceForward, options)

    return msg
}

async function startZakk() {
    const { version, isLatest } = await fetchLatestBaileysVersion()
	console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)
    CFonts.say('KIZAKIXD', {
    font: 'block',
    align: 'center',
    colors: ['blueBright']
}), CFonts.say('https://youtube.com/@kizakixd', {
    colors: ['cyan'],
    font: 'console',
    align: 'center'
})

    const sock = ZakkConnect({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['Zakk','Chrome','1.0.0'],
        auth: state
    })

    store.bind(sock.ev)

    sock.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
            mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return
            if (!sock.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
            msg = hikone(sock, mek, store)
            require("./setting/chitanda")(sock, msg, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })
	
    // Handle error
    const unhandledRejections = new Map()
    process.on('unhandledRejection', (reason, promise) => {
        unhandledRejections.set(promise, reason)
        console.log('Unhandled Rejection at:', promise, 'reason:', reason)
    })
    process.on('rejectionHandled', (promise) => {
        unhandledRejections.delete(promise)
    })
    process.on('Something went wrong', function(err) {
        console.log('Caught exception: ', err)
    })
    
    // Setting
    sock.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    
    sock.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = sock.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    sock.getName = (jid, withoutContact  = false) => {
        id = sock.decodeJid(jid)
        withoutContact = sock.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = sock.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === sock.decodeJid(sock.user.id) ?
        sock.user :
            (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    sock.setStatus = (status) => {
        sock.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        })
        return status
    }
	
    sock.public = true

    sock.serializeM = (m) => hikone(sock, msg, store)
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update	    
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); process.exit(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection Close."); startZakk(); } 
            else if (reason === DisconnectReason.connectionLost) { console.log("Reconnecting To Server."); startZakk(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Close Then Restart This Session."); process.exit(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Delete Session file yusril.json and Scan Again.`); process.exit(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restarting..."); startZakk(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Reconnecting..."); startZakk(); }
            else { console.log(`Unknown DisconnectReason: ${reason}|${connection}`); startZakk(); }
        } else if(connection === 'open') {
            console.log('Connect To Whatsapp Web')
            sock.sendMessage(owner+'@s.whatsapp.net', { text: `*Hi Owner I'm Active*` })
        }
    })

    sock.ev.on('creds.update', saveState)

    sock.sendText = (jid, text, quoted = '', options) => sock.sendMessage(jid, { text: text, ...options }, { quoted })

    sock.cMod = (jid, copy, text = '', sender = sock.user.id, options = {}) => {
        //let copy = message.toJSON()
		let mtype = Object.keys(copy.message)[0]
		let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
		let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
		else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
		copy.key.remoteJid = jid
		copy.key.fromMe = sender === sock.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }

    return sock
}

startZakk()