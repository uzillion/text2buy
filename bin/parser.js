let parse = messageObject => {
    let request = messageObject.Body;
    let tokens = request.split(":");
    tokens.forEach((element, index) => {
        tokens[index] = tokens[index].trim();
    });
    let temp = tokens[1].split(",");
    dbRequestObject = {
        //query: <query>, city:<city>
        query: temp[0],
        city: tokens[2],
    }

	console.log(dbRequestObject);

    return dbRequestObject;

}

module.exports = parse;
