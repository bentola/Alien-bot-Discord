const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const configs = require('./config.json');
const google = require('googleapis');

const youtube = new google.youtube_v3.Youtube({
    version: 'v3',
    auth: configs.GOOGLE_KEY
})

const client = new Discord.Client();

const prefixo = configs.PREFIX;

const servidores = {
    'server' : {
        connection: null,
        dispatcher: null,
        fila: [],
        estouTocando: false,
    }
}

client.on("ready",() => {
    console.log('estou online');
})

client.on("message", async (msg) => {

    //filtro

    if (!msg.guild) return;

    if (!msg.content.startsWith(prefixo)) return;

    if (!msg.member.voice.channel){
        msg.channel.send('Você precisa estar em um canal de voz! ')
    return;
    }

    //comandos

    //entrar no canal !entrar
    if(msg.content == prefixo + 'entrar'){
        try{
            servidores.server.connection = await msg.member.voice.channel.join();
        }catch(err){
            console.log('Erro ao entrar no canal de voz!')
            console.log(err)
        }
        
    }

    //sair do canal !sair
    if(msg.content == prefixo + 'sair'){
        msg.member.voice.channel.leave();
        servidores.server.connection = null;
        servidores.server.dispatcher = null;
    }

    //tocar musica especifica do link / entra na call tocando !play <link>
    if (msg.content.startsWith(prefixo + 'play')) {

        //entrar no canal de voz
        if (servidores.server.connection === null){
            try{
                servidores.server.connection = await msg.member.voice.channel.join();
            }catch(err){
                console.log('Erro ao entrar no canal de voz!')
                console.log(err)
            }
        }

        /*entrar na call forma simples
        servidores.server.connection = await msg.member.voice.channel.join();
        */

        let oQueTocar = msg.content.slice(6);

        if (oQueTocar.length === 0){
            msg.channel.send('Eu preciso de algo para tocar!');
            return;
        }

        if(ytdl.validateURL(oQueTocar)){
            servidores.server.fila.push(oQueTocar);
            console.log('adicionado: ' + oQueTocar);
        }
        else{
            youtube.search.list({
                q: oQueTocar,
                part: 'snippet',
                fields: 'items(id(videoId),snippet(title))',
                type: 'video'
            }, function (err, resultado){
                if (err) {
                    console.log(err);
                }
                if (resultado) {
                    const id = resultado.data.items[0].id.videoId;
                    oQueTocar = 'https://www.youtube.com/watch?v=' + id;
                    servidores.server.fila.push(oQueTocar);
                }
            });
        }   
        TocaMusicas();
    }

    //pausar e despausa a musica !pause
    if(msg.content == prefixo + 'pause'){
        servidores.server.dispatcher.pause();
        servidores.server.dispatcher.resume();
    } 

    //pausar a musica !despausar
    if(msg.content == prefixo + 'despausar'){
        servidores.server.dispatcher.resume();
    }

});

const TocaMusicas = () => {
   if(servidores.server.estouTocando === false) {
    const tocando =  servidores.server.fila[0];
    servidores.server.estouTocando = true;
    servidores.server.dispatcher = servidores.server.connection.play(ytdl(tocando, configs.YTDL));

    servidores.server.dispatcher.on('finish', () => {
        servidores.server.fila.shift();
        servidores.server.estouTocando = false;
        if (servidores.server.fila.length > 0) {
            TocaMusicas();
        }
        else{
            servidores.server.dispatcher = null;
        }
    });
   }

}

client.login(configs.TOKEN_DISCORD);
