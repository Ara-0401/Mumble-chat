import jwt from "jsonwebtoken"
import config from "../config/config.js"

// export async function auth(req,res,next){

//     const authHeader=req.headers["authorization"]

//     const token= authHeader && authHeader.split(" ")[1]

//     try{

//         if(!token){
//             return res.status(401).json({
//                 message:"Unauthorized"
//             })
//         }

//         const decoded=jwt.verify(token,config.JWT_SECRET)

//         req.user=decoded

//         next();
//     }
//     catch(err){
//         console.log(err)
//         return res.status(401).json({
//             message:"expired or invalid token"
//         })

//     }
// }
export async function auth(req,res,next){

    const authHeader = req.headers["authorization"];


    const token = authHeader && authHeader.split(" ")[1];


    try {

        if(!token){
            return res.status(401).json({
                message:"Unauthorized"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);


        req.user = decoded;

        next();

    } catch(err){


        return res.status(401).json({
            message:"expired or invalid token"
        });
    }
}