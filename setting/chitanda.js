const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@adiwajshing/baileys')
const fs = require('fs')
const util = require('util')
const chalk = require('chalk')
const { Configuration, OpenAIApi } = require("openai")
let setting = require('./config.json')

module.exports = Zakk = async (sock, msg, chatUpdate, store) => {
    try {
        var body = (msg.mtype === 'conversation') ? msg.message.conversation : (msg.mtype == 'imageMessage') ? msg.message.imageMessage.caption : (msg.mtype == 'videoMessage') ? msg.message.videoMessage.caption : (msg.mtype == 'extendedTextMessage') ? msg.message.extendedTextMessage.text : (msg.mtype == 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : (msg.mtype == 'listResponseMessage') ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : (msg.mtype == 'templateButtonReplyMessage') ? msg.message.templateButtonReplyMessage.selectedId : (msg.mtype === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId || msg.text) : ''
        var budy = (typeof msg.text == 'string' ? msg.text : '')
        // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
        var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
        const isCmd2 = body.startsWith(prefix)
        const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const pushname = msg.pushName || "No Name"
        const botNumber = await sock.decodeJid(sock.user.id)
        const itsMe = msg.sender == botNumber ? true : false
        let text = q = args.join(" ")
        const arg = budy.trim().substring(budy.indexOf(' ') + 1 )
        const arg1 = arg.trim().substring(arg.indexOf(' ') + 1 )

        const from = msg.chat
        const reply = msg.reply
        const sender = msg.sender
        const mek = chatUpdate.messages[0]

        const color = (text, color) => {
            return !color ? chalk.green(text) : chalk.keyword(color)(text)
        }
	
        // Group
        const groupMetadata = msg.isGroup ? await sock.groupMetadata(msg.chat).catch(e => {}) : ''
        const groupName = msg.isGroup ? groupMetadata.subject : ''

        // Push Message To Console
        let argsLog = (budy.length > 30) ? `${q.substring(0, 30)}...` : budy

        if (setting.autoAI) {
            // Push Message To Console && Auto Read
            if (argsLog && !msg.isGroup) {
            sock.readMessages([msg.key])
            console.log(chalk.black(chalk.bgGreen('[ CMD ]')), color(argsLog, 'turquoise'), chalk.magenta(`[ ${msg.sender.replace('@s.whatsapp.net', '@s.whatsapp.net')} ]`))
            } else if (argsLog && msg.isGroup) {
            // sock.sendReadReceipt(msg.chat, msg.sender, [msg.key.id])
            console.log(chalk.black(chalk.bgGreen('[ CMD ]')), color(argsLog, 'turquoise'), (`[ ${msg.sender.replace('@s.whatsapp.net', '@s.whatsapp.net')} ]`), chalk.blueBright('| Goup :'), chalk.magenta(groupName))
            }
        } else if (!setting.autoAI) {
            if (isCmd2 && !msg.isGroup) {
                console.log(chalk.black(chalk.bgGreen('[ CMD ]')), color(argsLog, 'turquoise'), chalk.blue(`[ ${msg.sender.replace('@s.whatsapp.net', '@s.whatsapp.net')} ]`))
                } else if (isCmd2 && msg.isGroup) {
                console.log(chalk.black(chalk.bgGreen('[ CMD ]')), color(argsLog, 'turquoise'), chalk.magenta(`[ ${msg.sender.replace('@s.whatsapp.net', '')} ]`), chalk.blueBright('| Group :'), chalk.yellow(groupName))
                }
        }

    if (setting.autoAI) {
        if (budy) {
            try {
            if (setting.keyopenai === 'ISI_APIKEY_OPENAI_DISINI') return reply('Mohon Isi Api Di config.js')
            const configuration = new Configuration({
              apiKey: setting.keyopenai, 
            });
            const openai = new OpenAIApi(configuration);
            
            const response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt: budy,
              temperature: 0.3,
              max_tokens: 3000,
              top_p: 1.0,
              frequency_penalty: 0.0,
              presence_penalty: 0.0,
            });
            msg.reply(`${response.data.choices[0].text}\n\n`)
            } catch(err) {
                console.log(err)
                msg.reply('Eror 404.')
            }
        }
    }

    if (!setting.autoAI) {
        if (isCmd2) {
            switch(command) { 
                case 'ai':
                    try {
                        if (setting.keyopenai === 'ISI_APIKEY_OPENAI_DISINI') return reply('Mohon Isi Api Di config.js')
                        if (!text) return reply(`Chat dengan AI.\n\nContoh:\n${prefix}${command} Apa itu resesi`)
                        const configuration = new Configuration({
                            apiKey: setting.keyopenai,
                        });
                        const openai = new OpenAIApi(configuration);
                    
                        const response = await openai.createCompletion({
                            model: "text-davinci-003",
                            prompt: text,
                            temperature: 0.3,
                            max_tokens: 3000,
                            top_p: 1.0,
                            frequency_penalty: 0.0,
                            presence_penalty: 0.0,
                        });
                        msg.reply(`${response.data.choices[0].text}\n\n`)
                    } catch (err) {
                        console.log(err)
                        msg.reply('Terjadi Kesalahan')
                    }
                    break
                default:{
                
                    if (isCmd2 && budy.toLowerCase() != undefined) {
                        if (msg.chat.endsWith('broadcast')) return
                        if (msg.isBaileys) return
                        if (!(budy.toLowerCase())) return
                        if (argsLog || isCmd2 && !msg.isGroup) {
                            console.log(chalk.black(chalk.bgRed('[ ERROR ]')), color('Eror', 'turquoise'), color(argsLog, 'turquoise'), color('404', 'turquoise'))
                            } else if (argsLog || isCmd2 && msg.isGroup) {
                            console.log(chalk.black(chalk.bgRed('[ ERROR ]')), color('Eror', 'turquoise'), color(argsLog, 'turquoise'), color('404', 'turquoise'))
                            }
                    }
                }
            }
        }
    }
        
    } catch (err) {
        msg.reply(util.format(err))
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})
