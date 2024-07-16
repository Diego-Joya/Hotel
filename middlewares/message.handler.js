function messageHandler(error) {
    console.log(error);
    return {
        ok: false,
        message: `Error al realizar el proceso! ${error.message}`,
    }
}

module.exports = messageHandler;