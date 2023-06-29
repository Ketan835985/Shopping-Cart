const mongoose = require('mongoose');





const ObjectIdCheck = (Id)=>{
    return mongoose.Types.ObjectId.isValid(Id);
}


module.exports = {
    ObjectIdCheck,
}