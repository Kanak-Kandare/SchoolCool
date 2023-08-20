import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"student",
        enum:["teacher","admin","student"]
    }
})

// UserSchema.pre("save",function(next){
//     if(!this.isModified("password")){
//         next();
//     }
//     bcrypt.hash(this.password,10,(err,hash)=>{
//         this.password=hash;
//         next();
//     })
// })

const User = model("User",UserSchema);

export default User;