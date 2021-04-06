const welcome = (number, groupname) => {
    return `Opa @${number}. Seja Bem vindo(a) a ${groupname}, Sou o bot da ${groupname}. Digitw .menu para acesar mais comandos`
}
exports.welcome = welcome

const bye = (number) => {
    return `Vai tarde @${number}. Que não volte mais 👋`
}
exports.bye = bye