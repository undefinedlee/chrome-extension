module.exports = {
    get Background(){
        return require("./background").default;
    },
    get Page(){
        return require("./page").default;
    }
};