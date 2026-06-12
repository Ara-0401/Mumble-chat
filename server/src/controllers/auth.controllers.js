import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import config from "../config/config.js"
import sessionModel from "../models/session.model.js"

 export async function register(req,res){
    const{username,email,password}=req.body

    try{

    if(!username ||!email || !password){
        return res.status(409).json({
            message:"All fields are requried"
        })
    }

    const alreadyExisting=await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(alreadyExisting){
        return res.status(409).json({
            message:"user already exists"
        })
    }

    const hashedPassword=await bcrypt.hash(password,10)

  

    const user=await userModel.create({
        username,
        email,
        password:hashedPassword
        
    })

    const refreshToken=jwt.sign({
        id:user._id
    },config.JWT_SECRET,{
        expiresIn:"7d"
    })

    const refreshTokenHash= await bcrypt.hash(refreshToken,10);

    const session =await sessionModel.create({
        user:user._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"],
        revoked:false
    })

    const accessToken=jwt.sign({
        id:user._id,
       sessionId:session._id 
    },config.JWT_SECRET,{
        expiresIn:'15m'
    })

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    })

   return res.status(201).json({
        message:"user registered succesfully",
        user:{
            _id:user._id,
            username:user.username,
            email:user.email
        },
        accessToken
    })
}

catch(err){
return res.status(500).json({
    message:"Internal server error",
    error:err.message
})
}

} 

// export async function login(req, res) {
//     console.log("LOGIN CONTROLLER HIT")
//     res.json({ message: "controller working" })
// }

export async function login(req,res){
    const{username,email,password}=req.body

    try{

        if(!email || !password){
            return res.status(409).json({
                message:"fields are required"
            })
        }

        const user=await userModel.findOne({ email })

        if(!user){
            return res.status(404).json({
                message:"user not found"
            })
        }

        const isPasswordValid=await bcrypt.compare(password,user.password)

        if(!isPasswordValid){
            return res.status(401).json({
                message:"invalid password"
            })
        }

        const refreshToken=jwt.sign({
            id:user._id
        },config.JWT_SECRET,{
            expiresIn:"7d"
        })

        const refreshTokenHash=await bcrypt.hash(refreshToken,10)

        const session=await sessionModel.create({
            user:user._id,
            refreshTokenHash,
            ip:req.ip,
            userAgent:req.headers["user-agent"],
            revoked:false
        })

        const accessToken=jwt.sign({
            id:user._id,
            sessionId:session._id,

        },config.JWT_SECRET,{
            expiresIn:"15m"
        })

        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })

        return res.status(200).json({
            message:"login successful",
            user:{
                _id:user._id,
                username:user.username,
                email:user.email
            },
            accessToken
        })

    

    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            message:"Internal server issue"
        })
    }
}

export async function refreshToken(req,res){

    const refreshToken=req.cookies.refreshToken

    try{
        if(!refreshToken){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

        const decoded=jwt.verify(refreshToken,config.JWT_SECRET)

        // const refreshTokenHash=await bcrypt.compare(refreshToken,config.JWT_SECRET)

        // if(!refreshTokenHash){
        //     return res.status(401).json({
        //         message:"Unauthorized"
        //     })
        // }

        const session =await sessionModel.findOne({
            user:decoded.id,
            revoked:false
        })

        if(!session){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

         const isValid=await bcrypt.compare(refreshToken,session.refreshTokenHash)

         if(!isValid){
            return res.status(401).json({
                message:"Unauthorized"
            })
         }

        const accessToken=jwt.sign({
            id:decoded.id,
            sessionId:session._id
        },config.JWT_SECRET,{
            expiresIn:"15m"
        })

        const newRefreshToken=jwt.sign({
            id:decoded.id,
            sessionId:session._id
        },config.JWT_SECRET,{
            expiresIn:"7d"
        })

        const newRefreshTokenHash=await bcrypt.hash(newRefreshToken,10)

        session.refreshTokenHash=newRefreshTokenHash
        await session.save()

        res.cookie("refreshToken",newRefreshToken,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })

        res.status(200).json({
            message:"access token generated",
            accessToken
        })



    }
    catch(err){
        console.log(err)
        return res.status(401).json({
            message:"invalid or expired token"
        })

    }

}

export async function logout(req,res){
    const refreshToken=req.cookies.refreshToken

    try{

        if(!refreshToken){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

        const decoded=jwt.verify(refreshToken,config.JWT_SECRET)

        const session=await sessionModel.findOne(
            {
                user:decoded.id,
                revoked:false
            }
        )

        if(!session){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

        const isValid=await bcrypt.compare(refreshToken,session.refreshTokenHash)

        if(!isValid){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }
        session.revoked=true
        await session.save()


        res.clearCookie("refreshToken")

        res.status(200).json({
            message:"logged out successfully"
        })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            message:"internal server issue"
        })
    }
}

export async function searchUsers(req, res) {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                message: "Query parameter is required"
            });
        }

      
        const users = await userModel.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }).select("-password");

        return res.status(200).json({
            message: "Users fetched successfully",
            users
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error during search"
        });
    }
}

export async function updateUser(req, res) {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        if (!username || !email) {
            return res.status(400).json({ message: "Username and email are required" });
        }

        const existingUser = await userModel.findOne({
            $or: [{ username }, { email }],
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(409).json({ message: "Username or email is already taken" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}